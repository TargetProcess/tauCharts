define(function (require) {
    var worldMap = require('json!src/addons/world-countries');
    var theUKMap = require('json!src/addons/uk-subunits-places');
    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    var testUtils = require('testUtils');

    describe('Map chart', function () {

        var drawTimeout = 60000;

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
            testUtils.destroyCharts();
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

            var cfg = chart.getSpec();

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

            this.timeout(drawTimeout);
            setTimeout(done, drawTimeout);

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

            this.timeout(drawTimeout);
            setTimeout(done, drawTimeout);

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

            var geoNode = chart1.select(function (node) {
                return node.config.type === 'COORDS.MAP';
            })[0];

            var actualEvents = [];

            geoNode.on('area-click', function (sender, r) {
                actualEvents.push('area-click');
            });

            geoNode.on('area-mouseover', function (sender, r) {
                actualEvents.push('area-mouseover');
            });

            geoNode.on('area-mouseout', function (sender, r) {
                actualEvents.push('area-mouseout');
            });

            var contourNode = d3
                .select(target)
                .select('.map-contour-countries')
                .node();

            testUtils.simulateEvent('mouseover', contourNode);
            testUtils.simulateEvent('click', contourNode);
            testUtils.simulateEvent('mouseout', contourNode);

            expect(actualEvents.join('/')).to.equal('area-mouseover/area-click/area-mouseout');

            var highlightedContours0 = d3
                .select(target)
                .selectAll('.map-contour-highlighted');
            expect(highlightedContours0[0].length).to.equal(0);

            geoNode.fire('highlight-area', function (row) {
                return row && row.cc == 'BLR';
            });

            var highlightedContours1 = d3
                .select(target)
                .selectAll('.map-contour-highlighted');
            expect(highlightedContours1[0].length).to.equal(1);

            done();
        });

        it('should draw by code and lat-lon', function (done) {

            this.timeout(drawTimeout);
            setTimeout(done, drawTimeout);

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

            var geoNode = chart2.select(function (node) {
                return node.config.type === 'COORDS.MAP';
            })[0];

            var actualEvents = [];

            geoNode.on('point-click', function (sender, r) {
                actualEvents.push('point-click');
            });

            geoNode.on('point-mouseover', function (sender, r) {
                actualEvents.push('point-mouseover');
            });

            geoNode.on('point-mouseout', function (sender, r) {
                actualEvents.push('point-mouseout');
            });

            var pointNode = d3
                .select(target)
                .select('circle')
                .node();

            testUtils.simulateEvent('mouseover', pointNode);
            testUtils.simulateEvent('click', pointNode);
            testUtils.simulateEvent('mouseout', pointNode);

            expect(actualEvents.join('/')).to.equal('point-mouseover/point-click/point-mouseout');

            var highlightedPoints0 = d3
                .select(target)
                .selectAll('.map-point-highlighted');
            expect(highlightedPoints0[0].length).to.equal(0);

            geoNode.fire('highlight', function (row) {
                return row && row.cc == 'BLR';
            });

            var highlightedPoints1 = d3
                .select(target)
                .selectAll('.map-point-highlighted');
            expect(highlightedPoints1[0].length).to.equal(1);

            // alias for [highlight] event
            geoNode.fire('highlight-point', function (row) {
                return row && row.cc != 'BLR';
            });

            var highlightedPoints2 = d3
                .select(target)
                .selectAll('.map-point-highlighted');
            expect(highlightedPoints2[0].length).to.equal(2);

            geoNode.fire('highlight-point', function (row) {
                return false;
            });

            var highlightedPoints3 = d3
                .select(target)
                .selectAll('.map-point-highlighted');
            expect(highlightedPoints3[0].length).to.equal(0);

            expect(geoNode.getScale('latitude').scaleType).to.equal('linear');
            expect(geoNode.getScale('longitude').scaleType).to.equal('linear');
            expect(geoNode.getScale('size').scaleType).to.equal('size');
            expect(geoNode.getScale('color').scaleType).to.equal('color');
            expect(geoNode.getScale('fill').scaleType).to.equal('fill');
            expect(geoNode.getScale('code').scaleType).to.equal('value');

            expect(geoNode.getScale('nope')).to.equal(null);

            done();
        });

        it('should draw UK map with places', function (done) {

            this.timeout(drawTimeout);
            setTimeout(done, drawTimeout);

            var chart2 = new tauChart.Chart({
                type: 'map',
                latitude: 'y',
                longitude: 'x',
                size: 'size',
                data: [
                    {x: 0.5, y: 51.32, color: 'green', size: 2}
                ],
                guide: {
                    sourcemap: theUKMap
                },
                settings: settings
            });

            expect(function () {
                chart2.renderTo(target);
            }).to.not.throw();

            done();
        });
    });
});