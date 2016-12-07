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

    // // NOTE: Split segments for better visual result.
    // // TODO: Split when necessary (e.g. some angle change threshold).
    // points = points.slice(0);
    // for (var i = points.length - 1, a, c1, c2, b, seg; i >= 3; i -= 3) {
    //     a = points[i - 3];
    //     c1 = points[i - 2];
    //     c2 = points[i - 1];
    //     b = points[i];
    //     seg = splitCurveSegment(a, c1, c2, b);
    //     points.splice.apply(points, [i - 2, 2].concat(seg.slice(1, 6)));
    // }

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
        `M${tan.start.left.x},${tan.start.left.y}`,
        `L${tan.end.left.x},${tan.end.left.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(a.size < b.size)} 1`,
        `${tan.end.right.x},${tan.end.right.y}`,
        `L${tan.start.right.x},${tan.start.right.y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(a.size > b.size)} 1`,
        `${tan.start.left.x},${tan.start.left.y}`,
        'Z'
    ].join(' ');
}

/**
 * Returns two circles joined with curves path.
 */
function getCurveSegmentPath(a, b, ctan) {
    var qa = diffAngle(angle(a, ctan.start.right), angle(a, ctan.start.left));
    var qb = diffAngle(angle(b, ctan.end.right), angle(b, ctan.end.left));
    return [
        `M${ctan.start.left.x},${ctan.start.left.y}`,
        `C${ctan.start.cleft.x},${ctan.start.cleft.y}`,
        `${ctan.end.cleft.x},${ctan.end.cleft.y}`,
        `${ctan.end.left.x},${ctan.end.left.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(qa > Math.PI)} 1`,
        `${ctan.end.right.x},${ctan.end.right.y}`,
        `C${ctan.end.cright.x},${ctan.end.cright.y}`,
        `${ctan.start.cright.x},${ctan.start.cright.y}`,
        `${ctan.start.right.x},${ctan.start.right.y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(qb > Math.PI)} 1`,
        `${ctan.start.left.x},${ctan.start.left.y}`,
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
        return getLargerCirclePath(a, b);
    }
    return getCurveSegmentPath(a, b, ctan);
}

function angle(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function diffAngle(a, b) {
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
        x: start.x + d * Math.cos(a),
        y: start.y + d * Math.sin(a)
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

function approxCubicThrough4Points(p0, p1, p2, p3) {
    var c1 = approxQuadThrough3Points(p0, p1, p2)[1];
    var c2 = approxQuadThrough3Points(p1, p2, p3)[1];
    return [p0, c1, c2, p3];
}

function approxQuadThrough3Points(p0, p1, p2) {
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
    var aleft = ma - Math.PI / 2 + ta;
    var aright = ma + Math.PI / 2 - ta;

    return {
        start: {
            left: polar(a, a.size / 2, aleft),
            right: polar(a, a.size / 2, aright)
        },
        end: {
            left: polar(b, b.size / 2, aleft),
            right: polar(b, b.size / 2, aright)
        }
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

    // Get tangets with circles at 1/3 and 2/3 of curve
    var seg1 = splitCurveSegment(1 / 3, a, ca, cb, b);
    var seg2 = splitCurveSegment(1 / 2, seg1[3], seg1[4], seg1[5], seg1[6]);
    var m = seg1[3];
    var n = seg2[3];
    var tanAM = getCirclesTangents(a, m);
    var tanMN = getCirclesTangents(m, n);
    var tanNB = getCirclesTangents(n, b);

    var mleft = bezierPt(0.5, tanAM.end.left, tanMN.start.left);
    var mright = bezierPt(0.5, tanAM.end.right, tanMN.start.right);
    var nleft = bezierPt(0.5, tanMN.end.left, tanNB.start.left);
    var nright = bezierPt(0.5, tanMN.end.right, tanNB.start.right);

    var gctPreserveAngles = () => {
        var aleft = polar(a, a.size / 2, angle(a, ca) - Math.PI / 2);
        var acleft = polar(aleft, dist(a, ca) * dist(a, mleft) / dist(a, m), angle(a, ca));
        var aright = polar(a, a.size / 2, angle(a, ca) + Math.PI / 2);
        var acright = polar(aright, dist(a, ca) * dist(a, mright) / dist(a, m), angle(a, ca));
        var bleft = polar(b, b.size / 2, angle(b, cb) + Math.PI / 2);
        var bcleft = polar(bleft, dist(b, cb) * dist(b, nleft) / dist(b, n), angle(b, cb));
        var bright = polar(b, b.size / 2, angle(b, cb) - Math.PI / 2);
        var bcright = polar(bright, dist(b, cb) * dist(b, nright) / dist(b, n), angle(b, cb));
        return {aleft, acleft, aright, acright, bleft, bcleft, bright, bcright};
    };

    var scaleControl = (to,from, control, opposite) => {
        return polar(
            to,
            dist(from, control) * dist(to, opposite) / dist(from, opposite),
            angle(from, control)
        );
    };

    var rotateControl = (a, start, control, opposite) => {
        var l = dist(start, control);
        var dx = control.x - start.x;
        var dy = dx * Math.tan(a); // l * Math.sin(a) / Math.sin(angle(start, control));
        console.log(dx, dy)
        return {
            x: start.x + dx,
            y: start.y + dy
        };

        // var la = dist(start, opposite);
        // var lb = dist(start, control);
        // var lc = dist(control, opposite);
        // var p = (la + lb + lc) / 2;
        // var q = diffAngle(angle(start, opposite), a);
        // if (q > Math.PI) {
        //     q -= Math.PI;
        // }
        // console.log(q);
        // var d = (2 * Math.sqrt(Math.max(0, p * (p - la) * (p - lb) * (p - lc))) / la / Math.sin(q));
        // if (isNaN(d)) {
        //     console.log('NaN', la, Math.sin(q), Math.sqrt(p * (p - la) * (p - lb) * (p - lc)), la, lb, lc);
        // }
        // return polar(
        //     start,
        //     d,
        //     a
        // );

        // return polar(
        //     start,
        //     dist(start, control),
        //     a
        // );

        // var q = diffAngle(angle(start, opposite), a);
        // if (q > Math.PI) {
        //     q -= Math.PI;
        // }
        // var l = dist(start, control, opposite);
        // var d = dist(start, opposite);
        // var lc = (l * l - d * d) / (l - d * Math.cos(q)) / 2;
        // // return polar(start, lc, a);
        // var r=polar(start, lc, a);
        // // console.log('angle',a/Math.PI*180,angle(start,r)/Math.PI*180);
        // console.log('dist',lc,dist(start,control));
        // return r;
    };

    var gctPreserveWidth = () => {
        // Approximately build curves througn tangents
        var cleft = approxCubicThrough4Points(
            tanAM.start.left,
            bezierPt(0.5, tanAM.end.left, tanMN.start.left),
            bezierPt(0.5, tanMN.end.left, tanNB.start.left),
            tanNB.end.left
        );
        var cright = approxCubicThrough4Points(
            tanAM.start.right,
            bezierPt(0.5, tanAM.end.right, tanMN.start.right),
            bezierPt(0.5, tanMN.end.right, tanNB.start.right),
            tanNB.end.right
        );

        // Rotate controls to initial angle
        cleft = [
            cleft[0],
            rotateControl(angle(a, ca), cleft[0], cleft[1], cleft[2]),
            rotateControl(angle(b, cb), cleft[3], cleft[2], cleft[1]),
            cleft[3]
        ];
        cright = [
            cright[0],
            rotateControl(angle(a, ca), cright[0], cright[1], cright[2]),
            rotateControl(angle(b, cb), cright[3], cright[2], cright[1]),
            cright[3]
        ];

        // Move curve endings to become circles tangents
        // and scale controls length
        var aleft = cleft[0];
        var acleft = cleft[1];
        var aright = cright[0];
        var acright = cright[1];
        var bleft = cleft[3];
        var bcleft = cleft[2];
        var bright = cright[3];
        var bcright = cright[2];
        // var aleft = polar(a, a.size / 2, angle(cleft[0], cleft[1]) - Math.PI / 2);
        // var acleft = scaleControl(aleft, cleft[0], cleft[1], cleft[2]);
        // var aright = polar(a, a.size / 2, angle(cright[0], cright[1]) + Math.PI / 2);
        // var acright = scaleControl(aright, cright[0], cright[1], cright[2]);
        // var bleft = polar(b, b.size / 2, angle(cleft[2], cleft[3]) - Math.PI / 2);
        // var bcleft = scaleControl(bleft, cleft[3], cleft[2], cleft[1]);
        // var bright = polar(b, b.size / 2, angle(cright[2], cright[3]) + Math.PI / 2);
        // var bcright = scaleControl(bright, cright[3], cright[2], cright[1]);

        // var aleft = polar(a, a.size / 2, angle(cleft[0], cleft[1]) - Math.PI / 2);
        // var acleft = scaleControl(aleft, cleft[0], rotateControl(angle(a, ca), cleft[0], cleft[1], cleft[2]), cleft[2]);
        // var aright = polar(a, a.size / 2, angle(cright[0], cright[1]) + Math.PI / 2);
        // var acright = scaleControl(aright, cright[0], rotateControl(angle(a, ca), cright[0], cright[1], cright[2]), cright[2]);
        // var bleft = polar(b, b.size / 2, angle(cleft[2], cleft[3]) - Math.PI / 2);
        // var bcleft = scaleControl(bleft, cleft[3], rotateControl(angle(b, cb), cleft[3], cleft[2], cleft[1]), cleft[1]);
        // var bright = polar(b, b.size / 2, angle(cright[2], cright[3]) + Math.PI / 2);
        // var bcright = scaleControl(bright, cright[3], rotateControl(angle(b, cb), cright[3], cright[2], cright[1]), cright[1]);

        return {aleft, acleft, aright, acright, bleft, bcleft, bright, bcright};
    };

    var cta = gctPreserveAngles();
    var ctw = gctPreserveWidth();

    var intr = (a, b) => {
        var r = {};
        Object.keys(a).forEach((k) => {
            if (typeof b[k] === 'object') {
                r[k] = intr(a[k], b[k]);
            } else {
                r[k] = (a[k] + b[k]) / 2;
            }
        });
        return r;
    };

    var ct = ctw// intr(cta, ctw);

    return {
        start: {
            left: ct.aleft,
            cleft: ct.acleft,
            right: ct.aright,
            cright: ct.acright
        },
        end: {
            left: ct.bleft,
            cleft: ct.bcleft,
            right: ct.bright,
            cright: ct.bcright
        }
    };
}
