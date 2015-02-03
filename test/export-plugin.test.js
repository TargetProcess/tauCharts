define(function (require) {
    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var stubTimeout = testUtils.stubTimeout;
    var legend = require('plugins/legend');
    var trendline = require('plugins/trendline');
    var mock = require('test/utils/mock.window');
    var saveAs = require('test/utils/saveAs');
    var exportTo = require('plugins/export');
    var $ = require('jquery');
    var describeChart = testUtils.describeChart;

    describeChart(
        "export plugin should work",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
            plugins: [exportTo()]
        },
        [{
            x: 2,
            y: 2,
            color: undefined,
            size: 10

        }, {
            x: 4,
            y: 5,
            color: 'color',
            size: 123

        }],
        function (context) {
            it("print", function (done) {
                var header = context.chart._layout.header;
                testUtils.simulateEvent('click', header.querySelector('.graphical-report__export'));
                mock.printCallbacks.push(function () {
                    expect(true).to.be.ok;
                    testUtils.simulateEvent('click', document.body);
                     done();
                });
                setTimeout(function () {
                    testUtils.simulateEvent('click', $('[data-value="print"]').get(0));
                }, 0);


            });
        },
        {
            autoWidth: false
        }
    );
    describeChart(
        "export plugin should work png",
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
            plugins: [exportTo()]
        },
        [{
            x: 2,
            y: 2,
            color: undefined,
            size: 10

        }, {
            x: 4,
            y: 5,
            color: 'color',
            size: 123

        }],
        function (context) {
            it("export to png", function (done) {
                var header = context.chart._layout.header;
                testUtils.simulateEvent('click', header.querySelector('.graphical-report__export'));
                saveAs.callbacks.items.push(function () {
                    expect(true).to.be.ok;
                    testUtils.simulateEvent('click', document.body);
                    done();
                });
                expect($('[data-value="png"]').length).to.be.ok;
                context.chart.fire('exportTo','png');
            });
        },
        {
            autoWidth: false
        }
    );

});