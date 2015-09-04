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
            assert.equal(schemes.line.errors(line.config.spec), false, 'spec right');
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
    });
});