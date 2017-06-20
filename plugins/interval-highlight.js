(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['taucharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('taucharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

var d3 = tauCharts.api.d3;
var utils = tauCharts.api.utils;
var pluginsSDK = tauCharts.api.pluginsSDK;
var createUpdateFunc = tauCharts.api.d3_animationInterceptor;

var defaultRangeFormatter = function formatRange(dateRange) {

    var d0 = d3.time.format('%d')(dateRange[0]);
    var d1 = d3.time.format('%d')(dateRange[1]);

    var m0 = d3.time.format('%b')(dateRange[0]);
    var m1 = d3.time.format('%b')(dateRange[1]);

    var y0 = d3.time.format('%Y')(dateRange[0]);
    var y1 = d3.time.format('%Y')(dateRange[1]);

    var date0 = (d0 + (m0 === m1 ? '' : (' ' + m0)) + (y0 === y1 ? '' : (' ' + y0)));
    var date1 = (d1 + ' ' + m1 + ' ' + y1);
    return (date0 + '&ndash;' + date1);
};

function findRangeValue(xIndex, x) {
    var nextItem = xIndex.find(function (r) { return r.pos >= x; }) || xIndex[xIndex.length - 1];
    var prevIndex = nextItem.ind > 0 ? (nextItem.ind - 1) : nextItem.ind;
    var prevItem = xIndex[prevIndex];
    return [prevItem.val, nextItem.val];
}

function filterValuesStack(data, screenModel, x) {
    return data.filter(function (row) { return String(row[screenModel.model.scaleX.dim]) === String(x); });
}

function areRangesEqual(r1, r2) {
    return (
        Number(r1[0]) === Number(r2[0]) &&
        Number(r1[1]) === Number(r2[1])
    );
}

function drawRect(container, className, props) {

    var animationSpeed = props.hasOwnProperty('animationSpeed') ? props.animationSpeed : 0;

    var rect = container
        .selectAll('.' + className)
        .data([1]);
    rect.exit()
        .remove();
    rect.call(createUpdateFunc(animationSpeed, null, props));
    rect.enter()
        .append('rect')
        .attr('class', className)
        .call(createUpdateFunc(animationSpeed, {width: 0}, props));

    return rect;
}

var ELEMENT_HIGHLIGHT = 'ELEMENT.INTERVAL_HIGHLIGHT';

var IntervalHighlight = {

    addInteraction() {
        var node = this.node();
        this.cover = null;
        this.activeRange = [];
        node.on('range-blur', function () {
            this.activeRange = [];
            drawRect(this.cover, 'interval-highlight__cursor', {width: 0});
        }.bind(this));
    },

    prepareData(data, screenModel) {
        var groups = utils.groupBy(this.node().data(), screenModel.group);
        return Object
            .keys(groups)
            .sort(function(a, b) {
                return screenModel.order(a) - screenModel.order(b);
            })
            .reduce(function(memo, k, i) {
                return memo.concat([groups[k]]);
            }, [])
            .reduce(function(memo, fiber) {
                fiber.forEach(function(row) {
                    screenModel.y(row);
                    screenModel.y0(row);
                });
                return memo.concat(fiber);
            }, []);
    },

    createXIndex: function(data, screenModel) {
        return utils.unique(data.map(function(x) {
            return x[screenModel.model.scaleX.dim];
        }), String)
            .sort(function(x1, x2) {
                return x1 - x2;
            })
            .map(function(date, i) {
                return {
                    ind: i,
                    val: date,
                    pos: screenModel.model.scaleX.value(date)
                };
            });
    },

    draw() {

        var node = this.node();
        var screenModel = node.screenModel;
        var cfg = node.config;
        var container = cfg.options.slot(cfg.uid);

        var data = this.prepareData(node.data(), screenModel);
        var xIndex = this.createXIndex(data, screenModel);

        var drawCover = function (selection) {

            var element = this;

            drawRect(selection, 'interval-highlight__cursor', {
                class: 'interval-highlight__cursor',
                x: 0,
                y: 0,
                width: 0,
                height: cfg.options.height,
                animationSpeed: 0
            });

            var rect = drawRect(selection, 'interval-highlight__cover-rect', {
                class: 'interval-highlight__cover-rect',
                x: 0,
                y: 0,
                width: cfg.options.width,
                height: cfg.options.height,
                animationSpeed: 0
            });

            // Todo: Use chart pointer events.

            var getPointer = function () {
                var domEvent = d3.event;
                var mouseCoords = d3.mouse(domEvent.target);
                var e = {
                    x: mouseCoords[0],
                    y: mouseCoords[1],
                    pageX: domEvent.pageX,
                    pageY: domEvent.pageY
                };
                return e;
            };

            var getRange = function (pointer) {
                var range = findRangeValue(xIndex, pointer.x);
                return range;
            };

            var getStacks = function (range, pointer) {
                var [prevValue, nextValue] = range;
                var nextValues = filterValuesStack(data, screenModel, nextValue);
                var prevValues = filterValuesStack(data, screenModel, prevValue);

                var propY = screenModel.model.scaleY.dim;
                var propCategory = screenModel.model.scaleColor.dim;

                var prevStack = prevValues.reduce(
                    function (memo, item) {
                        memo[item[propCategory]] = item[propY];
                        return memo;
                    },
                    {date: prevValue});

                var nextStack = nextValues.reduce(
                    function (memo, item) {
                        memo[item[propCategory]] = item[propY];
                        return memo;
                    },
                    {date: nextValue});

                return {
                    data: nextStack,
                    prev: prevStack,
                    event: pointer
                };
            };

            var animationFrameId = null;
            var wrapIntoAnimationFrame = function (handler) {
                return function() {
                    var pointer = getPointer();
                    if (!animationFrameId) {
                        animationFrameId = requestAnimationFrame(function () {
                            handler.call(this, pointer);
                            animationFrameId = null;
                        }.bind(this));
                    }
                }.bind(this);
            }.bind(this);

            rect.on('mouseleave', function () {
                node.fire('range-blur');
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            });

            rect.on('mousemove', wrapIntoAnimationFrame(function(e) {

                var range = getRange(e);

                if (areRangesEqual(element.activeRange, range)) {

                    node.fire('range-active', {
                        data: range,
                        event: e
                    });

                    return;
                }

                element.activeRange = range;

                var prevX = screenModel.model.scaleX(range[0]);
                var nextX = screenModel.model.scaleX(range[1]);

                drawRect(selection, 'interval-highlight__cursor', {
                    x: prevX,
                    width: nextX - prevX,
                    animationSpeed: 0
                });

                node.fire('range-changed', getStacks(range, e));
            }));

            rect.on('click', function() {

                var e = getPointer();
                var range = getRange(e);

                node.fire('range-focus', getStacks(range, e));
            });
        }.bind(this);

        var cover = container
            .selectAll('.interval-highlight__cover')
            .data([1]);
        cover
            .exit()
            .remove();
        cover
            .call(drawCover);
        var enter = cover
            .enter()
            .append('g')
            .attr('class', 'interval-highlight__cover')
            .call(drawCover);

        this.cover = cover;
    }
};

tauCharts.api.unitsRegistry.reg(
    ELEMENT_HIGHLIGHT,
    IntervalHighlight,
    'ELEMENT.GENERIC.CARTESIAN');

var XML_INDENT = '  ';
var XML_ATTR_WRAP = 32;

var VOID_TAGS = [
    'img',
    'input',
    'br',
    'embed',
    'link',
    'meta',
    'area',
    'base',
    'basefont',
    'bgsound',
    'col',
    'command',
    'frame',
    'hr',
    'image',
    'isindex',
    'keygen',
    'menuitem',
    'nextid',
    'param',
    'source',
    'track',
    'wbr',

    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'rect'
].reduce((map, tag) => (map[tag] = true, map), {});

function html(tag) {
    var childrenArgIndex = 2;
    var attrs = arguments[1];
    if (typeof attrs !== 'object') {
        childrenArgIndex = 1;
        attrs = {};
    }
    var children = utils.flatten(Array.prototype.slice.call(arguments, childrenArgIndex));

    var isVoidTag = VOID_TAGS[tag];
    if (isVoidTag && children.length > 0) {
        throw new Error('Tag "' + tag + '" is void but content is assigned to it');
    }

    var tagBeginning = '<' + tag;
    var attrsString = Object.keys(attrs).map(function (key) {
        return ' ' + key + '="' + attrs[key] + '"';
    }).join('');
    if (attrsString.length > XML_ATTR_WRAP) {
        attrsString = '' + Object.keys(attrs).map(function (key) {
            return '\n' + XML_INDENT + key + '="' + attrs[key] + '"';
        }).join('');
    }
    var childrenString = children
        .map(function (c) {
            var content = String(c);
            return content
                .split('\n')
                .map(function (line) { return '' + XML_INDENT + line; })
                .join('\n');
        })
        .join('\n');
    var tagEnding = (isVoidTag ?
        '/>' :
        ('>\n' + childrenString + '\n</' + tag + '>'));

    return (tagBeginning + attrsString + tagEnding);
}

var tooltipTemplate = function (args) {
    var dateRange = args.dateRange;
    var diffDays = args.diffDays;
    var items = args.items;

    return (
    html('div', {class: 'interval-highlight-tooltip'},
        html('div', {class: 'interval-highlight-tooltip__header'},
            html('span', {class: 'interval-highlight-tooltip__header__date-range'},
                dateRange
            ),
            html('span',
                diffDays
            )
        ),
        html('table',
            {
                cellpadding: 0,
                cellspacing: 0,
                border: 0
            },
            ...items.map(tooltipItemTemplate)
        )
    )
    );
};
var tooltipItemTemplate = function (args) {
    var name = args.name;
    var width = args.width;
    var color = args.color;
    var diff = args.diff;
    var value = args.value;
    return (
    html('tr', {class: 'interval-highlight-tooltip__item'},
        html('td', name),
        html('td',
            html('div',
                {
                    class: 'interval-highlight-tooltip__item__value',
                    style: ('width: ' + width + 'px; background-color: ' + color + ';')
                },
                String(parseFloat((value).toFixed(2)))
            )
        ),
        html('td',
            {
                class: [
                    'interval-highlight-tooltip__item__arrow',
                    'interval-highlight-tooltip__item__arrow_' + (diff > 0 ? 'positive' : 'negative')
                ].join(' '),
            },
            html('div', {class: 'interval-highlight-tooltip__item__arrow__val'},
                html('span', {class: 'interval-highlight-tooltip__item__arrow__dir'},
                    (diff > 0 ? '&#x25B2;' : diff < 0 ? '&#x25BC;' : ''),
                    (diff === 0 ? '' : String(parseFloat((Math.abs(diff)).toFixed(2))))
                )
            )
        )
    )
    );
};

var IntervalTooltip = function (pluginSettings) {

    pluginSettings = pluginSettings || {};
    var formatRange = pluginSettings.rangeFormatter || defaultRangeFormatter;

    return {

        init(chart) {
            this._chart = chart;
            this._tooltip = this._chart.addBalloon(
                {
                    spacing: 24,
                    place: 'bottom-right',
                    auto: true,
                    effectClass: 'fade'
                });
        },

        destroy() {
            this._tooltip.destroy();
        },

        onSpecReady(chart, specRef) {
            chart.traverseSpec(specRef, function (unit, parentUnit) {
                if (unit.type.indexOf('ELEMENT.') !== 0) {
                    return;
                }

                var over = JSON.parse(JSON.stringify(unit));
                over.type = ELEMENT_HIGHLIGHT;
                over.namespace = 'highlight';
                over.guide = over.guide || {};

                unit.guide = utils.defaults(unit.guide || {}, {
                    showAnchors: 'never'
                });

                parentUnit.units.push(over);
            });
        },

        getContent(dateRange, states) {
            var formattedDateRange = formatRange(dateRange);
            var dateDiff = Math.round((dateRange[1] - dateRange[0]) / 1000 / 60 / 60 / 24);
            var max = Math.max(...states.map(function(state) {
                return state['value'];
            }));

            states.forEach(function (state) {
                state.width = 80 * state.value / max;
            });

            var formatDays = 'day';
            var diffStr = String(dateDiff);
            if (diffStr[diffStr.length - 1] !== '1') {
                formatDays += 's';
            }

            return tooltipTemplate({
                dateRange: formattedDateRange,
                items: states,
                diffDays: ('(' + dateDiff + ' ' + formatDays + ')')
            });
        },

        onRender(chart) {
            var info = pluginsSDK.extractFieldsFormatInfo(chart.getSpec());

            this._tooltip.hide();

            var node = chart.select(function (node) { return node.config.type === ELEMENT_HIGHLIGHT; })[0];
            this.node = node;

            var hideTooltip = function () {
                this._tooltip.hide();
            }.bind(this);

            var showTooltip = function (unit, e) {
                var scaleColor = unit.screenModel.model.scaleColor;
                var categories = scaleColor.domain();
                var states = categories
                    .map(function (cat) {
                        var curr = e.data[cat] || 0;
                        var prev = e.prev[cat] || 0;
                        return {
                            name: info[scaleColor.dim].format(cat || null, info[scaleColor.dim].nullAlias),
                            color: scaleColor.value(cat),
                            value: curr,
                            diff: curr - prev
                        };
                    })
                    .reverse();

                this._tooltip
                    .content(this.getContent([e.prev.date, e.data.date], states))
                    .show(e.event.pageX, e.event.pageY);
            }.bind(this);

            var updateTooltip = function (e) {
                this._tooltip
                    .position(e.event.pageX, e.event.pageY);
            }.bind(this);

            var onClick = function (sender, e) {
                if (pluginSettings.onClick) {
                    pluginSettings.onClick.call(null, sender, e);
                }
            };

            node.on('range-changed', function (sender, e) { showTooltip(sender, e); });
            node.on('range-blur', function () { hideTooltip(); });
            node.on('range-focus', function (sender, e) { onClick(sender, e); });
            node.on('range-active', function (sender, e) { updateTooltip(e); });
        }
    };
};

tauCharts.api.plugins.add('interval-highlight', IntervalTooltip);

return IntervalTooltip;

});
