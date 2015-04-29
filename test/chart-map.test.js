define(function (require) {
    var worldMap = require('json!src/addons/world');
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

        var settings = {
            defaultSourceMap: worldMap
        };

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
                    code: null,
                    settings: settings
                });
            }).to.throw('[code] must be specified when using [fill]');
        });

        it('should throw if NOT both latitude / longitude are specified', function () {

            expect(function () {
                new tauChart.Chart({
                    type: 'map',
                    data: testData,
                    latitude: 'x',
                    size: 'size',
                    settings: settings
                });
            }).to.throw('[latitude] and [longitude] both must be specified');
        });

        it('should throw if data is not specified', function () {

            expect(function () {
                new tauChart.Chart({
                    type: 'map',
                    latitude: 'x',
                    longitude: 'y',
                    size: 'size',
                    settings: settings
                });
            }).to.throw('[data] must be specified');
        });

        it('should default sourcemap and contour', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData,
                settings: settings
            });

            var cfg = chart.getConfig();

            expect(cfg.unit.type).to.equal('COORDS.MAP');
            expect(cfg.unit.guide.sourcemap).to.deep.equal(settings.defaultSourceMap);
        });

        it('should throw once use invalid map', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData,
                guide: {
                    sourcemap: {}
                },
                settings: settings
            });

            expect(function () {
                chart.renderTo(target);
            }).to.throw('Invalid map: should contain some contours');
        });

        it('should throw once use invalid projection', function () {

            var chart = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                data: testData,
                guide: {
                    sourcemap: {
                        objects: {land:{}}
                    },
                    projection: 'invalid-projection'
                },
                settings: settings
            });

            expect(function () {
                chart.renderTo(target);
            }).to.throw('Invalid map: unknown projection "invalid-projection"');
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
                },
                settings: settings
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
                },
                settings: settings
            });

            expect(function () {
                chart.renderTo(target);
            }).to.throw('Invalid [georole]');
        });

        it('should draw by lat-lon', function (done) {

            this.timeout(15000);
            setTimeout(done, 15000);

            var chart0 = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                color: 'color',
                data: testData,
                settings: settings
            });

            expect(function () {
                chart0.renderTo(target);
            }).to.not.throw();

            done();
        });

        it('should draw by code', function (done) {

            this.timeout(15000);
            setTimeout(done, 15000);

             var chart1 = new tauChart.Chart({
             type: 'map',
             code: 'cc',
             fill: 'x',
             data: testData,
             settings: settings
             });

             expect(function () {
                chart1.renderTo(target);
             }).to.not.throw();

            done();
        });

        it('should draw by code and lat-lon', function (done) {

            this.timeout(15000);
            setTimeout(done, 15000);

            var chart2 = new tauChart.Chart({
                type: 'map',
                latitude: 'x',
                longitude: 'y',
                size: 'size',
                code: 'cc',
                fill: 'x',
                data: testData,
                settings: settings
            });

            expect(function () {
                chart2.renderTo(target);
            }).to.not.throw();

            done();
        });
    });
});