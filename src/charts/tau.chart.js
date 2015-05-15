import {Plot} from './tau.plot';
import {ChartTypesRegistry} from '../chart-alias-registry';

class Chart extends Plot {

    constructor(config) {

        var chartFactory = ChartTypesRegistry.get(config.type);

        config = _.defaults(config, {autoResize: true});
        config.settings = Plot.setupSettings(config.settings);
        config.dimensions = Plot.setupMetaInfo(config.dimensions, config.data);

        super(chartFactory(config));

        if (config.autoResize) {
            Chart.winAware.push(this);
        }
    }

    destroy() {
        var index = Chart.winAware.indexOf(this);
        if (index !== -1) {
            Chart.winAware.splice(index, 1);
        }
        super.destroy();
    }
}

Chart.resizeOnWindowEvent = (function () {

    var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
            return setTimeout(fn, 17);
        };
    var rIndex;

    function requestReposition() {
        if (rIndex || !Chart.winAware.length) {
            return;
        }
        rIndex = rAF(resize);
    }

    function resize() {
        rIndex = 0;
        var chart;
        for (var i = 0, l = Chart.winAware.length; i < l; i++) {
            chart = Chart.winAware[i];
            chart.resize();
        }
    }

    return requestReposition;
}());
Chart.winAware = [];
window.addEventListener('resize', Chart.resizeOnWindowEvent);
export {Chart};
