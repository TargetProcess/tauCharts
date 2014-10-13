describe("DSL reader calcLayout() / renderGraph()", function () {

    var data = [
        {"cycleTime": 10, "effort": 1.0000, "name": "Report", "team": "Exploited", "project": "TP3"},
        {"cycleTime": 22, "effort": 0.0000, "name": "Follow", "team": "Alaska", "project": "TP2"},
        {"cycleTime": 95, "effort": 2.0000, "name": "Errors", "team": "Exploited", "project": "TP2"}
    ];

    var div;

    beforeEach(function () {
        div = document.createElement('div');
        document.body.appendChild(div);
    });

    afterEach(function () {
        div.parentNode.removeChild(div);
    });

    it("should fail on render unknown unit type appearance", function () {

        var api = tauChart.__api__;
        var reader = new api.DSLReader(
            {
                dimensions: {
                    project: {scaleType: 'ordinal'},
                    team: {scaleType: 'ordinal'},
                    effort: {scaleType: 'linear'},
                    cycleTime: {scaleType: 'linear'}
                },
                unit: {
                    type: 'COORDS.RECT',
                    x: 'cycleTime',
                    y: 'effort',
                    guide: {
                        showGridLines: 'xy'
                    },
                    unit: [
                        {
                            type: 'ELEMENT.UNKNOWN'
                        }
                    ]
                }
            },
            data);

        var logicXGraph = reader.buildGraph();
        var layoutGraph = reader.calcLayout(
            logicXGraph,
            api.LayoutEngineFactory.get('DEFAULT'),
            {
                width: 100,
                height: 100
            });

        expect(function() { reader.renderGraph(layoutGraph, d3.select(div).append("svg")) })
            .to
            .throw("Unknown unit type: ELEMENT.UNKNOWN");
    });

    it("should calc layout for logical graph (- split)", function () {

        var api = tauChart.__api__;
        var reader = new api.DSLReader(
            {
                dimensions: {
                    project: {scaleType: 'ordinal'},
                    team: {scaleType: 'ordinal'},
                    effort: {scaleType: 'linear'},
                    cycleTime: {scaleType: 'linear'}
                },
                unit: {
                    type: 'COORDS.RECT',
                    x: 'project',
                    y: 'team',
                    unit: [
                        {
                            type: 'COORDS.RECT',
                            x: 'cycleTime',
                            y: 'effort',
                            guide: {
                                showGridLines: 'xy',
                                split: false
                            },
                            unit: [
                                {
                                    type: 'ELEMENT.POINT'
                                },
                                {
                                    type: 'ELEMENT.LINE'
                                }
                            ]
                        }
                    ]
                }
            },
            data);

        var logicXGraph = reader.buildGraph();
        var layoutGraph = reader.calcLayout(
            logicXGraph,
            api.LayoutEngineFactory.get('DEFAULT'),
            {
                width: 200,
                height: 100
            });

        var checkFacetCells = function($matrix, facet) {
            $matrix.iterate(function(r, c, cell) {
                var rect = cell[0];
                expect(rect.options.width).to.equal(facet[r][c].w);
                expect(rect.options.height).to.equal(facet[r][c].h);

                expect(rect.options.top).to.equal(facet[r][c].t);
                expect(rect.options.left).to.equal(facet[r][c].l);
            });
        };

        var checkFacetUnits = function (unitsArr, expectedUnits) {
            _.each(unitsArr, function (unit, i) {
                expect(unit.options.width).to.equal(expectedUnits[i].w);
                expect(unit.options.height).to.equal(expectedUnits[i].h);
                expect(unit.options.top).to.equal(expectedUnits[i].t);
                expect(unit.options.left).to.equal(expectedUnits[i].l);
            });
        };

        expect(layoutGraph.$matrix.sizeR()).to.equal(2);
        expect(layoutGraph.$matrix.sizeC()).to.equal(2);

        checkFacetCells(layoutGraph.$matrix, [
            [{w: 100, h: 50, t: 0, l: 0}, {w: 100, h: 50, t: 0, l: 100}],
            [{w: 100, h: 50, t: 50, l: 0}, {w: 100, h: 50, t: 50, l: 100}]
        ]);

        var cellR0C0 = layoutGraph.$matrix.getRC(0, 0)[0];
        checkFacetUnits(cellR0C0.$matrix.getRC(0, 0), [
            {w: 100, h: 50, t: 0, l: 0},
            {w: 100, h: 50, t: 0, l: 0}
        ]);
    });

    it("should calc layout for logical graph (+ split)", function () {

        var api = tauChart.__api__;
        var reader = new api.DSLReader(
            {
                dimensions: {
                    project: {scaleType: 'ordinal'},
                    team: {scaleType: 'ordinal'},
                    effort: {scaleType: 'linear'},
                    cycleTime: {scaleType: 'linear'}
                },
                unit: {
                    type: 'COORDS.RECT',
                    x: 'project',
                    y: 'team',
                    unit: [
                        {
                            type: 'COORDS.RECT',
                            x: 'cycleTime',
                            y: 'effort',
                            guide: {
                                showGridLines: 'xy',
                                split: true
                            },
                            unit: [
                                {
                                    type: 'ELEMENT.POINT'
                                },
                                {
                                    type: 'ELEMENT.LINE'
                                }
                            ]
                        }
                    ]
                }
            },
            data);

        var logicXGraph = reader.buildGraph();
        var layoutGraph = reader.calcLayout(
            logicXGraph,
            api.LayoutEngineFactory.get('DEFAULT'),
            {
                width: 200,
                height: 100
            });

        var checkFacetCells = function($matrix, facet) {
            $matrix.iterate(function(r, c, cell) {
                var rect = cell[0];
                expect(rect.options.width).to.equal(facet[r][c].w);
                expect(rect.options.height).to.equal(facet[r][c].h);

                expect(rect.options.top).to.equal(facet[r][c].t);
                expect(rect.options.left).to.equal(facet[r][c].l);
            });
        };

        var checkFacetUnits = function (unitsArr, expectedUnits) {
            _.each(unitsArr, function (unit, i) {
                expect(unit.options.width).to.equal(expectedUnits[i].w);
                expect(unit.options.height).to.equal(expectedUnits[i].h);
                expect(unit.options.top).to.equal(expectedUnits[i].t);
                expect(unit.options.left).to.equal(expectedUnits[i].l);
            });
        };

        expect(layoutGraph.$matrix.sizeR()).to.equal(2);
        expect(layoutGraph.$matrix.sizeC()).to.equal(2);

        checkFacetCells(layoutGraph.$matrix, [
            [{w: 100, h: 50, t: 0, l: 0}, {w: 100, h: 50, t: 0, l: 100}],
            [{w: 100, h: 50, t: 50, l: 0}, {w: 100, h: 50, t: 50, l: 100}]
        ]);

        var cellR0C0 = layoutGraph.$matrix.getRC(0, 0)[0];
        checkFacetUnits(cellR0C0.$matrix.getRC(0, 0), [
            {w: 100, h: 25, t: 0, l: 0},
            {w: 100, h: 25, t: 25, l: 0}
        ]);
    });
});