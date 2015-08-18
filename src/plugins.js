/* jshint ignore:start */
import {default as d3} from 'd3';
/* jshint ignore:end */

class Plugins {

    constructor(plugins, chart) {
        this.chart = chart;
        this._plugins = plugins.map(this.initPlugin, this);
    }

    initPlugin(plugin) {

        if (plugin.init) {
            plugin.init(this.chart);
        }

        var empty = () => {
            // do nothing
        };

        this.chart
            .on('destroy', plugin.destroy && plugin.destroy.bind(plugin) || (empty));

        Object
            .keys(plugin)
            .forEach((name) => {
                if (name.indexOf('on') === 0) {
                    var event = name.substr(2);
                    this.chart.on(event.toLowerCase(), plugin[name].bind(plugin));
                }
            });
    }
}

export {Plugins};
