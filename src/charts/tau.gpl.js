import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {UnitsRegistry} from '../units-registry';
import {getLayout} from '../utils/layuot-template';
import {ScalesFactory} from '../scales-factory';
import {CSS_PREFIX} from '../const';

var FramesAlgebra = {

    cross: function (dataFn, dimX, dimY) {

        var convert = (v) => (v instanceof Date) ? v.getTime() : v;

        var data = dataFn();

        var domainX = _(data).chain().pluck(dimX).unique(convert).value();
        var domainY = _(data).chain().pluck(dimY).unique(convert).value();

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY;

        return _(domY).reduce(
            (memo, rowVal) => {

                return memo.concat(_(domX).map((colVal) => {

                    var r = {};

                    if (dimX) {
                        r[dimX] = convert(colVal);
                    }

                    if (dimY) {
                        r[dimY] = convert(rowVal);
                    }

                    return r;
                }));
            },
            []);
    },

    none: function (datus, dimX, dimY, pipe) {
        return [null];
    }
};

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

        this._svg = null;
        this._filtersStore = {filters: {}, tick: 0};
        this._layout = getLayout();

        this._initialize(config);
    }

    _initialize(config) {

        this.config = config;

        this.unitSet = UnitsRegistry;

        this.sources = config.sources;

        this.scalesCreator = new ScalesFactory(config.sources);

        this.scales = config.scales;

        this.trans = config.trans;
    }

    renderTo(target, xSize) {

        var targetNode = d3.select(target).node();
        if (targetNode === null) {
            throw new Error('Target element not found');
        }

        targetNode.appendChild(this._layout.layout);

        var containerNode = this._layout.content;
        var container = d3.select(this._layout.content);
        // containerNode.innerHTML = '';

        var size = _.clone(xSize) || {};
        if (!size.width || !size.height) {
            // size = _.defaults(size, utilsDom.getContainerSize(containerNode.parentNode));
            size = _.defaults(size, utilsDom.getContainerSize(targetNode));
        }

        // expand units structure
        this.root = this.expandUnitsStructure(this.config.unit);

        container.selectAll('svg')
            .data(['const'])
            .enter()
            .append('svg')
            .attr(_.extend({class: (`${CSS_PREFIX}svg`)}, size))
            .append('g')
            .attr('class', `${CSS_PREFIX}cell cell frame-root`);

        this.root.options = {
            container: container.select('.frame-root'),
            frameId: 'root',
            left: 0,
            top: 0,
            width: size.width,
            height: size.height
        };

        this._drawUnitsStructure(this.root);
    }

    expandUnitsStructure(root, parentPipe = []) {

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

        root.frames.map((item) => {
            // key: tuple,
            // source: expr.source,
            // pipe: pipe

            item.units.map((unit) => this.expandUnitsStructure(unit, item.pipe));

            return item;
        });

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

                name = name.scaleDim || name;

                return self.scalesCreator.create(self.scales[name], dataFrame, settings);
            })
            .drawFrames(rootConf.frames.map(self._datify.bind(self)), self._drawUnitsStructure.bind(self));

        return rootConf;
    }

    _datify(frame) {
        var data = this.sources[frame.source].data;
        var trans = this.trans;
        frame.hash = () => btoa([frame.pipe, frame.key, frame.source].map(JSON.stringify).join('')).replace(/=/g, '_');
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