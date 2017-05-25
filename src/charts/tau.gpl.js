import {Emitter} from '../event';
import * as utils from '../utils/utils';
import {FramesAlgebra} from '../algebra';
import {DataFrame} from '../data-frame';
var cast = (v) => (utils.isDate(v) ? v.getTime() : v);

const MixinModel = function (prev) {
    Object
        .keys(prev)
        .forEach((k) => this[k] = prev[k]);
};

const compose = (prev, updates = {}) => {
    return (Object.assign(new MixinModel(prev), updates));
};

const evalGrammarRules = (grammarRules, initialGrammarModel, grammarRegistry) => {
    return grammarRules
        .map((rule) => {
            return ((typeof(rule) === 'string') ? grammarRegistry.get(rule) : rule);
        })
        .filter(x => x)
        .reduce((prevModel, rule) => compose(prevModel, rule(prevModel, {})), initialGrammarModel);
};

export class GPL extends Emitter {

    constructor(config, scalesRegistryInstance, unitsRegistry, grammarRules) {

        super();

        // jscs:disable
        utils.defaults(config.scales, {
            'size_null': {type: 'size', source: '?'},
            'split_null': {type: 'value', source: '?'},
            'label_null': {type: 'value', source: '?'},
            'color_null': {type: 'color', source: '?'},
            'identity_null': {type: 'identity', source: '?'},
            'size:default': {type: 'size', source: '?'},
            'color:default': {type: 'color', source: '?'},
            'split:default': {type: 'value', source: '?'},
            'label:default': {type: 'value', source: '?'},
            'identity:default': {type: 'identity', source: '?'}
        });
        // jscs:enable

        config.settings = (config.settings || {});

        this.config = config;
        this.sources = config.sources;
        this.scales = config.scales;
        this.unitSet = unitsRegistry;
        this.grammarRules = grammarRules;
        this.scalesHub = scalesRegistryInstance;

        this.transformations = Object.assign(
            config.transformations || {},
            {
                where(data, tuple) {
                    var predicates = Object.keys(tuple || {}).map((k) => {
                        return (row) => (cast(row[k]) === tuple[k]);
                    });
                    return data.filter((row) => {
                        return predicates.every((p) => p(row));
                    });
                }
            });
    }

    static traverseSpec(spec, enter, exit, rootNode = null, rootFrame = null) {

        var queue = [];

        var traverse = (node, enter, exit, parentNode, currFrame) => {

            queue.push(() => {
                enter(node, parentNode, currFrame);
            });

            if (node.frames) {
                node.frames.forEach((frame) => {
                    (frame.units || []).map((subNode) => traverse(subNode, enter, exit, node, frame));
                });
            }

            queue.push(() => exit(node, parentNode, currFrame));
        };

        traverse(spec.unit, enter, exit, rootNode, rootFrame);

        return queue;
    }

    unfoldStructure() {
        this.root = this._expandUnitsStructure(this.config.unit);
        return this.config;
    }

    getDrawScenarioQueue(root) {
        const grammarRules = this.grammarRules;
        var scaleInfoQueue = this._flattenDrawScenario(root, (parentInstance, unit, rootFrame) => {
            // Rule to cancel parent frame inheritance
            const frame = (unit.expression.inherit === false) ? null : rootFrame;
            const scalesFactoryMethod = this._createFrameScalesFactoryMethod(frame);
            const instance = this.unitSet.create(
                unit.type,
                Object.assign(
                    {},
                    (unit),
                    {options: parentInstance.allocateRect(rootFrame.key)}
                ));

            const initialModel = new MixinModel(instance.defineGrammarModel(scalesFactoryMethod));
            const grammarModel = evalGrammarRules(instance.getGrammarRules(), initialModel, grammarRules);
            evalGrammarRules(instance.getAdjustScalesRules(), grammarModel, grammarRules);
            instance.node().screenModel = instance.createScreenModel(grammarModel);

            return instance;
        });

        var createScales = (() => {
            Object
                .keys(this.scales)
                .forEach((k) => this.scalesHub.createScaleInfo(this.scales[k]).commit());
        });

        var updateScalesQueue = this._flattenDrawScenario(root, (parentInstance, unit, rootFrame) => {
            const frame = (unit.expression.inherit === false) ? null : rootFrame;
            const scalesFactoryMethod = this._createFrameScalesFactoryMethod(frame);
            const instance = this.unitSet.create(
                unit.type,
                Object.assign(
                    {},
                    (unit),
                    {options: parentInstance.allocateRect(rootFrame.key)}
                ));

            const initialModel = new MixinModel(instance.defineGrammarModel(scalesFactoryMethod));
            const grammarModel = evalGrammarRules(instance.getGrammarRules(), initialModel, grammarRules);
            instance.node().screenModel = instance.createScreenModel(grammarModel);
            instance.parentUnit = parentInstance;
            instance.addInteraction();

            return instance;
        });

        return scaleInfoQueue
            .concat(createScales)
            .concat(updateScalesQueue);
    }

    _flattenDrawScenario(root, iterator) {

        var uids = {};
        var scenario = [];

        var stack = [root];

        var put = ((x) => stack.unshift(x));
        var pop = (() => stack.shift());
        var top = (() => stack[0]);

        var queue = GPL.traverseSpec(
            {unit: this.root},
            // enter
            (unit, parentUnit, currFrame) => {

                unit.uid = (() => {
                    var uid = utils.generateHash(
                        (parentUnit ? `${parentUnit.uid}/` : '') +
                        JSON.stringify(Object.keys(unit)
                            .filter((key) => typeof unit[key] === 'string')
                            .reduce((memo, key) => (memo[key] = unit[key], memo), {})) +
                        `-${JSON.stringify(currFrame.pipe)}`);
                    if (uid in uids) {
                        uid += `-${++uids[uid]}`;
                    } else {
                        uids[uid] = 0;
                    }
                    return uid;
                })();
                unit.guide = utils.clone(unit.guide);

                var instance = iterator(top(), unit, currFrame);

                scenario.push(instance);

                if (unit.type.indexOf('COORDS.') === 0) {
                    put(instance);
                }
            },
            // exit
            (unit) => {
                if (unit.type.indexOf('COORDS.') === 0) {
                    pop();
                }
            },
            null,
            this._datify({
                source: this.root.expression.source,
                pipe: []
            }));

        queue.push(() => scenario);

        return queue;
    }

    _expandUnitsStructure(root, parentPipe = []) {

        var self = this;

        if (root.expression.operator === false) {

            root.frames = root.frames.map((f) => self._datify(f));

        } else {

            var expr = this._parseExpression(root.expression, parentPipe, root.guide);

            root.transformation = root.transformation || [];

            root.frames = expr.exec().map((tuple) => {

                var flow = (expr.inherit ? parentPipe : []);
                var pipe = (flow)
                    .concat([{type: 'where', args: tuple}])
                    .concat(root.transformation);

                return self._datify({
                    key: tuple,
                    pipe: pipe,
                    source: expr.source,
                    units: (root.units) ?
                        root.units.map((unit) => {
                            var clone = utils.clone(unit);
                            // pass guide by reference
                            clone.guide = unit.guide;
                            return clone;
                        }) :
                        []
                });
            });
        }

        root.frames.forEach(
            (f) => (f.units.forEach(
                (unit) => this._expandUnitsStructure(unit, f.pipe)
            ))
        );

        return root;
    }

    _createFrameScalesFactoryMethod(passFrame) {
        var self = this;
        return ((type, alias, dynamicProps) => {
            var key = (alias || `${type}:default`);
            return self
                .scalesHub
                .createScaleInfo(self.scales[key], passFrame)
                .create(dynamicProps);
        });
    }

    _datify(frame) {
        return new DataFrame(frame, this.sources[frame.source].data, this.transformations);
    }

    _parseExpression(expr, parentPipe, guide) {

        var funcName = expr.operator || 'none';
        var srcAlias = expr.source;
        var bInherit = expr.inherit !== false; // true by default
        var funcArgs = expr.params;

        var frameConfig = {
            source: srcAlias,
            pipe: bInherit ? parentPipe : []
        };

        var dataFn = () => this._datify(frameConfig).part();

        var func = FramesAlgebra[funcName];

        if (!func) {
            throw new Error(`${funcName} operator is not supported`);
        }

        return {
            source: srcAlias,
            inherit: bInherit,
            func: func,
            args: funcArgs,
            exec: () => func(dataFn, ...(funcArgs || []), guide)
        };
    }
}