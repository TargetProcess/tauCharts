define(function (require) {
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    describe('Line plot chart', function () {

        it('should convert to common config', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size',
                data: [
                    {x: 1, y: 1, color: 'red', size: 6},
                    {x: 0.5, y: 0.5, color: 'green', size: 6},
                    {x: 2, y: 2, color: 'green', size: 8}
                ]
            });
            assert.equal(schemes.lineGPL.errors(line.getSpec()), false, 'spec right');
        });

        it('should sort data by X by default', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'x',
                y: 'y',
                color: 'color',
                data: [
                    {x: 0, y: 2, color: 'B'},
                    {x: 2, y: 2, color: 'B'},
                    {x: 1, y: 3, color: 'B'},
                    {x: 1, y: 1, color: 'B'}
                ].map((r, i) => {
                        r.i = i;
                        return r;
                    })
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i)).to.deep.equal([0, 2, 3, 1]);
        });

        it('should sort data by X if there is a func relation', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: ['color', 'x'],
                y: 'y',
                color: 'color',
                data: [
                    {x: 2, y: 2, color: 'A', i:0},
                    {x: 1, y: 3, color: 'A', i:1},
                    {x: 0, y: 2, color: 'A', i:2},

                    {x: 2, y: 2, color: 'B', i:0},
                    {x: 0, y: 2, color: 'B', i:1},
                    {x: 1, y: 3, color: 'B', i:2}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A2', 'B1', 'A1', 'B2', 'A0', 'B0']);
        });

        it('should sort data by Y if there is a func relation', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'x',
                y: ['color', 'y'],
                color: 'color',
                data: [
                    {y: 2, x: 2, color: 'A', i:0},
                    {y: 1, x: 3, color: 'A', i:1},
                    {y: 0, x: 2, color: 'A', i:2},

                    {y: 2, x: 2, color: 'B', i:0},
                    {y: 0, x: 2, color: 'B', i:1},
                    {y: 1, x: 3, color: 'B', i:2}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A2', 'B1', 'A1', 'B2', 'A0', 'B0']);
        });

        it('should sort data by X if [horizontal] orientation is specified', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: ['color', 'x'],
                y: 'y',
                color: 'color',
                lineOrientation: 'horizontal',
                data: [
                    {y: 2, x: 2, color: 'A', i:0},
                    {y: 1, x: 3, color: 'A', i:1},
                    {y: 0, x: 2, color: 'A', i:2},

                    {y: 2, x: 2, color: 'B', i:0},
                    {y: 0, x: 2, color: 'B', i:1},
                    {y: 1, x: 3, color: 'B', i:2}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A2', 'B0', 'B1', 'A1', 'B2']);
        });

        it('should sort data by Y if [vertical] orientation is specified', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'x',
                y: ['color', 'y'],
                color: 'color',
                lineOrientation: 'vertical',
                data: [
                    {x: 2, y: 2, color: 'A', i:0},
                    {x: 1, y: 3, color: 'A', i:1},
                    {x: 0, y: 2, color: 'A', i:2},

                    {x: 2, y: 2, color: 'B', i:0},
                    {x: 0, y: 2, color: 'B', i:1},
                    {x: 1, y: 3, color: 'B', i:2}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A2', 'B0', 'B1', 'A1', 'B2']);
        });

        it('should NOT sort data if [none] orientation is specified', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'x',
                y: 'y',
                color: 'color',
                lineOrientation: 'none',
                data: [
                    {x: 2, y: 2, color: 'A', i:0},
                    {x: 1, y: 3, color: 'A', i:1},
                    {x: 0, y: 2, color: 'A', i:2},

                    {x: 2, y: 2, color: 'B', i:0},
                    {x: 0, y: 2, color: 'B', i:1},
                    {x: 1, y: 3, color: 'B', i:2}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A1', 'A2', 'B0', 'B1', 'B2']);
        });

        it('should NOT sort data if [category] variable is used for X', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'date',
                y: 'count',
                color: 'type',
                data: [
                    {i: 0, type: 'us', count: 5, date: 'C'},
                    {i: 1, type: 'us', count: 8, date: 'A'},
                    {i: 2, type: 'us', count: 5, date: 'B'}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i))
                .to
                .deep
                .equal([0, 1, 2]);
        });

        it('should NOT sort data if [category] variable is used for Y', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'count',
                y: 'date',
                color: 'type',
                data: [
                    {i: 0, type: 'us', count: 5, date: 'C'},
                    {i: 1, type: 'us', count: 8, date: 'A'},
                    {i: 2, type: 'us', count: 5, date: 'B'}
                ]
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i))
                .to
                .deep
                .equal([0, 1, 2]);
        });

        it('should sort data if [ordered] variable is used for X', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'date',
                y: 'count',
                color: 'type',
                data: [
                    {i: 0, type: 'us', count: 5, date: 'C'},
                    {i: 1, type: 'us', count: 8, date: 'A'},
                    {i: 2, type: 'us', count: 5, date: 'B'},
                    {i: 3, type: 'us', count: 8, date: 'D'}
                ],
                dimensions: {
                    "type": {
                        "type": "category",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    },
                    "date": {
                        "type": "order",
                        "order": ['A', 'B'],
                        "scale": "ordinal"
                    }
                }
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i))
                .to
                .deep
                .equal([1, 2, 0, 3]);
        });

        it('should sort data if [ordered] variable is used for Y', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'count',
                y: 'date',
                color: 'type',
                data: [
                    {i: 0, type: 'us', count: 5, date: 'C'},
                    {i: 1, type: 'us', count: 8, date: 'A'},
                    {i: 2, type: 'us', count: 5, date: 'B'},
                    {i: 3, type: 'us', count: 8, date: 'D'}
                ],
                dimensions: {
                    "type": {
                        "type": "category",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    },
                    "date": {
                        "type": "order",
                        "order": ['A', 'B'],
                        "scale": "ordinal"
                    }
                }
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i))
                .to
                .deep
                .equal([1, 2, 0, 3]);
        });

        it('should sort data if [period] scale is used for X', function () {
            var line = new tauChart.Chart({
                type: 'line',
                x: 'date',
                y: 'count',
                color: 'type',
                guide: {
                    x: {
                        tickPeriod: 'month'
                    }
                },
                data: [
                    {i: 0, type: 'us', count: 5, date: '2015-03-01'},
                    {i: 1, type: 'us', count: 8, date: '2015-01-01'},
                    {i: 2, type: 'us', count: 5, date: '2015-02-01'},
                    {i: 3, type: 'us', count: 8, date: '2015-04-01'}
                ],
                dimensions: {
                    "type": {
                        "type": "category",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    },
                    "date": {
                        "type": "order",
                        "scale": "period"
                    }
                }
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i))
                .to
                .deep
                .equal([1, 2, 0, 3]);
        });

        it('should sort data if [period] scale is used for X', function () {
            var line = new tauChart.Chart({
                type: 'line',
                y: 'date',
                x: 'count',
                color: 'type',
                guide: {
                    y: {
                        tickPeriod: 'month'
                    }
                },
                data: [
                    {i: 0, type: 'us', count: 5, date: '2015-03-01'},
                    {i: 1, type: 'us', count: 8, date: '2015-01-01'},
                    {i: 2, type: 'us', count: 5, date: '2015-02-01'},
                    {i: 3, type: 'us', count: 8, date: '2015-04-01'}
                ],
                dimensions: {
                    "type": {
                        "type": "category",
                        "scale": "ordinal"
                    },
                    "count": {
                        "type": "measure",
                        "scale": "linear"
                    },
                    "date": {
                        "type": "order",
                        "scale": "period"
                    }
                }
            });

            var spec = line.getSpec();
            expect(spec.sources['/'].data.map((r) => r.i))
                .to
                .deep
                .equal([1, 2, 0, 3]);
        });
    });
});