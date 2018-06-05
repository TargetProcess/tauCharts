import * as utils from './utils/utils';
import * as d3Fromat from 'd3-format';
import * as d3TimeFromat from 'd3-time-format';
const d3 = {
    ...d3Fromat,
    ...d3TimeFromat,
};

const d3Fromat4S = d3.format('.4s');
const d3Fromat2R = d3.format('.2r');
const d3Fromat1E = d3.format('.1e');
const removeRedundantZeros = (() => {
    const zerosAfterDot = /\.0+([^\d].*)?$/;
    const zerosAfterNotZero = /(\.\d+?)0+([^\d].*)?$/;
    return (str) => str
        .replace(zerosAfterDot, '$1')
        .replace(zerosAfterNotZero, '$1$2');
})();

var FORMATS_MAP: {[format: string]: (x: any, nullAlias: string) => string} = {
    '_identity': (x, nullAlias) => String(((x === null) || (typeof x === 'undefined')) ? nullAlias : x),
    'x-num-auto': function (x) {
        if (isNaN(x)) {
            return 'NaN';
        }
        var abs = Math.abs(x);
        var result = removeRedundantZeros(
            (abs < 1) ?
                (abs === 0) ?
                    '0' :
                    (abs < 1e-6) ?
                        d3Fromat1E(x) :
                        d3Fromat2R(x) :
                d3Fromat4S(x)
        );
        return result;
    },

    percent: function (x) {
        var v = parseFloat((x * 100).toFixed(2));
        return v.toString() + '%';
    },

    day: d3.timeFormat('%d-%b-%Y'),
    'day-utc': d3.utcFormat('%d-%b-%Y'),

    'day-short': d3.timeFormat('%d-%b'),
    'day-short-utc': d3.utcFormat('%d-%b'),

    week: d3.timeFormat('%d-%b-%Y'),
    'week-utc': d3.utcFormat('%d-%b-%Y'),

    'week-short': d3.timeFormat('%d-%b'),
    'week-short-utc': d3.utcFormat('%d-%b'),

    month: (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var formatSpec = (m === 0) ? '%B, %Y' : '%B';
        return d3.timeFormat(formatSpec)(x);
    },
    'month-utc': (x) => {
        var d = new Date(x);
        var m = d.getUTCMonth();
        var formatSpec = (m === 0) ? '%B, %Y' : '%B';
        return d3.utcFormat(formatSpec)(x);
    },

    'month-short': (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var formatSpec = (m === 0) ? '%b \'%y' : '%b';
        return d3.timeFormat(formatSpec)(x);
    },
    'month-short-utc': (x) => {
        var d = new Date(x);
        var m = d.getUTCMonth();
        var formatSpec = (m === 0) ? '%b \'%y' : '%b';
        return d3.utcFormat(formatSpec)(x);
    },

    'month-year': d3.timeFormat('%B, %Y'),
    'month-year-utc': d3.utcFormat('%B, %Y'),

    quarter: (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var q = (m - (m % 3)) / 3;
        return 'Q' + (q + 1) + ' ' + d.getFullYear();
    },
    'quarter-utc': (x) => {
        var d = new Date(x);
        var m = d.getUTCMonth();
        var q = (m - (m % 3)) / 3;
        return 'Q' + (q + 1) + ' ' + d.getUTCFullYear();
    },

    year: d3.timeFormat('%Y'),
    'year-utc': d3.utcFormat('%Y'),

    'x-time-auto': null
};

var FormatterRegistry = {

    get: (formatAlias: string, nullOrUndefinedAlias?: string) => {
        var identity = FORMATS_MAP['_identity'];

        var hasFormat = FORMATS_MAP.hasOwnProperty(formatAlias);
        var formatter = hasFormat ? FORMATS_MAP[formatAlias] : identity;

        if (hasFormat) {
            formatter = FORMATS_MAP[formatAlias];
        }

        if (!hasFormat && formatAlias) {
            formatter = (v) => {
                var f: ((x) => string) = utils.isDate(v) ? d3.timeFormat(formatAlias) : d3.format(formatAlias);
                return f(v);
            };
        }

        if (!hasFormat && !formatAlias) {
            formatter = identity;
        }

        return formatter !== null ? (x) => formatter(x, nullOrUndefinedAlias || '') : null;
    },

    add: (formatAlias: string, formatter: (x) => string) => {
        FORMATS_MAP[formatAlias] = formatter;
    }
};

export {FormatterRegistry};
