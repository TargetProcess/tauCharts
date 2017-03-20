define(function (require) {

    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var legend = require('plugins/legend');
    var trendline = require('plugins/trendline');
    var exportTo = require('plugins/export');
    var tauCharts = require('src/tau.charts');
    var chartTypes = tauCharts.api.chartTypesRegistry.getAllRegisteredTypes();
    var describeChart = testUtils.describeChart;

    function getText(node) {
        return node.parentNode.parentNode.textContent.trim();
    }

    var expectLegend = function (expect, chart) {
        var prefix = 'color20';
        var sidebar = chart._layout.rightSidebar;

        var legendBlock = sidebar.querySelector('.graphical-report__legend');
        expect(legendBlock).to.be.ok;
        expect(legendBlock.querySelector('.graphical-report__legend__title').textContent).to.equal('color');
        var nodeList = legendBlock.querySelectorAll('.graphical-report__legend__guide');

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
        var selector = '.graphical-report__legend__guide' + prefix + '-1';
        var selector2 = '.graphical-report__legend__guide' + prefix + '-2';

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
        var selector = '.graphical-report__legend__guide' + prefix + '-1';

        item1 = chart._layout.rightSidebar.querySelectorAll(selector)[0].parentNode;

        svg = chart.getSVG();
        var isHighlight = function (elements) {
            return Array.from(elements).every(function (element) {
                return testUtils.hasClass(element, 'graphical-report__highlighted');
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
                var legendBlock = sidebar.querySelector('.graphical-report__legend');
                var nodeList = legendBlock.querySelectorAll('.graphical-report__legend__guide');
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
                var legendBlock = sidebar.querySelector('.graphical-report__legend');
                var nodeList = legendBlock.querySelectorAll('.graphical-report__legend__guide');

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
                var legendBlock = sidebar.querySelector('.graphical-report__legend');
                var nodeList = legendBlock.querySelectorAll('.graphical-report__legend__size__item__circle');
                var texts = legendBlock.querySelectorAll('.graphical-report__legend__size__item__label');

                expect(nodeList.length).to.equal(2);

                expect(texts[0].textContent).to.equal('123');
                expect(texts[1].textContent).to.equal('10');
            });
        },
        {
            autoWidth: false
        }
    );
});