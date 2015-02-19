import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {UnitsRegistry} from '../units-registry';
import {getLayout} from '../utils/layuot-template';
import {ScalesFactory} from '../scales-factory';
import {CSS_PREFIX} from '../const';

var FramesAlgebra = {

    'cross': function(dataFn, dimX, dimY) {

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

    'none': function(datus, dimX, dimY) {
        return [null];
    }
};

var calcBaseFrame = (unit, baseFrame) => {

    var tmpFrame = _.pick(baseFrame || {}, 'source', 'pipe');

    var srcAlias = unit.expr[1];
    var bInherit = unit.expr[2];
    var ownFrame = {source: srcAlias, pipe: []};

    if (bInherit && (ownFrame.source !== tmpFrame.source)) {
        throw new Error(`base [${tmpFrame.source}] and own [${ownFrame.source}] sources should be equal to apply inheritance`);
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

    render(target, xSize) {

        var targetNode = d3.select(target).node();
        if (targetNode === null) {
            throw new Error('Target element not found');
        }

        targetNode.appendChild(this._layout.layout);

        var containerNode = this._layout.content;
        var container = d3.select(this._layout.content);
        containerNode.innerHTML = '';

        var size = _.clone(xSize) || {};
        if (!size.width || !size.height) {
            size = _.defaults(size, utilsDom.getContainerSize(containerNode.parentNode));
        }

        // expand units structure
        this.root = this.expandUnitsStructure(this.config.unit);

        this.root.options = {
            container: container.append('svg').attr(_.extend({'class': `${CSS_PREFIX}svg`}, size)),
            left     : 0,
            top      : 0,
            width    : size.width,
            height   : size.height
        };

        this.drawUnitsStructure(this.root);
    }

    expandUnitsStructure(rootUnit) {

        var buildRecursively = (root, parentPipe) => {

            var expr = this.parseExpression(root.expr, parentPipe);

            root.frames = expr.exec().map((tuple) => {
                var pipe = parentPipe.concat([{type: 'where', args: tuple}]);
                var item = {
                    source: expr.source,
                    pipe: pipe
                };

                if (tuple) {
                    item.key = tuple;
                }

                if (root.unit) {
                    item.unit = root.unit.map((unit) => buildRecursively(utils.clone(unit), pipe));
                }

                return item;
            });

            return root;
        };

        return buildRecursively(rootUnit, []);
    }

    drawUnitsStructure() {

        var continueDrawRecursively = (rootConf, rootFrame) => {

            var dataFrame = this.datify(calcBaseFrame(rootConf, rootFrame));

            var UnitClass = this.unitSet.get(rootConf.type);

            var unitNode = new UnitClass(rootConf);

            unitNode
                .drawLayout((type, alias, settings) => {

                    // type is one of:
                    // - pos
                    // - size
                    // - color
                    // - shape
                    var name = alias ? alias : `${type}:default`;

                    return this.scalesCreator.create(this.scales[name], dataFrame, settings);
                })
                .drawFrames(rootConf.frames.map(this.datify.bind(this)), continueDrawRecursively);

            return rootConf;
        };

        return continueDrawRecursively(this.root);
    }

    datify(frame) {
        var data = this.sources[frame.source].data;
        var trans = this.trans;
        frame.take = () => frame.pipe.reduce((data, pipeCfg) => trans[pipeCfg.type](data, pipeCfg.args), data);
        frame.data = frame.take();
        return frame;
    }

    parseExpression(sExpression, parentPipe) {

        var funcName = sExpression[0];
        var srcAlias = sExpression[1];
        var inheritQ = sExpression[2];
        var funcArgs = sExpression.slice(3);

        var dataFn = inheritQ ?
            (() => parentPipe.reduce(
                (data, cfg) => this.trans[cfg.type](data, cfg.args),
                (this.sources[srcAlias].data))) :
            (() => this.sources[srcAlias].data);

        return {
            source  : srcAlias,
            func    : FramesAlgebra[funcName],
            args    : funcArgs,
            exec    : () => FramesAlgebra[funcName](...[dataFn].concat(funcArgs))
        };
    }
}