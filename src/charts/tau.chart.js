import {DSLReader} from '../dsl-reader';
import {Plugins, propagateDatumEvents} from '../plugins';

export class Chart {
    constructor(config) {

        var chartConfig = this.convertConfig(config);

        if (!chartConfig.spec.dimensions) {
            chartConfig.spec.dimensions = this._autoDetectDimensions(chartConfig.data);
        } else {
            var smartDetection = (data) => {
                data[0].keys();
            };
        }
        this.config = _.defaults(chartConfig, {
            spec: null,
            data: [],
            plugins: []
        });
        this.plugins = this.config.plugins;
        this.spec = this.config.spec;
        this.data = this.config.data;
        this.reader = new DSLReader(this.spec);
        var render = this._render(this.reader.traverse(this.data));
        this._chart = render.node();

        //plugins
        this._plugins = new Plugins(this.config.plugins);
        render.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
    }

    _autoDetectDimensions(data) {
        function detectType(value) {
            return _.isNumber(value) ? 'linear' : 'ordinal';
        }
        return _.reduce(data, (dimensions, item)=> {
            _.each(item, function (value, key) {
                if (dimensions[key]) {
                    if(dimensions[key].scaleType == detectType(value)) {
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

    _render(graph) {
        return this.reader.traverseToNode(graph, this.data);
    }
}
