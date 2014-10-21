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

        var getPropMapper = (prop) => ((propObj) => propObj[prop]);

        var getValueMapper = (dim) => {
            var d = meta[dim] || {};
            return d.value ? getPropMapper(d.value) : ((x) => x);
        };

        var getOrder = (dim) => {
            var d = meta[dim] || {};
            return d.order || null;
        };

        var getDomainSortStrategy = (type) => {

            var map = {

                categorical: (dim, fnMapperId, domain) => {
                    return domain;
                },

                qualitative: (dim, fnMapperId, domain) => {
                    var metaOrder = getOrder(dim);
                    return (metaOrder) ?
                        _.union(metaOrder, domain) : // arguments order is important
                        _.sortBy(domain, fnMapperId);
                },

                quantitative: (dim, fnMapperId, domain) => {
                    return _.sortBy(domain, fnMapperId);
                },

                'as-is': ((dim, fnMapperId, domain) => domain)
            };

            return map[type] || map['as-is'];
        };

        var getScaleSortStrategy = (type) => {

            var map = {

                categorical: getDomainSortStrategy('categorical'),

                qualitative: (dim, fnMapperId, domain) => {
                    var metaOrder = getOrder(dim);
                    return (metaOrder) ?
                        _.union(domain, metaOrder) : // arguments order is important
                        domain;
                },

                quantitative: getDomainSortStrategy('quantitative'),

                'as-is': getDomainSortStrategy('as-is')
            };

            return map[type] || map['as-is'];
        };

        this.fnDimension = (dimensionName, subUnit) => {
            var unit = (subUnit || {}).dimensions || {};
            var xRoot = meta[dimensionName] || {};
            var xNode = unit[dimensionName] || {};
            return {
                scaleDim: dimensionName,
                scaleType: xNode.scale || xRoot.scale
            };
        };

        this.fnSource = (whereFilter) => {
            var predicates = _.map(whereFilter, (v, k) => (row) => getValueMapper(k)(row[k]) === v);
            return _(data).filter((row) => _.every(predicates, ((p) => p(row))));
        };

        var _domain = (dim, fnSort) => {

            if (!meta[dim]) {
                return [null];
            }

            var fnMapperId = getValueMapper(dim);
            var uniqValues = _(data).chain().pluck(dim).uniq(fnMapperId).value();

            return fnSort(dim, fnMapperId, uniqValues);
        };

        this.fnDomain = (dim) => {
            var fnMapperId = getValueMapper(dim);
            var type = (meta[dim] || {}).type;
            var domainSortedAsc = _domain(dim, getDomainSortStrategy(type));
            return domainSortedAsc.map(fnMapperId);
        };

        this.fnScaleTo = (scaleDim, interval, propertyPath) => {
            var dimx = _.defaults({}, meta[scaleDim]);
            var fMap = propertyPath ? getPropMapper(propertyPath) : getValueMapper(scaleDim);

            var type = (meta[scaleDim] || {}).type;
            var vals = _domain(scaleDim, getScaleSortStrategy(type)).map(fMap);

            var func = rangeMethods[dimx.scale](vals, interval);

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