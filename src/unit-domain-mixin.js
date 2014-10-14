var rangeMethods = {

    'ordinal': (inputValues, interval) => {
        return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    'linear': (inputValues, interval) => {
        var domainParam = d3.extent(inputValues);
        return d3.scale.linear().domain(domainParam).rangeRound(interval);
    }
};

export class UnitDomainMixin {

    constructor(meta, data) {

        this.fnSource = (whereFilter) => _(data).where(whereFilter || {});

        // TODO: memoize
        this.fnDomain = (dim) => _(data).chain().pluck(dim).uniq().value();

        this.fnScaleTo = (scaleDim, interval) => {
            var temp = _.isString(scaleDim) ? {scaleDim: scaleDim} : scaleDim;
            var dimx = _.defaults(temp, meta[temp.scaleDim]);
            return rangeMethods[dimx.scaleType](this.fnDomain(dimx.scaleDim), interval);
        };
    }

    mix(unit) {
        unit.source = this.fnSource;
        unit.domain = this.fnDomain;
        unit.scaleTo = this.fnScaleTo;
        unit.partition = (() => unit.source(unit.$where));

        return unit;
    }
}