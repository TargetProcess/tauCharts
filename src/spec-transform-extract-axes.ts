import * as utils from './utils/utils';
import {
    GPLSpec,
    SpecTransformer,
    Unit
} from './definitions';
import {Plot} from './charts/tau.plot';

export class SpecTransformExtractAxes implements SpecTransformer {

    spec: GPLSpec;
    isApplicable: boolean;

    constructor(spec: GPLSpec) {
        this.spec = spec;
        this.isApplicable = (spec.settings.layoutEngine === 'EXTRACT') && utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform() {

        var refSpec = this.spec;

        if (!this.isApplicable) {
            return refSpec;
        }

        try {
            this.ruleExtractAxes(refSpec);
        } catch (ex) {
            if (ex.message === 'Not applicable') {
                console.log(`[TauCharts]: can't extract axes for the given chart specification`); // tslint:disable-line
            } else {
                throw ex;
            }
        }

        return refSpec;
    }

    ruleExtractAxes(spec: GPLSpec) {

        var isCoordsRect = (unitRef: Unit) => {
            return (unitRef.type === 'COORDS.RECT' || unitRef.type === 'RECT');
        };

        var isElement = (unitRef: Unit) => {
            return (unitRef.type.indexOf('ELEMENT.') === 0);
        };

        var pad = (x) => (x ? 10 : 0);

        var ttl = {l:0, r:10, t:10, b:0};
        var ttlNoTicks = {l:0, b:0};
        var seq: (typeof ttl)[] = [];
        var seqNoTicks: (typeof ttlNoTicks)[] = [];

        var enterIterator = (unitRef: Unit, level: number) => {

            if ((level > 1) || !isCoordsRect(unitRef)) {
                throw new Error('Not applicable');
            }

            unitRef.guide = unitRef.guide || {};
            var guide = unitRef.guide;

            var p = guide.padding || {l:0, r:0, t:0, b:0};
            var pNoTicks = guide.paddingNoTicks || {l:0, b:0};

            ttl.l += p.l;
            ttl.r += p.r;
            ttl.t += p.t;
            ttl.b += p.b;
            ttlNoTicks.l += pNoTicks.l;
            ttlNoTicks.b += pNoTicks.b;

            seq.push(Object.assign({}, ttl));
            seqNoTicks.push(Object.assign({}, ttlNoTicks));

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

        var exitIterator = (unitRef: Unit) => {

            var lvl = seq.pop();
            var lvlNoTicks = seqNoTicks.pop();

            var guide = unitRef.guide || {};
            guide.x = guide.x || {};
            guide.x.padding = guide.x.padding || 0;
            guide.x.paddingNoTicks = guide.x.paddingNoTicks || 0;
            guide.y = guide.y || {};
            guide.y.padding = guide.y.padding || 0;
            guide.y.paddingNoTicks = guide.y.paddingNoTicks || 0;

            guide.padding = {
                l: pad(unitRef.y),
                r: pad(1),
                t: pad(1),
                b: pad(unitRef.x)
            };
            guide.paddingNoTicks = {
                l: 0,
                b: 0
            };

            guide.autoLayout = 'extract-axes';

            guide.x.padding += (ttl.b - lvl.b);
            guide.y.padding += (ttl.l - lvl.l);
            guide.x.paddingNoTicks += (ttlNoTicks.b - lvlNoTicks.b);
            guide.y.paddingNoTicks += (ttlNoTicks.l - lvlNoTicks.l);
        };

        utils.traverseSpec(spec.unit, enterIterator, exitIterator);

        spec.unit.guide.padding = ttl;
        spec.unit.guide.paddingNoTicks = ttlNoTicks;
    }
}
