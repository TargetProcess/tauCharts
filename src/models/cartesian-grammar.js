import {default as _} from 'underscore';
import {TauChartError as Error, errorCodes} from './../error';

const delimiter = '(@taucharts@)';
const synthetic = 'taucharts_synthetic_record';

export class CartesianGrammar {

    constructor(model) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX;
        this.scaleY = model.scaleY;
        this.scaleText = model.scaleText;
        this.scaleSize = model.scaleSize;
        this.scaleColor = model.scaleColor;
        this.scaleSplit = model.scaleSplit;

        this.y0 = model.y0 || createFunc(0);
        this.yi = model.yi || createFunc(0);
        this.xi = model.xi || createFunc(0);
        this.size = model.size || createFunc(1);
        this.text = model.text || createFunc('');
        this.color = model.color || createFunc('');
        this.group = model.group || createFunc('');
        this.order = model.order || createFunc(0);
    }

    static compose(prev, updates = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new CartesianGrammar(prev))));
    }

    static decorator_identity(model) {
        return CartesianGrammar.compose(model);
    }

    static decorator_orientation(model, {isHorizontal}) {

        var baseScale = (isHorizontal ? model.scaleY : model.scaleX);
        var valsScale = (isHorizontal ? model.scaleX : model.scaleY);

        return CartesianGrammar.compose(model, {
            scaleX: baseScale,
            scaleY: valsScale,
            yi: ((d) => (valsScale.value(d[valsScale.dim]))),
            xi: ((d) => (baseScale.value(d[baseScale.dim])))
        });
    }

    static decorator_groundY0(model, {isHorizontal}) {
        var k = (isHorizontal ? (-0.5) : (0.5));
        var ys = model.scaleY.domain();
        var min = ys[0];

        // NOTE: max also can be below 0
        var y0 = model.scaleY.discrete ?
            (model.scaleY.value(min) + model.scaleY.stepSize(min) * k) :
            (model.scaleY.value(Math.max(0, Math.min(...ys))));

        return CartesianGrammar.compose(model, {
            y0: (() => y0)
        });
    }

    static decorator_dynamic_size(model, {}) {
        return CartesianGrammar.compose(model, {
            size: ((d) => (model.size(d) * model.scaleSize.value(d[model.scaleSize.dim])))
        });
    }

    static decorator_positioningByColor(model, params) {
        var method = (model.scaleX.discrete ?
            CartesianGrammar.decorator_discrete_positioningByColor :
            CartesianGrammar.decorator_identity);

        return method(model, params);
    }

    static decorator_discrete_positioningByColor(model, {}) {
        var baseScale = model.scaleX;
        var categories = model.scaleColor.domain();
        var categoriesCount = (categories.length || 1);
        var colorIndexScale = ((d) => Math.max(0, categories.indexOf(d[model.scaleColor.dim]))); // -1 (not found) to 0
        var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));

        return CartesianGrammar.compose(model, {
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
        return CartesianGrammar.compose(model, {
            color: ((d) => model.scaleColor.value(d[model.scaleColor.dim]))
        });
    }

    static decorator_text(model, {}) {
        return CartesianGrammar.compose(model, {
            text: ((d) => {
                var raw = model.scaleText.value(d[model.scaleText.dim]);
                var str = ((typeof (raw) === 'undefined') || (raw === null)) ? '' : raw;
                return String(str);
            })
        });
    }

    static decorator_group(model, {}) {
        return CartesianGrammar.compose(model, {
            group: ((d) => (`${d[model.scaleColor.dim]}${delimiter}${d[model.scaleSplit.dim]}`))
        });
    }

    static decorator_groupOrderByColor(model, {}) {

        var order = model.scaleColor.domain();

        return CartesianGrammar.compose(model, {
            order: ((group) => {
                var color = group.split(delimiter)[0];
                var i = order.indexOf(color);
                return ((i < 0) ? Number.MAX_VALUE : i);
            })
        });
    }

    static decorator_groupOrderByAvg(model, {dataSource}) {

        var avg = (arr) => {
            return arr.map(model.yi).reduce(((sum, i) => (sum + i)), 0) / arr.length;
        };

        var groups = dataSource.reduce((memo, row) => {
            var k = model.group(row);
            memo[k] = memo[k] || [];
            memo[k].push(row);
            return memo;
        }, {});

        var order = Object
            .keys(groups)
            .map((k) => ([k, avg(groups[k])]))
            .sort((a, b) => (a[1] - b[1]))
            .map((r) => r[0]);

        return CartesianGrammar.compose(model, {
            order: ((group) => {
                var i = order.indexOf(group);
                return ((i < 0) ? Number.MAX_VALUE : i);
            })
        });
    }

    static decorator_stack(model, {}) {

        var xScale = model.scaleX;
        var yScale = model.scaleY;

        if (yScale.discrete || (yScale.domain().some((x) => typeof (x) !== 'number'))) {
            throw new Error(
                `Stacked field [${yScale.dim}] should be a number`,
                errorCodes.STACKED_FIELD_NOT_NUMBER,
                {field: yScale.dim}
            );
        }

        var createFnStack = (totalState) => {
            return ((d) => {
                var x = d[xScale.dim];
                var y = d[yScale.dim];

                var isPositive = d[synthetic] ? (d[synthetic + 'sign'] === 'positive') : (y >= 0);
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

        return CartesianGrammar.compose(model, {
            yi: memoize((d) => yScale.value(stackYi(d).nextStack)),
            y0: memoize((d) => yScale.value(stackY0(d).prevStack))
        });
    }

    static decorator_size_distribute_evenly(model, {dataSource, minLimit, maxLimit, defMin, defMax}) {

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

        var minDiff = Math.min(diff, stepSize);

        var currMinSize = (typeof (minLimit) === 'number') ? minLimit : defMin;
        var curr = {
            minSize: currMinSize,
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : Math.max(currMinSize, Math.min(defMax, minDiff))
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
            }

            return next;
        });

        return model;
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

    static adjustStaticSizeScale(model, {minLimit, maxLimit, defMin, defMax}) {

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
            }

            return next;
        });

        return model;
    }

    static adjustSigmaSizeScale(model, {dataSource, minLimit, maxLimit, defMin, defMax}) {

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
            .sort(asc)
            .concat(Number.MAX_VALUE)
            [0]);

        var stepSize = model.scaleX.discrete ? (model.scaleX.stepSize() / 2) : Number.MAX_VALUE;

        var maxSize = Math.min(diffX, stepSize);

        var currMinSize = (typeof (minLimit) === 'number') ? minLimit : defMin;
        var maxSizeLimit = (typeof (maxLimit) === 'number') ? maxLimit : defMax;

        var sigma = (x) => {
            var Ab = (currMinSize + maxSizeLimit) / 2;
            var At = maxSizeLimit;
            var X0 = currMinSize;
            var Wx = 0.5;

            return Math.round(Ab + (At - Ab) / (1 + Math.exp(-(x - X0) / Wx)));
        };

        var curr = {
            minSize: currMinSize,
            maxSize: Math.max(currMinSize, Math.min(maxSizeLimit, sigma(maxSize)))
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
            }

            return next;
        });

        return model;
    }

    static toFibers(data, model) {
        var groups = _.groupBy(data, model.group);
        return (Object
            .keys(groups)
            .sort((a, b) => model.order(a) - model.order(b))
            .reduce((memo, k) => memo.concat([groups[k]]), []));
    }

    static isNonSyntheticRecord(row) {
        return row[synthetic] !== true;
    }

    static toStackedFibers(data, model) {

        var dx = model.scaleX.dim;
        var dy = model.scaleY.dim;
        var dc = model.scaleColor.dim;
        var ds = model.scaleSplit.dim;

        var sortedData = data.sort((a, b) => model.xi(a) - model.xi(b));

        var xs = _.uniq(sortedData.map((row) => row[dx]), true);

        var sign = ((row) => ((row[dy] >= 0) ? 'positive' : 'negative'));

        var gen = (x, fi, sign) => {
            var r = {};
            r[dx] = x;
            r[dy] = 0;
            r[ds] = fi[ds];
            r[dc] = fi[dc];
            r[synthetic] = true;
            r[synthetic + 'sign'] = sign; // positive / negative
            return r;
        };

        var merge = (templateSorted, fiberSorted, sign) => {
            var groups = _.groupBy(fiberSorted, (row) => row[dx]);
            var sample = fiberSorted[0];
            return templateSorted.reduce((memo, k) => memo.concat((groups[k] || (gen(k, sample, sign)))), []);
        };

        var groups = _.groupBy(sortedData, model.group);
        return (Object
            .keys(groups)
            .sort((a, b) => model.order(a) - model.order(b))
            .reduce((memo, k) => {
                var bySign = _.groupBy(groups[k], sign);
                return Object.keys(bySign).reduce((memo, s) => memo.concat([merge(xs, bySign[s], s)]), memo);
            },
            []));
    }
}