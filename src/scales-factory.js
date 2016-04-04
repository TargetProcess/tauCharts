import {DataFrame} from './data-frame';

export class ScalesFactory {

    constructor(scalesRegistry, sources, scales) {
        this.registry = scalesRegistry;
        this.sources = sources;
        this.scales = scales;
    }

    createScaleInfo(scaleConfig, dataFrame = null) {

        var dim = scaleConfig.dim;
        var src = scaleConfig.source;

        var type = (this.sources[src].dims[dim] || {}).type;
        var data = (this.sources[src].data);

        var frame = dataFrame || (new DataFrame({source: src}, data));

        scaleConfig.dimType = type;

        return this.registry.create(scaleConfig.type, frame, scaleConfig);
    }

    createScaleInfoByName(name, dataFrame = null) {
        return this.createScaleInfo(this.scales[name], dataFrame);
    }
}