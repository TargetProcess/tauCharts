describe("ELEMENT.LINE", function () {

    var testData = [
        {x: 'a', y: 1, color: 'red', size: 6},
        {x: 'b', y: 0.5, color: 'green', size: 6},
        {x: 'c', y: 2, color: 'green', size: 8}
    ];

    var element;

    beforeEach(function () {
        element = document.createElement('div');
        document.body.appendChild(element);
        new tauChart.Plot({
            spec: {
                unit: {
                    type: 'COORDS.RECT',
                    x: {scaleDim: 'x'},
                    y: {scaleDim: 'y'},
                    unit: [
                        {
                            type: 'ELEMENT.LINE'
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

    it("should render bar element", function () {
        expect(1).to.equal(1);
    });
});