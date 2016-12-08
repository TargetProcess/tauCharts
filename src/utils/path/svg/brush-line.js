import {
    bezier,
    getBezierPoint as bezierPt,
    splitCubicSegment as split
} from '../bezier';

/**
 * Returns line with variable width.
 * @param points Linear points.
 */
export function getBrushLine(points) {
    if (points.length === 0) {
        return '';
    }
    if (points.length === 1) {
        return getStraightSegment(points[0], points[0]);
    }
    var segments = [];
    for (var i = 1; i < points.length; i++) {
        segments.push(getStraightSegment(points[i - 1], points[i]));
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
        return getStraightSegment(points[0], points[0]);
    }
    var segments = [];
    for (var i = 3; i < points.length; i += 3) {
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
 * Returns single circle as part of SVG path.
 */
function getLargerCirclePath(a, b) {
    var largerPt = a.size > b.size ? a : b;
    var radius = largerPt.size / 2;
    return getCirclePath(largerPt.x, largerPt.y, radius);
}

/**
 * Returns two circles joined with lines path.
 */
function getStraightSegmentPath(a, b, tan) {
    return [
        `M${tan.left[0].x},${tan.left[0].y}`,
        `L${tan.left[1].x},${tan.left[1].y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(a.size < b.size)} 1`,
        `${tan.right[1].x},${tan.right[1].y}`,
        `L${tan.right[0].x},${tan.right[0].y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(a.size > b.size)} 1`,
        `${tan.left[0].x},${tan.left[0].y}`,
        'Z'
    ].join(' ');
}

/**
 * Returns two circles joined with curves path.
 */
function getCurveSegmentPath(a, b, ctan) {
    var qa = rotation(angle(a, ctan.right[0]), angle(a, ctan.left[0]));
    var qb = rotation(angle(b, ctan.right[1]), angle(b, ctan.left[1]));
    return [
        `M${ctan.left[0].x},${ctan.left[0].y}`,
        `C${ctan.left[1].x},${ctan.left[1].y}`,
        `${ctan.left[2].x},${ctan.left[2].y}`,
        `${ctan.left[3].x},${ctan.left[3].y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(qa > Math.PI)} 1`,
        `${ctan.right[3].x},${ctan.right[3].y}`,
        `C${ctan.right[2].x},${ctan.right[2].y}`,
        `${ctan.right[1].x},${ctan.right[1].y}`,
        `${ctan.right[0].x},${ctan.right[0].y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(qb > Math.PI)} 1`,
        `${ctan.left[0].x},${ctan.left[0].y}`,
        'Z'
    ].join(' ');
}

/**
 * Returns two circles joined with tangents.
 */
function getStraightSegment(a, b) {
    var tan = getCirclesTangents(a, b);
    if (!tan) {
        return getLargerCirclePath(a, b);
    }
    return getStraightSegmentPath(a, b, tan);
}

/**
 * Returns two circles joined with curves.
 */
function getCurveSegment(a, ca, cb, b) {
    var ctan = getCirclesCurveTangents(a, ca, cb, b);
    if (!ctan) {
        return getStraightSegment(a, b);
    }
    return getCurveSegmentPath(a, b, ctan);
}

function angle(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function rotation(a, b) {
    if (b < a) {
        b += 2 * Math.PI;
    }
    return (b - a);
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
        x: (start.x + d * Math.cos(a)),
        y: (start.y + d * Math.sin(a))
    };
}

function splitCurveSegment(t, p0, c0, c1, p1) {
    var seg = split(t, p0, c0, c1, p1);
    var tl = 1 / (1 +
        dist(seg[3], seg[4], seg[5], seg[6], seg[3]) /
        dist(seg[0], seg[1], seg[2], seg[3], seg[0])
    );
    seg[3].size = (p0.size * (1 - tl) + p1.size * tl);

    return seg;
}

function approximateCubicCurve(p0, p1, p2, p3) {
    var c1 = approximateQuadCurve(p0, p1, p2)[1];
    var c2 = approximateQuadCurve(p1, p2, p3)[1];
    return [p0, c1, c2, p3];
}

function approximateQuadCurve(p0, p1, p2) {
    var m = bezierPt(dist(p0, p1) / dist(p0, p1, p2), p0, p2);
    var c = bezierPt(2, m, p1);
    return [p0, c, p2];
}

function rotateQuadControl(a, start, control, end) {
    // TODO: This function is too approximate
    // and causes artifacts in extremal cases.
    var l = dist(start, control);
    if (l < 2) {
        return control;
    }
    var dx = (control.x - start.x);
    var lc = Math.min(l, (Math.abs(a) === Math.PI / 2 ? (l) : (dx / Math.cos(a))));
    var dy = (lc * Math.sin(a));
    return {
        x: (start.x + dx),
        y: (start.y + dy)
    };
}

function getCirclesTangents(a, b) {
    var d = dist(a, b);
    if (d === 0 ||
        (d + a.size / 2 <= b.size / 2) ||
        (d + b.size / 2 <= a.size / 2)
    ) {
        return null;
    }

    var ma = angle(a, b);
    var ta = Math.asin((a.size - b.size) / d / 2);
    var aleft = (ma - Math.PI / 2 + ta);
    var aright = (ma + Math.PI / 2 - ta);

    return {
        left: [
            polar(a, a.size / 2, aleft),
            polar(b, b.size / 2, aleft)
        ],
        right: [
            polar(a, a.size / 2, aright),
            polar(b, b.size / 2, aright)
        ]
    };
}

function getCirclesCurveTangents(a, ca, cb, b) {
    var d = dist(a, b);
    if (d === 0 ||
        (d + a.size / 2 <= b.size / 2) ||
        (d + b.size / 2 <= a.size / 2)
    ) {
        return null;
    }

    // Get approximate endings tangents
    // TODO: Formula to calculate exact endings tangents (at least outer).
    var tanStart = getCirclesTangents(a, splitCurveSegment(1 / 27, a, ca, cb, b)[3]);
    var tanEnd = getCirclesTangents(splitCurveSegment(26 / 27, a, ca, cb, b)[3], b);
    if (!(tanStart && tanEnd)) {
        return null;
    }

    // Get tangets with circles at 1/3 and 2/3 of curve
    var seg1 = splitCurveSegment(1 / 3, a, ca, cb, b);
    var seg2 = splitCurveSegment(1 / 2, ...seg1.slice(3));
    var c = seg1[3];
    var d = seg2[3];
    var tanAC = getCirclesTangents(a, c);
    var tanCD = getCirclesTangents(c, d);
    var tanDB = getCirclesTangents(d, b);
    if (!(tanAC && tanCD && tanDB)) {
        return null;
    }

    // Points that tangent curves should go through
    var leftPoints = [
        tanStart.left[0],
        bezierPt(0.5, tanAC.left[1], tanCD.left[0]),
        bezierPt(0.5, tanCD.left[1], tanDB.left[0]),
        tanEnd.left[1]
    ];
    var rightPoints = [
        tanStart.right[0],
        bezierPt(0.5, tanAC.right[1], tanCD.right[0]),
        bezierPt(0.5, tanCD.right[1], tanDB.right[0]),
        tanEnd.right[1]
    ];

    // Get tangent curves
    var cleft = approximateCubicCurve(...leftPoints);
    var cright = approximateCubicCurve(...rightPoints);

    // Rotate controls to initial angle
    var rotateControls = (c, startAngle, endAngle) => [
        c[0],
        rotateQuadControl(startAngle, c[0], c[1], c[2]),
        rotateQuadControl(endAngle, c[3], c[2], c[1]),
        c[3]
    ];
    cleft = rotateControls(
        cleft,
        angle(tanStart.left[0], tanStart.left[1]),
        angle(tanEnd.left[1], tanEnd.left[0])
    );
    cright = rotateControls(
        cright,
        angle(tanStart.right[0], tanStart.right[1]),
        angle(tanEnd.right[1], tanEnd.right[0])
    );

    return {
        left: cleft,
        right: cright
    };
}
