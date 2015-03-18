/* jshint ignore:start */
var utilsDraw = {
    translate: ((left, top) => `translate(${left},${top})`),
    rotate: ((angle) => `rotate(${angle})`),
    getOrientation: ((scaleOrient) => (['bottom', 'top'].indexOf(scaleOrient.toLowerCase()) >= 0) ? 'h' : 'v')
};
/* jshint ignore:end */

export {utilsDraw};
