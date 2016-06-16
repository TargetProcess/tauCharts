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
                'size_null':  {type: 'size', source: '?'},
                'color_null': {type: 'color', source: '?', brewer: null},
                'split_null': {type: 'value', source: '?'},

                'pos:default': {type: 'ordinal', source: '?'},
                'size:default': {type: 'size', source: '?'},
                'label:default': {type: 'value', source: '?'},
                'color:default': {type: 'color', source: '?', brewer: null},
                'split:default': {type: 'value', source: '?'}
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

        var settings = spec.settings || {};

        var traverse = (node, iterator, parentNode) => {
            iterator(node, parentNode);
            (node.units || []).map((x) => traverse(x, iterator, node));
        };

        var iterator = (childUnit, root) => {

            childUnit.namespace = 'chart';

            // leaf elements should inherit coordinates properties
            if (root && !childUnit.hasOwnProperty('units')) {
                childUnit = _.defaults(childUnit, _.pick(root, 'x', 'y'));

                var parentGuide = utils.clone(root.guide || {});
                childUnit.guide = _.defaults(
                    (childUnit.guide || {}),
                    {
                        animationSpeed: settings.animationSpeed
                    }
                );
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
            this.ruleCreateScales(srcUnit, gplRoot);
            gplRoot.expression = this.ruleInferExpression(srcUnit);

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
        ['color', 'size', 'label', 'x', 'y', 'split'].forEach((p) => {
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
            delete myDims[dimName];
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

            if (dims[dimName] && dims[dimName].hasOwnProperty('order')) {
                item.order = dims[dimName].order;
            }

            if (guide.hasOwnProperty('min')) {
                item.min = guide.min;
            }

            if (guide.hasOwnProperty('max')) {
                item.max = guide.max;
            }

            if (guide.hasOwnProperty('nice')) {
                item.nice = guide.nice;
            }
        }

        if (scaleType === 'size' && dimName !== null) {
            item = {
                type: 'size',
                source: '/',
                dim: this.ruleInferDim(dimName, guide)
            };

            if (guide.hasOwnProperty('func')) {
                item.func = guide.func;
            }

            if (guide.hasOwnProperty('min')) {
                item.min = guide.min;
            }

            if (guide.hasOwnProperty('max')) {
                item.max = guide.max;
            }

            if (guide.hasOwnProperty('minSize')) {
                item.minSize = guide.minSize;
            }

            if (guide.hasOwnProperty('maxSize')) {
                item.maxSize = guide.maxSize;
            }
        }

        if (scaleType === 'label' && dimName !== null) {
            item = {
                type: 'value',
                source: '/',
                dim: this.ruleInferDim(dimName, guide)
            };
        }

        if (scaleType === 'split' && dimName !== null) {
            item = {
                type: 'value',
                source: '/',
                dim: this.ruleInferDim(dimName, guide)
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

            if (guide.hasOwnProperty('nice')) {
                item.nice = guide.nice;
            } else {
                // #121763
                // for backward compatibility with "autoScale" property
                item.nice = item.autoScale;
            }

            if (guide.hasOwnProperty('niceInterval')) {
                item.niceInterval = guide.niceInterval;
            } else {
                item.niceInterval = null;
            }

            if (guide.hasOwnProperty('tickPeriod')) {
                item.period = guide.tickPeriod;
                item.type = 'period';
            }

            item.fitToFrameByDims = guide.fitToFrameByDims;

            item.ratio = guide.ratio;
        }

        this.dist.scales[k] = item;

        return k;
    }

    getScaleConfig(scaleType, dimName) {
        var k = `${scaleType}_${dimName}`;
        return this.dist.scales[k];
    }

    ruleInferExpression(srcUnit) {

        var expr = {
            operator: 'none',
            params: []
        };

        var g = srcUnit.guide || {};
        var gx = g.x || {};
        var gy = g.y || {};

        var scaleX = this.getScaleConfig('x', srcUnit.x);
        var scaleY = this.getScaleConfig('y', srcUnit.y);

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
                if (scaleX.period || scaleY.period) {
                    expr = {
                        operator: 'cross_period',
                        params: [
                            this.ruleInferDim(srcUnit.x, gx),
                            this.ruleInferDim(srcUnit.y, gy),
                            scaleX.period,
                            scaleY.period
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