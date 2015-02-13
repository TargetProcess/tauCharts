import {DSLReader} from '../dsl-reader';
import {Emitter} from '../event';
import {SpecEngineFactory} from '../spec-engine-factory';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {CSS_PREFIX} from '../const';
import {UnitDomainMixin} from '../unit-domain-mixin';
import {UnitsRegistry} from '../units-registry';
import {DataProcessor} from '../data-processor';
import {getLayout} from '../utils/layuot-template';

import {ScalesFactory} from '../unit-domain-mixin';



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

        this.initialize(config);
    }

    initialize(config) {

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

        // expand units structure
        this.root = expandUnitsStructure(config.unit);
    }

    expandUnitsStructure(rootUnit) {

        var buildRecursively = (root, parentFramePipe) => {

            // TODO: detached_cross - to avoid parent frame inheritance
            var expr = this.parseExpression(root.expr);

            root.frames = expr.exec().map((tuple) => {
                var pipe = parentFramePipe.concat([{where: tuple}]);
                return {
                    key: tuple,
                    source: expr.source,
                    pipe: pipe,
                    unit: root.unit.map((unit) => buildRecursively(utils.clone(unit), pipe))
                };
            });

            return root;
        };

        return buildRecursively(rootUnit, []);
    }

    drawUnitsStructure() {

        var drawRecursively = (root) => {

            var UnitClass = this.unitHub.get(root.type);

            var unitNode = new UnitClass();

            root.frames.map((frame) => {
                unitNode.drawFrame(frame);
                drawRecursively(frame.unit);
            });

            return root;
        };

        return drawRecursively(this.root);
    }

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