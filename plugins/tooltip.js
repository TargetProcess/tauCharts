(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    var _ = tauCharts.api._;

    function Tooltip(xSettings) {

        var settings = _.defaults(
            xSettings || {},
            {
                // add default settings here
                fields: null,
                dockToData: false
            });

        function getOffsetRect(elem) {

            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docElem = document.documentElement;

            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            var top  = box.top +  scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return {
                top: Math.round(top),
                left: Math.round(left)
            };
        }

        var plugin = {

            init: function (chart) {

                this._currentData = null;
                this._currentUnit = null;
                this._chart = chart;

                // TODO: for compatibility with old TargetProcess implementation
                _.extend(this, _.omit(settings, 'fields', 'getFields'));

                var info = this._getFormatters();
                this._metaInfo = info.meta;
                this._skipInfo = info.skip;

                this._tooltip = this._chart.addBalloon(
                    {
                        spacing: 3,
                        auto: true,
                        effectClass: 'fade'
                    });

                this._tooltip
                    .content(this.template);

                this._tooltip
                    .getElement()
                    .addEventListener('click', function (e) {

                        var target = e.target;

                        while (target !== e.currentTarget && target !== null) {
                            if (target.classList.contains('i-role-exclude')) {
                                self._exclude();
                            }
                            target = target.parentNode;
                        }

                        self._tooltip.hide();

                    }, false);

                var self = this;
                var timeoutHide;
                this.showTooltip = function (data, pos) {

                    clearTimeout(timeoutHide);

                    self._currentData = data;

                    var content = self._tooltip.getElement().querySelectorAll('.i-role-content');
                    if (content[0]) {

                        var fields = (
                            settings.fields
                            ||
                            (_.isFunction(settings.getFields) && settings.getFields(self._chart))
                            ||
                            Object.keys(data)
                        );

                        content[0].innerHTML = this.render(data, fields);
                    }

                    self._tooltip
                        .show(pos.x, pos.y)
                        .updateSize();
                };

                this.hideTooltip = function (e) {
                    timeoutHide = setTimeout(
                        function () {
                            self._tooltip.hide();
                            self._removeFocus();
                        },
                        300);
                };

                this._tooltip
                    .getElement()
                    .addEventListener('mouseover', function (e) {
                        clearTimeout(timeoutHide);
                        self._accentFocus();
                    }, false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseleave', function (e) {
                        self._tooltip.hide();
                        self._removeFocus();
                    }, false);

                this.afterInit(this._tooltip.getElement());
            },

            destroy: function () {
                this._removeFocus();
                this._tooltip.destroy();
            },

            afterInit: function (tooltipNode) {
                // for override
            },

            render: function (data, fields) {
                var self = this;
                return fields
                    .filter(function (k) {
                        var tokens = k.split('.');
                        var matchX = ((tokens.length === 2) && self._skipInfo[tokens[0]]);
                        return !matchX;
                    })
                    .map(function (k) {
                        var key = k;
                        var val = data[k];
                        return self.renderItem(self._getLabel(key), self._getFormat(key)(val), key, val);
                    })
                    .join('');
            },

            renderItem: function (label, formattedValue, fieldKey, fieldVal) {
                return this.itemTemplate({
                    label: label,
                    value: formattedValue
                });
            },

            _getFormat: function (k) {
                var meta = this._metaInfo[k] || {format: _.identity};
                return meta.format;
            },

            _getLabel: function (k) {
                var meta = this._metaInfo[k] || {label: k};
                return meta.label;
            },

            _appendFocus: function (g, x, y) {
                this.circle = d3
                    .select(g)
                    .append('circle')
                    .attr({
                        r: 0,
                        cx: x,
                        cy: y
                    });

                return this.circle;
            },

            _removeFocus: function () {
                if (this.circle) {
                    this.circle.remove();
                }

                if (this._currentUnit) {
                    this._currentUnit.fire('highlight-data-points', function (row) {
                        return false;
                    });
                }

                return this;
            },

            _accentFocus: function () {
                var self = this;
                if (self._currentUnit && self._currentData) {
                    self._currentUnit.fire('highlight-data-points', function (row) {
                        return row === self._currentData;
                    });
                }

                return this;
            },

            _exclude: function () {
                this._chart
                    .addFilter({
                        tag: 'exclude',
                        predicate: (function (element) {
                            return function (row) {
                                return JSON.stringify(row) !== JSON.stringify(element);
                            };
                        }(this._currentData))
                    });
                this._chart.refresh();
            },

            onRender: function () {
                this._subscribeToHover();
            },

            template: [
                '<div class="i-role-content graphical-report__tooltip__content"></div>',
                '<div class="i-role-exclude graphical-report__tooltip__exclude">',
                '<div class="graphical-report__tooltip__exclude__wrap">',
                '<span class="tau-icon-close-gray"></span>',
                'Exclude',
                '</div>',
                '</div>'
            ].join(''),

            itemTemplate: _.template([
                '<div class="graphical-report__tooltip__list__item">',
                '<div class="graphical-report__tooltip__list__elem"><%=label%></div>',
                '<div class="graphical-report__tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join('')),

            _subscribeToHover: function () {
                var self = this;

                this._chart
                    .select(function (node) {
                        var guide = node.config.guide || {};
                        return !guide.__plugins_disable_tooltip;
                    })
                    .forEach(function (node) {

                        node.on('mouseout', function (sender, e) {
                            self.hideTooltip(e);
                        });

                        node.on('mouseover', function (sender, e) {
                            var data = e.data;
                            var coords = (settings.dockToData ?
                                self._getNearestDataCoordinates(sender, e) :
                                self._getMouseCoordinates(sender, e));

                            self._currentUnit = sender;
                            self.showTooltip(data, {x: coords.left, y: coords.top});
                        });
                    });
            },

            _getNearestDataCoordinates: function (sender, e) {

                var data = e.data;
                var xLocal;
                var yLocal;

                var xScale = sender.getScale('x');
                var yScale = sender.getScale('y');

                if (sender.config.type === 'ELEMENT.INTERVAL.STACKED') {
                    var view = e.event.chartElementViewModel;
                    xLocal = xScale(view.x);
                    yLocal = yScale(view.y);
                } else {
                    xLocal = xScale(data[xScale.dim]);
                    yLocal = yScale(data[yScale.dim]);
                }

                var g = e.event.target.parentNode;
                var c = this
                    ._removeFocus()
                    ._appendFocus(g, xLocal, yLocal);

                return getOffsetRect(c.node());
            },

            _getMouseCoordinates: function (sender, e) {

                var xLocal = e.event.pageX;
                var yLocal = e.event.pageY;

                this._removeFocus();

                return {left: xLocal, top: yLocal};
            },

            _getFormatters: function () {
                var spec = this._chart.getSpec();
                var specScales = spec.scales;

                var isEmptyScale = function (key) {
                    return !specScales[key].dim;
                };

                var fillSlot = function (memoRef, config, key) {
                    var GUIDE = config.guide || {};
                    var scale = specScales[config[key]];
                    var guide = GUIDE[key] || {};
                    memoRef[scale.dim] = memoRef[scale.dim] || {label: [], format: [], nullAlias:[], tickLabel:[]};

                    var label = guide.label;
                    memoRef[scale.dim].label.push(_.isString(label) ? label : ((guide.label || {}).text));

                    var format = guide.tickFormat || guide.tickPeriod;
                    memoRef[scale.dim].format.push(format);

                    memoRef[scale.dim].nullAlias.push(guide.tickFormatNullAlias);

                    // TODO: workaround for #complex-objects
                    memoRef[scale.dim].tickLabel.push(guide.tickLabel);
                };

                var configs = [];
                this._chart
                    .traverseSpec(spec, function (node) {
                        configs.push(node);
                    });

                var summary = configs.reduce(function (memo, config) {

                    if (config.type === 'COORDS.RECT' && config.hasOwnProperty('x') && !isEmptyScale(config.x)) {
                        fillSlot(memo, config, 'x');
                    }

                    if (config.type === 'COORDS.RECT' && config.hasOwnProperty('y') && !isEmptyScale(config.y)) {
                        fillSlot(memo, config, 'y');
                    }

                    if (config.hasOwnProperty('color') && !isEmptyScale(config.color)) {
                        fillSlot(memo, config, 'color');
                    }

                    if (config.hasOwnProperty('size') && !isEmptyScale(config.size)) {
                        fillSlot(memo, config, 'size');
                    }

                    return memo;

                }, {});

                var choiceRule = function (arr, defaultValue) {

                    var val = _(arr)
                        .chain()
                        .filter(_.identity)
                        .uniq()
                        .first()
                        .value();

                    return val || defaultValue;
                };

                var skipInfo = {};
                var metaInfo = Object
                    .keys(summary)
                    .reduce(function (memo, k) {
                        memo[k].label = choiceRule(memo[k].label, k);
                        memo[k].format = choiceRule(memo[k].format, null);
                        memo[k].nullAlias = choiceRule(memo[k].nullAlias, ('No ' + memo[k].label));
                        memo[k].tickLabel = choiceRule(memo[k].tickLabel, null);

                        // very special case for dates
                        var format = (memo[k].format === 'x-time-auto') ? 'day' : memo[k].format;
                        var fnForm = tauCharts.api.tickFormat.get(format, memo[k].nullAlias);

                        memo[k].format = fnForm;

                        // TODO: workaround for #complex-objects
                        if (memo[k].tickLabel) {
                            var kc = k.replace(('.' + memo[k].tickLabel), '');
                            memo[kc] = memo[k];
                            memo[kc].format = function (obj) {
                                return fnForm(obj && obj[memo[kc].tickLabel]);
                            };

                            skipInfo[kc] = true;
                            delete memo[k];
                        }

                        return memo;
                    }, summary);

                return {
                    meta: metaInfo,
                    skip: skipInfo
                };
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('tooltip', Tooltip);

    return Tooltip;
});