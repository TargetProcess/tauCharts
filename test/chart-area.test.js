define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    describe('Area plot chart', function () {

        //it('should convert to PATH by default', function () {
        //    var area = new tauChart.Chart({
        //        type: 'area',
        //        x: 'x',
        //        y: 'y',
        //        color: 'color',
        //        data: [
        //            {x: 0, y: 2, color: 'B'},
        //            {x: 2, y: 2, color: 'B'},
        //            {x: 1, y: 3, color: 'B'},
        //            {x: 1, y: 1, color: 'B'}
        //        ].map((r, i) => {
        //                r.i = i;
        //                return r;
        //            })
        //    });
        //
        //    var spec = area.getSpec();
        //    expect(spec.sources['/'].data.map((r) => r.i)).to.deep.equal([0, 1, 2, 3]);
        //    expect(spec.unit.units[0].type).to.equal('ELEMENT.PATH');
        //});

        it('should sort data by X if there is a func relation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
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

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A2', 'B1', 'A1', 'B2', 'A0', 'B0']);
            expect(spec.unit.units[0].type).to.equal('ELEMENT.AREA');
            expect(spec.unit.units[0].flip).to.equal(false);
        });

        it('should sort data by Y if there is a func relation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
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

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A2', 'B1', 'A1', 'B2', 'A0', 'B0']);
            expect(spec.unit.units[0].type).to.equal('ELEMENT.AREA');
            expect(spec.unit.units[0].flip).to.equal(true);
        });

        it('should sort data by X if [flip = false]', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                color: 'color',
                flip: false,
                data: [
                    {y: 2, x: 2, color: 'A', i:0},
                    {y: 1, x: 3, color: 'A', i:1},
                    {y: 0, x: 2, color: 'A', i:2},

                    {y: 2, x: 2, color: 'B', i:0},
                    {y: 0, x: 2, color: 'B', i:1},
                    {y: 1, x: 3, color: 'B', i:2}
                ]
            });

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A2', 'B0', 'B1', 'A1', 'B2']);
            expect(spec.unit.units[0].type).to.equal('ELEMENT.AREA');
            expect(spec.unit.units[0].flip).to.equal(false);
        });

        it('should sort data by Y if [flip = true]', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                color: 'color',
                flip: true,
                data: [
                    {x: 2, y: 2, color: 'A', i:0},
                    {x: 1, y: 3, color: 'A', i:1},
                    {x: 0, y: 2, color: 'A', i:2},

                    {x: 2, y: 2, color: 'B', i:0},
                    {x: 0, y: 2, color: 'B', i:1},
                    {x: 1, y: 3, color: 'B', i:2}
                ]
            });

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A2', 'B0', 'B1', 'A1', 'B2']);
        });
    });
});