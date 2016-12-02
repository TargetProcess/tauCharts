import {utils} from './utils/utils';
import {TauChartError as Error, errorCodes} from './error';

var rules = {};
var GrammarRegistry = {

    get(name) {
        return rules[name];
    },

    reg(name, func) {
        rules[name] = func;
        return this;
    }
};

GrammarRegistry
    .reg('identity', () => {
        return {};
    })
    .reg('flip', (model) => {
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
    })
    .reg('positioningByColor', (model) => {

        var method = (model.scaleX.discrete ?
            ((model) => {
                var baseScale = model.scaleX;
                var scaleColor = model.scaleColor;
                var categories = scaleColor.discrete ?
                    scaleColor.domain() :
                    scaleColor.originalSeries().sort((a, b) => a - b);
                var categoriesCount = (categories.length || 1);
                // -1 (not found) to 0
                var colorIndexScale = ((d) => Math.max(0, categories.indexOf(d[model.scaleColor.dim])));
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
            }) :
            (() => ({})));

        return method(model);
    })
    .reg('groupOrderByAvg', (model) => {

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
    })
    .reg('stack', (model) => {

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
    })
    .reg('size_distribute_evenly', (model, {minLimit, maxLimit, defMin, defMax}) => {

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
    })
    .reg('adjustStaticSizeScale', (model, {minLimit, maxLimit, defMin, defMax}) => {

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
    })
    .reg('adjustSigmaSizeScale', (model, {minLimit, maxLimit, defMin, defMax}) => {

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
    })
    .reg('avoidScalesOverflow', (model, {sizeDirection}) => {

        // TODO: Don't ignore logarithmic scale,
        // add scale method for extending it's domain.
        const shouldIgnoreScale = (scale, direction) => (
            !scale ||
            scale.discrete ||
            scale.scaleType === 'logarithmic' ||
            sizeDirection.indexOf(direction) < 0
        );

        const ignoreX = shouldIgnoreScale(model.scaleX, 'x');
        const ignoreY = shouldIgnoreScale(model.scaleY, 'y');

        if (ignoreX && ignoreY) {
            return {};
        }

        var plannedMinSize;
        var plannedMaxSize;
        model.scaleSize.fixup((prev) => {
            plannedMinSize = prev.minSize;
            plannedMaxSize = prev.maxSize;
            return prev;
        });

        var border = model.data()
            .reduce((memo, row) => {
                var s = model.size(row);
                var r = ((s >= plannedMinSize ?
                    s :
                    (plannedMinSize + s * (plannedMaxSize - plannedMinSize))
                ) / 2);
                var x, y;
                if (!ignoreX) {
                    x = model.xi(row);
                    memo.left = Math.min(memo.left, x - r);
                    memo.right = Math.max(memo.right, x + r);
                }
                if (!ignoreY) {
                    y = model.yi(row);
                    memo.top = Math.min(memo.top, y - r);
                    memo.bottom = Math.max(memo.bottom, y + r);
                }
                return memo;
            }, {
                top: Number.MAX_VALUE,
                right: -Number.MAX_VALUE,
                bottom: -Number.MAX_VALUE,
                left: Number.MAX_VALUE
            });

        const fixScale = (scale, start, end, flip) => {

            var domain = scale.domain();
            var length = Math.abs(scale.value(domain[1]) - scale.value(domain[0]));
            var koeff = ((domain[1] - domain[0]) / length);

            var _startPad = Math.max(0, (-start));
            var _endPad = Math.max(0, (end - length));

            var startPad = model.flip ? _endPad : _startPad;
            var endPad = model.flip ? _startPad : _endPad;

            var startVal = domain[0] - ((flip ? endPad : startPad) * koeff);
            var endVal = domain[1] + ((flip ? startPad : endPad) * koeff);

            scale.fixup((prev) => {
                var next = {};
                if (!prev.fixed) {
                    next.fixed = true;
                    next.min = startVal;
                    next.max = endVal;
                    next.nice = false;
                } else {
                    if (prev.min > startVal) {
                        next.min = startVal;
                    }

                    if (prev.max < endVal) {
                        next.max = endVal;
                    }
                }

                return next;
            });

            return (length / (startPad + length + endPad));
        };

        var kx = (ignoreX ? 1 : fixScale(model.scaleX, border.left, border.right, false));
        var ky = (ignoreY ? 1 : fixScale(model.scaleY, border.top, border.bottom, true));

        var linearlyScaledMinSize = Math.min(plannedMinSize * kx, plannedMinSize * ky);
        var linearlyScaledMaxSize = Math.min(plannedMaxSize * kx, plannedMaxSize * ky);
        model.scaleSize.fixup(() => ({
            minSize: linearlyScaledMinSize,
            maxSize: linearlyScaledMaxSize
        }));

        return {};
    });

export {GrammarRegistry};