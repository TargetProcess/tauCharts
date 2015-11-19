import {default as _} from 'underscore';
import {FormatterRegistry} from './formatter-registry';
import {Unit} from './plugins-sdk/unit';
import {Spec} from './plugins-sdk/spec';

var customTokens = {};

class PluginsSDK {

    static unit(unitRef) {
        return new Unit(unitRef);
    }

    static spec(specRef) {
        return new Spec(specRef);
    }

    static cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static depthFirstSearch(node, predicate) {
        if (predicate(node)) {
            return node;
        }
        var i, children = node.units || [], child, found;
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            found = PluginsSDK.depthFirstSearch(child, predicate);
            if (found) {
                return found;
            }
        }
    }

    static traverseSpec(spec, iterator) {

        var traverse = (node, fnIterator, parentNode) => {
            fnIterator(node, parentNode);
            (node.units || []).map((x) => traverse(x, fnIterator, node));
        };

        traverse(spec.unit, iterator, null);
    }

    static extractFieldsFormatInfo(spec) {

        var specScales = spec.scales;

        var isEmptyScale = function (key) {
            return !specScales[key].dim;
        };

        var fillSlot = function (memoRef, config, key) {
            var GUIDE = config.guide || {};
            var scale = specScales[config[key]];
            var guide = GUIDE[key] || {};
            memoRef[scale.dim] = memoRef[scale.dim] || {label: [], format: [], nullAlias:[], tickLabel:[]};

            var label = guide.label;
            var guideLabel = (guide.label || {});
            memoRef[scale.dim].label.push(_.isString(label) ?
                    (label) :
                    (guideLabel._original_text || guideLabel.text)
            );

            var format = guide.tickFormat || guide.tickPeriod;
            memoRef[scale.dim].format.push(format);

            memoRef[scale.dim].nullAlias.push(guide.tickFormatNullAlias);

            // TODO: workaround for #complex-objects
            memoRef[scale.dim].tickLabel.push(guide.tickLabel);
        };

        var configs = [];
        PluginsSDK.traverseSpec(spec, function (node) {
            configs.push(node);
        });

        var summary = configs.reduce(function (memo, config) {

            if (config.type === 'COORDS.RECT' && config.hasOwnProperty('x') && !isEmptyScale(config.x)) {
                fillSlot(memo, config, 'x');
            }

            if (config.type === 'COORDS.RECT' && config.hasOwnProperty('y') && !isEmptyScale(config.y)) {
                fillSlot(memo, config, 'y');
            }

            if (config.hasOwnProperty('color') && !isEmptyScale(config.color)) {
                fillSlot(memo, config, 'color');
            }

            if (config.hasOwnProperty('size') && !isEmptyScale(config.size)) {
                fillSlot(memo, config, 'size');
            }

            return memo;

        }, {});

        var choiceRule = function (arr, defaultValue) {

            var val = _(arr)
                .chain()
                .filter(_.identity)
                .uniq()
                .first()
                .value();

            return val || defaultValue;
        };

        return Object
            .keys(summary)
            .reduce(function (memo, k) {
                memo[k].label = choiceRule(memo[k].label, k);
                memo[k].format = choiceRule(memo[k].format, null);
                memo[k].nullAlias = choiceRule(memo[k].nullAlias, ('No ' + memo[k].label));
                memo[k].tickLabel = choiceRule(memo[k].tickLabel, null);

                // very special case for dates
                var format = (memo[k].format === 'x-time-auto') ? 'day' : memo[k].format;
                var nonVal = memo[k].nullAlias;
                var fnForm = format ?
                    (FormatterRegistry.get(format, nonVal)) :
                    (function (raw) {
                        return (raw === null) ? nonVal : raw;
                    });

                memo[k].format = fnForm;

                // TODO: workaround for #complex-objects
                if (memo[k].tickLabel) {
                    var kc = k.replace(('.' + memo[k].tickLabel), '');
                    memo[kc] = {
                        label: memo[k].label,
                        nullAlias: memo[k].nullAlias,
                        tickLabel: memo[k].tickLabel,
                        format: function (obj) {
                            return fnForm(obj && obj[memo[kc].tickLabel]);
                        },
                        isComplexField: true
                    };

                    memo[k].parentField = kc;
                }

                return memo;
            }, summary);
    }

    static tokens () {
        return {
            reg: function (key, val) {
                customTokens[key] = val;
                return this;
            },

            get: function (key) {
                return customTokens[key] || key;
            }
        };
    }
}

export {PluginsSDK};