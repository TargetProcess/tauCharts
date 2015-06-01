import {CSS_PREFIX} from '../const';

export class ParallelLine {

    constructor(config) {
        this.config = config;
        this.config.guide = this.config.guide || {};
    }

    drawLayout(fnCreateScale) {

        var config = this.config;
        var options = config.options;

        this.color = fnCreateScale('color', config.color, {});
        this.scalesMap = config.x.reduce(
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

        var scalesMap = this.scalesMap;
        var color = this.color;

        var segment = options.width / (node.x.length - 1);
        var segmentMap = node.x
            .reduce((memo, p, i) => {
                memo[p] = (i * segment);
                return memo;
            },
            {});

        var fnLine = d3.svg
            .line()
            .x((d) => segmentMap[d.key])
            .y((d) => scalesMap[d.key](d.val));

        var updatePaths = function () {
            this.attr('d', fnLine);
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
                .map((row) => node.x.map((xi) => ({key: xi, val: row[xi], c: row[color.dim]})))),
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