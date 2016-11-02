/**
 * Returns line with variable stroke width.
 */
export default function getBrushLine(points) {
    if (points.length === 0) {
        return '';
    }
    if (points.length === 1) {
        return getSegment(points[0], points[0]);
    }
    var segments = [];
    for (var i = 1; i < points.length; i++) {
        segments.push(getSegment(points[i - 1], points[i]));
    }
    return segments.join(' ');
}

/**
 * Returns two circles joined with tangents.
 */
function getSegment(a, b) {
    var mainDistance = getDistance(a, b);
    if (mainDistance === 0 ||
        (mainDistance + a.size / 2 <= b.size / 2) ||
        (mainDistance + b.size / 2 <= a.size / 2)
    ) {
        // Return single circle, if one is inside another
        var largerPt = a.size > b.size ? a : b;
        var radius = largerPt.size / 2;
        return [
            `M${largerPt.x},${largerPt.y - radius}`,
            `A${radius},${radius} 0 0 1`,
            `${largerPt.x},${largerPt.y + radius}`,
            `A${radius},${radius} 0 0 1`,
            `${largerPt.x},${largerPt.y - radius}`,
            'Z'
        ].join(' ');
    }

    var mainAngle = getAngle(a, b);
    var tangentAngle = Math.asin((a.size - b.size) / mainDistance / 2);
    var angleLeft = mainAngle - Math.PI / 2 + tangentAngle;
    var angleRight = mainAngle + Math.PI / 2 - tangentAngle;

    var tangentLeftA = getPolarPoint(a, a.size / 2, angleLeft);
    var tangentLeftB = getPolarPoint(b, b.size / 2, angleLeft);
    var tangentRightA = getPolarPoint(a, a.size / 2, angleRight);
    var tangentRightB = getPolarPoint(b, b.size / 2, angleRight);

    return [
        `M${tangentLeftA.x},${tangentLeftA.y}`,
        `L${tangentLeftB.x},${tangentLeftB.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(tangentAngle < 0)} 1`,
        `${tangentRightB.x},${tangentRightB.y}`,
        `L${tangentRightA.x},${tangentRightA.y}`,
        `A${a.size / 2},${a.size / 2} 0 ${Number(tangentAngle > 0)} 1`,
        `${tangentLeftA.x},${tangentLeftA.y}`,
        'Z'
    ].join(' ');
}

function getAngle(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function getDistance(a, b) {
    return Math.sqrt((b.y - a.y) * (b.y - a.y) + (b.x - a.x) * (b.x - a.x));
}

function getPolarPoint(start, distance, angle) {
    return {
        x: start.x + distance * Math.cos(angle),
        y: start.y + distance * Math.sin(angle)
    };
}
