define(function (require) {
    var expect = require('chai').expect;
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
                        date: new Date('2015-01-01'),
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
                                date: '2015-01-01T00:00:00.000Z',
                                count: 30
                            },
                            {
                                "team": "alpha",
                                "proj": "TP2",
                                "date": "2015-01-01T00:00:00.000Z",
                                "count": 10
                            }
                        ]
                    }
                },
                "scales": {
                    "x_null"        : {"type": "ordinal", "source": "?"},
                    "y_null"        : {"type": "ordinal", "source": "?"},
                    "size_null"     : {"type": "size", "source": "?", "mid": 5},
                    "color_null"    : {"type": "color", "source": "?", "brewer": null},

                    "pos:default"   : {"type": "ordinal", "source": "?"},
                    "size:default"  : {"type": "size", "source": "?", "mid": 5},
                    "color:default" : {"type": "color", "source": "?", "brewer": null},

                    "y_team"        : {"type": "ordinal", "source": "/", "dim": "team", order: ['alpha', 'beta'], "autoScale": true},
                    "x_date"        : {"type": "time", "source": "/", "dim": "date", "autoScale": true},
                    "y_count"       : {"type": "linear", "source": "/", "dim": "count", "autoScale": true}
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
                                    "x": "x_date",
                                    "y": "y_count",
                                    "guide": {
                                        "x": {},
                                        "y": {}
                                    }
                                }
                            ]
                        }
                    ]
                }
            };

            expect(JSON.stringify(spec.sources)).to.deep.equal(JSON.stringify(x.sources));
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
                            "proj": {"type": "category"},
                            "count": {"type": "measure"},
                            "proj.name": {"type": "category"}
                        },
                        "data": [{
                            "team": "alpha",
                            "proj": {"id": 13, "name": "TP2"},
                            "date": "2015-01-01T00:00:00.000Z",
                            "week": "2015-01-04T00:00:00.000Z",
                            "count": 10,
                            "proj.id": 13,
                            "proj.name": "TP2"
                        }]
                    }
                },
                "scales": {
                    "x_null": {"type": "ordinal", "source": "?"},
                    "y_null": {"type": "ordinal", "source": "?"},
                    "size_null": {"type": "size", "source": "?", "mid": 5},
                    "color_null": {"type": "color", "source": "?", "brewer": null},

                    "pos:default": {"type": "ordinal", "source": "?"},
                    "size:default": {"type": "size", "source": "?", "mid": 5},
                    "color:default": {"type": "color", "source": "?", "brewer": null},

                    "x_week": {"type": "period", "source": "/", "dim": "week", "autoScale": true, "period": "week"},
                    "y_proj": {"type": "ordinal", "source": "/", "dim": "proj.name", "autoScale": true},
                    "x_date": {"type": "time", "source": "/", "dim": "date", "autoScale": true},
                    "y_count": {"type": "linear", "source": "/", "dim": "count", "autoScale": true}
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
                                    "x": "x_date",
                                    "y": "y_count",
                                    "guide": {
                                        "x": {},
                                        "y": {}
                                    }
                                }
                            ]
                        }
                    ]
                }
            };

            expect(JSON.stringify(spec.sources)).to.deep.equal(JSON.stringify(x.sources));
            expect(JSON.stringify(spec.unit)).to.deep.equal(JSON.stringify(x.unit));
            expect(JSON.stringify(spec.scales)).to.deep.equal(JSON.stringify(x.scales));
        });
    });
});
