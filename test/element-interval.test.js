describe("ELEMENT.INTERVAL", function () {

    var testData = [
        {x: 'a', y: 1, color: 'red', size: 6},
        {x: 'b', y: 0.5, color: 'green', size: 6},
        {x: 'c', y: 2, color: 'yellow', size: 8},
        {x: 'c', y: 5, color: 'green', size: 8}
    ];

    var element;

    beforeEach(function () {
        element = document.createElement('div');
        document.body.appendChild(element);
        new tauChart.Plot({
            spec: {
                unit: {
                    type: 'COORDS.RECT',
                    x: 'x',
                    y: 'y',
                    unit: [
                        {
                            type: 'ELEMENT.INTERVAL',
                            color: 'color'
                        }
                    ]
                }
            },
            data: testData
        }).renderTo(element, {width: 800, height: 800});
    });
    afterEach(function () {
        element.parentNode.removeChild(element);
    });

    it("should render group bar element", function () {
        expect(getGroupBar().length).to.equal(3);
    });
    it("should group contain interval element", function () {
        var bars = getGroupBar();
        expect(bars[0].children.length).to.equal(1);
        expect(bars[1].children.length).to.equal(2);
        expect(bars[2].children.length).to.equal(1);
    });
});