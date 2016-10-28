define(function (require) {
    var expect = require('chai').expect;
    var tauCharts = require('src/tau.charts');
    var createInterpolator = require('src/utils/path-points-interpolator').default;
    var testUtils = require('testUtils');

    describe('path-points-interpolator', function() {

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
                {id: 1, x: -2.5, y: 15, isInterpolatedEnding: true, positionIsBeingChanged: true},
                {id: 2, x: 5, y: 30},
                {id: 3, x: 20, y: 0},
                {id: 4, x: 35, y: 60},
                {id: 5, x: 42.5, y: 90, isInterpolatedEnding: true, positionIsBeingChanged: true}
            ]);
            expect(interpolator1(1)).to.be.deep.equal(b);

            var interpolator2 = createInterpolator(b, a);
            expect(interpolator2(0)).to.be.deep.equal(b);
            expect(interpolator2(0.5)).to.be.deep.equal([
                {id: 1, x: -2.5, y: 15, isInterpolatedEnding: true, positionIsBeingChanged: true},
                {id: 2, x: 5, y: 30},
                {id: 3, x: 20, y: 0},
                {id: 4, x: 35, y: 60},
                {id: 5, x: 42.5, y: 90, isInterpolatedEnding: true, positionIsBeingChanged: true}
            ]);
            expect(interpolator2(1)).to.be.deep.equal(a);

            var l1 = Math.sqrt(20 * 20 + 40 * 40); // Length of line 2-3
            var l2 = Math.sqrt(20 * 20 + 80 * 80); // Length of line 3-4
            var kMid = (l2 - l1) / l2 / 2;
            var midX = 20 + 20 * kMid; // Expected X at t=0.5
            var midY = 80 * kMid; // Expected Y at t=0.5
            var checkMidPoint = function (id, d) {
                expect(d.id).to.be.equal(id);
                expect(d.isInterpolatedEnding).to.be.true;
                expect(d.positionIsBeingChanged).to.be.true;
                expect(d.x).to.be.closeTo(midX, 1e-6);
                expect(d.y).to.be.closeTo(midY, 1e-6);
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
                {id: 3, x: 10, y: 20, isInterpolatedEnding: true, positionIsBeingChanged: true}
            ]);

            var interpolator6 = createInterpolator(a.slice(0, 3), [a[0], a[2]]);
            expect(interpolator6(0.5)).to.deep.equal([
                a[0],
                {id: 2, x: 10, y: 10, positionIsBeingChanged: true},
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
                {id: 7, x: 10, y: 30, positionIsBeingChanged: true},
                a[2]
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
                        expect(p[2].x - p[1].x).to.be.closeTo(p[1].x - p[0].x, 1);
                        expect(p[2].y - p[1].y).to.be.above(0);
                        expect(p[2].y - p[1].y).to.be.closeTo(p[1].y - p[0].y, 1);

                        testUtils.destroyCharts();
                        document.body.removeChild(testDiv);
                        done();
                    }, 750);
                }
            });

            chart.renderTo(testDiv);
        });
    });
});
