define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var modernizer = require('modernizer');
    var tauChart = require('tau_modules/tau.newCharts');
    describe("tauChart.Plot", function () {

        var spec;
        var div;
        beforeEach(function () {
            div = document.createElement('div');
            div.innerHTML = '<div id="test-div" style="width: 800px; height: 600px"></div>';
            document.body.appendChild(div);

            spec = {
                emptyContainer:'NODATA',
                dimensions: {
                    x: {type: 'measure'},
                    y: {type: 'measure'}
                },
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        unit: [
                            {
                                type: 'ELEMENT.POINT',
                                x: 'x',
                                y: 'y'
                            }
                        ]
                    }
                },
                data: [
                    {x: 1, y: 2}
                ]
            };
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it("should render default content if no data provided", function () {

            var testDiv = document.getElementById('test-div');
            spec.data = [];
            new tauChart.Plot(spec)
                .renderTo(testDiv);

            expect(testDiv.querySelector('.graphical-report__layout__content div').innerHTML).to.equal('NODATA');
        });

        it("should auto-detect dimension types", function () {

            var testDiv = document.getElementById('test-div');

            var spec = {
                emptyContainer:'NODATA',
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        unit: [
                            {
                                type: 'ELEMENT.POINT'
                            }
                        ]
                    }
                },
                data: [
                    {
                        x: 1,
                        y: 2,
                        z: 'category1',
                        o: {id: 1, name: 'ordered 1'},
                        a: 1
                    },
                    {
                        x: 11,
                        y: 22,
                        z: 'category2',
                        o: {id: 2, name: 'ordered 2'},
                        a: null
                    }
                ]
            };
            new tauChart.Plot(spec).renderTo(testDiv);

            var svg = d3.select(div).selectAll('svg');
        });

        it("should throw exception if target not found", function () {
            expect(function () {
                new tauChart.Plot(spec).renderTo('#unknown-test-div');
            }).throw('Target element not found');
        });

        it("should render to target with size (where target = element)", function () {

            new tauChart.Plot(spec)
                .renderTo(document.getElementById('test-div'), {width: 1000, height: 1000});

            var svg = d3.select(div).selectAll('svg');

            expect(svg.attr('width')).to.equal('1000');
            expect(svg.attr('height')).to.equal('1000');
        });

        it("should render to target with size (where target = ID selector)", function () {

            new tauChart.Plot(spec)
                .renderTo('#test-div', {width: 2000, height: 1000});

            var svg = d3.select(div).selectAll('svg');

            expect(svg.attr('width')).to.equal('2000');
            expect(svg.attr('height')).to.equal('1000');
        });

        it("should infer size from target (where target = element)", function () {

            var plot = new tauChart.Plot(spec);
            plot.renderTo(document.getElementById('test-div'));

            var svg = d3.select(div).selectAll('svg');
            var width = parseInt(svg.attr('width'),10);
            var height = parseInt(svg.attr('height'),10);
            var expectedWidth = 800;
            var expectedHeight = 600;
            /*if(modernizer.flexbox) {
                expect(width).to.equal(expectedWidth);
                expect(height).to.equal(expectedHeight);
            }*/


        });

        it("should infer size from target (where target = ID selector)", function () {

            var plot = new tauChart.Plot(spec);
            plot.renderTo('#test-div');

            var svg = d3.select(div).selectAll('svg');
            var width = parseInt(svg.attr('width'),10);
            var height = parseInt(svg.attr('height'),10);
            var expectedWidth = 800;
            var expectedHeight = 600;
            /*if(modernizer.flexbox) {
                expect(width).to.equal(expectedWidth);
                expect(height).to.equal(expectedHeight);
            }*/
            //todo rework resize test
            plot.resize({width:500,height:500});
            svg = d3.select(div).selectAll('svg');
            width =  parseInt(svg.attr('width'),10);
            height = parseInt(svg.attr('height'),10);
            if(modernizer.flexbox) {
                expect(width).to.equal(500);
                expect(height).to.equal(500);
            }
            plot.resize();
            svg = d3.select(div).selectAll('svg');
            width =  parseInt(svg.attr('width'),10);
            height = parseInt(svg.attr('height'),10);
            if(modernizer.flexbox) {
                expect(width).to.equal(640);
                expect(height).to.equal(600);
            }
        });

        it("should auto exclude null values", function () {

            var testDiv = document.getElementById('test-div');

            var testLog = [];
            var spec = {
                settings: {
                    excludeNull: true,
                    log: function(msg, type) {
                        testLog.push(type + ': ' + msg);
                    }
                },
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        unit: [
                            {
                                type: 'ELEMENT.POINT'
                            }
                        ]
                    }
                },
                data: [
                    {
                        x: 1,
                        y: 2,
                        z: 'category1',
                        o: {id: 1, name: 'ordered 1'},
                        a: 1
                    },
                    {
                        x: 11,
                        y: 22,
                        z: 'category2',
                        o: {id: 2, name: 'ordered 2'},
                        a: null
                    },
                    {
                        x: null,
                        y: 22,
                        z: 'category2',
                        o: {id: 2, name: 'ordered 2'},
                        a: null
                    }
                ]
            };
            new tauChart.Plot(spec).renderTo(testDiv);

            expect(testLog.length).to.equal(2);
            /*expect(testLog).to.deep.equal([
                'WARN: 2 data points were excluded, because they have undefined values.'
            ]);*/
        });

        it("should allow to leave null values", function () {

            var testDiv = document.getElementById('test-div');

            var testLog = [];
            var spec = {
                settings: {
                    excludeNull: false,
                    log: function(msg, type) {
                        testLog.push(type + ': ' + msg);
                    }
                },
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        unit: [
                            {
                                type: 'ELEMENT.POINT'
                            }
                        ]
                    }
                },
                data: [
                    {
                        x: 1,
                        y: 2,
                        z: 'category1',
                        o: {id: 1, name: 'ordered 1'},
                        a: 1
                    },
                    {
                        x: 11,
                        y: 22,
                        z: 'category2',
                        o: {id: 2, name: 'ordered 2'},
                        a: null
                    },
                    {
                        x: null,
                        y: 22,
                        z: 'category2',
                        o: {id: 2, name: 'ordered 2'},
                        a: null
                    }
                ]
            };
            new tauChart.Plot(spec).renderTo(testDiv);

            expect(testLog.length).to.equal(0);
            expect(testLog).to.deep.equal([]);
        });
    });
});