define(function (require) {

    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var quickFilter = require('plugins/quick-filter');
    var describeChart = testUtils.describeChart;

    describeChart(
        'quick filter plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            plugins: [quickFilter()]
        },
        [
            {x: 'A', y: 0},
            {x: 'B', y: 10},
            {x: 'C', y: 100}
        ],
        function (context) {

            it('should be applied to measure scale', function () {
                var chart = context.chart;
                var filters = chart
                    ._layout
                    .rightSidebar
                    .querySelectorAll('.graphical-report__filter__wrap');

                expect(filters.length).to.equal(1);
                expect(filters[0].querySelectorAll('.graphical-report__legend__title')[0].innerText)
                    .to.equal('y');
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'quick filter plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            plugins: [quickFilter()]
        },
        [
            {x: '2015-08-01T00:00:00Z', y: 0},
            {x: '2015-09-01T00:00:00Z', y: 10},
            {x: '2015-10-01T00:00:00Z', y: 1000}
        ].map((row) => {
                row.x = new Date(row.x);
                return row;
            }),
        function (context) {
            it('should be applied to time and measure scale', function () {
                var chart = context.chart;
                var filters = chart
                    ._layout
                    .rightSidebar
                    .querySelectorAll('.graphical-report__filter__wrap');

                expect(filters.length).to.equal(2);
                expect(filters[0].querySelectorAll('.graphical-report__legend__title')[0].innerText)
                    .to.equal('x'); // Month

                expect(filters[1].querySelectorAll('.graphical-report__legend__title')[0].innerText)
                    .to.equal('y'); // Value
            });
        },
        {
            autoWidth: false
        }
    );
});