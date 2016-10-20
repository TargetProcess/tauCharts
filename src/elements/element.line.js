import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

export class Line extends BasePath {

    constructor(config) {

        super(config);

        var enableStack = this.config.stack;

        this.config.guide = utils.defaults(
            (this.config.guide || {}),
            {
                interpolate: 'linear'
            });

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_groundY0,
            CartesianGrammar.decorator_group,
            !enableStack && CartesianGrammar.decorator_groupOrderByAvg,
            enableStack && CartesianGrammar.decorator_groupOrderByColor,
            enableStack && CartesianGrammar.decorator_stack,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && CartesianGrammar.adjustStaticSizeScale,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale
        ].concat(config.transformModel || []);
    }

    buildModel(screenModel) {

        var self = this;

        var wMax = this.config.options.width;
        var hMax = this.config.options.height;

        var limit = (x, minN, maxN) => {

            var k = 1000;
            var n = Math.round(x * k) / k;

            if (n < minN) {
                return minN;
            }

            if (n > maxN) {
                return maxN;
            }

            return n;
        };

        var baseModel = super.buildModel(screenModel);

        baseModel.matchRowInCoordinates = (rows, {x, y}) => {
            var by = ((prop) => ((a, b) => (a[prop] - b[prop])));
            var dist = ((x0, x1, y0, y1) => Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2)));

            // d3.invert doesn't work for ordinal axes
            var vertices = rows
                .map((row) => {
                    var rx = baseModel.x(row);
                    var ry = baseModel.y(row);
                    return {
                        x: rx,
                        y: ry,
                        dist: dist(x, rx, y, ry),
                        data: row
                    };
                });

            // double for consistency in case of
            // (vertices.length === 1)
            vertices.push(vertices[0]);

            var pair = utils.range(vertices.length - 1)
                .map((edge) => {
                    var v0 = vertices[edge];
                    var v1 = vertices[edge + 1];
                    var ab = dist(v1.x, v0.x, v1.y, v0.y);
                    var ax = v0.dist;
                    var bx = v1.dist;
                    var er = Math.abs(ab - (ax + bx));
                    return [er, v0, v1];
                })
                .sort(by('0')) // find minimal distance to edge
                [0]
                .slice(1);

            return pair.sort(by('dist'))[0].data;
        };

        var guide = this.config.guide;
        var options = this.config.options;
        var widthCss = (this.isEmptySize ?
            (guide.widthCssClass || getLineClassesByWidth(options.width)) :
            (''));
        var countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);

        var tag = this.isEmptySize ? 'line' : 'area';
        const groupPref = `${CSS_PREFIX}${tag} ${tag} i-role-path ${widthCss} ${countCss} ${guide.cssClass} `;

        var d3Line = d3.svg
            .line()
            .interpolate(guide.interpolate)
            .x(baseModel.x)
            .y(baseModel.y);

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame`
        };

        baseModel.pathElement = this.isEmptySize ? 'path' : 'polygon';

        var d3LineVarySize = (x, y, w) => {
            return (fiber) => {
                var xy = ((d) => ([x(d), y(d)]));
                var ways = fiber
                    .reduce((memo, d, i, list) => {
                        var dPrev = list[i - 1];
                        var dNext = list[i + 1];
                        var curr = xy(d);
                        var prev = dPrev ? xy(dPrev) : null;
                        var next = dNext ? xy(dNext) : null;

                        var width = w(d);
                        var lAngle = dPrev ? (Math.PI - Math.atan2(curr[1] - prev[1], curr[0] - prev[0])) : Math.PI;
                        var rAngle = dNext ? (Math.atan2(curr[1] - next[1], next[0] - curr[0])) : 0;

                        var gamma = lAngle - rAngle;

                        if (gamma === 0) {
                            // Avoid divide be zero
                            return memo;
                        }

                        var diff = width / 2 / Math.sin(gamma / 2);
                        var aup = rAngle + gamma / 2;
                        var adown = aup - Math.PI;
                        var dxup = diff * Math.cos(aup);
                        var dyup = diff * Math.sin(aup);
                        var dxdown = diff * Math.cos(adown);
                        var dydown = diff * Math.sin(adown);

                        var dir = [
                            limit(curr[0] + dxup, 0, wMax), // x
                            limit(curr[1] - dyup, 0, hMax)  // y
                        ];

                        var rev = [
                            limit(curr[0] + dxdown, 0, wMax),
                            limit(curr[1] - dydown, 0, hMax)
                        ];

                        memo.dir.push(dir);
                        memo.rev.push(rev);

                        return memo;
                    },
                    {
                        dir: [],
                        rev: []
                    });

                return [].concat(ways.dir).concat(ways.rev.reverse()).join(' ');
            };
        };

        var cache = [];
        var prevNext = utils.memoize(
            (thisNode, fiber) => {
                var testPath = d3
                    .select(thisNode.parentNode)
                    .append('path')
                    .datum(fiber)
                    .attr({d: d3Line, opacity: 0});
                var next = testPath.node().getTotalLength();
                testPath.remove();
                return {prev: thisNode.hasAttribute('d') ? thisNode.getTotalLength() : 0, next};
            },
            (nodeRef) => {
                var index = cache.indexOf(nodeRef);
                if (index < 0) {
                    index = cache.push(nodeRef) - 1;
                }
                return index;
            });

        var pathAttributesDefault = this.isEmptySize ?
            {
                d: function (fiber) {
                    prevNext(this, fiber);
                    return d3Line(fiber);
                },
                // 'stroke-dasharray': function (fiber) {
                //     var {next} = prevNext(this, fiber);
                //     return `${next} ${next}`;
                // },
                // 'stroke-dashoffset': function (fiber) {
                //     var {prev, next} = prevNext(this, fiber);
                //     return next - prev;
                // }
            } :
            {
                points: d3LineVarySize(baseModel.x, baseModel.y, () => 0)
            };

        var pathAttributes = this.isEmptySize ?
            ({
                // d: d3Line,
                stroke: (fiber) => baseModel.color(fiber[0]),
                class: 'i-role-datum',
                // 'stroke-dashoffset': 0
            }) :
            ({
                fill: (fiber) => baseModel.color(fiber[0]),
                points: d3LineVarySize(baseModel.x, baseModel.y, baseModel.size)
            });

        baseModel.pathAttributesUpdateInit = this.isEmptySize ?
            (baseModel.gog.scaleX.discrete ? null : pathAttributesDefault) :
            (null);
        baseModel.pathAttributesUpdateDone = pathAttributes;

        baseModel.pathAttributesEnterInit = pathAttributesDefault;
        baseModel.pathAttributesEnterDone = pathAttributes;

        var tweenStore = '__pathTween__';
        var tempPointId = '__pathTween_pointId__';
        var toPoint = (d) => ({
            id: d[tempPointId] || self.screenModel.id(d),
            x: baseModel.x(d),
            y: baseModel.y(d)
        });
        baseModel.pathTween = {
            attr: 'd',
            fn: function (dataTo) {
                if (!this[tweenStore]) {
                    this[tweenStore] = {
                        line: d3Line,
                        data: []
                    };
                }
                var dataFrom = this[tweenStore].data.filter(d => !d[tempPointId]);
                // console.log('tween', dataFrom, dataTo);
                var intermediate;
                var changingPoints = [];
                var push = (target, items) => Array.prototype.push.apply(target, items);
                var getChangingEnding = function ({t, polyline, decreasing, rightToLeft}) {

                    var getLinePiece = (q, line) => {
                        var existingCount = Math.floor((line.length - 1) * q) + 1;
                        var tempCount = line.length - existingCount;
                        var tempStartIdIndex = existingCount;
                        var qi = (q * (line.length - 1)) % 1;
                        var midPt = d3.interpolate(
                            line[existingCount - 1],
                            line[existingCount]
                        )(qi);
                        var result = line.slice(0, existingCount);
                        push(result, utils.range(tempCount).map((i) => Object.assign(
                            {}, midPt,
                            { [tempPointId]: ((pt) => pt[tempPointId] || self.screenModel.id(pt))(line[tempStartIdIndex + i]) }
                        )));
                        console.log('piece', result.map(d => d.x), decreasing ? 'decrease' : 'increase', rightToLeft ? 'rightToLeft' : 'leftToRight');
                        return result.slice(1);
                    };

                    var reverse = Boolean(decreasing) !== Boolean(rightToLeft);
                    var result = getLinePiece(
                        (decreasing ? (1 - t) : t),
                        (reverse ? polyline.slice(0).reverse() : polyline)
                    );
                    if (reverse) {
                        result.reverse();
                    }

                    if (result.length !== polyline.length - 1) {
                        debugger;
                    }
                    if (!result.every(d => d)) {
                        debugger;
                    }
                    return result;
                };
                var getMiddlePoints = function ({t, pointsFrom, pointsTo}) {
                    // return pointTo;
                    return d3.interpolate(pointsFrom, pointsTo)(t);
                };
                return function (t) {
                    if (t === 0) {
                        return this[tweenStore].line(dataFrom);
                    }
                    if (t === 1) {
                        this[tweenStore].data = dataTo;
                        this[tweenStore].line = d3Line;
                        return d3Line(dataTo);
                    }
                    if (!intermediate) {
                        let xSorter = (a, b) => baseModel.x(a) - baseModel.x(b);
                        // NOTE: Suppose data is already sorted by X.
                        let mapFrom = dataFrom.reduce((memo, d) => (memo[d[tempPointId] || self.screenModel.id(d)] = d, memo), {});
                        let mapTo = dataTo.reduce((memo, d) => (memo[d[tempPointId] || self.screenModel.id(d)] = d, memo), {});
                        let idsFrom = Object.keys(mapFrom);
                        let idsTo = Object.keys(mapTo);
                        let tempIdsFrom = dataFrom.filter(d => d[tempPointId]).map(d => String(d[tempPointId]));
                        let tempIdsTo = dataTo.filter(d => d[tempPointId]).map(d => String(d[tempPointId]));
                        // let addedIds = idsTo.filter(d => idsFrom.indexOf(d) < 0 || tempIdsFrom.indexOf(d) >= 0);
                        let addedIds = idsTo.filter(d => idsFrom.indexOf(d) < 0);
                        let deletedIds = idsFrom.filter(d => idsTo.indexOf(d) < 0);
                        let remainingIds = (idsFrom.length < idsTo.length ? idsFrom : idsTo)
                            .filter(d => addedIds.indexOf(d) < 0 && deletedIds.indexOf(d) < 0);

                        // Create intermediate points array, so that the number of points
                        // remains the same and added or excluded points are situated between
                        // existing points.
                        console.log('from',idsFrom,'to',idsTo,'added',addedIds,'delete',deletedIds,'remain',remainingIds);
                        // if(idsFrom.length===1){
                        //     debugger;
                        // }
                        intermediate = [];
                        remainingIds.forEach((id, i) => {
                            var indexFrom = idsFrom.indexOf(id);
                            var indexTo = idsTo.indexOf(id);
                            if (i === 0 && remainingIds.length > 1) {

                                //
                                // Left side changes

                                let oldCount = indexFrom;
                                let newCount = indexTo;

                                if (newCount > 0 || oldCount > 0) {
                                    let decreasing = newCount === 0;
                                    let polyline = decreasing ?
                                        dataFrom.slice(0, indexFrom + 1) :
                                        dataTo.slice(0, indexTo + 1);
                                    changingPoints.push({
                                        startIndex: 0,
                                        getPoints: function (t) {
                                            return getChangingEnding({ t, polyline, decreasing, rightToLeft: !decreasing });
                                        }
                                    });
                                    push(intermediate, utils.range(polyline.length - 1).map(() => null));
                                }

                                intermediate.push(dataTo[indexTo]);
                                // changingPoints.push({
                                //     startIndex: intermediate.length - 1,
                                //     getPoints: function (t) {
                                //         return [getMiddlePoint({ t, pointFrom: dataFrom[indexFrom], pointTo: dataTo[indexTo] })];
                                //     }
                                // });

                            } else if (i === remainingIds.length - 1) {

                                //
                                // Right side changes

                                intermediate.push(dataTo[indexTo]);
                                // changingPoints.push({
                                //     startIndex: intermediate.length - 1,
                                //     getPoints: function (t) {
                                //         return [getMiddlePoint({ t, pointFrom: dataFrom[indexFrom], pointTo: dataTo[indexTo] })];
                                //     }
                                // });

                                let oldCount = dataFrom.length - indexFrom - 1;
                                let newCount = dataTo.length - indexTo - 1;

                                if (newCount > 0 || oldCount > 0) {
                                    let decreasing = newCount === 0;
                                    let polyline = decreasing ?
                                        dataFrom.slice(indexFrom) :
                                        dataTo.slice(indexTo);
                                    changingPoints.push({
                                        startIndex: intermediate.length,
                                        getPoints: function (t) {
                                            return getChangingEnding({ t, polyline, decreasing, rightToLeft: decreasing });
                                        }
                                    });
                                    push(intermediate, utils.range(polyline.length - 1).map(() => null));
                                }

                            } else {

                                //
                                // Inner changes

                                let oldCount = indexFrom - idsFrom.indexOf(remainingIds[i - 1]) - 1;
                                let newCount = indexTo - idsTo.indexOf(remainingIds[i - 1]) - 1;

                                let fillSmallerPolyline = function ({smallPolyline, bigPolyline}) {
                                    var segmentsCount = {
                                        small: smallPolyline.length - 1,
                                        big: bigPolyline.length - 1
                                    };
                                    var minSegmentPointsCount = Math.floor(segmentsCount.big / segmentsCount.small);
                                    var restPointsCount = segmentsCount.big % segmentsCount.small;
                                    var segmentsPointsCount = utils.range(segmentsCount.small)
                                        .map(i => (minSegmentPointsCount + i < restPointsCount ? 1 : 0));

                                    var result = [];
                                    var smallPtIndex = 0;
                                    segmentsPointsCount.forEach((segPtCount, si) => {
                                        utils.range(segPtCount).forEach(i => {
                                            if (
                                                (si === 0 && i === 0) ||
                                                (si === segmentsPointsCount.length - 1 && i === segPtCount - 1)
                                            ) {
                                                return;
                                            }
                                            // TODO: Fill IDs.
                                            if (i === segPtCount - 1) {
                                                result.push(smallPolyline[smallPtIndex]);
                                            } else {
                                                result.push(d3.interpolate(
                                                    smallPolyline[smallPtIndex - 1],
                                                    smallPolyline[smallPtIndex]
                                                )(i / (segPtCount - 1)));
                                            }
                                            smallPtIndex++;
                                        });
                                    });
                                    return result;
                                };

                                let putChangingPoints = function (smallerData, smallerIndex, smallerCount, biggerData, biggerIndex, biggerCount, reverse) {
                                    let biggerPoly = biggerData.slice(
                                        biggerIndex - biggerCount,
                                        biggerIndex
                                    );
                                    let filledPoly = fillSmallerPolyline({
                                        smallPolyline: smallerData.slice(
                                            smallerIndex - smallerCount,
                                            smallerIndex
                                        ),
                                        bigPolyline: biggerPoly
                                    });
                                    changingPoints.push({
                                        startIndex: intermediate.length,
                                        getPoints: function (t) {
                                            return getMiddlePoints({
                                                t: reverse ? 1 - t : t,
                                                pointsFrom: filledPoly,
                                                pointsTo: biggerPoly
                                            });
                                        }
                                    });
                                };

                                if (newCount > oldCount) {
                                    putChangingPoints(dataFrom, indexFrom, oldCount, dataTo, indexTo, newCount, false);
                                } else if (oldCount > newCount) {
                                    putChangingPoints(dataTo, indexTo, newCount, dataFrom, indexFrom, oldCount, true);
                                } else {
                                    changingPoints.push({
                                        startIndex: intermediate.length,
                                        getPoints: function (t) {
                                            return getMiddlePoints({
                                                t,
                                                pointsFrom: dataFrom.slice(
                                                    indexFrom - oldCount,
                                                    indexFrom
                                                ),
                                                pointsTo: dataTo.slice(
                                                    indexTo - newCount,
                                                    indexTo
                                                )
                                            });
                                        }
                                    });
                                }
                                push(intermediate, utils.range(Math.max(newCount, oldCount)).map(() => null));

                                intermediate.push(dataTo[indexTo]);
                                // changingPoints.push({
                                //     startIndex: intermediate.length - 1,
                                //     getPoints: function (t) {
                                //         return [getMiddlePoint({ t, pointFrom: dataFrom[indexFrom], pointTo: dataTo[indexTo] })];
                                //     }
                                // });

                            }
                        });
                        if (changingPoints.length === 0) {
                            if (dataTo.length > 0 && dataFrom.length === 0) {
                                intermediate.push(dataTo[0]);
                                push(intermediate, utils.range(dataTo.length - 1).map(() => null));
                                let polyline = dataTo.slice(0);
                                changingPoints.push({
                                    startIndex: 1,
                                    getPoints: function (t) {
                                        return getChangingEnding({ t, polyline, decreasing: false });
                                    }
                                });
                            } else if (dataFrom.length > 0 && dataTo.length === 0) {
                                intermediate.push(dataTo[0]);
                                push(intermediate, utils.range(dataTo.length - 1).map(() => null));
                                let polyline = dataTo.slice(0);
                                changingPoints.push({
                                    startIndex: 1,
                                    getPoints: function (t) {
                                        return getChangingEnding({ t, polyline, decreasing: true });
                                    }
                                });
                            }
                        }
                    }
                    changingPoints.forEach((d) => {
                        var points = d.getPoints(t);
                        points.forEach((pt, i) => intermediate[d.startIndex + i] = pt);
                    });
                    // console.log(intermediate);
                    // if(intermediate.some(d=>(d[tempPointId]||self.screenModel.id(d))>4)){
                    //     debugger
                    // }
                    this[tweenStore].data = intermediate;
                    for (var i = 1; i < intermediate.length; i++) {
                        if (intermediate[i].x < intermediate[i - 1].x) {
                            debugger;
                        }
                    }
                    console.log('x', intermediate.map(d => d.x), 't', t);
                    console.log('id', intermediate.map(d => d[tempPointId] || self.screenModel.id(d)));
                    var prevLine = this[tweenStore].line;
                    // this[tweenStore].line = (data) => d3.interpolate(prevLine(data), d3Line(data))(t);
                    var path = d3.interpolate(this[tweenStore].line(intermediate), d3Line(intermediate))(t);
                    // var path = this[tweenStore].line(intermediate);
                    // var path=d3Line(intermediate);
                    return path;
                }.bind(this);
            }
        };

        baseModel.afterPathUpdate = (thisNode) => {
            d3.select(thisNode).attr({
                'stroke-dasharray': null,
                'stroke-dashoffset': null
            });
        };

        return baseModel;
    }
}