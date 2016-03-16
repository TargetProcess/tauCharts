export class SpecTransformOptimize {

    static optimize(root, localSettings) {

        var enterSpec = (rootUnit, xAxisTickLabelLimit, interceptor) => {

            if (rootUnit.guide.x.hide !== true && rootUnit.guide.x.rotate !== 0) {
                rootUnit.guide.x.rotate = 0;
                rootUnit.guide.x.textAnchor = 'middle';

                var tickTextWidth = Math.min(xAxisTickLabelLimit, rootUnit.guide.x.$maxTickTextW);
                var tickTextDelta = (0 - tickTextWidth + rootUnit.guide.x.$maxTickTextH);

                interceptor(rootUnit, tickTextDelta);
            }

            (rootUnit.units || [])
                .filter((u) => u.type === 'COORDS.RECT')
                .forEach((u) => enterSpec(u, xAxisTickLabelLimit, interceptor));
        };

        enterSpec(root, localSettings.xAxisTickLabelLimit, ((unit, tickTextDelta) => {
            if (unit.guide.autoLayout === 'extract-axes') {
                root.guide.x.padding += tickTextDelta;
            } else {
                unit.guide.padding.b += (unit.guide.padding.b > 0) ? tickTextDelta : 0;
                var tickTextWidth = Math.min(localSettings.xAxisTickLabelLimit, unit.guide.x.$maxTickTextW);
                if (unit.guide.x.label.padding > (tickTextWidth + localSettings.xAxisPadding)) {
                    unit.guide.x.label.padding += tickTextDelta;
                }
            }
        }));
    }
}