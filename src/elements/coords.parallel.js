import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {
    d3_decorator_wrap_tick_label,
    d3_decorator_prettify_axis_label,
    d3_decorator_fix_axis_bottom_line,
    d3_decorator_fix_horizontal_axis_ticks_overflow,
    d3_decorator_prettify_categorical_axis_ticks
    } from '../utils/d3-decorators';

export class Parallel {

    constructor(config) {

        super();

        this.config = config;

        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                padding: {l: 50, r: 0, t: 50, b: 50}
            });
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        this.W = innerWidth;
        this.H = innerHeight;

        this.scaleObjArr = node.x.map((xi) => fnCreateScale('pos', xi, [innerHeight, 0]));

        return this;
    }

    drawFrames(frames, continuation) {

        var node = _.extend({}, this.config);
        var options = node.options;
        var padding = node.guide.padding;

        var innerW = options.width - (padding.l + padding.r);
        var innerH = options.height - (padding.t + padding.b);

        var updateCellLayers = (cellId, cell, frame) => {

            var frameId = frame.hash();
            var mapper = (unit, i) => {
                unit.options = {
                    uid: frameId + i,
                    frameId: frameId,
                    container: cell,
                    containerWidth: innerW,
                    containerHeight: innerH,
                    left: 0,
                    top: 0,
                    width: innerW,
                    height: innerH
                };
                return unit;
            };

            var continueDrawUnit = function (unit) {
                unit.options.container = d3.select(this);
                continuation(unit, frame);
            };

            var layers = cell
                .selectAll(`.layer_${cellId}`)
                .data(frame.units.map(mapper), (unit) => (unit.options.uid + unit.type));
            layers
                .exit()
                .remove();
            layers
                .each(continueDrawUnit);
            layers
                .enter()
                .append('g')
                .attr('class', `layer_${cellId}`)
                .each(continueDrawUnit);
        };

        var cellFrameIterator = function (cellFrame) {
            updateCellLayers(options.frameId, d3.select(this), cellFrame);
        };

        var frms = this
            ._fnDrawGrid(options.container, node, innerH, innerW, options.frameId, '')
            .selectAll(`.parent-frame-${options.frameId}`)
            .data(frames, (f) => f.hash());
        frms.exit()
            .remove();
        frms.each(cellFrameIterator);
        frms.enter()
            .append('g')
            .attr('class', (d) => (`${CSS_PREFIX}cell cell parent-frame-${options.frameId} frame-${d.hash()}`))
            .each(cellFrameIterator);
    }

    _fnDrawGrid(container, node, height, width, frameId, uniqueHash) {

        var options = node.options;
        var padding = node.guide.padding;
        var xsGuide = node.guide.x || [];

        var l = options.left + padding.l;
        var t = options.top + padding.t;

        var scalesArr = this.scaleObjArr;

        var slot = container
            .append('g')
            .attr('class', 'graphical-report__cell cell')
            .attr('transform', utilsDraw.translate(l, t));

        var fnDrawDimAxis = function (target, scale, offset, labelText) {

            var axisD3 = d3.svg
                .axis()
                .scale(scale)
                .orient('left');

            var axis = target
                .append('g')
                .attr('class', 'y axis')
                .attr('transform', utilsDraw.translate(offset, 0))
                .call(axisD3);

            axis.selectAll('.tick text')
                .attr('transform', utilsDraw.rotate(0))
                .style('text-anchor', 'end');

            target
                .append('text')
                .attr('transform', utilsDraw.translate(offset, -10))
                .attr('text-anchor', 'middle')
                .text(labelText);
        };

        var offset = width / (scalesArr.length - 1);
        scalesArr.forEach((scale, i) => fnDrawDimAxis(slot, scale, i * offset, xsGuide[i].label.text));

        var grid = slot
            .append('g')
            .attr('class', 'grid')
            .attr('transform', utilsDraw.translate(0, 0));

        return grid;
    }
}