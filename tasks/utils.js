/**
 * Created by krivlenia on 9/30/2014.
 */
/* jshint node:true, undef:true, unused:true */

var recast = require('recast');
var esprima = require('esprima');

var proto = '__proto__';

var template = [
    '(function(definition){',
    'if (typeof define === "function" && define.amd) {',
    'define(definition);',
    '} else if (typeof module === "object" && module.exports) {',
    'module.exports = definition();',
    '} else {',
    'this.tauChart = definition();',
    '}',
    '})(function(){ return tau$newCharts$$tauChart;})'
].join('');
function memo(object, property, getter) {
    Object.defineProperty(object, property, {
        get: function () {
            this[property] = getter.call(this);
            return this[property];
        },

        set: function (value) {
            Object.defineProperty(this, property, {
                value: value,
                configurable: true,
                writable: true
            });
        }
    });
}
exports.memo = memo;

function startsWith(string, substring) {
    return string.lastIndexOf(substring, 0) === 0;
}
exports.startsWith = startsWith;

function endsWith(string, substring) {
    var expected = string.length - substring.length;
    return string.indexOf(substring, expected) === expected;
}
exports.endsWith = endsWith;

function extend(subclass, superclass) {
    subclass[proto] = superclass;
    subclass.prototype = Object.create(superclass.prototype);
    subclass.prototype.constructor = subclass;
}
exports.extend = extend;

function sourcePosition(mod, node) {
    var loc = node && node.loc;
    if (loc) {
        return mod.relativePath + ':' + loc.start.line + ':' + (loc.start.column + 1);
    } else {
        return mod.relativePath;
    }
}
exports.sourcePosition = sourcePosition;

function IFFE() {
    if (!IFFE.AST) {
        IFFE.AST = JSON.stringify(
            recast.parse(template, { esprima: esprima })
        );
    }


    var result = JSON.parse(IFFE.AST);
    var expression = result.program.body[0].expression.arguments[0];
    var body = expression.body.body;

    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (arg) {
        if (Object.prototype.toString.call(arg) === '[object Array]') {
            body.unshift.apply(body, arg);
        } else {
            body.unshift(arg);
        }
    });

    return result.program.body[0].expression;
}
exports.IFFE = IFFE;
