export class PointModel {

    constructor(model = {}) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX || null;
        this.scaleY = model.scaleY || null;
        this.scaleSize = model.scaleSize || null;
        this.scaleColor = model.scaleColor || null;

        this.yi = model.yi || createFunc(0);
        this.xi = model.xi || createFunc(0);
        this.size = model.size || createFunc(1);
        this.color = model.color || createFunc('');
        this.group = model.group || createFunc('');
    }

    static compose(prev, updates = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new PointModel(prev))));
    }

    static decorator_identity(model) {
        return PointModel.compose(model);
    }

    static decorator_orientation(model, {isHorizontal = false}) {

        var baseScale = (isHorizontal ? model.scaleY : model.scaleX);
        var valsScale = (isHorizontal ? model.scaleX : model.scaleY);

        return PointModel.compose(model, {
            scaleX: baseScale,
            scaleY: valsScale,
            yi: ((d) => (valsScale.value(d[valsScale.dim]))),
            xi: ((d) => (baseScale.value(d[baseScale.dim])))
        });
    }

    static decorator_size(model, {}) {
        return PointModel.compose(model, {
            size: ((d) => (model.scaleSize.value(d[model.scaleSize.dim])))
        });
    }

    static decorator_color(model, {}) {
        return PointModel.compose(model, {
            color: ((d) => model.scaleColor.value(d[model.scaleColor.dim]))
        });
    }

    static decorator_group(model, {}) {
        return PointModel.compose(model, {
            group: ((d) => (d[model.scaleColor.dim]))
        });
    }

    static adjustSizeScale(model, {minLimit, maxLimit, defMin, defMax}) {

        var minSize = (typeof (minLimit) === 'number') ? minLimit : Math.max(defMin);
        var maxSize = (typeof (maxLimit) === 'number') ? maxLimit : Math.min(defMax);

        model.scaleSize.fixup((sizeScaleConfig) => {

            var newConf = {};

            if (!sizeScaleConfig.__fixed__) {
                newConf.__fixed__ = true;
                newConf.minSize = minSize;
                newConf.maxSize = maxSize;
                return newConf;
            }

            if (sizeScaleConfig.__fixed__ && sizeScaleConfig.maxSize > maxSize) {
                newConf.maxSize = maxSize;
            }

            if (sizeScaleConfig.__fixed__ && sizeScaleConfig.minSize < minSize) {
                newConf.minSize = minSize;
            }

            return newConf;
        });

        return model;
    }
}