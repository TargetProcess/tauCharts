import {DSLReader} from '../dsl-reader';
import {SpecEngineFactory} from '../spec-engine-factory';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';
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
        this.data = this.config.data;

        //plugins
        this._plugins = new Plugins(this.config.plugins);
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

        var reader = new DSLReader(this.spec, this.data, SpecEngineFactory.get());
        var xGraph = reader.buildGraph();
        var engine = LayoutEngineFactory.get(this.config.layoutEngine || 'EXTRACT');
        var layout = reader.calcLayout(xGraph, engine, size);
        var canvas = reader.renderGraph(layout, svgContainer);

        //plugins
        canvas.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
        this._plugins.render(canvas);
    }

    _autoDetectDimensions(data) {

        var detectType = (propertyValue) => {
            var type;
            if (_.isObject(propertyValue)) {
                type = 'order';
            }
            else if (_.isNumber(propertyValue)) {
                type = 'measure';
            }
            else {
                type = 'category';
            }

            return type;
        };

        return _.reduce(
            data,
            (dimMemo, rowItem) => {

                _.each(rowItem, (val, key) => {
                    var assumedType = detectType(val);
                    dimMemo[key] = dimMemo[key] || {type: assumedType};
                    dimMemo[key].type = (dimMemo[key].type === assumedType) ? assumedType : 'category';
                });

                return dimMemo;
            },
            {});
    }

    _autoAssignScales(dimensions) {

        var scaleMap = {
            category: 'ordinal',
            order: 'ordinal',
            measure:'linear'
        };

        _.each(dimensions, (val, key) => {
            var t = val.type.toLowerCase();
            val.scale = val.scale || scaleMap[t];
        });

        return dimensions;
    }

    _normalizeDimensions(dimensions, data) {
        var dims = (dimensions) ? dimensions : this._autoDetectDimensions(data);
        return this._autoAssignScales(dims);
    }

    convertConfig(config) {
        return config;
    }
}
