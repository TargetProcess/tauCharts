import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {FramesAlgebra} from '../algebra';
import {DataFrame} from '../data-frame';
import {default as _} from 'underscore';
var cast = (v) => (_.isDate(v) ? v.getTime() : v);

export class GPL extends Emitter {

    constructor(config, scalesRegistryInstance, unitsRegistry) {

        super();

        // jscs:disable
        _.defaults(config.scales, {
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
        this.scalesHub = scalesRegistryInstance;

        this.transformations = _.extend(
            config.transformations || {},
            {
                where(data, tuple) {
                    var predicates = _.map(tuple, (v, k) => {
                        return (row) => (cast(row[k]) === v);
                    });
                    return _(data).filter((row) => {
                        return _.every(predicates, (p) => p(row));
                    });
                }
            });
    }

    static traverseSpec(spec, enter, exit, rootNode = null, rootFrame = null) {

        var traverse = (node, enter, exit, parentNode, currFrame) => {

            enter(node, parentNode, currFrame);

            if (node.frames) {
                node.frames.forEach((frame) => {
                    (frame.units || []).map((subNode) => traverse(subNode, enter, exit, node, frame));
                });
            }

            exit(node, parentNode, currFrame);
        };

        traverse(spec.unit, enter, exit, rootNode, rootFrame);
    }

    unfoldStructure() {
        this.root = this._expandUnitsStructure(this.config.unit);
        return this.config;
    }

    getDrawScenario(root) {
        this._flattenDrawScenario(root, (parentInstance, unit, rootFrame) => {
            // Rule to cancel parent frame inheritance
            var frame = (unit.expression.inherit === false) ? null : rootFrame;
            var instance = this.unitSet.create(
                unit.type,
                _.extend(
                    {adjustPhase: true},
                    {fnCreateScale: this._createFrameScalesFactoryMethod(frame)},
                    (unit),
                    {options: parentInstance.allocateRect(rootFrame.key)}
                ));

            instance.init();
            return instance;
        });

        Object
            .keys(this.scales)
            .forEach((k) => this.scalesHub.createScaleInfo(this.scales[k]).commit());

        return this._flattenDrawScenario(root, (parentInstance, unit, rootFrame) => {
            var frame = (unit.expression.inherit === false) ? null : rootFrame;
            var instance = this.unitSet.create(
                unit.type,
                _.extend(
                    {fnCreateScale: this._createFrameScalesFactoryMethod(frame)},
                    (unit),
                    {options: parentInstance.allocateRect(rootFrame.key)}
                ));

            instance.init();
            instance.parentUnit = parentInstance;
            return instance;
        });
    }

    _flattenDrawScenario(root, iterator) {

        var uid = 0;
        var scenario = [];

        var stack = [root];

        var put = ((x) => stack.unshift(x));
        var pop = (() => stack.shift());
        var top = (() => stack[0]);

        GPL.traverseSpec(
            {unit: this.root},
            // enter
            (unit, parentUnit, currFrame) => {

                unit.uid = ++uid;
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

        return scenario;
    }

    _expandUnitsStructure(root, parentPipe = []) {

        var self = this;

        if (root.expression.operator === false) {

            root.frames = root.frames.map((f) => self._datify(f));

        } else {

            var expr = this._parseExpression(root.expression, parentPipe);

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

    _parseExpression(expr, parentPipe) {

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
            exec: () => func.apply(null, [dataFn].concat(funcArgs))
        };
    }
}