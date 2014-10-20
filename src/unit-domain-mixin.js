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

        var getPropMapper = (prop) => {
            return !prop ? ((propObj) => propObj) : (_.isFunction(prop) ? prop : ((propObj) => propObj[prop]));
        };

        var getIdMapper = (dim) => {
            var d = meta[dim] || {};
            var prop = d.id || ((x) => x);
            return getPropMapper(prop);
        };

        var sortAliases = {
            asc: 1,
            desc: -1,
            '-1': -1,
            '1': 1
        };

        var getSortOrder = (dim) => {
            var d = meta[dim] || {};
            var s = (d.sort || '').toString().toLowerCase();
            return sortAliases[s] || 0;
        };

        var getIndex = (dim) => {
            var d = meta[dim] || {};
            return d.index || null;
        };

        this.fnDimension = (dimensionName, subUnit) => {
            var unit = (subUnit || {}).dimensions || {};
            var xRoot = meta[dimensionName] || {};
            var xNode = unit[dimensionName] || {};
            return {
                scaleDim: dimensionName,
                scaleType: xNode.scaleType || xRoot.scaleType
            };
        };

        this.fnSource = (whereFilter) => {
            var predicates = _.map(whereFilter, (v, k) => (row) => getIdMapper(k)(row[k]) === v);
            return _(data).filter((row) => _.every(predicates, ((p) => p(row))));
        };

        this.fnDomain = (dim, fnNameMapper) => {
            var fnMapperId = getIdMapper(dim);
            var domain = _(data).chain().pluck(dim).uniq(fnMapperId).value();

            var sortOrder = getSortOrder(dim);
            var metaIndex = getIndex(dim);
            var domainAsc;
            if (metaIndex === null) {
                domainAsc = (sortOrder !== 0) ? _.sortBy(domain, fnMapperId) : domain;
            }
            else {
                domainAsc = _.union(metaIndex, domain);
            }

            var domainSorted = (sortOrder === -1) ? domainAsc.reverse() : domainAsc;
            return domainSorted.map(fnNameMapper || fnMapperId);
        };

        this.fnScaleTo = (scaleDim, interval) => {
            //var temp = _.isString(scaleDim) ? {scaleDim: scaleDim} : scaleDim;
            var dimx = _.defaults({}, meta[scaleDim]);
            var fMap = getPropMapper(dimx.name);
            var func = rangeMethods[dimx.scaleType](
                this.fnDomain(scaleDim, fMap),
                interval);

            var wrap = (domainPropObject) => func(fMap(domainPropObject));
            // have to copy properties since d3 produce Function with methods
            for (var p in func) {
                if (func.hasOwnProperty(p)) {
                    wrap[p] = func[p];
                }
            }
            return wrap;
        };
    }

    mix(unit) {
        unit.dimension = this.fnDimension;
        unit.source = this.fnSource;
        unit.domain = this.fnDomain;
        unit.scaleTo = this.fnScaleTo;
        unit.partition = (() => unit.source(unit.$where));

        return unit;
    }
}