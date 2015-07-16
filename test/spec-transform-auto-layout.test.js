define(function (require) {
    var testUtils = require('testUtils');
    var expect = require('chai').expect;
    var SpecAutoLayout = require('src/spec-transform-auto-layout').SpecTransformAutoLayout;
    var SpecConverter = require('src/spec-converter').SpecConverter;
    var tauCharts = require('src/tau.charts');
    var scalesRegistry = tauCharts.api.scalesRegistry;
    var ScalesFactory = require('src/scales-factory').ScalesFactory;

    describe('Spec engine factory', function () {

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

        var makeSpec = function (x, y, specEngineName) {

            var specClone = JSON.parse(JSON.stringify(spec));

            specClone.unit.x = x;
            specClone.unit.y = y;

            var specGPL = new SpecConverter({spec: specClone, data: data}).convert();

            specGPL.settings = specGPL.settings || testUtils.chartSettings;
            specGPL.settings.fitSize = false;
            specGPL.settings.size = {width: 100, height: 100};
            specGPL.settings.specEngine = [
                {
                    width: 100000,
                    name: specEngineName
                }
            ];

            return specGPL;
        };

        var chartAPI = function (spec) {

            var factory = new ScalesFactory(scalesRegistry, spec.sources, spec.scales);

            return {
                getScaleInfo(name, frame) {
                    return factory.createScaleByName(name, frame);
                }
            };
        };

        var convSpec = function (spec, specEngineName) {

            var specClone = JSON.parse(JSON.stringify(spec));

            var specGPL = new SpecConverter({spec: specClone, data: data}).convert();

            specGPL.settings = specGPL.settings || testUtils.chartSettings;
            specGPL.settings.fitSize = false;
            specGPL.settings.size = {width: 100, height: 100};
            specGPL.settings.specEngine = [
                {
                    width: 100000,
                    name: specEngineName
                }
            ];

            return specGPL;
        };

        it('should support [DEFAULT] spec engine', function () {

            var spec = makeSpec('team', 'count', 'DEFAULT');

            var testSpecEngine = new SpecAutoLayout(spec);

            var full = testSpecEngine.transform(chartAPI(spec));

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
            expect(x.tickFormatWordWrapLimit).to.equal(100);

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
            expect(y.tickFormatWordWrapLimit).to.equal(100);
        });

        it('should support [AUTO] spec engine (category / measure)', function () {

            var spec = makeSpec('team', 'count', 'AUTO');

            var testSpecEngine = new SpecAutoLayout(spec);

            var full = testSpecEngine.transform(chartAPI(spec));

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(20);
            expect(x.cssClass).to.equal('x axis');
            expect(x.rotate).to.equal(90);
            expect(x.textAnchor).to.equal('start');
            expect(x.tickFormat).to.equal(null);
            expect(x.label.text).to.equal('team');
            expect(x.tickFontHeight).to.equal(10);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(20);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal('x-num-auto');
            expect(y.label.text).to.equal('count');
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
            expect(full.unit.guide.padding.l).to.equal(94);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);
        });

        it('should support [AUTO] spec engine (measure / time)', function () {

            var spec = makeSpec('count', 'date', 'AUTO');

            var testSpecEngine = new SpecAutoLayout(spec);

            var full = testSpecEngine.transform(chartAPI(spec));

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(20);
            expect(x.cssClass).to.equal('x axis');
            expect(x.rotate).to.equal(0);
            expect(x.textAnchor).to.equal('middle');
            expect(x.tickFormat).to.equal('x-num-auto');
            expect(x.label.text).to.equal('count');
            expect(x.tickFontHeight).to.equal(10);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(20);
            expect(y.cssClass).to.equal('y axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal('x-time-auto');
            expect(y.label.text).to.equal('date');
            expect(y.tickFontHeight).to.equal(10);

            // 20 padding to X axis line
            // 9  tick mark size
            // 10 "25" string length
            // 20 padding to X axis label
            // 15 width of label
            expect(full.unit.guide.padding.b).to.equal(74);

            // 20 padding to Y axis line
            // 9  tick mark size
            // 35 "January" (7 * 5) iso string width
            // 20 padding to Y axis label
            // 15 width of label
            expect(full.unit.guide.padding.l).to.equal(126.5);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);
        });

        it('should support [AUTO] spec engine (facet)', function () {

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

            var fullSpec = convSpec(spec, 'AUTO');
            var testSpecEngine = new SpecAutoLayout(fullSpec);
            var full = testSpecEngine.transform(chartAPI(fullSpec));
            var measurer = full.settings;

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(full.unit.guide.showGridLines).to.equal('');

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(0);
            expect(x.cssClass).to.equal('x axis facet-axis');
            expect(x.avoidCollisions).to.equal(true);
            expect(x.rotate).to.equal(0);
            expect(x.textAnchor).to.equal('middle');
            expect(x.tickFormat).to.equal(null);

            expect(x.tickFormatNullAlias).to.equal('No team');
            expect(x.label.text).to.equal('team > date');
            expect(x.tickFontHeight).to.equal(10);
            expect(x.density).to.equal(measurer.getAxisTickLabelSize('Long').width + measurer.xDensityPadding * 2);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(0);
            expect(y.cssClass).to.equal('y axis facet-axis');
            expect(y.rotate).to.equal(0);
            expect(y.textAnchor).to.equal('end');
            expect(y.tickFormat).to.equal(null);
            expect(typeof y.tickFormatNullAlias).to.equal('undefined');
            // expect(y.label.text).to.equal('');
            expect(y.label.text).to.equal('count');
            // expect(y.tickFontHeight).to.equal(0);
            expect(y.tickFontHeight).to.equal(10);
            expect(y.density).to.equal(0 + measurer.yDensityPadding * 2); // empty axis

            // 20 padding to X axis line
            // 9  tick mark size
            // 10 "25" string length
            // 20 padding to X axis label
            // 15 width of label
            expect(full.unit.guide.padding.b).to.equal(54);

            // y is null axis
            // expect(full.unit.guide.padding.l).to.equal(0);
            expect(full.unit.guide.padding.l).to.equal(44);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);

            var part = full.unit.units[0];
            var px = part.guide.x;
            var py = part.guide.y;

            expect(part.guide.showGridLines).to.equal('xy');

            expect(px.tickFormat).to.equal('x-time-auto');
            expect(px.tickFormatNullAlias).to.equal('No date');
            expect(px.tickFontHeight).to.equal(10);
            expect(px.label.text).to.equal('');
            expect(px.density).to.be.above(measurer.getAxisTickLabelSize('October 2014').width + measurer['xDensityPadding:measure'] * 2);

            expect(py.tickFormat).to.equal('x-num-auto');
            expect(py.tickFormatNullAlias).to.equal('No count');
            expect(py.tickFontHeight).to.equal(10);
            // expect(py.label.text).to.equal('count');
            expect(py.label.text).to.equal('');
            expect(py.density).to.equal(measurer.getAxisTickLabelSize('25').width + measurer['yDensityPadding:measure'] * 2);

            var elem = part.units[0];

            expect(elem.guide.x.tickFontHeight).to.equal(10);
            expect(elem.guide.y.tickFontHeight).to.equal(10);
        });

        it('should save user-defined guide within [AUTO] spec engine', function () {

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

            var fullSpec = convSpec(spec, 'AUTO');
            var testSpecEngine = new SpecAutoLayout(fullSpec);
            var full = testSpecEngine.transform(chartAPI(fullSpec));
            var measurer = full.settings;

            var part = full.unit.units[0];

            expect(full.unit.guide.x.tickFormatNullAlias).to.equal('(NIL)');
            expect(full.unit.guide.showGridLines).to.equal('x');
            expect(part.guide.showGridLines).to.equal('');
        });

        it('should support [COMPACT] spec engine (facet)', function () {

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

            var fullSpec = convSpec(spec, 'COMPACT');
            var testSpecEngine = new SpecAutoLayout(fullSpec);
            var full = testSpecEngine.transform(chartAPI(fullSpec));
            var measurer = full.settings;

            var x = full.unit.guide.x;
            var y = full.unit.guide.y;

            expect(full.unit.guide.showGridLines || '').to.equal('');

            expect(x.autoScale).to.equal(true);
            expect(x.scaleOrient).to.equal('bottom');
            expect(x.padding).to.equal(0);
            expect(x.cssClass).to.equal('x axis facet-axis compact');
            expect(x.avoidCollisions).to.equal(true);
            expect(x.rotate).to.equal(0);
            expect(x.textAnchor).to.equal('middle');
            expect(x.tickFormat).to.equal(null);
            expect(x.tickFormatNullAlias).to.equal('No team');
            expect(x.label.text).to.equal('team > date');
            expect(x.label.cssClass).to.equal('label');
            expect(x.label.dock).to.equal(null);
            expect(x.tickFontHeight).to.equal(10);
            expect(x.density).to.equal(measurer.getAxisTickLabelSize('Long').width + measurer.xDensityPadding * 2);

            expect(y.autoScale).to.equal(true);
            expect(y.scaleOrient).to.equal('left');
            expect(y.padding).to.equal(0);
            expect(y.cssClass).to.equal('y axis facet-axis compact');
            expect(y.rotate).to.equal(-90);
            expect(y.textAnchor).to.equal('middle');
            expect(y.tickFormat).to.equal(null);
            expect(typeof y.tickFormatNullAlias).to.equal('undefined');
            // expect(y.label.text).to.equal('');
            expect(y.label.text).to.equal('count');
            expect(y.label.cssClass).to.equal('label');
            expect(y.label.dock).to.equal(null);
            // expect(y.tickFontHeight).to.equal(0);
            expect(y.tickFontHeight).to.equal(10);
            expect(y.density).to.equal(0 + measurer.yDensityPadding * 2); // empty axis

            expect(full.unit.guide.padding.b).to.equal(40);

            // y is null axis
            // expect(full.unit.guide.padding.l).to.equal(0);
            expect(full.unit.guide.padding.l).to.equal(19);
            expect(full.unit.guide.padding.r).to.equal(0);
            expect(full.unit.guide.padding.t).to.equal(0);


            var part = full.unit.units[0];
            var px = part.guide.x;
            var py = part.guide.y;

            expect(part.guide.showGridLines).to.equal('xy');

            expect(px.tickFormat).to.equal('x-time-auto');
            expect(px.tickFormatNullAlias).to.equal('No date');
            expect(px.tickFontHeight).to.equal(10);
            expect(px.label.text).to.equal('');
            expect(px.label.dock).to.equal('right');
            expect(px.label.padding).to.equal(-2.5);
            expect(px.label.cssClass).to.equal('label inline');
            expect(px.density).to.be.above(measurer.getAxisTickLabelSize('October 2014').width + measurer['xDensityPadding:measure'] * 2);

            expect(py.tickFormat).to.equal('x-num-auto');
            expect(py.tickFormatNullAlias).to.equal('No count');
            expect(py.tickFontHeight).to.equal(10);
            // expect(py.label.text).to.equal('count');
            expect(py.label.text).to.equal('');
            expect(py.label.dock).to.equal('right');
            expect(py.label.padding).to.equal(-17.5);
            expect(py.label.cssClass).to.equal('label inline');
            expect(py.density).to.equal(measurer.getAxisTickLabelSize('25').width + measurer['yDensityPadding:measure'] * 2);

            var elem = part.units[0];

            expect(elem.guide.x.tickFontHeight).to.equal(10);
            expect(elem.guide.y.tickFontHeight).to.equal(10);
        });
    });
});