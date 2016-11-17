export function getStepLine(points) {
    var result = [];
    var hasId = (points[0].id !== undefined);
    var hasSize = (points[0].size !== undefined);
    for (var i = 1, p0, p1, m0, m1; i < points.length; i++) {
        p0 = points[i - 1];
        p1 = points[i];
        m0 = {
            x: (p0.x + p1.x) / 2,
            y: p0.y
        };
        m1 = {
            x: (p0.x + p1.x) / 2,
            y: p1.y
        };
        if (hasId) {
            m0.id = `${p0.id}-${p1.id}-1`;
            m1.id = `${p0.id}-${p1.id}-2`;
        }
        if (hasSize) {
            m0.size = p0.size;
            m1.size = p1.size;
        }
        if (i === 1) {
            result.push(p0);
        }
        result.push(m0, m1, p1);
    }
    return result;
}

export function getStepBeforeLine(points) {
    var result = [];
    var hasId = (points[0].id !== undefined);
    var hasSize = (points[0].size !== undefined);
    for (var i = 1, p0, p1, m; i < points.length; i++) {
        p0 = points[i - 1];
        p1 = points[i];
        m = {
            x: p0.x,
            y: p1.y
        };
        if (hasId) {
            m.id = `${p0.id}-${p1.id}`;
        }
        if (hasSize) {
            m.size = p1.size;
        }
        if (i === 1) {
            result.push(p0);
        }
        result.push(m, p1);
    }
    return result;
}

export function getStepAfterLine(points) {
    var result = [];
    var hasId = (points[0].id !== undefined);
    var hasSize = (points[0].size !== undefined);
    for (var i = 1, p0, p1, m; i < points.length; i++) {
        p0 = points[i - 1];
        p1 = points[i];
        m = {
            x: p1.x,
            y: p0.y
        };
        if (hasId) {
            m.id = `${p0.id}-${p1.id}`;
        }
        if (hasSize) {
            m.size = p0.size;
        }
        if (i === 1) {
            result.push(p0);
        }
        result.push(m, p1);
    }
    return result;
}
