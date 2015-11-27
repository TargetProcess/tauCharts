define(function (require) {

    var assert = require('chai').assert;

    var modernizer = require('bower_components/modernizer/modernizr');
    var Balloon = require('src/api/balloon').Tooltip;
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var utils = require('testUtils');
    var $ = require('jquery');
    var tauCharts = require('src/tau.charts');
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
            tauCharts.Chart.winAware = [];
            div1 = createDiv();
            div2 = createDiv();
            div3 = createDiv();
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
                if (modernizer.flexbox) {
                    var svg = chart.getSVG();
                    expect(parseInt($(svg).attr('width'))).to.be.equal(width);
                    expect(parseInt($(svg).attr('height'))).to.be.equal(height);
                }
            }

            var chart1 = new tauCharts.Chart(createConfig());
            var chart2 = new tauCharts.Chart(createConfig());
            var config3 = createConfig();
            config3.autoResize = false;
            var chart3 = new tauCharts.Chart(config3);
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
            tauCharts.Chart.resizeOnWindowEvent();
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
                tauCharts.Chart.resizeOnWindowEvent();
                expect(tauCharts.Chart.winAware.length).to.be.equals(0);
                setTimeout(function () {
                    done();
                });
            });
        });

        afterEach(function () {
            div1.parentNode.removeChild(div1);
            div2.parentNode.removeChild(div2);
            div3.parentNode.removeChild(div3);
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
                    fitModel: fitModel
                }
            };
        };

        function checkSizes(chart, width, height) {
            if (modernizer.flexbox) {
                var svg = chart.getSVG();
                expect(parseInt($(svg).attr('width'))).to.be.equal(width);
                expect(parseInt($(svg).attr('height'))).to.be.equal(height);
            }
        }

        beforeEach(function () {
            div1 = createDiv();
        });

        it('should support [entire-view] model', function () {
            var chart1 = new tauCharts.Chart(createConfig('entire-view'));
            chart1.renderTo(div1);
            checkSizes(chart1, 600, 800);
        });

        it('should support [normal] model', function () {
            var chart1 = new tauCharts.Chart(createConfig('normal'));
            chart1.renderTo(div1);
            checkSizes(chart1, 600, 800);
        });

        it('should support [fit-width] model', function () {
            var chart1 = new tauCharts.Chart(createConfig('fit-width'));
            chart1.renderTo(div1);
            checkSizes(chart1, 600, 185);
        });

        it('should support [fit-height] model', function () {
            var chart1 = new tauCharts.Chart(createConfig('fit-height'));
            chart1.renderTo(div1);
            checkSizes(chart1, 242, 800);
        });

        it('should support [minimal] model', function () {
            var chart1 = new tauCharts.Chart(createConfig('minimal'));
            chart1.renderTo(div1);
            checkSizes(chart1, 242, 220);
        });

        afterEach(function () {
            div1.parentNode.removeChild(div1);
        });
    });

    describe('API CHART', function () {

        beforeEach(function () {
            div = document.createElement('div');
            div.style.width = 600 + 'px';
            div.style.height = 800 + 'px';
            document.body.appendChild(div);
        });

        afterEach(function () {
            if (div && div.parentNode) {
                div.parentNode.removeChild(div);
            }
        });

        it('api test element events', function (done) {

            var plot = new tauCharts.Plot(config);
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

            simulateEvent('click', $('circle')[0]);
            simulateEvent('mouseover', $('circle')[0]);
            simulateEvent('mouseout', $('circle')[0]);
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
            var plot = new tauCharts.Plot(config);
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
            var plot = new tauCharts.Plot(config);
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
            var plot = new tauCharts.Plot(config);
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
            var plot = new tauCharts.Plot(config);
            plot.renderTo(div);
            var $div = $('<div>test</div>>');
            var divTest = $div.get(0);
            var res = plot.insertToHeader(divTest);

            describe('insert dom element', function () {
                expect(divTest).to.eql(res);
                expect($.contains(div.querySelector('.graphical-report__layout__header'), divTest)).to.be.ok;
                $div.remove();
            });

            describe('insert string element', function () {
                var res = plot.insertToHeader('<div><div class="my-selector">innerHtml</div></div>');
                expect('<div class="my-selector">innerHtml</div>').to.eql(res.innerHTML);
            });
        });

        it('api test insertToFooter', function () {
            var plot = new tauCharts.Plot(config);
            plot.renderTo(div);
            var $div = $('<div>test</div>>');
            var divTest = $div.get(0);
            var res = plot.insertToFooter(divTest);

            describe('insert dom element', function () {
                expect(divTest).to.eql(res);
                expect($.contains(div.querySelector('.graphical-report__layout__footer'), divTest)).to.be.ok;
                $div.remove();
            });

            describe('insert string element', function () {
                var res = plot.insertToFooter('<div><div class="my-selector">innerHtml</div></div>');
                expect('<div class="my-selector">innerHtml</div>').to.eql(res.innerHTML);
            });
        });

        it('api test set and get data', function (done) {
            var plot = new tauCharts.Plot(config);
            plot.renderTo(div);

            expect(plot.getData()).to.eql(config.data);
            var newData = [{x: 1, y: 2, z: 'category1'}];
            plot.on('render', function (plot, element) {
                expect(element.querySelectorAll('circle').length).to.be.equals(1);
                expect(plot.getData()).to.eql(newData);
                done();
            });
            expect(plot.setData(newData)).to.eql(config.data);
        });

        it('api test getSVG', function () {
            var plot = new tauCharts.Plot(config);
            var svg = plot.getSVG();
            expect(svg).to.be.equals(null);
            plot.renderTo(div);
            svg = plot.getSVG();
            expect(svg).to.eql(div.querySelectorAll('svg')[0]);
        });

        it('api test filters', function () {
            var newConfig = tauCharts.api._.clone(config);
            newConfig.data = [{x: 1, y: 2, z: 'category1'}, {x: 3, y: 4, z: 'category2'}, {x: 3, y: 1, z: 'category3'}];
            var plot = new tauCharts.Plot(newConfig);
            var id = plot.addFilter({
                tag: 'testFilter', predicate: function (item) {
                    return item.z === 'category3';
                }
            });
            plot.refresh();

            expect(plot.getData()).to.be.eql([newConfig.data[2]]);
            var id2 = plot.addFilter({
                tag: 'testFilter2', predicate: function (item) {
                    return item.z !== 'category2';
                }
            });
            plot.refresh();
            expect(plot.getData({excludeFilter: ['testFilter']})).to.be.eql([newConfig.data[0], newConfig.data[2]]);
            plot.removeFilter(id);
            plot.refresh();
            expect(plot.getData()).to.be.eql([newConfig.data[0], newConfig.data[2]]);
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
            var plot = new tauCharts.Plot(config);
            var balloon = plot.addBalloon();
            expect(balloon).to.be.instanceof(Balloon);
        });

        it('register plugins', function () {
            var myPlugins = {myPlugins: true};
            var myPlugins2 = {myPlugins: false};
            tauCharts.api.plugins.add('myPlugins', myPlugins);
            expect(tauCharts.api.plugins.get('myPlugins')).to.eql(myPlugins);
            expect(function () {
                tauCharts.api.plugins.add('myPlugins', myPlugins2);
            }).to.throw(Error);
            expect(function () {
                tauCharts.api.plugins.get('UnknownPlugin')();
            }).to.throw(Error);
        });
    });
});
