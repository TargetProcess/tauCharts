import {ScalesFactory} from './scales-factory';
import {utils} from './utils/utils';

var tryOptimizeSpec = (root, localSettings) => {

    if (root.guide.x.hide !== true && root.guide.x.rotate !== 0) {
        root.guide.x.rotate = 0;
        root.guide.x.textAnchor = 'middle';
        // root.guide.x.tickFormatWordWrapLimit = perTickX;

        var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);
        var xDelta = 0 - s + root.guide.x.$maxTickTextH;

        root.guide.padding.b += (root.guide.padding.b > 0) ? xDelta : 0;

        if (root.guide.x.label.padding > (s + localSettings.xAxisPadding)) {
            root.guide.x.label.padding += xDelta;
        }
    }

    (root.units || [])
        .filter((u) => u.type === 'COORDS.RECT')
        .forEach((u) => tryOptimizeSpec(u, localSettings));
};

var byMaxText = ((gx) => gx.$maxTickTextW);
var byDensity = ((gx) => gx.density);

var fitModelStrategies = {

    'entire-view': (srcSize, calcSize, specRef) => {

        var widthByMaxText = calcSize('x', specRef.unit, byMaxText);
        if (widthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
        }

        var newW = srcSize.width;
        var newH = srcSize.height;

        return {newW, newH};
    },

    'minimal': (srcSize, calcSize, specRef) => {
        var newW = calcSize('x', specRef.unit, byDensity);
        var newH = calcSize('y', specRef.unit, byDensity);
        return {newW, newH};
    },

    'normal': (srcSize, calcSize, specRef) => {

        var newW;

        var widthByMaxText = calcSize('x', specRef.unit, byMaxText);
        var originalWidth = srcSize.width;

        if (widthByMaxText <= originalWidth) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
            newW = Math.max(originalWidth, widthByMaxText);
        } else {
            newW = Math.max(originalWidth, Math.max(srcSize.width, calcSize('x', specRef.unit, byDensity)));
        }

        var newH = Math.max(srcSize.height, calcSize('y', specRef.unit, byDensity));

        return {newW, newH};
    },

    'fit-width': (srcSize, calcSize, specRef) => {
        var widthByMaxText = calcSize('x', specRef.unit, byMaxText);
        if (widthByMaxText <= srcSize.width) {
            tryOptimizeSpec(specRef.unit, specRef.settings);
        }

        var newW = srcSize.width;
        var newH = calcSize('y', specRef.unit, byDensity);
        return {newW, newH};
    },

    'fit-height': (srcSize, calcSize, specRef) => {
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

    transform() {

        var specRef = this.spec;

        if (!this.isApplicable) {
            return specRef;
        }

        var fitModel = specRef.settings.fitModel;

        if (!fitModel) {
            return specRef;
        }

        var scales = specRef.scales;

        var scalesCreator = new ScalesFactory(specRef.sources);

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

        var calcScaleSize = (xScale, maxTickText) => {

            var r = 0;

            if (['ordinal', 'period'].indexOf(xScale.scaleType) >= 0) {
                var domain = xScale.domain();
                r = maxTickText * domain.length;
            } else {
                r = maxTickText * 4;
            }

            return r;
        };

        var calcSizeRecursively = (prop, root, takeStepSizeStrategy, frame = null) => {

            var xCfg = (prop === 'x') ? scales[root.x] : scales[root.y];
            var yCfg = (prop === 'x') ? scales[root.y] : scales[root.x];
            var guide = root.guide;
            var xSize = (prop === 'x') ? takeStepSizeStrategy(guide.x) : takeStepSizeStrategy(guide.y);

            var resScaleSize = (prop === 'x') ?
                (guide.padding.l + guide.padding.r) :
                (guide.padding.b + guide.padding.t);

            if (root.units[0].type !== 'COORDS.RECT') {

                var xScale = scalesCreator.create(xCfg, frame, [0, 100]);
                return resScaleSize + calcScaleSize(xScale, xSize);

            } else {

                var rows = groupFramesBy(root.frames, yCfg.dim);
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
            let newSize = strategy(srcSize, calcSizeRecursively, specRef);
            newW = newSize.newW;
            newH = newSize.newH;
        }

        var prettifySize = (srcSize, newSize) => {

            var scrollSize = specRef.settings.getScrollBarWidth();

            var recommendedWidth = newSize.width;
            var recommendedHeight = newSize.height;

            var deltaW = (srcSize.width - recommendedWidth);
            var deltaH = (srcSize.height - recommendedHeight);

            var scrollW = (deltaH >= 0) ? 0 : scrollSize;
            var scrollH = (deltaW >= 0) ? 0 : scrollSize;

            return {
                height: recommendedHeight - scrollH,
                width: recommendedWidth - scrollW
            };
        };

        specRef.settings.size = prettifySize(srcSize, {width: newW, height: newH});

        return specRef;
    }
}