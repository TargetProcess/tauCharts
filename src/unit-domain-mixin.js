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

                order: getDomainSortStrategy('order'),

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
                return [];
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

        var _scaleMeta = (scaleDim, xOptions) => {

            var opts = {};
            var options = xOptions || {};

            opts.map = options.hasOwnProperty('map') ? options.map : options.tickLabel;
            opts.min = options.hasOwnProperty('min') ? options.min : options.tickMin;
            opts.max = options.hasOwnProperty('max') ? options.max : options.tickMax;
            opts.period = options.hasOwnProperty('period') ? options.period : options.tickPeriod;
            opts.autoScale = options.autoScale;

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
            var autoScaledVals = dimx.scale ? autoScaleMethods[dimx.scale](originalValues, opts) : originalValues;
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

        this.fnScaleColor = (scaleDim, brewer, options) => {
            var opts = options || {};

            var info = _scaleMeta(scaleDim, opts);

            var defaultColorClass = _.constant('color-default');

            var defaultRangeColor = _.times(20, (i) => 'color20-' + (1 + i));

            var buildArrayGetClass = (domain, brewer) => {
                if (domain.length === 0 || (domain.length === 1 && domain[0] === null)) {
                    return defaultColorClass;
                }
                else {
                    var fullDomain = domain.map((x) => String(x).toString());
                    return d3.scale.ordinal().range(brewer).domain(fullDomain);
                }
            };

            var buildObjectGetClass = (brewer, defaultGetClass) => {
                var domain = _.keys(brewer);
                var range = _.values(brewer);
                var calculateClass = d3.scale.ordinal().range(range).domain(domain);
                return (d) => brewer.hasOwnProperty(d) ? calculateClass(d) : defaultGetClass(d);
            };

            var wrapString = (f) => (d) => f(String(d).toString());

            var func;
            if (!brewer) {
                func = wrapString(buildArrayGetClass(info.values, defaultRangeColor));
            }
            else if (_.isArray(brewer)) {
                func = wrapString(buildArrayGetClass(info.values, brewer));
            }
            else if (_.isFunction(brewer)) {
                func = (d) => brewer(d, wrapString(buildArrayGetClass(info.values, defaultRangeColor)));
            }
            else if (_.isObject(brewer)) {
                func = buildObjectGetClass(brewer, defaultColorClass);
            }
            else {
                throw new Error('This brewer is not supported');
            }

            var wrap = (domainPropObject) => func(info.extract(domainPropObject));

            wrap.get = wrap;
            wrap.dimension = scaleDim;

            wrap.legend = (domainPropObject) => {

                var value = info.extract(domainPropObject);
                var label = (opts.tickLabel) ? ((domainPropObject || {})[opts.tickLabel]) : (value);
                var color = func(value);

                return {value, color, label};
            };

            return wrap;
        };

        this.fnScaleSize = (scaleDim, range, options) => {

            var opts = options || {};

            var minSize = range[0];
            var maxSize = range[1];
            var normalSize = range[range.length - 1];

            var info = _scaleMeta(scaleDim, opts);

            var f = (x) => Math.sqrt(x);

            var values = _.filter(info.source, _.isFinite);

            var func;

            if (values.length === 0) {
                func = ((x) => normalSize);
            }
            else {
                var k = 1;
                var xMin = 0;

                var min = Math.min.apply(null, values);
                var max = Math.max.apply(null, values);

                var len = f(Math.max.apply(
                    null,
                    [
                        Math.abs(min),
                        Math.abs(max),
                        max - min
                    ]));

                xMin = (min < 0) ? min : 0;
                k = (len === 0) ? 1 : ((maxSize - minSize) / len);

                func = (x) => {
                    var numX = (x !== null) ? parseFloat(x) : 0;

                    if (!_.isFinite(numX)) {
                        return maxSize;
                    }

                    var posX = (numX - xMin); // translate to positive x domain

                    return (minSize + (f(posX) * k));
                };
            }

            var wrap = (domainPropObject) => func(info.extract(domainPropObject));

            return wrap;
        };
    }

    mix(unit) {
        unit.dimension = this.fnDimension;
        unit.source = this.fnSource;
        unit.domain = this.fnDomain;
        unit.scaleMeta = this.fnScaleMeta;

        unit.scaleTo = this.fnScaleTo;
        unit.scaleDist = this.fnScaleTo;
        unit.scaleColor = this.fnScaleColor;
        unit.scaleSize = this.fnScaleSize;

        unit.partition = (() => unit.data || unit.source(unit.$where));
        unit.groupBy = ((srcValues, splitByProperty) => {
            var varMeta = unit.scaleMeta(splitByProperty);
            return _.chain(srcValues)
                .groupBy((item) => varMeta.extract(item[splitByProperty]))
                .map((values) => ({
                    key: varMeta.extract(values[0][splitByProperty]),
                    values: values
                }))
                .value();
        });
        return unit;
    }
}