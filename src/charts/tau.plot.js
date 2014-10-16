import {DSLReader} from '../dsl-reader';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';

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

        this.reader = new DSLReader(this.spec, this.data);
        this.graph = this.reader.buildGraph();

        //plugins
        this._plugins = new Plugins(this.config.plugins);
    }

    renderTo(target, xSize) {

        var size = xSize || {};
        var container = d3.select(target);

        var h = size.hasOwnProperty('height') ? size.height : container.offsetHeight;
        var w = size.hasOwnProperty('width') ? size.width : container.offsetWidth;

        var layoutXGraph = this.reader.calcLayout(
            this.graph,
            LayoutEngineFactory.get(this.config.layoutEngine || 'EXTRACT-AXES'),
            {
                width: w,
                height: h
            });

        var layoutCanvas = this.reader.renderGraph(
            layoutXGraph,
            container.append("svg").style("border", 'solid 1px').attr("width", w).attr("height", h));

        //plugins
        layoutCanvas.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
        this._plugins.render(layoutCanvas);
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
