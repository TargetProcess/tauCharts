import * as utils from './utils/utils';
import {
    GPLSpec,
    GPLSpecScale,
    SpecTransformer,
    Unit
} from './definitions';
import {Plot} from './charts/tau.plot';

export class SpecTransformApplyRatio implements SpecTransformer {

    spec: GPLSpec;
    isApplicable: boolean;

    constructor(spec: GPLSpec) {
        this.spec = spec;
        this.isApplicable = spec.settings.autoRatio && utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform(chartInstance: Plot) {

        var refSpec = this.spec;

        if (!this.isApplicable) {
            return refSpec;
        }

        try {
            this.ruleApplyRatio(refSpec, chartInstance);
        } catch (ex) {
            if (ex.message !== 'Not applicable') {
                throw ex;
            }
        }

        return refSpec;
    }

    ruleApplyRatio(spec: GPLSpec, chartInstance: Plot) {

        var isCoordsRect = (unitRef) => {
            return (unitRef.type === 'COORDS.RECT' || unitRef.type === 'RECT');
        };

        var isElement = (unitRef) => {
            return (unitRef.type.indexOf('ELEMENT.') === 0);
        };

        var traverse = (
            root: Unit,
            enterFn: (unit?: Unit, lvl?: number) => boolean,
            exitFn: (unit?: Unit, lvl?: number) => any,
            level = 0
        ) => {

            var shouldContinue = enterFn(root, level);

            if (shouldContinue) {
                (root.units || []).map((rect) => traverse(rect, enterFn, exitFn, level + 1));
            }

            exitFn(root, level);
        };

        var xs: string[] = [];
        var ys: string[] = [];

        var enterIterator = (unitRef: Unit, level: number) => {

            if ((level > 1) || !isCoordsRect(unitRef)) {
                throw new Error('Not applicable');
            }

            xs.push(unitRef.x);
            ys.push(unitRef.y);

            var units = unitRef.units || [];
            var rects = units
                .map((x) => {

                    if (!(isCoordsRect(x) || isElement(x))) {
                        throw new Error('Not applicable');
                    }

                    return x;
                })
                .filter(isCoordsRect);

            return (rects.length === 1);
        };

        traverse(spec.unit, enterIterator, (() => 0));

        var toScaleConfig = ((scaleName) => spec.scales[scaleName]);
        var isValidScale = ((scale) => ((scale.source === '/') && !scale.ratio && !scale.fitToFrameByDims));
        var isOrdinalScale = ((scale) => {
            return scale.type === 'ordinal' || (scale.type === 'period' && !scale.period);
        });

        var realXs = xs.map(toScaleConfig).filter(isValidScale);
        var realYs = ys.map(toScaleConfig).filter(isValidScale);

        var xyProd = 2;
        if ([realXs.length, realYs.length].some(l => l === xyProd)) {
            let exDim = ((s: GPLSpecScale) => s.dim);
            let scalesIterator = ((s: GPLSpecScale, i: number, list: GPLSpecScale[]) => {
                s.fitToFrameByDims = list.slice(0, i).map(exDim);
            });
            let tryApplyRatioToScales = (axis: string, scalesRef: GPLSpecScale[]) => {
                if (scalesRef.filter(isOrdinalScale).length === xyProd) {
                    scalesRef.forEach(scalesIterator);
                    scalesRef[0].ratio = utils.generateRatioFunction(axis, scalesRef.map(exDim), chartInstance);
                }
            };

            tryApplyRatioToScales('x', realXs);
            tryApplyRatioToScales('y', realYs);
        }
    }
}
