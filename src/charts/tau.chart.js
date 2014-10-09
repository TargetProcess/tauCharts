import {DSLReader} from '../dsl-reader';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';

export class Chart {
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

        this.reader = new DSLReader(this.spec, this.data);

        var logicalGraph = this.reader.buildGraph();
        var layoutXGraph = this.reader.calcLayout(
            logicalGraph,
            LayoutEngineFactory.get('EXTRACT-AXES'),
            {
                width: this.spec.W,
                height: this.spec.H
            });
        var layoutCanvas = this.reader.renderGraph(
            layoutXGraph,
            d3.select(this.spec.container)
                        .append("svg")
                        .style("border", 'solid 1px')
                        .attr("width", this.spec.W)
                        .attr("height", this.spec.H));

        //plugins
        this._plugins = new Plugins(this.config.plugins);
        layoutCanvas.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
    }

    _autoDetectDimensions(data) {
        function detectType(value) {
            return _.isNumber(value) ? 'linear' : 'ordinal';
        }

        return _.reduce(data, (dimensions, item)=> {
            _.each(item, function (value, key) {
                if (dimensions[key]) {
                    if (dimensions[key].scaleType == detectType(value)) {
                        dimensions[key].scaleType = 'linear';
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
