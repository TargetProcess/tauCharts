define(function (require) {
    var expect = require('chai').expect;
    var tauChart = require('tau_modules/tau.newCharts');

    describe('Performance line chart', function () {

        var test1K;
        var div;
        beforeEach(function () {

            test1K = _.times(1000, function(i) {
                var s = (i % 2);
                var c = s ? 'red' : 'green';
                return {x:i, y:i, color:c, size:s};
            });

            div = document.createElement('div');
            div.innerHTML = '<div id="test-div" style="width: 800px; height: 600px">NODATA</div>';
            document.body.appendChild(div);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('should draw line chart in limited time', function () {

            var testDiv = document.getElementById('test-div');

            var t0 = (+new Date());

            new tauChart.Chart({
                type: 'line',
                data: test1K,
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size'
            }).renderTo(testDiv);

            var t1 = (+new Date());

            expect(t1 - t0).to.be.below(200);
        });

        it('should draw scatterplot chart in limited time', function () {

            var testDiv = document.getElementById('test-div');

            var t0 = (+new Date());

            new tauChart.Chart({
                type: 'scatterplot',
                data: test1K,
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size'
            }).renderTo(testDiv);

            var t1 = (+new Date());

            expect(t1 - t0).to.be.below(200);
        });

        it('should draw bar chart in limited time', function () {

            var testDiv = document.getElementById('test-div');

            var t0 = (+new Date());

            new tauChart.Chart({
                type: 'bar',
                data: test1K,
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size'
            }).renderTo(testDiv);

            var t1 = (+new Date());

            expect(t1 - t0).to.be.below(200);
        });
    });
});