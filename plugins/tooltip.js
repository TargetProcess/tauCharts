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

    var utils = tauCharts.api.utils;
    var pluginsSDK = tauCharts.api.pluginsSDK;

    function Tooltip(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                // add default settings here
                fields: null,
                showTimeout: 250,
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

                this._tooltip = this._chart.addBalloon(
                    {
                        spacing: 3,
                        auto: true,
                        effectClass: 'fade'
                    });

                var revealAggregationBtn = ((settings.aggregationGroupFields.length > 0) ?
                        (this.templateRevealAggregation) :
                        ('')
                );

                var template = utils.template(this.template);

                this._tooltip
                    .content(template({
                        revealTemplate: revealAggregationBtn,
                        excludeTemplate: this.templateExclude
                    }));

                this._tooltip
                    .getElement()
                    .addEventListener('click', function (e) {

                        var target = e.target;

                        while (target !== e.currentTarget && target !== null) {
                            if (target.classList.contains('i-role-exclude')) {
                                this._exclude();
                            }

                            if (target.classList.contains('i-role-reveal')) {
                                this._reveal();
                            }

                            target = target.parentNode;
                        }

                        this._removeFocus();
                        this.setState({
                            highlight: null,
                            isStuck: false
                        });

                    }.bind(this), false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseover', function (e) {
                        this._accentFocus(e);
                    }.bind(this), false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseleave', function (e) {
                        this.setState({
                            highlight: null,
                            isStuck: false
                        });
                        this._removeFocus();
                    }.bind(this), false);

                this._scrollHandler = function () {
                    this.setState({
                        highlight: null,
                        isStuck: false
                    });
                }.bind(this);
                window.addEventListener('scroll', this._scrollHandler, true);

                // Handle initial state
                this._timeoutShow = null;
                this.setState(this.state);

                this.afterInit(this._tooltip.getElement());
            },

            state: {
                highlight: null,
                isStuck: false
            },

            setState: function (newState) {
                var prev = this.state;
                var state = this.state = Object.assign({}, prev, newState);
                prev.highlight = prev.highlight || {data: null, node: null, cursor: null, unit: null};
                state.highlight = state.highlight || {data: null, node: null, cursor: null, unit: null};
                if (state.isStuck && prev.highlight.data) {
                    state.highlight = prev.highlight;
                }

                if (state.highlight.data !== prev.highlight.data) {
                    clearTimeout(this._timeoutShow);
                    if (state.highlight.data) {
                        this.hideTooltip();
                        var showTooltip = function () {
                            this.showTooltip(
                                state.highlight.data,
                                state.highlight.cursor,
                                state.highlight.node
                            );
                        }.bind(this);
                        if (settings.showTimeout > 0) {
                            this._timeoutShow = setTimeout(showTooltip, settings.showTimeout);
                        } else {
                            showTooltip();
                        }
                    } else if (!state.isStuck) {
                        this.hideTooltip();
                    }
                }

                var tooltipNode = this._tooltip.getElement();
                if (state.isStuck) {
                    tooltipNode.classList.add('stuck');
                    tooltipNode.style.pointerEvents = null;
                } else {
                    tooltipNode.classList.remove('stuck');
                    tooltipNode.style.pointerEvents = 'none';
                }
            },

            showTooltip: function (data, cursor, node) {

                var content = this._tooltip.getElement().querySelectorAll('.i-role-content')[0];
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
                    .position(node)
                    .show()
                    .updateSize();
            },

            hideTooltip: function (e) {
                clearTimeout(this._timeoutShow);
                this._tooltip.hide();
            },

            destroy: function () {
                this._removeFocus();
                this._tooltip.destroy();
                clearTimeout(this._timeoutShow);
                window.removeEventListener('scroll', this._scrollHandler, true);
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

            _removeFocus: function (e) {
                if (this.state.highlight.unit) {
                    this.state.highlight.unit.fire(
                        'highlight-data-points',
                        getHighlightEvtObj(e, null)
                    );
                }
            },

            _accentFocus: function (e) {
                if (this.state.highlight.unit) {
                    this.state.highlight.unit.fire(
                        'highlight-data-points',
                        getHighlightEvtObj(e, this.state.highlight.data)
                    );
                }
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