define(function (require) {
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var $ = require('jquery');
    var tauChart = require('tau_modules/tau.newCharts');
    var div, spec;


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

        it('api test', function (done) {
            var config = {


               /* type: 'scatterplot',
                guide: {
                    x: {label: 'fdasfdsa'},
                    showGridLines: ''
                },
                x: 'x',
                y: 'y',*/
                layoutEngine: 'DEFAULT',
                spec:{unit: {
                type: 'COORDS.RECT',
                    guide: {

                    showGridLines: ''

                },
                x: 'x',
                    y: 'y',
                    unit: [

                    { type: 'ELEMENT.POINT' }
                ]
            }},

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
            plot.on('elementclick', function (chart) {
                expect('elementclick').to.be.ok;
                //done();
            });
            plot.on('elementmouseover', function (chart) {
                expect('elementclick').to.be.ok;
                done();
            });
            var svg = d3.select(div).selectAll('svg');
            expect(svg.attr('width')).to.equal('600');
            expect(svg.attr('height')).to.equal('800');
            function simulateEvent(name,element) {
                var evt = document.createEvent("MouseEvents");
                evt.initMouseEvent(name, true, true, window,
                    0, 0, 0, 0, 0, false, false, false, false, 0, null);
                element.dispatchEvent(evt);
            }
            expect(plot.getData()).to.eql(config.data);

            simulateEvent('click',$('circle')[0]);
            simulateEvent('mouseover',$('circle')[0]);

        });
    });
});