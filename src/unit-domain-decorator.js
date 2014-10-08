var SCALE_STRATEGIES = {
    'ordinal': (domain) => domain,
    'linear': (domain) => d3.extent(domain)
};

var getRangeMethod = (scaleType) => ((scaleType === 'ordinal') ? 'rangeRoundBands' : 'rangeRound');

export class UnitDomainDecorator {

    constructor(meta, data) {
        this.meta = meta;
        this.data = data;

        this.fnSource = (whereFilter) => _(data).where(whereFilter || {});

        // TODO: memoize
        this.fnDomain = (dim) => _(data).chain().pluck(dim).uniq().value();

        this.fnScaleTo = (scaleDim, interval) => {
            var temp = _.isString(scaleDim) ? {scaleDim: scaleDim} : scaleDim;
            var dimx = _.defaults(temp, meta[temp.scaleDim]);
            var type = dimx.scaleType;
            var vals = this.fnDomain(dimx.scaleDim);

            var rangeMethod = getRangeMethod(type);
            var domainParam = SCALE_STRATEGIES[type](vals);

            return d3.scale[type]().domain(domainParam)[rangeMethod](interval, 0.1);
        };
    }

    decorate(unit) {
        unit.source = this.fnSource;
        unit.domain = this.fnDomain;
        unit.scaleTo = this.fnScaleTo;
        unit.partition = (() => unit.source(unit.$where));

        return unit;
    }
}