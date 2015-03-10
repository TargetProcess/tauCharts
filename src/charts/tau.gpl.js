import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {unitsRegistry} from '../units-registry';
import {getLayout} from '../utils/layuot-template';
import {ScalesFactory} from '../scales-factory';
import {CSS_PREFIX} from '../const';
import {FramesAlgebra} from '../algebra';
import {Plugins, propagateDatumEvents} from '../plugins';
import {Tooltip} from '../api/balloon';

var calcBaseFrame = (unitExpression, baseFrame) => {

    var tmpFrame = _.pick(baseFrame || {}, 'source', 'pipe');

    var srcAlias = unitExpression.source;
    var bInherit = unitExpression.inherit;
    var ownFrame = {source: srcAlias, pipe: []};

    if (bInherit && (ownFrame.source !== tmpFrame.source)) {
        // jscs:disable maximumLineLength
        throw new Error(`base [${tmpFrame.source}] and own [${ownFrame.source}] sources should be equal to apply inheritance`);
        // jscs:enable maximumLineLength
    }

    return bInherit ? tmpFrame : ownFrame;
};

export class GPL extends Emitter {

    constructor(config) {

        super();

        this.config = config;

        this.unitSet = config.unitsRegistry || unitsRegistry;

        this.sources = config.sources;

        this.scalesCreator = new ScalesFactory(config.sources);

        this.scales = config.scales;

        this.trans = config.trans;

        this.onUnitDraw = (...param)=> {
            if (config.onUnitDraw) {
                config.onUnitDraw(...param);
            }
            this.fire('unitdraw', ...param);
        }
        this._plugins = new Plugins(config.plugins, this);
    }

    addBalloon(conf) {
        return new Tooltip('', conf || {});
    }

    getConfig() {
        return this.config;
    }

    renderTo(target, xSize) {

        var d3Target = d3.select(target);

        var size = xSize || _.defaults(utilsDom.getContainerSize(d3Target.node()));

        this.root = this._expandUnitsStructure(this.config.unit);

        d3Target
            .selectAll('svg')
            .data(['const'])
            .enter()
            .append('svg')
            .attr(_.extend({class: (`${CSS_PREFIX}svg`)}, size))
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

        this._drawUnitsStructure(this.root);
        d3Target.selectAll('.i-role-datum').call(propagateDatumEvents(this));
    }

    _expandUnitsStructure(root, parentPipe = []) {

        if (root.expression.operator !== false) {

            var expr = this._parseExpression(root.expression, parentPipe);

            root.transformation = root.transformation || [];

            root.frames = expr.exec().map((tuple) => {

                var pipe = parentPipe
                    .concat([
                        {
                            type: 'where',
                            args: tuple
                        }
                    ])
                    .concat(root.transformation);

                var item = {
                    source: expr.source,
                    pipe: pipe
                };

                if (tuple) {
                    item.key = tuple;
                }

                item.units = (root.units) ? root.units.map((unit) => utils.clone(unit)) : [];

                return item;
            });
        }

        root.frames.forEach(
            (f) => (f.units.forEach(
                (unit) => this._expandUnitsStructure(unit, f.pipe)
            ))
        );

        return root;
    }

    _drawUnitsStructure(rootConf, rootFrame = null) {

        var self = this;

        var dataFrame = self._datify(calcBaseFrame(rootConf.expression, rootFrame));

        var UnitClass = self.unitSet.get(rootConf.type);
        var unitNode = new UnitClass(rootConf);

        unitNode
            .drawLayout((type, alias, settings) => {

                var name = alias ? alias : `${type}:default`;

                return self.scalesCreator.create(self.scales[name], dataFrame, settings);
            })
            .drawFrames(rootConf.frames.map(self._datify.bind(self)), self._drawUnitsStructure.bind(self));

        if (self.onUnitDraw) {
            self.onUnitDraw(unitNode);
        }

        return rootConf;
    }

    _datify(frame) {
        var data = this.sources[frame.source].data;
        var trans = this.trans;
        frame.hash = () => utils.generateHash([frame.pipe, frame.key, frame.source].map(JSON.stringify).join(''));
        frame.take = () => frame.pipe.reduce((data, pipeCfg) => trans[pipeCfg.type](data, pipeCfg.args), data);
        frame.data = frame.take();
        return frame;
    }

    _parseExpression(expr, parentPipe) {

        var funcName = expr.operator || 'none';
        var srcAlias = expr.source;
        var bInherit = expr.inherit;
        var funcArgs = expr.params;

        var src = this.sources[srcAlias];
        var dataFn = bInherit ?
            (() => parentPipe.reduce((data, cfg) => this.trans[cfg.type](data, cfg.args), src.data)) :
            (() => src.data);

        var func = FramesAlgebra[funcName];

        if (!func) {
            throw new Error(`${funcName} operator is not supported`);
        }

        return {
            source: srcAlias,
            func: func,
            args: funcArgs,
            exec: () => func.apply(null, [dataFn].concat(funcArgs))
        };
    }
}