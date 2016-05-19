export class LayerTitles {

    constructor(container, model, isHorizontal) {
        this.modelGoG = model;
        this.container = container;
        this.isHorizontal = isHorizontal;
    }

    draw(fibers) {

        var m = this.modelGoG;

        var update = function () {
            this.style('fill', '#000')
                .style('font-size', (d) => `10px`)
                .attr('transform', (d) => {

                    var isPositive = m.scaleY.discrete || (!m.scaleY.discrete && d[m.scaleY.dim] >= 0);

                    var xFont = this.isHorizontal ? 0 : 0;
                    var yFont = this.isHorizontal ? 0 : 10;
                    var k = (isPositive ? -1 : 1) * (yFont *0.5 + 1);
                    var mx = m.xi(d);
                    var my = m.yi(d) + yFont * 0.5;
                    var dx = this.isHorizontal ? k : 0;
                    var dy = this.isHorizontal ? 0 : k;
                    return `translate(${[mx + dx, my + dy]})`;
                })
                .attr('text-anchor', (d) => {
                    var anchor;
                    if (this.isHorizontal) {
                        anchor = (!m.scaleY.discrete && d[m.scaleY.dim] >= 0) ? 'start' : 'end';
                    } else {
                        anchor = 'middle';
                    }
                    return anchor;
                })
                .text((d) => m.text(d));
        };

        var text = this
            .container
            .selectAll('.title')
            .data(fibers.reduce((m, f) => m.concat(f), []).filter(m.text));
        text.exit()
            .remove();
        text.call(update);
        text.enter()
            .append('text')
            .attr('class', 'title')
            .call(update);
    }
}

function elementDecoratorShowText({container, guide, xScale, yScale, textScale}) {

    var xDomain = xScale.domain();
    var yDomain = yScale.domain();

    var isMostLeft = ((d) => (xScale(d[xScale.dim]) === xScale(xDomain[0])));
    var isMostRight = ((d) => (xScale(d[xScale.dim]) === xScale(xDomain[xDomain.length - 1])));
    var isMostTop = ((d) => (yScale(d[yScale.dim]) === yScale(yDomain[yDomain.length - 1])));
    var isMostBottom = ((d) => (yScale(d[yScale.dim]) === yScale(yDomain[0])));

    var fnAnchor = (d) => {

        if (isMostLeft(d)) {
            return 'caption-left-edge';
        }

        if (isMostRight(d)) {
            return 'caption-right-edge';
        }

        if (isMostBottom(d)) {
            return 'caption-bottom-edge';
        }

        if (isMostTop(d)) {
            return 'caption-top-edge';
        }

        return '';
    };

    var fontSize = guide.text.fontSize;

    var captionUpdate = function () {

        if (guide.text.fontColor) {
            this.style('fill', guide.text.fontColor);
        }

        this.attr('class', (d) => `caption ${fnAnchor(d)}`)
            .attr('transform', (d) => {

                var t = isMostTop(d);
                var r = isMostRight(d);
                var b = isMostBottom(d);

                var offsetY = (t ? fontSize : 0);
                var offsetX = ((!r && (t || b)) ? 2 : 0);

                var cx = xScale(d[xScale.dim]) + offsetX + guide.text.paddingX;
                var cy = yScale(d[yScale.dim]) + offsetY + guide.text.paddingY;

                return `translate(${[cx, cy]})`;
            })
            .text((d) => textScale(d[textScale.dim]));
    };

    var text = container
        .selectAll('.caption')
        .data((fiber) => fiber.filter((d) => d[textScale.dim]));
    text.exit()
        .remove();
    text.call(captionUpdate);
    text.enter()
        .append('text')
        .call(captionUpdate);

    return text;
}