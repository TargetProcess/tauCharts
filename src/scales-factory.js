export class ScalesFactory {

    constructor(scalesRegistry, sources, scales) {
        this.registry = scalesRegistry;
        this.sources = sources;
        this.scales = scales;

        this.items = {};
        this.cache = {};
    }

    create(scaleConfig, frame, dynamicConfig) {
        return this
            .createScale(scaleConfig, frame)
            .create(dynamicConfig);
    }

    createScale(scaleConfig, frame) {

        var ScaleClass = this.registry.get(scaleConfig.type);

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

    createScaleByName(name, dataFrame = null) {

        var frameHash = dataFrame ? dataFrame.hash() : '';

        var key = `${name}-${frameHash}`;
        var instance;

        if (this.cache.hasOwnProperty(key)) {
            instance = this.cache[key];
        } else {
            instance = this.createScale(this.scales[name], dataFrame);
            this.items[name] = instance;
        }

        return instance;
    }
}