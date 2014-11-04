import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {utils} from './utils/utils';
/* jshint ignore:start */
import * as _ from 'underscore';
import * as d3 from 'd3';
/* jshint ignore:end */

var rangeMethods = {

    'ordinal': (inputValues, interval, props) => {
        return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    'linear': (inputValues, interval, props) => {
        var domainParam = (props.autoScale) ?
            utils.autoScale(inputValues) :
            d3.extent(inputValues);

        var min = _.isNumber(props.min) ? props.min : domainParam[0];
        var max = _.isNumber(props.max) ? props.max : domainParam[1];

        var range = [
            Math.min(min, domainParam[0]),
            Math.max(max, domainParam[1])
        ];

        return d3.scale.linear().domain(range).rangeRound(interval, 1);
    },

    'period': (inputValues, interval, props) => {
        var domainParam = d3.extent(inputValues);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

        var range = [
            Math.min(min, domainParam[0]),
            Math.max(max, domainParam[1])
        ];

        var dates = UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);

        return d3.scale.ordinal().domain(dates).rangePoints(interval, 1);
    },

    'time': (inputValues, interval, props) => {
        var domainParam = d3.extent(inputValues);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

        var range = [
            Math.min(min, domainParam[0]),
            Math.max(max, domainParam[1])
        ];

        return d3.time.scale().domain(range).range(interval);
    }
};

export class UnitDomainMixin {

    constructor(meta, data) {

        var getPropMapper = (prop) => ((propObj) => propObj[prop]);

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

        this.fnScaleTo = (scaleDim, interval, options) => {
            var opts = options || {};
            var dimx = _.defaults({}, meta[scaleDim]);

            var fMap = opts.map ? getPropMapper(opts.map) : getValueMapper(scaleDim);
            var fVal = opts.period ?
                ((x) => UnitDomainPeriodGenerator.get(opts.period).cast(new Date(x))) :
                ((x) => x);

            var vals = _domain(scaleDim, getScaleSortStrategy(dimx.type)).map(fMap);

            var func = rangeMethods[dimx.scale](vals, interval, opts);

            var wrap = (domainPropObject) => func(fVal(fMap(domainPropObject)));
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