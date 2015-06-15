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

    function ChartGeoMapTooltip(xSettings) {

        var settings = _.defaults(
            xSettings || {},
            {
                // add default settings here
            });

        var falsyFilter = function () {
            return false;
        };

        var equalFilter = function (data) {
            var str = JSON.stringify(data);
            return function (row) {
                return JSON.stringify(row) === str;
            };
        };

        var plugin = {

            init: function (chart) {

                this._cursor = null;
                this._chart = chart;
                this._tooltip = chart.addBalloon(
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
                                self._tooltip.hide();
                                if (self._current) {
                                    self._current.fire('highlight-area', falsyFilter);
                                }
                            }
                            target = target.parentNode;
                        }
                    }, false);

                var self = this;
                var timeoutHide;
                this.showTooltip = function (e) {

                    clearTimeout(timeoutHide);

                    self._cursor = e.data;

                    var message = 'No data';
                    if (e.data !== null) {
                        message = Object
                            .keys(e.data)
                            .map(function (k) {
                                return self.itemTemplate({label: k, value: e.data[k]});
                            })
                            .join('');
                    }
                    var content = self._tooltip.getElement().querySelectorAll('.i-role-content');
                    if (content[0]) {
                        content[0].innerHTML = message;
                    }

                    var exclude = self._tooltip.getElement().querySelectorAll('.i-role-exclude');
                    if (exclude[0]) {
                        exclude[0].style.visibility = e.data ? 'visible' : 'hidden';
                    }

                    self._tooltip
                        .show(e.event.pageX, e.event.pageY)
                        .updateSize();
                };

                this.hideTooltip = function (immediately) {
                    timeoutHide = setTimeout(
                        function () {
                            self._tooltip.hide();
                        },
                        immediately ? 0 : 1000);
                };

                this._tooltip
                    .getElement()
                    .addEventListener('mouseover', function (e) {
                        clearTimeout(timeoutHide);
                    }, false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseleave', function (e) {
                        self.hideTooltip(true);
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
            },

            onRender: function (chart) {

                var self = this;

                chart
                    .select(function (node) {
                        return node.config.type === 'COORDS.MAP';
                    })
                    .forEach(function (node) {

                        var isCodeEmpty = !node.codeScale.dim;
                        if (!isCodeEmpty) {
                            node.on('area-click', function (sender, e) {

                                self._current = sender;

                                if (!e.data) {
                                    node.fire('highlight-area', falsyFilter);
                                    self.showTooltip(e);
                                    self.hideTooltip(false);
                                } else if (self._cursor === e.data) {
                                    node.fire('highlight-area', falsyFilter);
                                    self.hideTooltip(true);
                                    self._cursor = null;
                                } else {
                                    node.fire('highlight-area', equalFilter(e.data));
                                    self.showTooltip(e);
                                }
                            });
                        }

                        node.on('point-mouseover', function (sender, e) {
                            self.showTooltip(e);
                        });

                        node.on('point-mouseout', function (sender, e) {
                            self.hideTooltip();
                        });
                    });
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
            ].join(''))
        };

        return plugin;
    }

    tauCharts.api.plugins.add('geomap-tooltip', ChartGeoMapTooltip);

    return ChartGeoMapTooltip;
});