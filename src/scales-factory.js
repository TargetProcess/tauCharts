import {scalesRegistry} from './scales-registry';

export class ScalesFactory {

    constructor(sources) {
        this.sources = sources;
    }

    create(scaleConfig, frame, dynamicConfig) {

        var ScaleClass = scalesRegistry.get(scaleConfig.type);

        var dim = scaleConfig.dim;
        var src = scaleConfig.source;

        var type = (this.sources[src].dims[dim] || {}).type;
        var data = (this.sources[src].data);
        var xSrc = {
            part: (() => (frame ? frame.take() : data)),
            full: (() => (data))
        };

        scaleConfig.dimType = type;

        return (new ScaleClass(xSrc, scaleConfig)).create(dynamicConfig);
    }
}