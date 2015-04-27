import {ScalesFactory} from './scales-factory';
import {utils} from './utils/utils';

export class SpecTransformCalcSize {

    constructor(spec) {
        this.spec = spec;
        this.isApplicable = true;

        try {
            utils.traverseSpec(
                spec.unit,
                (unit, level) => {
                    if ((unit.type.indexOf('COORDS.') === 0) && (unit.type !== 'COORDS.RECT')) {
                        throw new Error('Not applicable');
                    }
                },
                () => {}
            );
        } catch (e) {
            if (e.message === 'Not applicable') {
                this.isApplicable = false;
            }
        }
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

        var calcWidth = (prop, root, frame = null) => {

            var xCfg = (prop === 'x') ? scales[root.x] : scales[root.y];
            var yCfg = (prop === 'x') ? scales[root.y] : scales[root.x];
            var guide = root.guide;
            var xSize = (prop === 'x') ?
                Math.max(guide.x.density, guide.x.$maxTickTextW) :
                guide.y.density;

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
                            .map((f) => calcWidth(prop, f.units[0], f))
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

        if (fitModel === 'entire-view') {
            newW = srcSize.width;
            newH = srcSize.height;

        } else if (fitModel === 'minimal') {
            newW = calcWidth('x', specRef.unit);
            newH = calcWidth('y', specRef.unit);

        } else if (fitModel === 'normal') {
            newW = Math.max(srcSize.width, calcWidth('x', specRef.unit));
            newH = Math.max(srcSize.height, calcWidth('y', specRef.unit));

        } else if (fitModel === 'fit-width') {
            newW = srcSize.width;
            newH = calcWidth('y', specRef.unit);

        } else if (fitModel === 'fit-height') {
            newW = calcWidth('x', specRef.unit);
            newH = srcSize.height;
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