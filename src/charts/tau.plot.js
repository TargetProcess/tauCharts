import {DSLReader} from '../dsl-reader';
import {SpecEngineFactory} from '../spec-engine-factory';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {CSS_PREFIX} from '../const';

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

        this._measurer = {
            getAxisTickLabelSize: utilsDom.getAxisTickLabelSize,
            axisTickLabelLimit: 100,
            xTickWidth: 6 + 3,
            distToXAxisLabel: 20,
            distToYAxisLabel: 20,
            xAxisPadding: 20,
            yAxisPadding: 20,
            xFontLabelHeight: 15,
            yFontLabelHeight: 15,
            densityKoeff: 2.2
        };
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

        var svgContainer = container
            .append("svg")
            .attr("class",CSS_PREFIX + 'svg')
            .attr("width", size.width)
            .attr("height", size.height);

        var specEngineId = this.config.specEngine || 'AUTO';
        var specEngine = SpecEngineFactory.get(specEngineId, this._measurer);

        var reader = new DSLReader(this.spec, this.data, specEngine);
        var xGraph = reader.buildGraph();

        var layoutEngineId = this.config.layoutEngine || 'EXTRACT';
        var layoutEngine = LayoutEngineFactory.get(layoutEngineId);

        var layout = reader.calcLayout(xGraph, layoutEngine, size);
        var canvas = reader.renderGraph(layout, svgContainer);

        //plugins
        canvas.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
        this._plugins.render(canvas);
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
