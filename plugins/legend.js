import tauCharts from 'taucharts';
import * as d3 from 'd3';

    var utils = tauCharts.api.utils;
    var pluginsSDK = tauCharts.api.pluginsSDK;
    var RESET_SELECTOR = '.graphical-report__legend__reset';
    var COLOR_ITEM_SELECTOR = '.graphical-report__legend__item-color';
    var COLOR_TOGGLE_SELECTOR = '.graphical-report__legend__guide--color__overlay';
    var SIZE_TICKS_COUNT = 4;
    var FONT_SIZE = 13;

    var counter = 0;
    var getId = function () {
        return ++counter;
    };

    var xml = function (tag, _attrs) {
        var childrenArgIndex = 2;
        var attrs = _attrs;
        if (typeof attrs !== 'object') {
            childrenArgIndex = 1;
            attrs = {};
        }
        var children = Array.prototype.slice.call(arguments, childrenArgIndex);
        return (
            '<' + tag +
            Object.keys(attrs).map(function (key) {
                return ' ' + key + '="' + attrs[key] + '"';
            }).join('') +
            (children.length > 0 ? ('>' + children.join('') + '</' + tag + '>') : '/>')
        );
    };

    var splitEvenly = function (domain, parts) {
        var min = domain[0];
        var max = domain[1];
        var segment = ((max - min) / (parts - 1));
        var chunks = utils.range(parts - 2).map(function (n) {
            return (min + segment * (n + 1));
        });
        return [min].concat(chunks).concat(max);
    };

    var splitRealValuesEvenly = function (values, count, funcType) {

        if (values.length < 3) {
            return values.slice(0);
        }
        if (count < 3) {
            return [values[0], values[values.length - 1]];
        }

        var neg = (values[0] < 0 ? Math.abs(values[0]) : 0);
        var repeat = function (x) {
            return x;
        };
        var sqrt = function (x) {
            return Math.sqrt(x + neg);
        };
        var square = function (x) {
            return (Math.pow(x, 2) - neg);
        };
        var input = (funcType === 'sqrt' ? sqrt : repeat);
        var ouput = (funcType === 'sqrt' ? square : repeat);

        values = values.map(input);
        var result = [values[0]];
        var length = (values[values.length - 1] - values[0]);
        var halfStep = (0.5 * length / (count - 1));

        var steps = utils.range(1, count - 1)
            .map(function (i) {
                var mid = (length * i / (count - 1));
                return {
                    min: mid - halfStep,
                    mid: mid,
                    max: mid + halfStep,
                    diff: Number.MAX_VALUE,
                    closest: null
                };
            });
        var si = 0;
        var step;
        var nextStep = function () {
            if (si === steps.length) {
                return;
            }
            var prevStep = step;
            step = steps[si++];
            step.min = Math.max(
                (step.min),
                ((prevStep && prevStep.closest !== null ? prevStep.closest : result[0]) + halfStep)
            );
        };
        nextStep();

        values.forEach(function (value) {
            if (value < step.min) {
                return;
            }
            if (value > step.max) {
                nextStep();
            }
            var diff = Math.abs(value - step.mid);
            if (diff < step.diff && diff < halfStep) {
                step.diff = diff;
                step.closest = value;
            } else {
                nextStep();
            }
            if (diff === 0) {
                nextStep();
            }
        });

        steps.forEach(function (s) {
            if (s.closest !== null) {
                result.push(s.closest);
            }
        });

        result.push(values[values.length - 1]);

        result = result.map(ouput);

        return result;
    };

    var log10 = function (x) {
        return Math.log(x) / Math.LN10;
    };

    var getExponent = function (x) {
        if (x === 0) {
            return 0;
        }
        return Math.floor(log10(Math.abs(x)));
    };

    var removeRedundantZeros = (function () {
        var zerosAfterDot = /\.0+([^\d].*)?$/;
        var zerosAfterNotZero = /(\.\d+?)0+([^\d].*)?$/;
        return function (str) {
            return str
                .replace(zerosAfterDot, '$1')
                .replace(zerosAfterNotZero, '$1$2');
        };
    })();

    var d3Format3S = d3.format('.3s');
    var shortNumFormat = function (num) {
        return removeRedundantZeros(d3Format3S(num));
    };

    var getNumberFormatter = function (start, end) {

        var max = Math.max(Math.abs(start), Math.abs(end));
        var absExp = getExponent(max);
        var diff = (start * end > 0 ? Math.abs(end - start) : max);
        var diffExp = getExponent(diff);
        var absExpVsDiffExp = Math.abs(absExp - diffExp);

        if (Math.abs(absExp) > 3 && absExpVsDiffExp <= 3) {
            // Short format
            // 1k, 500k, 1M.
            return shortNumFormat;
        }

        // Show necessary digits:
        // 100001, 100002, 100003;
        // 0.10001, 0.10002, 0.10003.
        return function (num) {
            var numExp = getExponent(max - num);
            var trailingDigits = Math.min((
                (diffExp < 0 ? Math.abs(diffExp) : 0) +
                (numExp < diffExp ? 1 : 0)
            ), 20); // NOTE: `toFixed` accepts values between 0 and 20.
            return removeRedundantZeros(num.toFixed(trailingDigits));
        };
    };

    function ChartLegend(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                // add default settings here
            });

        var doEven = function (n) {
            n = Math.round(n);
            return n % 2 ? n + 1 : n;
        };

        var isEmpty = function (x) {
            return (x === null) || (x === '') || (typeof x === 'undefined');
        };

        var createIsRowMatchInterceptor = function (dim, val) {
            return function (row) {
                var d = row[dim];
                var r = JSON.stringify(isEmpty(d) ? null : d);
                return (val === r);
            };
        };

        var _delegateEvent = function (element, eventName, selector, callback) {
            element.addEventListener(eventName, function (e) {
                var target = e.target;
                while (target !== e.currentTarget && target !== null) {
                    if (target.matches(selector)) {
                        callback(e, target);
                    }
                    target = target.parentNode;
                }
            });
        };

        return {

            init: function (chart) {
                this.instanceId = getId();

                this._chart = chart;
                this._currentFilters = {};
                this._legendColorByScaleId = {};
                this._legendOrderState = {};

                var spec = this._chart.getSpec();

                var reducer = function (scaleType) {
                    return function (memo, k) {
                        var s = spec.scales[k];
                        if (s.type === scaleType && s.dim) {
                            memo.push(k);
                        }
                        return memo;
                    };
                };

                this._color = Object
                    .keys(spec.scales)
                    .reduce(reducer('color'), [])
                    .filter(function (scale) {
                        return chart.getScaleInfo(scale).discrete;
                    });

                this._fill = Object
                    .keys(spec.scales)
                    .reduce(reducer('color'), [])
                    .filter(function (scale) {
                        return !chart.getScaleInfo(scale).discrete;
                    });

                this._size = Object
                    .keys(spec.scales)
                    .reduce(reducer('size'), []);

                var hasColorScales = (this._color.length > 0);
                var hasFillScales = (this._fill.length > 0);
                var hasSizeScales = (this._size.length > 0);

                this._assignStaticBrewersOrEx();

                if (hasColorScales || hasFillScales || hasSizeScales) {

                    switch (settings.position) {
                        case 'left':
                            this._container = this._chart.insertToLeftSidebar(this._containerTemplate);
                            break;
                        case 'right':
                            this._container = this._chart.insertToRightSidebar(this._containerTemplate);
                            break;
                        case 'top':
                            this._container = this._chart.insertToHeader(this._containerTemplate);
                            break;
                        case 'bottom':
                            this._container = this._chart.insertToFooter(this._containerTemplate);
                            break;
                        default:
                            this._container = this._chart.insertToRightSidebar(this._containerTemplate);
                            break;
                    }

                    if (hasColorScales) {
                        _delegateEvent(
                            this._container,
                            'click',
                            RESET_SELECTOR,
                            function (e, currentTarget) {
                                this._toggleLegendItem(currentTarget, 'reset');
                            }.bind(this));

                        _delegateEvent(
                            this._container,
                            'click',
                            COLOR_ITEM_SELECTOR,
                            function (e, currentTarget) {
                                var mode = (e.ctrlKey || e.target.matches(COLOR_TOGGLE_SELECTOR) ?
                                    'leave-others' :
                                    'focus-single');
                                this._toggleLegendItem(currentTarget, mode);
                            }.bind(this));

                        _delegateEvent(
                            this._container,
                            'mouseover',
                            COLOR_ITEM_SELECTOR,
                            function (e, currentTarget) {
                                this._highlightToggle(currentTarget, true);
                            }.bind(this)
                        );

                        _delegateEvent(
                            this._container,
                            'mouseout',
                            COLOR_ITEM_SELECTOR,
                            function (e, currentTarget) {
                                this._highlightToggle(currentTarget, false);
                            }.bind(this)
                        );
                    }
                }
            },

            onRender: function () {
                this._clearPanel();
                this._drawColorLegend();
                this._drawFillLegend();
                this._drawSizeLegend();
            },

            // jscs:disable maximumLineLength
            _containerTemplate: '<div class="graphical-report__legend"></div>',
            _template: utils.template([
                '<div class="graphical-report__legend__wrap">',
                '<%=top%>',
                '<div class="graphical-report__legend__title"><%=name%></div>',
                '<%=items%>',
                '</div>'
            ].join('')),
            _itemTemplate: utils.template([
                '<div data-scale-id=\'<%= scaleId %>\' data-dim=\'<%= dim %>\' data-value=\'<%= value %>\' class="graphical-report__legend__item graphical-report__legend__item-color <%=classDisabled%>">',
                '   <div class="graphical-report__legend__guide__wrap">',
                '   <div class="graphical-report__legend__guide graphical-report__legend__guide--color <%=cssClass%>"',
                '        style="background-color: <%=cssColor%>; border-color: <%=borderColor%>;">',
                '       <div class="graphical-report__legend__guide--color__overlay">',
                '       </div>',
                '   </div>',
                '   </div>',
                '   <span class="graphical-report__legend__guide__label"><%=label%></span>',
                '</div>'
            ].join('')),
            _resetTemplate: utils.template([
                '<div class="graphical-report__legend__reset <%=classDisabled%>">',
                    '<div role="button" class="graphical-report-btn">Reset</div>',
                '</div>'
            ].join('')),
            // jscs:enable maximumLineLength

            _clearPanel: function () {
                if (this._container) {
                    this._getScrollContainer().removeEventListener('scroll', this._scrollListener);
                    this._container.innerHTML = '';
                }
            },

            _drawFillLegend: function () {
                var self = this;

                self._fill.forEach(function (c) {
                    var firstNode = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.color === c);
                        })
                        [0];

                    if (firstNode) {

                        var guide = firstNode.config.guide || {};

                        var fillScale = firstNode.getScale('color');

                        var domain = fillScale.domain().sort(function (a, b) {
                            return a - b;
                        });

                        var isDate = domain.reduce(function (memo, x) {
                            return memo && utils.isDate(x);
                        }, true);

                        var numDomain = (isDate ?
                            domain.map(Number) :
                            domain);

                        var numFormatter = getNumberFormatter(numDomain[0], numDomain[numDomain.length - 1]);
                        var dateFormatter = (function () {
                            var spec = self._chart.getSpec();
                            var formatter = pluginsSDK.extractFieldsFormatInfo(spec)[fillScale.dim].format;
                            if (!formatter) {
                                formatter = function (x) {
                                    return new Date(x);
                                };
                            }
                            return function (x) {
                                return String(formatter(x));
                            };
                        })();

                        var formatter = (isDate ?
                            dateFormatter :
                            numFormatter);

                        var brewerLength = fillScale.brewer.length;
                        var title = ((guide.color || {}).label || {}).text || fillScale.dim;

                        var getTextWidth = function (text) {
                            return (text.length * FONT_SIZE * 0.618);
                        };
                        var labelsCount = (!fillScale.isInteger ? 3 :
                            ((numDomain[1] - numDomain[0]) % 3 === 0) ? 4 :
                                ((numDomain[1] - numDomain[0]) % 2 === 0) ? 3 : 2
                        );
                        var splitted = splitEvenly(numDomain, labelsCount);
                        var labels = (isDate ? splitted.map(function (x) {
                            return new Date(x);
                        }) : splitted).map(formatter);
                        if (labels[0] === labels[labels.length - 1]) {
                            labels = [labels[0]];
                        }

                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                name: title,
                                top: null,
                                items: '<div class="graphical-report__legend__gradient-wrapper"></div>'
                            }));
                        var container = self._container
                            .lastElementChild
                            .querySelector('.graphical-report__legend__gradient-wrapper');
                        var width = container.getBoundingClientRect().width;
                        var totalLabelsW = labels.reduce(function (sum, label) {
                            return (sum + getTextWidth(label));
                        }, 0);
                        var isVerticalLayout = false;
                        if (totalLabelsW > width) {
                            if (labels.length > 1 &&
                                getTextWidth(labels[0]) + getTextWidth(labels[labels.length - 1]) > width
                            ) {
                                isVerticalLayout = true;
                            } else {
                                labels = [labels[0], labels[labels.length - 1]];
                            }
                        }

                        var barSize = 20;
                        var layout = (isVerticalLayout ?
                            (function () {
                                var height = 120;
                                var dy = (FONT_SIZE * (0.618 - 1) / 2);
                                return {
                                    width: width,
                                    height: height,
                                    barX: 0,
                                    barY: 0,
                                    barWidth: barSize,
                                    barHeight: height,
                                    textAnchor: 'start',
                                    textX: utils.range(labelsCount).map(function () {
                                        return 25;
                                    }),
                                    textY: (labels.length === 1 ?
                                        (height / 2 + FONT_SIZE * 0.618) :
                                        labels.map(function (_, i) {
                                            var t = ((labels.length - 1 - i) / (labels.length - 1));
                                            return (FONT_SIZE * (1 - t) + height * t + dy);
                                        }))
                                };
                            })() :
                            (function () {
                                var padL = (getTextWidth(labels[0]) / 2);
                                var padR = (getTextWidth(labels[labels.length - 1]) / 2);
                                var indent = 8;
                                return {
                                    width: width,
                                    height: (barSize + indent + FONT_SIZE),
                                    barX: 0,
                                    barY: 0,
                                    barWidth: width,
                                    barHeight: barSize,
                                    textAnchor: 'middle',
                                    textX: (labels.length === 1 ?
                                        [width / 2] :
                                        labels.map(function (_, i) {
                                            var t = (i / (labels.length - 1));
                                            return (padL * (1 - t) + (width - padR) * t);;
                                        })),
                                    textY: utils.range(labelsCount).map(function () {
                                        return (barSize + indent + FONT_SIZE);
                                    })
                                };
                            })()
                        );

                        var stops = splitEvenly(numDomain, brewerLength)
                            .map(function (x, i) {
                                var p = (i / (brewerLength - 1)) * 100;
                                return (
                                    '<stop offset="' + p + '%"' +
                                    '      style="stop-color:' + fillScale(x) + ';stop-opacity:1" />');
                            });

                        var gradientId = 'legend-gradient-' + self.instanceId;

                        var gradient = (
                            xml('svg',
                                {
                                    class: 'graphical-report__legend__gradient',
                                    width: layout.width,
                                    height: layout.height
                                },
                                xml('defs',
                                    xml('linearGradient',
                                        {
                                            id: gradientId,
                                            x1: '0%',
                                            y1: (isVerticalLayout ? '100%' : '0%'),
                                            x2: (isVerticalLayout ? '0%' : '100%'),
                                            y2: '0%'
                                        },
                                        stops.join('')
                                    )
                                ),
                                xml('rect', {
                                    class: 'graphical-report__legend__gradient__bar',
                                    x: layout.barX,
                                    y: layout.barY,
                                    width: layout.barWidth,
                                    height: layout.barHeight,
                                    fill: 'url(#' + gradientId + ')'
                                }),
                                labels.map(function (text, i) {
                                    return xml('text', {
                                        x: layout.textX[i],
                                        y: layout.textY[i],
                                        'text-anchor': layout.textAnchor
                                    }, text);
                                }).join('')
                            )
                        );

                        container
                            .insertAdjacentHTML('beforeend', gradient);
                    }
                });
            },

            _drawSizeLegend: function () {
                var self = this;

                self._size.forEach(function (c) {
                    var firstNode = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.size === c);
                        })
                        [0];

                    if (firstNode) {

                        var guide = firstNode.config.guide || {};

                        var sizeScale = firstNode.getScale('size');

                        var domain = sizeScale.domain().sort(function (a, b) {
                            return a - b;
                        });
                        if (!Array.isArray(domain) || !domain.every(isFinite)) {
                            return;
                        }

                        var title = ((guide.size || {}).label || {}).text || sizeScale.dim;

                        var first = domain[0];
                        var last = domain[domain.length - 1];

                        var values = [first];
                        if ((last - first)) {
                            var count = log10(last - first);
                            var xF = Math.round((4 - count));
                            var base = Math.pow(10, xF);

                            var realValues = utils.unique(
                                self._chart
                                    .getDataSources({
                                        excludeFilter: ['legend']
                                    })[sizeScale.source]
                                    .data
                                    .map(function (d) {
                                        return d[sizeScale.dim];
                                    })
                                    .filter(function (s) {
                                        return (s >= first && s <= last);
                                    }))
                                .sort(function (a, b) {
                                    return (a - b);
                                });
                            var steps = splitRealValuesEvenly(realValues, SIZE_TICKS_COUNT, sizeScale.funcType);

                            values = utils.unique(steps
                                .map(function (x) {
                                    return (Math.round(x * base) / base);
                                }));
                        }

                        var castNum = getNumberFormatter(values[0], values[values.length - 1]);

                        var getTextWidth = function (text) {
                            return (text.length * FONT_SIZE * 0.618);
                        };
                        values.reverse();
                        var sizes = values.map(sizeScale);
                        var maxSize = Math.max.apply(null, sizes);

                        var labels = values.map(castNum);
                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                name: title,
                                top: null,
                                items: '<div class="graphical-report__legend__size-wrapper"></div>'
                            }));
                        var container = self._container
                            .lastElementChild
                            .querySelector('.graphical-report__legend__size-wrapper');
                        var width = container.getBoundingClientRect().width;
                        var maxLabelW = Math.max.apply(null, labels.map(getTextWidth));
                        var isVerticalLayout = false;
                        if (maxLabelW > width / 4 || labels.length === 1) {
                            isVerticalLayout = true;
                        }

                        var layout = (isVerticalLayout ?
                            (function () {
                                var gap = FONT_SIZE;
                                var padT = (sizes[0] / 2);
                                var padB = (sizes[sizes.length - 1] / 2);
                                var indent = 8;
                                var cy = [padT];
                                for (var i = 1, n, p; i < sizes.length; i++) {
                                    p = (sizes[i - 1] / 2);
                                    n = (sizes[i] / 2);
                                    cy.push(cy[i - 1] + Math.max(FONT_SIZE * 1.618, p + gap + n));
                                }
                                var dy = (FONT_SIZE * 0.618 / 2);
                                return {
                                    width: width,
                                    height: (cy[cy.length - 1] + Math.max(padB, FONT_SIZE / 2)),
                                    circleX: utils.range(sizes.length).map(function () {
                                        return (maxSize / 2);
                                    }),
                                    circleY: cy,
                                    textAnchor: 'start',
                                    textX: utils.range(labels.length).map(function () {
                                        return (maxSize + indent);
                                    }),
                                    textY: cy.map(function (y) {
                                        return (y + dy);
                                    })
                                };
                            })() :
                            (function () {
                                var padL = Math.max(
                                    getTextWidth(labels[0]) / 2,
                                    sizes[0] / 2
                                );
                                var padR = Math.max(
                                    getTextWidth(labels[labels.length - 1]) / 2,
                                    sizes[sizes.length - 1] / 2
                                );
                                var gap = (width - sizes.reduce(function (sum, n, i) {
                                    return (sum + (i === 0 || i === sizes.length - 1 ? n / 2 : n));
                                }, 0) - padL - padR) / (SIZE_TICKS_COUNT - 1);
                                var indent = 8;
                                var cx = [padL];
                                for (var i = 1, n, p; i < sizes.length; i++) {
                                    p = (sizes[i - 1] / 2);
                                    n = (sizes[i] / 2);
                                    cx.push(cx[i - 1] + p + gap + n);
                                }
                                var cy = sizes.map(function (size) {
                                    return (maxSize - size / 2);
                                });
                                return {
                                    width: width,
                                    height: (maxSize + indent + FONT_SIZE),
                                    circleX: cx,
                                    circleY: cy,
                                    textAnchor: 'middle',
                                    textX: cx,
                                    textY: utils.range(labels.length).map(function () {
                                        return (maxSize + indent + FONT_SIZE);
                                    }),
                                };
                            })()
                        );

                        var sizeLegend = (
                            xml('svg',
                                {
                                    class: 'graphical-report__legend__size',
                                    width: layout.width,
                                    height: layout.height
                                },
                                sizes.map(function (size, i) {
                                    return xml('circle', {
                                        class: (
                                            'graphical-report__legend__size__item__circle ' +
                                            (firstNode.config.color ? 'color-definite' : 'color-default-size')
                                        ),
                                        cx: layout.circleX[i],
                                        cy: layout.circleY[i],
                                        r: (size / 2)
                                    });
                                }).join(''),
                                labels.map(function (text, i) {
                                    return xml('text', {
                                        class: 'graphical-report__legend__size__item__label',
                                        x: layout.textX[i],
                                        y: layout.textY[i],
                                        'text-anchor': layout.textAnchor
                                    }, text);
                                }).join('')
                            )
                        );

                        container
                            .insertAdjacentHTML('beforeend', sizeLegend);
                    }
                });
            },

            _drawColorLegend: function () {
                var self = this;

                self._color.forEach(function (c) {
                    var firstNode = self
                        ._chart
                        .select(function (unit) {
                            return (unit.config.color === c);
                        })
                        [0];

                    if (firstNode) {

                        var guide = firstNode.config.guide || {};

                        var colorScale = firstNode.getScale('color');
                        var dataSource = self
                            ._chart
                            .getDataSources({excludeFilter: ['legend']});

                        var domain = utils.unique(dataSource[colorScale.source].data
                            .map(function (x) {
                                return x[colorScale.dim];
                            }));

                        var colorScaleConfig = self._chart.getSpec().scales[c];
                        if (colorScaleConfig.order) {
                            domain = utils.union(utils.intersection(colorScaleConfig.order, domain), domain);
                        } else {
                            var orderState = self._legendOrderState[c];
                            domain = domain.sort(function (a, b) {
                                var diff = orderState[a] - orderState[b];
                                return (diff && (diff / Math.abs(diff)));
                            });
                        }

                        var title = ((guide.color || {}).label || {}).text || colorScale.dim;
                        var noVal = ((guide.color || {}).tickFormatNullAlias || ('No ' + title));

                        var legendColorItems = domain.map(function (d) {
                            var val = JSON.stringify(isEmpty(d) ? null : d);
                            var key = colorScale.dim + val;

                            return {
                                scaleId: c,
                                dim: colorScale.dim,
                                color: colorScale(d),
                                disabled: self._currentFilters.hasOwnProperty(key),
                                label: d,
                                value: val
                            };
                        });

                        self._legendColorByScaleId[c] = legendColorItems;
                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                name: title,
                                top: self._resetTemplate({
                                    classDisabled: (legendColorItems.some(function (d) {
                                        return d.disabled;
                                    }) ? '' : 'disabled')
                                }),
                                items: legendColorItems
                                    .map(function (d) {
                                        return self._itemTemplate({
                                            scaleId: d.scaleId,
                                            dim: utils.escape(d.dim),
                                            color: d.color,
                                            cssClass: (colorScale.toClass(d.color)),
                                            cssColor: (d.disabled ? 'transparent' : colorScale.toColor(d.color)),
                                            borderColor: colorScale.toColor(d.color),
                                            classDisabled: d.disabled ? 'disabled' : '',
                                            label: utils.escape(isEmpty(d.label) ? noVal : d.label),
                                            value: utils.escape(d.value)
                                        });
                                    })
                                    .join('')
                            }));
                    }
                });

                if (self._color.length > 0) {
                    self._updateResetButtonPosition();
                    var scrollTimeout = null;
                    self._scrollListener = function () {
                        var reset = self._container.querySelector(RESET_SELECTOR);
                        reset.style.display = 'none';
                        if (scrollTimeout) {
                            clearTimeout(scrollTimeout);
                        }
                        scrollTimeout = setTimeout(function () {
                            self._updateResetButtonPosition();
                            reset.style.display = '';
                            scrollTimeout = null;
                        }, 250);
                    };
                    self._getScrollContainer().addEventListener('scroll', self._scrollListener);
                }
            },

            _toggleLegendItem: function (target, mode) {

                var filters = this._currentFilters;
                var colorNodes = (target ? Array.prototype.filter.call(
                    target.parentNode.childNodes,
                    function (el) {
                        return el.matches(COLOR_ITEM_SELECTOR);
                    }
                ) : null);

                var getColorData = function (node) {
                    var dim = node.getAttribute('data-dim');
                    var val = node.getAttribute('data-value');
                    return {
                        sid: node.getAttribute('data-scale-id'),
                        dim: dim,
                        val: val,
                        key: (dim + val)
                    };
                };
                var isColorHidden = function (key) {
                    return (key in filters);
                };
                var toggleColor = function (node, show) {
                    var data = getColorData(node);
                    if (isColorHidden(data.key) !== show) {
                        return;
                    }
                    if (show) {
                        var filterId = filters[data.key];
                        delete filters[data.key];
                        node.classList.remove('disabled');
                        this._chart.removeFilter(filterId);
                    } else {
                        node.classList.add('disabled');
                        var isRowMatch = createIsRowMatchInterceptor(data.dim, data.val);
                        filters[data.key] = this._chart.addFilter({
                            tag: 'legend',
                            predicate: function (row) {
                                return !isRowMatch(row);
                            }
                        });
                    }
                }.bind(this);
                var isTarget = function (node) {
                    return (node === target);
                };
                var isTargetHidden = (target ? isColorHidden(getColorData(target).key) : false);

                var setGuideBackground = function (node, visible) {
                    node.querySelector('.graphical-report__legend__guide')
                        .style.backgroundColor = (visible ? '' : 'transparent');
                };

                if (mode === 'reset') {
                    colorNodes.forEach(function (node) {
                        toggleColor(node, true);
                        setGuideBackground(node, true);
                    });
                } else if (mode === 'leave-others') {
                    colorNodes.forEach(function (node) {
                        if (isTarget(node)) {
                            toggleColor(node, isTargetHidden);
                        }
                    });
                    setGuideBackground(target, isTargetHidden);
                } else if (mode === 'focus-single') {
                    var onlyTargetIsVisible = (!isTargetHidden && colorNodes.every(function (node) {
                        return (isTarget(node) || isColorHidden(getColorData(node).key));
                    }));
                    colorNodes.forEach(function (node) {
                        var show = (isTarget(node) || onlyTargetIsVisible);
                        toggleColor(node, show);
                    });
                    if (isTargetHidden) {
                        setGuideBackground(target, true);
                    }
                }

                this._chart.refresh();
            },

            _highlightToggle: function (target, doHighlight) {

                if (target.matches('.disabled')) {
                    return;
                }

                // var scaleId = target.getAttribute('data-scale-id');
                var dim = target.getAttribute('data-dim');
                var val = target.getAttribute('data-value');

                var isRowMatch = doHighlight ?
                    (createIsRowMatchInterceptor(dim, val)) :
                    (function (row) { return null; });

                this._chart
                    .select(function (unit) {
                        // return unit.config.color === scaleId;
                        // use all found elements
                        return true;
                    })
                    .forEach(function (unit) {
                        unit.fire('highlight', isRowMatch);
                    });
            },

            _getScrollContainer: function () {
                return this._container.parentNode.parentNode;
            },

            _updateResetButtonPosition: function () {
                var reset = this._container.querySelector(RESET_SELECTOR);
                reset.style.top = this._getScrollContainer().scrollTop + 'px';
            },

            _generateColorMap: function (domain, defBrewer) {

                var limit = defBrewer.length; // 20;

                return domain.reduce(function (memo, val, i) {
                        memo[val] = defBrewer[i % limit];
                        return memo;
                    },
                    {});
            },

            _assignStaticBrewersOrEx: function () {
                var self = this;
                self._color.forEach(function (c) {
                    var scaleConfig = self
                        ._chart
                        .getSpec()
                        .scales[c];

                    var fullLegendDataSource = self
                        ._chart
                        .getDataSources({excludeFilter: ['legend']});

                    var fullLegendDomain = self
                        ._chart
                        .getScaleFactory(fullLegendDataSource)
                        .createScaleInfoByName(c)
                        .domain();

                    if (!scaleConfig.brewer || Array.isArray(scaleConfig.brewer)) {
                        var defBrewer = scaleConfig.brewer || utils.range(20).map(function (i) {
                            return 'color20-' + (1 + i);
                        });
                        scaleConfig.brewer = self._generateColorMap(fullLegendDomain, defBrewer);
                    }

                    self._legendOrderState[c] = fullLegendDomain.reduce(function (memo, x, i) {
                        memo[x] = i;
                        return memo;
                    }, {});
                });
            }
        };
    }

    tauCharts.api.plugins.add('legend', ChartLegend);

export default ChartLegend;
