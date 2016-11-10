import {utils} from '../utils';

export default function interpolatePathPoints(pointsFrom, pointsTo) {

    var interpolateIntermediate;

    return (t) => {
        if (t === 0) {
            return pointsFrom;
        }
        if (t === 1) {
            return pointsTo;
        }

        if (!interpolateIntermediate) {
            interpolateIntermediate = interpolateIntermediatePoints(pointsFrom, pointsTo);
        }

        return interpolateIntermediate(t);
    };
}

/**
 * Creates intermediate points array, so that the number of points
 * remains the same and added or excluded points are situated between
 * existing points.
 */
function interpolateIntermediatePoints(pointsFrom, pointsTo) {
    var intermediate = [];
    var remainingPoints = [];
    var changingPoints = [];

    for (var i = 2; i < pointsTo.length - 1; i += 3) {
        pointsTo[i - 1].isCubicControl = true;
        pointsTo[i].isCubicControl = true;
    }

    // if((pointsFrom.length>0&&pointsFrom.filter(d=>!d.isInterpolated).length-1)%3!==0){
    //     debugger
    // }

    // Replace interpolated points sequence with straight segment
    // TODO: Continue unfinished transition of ending points.
    // var interpolatedSequence=[];
    // for(var i=pointFrom.length-1;i>=0;i-=3){
    //     if(pointFrom[i].isInterpolated){
    //         interpolatedSequence.push(i);
    //     }
    //     if(
    //         interpolatedSequence.length>0&&
    //     (!pointFrom[i].isInterpolated||i===0)
    //     ){
    //         pointFrom.splice(
    //             interpolatedSequence[interpolatedSequence.length-1]-2,
    //             interpolatedSequence[0]- interpolatedSequence[interpolatedSequence.length-1]+5,
    //             getBezierPoint()
    //             )
    //         interpolatedSequence=[];
    //     }
    // }
    pointsFrom = pointsFrom.filter(d => !d.isInterpolated);


    if (pointsFrom.some((d, i) => i % 3 === 0 && !d.id)) {
        debugger;
    }

    // NOTE: Suppose data is already sorted by X.
    // var anchorsFrom = pointsFrom.filter(d => !d.isCubicControl);
    // var anchorsTo = pointsTo.filter(d => !d.isCubicControl);
    var anchorsFrom = pointsFrom.filter((d, i) => i % 3 === 0);
    var anchorsTo = pointsTo.filter((d, i) => i % 3 === 0);
    var idsFrom = anchorsFrom.map(d => d.id);
    var idsTo = anchorsTo.map(d => d.id);
    console.log('from',idsFrom,'to',idsTo);
    var indicesFrom = idsFrom.reduce((memo, id) => ((memo[id] = pointsFrom.findIndex(d => d.id === id), memo)), {});
    var indicesTo = idsTo.reduce((memo, id) => ((memo[id] = pointsTo.findIndex(d => d.id === id), memo)), {});
    var remainingIds = idsFrom
        .filter(id => idsTo.indexOf(id) >= 0);

    //
    // Determine start and end scales difference to apply
    // to initial target position of newly added points
    // (or end position of deleted points)

    var stableFrom = anchorsFrom.filter(d => !d.positionIsBeingChanged);
    var stableTo = anchorsTo.filter(d => !d.positionIsBeingChanged);
    var toEndScale = getScaleDiffFn(stableFrom, stableTo);
    var toStartScale = getScaleDiffFn(stableTo, stableFrom);

    //
    // Determine, how to interpolate changes between remaining points

    var handleEndingChanges = ({polylineFrom, polylineTo, intermediateStartIndex}) => {
        console.log('ending')

        var polyline = (polylineFrom.length > polylineTo.length ? polylineFrom : polylineTo);
        var decreasing = (polylineTo.length === 1);
        var isLeftEnding = (polylineFrom[0].id !== polylineTo[0].id);
        var rightToLeft = Boolean(isLeftEnding ^ decreasing);
        var toOppositeScale = (decreasing ? toEndScale : toStartScale);

        changingPoints.push({
            intermediateStartIndex,
            interpolate: (t) => {
                var interpolated = interpolateEnding({
                    t, polyline,
                    decreasing,
                    rightToLeft
                });
                if (decreasing === rightToLeft) {
                    interpolated.shift();
                } else {
                    interpolated.pop();
                }
                var diffed = interpolated.map(toOppositeScale);
                var points = interpolatePoints(diffed, interpolated, (decreasing ? 1 - t : t));
                points.forEach(d => d.positionIsBeingChanged = true);
                return points;
            }
        });
        push(intermediate, utils.range(polyline.length - 1).map(() => null));
    };

    var handleInnerChanges = ({polylineFrom, polylineTo, intermediateStartIndex}) => {
        console.log('inner')

        var oldCount = polylineFrom.length;
        var newCount = polylineTo.length;

        if (newCount !== oldCount) {
            var decreasing = newCount < oldCount;
            var smallerPolyline = decreasing ? polylineTo : polylineFrom;
            var biggerPolyline = decreasing ? polylineFrom : polylineTo;
            var filledPolyline = fillSmallerPolyline({
                smallerPolyline,
                biggerPolyline,
                decreasing
            });
            var biggerInnerPoints = biggerPolyline.slice(1, biggerPolyline.length - 1);
            var filledInnerPoints = filledPolyline.slice(1, filledPolyline.length - 1);
            changingPoints.push({
                intermediateStartIndex,
                interpolate: (t) => {
                    var points = interpolatePoints(
                        filledInnerPoints,
                        biggerInnerPoints,
                        (decreasing ? 1 - t : t)
                    );
                    points.forEach(d => d.positionIsBeingChanged = true);
                    return points;
                }
            });
        } else {
            var innerPointsFrom = polylineFrom.slice(1, polylineFrom.length - 1);
            var innerPointsTo = polylineTo.slice(1, polylineTo.length - 1);
            changingPoints.push({
                intermediateStartIndex,
                interpolate: (t) => {
                    var points = interpolatePoints(
                        innerPointsFrom,
                        innerPointsTo,
                        t
                    );
                    points.forEach(d => d.positionIsBeingChanged = true);
                    if(points.length+2<Math.max(polylineFrom.length,polylineTo.length)){
                        debugger;
                    }
                    return points;
                }
            });
        }
        push(intermediate, utils.range(Math.max(newCount, oldCount) - 2).map(() => null));
    };

    //
    // Interpolation of remaining points

    var handleRemainingPoint = ({pointFrom, pointTo, intermediateIndex}) => {
        console.log('remaining')
        remainingPoints.push({
            intermediateIndex,
            interpolate: (t) => {
                return interpolatePoint(pointFrom, pointTo, t);
            }
        });
        intermediate.push(null);
    };

    var handleControlsBetweenRemaining = ({polylineFrom, polylineTo, intermediateStartIndex}) => {
        console.log('between remaining')
        remainingPoints.push({
            intermediateIndex: intermediateStartIndex,
            interpolate: (t) => {
                return interpolatePoint(polylineFrom[1], polylineTo[1], t);
            }
        });
        remainingPoints.push({
            intermediateIndex: intermediateStartIndex + 1,
            interpolate: (t) => {
                return interpolatePoint(polylineFrom[2], polylineTo[2], t);
            }
        });
        intermediate.push(null, null);
    };

    //
    // Interpolation when no points remain

    var handleNonRemainingPath = ({polylineFrom, polylineTo}) => {
        console.log('non remaining')

        var decreasing = polylineTo.length === 0;
        var rightToLeft = decreasing;

        var polyline = (decreasing ? polylineFrom : polylineTo);
        intermediate.push(polyline[0]);
        push(intermediate, utils.range(polyline.length - 1).map(() => null));
        changingPoints.push({
            intermediateStartIndex: 1,
            interpolate: (t) => {
                var points = interpolateEnding({
                    t,
                    polyline,
                    decreasing,
                    rightToLeft
                }).slice(1);
                points.forEach(d => {
                    d.positionIsBeingChanged = true;
                });
                return points;
            }
        });
    };

    remainingIds.forEach((id, i) => {

        var indexFrom = indicesFrom[id];
        var indexTo = indicesTo[id];

        if (
            i === 0 &&
            (indexFrom > 0 || indexTo > 0)
        ) {
            handleEndingChanges({
                polylineFrom: pointsFrom.slice(0, indexFrom + 1),
                polylineTo: pointsTo.slice(0, indexTo + 1),
                intermediateStartIndex: 0
            });
        }

        if (i > 0) {
            var prevIndexFrom = indicesFrom[remainingIds[i - 1]];
            var prevIndexTo = indicesTo[remainingIds[i - 1]];
            if (indexFrom - prevIndexFrom > 3 || indexTo - prevIndexTo > 3) {
                handleInnerChanges({
                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1),
                    intermediateStartIndex: intermediate.length
                });
            } else {
                handleControlsBetweenRemaining({
                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1),
                    intermediateStartIndex: intermediate.length
                });
            }
        }

        handleRemainingPoint({
            pointFrom: pointsFrom[indexFrom],
            pointTo: pointsTo[indexTo],
            intermediateIndex: intermediate.length
        });

        if (
            i === remainingIds.length - 1 &&
            (pointsFrom.length - indexFrom - 1 > 0 ||
            pointsTo.length - indexTo - 1 > 0)
        ) {
            handleEndingChanges({
                polylineFrom: pointsFrom.slice(indexFrom),
                polylineTo: pointsTo.slice(indexTo),
                intermediateStartIndex: intermediate.length
            });
        }
    });

    if (changingPoints.length === 0 && (
        pointsTo.length > 0 && remainingIds.length === 0 ||
        pointsFrom.length > 0 && remainingIds.length === 0
    )) {
        handleNonRemainingPath({
            polylineFrom: pointsFrom.slice(0),
            polylineTo: pointsTo.slice(0)
        });
    }

    return (t) => {
        remainingPoints.forEach((d) => {
            var pt = d.interpolate(t);
            intermediate[d.intermediateIndex] = pt;
        });
        changingPoints.forEach((d) => {
            var points = d.interpolate(t);
            points.forEach((pt, i) => intermediate[d.intermediateStartIndex + i] = pt);
        });
        if(intermediate.length>Math.max(pointsFrom.length,pointsTo.length)){
            debugger;
        }
        if(intermediate.some(d=>!d||isNaN(d.x)||isNaN(d.y))){
            debugger;
        }
        if(intermediate.some((d,i)=>i%3===0&&!d.id)){
            debugger;
        }
        if((intermediate.length-1)%3!==0){
            debugger;
        }
        return intermediate;
    };
}

function push(target, items) {
    return Array.prototype.push.apply(target, items);
}

function interpolateValue(a, b, t) {
    if (a === undefined) {
        return b;
    }
    if (b === undefined) {
        return a;
    }
    if (typeof b === 'number') {
        return (a + t * (b - a));
    }
    return b;
}

function interpolatePoint(a, b, t) {
    if (a === b) {
        return b;
    }
    var c = {};
    var props = utils.unique(Object.keys(a), Object.keys(b));
    props.forEach((k) => c[k] = interpolateValue(a[k], b[k], t));
    c.id = b.id;
    return c;
}

function interpolatePoints(pointsFrom, pointsTo, t) {
    var result = pointsFrom.map((a, i) => interpolatePoint(a, pointsTo[i], t));
    return result;
}

/**
 * Returns a polyline with points that move along line
 * from start point to full line (or vice versa).
 */
function interpolateEnding({t, polyline, decreasing, rightToLeft}) {

    var reverse = Boolean(decreasing) !== Boolean(rightToLeft);

    var result = (function getLinePiece(t, line) {
        var pointsCount = (line.length - 1) / 3 + 1;
        var q = 0;
        if (t > 0) {
            var distance = [0];
            var totalDistance = 0;
            for (
                var i = 1, x1, y1, x0, y0, cx0, cy0, cx1, cy1, d;
                i < pointsCount;
                i++
            ) {
                x0 = line[i * 3 - 3].x;
                y0 = line[i * 3 - 3].y;
                cx0 = line[i * 3 - 2].x;
                cy0 = line[i * 3 - 2].y;
                cx1 = line[i * 3 - 1].x;
                cy1 = line[i * 3 - 1].y;
                x1 = line[i * 3].x;
                y1 = line[i * 3].y;
                d = (getDistance(x0, y0, cx0, cy0) +
                    getDistance(cx0, cy0, cx1, cy1) +
                    getDistance(cx1, cy1, x1, y1) +
                    getDistance(x1, y1, x0, y0)
                ) / 2;
                totalDistance += d;
                distance.push(totalDistance);
            }
            var passedDistance = t * totalDistance;
            for (i = 1; i < distance.length; i++) {
                if (passedDistance === distance[i]) {
                    q = (i / (pointsCount - 1));
                    break;
                }
                if (passedDistance < distance[i]) {
                    q = Math.min(1, (i - 1 +
                        (passedDistance - distance[i - 1]) /
                        (distance[i] - distance[i - 1])) /
                        (pointsCount - 1)
                    );
                    break;
                }
            }
        }

        var existingCount = Math.floor((pointsCount - 1) * q) + 1;
        var tempCount = pointsCount - existingCount;
        var tempStartIdIndex = existingCount * 3;
        var result = line.slice(0, (existingCount - 1) * 3 + 1);
        if (q < 1) {
            var qi = (q * (pointsCount - 1)) % 1;
            var spl = splitCubicSegment(
                qi,
                line.slice((existingCount - 1) * 3, existingCount * 3 + 1)
            );
            var newPiece = spl.slice(1, 4);
            newPiece.forEach(p => p.isInterpolated = true);
            newPiece[2].id = line[tempStartIdIndex].id;
            push(result, newPiece);
            utils.range(1, tempCount).forEach((i) => {
                push(result, [
                    {x: newPiece[2].x, y: newPiece[2].y, isCubicControl: true, isInterpolated: true},
                    {x: newPiece[2].x, y: newPiece[2].y, isCubicControl: true, isInterpolated: true},
                    Object.assign(
                        {}, newPiece[2],
                        {
                            id: line[tempStartIdIndex + i * 3].id,
                            isInterpolated: true
                        }
                    )
                ]);
            });
        }
        // if(result.some((p,i,arr)=>i>0&&arr[i-1].x>p.x)){
        //     debugger;
        // }
        return result;
    })(
        (decreasing ? 1 - t : t),
        (reverse ? polyline.slice(0).reverse() : polyline)
    );
    if (reverse) {
        result.reverse();
    }

    return result;
}

/**
 * Returns a polyline, filled with points, so that number of points
 * becomes the same on both start and end polylines.
 */
function fillSmallerPolyline({smallerPolyline, biggerPolyline, decreasing}) {

    var smallerSegCount = (smallerPolyline.length - 1) / 3;
    var biggerSegCount = (biggerPolyline.length - 1) / 3;
    var minSegmentPointsCount = Math.floor(biggerSegCount / smallerSegCount) + 1;
    var restPointsCount = biggerSegCount % smallerSegCount;
    var segmentsPointsCount = utils.range(smallerSegCount)
        .map(i => (minSegmentPointsCount + Number(i < restPointsCount)));

    var result = [smallerPolyline[0]];
    var smallPtIndex = 3;
    segmentsPointsCount.forEach((segPtCount) => {
        if (segPtCount > 2) {
            var spl = multipleSplitCubicSegment(
                utils.range(1, segPtCount - 1).map(i => i / (segPtCount - 1)),
                smallerPolyline.slice(smallPtIndex - 3, smallPtIndex + 1)
            );
            utils.range(segPtCount - 2)
                .forEach(i => spl[(i + 1) * 3].id = biggerPolyline[result.length - 1 + i * 3].id);
            if (decreasing) {
                spl.forEach((p, i) => {
                    if (i > 0 && i < spl.length - 1) {
                        p.isInterpolated = true;
                    }
                });
            }
            push(result, spl.slice(1));
        } else {
            var newC0 = Object.assign({}, smallerPolyline[smallPtIndex])
            var newC1 = Object.assign({}, smallerPolyline[smallPtIndex + 1])
            var newPt = Object.assign({}, smallerPolyline[smallPtIndex + 2]);
            if (!decreasing) {
                newPt.id = biggerPolyline[result.length + 2].id;
            }
            result.push(newC0, newC1, newPt);
        }
        smallPtIndex += 3;
    });

    return result;
}

/**
 * Returns a function which moves a point from it's scale
 * to opposite scale (e.g. from start scale to end scale).
 */
function getScaleDiffFn(points1, points2) {

    // Find remaining points with predictable position
    var src = [];
    var dst = [];
    var i, j, a, b, matchJ = 0;
    var len1 = points1.length;
    var len2 = points2.length;
    for (i = 0; i < len1; i++) {
        a = points1[i];
        for (j = matchJ; j < len2; j++) {
            b = points2[j];
            if (a.id === b.id) {
                matchJ = j + 1;
                src.push(a);
                dst.push(b);
                break;
            }
        }
    }

    if (src.length < 1 || dst.length < 1) {
        // Applying scale difference will not be possible
        return (d => d);
    }

    var numProps = Object.keys(src[0])
        .filter(prop => typeof src[0][prop] === 'number')
        .filter(prop => prop !== 'id');

    var propDiffs = {};
    var createPropDiffFn = (a0, b0, a, b) => (c0) => (
        b +
        (c0 - b0) *
        (b - a) /
        (b0 - a0)
    );
    var createSimpleDiffFn = (a0, a) => (c0) => (c0 - a0 + a);
    numProps.forEach(prop => {
        var a0 = src[0][prop];
        var a = dst[0][prop];
        for (var i = src.length - 1, b0, b; i > 0; i--) {
            b0 = src[i][prop];
            if (b0 !== a0) {
                b = dst[i][prop];
                propDiffs[prop] = createPropDiffFn(a0, b0, a, b);
                return;
            }
        }
        propDiffs[prop] = createSimpleDiffFn(a0, a);
    });

    return (c0) => {
        var c = Object.assign({}, c0);
        numProps.forEach(p => {
            c[p] = propDiffs[p](c0[p]);
        });
        return c;
    };
}

function getDistance(x0, y0, x, y) {
    return Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
}

function splitCubicSegment(t, [p0, c0, c1, p1]) {
    var r = utils.unique(Object.keys(p0), Object.keys(p1))
        .reduce((memo, k) => {
            if (k === 'x' || k === 'y') {
                memo[k] = bezier(t, [p0[k], c0[k], c1[k], p1[k]]);
            } else {
                memo[k] = interpolateValue(p0[k], p1[k]);
            }
            return memo;
        }, {});
    var c2 = getBezierPoint(t, p0, c0);
    var c3 = getBezierPoint(t, p0, c0, c1);
    var c4 = getBezierPoint(t, c0, c1, p1);
    var c5 = getBezierPoint(t, c1, p1);
    [c2, c3, c4, c5].forEach(c => c.isCubicControl = true);
    // if([p0, c2, c3, r, c4, c5, p1].some(p=>isNaN(p.x)||isNaN(p.y))){
    //     debugger;
    // }

    // if([p0, c2, c3, r, c4, c5, p1].some((p,i,arr)=>i>0&&arr[i-1].x>p.x)){
    //     debugger;
    // }

    return [p0, c2, c3, r, c4, c5, p1];
}

function multipleSplitCubicSegment(ts, seg) {
    var result = [seg[0]];
    for (var i = 0, t, spl; i < ts.length; i++) {
        t = i === 0 ? ts[0] : ts[i] / (1 - ts[i - 1]);
        spl = splitCubicSegment(t, seg);
        push(result, spl.slice(1, 4));
        seg = spl.slice(3);
    }
    push(result, seg.slice(1));

    if(result.some((p,i,arr)=>i>0&&arr[i-1].x>p.x)){
        debugger;
    }

    return result;
}

function bezier(t, p) {
    if (p.length === 2) {
        return (p[0] * (1 - t) + p[1] * t);
    }
    if (p.length === 3) {
        return (
            p[0] * (1 - t) * (1 - t) +
            2 * p[1] * (1 - t) * t
            + p[2] * t * t
        );
    }
    return (
        p[0] * (1 - t) * (1 - t) * (1 - t) +
        3 * p[1] * (1 - t) * (1 - t) * t +
        3 * p[2] * (1 - t) * t * t +
        p[3] * t * t * t
    );
}

function getBezierPoint(t, ...p) {
    var pt = {
        x: bezier(t, p.map(p => p.x)),
        y: bezier(t, p.map(p => p.y))
    };
    if (isNaN(pt.x) || isNaN(pt.y)){
        debugger;
    }
    return pt;
}
