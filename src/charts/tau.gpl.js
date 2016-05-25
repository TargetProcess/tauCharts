import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {CSS_PREFIX} from '../const';
import {FramesAlgebra} from '../algebra';
import {DataFrame} from '../data-frame';
import {default as _} from 'underscore';
import {default as d3} from 'd3';
var cast = (v) => (_.isDate(v) ? v.getTime() : v);

export class GPL extends Emitter {

    constructor(config, scalesRegistryInstance, unitsRegistry) {

        super();

        // jscs:disable
        _.defaults(config.scales, {
            'split_null': {type: 'value', source: '?'},
            'label_null': {type: 'value', source: '?'},
            'split:default': {type: 'value', source: '?'},
            'label:default': {type: 'value', source: '?'}
        });
        // jscs:enable

        this.config = config;

        this.config.settings = this.config.settings || {};
        this.sources = config.sources;

        this.unitSet = unitsRegistry;
        this.scalesHub = scalesRegistryInstance;

        this.scales = config.scales;

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

        this.onUnitDraw = config.onUnitDraw;
        this.onUnitsStructureExpanded = config.onUnitsStructureExpanded || ((x) => (x));
    }

    static destroyNodes (nodes) {
        nodes.forEach((node) => node.destroy());
        return [];
    }

    renderTo(target, xSize) {

        var d3Target = d3.select(target);

        this.config.settings.size = xSize || _.defaults(utilsDom.getContainerSize(d3Target.node()));

        this.root = this._expandUnitsStructure(this.config.unit);

        this.onUnitsStructureExpanded(this.config);

        var xSvg = d3Target.selectAll('svg').data([1]);

        var size = this.config.settings.size;

        var attr = {
            class: (`${CSS_PREFIX}svg`),
            width: size.width,
            height: size.height
        };

        xSvg.attr(attr);

        xSvg.enter()
            .append('svg')
            .attr(attr)
            .append('g')
            .attr('class', `${CSS_PREFIX}cell cell frame-root`);

        this.root.options = {
            container: d3Target.select('.frame-root'),
            frameId: 'root',
            left: 0,
            top: 0,
            width: size.width,
            height: size.height
        };

        this._walkUnitsStructure(
            this.root,
            this._datify({
                source: this.root.expression.source,
                pipe: []
            }));

        Object
            .keys(this.scales)
            .forEach((k) => this.scalesHub.createScaleInfo(this.scales[k]).commit());

        this._drawUnitsStructure(
            this.root,
            this._datify({
                source: this.root.expression.source,
                pipe: []
            }));
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

    _drawUnitsStructure(unitConfig, rootFrame, rootUnit = null) {

        var self = this;

        // Rule to cancel parent frame inheritance
        var passFrame = (unitConfig.expression.inherit === false) ? null : rootFrame;

        var UnitClass = self.unitSet.get(unitConfig.type);
        var unitNode = new UnitClass(unitConfig);
        unitNode.parentUnit = rootUnit;
        unitNode
            .createScales((type, alias, dynamicProps) => {
                var key = (alias || `${type}:default`);
                return self
                    .scalesHub
                    .createScaleInfo(self.scales[key], passFrame)
                    .create(dynamicProps);
            })
            .drawFrames(unitConfig.frames, (function (rootUnit) {
                return function (rootConf, rootFrame) {
                    self._drawUnitsStructure.bind(self)(rootConf, rootFrame, rootUnit);
                };
            }(unitNode)));

        if (self.onUnitDraw) {
            self.onUnitDraw(unitNode);
        }

        return unitConfig;
    }

    _walkUnitsStructure(unitConfig, rootFrame, parentUnit = null) {

        var self = this;

        // Rule to cancel parent frame inheritance
        var passFrame = (unitConfig.expression.inherit === false) ? null : rootFrame;

        var UnitClass = self.unitSet.get(unitConfig.type);
        var unitNode = new UnitClass(_.extend({adjustPhase: true}, unitConfig));
        unitNode.parentUnit = parentUnit;
        unitNode
            .createScales((type, alias, dynamicProps) => {
                var key = (alias || `${type}:default`);
                return self
                    .scalesHub
                    .createScaleInfo(self.scales[key], passFrame)
                    .create(dynamicProps);
            })
            .walkFrames(unitConfig.frames, (function (rootUnit) {
                return function (rootConf, rootFrame) {
                    self._walkUnitsStructure.bind(self)(rootConf, rootFrame, rootUnit);
                };
            }(unitNode)));

        return unitConfig;
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