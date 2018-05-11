import {expect} from 'chai';
import * as d3 from 'd3-color';
import testUtils from './utils/utils';
import legend from '../plugins/legend';
import trendline from '../plugins/trendline';
import exportTo from '../plugins/export-to';
import Taucharts from '../src/tau.charts';

    var chartTypes = Taucharts.api.chartTypesRegistry.getAllRegisteredTypes();
    var describeChart = testUtils.describeChart;

    function getText(node) {
        return node.parentNode.parentNode.textContent.trim();
    }

    var expectLegend = function (expect, chart) {
        var prefix = 'color20';
        var sidebar = chart._layout.rightSidebar;

        var legendBlock = sidebar.querySelector('.tau-chart__legend');
        expect(legendBlock).to.be.ok;
        expect(legendBlock.querySelector('.tau-chart__legend__title').textContent).to.equal('color');
        var nodeList = legendBlock.querySelectorAll('.tau-chart__legend__guide');

        expect(getText(nodeList[0])).to.equal('No color');
        expect(nodeList[0].classList.contains(prefix + '-1')).to.be.ok;
        expect(getText(nodeList[1])).to.equal('yellow');
        expect(nodeList[1].classList.contains(prefix + '-2')).to.be.ok;
        expect(getText(nodeList[2])).to.equal('green');
        expect(nodeList[2].classList.contains(prefix + '-3')).to.be.ok;
    };
    Object.keys(chartTypes).filter(type=>['map', 'parallel'].indexOf(type) === -1).forEach(function (item) {
        describeChart(
            "legend for " + item,
            {
                type: item,
                x: 'x',
                y: 'y',
                color: 'color',
                plugins: [legend()]
            },
            [{
                x: 2,
                y: 2,
                color: null

            }, {
                x: 2,
                y: 2,
                color: 'yellow'

            }, {
                x: 2,
                y: 4,
                color: 'green'

            }],
            function (context) {
                it("should render legend", function () {
                    expectLegend(expect, context.chart);
                });
            },
            {
                autoWidth: true
            }
        );
    });
    describeChart(
        "legend not draw category",
        {
            type: 'line',
            x: 'x',
            y: 'y',
            // color: 'color',
            plugins: [legend()]
        },
        [{
            x: 2,
            y: 2,
            color: 'yellow'

        }, {
            x: 3,
            y: 4,
            color: 'green'

        }],
        function (context) {
            it("shouldn't render spec", function () {
                expect(context.chart._layout.rightSidebar.childNodes.length).to.not.be.ok;
                // expectLegend(expect, context.chart);
            });
        },
        {
            autoWidth: true
        }
    );
    var AssertToggleOnClick = function (context, expect) {
        var chart = context.chart;
        var item1, item2;
        var svg;
        var prefix = '.color20';
        var selector = '.tau-chart__legend__guide' + prefix + '-1';
        var selector2 = '.tau-chart__legend__guide' + prefix + '-2';

        item1 = chart._layout.rightSidebar.querySelectorAll(selector)[0].parentNode.parentNode;
        svg = chart.getSVG();
        expect(svg.querySelectorAll(prefix + '-1').length).to.be.equals(1);
        expect(svg.querySelectorAll(prefix + '-2').length).to.be.equals(1);

        testUtils.simulateEvent('click', item1);

        svg = chart.getSVG();
        expect(svg.querySelectorAll(prefix + '-1').length).to.be.equals(1);
        expect(svg.querySelectorAll(prefix + '-2').length).to.be.equals(0);

        item2 = chart._layout.rightSidebar.querySelectorAll(selector2)[0].parentNode.parentNode;
        expect(item2.classList.contains('disabled')).to.be.ok;
        expect(item2.querySelectorAll(prefix + '-2').length).to.be.equals(1);

        item1 = chart._layout.rightSidebar.querySelectorAll(selector)[0].parentNode.parentNode;
        testUtils.simulateEvent('click', item1);

        svg = chart.getSVG();
        expect(svg.querySelectorAll(prefix + '-1').length).to.be.equals(1);
        expect(svg.querySelectorAll(prefix + '-2').length).to.be.equals(1);
        expect(item1.classList.contains('disabled')).not.be.ok;
    };
    var AssertToggleOnHover = function (context, expect) {
        var chart = context.chart;
        var item1;
        var svg;
        var prefix = '.color20';
        var selector = '.tau-chart__legend__guide' + prefix + '-1';

        item1 = chart._layout.rightSidebar.querySelectorAll(selector)[0].parentNode;

        svg = chart.getSVG();
        var isHighlight = function (elements) {
            return Array.from(elements).every(function (element) {
                return testUtils.hasClass(element, 'tau-chart__highlighted');
            });
        };

        expect(isHighlight(svg.querySelectorAll(prefix + '-1'))).not.be.ok;
        expect(isHighlight(svg.querySelectorAll(prefix + '-2'))).not.be.ok;

        testUtils.simulateEvent('mouseover', item1);

        expect(isHighlight(svg.querySelectorAll(prefix + '-1'))).to.be.ok;
        expect(isHighlight(svg.querySelectorAll(prefix + '-2'))).not.be.ok;

        testUtils.simulateEvent('mouseout', item1);

        expect(isHighlight(svg.querySelectorAll(prefix + '-1'))).not.be.ok;
        expect(isHighlight(svg.querySelectorAll(prefix + '-2'))).not.be.ok;
    };
    describeChart(
        "legend should have right behavior on events for line chart",
        {
            type: 'line',
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [legend()/*,trendline(),exportTo()*/]
        },
        [{
            x: 2,
            y: 2,
            color: 'yellow'

        }, {
            x: 3,
            y: 3,
            color: 'yellow'

        }, {
            x: 3,
            y: 4,
            color: 'green'

        }],
        function (context) {
            it("shouldn't render spec", function () {
                AssertToggleOnHover(context, expect);
            });
        },
        {
            autoWidth: false
        }
    );
    describeChart(
        "legend should have right behavior on events",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [legend()/*,trendline()*/]
        },
        [{
            x: 2,
            y: 2,
            color: 'yellow'

        }, {
            x: 3,
            y: 4,
            color: 'green'

        }],
        function (context) {
            it("toggle by color", function () {
                AssertToggleOnClick(context, expect);
                AssertToggleOnHover(context, expect);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        "legend should toggle by color for boolean value",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [legend()]
        },
        [{
            x: 2,
            y: 2,
            color: true

        }, {
            x: 3,
            y: 4,
            color: false

        }],
        function (context) {
            it("shouldn't render spec", function () {
                AssertToggleOnClick(context, expect);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        "legend should have right label for null value",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [legend()]
        },
        [{
            x: 2,
            y: 2,
            color: undefined

        }],
        function (context) {
            it("should No color", function () {
                var sidebar = context.chart._layout.rightSidebar;
                var legendBlock = sidebar.querySelector('.tau-chart__legend');
                var nodeList = legendBlock.querySelectorAll('.tau-chart__legend__guide');
                expect(getText(nodeList[0])).to.equal('No color');
            });
        },
        {
            autoWidth: false
        }
    );
    describeChart(
        "legend for color",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [legend()],
            guide: {
                color: {
                    brewer: ['#ff0000', '#00ff00', '#0000ff', '#000000']
                }
            },

            dimensions: {
                x: {type: 'measure'},
                y: {type: 'measure'},
                color: {
                    type: 'category',
                    order: ['A', 'B']
                }
            }
        },
        [
            {
                x: 2,
                y: 2,
                color: undefined
            },
            {
                x: 4,
                y: 5,
                color: 'B'
            },
            {
                x: 1,
                y: 1,
                color: 'A'
            },
            {
                x: 3,
                y: 3,
                color: 'C'
            }
        ],
        function (context) {
            it("should respect order", function () {
                var sidebar = context.chart._layout.rightSidebar;
                var legendBlock = sidebar.querySelector('.tau-chart__legend');
                var nodeList = legendBlock.querySelectorAll('.tau-chart__legend__guide');

                expect(nodeList.length).to.equal(4);

                // color
                expect(getText(nodeList[0])).to.equal('A');
                expect(getText(nodeList[1])).to.equal('B');
                expect(getText(nodeList[2])).to.equal('No color');
                expect(getText(nodeList[3])).to.equal('C');

                expect(d3.rgb(nodeList[0].style.backgroundColor).toString()).to.equal(d3.rgb('#ff0000').toString());
                expect(d3.rgb(nodeList[1].style.backgroundColor).toString()).to.equal(d3.rgb('#00ff00').toString());
                expect(d3.rgb(nodeList[2].style.backgroundColor).toString()).to.equal(d3.rgb('#0000ff').toString());
                expect(d3.rgb(nodeList[3].style.backgroundColor).toString()).to.equal(d3.rgb('#000000').toString());
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        "legend for color with dates",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            plugins: [legend()],
            guide: {
                color: {
                    brewer: ['#ff0000', '#00ff00', '#0000ff', '#000000'],
                    tickFormat: 'month-year-utc',
                    tickPeriod: 'month'
                }
            },

            dimensions: {
                x: {type: 'measure'},
                y: {type: 'measure'},
                color: {
                    type: 'order',
                    scale: 'periodic'
                }
            }
        },
        [
            {
                x: 2,
                y: 2,
                color: new Date('2010-01-01T00:00:00.000Z')
            },
            {
                x: 4,
                y: 5,
                color: new Date('2008-01-01T00:00:00.000Z')
            },
            {
                x: 1,
                y: 1,
                color: new Date('2009-01-01T00:00:00.000Z')
            },
            {
                x: 3,
                y: 3,
                color: new Date('2011-01-01T00:00:00.000Z')
            }
        ],
        function (context) {
            it("should render with correct order", function () {
                var sidebar = context.chart._layout.rightSidebar;
                var legendBlock = sidebar.querySelector('.tau-chart__legend');
                var nodeList = legendBlock.querySelectorAll('.tau-chart__legend__guide');

                expect(getText(nodeList[0])).to.equal('January, 2008');
                expect(getText(nodeList[1])).to.equal('January, 2009');
                expect(getText(nodeList[2])).to.equal('January, 2010');
                expect(getText(nodeList[3])).to.equal('January, 2011');
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        "legend for size",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            size: 'size',
            plugins: [legend()]
        },
        [
            {
                x: 2,
                y: 2,
                size: 10
            },
            {
                x: 4,
                y: 5,
                size: 123
            }
        ],
        function (context) {
            it("should support size scale", function () {
                var sidebar = context.chart._layout.rightSidebar;
                var legendBlock = sidebar.querySelector('.tau-chart__legend');
                var nodeList = legendBlock.querySelectorAll('.tau-chart__legend__size__item__circle');
                var texts = legendBlock.querySelectorAll('.tau-chart__legend__size__item__label');

                expect(nodeList.length).to.equal(2);

                expect(texts[0].textContent).to.equal('123');
                expect(texts[1].textContent).to.equal('10');
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'add legend on spec update',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            size: 'size',
        },
        [
            {x: 2, y: 2, size: 10},
            {x: 4, y: 5, size: 123}
        ],
        function (context) {
            it('should not draw legend first time', function () {
                const sidebar = context.chart.getLayout().rightSidebar;
                const legendBlock = sidebar.querySelector('.tau-chart__legend');

                expect(legendBlock).to.be.null;
            });

            it('should draw legend', function () {
                context.chart.updateConfig({
                    type: 'scatterplot',
                    x: 'x',
                    y: 'y',
                    size: 'size',
                    plugins: [legend()],
                    data: [
                        {x: 2, y: 2, size: 10},
                        {x: 4, y: 5, size: 123}
                    ]
                });

                const sidebar = context.chart.getLayout().rightSidebar;
                const legendBlock = sidebar.querySelector('.tau-chart__legend');
                const nodeList = legendBlock.querySelectorAll('.tau-chart__legend__size__item__circle');
                const texts = legendBlock.querySelectorAll('.tau-chart__legend__size__item__label');

                expect(nodeList.length).to.equal(2);
                expect(texts[0].textContent).to.equal('123');
                expect(texts[1].textContent).to.equal('10');
            });

            it('should change legend from size to color', function () {
                context.chart.updateConfig({
                    type: 'scatterplot',
                    x: 'x',
                    y: 'y',
                    color: 'size',
                    plugins: [legend()],
                    data: [
                        {x: 2, y: 2, size: 10},
                        {x: 4, y: 5, size: 123}
                    ]
                });

                const sidebar = context.chart.getLayout().rightSidebar;
                const legendBlock = sidebar.querySelector('.tau-chart__legend');
                const nodeList = legendBlock.querySelectorAll('.tau-chart__legend__size__item__circle');
                const gradients = legendBlock.querySelectorAll('.tau-chart__legend__gradient');

                expect(nodeList.length).to.equal(0);
                expect(gradients.length).to.equal(1);
            });

            it('should hide legend', function () {
                context.chart.updateConfig({
                    type: 'scatterplot',
                    x: 'x',
                    y: 'y',
                    size: 'size',
                    data: [
                        {x: 2, y: 2, size: 10},
                        {x: 4, y: 5, size: 123}
                    ]
                });

                const sidebar = context.chart.getLayout().rightSidebar;
                const legendBlock = sidebar.querySelector('.tau-chart__legend');

                expect(legendBlock).to.be.null;
            });
        },
        {
            autoWidth: false
        }
    );
