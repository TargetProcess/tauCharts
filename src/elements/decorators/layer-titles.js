import {default as _} from 'underscore';
import {LayerTitlesModel} from './layer-titles-model';
import {LayerTitlesRules} from './layer-titles-rules';
import {FormatterRegistry} from '../../formatter-registry';

export class LayerTitles {

    constructor(container, model, isHorizontal, textGuide, {width, height}) {
        this.container = container;
        var guide = _.defaults(
            (textGuide || {}),
            {
                fontSize: 10,
                fontColor: '#000',
                position: [],
                tickFormat: null,
                tickFormatNullAlias: ''
            });

        var formatter = FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias);

        var seed = LayerTitlesModel.seed(
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
            .map(LayerTitlesRules.getRule)
            .reduce((prev, rule) => LayerTitlesModel.compose(prev, rule(prev, args)), seed);
    }

    draw(fibers) {

        var m = this.textModel;

        var fullData = fibers.reduce((m, f) => m.concat(f), []).filter(m.text);

        var update = function () {
            this.style('fill', m.color)
                .style('font-size', m.h)
                .attr('text-anchor', 'middle')
                .attr('x', m.x)
                .attr('y', m.y)
                .text(m.text);
        };

        var text = this
            .container
            .selectAll('.title')
            .data(fullData);
        text.exit()
            .remove();
        text.call(update);
        text.enter()
            .append('text')
            .attr('class', 'title')
            .call(update);
    }
}