import {CSS_PREFIX} from '../const';
import {Tooltip} from 'tau-tooltip';
Tooltip.defaults.baseClass = CSS_PREFIX + 'tooltip';

const verticalPlaces = ['top', 'bottom'];

function getWindowRect() {
    const win = window;
    const docEl = document.documentElement;
    const top = ((win.pageYOffset || docEl.scrollTop) - docEl.clientTop);
    const left = ((win.pageXOffset || docEl.scrollLeft) - docEl.clientTop);
    const width = (win.innerWidth || docEl.clientWidth);
    const height = (win.innerHeight || docEl.clientHeight);
    const right = (left + width);
    const bottom = (top + height);
    return {top, right, bottom, left, width, height};
}

function applyBound(bound, box) {
    return {
        top: box.top + bound,
        right: box.right - bound,
        bottom: box.bottom - bound,
        left: box.left + bound,
        width: box.width - 2 * bound,
        height: box.height - 2 * bound
    };
}

export class Balloon extends Tooltip {

    _pickPlace(target) {
        if (!this.options.auto) {
            return this.options.place;
        }
        const winBound = 0 | this.options.winBound;
        const winPos = applyBound(winBound, getWindowRect());
        var place = this.options.place.split('-');
        var spacing = this.spacing;

        if (verticalPlaces.indexOf(place[0]) !== -1) {
            if (target.top - this.height - spacing <= winPos.top) {
                place[0] = 'bottom';
            } else if (target.bottom + this.height + spacing >= winPos.bottom) {
                place[0] = 'top';
            }
            switch (place[1]) {
                case 'left':
                    if (target.right - this.width <= winPos.left) {
                        place[1] = 'right';
                    }
                    break;
                case 'right':
                    if (target.left + this.width >= winPos.right) {
                        place[1] = 'left';
                    }
                    break;
                default:
                    if (target.left + target.width / 2 + this.width / 2 >= winPos.right) {
                        place[1] = 'left';
                    } else if (target.right - target.width / 2 - this.width / 2 <= winPos.left) {
                        place[1] = 'right';
                    }
            }
        } else {
            if (target.left - this.width - spacing <= winPos.left) {
                place[0] = 'right';
            } else if (target.right + this.width + spacing >= winPos.right) {
                place[0] = 'left';
            }
            switch (place[1]) {
                case 'top':
                    if (target.bottom - this.height <= winPos.top) {
                        place[1] = 'bottom';
                    }
                    break;
                case 'bottom':
                    if (target.top + this.height >= winPos.bottom) {
                        place[1] = 'top';
                    }
                    break;
                default:
                    if (target.top + target.height / 2 + this.height / 2 >= winPos.bottom) {
                        place[1] = 'top';
                    } else if (target.bottom - target.height / 2 - this.height / 2 <= winPos.top) {
                        place[1] = 'bottom';
                    }
            }
        }

        return place.join('-');
    }

}
