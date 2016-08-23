define(function (require) {
    var tauCharts = require('src/tau.charts');
    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var Converter = require('src/spec-converter').SpecConverter;

    describe('spec-converter', function () {

        it('should convert correctly', function () {

            var temp = {
                data: [
                    {
                        team: 'beta',
                        proj: 'TP2',
                        date: new Date('2015-01-01'),
                        count: 30
                    },
                    {
                        team: 'alpha',
                        proj: 'TP2',
                        date: '2015-01-01',
                        count: 10
                    }
                ],
                settings: {},
                spec: {
                    dimensions: {
                        date: {type: 'measure', scale: 'time'},
                        team: {type: 'category', scale: 'ordinal', order: ['alpha', 'beta']},
                        proj: {type: 'category', scale: 'ordinal'},
                        count: {type: 'measure', scale: 'linear'}
                    },
                    unit: {
                        type: 'COORDS.RECT',
                        x: null,
                        y: 'team',
                        unit: [
                            {
                                type: 'COORDS.RECT',
                                x: 'date',
                                y: 'count',
                                unit: [
                                    {
                                        type: 'ELEMENT.LINE'
                                    }
                                ]
                            }
                        ]
                    }
                }
            };

            var conv = new Converter(temp);

            var spec = conv.convert();
            var x = {

                "sources": {
                    "?": {
                        "dims": {},
                        "data": [{}]
                    },
                    "/": {
                        "dims": {
                            "date": {"type": "measure"},
                            "team": {"type": "category"},
                            "proj": {"type": "category"},
                            "count": {"type": "measure"}
                        },
                        "data": [
                            {
                                team: 'beta',
                                proj: 'TP2',
                                date: new Date('2015-01-01'),
                                count: 30
                            },
                            {
                                "team": "alpha",
                                "proj": "TP2",
                                "date": new Date('2015-01-01'),
                                "count": 10
                            }
                        ]
                    }
                },
                "scales": {
                    "x_null"        : {"type": "ordinal", "source": "?"},
                    "y_null"        : {"type": "ordinal", "source": "?"},
                    "size_null"     : {"type": "size", "source": "?"},
                    "color_null"    : {"type": "color", "source": "?"},
                    'split_null': {type: 'value', source: '?'},

                    "pos:default"   : {"type": "ordinal", "source": "?"},
                    "size:default"  : {"type": "size", "source": "?"},
                    "label:default" : {"type": "value", source: "?"},
                    "color:default" : {"type": "color", "source": "?"},
                    'split:default' : {type: 'value', source: '?'},

                    "y_team"        : {"type": "ordinal", "source": "/", "dim": "team", order: ['alpha', 'beta'], "autoScale": true, "nice":true, "niceInterval":null},
                    "x_date"        : {"type": "time", "source": "/", "dim": "date", "autoScale": true, "nice":true, "niceInterval":null},
                    "y_count"       : {"type": "linear", "source": "/", "dim": "count", "autoScale": true, "nice":true, "niceInterval":null}
                },
                "trans": {},
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "x_null",
                    "y": "y_team",
                    "expression": {
                        "inherit": false,
                        "source": "/",
                        "operator": "cross",
                        "params": [null, "team"]
                    },
                    "units": [
                        {
                            "type": "COORDS.RECT",
                            "x": "x_date",
                            "y": "y_count",
                            "expression": {
                                "inherit": true,
                                "source": "/",
                                "operator": "none",
                                "params": []
                            },
                            "units": [
                                {
                                    "type": "ELEMENT.LINE",
                                    "expression": {
                                        "inherit": true,
                                        "source": "/",
                                        "operator": "none",
                                        "params": []
                                    },
                                    "namespace": "chart",
                                    "x": "x_date",
                                    "y": "y_count",
                                    "guide": {
                                        "x": {},
                                        "y": {}
                                    }
                                }
                            ],
                            "namespace": "chart"
                        }
                    ],
                    "namespace": "chart"
                }
            };

            expect(JSON.stringify(spec.sources['?'].dims)).to.deep.equal(JSON.stringify(x.sources['?'].dims));
            expect(JSON.stringify(spec.sources['?'].data)).to.deep.equal(JSON.stringify(x.sources['?'].data));
            expect(JSON.stringify(spec.sources['/'].dims)).to.deep.equal(JSON.stringify(x.sources['/'].dims));

            var actRows = spec.sources['/'].data;
            var expRows = x.sources['/'].data;
            expect(actRows.length).to.equal(expRows.length);
            actRows.forEach((row, i) => {
                expect(row.team).to.equal(expRows[i].team);
                expect(row.proj).to.equal(expRows[i].proj);
                expect(row.count).to.equal(expRows[i].count);
                expect(row.date.getTime()).to.equal(expRows[i].date.getTime());
            });

            expect(JSON.stringify(spec.unit)).to.deep.equal(JSON.stringify(x.unit));
            expect(JSON.stringify(spec.scales)).to.deep.equal(JSON.stringify(x.scales));
        });

        it('should convert periods and complex objects', function () {

            var temp = {
                data: [
                    {
                        team: 'alpha',
                        proj: {id: 13, name: 'TP2'},
                        date: new Date('2015-01-01'),
                        week: '2015-01-04',
                        count: 10
                    },
                    {
                        team: 'alpha',
                        proj: {id: 13, name: 'TP2'},
                        date: new Date('2015-01-01'),
                        week: new Date('2015-01-04'),
                        count: 10
                    }
                ],
                settings: {},
                spec: {
                    dimensions: {
                        date: {type: 'measure', scale: 'time'},
                        week: {type: 'order', scale: 'period'},
                        team: {type: 'category', scale: 'ordinal'},
                        proj: {type: 'category', scale: 'ordinal', value: 'id'},
                        count: {type: 'measure', scale: 'linear'}
                    },
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'week',
                        y: 'proj',
                        guide: {
                            x: {tickPeriod: 'week'},
                            y: {tickLabel: 'name'}
                        },
                        unit: [
                            {
                                type: 'COORDS.RECT',
                                x: 'date',
                                y: 'count',
                                unit: [
                                    {
                                        type: 'ELEMENT.LINE'
                                    }
                                ]
                            }
                        ]
                    }
                }
            };

            var conv = new Converter(temp);

            var spec = conv.convert();

            var x = {
                "sources": {
                    "?": {"dims": {}, "data": [{}]},
                    "/": {
                        "dims": {
                            "date": {"type": "measure"},
                            "week": {"type": "order"},
                            "team": {"type": "category"},
                            "count": {"type": "measure"},
                            "proj.name": {"type": "category"}
                        },
                        "data": [
                            {
                                "team": "alpha",
                                "proj": {"id": 13, "name": "TP2"},
                                "date": new Date("2015-01-01"),
                                "week": new Date("2015-01-04"),
                                "count": 10,
                                "proj.id": 13,
                                "proj.name": "TP2"
                            },
                            {
                                "team": "alpha",
                                "proj": {"id": 13, "name": "TP2"},
                                "date": new Date("2015-01-01"),
                                "week": new Date("2015-01-04"),
                                "count": 10,
                                "proj.id": 13,
                                "proj.name": "TP2"
                            }
                        ]
                    }
                },
                "scales": {
                    "x_null": {"type": "ordinal", "source": "?"},
                    "y_null": {"type": "ordinal", "source": "?"},
                    "size_null": {"type": "size", "source": "?"},
                    "color_null": {"type": "color", "source": "?"},
                    'split_null': {type: 'value', source: '?'},

                    "pos:default": {"type": "ordinal", "source": "?"},
                    "size:default": {"type": "size", "source": "?"},
                    "label:default": {"type": "value", source: "?"},
                    "color:default": {"type": "color", "source": "?"},
                    'split:default': {type: 'value', source: '?'},

                    "x_week": {"type": "period", "source": "/", "dim": "week", "autoScale": true, "nice":true, "niceInterval":null, "period": "week"},
                    "y_proj": {"type": "ordinal", "source": "/", "dim": "proj.name", "autoScale": true, "nice":true, "niceInterval":null},
                    "x_date": {"type": "time", "source": "/", "dim": "date", "autoScale": true, "nice":true, "niceInterval":null},
                    "y_count": {"type": "linear", "source": "/", "dim": "count", "autoScale": true, "nice":true, "niceInterval":null}
                },
                "trans": {},
                "unit": {
                    "type": "COORDS.RECT",
                    "x": "x_week",
                    "y": "y_proj",
                    "guide": {
                        "x": {"tickPeriod": "week"},
                        "y": {"tickLabel": "name"}
                    },
                    "expression": {
                        "inherit": false,
                        "source": "/",
                        "operator": "cross_period",
                        "params": ["week", "proj.name", "week", null]
                    },
                    "units": [
                        {
                            "type": "COORDS.RECT",
                            "x": "x_date",
                            "y": "y_count",
                            "expression": {
                                "inherit": true,
                                "source": "/",
                                "operator": "none",
                                "params": []
                            },
                            "units": [
                                {
                                    "type": "ELEMENT.LINE",
                                    "expression": {
                                        "inherit": true,
                                        "source": "/",
                                        "operator": "none",
                                        "params": []
                                    },
                                    "namespace": "chart",
                                    "x": "x_date",
                                    "y": "y_count",
                                    "guide": {
                                        "x": {},
                                        "y": {}
                                    }
                                }
                            ],
                            "namespace": "chart"
                        }
                    ],
                    "namespace": "chart"
                }
            };

            expect(JSON.stringify(spec.sources['?'].dims)).to.deep.equal(JSON.stringify(x.sources['?'].dims));
            expect(JSON.stringify(spec.sources['?'].data)).to.deep.equal(JSON.stringify(x.sources['?'].data));
            expect(JSON.stringify(spec.sources['/'].dims)).to.deep.equal(JSON.stringify(x.sources['/'].dims));

            var actRows = spec.sources['/'].data;
            var expRows = x.sources['/'].data;
            expect(actRows.length).to.equal(expRows.length);
            actRows.forEach((row, i) => {
                expect(row.team).to.equal(expRows[i].team);
                expect(row.count).to.equal(expRows[i].count);
                expect(row['proj.id']).to.equal(expRows[i]['proj.id']);
                expect(row['proj.name']).to.equal(expRows[i]['proj.name']);
                expect(row['date'].getTime()).to.equal(expRows[i]['date'].getTime());
                expect(row['week'].getTime()).to.equal(expRows[i]['week'].getTime());

                expect(JSON.stringify(row['proj'])).to.equal(JSON.stringify(expRows[i]['proj']));
            });

            expect(JSON.stringify(spec.unit)).to.deep.equal(JSON.stringify(x.unit));
            expect(JSON.stringify(spec.scales)).to.deep.equal(JSON.stringify(x.scales));
        });

        it('should change scale type from time to period when tickPeriod is specified', function () {

            var c1 = new tauCharts.Chart({
                type: 'bar',
                x: 'x1',
                y: 'y1',
                data: [
                    {x1: new Date(), y1: 1}
                ]
            });

            var spec1 = c1.getSpec();

            var x1TimeScale = Object
                .keys(spec1.scales)
                .map((s) => spec1.scales[s])
                .filter((s) => s.dim === 'x1')
                [0];

            expect(x1TimeScale.type).to.equals('time');

            var c2 = new tauCharts.Chart({
                type: 'bar',
                x: 'x1',
                y: 'y1',
                guide: {
                    x: {tickPeriod: 'month'}
                },
                data: [
                    {x1: new Date(), y1: 1}
                ]
            });

            var spec2 = c2.getSpec();

            var x1PeriodScale = Object
                .keys(spec2.scales)
                .map((s) => spec2.scales[s])
                .filter((s) => s.dim === 'x1')
                [0];

            expect(x1PeriodScale.type).to.equals('period');
            expect(x1PeriodScale.period).to.equals('month');
        });

        it('should not fail when unknown tickPeriod is specified', function () {

            var c2 = new tauCharts.Chart({
                type: 'bar',
                x: 'x1',
                y: 'y1',
                guide: {
                    x: {tickPeriod: 'some-unknown-period'}
                },
                data: [
                    {x1: new Date(), y1: 1}
                ]
            });

            var spec2 = c2.getSpec();

            var x1PeriodScale = Object
                .keys(spec2.scales)
                .map((s) => spec2.scales[s])
                .filter((s) => s.dim === 'x1')
                [0];

            expect(x1PeriodScale.type).to.equals('period');
            expect(x1PeriodScale.period).to.equals(null);
        });
    });
});
