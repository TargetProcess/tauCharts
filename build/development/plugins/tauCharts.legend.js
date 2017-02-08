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

    var utils = tauCharts.api.utils;
    var RESET_SELECTOR = '.graphical-report__legend__reset';
    var COLOR_ITEM_SELECTOR = '.graphical-report__legend__item-color';
    var COLOR_TOGGLE_SELECTOR = '.graphical-report__legend__guide--color__overlay';

    var counter = 0;
    var getId = function () {
        return ++counter;
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

    var splitRealValuesEvenly = function (values, count) {

        if (values.length < 3) {
            return values.slice(0);
        }

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

        return result;
    };

    var getSignificantDigitsFormatter = function (start, end) {
        var diff = Math.abs(end - start);
        var significantNumbers = 2;
        if (diff > 0 && diff < 1) {
            significantNumbers += String(diff).split('.')[1].split(0).findIndex(function (x) {
                return x !== '';
            });
        }

        return function (num) {
            return String(parseFloat((num).toFixed(significantNumbers)));
        };
    };

    function ChartLegend(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                // add default settings here
            });

        var log10 = function (x) {
            return Math.log(x) / Math.LN10;
        };

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

                        _delegateEvent(
                            this._container,
                            'click',
                            COLOR_ITEM_SELECTOR,
                            function (e, currentTarget) {
                                this._toggleLegendItem(
                                    currentTarget,
                                    (e.ctrlKey || e.target.matches(COLOR_TOGGLE_SELECTOR))
                                );
                            }.bind(this));
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
                '<div class="graphical-report__legend__title"><%=name%></div>',
                '<%=top%>',
                '<%=items%>',
                '</div>'
            ].join('')),
            _itemTemplate: utils.template([
                '<div data-scale-id=\'<%= scaleId %>\' data-dim=\'<%= dim %>\' data-value=\'<%= value %>\' class="graphical-report__legend__item graphical-report__legend__item-color <%=classDisabled%>">',
                '   <div class="graphical-report__legend__guide__wrap">',
                '   <div class="graphical-report__legend__guide graphical-report__legend__guide--color <%=cssClass%>"',
                '        style="background-color: <%=cssColor%>">',
                '       <div class="graphical-report__legend__guide--color__overlay">',
                '       </div>',
                '   </div>',
                '   </div>',
                '   <span class="graphical-report__legend__guide__label"><%=label%></span>',
                '</div>'
            ].join('')),
            _itemFillTemplate: utils.template([
                '<div data-value=\'<%=value%>\' class="graphical-report__legend__item graphical-report__legend__item-color" style="padding: 6px 0px 10px 40px;margin-left:10px;">',
                '<div class="graphical-report__legend__guide__wrap" style="top:0;left:0;">',
                '   <span class="graphical-report__legend__guide" style="background-color:<%=color%>;border-radius:0"></span>',
                '   <span style="padding-left: 20px"><%=label%></span>',
                '</div>',
                '</div>'
            ].join('')),
            _itemSizeTemplate: utils.template([
                '<div class="graphical-report__legend__item graphical-report__legend__item--size">',
                '<div class="graphical-report__legend__guide__wrap">',
                '<svg class="graphical-report__legend__guide graphical-report__legend__guide--size  <%=className%>" style="width: <%=diameter%>px;height: <%=diameter%>px;"><circle cx="<%=radius%>" cy="<%=radius%>" class="graphical-report__dot" r="<%=radius%>"></circle></svg>',
                '</div><%=value%>',
                '</div>'
            ].join('')),
            _resetTemplate: utils.template([
                '<div role="button" class="graphical-report__legend__reset <%=classDisabled%>">',
                'Reset',
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
                            domain.map(function (x) {
                                return x - 0;
                            }) :
                            domain);

                        var numFormatter = getSignificantDigitsFormatter(numDomain[0], numDomain[numDomain.length - 1]);

                        var castNum = (isDate ?
                            function (x) {
                                return new Date(x);
                            } :
                            function (x) {
                                return numFormatter(x);
                            });

                        var brewerLength = fillScale.brewer.length;

                        var height = 120;
                        var fontHeight = 13;

                        var stops = splitEvenly(numDomain, brewerLength)
                            .reverse()
                            .map(function (x, i) {
                                var p = (i / (brewerLength - 1)) * 100;
                                return (
                                    '<stop offset="' + p + '%"' +
                                    '      style="stop-color:' + fillScale(x) + ';stop-opacity:1" />');
                            });

                        var labelsLength = (!fillScale.isInteger ? 3 :
                            ((numDomain[1] - numDomain[0]) % 3 === 0) ? 4 :
                                ((numDomain[1] - numDomain[0]) % 2 === 0) ? 3 : 2
                        );
                        var labels = splitEvenly(numDomain, labelsLength)
                            .reverse()
                            .map(function (x, i, list) {
                                var p = (i / (labelsLength - 1));
                                var vPad = 0.5 * ((i === 0) ?
                                        fontHeight :
                                        ((i === list.length - 1) ? (-fontHeight) : 0));
                                var y = (height * p) + vPad + fontHeight / 2;
                                return '<text x="25" y="' + y + '">' + castNum(x) + '</text>';
                            });

                        var title = ((guide.color || {}).label || {}).text || fillScale.dim;
                        var gradientId = 'legend-gradient-' + self.instanceId;

                        var gradient = [
                            '<svg height="' + height + '" width="100%" style="margin: 0 0 10px 10px">',
                            '   <defs>',
                            '       <linearGradient id="' + gradientId + '" x1="0%" y1="0%" x2="0%" y2="100%">',
                            stops.join(''),
                            '       </linearGradient>',
                            '   </defs>',
                            '   <rect x="0" y="0" height="100%" width="20" fill="url(#' + gradientId + ')"></rect>',
                            labels.join(''),
                            '   Sorry, your browser does not support inline SVG.',
                            '</svg>'
                        ].join('');

                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                name: title,
                                top: null,
                                items: gradient
                            }));
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
                            var steps = splitRealValuesEvenly(realValues, 5);

                            values = utils.unique(steps
                                .map(function (x) {
                                    return (Math.round(x * base) / base);
                                }));
                        }

                        self._container
                            .insertAdjacentHTML('beforeend', self._template({
                                name: title,
                                top: null,
                                items: values
                                    .map(function (value) {
                                        var diameter = sizeScale(value);
                                        return self._itemSizeTemplate({
                                            diameter: doEven(diameter + 2),
                                            radius: diameter / 2,
                                            value: value,
                                            className: firstNode.config.color ? 'color-definite' : 'color-default-size'
                                        });
                                    })
                                    .reverse()
                                    .join('')
                            }));
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
                                            cssColor: (colorScale.toColor(d.color)),
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

                if (mode === 'reset') {
                    colorNodes.forEach(function (node) {
                        toggleColor(node, true);
                    });
                } else if (mode === 'leave-others') {
                    colorNodes.forEach(function (node) {
                        if (isTarget(node)) {
                            toggleColor(node, isTargetHidden);
                        }
                    });
                } else if (mode === 'focus-single') {
                    var onlyTargetIsVisible = (!isTargetHidden && colorNodes.every(function (node) {
                        return (isTarget(node) || isColorHidden(getColorData(node).key));
                    }));
                    colorNodes.forEach(function (node) {
                        var show = (isTarget(node) || onlyTargetIsVisible);
                        toggleColor(node, show);
                    });
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

    return ChartLegend;
});
