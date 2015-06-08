define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    var plugin = require('plugins/parallel-brushing');

    describe('Parallel-brushing plugin', function () {

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

        it('should support plugin', function () {

            var chart = new tauChart.Chart({
                type: 'parallel',
                columns: ['x1', 'x2'],
                data: [
                    {x1: 0, x2: 10},
                    {x1: 5, x2: 5},
                    {x1: 10, x2: 0}
                ],
                plugins: [
                    plugin({
                        forceBrush: {
                            x1: [5, 10],
                            x2: [0, 1]
                        }
                    })
                ]
            });

            chart.renderTo(target);

            var svg = d3.select(chart.getSVG());

            var elems = svg.selectAll('.foreground');
            expect(elems.length).to.equal(1);
            expect(elems[0].length).to.equal(3);
            expect(elems[0].filter((n) => (d3.select(n).style('visibility') === 'hidden')).length).to.equal(2);
        });
    });
});