/* jshint ignore:start */
import * as d3 from 'd3';
/* jshint ignore:end */
var FORMATS_MAP = {

    "x-num-auto": function (x) {
        var v = parseFloat(x.toFixed(2));
        return (Math.abs(v) < 1) ? v.toString() : d3.format("s")(v);
    },

    percent: function (x) {
        var v = parseFloat((x * 100).toFixed(2));
        return v.toString() + '%';
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

    'x-time-auto': null
};

/* jshint ignore:start */
FORMATS_MAP['x-time-ms']        = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-sec']       = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-min']       = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-hour']      = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-day']       = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-week']      = FORMATS_MAP['x-time-auto'];
FORMATS_MAP['x-time-month']     = FORMATS_MAP['month'];
FORMATS_MAP['x-time-quarter']   = FORMATS_MAP['quarter'];
FORMATS_MAP['x-time-year']      = FORMATS_MAP['year'];
/* jshint ignore:end */

var identity = ((x) => (((x === null) || (typeof x === 'undefined')) ? '' : x).toString());

var FormatterRegistry = {

    get: (formatAlias) => {

        var hasFormat = FORMATS_MAP.hasOwnProperty(formatAlias);
        var formatter = hasFormat ? FORMATS_MAP[formatAlias] : identity;

        if (hasFormat) {
            formatter = FORMATS_MAP[formatAlias];
        }

        if (!hasFormat && formatAlias) {
            formatter = (v) => {
                var f = _.isDate(v) ? d3.time.format(formatAlias) : d3.format(formatAlias);
                return f(v);
            };
        }

        if (!hasFormat && !formatAlias) {
            formatter = identity;
        }

        return formatter;
    },

    add: (formatAlias, formatter) => {
        FORMATS_MAP[formatAlias] = formatter;
    }
};

export {FormatterRegistry};