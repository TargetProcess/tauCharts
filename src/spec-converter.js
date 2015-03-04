import {default as _} from 'underscore';
import {utils} from './utils/utils';

export class SpecConverter {

    constructor(spec) {
        this.spec = spec;
        this.dist = {
            sources: {
                '?': {
                    dims: {},
                    data: []
                },
                '/': {
                    dims: {},
                    data: []
                }
            },
            scales: {
                'size:default': {type: 'size', source: '?', mid: 5},
                'color:default': {type: 'color', source: '?', brewer: null}
            },
            trans: {
                where(data, tuple) {
                    var predicates = _.map(tuple, function (v, k) {
                        return function (row) {
                            return (row[k] === v);
                        };
                    });
                    return _(data).filter(function (row) {
                        return _.every(predicates, function (p) {
                            return p(row);
                        });
                    });
                }
            }
        };
    }

    convert() {
        var srcSpec = this.spec;
        var gplSpec = this.dist;
        this.ruleAssignSourceData(srcSpec, gplSpec);
        this.ruleAssignSourceDims(srcSpec, gplSpec);
        this.ruleAssignStructure(srcSpec, gplSpec);

        return gplSpec;
    }

    ruleAssignSourceData(srcSpec, gplSpec) {
        gplSpec.sources['/'].data = srcSpec.data;
    }

    ruleAssignSourceDims(srcSpec, gplSpec) {
        var dims = srcSpec.spec.dimensions;
        gplSpec.sources['/'].dims = Object
            .keys(dims)
            .reduce((memo, k) => {
                memo[k] = {type: dims[k].type};
                return memo;
            }, {});
    }

    ruleAssignStructure(srcSpec, gplSpec) {

        var walkStructure = (srcUnit) => {
            var gplRoot = utils.clone(_.omit(srcUnit, 'unit'));
            gplRoot.expression = this.ruleInferExpression(srcUnit);
            if (srcUnit.unit) {
                gplRoot.units = srcUnit.unit.map(walkStructure);
            }

            this.ruleCreateScales(srcUnit, gplRoot);

            return gplRoot;
        };

        var root = walkStructure(srcSpec.spec.unit);
        root.expression.inherit = false;
        gplSpec.unit = root;
    }

    ruleCreateScales(srcUnit, gplRoot) {

        // TODO: remove when switch-off obsolete elements
        gplRoot.type = this.ruleInferType(srcUnit.type);

        ['color', 'size', 'x', 'y'].forEach((p) => {
            if (srcUnit.hasOwnProperty(p)) {
                gplRoot[p] = this.scalesPool(p, srcUnit[p], srcUnit.guide[p] || {});
            }
        });
    }

    ruleInferType(srcUnitType) {
        return srcUnitType.replace('ELEMENT.', '').replace('COORDS.', '');
    }

    scalesPool(scaleType, dimName, guide) {

        var k = `${scaleType}_${dimName}`;

        if (this.dist.scales.hasOwnProperty(k)) {
            return k;
        }

        var dims = this.spec.spec.dimensions;

        var item = {};
        if (scaleType === 'color') {
            item = {
                type: 'color',
                source: '/',
                dim: dimName
            };

            if (guide.hasOwnProperty('brewer')) {
                item.brewer = guide.brewer;
            }
        }

        if (scaleType === 'size') {
            item = {
                type: 'size',
                source: '/',
                dim: dimName
            };
        }

        if (scaleType === 'x' || scaleType === 'y') {
            item = {
                type: dims[dimName].scale,
                source: '/',
                dim: dimName
            };

            if (guide.hasOwnProperty('min')) {
                item.min = guide.min;
            }

            if (guide.hasOwnProperty('max')) {
                item.max = guide.max;
            }
        }

        this.dist.scales[k] = item;

        return k;
    }

    ruleInferExpression(srcUnit) {

        var expr = {
            operator: 'none',
            params: []
        };

        if (srcUnit.type.indexOf('ELEMENT.') === 0) {

            if (srcUnit.color) {
                expr = {operator: 'groupBy', params: [srcUnit.color]};
            }

        } else if (srcUnit.type === 'COORDS.RECT') {

            if (srcUnit.unit.length === 1 && srcUnit.unit[0].type === 'COORDS.RECT') {
                var item = srcUnit.unit[0];
                expr = {operator: 'cross', params: [item.x, item.y]};
            }
        }

        return _.extend({inherit: true, source: '/'}, expr);
    }
}