import {Point} from '../point';

export function getPolyline(p: Point[]) {
    if (p.length < 2) {
        return '';
    }
    var result = '';
    for (var i = 0; i < p.length; i++) {
        result += `${i === 0 ? 'M' : ' L'}${p[i].x},${p[i].y}`;
    }
    return result;
}

export function getCurve(p: Point[]) {
    if (p.length < 4) {
        return '';
    }
    var result = `M${p[0].x},${p[0].y}`;
    for (var i = 3; i < p.length; i += 3) {
        result += ` C${p[i - 2].x},${p[i - 2].y} ${p[i - 1].x},${p[i - 1].y} ${p[i].x},${p[i].y}`;
    }
    return result;
}