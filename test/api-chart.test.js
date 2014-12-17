define(function (require) {
    var assert = require('chai').assert;
    var Balloon = require('tau_modules/api/balloon').Tooltip;
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var $ = require('jquery');
    var tauCharts = require('tau_modules/tau.newCharts');
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

    describe('API CHART', function () {
        beforeEach(function () {
            div = document.createElement('div');
            div.style.width = 600 + 'px';
            div.style.height = 800 + 'px';
            document.body.appendChild(div);

        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('api test element events', function (done) {
            var plot = new tauCharts.Plot(config);
            plot.renderTo(div);
            var event = ['elementclick', 'elementmouseover', 'elementmouseout', 'elementmousemove'];
            event.forEach(function (e) {
                plot.on(e, function (chart, data) {
                    expect(e).to.be.ok;
                    expect(data.element).to.be.ok;
                    expect(data.elementData).to.be.ok;
                    expect(data.cellData).to.be.ok;
                    if (e === 'elementmousemove') {
                        done();
                    }

                });
            });
            function simulateEvent(name, element) {
                var evt = document.createEvent("MouseEvents");
                evt.initMouseEvent(name, true, true, window,
                    0, 0, 0, 0, 0, false, false, false, false, 0, null);
                element.dispatchEvent(evt);
            }

            simulateEvent('click', $('circle')[0]);
            simulateEvent('mouseover', $('circle')[0]);
            simulateEvent('mouseout', $('circle')[0]);
            simulateEvent('mousemove', $('circle')[0]);

        });
        it('api plugins', function () {
            var initPlugin = null;
            var autoSubscribePlugin = null;
            var autoSubscribePlugin2 = null;
            var subscribeInPlugin = null;
            var destroyPlugin1 = null;
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
                    {
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
                        }
                    },
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
        it('api test getConfig', function () {
            var plot = new tauCharts.Plot(config);
            var configChart = plot.getConfig();
            expect(schemes.config.errors(configChart)).to.not.be.ok;
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
            newConfig.data = [{x:1,y:2, z: 'category1'},{x:3,y:4, z: 'category2'},{x:3,y:1, z: 'category3'}];
            var plot = new tauCharts.Plot(newConfig);
            var id = plot.addFilter({tag:'testFilter', predicate:function(item){
                   return item.z === 'category3';
            }});

            expect(plot.getData()).to.be.eql([newConfig.data[2]]);
            var id2 = plot.addFilter({tag:'testFilter2', predicate:function(item){
                return item.z !== 'category2';
            }});
            expect(plot.getData({excludeFilter: ['testFilter']})).to.be.eql([newConfig.data[0], newConfig.data[2]]);
            plot.removeFilter(id);
            expect(plot.getData()).to.be.eql([newConfig.data[0], newConfig.data[2]]);
            plot.renderTo(div);
            var svg = plot.getSVG();
            expect(svg.querySelectorAll('.i-role-datum').length).to.be.equal(2);
            plot.removeFilter(id2);
            svg = plot.getSVG();
            expect(svg.querySelectorAll('.i-role-datum').length).to.be.equal(3);
            id = plot.addFilter({tag:'testFilter', predicate:function(item){
                return item.z === 'category3';
            }});
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
            expect(function(){
                tauCharts.api.plugins.add('myPlugins', myPlugins2);
            }).to.throw(Error);


        });
    });
});