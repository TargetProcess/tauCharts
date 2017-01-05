import {utils} from './utils/utils';
import d3 from 'd3';

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

var FORMATS_MAP = {

    'x-num-auto': function (x) {
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

    day: d3.time.format('%d-%b-%Y'),

    'day-short': d3.time.format('%d-%b'),

    week: d3.time.format('%d-%b-%Y'),

    'week-short': d3.time.format('%d-%b'),

    month: (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var formatSpec = (m === 0) ? '%B, %Y' : '%B';
        return d3.time.format(formatSpec)(x);
    },

    'month-short': (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var formatSpec = (m === 0) ? '%b \'%y' : '%b';
        return d3.time.format(formatSpec)(x);
    },

    'month-year': d3.time.format('%B, %Y'),

    quarter: (x) => {
        var d = new Date(x);
        var m = d.getMonth();
        var q = (m - (m % 3)) / 3;
        return 'Q' + (q + 1) + ' ' + d.getFullYear();
    },

    year: d3.time.format('%Y'),

    'x-time-auto': null
};

var FormatterRegistry = {

    get: (formatAlias, nullOrUndefinedAlias) => {

        var nullAlias = nullOrUndefinedAlias || '';

        var identity = ((x) => (((x === null) || (typeof x === 'undefined')) ? nullAlias : x).toString());

        var hasFormat = FORMATS_MAP.hasOwnProperty(formatAlias);
        var formatter = hasFormat ? FORMATS_MAP[formatAlias] : identity;

        if (hasFormat) {
            formatter = FORMATS_MAP[formatAlias];
        }

        if (!hasFormat && formatAlias) {
            formatter = (v) => {
                var f = utils.isDate(v) ? d3.time.format(formatAlias) : d3.format(formatAlias);
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