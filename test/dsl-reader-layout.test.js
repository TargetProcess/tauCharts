describe("DSL reader", function () {

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
});