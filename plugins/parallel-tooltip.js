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

    function ChartParallelTooltip(xSettings) {

        var settings = _.defaults(
            xSettings || {},
            {
                // add default settings here
            });

        var plugin = {

            init: function (chart) {

                this._cursor;
                this._chart = chart;
                this._tooltip = chart.addBalloon(
                    {
                        spacing: 3,
                        auto: true,
                        effectClass: 'fade'
                    });

                this._tooltip
                    .getElement()
                    .insertAdjacentHTML('afterbegin', this.template);

                this._tooltip
                    .getElement()
                    .addEventListener('click', function (e) {
                        var target = e.target;
                        while (target !== e.currentTarget && target !== null) {
                            if (target.classList.contains('i-role-exclude')) {
                                this._exclude();
                            }
                            target = target.parentNode;
                        }

                        this._hide();

                    }.bind(this), false);
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

            _hide: function () {
                this._tooltip.hide();
            },

            onRender: function (chart) {

                var self = this;

                chart
                    .select(function (node) {
                        return node.config.type.indexOf('PARALLEL/ELEMENT.LINE') >= 0;
                    })
                    .map(function (node) {
                        node.on('click', function (sender, e) {

                            self._cursor = e.data;

                            var content = self._tooltip.getElement().querySelectorAll('.i-role-content');
                            if (content[0]) {
                                content[0].innerHTML = Object
                                    .keys(e.data)
                                    .map(function (k) {
                                        return _.template(self.itemTemplate)({label: k, value: e.data[k]});
                                    })
                                    .join('');
                            }

                            self._tooltip
                                .show(e.event.x, e.event.y)
                                .updateSize();
                        });
                        return node;
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

            itemTemplate: [
                '<div class="graphical-report__tooltip__list__item">',
                '<div class="graphical-report__tooltip__list__elem"><%=label%></div>',
                '<div class="graphical-report__tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join('')
        };

        return plugin;
    }

    tauCharts.api.plugins.add('parallel-tooltip', ChartParallelTooltip);

    return ChartParallelTooltip;
});