define(function(require){
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    var noScrollStyle = require('test/utils/utils').noScrollStyle;
    describe('Bar chart', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            var bar = new tauChart.Chart({
                type:'bar',
                data:testData,
                x:'x',
                y:'y',
                color:'color',
                size:'size'
            });
            assert.equal(schemes.barGPL.errors(bar.getSpec()), false, 'spec right');
            assert.equal(bar.getSpec().unit.units[0].flip, false, 'spec right');
            bar.destroy();
        });
    });

    describe('Bar chart size', function () {
        var createTestDiv = function () {
            var testDiv = document.createElement('div');
            testDiv.style.width = '800px';
            testDiv.style.height = '600px';
            document.body.appendChild(testDiv);
            removeTestDiv = function () {
                document.body.removeChild(testDiv);
            };
            return testDiv;
        };
        var removeTestDiv;
        var testData = tauChart.api.utils.range(100).map(function (i) {
            return {
                x: 20,
                y: i
            };
        });
        it('should not reserve space when no bar label', function () {
            noScrollStyle.create();
            var testDiv = createTestDiv();
            var bar = new tauChart.Chart({
                type: 'horizontal-bar',
                data: testData,
                x: 'x',
                y: 'y'
            });
            bar.renderTo(testDiv);
            assert.equal(Number(bar.getSVG().getAttribute('width')), 800, 'chart width');
            assert.equal(Number(bar.getSVG().getAttribute('height')), 600, 'chart height');
            bar.destroy();
            removeTestDiv();
            noScrollStyle.remove();
        });
        it('should reserve space when bar label is set', function () {
            noScrollStyle.create();
            var testDiv = createTestDiv();
            var bar = new tauChart.Chart({
                type: 'horizontal-bar',
                data: testData,
                x: 'x',
                y: 'y',
                label: 'y'
            });
            bar.renderTo(testDiv);
            assert.equal(Number(bar.getSVG().getAttribute('width')), 800, 'chart width');
            assert.equal(Number(bar.getSVG().getAttribute('height')), 1075, 'chart height');
            bar.destroy();
            removeTestDiv();
            noScrollStyle.remove();
        });
    });

});
