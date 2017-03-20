import {getBezierPoint} from '../bezier';

/**
 * Returns smooth cubic spline.
 * Applicable to math functions.
 */
export function getCurve(points) {
    return getCubicSpline(points, false);
}

/**
 * Returns cubic spline that never exceeds extremums.
 * Applicable to business data.
 */
export function getCurveKeepingExtremums(points) {
    return getCubicSpline(points, true);
}

// TODO: Smooth sengments junctions.
function getCubicSpline(points, limited) {
    if (points.length < 2) {
        return points.slice(0);
    }
    if (points.length === 2) {
        return [
            points[0],
            {
                x: interpolate(points[0].x, points[1].x, 1 / 3),
                y: interpolate(points[0].y, points[1].y, 1 / 3)
            },
            {
                x: interpolate(points[0].x, points[1].x, 2 / 3),
                y: interpolate(points[0].y, points[1].y, 2 / 3)
            },
            points[1]
        ];
    }

    var curve = new Array((points.length - 1) * 3 + 1);
    var c0, p1, c3, c1x, c1y, c2x, c2y, qx, qy, qt, tan, dx1, dx2, kl;
    for (var i = 0; i < points.length; i++) {
        curve[i * 3] = points[i];
        if (i > 0) {
            curve[i * 3 - 2] = getBezierPoint(1 / 3, points[i - 1], points[i]);
            curve[i * 3 - 1] = getBezierPoint(2 / 3, points[i - 1], points[i]);
        }
    }
    var result = curve.slice(0);
    for (var j = 0, last; j < 3; j++) {
        for (i = 6; i < result.length; i += 3) {
            c0 = result[i - 5];
            p1 = result[i - 3];
            c3 = result[i - 1];
            if ((p1.x - c0.x) * (c3.x - p1.x) * 1e12 < 1) {
                c1x = interpolate(c0.x, p1.x, 0.5);
                c2x = interpolate(p1.x, c3.x, 0.5);
                c1y = interpolate(c0.y, p1.y, 0.5);
                c2y = interpolate(p1.y, c3.y, 0.5);
            } else {
                qt = (p1.x - c0.x) / (c3.x - c0.x);
                qx = (p1.x - c0.x * (1 - qt) * (1 - qt) - c3.x * qt * qt) / (2 * (1 - qt) * qt);
                qy = (p1.y - c0.y * (1 - qt) * (1 - qt) - c3.y * qt * qt) / (2 * (1 - qt) * qt);
                c1x = interpolate(c0.x, qx, qt);
                c2x = interpolate(qx, c3.x, qt);
                c1y = interpolate(c0.y, qy, qt);
                c2y = interpolate(qy, c3.y, qt);

                if (limited) {
                    dx1 = (p1.x - c1x);
                    dx2 = (c2x - p1.x);
                    tan = (c2y - p1.y) / dx2;
                    if ((p1.y - c0.y) * (c3.y - p1.y) <= 0) {
                        tan = 0;
                    } else {
                        if (p1.y > c0.y === c2y > c3.y) {
                            kl = ((c3.y - p1.y) / (c2y - p1.y));
                            dx2 = interpolate(dx2 * kl, dx2, 1 / (1 + Math.abs(kl)));
                            tan = (c3.y - p1.y) / dx2;
                        }
                        if (p1.y > c0.y === c1y < c0.y) {
                            kl = ((p1.y - c0.y) / (p1.y - c1y));
                            dx1 = interpolate(dx1 * kl, dx1, 1 / (1 + Math.abs(kl)));
                            tan = (p1.y - c0.y) / dx1;
                        }
                    }
                    c1x = p1.x - dx1;
                    c2x = p1.x + dx2;
                    c1y = p1.y - tan * dx1;
                    c2y = p1.y + tan * dx2;
                }
            }
            curve[i - 4] = {x: c1x, y: c1y};
            curve[i - 2] = {x: c2x, y: c2y};
        }
        curve[1] = {
            x: interpolate(curve[0].x, curve[3].x, 1 / 3),
            y: interpolate(curve[0].y, interpolate(
                curve[3].y,
                curve[2].y,
                3 / 2
            ), 2 / 3)
        };
        last = curve.length - 1;
        curve[last - 1] = {
            x: interpolate(curve[last].x, curve[last - 3].x, 1 / 3),
            y: interpolate(curve[last].y, interpolate(
                curve[last - 3].y,
                curve[last - 2].y,
                3 / 2
            ), 2 / 3)
        };
        result = curve.slice(0);
    }

    return result;
}

function interpolate(a, b, t) {
    return a + t * (b - a);
}
