import {default as _} from 'underscore';

export class IntervalModel {

    constructor(model = {}) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX || null;
        this.scaleY = model.scaleY || null;
        this.y0 = model.y0 || createFunc(0);
        this.yi = model.yi || createFunc(0);
        this.xi = model.xi || createFunc(0);
        this.size = model.size || createFunc(0);
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

    static decorator_identity(model, {}) {
        return IntervalModel.compose(model);
    }

    static decorator_orientation(model, {xScale, yScale, isHorizontal}) {

        var baseScale = (isHorizontal ? yScale : xScale);
        var valsScale = (isHorizontal ? xScale : yScale);

        var k = (isHorizontal ? (-0.5) : (0.5));

        return IntervalModel.compose(model, {
            scaleX: baseScale,
            scaleY: valsScale,
            y0: (valsScale.discrete ?
                (() => valsScale(valsScale.domain()[0]) + valsScale.stepSize(valsScale.domain()[0]) * k) :
                (() => valsScale(Math.max(0, Math.min(...valsScale.domain()))))),
            yi: ((d) => (valsScale(d[valsScale.dim]))),
            xi: ((d) => (baseScale(d[baseScale.dim])))
        });
    }

    static decorator_size(model, params) {
        var method = (model.scaleX.discrete ?
            IntervalModel.decorator_discrete_size :
            IntervalModel.decorator_continuous_size);

        return method(model, params);
    }

    static decorator_dynamic_size(model, params) {
        var method = (model.scaleX.discrete ?
            IntervalModel.decorator_discrete_dynamic_size :
            IntervalModel.decorator_continuous_size);

        return method(model, params);
    }

    static decorator_continuous_size(model, {sizeScale}) {
        return IntervalModel.compose(model, {
            size: ((d) => (sizeScale(d[sizeScale.dim])))
        });
    }

    static decorator_discrete_size(model, {categories, barsGap}) {
        var categoriesCount = (categories.length || 1);
        var space = ((d) => model.scaleX.stepSize(d[model.scaleX.dim]) * (categoriesCount / (1 + categoriesCount)));
        var fnBarSize = ((d) => (space(d) / categoriesCount));
        var fnGapSize = ((w) => (w > (2 * barsGap)) ? barsGap : 0);

        return IntervalModel.compose(model, {
            size: ((d) => {
                var barSize = fnBarSize(d);
                var gapSize = fnGapSize(barSize);
                return barSize - 2 * gapSize;
            })
        });
    }

    static decorator_discrete_dynamic_size(model, {sizeScale, barsGap}) {
        return IntervalModel.compose(model, {
            size: ((d) => {
                return (model.scaleX.stepSize(d[model.scaleX.dim]) * 0.5 * sizeScale(d[sizeScale.dim]) - (2 * barsGap));
            })
        });
    }

    static decorator_positioningByColor(model, params) {
        var method = (model.scaleX.discrete ?
            IntervalModel.decorator_discrete_positioningByColor :
            IntervalModel.decorator_identity);

        return method(model, params);
    }

    static decorator_discrete_positioningByColor(model, {colorScale, categories, barsGap}) {
        var baseScale = model.scaleX;
        var categoriesCount = (categories.length || 1);
        var colorIndexScale = ((d) => Math.max(0, categories.indexOf(d[colorScale.dim]))); // -1 (not found) to 0
        var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));
        var fnBarSize = ((d) => (space(d) / categoriesCount));

        return IntervalModel.compose(model, {
            xi: ((d) => {
                var absTickStart = (model.xi(d) - (space(d) / 2));
                var relSegmStart = (colorIndexScale(d) * fnBarSize(d));
                var absBarOffset = (model.size(d) * 0.5 + barsGap);
                return absTickStart + relSegmStart + absBarOffset;
            })
        });
    }

    static decorator_color(model, {colorScale}) {
        return IntervalModel.compose(model, {
            color: ((d) => colorScale(d[colorScale.dim]))
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
                return (isPositive ? yScale(nextStack) : yScale(prevStack));
            }),
            y0: memoize((d) => {
                var {isPositive, nextStack, prevStack} = stackY0(d);
                return (isPositive ? yScale(prevStack) : yScale(nextStack));
            })
        });
    }
}