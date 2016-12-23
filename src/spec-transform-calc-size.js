import {utils} from './utils/utils';
import {SpecTransformOptimize} from './spec-transform-optimize';

var byOptimisticMaxText = ((gx) => gx.$maxTickTextW);
var byPessimisticMaxText = ((gx) => ((gx.rotate == 0) ? gx.$maxTickTextW : gx.$maxTickTextH));
var byDensity = ((gx) => gx.density);

var fitModelStrategies = {

    'entire-view'(srcSize, calcSize, specRef, tryOptimizeSpec) {

        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
        if (widthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
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
        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
        if (widthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
        }

        var newW = srcSize.width;
        var newH = calcSize('y', specRef.unit, byDensity);
        return {newW, newH};
    },

    'fit-height'(srcSize, calcSize, specRef) {
        var newW = calcSize('x', specRef.unit, byDensity);
        var newH = srcSize.height;
        return {newW, newH};
    }
};

export class SpecTransformCalcSize {

    constructor(spec) {
        this.spec = spec;
        this.isApplicable = utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform(chart) {

        var specRef = this.spec;

        if (!this.isApplicable) {
            return specRef;
        }

        var fitModel = specRef.settings.fitModel;

        if (!fitModel) {
            return specRef;
        }

        var scales = specRef.scales;

        var groupFramesBy = (frames, dim) => {
            return frames
                .reduce((memo, f) => {
                    var fKey = f.key || {};
                    var fVal = fKey[dim];
                    memo[fVal] = memo[fVal] || [];
                    memo[fVal].push(f);
                    return memo;
                }, {});
        };

        var calcScaleSize = (scaleInfo, maxTickText) => {

            var r = 0;

            if (scaleInfo.discrete) {
                r = maxTickText * scaleInfo.domain().length;
            } else {
                r = maxTickText * 4;
            }

            return r;
        };

        var calcSizeRecursively = (prop, root, takeStepSizeStrategy, frame = null) => {

            var xCfg = (prop === 'x') ? root.x : root.y;
            var yCfg = (prop === 'x') ? root.y : root.x;
            var guide = root.guide;
            var xSize = (prop === 'x') ? takeStepSizeStrategy(guide.x) : takeStepSizeStrategy(guide.y);

            var resScaleSize = (prop === 'x') ?
                (guide.padding.l + guide.padding.r) :
                (guide.padding.b + guide.padding.t);

            if (root.units[0].type === 'ELEMENT.INTERVAL' &&
                (prop === 'y') === Boolean(root.units[0].flip) &&
                root.units[0].label &&
                !chart.getScaleInfo(root.units[0].label, frame).isEmpty()
            ) {

                const labelFontSize = (guide.label && guide.label.fontSize ? guide.label.fontSize : 10);
                var rowsTotal = root.frames.reduce((sum, f) => f.full().length * labelFontSize, 0);
                var scaleSize = calcScaleSize(chart.getScaleInfo(xCfg, frame), xSize);
                return resScaleSize + Math.max(rowsTotal, scaleSize);

            } else if (root.units[0].type !== 'COORDS.RECT') {

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
            let newSize = strategy(srcSize, calcSizeRecursively, specRef, SpecTransformOptimize.optimize);
            newW = newSize.newW;
            newH = newSize.newH;
        }

        var prettifySize = (srcSize, newSize, rScroll) => {

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