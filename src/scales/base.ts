import * as utils from '../utils/utils';
import {DataFrame} from '../data-frame';
import {
    DataFilter,
    ScaleConfig,
    ScaleFields,
    ScaleFunction
} from '../definitions';

var map_value = (dimType: string) => {
    return (dimType === 'date') ?
        ((v) => (new Date(v)).getTime()) :
        ((v) => v);
};

var generateHashFunction = (varSet, interval) => {
    return utils.generateHash([varSet, interval].map((v) => {
        return JSON.stringify;
    }).join(''));
};

export abstract class BaseScale implements ScaleFields {

    _fields: {[field: string]: any};
    vars: any;

    scaleConfig: ScaleConfig;
    dim: string;
    scaleDim: string;
    scaleType: string;
    source: string;
    domain: () => any[];
    isInteger: boolean;
    originalSeries: () => any[];
    isContains: (x) => boolean;
    isEmptyScale: () => boolean;
    fixup: (fn: (config: ScaleConfig) => ScaleConfig) => void;
    commit: () => void;

    abstract create(interval: [number, number]): ScaleFunction;

    constructor(dataFrame: DataFrame, scaleConfig: ScaleConfig) {

        this._fields = {};

        var data;
        if (Array.isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {

            let leaveDimsInWhereArgsOrEx = (f: DataFilter) => {
                var r = {} as DataFilter;
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
            vars = utils.union(utils.intersection(scaleConfig.order, vars), vars);
        }

        this.vars = vars;
        const originalSeries = vars.map((row) => (row));
        this.scaleConfig = scaleConfig;

        // keep for backward compatibility with "autoScale"
        this.scaleConfig.nice = ((this.scaleConfig.hasOwnProperty('nice')) ?
            (this.scaleConfig.nice) :
            (this.scaleConfig.autoScale));

        this.addField('dim', this.scaleConfig.dim)
            .addField('scaleDim', this.scaleConfig.dim)
            .addField('scaleType', this.scaleConfig.type)
            .addField('source', this.scaleConfig.source)
            .addField('domain', (() => this.vars))
            .addField('isInteger', originalSeries.every(Number.isInteger))
            .addField('originalSeries', (() => originalSeries))
            .addField('isContains', ((x) => this.isInDomain(x)))
            .addField('isEmptyScale', (() => this.isEmpty()))
            .addField('fixup', (fn) => {
                var cfg = this.scaleConfig;
                cfg.__fixup__ = cfg.__fixup__ || {};
                cfg.__fixup__ = Object.assign(
                    cfg.__fixup__,
                    fn(Object.assign({}, cfg, cfg.__fixup__)));
            })
            .addField('commit', () => {
                this.scaleConfig = Object.assign(this.scaleConfig, this.scaleConfig.__fixup__);
                delete this.scaleConfig.__fixup__;
            });
    }

    isInDomain(val: any) {
        return (this.domain().indexOf(val) >= 0);
    }

    addField(key: string, val) {
        this._fields[key] = val;
        this[key] = val;
        return this;
    }

    getField(key: string) {
        return this._fields[key];
    }

    isEmpty() {
        return !Boolean(this._fields.dim);
    }

    toBaseScale(func: (x, row) => any, dynamicProps = null) {

        var scaleFn = Object
            .keys(this._fields)
            .reduce((memo, k) => {
                memo[k] = this._fields[k];
                return memo;
            }, func as ScaleFunction);

        scaleFn.getHash = (() => generateHashFunction(this.vars, dynamicProps));
        scaleFn.value = scaleFn;

        return scaleFn;
    }

    getVarSet(arr: any[], scale: ScaleConfig) {

        var series = scale.hasOwnProperty('series') ?
            scale.series :
            arr.map((row) => row[scale.dim]);

        return utils.unique(series, map_value(scale.dimType));
    }
}