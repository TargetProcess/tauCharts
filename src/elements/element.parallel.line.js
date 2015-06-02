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

        return this;
    }

    drawFrames(frames) {

        var node = this.config;
        var options = this.config.options;
        var guide = node.guide;

        var scalesMap = this.scalesMap;
        var color = this.color;

        var segment = options.width / (node.columns.length - 1);
        var segmentMap = node
            .columns
            .reduce((memo, p, i) => {
                memo[p] = (i * segment);
                return memo;
            },
            {});

        var d3Line = d3.svg
            .line()
            .x((d) => segmentMap[d.key])
            .y((d) => scalesMap[d.key](d.val));

        var updatePaths = function () {
            this.attr('d', d3Line);
        };

        var updateLines = function () {
            var line = this
                .attr('class', (pairs) => `graphical-report__line line ${color(pairs[0].c)}`)
                .selectAll('path')
                .data((d) => ([d]));
            line.exit()
                .remove();
            line.call(updatePaths);
            line.enter()
                .append('path')
                .call(updatePaths);
        };

        var categories = frames.reduce(
            (memo, data) => memo.concat(data
                .take()
                .map((row) => node.columns.map((xi) => ({key: xi, val: row[xi], c: row[color.dim]})))),
            []);

        var elem = options
            .container
            .selectAll('.line')
            .data(categories);
        elem.exit()
            .remove();
        elem.call(updateLines);
        elem.enter()
            .append('g')
            .call(updateLines);
    }
}