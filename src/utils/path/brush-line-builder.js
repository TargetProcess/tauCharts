/**
 * Returns line with variable stroke width.
 */
export function getBrushLine(points) {
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
 * Returns curve with variable stroke width.
 */
export function getBrushCurve(points) {
    if (points.length === 0) {
        return '';
    }
    if (points.length === 1) {
        return getSegment(points[0], points[0]);
    }
    var segments = [];
    for (var i = 3; i < points.length; i += 3) {
        segments.push(getCurveSegment(points[i - 3], points[i - 2], points[i - 1], points[i]));
    }
    return segments.join(' ');
}

function getCircle(x, y, r) {
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
        return getCircle(largerPt.x, largerPt.y, radius);
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

/**
 * Returns two circles joined with cubic curves.
 */
function getCurveSegment(a, c1, c2, b) {
    var mainDistance = getDistance(a, b);
    if (mainDistance === 0 ||
        (mainDistance + a.size / 2 <= b.size / 2) ||
        (mainDistance + b.size / 2 <= a.size / 2)
    ) {
        // Return single circle, if one is inside another
        var largerPt = a.size > b.size ? a : b;
        var radius = largerPt.size / 2;
        return getCircle(largerPt.x, largerPt.y, radius);
    }

    var mainAngle = getAngle(a, b);
    var tangentAngle = Math.asin((a.size - b.size) / mainDistance / 2);
    var angleLeft = mainAngle - Math.PI / 2 + tangentAngle;
    var angleRight = mainAngle + Math.PI / 2 - tangentAngle;

    var angleA = getAngle(a, c1);
    var angleB = getAngle(c2, b);

    var tangentLeftA = getPolarPoint(a, a.size / 2, angleLeft + angleA - mainAngle);
    var tangentLeftB = getPolarPoint(b, b.size / 2, angleLeft + angleB - mainAngle);
    var tangentRightA = getPolarPoint(a, a.size / 2, angleRight + angleA - mainAngle);
    var tangentRightB = getPolarPoint(b, b.size / 2, angleRight + angleB - mainAngle);

    var cLeftA = getPolarPoint(
        tangentLeftA,
        getDistance(a, c1) / mainDistance * getDistance(tangentLeftA, tangentLeftB),
        angleLeft + angleA - mainAngle + Math.PI / 2
    );
    var cLeftB = getPolarPoint(
        tangentLeftB,
        getDistance(c2, b) / mainDistance * getDistance(tangentLeftA, tangentLeftB),
        angleLeft + angleB - mainAngle - Math.PI / 2
    );
    var cRightA = getPolarPoint(
        tangentRightA,
        getDistance(a, c1) / mainDistance * getDistance(tangentRightA, tangentRightB),
        angleRight + angleA - mainAngle - Math.PI / 2
    );
    var cRightB = getPolarPoint(
        tangentRightB,
        getDistance(c2, b) / mainDistance * getDistance(tangentRightA, tangentRightB),
        angleRight + angleB - mainAngle + Math.PI / 2
    );

    // Compensation for line width in the middle
    var midSize = (a.size + b.size) / 2;
    var applyWidthCompensation = (pt, c1, c2, reverse) => {
        var a1 = getAngle(pt, c1);
        var a2 = getAngle(c1, c2);
        return getPolarPoint(
            pt,
            (
                getDistance(pt, c1) +
                (reverse ? -1 : 1) *
                Math.sin(a2 - a1) * midSize / 3
            ),
            a1
        );
    };
    var controls = [
        applyWidthCompensation(tangentLeftA, cLeftA, cLeftB),
        applyWidthCompensation(tangentLeftB, cLeftB, cLeftA, true),
        applyWidthCompensation(tangentRightA, cRightA, cRightB, true),
        applyWidthCompensation(tangentRightB, cRightB, cRightA)
    ];
    cLeftA = controls[0];
    cLeftB = controls[1];
    cRightA = controls[2];
    cRightB = controls[3];

    return [
        `M${tangentLeftA.x},${tangentLeftA.y}`,
        `C${cLeftA.x},${cLeftA.y}`,
        `${cLeftB.x},${cLeftB.y}`,
        `${tangentLeftB.x},${tangentLeftB.y}`,
        `A${b.size / 2},${b.size / 2} 0 ${Number(tangentAngle < 0)} 1`,
        `${tangentRightB.x},${tangentRightB.y}`,
        `C${cRightB.x},${cRightB.y}`,
        `${cRightA.x},${cRightA.y}`,
        `${tangentRightA.x},${tangentRightA.y}`,
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
