define(function (require) {
    var testUtils = require('testUtils');
    var expect = require('chai').expect;
    var tauChart = require('tau_modules/tau.newCharts');
    var UnitDomainMixin = require('tau_modules/unit-domain-mixin').UnitDomainMixin;
    var SpecEngineFactory = tauChart.__api__.SpecEngineFactory;

    describe("Spec engine factory", function () {

        var data = [
            { team: 'A',    count: '1',  date: new Date('2014-01-01T00:00:00+00:00') },
            { team: 'B',    count: '2',  date: new Date('2014-04-01T00:00:00+00:00') },
            { team: 'C',    count: '3',  date: new Date('2014-07-12T00:00:00+00:00') },
            { team: 'D',    count: '4',  date: new Date('2014-09-01T00:00:00+00:00') },
            { team: 'E',    count: '5',  date: new Date('2015-01-01T00:00:00+00:00') },
            { team: 'Long', count: '25', date: new Date('2015-04-01T00:00:00+00:00') }
        ];

        var spec = {
            "dimensions": {
                "team": {
                    "type": "order",
                    "scale": "ordinal"
                },
                "count": {
                    "type": "measure",
                    "scale": "linear"
                },
                "date": {
                    "type": "measure",
                    "scale": "time"
                }
            },
            "unit": {
                "type": "COORDS.RECT",
                "x": "team",
                "y": "count",
                "unit": [
                    {
                        "type": "ELEMENT.INTERVAL"
                    }
                ]
            }
        };

        var makeSpec = function(x, y) {

            var specClone = JSON.parse(JSON.stringify(spec));

            specClone.unit.x = x;
            specClone.unit.y = y;

            return specClone;
        };

        var measurer = testUtils.chartSettings;

        it("should support [DEFAULT] spec engine", function () {

            var spec = makeSpec('team', 'count');

            var meta = (new UnitDomainMixin(spec.dimensions, data)).mix({});

            var testSpecEngine = SpecEngineFactory.get("DEFAULT", measurer);

            var full = testSpecEngine(spec, meta);

            expect(full.unit.guide.padding.l).to.equal(0);
            expect(full.unit.guide.padding.b).to.equal(0);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(0);
            expect(x.cssClass).to.equal('x axis');
            expect(x.rotate).to.equal(0);
            expect(x.textAnchor).to.equal('middle');
            expect(x.tickFormat).to.equal(null);
            expect(x.label.text).to.equal('');
            expect(x.density).to.equal(30);
            expect(x.tickFontHeight).to.equal(10);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(0);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal(null);
            expect(y.label.text).to.equal('');
            expect(y.density).to.equal(30);
            expect(y.tickFontHeight).to.equal(10);
        });

        it("should support [AUTO] spec engine (category / measure)", function () {

            var spec = makeSpec('team', 'count');

            var meta = (new UnitDomainMixin(spec.dimensions, data)).mix({});

            var testSpecEngine = SpecEngineFactory.get("AUTO", measurer);

            var full = testSpecEngine(spec, meta);

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(20);
            expect(x.cssClass).to.equal('x axis');
            expect(x.rotate).to.equal(90);
            expect(x.textAnchor).to.equal('start');
            expect(x.tickFormat).to.equal(null);
            expect(x.label.text).to.equal('TEAM');
            expect(x.tickFontHeight).to.equal(10);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(20);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal('x-num-auto');
            expect(y.label.text).to.equal('COUNT');
            expect(y.tickFontHeight).to.equal(10);

            // 20 padding to X axis line
            // 9  tick mark size
            // 20 "Long" vertical string
            // 20 padding to X axis label
            // 15 width of label
            expect(full.unit.guide.padding.b).to.equal(84);

            // 20 padding to Y axis line
            // 9  tick mark size
            // 25 "25.00" string length
            // 20 padding to Y axis label
            // 15 width of label
            expect(full.unit.guide.padding.l).to.equal(89);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);
        });

        it("should support [AUTO] spec engine (measure / time)", function () {

            var spec = makeSpec('count', 'date');

            var meta = (new UnitDomainMixin(spec.dimensions, data)).mix({});

            var testSpecEngine = SpecEngineFactory.get("AUTO", measurer);

            var full = testSpecEngine(spec, meta);

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(20);
            expect(x.cssClass).to.equal('x axis');
            expect(x.rotate).to.equal(0);
            expect(x.textAnchor).to.equal('middle');
            expect(x.tickFormat).to.equal('x-num-auto');
            expect(x.label.text).to.equal('COUNT');
            expect(x.tickFontHeight).to.equal(10);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(20);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal('x-time-quarter');
            expect(y.label.text).to.equal('DATE');
            expect(y.tickFontHeight).to.equal(10);

            // 20 padding to X axis line
            // 9  tick mark size
            // 10 "25" string length
            // 20 padding to X axis label
            // 15 width of label
            expect(full.unit.guide.padding.b).to.equal(74);

            // 20 padding to Y axis line
            // 9  tick mark size
            // 35 "Q1 2014" (7 * 5) iso string width
            // 20 padding to Y axis label
            // 15 width of label
            expect(full.unit.guide.padding.l).to.equal(99);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);
        });

        it("should support [AUTO] spec engine (facet)", function () {

            var spec = {
                "dimensions": {
                    "team": {
                        "type": "order",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    },
                    "date": {
                        "type": "measure",
                        "scale": "time"
                    }
                },
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "team",
                    "y": null,
                    "unit": [
                        {
                            "type": "COORDS.RECT",
                            "x": "date",
                            "y": "count",
                            "unit": [
                                {
                                    "type": "ELEMENT.INTERVAL"
                                }
                            ]
                        }
                    ]
                }
            };

            var meta = (new UnitDomainMixin(spec.dimensions, data)).mix({});

            var testSpecEngine = SpecEngineFactory.get("AUTO", measurer);

            var full = testSpecEngine(spec, meta);

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(full.unit.guide.hasOwnProperty('showGridLines')).to.equal(false);

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(0);
            expect(x.cssClass).to.equal('x axis facet-axis');
            expect(x.rotate).to.equal(0);
            expect(x.textAnchor).to.equal('middle');
            expect(x.tickFormat).to.equal(null);
            expect(x.tickFormatNullAlias).to.equal('No team');
            expect(x.label.text).to.equal('TEAM > DATE');
            expect(x.tickFontHeight).to.equal(10);
            expect(x.density).to.equal(measurer.getAxisTickLabelSize('Long').width * measurer.xDensityKoeff);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(0);
            expect(y.cssClass).to.equal('y axis facet-axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal(null);
            expect(typeof y.tickFormatNullAlias).to.equal('undefined');
            expect(y.label.text).to.equal('');
            expect(y.tickFontHeight).to.equal(0);
            expect(y.density).to.equal(0); // empty axis

            // 20 padding to X axis line
            // 9  tick mark size
            // 10 "25" string length
            // 20 padding to X axis label
            // 15 width of label
            expect(full.unit.guide.padding.b).to.equal(54);

            // y is null axis
            expect(full.unit.guide.padding.l).to.equal(0);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);


            var part = full.unit.unit[0];
            var px = part.guide.x;
            var py = part.guide.y;

            expect(part.guide.showGridLines).to.equal('xy');

            expect(px.tickFormat).to.equal('x-time-quarter');
            expect(px.tickFormatNullAlias).to.equal('No date');
            expect(px.tickFontHeight).to.equal(10);
            expect(px.label.text).to.equal('');
            expect(px.density).to.equal(measurer.getAxisTickLabelSize('Q4 2014').width * measurer.xDensityKoeff);

            expect(py.tickFormat).to.equal('x-num-auto');
            expect(py.tickFormatNullAlias).to.equal('No count');
            expect(py.tickFontHeight).to.equal(10);
            expect(py.label.text).to.equal('COUNT');
            expect(py.density).to.equal(measurer.getAxisTickLabelSize('25').width * measurer.yDensityKoeff);


            var elem = part.unit[0];

            expect(elem.guide.x.tickFontHeight).to.equal(10);
            expect(elem.guide.y.tickFontHeight).to.equal(10);
        });

        it("should save user-defined guide within [AUTO] spec engine", function () {

            var spec = {
                "dimensions": {
                    "team": {
                        "type": "order",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    },
                    "date": {
                        "type": "measure",
                        "scale": "time"
                    }
                },
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "team",
                    "y": null,
                    "guide": {
                        showGridLines: 'x',
                        x: {
                            tickFormatNullAlias: '(NIL)'
                        }
                    },
                    "unit": [
                        {
                            "type": "COORDS.RECT",
                            "x": "date",
                            "y": "count",
                            "guide": { showGridLines: '' },
                            "unit": [
                                {
                                    "type": "ELEMENT.INTERVAL"
                                }
                            ]
                        }
                    ]
                }
            };

            var meta = (new UnitDomainMixin(spec.dimensions, data)).mix({});

            var testSpecEngine = SpecEngineFactory.get("AUTO", measurer);

            var full = testSpecEngine(spec, meta);
            var part = full.unit.unit[0];

            expect(full.unit.guide.x.tickFormatNullAlias).to.equal('(NIL)');
            expect(full.unit.guide.showGridLines).to.equal('x');
            expect(part.guide.showGridLines).to.equal('');
        });
    });
});