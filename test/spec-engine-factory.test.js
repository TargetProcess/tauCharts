define(function (require) {
    var expect = require('chai').expect;
    var tauChart = require('tau_modules/tau.newCharts').tauChart;
    var specEngine = tauChart.__api__.SpecEngineFactory;

    describe("Spec engine factory", function () {

        beforeEach(function () {});

        it("should support default spec engine", function () {
            var defaultSpecEngine = specEngine.get();

            var full = defaultSpecEngine({
                "dimensions": {
                    "team": {
                        "type": "order",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    }
                },
                "unit": {
                    "type": "COORDS.RECT",
                    "guide": {
                        "padding": {
                            "l": 40,
                            "b": 20
                        }
                    },
                    "x": "xdate",
                    "y": "count",
                    "unit": [
                        {
                            "type": "ELEMENT.INTERVAL"
                        }
                    ]
                }
            });

            expect(full.unit.guide.padding.l).to.equal(40);
            expect(full.unit.guide.padding.b).to.equal(20);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);
        });
    });
});