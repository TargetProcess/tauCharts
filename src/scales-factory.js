import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {utils} from './utils/utils';
/* jshint ignore:start */
import * as _ from 'underscore';
import * as d3 from 'd3';
/* jshint ignore:end */

var scalesStrategies = {

    'color': (vars, props) => {

        var varSet = vars;

        var brewer = props.brewer;

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
            func = wrapString(buildArrayGetClass(varSet, defaultRangeColor));
        }
        else if (_.isArray(brewer)) {
            func = wrapString(buildArrayGetClass(varSet, brewer));
        }
        else if (_.isFunction(brewer)) {
            func = (d) => brewer(d, wrapString(buildArrayGetClass(varSet, defaultRangeColor)));
        }
        else if (_.isObject(brewer)) {
            func = buildObjectGetClass(brewer, defaultColorClass);
        }
        else {
            throw new Error('This brewer is not supported');
        }

        var wrap = func;

        return {
            init: function() {

                wrap.legend = (v) => {

                    // var value = varSet.extract(v);
                    var value = v;
                    var label = (props.tickLabel) ? ((v || {})[props.tickLabel]) : (value);
                    var color = func(value);

                    return {value, color, label};
                };

                return wrap;
            }
        };
    },

    'size': (varSet, props) => {

        var minSize = props.min;
        var maxSize = props.max;
        var midSize = props.mid;

        var f = (x) => Math.sqrt(x);

        var values = _.filter(varSet, _.isFinite);
        if (values.length === 0) {
            return (x) => midSize;
        }

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

        var func = (x) => {

            var numX = (x !== null) ? parseFloat(x) : 0;

            if (!_.isFinite(numX)) {
                return maxSize;
            }

            var posX = (numX - xMin); // translate to positive x domain

            return (minSize + (f(posX) * k));
        };

        return {
            init: function (interval) {
                return func;
            }
        };
    },

    'ordinal': (varSet, props) => {
        var d3Domain = d3.scale.ordinal().domain(varSet);
        return {
            init: function(interval) {
                var scale = d3Domain.rangePoints(interval, 1);
                scale.dim = props.dim;
                return scale;
            },

            domain: function() {
                return varSet;
            },

            dim: props.dim,

            source: props.source,

            scaleDim: props.dim,

            scaleType: 'ordinal'
        };
    },

    'linear': (vars, props) => {

        var domain = (props.autoScale) ? utils.autoScale(vars) : d3.extent(vars);

        var min = _.isNumber(props.min) ? props.min : domain[0];
        var max = _.isNumber(props.max) ? props.max : domain[1];

        var varSet = [
            Math.min(min, domain[0]),
            Math.max(max, domain[1])
        ];

        var d3Domain = d3.scale.linear().domain(varSet);

        return {
            init: function(interval) {
                return d3Domain.rangeRound(interval, 1);
            }
        };
    },

    'period': (vars, props) => {

        // extract: ((x) => UnitDomainPeriodGenerator.get(xOptions.period).cast(new Date(x)))

        var domain = d3.extent(vars);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domain[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domain[1] : new Date(props.max).getTime();

        var range = [
            new Date(Math.min(min, domain[0])),
            new Date(Math.max(max, domain[1]))
        ];

        var varSet = UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);

        var d3Domain = d3.scale.ordinal().domain(varSet);

        return {
            init: function(interval) {
                return d3Domain.rangePoints(interval, 1);
            }
        };
    },

    'time': (vars, props) => {

        var domain = d3.extent(vars);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domain[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domain[1] : new Date(props.max).getTime();

        var varSet = [
            new Date(Math.min(min, domain[0])),
            new Date(Math.max(max, domain[1]))
        ];

        var d3Domain = d3.time.scale().domain(varSet);

        return {
            init: function(interval) {
                return d3Domain.range(interval);
            }
        };
    }
};

var map_value = (dimType) => {
    return (dimType === 'date') ?
        ((v) => (new Date(v)).getTime()) :
        ((v) => v);
};

var where = (data, meta, whereFilter) => {

    var predicates = _(whereFilter).map((v, k) => {
        var xMap = map_value(meta[k].type);
        return (row) => xMap(row[k]) === v;
    });

    return _(data).filter((row) => _.every(predicates, ((p) => p(row))));
};

export class ScalesFactory {

    constructor(sources) {
        this.sources = sources;
    }

    create(scaleConfig) {

        var dim = scaleConfig.dim;
        var src = scaleConfig.source;

        var meta = this.sources[src].dims[dim];
        var data = this.sources[src].data;

        var vars = _(data).chain().pluck(dim).uniq(map_value(meta.type)).value();

        return scalesStrategies[scaleConfig.type](vars, scaleConfig);
    }
}