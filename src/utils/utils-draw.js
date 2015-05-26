/* jshint ignore:start */
var utilsDraw = {
    translate: ((left, top) => `translate(${left},${top})`),
    rotate: ((angle) => `rotate(${angle})`),
    getOrientation: ((scaleOrient) => (['bottom', 'top'].indexOf(scaleOrient.toLowerCase()) >= 0) ? 'h' : 'v'),
    isIntersect(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
        var s1_x, s1_y, s2_x, s2_y;
        s1_x = ax1 - ax0;
        s1_y = ay1 - ay0;
        s2_x = bx1 - bx0;
        s2_y = by1 - by0;

        var s, t;
        s = (-s1_y * (ax0 - bx0) + s1_x * (ay0 - by0)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (ay0 - by0) - s2_y * (ax0 - bx0)) / (-s2_x * s1_y + s1_x * s2_y);

        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    }
};
/* jshint ignore:end */

export {utilsDraw};
