import {BaseScale} from './base';
/* jshint ignore:start */
import {default as _} from 'underscore';
import {default as d3} from 'd3';
/* jshint ignore:end */

export class ColorScale extends BaseScale {

    constructor(xSource, scaleConfig) {

        super(xSource, scaleConfig);

        this.defaultColorClass = _.constant('color-default');
        var scaleBrewer = this.scaleConfig.brewer || _.times(20, (i) => 'color20-' + (1 + i));

        this.addField('scaleType', 'color')
            .addField('brewer', scaleBrewer);
    }

    create() {

        var varSet = this.vars;

        var brewer = this.getField('brewer');

        var buildArrayGetClass = (domain, brewer) => {
            if (domain.length === 0 || (domain.length === 1 && domain[0] === null)) {
                return this.defaultColorClass;
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

        var wrapString = (f) => ((d) => f(String(d).toString()));

        var func;

        if (_.isArray(brewer)) {

            func = wrapString(buildArrayGetClass(varSet, brewer));

        } else if (_.isFunction(brewer)) {

            func = (d) => brewer(d, wrapString(buildArrayGetClass(varSet, _.times(20, (i) => 'color20-' + (1 + i)))));

        } else if (_.isObject(brewer)) {

            func = buildObjectGetClass(brewer, this.defaultColorClass);

        } else {

            throw new Error('This brewer is not supported');

        }

        return this.toBaseScale(func);
    }
}