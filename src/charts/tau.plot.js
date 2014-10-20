import {DSLReader} from '../dsl-reader';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';
import {utilsDom} from '../utils/utils-dom';

export class Plot {
    constructor(config) {

        var chartConfig = this.convertConfig(config);

        if (!chartConfig.spec.dimensions) {
            chartConfig.spec.dimensions = this._autoDetectDimensions(chartConfig.data);
        }

        this.config = _.defaults(chartConfig, {
            spec: null,
            data: [],
            plugins: []
        });
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
            .attr("class", "tau-chart")
            .attr("width", size.width)
            .attr("height", size.height);

        var reader = new DSLReader(this.spec, this.data);
        var xGraph = reader.buildGraph();
        var engine = LayoutEngineFactory.get(this.config.layoutEngine || 'EXTRACT-AXES');
        var layout = reader.calcLayout(xGraph, engine, size);
        var canvas = reader.renderGraph(layout, svgContainer);

        //plugins
        canvas.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
        this._plugins.render(canvas);
    }

    _autoDetectDimensions(data) {
        function detectType(value) {
            return _.isNumber(value) ? 'linear' : 'ordinal';
        }

        return _.reduce(data, (dimensions, item)=> {
            _.each(item, function (value, key) {
                if (dimensions[key]) {
                    if (dimensions[key].scaleType == detectType(value)) {
                        dimensions[key].scaleType = detectType(value);
                    } else {
                        dimensions[key].scaleType = 'ordinal';
                    }
                } else {
                    dimensions[key] = {scaleType: detectType(value)};
                }
            });
            return dimensions;
        }, {});
    }

    convertConfig(config) {
        return config;
    }
}
