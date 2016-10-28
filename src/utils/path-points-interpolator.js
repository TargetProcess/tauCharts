import {utils} from './utils';

export default function interpolatePathPoints(pointsFrom, pointsTo) {

    // TODO: Continue unfinished transition of ending points.
    pointsFrom = pointsFrom.filter(d => !d.isInterpolatedEnding);

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

    //
    // Determine, how to interpolate changes between remaining points

    var handleEndingChanges = ({polylineFrom, polylineTo, intermediateStartIndex}) => {

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

        var oldCount = polylineFrom.length;
        var newCount = polylineTo.length;

        if (newCount !== oldCount) {
            var countIncreased = newCount > oldCount;
            var smallerPolyline = countIncreased ? polylineFrom : polylineTo;
            var biggerPolyline = countIncreased ? polylineTo : polylineFrom;
            var filledPolyline = fillSmallerPolyline({
                smallerPolyline,
                biggerPolyline
            });
            var biggerInnerPoints = biggerPolyline.slice(1, biggerPolyline.length - 1);
            var filledInnerPoints = filledPolyline.slice(1, filledPolyline.length - 1);
            changingPoints.push({
                intermediateStartIndex,
                interpolate: (t) => {
                    var points = interpolatePoints(
                        filledInnerPoints,
                        biggerInnerPoints,
                        (countIncreased ? t : 1 - t)
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
                    return points;
                }
            });
        }
        push(intermediate, utils.range(Math.max(newCount, oldCount) - 2).map(() => null));
    };

    //
    // Interpolation of remaining points

    var handleRemainingPoint = ({pointFrom, pointTo, intermediateIndex}) => {
        remainingPoints.push({
            intermediateIndex,
            interpolate: (t) => {
                return interpolatePoint(pointFrom, pointTo, t);
            }
        });
        intermediate.push(null);
    };

    //
    // Interpolation when no points remain

    var handleNonRemainingPath = ({polylineFrom, polylineTo}) => {

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

        var indexFrom = idsFrom.indexOf(id);
        var indexTo = idsTo.indexOf(id);

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
            var prevIndexFrom = idsFrom.indexOf(remainingIds[i - 1]);
            var prevIndexTo = idsTo.indexOf(remainingIds[i - 1]);
            if (indexFrom - prevIndexFrom > 1 || indexTo - prevIndexTo > 1) {
                handleInnerChanges({
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

    var update = (t) => {
        remainingPoints.forEach((d) => {
            var pt = d.interpolate(t);
            intermediate[d.intermediateIndex] = pt;
        });
        changingPoints.forEach((d) => {
            var points = d.interpolate(t);
            points.forEach((pt, i) => intermediate[d.intermediateStartIndex + i] = pt);
        });
    };

    return (t) => {
        update(t);
        return intermediate;
    };
}

function push(target, items) {
    return Array.prototype.push.apply(target, items);
}

function interpolateValue(a, b, t) {
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
    c.id = a.id;
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
                if (passedDistance === distance[i]) {
                    q = (i / (line.length - 1));
                    break;
                }
                if (passedDistance < distance[i]) {
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
                    isInterpolatedEnding: true
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
 * Returns a polyline, filled with points, so that number of points
 * becomes the same on both start and end polylines.
 */
function fillSmallerPolyline({smallerPolyline, biggerPolyline}) {

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
            if (i === segPtCount - 1) {
                result.push(smallerPolyline[smallPtIndex]);
            } else {
                var newPt = interpolatePoint(
                    smallerPolyline[smallPtIndex - 1],
                    smallerPolyline[smallPtIndex],
                    (i / (segPtCount - 1))
                );
                newPt.id = biggerPolyline[result.length].id;
                result.push(newPt);
            }
        });
        smallPtIndex++;
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
