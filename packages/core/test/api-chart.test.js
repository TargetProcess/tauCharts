import {assert, expect} from 'chai';
import {Balloon} from '../src/api/balloon';
import utils from './utils/utils';
import $ from 'jquery';
import * as d3 from 'd3-selection';
import Taucharts from '../src/tau.charts';
import layers from '../plugins/layers';

    var div, spec;
    var config = {
        layoutEngine: 'DEFAULT',
        spec: {
            unit: {
                type: 'COORDS.RECT',
                guide: {
                    showGridLines: ''
                },
                x: 'x',
                y: 'y',
                unit: [
                    {type: 'ELEMENT.POINT'}
                ]
            }
        },
        data: [
            {
                x: 1,
                y: 2,
                z: 'category1'
            },
            {
                x: 2,
                y: 3,
                z: 'category3'
            }
        ]
    };

    describe('Chart resize by window sizes change', function () {

        var div1, div2, div3;

        var createDiv = function () {
            var div = document.createElement('div');
            div.style.width = 600 + 'px';
            div.style.height = 800 + 'px';
            document.body.appendChild(div);
            return div;
        };

        beforeEach(function () {
            Taucharts.Chart.winAware = [];
            div1 = createDiv();
            div2 = createDiv();
            div3 = createDiv();
            utils.noScrollStyle.create();
        });

        it('should correct handler resize', function (done) {
            var createConfig = function () {
                return {
                    type: 'bar',
                    x: 'x',
                    y: 'y',
                    data: [{x: 'el', y: 32}]
                };
            };

            function checkSizes(chart, width, height) {
                var svg = chart.getSVG();
                expect(parseInt($(svg).attr('width'))).to.be.equal(width);
                expect(parseInt($(svg).attr('height'))).to.be.equal(height);
            }

            var chart1 = new Taucharts.Chart(createConfig());
            var chart2 = new Taucharts.Chart(createConfig());
            var config3 = createConfig();
            config3.autoResize = false;
            var chart3 = new Taucharts.Chart(config3);
            chart1.renderTo(div1);
            div1.style.width = 300 + 'px';
            chart2.renderTo(div2);
            div2.style.width = 450 + 'px';
            div2.style.height = 450 + 'px';
            chart3.renderTo(div3);
            div3.style.width = 450 + 'px';
            div3.style.height = 450 + 'px';

            checkSizes(chart1, 600, 800);
            checkSizes(chart2, 600, 800);
            checkSizes(chart3, 600, 800);
            // emulate resize
            Taucharts.Chart.resizeOnWindowEvent();
            var d = $.Deferred();
            setTimeout(function () {
                checkSizes(chart1, 300, 800);
                checkSizes(chart2, 450, 450);
                checkSizes(chart3, 600, 800);
                d.resolve();
            });
            d.then(function () {
                chart1.destroy();
                chart2.destroy();
                chart3.destroy();
                Taucharts.Chart.resizeOnWindowEvent();
                expect(Taucharts.Chart.winAware.length).to.be.equals(0);
                setTimeout(function () {
                    done();
                });
            });
        });

        afterEach(function () {
            div1.parentNode.removeChild(div1);
            div2.parentNode.removeChild(div2);
            div3.parentNode.removeChild(div3);
            utils.noScrollStyle.remove();
        });
    });

    describe('Chart fit model', function () {

        var div1;

        var createDiv = function () {
            var div = document.createElement('div');
            div.style.width = 600 + 'px';
            div.style.height = 800 + 'px';
            document.body.appendChild(div);
            return div;
        };

        var createConfig = function (fitModel) {
            return {
                type: 'bar',
                x: ['x', 'y'],
                y: 'z',
                data: [
                    {x: 'TP2', y: 'Lambda', z: 1},
                    {x: 'TP3', y: 'Alaska', z: 2},

                    {x: 'TP2', y: 'Alaska', z: 5},
                    {x: 'TP3', y: 'Lambda', z: 3}
                ],
                settings: {
                    fitModel: fitModel,
                    xDensityPadding: 0,
                    yDensityPadding: 0
                }
            };
        };

        function checkSizes(chart, width, height) {
            var svg = chart.getSVG();
            expect(parseInt(svg.getAttribute('width'))).to.be.closeTo(width, 10);
            expect(parseInt(svg.getAttribute('height'))).to.be.closeTo(height, 10);
        }

        beforeEach(function () {
            div1 = createDiv();
            utils.noScrollStyle.create();
        });

        it('should support [entire-view] model', function () {
            var chart1 = new Taucharts.Chart(createConfig('entire-view'));
            chart1.renderTo(div1);
            checkSizes(chart1, 600, 800);
        });

        it('should support [normal] model', function () {
            var chart1 = new Taucharts.Chart(createConfig('normal'));
            chart1.renderTo(div1);
            checkSizes(chart1, 600, 800);
        });

        it('should support [fit-width] model', function () {
            var chart1 = new Taucharts.Chart(createConfig('fit-width'));
            chart1.renderTo(div1);
            checkSizes(chart1, 600, 218);
        });

        it('should support [fit-height] model', function () {
            var chart1 = new Taucharts.Chart(createConfig('fit-height'));
            chart1.renderTo(div1);
            checkSizes(chart1, 165, 800);
        });

        it('should support [minimal] model', function () {
            var chart1 = new Taucharts.Chart(createConfig('minimal'));
            chart1.renderTo(div1);
            checkSizes(chart1, 165, 256);
        });

        afterEach(function () {
            div1.parentNode.removeChild(div1);
            utils.noScrollStyle.remove();
        });
    });

    describe('Hide ticks for small facets', function () {

        var div;

        var createDiv = function () {
            var div = document.createElement('div');
            div.style.width = 400 + 'px';
            div.style.height = 300 + 'px';
            document.body.appendChild(div);
            return div;
        };

        var createConfig = function (fitModel) {
            return {
                type: 'bar',
                x: ['x', 'y'],
                y: ['w', 'z'],
                data: [
                    {w: 'A', x: 'TP2', y: 'Lambda', z: 1},
                    {w: 'A', x: 'TP3', y: 'Alaska', z: 2},
                    {w: 'A', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'A', x: 'TP4', y: 'Denver', z: 2},
                    {w: 'B', x: 'TP2', y: 'Lambda', z: 3},
                    {w: 'B', x: 'TP3', y: 'Alaska', z: 2},
                    {w: 'B', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'B', x: 'TP4', y: 'Alaska', z: 2},
                    {w: 'C', x: 'TP2', y: 'Lambda', z: 3},
                    {w: 'C', x: 'TP3', y: 'Alaska', z: 2},
                    {w: 'C', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'C', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'A', x: 'TP2', y: 'Alaska', z: 5},
                    {w: 'A', x: 'TP4', y: 'Lambda', z: 3},
                    {w: 'A', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'B', x: 'TP2', y: 'Alaska', z: 5},
                    {w: 'B', x: 'TP3', y: 'Lambda', z: 3},
                    {w: 'B', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'C', x: 'TP2', y: 'Alaska', z: 5},
                    {w: 'C', x: 'TP3', y: 'Lambda', z: 3},
                    {w: 'C', x: 'TP3', y: 'Denver', z: 2},
                    {w: 'C', x: 'TP3', y: 'Grisha', z: 2},
                    {w: 'C', x: 'TP4', y: 'Grisha', z: 2}
                ],
                settings: {
                    fitModel: fitModel
                }
            };
        };

        function getTicks(chart, axis) {
            return chart.getSVG().querySelectorAll(`.${axis}.axis .tick text`);
        }

        beforeEach(function () {
            div = createDiv();
            utils.noScrollStyle.create();
        });

        it('should support [normal] model', function () {
            var chart = new Taucharts.Chart(createConfig('normal'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.above(0);
            expect(getTicks(chart, 'y').length).to.be.above(0);
        });

        it('should support [entire-view] model', function () {
            var chart = new Taucharts.Chart(createConfig('entire-view'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.equal(0);
            expect(getTicks(chart, 'y').length).to.be.equal(3);
        });

        it('should support [fit-width] model', function () {
            var chart = new Taucharts.Chart(createConfig('fit-width'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.above(0);
            expect(getTicks(chart, 'y').length).to.be.equal(3);
        });

        it('should support [fit-height] model', function () {
            var chart = new Taucharts.Chart(createConfig('fit-height'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.equal(0);
            expect(getTicks(chart, 'y').length).to.be.above(0);
        });

        it('should support [minimal] model', function () {
            var chart = new Taucharts.Chart(createConfig('minimal'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.above(0);
            expect(getTicks(chart, 'y').length).to.be.above(0);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
            utils.noScrollStyle.remove();
        });
    });

    describe('Hide ticks for large density', function () {

        var div;

        var createDiv = function () {
            var div = document.createElement('div');
            div.style.width = 350 + 'px';
            div.style.height = 350 + 'px';
            document.body.appendChild(div);
            return div;
        };

        var createConfig = function (fitModel) {
            return {
                type: 'scatterplot',
                x: 'x',
                y: 'y',
                size: 'z',
                data: [
                    {x: 'A', y: 'a', z: 1},
                    {x: 'B', y: 'b', z: 2},
                    {x: 'C', y: 'c', z: 2},
                    {x: 'D', y: 'd', z: 2},
                    {x: 'E', y: 'e', z: 3},
                    {x: 'F', y: 'f', z: 2},
                    {x: 'G', y: 'g', z: 2},
                    {x: 'H', y: 'h', z: 2},
                    {x: 'I', y: 'i', z: 3},
                    {x: 'J', y: 'j', z: 2},
                    {x: 'K', y: 'k', z: 2},
                    {x: 'L', y: 'l', z: 2},
                    {x: 'M', y: 'm', z: 5},
                    {x: 'N', y: 'n', z: 3},
                    {x: 'O', y: 'o', z: 2},
                    {x: 'P', y: 'p', z: 5},
                    {x: 'Q', y: 'q', z: 3},
                    {x: 'R', y: 'r', z: 2},
                    {x: 'S', y: 's', z: 5},
                    {x: 'T', y: 't', z: 3},
                    {x: 'U', y: 'u', z: 2},
                    {x: 'V', y: 'v', z: 2},
                    {x: 'W', y: 'w', z: 2},
                    {x: 'X', y: 'x', z: 2},
                    {x: 'Y', y: 'y', z: 2},
                    {x: 'Z', y: 'z', z: 2}
                ],
                settings: {
                    fitModel: fitModel
                }
            };
        };

        function getTicks(chart, axis) {
            return chart.getSVG().querySelectorAll(`.${axis}.axis .tick text`);
        }

        beforeEach(function () {
            div = createDiv();
            utils.noScrollStyle.create();
        });

        it('should not hide axes ticks for [normal] model', function () {
            var chart = new Taucharts.Chart(createConfig('normal'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.above(0);
            expect(getTicks(chart, 'y').length).to.be.above(0);
        });

        it('should hide axes ticks for [entire-view] model', function () {
            var chart = new Taucharts.Chart(createConfig('entire-view'));
            chart.renderTo(div);
            expect(getTicks(chart, 'x').length).to.be.equal(0);
            expect(getTicks(chart, 'y').length).to.be.equal(0);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
            utils.noScrollStyle.remove();
        });
    });

    describe('Avoid chart scrollbar', function () {
        var testChart = function (avoidScrollAtRatio, expectHeight) {
            var container = document.createElement('div');
            container.style.width = '120px';
            container.style.height = '120px';
            document.body.appendChild(container);
            var scrollbar = Taucharts.api.globalSettings.getScrollbarSize(container);
            var chart = new Taucharts.Chart({
                type: 'bar',
                x: 'x',
                y: 'y',
                data: [{ x: 'o_O', y: 16 }],
                settings: {
                    fitModel: 'normal',
                    avoidScrollAtRatio: avoidScrollAtRatio
                }
            });
            chart.renderTo(container);
            var svg = chart.getSVG();
            expect(parseInt(svg.getAttribute('height')) + scrollbar.height).to.be.closeTo(expectHeight, 20);
            chart.destroy();
            document.body.removeChild(container);
        };

        testChart(1, 160);
        testChart(2, 120);
    });

    describe('Sync/async events handling', function (done) {

        var container;
        var chart;

        beforeEach(function () {
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);
        });

        afterEach(function () {
            chart.destroy();
            document.body.removeChild(container);
        });

        var createChart = function ({syncPointerEvents}) {
            chart = new Taucharts.Chart({
                type: 'bar',
                x: 'x',
                y: 'y',
                data: [
                    {x: 0, y: 16},
                    {x: 1, y: 8},
                    {x: 2, y: 16}
                ],
                settings: {
                    fitModel: 'normal',
                    syncPointerEvents
                }
            });
            chart.renderTo(container);
        };

        it('should handle events synchronously', function () {
            createChart({syncPointerEvents: true});
            var svg = chart.getSVG();
            var rects = Array.from(svg.querySelectorAll('.bar'))
                .map((el) => el.getBoundingClientRect());
            var cx = (Math.min(...rects.map(r => r.left)) + Math.max(...rects.map(r => r.right)) / 2);
            var bottom = Math.max(...rects.map(r => r.bottom));
            var getHighlightedData = (() => d3.select('.tau-chart__highlighted').data()[0]);

            utils.simulateEvent('mousemove', svg, cx, bottom);
            expect(getHighlightedData().x).to.equal(1);
        });

        it('should handle events asynchronously', function (done) {
            createChart({syncPointerEvents: false});
            var svg = chart.getSVG();
            var rects = Array.from(svg.querySelectorAll('.bar'))
                .map((el) => el.getBoundingClientRect());
            var cx = (Math.min(...rects.map(r => r.left)) + Math.max(...rects.map(r => r.right)) / 2);
            var bottom = Math.max(...rects.map(r => r.bottom));
            var getHighlightedData = (() => d3.select('.tau-chart__highlighted').data()[0]);

            utils.simulateEvent('mousemove', svg, cx, bottom);
            setTimeout(() => {
                expect(getHighlightedData().x).to.equal(1);
                done();
            }, 100);
        });

        it('should throttle pointer events', function (done) {
            createChart({syncPointerEvents: false});
            var svg = chart.getSVG();
            var rects = Array.from(svg.querySelectorAll('.bar'))
                .map((el) => el.getBoundingClientRect());
            var cx = (Math.min(...rects.map(r => r.left)) + Math.max(...rects.map(r => r.right)) / 2);
            var bottom = Math.max(...rects.map(r => r.bottom));
            var getHighlightedData = (() => d3.select('.tau-chart__highlighted').data()[0]);

            var hoverCount = 0;
            var clickCount = 0;
            const unit = chart.select(() => true)[0];
            unit.on('data-hover', () => (hoverCount++));
            unit.on('data-click', () => (clickCount++));

            utils.simulateEvent('mousemove', svg, cx, bottom);
            utils.simulateEvent('mousemove', svg, cx, bottom);
            utils.simulateEvent('mousemove', svg, cx, bottom);
            utils.simulateEvent('click', svg, cx, bottom);
            setTimeout(() => {
                expect(hoverCount).to.equal(0);
                expect(clickCount).to.equal(1);
                done();
            }, 100);
        });
    });

    describe('Highlight overflown layer elements', function () {
        var container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var chart = new Taucharts.Chart({
            type: 'line',
            x: 'date',
            y: 'value',
            data: [
                {date: '2017-01-21', value: 20, count: 8},
                {date: '2017-01-22', value: 90, count: 9},
                {date: '2017-01-23', value: 80, count: 2}
            ],
            plugins: [
                layers({
                    mode: 'dock',
                    showPanel: false,
                    layers: [
                        {
                            type: 'line',
                            y: 'count',
                            guide: {
                                nice: false
                            }
                        }
                    ]
                })
            ]
        });
        chart.renderTo(container);
        var svg = chart.getSVG();

        var points = svg.querySelectorAll('.i-data-anchor');
        var midPoints = Array.prototype.filter.call(points, (el) => d3.select(el).data()[0].date === '2017-01-22');
        var rect = midPoints[0].getBoundingClientRect();
        var cx = ((rect.left + rect.right) / 2);
        var cy = ((rect.bottom + rect.top) / 2);
        utils.simulateEvent('mousemove', svg, cx, cy - 10);
        expect(d3.select('.tau-chart__highlighted').data()[0]['Layer Type']).to.equal('count');
        utils.simulateEvent('mousemove', svg, cx, cy + 10);
        expect(d3.select('.tau-chart__highlighted').data()[0]['Layer Type']).to.equal('value');

        chart.destroy();
        document.body.removeChild(container);
    });

    describe('API CHART', function () {

        beforeEach(function () {
            div = document.createElement('div');
            div.style.width = 600 + 'px';
            div.style.height = 800 + 'px';
            document.body.appendChild(div);
            utils.noScrollStyle.create();
        });

        afterEach(function () {
            if (div && div.parentNode) {
                div.parentNode.removeChild(div);
            }
            utils.noScrollStyle.remove();
        });

        it('api test element events', function (done) {

            var plot = new Taucharts.Plot(config);
            plot.renderTo(div);
            var simulateEvent = utils.simulateEvent;
            var event = ['elementclick', 'elementmouseover', 'elementmouseout'];
            event.forEach(function (e) {
                plot.on(e, function (chart, ev) {
                    expect(ev).to.be.ok;
                    expect(ev.element).to.be.ok;
                    expect(ev.data).to.be.ok;
                    expect(ev.element).to.be.ok;
                    if (e === 'elementmouseout') {
                        done();
                    }

                });
            });

            simulateEvent('click', document.querySelector('circle'));
            simulateEvent('mouseover', document.querySelector('circle'));
            simulateEvent('mouseout', document.querySelector('circle'));
        });

        it('api plugins', function () {

            var initPlugin = null;
            var autoSubscribePlugin = null;
            var autoSubscribePlugin2 = null;
            var subscribeInPlugin = null;
            var destroyPlugin1 = null;
            var newVar = {
                init: function (chart) {
                    initPlugin = chart;
                    chart.on('elementclick', function (chart) {
                        subscribeInPlugin = chart;
                    });
                },
                onElementClick: function (chart) {
                    autoSubscribePlugin = chart;
                },
                destroy: function (chart) {
                    destroyPlugin1 = chart;
                    // should call with context plugin
                    expect(newVar).to.eql(this);
                }
            };
            var config = {

                layoutEngine: 'DEFAULT',
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        guide: {

                            showGridLines: ''

                        },
                        x: 'x',
                        y: 'y',
                        unit: [
                            {type: 'ELEMENT.POINT'}
                        ]
                    }
                },
                plugins: [
                    newVar,
                    {
                        onCustomEvent: function (chart) {
                            autoSubscribePlugin2 = chart;
                        }
                    }
                ],
                data: [
                    {
                        x: 1,
                        y: 2,
                        z: 'category1'
                    },
                    {
                        x: 2,
                        y: 3,
                        z: 'category3'
                    }
                ]
            };
            var plot = new Taucharts.Plot(config);
            plot.fire('elementclick');
            plot.fire('customevent');
            plot.destroy();
            assert.equal(initPlugin, plot, 'should init plugin');
            assert.equal(autoSubscribePlugin, plot, 'should auto subscribe');
            assert.equal(autoSubscribePlugin2, plot, 'should auto subscribe plugin without init');
            assert.equal(subscribeInPlugin, plot, 'should subscribe on init method');
            assert.equal(destroyPlugin1, plot, 'should destroy');
        });

        it('api test insertToRightSidebar', function () {
            var plot = new Taucharts.Plot(config);
            plot.renderTo(div);
            var $div = $('<div>test</div>>');
            var divTest = $div.get(0);
            var res = plot.insertToRightSidebar(divTest);

            describe('insert dom element', function () {
                expect(divTest).to.eql(res);
                $div.remove();
            });

            describe('insert string element', function () {
                var res = plot.insertToRightSidebar('<div><div class="my-selector">innerHtml</div></div>');
                expect('<div class="my-selector">innerHtml</div>').to.eql(res.innerHTML);
            });
        });

        it('api test insertToLeftSidebar', function () {
            var plot = new Taucharts.Plot(config);
            plot.renderTo(div);
            var $div = $('<div>test</div>>');
            var divTest = $div.get(0);
            var res = plot.insertToLeftSidebar(divTest);

            describe('insert dom element', function () {
                expect(divTest).to.eql(res);
                $div.remove();
            });

            describe('insert string element', function () {
                var res = plot.insertToLeftSidebar('<div><div class="my-selector">innerHtml</div></div>');
                expect('<div class="my-selector">innerHtml</div>').to.eql(res.innerHTML);
            });
        });

        it('api test insertToHeader', function () {
            var plot = new Taucharts.Plot(config);
            plot.renderTo(div);
            var $div = $('<div>test</div>>');
            var divTest = $div.get(0);
            var res = plot.insertToHeader(divTest);

            describe('insert dom element', function () {
                expect(divTest).to.eql(res);
                expect($.contains(div.querySelector('.tau-chart__layout__header'), divTest)).to.be.ok;
                $div.remove();
            });

            describe('insert string element', function () {
                var res = plot.insertToHeader('<div><div class="my-selector">innerHtml</div></div>');
                expect('<div class="my-selector">innerHtml</div>').to.eql(res.innerHTML);
            });
        });

        it('api test insertToFooter', function () {
            var plot = new Taucharts.Plot(config);
            plot.renderTo(div);
            var $div = $('<div>test</div>>');
            var divTest = $div.get(0);
            var res = plot.insertToFooter(divTest);

            describe('insert dom element', function () {
                expect(divTest).to.eql(res);
                expect($.contains(div.querySelector('.tau-chart__layout__footer'), divTest)).to.be.ok;
                $div.remove();
            });

            describe('insert string element', function () {
                var res = plot.insertToFooter('<div><div class="my-selector">innerHtml</div></div>');
                expect('<div class="my-selector">innerHtml</div>').to.eql(res.innerHTML);
            });
        });

        it('api test set and get data', function (done) {
            var plot = new Taucharts.Plot(config);
            plot.renderTo(div);

            expect(plot.getChartModelData()).to.eql(config.data);
            var newData = [{x: 1, y: 2, z: 'category1'}];
            plot.on('render', function (plot, element) {
                expect(element.querySelectorAll('circle').length).to.be.equals(1);
                expect(plot.getChartModelData()).to.eql(newData);
                done();
            });
            expect(plot.setData(newData)).to.eql(config.data);
        });

        it('api test getSVG', function () {
            var plot = new Taucharts.Plot(config);
            var svg = plot.getSVG();
            expect(svg).to.be.equals(null);
            plot.renderTo(div);
            svg = plot.getSVG();
            expect(svg).to.eql(div.querySelectorAll('svg')[0]);
        });

        it('api test filters', function () {
            var newConfig = Object.assign({}, config);
            newConfig.data = [{x: 1, y: 2, z: 'category1'}, {x: 3, y: 4, z: 'category2'}, {x: 3, y: 1, z: 'category3'}];
            var plot = new Taucharts.Plot(newConfig);
            var id = plot.addFilter({
                tag: 'testFilter', predicate: function (item) {
                    return item.z === 'category3';
                }
            });
            plot.refresh();

            expect(plot.getChartModelData()).to.be.eql([newConfig.data[2]]);
            var id2 = plot.addFilter({
                tag: 'testFilter2', predicate: function (item) {
                    return item.z !== 'category2';
                }
            });
            plot.refresh();
            expect(plot.getChartModelData({excludeFilter: ['testFilter']})).to.be.eql([newConfig.data[0], newConfig.data[2]]);
            plot.removeFilter(id);
            plot.refresh();
            expect(plot.getChartModelData()).to.be.eql([newConfig.data[0], newConfig.data[2]]);
            plot.renderTo(div);
            var svg = plot.getSVG();
            expect(svg.querySelectorAll('.i-role-datum').length).to.be.equal(2);
            plot.removeFilter(id2);
            plot.refresh();
            svg = plot.getSVG();
            expect(svg.querySelectorAll('.i-role-datum').length).to.be.equal(3);
            plot.addFilter({
                tag: 'testFilter', predicate: function (item) {
                    return item.z === 'category3';
                }
            });
            plot.refresh();
            svg = plot.getSVG();
            expect(svg.querySelectorAll('.i-role-datum').length).to.be.equal(1);
        });

        it('api test add balloon', function () {
            var plot = new Taucharts.Plot(config);
            var balloon = plot.addBalloon();
            expect(balloon).to.be.instanceof(Balloon);
        });

        it('register plugins', function () {
            var myPlugins = {myPlugins: true};
            var myPlugins2 = {myPlugins: false};
            Taucharts.api.plugins.add('myPlugins', myPlugins);
            expect(Taucharts.api.plugins.get('myPlugins')).to.eql(myPlugins);
            expect(function () {
                Taucharts.api.plugins.add('myPlugins', myPlugins2);
            }).to.throw(Error);
            expect(function () {
                Taucharts.api.plugins.get('UnknownPlugin')();
            }).to.throw(Error);
        });
    });
