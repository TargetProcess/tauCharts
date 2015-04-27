define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    describe('Map chart', function () {

        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];

        it('should throw if fill is specified without code', function () {

            expect(function () {
                new tauChart.Chart({
                    type: 'map',
                    data: testData,
                    fill: 'x',
                    code: null
                });
            }).to.throw('[code] must be specified when using [fill]');
        });

        it('should throw if NOT both latitude / longitude are specified', function () {

            expect(function () {
                new tauChart.Chart({
                    type: 'map',
                    data: testData,
                    latitude: 'x',
                    size: 'size'
                });
            }).to.throw('[latitude] and [longitude] both must be specified');
        });

        it('should throw if data is not specified', function () {

            expect(function () {
                new tauChart.Chart({
                    type: 'map',
                    latitude: 'x',
                    longitude: 'y',
                    size: 'size'
                });
            }).to.throw('[data] must be specified');
        });

        it('should default sourcemap and contour', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData
            });

            var cfg = chart.getConfig();

            expect(cfg.unit.type).to.equal('COORDS.MAP');
            expect(cfg.unit.guide.contour).to.equal('countries');
            expect(cfg.unit.guide.sourcemap).to.equal([
                'https://gist.githubusercontent.com/d3noob/5189184',
                'raw/598d1ebe0c251cd506c8395c60ab1d08520922a7',
                'world-110m2.json'
            ].join('/'));
        });

        it('should throw once sourcemap does not contain land object', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData,
                guide: {
                    sourcemap: {}
                }
            });

            expect(function () {
                chart.renderTo('body');
            }).to.throw('Invalid map: map should contain land object');
        });

        it('should draw on default map', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData
            });

            expect(function () {
                chart.renderTo('body');
            }).to.not.throw();
        });
    });
});
