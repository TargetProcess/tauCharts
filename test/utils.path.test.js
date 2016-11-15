define(function (require) {
    var expect = require('chai').expect;
    var tauCharts = require('src/tau.charts');
    var createInterpolator = require('src/utils/path/path-points-interpolator').default;
    var getBrushLine = require('src/utils/path/brush-line-builder').getBrushLine;
    var getBrushCurve = require('src/utils/path/brush-line-builder').getBrushCurve;
    var toCurve = require('src/utils/path/smooth-cubic-line').default;
    var lines = require('src/utils/path/line-builder');
    var testUtils = require('testUtils');

    describe('path utilities', function() {

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

            var chart = new tauCharts.Chart({
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

            var chart = new tauCharts.Chart({
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
                    smooth: true
                }
            });

            chart.renderTo(testDiv);

            var pathValue = document.querySelector('.line path').getAttribute('d');
            expect(pathValue.split(' ').length).to.equal(13);
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
            expect(testUtils.roundNumbersInString(path)).to.be.equal(testUtils.roundNumbersInString([
                'M20,0',
                'L40,0 A20,20 0 0 1 40,40',
                'L20,40',
                'A20,20 0 0 1 20,0',
                'Z',
                'M40,0',
                'A20,20 0 0 1 40,40',
                'A20,20 0 0 1 40,0',
                'Z',
                'M46.66666666666667,10.571909584179366',
                'L73.33333333333334,1.143819168358732',
                'A20,20 0 1 1 73.33333333333334,38.85618083164127',
                'L46.66666666666667,29.428090415820634',
                'A10,10 0 0 1 46.66666666666667,10.571909584179366 Z',
                'M86.66666666666667,1.143819168358732',
                'L113.33333333333333,10.571909584179366',
                'A10,10 0 0 1 113.33333333333333,29.428090415820634',
                'L86.66666666666667,38.85618083164127',
                'A20,20 0 1 1 86.66666666666667,1.143819168358732',
                'Z'
            ].join(' ')));

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
            expect(testUtils.roundNumbersInString(path)).to.be.equal(testUtils.roundNumbersInString([
                'M-14.05415602256123,54.75779640861728',
                'C3.363705427503618,8.061147159632753',
                '13.370490600352586,-9.418285063787309',
                '30.83852549156242,-7.452977592881922',
                'A7.5,7.5 0 0 1',
                '30.83852549156242,7.452977592881922',
                'C29.613478019777872,7.5908062017384035',
                '19.47738655746353,27.51767638103349',
                '14.86764523938119,61.98824672410288',
                'A15,15 0 1 1 -14.05415602256123,54.75779640861728',
                'Z',
                'M28.674174785275223,-7.381882381886073',
                'C45.46880488943544,-10.398286994171734',
                '53.91278416688439,-3.224318106531676',
                '72.01925852368112,21.025735431751585',
                'A15,15 0 1 1',
                '45.609033231192605,34.230848077995844',
                'C41.28403430775218,19.5196330603575',
                '30.166015798595616,7.649824937659412',
                '28.674174785275223,7.381882381886073',
                'A7.5,7.5 0 0 1',
                '28.674174785275223,-7.381882381886073',
                'Z'
            ].join(' ')));

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
});
