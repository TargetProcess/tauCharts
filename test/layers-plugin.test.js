define(function (require) {
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
            expect(chart.getSVG().querySelectorAll('.bar').length).to.equal(4);
        });

        it('should keep setData() / getData() / getChartModelData() consistent', function () {

            chart = new tauCharts.Chart({
                type: 'scatterplot',
                x: 'x',
                y: 'y0',
                data: [
                    {id: 0, x: 0, y0: 10, y1: 110, color: 'A'},
                    {id: 1, x: 1, y0: 11, y1: 111, color: 'A'},
                    {id: 2, x: 2, y0: 12, y1: 112, color: 'A'}
                ],
                plugins: [layers({
                    layers: [
                        {
                            type: 'bar',
                            y: 'y1'
                        }
                    ]
                })]
            });
            chart.renderTo(element, {width: 800, height: 800});

            var xMap = function (row) {
                var l = row['Layer Type'];
                return row['id'] + ':' + l;
            };

            var data0 = chart.getData();
            expect(data0.map((x) => x.id).join(',')).to.equal('0,1,2');
            var chartModelData0 = chart.getChartModelData();
            expect(chartModelData0.map(xMap).join(',')).to.equal('0:y0,0:y1,1:y0,1:y1,2:y0,2:y1');
            var dims0 = chart.getDataDims();
            var keys0 = Object.keys(dims0).join(',');
            expect(keys0).to.equal('id,x,y0,y1,color');

            chart.setData([
                {id: 6, x: 10, y0: 11, y1: 1, color: 'A'},
                {id: 7, x: 11, y0: 12, y1: 2, color: 'B'},
                {id: 8, x: 12, y0: 13, y1: 3, color: 'B'},
                {id: 9, x: 13, y0: 14, y1: 4, color: 'A'}
            ]);

            var data1 = chart.getData();
            expect(data1.map((x) => x.id).join(',')).to.equal('6,7,8,9');
            var chartModelData1 = chart.getChartModelData();
            expect(chartModelData1.map(xMap).join(',')).to.equal('6:y0,6:y1,7:y0,7:y1,8:y0,8:y1,9:y0,9:y1');
            var dims1 = chart.getDataDims();
            var keys1 = Object.keys(dims1).join(',');
            expect(keys1).to.equal('id,x,y0,y1,color');
        });
    });
});