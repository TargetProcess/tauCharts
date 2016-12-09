export function bezier(t, ...p) {
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

export function getBezierPoint(t, ...p) {
    var x = p.map(p => p.x);
    var y = p.map(p => p.y);
    x.unshift(t);
    y.unshift(t);
    return {
        x: bezier.apply(null, x),
        y: bezier.apply(null, y)
    };
}
