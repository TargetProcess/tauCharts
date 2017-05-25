import {CSS_PREFIX} from '../const';
import {Element} from './element';
import * as utils from '../utils/utils';
import * as d3 from 'd3';

export class ParallelLine extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = utils.defaults(
            this.config.guide || {},
            {
                // params here
            });

        this.on('highlight', (sender, e) => this.highlight(e));
    }

    defineGrammarModel(fnCreateScale) {

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

        this.regScale('columns', this.scalesMap)
            .regScale('color', this.color);

        return {};
    }

    drawFrames(frames) {

        var node = this.config;
        var options = this.config.options;

        var scalesMap = this.scalesMap;
        var xBase = this.xBase;
        var color = this.color;

        var d3Line = d3.line();

        var drawPath = function (selection) {
            selection.attr('d',
                (row) => d3Line(node.columns.map((p) => [xBase(p), scalesMap[p](row[scalesMap[p].dim])])));
        };

        var markPath = function (sel) {
            sel.attr('stroke', (row) => color.toColor(color(row[color.dim])))
            sel.attr('class', (row) => `${CSS_PREFIX}__line line ${color.toClass(color(row[color.dim]))} foreground`);
        };

        var updateFrame = function (selection) {
            var backgroundPath = selection
                .selectAll('.background')
                .data(f => f.part());
            backgroundPath
                .exit()
                .remove();
            backgroundPath
                .call(drawPath);
            backgroundPath
                .enter()
                .append('path')
                .attr('class', 'background line')
                .call(drawPath);

            var foregroundPath = selection
                .selectAll('.foreground')
                .data(f => f.part());
            foregroundPath
                .exit()
                .remove();
            foregroundPath
                .call(function (selection) {
                    drawPath(selection);
                    markPath(selection);
                });
            foregroundPath
                .enter()
                .append('path')
                .call(function (selection) {
                    drawPath(selection);
                    markPath(selection);
                });
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

        this.subscribe(options.container.selectAll('.lines-frame .foreground'));
    }

    highlight(filter) {
        this.config
            .options
            .container
            .selectAll('.lines-frame .foreground')
            .style('visibility', (d) => (filter(d) ? '' : 'hidden'));
    }
}