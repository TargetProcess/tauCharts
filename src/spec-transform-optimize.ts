import * as utils from './utils/utils';

import {
    ChartSettings,
    GPLSpec,
    Unit
} from './definitions';

export class SpecTransformOptimize {

    static optimizeXAxisLabel(root: Unit, settings: ChartSettings) {
        const {xAxisTickLabelLimit} = settings;

        const enterSpec = (rootUnit: Unit) => {

            if (!rootUnit.guide.x.hide &&
                !rootUnit.guide.x.hideTicks &&
                rootUnit.guide.x.rotate !== 0
            ) {
                rootUnit.guide.x.rotate = 0;
                rootUnit.guide.x.textAnchor = 'middle';

                var tickTextWidth = Math.min(xAxisTickLabelLimit, rootUnit.guide.x.$maxTickTextW);
                var tickTextDelta = (0 - tickTextWidth + rootUnit.guide.x.$maxTickTextH);

                improvePadding(rootUnit, tickTextDelta);
            }

            (rootUnit.units || [])
                .filter((u) => u.type === 'COORDS.RECT')
                .forEach((u) => enterSpec(u));
        };

        const improvePadding = ((unit: Unit, tickTextDelta: number) => {
            if ((root !== unit) && (unit.guide.autoLayout === 'extract-axes')) {
                root.guide.x.padding += tickTextDelta;
                root.guide.padding.b += tickTextDelta;
            } else {
                unit.guide.x.label.padding += (unit.guide.x.label.padding > 0) ? tickTextDelta : 0;
                unit.guide.padding.b += (unit.guide.padding.b > 0) ? tickTextDelta : 0;
            }
        });

        enterSpec(root);
    }

    static hideAxisTicks(root: Unit, settings: ChartSettings, axis: 'x' | 'y') {
        const enterSpec = (rootUnit: Unit) => {
            const pad = (axis === 'x' ? 'b' : 'l');
            const g = rootUnit.guide;

            if (!g[axis].hide && !g[axis].hideTicks) {
                const isFacetContainer = utils.isFacetUnit(rootUnit);
                if (!(isFacetContainer && axis === 'y')) {
                    g[axis].hideTicks = true;
                }
                var hasLabel = (g[axis].label.text && !g[axis].label.hide);
                g.padding[pad] = (g.paddingNoTicks ? g.paddingNoTicks[pad] : 0);
                g[axis].padding = (g[axis].paddingNoTicks || 0);
                g[axis].label.padding = (hasLabel ? g[axis].label.paddingNoTicks : 0);
            }

            (rootUnit.units || [])
                .filter((u) => u.type === 'COORDS.RECT')
                .forEach((u) => enterSpec(u));
        };

        enterSpec(root);
    }

    static facetsLabelsAtTop(root: Unit, settings: ChartSettings) {
        const enterSpec = (unit: Unit) => {
            const children = (unit.units || []);
            const isFacetContainer = utils.isFacetUnit(unit);
            if (isFacetContainer) {
                const g = unit.guide;
                g.y.facetAxis = true;
                g.y.rotate = 0;
                g.y.textAnchor = 'start';
                children.forEach((c) => {
                    c.guide.padding.t = 20;
                });
            }
            children
                .filter((u) => u.type === 'COORDS.RECT')
                .forEach((u) => enterSpec(u));
        };
        enterSpec(root);
    }
}
