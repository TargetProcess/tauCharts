define(function (require) {
    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var legend = require('plugins/legend');
    var describeChart = testUtils.describeChart;
    var expectLegend = function(expect, chart) {
        var sidebar = chart._layout.rightSidebar;
        var legendBlock = sidebar.querySelector('.graphical-report__legend');
        expect(legendBlock).to.be.ok;
        expect(legendBlock.querySelector('.graphical-report__legend__title').textContent).to.equal('color');
        var nodeList = legendBlock.querySelectorAll('.graphical-report__legend__guide');
        expect(nodeList[0].parentNode.textContent).to.equal('yellow');
        expect(nodeList[0].classList.contains('color10-1')).to.be.ok;
        expect(nodeList[1].parentNode.textContent).to.equal('green');
        expect(nodeList[1].classList.contains('color10-2')).to.be.ok;
    };
    var chartType = ['scatterplot','line','bar','horizontalBar'];
    chartType.forEach(function(item){
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
    describeChart(
        "legend should toggle by color",
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
            color: 'yellow'

        }, {
            x: 3,
            y: 4,
            color: 'green'

        }],
        function (context) {
            it("shouldn't render spec", function (done) {
                var chart = context.chart;
                var item1 = chart._layout.rightSidebar.querySelectorAll('.graphical-report__legend__guide.color10-1')[0].parentNode;
                expect(chart.getSVG().querySelectorAll('.color10-1').length).to.be.equals(1);
                testUtils.simulateEvent('click',item1);
                var svg = chart.getSVG();
                expect(svg.querySelectorAll('.color10-1').length).to.be.equals(0);
                expect(svg.querySelectorAll('.color10-2').length).to.be.equals(1);
                item1 = chart._layout.rightSidebar.querySelectorAll('.graphical-report__legend__item')[0];
                expect(item1.classList.contains('disabled')).to.be.ok;
                expect(item1.querySelectorAll('.color10-1').length).to.be.ok;
                done();
               // testUtils.simulateEvent('click', item1);
               /* setTimeout(function(){
                    svg = chart.getSVG();

                    expect(svg.querySelectorAll('.color10-1').length).to.be.equals(1);
                    expect(item1.classList.contains('disabled')).not.be.ok;
                    done();
                });
*/
                // expectLegend(expect, context.chart);
            });
        },
        {
            autoWidth: false
        }
    );

});