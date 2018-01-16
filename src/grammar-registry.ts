import * as utils from './utils/utils';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {TauChartError as Error, errorCodes} from './error';
import {
    GrammarModel,
    GrammarRule,
    ScaleConfig,
    ScaleFunction,
} from './definitions';

interface GrammarRegistryInstance {
    get(name: string): GrammarRule;
    reg(name: string, func: GrammarRule): GrammarRegistryInstance;
}

const rules: {[rule: string]: GrammarRule} = {};
export const GrammarRegistry: GrammarRegistryInstance = {

    get(name: string) {
        return rules[name];
    },

    reg(name: string, func: GrammarRule): GrammarRegistryInstance {
        rules[name] = func;
        return this;
    }
};

const synthetic = 'taucharts_synthetic_record';
const isNonSyntheticRecord = ((row) => row[synthetic] !== true);

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
    .reg('obsoleteVerticalStackOrder', () => {
        return {
            obsoleteVerticalStackOrder: true,
        };
    })
    .reg('positioningByColor', (model) => {

        var method: GrammarRule = (model.scaleX.discrete ?
            ((model) => {
                const dataSource = model.data();
                const xColors = dataSource
                    .reduce((map, row) => {
                        const x = row[model.scaleX.dim];
                        const color = row[model.scaleColor.dim];
                        if (!map.hasOwnProperty(x)) {
                            map[x] = [];
                        }
                        if (map[x].indexOf(color) < 0) {
                            map[x].push(color);
                        }
                        return map;
                    }, {});

                var baseScale = model.scaleX;
                var scaleColor = model.scaleColor;
                var categories = scaleColor.discrete ?
                    scaleColor.domain() :
                    scaleColor.originalSeries().sort((a, b) => a - b);
                var categoriesCount = (categories.length || 1);
                var space = ((d) => baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount)));

                // Sort colors for each X
                const catIndices = categories.reduce((map, c, i) => {
                    map[c] = i;
                    return map;
                }, {});
                Object.keys(xColors).forEach((x) => xColors[x].sort((a, b) => catIndices[a] - catIndices[b]));

                return {
                    xi: ((d) => {
                        const x = d[model.scaleX.dim];
                        const colors = xColors[x] || [d[model.scaleColor.dim]];
                        const total = colors.length;
                        const index = colors.indexOf(d[model.scaleColor.dim]);
                        var availableSpace = space(d);
                        var middleStep = (availableSpace / (categoriesCount + 1));
                        var absTickStart = (model.xi(d) - (total + 1) * middleStep / 2);
                        var relSegmStart = ((1 + index) * middleStep);
                        return absTickStart + relSegmStart;
                    })
                };
            }) :
            (() => ({})));

        return method(model);
    })
    .reg('groupOrderByAvg', (model) => {

        const dataSource = model.data();

        const avg = (arr: any[]) => {
            return arr.map(model.yi).reduce(((sum, i) => (sum + i)), 0) / arr.length;
        };

        const groups = dataSource.reduce<{[group: string]: any[]}>((memo, row) => {
            var k = model.group(row);
            memo[k] = memo[k] || [];
            memo[k].push(row);
            return memo;
        }, {});

        const order = Object
            .keys(groups)
            .map((k) => ([k, avg(groups[k])] as [string, number]))
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

        interface State {
            positive: {[x: string]: number};
            negative: {[x: string]: number};
        }

        const createFnStack = (totalState: State) => {
            return ((d) => {
                const x: string = d[xScale.dim];
                const y: number = d[yScale.dim];

                const state = ((y >= 0) ? totalState.positive : totalState.negative);

                const prevStack = (state[x] || 0);
                const nextStack = (prevStack + y);
                state[x] = nextStack;

                return {nextStack, prevStack};
            });
        };

        const stackYi = createFnStack({positive: {}, negative: {}});
        const stackY0 = createFnStack({positive: {}, negative: {}});

        const memoize = (<T>(fn: (...args) => T) => utils.memoize(fn, model.id));

        var trackedMinY = Number.MAX_VALUE;
        var trackedMaxY = Number.MIN_VALUE;
        const trackAndEval = (y: number) => {
            trackedMinY = (y < trackedMinY) ? y : trackedMinY;
            trackedMaxY = (y > trackedMaxY) ? y : trackedMaxY;
            return yScale.value(y) as number;
        };

        const nextYi = memoize((d) => trackAndEval(stackYi(d).nextStack));
        const nextY0 = memoize((d) => trackAndEval(stackY0(d).prevStack));
        const nextGroup = ((row) => (model.group(row) + '/' + ((row[yScale.dim] >= 0) ? 1 : -1)));

        const groups = utils.groupBy(dataSource, nextGroup);
        const nextData = (Object
            .keys(groups)
            .sort((model.flip || (!model.flip && model.obsoleteVerticalStackOrder) ?
                (a, b) => model.order(a) - model.order(b) :
                (a, b) => model.order(b) - model.order(a)
            ))
            .reduce((memo, k) => memo.concat(groups[k]), []));

        nextData.forEach((row) => {
            nextYi(row);
            nextY0(row);
        });

        yScale.fixup((yScaleConfig) => {

            const newConf: ScaleConfig = {};

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

        const currMinSize: number = (typeof (minLimit) === 'number') ? minLimit : defMin;
        const curr = {
            minSize: currMinSize,
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : Math.max(currMinSize, Math.min(defMax, minDiff))
        };

        model.scaleSize.fixup((prev) => {

            const next: ScaleConfig = {};

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

            var next: ScaleConfig = {};

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

        const sigmoid = (x) => {
            var Ab = (currMinSize + maxSizeLimit) / 2;
            var At = maxSizeLimit;
            var X0 = currMinSize;
            var Wx = 0.5;

            return Math.round(Ab + (At - Ab) / (1 + Math.exp(-(x - X0) / Wx)));
        };

        const curr = {
            minSize: currMinSize,
            maxSize: Math.max(currMinSize, Math.min(maxSizeLimit, sigmoid(maxSize)))
        };

        model.scaleSize.fixup((prev) => {

            const next: ScaleConfig = {};

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

        const fixScale = (scale: ScaleFunction, start, end, flip) => {

            var domain = scale.domain();
            var length = Math.abs(scale.value(domain[1]) - scale.value(domain[0]));
            var koeff = ((domain[1] - domain[0]) / length);
            if (length === 0) {
                return 1;
            }

            var _startPad = Math.max(0, (-start));
            var _endPad = Math.max(0, (end - length));

            var startPad = model.flip ? _endPad : _startPad;
            var endPad = model.flip ? _startPad : _endPad;

            var startVal = Number(domain[0]) - ((flip ? endPad : startPad) * koeff);
            var endVal = Number(domain[1]) + ((flip ? startPad : endPad) * koeff);

            scale.fixup((prev) => {
                var next: ScaleConfig = {};
                if (!prev.fixedBorders) {
                    next.fixed = true;
                    next.min = startVal;
                    next.max = endVal;
                    next.nice = false;
                    next.fixedBorders = [start, end];
                } else {
                    let [resStart, resEnd] = prev.fixedBorders.slice();
                    if (resStart > start || resEnd < end) {
                        next.min = Math.min(prev.min, startVal);
                        next.max = Math.max(prev.max, endVal);
                        resStart = Math.min(start, resStart);
                        resEnd = Math.max(end, resEnd);
                    }
                    next.fixedBorders = [resStart, resEnd];
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
    })
    .reg('fillGaps', (model, {isStack, xPeriod, utc}) => {
        const data = model.data();
        const groups = utils.groupBy(data, model.group);
        const fibers = (Object
            .keys(groups)
            .sort((a, b) => model.order(a) - model.order(b)))
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        const dx = model.scaleX.dim;
        const dy = model.scaleY.dim;
        const dc = model.scaleColor.dim;
        const ds = model.scaleSplit.dim;
        const calcSign = ((row) => ((row[dy] >= 0) ? 1 : -1));

        const gen = (x, sampleRow, sign) => {
            const genId = [x, model.id(sampleRow), sign].join(' ');
            return {
                [dx]: x,
                [dy]: sign * (1e-10),
                [ds]: sampleRow[ds],
                [dc]: sampleRow[dc],
                [synthetic]: true,
                [`${synthetic}id`]: genId
            };
        };

        const merge = (templateSorted, fiberSorted, sign) => {
            const groups = utils.groupBy(fiberSorted, (row) => row[dx]);
            const sample = fiberSorted[0];
            return templateSorted.reduce((memo, k) => memo.concat((groups[k] || (gen(k, sample, sign)))), []);
        };

        const asc = (a, b) => a - b;
        const getUsualXs = () => utils
            .unique(fibers.reduce((memo, fib) => memo.concat(fib.map((row) => row[dx])), []))
            .sort(asc);
        const getPeriodicXs = () => {
            // If there is no data for some period, we should also generate empty data
            const xs = getUsualXs() as Date[];
            const max = Math.max(...xs.map((d) => Number(d)));
            const domain = model.scaleX.domain();
            const ticks = UnitDomainPeriodGenerator
                .generate(domain[0], domain[1], xPeriod, {utc})
                .filter((t) => t >= domain[0] && t <= domain[1]);
            let xIndex = 0;
            const missingTicks = [];
            const period = UnitDomainPeriodGenerator.get(xPeriod, {utc});
            ticks.forEach((t) => {
                const tn = Number(t);
                if (tn >= max) {
                    return;
                }
                for (let i = xIndex; i < xs.length; i++) {
                    if (Number(period.cast(xs[i])) === tn) {
                        xIndex++;
                        return;
                    }
                }
                missingTicks.push(t);
            });
            return xs.concat(missingTicks).sort(asc);
        };
        const xs = (xPeriod ? getPeriodicXs() : getUsualXs());

        const nextData = fibers
            .map((fib) => fib.sort((a, b) => model.xi(a) - model.xi(b)))
            .reduce((isStack ?
                ((memo, fib) => {
                    const bySign = utils.groupBy(fib, (row) => String(calcSign(row)));
                    return Object.keys(bySign).reduce((memo, s) => memo.concat(merge(xs, bySign[s], s)), memo);
                }) :
                ((memo, fib) => {
                    const bySign = utils.groupBy(fib, (row) => String(calcSign(row)));
                    const maxX = Math.max(...fib.map((row) => row[dx]));
                    return memo.concat(merge(xs.filter((x) => x <= maxX), fib, 0));
                })), []);

        return {
            data: () => nextData,
            id: (row) => ((row[synthetic]) ? row[`${synthetic}id`] : model.id(row))
        };
    });
