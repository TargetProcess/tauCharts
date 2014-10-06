describe("Point element", function () {
    var element;
    var testData = [
        {x: 1, y: 1, color: 'red', size: 6},
        {x: 0.5, y: 0.5, color: 'green', size: 6},
        {x: 2, y: 2, color: 'green', size: 8}
    ];
    beforeEach(function () {
        element = document.createElement('div');
        document.body.appendChild(element);
        var chart = new tauChart.Chart({
            spec: {
                container: element,
                W: 800,
                H: 800,
                dimensions: {
                    x: {scaleType: 'linear'},
                    y: {scaleType: 'linear'}
                },
                unit: {
                    type: 'COORDS.RECT',
                    axes: [
                        {
                            scaleDim: 'x'
                        },
                        {
                            scaleDim: 'y'
                        }
                    ],
                    unit: [
                        {
                            type: 'ELEMENT/POINT',
                            x: 'x',
                            y: 'y',
                            color: 'color',
                            size: 'size',
                            shape: null
                        }
                    ]
                }
            },
            data: testData
        });
    });
    afterEach(function () {
        element.parentNode.removeChild(element);
    });
    function getDots() {
        return d3.selectAll('.dot')[0];
    }

    function attrib(el, prop) {
        return el.getAttribute(prop)
    }

    function position(el) {
        return {x: attrib(el, 'cx'), y: attrib(el, 'cy')}
    }

    it("should render point with right cord", function () {
        var dots = getDots();
        expect(dots.length).to.equal(3);
        expect(position(dots[1])).to.deep.equal({x: '0', y: '600'});
        expect(position(dots[2])).to.deep.equal({x: '800', y: '0'});
    });
    it("should render point with right size", function () {
        var dots = getDots();
        var size1 = attrib(dots[0],'r');
        var size2 = attrib(dots[1],'r');
        var size3 = attrib(dots[2],'r');
        assert.equal(size1,size2,'size should same');
        assert.notEqual(size1,size3,'size shouldn\'t same');
    });
    it("should render point with right color", function () {
        var dots = getDots();
        var size1 = attrib(dots[0],'class');
        var size2 = attrib(dots[1],'class');
        var size3 = attrib(dots[2],'class');
        assert.equal(size2,size3,'size should same');
        assert.notEqual(size1,size2,'size shouldn\'t same');
    });
});