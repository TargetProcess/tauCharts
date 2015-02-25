import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {utils} from './utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

var scalesStrategies = {

    color: (vars, props) => {

        var varSet = vars;

        var brewer = props.brewer;

        var defaultColorClass = _.constant('color-default');

        var defaultRangeColor = _.times(20, (i) => 'color20-' + (1 + i));

        var buildArrayGetClass = (domain, brewer) => {
            if (domain.length === 0 || (domain.length === 1 && domain[0] === null)) {
                return defaultColorClass;
            } else {
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
        } else if (_.isArray(brewer)) {
            func = wrapString(buildArrayGetClass(varSet, brewer));
        } else if (_.isFunction(brewer)) {
            func = (d) => brewer(d, wrapString(buildArrayGetClass(varSet, defaultRangeColor)));
        } else if (_.isObject(brewer)) {
            func = buildObjectGetClass(brewer, defaultColorClass);
        } else {
            throw new Error('This brewer is not supported');
        }

        func.dim = props.dim;
        func.domain = () => varSet;
        func.source = props.source;
        func.scaleDim = props.dim;
        func.scaleType = 'color';

        return func;
    },

    size: (varSet, props) => {

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

        func.dim = props.dim;
        func.domain = () => varSet;
        func.source = props.source;
        func.scaleDim = props.dim;
        func.scaleType = 'size';

        return func;
    },

    ordinal: (varSet, props, interval) => {

        var d3Domain = d3.scale.ordinal().domain(varSet);

        var scale = d3Domain.rangePoints(interval, 1);
        scale.dim = props.dim;
        scale.domain = () => varSet;
        scale.source = props.source;
        scale.scaleDim = props.dim;
        scale.scaleType = 'ordinal';
        scale.getHash = () => btoa(JSON.stringify(varSet) + JSON.stringify(interval)).replace(/=/g, '_');
        return scale;
    },

    linear: (vars, props, interval) => {

        var domain = (props.autoScale) ? utils.autoScale(vars) : d3.extent(vars);

        var min = _.isNumber(props.min) ? props.min : domain[0];
        var max = _.isNumber(props.max) ? props.max : domain[1];

        var varSet = [
            Math.min(min, domain[0]),
            Math.max(max, domain[1])
        ];

        var d3Domain = d3.scale.linear().domain(varSet);

        var d3Scale = d3Domain.rangeRound(interval, 1);
        var scale = (int) => {
            var x = int;
            if (x > max) {
                x = max;
            }
            if (x < min) {
                x = min;
            }
            return d3Scale(x);
        };

        // have to copy properties since d3 produce Function with methods
        Object.keys(d3Scale).forEach((p) => (scale[p] = d3Scale[p]));

        scale.dim = props.dim;
        scale.domain = () => varSet;
        scale.source = props.source;
        scale.scaleDim = props.dim;
        scale.scaleType = 'linear';
        scale.getHash = () => btoa(JSON.stringify(varSet) + JSON.stringify(interval)).replace(/=/g, '_');

        return scale;
    },

    period: (vars, props, interval) => {

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

        var scale = d3Domain.rangePoints(interval, 1);
        scale.dim = props.dim;
        scale.domain = () => varSet;
        scale.source = props.source;
        scale.scaleDim = props.dim;
        scale.scaleType = 'period';

        return scale;
    },

    time: (vars, props, interval) => {

        var domain = d3.extent(vars);
        var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domain[0] : new Date(props.min).getTime();
        var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domain[1] : new Date(props.max).getTime();

        var varSet = [
            new Date(Math.min(min, domain[0])),
            new Date(Math.max(max, domain[1]))
        ];

        var d3Domain = d3.time.scale().domain(varSet);

        var scale = d3Domain.range(interval);
        scale.dim = props.dim;
        scale.domain = () => varSet;
        scale.source = props.source;
        scale.scaleDim = props.dim;
        scale.scaleType = 'time';

        return scale;
    },

    value: (vars, props, interval) => {
        var scale = (x) => x;
        scale.dim = props.dim;
        scale.domain = () => vars;
        scale.source = props.source;
        scale.scaleDim = props.dim;
        scale.scaleType = 'value';

        return scale;
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

    create(scaleConfig, frame, interval) {

        var dim = scaleConfig.dim;
        var src = scaleConfig.source;

        var type = (this.sources[src].dims[dim] || {}).type;
        var data = scaleConfig.fitToFrame ? frame.take() : this.sources[scaleConfig.source].data;

        var vars = _(data).chain().pluck(dim).uniq(map_value(type)).value();

        return scalesStrategies[scaleConfig.type](vars, scaleConfig, interval);
    }
}