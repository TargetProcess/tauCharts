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

    static decorator_dynamic_size(model, {}) {
        return PointModel.compose(model, {
            size: ((d) => (model.size(d) * model.scaleSize.value(d[model.scaleSize.dim])))
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

    static decorator_size_distribute_evenly(model, {dataSource}) {

        var asc = ((a, b) => (a - b));

        var xs = dataSource.map(((row) => model.xi(row))).sort(asc);

        var prev = xs[0];
        var diffX = (xs
            .slice(1)
            .map((curr) => {
                var diff = (curr - prev);
                prev = curr;
                return diff;
            })
            .filter(diff => (diff > 0))
            .sort(asc));

        var n = diffX.length - 1;
        var minDiff = ((model.scaleX.discrete) ?
            (Math.min(diffX[0], model.scaleX.stepSize() / 2)) :
            (Math.min(diffX[n], Math.log10(1 + diffX[0]) * diffX[n])));

        return PointModel.compose(model, {
            size: (() => minDiff)
        });
    }

    static adjustEvenlyDistributedSizeScale(model, {dataSource, minLimit, maxLimit, defMin, defMax}) {

        var minSize = Number.MAX_VALUE;
        var maxSize = Number.MIN_VALUE;
        var trackSize = (s) => {
            minSize = (s < minSize) ? s : minSize;
            maxSize = (s > maxSize) ? s : maxSize;
        };

        var trace = PointModel.compose(model, {
            size: ((row) => {
                var s = model.size(row);
                trackSize(s);
                return s;
            })
        });

        dataSource.forEach((row) => {
            trace.size(row);
        });

        var curr = {
            minSize: (typeof (minLimit) === 'number') ? minLimit : Math.min(defMax, Math.max(defMin, minSize)),
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : Math.max(defMin, Math.min(defMax, maxSize))
        };

        model.scaleSize.fixup((prev) => {

            var next = {};

            if (!prev.fixed) {

                next.fixed = true;
                next.minSize = curr.minSize;
                next.maxSize = curr.maxSize;

            } else {

                if (prev.maxSize < curr.maxSize) {
                    next.maxSize = curr.maxSize;
                }

                if (prev.minSize > curr.minSize) {
                    next.minSize = curr.minSize;
                }
            }

            return next;
        });

        return model;
    }

    static adjustSizeScale(model, {minLimit, maxLimit, defMin, defMax}) {

        var curr = {
            minSize: (typeof (minLimit) === 'number') ? minLimit : defMin,
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : defMax
        };

        model.scaleSize.fixup((prev) => {

            var next = {};

            if (!prev.fixed) {

                next.fixed = true;
                next.minSize = curr.minSize;
                next.maxSize = curr.maxSize;

            } else {

                if (prev.maxSize < curr.maxSize) {
                    next.maxSize = curr.maxSize;
                }

                if (prev.minSize > curr.minSize) {
                    next.minSize = curr.minSize;
                }
            }

            return next;
        });

        return model;
    }
}