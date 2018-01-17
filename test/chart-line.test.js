import {assert, expect} from 'chai';
import schemes from './utils/schemes';
import tauChart from '../src/tau.charts';
import testUtils from './utils/utils';
import * as d3 from 'd3-selection';

const round = testUtils.roundNumbersInString;

    describe('Line plot chart', function () {

        afterEach(function () {
            testUtils.destroyCharts();
        });

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

        it('should add data points for missing periods (fillGaps)', function () {

            const element = document.createElement('div');
            document.body.appendChild(element);

            const line = new tauChart.Chart({
                type: 'line',
                x: 'date',
                y: 'value',
                color: 'group',
                guide: {
                    x: {
                        nice: false,
                        timeInterval: 'day',
                        min: new Date('2015-01-01T00:00Z'),
                        max: new Date('2015-01-06T00:00Z')
                    },
                    y: {nice: false},
                },
                settings: {
                    utcTime: true,
                    specEngine: 'none',
                    layoutEngine: 'none'
                },
                data: [
                    {date: new Date('2015-01-02T00:00Z'), value: 10, group: 'a'},
                    {date: new Date('2015-01-03T00:00Z'), value: 10, group: 'a'},
                    {date: new Date('2015-01-02T00:00Z'), value: -10, group: 'b'},
                    {date: new Date('2015-01-05T00:00Z'), value: 10, group: 'b'},
                ]
            });
            line.renderTo(element, {width: 1000, height: 1000});

            const paths = Array.from(element.querySelectorAll('.tau-chart__line path'))
                .reduce((map, el) => {
                    const s = d3.select(el);
                    const path = round(s.attr('d'));
                    const g = s.data()[0][0].group;
                    map[g] = path;
                    return map;
                }, {});

            expect(paths.a).to.equal('M0,500 L200,0 L400,0');
            expect(paths.b).to.equal('M0,500 L200,1000 L400,500 L600,500 L800,0');

            document.body.removeChild(element);
        });

        it('should use empty size for missing periods (fillGaps)', function () {

            const element = document.createElement('div');
            document.body.appendChild(element);

            const line = new tauChart.Chart({
                type: 'line',
                x: 'date',
                y: 'value',
                color: 'group',
                size: 'effort',
                guide: {
                    x: {
                        nice: false,
                        timeInterval: 'day',
                        min: new Date('2015-01-01T00:00Z'),
                        max: new Date('2015-01-06T00:00Z')
                    },
                    y: {nice: false},
                    size: {
                        minSize: 10,
                        maxSize: 50
                    }
                },
                settings: {
                    utcTime: true,
                    specEngine: 'none',
                    layoutEngine: 'none'
                },
                data: [
                    {date: new Date('2015-01-02T00:00Z'), value: 10, group: 'a', effort: 20},
                    {date: new Date('2015-01-03T00:00Z'), value: 10, group: 'a', effort: 20},
                    {date: new Date('2015-01-02T00:00Z'), value: -10, group: 'b', effort: 0},
                    {date: new Date('2015-01-05T00:00Z'), value: 10, group: 'b', effort: 20},
                ]
            });
            line.renderTo(element, {width: 1000, height: 1000});

            const paths = Array.from(element.querySelectorAll('.i-role-path path'))
                .reduce((map, el) => {
                    const s = d3.select(el);
                    const path = round(s.attr('d'));
                    const g = s.data()[0][0].group;
                    map[g] = path;
                    return map;
                }, {});

            expect(paths.a).to.equal('M0,508 L181,16 A24,24 0 1 1 226,34 L9,512 A5,5 0 0 1 0,508 Z M204,0 L403,0 A24,24 0 0 1 403,49 L204,49 A24,24 0 0 1 204,0 Z');
            expect(paths.b).to.equal('M9,508 L208,993 A5,5 0 0 1 199,997 L0,512 A5,5 0 0 1 9,508 Z M199,993 L398,508 A5,5 0 0 1 407,512 L208,997 A5,5 0 0 1 199,993 Z M403,505 L602,505 A5,5 0 0 1 602,515 L403,515 A5,5 0 0 1 403,505 Z M597,508 L778,16 A24,24 0 1 1 823,34 L606,512 A5,5 0 0 1 597,508 Z');

            document.body.removeChild(element);
        });
    });
