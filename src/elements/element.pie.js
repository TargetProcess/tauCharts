import {CSS_PREFIX} from '../const';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';

export class Pie {

    constructor(config) {
        super();

        this.config = config;
        this.config.guide = this.config.guide || {};
        this.config.guide = _.defaults(
            this.config.guide,
            {
                cssClass: ''
            }
        );
    }

    drawLayout(fnCreateScale) {

        var config = this.config;

        this.proportionScale = fnCreateScale('value', config.proportion);
        this.labelScale = fnCreateScale('value', config.label);
        this.colorScale = fnCreateScale('color', config.color, {});

        return this;
    }

    drawFrames(frames) {

        var config = this.config;

        var options = config.options;

        var proportion = this.proportionScale;
        var label = this.labelScale;
        var color = this.colorScale;

        var w = options.width;
        var h = options.height;
        var r = h / 2;

        var data = frames[0].take();

        var vis = options.container
            .append('svg:svg')
            .data([data])
            .attr('width', w)
            .attr('height', h)
            .append('svg:g')
            .attr('transform', 'translate(' + r + ',' + r + ')');

        var pie = d3.layout.pie().value((d) => d[proportion.dim]);

        // declare an arc generator function
        var arc = d3.svg.arc().outerRadius(r);

        // select paths, use arc generator to draw
        var arcs = vis
            .selectAll('.slice')
            .data(pie)
            .enter().append('g').attr('class', 'slice');

        arcs.append('path')
            .attr('class', (d) => {
                var dm = d.data || {};
                return color(dm[color.dim]);
            })
            .attr('d', (d) => arc(d));

        // add the text
        arcs.append('text')
            .attr('transform', (d) => {
                d.innerRadius = 0;
                d.outerRadius = r;
                return 'translate(' + arc.centroid(d) + ')';
            })
            .attr('text-anchor', 'middle')
            .text((d) => {
                var dm = d.data || {};
                return label(dm[label.dim]);
            });
    }
}