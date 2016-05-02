import {default as _} from 'underscore';

export class IntervalModel {

    constructor(model = {}) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX || null;
        this.scaleY = model.scaleY || null;
        this.scaleSize = model.scaleSize || null;
        this.scaleColor = model.scaleColor || null;

        this.y0 = model.y0 || createFunc(0);
        this.yi = model.yi || createFunc(0);
        this.xi = model.xi || createFunc(0);
        this.size = model.size || createFunc(1);
        this.color = model.color || createFunc('');
    }

    static compose(prev, updates = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new IntervalModel(prev))));
    }

    static decorator_identity(model) {
        return IntervalModel.compose(model);
    }

    static decorator_orientation(model, {isHorizontal}) {

        var baseScale = (isHorizontal ? model.scaleY : model.scaleX);
        var valsScale = (isHorizontal ? model.scaleX : model.scaleY);

        var k = (isHorizontal ? (-0.5) : (0.5));

        return IntervalModel.compose(model, {
            scaleX: baseScale,
            scaleY: valsScale,
            y0: (valsScale.discrete ?
                (() => valsScale.value(valsScale.domain()[0]) + valsScale.stepSize(valsScale.domain()[0]) * k) :
                (() => valsScale.value(Math.max(0, Math.min(...valsScale.domain()))))),
            yi: ((d) => (valsScale.value(d[valsScale.dim]))),
            xi: ((d) => (baseScale.value(d[baseScale.dim])))
        });
    }

    static decorator_dynamic_size(model, {}) {
        return IntervalModel.compose(model, {
            size: ((d) => (model.size(d) * model.scaleSize.value(d[model.scaleSize.dim])))
        });
    }

    static decorator_positioningByColor(model, params) {
        var method = (model.scaleX.discrete ?
            IntervalModel.decorator_discrete_positioningByColor :
            IntervalModel.decorator_identity);

        return method(model, params);
    }

    static decorator_discrete_positioningByColor(model, {}) {
        var baseScale = model.scaleX;
        var categories = model.scaleColor.domain();
        var categoriesCount = (categories.length || 1);
        var colorIndexScale = ((d) => Math.max(0, categories.indexOf(d[model.scaleColor.dim]))); // -1 (not found) to 0
        var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));

        return IntervalModel.compose(model, {
            xi: ((d) => {
                var availableSpace = space(d);
                var absTickStart = (model.xi(d) - (availableSpace / 2));
                var middleStep = (availableSpace / (categoriesCount + 1));
                var relSegmStart = ((1 + colorIndexScale(d)) * middleStep);
                return absTickStart + relSegmStart;
            })
        });
    }

    static decorator_color(model, {}) {
        return IntervalModel.compose(model, {
            color: ((d) => model.scaleColor.value(d[model.scaleColor.dim]))
        });
    }

    static decorator_stack(model, {}) {

        var xScale = model.scaleX;
        var yScale = model.scaleY;

        var createFnStack = (totalState) => {
            return ((d) => {
                var x = d[xScale.dim];
                var y = d[yScale.dim];

                var isPositive = (y >= 0);
                var state = (isPositive ? totalState.positive : totalState.negative);

                let prevStack = (state[x] || 0);
                let nextStack = (prevStack + y);
                state[x] = nextStack;

                return {isPositive, nextStack, prevStack};
            });
        };

        var stackYi = createFnStack({positive: {}, negative: {}});
        var stackY0 = createFnStack({positive: {}, negative: {}});

        var seq = [];
        var memoize = ((fn) => _.memoize(fn, ((d) => {
            var i = seq.indexOf(d);
            if (i < 0) {
                i = ((seq.push(d)) - 1);
            }
            return i;
        })));

        return IntervalModel.compose(model, {
            yi: memoize((d) => {
                var {isPositive, nextStack, prevStack} = stackYi(d);
                return yScale.value(isPositive ? nextStack : prevStack);
            }),
            y0: memoize((d) => {
                var {isPositive, nextStack, prevStack} = stackY0(d);
                return yScale.value(isPositive ? prevStack : nextStack);
            })
        });
    }

    static decorator_size_distribute_evenly(model, {dataSource}) {

        var asc = ((a, b) => (a - b));

        var stepSize = model.scaleX.discrete ? (model.scaleX.stepSize() / 2) : Number.MAX_VALUE;

        var xs = dataSource
            .map((row) => model.xi(row))
            .sort(asc);

        var prev = xs[0];
        var diff = (xs
            .slice(1)
            .map((curr) => {
                var diff = (curr - prev);
                prev = curr;
                return diff;
            })
            .filter(diff => (diff > 0))
            .sort(asc)
            .concat(Number.MAX_VALUE)
            [0]);

        return IntervalModel.compose(model, {
            size: (() => Math.min(diff, stepSize))
        });
    }

    static adjustYScale(model, {dataSource}) {

        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        var trackY = (y) => {
            minY = (y < minY) ? y : minY;
            maxY = (y > maxY) ? y : maxY;
        };

        var scaleY = model.scaleY.value;
        model.scaleY.value = ((y) => {
            trackY(y);
            return scaleY(y);
        });

        dataSource.forEach((row) => {
            model.yi(row);
            model.y0(row);
        });

        model.scaleY.fixup((yScaleConfig) => {

            var newConf = {};

            if (!yScaleConfig.hasOwnProperty('max') || yScaleConfig.max < maxY) {
                newConf.max = maxY;
            }

            if (!yScaleConfig.hasOwnProperty('min') || yScaleConfig.min > minY) {
                newConf.min = minY;
            }

            return newConf;
        });

        return model;
    }

    static adjustSizeScale(model, {dataSource, minLimit, maxLimit, defMin, defMax}) {

        var minSize = Number.MAX_VALUE;
        var maxSize = Number.MIN_VALUE;
        var trackSize = (s) => {
            minSize = (s < minSize) ? s : minSize;
            maxSize = (s > maxSize) ? s : maxSize;
        };

        var trace = IntervalModel.compose(model, {
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
            minSize: (typeof (minLimit) === 'number') ? minLimit : Math.max(defMin, minSize),
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : Math.min(defMax, maxSize)
        };

        model.scaleSize.fixup((prev) => {

            var next = {};

            if (!prev.fixed) {

                next.fixed = true;
                next.minSize = curr.minSize;
                next.maxSize = curr.maxSize;

            } else {

                if (prev.maxSize > curr.maxSize) {
                    next.maxSize = curr.maxSize;
                }

                if (prev.minSize < curr.minSize) {
                    next.minSize = curr.minSize;
                }
            }

            return next;
        });

        return model;
    }
}