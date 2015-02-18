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

        var scalesCreator = new ScalesFactory(config.sources);
        this.scales = _.keys(config.scales).reduce(
            (memo, key) => {
                memo[key] = scalesCreator.create(config.scales[key]);
                return memo;
            },
            {});

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
            container: container.append("svg").attr(_.extend({'class': `${CSS_PREFIX}svg`}, size)),
            left     : 0,
            top      : 0,
            width    : size.width,
            height   : size.height
        };

        this.drawUnitsStructure(this.root);
    }

    expandUnitsStructure(rootUnit) {

        var buildRecursively = (root, parentPipe) => {

            // TODO: detached_cross - to avoid parent frame inheritance
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

        var drawRecursively = (rootConf) => {

            var UnitClass = this.unitSet.get(rootConf.type);

            rootConf.x = this.scales[rootConf.x];
            rootConf.y = this.scales[rootConf.y];

            var unitNode = new UnitClass(rootConf);

            var frames = rootConf.frames.map((frame) => {
                var data = this.sources[frame.source].data;
                var trans = this.trans;
                frame.data = frame.pipe.reduce(
                    (data, cfg) => trans[cfg.type](data, cfg.args),
                    (data));
                return frame;
            });

            unitNode
                .drawLayout()
                .drawFrames(frames)
                .map((unit) => drawRecursively(unit));

            return rootConf;
        };

        return drawRecursively(this.root);
    }

    parseExpression(sExpression, parentPipe) {

        var funcName = sExpression[0];
        var dataName = sExpression[1];
        var inheritQ = sExpression[2];
        var funcArgs = sExpression.slice(3);

        var dataFn = inheritQ ?
            (() => parentPipe.reduce(
                (data, cfg) => this.trans[cfg.type](data, cfg.args),
                (this.sources[dataName].data))) :
            (() => this.sources[dataName].data);

        return {
            source  : dataName,
            func    : FramesAlgebra[funcName],
            args    : funcArgs,
            exec    : () => FramesAlgebra[funcName](...[dataFn].concat(funcArgs))
        };
    }
}