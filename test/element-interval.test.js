describe("ELEMENT.INTERVAL", function () {

    var testData = [
        {x: 'a', y: 1, color: 'red', size: 6},
        {x: 'b', y: 0.5, color: 'green', size: 6},
        {x: 'c', y: 2, color: 'yellow', size: 8},
        {x: 'c', y: 5, color: 'green', size: 8}
    ];

    var element, chart;

    beforeEach(function () {
        element = document.createElement('div');
        document.body.appendChild(element);
        chart = new tauChart.Plot({
            spec: {
                unit: {
                    type: 'COORDS.RECT',
                    x: 'x',
                    y: 'y',
                    guide:{},
                    unit: [
                        {
                            type: 'ELEMENT.INTERVAL',
                            x: 'x',
                            flip: false,
                            y: 'y',
                            color: 'color'
                        }
                    ]
                }
            },
            data: testData
        });
        chart.renderTo(element, {width: 800, height: 800});
    });
    afterEach(function () {
        element.parentNode.removeChild(element);
    });

    it("should render group bar element", function () {
        assert.ok(schemes.bar(chart.config.spec), 'spec is right');
        expect(getGroupBar().length).to.equal(3);
    });
    it("should group contain interval element", function () {
        var bars = getGroupBar();
        expect(bars[0].childNodes.length).to.equal(1);
        expect(bars[1].childNodes.length).to.equal(2);
        expect(bars[2].childNodes.length).to.equal(1);
    });
});

describe("ELEMENT.INTERVAL.FLIP", function () {

    var testData = [
        {x: 'a', y: 1, color: 'red', size: 6},
        {x: 'b', y: 0.5, color: 'green', size: 6},
        {x: 'c', y: 2, color: 'yellow', size: 8},
        {x: 'c', y: 5, color: 'green', size: 8}
    ];

    var element, chart;

    beforeEach(function () {
        element = document.createElement('div');
        document.body.appendChild(element);
        chart = new tauChart.Plot({
            spec: {
                unit: {
                    type: 'COORDS.RECT',
                    x: 'size',
                    y: 'color',
                    guide:{},
                    unit: [
                        {
                            type: 'ELEMENT.INTERVAL',
                            x: 'x',
                            flip: true,
                            y: 'y',
                            color: 'color'
                        }
                    ]
                }
            },
            data: testData
        });
        chart.renderTo(element, {width: 800, height: 800});
    });
    afterEach(function () {
        element.parentNode.removeChild(element);
    });

    it("should render group bar element", function () {
        assert.ok(schemes.bar(chart.config.spec), 'spec is right');
        expect(getGroupBar().length).to.equal(3);
    });
    it("should group contain interval element", function () {
        var bars = getGroupBar();
        expect(bars[0].childNodes.length).to.equal(1);
        expect(bars[1].childNodes.length).to.equal(2);
        expect(bars[2].childNodes.length).to.equal(1);
    });
});