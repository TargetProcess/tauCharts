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
                fields: null
            });

        var plugin = {

            init: function (chart) {

                this._cursor = null;
                this._chart = chart;

                this._metaInfo = this._getFormatters();

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
                this.showTooltip = function (e) {

                    clearTimeout(timeoutHide);

                    self._cursor = e.data;

                    var content = self._tooltip.getElement().querySelectorAll('.i-role-content');
                    if (content[0]) {

                        var fields = (
                            settings.fields
                            ||
                            (_.isFunction(settings.getFields) && settings.getFields(self._chart))
                            ||
                            Object.keys(e.data)
                        );

                        content[0].innerHTML = fields
                            .filter(function (k) {
                                return self._metaInfo[k];
                            })
                            .map(function (k) {
                                return self.itemTemplate({
                                    label: self._metaInfo[k].label,
                                    value: self._metaInfo[k].format(e.data[k])
                                });
                            })
                            .join('');
                    }

                    self._tooltip
                        .show(e.event.pageX, e.event.pageY)
                        .updateSize();
                };

                this.hideTooltip = function (e) {
                    timeoutHide = setTimeout(
                        function () {
                            self._tooltip.hide();
                        },
                        300);
                };

                this._tooltip
                    .getElement()
                    .addEventListener('mouseover', function (e) {
                        clearTimeout(timeoutHide);
                    }, false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseleave', function (e) {
                        self._tooltip.hide();
                    }, false);
            },

            destroy: function () {
                if (this.circle) {
                    this.circle.remove();
                }
                this._tooltip.destroy();
            },

            _exclude: function () {
                this._chart
                    .addFilter({
                        tag: 'exclude',
                        predicate: (function (element) {
                            return function (row) {
                                return JSON.stringify(row) !== JSON.stringify(element);
                            };
                        }(this._cursor))
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
                        return true;
                    })
                    .forEach(function (node) {

                        node.on('mouseout', function (sender, e) {
                            self.hideTooltip(e);
                        });

                        node.on('mouseover', function (sender, e) {
                            self.showTooltip(e);
                        });
                    });
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

                return Object
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

                            delete memo[k];
                        }

                        return memo;
                    }, summary);
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('tooltip', Tooltip);

    return Tooltip;
});