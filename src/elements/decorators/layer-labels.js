import {default as _} from 'underscore';
import {utilsDom} from '../../utils/utils-dom';
import {LayerLabelsModel} from './layer-labels-model';
import {LayerLabelsRules} from './layer-labels-rules';
import {FormatterRegistry} from '../../formatter-registry';

export class LayerLabels {

    constructor(model, isHorizontal, labelGuide, {width, height, container}) {
        this.container = container;
        var guide = _.defaults(
            (labelGuide || {}),
            {
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 'normal',
                fontSize: 10,
                fontColor: '#000',
                position: [],
                tickFormat: null,
                tickFormatNullAlias: ''
            });

        this.guide = guide;

        var formatter = FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias);

        var seed = LayerLabelsModel.seed(
            model,
            {
                fontSize: guide.fontSize,
                fontColor: guide.fontColor,
                flip: isHorizontal,
                formatter,
                labelRectSize: (str) => utilsDom.getLabelSize(str, guide),
                paddingKoeff: 0.4
            });

        var args = {maxWidth: width, maxHeight: height};

        this.textModel = guide
            .position
            .concat('keep-in-box')
            .map(LayerLabelsRules.getRule)
            .reduce((prev, rule) => LayerLabelsModel.compose(prev, rule(prev, args)), seed);
    }

    draw(fibers) {

        var self = this;
        var m = this.textModel;

        var fullData = fibers.reduce((m, f) => m.concat(f), []).filter(m.label);
        var textData = fullData.map((row, i) => {
            return {
                i: i,
                x: m.x(row),
                y: m.y(row),
                w: m.w(row),
                h: m.h(row),
                hide: false,
                label: m.label(row),
                color: m.color(row)
            };
        });

        var rect = (a) => {
            var border = 0;
            return {
                x0: a.x - a.w / 2 - border,
                x1: a.x + a.w / 2 + border,
                y0: a.y - a.h / 2 - border,
                y1: a.y + a.h / 2 + border
            };
        };

        var cross = ((a, b) => {
            var ra = rect(a);
            var rb = rect(b);
            var k = !(a.hide * b.hide);

            var x_overlap = k * Math.max(0, Math.min(rb.x1, ra.x1) - Math.max(ra.x0, rb.x0));
            var y_overlap = k * Math.max(0, Math.min(rb.y1, ra.y1) - Math.max(ra.y0, rb.y0));

            if ((x_overlap * y_overlap) > 40) {
                [a, b]
                    .sort((p0, p1) => (p1.y - p0.y) || (p0.x - p1.x))
                    [0]
                    .hide = true;
            }
        });

        textData
            .map((a) => a)
            .sort((a, b) => a.y - b.y)
            .forEach((a) => {
                textData.forEach((b) => {
                    if (a.i !== b.i) {
                        cross(a, b);
                    }
                });
            });

        var get = ((prop) => ((__, i) => textData[i][prop]));

        var update = function () {
            this.style('fill', get('color'))
                .style('font-size', self.guide.fontSize)
                .style('display', ((__, i) => textData[i].hide ? 'none' : null))
                .attr('text-anchor', 'middle')
                .attr('x', get('x'))
                .attr('y', get('y'))
                .text(get('label'));
        };

        var text = this
            .container
            .selectAll('.t-label')
            .data(fullData);
        text.exit()
            .remove();
        text.call(update);
        text.enter()
            .append('text')
            .attr('class', 't-label')
            .call(update);

        return text;
    }
}