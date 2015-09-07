import {Path} from './element.path';
import {utils} from '../utils/utils';

export class Area extends Path {

    constructor(config) {
        super(config);
    }

    _assignBase(scale, rows) {
        var domain = scale.domain();
        var dim = scale.dim;
        var min = domain[0];
        var max = domain[domain.length - 1];

        var head = utils.clone(rows[0]);
        var last = utils.clone(rows[rows.length - 1]);

        // NOTE: max also can be below 0
        var base = scale.discrete ?
            (min) :
            ((min < 0) ? (Math.min(...[0, max])) : (min));

        head[dim] = base;
        last[dim] = base;

        return [head].concat(rows).concat(last);
    }

    packFrameData(rows) {
        var guide = this.config.guide;
        var scale = (guide.flip ? this.xScale : this.yScale);
        return this._assignBase(scale, rows);
    }

    unpackFrameData(rows) {
        var last = rows.length - 1;
        return rows.filter((r, i) => ((i > 0) && (i < last)));
    }

    getDistance(mx, my, rx, ry) {
        var guide = this.config.guide;
        return (guide.flip ? Math.abs(my - ry) : Math.abs(mx - rx));
    }
}