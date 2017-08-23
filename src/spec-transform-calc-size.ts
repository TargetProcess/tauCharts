import * as utils from './utils/utils';
import {SpecTransformOptimize} from './spec-transform-optimize';
import {DataFrame} from './data-frame';
import {
    ChartSettings,
    DataFrameObject,
    GPLSpec,
    GPLSpecScale,
    ScaleFields,
    ScaleGuide,
    Size,
    SpecTransformer,
    Unit
} from './definitions';
import {Plot} from './charts/tau.plot';

type StepSizeStrategy = (gx: ScaleGuide) => number;

type FitModelStrategy = (
    srcSize: Size,
    calcSize: (
        axis: 'x' | 'y',
        unit: Unit,
        stepStrategy: StepSizeStrategy,
        frame?: DataFrameObject
    ) => number,
    specRef: GPLSpec,
    tryOptimizeSpec: (unit: Unit, settings: ChartSettings) => void
) => {
        newW: number;
        newH: number
    };

interface FitModelStrategies {
    [strategy: string]: FitModelStrategy;
}

var byOptimisticMaxText: StepSizeStrategy = ((gx) => gx.$maxTickTextW);
var byPessimisticMaxText: StepSizeStrategy = ((gx) => ((gx.rotate == 0) ? gx.$maxTickTextW : gx.$maxTickTextH));
var byDensity: StepSizeStrategy = ((gx) => gx.density);
var getFacetCount = (specRef: GPLSpec) => {
    var xFacetKeys: string[] = [];
    var yFacetKeys: string[] = [];
    var getFacetKeys = (root: Unit) => {
        // TODO: Maybe there is an API to
        // determine X and Y facet keys.
        if (root.type === 'COORDS.RECT' &&
            root.units &&
            root.units[0] &&
            root.units[0].type === 'COORDS.RECT'
        ) {
            var x = root.x.replace(/^x_/, '');
            var y = root.y.replace(/^y_/, '');
            if (x !== 'null') {
                xFacetKeys.push(x);
            }
            if (y !== 'null') {
                yFacetKeys.push(y);
            }
            root.units.forEach(getFacetKeys);
        }
    };
    getFacetKeys(specRef.unit);

    var xFacetGroups: {[key: string]: any[]} = {};
    var yFacetGroups: {[key: string]: any[]} = {};
    var getFacetGroups = (root: Unit) => {
        if (root.type === 'COORDS.RECT') {
            root.frames.forEach((f) => {
                if (f.key) {
                    var keys = Object.keys(f.key);
                    keys.forEach((key) => {
                        if (xFacetKeys.indexOf(key) >= 0) {
                            if (!(key in xFacetGroups)) {
                                xFacetGroups[key] = [];
                            }
                            if (xFacetGroups[key].indexOf(f.key[key]) < 0) {
                                xFacetGroups[key].push(f.key[key]);
                            }
                        }
                        if (yFacetKeys.indexOf(key) >= 0) {
                            if (!(key in yFacetGroups)) {
                                yFacetGroups[key] = [];
                            }
                            if (yFacetGroups[key].indexOf(f.key[key]) < 0) {
                                yFacetGroups[key].push(f.key[key]);
                            }
                        }
                    });
                    if (f.units) {
                        f.units.forEach(getFacetGroups);
                    }
                }
            });
        }
    };
    getFacetGroups(specRef.unit);

    return {
        xFacetCount: Object.keys(xFacetGroups).reduce((sum, key) => sum * xFacetGroups[key].length, 1),
        yFacetCount: Object.keys(yFacetGroups).reduce((sum, key) => sum * yFacetGroups[key].length, 1)
    };
};

var fitModelStrategies: FitModelStrategies = {

    'entire-view'(srcSize, calcSize, specRef, tryOptimizeSpec) {

        var g = specRef.unit.guide;
        var {xFacetCount, yFacetCount} = getFacetCount(specRef);
        var ticksLPad = (g.paddingNoTicks ? (g.padding.l - g.paddingNoTicks.l) : 0);
        var ticksBPad = (g.paddingNoTicks ? (g.padding.b - g.paddingNoTicks.b) : 0);
        var shouldHideXAxis = (
            (g.paddingNoTicks &&
            (srcSize.height - ticksBPad < specRef.settings.minChartHeight)) ||
            (yFacetCount * specRef.settings.minFacetHeight + ticksBPad > srcSize.height) ||
            (xFacetCount * specRef.settings.minFacetWidth + ticksLPad > srcSize.width)
        );
        var shouldHideYAxis = (
            (g.paddingNoTicks &&
            (srcSize.width - ticksLPad < specRef.settings.minChartWidth)) ||
            (yFacetCount * specRef.settings.minFacetHeight + ticksBPad > srcSize.height) ||
            (xFacetCount * specRef.settings.minFacetWidth + ticksLPad > srcSize.width)
        );
        if (shouldHideXAxis) {
            SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
        }
        if (shouldHideYAxis) {
            SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
        }

        var normalW = srcSize.width;
        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
        if (widthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
        } else {
            var pessimisticWidthByMaxText = calcSize('x', specRef.unit, byPessimisticMaxText);
            if (pessimisticWidthByMaxText > srcSize.width) {
                var widthByDensity = Math.max(srcSize.width, calcSize('x', specRef.unit, byDensity));
                normalW = Math.min(pessimisticWidthByMaxText, widthByDensity);
            }
        }
        var normalH = Math.max(srcSize.height, calcSize('y', specRef.unit, byDensity));

        if (!shouldHideXAxis && (normalW > srcSize.width)) {
            SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
        }

        if (!shouldHideYAxis && (normalH > srcSize.height)) {
            SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
        }

        var newW = srcSize.width;
        var newH = srcSize.height;

        return {newW, newH};
    },

    minimal(srcSize, calcSize, specRef) {
        var newW = calcSize('x', specRef.unit, byDensity);
        var newH = calcSize('y', specRef.unit, byDensity);
        return {newW, newH};
    },

    normal(srcSize, calcSize, specRef, tryOptimizeSpec) {

        var g = specRef.unit.guide;
        if (g.paddingNoTicks) {
            if (srcSize.width - g.padding.l + g.paddingNoTicks.l < specRef.settings.minChartWidth) {
                SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
            }
            if (srcSize.height - g.padding.b + g.paddingNoTicks.b < specRef.settings.minChartHeight) {
                SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
            }
        }

        var newW = srcSize.width;

        var optimisticWidthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
        if (optimisticWidthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
        } else {
            var pessimisticWidthByMaxText = calcSize('x', specRef.unit, byPessimisticMaxText);
            if (pessimisticWidthByMaxText > srcSize.width) {
                var widthByDensity = Math.max(srcSize.width, calcSize('x', specRef.unit, byDensity));
                newW = Math.min(pessimisticWidthByMaxText, widthByDensity);
            }
        }

        var newH = Math.max(srcSize.height, calcSize('y', specRef.unit, byDensity));

        return {newW, newH};
    },

    'fit-width'(srcSize, calcSize, specRef, tryOptimizeSpec) {

        var g = specRef.unit.guide;
        var ticksLPad = (g.paddingNoTicks ? (g.padding.l - g.paddingNoTicks.l) : 0);
        if ((g.paddingNoTicks &&
            (srcSize.width - ticksLPad < specRef.settings.minChartWidth)) ||
            (getFacetCount(specRef).xFacetCount * specRef.settings.minFacetWidth + ticksLPad > srcSize.width)
        ) {
            SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
        }
        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
        if (widthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
        }

        var newW = srcSize.width;
        var newH = calcSize('y', specRef.unit, byDensity);
        return {newW, newH};
    },

    'fit-height'(srcSize, calcSize, specRef) {

        var g = specRef.unit.guide;
        var ticksBPad = (g.paddingNoTicks ? (g.padding.b - g.paddingNoTicks.b) : 0);
        if ((g.paddingNoTicks &&
            (srcSize.height - ticksBPad < specRef.settings.minChartHeight)) ||
            (getFacetCount(specRef).yFacetCount * specRef.settings.minFacetHeight + ticksBPad > srcSize.height)
        ) {
            SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
        }
        var newW = calcSize('x', specRef.unit, byDensity);
        var newH = srcSize.height;
        return {newW, newH};
    }
};

export class SpecTransformCalcSize implements SpecTransformer {

    spec: GPLSpec;
    isApplicable: boolean;

    constructor(spec: GPLSpec) {
        this.spec = spec;
        this.isApplicable = utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform(chart: Plot) {

        var specRef = this.spec;

        if (!this.isApplicable) {
            return specRef;
        }

        var fitModel = specRef.settings.fitModel;

        if (!fitModel) {
            return specRef;
        }

        var scales = specRef.scales;

        var groupFramesBy = (frames: DataFrameObject[], dim: string) => {
            return frames
                .reduce((memo, f) => {
                    var fKey = f.key || {};
                    var fVal = fKey[dim];
                    memo[fVal] = memo[fVal] || [];
                    memo[fVal].push(f);
                    return memo;
                }, {} as {[val: string]: DataFrameObject[]});
        };

        var calcScaleSize = (scaleInfo: ScaleFields, maxTickText: number) => {

            var r = 0;

            if (scaleInfo.discrete) {
                r = maxTickText * scaleInfo.domain().length;
            } else {
                r = maxTickText * 4;
            }

            return r;
        };

        var calcSizeRecursively = (
            prop: 'x' | 'y',
            root: Unit,
            takeStepSizeStrategy: StepSizeStrategy,
            frame: DataFrameObject = null
        ) => {

            var xCfg = (prop === 'x') ? root.x : root.y;
            var yCfg = (prop === 'x') ? root.y : root.x;
            var guide = root.guide;
            var xSize = (prop === 'x') ? takeStepSizeStrategy(guide.x) : takeStepSizeStrategy(guide.y);
            const firstUnit = root.units[0];

            var resScaleSize = (prop === 'x') ?
                (guide.padding.l + guide.padding.r) :
                (guide.padding.b + guide.padding.t);

            if (firstUnit.type === 'ELEMENT.INTERVAL' &&
                (prop === 'y') === Boolean(firstUnit.flip) &&
                firstUnit.label &&
                !chart.getScaleInfo(firstUnit.label, frame).isEmpty()
            ) {

                const labelFontSize = (guide.label && guide.label.fontSize ? guide.label.fontSize : 10);
                const labelHeight = (labelFontSize * 2);
                const xScale = chart.getScaleInfo(xCfg, frame);
                const distributeByColor = (firstUnit.guide.enableColorToBarPosition == null ?
                    !firstUnit.stack :
                    firstUnit.guide.enableColorToBarPosition);
                let kColor = 1;
                if (distributeByColor) {
                    const colorCfg = firstUnit.color;
                    if (colorCfg) {
                        const colorScale = chart.getScaleInfo(colorCfg, frame);
                        const allColors = colorScale.domain();
                        kColor = allColors.length;
                    }
                }
                const getFrameHeight = ((f: DataFrame) => {
                    const allX = f.part().map((d) => d[xScale.dim]);
                    const allUnitX = f.part().map((d) => d[xScale.dim]);
                    const xCount = utils.unique(allX).length;
                    return (xCount * kColor * labelHeight);
                });
                const rowsTotal = root.frames.reduce((sum, f) => sum + getFrameHeight(f), 0);
                const scaleSize = calcScaleSize(xScale, xSize);
                return resScaleSize + Math.max(rowsTotal, scaleSize);

            } else if (firstUnit.type !== 'COORDS.RECT') {

                var xScale = chart.getScaleInfo(xCfg, frame);
                return resScaleSize + calcScaleSize(xScale, xSize);

            } else {

                var rows = groupFramesBy(root.frames, scales[yCfg].dim);
                var rowsSizes = Object
                    .keys(rows)
                    .map((kRow) => {
                        return rows[kRow]
                            .map((f) => calcSizeRecursively(prop, f.units[0], takeStepSizeStrategy, f))
                            .reduce((sum, size) => (sum + size), 0);
                    });

                // pick up max row size
                var maxRowSize = Math.max(...rowsSizes);
                return resScaleSize + maxRowSize;
            }
        };

        var srcSize = specRef.settings.size;

        var newW = srcSize.width;
        var newH = srcSize.height;

        var strategy = fitModelStrategies[fitModel];
        if (strategy) {
            let newSize = strategy(srcSize, calcSizeRecursively, specRef, SpecTransformOptimize.optimizeXAxisLabel);
            newW = newSize.newW;
            newH = newSize.newH;
        }

        var prettifySize = (srcSize: Size, newSize: Size, rScroll: number) => {

            var scrollSize = specRef.settings.getScrollbarSize(chart.getLayout().contentContainer);

            var recommendedWidth = (
                (newSize.width > srcSize.width && newSize.width <= srcSize.width * rScroll) ?
                    srcSize.width :
                    newSize.width
            );
            var recommendedHeight = (
                (newSize.height > srcSize.height && newSize.height <= srcSize.height * rScroll) ?
                    srcSize.height :
                    newSize.height
            );

            var deltaW = (srcSize.width - recommendedWidth);
            var deltaH = (srcSize.height - recommendedHeight);

            var scrollW = (deltaH >= 0) ? 0 : scrollSize.width;
            var scrollH = (deltaW >= 0) ? 0 : scrollSize.height;

            return {
                height: recommendedHeight - scrollH,
                width: recommendedWidth - scrollW
            };
        };

        specRef.settings.size = prettifySize(
            srcSize,
            {width: newW, height: newH},
            specRef.settings.avoidScrollAtRatio
        );

        return specRef;
    }
}
