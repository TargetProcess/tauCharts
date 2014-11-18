define(function (require) {
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

        var measurer = {
            getAxisTickLabelSize: function(text) {
                return {
                    width: text.length * 5,
                    height: 10
                };
            },
            axisTickLabelLimit: 100,
            xTickWidth: 9, // 6px tick mark + 3px margin to tick text
            distToXAxisLabel: 20,
            distToYAxisLabel: 20,
            xAxisPadding: 20,
            yAxisPadding: 20,
            xFontLabelHeight: 15,
            yFontLabelHeight: 15,
            densityKoeff: 2.2,
            defaultFormats: {
                'measure': 'x-num-auto',
                'measure:time': 'x-time-auto',
                'measure:time:year': 'x-time-year',
                'measure:time:quarter': 'x-time-quarter',
                'measure:time:month': 'x-time-month',
                'measure:time:week': 'x-time-week',
                'measure:time:day': 'x-time-day',
                'measure:time:hour': 'x-time-hour',
                'measure:time:min': 'x-time-min',
                'measure:time:sec': 'x-time-sec',
                'measure:time:ms': 'x-time-ms'
            }
        };

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

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(0);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal(null);
            expect(y.label.text).to.equal('');
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

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(20);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal('x-num-auto');
            expect(y.label.text).to.equal('COUNT');

            // 20 padding to X axis line
            // 9  tick mark size
            // 20 "Long" vertical string
            // 20 padding to X axis label
            // 15 width of label
            expect(full.unit.guide.padding.b).to.equal(84);

            // 20 padding to Y axis line
            // 9  tick mark size
            // 10 "25" string length
            // 20 padding to Y axis label
            // 15 width of label
            expect(full.unit.guide.padding.l).to.equal(74);
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

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(20);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal('x-time-quarter');
            expect(y.label.text).to.equal('DATE');

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
    });
});