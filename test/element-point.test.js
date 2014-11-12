define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauBrewer = require('brewer');
    var testUtils = require('testUtils');
    var tauCharts = require('tau_modules/tau.newCharts');
    var getDots = testUtils.getDots;
    var hasClass = testUtils.hasClass;
    var attrib = testUtils.attrib;
    var position = testUtils.position;
    var assert = require('chai').assert;
    var testData = [
        {x: 1, y: 1, color: 'red', size: 6},
        {x: 0.5, y: 0.5, color: 'green', size: 6},
        {x: 2, y: 2, color: 'green', size: 8}
    ];

    var describePlot = testUtils.describePlot;

    describePlot(
        "Point element with all params",
        {
            unit: {
                guide: {
                    x: { autoScale: false },
                    y: { autoScale: false }
                },
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                unit: [
                    {
                        type: 'ELEMENT.POINT',
                        x: 'x',
                        y: 'y',
                        color: 'color',
                        size: 'size'
                    }
                ]
            }
        }
        , testData
        , function (context) {
            it("should right spec", function () {
                assert.ok(schemes.scatterplot(context.chart.config.spec), 'spec is right');
            });
            it("should render point with right cord", function () {
                var dots = getDots();
                expect(dots.length).to.equal(3);
                expect(position(dots[1])).to.deep.equal({x: '0', y: '800'});
                expect(position(dots[2])).to.deep.equal({x: '800', y: '0'});
            });
            it("should render point with right size", function () {
                var dots = getDots();
                var size1 = attrib(dots[0], 'r');
                var size2 = attrib(dots[1], 'r');
                var size3 = attrib(dots[2], 'r');
                assert.equal(size1, size2, 'size should same');
                assert.notEqual(size1, size3, 'size shouldn\'t same');
            });
            it("should render point with right color", function () {
                var dots = getDots();
                var size1 = attrib(dots[0], 'class');
                var size2 = attrib(dots[1], 'class');
                var size3 = attrib(dots[2], 'class');
                assert.equal(size2, size3, 'size should same');
                assert.notEqual(size1, size2, 'size shouldn\'t same');
            });
        });

    describePlot("Point element without color and size params",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                guide: {
                    x: { autoScale: false },
                    y: { autoScale: false }
                },
                unit: [
                    {
                        type: 'ELEMENT.POINT',
                        x: 'x',
                        y: 'y'
                    }
                ]
            }
        },
        testData,
        function (context) {
            it("should render point with right cord", function () {
                var dots = getDots();
                expect(dots.length).to.equal(3);
                expect(position(dots[1])).to.deep.equal({x: '0', y: '800'});
                expect(position(dots[2])).to.deep.equal({x: '800', y: '0'});
            });
            it("should render point with right size", function () {
                var dots = getDots();
                var size1 = attrib(dots[0], 'r');
                var size2 = attrib(dots[1], 'r');
                var size3 = attrib(dots[2], 'r');
                assert.equal(size1, size2, 'size should same');
                assert.equal(size1, size3, 'size should same');
            });
            it("should render point with right color", function () {
                var dots = getDots();
                var size1 = attrib(dots[0], 'class');
                var size2 = attrib(dots[1], 'class');
                var size3 = attrib(dots[2], 'class');
                assert.equal(size2, size3, 'size should same');
                assert.equal(size1, size2, 'size should same');
            });
        });

    describePlot(
        "Point element color was presented  with brewer as object",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                guide: {
                    x: { autoScale: false },
                    y: { autoScale: false }
                },
                unit: [
                    {
                        type: 'ELEMENT.POINT',
                        x: 'x',
                        y: 'y',
                        color: 'color',
                        guide: {
                            color: {
                                brewer: {red: 'red', green: 'green', blue: 'blue'}
                            }
                        }
                    }
                ]
            }
        },
        testData.concat({x: 3, y: 3, color: 'blue', size: 8}),
        function () {
            it("should render point with right color", function () {
                var dots = getDots();
                assert.ok(hasClass(dots[0], 'red'), 'has red class');
                assert.ok(hasClass(dots[1], 'green'), 'has green class');
                assert.ok(hasClass(dots[2], 'green'), 'has green class');
                assert.ok(hasClass(dots[3], 'blue'), 'has blue class');
            });
        });

    describePlot(
        "Point element color was presented  with brewer as array",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                guide: {
                    x: { autoScale: false },
                    y: { autoScale: false }
                },
                unit: [
                    {
                        type: 'ELEMENT.POINT',
                        x: 'x',
                        y: 'y',
                        color: 'color',
                        guide: {
                            color: {brewer: tauBrewer('YlGn', 3)}
                        }
                    }
                ]
            }
        },
        testData.concat({x: 3, y: 3, color: 'blue', size: 8}),
        function () {
            it("should render point with right color", function () {
                var dots = getDots();
                assert.ok(hasClass(dots[0], 'YlGn q0-3'), 'has brewer class');
                assert.ok(hasClass(dots[1], 'YlGn q1-3'), 'has brewer class');
                assert.ok(hasClass(dots[2], 'YlGn q1-3'), 'has brewer class');
                assert.ok(hasClass(dots[3], 'YlGn q2-3'), 'has brewer class');
            });
        });

    describePlot(
        "Point element color was presented  with brewer as array an register to tauChart",
        {
            unit: {
                type: 'COORDS.RECT',
                x: 'x',
                y: 'y',
                guide: {
                    x: { autoScale: false },
                    y: { autoScale: false }
                },
                unit: [
                    {
                        type: 'ELEMENT.POINT',
                        x: 'x',
                        y: 'y',
                        color: 'color',
                        guide: {
                            color: {brewer: tauCharts.api.colorBrewers.get('tauBrewer')('YlGn', 3)}
                        }
                    }
                ]
            }
        },
        testData.concat({x: 3, y: 3, color: 'blue', size: 8}),
        function () {
            it("should render point with right color", function () {
                var dots = getDots();
                assert.ok(hasClass(dots[0], 'YlGn q0-3'), 'has brewer class');
                assert.ok(hasClass(dots[1], 'YlGn q1-3'), 'has brewer class');
                assert.ok(hasClass(dots[2], 'YlGn q1-3'), 'has brewer class');
                assert.ok(hasClass(dots[3], 'YlGn q2-3'), 'has brewer class');
            });
        });

    var scatterplotSpec = {
        unit: {
            type: 'COORDS.RECT',
            x: 'x',
            y: 'y',
            guide: {
                x: { autoScale: false },
                y: { autoScale: false }
            },
            unit: [
                {
                    type: 'ELEMENT.POINT',
                    size: 'size'
                }
            ]
        }
    };

    var getAttr = function (attrName) {
        return function (element) {
            return d3.select(element).attr(attrName);
        }
    };

    describePlot(
        "Point elements with large size domain",
        scatterplotSpec,
        [{x: 0, y: 0, size: 8}, {x: 1, y: 1, size: 800}],
        function () {
            it("should have sizes in large range", function () {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(1, 1);
                expect(sizes[1]).to.be.closeTo(8, 1);
            })
        });

    describePlot(
        "Point element with small size domain",
        scatterplotSpec,
        [{x: 0, y: 0, size: 8}, {x: 1, y: 1, size: 16}],
        function () {
            it("should have sizes in small range", function () {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(5, 1);
                expect(sizes[1]).to.be.closeTo(8, 1);
            })
        });

    describePlot(
        "Point elements with  size domain values in [0..1]",
        scatterplotSpec,
        [{x: 0, y: 0, size: 0.08}, {x: 1, y: 1, size: 0.16}],
        function () {
            it("should have proportional sizes", function () {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(5, 1);
                expect(sizes[1]).to.be.closeTo(8, 1);
            })
        });

    describePlot(
        "Point elements with  size domain values including 0",
        scatterplotSpec,
        [{x: 0, y: 0, size: 0}, {x: 1, y: 1, size: 5}, {x: 1, y: 1, size: 8}],
        function () {
            it("should have sizes in large range", function () {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(2, 1);
                expect(sizes[1]).to.be.closeTo(6, 1);
                expect(sizes[2]).to.be.closeTo(8, 1);
            })
        });

    describePlot(
        "Point element with size domain values including not only finite values",
        scatterplotSpec,
        [{x: 0, y: 0, size: 0}, {x: 1, y: 1, size: 10}, {x: 1, y: 1, size: null}, {x: 1, y: 1, size: Infinity}],
        function () {
            it("should map Infinity to maximum size", function () {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[3]).to.be.closeTo(sizes[1], 0.1);
            });

            it("should map null to maximum size", function () {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[2]).to.be.closeTo(sizes[0], 0.1);
            });
        })
});