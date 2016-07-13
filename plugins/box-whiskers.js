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

    function boxWhiskersPlot(xSettings) {

        return {

            init: function (chart) {
                this._chart = chart;
            },

            onSpecReady: function (chart, specRef) {

                chart.traverseSpec(
                    specRef,
                    function (unit, parentUnit) {

                        if (unit.type !== 'ELEMENT.INTERVAL') {
                            return;
                        }

                        unit.transformModel = [
                            function (model) {
                                var sy = model.scaleY;
                                return {
                                    y0: function (row) {
                                        return sy(row[xSettings.low]);
                                    }
                                };
                            }
                        ];

                        var minMaxBar = JSON.parse(JSON.stringify(unit));

                        minMaxBar.type = 'ELEMENT.INTERVAL';
                        minMaxBar.transformModel = [
                            function (model) {
                                var sy = model.scaleY;
                                return {
                                    yi: function (row) {
                                        return sy(row[xSettings.max]);
                                    },
                                    y0: function (row) {
                                        return sy(row[xSettings.min]);
                                    },
                                    size: function () {
                                        return 2;
                                    }
                                };
                            }
                        ];

                        parentUnit.units.push(minMaxBar);

                        var meanLevel = JSON.parse(JSON.stringify(unit));

                        meanLevel.type = 'ELEMENT.POINT';
                        meanLevel.transformModel = [
                            function (model) {
                                var sy = model.scaleY;
                                return {
                                    yi: function (row) {
                                        return sy(row[xSettings.mean]);
                                    },
                                    size: function () {
                                        return 4;
                                    },
                                    color: function (row) {
                                        return '#FF00FF';
                                    },
                                    label: function (row) {
                                        return Math.round(row[xSettings.mean]);
                                    }
                                };
                            }
                        ];

                        parentUnit.units.push(meanLevel);
                    });
            }
        };
    }

    tauCharts.api.plugins.add('box-whiskers', boxWhiskersPlot);

    return boxWhiskersPlot;
});
