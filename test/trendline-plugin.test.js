import {expect} from 'chai';
import testUtils from './utils/utils';
import trendline from '../plugins/trendline';
    var describeChart = testUtils.describeChart;

    describeChart(
        'trendline plugin',
        {
            type: 'scatterplot',
            stack: true,
            x: 'x',
            y: 'y',
            plugins: [trendline()]
        },
        [
            {x: 0, y: 0},
            {x: 10, y: 10},
            {x: 100, y: 100}
        ],
        function (context) {

            it('should not be applied if element is stacked', function () {

                var chart = context.chart;

                var selector = '.graphical-report__trendline';
                var d3Lines = chart.getSVG().querySelectorAll(selector);

                expect(d3Lines.length).to.equal(0);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'trendline plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            plugins: [trendline()]
        },
        [
            {x: 'A', y: 0},
            {x: 'B', y: 10},
            {x: 'C', y: 100}
        ],
        function (context) {

            it('should not be applied if at least one category scale', function () {

                var chart = context.chart;

                var selector = '.graphical-report__trendlinepanel__error-message';
                var message = chart._layout.rightSidebar.querySelectorAll(selector)[0];

                expect(message.innerHTML).to.equal("Trend line can't be computed for categorical data. Each axis should be either a measure or a date.");
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'trendline plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            plugins: [trendline()],
            dimensions: {
                x: {type: 'order', scale: 'period'},
                y: {type: 'measure'}
            },
            guide: {
                x: {tickPeriod: 'month'}
            }
        },
        [
            {x: '2015-08-01T00:00:00Z', y: 0},
            {x: '2015-09-01T00:00:00Z', y: 10},
            {x: '2015-10-01T00:00:00Z', y: 1000}
        ],
        function (context) {
            it('should be applied for period scale', function () {

                var chart = context.chart;
                var marker = '.graphical-report__trendline';

                var lineSelector = function (nodeItem) {
                    return nodeItem.config.type === 'ELEMENT.LINE';
                };

                var nodes0 = chart.select(lineSelector);

                expect(nodes0.length).to.equal(1);

                var svg0 = chart.getSVG();
                var svgTrendlines0 = svg0.querySelectorAll(marker);
                expect(svgTrendlines0.length).to.equal(1);
                var path = svgTrendlines0[0].querySelectorAll('path')[0];
                expect(path.getAttribute('d').indexOf('NaN')).to.equal(-1);

                var selector = '.i-role-show-trend';
                var checkbox = chart._layout.rightSidebar.querySelectorAll(selector)[0];

                testUtils.simulateEvent('click', checkbox);

                var nodes1 = chart.select(lineSelector);

                expect(nodes1.length).to.equal(0);

                var svg1 = chart.getSVG();
                var svgTrendlines1 = svg1.querySelectorAll(marker);
                expect(svgTrendlines1.length).to.equal(0);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'trendline plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            plugins: [trendline()],
            dimensions: {
                y: {type: 'order', scale: 'period'},
                x: {type: 'measure'}
            },
            guide: {
                y: {tickPeriod: 'month'}
            }
        },
        [
            {y: '2015-08-01T00:00:00Z', x: 0},
            {y: '2015-09-01T00:00:00Z', x: 10},
            {y: '2015-10-01T00:00:00Z', x: 1000}
        ],
        function (context) {
            it('should be applied for transponed period scale', function () {

                var chart = context.chart;
                var marker = '.graphical-report__trendline';

                var lineSelector = function (nodeItem) {
                    return nodeItem.config.type === 'ELEMENT.LINE';
                };

                var nodes0 = chart.select(lineSelector);

                expect(nodes0.length).to.equal(1);

                var svg0 = chart.getSVG();
                var svgTrendlines0 = svg0.querySelectorAll(marker);
                expect(svgTrendlines0.length).to.equal(1);
                var path = svgTrendlines0[0].querySelectorAll('path')[0];
                expect(path.getAttribute('d').indexOf('NaN')).to.equal(-1);

                var selector = '.i-role-show-trend';
                var checkbox = chart._layout.rightSidebar.querySelectorAll(selector)[0];

                testUtils.simulateEvent('click', checkbox);

                var nodes1 = chart.select(lineSelector);

                expect(nodes1.length).to.equal(0);

                var svg1 = chart.getSVG();
                var svgTrendlines1 = svg1.querySelectorAll(marker);
                expect(svgTrendlines1.length).to.equal(0);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'trendline plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'c',
            plugins: [trendline()]
        },
        [
            {x: 0, y: 0, c: 'A'},
            {x: 1, y: 10, c: 'A'},
            {x: 2, y: 100, c: 'A'},

            {x: 0, y: 100, c: 'B'},
            {x: 1, y: 10, c: 'B'},
            {x: 2, y: 0, c: 'B'}
        ],
        function (context) {

            it('should build trendline for each color category', function () {

                var chart = context.chart;
                var marker = '.graphical-report__trendline';

                var lineSelector = function (nodeItem) {
                    return nodeItem.config.type === 'ELEMENT.LINE';
                };

                var nodes0 = chart.select(lineSelector);

                expect(nodes0.length).to.equal(1);
                expect(nodes0[0].config.color).to.equal('color_c');

                var svg0 = chart.getSVG();
                var svgTrendlines0 = svg0.querySelectorAll(marker);
                expect(svgTrendlines0.length).to.equal(2);

                var path0 = svgTrendlines0[0].querySelectorAll('path')[0];
                expect(path0.getAttribute('d').indexOf('NaN')).to.equal(-1);

                var path1 = svgTrendlines0[1].querySelectorAll('path')[0];
                expect(path1.getAttribute('d').indexOf('NaN')).to.equal(-1);

                var trendLineArchPoints = svg0.querySelectorAll('.i-data-anchor');
                expect(trendLineArchPoints.length).to.be.equal(0, 'trendline should not have anchor points');

                var selector = '.i-role-show-trend';
                var checkbox = chart._layout.rightSidebar.querySelectorAll(selector)[0];

                testUtils.simulateEvent('click', checkbox);

                var nodes1 = chart.select(lineSelector);

                expect(nodes1.length).to.equal(0);

                var svg1 = chart.getSVG();
                var svgTrendlines1 = svg1.querySelectorAll(marker);
                expect(svgTrendlines1.length).to.equal(0);
            });
        },
        {
            autoWidth: false
        }
    );
