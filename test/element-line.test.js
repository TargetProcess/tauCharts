define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');

    var testUtils = require('testUtils');
    var assert = require('chai').assert;
    var getLine = testUtils.getLine;
    var attrib = testUtils.attrib;
    var tauChart = require('tau_modules/tau.newCharts').tauChart;
    describe("ELEMENT.LINE", function () {

        var testData = [
            {x: 1, y: 1, color: 'red'},
            {x: 1, y: 2, color: 'red'},
            {x: 2, y: 0.5, color: 'green'},
            {x: 2, y: 2, color: 'green'}
        ];

        var element;
        var chart;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
            chart = new tauChart.Plot({
                spec: {
                    unit: {
                        type: 'COORDS.RECT',
                        x: 'x',
                        y: 'y',
                        guide: {},
                        unit: [
                            {
                                type: 'ELEMENT.LINE',
                                color: 'color',
                                x: 'x',
                                y: 'y'
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

        it("should render two line element", function () {
            var lines = getLine();
            assert.ok(schemes.line(chart.config.spec), 'spec is right');
            expect(lines.length).to.equal(2);
            assert.notEqual(attrib(lines[0], 'class'), attrib(lines[1], 'class'), 'should different class');
        });
    });
});