define(function(require){
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('tau_modules/tau.newCharts').tauChart;


    var facetSpec = schema({
        dimensions: schemes.dimensions,
        unit: schema({
            guide: undefined,
            x: 'color',
            y: null,
            type: "COORDS.RECT",
            unit: Array.of(schema({
                guide: undefined,
                x: 'x',
                y: 'y',
                unit:Array.of(schemes.interval)
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
            assert.equal(facetSpec.errors(bar.config.spec), false,'spec right');
            assert.equal(bar.config.spec.unit.unit[0].unit[0].flip, false,'spec right');
        })
    });

});
