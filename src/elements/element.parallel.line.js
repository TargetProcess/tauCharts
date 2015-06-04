import {CSS_PREFIX} from '../const';

export class ParallelLine {

    constructor(config) {
        this.config = config;
        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                // params here
            });
    }

    drawLayout(fnCreateScale) {

        var config = this.config;
        var options = config.options;

        this.color = fnCreateScale('color', config.color, {});
        this.scalesMap = config.columns.reduce(
            (memo, xi) => {
                memo[xi] = fnCreateScale('pos', xi, [options.height, 0]);
                return memo;
            },
            {});

        var step = options.width / (config.columns.length - 1);
        var colsMap = config.columns.reduce(
            (memo, p, i) => {
                memo[p] = (i * step);
                return memo;
            },
            {});

        this.xBase = ((p) => colsMap[p]);

        return this;
    }

    drawFrames(frames) {

        var node = this.config;
        var options = this.config.options;

        var scalesMap = this.scalesMap;
        var xBase = this.xBase;
        var color = this.color;

        var d3Line = d3.svg.line();

        var updatePath = function () {
            this.attr('class', (row) => `${CSS_PREFIX}__line line ${color(row[color.dim])}`)
                .attr('d', (row) => d3Line(node.columns.map((p) => [xBase(p), scalesMap[p](row[p])])));
        };

        var updateFrame = function () {
            var path = this
                .selectAll('path')
                .data(f => f.take());
            path.exit()
                .remove();
            path.call(updatePath);
            path.enter()
                .append('path')
                .call(updatePath);
        };

        var part = options.container
            .selectAll('.lines-frame')
            .data(frames, (f => f.hash()));
        part.exit()
            .remove();
        part.call(updateFrame);
        part.enter()
            .append('g')
            .attr('class', 'lines-frame')
            .call(updateFrame);
    }
}