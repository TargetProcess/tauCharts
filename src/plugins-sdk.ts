import {FormatterRegistry} from './formatter-registry';
import {Unit} from './plugins-sdk/unit';
import {Spec} from './plugins-sdk/spec';
import {
    GPLSpec,
    Unit as SpecUnit,
    ScaleGuide,
    AxisLabelGuide,
} from './definitions';

export interface DimInfo {
    label: string;
    format: (x, nullAlias?) => string;
    nullAlias: string;
    tickLabel: string;
    isComplexField?: boolean;
    parentField?: string;
}

export interface DimMap {
    [dim: string]: DimInfo;
}

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

        var frames = node.hasOwnProperty('frames') ? node.frames : [{units:node.units}];
        for (var f = 0; f < frames.length; f++) {
            var children = frames[f].units || [];
            for (var i = 0; i < children.length; i++) {
                var found = PluginsSDK.depthFirstSearch(children[i], predicate);
                if (found) {
                    return found;
                }
            }
        }
    }

    static traverseSpec(spec: GPLSpec, iterator: (node: SpecUnit, parent: SpecUnit) => void) {

        const traverse = (
            node: SpecUnit,
            fnIterator: (node: SpecUnit, parent: SpecUnit) => void,
            parentNode: SpecUnit
        ) => {
            fnIterator(node, parentNode);
            (node.units || []).map((x) => traverse(x, fnIterator, node));
        };

        traverse(spec.unit, iterator, null);
    }

    static extractFieldsFormatInfo(spec: GPLSpec) {

        var specScales = spec.scales;

        var isEmptyScale = function (key: string) {
            return !specScales[key].dim;
        };

        interface RawDimInfo {
            label: string[];
            format: string[];
            nullAlias: string[];
            tickLabel: string[];
        }

        interface RawDimMap {
            [dim: string]: RawDimInfo;
        }

        var fillSlot = function (memoRef: RawDimMap, config: SpecUnit, key: string) {
            var GUIDE = config.guide || {};
            var scale = specScales[config[key]];
            var guide: ScaleGuide = GUIDE[key] || {};
            memoRef[scale.dim] = memoRef[scale.dim] || {label: [], format: [], nullAlias:[], tickLabel:[]};

            var label = guide.label;
            var guideLabel = (guide.label || {}) as AxisLabelGuide;
            memoRef[scale.dim].label.push((typeof label === 'string') ?
                    (label) :
                    (guideLabel._original_text || guideLabel.text)
            );

            var format = guide.tickFormat || guide.tickPeriod;
            memoRef[scale.dim].format.push(format);

            memoRef[scale.dim].nullAlias.push(guide.tickFormatNullAlias);

            // TODO: workaround for #complex-objects
            memoRef[scale.dim].tickLabel.push(guide.tickLabel);
        };

        var configs: SpecUnit[] = [];
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

            if (config.hasOwnProperty('label') && !isEmptyScale(config.label)) {
                fillSlot(memo, config, 'label');
            }

            return memo;

        }, {} as RawDimMap);

        var choiceRule = function (arr: string[], defaultValue: string) {
            return arr.filter((x) => x)[0] || defaultValue;
        };

        return Object
            .keys(summary)
            .reduce(function (memo, k) {
                memo[k] = {} as DimInfo;
                memo[k].label = choiceRule(summary[k].label, k);
                const chosenFormat = choiceRule(summary[k].format, null);
                memo[k].nullAlias = choiceRule(summary[k].nullAlias, (`No ${memo[k].label}`));
                memo[k].tickLabel = choiceRule(summary[k].tickLabel, null);

                // very special case for dates
                const format = (chosenFormat === 'x-time-auto') ?
                    (spec.settings.utcTime ? 'day-utc' : 'day') :
                    chosenFormat;
                var nonVal = memo[k].nullAlias;
                var fnForm = format ?
                    (FormatterRegistry.get(format, nonVal)) :
                    ((raw) => (raw === null) ? nonVal : String(raw));

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
            }, {} as DimMap);
    }

    static tokens() {
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

    static getParentUnit(spec, unit) {

        var parent = null;

        const traverse = (node, parentNode) => {

            if (node.uid === unit.uid) {
                parent = parentNode;
                return true;
            }

            if (node.frames) {
                node.frames.some((frame) => {
                    return (frame.units || []).some((x) => traverse(x, node));
                });
            } else {
                (node.units || []).some((x) => traverse(x, node));
            }

            return false;
        };

        traverse(spec.unit, null);

        return parent;
    }
}

export {PluginsSDK};
