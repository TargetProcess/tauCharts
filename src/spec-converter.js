import {default as _} from 'underscore';
import {utils} from './utils/utils';

export class SpecConverter {

    constructor(spec) {
        this.spec = spec;
        this.opts = spec.settings;

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
                'pos:default': {type: 'ordinal', source: '?'},
                'size:default': {type: 'size', source: '?', mid: 5},
                'size_null':  {type: 'size', source: '?', mid: 5},

                'color:default': {type: 'color', source: '?', brewer: null},
                'color_null': {type: 'color', source: '?', brewer: null}
                // jscs:enable disallowQuotedKeysInObjects
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

        if ((this.spec.settings.layoutEngine === 'EXTRACT')) {
            try {
                this.ruleExtractAxes(gplSpec);
            } catch (ex) {
                if (ex.message === 'Not applicable') {
                    console.log(`[TauCharts]: can't extract axes for the given chart specification`, gplSpec);
                } else {
                    throw ex;
                }
            }
        }

        return gplSpec;
    }

    ruleAssignSourceData(srcSpec, gplSpec) {

        var reduceIterator = (row, key) => {

            if (_.isObject(row[key]) && !_.isDate(row[key])) {
                _.each(row[key], (v, k) => (row[key + '.' + k] = v));
            }

            return row;
        };

        gplSpec.sources['/'].data = srcSpec
            .data
            .map((r) => (Object.keys(r).reduce(reduceIterator, r)));
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

        ['color', 'size', 'x', 'y'].forEach((p) => {
            if (srcUnit.hasOwnProperty(p)) {
                gplRoot[p] = this.scalesPool(p, srcUnit[p], srcUnit.guide[p] || {});
            }
        });
    }

    scalesPool(scaleType, dimName, guide) {

        var k = `${scaleType}_${dimName}`;

        if (this.dist.scales.hasOwnProperty(k)) {
            return k;
        }

        var dims = this.spec.spec.dimensions;

        var inferDim = () => {
            var r = dimName;
            if (guide.hasOwnProperty('tickLabel')) {
                r = `${dimName}.${guide.tickLabel}`;
            } else if (dims[dimName].value) {
                r = `${dimName}.${dims[dimName].value}`;
            }

            return r;
        };

        var item = {};
        if (scaleType === 'color' && dimName !== null) {
            item = {
                type: 'color',
                source: '/',
                dim: inferDim()
            };

            if (guide.hasOwnProperty('brewer')) {
                item.brewer = guide.brewer;
            }
        }

        if (scaleType === 'size' && dimName !== null) {
            item = {
                type: 'size',
                source: '/',
                dim: inferDim(),
                min: 2,
                max: 10,
                mid: 5
            };
        }

        if (dims.hasOwnProperty(dimName) && (scaleType === 'x' || scaleType === 'y')) {
            item = {
                type: dims[dimName].scale,
                source: '/',
                dim: inferDim()
            };

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

                var g = srcUnit.guide;
                var gx = g.x || {};
                var gy = g.y || {};
                // jshint ignore:start
                // jscs:disable requireDotNotation
                if (gx['tickPeriod'] || gy['tickPeriod']) {
                    expr = {
                        operator: 'cross_period',
                        params: [srcUnit.x, srcUnit.y, gx['tickPeriod'], gy['tickPeriod']]
                    };
                } else {
                    expr = {
                        operator: 'cross',
                        params: [srcUnit.x, srcUnit.y]
                    };
                }
                // jscs:enable requireDotNotation
                // jshint ignore:end
            }
        }

        return _.extend({inherit: false, source: '/'}, expr);
    }

    ruleExtractAxes(spec) {

        var isCoordsRect = (unitRef) => {
            return (unitRef.type === 'COORDS.RECT' || unitRef.type === 'RECT');
        };

        var isElement = (unitRef) => {
            return (unitRef.type.indexOf('ELEMENT.') === 0);
        };

        var traverse = (root, enterFn, exitFn, level = 0) => {

            var shouldContinue = enterFn(root, level);

            if (shouldContinue) {
                (root.units || []).map((rect) => traverse(rect, enterFn, exitFn, level + 1));
            }

            exitFn(root, level);
        };

        var ttl = {l:0, r:0, t:0, b:0};
        var seq = [];
        var enterIterator = (unitRef, level) => {

            if ((level > 1) || !isCoordsRect(unitRef)) {
                throw new Error('Not applicable');
            }

            var p = unitRef.guide.padding;

            ttl.l += p.l;
            ttl.r += p.r;
            ttl.t += p.t;
            ttl.b += p.b;

            seq.push({
                l: ttl.l,
                r: ttl.r,
                t: ttl.t,
                b: ttl.b
            });

            var units = unitRef.units || [];
            var rects = units
                .map((x) => {

                    if (!(isCoordsRect(x) || isElement(x))) {
                        throw new Error('Not applicable');
                    }

                    return x;
                })
                .filter(isCoordsRect);

            return (rects.length === 1);
        };

        var pad = (x) => (x ? 10 : 0);
        var exitIterator = (unitRef) => {

            var lvl = seq.pop();

            unitRef.guide.padding = {
                l: pad(unitRef.y),
                r: pad(1),
                t: pad(1),
                b: pad(unitRef.x)
            };

            unitRef.guide.autoLayout = 'extract-axes';

            unitRef.guide.x.padding += (ttl.b - lvl.b);
            unitRef.guide.y.padding += (ttl.l - lvl.l);
        };

        traverse(spec.unit, enterIterator, exitIterator);

        spec.unit.guide.padding = ttl;
        spec.unit.guide.autoLayout = '';
    }
}