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
    var TARGET_SVG_CLASS = 'graphical-report__tooltip-target';

    var escapeHtml = function (x) {
        return String(x)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    function Tooltip(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                // add default settings here
                fields: null,
                formatters: {},
                dockToData: false,
                aggregationGroupFields: [],
                onRevealAggregation: function (filters, row) {
                    console.log(
                        'Setup [onRevealAggregation] callback and filter original data by the following criteria: ',
                        JSON.stringify(filters, null, 2));
                }
            });

        var plugin = {

            init: function (chart) {

                this._chart = chart;
                this._metaInfo = {};
                this._skipInfo = {};

                // NOTE: for compatibility with old Tooltip implementation.
                Object.assign(this, utils.omit(settings, 'fields', 'getFields'));

                this._tooltip = this._chart.addBalloon(
                    {
                        spacing: 24,
                        auto: true,
                        effectClass: 'fade'
                    });

                var revealAggregationBtn = ((settings.aggregationGroupFields.length > 0) ?
                        (this.templateRevealAggregation) :
                        ('')
                );

                var template = utils.template(this.template);
                var tooltipNode = this.getTooltipNode();

                this._tooltip
                    .content(template({
                        revealTemplate: revealAggregationBtn,
                        excludeTemplate: this.templateExclude
                    }));

                tooltipNode
                    .addEventListener('click', function (e) {

                        var target = e.target;

                        while (target !== e.currentTarget && target !== null) {
                            if (target.classList.contains('i-role-exclude')) {
                                this._exclude();
                                this.setState({
                                    highlight: null,
                                    isStuck: false
                                });
                            }

                            if (target.classList.contains('i-role-reveal')) {
                                this._reveal();
                                this.setState({
                                    highlight: null,
                                    isStuck: false
                                });
                            }

                            target = target.parentNode;
                        }

                    }.bind(this), false);

                this._scrollHandler = function () {
                    this.setState({
                        highlight: null,
                        isStuck: false
                    });
                }.bind(this);
                window.addEventListener('scroll', this._scrollHandler, true);

                this._outerClickHandler = function (e) {
                    var tooltipRect = this.getTooltipNode().getBoundingClientRect();
                    if ((e.clientX < tooltipRect.left) ||
                        (e.clientX > tooltipRect.right) ||
                        (e.clientY < tooltipRect.top) ||
                        (e.clientY > tooltipRect.bottom)
                    ) {
                        this.setState({
                            highlight: null,
                            isStuck: false
                        });
                    }
                }.bind(this);

                // Handle initial state
                this.setState(this.state);

                this.afterInit(tooltipNode);
            },

            getTooltipNode: function () {
                return this._tooltip.getElement();
            },

            state: {
                highlight: null,
                isStuck: false
            },

            setState: function (newState) {
                var prev = this.state;
                var state = this.state = Object.assign({}, prev, newState);
                prev.highlight = prev.highlight || {data: null, cursor: null, unit: null};
                state.highlight = state.highlight || {data: null, cursor: null, unit: null};

                // If stuck, treat that data has not changed
                if (state.isStuck && prev.highlight.data) {
                    state.highlight = prev.highlight;
                }

                // Show/hide tooltip
                if (state.highlight.data !== prev.highlight.data) {
                    if (state.highlight.data) {
                        this.hideTooltip();
                        this.showTooltip(
                            state.highlight.data,
                            state.highlight.cursor
                        );
                        this._setTargetSvgClass(true);
                        requestAnimationFrame(function () {
                            this._setTargetSvgClass(true);
                        }.bind(this));
                    } else if (!state.isStuck && prev.highlight.data && !state.highlight.data) {
                        this._removeFocus();
                        this.hideTooltip();
                        this._setTargetSvgClass(false);
                    }
                }

                // Update tooltip position
                if (state.highlight.data && (
                    !prev.highlight.cursor ||
                    state.highlight.cursor.x !== prev.highlight.cursor.x ||
                    state.highlight.cursor.y !== prev.highlight.cursor.y
                )) {
                    this._tooltip.position(state.highlight.cursor.x, state.highlight.cursor.y);
                }

                // Stick/unstick tooltip
                var tooltipNode = this.getTooltipNode();
                if (state.isStuck !== prev.isStuck) {
                    if (state.isStuck) {
                        window.addEventListener('click', this._outerClickHandler, true);
                        tooltipNode.classList.add('stuck');
                        this._setTargetEventsEnabled(false);
                        this._accentFocus(state.highlight.data);
                        this._tooltip.updateSize();
                    } else {
                        window.removeEventListener('click', this._outerClickHandler, true);
                        tooltipNode.classList.remove('stuck');
                        // NOTE: Prevent showing tooltip immediately
                        // after pointer events appear.
                        requestAnimationFrame(function () {
                            this._setTargetEventsEnabled(true);
                        }.bind(this));
                    }
                }
            },

            showTooltip: function (data, cursor) {

                var content = this.getTooltipNode().querySelectorAll('.i-role-content')[0];
                if (content) {
                    var fields = (
                        settings.fields
                        ||
                        ((typeof settings.getFields === 'function') && settings.getFields(this._chart))
                        ||
                        Object.keys(data)
                    );
                    content.innerHTML = this.render(data, fields);
                }

                this._tooltip
                    .position(cursor.x, cursor.y)
                    .place('bottom-right')
                    .show()
                    .updateSize();
            },

            hideTooltip: function (e) {
                window.removeEventListener('click', this._outerClickHandler, true);
                this._tooltip.hide();
            },

            destroy: function () {
                window.removeEventListener('scroll', this._scrollHandler, true);
                this._setTargetSvgClass(false);
                this.setState({
                    highlight: null,
                    isStuck: false
                });
                this._tooltip.destroy();
            },

            _subscribeToHover: function () {

                var elementsToMatch = [
                    'ELEMENT.LINE',
                    'ELEMENT.AREA',
                    'ELEMENT.PATH',
                    'ELEMENT.INTERVAL',
                    'ELEMENT.INTERVAL.STACKED',
                    'ELEMENT.POINT'
                ];

                this._chart
                    .select(function (node) {
                        return (elementsToMatch.indexOf(node.config.type) >= 0);
                    })
                    .forEach(function (node) {

                        node.on('data-hover', function (sender, e) {
                            var bodyRect = document.body.getBoundingClientRect();
                            this.setState({
                                highlight: (e.data ? {
                                    data: e.data,
                                    cursor: {
                                        x: (e.event.clientX - bodyRect.left),
                                        y: (e.event.clientY - bodyRect.top)
                                    },
                                    unit: sender
                                } : null)
                            });
                        }.bind(this));

                        node.on('data-click', function (sender, e) {
                            var bodyRect = document.body.getBoundingClientRect();
                            this.setState(e.data ? {
                                highlight: {
                                    data: e.data,
                                    cursor: {
                                        x: (e.event.clientX - bodyRect.left),
                                        y: (e.event.clientY - bodyRect.top)
                                    },
                                    unit: sender
                                },
                                isStuck: true
                            } : {
                                    highlight: null,
                                    isStuck: null
                                });
                        }.bind(this));
                    }, this);
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
                    label: escapeHtml(label),
                    value: escapeHtml(formattedValue)
                });
            },

            _getFormat: function (k) {
                var meta = this._metaInfo[k] || {format: function (x) {
                    return String(x);
                }};
                return meta.format;
            },

            _getLabel: function (k) {
                var meta = this._metaInfo[k] || {label: k};
                return meta.label;
            },

            _accentFocus: function (data) {
                var filter = function (d) {
                    return (d === data);
                };
                this._chart
                    .select(function () {
                        return true;
                    }).forEach(function (unit) {
                        unit.fire('highlight', filter);
                    });
            },

            _removeFocus: function () {
                var filter = function () {
                    return null;
                };
                this._chart
                    .select(function () {
                        return true;
                    }).forEach(function (unit) {
                        unit.fire('highlight', filter);
                        unit.fire('highlight-data-points', filter);
                    });
            },

            _reveal: function () {
                var aggregatedRow = this.state.highlight.data;
                var groupFields = (settings.aggregationGroupFields || []);
                var descFilters = groupFields.reduce(function (memo, k) {
                    if (aggregatedRow.hasOwnProperty(k)) {
                        memo[k] = aggregatedRow[k];
                    }
                    return memo;
                }, {});

                settings.onRevealAggregation(descFilters, aggregatedRow);
            },

            _exclude: function () {
                this._chart
                    .addFilter({
                        tag: 'exclude',
                        predicate: (function (element) {
                            return function (row) {
                                return JSON.stringify(row) !== JSON.stringify(element);
                            };
                        }(this.state.highlight.data))
                    });
                this._chart.refresh();
            },

            onRender: function () {

                var info = this._getFormatters();
                this._metaInfo = info.meta;
                this._skipInfo = info.skip;

                this._subscribeToHover();

                this.setState({
                    highlight: null,
                    isStuck: false
                });
            },

            _setTargetSvgClass: function (isSet) {
                d3.select(this._chart.getSVG()).classed(TARGET_SVG_CLASS, isSet);
            },

            _setTargetEventsEnabled: function (isSet) {
                if (isSet) {
                    this._chart.enablePointerEvents();
                } else {
                    this._chart.disablePointerEvents();
                }
            },

            templateRevealAggregation: [
                '<div class="i-role-reveal graphical-report__tooltip__vertical">',
                '   <div class="graphical-report__tooltip__vertical__wrap">',
                '       Reveal',
                '   </div>',
                '</div>'
            ].join(''),

            templateExclude: [
                '<div class="i-role-exclude graphical-report__tooltip__exclude">',
                '   <div class="graphical-report__tooltip__exclude__wrap">',
                '       <span class="tau-icon-close-gray"></span>',
                '       Exclude',
                '   </div>',
                '</div>'
            ].join(''),

            template: [
                '<div class="i-role-content graphical-report__tooltip__content"></div>',
                '<%= revealTemplate %>',
                '<%= excludeTemplate %>'
            ].join(''),

            itemTemplate: utils.template([
                '<div class="graphical-report__tooltip__list__item">',
                '<div class="graphical-report__tooltip__list__elem"><%=label%></div>',
                '<div class="graphical-report__tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join('')),

            _getFormatters: function () {

                var info = pluginsSDK.extractFieldsFormatInfo(this._chart.getSpec());
                var skip = {};
                Object.keys(info).forEach(function (k) {

                    if (info[k].isComplexField) {
                        skip[k] = true;
                    }

                    if (info[k].parentField) {
                        delete info[k];
                    }
                });

                var toLabelValuePair = function (x) {

                    var res = {};

                    if (typeof x === 'function' || typeof x === 'string') {
                        res = {format: x};
                    } else if (utils.isObject(x)) {
                        res = utils.pick(x, 'label', 'format', 'nullAlias');
                    }

                    return res;
                };

                Object.keys(settings.formatters).forEach(function (k) {

                    var fmt = toLabelValuePair(settings.formatters[k]);

                    info[k] = Object.assign(
                        ({label: k, nullAlias: ('No ' + k)}),
                        (info[k] || {}),
                        (utils.pick(fmt, 'label', 'nullAlias')));

                    if (fmt.hasOwnProperty('format')) {
                        info[k].format = (typeof fmt.format === 'function') ?
                            (fmt.format) :
                            (tauCharts.api.tickFormat.get(fmt.format, info[k].nullAlias));
                    } else {
                        info[k].format = (info[k].hasOwnProperty('format')) ?
                            (info[k].format) :
                            (tauCharts.api.tickFormat.get(null, info[k].nullAlias));
                    }
                });

                return {
                    meta: info,
                    skip: skip
                };
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('tooltip', Tooltip);

    return Tooltip;
});