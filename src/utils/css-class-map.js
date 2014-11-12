import {CSS_PREFIX} from '../const';
var arrayNumber = [1, 2, 3, 4, 5];
var countLineClasses = arrayNumber.map((i) => CSS_PREFIX + 'line-opacity-' + i);
var widthLineClasses = arrayNumber.map((i) => CSS_PREFIX + 'line-width-' + i);
function getLineClassesByCount(count) {
    return countLineClasses[count - 1] || countLineClasses[5];
}
function getLineClassesByWidth(width) {
    var index = 0;
    if (width >= 160 && width < 320) {
        index = 1;
    } else if (width >= 320 && width < 480) {
        index = 2;
    } else if (width >= 480 && width < 640) {
        index = 3;
    } else if (width >= 640) {
        index = 4;
    }
    return widthLineClasses[index];
}
export {getLineClassesByWidth, getLineClassesByCount};