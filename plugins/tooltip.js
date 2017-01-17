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

    var d3 = tauCharts.api.d3;
    var utils = tauCharts.api.utils;
    var pluginsSDK = tauCharts.api.pluginsSDK;
    var TARGET_SVG_CLASS = 'graphical-report__svg__tooltip-target';
    var TARGET_SVG_STUCK_CLASS = 'graphical-report__svg__tooltip-target-stuck';

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

        function getHighlightEvtObj(e, data) {
            var filter = function (row) {
                return (row === data ? true : null);
            };
            filter.domEvent = e;
            filter.data = data;
            return filter;
        }

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
                window.addEventListener('resize', this._scrollHandler, true);

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
                prev.highlight = prev.highlight || {data: null, node: null, cursor: null, unit: null, event: null};
                state.highlight = state.highlight || {data: null, node: null, cursor: null, unit: null, event: null};

                // If stuck, treat that data has not changed
                if (state.isStuck && prev.highlight.data) {
                    state.highlight = prev.highlight;
                }

                // Show/hide tooltip
                if (state.highlight.data !== prev.highlight.data) {
                    if (state.highlight.data) {
                        this.hideTooltip();
                        var showTooltip = function () {
                            this.showTooltip(
                                state.highlight.data,
                                state.highlight.cursor,
                                state.highlight.node
                            );
                        }.bind(this);
                        showTooltip();
                    } else if (!state.isStuck && prev.highlight.data && !state.highlight.data) {
                        this._removeFocus(prev.highlight.event, prev.highlight.unit);
                        this.hideTooltip();
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
                        (function fixFocusOut() {
                            // NOTE: `mouseout` still can fire after setting `pointer-events:none`
                            // so have to restore highlight on element.
                            var node = state.highlight.node;
                            var event = state.highlight.event;
                            var unit = state.highlight.unit;
                            var data = state.highlight.data;
                            var onNodeMouseOut = function () {
                                node.removeEventListener('mouseout', onNodeMouseOut);
                                this._accentFocus(event, unit, data);
                            }.bind(this);
                            node.addEventListener('mouseout', onNodeMouseOut);
                        }.bind(this))();
                        this._setTargetSvgStuckClass(true);
                        tooltipNode.classList.add('stuck');
                        this._tooltip.updateSize();
                    } else {
                        window.removeEventListener('click', this._outerClickHandler, true);
                        this._setTargetSvgStuckClass(false);
                        tooltipNode.classList.remove('stuck');
                    }
                }
            },

            showTooltip: function (data, cursor, node) {

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
                window.removeEventListener('resize', this._scrollHandler, true);
                this._setTargetSvgClass(false);
                if (this.state.highlight.unit) {
                    this._removeFocus(this.state.highlight.event, this.state.highlight.unit);
                }
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

                        node.on('highlight-data-points', function (sender, e) {
                            this.setState({
                                highlight: (e.data ? {
                                    data: e.data,
                                    cursor: {x: e.domEvent.clientX, y: e.domEvent.clientY},
                                    event: e,
                                    node: e.targetElements[0],
                                    unit: sender
                                } : null)
                            });
                        }.bind(this));

                        node.on('click-data-points', function (sender, e) {
                            this.setState(e.data ? {
                                highlight: {
                                    data: e.data,
                                    cursor: {x: e.domEvent.clientX, y: e.domEvent.clientY},
                                    event: e,
                                    node: e.targetElements[0],
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
                    label: label,
                    value: formattedValue
                });
            },

            _getFormat: function (k) {
                var meta = this._metaInfo[k] || {format: function (x) {
                    return x;
                }};
                return meta.format;
            },

            _getLabel: function (k) {
                var meta = this._metaInfo[k] || {label: k};
                return meta.label;
            },

            _removeFocus: function (e, unit) {
                unit.fire('highlight-data-points', getHighlightEvtObj(e, null));
            },

            _accentFocus: function (e, unit, data) {
                unit.fire('highlight-data-points', getHighlightEvtObj(e, data));
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
                this._setTargetSvgClass(true);
            },

            _setTargetSvgClass: function (isSet) {
                d3.select(this._chart.getSVG()).classed(TARGET_SVG_CLASS, isSet);
            },

            _setTargetSvgStuckClass: function (isSet) {
                d3.select(this._chart.getSVG()).classed(TARGET_SVG_STUCK_CLASS, isSet);
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