import {DataFrame} from './data-frame';
import {ScaleConstructor} from './scales-registry';
import {
    DataSources,
    ScaleConfig
} from './definitions';

interface Scales {
    [scale: string]: ScaleConfig;
}

export class ScalesFactory {

    registry: ScaleConstructor;
    sources: DataSources;
    scales: Scales;

    constructor(scalesRegistry: ScaleConstructor, sources: DataSources, scales: Scales) {
        this.registry = scalesRegistry;
        this.sources = sources;
        this.scales = scales;
    }

    createScaleInfo(scaleConfig: ScaleConfig, dataFrame: DataFrame = null) {

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