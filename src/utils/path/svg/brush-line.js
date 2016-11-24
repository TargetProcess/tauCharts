import {bezier, getBezierPoint} from '../bezier';
import {utils} from '../../utils';

/**
 * Returns line with variable width.
 * @param points Linear points.
 */
export function getBrushLine(points) {
    if (points.length === 0) {
        return '';
    }
    if (points.length === 1) {
        return getSegment(points[0], points[0]);
    }
    var segments = [];
    for (var i = 1; i < points.length; i++) {
        segments.push(getSegment(points[i - 1], points[i]));
    }
    return segments.join(' ');
}

/**
 * Returns curve with variable width.
 * @param points Cubic spline points.
 */
export function getBrushCurve(points) {
    if (points.length === 0) {
        return '';
    }
    if (points.length === 1) {
        return getSegment(points[0], points[0]);
    }

    // NOTE: Split segments for better visual result.
    // TODO: Split when necessary (e.g. some angle change threshold).
    points = points.slice(0);
    for (var i = points.length - 1, a, c1, c2, b, seg; i >= 3; i -= 3) {
        a = points[i - 3];
        c1 = points[i - 2];
        c2 = points[i - 1];
        b = points[i];
        seg = splitCurveSegment(a, c1, c2, b);
        points.splice.apply(points, [i - 2, 2].concat(seg.slice(1, 6)));
    }

    var segments = [];
    for (i = 3; i < points.length; i += 3) {
        segments.push(getCurveSegment(points[i - 3], points[i - 2], points[i - 1], points[i]));
    }
    return segments.join(' ');
}

/**
 * Returns single circle as part of SVG path.
 */
function getCircle(x, y, r) {
    return [
        `M${x},${y - r}`,
        `A${r},${r} 0 0 1`,
        `${x},${y + r}`,
        `A${r},${r} 0 0 1`,
        `${x},${y - r}`,
        'Z'
    ].join(' ');
}

/**
 * Returns two circles joined with tangents.
 */
function getSegment(a, b) {
    var mainDistance = getDistance(a, b);
    if (mainDistance === 0 ||
        (mainDistance + a.size / 2 <= b.size / 2) ||
        (mainDistance + b.size / 2 <= a.size / 2)
    ) {
        // Return single circle, if one is inside another
        var largerPt = a.size > b.size ? a : b;
        var radius = largerPt.size / 2;
        return getCircle(largerPt.x, largerPt.y, radius);
    }

    var mainAngle = getAngle(a, b);
    var tangentAngle = Math.asin((a.size - b.size) / mainDistance / 2);
    var angleLeft = mainAngle - Math.PI / 2 + tangentAngle;
    var angleRight = mainAngle + Math.PI / 2 - tangentAngle;

    var tangentLeftA = getPolarPoint(a, a.size / 2, angleLeft);
    var tangentLeftB = getPolarPoint(b, b.size / 2, angleLeft);
    var tangentRightA = getPolarPoint(a, a.size / 2, angleRight);
    var tangentRightB = getPolarPoint(b, b.size / 2, angleRight);

    return [
        `M${tangentLeftA.x},${tangentLeftA.y}`,
        `L${tangentLeftB.x},${tangentLeftB.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(tangentAngle < 0)} 1`,
        `${tangentRightB.x},${tangentRightB.y}`,
        `L${tangentRightA.x},${tangentRightA.y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(tangentAngle > 0)} 1`,
        `${tangentLeftA.x},${tangentLeftA.y}`,
        'Z'
    ].join(' ');
}

/**
 * Returns two circles joined with cubic curves.
 */
function getCurveSegment(a, c1, c2, b) {
    var mainDistance = getDistance(a, b);
    if (mainDistance === 0 ||
        (mainDistance + a.size / 2 <= b.size / 2) ||
        (mainDistance + b.size / 2 <= a.size / 2)
    ) {
        // Return single circle, if one is inside another
        var largerPt = a.size > b.size ? a : b;
        var radius = largerPt.size / 2;
        return getCircle(largerPt.x, largerPt.y, radius);
    }

    // NOTE: Replace self-intersected segment with straight.
    if (a.x + a.size / 2 >= b.x || b.x - b.size / 2 <= a.x) {
        return getSegment(a, b);
    }

    var mainAngle = getAngle(a, b);
    var tangentAngle = Math.asin((a.size - b.size) / mainDistance / 2);
    var angleLeft = mainAngle - Math.PI / 2 + tangentAngle;
    var angleRight = mainAngle + Math.PI / 2 - tangentAngle;

    var angleA = getAngle(a, c1);
    var angleB = getAngle(c2, b);

    var tangentLeftA = getPolarPoint(a, a.size / 2, angleLeft + angleA - mainAngle);
    var tangentLeftB = getPolarPoint(b, b.size / 2, angleLeft + angleB - mainAngle);
    var tangentRightA = getPolarPoint(a, a.size / 2, angleRight + angleA - mainAngle);
    var tangentRightB = getPolarPoint(b, b.size / 2, angleRight + angleB - mainAngle);

    var cLeftA = getPolarPoint(
        tangentLeftA,
        getDistance(a, c1) / mainDistance * getDistance(tangentLeftA, tangentLeftB),
        angleLeft + angleA - mainAngle + Math.PI / 2
    );
    var cLeftB = getPolarPoint(
        tangentLeftB,
        getDistance(c2, b) / mainDistance * getDistance(tangentLeftA, tangentLeftB),
        angleLeft + angleB - mainAngle - Math.PI / 2
    );
    var cRightA = getPolarPoint(
        tangentRightA,
        getDistance(a, c1) / mainDistance * getDistance(tangentRightA, tangentRightB),
        angleRight + angleA - mainAngle - Math.PI / 2
    );
    var cRightB = getPolarPoint(
        tangentRightB,
        getDistance(c2, b) / mainDistance * getDistance(tangentRightA, tangentRightB),
        angleRight + angleB - mainAngle + Math.PI / 2
    );

    return [
        `M${tangentLeftA.x},${tangentLeftA.y}`,
        `C${cLeftA.x},${cLeftA.y}`,
        `${cLeftB.x},${cLeftB.y}`,
        `${tangentLeftB.x},${tangentLeftB.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(tangentAngle < 0)} 1`,
        `${tangentRightB.x},${tangentRightB.y}`,
        `C${cRightB.x},${cRightB.y}`,
        `${cRightA.x},${cRightA.y}`,
        `${tangentRightA.x},${tangentRightA.y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(tangentAngle > 0)} 1`,
        `${tangentLeftA.x},${tangentLeftA.y}`,
        'Z'
    ].join(' ');
}

function getAngle(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function getDistance(a, b) {
    return Math.sqrt((b.y - a.y) * (b.y - a.y) + (b.x - a.x) * (b.x - a.x));
}

function getPolarPoint(start, distance, angle) {
    return {
        x: start.x + distance * Math.cos(angle),
        y: start.y + distance * Math.sin(angle)
    };
}

function splitCurveSegment(p0, c0, c1, p1) {
    var c2 = getBezierPoint(0.5, p0, c0);
    var c3 = getBezierPoint(0.5, p0, c0, c1);
    var r = utils.unique(Object.keys(p0), Object.keys(p1))
        .reduce((memo, k) => {
            if (k === 'x' || k === 'y') {
                memo[k] = bezier(0.5, p0[k], c0[k], c1[k], p1[k]);
            } else if (k === 'size') {
                memo.size = (p0.size + p1.size) / 2;
            }
            return memo;
        }, {});
    var c4 = getBezierPoint(0.5, c0, c1, p1);
    var c5 = getBezierPoint(0.5, c1, p1);

    return [p0, c2, c3, r, c4, c5, p1];
}
