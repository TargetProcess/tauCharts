import {Point} from './point';

export function bezier(t: number, ...p: number[]) {
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

export function getBezierPoint(t: number, ...p: Point[]) {
    var x = p.map(p => p.x);
    var y = p.map(p => p.y);
    return {
        x: bezier(t, ...x),
        y: bezier(t, ...y)
    };
}

export function splitCubicSegment(t: number, p0: Point, c0: Point, c1: Point, p1: Point) {
    var c2 = getBezierPoint(t, p0, c0);
    var c3 = getBezierPoint(t, p0, c0, c1);
    var c4 = getBezierPoint(t, c0, c1, p1);
    var c5 = getBezierPoint(t, c1, p1);
    var m = getBezierPoint(t, c3, c4);
    return [p0, c2, c3, m, c4, c5, p1];
}
