import {utils} from '../utils/utils';
import {TauChartError as Error, errorCodes} from './../error';

const delimiter = '(@taucharts@)';

export class CartesianGrammar {

    constructor(model) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX;
        this.scaleY = model.scaleY;
        this.scaleSize = model.scaleSize;
        this.scaleLabel = model.scaleLabel;
        this.scaleColor = model.scaleColor;
        this.scaleSplit = model.scaleSplit;
        this.scaleIdentity = model.scaleIdentity;

        var sid = this.scaleIdentity;
        this.flip = model.flip || false;
        this.id = ((row) => sid.value(row[sid.dim], row));
        this.xi = model.xi || ((d) => model.scaleX.value(d[model.scaleX.dim]));
        this.yi = model.yi || ((d) => model.scaleY.value(d[model.scaleY.dim]));
        this.color = model.color || ((d) => model.scaleColor.value(d[model.scaleColor.dim]));
        this.label = model.label || ((d) => model.scaleLabel.value(d[model.scaleLabel.dim]));
        this.group = model.group || ((d) => (`${d[model.scaleColor.dim]}${delimiter}${d[model.scaleSplit.dim]}`));
        this.size = model.size || ((d) => (model.scaleSize.value(d[model.scaleSize.dim])));

        if (model.y0) {
            this.y0 = model.y0;
        } else {
            const ys = model.scaleY.domain();
            const min = model.scaleY.discrete ?
                ys[0] :
                Math.max(0, Math.min(...ys)); // NOTE: max also can be below 0

            const y0 = model.scaleY.value(min) + model.scaleY.stepSize(min) * 0.5;
            this.y0 = (() => y0);
        }

        this.order = model.order || createFunc(0);
        this.data = model.data || (() => ([]));
    }

    toScreenModel() {
        var flip = this.flip;
        var iff = ((statement, yes, no) => statement ? yes : no);
        var grammarModel = this;
        return {
            flip,
            id: grammarModel.id,
            x: iff(flip, grammarModel.yi, grammarModel.xi),
            y: iff(flip, grammarModel.xi, grammarModel.yi),
            x0: iff(flip, grammarModel.y0, grammarModel.xi),
            y0: iff(flip, grammarModel.xi, grammarModel.y0),
            size: grammarModel.size,
            group: grammarModel.group,
            order: grammarModel.order,
            label: grammarModel.label,
            color: (d) => grammarModel.scaleColor.toColor(grammarModel.color(d)),
            class: (d) => grammarModel.scaleColor.toClass(grammarModel.color(d)),
            model: grammarModel,
            toFibers: () => {
                const data = grammarModel.data();
                const groups = utils.groupBy(data, grammarModel.group);
                return (Object
                    .keys(groups)
                    .sort((a, b) => grammarModel.order(a) - grammarModel.order(b))
                    .reduce((memo, k) => memo.concat([groups[k]]), []));
            }
        };
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
        return model;
    }

    static decorator_flip(model) {

        var baseScale = model.scaleY;
        var valsScale = model.scaleX;

        const k = -0.5;
        const ys = valsScale.domain();
        const min = valsScale.discrete ?
            ys[0] :
            Math.max(0, Math.min(...ys)); // NOTE: max also can be below 0
        const y0 = valsScale.value(min) + valsScale.stepSize(min) * k;

        return {
            flip: true,
            scaleX: baseScale,
            scaleY: valsScale,
            xi: ((d) => (baseScale.value(d[baseScale.dim]))),
            yi: ((d) => (valsScale.value(d[valsScale.dim]))),
            y0: (() => y0)
        };
    }

    static decorator_positioningByColor(model) {

        var method = (model.scaleX.discrete ?
            CartesianGrammar.decorator_discrete_positioningByColor :
            CartesianGrammar.decorator_identity);

        return method(model);
    }

    static decorator_discrete_positioningByColor(model) {
        var baseScale = model.scaleX;
        var scaleColor = model.scaleColor;
        var categories = scaleColor.discrete ?
            scaleColor.domain() :
            scaleColor.originalSeries().sort((a, b) => a - b);
        var categoriesCount = (categories.length || 1);
        var colorIndexScale = ((d) => Math.max(0, categories.indexOf(d[model.scaleColor.dim]))); // -1 (not found) to 0
        var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));

        return {
            xi: ((d) => {
                var availableSpace = space(d);
                var absTickStart = (model.xi(d) - (availableSpace / 2));
                var middleStep = (availableSpace / (categoriesCount + 1));
                var relSegmStart = ((1 + colorIndexScale(d)) * middleStep);
                return absTickStart + relSegmStart;
            })
        };
    }

    static decorator_groupOrderByColor(model) {
        const order = model.scaleColor.domain();
        return {
            order: ((group) => {
                const color = group.split(delimiter)[0];
                const i = order.indexOf(color);
                return ((i < 0) ? Number.MAX_VALUE : i);
            })
        };
    }

    static decorator_groupOrderByAvg(model) {

        const dataSource = model.data();

        const avg = (arr) => {
            return arr.map(model.yi).reduce(((sum, i) => (sum + i)), 0) / arr.length;
        };

        const groups = dataSource.reduce((memo, row) => {
            var k = model.group(row);
            memo[k] = memo[k] || [];
            memo[k].push(row);
            return memo;
        }, {});

        const order = Object
            .keys(groups)
            .map((k) => ([k, avg(groups[k])]))
            .sort((a, b) => (a[1] - b[1]))
            .map((r) => r[0]);

        return {
            order: ((group) => {
                const i = order.indexOf(group);
                return ((i < 0) ? Number.MAX_VALUE : i);
            })
        };
    }

    static decorator_stack(model) {

        const dataSource = model.data();

        const xScale = model.scaleX;
        const yScale = model.scaleY;

        if (yScale.discrete || (yScale.domain().some((x) => typeof (x) !== 'number'))) {
            throw new Error(
                `Stacked field [${yScale.dim}] should be a number`,
                errorCodes.STACKED_FIELD_NOT_NUMBER,
                {field: yScale.dim}
            );
        }

        const createFnStack = (totalState) => {
            return ((d) => {
                const x = d[xScale.dim];
                const y = d[yScale.dim];

                const state = ((y >= 0) ? totalState.positive : totalState.negative);

                const prevStack = (state[x] || 0);
                const nextStack = (prevStack + y);
                state[x] = nextStack;

                return {nextStack, prevStack};
            });
        };

        const stackYi = createFnStack({positive: {}, negative: {}});
        const stackY0 = createFnStack({positive: {}, negative: {}});

        const memoize = ((fn) => utils.memoize(fn, model.id));

        var trackedMinY = Number.MAX_VALUE;
        var trackedMaxY = Number.MIN_VALUE;
        const trackAndEval = (y) => {
            trackedMinY = (y < trackedMinY) ? y : trackedMinY;
            trackedMaxY = (y > trackedMaxY) ? y : trackedMaxY;
            return yScale.value(y);
        };

        const nextYi = memoize((d) => trackAndEval(stackYi(d).nextStack));
        const nextY0 = memoize((d) => trackAndEval(stackY0(d).prevStack));
        const nextGroup = ((row) => (model.group(row) + '/' + ((row[yScale.dim] >= 0) ? 1 : -1)));

        const groups = utils.groupBy(dataSource, nextGroup);
        const nextData = (Object
            .keys(groups)
            .sort((a, b) => model.order(a) - model.order(b))
            .reduce((memo, k) => memo.concat(groups[k]), []));

        nextData.forEach((row) => {
            nextYi(row);
            nextY0(row);
        });

        yScale.fixup((yScaleConfig) => {

            const newConf = {};

            if (!yScaleConfig.hasOwnProperty('max') || yScaleConfig.max < trackedMaxY) {
                newConf.max = trackedMaxY;
            }

            if (!yScaleConfig.hasOwnProperty('min') || yScaleConfig.min > trackedMinY) {
                newConf.min = trackedMinY;
            }

            return newConf;
        });

        return {
            group: nextGroup,
            data: () => nextData,
            yi: nextYi,
            y0: nextY0
        };
    }

    static decorator_size_distribute_evenly(model, {minLimit, maxLimit, defMin, defMax}) {

        const dataSource = model.data();

        const asc = ((a, b) => (a - b));

        const stepSize = model.scaleX.discrete ? (model.scaleX.stepSize() / 2) : Number.MAX_VALUE;

        const xs = dataSource
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

        const minDiff = Math.min(diff, stepSize);

        const currMinSize = (typeof (minLimit) === 'number') ? minLimit : defMin;
        const curr = {
            minSize: currMinSize,
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : Math.max(currMinSize, Math.min(defMax, minDiff))
        };

        model.scaleSize.fixup((prev) => {

            const next = {};

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

        return {};
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

        return {};
    }

    static adjustSigmaSizeScale(model, {minLimit, maxLimit, defMin, defMax}) {

        const dataSource = model.data();

        const asc = ((a, b) => (a - b));

        const xs = dataSource.map(((row) => model.xi(row))).sort(asc);

        var prev = xs[0];
        const diffX = (xs
            .slice(1)
            .map((curr) => {
                const diff = (curr - prev);
                prev = curr;
                return diff;
            })
            .filter(diff => (diff > 0))
            .sort(asc)
            .concat(Number.MAX_VALUE)
            [0]);

        const stepSize = model.scaleX.discrete ? (model.scaleX.stepSize() / 2) : Number.MAX_VALUE;

        const maxSize = Math.min(diffX, stepSize);

        const currMinSize = (typeof (minLimit) === 'number') ? minLimit : defMin;
        const maxSizeLimit = (typeof (maxLimit) === 'number') ? maxLimit : defMax;

        const sigma = (x) => {
            var Ab = (currMinSize + maxSizeLimit) / 2;
            var At = maxSizeLimit;
            var X0 = currMinSize;
            var Wx = 0.5;

            return Math.round(Ab + (At - Ab) / (1 + Math.exp(-(x - X0) / Wx)));
        };

        const curr = {
            minSize: currMinSize,
            maxSize: Math.max(currMinSize, Math.min(maxSizeLimit, sigma(maxSize)))
        };

        model.scaleSize.fixup((prev) => {

            const next = {};

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

        return {};
    }

    static avoidBaseScaleOverflow(model) {

        const dataSource = model.data();

        if (model.scaleX.discrete) {
            return {};
        }

        var plannedMaxSize;
        model.scaleSize.fixup((prev) => {
            plannedMaxSize = prev.maxSize;
            return prev;
        });

        if (plannedMaxSize <= 10) {
            return {};
        }

        var xs = dataSource
            .map((row) => model.xi(row))
            .sort(((a, b) => (a - b)));

        var domain = model.scaleX.domain();
        var length = Math.abs(model.scaleX.value(domain[1]) - model.scaleX.value(domain[0]));
        var koeff = ((domain[1] - domain[0]) / length);

        var lPad = Math.abs(Math.min(0, (xs[0] - plannedMaxSize / 2)));
        var rPad = Math.abs(Math.min(0, (length - (xs[xs.length - 1] + plannedMaxSize / 2))));

        var lxPad = model.flip ? rPad : lPad;
        var rxPad = model.flip ? lPad : rPad;

        var lVal = domain[0] - (lxPad * koeff);
        var rVal = domain[1] - (-1 * rxPad * koeff);

        model.scaleX.fixup((prev) => {
            var next = {};
            if (!prev.fixed) {
                next.fixed = true;
                next.min = lVal;
                next.max = rVal;
            } else {
                if (prev.min > lVal) {
                    next.min = lVal;
                }

                if (prev.max < rVal) {
                    next.max = rVal;
                }
            }

            return next;
        });

        var linearlyScaledMaxSize = plannedMaxSize * (1 - ((lPad + rPad) / length)) - 1;
        model.scaleSize.fixup(() => ({maxSize: linearlyScaledMaxSize}));

        return {};
    }
}
