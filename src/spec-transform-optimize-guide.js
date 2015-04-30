import {utils} from './utils/utils';

var tryOptimizeSpec = (meta, root, size, localSettings) => {

    var mdx = root.guide.x.$minimalDomain || 1;
    var mdy = root.guide.y.$minimalDomain || 1;

    var perTickX = size.width / mdx;
    var perTickY = size.height / mdy;

    var dimXType = meta(root.x);
    var dimYType = meta(root.y);

    var xDensityPadding = localSettings.hasOwnProperty('xDensityPadding:' + dimXType) ?
        localSettings['xDensityPadding:' + dimXType] :
        localSettings.xDensityPadding;

    var yDensityPadding = localSettings.hasOwnProperty('yDensityPadding:' + dimYType) ?
        localSettings['yDensityPadding:' + dimYType] :
        localSettings.yDensityPadding;

    if (root.guide.x.hide !== true &&
        root.guide.x.rotate !== 0 &&
        (perTickX > (root.guide.x.$maxTickTextW + xDensityPadding * 2))) {

        root.guide.x.rotate = 0;
        root.guide.x.textAnchor = 'middle';
        root.guide.x.tickFormatWordWrapLimit = perTickX;
        var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);

        var xDelta = 0 - s + root.guide.x.$maxTickTextH;

        root.guide.padding.b += (root.guide.padding.b > 0) ? xDelta : 0;

        if (root.guide.x.label.padding > (s + localSettings.xAxisPadding)) {
            root.guide.x.label.padding += xDelta;
        }
    }

    if (root.guide.y.hide !== true &&
        root.guide.y.rotate !== 0 &&
        (root.guide.y.tickFormatWordWrapLines === 1) &&
        (perTickY > (root.guide.y.$maxTickTextW + yDensityPadding * 2))) {

        root.guide.y.tickFormatWordWrapLimit = (perTickY - yDensityPadding * 2);
    }

    var newSize = {
        width: perTickX,
        height: perTickY
    };

    (root.units || [])
        .filter((u) => u.type === 'COORDS.RECT')
        .forEach((u) => tryOptimizeSpec(meta, u, newSize, localSettings));
};

export class SpecTransformOptimizeGuide {

    constructor(spec) {
        this.spec = spec;
        this.isApplicable = spec.settings.optimizeGuideBySize && utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform() {

        var refSpec = this.spec;

        if (!this.isApplicable) {
            return refSpec;
        }

        tryOptimizeSpec(
            (scaleName) => {
                var dim = refSpec.scales[scaleName].dim;
                var src = refSpec.scales[scaleName].source;
                var dims = refSpec.sources[src].dims;
                return (dims[dim] || {}).type;
            },
            refSpec.unit,
            {
                width: refSpec.settings.size.width,
                height: refSpec.settings.size.height
            },
            refSpec.settings);

        return refSpec;
    }
}