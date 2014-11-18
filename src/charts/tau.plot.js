import {DSLReader} from '../dsl-reader';
import {SpecEngineFactory} from '../spec-engine-factory';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {CSS_PREFIX} from '../const';
import {UnitDomainMixin} from '../unit-domain-mixin';
import {UnitsRegistry} from '../units-registry';

export class Plot {
    constructor(config) {

        var chartConfig = this.convertConfig(config);

        this.config = _.defaults(chartConfig, {
            spec: null,
            data: [],
            plugins: []
        });

        chartConfig.spec.dimensions = this._normalizeDimensions(chartConfig.spec.dimensions, chartConfig.data);

        this.plugins = this.config.plugins;
        this.spec = this.config.spec;
        this.data = this._autoExcludeNullValues(chartConfig.spec.dimensions, this.config.data);

        //plugins
        this._plugins = new Plugins(this.config.plugins);

        var globalSettings = Plot.globalSettings;
        var localSettings = {};
        Object.keys(globalSettings).forEach((k) => {
            localSettings[k] = (_.isFunction(globalSettings[k])) ?
                globalSettings[k] :
                utils.clone(globalSettings[k]);
        });

        this.settings = localSettings;

        this.settings.specEngine = this.config.specEngine || this.settings.specEngine;
        this.settings.layoutEngine = this.config.layoutEngine || this.settings.layoutEngine;
    }

    renderTo(target, xSize) {

        var container = d3.select(target);
        var containerNode = container[0][0];

        if (containerNode === null) {
            throw new Error('Target element not found');
        }

        //todo don't compute width if width or height were passed
        var size = _.defaults(xSize || {}, utilsDom.getContainerSize(containerNode));

        if (this.data.length === 0) {
            // empty data source
            return;
        }

        containerNode.innerHTML = '';

        var domainMixin = new UnitDomainMixin(this.spec.dimensions, this.data);

        var specEngine = SpecEngineFactory.get(this.settings.specEngine, this.settings);

        var fullSpec = specEngine(this.spec, domainMixin.mix({}));

        var traverseFromDeep = (root) => {
            var r;

            if (!root.unit) {
                r = { w: 0, h: 0 };
            }
            else {
                var s = traverseFromDeep(root.unit[0]);
                var g = root.guide;
                var xmd = g.x.$minimalDomain || 1;
                var ymd = g.y.$minimalDomain || 1;
                var maxW = Math.max((xmd * g.x.density), (xmd * s.w));
                var maxH = Math.max((ymd * g.y.density), (ymd * s.h));

                r = {
                    w: maxW + g.padding.l + g.padding.r,
                    h: maxH + g.padding.t + g.padding.b
                };
            }

            return r;
        };

        var optimalSize = traverseFromDeep(fullSpec.unit);
        var recommendedWidth = optimalSize.w;
        var recommendedHeight = optimalSize.h;

        var scrollSize = utilsDom.getScrollbarWidth();

        var deltaW = (size.width - recommendedWidth);
        var deltaH = (size.height - recommendedHeight);

        var screenW = (deltaW >= 0) ? size.width : recommendedWidth;
        var scrollW = (deltaH >= 0) ? 0 : scrollSize;

        var screenH = (deltaH >= 0) ? size.height : recommendedHeight;
        var scrollH = (deltaW >= 0) ? 0 : scrollSize;

        size.height = screenH - scrollH;
        size.width  = screenW - scrollW;


        var reader = new DSLReader(domainMixin, UnitsRegistry);

        var logicXGraph = reader.buildGraph(fullSpec);
        var layoutGraph = LayoutEngineFactory.get(this.settings.layoutEngine)(logicXGraph);
        var renderGraph = reader.calcLayout(layoutGraph, size);
        var svgXElement = reader.renderGraph(
            renderGraph,
            container
                .append("svg")
                .attr("class", CSS_PREFIX + 'svg')
                .attr("width", size.width)
                .attr("height", size.height)
        );

        //plugins
        svgXElement.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
        this._plugins.render(svgXElement);
    }

    _autoDetectDimensions(data) {

        var defaultDetect = {
            type: 'category',
            scale: 'ordinal'
        };

        var detectType = (propertyValue, defaultDetect) => {

            var pair = defaultDetect;

            if (_.isDate(propertyValue)) {
                pair.type = 'measure';
                pair.scale = 'time';
            }
            else if (_.isObject(propertyValue)) {
                pair.type = 'order';
                pair.scale = 'ordinal';
            }
            else if (_.isNumber(propertyValue)) {
                pair.type = 'measure';
                pair.scale = 'linear';
            }

            return pair;
        };

        var reducer = (memo, rowItem) => {

            Object.keys(rowItem).forEach((key) => {

                var val = rowItem.hasOwnProperty(key) ? rowItem[key] : null;

                memo[key] = memo[key] || {
                    type: null,
                    hasNull: false
                };

                if (val === null) {
                    memo[key].hasNull = true;
                }
                else {
                    var typeScalePair = detectType(val, utils.clone(defaultDetect));
                    var detectedType  = typeScalePair.type;
                    var detectedScale = typeScalePair.scale;

                    var isInContraToPrev = (memo[key].type !== null && memo[key].type !== detectedType);
                    memo[key].type  = isInContraToPrev ? defaultDetect.type  : detectedType;
                    memo[key].scale = isInContraToPrev ? defaultDetect.scale : detectedScale;
                }
            });

            return memo;
        };

        return _.reduce(data, reducer, {});
    }

    _autoExcludeNullValues(dimensions, srcData) {

        var fields = [];
        Object.keys(dimensions).forEach((k) => {
            var d = dimensions[k];
            if (d.hasNull && (d.type === 'measure')) {
                // rule: exclude null values of "measure" type
                fields.push(k);
            }
        });

        var r;
        if (fields.length === 0) {
            r = srcData;
        }
        else {
            r = srcData.filter((row) => !fields.some((f) => (!row.hasOwnProperty(f) || (row[f] === null))));
        }

        return r;
    }

    _autoAssignScales(dimensions) {

        var defaultType = 'category';
        var scaleMap = {
            category: 'ordinal',
            order: 'ordinal',
            measure:'linear'
        };

        var r = {};
        Object.keys(dimensions).forEach((k) => {
            var v = dimensions[k];
            var t = (v.type || defaultType).toLowerCase();
            r[k] = {};
            r[k].type = t;
            r[k].scale = v.scale || scaleMap[t];
            r[k].value = v.value;
        });

        return r;
    }

    _normalizeDimensions(dimensions, data) {
        var dims = (dimensions) ? dimensions : this._autoDetectDimensions(data);
        return this._autoAssignScales(dims);
    }

    convertConfig(config) {
        return config;
    }
}
