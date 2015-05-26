import {default as _} from 'underscore';
import {utils} from './utils/utils';

export class SpecConverter {

    constructor(spec) {
        this.spec = spec;

        this.dist = {
            sources: {
                '?': {
                    dims: {},
                    data: [{}]
                },
                '/': {
                    dims: {},
                    data: []
                }
            },
            scales: {
                // jscs:disable disallowQuotedKeysInObjects
                'x_null': {type: 'ordinal', source: '?'},
                'y_null': {type: 'ordinal', source: '?'},
                'size_null':  {type: 'size', source: '?', mid: 5},
                'color_null': {type: 'color', source: '?', brewer: null},

                'pos:default': {type: 'ordinal', source: '?'},
                'size:default': {type: 'size', source: '?', mid: 5},
                'color:default': {type: 'color', source: '?', brewer: null}
                // jscs:enable disallowQuotedKeysInObjects
            },
            settings: spec.settings
        };
    }

    convert() {
        var srcSpec = this.spec;
        var gplSpec = this.dist;
        this.ruleAssignSourceDims(srcSpec, gplSpec);
        this.ruleAssignStructure(srcSpec, gplSpec);
        this.ruleAssignSourceData(srcSpec, gplSpec);
        this.ruleApplyDefaults(gplSpec);

        return gplSpec;
    }

    ruleApplyDefaults(spec) {
        var traverse = (node, iterator, parentNode) => {
            iterator(node, parentNode);
            (node.units || []).map((x) => traverse(x, iterator, node));
        };

        var iterator = (childUnit, root) => {

            // leaf elements should inherit coordinates properties
            if (root && !childUnit.hasOwnProperty('units')) {
                childUnit = _.defaults(childUnit, _.pick(root, 'x', 'y'));

                var parentGuide = utils.clone(root.guide || {});
                childUnit.guide = childUnit.guide || {};
                childUnit.guide.x = _.defaults(childUnit.guide.x || {}, parentGuide.x);
                childUnit.guide.y = _.defaults(childUnit.guide.y || {}, parentGuide.y);

                childUnit.expression.inherit = root.expression.inherit;
            }

            return childUnit;
        };

        traverse(spec.unit, iterator, null);
    }

    ruleAssignSourceData(srcSpec, gplSpec) {

        var meta = srcSpec.spec.dimensions || {};

        var dims = gplSpec.sources['/'].dims;

        var reduceIterator = (row, key) => {

            if (_.isObject(row[key]) && !_.isDate(row[key])) {
                _.each(row[key], (v, k) => (row[key + '.' + k] = v));
            }

            return row;
        };

        gplSpec.sources['/'].data = srcSpec
            .data
            .map((rowN) => {
                var row = (Object.keys(rowN).reduce(reduceIterator, rowN));
                return (Object.keys(dims).reduce(
                    (r, k) => {

                        if (!r.hasOwnProperty(k)) {
                            r[k] = null;
                        }

                        if ((r[k] !== null) && meta[k] && (['period', 'time'].indexOf(meta[k].scale) >= 0)) {
                            r[k] = new Date(r[k]);
                        }

                        return r;
                    },
                    row));
            });
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
            this.ruleCreateScales(srcUnit, gplRoot);

            if (srcUnit.unit) {
                gplRoot.units = srcUnit.unit.map(walkStructure);
            }

            return gplRoot;
        };

        var root = walkStructure(srcSpec.spec.unit);
        root.expression.inherit = false;
        gplSpec.unit = root;
    }

    ruleCreateScales(srcUnit, gplRoot) {

        var guide = srcUnit.guide || {};
        ['color', 'size', 'x', 'y'].forEach((p) => {
            if (srcUnit.hasOwnProperty(p)) {
                gplRoot[p] = this.scalesPool(p, srcUnit[p], guide[p] || {});
            }
        });
    }

    ruleInferDim(dimName, guide) {

        var r = dimName;

        var dims = this.spec.spec.dimensions;

        if (!dims.hasOwnProperty(r)) {
            return r;
        }

        if (guide.hasOwnProperty('tickLabel')) {
            r = `${dimName}.${guide.tickLabel}`;
        } else if (dims[dimName].value) {
            r = `${dimName}.${dims[dimName].value}`;
        }

        var myDims = this.dist.sources['/'].dims;
        if (!myDims.hasOwnProperty(r)) {
            myDims[r] = {type:myDims[dimName].type};
        }

        return r;
    }

    scalesPool(scaleType, dimName, guide) {

        var k = `${scaleType}_${dimName}`;

        if (this.dist.scales.hasOwnProperty(k)) {
            return k;
        }

        var dims = this.spec.spec.dimensions;

        var item = {};
        if (scaleType === 'color' && dimName !== null) {
            item = {
                type: 'color',
                source: '/',
                dim: this.ruleInferDim(dimName, guide)
            };

            if (guide.hasOwnProperty('brewer')) {
                item.brewer = guide.brewer;
            }
        }

        if (scaleType === 'size' && dimName !== null) {
            item = {
                type: 'size',
                source: '/',
                dim: this.ruleInferDim(dimName, guide),
                min: 2,
                max: 10,
                mid: 5
            };
        }

        if (dims.hasOwnProperty(dimName) && (scaleType === 'x' || scaleType === 'y')) {
            item = {
                type: dims[dimName].scale,
                source: '/',
                dim: this.ruleInferDim(dimName, guide)
            };

            if (dims[dimName].hasOwnProperty('order')) {
                item.order = dims[dimName].order;
            }

            if (guide.hasOwnProperty('min')) {
                item.min = guide.min;
            }

            if (guide.hasOwnProperty('max')) {
                item.max = guide.max;
            }

            if (guide.hasOwnProperty('autoScale')) {
                item.autoScale = guide.autoScale;
            } else {
                item.autoScale = true;
            }

            if (guide.hasOwnProperty('tickPeriod')) {
                item.period = guide.tickPeriod;
            }

            item.fitToFrame = guide.fitToFrame;

            item.ratio = guide.ratio;
        }

        this.dist.scales[k] = item;

        return k;
    }

    ruleInferExpression(srcUnit) {

        var expr = {
            operator: 'none',
            params: []
        };

        var g = srcUnit.guide || {};
        var gx = g.x || {};
        var gy = g.y || {};

        if (srcUnit.type.indexOf('ELEMENT.') === 0) {

            if (srcUnit.color) {
                expr = {
                    operator: 'groupBy',
                    params: [
                        this.ruleInferDim(srcUnit.color, g.color || {})
                    ]
                };
            }

        } else if (srcUnit.type === 'COORDS.RECT') {

            if (srcUnit.unit.length === 1 && srcUnit.unit[0].type === 'COORDS.RECT') {

                // jshint ignore:start
                // jscs:disable requireDotNotation
                if (gx['tickPeriod'] || gy['tickPeriod']) {
                    expr = {
                        operator: 'cross_period',
                        params: [
                            this.ruleInferDim(srcUnit.x, gx),
                            this.ruleInferDim(srcUnit.y, gy),
                            gx['tickPeriod'],
                            gy['tickPeriod']
                        ]
                    };
                } else {
                    expr = {
                        operator: 'cross',
                        params: [
                            this.ruleInferDim(srcUnit.x, gx),
                            this.ruleInferDim(srcUnit.y, gy)
                        ]
                    };
                }
                // jscs:enable requireDotNotation
                // jshint ignore:end
            }
        }

        return _.extend({inherit: true, source: '/'}, expr);
    }
}