define(function (require) {

    var _ = require('underscore');
    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var layers = require('plugins/layers');
    var tauCharts = require('src/tau.charts');

    describe('layers plugin', function () {

        var chart = null;
        var error = [];
        var element = null;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            tauCharts.Plot.globalSettings.log = function (msg) {
                error.push(msg);
            };
        });

        afterEach(function () {
            chart.destroy();
            element.parentNode.removeChild(element);
            error = [];
        });

        it('should be applied for measure scales', function () {

            chart = new tauCharts.Chart({
                type: 'scatterplot',
                x: 'x',
                y: 'y',
                data: [
                    {x: 'A', y: 0, r0: 1},
                    {x: 'B', y: 10, r0: 11},
                    {x: 'C', y: 100, r0: 111}
                ],
                plugins: [layers({
                    layers: [
                        {
                            type: 'area',
                            y: 'r0'
                        }
                    ]
                })]
            });
            chart.renderTo(element, {width: 800, height: 800});
            expect(error.length).to.equal(0);
        });

        it('should be error when applied to non-measure Y scale', function () {

            chart = new tauCharts.Chart({
                type: 'scatterplot',
                x: 'x',
                y: 'y',
                data: [
                    {x: 'A', y: 'X', r0: 1},
                    {x: 'B', y: 'Y', r0: 11},
                    {x: 'C', y: 'Z', r0: 111}
                ],
                plugins: [layers({
                    layers: [
                        {
                            type: 'area',
                            y: 'r0'
                        }
                    ]
                })]
            });
            chart.renderTo(element, {width: 800, height: 800});
            expect(error.length).to.equal(1);
            expect(error[0]).to.equal('[layers plugin]: is not applicable. Y scale is not a measure');
        });

        it('should be error when applied to non-rect coordinates', function () {

            chart = new tauCharts.Chart({
                type: 'parallel',
                columns: ['x', 'y'],
                data: [
                    {x: 'A', y: 'X', r0: 1},
                    {x: 'B', y: 'Y', r0: 11},
                    {x: 'C', y: 'Z', r0: 111}
                ],
                plugins: [layers({
                    layers: [
                        {
                            type: 'area',
                            y: 'r0'
                        }
                    ]
                })]
            });
            chart.renderTo(element, {width: 800, height: 800});
            expect(error.length).to.equal(1);
            expect(error[0]).to.equal('[layers plugin]: is not applicable. Chart specification contains non-rectangular coordinates');
        });

        it('should work with setData() method', function () {

            chart = new tauCharts.Chart({
                type: 'bar',
                x: 'x',
                y: 'y',
                data: [
                    {x: 'A', y: 0, r0: 1},
                    {x: 'B', y: 10, r0: 11},
                    {x: 'C', y: 100, r0: 111}
                ],
                plugins: [layers({
                    layers: [
                        {
                            type: 'scatterplot',
                            y: 'r0'
                        }
                    ]
                })]
            });
            chart.renderTo(element, {width: 800, height: 800});

            expect(chart.getSVG().querySelectorAll('.dot').length).to.equal(3);
            chart.setData([
                {x: 'A', y: 0, r0: 1},
                {x: 'B', y: 10, r0: 11},
                {x: 'C', y: 100, r0: 111},
                {x: 'D', y: 1000, r0: 1111},
                {x: 'E', y: 1001, r0: 11111},
                {x: 'F', y: 1002, r0: 111111}
            ]);
            expect(chart.getSVG().querySelectorAll('.dot').length).to.equal(6);
        });

        it('should allow stacked bar with missed values in data', function () {

            chart = new tauCharts.Chart({
                type: 'scatterplot',
                x: 'x',
                y: 'y',
                data: [
                    {x: 'A', y: 0,      r0: 1,      r1: 2   },
                    {x: 'B', y: 10                          },
                    {x: 'C', y: 100,    r0: 111             },
                    {x: 'D', y: 1000,               r1: 1112},
                    {x: 'E', y: 11                          }
                ],
                plugins: [layers({
                    layers: [
                        {
                            type: 'stacked-bar',
                            y: ['r0', 'r1']
                        }
                    ]
                })]
            });
            chart.renderTo(element, {width: 800, height: 800});

            expect(chart.getSVG().querySelectorAll('.dot').length).to.equal(5);
            expect(chart.getSVG().querySelectorAll('.bar-stack').length).to.equal(4);
        });
    });
});