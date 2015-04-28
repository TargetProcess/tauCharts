define(function (require) {
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    describe('Map chart', function () {

        var testData = [
            {x: 1, y: 1, color: 'red', size: 6, cc: 'USA'},
            {x: 0.5, y: 0.5, color: 'green', size: 6, cc: 'RUS'},
            {x: 2, y: 2, color: 'green', size: 8, cc: 'BLR'}
        ];

        var target;

        beforeEach(function () {
            target = document.createElement('div');
            document.body.appendChild(target);
        });

        afterEach(function () {
            target.parentNode.removeChild(target);
        });

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
                'https://gist.githubusercontent.com',
                'vladminsky',
                'ae0cbabf2fcbb5db6f07/raw/7ffb6133ddddcdc5869b2d4de180c22be21d9dea',
                'world-map'
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
                chart.renderTo(target);
            }).to.throw('Invalid map: map should contain land object');
        });

        it('should throw once [georole] is missing', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                fill: 'x',
                code: 'color',
                data: testData,
                guide: {
                    code: {
                        georole: ''
                    },
                    sourcemap: {
                        "objects": {
                            "land": {},
                            "countries": {}
                        }
                    }
                }
            });

            expect(function () {
                chart.renderTo(target);
            }).to.throw('[georole] is missing');
        });

        it('should throw once [georole] is invalid', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                fill: 'x',
                code: 'color',
                data: testData,
                guide: {
                    code: {
                        georole: 'continents'
                    },
                    sourcemap: {
                        "objects": {
                            "land": {},
                            "countries": {}
                        }
                    }
                }
            });

            expect(function () {
                chart.renderTo(target);
            }).to.throw('Invalid [georole]');
        });

        it('should draw on default map', function () {

            var chart0 = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData
            });

            expect(function () {
                chart0.renderTo(target);
            }).to.not.throw();

            var chart1 = new tauChart.Chart({
                type: 'map',
                code: 'cc',
                fill: 'x',
                data: testData
            });

            expect(function () {
                chart1.renderTo(target);
            }).to.not.throw();

            var chart2 = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                code: 'cc',
                fill: 'x',
                data: testData
            });

            expect(function () {
                chart2.renderTo(target);
            }).to.not.throw();
        });
    });
});