import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
/* jshint ignore:end */

var map_value = (dimType) => {
    return (dimType === 'date') ?
        ((v) => (new Date(v)).getTime()) :
        ((v) => v);
};

var generateHashFunction = (varSet, interval) => utils.generateHash([varSet, interval].map(JSON.stringify).join(''));

export class BaseScale {

    constructor(xSource, scaleConfig) {

        this._fields = {};

        var data;
        if (_.isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {
            data = xSource.partByDims(scaleConfig.fitToFrameByDims);
        } else {
            data = xSource.full();
        }

        var vars = this.getVarSet(data, scaleConfig);

        if (scaleConfig.order) {
            vars = _.union(_.intersection(scaleConfig.order, vars), vars);
        }

        this.vars = vars;
        this.scaleConfig = scaleConfig;

        this.addField('dim', this.scaleConfig.dim)
            .addField('scaleDim', this.scaleConfig.dim)
            .addField('source', this.scaleConfig.source)
            .addField('domain', (() => this.vars));
    }

    addField(key, val) {
        this._fields[key] = val;
        return this;
    }

    getField(key) {
        return this._fields[key];
    }

    toBaseScale(func, dynamicProps = null) {

        var scaleFn = Object
            .keys(this._fields)
            .reduce((memo, k) => {
                memo[k] = this._fields[k];
                return memo;
            }, func);

        scaleFn.getHash = (() => generateHashFunction(this.vars, dynamicProps));

        return scaleFn;
    }

    getVarSet(arr, scale) {
        return _(arr)
            .chain()
            .pluck(scale.dim)
            .uniq(map_value(scale.dimType))
            .value();
    }
}