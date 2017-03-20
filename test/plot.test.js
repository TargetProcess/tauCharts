define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var modernizer = require('bower_components/modernizer/modernizr');
    var CSS_PREFIX = require('src/const').CSS_PREFIX;
    var tauChart = require('src/tau.charts');
    var TaskRunner = require('src/charts/task-runner').default;
    var utils = require('testUtils');
    var range = require('src/utils/utils').utils.range;

    describe('tauChart.Plot', function () {

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

            utils.noScrollStyle.create();
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
            utils.noScrollStyle.remove();
        });

        it('should support destroy() method', function () {
            var testDiv = document.getElementById('test-div');
            var plot = new tauChart.Plot(spec);
            plot.renderTo(testDiv);
            expect(testDiv.innerHTML).to.be.not.equal('');
            plot.destroy();
            expect(testDiv.innerHTML).to.be.equal('');
        });

        it('should render default content if no data provided', function () {

            var testDiv = document.getElementById('test-div');
            spec.data = [];
            new tauChart.Plot(spec)
                .renderTo(testDiv);

            expect(testDiv.querySelector('.graphical-report__layout__content div').innerHTML).to.equal('NODATA');
        });

        it('should auto-detect dimension types', function () {

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

        it('should throw exception if target not found', function () {
            expect(function () {
                new tauChart.Plot(spec).renderTo('#unknown-test-div');
            }).throw('Target element not found');
        });

        it('should render to target with size (where target = element)', function () {

            new tauChart.Plot(spec)
                .renderTo(document.getElementById('test-div'), {width: 1000, height: 1000});

            var svg = d3.select(div).selectAll('svg');

            expect(svg.attr('width')).to.equal('1000');
            expect(svg.attr('height')).to.equal('1000');
        });

        it('should render to target with size (where target = ID selector)', function () {

            new tauChart.Plot(spec)
                .renderTo('#test-div', {width: 2000, height: 1000});

            var svg = d3.select(div).selectAll('svg');

            expect(svg.attr('width')).to.equal('2000');
            expect(svg.attr('height')).to.equal('1000');
        });

        it('should infer size from target (where target = element)', function () {

            var plot = new tauChart.Plot(spec);
            plot.renderTo(document.getElementById('test-div'));

            var svg = d3.select(div).selectAll('svg');
            var width = parseInt(svg.attr('width'), 10);
            var height = parseInt(svg.attr('height'), 10);
            var expectedWidth = 800;
            var expectedHeight = 600;
            if (modernizer.flexbox) {
                expect(width).to.equal(expectedWidth);
                expect(height).to.equal(expectedHeight);
            }
        });

        it('should infer size from target (where target = ID selector)', function () {

            var plot = new tauChart.Plot(spec);
            plot.renderTo('#test-div');

            var svg = d3.select(div).selectAll('svg');
            var width = parseInt(svg.attr('width'), 10);
            var height = parseInt(svg.attr('height'), 10);
            var expectedWidth = 800;
            var expectedHeight = 600;
            if (modernizer.flexbox) {
                expect(width).to.equal(expectedWidth);
                expect(height).to.equal(expectedHeight);
            }

            plot.resize({width: 500, height: 500});
            svg = d3.select(div).selectAll('svg');
            width = parseInt(svg.attr('width'), 10);
            height = parseInt(svg.attr('height'), 10);
            if (modernizer.flexbox) {
                expect(width).to.equal(500);
                expect(height).to.equal(500);
            }

            plot.resize();
            svg = d3.select(div).selectAll('svg');
            width = parseInt(svg.attr('width'), 10);
            height = parseInt(svg.attr('height'), 10);
            if (modernizer.flexbox) {
                expect(width).to.equal(expectedWidth);
                expect(height).to.equal(expectedHeight);
            }
        });

        it('should auto exclude null values', function () {

            var testDiv = document.getElementById('test-div');

            var testLog = [];
            var spec = {
                settings: {
                    excludeNull: true,
                    log: function (msg, type) {
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

        it('should allow to leave null values', function () {

            var testDiv = document.getElementById('test-div');

            var testLog = [];
            var spec = {
                settings: {
                    excludeNull: false,
                    log: function (msg, type) {
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

        it('should support [select] method', function () {
            var testDiv = document.getElementById('test-div');
            var spec = {
                settings: {
                    layoutEngine: 'NONE'
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
                        y: 2
                    },
                    {
                        x: 11,
                        y: 22
                    },
                    {
                        x: 33,
                        y: 22
                    }
                ]
            };

            var plot = new tauChart.Plot(spec);

            var nonReady = plot.select(function (unitNode) {
                return true;
            });
            expect(nonReady.length).to.equal(0);

            plot.renderTo(testDiv);

            var allElements = plot.select(function (unitNode) {
                return true;
            });
            expect(allElements.length).to.equal(2);
            expect(allElements[0].config.type).to.equal('COORDS.RECT');
            expect(allElements[1].config.type).to.equal('ELEMENT.POINT');

            var someElements = plot.select(function (unitNode) {
                return unitNode.config.type === 'ELEMENT.POINT';
            });
            expect(someElements.length).to.equal(1);
            expect(someElements[0].config.type).to.equal('ELEMENT.POINT');
        });

        it('should support [onUnitsStructureExpanded] event', function () {
            var testDiv = document.getElementById('test-div');
            var spec = {

                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'a',
                        y: 'b',
                        unit: [
                            {
                                type: 'COORDS.RECT',
                                x: 'c',
                                y: 'd',
                                unit: [
                                    {
                                        type: 'ELEMENT.POINT'
                                    }
                                ]
                            }
                        ]
                    }
                },
                data: [0, 1, 2].map(function (i) {
                    return {
                        a: 'ABCD' + i,
                        b: 'TICK' + i,
                        c: i * 10,
                        d: i * 100
                    };
                })
            };

            var plot = new tauChart.Plot(spec);

            var expected = false;
            var liveSpec;
            var expectedPath = [];

            plot.on('unitsstructureexpanded', function (x) {
                expected = true;
                liveSpec = plot.getSpec();
                plot.traverseSpec(liveSpec, (node, parentNode, parentFrame) => {
                    expectedPath.push(node.type + '(' + JSON.stringify((parentFrame || {}).key) + ')');
                });
            });

            plot.renderTo(testDiv);

            expect(expected).to.equal(true);
            expect(expectedPath).to.deep.equal(
                [
                    'COORDS.RECT(undefined)',
                    'COORDS.RECT({"a":"ABCD0","b":"TICK0"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD1","b":"TICK0"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD2","b":"TICK0"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD0","b":"TICK1"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD1","b":"TICK1"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD2","b":"TICK1"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD0","b":"TICK2"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD1","b":"TICK2"})',
                    'ELEMENT.POINT(null)',
                    'COORDS.RECT({"a":"ABCD2","b":"TICK2"})',
                    'ELEMENT.POINT(null)'
                ]
            );
        });

        it('should throw exception on invalid spec', function () {

            var spec = {
                // no spec property
                data: [{a:1, b: 2}]
            };

            var plot;
            expect(function () {
                plot = new tauChart.Plot(spec);
            }).to.throw('Provide spec for plot');
        });

        it('should throw if operator is not supported', function () {
            var testDiv = document.getElementById('test-div');
            expect(function () {
                new tauChart.Plot({
                    sources: {
                        '?': {
                            dims: {},
                            data: []
                        },
                        '/': {
                            dims: {
                                a: {type: 'category'},
                                b: {type: 'category'}
                            },
                            data: [
                                {
                                    a: 'a',
                                    b: 'b'
                                }
                            ]
                        }
                    },

                    scales: {
                        a: {type: 'ordinal', source: '/', dim: 'a'},
                        b: {type: 'ordinal', source: '/', dim: 'b'}
                    },

                    unit: {
                        type: 'COORDS.RECT',
                        x: 'a',
                        y: 'b',
                        expression: {
                            inherit: false,
                            source: '/',
                            operator: '',
                            params: []
                        },
                        units: [
                            {
                                type: 'ELEMENT.INTERVAL',
                                x: 'a',
                                y: 'b',
                                expression: {
                                    source: '/',
                                    operator: 'blahblah',
                                    params: ['a'],
                                    inherit: true
                                }
                            }
                        ]
                    }
                }).renderTo(testDiv);
            }).to.throw('blahblah operator is not supported');
        });

        it('should allow spec with raw frames', function () {

            var testDiv = document.getElementById('test-div');

            var spec = {

                settings: {fitModel: 'none'},

                sources: {
                    '?': {
                        dims: {},
                        data: []
                    },

                    '$': {
                        dims: {
                            x: {type: 'category'},
                            y: {type: 'category'}
                        },
                        data: [
                            {x: 1, y: 1}
                        ]
                    }
                },

                scales: {
                    'xScale': {type: 'ordinal', source: '$', dim: 'x'},
                    'yScale': {type: 'ordinal', source: '$', dim: 'y'}
                },

                unit: {
                    type: "COORDS.RECT",
                    x: 'xScale',
                    y: 'yScale',
                    expression: {
                        source: '$',
                        inherit: false,
                        operator: false
                    },
                    guide: {
                        showGridLines: ""
                    },
                    frames: [
                        {
                            key: {x: 1, y: 1, i:0},
                            source: '$',
                            pipe: [],
                            units: []
                        }
                        ,
                        {
                            key: {x: 1, y: 1, i:1},
                            source: '$',
                            pipe: [],
                            units: []
                        }
                    ]
                }
            };

            var renderEvent = 0;
            var c = new tauChart.Plot(spec);
            c.on('render', function () {
                renderEvent++;
            });
            c.renderTo(testDiv);

            expect(renderEvent).to.equal(1);
        });

        it('should support right-oriented Y scale', function () {

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: [
                    {y: 1, x: 0},
                    {y: 2, x: 10},
                    {y: 3, x: 20}
                ],
                x: 'x',
                y: 'y',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false, min: 0},
                    y: {hide: false, scaleOrient: 'right'}
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'NONE'
                }
            });
            chart.renderTo(testDiv);

            var svg = chart.getSVG();
            var transform = d3.select(svg).select('.y.axis').attr('transform');
            expect(transform).to.equals('translate(800,0)');
        });

        it('should support left-oriented Y scale', function () {

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: [
                    {y: 1, x: 0},
                    {y: 2, x: 10},
                    {y: 3, x: 20}
                ],
                x: 'x',
                y: 'y',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: true, nice: false, min: 0},
                    y: {hide: false, scaleOrient: 'left'}
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'NONE'
                }
            });
            chart.renderTo(testDiv);

            var svg = chart.getSVG();
            var transform = d3.select(svg).select('.y.axis').attr('transform');
            expect(transform).to.equals('translate(0,0)');
        });

        it('should support top-oriented X scale', function () {

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: [
                    {y: 1, x: 0},
                    {y: 2, x: 10},
                    {y: 3, x: 20}
                ],
                x: 'x',
                y: 'y',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: false, nice: false, min: 0, scaleOrient: 'top'},
                    y: {hide: true}
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'NONE'
                }
            });
            chart.renderTo(testDiv);

            var svg = chart.getSVG();
            var transform = d3.select(svg).select('.x.axis').attr('transform');
            expect(transform).to.equals('translate(0,0)');
        });

        it('should support bottom-oriented X scale', function () {

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: [
                    {y: 1, x: 0},
                    {y: 2, x: 10},
                    {y: 3, x: 20}
                ],
                x: 'x',
                y: 'y',
                guide: {
                    padding: {l: 0, r: 0, t: 0, b: 0},
                    x: {hide: false, nice: false, min: 0, scaleOrient: 'bottom'},
                    y: {hide: true}
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'NONE'
                }
            });
            chart.renderTo(testDiv);

            var svg = chart.getSVG();
            var transform = d3.select(svg).select('.x.axis').attr('transform');
            expect(transform).to.equals('translate(0,600)');
        });

        it('should warn about rendering timeout', function (done) {

            this.timeout(4000);

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: range(20).map(function () {
                    return {
                        a: String.fromCharCode(Math.round(Math.random() * 26) + 97),
                        b: String.fromCharCode(Math.round(Math.random() * 26) + 97),
                        c: Math.random() * 10
                    };
                }),
                x: ['c'],
                y: ['a', 'b'],
                dimensions: {
                    'a': {type: 'categoty', scale: 'ordinal'},
                    'b': {type: 'categoty', scale: 'ordinal'},
                    'c': {type: 'measure', scale: 'linear'}
                },
                settings: {
                    asyncRendering: true,
                    renderingTimeout: 0.1,
                    syncRenderingInterval: 1
                }
            });
            var timeoutCount = 0;
            chart.on('renderingtimeout', function () {
                timeoutCount++;
                expect(TaskRunner.runnersInProgress).to.equal(0);
                var svg = chart.getLayout().content.querySelector('.' + CSS_PREFIX + 'rendering-timeout-warning');
                expect(svg).to.be.instanceof(Element);

                switch (timeoutCount) {
                    case 1:
                        // Invoke chart refresh to fire previous rendering cancel
                        setTimeout(function () {
                            chart.refresh();
                        }, 0);
                        break;
                    case 2:
                        // Click "Cancel"
                        utils.simulateEvent('click',
                            svg.querySelector('.' + CSS_PREFIX + 'rendering-timeout-cancel-btn'));
                        expect(TaskRunner.runnersInProgress).to.equal(0);
                        chart.refresh();
                        break;
                    case 3:
                        // Click "Continue"
                        utils.simulateEvent('click',
                            svg.querySelector('.' + CSS_PREFIX + 'rendering-timeout-continue-btn'));
                        break;
                }
            });
            chart.on('render', function () {
                if (timeoutCount !== 3) {
                    done(new Error('Not all rendering timeouts were reached.'));
                }
                expect(TaskRunner.runnersInProgress).to.equal(0);
                done();
            });
            chart.renderTo(testDiv);
        });

        it('should warn about rendering error', function (done) {

            this.timeout(4000);

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: range(20).map(function () {
                    return {
                        a: String.fromCharCode(Math.round(Math.random() * 26) + 97),
                        b: String.fromCharCode(Math.round(Math.random() * 26) + 97),
                        c: Math.random() * 10
                    };
                }),
                x: ['c'],
                y: ['a', 'b'],
                dimensions: {
                    'a': {type: 'categoty', scale: 'ordinal'},
                    'b': {type: 'categoty', scale: 'ordinal'},
                    'c': {type: 'measure', scale: 'linear'}
                },
                settings: {
                    asyncRendering: true,
                    syncRenderingInterval: 1
                }
            });

            var threwError = false;
            chart.on('renderingerror', function (chart, err) {
                threwError = true;
                expect(err.message).to.equal('Test rendering error.');
                expect(TaskRunner.runnersInProgress).to.equal(0);

                chart.onUnitDraw = srcOnUnitDraw;
                chart.refresh();
                expect(TaskRunner.runnersInProgress).to.equal(1);
            });

            chart.on('render', function () {
                if (!threwError) {
                    done(new Error('Error was not thrown.'));
                }
                expect(TaskRunner.runnersInProgress).to.equal(0);
                done();
            });

            var timer = 10;
            var srcOnUnitDraw = chart.onUnitDraw;
            chart.onUnitDraw = function () {
                timer--;
                if (timer === 0) {
                    throw new Error('Test rendering error.');
                }
                srcOnUnitDraw.apply(chart, arguments);
            };

            chart.renderTo(testDiv);
            expect(TaskRunner.runnersInProgress).to.equal(1);
        });

        it('should destroy async chart', function (done) {

            this.timeout(4000);

            var testDiv = document.getElementById('test-div');

            var chart = new tauChart.Chart({
                type: 'scatterplot',
                data: range(20).map(function () {
                    return {
                        a: String.fromCharCode(Math.round(Math.random() * 26) + 97),
                        b: String.fromCharCode(Math.round(Math.random() * 26) + 97),
                        c: Math.random() * 10
                    };
                }),
                x: ['c'],
                y: ['a', 'b'],
                dimensions: {
                    'a': {type: 'categoty', scale: 'ordinal'},
                    'b': {type: 'categoty', scale: 'ordinal'},
                    'c': {type: 'measure', scale: 'linear'}
                },
                settings: {
                    asyncRendering: true,
                    syncRenderingInterval: 1
                }
            });

            chart.renderTo(testDiv);
            expect(TaskRunner.runnersInProgress).to.equal(1);
            setTimeout(() => {
                expect(TaskRunner.runnersInProgress).to.equal(1);
                chart.destroy();
                expect(TaskRunner.runnersInProgress).to.equal(0);
                done();
            }, 0);
        });

        it('ticks should not overflow chart', function (done) {

            this.timeout(4000);
            var animationSpeed = 125;
            var months = 12;

            var testDiv = document.getElementById('test-div');
            testDiv.style.width = '800px';
            testDiv.style.height = '600px';

            var chart = new tauChart.Chart({
                type: 'line',
                guide: {
                    y: {
                        hide: true
                    }
                },
                data: range(months).map((i) => {
                    var m = i + 1;
                    return {
                        date: new Date(`2016-${m > 9 ? m : ('0' + m)}-01`),
                        value: i * 10
                    };
                }),
                x: ['date'],
                y: ['value'],
                settings: {
                    animationSpeed
                }
            });

            chart.on('render', function () {
                setTimeout(() => {
                    var svg = chart.getSVG();
                    var ticks = svg.querySelectorAll('.tick text');
                    expect(ticks.length).to.equal(months);
                    var rect = svg.getBoundingClientRect();
                    var l = ticks[0].getBoundingClientRect();
                    var r = ticks[ticks.length - 1].getBoundingClientRect();
                    expect(l.left).to.be.at.least(rect.left);
                    expect(r.right).to.be.at.most(rect.right);
                    done();
                }, animationSpeed * 4);
            });

            chart.renderTo(testDiv);
        });
    });
});