import {BaseScale} from './base';

export class IdentityScale extends BaseScale {

    constructor(xSource, scaleConfig) {

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