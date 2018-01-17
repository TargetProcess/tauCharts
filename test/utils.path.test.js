import {expect} from 'chai';
import Taucharts from '../src/tau.charts';
import createInterpolator from '../src/utils/path/interpolators/path-points';
import {getBrushLine, getBrushCurve} from '../src/utils/path/svg/brush-line';
import {getAreaPolygon, getSmoothAreaPath}from '../src/utils/path/svg/area-path';
import {getCurveKeepingExtremums as toCurve} from '../src/utils/path/interpolators/smooth';
import {getLineInterpolator} from '../src/utils/path/interpolators/interpolators-registry';
import * as lines from '../src/utils/path/svg/line';
import testUtils from './utils/utils';

    describe('path utilities', function() {

        it('should interpolate points', function () {

            var data = [
                {x: 0, y: 270, size: 30, id: 1},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 150, y: 360, size: 60, id: 4}
            ];

            function round(points) {
                points.forEach(function (d) {
                    Object.keys(d).forEach(function (k) {
                        if (k === 'x' || k === 'y') {
                            d[k] = Math.round(d[k]);
                        }
                    });
                });
                return points;
            }

            var line = getLineInterpolator('linear')(data);
            expect(line).to.deep.equal([
                {x: 0, y: 270, size: 30, id: 1},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 150, y: 360, size: 60, id: 4}
            ]);

            var curve = getLineInterpolator('smooth')(data);
            expect(round(curve)).to.deep.equal([
                {x: 0, y: 270, size: 30, id: 1},
                {x: 20, y: 105},
                {x: 40, y: 15},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 70, y: -7},
                {x: 80, y: 4},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 110, y: 82},
                {x: 130, y: 192},
                {x: 150, y: 360, size: 60, id: 4}
            ]);

            var curveWithExtremums = getLineInterpolator('smooth-keep-extremum')(data);
            expect(round(curveWithExtremums)).to.deep.equal([
                {x: 0, y: 270, size: 30, id: 1},
                {x: 20, y: 90},
                {x: 40, y: 0},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 70, y: 0},
                {x: 80, y: 7},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 110, y: 76},
                {x: 130, y: 186},
                {x: 150, y: 360, size: 60, id: 4}
            ]);

            var stepLine = getLineInterpolator('step')(data);
            expect(stepLine).to.deep.equal([
                {x: 0, y: 270, size: 30, id: 1},
                {x: 30, y: 270, size: 30, id: '1-2-1'},
                {x: 30, y: 0, size: 60, id: '1-2-2'},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 75, y: 0, size: 60, id: '2-3-1'},
                {x: 75, y: 30, size: 30, id: '2-3-2'},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 120, y: 30, size: 30, id: '3-4-1'},
                {x: 120, y: 360, size: 60, id: '3-4-2'},
                {x: 150, y: 360, size: 60, id: 4}
            ]);

            var stepBeforeLine = getLineInterpolator('step-before')(data);
            expect(stepBeforeLine).to.deep.equal([
                {x: 0, y: 270, size: 30, id: 1},
                {x: 0, y: 0, size: 60, id: '1-2'},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 60, y: 30, size: 30, id: '2-3'},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 90, y: 360, size: 60, id: '3-4'},
                {x: 150, y: 360, size: 60, id: 4}
            ]);

            var stepAfterLine = getLineInterpolator('step-after')(data);
            expect(stepAfterLine).to.deep.equal([
                {x: 0, y: 270, size: 30, id: 1},
                {x: 60, y: 270, size: 30, id: '1-2'},
                {x: 60, y: 0, size: 60, id: 2},
                {x: 90, y: 0, size: 60, id: '2-3'},
                {x: 90, y: 30, size: 30, id: 3},
                {x: 150, y: 30, size: 30, id: '3-4'},
                {x: 150, y: 360, size: 60, id: 4}
            ]);
        });

        it('should return SVG path value', function () {
            var points = [
                {x: 0, y: 30},
                {x: 30, y: 0},
                {x: 60, y: 30}
            ]
            expect(lines.getPolyline(points)).to.equal([
                'M0,30',
                'L30,0',
                'L60,30'
            ].join(' '));
            expect(lines.getCurve(toCurve(points))).to.equal([
                'M0,30',
                'C10,10',
                '20,0',
                '30,0',
                'C40,0',
                '50,10',
                '60,30'
            ].join(' '));
            expect(lines.getPolyline([])).to.equal('');
            expect(lines.getCurve([])).to.equal('');
        });

        it('should return SVG area path value', function () {
            var polyDir = [
                {x: 0, y: 20},
                {x: 30, y: 0},
                {x: 60, y: 20}
            ];
            var polyRev = [
                {x: 0, y: 60},
                {x: 30, y: 20},
                {x: 60, y: 40}
            ];
            var curveDir = [
                {x: 0, y: 0},
                {x: 30, y: 0},
                {x: 60, y: 20},
                {x: 90, y: 20}
            ];
            var curveRev = [
                {x: 0, y: 20},
                {x: 30, y: 20},
                {x: 60, y: 80},
                {x: 90, y: 80}
            ];
            expect(getAreaPolygon([], [])).to.equal('');
            expect(getAreaPolygon(polyDir, polyRev)).to.equal([
                '0,20',
                '30,0',
                '60,20',
                '60,40',
                '30,20',
                '0,60'
            ].join(' '));
            expect(getSmoothAreaPath([], [])).to.equal('');
            expect(getSmoothAreaPath(curveDir, curveRev)).to.equal([
                'M0,0',
                'C30,0',
                '60,20',
                '90,20',
                'L90,80',
                'C60,80',
                '30,20',
                '0,20',
                'Z'
            ].join(' '));
        });

        it('should interpolate path points', function() {
            var a = [
                {id: 1, x: 0, y: 0},
                {id: 2, x: 10, y: 20},
                {id: 3, x: 20, y: 0},
                {id: 4, x: 30, y: 40},
                {id: 5, x: 40, y: 80}
            ];
            var b = [
                {id: 2, x: 0, y: 40},
                {id: 3, x: 20, y: 0},
                {id: 4, x: 40, y: 80}
            ];

            var interpolator1 = createInterpolator(a, b);
            expect(interpolator1(0)).to.be.deep.equal(a);
            expect(interpolator1(0.5)).to.be.deep.equal([
                {id: 1, x: -2.5, y: 15, isInterpolated: true, positionIsBeingChanged: true},
                {id: 2, x: 5, y: 30},
                {id: 3, x: 20, y: 0},
                {id: 4, x: 35, y: 60},
                {id: 5, x: 42.5, y: 90, isInterpolated: true, positionIsBeingChanged: true}
            ]);
            expect(interpolator1(1)).to.be.deep.equal(b);

            var interpolator2 = createInterpolator(b, a);
            expect(interpolator2(0)).to.be.deep.equal(b);
            expect(interpolator2(0.5)).to.be.deep.equal([
                {id: 1, x: -2.5, y: 15, isInterpolated: true, positionIsBeingChanged: true},
                {id: 2, x: 5, y: 30},
                {id: 3, x: 20, y: 0},
                {id: 4, x: 35, y: 60},
                {id: 5, x: 42.5, y: 90, isInterpolated: true, positionIsBeingChanged: true}
            ]);
            expect(interpolator2(1)).to.be.deep.equal(a);

            var l1 = Math.sqrt(20 * 20 + 40 * 40); // Length of line 2-3
            var l2 = Math.sqrt(20 * 20 + 80 * 80); // Length of line 3-4
            var kMid = (l2 - l1) / l2 / 2;
            var midX = 20 + 20 * kMid; // Expected X at t=0.5
            var midY = 80 * kMid; // Expected Y at t=0.5
            var checkMidPoint = function (id, d) {
                expect(d.id).to.be.equal(id);
                expect(d.isInterpolated).to.be.true;
                expect(d.positionIsBeingChanged).to.be.true;
                expect(d.x).to.be.closeTo(midX, 3);
                expect(d.y).to.be.closeTo(midY, 3);
            };

            var interpolator3 = createInterpolator([], b);
            expect(interpolator3(0)).to.be.deep.equal([]);
            var mid3 = interpolator3(0.5);
            expect(mid3.length).to.equal(3);
            expect(mid3[0]).to.be.deep.equal({id: 2, x: 0, y: 40});
            expect(mid3[1]).to.be.deep.equal({id: 3, x: 20, y: 0, positionIsBeingChanged: true});
            checkMidPoint(4, mid3[2]);
            expect(interpolator3(1)).to.be.deep.equal(b);

            var interpolator4 = createInterpolator(b, []);
            expect(interpolator4(0)).to.be.deep.equal(b);
            var mid4 = interpolator4(0.5);
            expect(mid4.length).to.equal(3);
            expect(mid4[0]).to.be.deep.equal({id: 2, x: 0, y: 40});
            expect(mid4[1]).to.be.deep.equal({id: 3, x: 20, y: 0, positionIsBeingChanged: true});
            checkMidPoint(4, mid4[2]);
            expect(interpolator4(1)).to.be.deep.equal([]);

            var interpolator5 = createInterpolator(a.slice(0, 3), [a[0]]);
            expect(interpolator5(0.5)).to.deep.equal([
                a[0],
                {id: 2, x: 10, y: 20, positionIsBeingChanged: true},
                {id: 3, x: 10, y: 20, isInterpolated: true, positionIsBeingChanged: true}
            ]);

            var interpolator6 = createInterpolator(a.slice(0, 3), [a[0], a[2]]);
            expect(interpolator6(0.5)).to.deep.equal([
                a[0],
                {id: 2, x: 10, y: 10, isInterpolated: true, positionIsBeingChanged: true},
                a[2]
            ]);

            var interpolator7 = createInterpolator([a[0], a[2]], a.slice(0, 3));
            expect(interpolator7(0.5)).to.deep.equal([
                a[0],
                {id: 2, x: 10, y: 10, positionIsBeingChanged: true},
                a[2]
            ]);

            var interpolator8 = createInterpolator([a[0], {id: 7, x: 10, y: 40}, a[2]], a.slice(0, 3));
            expect(interpolator8(0.5)).to.deep.equal([
                a[0],
                {id: a[1].id, x: 10, y: 30, positionIsBeingChanged: true},
                a[2]
            ]);
        });

        it('should interpolate smooth cubic path', function () {

            var a = toCurve([
                {id: 1, x: 0, y: 0},
                {id: 2, x: 30, y: 60},
                {id: 3, x: 60, y: 0},
                {id: 4, x: 90, y: 60},
                {id: 5, x: 120, y: 0}
            ]);
            var b = toCurve([
                {id: 2, x: 0, y: 120},
                {id: 3, x: 60, y: 0},
                {id: 5, x: 180, y: 0}
            ]);

            var c = toCurve([
                {id: 1, x: 0, y: 0},
                {id: 2, x: 60, y: 0},
                {id: 3, x: 120, y: 0}
            ]);

            var d = toCurve([
                {id: 1, x: 0, y: 0},
                {id: 4, x: 30, y: 0},
                {id: 5, x: 60, y: 0},
                {id: 3, x: 90, y: 0},
                {id: 6, x: 180, y: 0},
                {id: 7, x: 270, y: 0},
                {id: 8, x: 360, y: 0}
            ]);

            var e = toCurve([
                {id: 1, x: 0, y: 0},
                {id: 3, x: 210, y: 0}
            ]);

            var interpolate = createInterpolator(a, b, 'cubic');
            expect(interpolate(0.5)).to.deep.equal([
                {id: 1, x: -7.5, y: 67.5, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 0, y: 82.5, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 7.5, y: 90, isInterpolated: true, positionIsBeingChanged: true},
                {id: 2, x: 15, y: 90},
                {isCubicControl: true, x: 30, y: 50},
                {isCubicControl: true, x: 45, y: 0},
                {id: 3, x: 60, y: 0},
                {isCubicControl: true, x: 75, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 90, y: 30, isInterpolated: true, positionIsBeingChanged: true},
                {id: 4, x: 105, y: 30, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 120, y: 30, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 135, y: 20, isInterpolated: true, positionIsBeingChanged: true},
                {id: 5, x: 150, y: 0}
            ]);

            var interpolate2 = createInterpolator([], c, 'cubic');
            var result2 = interpolate2(0.75);
            expect(interpolate2(0.75)).to.deep.equal([
                {id: 1, x: 0, y: 0},
                {isCubicControl: true, x: 20, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 40, y: 0, positionIsBeingChanged: true},
                {id: 2, x: 60, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 70, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 80, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 3, x: 90, y: 0, isInterpolated: true, positionIsBeingChanged: true}
            ]);

            var interpolate3 = createInterpolator(result2, c, 'cubic');
            expect(interpolate3(0.75)).to.deep.equal([
                {id: 1, x: 0, y: 0},
                {isCubicControl: true, x: 20, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 40, y: 0, positionIsBeingChanged: true},
                {id: 2, x: 60, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 75, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 90, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 3, x: 105, y: 0, isInterpolated: true, positionIsBeingChanged: true}
            ]);

            var interpolate4 = createInterpolator(c, d, 'cubic');
            expect(interpolate4(0.5)).to.deep.equal([
                {id: 1, x: 0, y: 0},
                {isCubicControl: true, x: 10, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 20, y: 0, positionIsBeingChanged: true},
                {id: 4, x: 30, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 40, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 50, y: 0, positionIsBeingChanged: true},
                {id: 5, x: 60, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 75, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 90, y: 0, positionIsBeingChanged: true},
                {id: 3, x: 105, y: 0},
                {isCubicControl: true, x: 140, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 175, y: 0, positionIsBeingChanged: true},
                {id: 6, x: 210, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 227.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x:245, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 7, x: 262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x:262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 8, x: 262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true}
            ]);

            var interpolate5 = createInterpolator(d, c, 'cubic');
            var result5 = interpolate5(0.5);
            expect(result5).to.deep.equal([
                {id: 1, x: 0, y: 0},
                {isCubicControl: true, x: 10, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 20, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 4, x: 30, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 40, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 50, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 5, x: 60, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 75, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 90, y: 0, positionIsBeingChanged: true},
                {id: 3, x: 105, y: 0},
                {isCubicControl: true, x: 140, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 175, y: 0, positionIsBeingChanged: true},
                {id: 6, x: 210, y: 0, positionIsBeingChanged: true},
                {isCubicControl: true, x: 227.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x:245, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 7, x: 262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x:262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 8, x: 262.5, y: 0, isInterpolated: true, positionIsBeingChanged: true}
            ]);

            var interpolate6 = createInterpolator(result5, e, 'cubic');
            expect(interpolate6(0.5)).to.deep.equal([
                {id: 1, x: 0, y: 0},
                {isCubicControl: true, x: 37.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 45, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 5, x: 82.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 107.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 132.5, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 3, x: 157.5, y: 0},
                {isCubicControl: true, x: 183.75, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {isCubicControl: true, x: 210, y: 0, isInterpolated: true, positionIsBeingChanged: true},
                {id: 6, x: 236.25, y: 0, isInterpolated: true, positionIsBeingChanged: true}
            ]);
        });

        it('should render interpolated line', function (done) {

            this.timeout(3000);

            var testDiv = document.createElement('div');
            testDiv.style.width = '800px';
            testDiv.style.height = '600px';
            document.body.appendChild(testDiv);

            function getPolygonPoints() {
                return testDiv
                    .querySelector('polygon')
                    .getAttribute('points')
                    .split(' ')
                    .map(function (d) {
                        var p = d
                            .split(',')
                            .map(parseFloat);
                        return {x: p[0], y: p[1]};
                    });
            }

            var chart = new Taucharts.Chart({
                type: 'area',
                data: [
                    {x: 10, y: 4},
                    {x: 20, y: 2},
                    {x: 30, y: 8}
                ],
                x: 'x',
                y: 'y',
                settings: {
                    animationSpeed: 500
                }
            });

            var renderingCount = 0;
            chart.on('render', function () {
                renderingCount++;
                if (renderingCount === 1) {
                    setTimeout(function () {
                        var p = getPolygonPoints();
                        expect(p.length).to.equal(6);
                        expect(p[1].x).to.be.above(p[0].x);
                        expect(p[1].y).to.be.above(p[0].y);
                        chart.setData([
                            {x: 10, y: 4},
                            {x: 20, y: 2},
                            {x: 30, y: 0}
                        ]);
                    }, 250);
                }
                if (renderingCount === 2) {
                    setTimeout(function () {
                        var p = getPolygonPoints();
                        expect(p.length).to.equal(6);
                        expect(p[2].x - p[1].x).to.be.above(0);
                        expect(p[2].x - p[1].x).to.be.closeTo(p[1].x - p[0].x, 3);
                        expect(p[2].y - p[1].y).to.be.above(0);
                        expect(p[2].y - p[1].y).to.be.closeTo(p[1].y - p[0].y, 3);

                        testUtils.destroyCharts();
                        document.body.removeChild(testDiv);
                        done();
                    }, 750);
                }
            });

            chart.renderTo(testDiv);
        });

        it('should render interpolated curve', function () {

            var testDiv = document.createElement('div');
            testDiv.style.width = '800px';
            testDiv.style.height = '600px';
            document.body.appendChild(testDiv);

            var chart = new Taucharts.Chart({
                type: 'line',
                data: [
                    {x: 10, y: 4},
                    {x: 10, y: 4},
                    {x: 20, y: 8},
                    {x: 25, y: 8.1},
                    {x: 30, y: 2}
                ],
                x: 'x',
                y: 'y',
                guide: {
                    interpolate: 'smooth-keep-extremum'
                }
            });

            chart.renderTo(testDiv);

            var pathValue = document.querySelector('.line path').getAttribute('d');
            expect(pathValue.split(' ').length).to.equal(13);
        });

        it('should render interpolated area', function () {

            var testDiv = document.createElement('div');
            testDiv.style.width = '800px';
            testDiv.style.height = '600px';
            document.body.appendChild(testDiv);

            var chart = new Taucharts.Chart({
                type: 'area',
                data: [
                    {x: 10, y: 4},
                    {x: 20, y: 2},
                    {x: 30, y: 8}
                ],
                x: 'x',
                y: 'y',
                guide: {
                    x: {hide: true},
                    y: {hide: true},
                    interpolate: 'smooth-keep-extremum'
                }
            });

            chart.renderTo(testDiv);

            const pathValue = document.querySelector('.area path').getAttribute('d');
            const coords = Array.from(pathValue.match(/\d+\.?\d+,\d+\.?\d+/g))
                .map((c) => {
                    const pt = c.split(',').map(parseFloat);
                    return {x: pt[0], y: pt[1]};
                });
            const expected = [
                {'x': 255, 'y': 292},
                {'x': 340, 'y': 389},
                {'x': 426, 'y': 437},
                {'x': 511, 'y': 437},
                {'x': 596, 'y': 437},
                {'x': 681, 'y': 292},
                {'x': 766, 'y': 583},
                {'x': 681, 'y': 583},
                {'x': 596, 'y': 583},
                {'x': 511, 'y': 583},
                {'x': 426, 'y': 583},
                {'x': 340, 'y': 583},
                {'x': 255, 'y': 583}
            ];
            coords.forEach((p, i) => {
                expect(p.x).to.be.closeTo(expected[i].x, 10);
                expect(p.y).to.be.closeTo(expected[i].y, 10);
            });
        });
    });

    describe('brush-line-builder', function () {

        it('should return line with variable width', function () {

            var path = getBrushLine([
                {x: 20, y: 20, size: 40},
                {x: 40, y: 20, size: 40},
                {x: 50, y: 20, size: 20},
                {x: 80, y: 20, size: 40},
                {x: 110, y: 20, size: 20}
            ]);
            expect(testUtils.roundNumbersInString(path)).to.be.equal([
                'M20,0',
                'L40,0',
                'A20,20 0 0 1 40,40',
                'L20,40',
                'A20,20 0 0 1 20,0',
                'Z',
                'M40,0',
                'A20,20 0 0 1 40,40',
                'A20,20 0 0 1 40,0',
                'Z',
                'M47,11',
                'L73,1',
                'A20,20 0 1 1 73,39',
                'L47,29',
                'A10,10 0 0 1 47,11',
                'Z',
                'M87,1',
                'L113,11',
                'A10,10 0 0 1 113,29',
                'L87,39',
                'A20,20 0 1 1 87,1',
                'Z'
            ].join(' '));

            var singlePoint1 = getBrushLine([{x: 100, y: 100, size: 40}]);
            expect(singlePoint1).to.be.equal([
                'M100,80',
                'A20,20 0 0 1 100,120',
                'A20,20 0 0 1 100,80',
                'Z'
            ].join(' '));

            var singlePoint2 = getBrushLine([
                {x: 90, y: 100, size: 20},
                {x: 100, y: 100, size: 40}
            ]);
            expect(singlePoint2).to.be.equal([
                'M100,80',
                'A20,20 0 0 1 100,120',
                'A20,20 0 0 1 100,80',
                'Z'
            ].join(' '));

            var empty = getBrushLine([]);
            expect(empty).to.be.equal('');
        });

        it('should return curve with variable width', function () {

            var path = getBrushCurve(toCurve([
                {x: 0, y: 60, size: 30},
                {x: 30, y: 0, size: 15},
                {x: 60, y: 30, size: 30}
            ]));
            expect(testUtils.roundNumbersInString(path)).to.be.equal([
                'M-14,55',
                'C0,17 15,-8 30,-7',
                'A8,8 0 1 1 32,7',
                'C26,7 20,24 15,62',
                'A15,15 0 0 1 -14,55',
                'Z',
                'M29,-7',
                'C42,-9 59,3 72,21',
                'A15,15 0 0 1 46,35',
                'C40,15 36,8 28,7',
                'A8,8 0 0 1 29,-7',
                'Z'
            ].join(' '));

            var singlePoint1 = getBrushCurve(toCurve([{x: 100, y: 100, size: 40}]));
            expect(singlePoint1).to.be.equal([
                'M100,80',
                'A20,20 0 0 1 100,120',
                'A20,20 0 0 1 100,80',
                'Z'
            ].join(' '));

            var singlePoint2 = getBrushCurve(toCurve([
                {x: 90, y: 100, size: 20},
                {x: 100, y: 100, size: 40}
            ]));
            expect(singlePoint2).to.be.equal([
                'M100,80',
                'A20,20 0 0 1 100,120',
                'A20,20 0 0 1 100,80',
                'Z'
            ].join(' '));

            var empty = getBrushCurve(toCurve([]));
            expect(empty).to.be.equal('');
        });
    });
