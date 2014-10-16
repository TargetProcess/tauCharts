describe('scatter plot chart', function () {
    var testData = [
        {x: 1, y: 1, color: 'red', size: 6},
        {x: 0.5, y: 0.5, color: 'green', size: 6},
        {x: 2, y: 2, color: 'green', size: 8}
    ];
    it('should convert to common config', function () {
        var scatter = new tauChart.Chart({
            data:testData,
            x:'x',
            y:'y',
            color:'color',
            size:'size'
        });
        assert.ok(!schemes.scatterplot.errors(scatter.config.spec), 'spec right');

    })
});
