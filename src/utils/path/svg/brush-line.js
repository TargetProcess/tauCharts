import {
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
        return getCirclePath(points[0]);
    }
    var segments = [];
    for (var i = 1; i < points.length; i++) {
        segments.push(getStraightSegmentPath(points[i - 1], points[i]));
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
        return getCirclePath(points[0]);
    }
    var segments = [];
    for (var i = 3; i < points.length; i += 3) {
        segments.push(getCurveSegmentPath(points[i - 3], points[i - 2], points[i - 1], points[i]));
    }
    return segments.join(' ');
}

function getCirclePath(pt) {
    var r = (pt.size / 2);
    return [
        `M${pt.x},${pt.y - r}`,
        `A${r},${r} 0 0 1`,
        `${pt.x},${pt.y + r}`,
        `A${r},${r} 0 0 1`,
        `${pt.x},${pt.y - r}`,
        'Z'
    ].join(' ');
}

function getStraightSegmentPath(a, b) {
    var tan = getCirclesTangents(a, b);
    if (!tan) {
        return getCirclePath((a.size > b.size ? a : b));
    }
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

function getCurveSegmentPath(a, ca, cb, b) {
    var ctan = getCirclesCurveTangents(a, ca, cb, b);
    if (!ctan) {
        return getStraightSegmentPath(a, b);
    }
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

function approximateQuadCurve(p0, p1, p2) {
    var m = bezierPt(dist(p0, p1) / dist(p0, p1, p2), p0, p2);
    var c = bezierPt(2, m, p1);
    return [p0, c, p2];
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
    // TODO: Use formulas instead of approximate equations.
    const kt = 1 / 12;
    var getTangentsVectors = (isEnd) => {
        var curve = (isEnd ? [b, cb, ca, a] : [a, ca, cb, b]);
        var seg1 = splitCurveSegment(2 * kt, ...curve);
        var seg2 = splitCurveSegment(0.5, ...seg1.slice(0, 4));

        var m = seg2[3];
        var n = seg2[6];
        var mtan = getCirclesTangents(curve[0], m);
        var ntan = getCirclesTangents(m, n);

        var lpoints = [
            mtan.left[0],
            bezierPt(0.5, mtan.left[1], ntan.left[0]),
            ntan.left[1]
        ];
        var rpoints = [
            mtan.right[0],
            bezierPt(0.5, mtan.right[1], ntan.right[0]),
            ntan.right[1]
        ];

        var lq = approximateQuadCurve(...lpoints)[1];
        var rq = approximateQuadCurve(...rpoints)[1];
        var lc = bezierPt(1 / 3 / kt, mtan.left[0], lq);
        var rc = bezierPt(1 / 3 / kt, mtan.right[0], rq);

        return {
            left: (isEnd ? [rc, rpoints[0]] : [lpoints[0], lc]),
            right: (isEnd ? [lc, lpoints[0]] : [rpoints[0], rc])
        };
    };

    var tstart = getTangentsVectors(false);
    var tend = getTangentsVectors(true);

    return {
        left: [...tstart.left, ...tend.left],
        right: [...tstart.right, ...tend.right]
    };
}
