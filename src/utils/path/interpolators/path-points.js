import {utils} from '../../utils';

/**
 * Returns intermediate line or curve between two sources.
 */
export default function interpolatePathPoints(pointsFrom, pointsTo, type = 'polyline') {

    var interpolate;

    return (t) => {
        if (t === 0) {
            return pointsFrom;
        }
        if (t === 1) {
            return pointsTo;
        }

        if (!interpolate) {
            interpolate = (type === 'cubic' ?
                getCubicInterpolator :
                getLinearInterpolator
            )(pointsFrom, pointsTo);
        }

        return interpolate(t);
    };
}

/**
 * Creates intermediate points array, so that the number of points
 * remains the same and added or excluded points are situated between
 * existing points.
 */
function getLinearInterpolator(pointsFrom, pointsTo) {

    // TODO: Continue unfinished transition of ending points.
    pointsFrom = pointsFrom.filter(d => !d.isInterpolated);

    // NOTE: Suppose data is already sorted by X.
    var idsFrom = pointsFrom.map(d => d.id);
    var idsTo = pointsTo.map(d => d.id);
    var remainingIds = idsFrom
        .filter(id => idsTo.indexOf(id) >= 0);

    //
    // Determine start and end scales difference to apply
    // to initial target position of newly added points
    // (or end position of deleted points)

    var stableFrom = pointsFrom.filter(d => !d.positionIsBeingChanged);
    var stableTo = pointsTo.filter(d => !d.positionIsBeingChanged);
    var toEndScale = getScaleDiffFn(stableFrom, stableTo);
    var toStartScale = getScaleDiffFn(stableTo, stableFrom);

    var interpolators = [];
    remainingIds.forEach((id, i) => {

        var indexFrom = idsFrom.indexOf(id);
        var indexTo = idsTo.indexOf(id);

        if (
            i === 0 &&
            (indexFrom > 0 || indexTo > 0)
        ) {
            interpolators.push(getEndingInterpolator({
                polylineFrom: pointsFrom.slice(0, indexFrom + 1),
                polylineTo: pointsTo.slice(0, indexTo + 1),
                toOppositeScale: indexTo === 0 ? toEndScale : toStartScale
            }));
        }

        if (i > 0) {
            var prevIndexFrom = idsFrom.indexOf(remainingIds[i - 1]);
            var prevIndexTo = idsTo.indexOf(remainingIds[i - 1]);
            if (indexFrom - prevIndexFrom > 1 || indexTo - prevIndexTo > 1) {
                interpolators.push(getInnerInterpolator({
                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1)
                }));
            }
        }

        interpolators.push(getRemainingPointInterpolator({
            pointFrom: pointsFrom[indexFrom],
            pointTo: pointsTo[indexTo]
        }));

        if (
            i === remainingIds.length - 1 &&
            (pointsFrom.length - indexFrom - 1 > 0 ||
                pointsTo.length - indexTo - 1 > 0)
        ) {
            interpolators.push(getEndingInterpolator({
                polylineFrom: pointsFrom.slice(indexFrom),
                polylineTo: pointsTo.slice(indexTo),
                toOppositeScale: pointsTo.length - indexTo === 1 ? toEndScale : toStartScale
            }));
        }
    });

    if (interpolators.length === 0 && (
        pointsTo.length > 0 && remainingIds.length === 0 ||
        pointsFrom.length > 0 && remainingIds.length === 0
    )) {
        interpolators.push(getNonRemainingPathInterpolator({
            polylineFrom: pointsFrom.slice(0),
            polylineTo: pointsTo.slice(0)
        }));
    }

    return (t) => {
        var intermediate = [];
        interpolators.forEach((interpolator) => {
            var points = interpolator(t);
            push(intermediate, points);
        });
        return intermediate;
    };
}

/**
 * Creates intermediate cubic points array, so that the number of points
 * remains the same and added or excluded points are situated between
 * existing points.
 */
function getCubicInterpolator(pointsFrom, pointsTo) {

    for (var i = 2; i < pointsFrom.length - 1; i += 3) {
        pointsFrom[i - 1].isCubicControl = true;
        pointsFrom[i].isCubicControl = true;
    }
    for (i = 2; i < pointsTo.length - 1; i += 3) {
        pointsTo[i - 1].isCubicControl = true;
        pointsTo[i].isCubicControl = true;
    }

    // Replace interpolated points sequence with straight segment
    // TODO: Continue unfinished transition of ending points.
    pointsFrom = pointsFrom.filter(d => !d.isInterpolated);
    var d, p;
    for (i = pointsFrom.length - 2; i >= 0; i--) {
        p = pointsFrom[i + 1];
        d = pointsFrom[i];
        if (!d.isCubicControl && !p.isCubicControl) {
            pointsFrom.splice(
                i + 1,
                0,
                getBezierPoint(1 / 3, p, d),
                getBezierPoint(2 / 3, p, d)
            );
            pointsFrom[i + 1].isCubicControl = true;
            pointsFrom[i + 2].isCubicControl = true;
        }
    }

    // NOTE: Suppose data is already sorted by X.
    // var anchorsFrom = pointsFrom.filter(d => !d.isCubicControl);
    // var anchorsTo = pointsTo.filter(d => !d.isCubicControl);
    var anchorsFrom = pointsFrom.filter((d, i) => i % 3 === 0);
    var anchorsTo = pointsTo.filter((d, i) => i % 3 === 0);
    var idsFrom = anchorsFrom.map(d => d.id);
    var idsTo = anchorsTo.map(d => d.id);
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

    var interpolators = [];
    remainingIds.forEach((id, i) => {

        var indexFrom = indicesFrom[id];
        var indexTo = indicesTo[id];

        if (
            i === 0 &&
            (indexFrom > 0 || indexTo > 0)
        ) {
            interpolators.push(getEndingInterpolator({
                polylineFrom: pointsFrom.slice(0, indexFrom + 1),
                polylineTo: pointsTo.slice(0, indexTo + 1),
                toOppositeScale: indexTo === 0 ? toEndScale : toStartScale,
                isCubic: true
            }));
        }

        if (i > 0) {
            var prevIndexFrom = indicesFrom[remainingIds[i - 1]];
            var prevIndexTo = indicesTo[remainingIds[i - 1]];
            if (indexFrom - prevIndexFrom > 3 || indexTo - prevIndexTo > 3) {
                interpolators.push(getInnerInterpolator({
                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1),
                    isCubic: true
                }));
            } else {
                interpolators.push(getControlsBetweenRemainingInterpolator({
                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1)
                }));
            }
        }

        interpolators.push(getRemainingPointInterpolator({
            pointFrom: pointsFrom[indexFrom],
            pointTo: pointsTo[indexTo]
        }));

        if (
            i === remainingIds.length - 1 &&
            (pointsFrom.length - indexFrom - 1 > 0 ||
            pointsTo.length - indexTo - 1 > 0)
        ) {
            interpolators.push(getEndingInterpolator({
                polylineFrom: pointsFrom.slice(indexFrom),
                polylineTo: pointsTo.slice(indexTo),
                toOppositeScale: pointsTo.length - indexTo === 1 ? toEndScale : toStartScale,
                isCubic: true
            }));
        }
    });

    if (interpolators.length === 0 && (
        pointsTo.length > 0 && remainingIds.length === 0 ||
        pointsFrom.length > 0 && remainingIds.length === 0
    )) {
        interpolators.push(getNonRemainingPathInterpolator({
            polylineFrom: pointsFrom.slice(0),
            polylineTo: pointsTo.slice(0),
            isCubic: true
        }));
    }

    return (t) => {
        var intermediate = [];
        interpolators.forEach(ipl => {
            var points = ipl(t);
            push(intermediate, points);
        });
        return intermediate;
    };
}

function getEndingInterpolator({polylineFrom, polylineTo, isCubic, toOppositeScale}) {

    var polyline = (polylineFrom.length > polylineTo.length ? polylineFrom : polylineTo);
    var decreasing = (polylineTo.length === 1);
    var isLeftEnding = (polylineFrom[0].id !== polylineTo[0].id);
    var rightToLeft = Boolean(isLeftEnding ^ decreasing);

    return (t) => {
        var interpolated = (isCubic ? interpolateCubicEnding : interpolateEnding)({
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
    };
}

function getInnerInterpolator({polylineFrom, polylineTo, isCubic}) {

    var oldCount = polylineFrom.length;
    var newCount = polylineTo.length;

    if (newCount !== oldCount) {
        var decreasing = newCount < oldCount;
        var smallerPolyline = decreasing ? polylineTo : polylineFrom;
        var biggerPolyline = decreasing ? polylineFrom : polylineTo;
        var filledPolyline = (isCubic ? fillSmallerCubicLine : fillSmallerPolyline)({
            smallerPolyline,
            biggerPolyline,
            decreasing
        });
        var biggerInnerPoints = biggerPolyline.slice(1, biggerPolyline.length - 1);
        var filledInnerPoints = filledPolyline.slice(1, filledPolyline.length - 1);
        return (t) => {
            var points = interpolatePoints(
                filledInnerPoints,
                biggerInnerPoints,
                (decreasing ? 1 - t : t)
            );
            points.forEach(d => d.positionIsBeingChanged = true);
            return points;
        };
    } else {
        var innerPointsFrom = polylineFrom.slice(1, polylineFrom.length - 1);
        var innerPointsTo = polylineTo.slice(1, polylineTo.length - 1);
        return (t) => {
            var points = interpolatePoints(
                innerPointsFrom,
                innerPointsTo,
                t
            );
            points.forEach(d => d.positionIsBeingChanged = true);
            return points;
        };
    }
}

function getRemainingPointInterpolator({pointFrom, pointTo}) {
    return (t) => {
        return [interpolatePoint(pointFrom, pointTo, t)];
    };
}

function getControlsBetweenRemainingInterpolator({polylineFrom, polylineTo}) {
    return (t) => {
        return interpolatePoints(polylineFrom.slice(1, 3), polylineTo.slice(1, 3), t);
    };
}

function getNonRemainingPathInterpolator({polylineFrom, polylineTo, isCubic}) {

    var decreasing = polylineTo.length === 0;
    var rightToLeft = decreasing;

    var polyline = (decreasing ? polylineFrom : polylineTo);
    return (t) => {
        var points = (isCubic ? interpolateCubicEnding : interpolateEnding)({
            t,
            polyline,
            decreasing,
            rightToLeft
        });
        points.forEach((d, i) => {
            if (i > 0) {
                d.positionIsBeingChanged = true;
            }
        });
        return points;
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
    if (b.id !== undefined) {
        c.id = b.id;
    }
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
        var q = 0;
        if (t > 0) {
            var distance = [0];
            var totalDistance = 0;
            for (var i = 1, x, y, x0, y0, d; i < line.length; i++) {
                x0 = line[i - 1].x;
                y0 = line[i - 1].y;
                x = line[i].x;
                y = line[i].y;
                d = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
                totalDistance += d;
                distance.push(totalDistance);
            }
            var passedDistance = t * totalDistance;
            for (i = 1; i < distance.length; i++) {
                if (passedDistance <= distance[i]) {
                    q = Math.min(1, (i - 1 +
                        (passedDistance - distance[i - 1]) /
                        (distance[i] - distance[i - 1])) /
                        (line.length - 1)
                    );
                    break;
                }
            }
        }

        var existingCount = Math.floor((line.length - 1) * q) + 1;
        var tempCount = line.length - existingCount;
        var tempStartIdIndex = existingCount;
        var result = line.slice(0, existingCount);
        if (q < 1) {
            var qi = (q * (line.length - 1)) % 1;
            var midPt = interpolatePoint(
                line[existingCount - 1],
                line[existingCount],
                qi
            );
            push(result, utils.range(tempCount).map((i) => Object.assign(
                {}, midPt,
                {
                    id: line[tempStartIdIndex + i].id,
                    isInterpolated: true
                }
            )));
        }
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
 * Returns a cubic line with points that move along line
 * from start point to full line (or vice versa).
 */
function interpolateCubicEnding({t, polyline, decreasing, rightToLeft}) {

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
                if (passedDistance <= distance[i]) {
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
 * Returns a polyline filled with points, so that number of points
 * becomes the same on both start and end polylines.
 */
function fillSmallerPolyline({smallerPolyline, biggerPolyline, decreasing}) {

    var smallerSegCount = smallerPolyline.length - 1;
    var biggerSegCount = biggerPolyline.length - 1;
    var minSegmentPointsCount = Math.floor(biggerSegCount / smallerSegCount) + 1;
    var restPointsCount = biggerSegCount % smallerSegCount;
    var segmentsPointsCount = utils.range(smallerSegCount)
        .map(i => (minSegmentPointsCount + Number(i < restPointsCount)));

    var result = [smallerPolyline[0]];
    var smallPtIndex = 1;
    segmentsPointsCount.forEach((segPtCount) => {
        utils.range(1, segPtCount).forEach(i => {
            var newPt;
            if (i === segPtCount - 1) {
                newPt = Object.assign({}, smallerPolyline[smallPtIndex]);
                if (!decreasing) {
                    newPt.id = biggerPolyline[result.length].id;
                }
            } else {
                newPt = interpolatePoint(
                    smallerPolyline[smallPtIndex - 1],
                    smallerPolyline[smallPtIndex],
                    (i / (segPtCount - 1))
                );
                newPt.id = biggerPolyline[result.length].id;
                if (decreasing) {
                    newPt.isInterpolated = true;
                }
            }
            result.push(newPt);
        });
        smallPtIndex++;
    });

    return result;
}

/**
 * Returns a cubic line filled with points, so that number of points
 * becomes the same on both start and end cubic lines.
 */
function fillSmallerCubicLine({smallerPolyline, biggerPolyline, decreasing}) {

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
            var newC0 = Object.assign({}, smallerPolyline[smallPtIndex - 2]);
            var newC1 = Object.assign({}, smallerPolyline[smallPtIndex - 1]);
            var newPt = Object.assign({}, smallerPolyline[smallPtIndex]);
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
            } else if (k !== 'id') {
                memo[k] = interpolateValue(p0[k], p1[k], t);
            }
            return memo;
        }, {});
    var c2 = getBezierPoint(t, p0, c0);
    var c3 = getBezierPoint(t, p0, c0, c1);
    var c4 = getBezierPoint(t, c0, c1, p1);
    var c5 = getBezierPoint(t, c1, p1);
    [c2, c3, c4, c5].forEach(c => c.isCubicControl = true);

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
    return {
        x: bezier(t, p.map(p => p.x)),
        y: bezier(t, p.map(p => p.y))
    };
}
