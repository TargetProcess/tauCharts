define(function(require){
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    var facetSpec = schema({
        scales: schemes.scales,
        unit: schema({
            guide: undefined,
            x: 'x_color',
            y: 'y_null',
            type: "COORDS.RECT",
            units: Array.of(schema({
                guide: undefined,
                x: 'x_x',
                y: 'y_y',
                units:Array.of(schemes.interval)
            }))
        })
    });

    describe('Simple facet charts', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            var bar = new tauChart.Chart({
                guide:{},
                type:'bar',
                data:testData,
                x:['color','x'],
                y:'y',
                color:'color',
                size:'size'
            });

            assert.equal(facetSpec.errors(bar.getSpec()), false, 'spec right');
            assert.equal(bar.getSpec().unit.units[0].units[0].flip, false, 'spec right');
            bar.destroy();
        })
    });

    describe('simple facet charts with swap dimensions', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            var bar = new tauChart.Chart({
                guide:{},
                type:'bar',
                data:testData,
                x:['x','color'],
                y:'y',
                color:'color',
                size:'size'
            });

            assert.equal(facetSpec.errors(bar.getSpec()), false, 'spec right');
            assert.equal(bar.getSpec().unit.units[0].units[0].flip, false, 'spec right');
            bar.destroy();
        });
    });

    describe('simple facet charts with two measure dimensions', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            expect(function () {
                new tauChart.Chart({
                    guide: {},
                    type: 'bar',
                    data: testData,
                    x: ['x', 'size'],
                    y: 'y',
                    color: 'color',
                    size: 'size'
                })
            }).to.throw(Error);
        })
    });
});