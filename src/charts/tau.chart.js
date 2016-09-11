import {Plot} from './tau.plot';
import {chartTypesRegistry} from '../chart-alias-registry';
import {default as _} from 'underscore';

class Chart extends Plot {

    constructor(config) {

        var errors = chartTypesRegistry.validate(config.type, config);

        if (errors.length > 0) {
            throw new Error(errors[0]);
        }

        var chartFactory = chartTypesRegistry.get(config.type);

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

Chart.winAware = [];

Chart.resizeOnWindowEvent = (function () {
    let rIndex;

    function requestReposition() {
        if (rIndex || !Chart.winAware.length) {
            return;
        }
        rIndex = window.requestAnimationFrame(resize);
    }

    function resize() {
        rIndex = 0;
        for (let i = 0, l = Chart.winAware.length; i < l; i++) {
            Chart.winAware[i].resize();
        }
    }

    return requestReposition;
}());
window.addEventListener('resize', Chart.resizeOnWindowEvent);

export {Chart};