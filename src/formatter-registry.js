/* jshint ignore:start */
import * as d3 from 'd3';
/* jshint ignore:end */
var FORMATS_MAP = {

    'x-num-auto': (x) => {
        return (Math.abs(x) < 1) ? x.toString() : d3.format('s')(x);
    },

    'day': d3.time.format('%d-%b-%Y'),

    'week': d3.time.format('%d-%b-%Y'),

    'week-range': (x) => {
        var sWeek = new Date(x);
        var clone = new Date(x);
        var eWeek = new Date(clone.setDate(clone.getDate() + 7));
        var format = d3.time.format('%d-%b-%Y');
        return format(sWeek) + ' - ' + format(eWeek);
    },

    'month': (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var formatSpec = (m === 0) ? '%B, %Y' : '%B';
        return d3.time.format(formatSpec)(x);
    },

    'month-year': d3.time.format('%B, %Y'),

    'quarter': (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var q = (m - (m % 3)) / 3;
        return 'Q' + (q + 1) + ' ' + d.getFullYear();
    },

    'year': d3.time.format('%Y'),

    'x-time-auto': d3.time.format.multi([
        [".%L", function(d) { return d.getMilliseconds(); }],
        [":%S", function(d) { return d.getSeconds(); }],
        ["%I:%M", function(d) { return d.getMinutes(); }],
        ["%I %p", function(d) { return d.getHours(); }],
        ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
        ["%b %d", function(d) { return d.getDate() != 1; }],
        ["%B", function(d) { return d.getMonth(); }],
        ["%Y", function() { return true; }]
    ])
};

/* jshint ignore:start */
FORMATS_MAP['x-time-ms'] = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-sec'] = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-min'] = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-hour'] = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-day'] = FORMATS_MAP['day'];
FORMATS_MAP['x-time-week'] = FORMATS_MAP['week'];
FORMATS_MAP['x-time-month'] = FORMATS_MAP['month'];
FORMATS_MAP['x-time-quarter'] = FORMATS_MAP['quarter'];
FORMATS_MAP['x-time-year'] = FORMATS_MAP['year'];
/* jshint ignore:end */

var FormatterRegistry = {

    get: (formatAlias) => {

        var formatter = (formatAlias === null) ? ((x) => x.toString()) : FORMATS_MAP[formatAlias];
        if (!formatter) {
            formatter = (v) => {
                var f = _.isDate(v) ? d3.time.format(formatAlias) : d3.format(formatAlias);
                return f(v);
            };
        }
        return formatter;
    },

    add: (formatAlias, formatter) => {
        FORMATS_MAP[formatAlias] = formatter;
    }
};

export {FormatterRegistry};