export function elementDecoratorShowAnchors({container, guide, xScale, yScale}) {

    var anchorUpdate = function () {
        return this
            .attr({
                r: guide.anchorSize,
                cx: (d) => xScale(d[xScale.dim]),
                cy: (d) => yScale(d[yScale.dim]),
                class: 'i-data-anchor'
            });
    };

    var dots = container
        .selectAll('circle')
        .data(({data: frame}) => frame.data);
    dots.exit()
        .remove();
    dots.call(anchorUpdate);
    dots.enter()
        .append('circle')
        .call(anchorUpdate);

    return dots;
}