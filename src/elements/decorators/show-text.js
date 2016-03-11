export function elementDecoratorShowText({container, guide, xScale, yScale, textScale}) {

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