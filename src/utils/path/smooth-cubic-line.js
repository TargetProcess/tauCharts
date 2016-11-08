export default function getSmoothCubicLine(points, x = 'x', y = 'y') {
    if (points.length < 2) {
        return points.slice(0);
    }
    if (points.length === 2) {
        return [
            points[0],
            {
                [x]: interpolateValue(points[0][x], points[1][x], 1 / 3),
                [y]: interpolateValue(points[0][y], points[1][y], 1 / 3),
            },
            {
                [x]: interpolateValue(points[0][x], points[1][x], 2 / 3),
                [y]: interpolateValue(points[0][y], points[1][y], 2 / 3),
            },
            points[1]
        ];
    }

    var curve = new Array((points.length - 1) * 3 + 1);
    var p0, p1, p2, c1x, c1y, c2x, c2y;
    for (var i = 0; i < points.length; i++) {
        curve[i * 3] = points[i];
    }
    for (var i = 2; i < points.length; i++) {
        p0 = points[i - 2];
        p1 = points[i - 1];
        p2 = points[i];
        c1x = interpolateValue(p0[x], p1[x], 2 / 3);
        c2x = interpolateValue(p1[x], p2[x], 1 / 3);
        if ((p1[x] - p0[x]) * (p2[x] - p1[x]) === 0) {
            c1y = interpolateValue(p0[y], p1[y], 2 / 3);
            c2y = interpolateValue(p1[y], p2[y], 1 / 3);
        } else if ((p1[y] - p0[y]) * (p2[y] - p1[y]) <= 0) {
            c1y = p1[y];
            c2y = p1[y];
        } else {
            c1y = p1[y] - interpolateValue(
                p1[y] - p0[y],
                (p2[y] - p1[y]) / (p2[x] - p1[x]) * (p1[x] - p0[x]),
                1 / 2
            ) / 3;
            c2y = p1[y] + interpolateValue(
                p2[y] - p1[y],
                (p1[y] - p0[y]) / (p1[x] - p0[x]) * (p2[x] - p1[x]),
                1 / 2
            ) / 3;
        }
        curve[i * 3 - 4] = {[x]: c1x, [y]: c1y};
        curve[i * 3 - 2] = {[x]: c2x, [y]: c2y};
    }
    curve[1] = {
        [x]: interpolateValue(curve[0][x], curve[3][x], 1 / 3),
        [y]: interpolateValue(curve[0][y], interpolateValue(
            curve[3][y],
            curve[2][y],
            3 / 2
        ), 2 / 3)
    };
    var last = curve.length - 1;
    curve[last - 1] = {
        [x]: interpolateValue(curve[last][x], curve[last - 3][x], 1 / 3),
        [y]: interpolateValue(curve[last][y], interpolateValue(
            curve[last - 3][y],
            curve[last - 2][y],
            3 / 2
        ), 2 / 3)
    };

    return curve;
}

function interpolateValue(a, b, t) {
    return a + t * (b - a)
}
