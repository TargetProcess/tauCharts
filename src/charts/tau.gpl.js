import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {unitsRegistry} from '../units-registry';
import {ScalesFactory} from '../scales-factory';
import {CSS_PREFIX} from '../const';
import {FramesAlgebra} from '../algebra';

var cast = (v) => (_.isDate(v) ? v.getTime() : v);

export class GPL extends Emitter {

    constructor(config) {

        super();

        this.config = config;

        this.config.settings = this.config.settings || {};

        this.unitSet = config.unitsRegistry || unitsRegistry;

        this.sources = config.sources;

        this.scalesCreator = new ScalesFactory(config.sources);

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

    renderTo(target, xSize) {

        var d3Target = d3.select(target);

        this.config.settings.size = xSize || _.defaults(utilsDom.getContainerSize(d3Target.node()));

        this.root = this._expandUnitsStructure(this.config.unit);

        this._adaptSpecToUnitsStructure(this.root, this.config);

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

        this._drawUnitsStructure(
            this.root,
            this._datify({
                source: this.root.expression.source,
                pipe: []
            }));
    }

    _expandUnitsStructure(root, parentPipe = []) {

        var self = this;

        if (root.expression.operator !== false) {

            var expr = this._parseExpression(root.expression, parentPipe);

            root.transformation = root.transformation || [];

            root.frames = expr.exec().map((tuple) => {

                var flow = (expr.inherit ? parentPipe : []);
                var pipe = (flow)
                    .concat([{type: 'where', args: tuple}])
                    .concat(root.transformation);

                var item = {
                    source: expr.source,
                    pipe: pipe
                };

                if (tuple) {
                    item.key = tuple;
                }

                item.units = (root.units) ?
                    root.units.map((unit) => {
                        var clone = utils.clone(unit);
                        // pass guide by reference
                        clone.guide = unit.guide;
                        return clone;
                    }) :
                    [];

                return self._datify(item);
            });
        }

        root.frames.forEach(
            (f) => (f.units.forEach(
                (unit) => this._expandUnitsStructure(unit, f.pipe)
            ))
        );

        return root;
    }

    _adaptSpecToUnitsStructure(root, spec) {

        var UnitClass = this.unitSet.get(root.type);
        if (UnitClass.embedUnitFrameToSpec) {
            UnitClass.embedUnitFrameToSpec(root, spec); // static method
        }

        root.frames.forEach(
            (f) => (f.units.forEach(
                (unit) => this._adaptSpecToUnitsStructure(unit, spec)
            ))
        );

        return root;
    }

    _drawUnitsStructure(unitConfig, rootFrame, rootUnit = null) {

        var self = this;

        var UnitClass = self.unitSet.get(unitConfig.type);
        var unitNode = new UnitClass(unitConfig);
        unitNode.parentUnit = rootUnit;
        unitNode
            .drawLayout((type, alias, settings) => {

                var name = alias ? alias : `${type}:default`;

                return self
                    .scalesCreator
                    .createScale(self.scales[name], rootFrame)
                    .create(settings);
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

    _datify(frame) {
        var data = this.sources[frame.source].data;
        var trans = this.transformations;
        var pipeReducer = (data, pipeCfg) => trans[pipeCfg.type](data, pipeCfg.args);
        frame.hash = () => utils.generateHash([frame.pipe, frame.key, frame.source].map(JSON.stringify).join(''));
        frame.take = () => frame.pipe.reduce(pipeReducer, data);
        frame.partByDims = (dims) => {
            return frame
                .pipe
                .map((f) => {
                    var r = {};
                    if (f.type === 'where' && f.args) {
                        r.type = f.type;
                        r.args = dims.reduce(
                            (memo, d) => {
                                if (f.args.hasOwnProperty(d)) {
                                    memo[d] = f.args[d];
                                }
                                return memo;
                            },
                            {});
                    } else {
                        r = f;
                    }

                    return r;
                })
                .reduce(pipeReducer, data);
        };
        frame.data = frame.take();
        return frame;
    }

    _parseExpression(expr, parentPipe) {

        var funcName = expr.operator || 'none';
        var srcAlias = expr.source;
        var bInherit = (expr.inherit !== false); // true by default
        var funcArgs = expr.params;

        var src = this.sources[srcAlias];
        var dataFn = bInherit ?
            (() => parentPipe.reduce((data, cfg) => this.transformations[cfg.type](data, cfg.args), src.data)) :
            (() => src.data);

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