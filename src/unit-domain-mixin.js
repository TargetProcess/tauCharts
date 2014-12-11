import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {utils} from './utils/utils';
/* jshint ignore:start */
import * as _ from 'underscore';
import * as d3 from 'd3';
/* jshint ignore:end */

var autoScaleMethods = {
    'ordinal': (inputValues, props) => {
        return inputValues;
    },

    'linear': (inputValues, props) => {
        var domainParam = (props.autoScale) ?
            utils.autoScale(inputValues) :
            d3.extent(inputValues);

        var min = _.isNumber(props.min) ? props.min : domainParam[0];
        var max = _.isNumber(props.max) ? props.max : domainParam[1];

        return [
            Math.min(min, domainParam[0]),
            Math.max(max, domainParam[1])
        ];
    },

    'period': (inputValues, props) => {
        var domainParam = d3.extent(inputValues);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

        var range = [
            new Date(Math.min(min, domainParam[0])),
            new Date(Math.max(max, domainParam[1]))
        ];

        return UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);
    },

    'time': (inputValues, props) => {
        var domainParam = d3.extent(inputValues);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

        return [
            new Date(Math.min(min, domainParam[0])),
            new Date(Math.max(max, domainParam[1]))
        ];
    }
};

var rangeMethods = {

    'ordinal': (inputValues, interval) => {
        return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    'linear': (inputValues, interval) => {
        return d3.scale.linear().domain(inputValues).rangeRound(interval, 1);
    },

    'period': (inputValues, interval) => {
        return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    'time': (inputValues, interval) => {
        return d3.time.scale().domain(inputValues).range(interval);
    }
};

export class UnitDomainMixin {

    constructor(meta, data) {

        var getPropMapper = (prop) => ((propObj) => {
            var xObject = (propObj || {});
            return xObject.hasOwnProperty(prop) ? xObject[prop] : null;
        });

        var getValueMapper = (dim) => {
            var d = meta[dim] || {};
            var f = d.value ? getPropMapper(d.value) : ((x) => x);

            var isTime = _.contains(['period', 'time'], d.scale);

            return isTime ? _.compose(((v) => (new Date(v)).getTime()), f) : f;
        };

        var getOrder = (dim) => {
            var d = meta[dim] || {};
            return d.order || null;
        };

        var getDomainSortStrategy = (type) => {

            var map = {

                category: (dim, fnMapperId, domain) => {
                    return domain;
                },

                order: (dim, fnMapperId, domain) => {
                    var metaOrder = getOrder(dim);
                    return (metaOrder) ?
                        _.union(metaOrder, domain) : // arguments order is important
                        _.sortBy(domain, fnMapperId);
                },

                measure: (dim, fnMapperId, domain) => {
                    return _.sortBy(domain, fnMapperId);
                },

                'as-is': ((dim, fnMapperId, domain) => domain)
            };

            return map[type] || map['as-is'];
        };

        var getScaleSortStrategy = (type) => {

            var map = {

                category: getDomainSortStrategy('category'),

                order: (dim, fnMapperId, domain) => {
                    var metaOrder = getOrder(dim);
                    return (metaOrder) ?
                        _.union(domain, metaOrder) : // arguments order is important
                        domain;
                },

                measure: getDomainSortStrategy('measure'),

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
                scaleType: xNode.scale || xRoot.scale,
                dimType: xNode.type || xRoot.type
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

        var _scaleMeta = (scaleDim, options) => {
            var opts = options || {};
            var dimx = _.defaults({}, meta[scaleDim]);

            var fValHub = {
                'order:period': (xOptions) => {
                    return ((x) => UnitDomainPeriodGenerator.get(xOptions.period).cast(new Date(x)));
                },

                '*': (opts) => {
                    return ((x) => x);
                }
            };

            var fMap = opts.map ? getPropMapper(opts.map) : getValueMapper(scaleDim);
            var fKey = [dimx.type, dimx.scale].join(':');
            var fVal = (fValHub[fKey] || fValHub['*'])(opts);

            var originalValues = _domain(scaleDim, getScaleSortStrategy(dimx.type)).map(fMap);
            var autoScaledVals = dimx.scale ? autoScaleMethods[dimx.scale](originalValues, opts) : [];

            return {
                extract: (x) => fVal(fMap(x)),
                values: autoScaledVals,
                source: originalValues
            };
        };

        this.fnScaleMeta = _scaleMeta;

        this.fnScaleTo = (scaleDim, interval, options) => {
            var opts = options || {};
            var dimx = _.defaults({}, meta[scaleDim]);

            var info = _scaleMeta(scaleDim, options);

            var func = rangeMethods[dimx.scale](info.values, interval, opts);

            var wrap = (domainPropObject) => func(info.extract(domainPropObject));
            // have to copy properties since d3 produce Function with methods
            Object.keys(func).forEach((p) => (wrap[p] = func[p]));
            return wrap;
        };
    }

    mix(unit) {
        unit.dimension = this.fnDimension;
        unit.source = this.fnSource;
        unit.domain = this.fnDomain;
        unit.scaleMeta = this.fnScaleMeta;
        unit.scaleTo = this.fnScaleTo;
        unit.partition = (() => unit.data || unit.source(unit.$where));
        unit.groupBy = ((srcValues, splitByProperty) => {
            return d3.nest().key((d) => d[splitByProperty]).entries(srcValues);
        });
        return unit;
    }
}