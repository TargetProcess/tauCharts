define(function (require) {

    // return;

    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var legend = require('plugins/legend');
    var trendline = require('plugins/trendline');
    var exportTo = require('plugins/export');
    var _ = require('underscore');
    var tauCharts = require('src/tau.charts');
    var chartTypes = tauCharts.api.chartTypesRegistry.getAllRegisteredTypes();
    var describeChart = testUtils.describeChart;

    function getText(node) {
        return node.parentNode.parentNode.textContent;
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
        var item1;
        var svg;
        var prefix = '.color20';
        var selector = '.graphical-report__legend__guide' + prefix + '-1';

        item1 = chart._layout.rightSidebar.querySelectorAll(selector)[0].parentNode.parentNode;
        svg = chart.getSVG();
        expect(svg.querySelectorAll(prefix + '-1').length).to.be.equals(1);
        expect(svg.querySelectorAll(prefix + '-2').length).to.be.equals(1);

        testUtils.simulateEvent('click', item1);

        svg = chart.getSVG();
        expect(svg.querySelectorAll(prefix + '-1').length).to.be.equals(0);
        expect(svg.querySelectorAll(prefix + '-2').length).to.be.equals(1);

        item1 = chart._layout.rightSidebar.querySelectorAll(selector)[0].parentNode.parentNode;
        expect(item1.classList.contains('disabled')).to.be.ok;
        expect(item1.querySelectorAll(prefix + '-1').length).to.be.equals(1);

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
            return _.every(elements, function (element) {
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
        "legend for size should be present",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
            plugins: [legend()]
        },
        [{
            x: 2,
            y: 2,
            color: undefined,
            size: 10

        }, {
            x: 4,
            y: 5,
            color: 'color',
            size: 123

        }],
        function (context) {
            it("should No color", function () {
                var sidebar = context.chart._layout.rightSidebar;
                var legendBlock = sidebar.querySelector('.graphical-report__legend');
                var nodeList = legendBlock.querySelectorAll('.graphical-report__legend__guide');
                expect(getText(nodeList[0])).to.equal('No color');
                expect(getText(nodeList[1])).to.equal('color');
                expect(getText(nodeList[2])).to.equal('123');
                expect(getText(nodeList[3])).to.equal('77.8');
                expect(getText(nodeList[4])).to.equal('55.2');
                expect(getText(nodeList[5])).to.equal('32.6');
                expect(getText(nodeList[6])).to.equal('10');
            });
        },
        {
            autoWidth: false
        }
    );

});