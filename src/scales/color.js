import {BaseScale} from './base';
import {utils} from '../utils/utils';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class ColorScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        var discrete = (scaleConfig.dimType !== 'measure');

        var scaleBrewer = (this.scaleConfig.brewer
        ||
        (discrete ?
            (_.times(20, (i) => 'color20-' + (1 + i))) :
            (['#eee', '#000'])));

        var props = this.scaleConfig;

        if (!discrete) {
            var vars = d3.extent(this.vars);

            var isNum = ((num) => (!isNaN(num) && (_.isNumber(num) || _.isDate(num))));
            var min = isNum(props.min) ? props.min : vars[0];
            var max = isNum(props.max) ? props.max : vars[1];

            var mins = [min, vars[0]].filter(isNum);
            var maxs = [max, vars[1]].filter(isNum);
            vars = [
                mins.sort((a, b) => a - b)[0],
                maxs.sort((a, b) => b - a)[0]
            ];

            if (props.nice) {

                if ((vars[0] < 0) && (vars[1] > 0)) {
                    // symmetry
                    let maxPart = Math.max(...vars.map(Math.abs));
                    vars = [-maxPart, maxPart];
                }
            }

            this.vars = vars;
        }

        this.addField('scaleType', 'color')
            .addField('discrete', discrete)
            .addField('brewer', scaleBrewer)
            .addField('toColor', utils.extRGBColor)
            .addField('toClass', utils.extCSSClass);
    }

    create() {

        var discrete = this.discrete;

        var varSet = this.vars;
        var brewer = this.getField('brewer');

        var func = discrete ?
            this.createDiscreteScale(varSet, brewer) :
            this.createContinuesScale(varSet, brewer);

        return this.toBaseScale(func);
    }

    createDiscreteScale(varSet, brewer) {

        var defaultColorClass = _.constant('color-default');

        var buildArrayGetClass = (domain, brewer) => {
            var fullDomain = domain.map((x) => String(x).toString());
            return d3.scale.ordinal().range(brewer).domain(fullDomain);
        };

        var buildObjectGetClass = (brewer, defaultGetClass) => {
            var domain = _.keys(brewer);
            var range = _.values(brewer);
            var calculateClass = d3.scale.ordinal().range(range).domain(domain);
            return (d) => brewer.hasOwnProperty(d) ? calculateClass(d) : defaultGetClass(d);
        };

        var wrapString = (f) => ((d) => f(String(d).toString()));

        var func;

        if (_.isArray(brewer)) {

            func = wrapString(buildArrayGetClass(varSet, brewer));

        } else if (_.isFunction(brewer)) {

            func = (d) => brewer(d, wrapString(buildArrayGetClass(varSet, _.times(20, (i) => 'color20-' + (1 + i)))));

        } else if (_.isObject(brewer)) {

            func = buildObjectGetClass(brewer, defaultColorClass);

        } else {

            throw new Error('This brewer is not supported');

        }

        return func;
    }

    createContinuesScale(varSet, brewer) {

        var func;

        if (_.isArray(brewer)) {

            func = d3.scale
                .linear()
                .domain(utils.splitEvenly(varSet.map(x => x - 0), brewer.length))
                .range(brewer);

        } else {

            throw new Error('This brewer is not supported');

        }

        return func;
    }
}