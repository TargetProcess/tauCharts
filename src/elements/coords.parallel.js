import * as d3Axis from 'd3-axis';
import * as d3Brush from 'd3-brush';
import * as d3Selection from 'd3-selection';
const d3 = {
    ...d3Axis,
    ...d3Brush,
    ...d3Selection,
};
import {Element} from './element';
import * as utilsDraw from '../utils/utils-draw';
import * as utils from '../utils/utils';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';

export class Parallel extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = utils.defaults(
            this.config.guide || {},
            {
                padding: {l: 50, r: 50, t: 50, b: 50},
                enableBrushing: false
            });

        this.columnsBrushes = {};
        this.columnsSelections = {};

        this.on('force-brush', (sender, e) => this._forceBrushing(e));

        var options = this.config.options;
        var padding = this.config.guide.padding;
        this.L = options.left + padding.l;
        this.T = options.top + padding.t;
        this.W = options.width - (padding.l + padding.r);
        this.H = options.height - (padding.t + padding.b);
    }

    defineGrammarModel(fnCreateScale) {

        var cfg = this.config;

        var innerWidth = this.W;
        var innerHeight = this.H;

        this.columnsScalesMap = cfg.columns.reduce(
            (memo, xi) => {
                memo[xi] = fnCreateScale('pos', xi, [0, innerHeight]);
                return memo;
            },
            {});

        var step = innerWidth / (cfg.columns.length - 1);

        var colsMap = cfg.columns.reduce(
            (memo, p, i) => {
                memo[p] = (i * step);
                return memo;
            },
            {});

        this.xBase = ((p) => colsMap[p]);

        this.regScale('columns', this.columnsScalesMap);
        return {};
    }

    allocateRect() {
        return {
            slot: ((uid) => this.config.options.container.selectAll(`.uid_${uid}`)),
            left: 0,
            top: 0,
            width: this.W,
            height: this.H,
            // TODO: Fix autoLayout.. redundant properties
            containerWidth: this.W,
            containerHeight: this.H
        };
    }

    drawFrames(frames) {

        var cfg = Object.assign({}, this.config);
        var options = cfg.options;

        var updateCellLayers = (cellId, cell, frame) => {

            var layers = cell
                .selectAll(`.layer_${cellId}`)
                .data(frame.units, (unit) => unit.uid);
            layers
                .exit()
                .remove();
            layers
                .enter()
                .append('g')
                .attr('class', (unit) => `layer_${cellId} uid_${unit.uid}`);
        };

        var cellFrameIterator = function (cellFrame) {
            updateCellLayers(options.frameId, d3.select(this), cellFrame);
        };

        var grid = this._fnDrawGrid(
            options.container,
            cfg,
            options.frameId,
            Object
                .keys(this.columnsScalesMap)
                .reduce((memo, k) => memo.concat([this.columnsScalesMap[k].getHash()]), [])
                .join('_'));

        var frms = grid
            .selectAll(`.parent-frame-${options.frameId}`)
            .data(frames, (f) => f.hash());
        frms.exit()
            .remove();
        frms.enter()
            .append('g')
            .attr('class', (d) => (`${CSS_PREFIX}cell cell parent-frame-${options.frameId} frame-${d.hash()}`))
            .merge(frms)
            .each(cellFrameIterator);

        var cols = this._fnDrawColumns(grid, cfg);

        if (cfg.guide.enableBrushing) {
            this._enableBrushing(cols);
        }
    }

    _fnDrawGrid(container, config, frameId, uniqueHash) {

        var grid = container
            .selectAll(`.grid_${frameId}`)
            .data([uniqueHash], (x) => x);
        grid.exit()
            .remove();
        const merged = grid.enter()
            .append('g')
            .attr('class', `grid grid_${frameId}`)
            .attr('transform', utilsDraw.translate(this.L, this.T))
            .merge(grid);

        return merged;
    }

    _fnDrawColumns(grid, config) {
        var colsGuide = config.guide.columns || {};
        var xBase = this.xBase;
        var columnsScalesMap = this.columnsScalesMap;
        var d3Axis = d3.axisLeft();

        var cols = grid
            .selectAll('.column')
            .data(config.columns, (x) => x);
        cols.exit()
            .remove();
        const merged = cols.enter()
            .append('g')
            .attr('class', 'column')
            .attr('transform', (d) => utilsDraw.translate(xBase(d), 0))
            .call(function (selection) {
                selection.append('g')
                    .attr('class', 'y axis')
                    .each(function (d) {
                        var propName = columnsScalesMap[d].dim;
                        var axisScale = d3Axis.scale(columnsScalesMap[d]);
                        var columnGuide = colsGuide[propName] || {};
                        var formatter = FormatterRegistry.get(columnGuide.tickFormat, columnGuide.tickFormatNullAlias);
                        if (formatter !== null) {
                            axisScale.tickFormat(formatter);
                        }

                        d3.select(this).call(axisScale);
                    })
                    .append('text')
                    .attr('class', 'label')
                    .attr('text-anchor', 'middle')
                    .attr('y', -9)
                    .text((d) => ((colsGuide[d] || {}).label || {}).text || columnsScalesMap[d].dim);
            })
            .merge(cols);

        return merged;
    }

    _enableBrushing(cols) {

        const brushWidth = 16;

        var columnsSelections = this.columnsSelections;
        var columnsScalesMap = this.columnsScalesMap;
        var columnsBrushes = this.columnsBrushes;

        var fireBrushEvents = true;

        var onBrushStartEventHandler = (e) => e;
        var onBrushEndEventHandler = (e) => e;
        var onBrushEventHandler = () => {

            var targetKey = Object.keys(columnsBrushes)
                .find((k) => columnsBrushes[k] === d3Selection.event.target);

            columnsSelections[targetKey] = d3Selection.event.selection;

            if (!fireBrushEvents) {
                return;
            }

            var eventBrush = Object
                .keys(columnsBrushes)
                .filter((k) => columnsSelections[k])
                .map((k) => {
                    var rng = [];
                    if (columnsScalesMap[k].discrete) {
                        let ext = columnsSelections[k];
                        rng = columnsScalesMap[k]
                            .domain()
                            .filter((val) => {
                                var pos = columnsScalesMap[k](val);
                                return (ext[0] <= pos) && (ext[1] >= pos);
                            });
                    } else {
                        let ext = columnsSelections[k].map(columnsScalesMap[k].invert);
                        rng = [ext[0], ext[1]];
                    }

                    return {
                        dim: columnsScalesMap[k].dim,
                        func: columnsScalesMap[k].discrete ? 'inset' : 'between',
                        args: rng
                    };
                });

            this.fire('brush', eventBrush);
        };

        cols.selectAll('.brush')
            .remove();
        cols.append('g')
            .attr('class', 'brush')
            .each(function (d) {
                var range = columnsScalesMap[d].range();
                columnsBrushes[d] = d3
                    .brushY()
                    .extent([[0, range[0]], [brushWidth, range[1]]])
                    .on('start', onBrushStartEventHandler)
                    .on('brush', onBrushEventHandler)
                    .on('end', onBrushEndEventHandler);

                d3.select(this)
                    .classed(`brush-${utils.generateHash(d)}`, true)
                    .call(columnsBrushes[d]);

                fireBrushEvents = false;
                columnsBrushes[d].move(d3.select(this), range);
                fireBrushEvents = true;
            })
            .selectAll('rect')
            .attr('transform', `translate(${(brushWidth / 2) * -1},0)`)
            .attr('width', brushWidth);

        return cols;
    }

    _forceBrushing(colsBrushSettings = {}) {

        var columnsBrushes = this.columnsBrushes;
        var columnsScalesMap = this.columnsScalesMap;
        var columnsSelections = this.columnsSelections;

        Object
            .keys(colsBrushSettings)
            .filter((k) => columnsBrushes[k] && columnsScalesMap[k] && colsBrushSettings[k])
            .forEach((k) => {
                var brushExt = colsBrushSettings[k];
                var ext = [];
                if (columnsScalesMap[k].discrete) {
                    var positions = brushExt.map(columnsScalesMap[k]).filter(x => (x >= 0));
                    var stepSize = columnsScalesMap[k].stepSize() / 2;
                    ext = [Math.min(...positions) - stepSize, Math.max(...positions) + stepSize];
                } else {
                    ext = [brushExt[0], brushExt[1]];
                }
                var hashK = utils.generateHash(k);
                columnsBrushes[k](d3.select(`.brush-${hashK}`));
                columnsBrushes[k].move(d3.select(`.brush-${hashK}`), ext.map(columnsScalesMap[k]));
            });
    }
}
