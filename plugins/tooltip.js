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
                        content[0].innerHTML = Object
                            .keys(e.data)
                            .map(function (k) {
                                return self.itemTemplate({label: k, value: e.data[k]});
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
                        1000);
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

                this._formats = this._getFormatters();

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
                    var GUIDE = config.guide;
                    var scale = specScales[config[key]];
                    var guide = GUIDE[key] || {};
                    memoRef[scale.dim] = memoRef[scale.dim] || {label: [], format: [], nullAlias:[]};
                    memoRef[scale.dim].label.push((guide.label || {}).text);
                    memoRef[scale.dim].format.push(guide.tickFormat);
                    memoRef[scale.dim].nullAlias.push(guide.tickFormatNullAlias);
                };

                return this._chart
                    .select(function () {
                        return true;
                    })
                    .map(function (node) {
                        return node.config;
                    })
                    .reduce(function (memo, config) {

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
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('tooltip', Tooltip);

    return Tooltip;
});