define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    describe('Parallel chart', function () {

        var testData = [
            {x: 1, y: 1, color: 'red', size: 6, cc: 'USA'},
            {x: 0.5, y: 0.5, color: 'green', size: 6, cc: 'RUS'},
            {x: 2, y: 2, color: 'green', size: 8, cc: 'BLR'}
        ];

        var target;

        beforeEach(function () {
            target = document.createElement('div');
            document.body.appendChild(target);
            target.style.height = '1000px';
            target.style.width = '1000px';
        });

        afterEach(function () {
            target.parentNode.removeChild(target);
        });

        it('should throw if columns is not provided', function () {
            expect(function () {
                new tauChart.Chart({
                    type: 'parallel',
                    data: testData
                });
            }).to.throw('[columns] property must contain at least 2 dimensions');
        });

        it('should throw if data is not provided', function () {
            expect(function () {
                new tauChart.Chart({
                    type: 'parallel',
                    columns: ['x', 'y']
                });
            }).to.throw('[data] must be specified');
        });

        it('should draw without errors', function () {
            var chart;
            expect(function () {
                chart = new tauChart.Chart({
                    type: 'parallel',
                    columns: ['x1', 'x2'],
                    data: [
                        {x1: 0, x2: 10},
                        {x1: 5, x2: 5},
                        {x1: 10, x2: 0}
                    ]
                });

                chart.renderTo(target);
            }).to.not.throw();

            var svg = d3.select(chart.getSVG());

            var elems = svg.selectAll('.foreground');
            expect(elems.length).to.equal(1);
            expect(elems[0].length).to.equal(3);
        });

        it('should support highlight event', function () {
            var chart = new tauChart.Chart({
                type: 'parallel',
                columns: ['id', 'x1', 'x2'],
                data: [
                    {id: 'A', x1: 0, x2: 10},
                    {id: 'B', x1: 5, x2: 5},
                    {id: 'C', x1: 10, x2: 0}
                ],
                guide: {
                    enableBrushing: true
                }
            });

            chart.renderTo(target);

            var geom = chart.select(function (node) {
                return node.config.type === 'PARALLEL/ELEMENT.LINE';
            });

            expect(geom.length).to.equal(1);
            geom[0].fire('highlight', function(d) {
                return d.x1 === 5;
            });

            var svg = d3.select(chart.getSVG());

            var elems = svg.selectAll('.foreground');
            expect(elems.length).to.equal(1);
            expect(elems[0].length).to.equal(3);
            expect(elems[0]
                .filter(function(n) {
                    return d3.select(n).style('visibility') === 'hidden';
                }).length).to.equal(2);

            var actualBrush;
            geom[0].parentUnit.on('brush', function(sender, e) {
                actualBrush = e;
            });

            geom[0].parentUnit.fire('force-brush', {linear_x1: [5, 10]});
            expect(actualBrush).to.deep.equal([
                {
                    dim: 'x1',
                    func: 'between',
                    args: [5, 10]
                }
            ]);

            geom[0].parentUnit.fire('force-brush', {ordinal_id: ['B', 'C']});
            expect(actualBrush).to.deep.equal([
                {
                    dim: 'id',
                    func: 'inset',
                    args: ['B', 'C']
                },
                {
                    dim: 'x1',
                    func: 'between',
                    args: [5, 10]
                }
            ]);
        });
    });
});