define(function(require) {
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var $ = require('jquery');
    var tauChart = require('tau_modules/tau.newCharts');
    var div, spec;


    describe('API CHART', function() {
        beforeEach(function() {
            div = document.createElement('div');
            div.style.width = 600 + 'px';
            div.style.height = 800 + 'px';
            document.body.appendChild(div);

        });

        afterEach(function() {
            div.parentNode.removeChild(div);
        });

        it('api test element events', function(done) {
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
                    }
                ]
            };
            var plot = new tauChart.Plot(config);
            plot.renderTo(div);
            var event = ['elementclick', 'elementmouseover', 'elementmouseout', 'elementmousemove'];
            event.forEach(function(e) {
                plot.on(e, function(chart, data) {
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
        it('api plugins', function() {
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
                        init: function(chart) {
                            initPlugin = chart;
                            chart.on('elementclick', function(chart) {
                                subscribeInPlugin = chart;
                            });
                        },
                        onElementClick: function(chart) {
                            autoSubscribePlugin = chart;
                        },
                        destroy: function(chart) {
                            destroyPlugin1 = chart;
                        }
                    },
                    {
                        onCustomEvent: function(chart) {
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
            var plot = new tauChart.Plot(config);
            plot.fire('elementclick');
            plot.fire('customevent');
            plot.destroy();
            assert.equal(initPlugin, plot, 'should init plugin');
            assert.equal(autoSubscribePlugin, plot, 'should auto subscribe');
            assert.equal(autoSubscribePlugin2, plot, 'should auto subscribe plugin without init');
            assert.equal(subscribeInPlugin, plot, 'should subscribe on init method');
            assert.equal(destroyPlugin1, plot, 'should destroy');

        });
        it('api test set and get data', function(done) {
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
            var plot = new tauChart.Plot(config);
            plot.renderTo(div);

            expect(plot.getData()).to.eql(config.data);
            var newData = [{x: 1, y: 2, z: 'category1'}];
            plot.on('render', function(plot, element) {
                expect(element.querySelectorAll('circle').length).to.be.equals(1);
                expect(plot.getData()).to.eql(newData);
                done();
            });
            expect(plot.setData(newData)).to.eql(config.data);

        });
    });
});