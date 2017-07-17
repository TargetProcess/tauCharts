import {BaseScale} from './base';
import {DataFrame} from '../data-frame';
import {
    ScaleConfig
} from '../definitions';

export class IdentityScale extends BaseScale {

    _references: WeakMap<any, any>;
    _refCounter: () => number;

    constructor(xSource: DataFrame, scaleConfig: ScaleConfig) {

        super(xSource, scaleConfig);

        this._references = scaleConfig.references;
        this._refCounter = scaleConfig.refCounter;
        this.addField('scaleType', 'identity');
    }

    create() {
        var refs = this._references;
        var next = this._refCounter;
        return this.toBaseScale(((x, row) => {
            if (x == null) {
                var i = refs.get(row);
                if (i == null) {
                    i = next();
                    refs.set(row, i);
                }
            } else {
                i = x;
            }
            return i;
        }));
    }
}
