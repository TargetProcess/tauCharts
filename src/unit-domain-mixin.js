var rangeMethods = {

    'ordinal': (inputValues, interval) => {
        return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    'linear': (inputValues, interval) => {
        var domainParam = d3.extent(inputValues);
        return d3.scale.linear().domain(domainParam).nice().rangeRound(interval, 1);
    }
};

export class UnitDomainMixin {

    constructor(meta, data) {

        var getIdMapper = (dim) => {
            var d = meta[dim] || {};
            return d.id || ((x) => x);
        };

        this.fnSource = (whereFilter) => {

            var predicates = _.map(
                whereFilter,
                (v, k) => (row) => getIdMapper(k)(row[k]) === v);

            return _(data).filter((row) => _.every(predicates, ((p) => p(row))));
        };

        this.fnDomain = (dim, fnNameMapper) => {
            var fnMapperId = getIdMapper(dim);
            var fnMapperName = fnNameMapper || fnMapperId;
            return _(data).chain().pluck(dim).uniq(fnMapperId).map(fnMapperName).value();
        };

        this.fnScaleTo = (scaleDim, interval) => {
            var temp = _.isString(scaleDim) ? {scaleDim: scaleDim} : scaleDim;
            var dimx = _.defaults(temp, meta[temp.scaleDim]);
            return rangeMethods[dimx.scaleType](this.fnDomain(dimx.scaleDim, dimx.name), interval);
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