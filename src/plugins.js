/* jshint ignore:start */
import {default as d3} from 'd3';
/* jshint ignore:end */
import {utils} from './utils/utils';
var elementEvents = ['click', 'mouseover', 'mouseout', 'mousemove'];

class Plugins {
    constructor(plugins, chart) {
        this.chart = chart;
        this._unitMap = {};
        this._plugins = plugins.map(this.initPlugin, this);
        chart.on('render', function (el, svg) {
            d3.select(svg).selectAll('.i-role-datum').call(this._propagateDatumEvents(chart));
        }, this);
        chart.on('unitdraw', (chart, element)=> {
            this._unitMap[element.config.options.uid] = element;
        }, this);
    }

    initPlugin(plugin) {
        if (plugin.init) {
            plugin.init(this.chart);
        }
// jscs:disable disallowEmptyBlocks
        var empty = () => {
        };
// jscs:enable disallowEmptyBlocks
        this.chart.on('destroy', plugin.destroy && plugin.destroy.bind(plugin) || (empty));
        Object.keys(plugin).forEach((name) => {
            if (name.indexOf('on') === 0) {
                var event = name.substr(2);
                this.chart.on(event.toLowerCase(), plugin[name].bind(plugin));
            }
        });
    }

    _getUnitByHash(id) {
        return this._unitMap[id];
    }

    _propagateDatumEvents(chart) {
        var self = this;
        return function () {
            elementEvents.forEach(function (name) {
                this.on(name, function (d) {
                    var cellData = d3.select(this.parentNode.parentNode).datum();
                    var unit = self._getUnitByHash(d.uid);
                    var data = d.data;
                    chart.fire('element' + name, {
                        elementData: data,
                        element: this,
                        cellData: cellData,
                        unit: unit
                    });
                });
            }, this);
        };
    }
}

export {Plugins};
