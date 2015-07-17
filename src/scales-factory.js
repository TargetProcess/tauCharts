import {DataFrame} from './data-frame';

export class ScalesFactory {

    constructor(scalesRegistry, sources, scales) {
        this.registry = scalesRegistry;
        this.sources = sources;
        this.scales = scales;
    }

    create(scaleConfig, frame, dynamicConfig) {
        return this
            .createScaleInfo(scaleConfig, frame)
            .create(dynamicConfig);
    }

    createScaleInfo(scaleConfig, dataFrame = null) {

        var ScaleClass = this.registry.get(scaleConfig.type);

        var dim = scaleConfig.dim;
        var src = scaleConfig.source;

        var type = (this.sources[src].dims[dim] || {}).type;
        var data = (this.sources[src].data);

        var frame = dataFrame || (new DataFrame({source: src}, data));

        scaleConfig.dimType = type;

        return (new ScaleClass(frame, scaleConfig));
    }

    createScaleInfoByName(name, dataFrame = null) {
        return this.createScaleInfo(this.scales[name], dataFrame);
    }
}