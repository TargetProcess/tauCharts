import {default as _} from 'underscore';
import {utils} from './utils/utils';

export class SpecTransformApplyRatio {

    constructor(spec) {
        this.spec = spec;
    }

    transform(chartInstance) {
        var refSpec = this.spec;

        try {
            this.ruleApplyRatio(refSpec, chartInstance);
        } catch (ex) {
            if (ex.message === 'Not applicable') {
                // ignore
            } else {
                throw ex;
            }
        }

        return refSpec;
    }

    ruleApplyRatio(spec, chartInstance) {

        var isCoordsRect = (unitRef) => {
            return (unitRef.type === 'COORDS.RECT' || unitRef.type === 'RECT');
        };

        var isElement = (unitRef) => {
            return (unitRef.type.indexOf('ELEMENT.') === 0);
        };

        var traverse = (root, enterFn, exitFn, level = 0) => {

            var shouldContinue = enterFn(root, level);

            if (shouldContinue) {
                (root.units || []).map((rect) => traverse(rect, enterFn, exitFn, level + 1));
            }

            exitFn(root, level);
        };

        var xs = [];
        var ys = [];

        var enterIterator = (unitRef, level) => {

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

        traverse(spec.unit, enterIterator, ((unitRef, level) => 0));

        var toScaleConfig = ((scaleName) => spec.scales[scaleName]);
        var isValidScale = ((scale) => ((scale.source === '/') && !scale.ratio && !scale.fitToFrame));
        var isOrdinalScale = ((scale) => (scale.type === 'ordinal'));

        var realXs = xs.map(toScaleConfig).filter(isValidScale);
        var realYs = ys.map(toScaleConfig).filter(isValidScale);

        var xyProd = 2;
        if ((realXs.length * realYs.length) !== xyProd) {
            throw new Error('Not applicable');
        }

        if (realXs.filter(isOrdinalScale).length === xyProd) {
            realXs.forEach((s) => (s.fitToFrame = true));
            realXs[0].ratio = utils.generateRatioFunction(
                'x',
                realXs.map((s) => s.dim),
                chartInstance);
        }

        if (realYs.filter(isOrdinalScale).length === xyProd) {
            realYs.forEach((s) => (s.fitToFrame = true));
            realYs[0].ratio = utils.generateRatioFunction(
                'y',
                realYs.map((s) => s.dim),
                chartInstance);
        }
    }
}