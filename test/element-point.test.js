import {assert, expect} from 'chai';
import schemes from './utils/schemes';
import testUtils from './utils/utils';
import Taucharts from '../src/tau.charts';
import tauBrewer from '../src/addons/color-brewer';
    var getDots = testUtils.getDots;
    var hasClass = testUtils.hasClass;
    var attrib = testUtils.attrib;
    var position = testUtils.position;
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
                    avoidScalesOverflow: false,
                    x: {nice: false},
                    y: {nice: false}
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
        },
        testData,
        function (context) {
            it("should right spec", function () {
                assert.ok(schemes.scatterplotGPL(context.chart.getSpec()), 'spec is right');
            });
            it("should render point with right cord", function() {
                var dots = getDots();
                expect(dots.length).to.equal(3);
                expect(position(dots[1])).to.deep.equal({x: '0', y: '800'});
                expect(position(dots[2])).to.deep.equal({x: '800', y: '0'});
            });
            it("should render point with right size", function() {
                var dots = getDots();
                var size1 = attrib(dots[0], 'r');
                var size2 = attrib(dots[1], 'r');
                var size3 = attrib(dots[2], 'r');
                assert.equal(size1, size2, 'size should same');
                assert.notEqual(size1, size3, 'size shouldn\'t same');
            });
            it("should render point with right color", function() {
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
                    avoidScalesOverflow: false,
                    x: {nice: false},
                    y: {nice: false}
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
        function(context) {
            it("should render point with right cord", function() {
                var dots = getDots();
                expect(dots.length).to.equal(3);
                expect(position(dots[1])).to.deep.equal({x: '0', y: '800'});
                expect(position(dots[2])).to.deep.equal({x: '800', y: '0'});
            });
            it("should render point with right size", function() {
                var dots = getDots();
                var size1 = attrib(dots[0], 'r');
                var size2 = attrib(dots[1], 'r');
                var size3 = attrib(dots[2], 'r');
                assert.equal(size1, size2, 'size should same');
                assert.equal(size1, size3, 'size should same');
            });
            it("should render point with right color", function() {
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
                    x: {nice: false},
                    y: {nice: false}
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
        testData.concat({x: 3, y: 3, color: 'blue', size: 8}, {x: 4, y: 4, color: 'unknown', size: 8},{x: 5, y: 6, color: 'unknowns', size: 8}),
        function() {
            it("should render point with right color", function() {
                var dots = getDots();
                assert.ok(hasClass(dots[0], 'red'), 'has red class');
                assert.ok(hasClass(dots[1], 'green'), 'has green class');
                assert.ok(hasClass(dots[2], 'green'), 'has green class');
                assert.ok(hasClass(dots[3], 'blue'), 'has blue class');
                assert.ok(hasClass(dots[4], 'color-default'), 'should default color');
                assert.ok(hasClass(dots[5], 'color-default'), 'should default color');
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
                    x: {nice: false},
                    y: {nice: false}
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
        function() {
            it("should render point with right color", function() {
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
                    x: {nice: false},
                    y: {nice: false}
                },
                unit: [
                    {
                        type: 'ELEMENT.POINT',
                        x: 'x',
                        y: 'y',
                        color: 'color',
                        guide: {
                            color: {brewer: Taucharts.api.colorBrewers.get('tauBrewer')('YlGn', 3)}
                        }
                    }
                ]
            }
        },
        testData.concat({x: 3, y: 3, color: 'blue', size: 8}),
        function() {
            it("should render point with right color", function() {
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
                avoidScalesOverflow: false,
                x: {nice: false},
                y: {nice: false}
            },
            unit: [
                {
                    type: 'ELEMENT.POINT',
                    size: 'size'
                }
            ]
        }
    };

    var getAttr = function(attrName) {
        return function(element) {
            return d3.select(element).attr(attrName);
        };
    };

    var minimalRadius = 5;

    describePlot(
        "Point elements with large size domain",
        scatterplotSpec,
        [
            {x: 0, y: 0, size: 8},
            {x: 1, y: 1, size: 800}
        ],
        function() {
            it("should have sizes in large range", function() {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(6.5, 0); // ~ 100 * Math.pow(3.3 - 2, 2) == Math.pow(15 - 2, 2)
                expect(sizes[1]).to.be.closeTo(20, 0);
            });
        });

    describePlot(
        "Point element with small size domain",
        scatterplotSpec,
        [
            {x: 0, y: 0, size: 8},
            {x: 1, y: 1, size: 16}
        ],
        function() {
            it("should have sizes in small range", function() {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(15.6066, 0.0001);
                expect(sizes[1]).to.be.closeTo(20, 0);
            });
        });

    describePlot(
        "Point elements with  size domain values in [0..1]",
        scatterplotSpec,
        [
            {x: 0, y: 0, size: 0.08},
            {x: 1, y: 1, size: 0.16}
        ],
        function() {
            it("should have proportional sizes", function() {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(15.6066, 0.0001);
                expect(sizes[1]).to.be.closeTo(20, 0);
            });
        });

    describePlot(
        "Point elements with  size domain values including 0",
        scatterplotSpec,
        [
            {x: 0, y: 0, size: 0},
            {x: 1, y: 1, size: 4},
            {x: 1, y: 1, size: 8}
        ],
        function() {
            it("should have sizes in large range", function() {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(minimalRadius, 0);
                expect(sizes[1]).to.be.closeTo(15.6066, 0.0001);
                expect(sizes[2]).to.be.closeTo(20, 0);
            });
        });

    describePlot(
        "Scatterplot without overflow",
        {
            unit: Object.assign({}, scatterplotSpec.unit, {
                guide: {
                    avoidScalesOverflow: true,
                    x: {nice: false},
                    y: {nice: false}
                }
            })
        },
        [
            {x: 0, y: 0, size: 4},
            {x: 1, y: 1, size: 8}
        ],
        function() {
            it("Should avoid points overflow", function() {
                var dots = getDots();
                expect(dots.length).to.equal(2);
                var positions = dots.map(position);
                expect(parseFloat(positions[0].x)).to.be.closeTo(15, 1);
                expect(parseFloat(positions[0].y)).to.be.closeTo(785, 1);
                expect(parseFloat(positions[1].x)).to.be.closeTo(781, 1);
                expect(parseFloat(positions[1].y)).to.be.closeTo(19, 1);
                var sizes = dots.map(getAttr('r')).map(parseFloat);
                expect(sizes[0]).to.be.closeTo(15, 1);
                expect(sizes[1]).to.be.closeTo(19, 1);
            });
        });

    describePlot(
        "Point element with size domain values including not only finite values",
        scatterplotSpec,
        [{x: 0, y: 0, size: 0}, {x: 1, y: 1, size: 10}, {x: 1, y: 1, size: null}, {x: 1, y: 1, size: Infinity}],
        function() {

            it("should map Infinity to maximum size", function() {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[3]).to.be.equal(20);
            });

            it("should map null to 0 size", function() {
                var sizes = getDots().map(getAttr('r')).map(parseFloat);
                expect(sizes[2]).to.be.equal(sizes[0]);
            });
        });

    var describeChart = testUtils.describeChart;
    describeChart("Scatterplot event API",
        {
            type: 'scatterplot',
            x: 'y',
            y: 'x',
            label: 'y',
            color: 'color'
        },
        [
            {
                x: 1,
                y: "1",
                color: 'yellow'

            },
            {
                x: 2,
                y: "2",
                color: 'yellow'

            },
            {
                x: 3,
                y: "3",
                color: 'yellow'
            },
            {
                x: 3,
                y: "4",
                color: 'green'
            }
        ],
        function (context) {

            it("should support highlight event", function () {
                var svg0 = context.chart.getSVG();
                expect(svg0.querySelectorAll('.dot').length).to.equals(4);
                expect(svg0.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

                var pointNode = context.chart.select((n) => n.config.type === 'ELEMENT.POINT')[0];
                pointNode.fire('highlight', ((row) => (row.color === 'green')));

                var svg1 = context.chart.getSVG();
                expect(svg1.querySelectorAll('.dot').length).to.equals(4);
                expect(svg1.querySelectorAll('.dot.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.dot.graphical-report__dimmed').length).to.equals(3);

                expect(svg1.querySelectorAll('.i-role-label.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.i-role-label.graphical-report__dimmed').length).to.equals(3);

                pointNode.fire('highlight', ((row) => null));

                var svg2 = context.chart.getSVG();
                expect(svg2.querySelectorAll('.dot').length).to.equals(4);
                expect(svg2.querySelectorAll('.dot.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.dot.graphical-report__dimmed').length).to.equals(0);

                expect(svg2.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg2.querySelectorAll('.i-role-label.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.i-role-label.graphical-report__dimmed').length).to.equals(0);
            });

            it("should react on mouseover / mouseout events", function () {
                var svg0 = context.chart.getSVG();
                expect(svg0.querySelectorAll('.dot').length).to.equals(4);
                expect(svg0.querySelectorAll('.i-role-label').length).to.equals(4);
                expect(svg0.querySelectorAll('.graphical-report__highlighted').length).to.equals(0);
                expect(svg0.querySelectorAll('.graphical-report__dimmed').length).to.equals(0);

                var pointNode = context.chart.select((n) => n.config.type === 'ELEMENT.POINT')[0];
                pointNode.fire('data-hover', {data:context.chart.getData()[0]});

                var svg1 = context.chart.getSVG();
                expect(svg1.querySelectorAll('.dot').length).to.equals(4);
                expect(svg1.querySelectorAll('.dot.graphical-report__highlighted').length).to.equals(1);
                expect(svg1.querySelectorAll('.dot.graphical-report__dimmed').length).to.equals(0);

                pointNode.fire('data-hover', {});

                var svg2 = context.chart.getSVG();
                expect(svg2.querySelectorAll('.dot').length).to.equals(4);
                expect(svg2.querySelectorAll('.dot.graphical-report__highlighted').length).to.equals(0);
                expect(svg2.querySelectorAll('.dot.graphical-report__dimmed').length).to.equals(0);
            });
        },
        {
            autoWidth: false
        }
    );
    describeChart('Scatterplot points overlap',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            guide: {
                x: {nice: false},
                y: {nice: false}
            }
        },
        [
            {
                x: 1,
                y: 1,
                color: 'yellow'
            },
            {
                x: 1,
                y: 1,
                color: 'yellow'
            },
            {
                x: 1,
                y: 1,
                color: 'green'
            }
        ],
        function (context) {

            it('should raise highlighted point when overlap', function () {

                var svg = context.chart.getSVG();
                var rect = svg.getBoundingClientRect();
                var cx = ((rect.left + rect.right) / 2);
                var cy = ((rect.bottom + rect.top) / 2);
                var points = svg.querySelectorAll('.dot');

                testUtils.simulateEvent('mousemove', svg, cx, cy - 10);
                var highlighted1 = d3.select('.graphical-report__highlighted');
                expect(highlighted1.data()[0].color).to.equal('green');
                expect(document.elementFromPoint(cx, cy)).to.equal(highlighted1.node());

                testUtils.simulateEvent('mousemove', svg, cx, cy + 10);
                var highlighted2 = d3.select('.graphical-report__highlighted');
                expect(highlighted2.data()[0].color).to.equal('yellow');
                expect(document.elementFromPoint(cx, cy)).to.equal(highlighted2.node());
            });
        }
    );
