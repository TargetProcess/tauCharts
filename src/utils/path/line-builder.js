import toCubic from './smooth-cubic-line';

export function getPolyline(p) {
    if (p.length < 2) {
        return '';
    }
    var result = '';
    for (var i = 0; i < p.length; i++) {
        result += `${i === 0 ? 'M' : ' L'}${p[i].x},${p[i].y}`;
    }
    return result;
}

export function getSmoothLine(p) {
    if (p.length < 4) {
        return '';
    }
    // var result = `M${c[0].x},${c[0].y}`;
    // for (var i = 3; i < c.length; i += 3) {
    //     result += ` C${c[i - 2].x},${c[i - 2].y} ${c[i - 1].x},${c[i - 1].y} ${c[i].x},${c[i].y}`;
    // }
    var result = '';
    for (var i = 0; i < p.length - 1; i++) {
        if (i === 0) {
            result += `M${p[i].x},${p[i].y}`;
        }
        if (i > 0) {
            result += ` ${p[i].c1.x},${p[i].c1.y}`;
            result += ` C${p[i].x},${p[i].y}`;
        }
        if (i < p.length - 2) {
            result += ` ${p[i].c2.x},${p[i].c2.y}`;
        }
    }
    return result;
}