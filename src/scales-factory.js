import {scalesRegistry} from './scales-registry';

export class ScalesFactory {

    constructor(sources) {
        this.sources = sources;
    }

    create(scaleConfig, frame, dynamicConfig) {
        return this
            .createScale(scaleConfig, frame)
            .create(dynamicConfig);
    }

    createScale(scaleConfig, frame) {

        var ScaleClass = scalesRegistry.get(scaleConfig.type);

        var dim = scaleConfig.dim;
        var src = scaleConfig.source;

        var type = (this.sources[src].dims[dim] || {}).type;
        var data = (this.sources[src].data);
        var xSrc = {
            full: (() => (data)),
            part: (() => (frame ? frame.take() : data)),
            partByDims: ((dims) => (frame ? frame.partByDims(dims) : data))
        };

        scaleConfig.dimType = type;

        return (new ScaleClass(xSrc, scaleConfig));
    }
}