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

    constructor(dataFrame, scaleConfig) {

        this._fields = {};

        var data;
        if (_.isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {

            let leaveDimsInWhereArgsOrEx = (f) => {
                var r = {};
                if (f.type === 'where' && f.args) {
                    r.type = f.type;
                    r.args = scaleConfig
                        .fitToFrameByDims
                        .reduce((memo, d) => {
                            if (f.args.hasOwnProperty(d)) {
                                memo[d] = f.args[d];
                            }
                            return memo;
                        },
                        {});
                } else {
                    r = f;
                }

                return r;
            };

            data = dataFrame.part(leaveDimsInWhereArgsOrEx);
        } else {
            data = dataFrame.full();
        }

        var vars = this.getVarSet(data, scaleConfig);

        if (scaleConfig.order) {
            vars = _.union(_.intersection(scaleConfig.order, vars), vars);
        }

        this.vars = vars;
        this.scaleConfig = scaleConfig;

        this.addField('dim', this.scaleConfig.dim)
            .addField('scaleDim', this.scaleConfig.dim)
            .addField('scaleType', this.scaleConfig.type)
            .addField('source', this.scaleConfig.source)
            .addField('domain', (() => this.vars))
            .addField('domain', (() => this.vars));
    }

    isInDomain(val) {
        return (this.domain().indexOf(val) >= 0);
    }

    domain() {
        return this.vars;
    }

    addField(key, val) {
        this._fields[key] = val;
        this[key] = val;
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