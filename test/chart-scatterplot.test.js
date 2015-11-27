define(function (require) {
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    describe('scatter plot chart', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            var scatter = new tauChart.Chart({
                type: 'scatterplot',
                data: testData,
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size'
            });
            assert.equal(schemes.scatterplotGPL.errors(scatter.getSpec()), false, 'spec right');
        })
    });
});
