define(function (require) {
    var expect = require('chai').expect;
    var Converter = require('src/spec-transform-extract-axes').SpecTransformExtractAxes;

    describe('spec-transform-extract-axes', function () {

        it('should extract axes', function () {

            var temp = {
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "x_week",
                    "y": "y_proj",
                    "guide": {
                        padding: {l:100, b: 50, r: 0, t: 0},
                        x: {tickPeriod: 'week', padding: 20},
                        y: {tickLabel: 'name', padding: 50}
                    },
                    "units": [
                        {
                            "type": "COORDS.RECT",
                            "x": "x_date",
                            "y": "y_count",
                            "guide": {
                                padding: {l:10, b: 5, r: 0, t: 0},
                                x: {tickPeriod: 'date', padding: 2},
                                y: {tickLabel: 'count', padding: 5}
                            },
                            "units": [
                                {
                                    "type": "ELEMENT.LINE"
                                }
                            ]
                        }
                    ]
                },
                settings: {
                    layoutEngine: 'EXTRACT'
                }
            };

            var conv = new Converter(temp);

            var spec = conv.transform();

            expect(spec.unit.guide.autoLayout).to.deep.equal('');
            expect(spec.unit.guide.padding).to.deep.equal({"l": 110, "r": 10, "t": 10, "b": 55});
            expect(spec.unit.guide.x.padding).to.deep.equal(25);
            expect(spec.unit.guide.y.padding).to.deep.equal(60);

            expect(spec.unit.units[0].guide.autoLayout).to.deep.equal('extract-axes');
            expect(spec.unit.units[0].guide.padding).to.deep.equal({"l": 10, "r": 10, "t": 10, "b": 10});
            expect(spec.unit.units[0].guide.x.padding).to.deep.equal(2);
            expect(spec.unit.units[0].guide.y.padding).to.deep.equal(5);
        });

        it('should reject on deep facets', function () {

            var temp = {
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "x_week",
                    "y": "y_proj",
                    "guide": {
                        padding: {l:100, b: 50, r: 0, t: 0},
                        x: {tickPeriod: 'week', padding: 20},
                        y: {tickLabel: 'name', padding: 50}
                    },
                    "units": [
                        {
                            "type": "COORDS.RECT",
                            "x": "x_date",
                            "y": "y_count",
                            "guide": {
                                padding: {l:10, b: 5, r: 0, t: 0},
                                x: {tickPeriod: 'date', padding: 2},
                                y: {tickLabel: 'count', padding: 5}
                            },
                            "units": [
                                {
                                    "type": "COORDS.RECT",
                                    "x": "x_date2",
                                    "y": "y_count2",
                                    "guide": {
                                        padding: {l:10, b: 5, r: 0, t: 0},
                                        x: {tickPeriod: 'date2', padding: 2},
                                        y: {tickLabel: 'count2', padding: 5}
                                    },
                                    "units": [
                                        {
                                            "type": "ELEMENT.LINE"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                settings: {
                    layoutEngine: 'EXTRACT'
                }
            };

            var conv = new Converter(temp);
            var spec = conv.transform();

            expect(typeof spec.unit.guide.autoLayout).to.equal('undefined');
            expect(spec.unit.guide.padding).to.deep.equal({"l": 100, "r": 0, "t": 0, "b": 50});
            expect(spec.unit.guide.x.padding).to.deep.equal(20);
            expect(spec.unit.guide.y.padding).to.deep.equal(50);

            var part0 = spec.unit.units[0];
            expect(typeof part0.guide.autoLayout).to.equal('undefined');
            expect(part0.guide.padding).to.deep.equal({"l": 10, "r": 0, "t": 0, "b": 5});
            expect(part0.guide.x.padding).to.deep.equal(2);
            expect(part0.guide.y.padding).to.deep.equal(5);

            var part1 = spec.unit.units[0].units[0];
            expect(typeof part1.guide.autoLayout).to.equal('undefined');
            expect(part1.guide.padding).to.deep.equal({"l": 10, "r": 0, "t": 0, "b": 5});
            expect(part1.guide.x.padding).to.deep.equal(2);
            expect(part1.guide.y.padding).to.deep.equal(5);
        });

        it('should reject on non-cartesian coordinates', function () {

            var temp = {
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "x_week",
                    "y": "y_proj",
                    "guide": {
                        x: {tickPeriod: 'week', padding: 20},
                        y: {tickLabel: 'name', padding: 50}
                    },
                    "units": [
                        {
                            "type": "COORDS.PARALLEL",
                            "x": "x_date",
                            "y": "y_count",
                            "guide": {
                                padding: {l:10, b: 5, r: 0, t: 0},
                                x: {tickPeriod: 'date', padding: 2},
                                y: {tickLabel: 'count', padding: 5}
                            },
                            "units": [
                                {
                                    "type": "ELEMENT.LINE"
                                }
                            ]
                        }
                    ]
                },
                settings: {
                    layoutEngine: 'EXTRACT'
                }
            };

            var conv = new Converter(temp);
            var spec = conv.transform();

            expect(typeof spec.unit.guide.autoLayout).to.equal('undefined');
            expect(typeof spec.unit.guide.padding).to.equal('undefined');

            var part0 = spec.unit.units[0];
            expect(typeof part0.guide.autoLayout).to.equal('undefined');
            expect(part0.guide.padding).to.deep.equal({"l": 10, "r": 0, "t": 0, "b": 5});
            expect(part0.guide.x.padding).to.deep.equal(2);
            expect(part0.guide.y.padding).to.deep.equal(5);
        });
    });
});
