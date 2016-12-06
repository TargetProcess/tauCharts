import {bezier, getBezierPoint, splitCubicSegment as split} from '../bezier';

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
function getCirclePath(x, y, r) {
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
 * Returns two circles joined with line path.
 */
function getStraightSegmentPath(a, b, tan) {
    return [
        `M${tan.a.left.x},${tan.a.left.y}`,
        `L${tan.b.left.x},${tan.b.left.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(a.size < b.size)} 1`,
        `${tan.b.right.x},${tan.b.right.y}`,
        `L${tan.a.right.x},${tan.a.right.y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(a.size > b.size)} 1`,
        `${tan.a.left.x},${tan.a.left.y}`,
        'Z'
    ].join(' ');
}

/**
 * Returns two circles joined with tangents.
 */
function getSegment(a, b) {
    var tan = getCirclesTangents(a, b);
    if (!tan) {
        // Return single circle, if one is inside another
        var largerPt = a.size > b.size ? a : b;
        var radius = largerPt.size / 2;
        return getCirclePath(largerPt.x, largerPt.y, radius);
    }
    return getStraightSegmentPath(a, b, tan);
}

/**
 * Returns two circles joined with cubic curves.
 */
function getCurveSegment(a, c1, c2, b) {
    var mainDistance = dist(a, b);
    if (mainDistance === 0 ||
        (mainDistance + a.size / 2 <= b.size / 2) ||
        (mainDistance + b.size / 2 <= a.size / 2)
    ) {
        // Return single circle, if one is inside another
        var largerPt = a.size > b.size ? a : b;
        var radius = largerPt.size / 2;
        return getCirclePath(largerPt.x, largerPt.y, radius);
    }

    // NOTE: Replace self-intersected segment with straight.
    if (a.x + a.size / 2 >= b.x || b.x - b.size / 2 <= a.x) {
        return getSegment(a, b);
    }

    var mainAngle = angle(a, b);
    var tangentAngle = Math.asin((a.size - b.size) / mainDistance / 2);
    var angleLeft = mainAngle - Math.PI / 2 + tangentAngle;
    var angleRight = mainAngle + Math.PI / 2 - tangentAngle;

    var angleA = angle(a, c1);
    var angleB = angle(c2, b);

    var tangentLeftA = polar(a, a.size / 2, angleLeft + angleA - mainAngle);
    var tangentLeftB = polar(b, b.size / 2, angleLeft + angleB - mainAngle);
    var tangentRightA = polar(a, a.size / 2, angleRight + angleA - mainAngle);
    var tangentRightB = polar(b, b.size / 2, angleRight + angleB - mainAngle);

    var cLeftA = polar(
        tangentLeftA,
        dist(a, c1) / mainDistance * dist(tangentLeftA, tangentLeftB),
        angleLeft + angleA - mainAngle + Math.PI / 2
    );
    var cLeftB = polar(
        tangentLeftB,
        dist(c2, b) / mainDistance * dist(tangentLeftA, tangentLeftB),
        angleLeft + angleB - mainAngle - Math.PI / 2
    );
    var cRightA = polar(
        tangentRightA,
        dist(a, c1) / mainDistance * dist(tangentRightA, tangentRightB),
        angleRight + angleA - mainAngle - Math.PI / 2
    );
    var cRightB = polar(
        tangentRightB,
        dist(c2, b) / mainDistance * dist(tangentRightA, tangentRightB),
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

function angle(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function dist(...p) {
    var total = 0;
    for (var i = 1; i < p.length; i++) {
        total += Math.sqrt(
            (p[i].x - p[i - 1].x) * (p[i].x - p[i - 1].x) +
            (p[i].y - p[i - 1].y) * (p[i].y - p[i - 1].y)
        );
    }
    return total;
}

function polar(start, d, a) {
    return {
        x: start.x + d * Math.cos(a),
        y: start.y + d * Math.sin(a)
    };
}

function splitCurveSegment(p0, c0, c1, p1) {
    var seg = split(0.5, p0, c0, c1, p1);
    var tl = 1 / (1 +
        dist(seg[3], seg[4], seg[5], seg[6], seg[3]) /
        dist(seg[0], seg[1], seg[2], seg[3], seg[0])
    );
    seg[3].size = p0.size * (1 - tl) + p1.size * tl;

    return seg;
}

function getCirclesTangents(a, b) {
    var mainDistance = dist(a, b);
    if (mainDistance === 0 ||
        (mainDistance + a.size / 2 <= b.size / 2) ||
        (mainDistance + b.size / 2 <= a.size / 2)
    ) {
        return null;
    }

    var mainAngle = angle(a, b);
    var tangentAngle = Math.asin((a.size - b.size) / mainDistance / 2);
    var angleLeft = mainAngle - Math.PI / 2 + tangentAngle;
    var angleRight = mainAngle + Math.PI / 2 - tangentAngle;

    var tangentLeftA = polar(a, a.size / 2, angleLeft);
    var tangentLeftB = polar(b, b.size / 2, angleLeft);
    var tangentRightA = polar(a, a.size / 2, angleRight);
    var tangentRightB = polar(b, b.size / 2, angleRight);

    return {
        a: {
            left: polar(a, a.size / 2, angleLeft),
            right: polar(a, a.size / 2, angleRight)
        },
        b: {
            left: polar(b, b.size / 2, angleLeft),
            right: polar(b, b.size / 2, angleRight)
        }
    };
}
