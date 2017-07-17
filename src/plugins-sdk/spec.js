import {Unit} from './unit';

class Spec {

    constructor(specRef) {
        this.specRef = specRef;
    }

    value() {
        return this.specRef;
    }

    unit(newUnit) {
        if (newUnit) {
            this.specRef.unit = newUnit;
        }
        return new Unit(this.specRef.unit);
    }

    addTransformation(name, func) {
        this.specRef.transformations = this.specRef.transformations || {};
        this.specRef.transformations[name] = func;
        return this;
    }

    getSettings(name) {
        return this.specRef.settings[name];
    }

    setSettings(name, value) {
        this.specRef.settings = this.specRef.settings || {};
        this.specRef.settings[name] = value;
        return this;
    }

    getScale(name) {
        return this.specRef.scales[name];
    }

    addScale(name, props) {
        this.specRef.scales[name] = props;
        return this;
    }

    regSource(sourceName, sourceObject) {
        this.specRef.sources[sourceName] = sourceObject;
        return this;
    }

    getSourceData(sourceName) {
        var srcData = this.specRef.sources[sourceName] || {data: []};
        return srcData.data;
    }

    getSourceDim(sourceName, sourceDim) {
        var srcDims = this.specRef.sources[sourceName] || {dims: {}};
        return srcDims.dims[sourceDim] || {};
    }
}

export {Spec};
