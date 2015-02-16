import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {UnitsRegistry} from '../units-registry';
import {getLayout} from '../utils/layuot-template';
import {ScalesFactory} from '../scales-factory';
import {CSS_PREFIX} from '../const';

var FramesAlgebra = {

    'cross': function(scaleX, scaleY) {

        var dimX = scaleX.dim;
        var dimY = scaleY.dim;

        var domainX = scaleX.domain();
        var domainY = scaleY.domain();

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY;

        var convert = (v) => (v instanceof Date) ? v.getTime() : v;

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
    }
};



export class GPL extends Emitter {

    constructor(config) {

        super();

        // config.units

        // config.sources
        // config.sources.*
        // config.sources.*.dims
        // config.sources.*.data

        // config.scales

        // config.trans

        // config.unit

        this._svg = null;
        this._filtersStore = {
            filters: {},
            tick: 0
        };
        this._layout = getLayout();

        this._initialize(config);
    }

    _initialize(config) {

        this.config = config;

        this.unitHub = UnitsRegistry;

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

        var containerNode = d3.select(target).node();
        if (containerNode === null) {
            throw new Error('Target element not found');
        }

        containerNode.appendChild(this._layout.layout);
        var container = d3.select(this._layout.content);

        this._layout.content.innerHTML = '';
        var size = _.clone(xSize) || {};
        if (!size.width || !size.height) {
            size = _.defaults(size, utilsDom.getContainerSize(this._layout.content.parentNode));
        }

        // expand units structure
        this.root = this.expandUnitsStructure(this.config.unit);

        console.log(JSON.stringify(this.root, null, 4));

        // throw 1;

        this.root.options = {
            container: container.append("svg").attr("class", CSS_PREFIX + 'svg').attr("width", size.width).attr("height", size.height),
            left     : 0,
            top      : 0,
            width    : size.width,
            height   : size.height
        };

        this.drawUnitsStructure(this.root);
    }

    expandUnitsStructure(rootUnit) {

        var buildRecursively = (root, parentFramePipe) => {

            var expr;
            var tuples;

            if (root.expr) {
                // TODO: detached_cross - to avoid parent frame inheritance
                expr = this.parseExpression(root.expr);
                tuples = expr.exec();
            }
            else {
                expr = {source: '/'};
                tuples = [null];
            }

            root.frames = tuples.map((tuple) => {
                var pipe = parentFramePipe.concat([{type: 'where', args: tuple}]);
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

            var UnitClass = this.unitHub.get(rootConf.type);

            rootConf.x = this.scales[rootConf.x];
            rootConf.y = this.scales[rootConf.y];

            var unitNode = new UnitClass(rootConf);

            var frames = rootConf.frames.map((frame) => {
                var source = this.sources[frame.source];
                var transf = this.trans;
                var fnPipe = (memo, cfg) => {
                    return transf[cfg.type](memo, cfg.args);
                };
                frame.data = frame.pipe.reduce(fnPipe, source);
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

    // drawUnitsStructure({
    //      container: gridContainer,
    //      left: xScale(xxx.$where[node.x.scaleDim]) - incX / 2,
    //      top : top,
    //      width : incX,
    //      height: height
    // })

    parseExpression(sExpression) {
        var funcName = sExpression[0];
        var funcArgs = sExpression.slice(1).map((scaleName) => this.scales[scaleName]);

        return {
            source: funcArgs[0].source,
            func: FramesAlgebra[funcName],
            args: funcArgs,
            exec: () => FramesAlgebra[funcName](...funcArgs)
        };
    }
}