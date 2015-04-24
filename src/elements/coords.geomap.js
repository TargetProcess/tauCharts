import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {default as topojson} from 'topojson';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';

var unemployment = [
    {id: 1001, rate:.097},
    {id: 1003, rate:.091},
    {id: 1005, rate:.134},
    {id: 1007, rate:.121},
    {id: 1009, rate:.099},
    {id: 1011, rate:.164},
    {id: 1013, rate:.167},
    {id: 1015, rate:.108},
    {id: 1017, rate:.186},
    {id: 1019, rate:.118},
    {id: 1021, rate:.099},
    {id: 1023, rate:.127},
    {id: 1025, rate:.17},
    {id: 1027, rate:.159}
];

export class GeoMap {

    constructor(config) {
        super();

        this.config = config;

        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                // sourcemap: 'http://bl.ocks.org/mbostock/raw/4090846/us.json',
                // contour: 'counties',
                sourcemap: 'https://gist.githubusercontent.com/d3noob/5189184/raw/598d1ebe0c251cd506c8395c60ab1d08520922a7/world-110m2.json',
                contour: 'countries',
                projection: 'mercator',
                projectionScale: 150,
                padding: {l: 0, r: 0, t: 0, b: 0}
            });
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        // y
        this.latScale = fnCreateScale('pos', node.lat, [0, innerHeight]);
        // x
        this.lonScale = fnCreateScale('pos', node.lon, [innerWidth, 0]);
        // size
        this.sizeScale = fnCreateScale('size', node.size);
        // color
        this.colorScale = fnCreateScale('color', node.color);
        // fill
        this.fillScale = fnCreateScale('fill', node.fill);

        this.W = innerWidth;
        this.H = innerHeight;

        return this;
    }

    drawFrames(frames) {

        var width = this.W;
        var height = this.H;
        var guide = this.config.guide;

        var options = this.config.options;
        var node = this.config.options.container;

        d3.json(guide.sourcemap, (e, topoJSONData) => {

            if (e) {
                throw e;
            }

            var latScale = this.latScale;
            var lonScale = this.lonScale;
            var sizeScale = this.sizeScale;
            var colorScale = this.colorScale;
            var fillScale = this.fillScale;

            var lats = d3.extent(latScale.domain());
            var lons = d3.extent(lonScale.domain());

            var scale = guide.projectionScale;
            var offset = [width / 2, height / 2];
            var center = [
                ((lons[1] + lons[0]) / 2),
                ((lats[1] + lats[0]) / 2)
            ];

            var d3Projection = d3
                .geo[guide.projection]()
                .scale(scale)
                .center(center)
                .translate(offset);

            var path = d3.geo.path().projection(d3Projection);

            // using the path determine the bounds of the current map and use
            // these to determine better values for the scale and translation
            var bounds = path.bounds(topojson.feature(topoJSONData, topoJSONData.objects.land));

            var hscale = scale * width  / (bounds[1][0] - bounds[0][0]);
            var vscale = scale * height / (bounds[1][1] - bounds[0][1]);

            scale = (hscale < vscale) ? hscale : vscale;
            offset = [
                width - (bounds[0][0] + bounds[1][0]) / 2,
                height - (bounds[0][1] + bounds[1][1]) / 2
            ];

            // new projection
            d3Projection = d3
                .geo[guide.projection]()
                .center(center)
                .scale(scale)
                .translate(offset);

            path = path.projection(d3Projection);

            var contourObjects = topoJSONData.objects[guide.contour];

            node.append('g')
                .selectAll('path')
                .data(topojson.feature(topoJSONData, contourObjects).features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', (d) => fillScale(d.id));

            node.append('path')
                .datum(topojson.mesh(topoJSONData, contourObjects))
                .attr('fill', 'none')
                .attr('stroke', '#fff')
                .attr('stroke-linejoin', 'round')
                .attr('d', path);

            var update = function () {
                return this
                    .attr({
                        'r': ({data:d}) => sizeScale(d[sizeScale.dim]),
                        'transform': ({data:d}) => `translate(${d3Projection([d[lonScale.dim], d[latScale.dim]])})`,
                        'class': ({data:d}) => colorScale(d[colorScale.dim]),
                        'opacity': 0.5
                    });
            };

            var updateGroups = function () {

                this.attr('class', (f) => `frame-id-${options.uid} frame-${f.hash}`)
                    .call(function () {
                        var points = this
                            .selectAll('circle')
                            .data(frame => frame.data.map(item => ({data: item, uid: options.uid})));
                        points
                            .exit()
                            .remove();
                        points
                            .call(update);
                        points
                            .enter()
                            .append('circle')
                            .call(update);
                    });
            };

            var mapper = (f) => ({tags: f.key || {}, hash: f.hash(), data: f.take()});

            var frameGroups = options.container
                .selectAll('.frame-id-' + options.uid)
                .data(frames.map(mapper), (f) => f.hash);
            frameGroups
                .exit()
                .remove();
            frameGroups
                .call(updateGroups);
            frameGroups
                .enter()
                .append('g')
                .call(updateGroups);
        });
    }
}