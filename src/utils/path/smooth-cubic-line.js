export default function getSmoothCubicLine(points) {
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
    var p0, p1, p2, c1x, c1y, c2x, c2y, dx1, dy1, dx2, dy2, tan;
    for (var i = 0; i < points.length; i++) {
        curve[i * 3] = points[i];
    }
    for (i = 2; i < points.length; i++) {
        p0 = points[i - 2];
        p1 = points[i - 1];
        p2 = points[i];
        c1x = interpolate(p0.x, p1.x, 2 / 3);
        c2x = interpolate(p1.x, p2.x, 1 / 3);
        dx1 = p1.x - p0.x;
        dy1 = p1.y - p0.y;
        dx2 = p2.x - p1.x;
        dy2 = p2.y - p1.y;
        if (dx1 * dx2 === 0) {
            c1y = p1.y - dy1 / 3;
            c2y = p1.y + dy2 / 3;
        } else if (dy1 * dy2 <= 0) {
            c1y = p1.y;
            c2y = p1.y;
        } else {
            // NOTE: Limit tangent so that curve never exceeds anchors.
            tan = (dy1 < 0 ? Math.max : Math.min)(
                (dy1 / dx1 + dy2 / dx2) / 2,
                3 * dy1 / dx1,
                3 * dy2 / dx2
            );

            c1y = p1.y - tan * dx1 / 3;
            c2y = p1.y + tan * dx2 / 3;
        }
        curve[i * 3 - 4] = {x: c1x, y: c1y};
        curve[i * 3 - 2] = {x: c2x, y: c2y};
    }
    curve[1] = {
        x: interpolate(curve[0].x, curve[3].x, 1 / 3),
        y: interpolate(curve[0].y, interpolate(
            curve[3].y,
            curve[2].y,
            3 / 2
        ), 2 / 3)
    };
    var last = curve.length - 1;
    curve[last - 1] = {
        x: interpolate(curve[last].x, curve[last - 3].x, 1 / 3),
        y: interpolate(curve[last].y, interpolate(
            curve[last - 3].y,
            curve[last - 2].y,
            3 / 2
        ), 2 / 3)
    };

    return curve;
}

function interpolate(a, b, t) {
    return a + t * (b - a);
}
