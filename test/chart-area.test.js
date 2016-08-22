define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    var testUtils = require('testUtils');

    describe('Area plot chart', function () {

        var element;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
            testUtils.destroyCharts();
        });

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

        it('should support [stack] transformation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                stack: true,
                color: 'color',
                guide: {
                    x: {nice: false},
                    y: {nice: false},
                    color: {
                        brewer: {
                            A: 'A',
                            B: 'B'
                        }
                    }
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'none'
                },
                data: [
                    {x: 0, y: 0, color: 'A'},
                    {x: 1, y: 1, color: 'A'},
                    {x: 2, y: 2, color: 'A'},

                    {x: 0, y: 2, color: 'B'},
                    {x: 1, y: 2, color: 'B'},
                    {x: 0, y: -2, color: 'B'},
                    {x: 1, y: -2, color: 'B'}
                ]
            });

            area.renderTo(element, {width: 1000, height: 1000});

            var svgPolygons = d3.selectAll('polygon')[0];

            expect(svgPolygons.length).to.equal(3);

            expect(testUtils.hasClass(svgPolygons[0].parentNode, 'A')).to.equal(true);
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('0,600 500,400 1000,200 1000,600 500,600 0,600', 'A');

            expect(testUtils.hasClass(svgPolygons[1].parentNode, 'B')).to.equal(true);
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('0,200 500,0 1000,200 1000,200 500,400 0,600', 'B positive');

            expect(testUtils.hasClass(svgPolygons[2].parentNode, 'B')).to.equal(true);
            expect(d3.select(svgPolygons[2]).attr('points'))
                .to
                .equal('0,1000 500,1000 1000,600 1000,600 500,600 0,600', 'B negative');

            var points = d3.selectAll('circle')[0].map((node) => {
                var p = d3.select(node);
                var x = p.attr('cx');
                var y = p.attr('cy');
                return [x, y];
            });

            expect(JSON.stringify(points))
                .to
                .deep
                .equal('[["0","600"],["500","400"],["1000","200"],["0","200"],["500","0"],["0","1000"],["500","1000"]]');
        });

        it('should support [flip+stack] transformation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'y',
                y: 'x',
                stack: true,
                flip: true,
                color: 'color',
                guide: {
                    x: {nice: false},
                    y: {nice: false},
                    color: {
                        brewer: {
                            A: 'A',
                            B: 'B'
                        }
                    }
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'none'
                },
                data: [
                    {x: 0, y: 0, color: 'A'},
                    {x: 1, y: 1, color: 'A'},
                    {x: 2, y: 2, color: 'A'},

                    {x: 0, y: 2, color: 'B'},
                    {x: 1, y: 2, color: 'B'},
                    {x: 0, y: -2, color: 'B'},
                    {x: 1, y: -2, color: 'B'}
                ]
            });

            area.renderTo(element, {width: 1000, height: 1000});

            var svgPolygons = d3.selectAll('polygon')[0];

            expect(svgPolygons.length).to.equal(3);

            expect(testUtils.hasClass(svgPolygons[0].parentNode, 'B')).to.equal(true);
            expect(d3.select(svgPolygons[0]).attr('points'))
                .to
                .equal('400,0 800,500 800,1000 400,1000 400,500 400,0', 'B negative');

            expect(testUtils.hasClass(svgPolygons[1].parentNode, 'B')).to.equal(true);
            expect(d3.select(svgPolygons[1]).attr('points'))
                .to
                .equal('400,0 0,500 0,1000 400,1000 400,500 400,0', 'B positive');

            expect(testUtils.hasClass(svgPolygons[2].parentNode, 'A')).to.equal(true);
            expect(d3.select(svgPolygons[2]).attr('points'))
                .to
                .equal('800,0 1000,500 800,1000 800,1000 800,500 400,0', 'A');

            var points = d3.selectAll('circle')[0].map((node) => {
                var p = d3.select(node);
                var x = p.attr('cx');
                var y = p.attr('cy');
                return [x, y];
            });

            expect(JSON.stringify(points))
                .to
                .deep
                .equal('[["800","500"],["800","1000"],["0","500"],["0","1000"],["800","0"],["1000","500"],["800","1000"]]');
        });
    });
});