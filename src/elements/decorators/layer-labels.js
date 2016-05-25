import {default as _} from 'underscore';
import {LayerLabelsModel} from './layer-labels-model';
import {LayerLabelsRules} from './layer-labels-rules';
import {FormatterRegistry} from '../../formatter-registry';

export class LayerLabels {

    constructor(model, isHorizontal, labelGuide, {width, height, container}) {
        this.container = container;
        var guide = _.defaults(
            (labelGuide || {}),
            {
                fontSize: 10,
                fontColor: '#000',
                position: [],
                tickFormat: null,
                tickFormatNullAlias: ''
            });

        var formatter = FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias);

        var seed = LayerLabelsModel.seed(
            model,
            {
                fontSize: guide.fontSize,
                fontColor: guide.fontColor,
                flip: isHorizontal,
                formatter
            });

        var args = {maxWidth: width, maxHeight: height};

        this.textModel = guide
            .position
            .concat('keep-in-box')
            .map(LayerLabelsRules.getRule)
            .reduce((prev, rule) => LayerLabelsModel.compose(prev, rule(prev, args)), seed);
    }

    draw(fibers) {

        var m = this.textModel;

        var fullData = fibers.reduce((m, f) => m.concat(f), []).filter(m.label);

        var update = function () {
            this.style('fill', m.color)
                .style('font-size', m.h)
                .attr('text-anchor', 'middle')
                .attr('x', m.x)
                .attr('y', m.y)
                .text(m.label);
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