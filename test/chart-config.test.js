define(function(require){
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var tauChart = require('tau_modules/tau.newCharts');
    describe('Invalid chart definition', function(){
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should throw correct error on invalid chart type', function(){

            expect(function(){
                new tauChart.Chart({
                    type: 'invalidType',
                    data: testData,
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    size: 'size'
                });
            }).to.throw('Chart type invalidType is not supported. Use one of scatterplot, line, bar, horizontalBar.');

        });

        it('should throw on unknown dimensions in axis definition', function(){

            expect(function(){
                new tauChart.Chart({
                    type: 'bar',
                    data: testData,
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    size: 'size',
                    dimensions: {
                        'project': {
                            'type': 'category',
                            'scale': 'ordinal'
                        }
                    }
                });
            }).to.throw('Undefined dimension "x" for axis "x"');
        });

        it('should throw on unknown dimensions without dimensions', function(){

            expect(function(){
                new tauChart.Chart({
                    type: 'bar',
                    data: testData,
                    x: 'x',
                    y: 'project',
                    color: 'color',
                    size: 'size'
                });
            }).to.throw('Undefined dimension "project" for axis "y"');
        });

        it('should throw on several measures in facets', function(){

            expect(function(){
                new tauChart.Chart({
                    type: 'bar',
                    data: testData,
                    y: ['x','y'],
                    x: 'y',
                    color: 'color',
                    size: 'size'
                });
            }).to.throw('There is more than one measure dimension for "y" axis');
        });
    });
});