import {CSS_PREFIX} from '../const';
import {Element} from './element';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';

export class Path extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = this.config.guide || {};
        this.config.guide = _.defaults(
            this.config.guide,
            {
                cssClass: '',
                showAnchors: true,
                anchorSize: 0.1
            }
        );

        this.on('highlight', (sender, e) => this.highlight(e));
        this.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        if (this.config.guide.showAnchors) {

            this.on('mouseover', ((sender, e) =>
                sender.fire('highlight-data-points', (row) => (row === e.data))));

            this.on('mouseout', ((sender, e) =>
                sender.fire('highlight-data-points', (row) => (false))));
        }
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);

        this.x0Scale = config.x0 ?
            fnCreateScale('pos', config.x0, [0, config.options.width]) :
            null;

        this.y0Scale = config.y0 ?
            fnCreateScale('pos', config.y0, [config.options.height, 0]) :
            null;

        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});

        return this
            .regScale('x', this.xScale)
            .regScale('x0', this.x0Scale)
            .regScale('y', this.yScale)
            .regScale('y0', this.y0Scale)
            .regScale('size', this.size)
            .regScale('color', this.color);
    }

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;

        var countCss = getLineClassesByCount(frames.length);

        const datumClass = `i-role-datum`;
        const areaPref = `${CSS_PREFIX}area i-role-element area ${countCss} ${guide.cssClass} `;

        var d3Area = d3.svg.area();
        if (guide.flip) {
            var x0Scale = this.x0Scale || this._createDefaultPositionScale(xScale);
            d3Area = d3Area
                .y((d) => yScale(d[yScale.dim]))
                .x1((d) => xScale(d[xScale.dim]))
                .x0((d) => x0Scale(d[x0Scale.dim]));
        } else {
            var y0Scale = this.y0Scale || this._createDefaultPositionScale(yScale);
            d3Area = d3Area
                .x((d) => xScale(d[xScale.dim]))
                .y0((d) => y0Scale(d[y0Scale.dim]))
                .y1((d) => yScale(d[yScale.dim]));
        }

        if (guide.interpolate) {
            d3Area.interpolate(guide.interpolate);
        }

        var updateArea = function () {
            var path = this
                .selectAll('path')
                .data(({data: frame}) => [frame.data]);
            path.exit()
                .remove();
            path.attr('d', d3Area)
                .attr('class', datumClass);
            path.enter()
                .append('path')
                .attr('d', d3Area)
                .attr('class', datumClass);

            self.subscribe(path, function (rows) {

                var m = d3.mouse(this);
                var mx = m[0];
                var my = m[1];

                // d3.invert doesn't work for ordinal axes
                var nearest = rows
                    .map((row) => {
                        var rx = xScale(row[xScale.dim]);
                        var ry = yScale(row[yScale.dim]);
                        return {
                            x: rx,
                            y: ry,
                            dist: Math.sqrt(Math.pow((mx - rx), 2) + Math.pow((my - ry), 2)),
                            data: row
                        };
                    })
                    .sort((a, b) => (a.dist - b.dist)) // asc
                    [0];

                return nearest.data;
            });

            if (guide.showAnchors && !this.empty()) {

                var anchUpdate = function () {
                    return this
                        .attr({
                            r: guide.anchorSize,
                            cx: (d) => xScale(d[xScale.dim]),
                            cy: (d) => yScale(d[yScale.dim]),
                            class: 'i-data-anchor'
                        });
                };

                var anch = this
                    .selectAll('circle')
                    .data(({data: frame}) => frame.data);
                anch.exit()
                    .remove();
                anch.call(anchUpdate);
                anch.enter()
                    .append('circle')
                    .call(anchUpdate);

                self.subscribe(anch);

                if (this.x0Scale) {

                }
            }
        };

        var updateGroups = (x) => {

            return function () {

                this.attr('class', ({data: f}) =>
                    `${areaPref} ${colorScale(f.tags[colorScale.dim])} ${x} frame-${f.hash}`)
                    .call(function () {
                        updateArea.call(this);
                    });
            };
        };

        var mapper = (f) => {
            return {data: {tags: f.key || {}, hash: f.hash(), data: f.part()}, uid: options.uid};
        };

        var drawFrame = (id) => {

            var frameGroups = options.container
                .selectAll(`.frame-${id}`)
                .data(frames.map(mapper), ({data: f}) => f.hash);
            frameGroups
                .exit()
                .remove();
            frameGroups
                .call(updateGroups(`frame-${id}`));
            frameGroups
                .enter()
                .append('g')
                .call(updateGroups(`frame-${id}`));
        };

        drawFrame('area-' + options.uid);
    }

    _createDefaultPositionScale(scale) {
        var domain = scale.domain();
        var minVal = domain[0];
        return ((v) => scale(minVal));
    }

    highlight(filter) {

        this.config
            .options
            .container
            .selectAll('.area')
            .classed({
                'graphical-report__highlighted': (({data: d}) => filter(d.tags) === true),
                'graphical-report__dimmed': (({data: d}) => filter(d.tags) === false)
            });
    }

    highlightDataPoints(filter) {
        var colorScale = this.color;
        const cssClass = 'i-data-anchor';
        this.config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (d) => (filter(d) ? 3 : this.config.guide.anchorSize),
                class: (d) => (`${cssClass} ${colorScale(d[colorScale.dim])}`)
            });
    }
}