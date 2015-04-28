import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {default as topojson} from 'topojson';
import {utilsDraw} from '../utils/utils-draw';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';

var hierarchy = [
    'continents',

    'georegions',

    'countries',

    'regions',
    'states',

    'counties',
    'places',
    'streets'
];

export class GeoMap {

    constructor(config) {
        super();

        this.config = config;
        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                // sourcemap: 'http://bl.ocks.org/mbostock/raw/4090846/us.json',
                projection: 'mercator',
                projectionScale: 150,
                defaultFill: '#C0C0C0',
                padding: {l: 0, r: 0, t: 0, b: 0}
            });
    }

    drawLayout(fnCreateScale) {

        var node = this.config;

        var options = node.options;
        var padding = node.guide.padding;

        var innerWidth = options.width - (padding.l + padding.r);
        var innerHeight = options.height - (padding.t + padding.b);

        // y - latitude
        this.latScale = fnCreateScale('pos', node.latitude, [0, innerHeight]);
        // x - longitude
        this.lonScale = fnCreateScale('pos', node.longitude, [innerWidth, 0]);
        // size
        this.sizeScale = fnCreateScale('size', node.size);
        // color
        this.colorScale = fnCreateScale('color', node.color);

        // code
        this.codeScale = fnCreateScale('value', node.code);
        // fill
        this.fillScale = fnCreateScale('fill', node.fill);

        this.W = innerWidth;
        this.H = innerHeight;

        return this;
    }

    drawFrames(frames) {

        var guide = this.config.guide;

        if (typeof (guide.sourcemap) === 'string') {

            d3.json(guide.sourcemap, (e, topoJSONData) => {

                if (e) {
                    throw e;
                }

                this._drawMap(frames, topoJSONData);
            });

        } else {
            this._drawMap(frames, guide.sourcemap);
        }
    }

    _drawMap(frames, topoJSONData) {

        var guide = this.config.guide;
        var options = this.config.options;
        var node = this.config.options.container;

        if (!(topoJSONData.objects && topoJSONData.objects.land)) {
            throw new Error('Invalid map: map should contain land object');
        }

        var latScale = this.latScale;
        var lonScale = this.lonScale;
        var sizeScale = this.sizeScale;
        var colorScale = this.colorScale;

        var codeScale = this.codeScale;
        var fillScale = this.fillScale;

        var groupByCode = frames.reduce(
            (groups, f) => {
                var data = f.take();
                return data.reduce(
                    (memo, rec) => {
                        var key = rec[codeScale.dim];
                        var val = rec[fillScale.dim];
                        memo[key] = val;
                        return memo;
                    },
                    groups);
            },
            {});

        var contours = hierarchy.filter((h) => topoJSONData.objects.hasOwnProperty(h));

        var contourToFill;
        if (!fillScale.dim) {

            contourToFill = contours[contours.length - 1];

        } else if (codeScale.georole) {

            if (contours.indexOf(codeScale.georole) === -1) {
                console.log(`There is no contour for georole "${codeScale.georole}"`);
                console.log(`Available contours are: ${contours.join(' | ')}`);

                throw new Error(`Invalid [georole]`);
            }

            contourToFill = codeScale.georole;

        } else {
            console.log('Specify [georole] for code scale');
            throw new Error('[georole] is missing');
        }

        var lats = latScale.dim ? d3.extent(latScale.domain()) : [0, 0];
        var lons = lonScale.dim ? d3.extent(lonScale.domain()) : [0, 0];
        var center = [
            ((lons[1] + lons[0]) / 2),
            ((lats[1] + lats[0]) / 2)
        ];

        var d3Projection = this._createProjection(topoJSONData, center);

        var path = d3.geo.path().projection(d3Projection);

        node.append('g')
            .selectAll('path')
            .data(topojson.feature(topoJSONData, topoJSONData.objects[contourToFill]).features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', (d) => {
                var props = d.properties;
                var codes = ['c1', 'c2', 'c3']
                    .filter((c) => (props.hasOwnProperty(c) && props[c] && groupByCode.hasOwnProperty(props[c])));

                var value;
                if (codes.length === 0) {
                    // doesn't match
                    value = guide.defaultFill;
                } else if (codes.length > 0) {
                    value = fillScale(groupByCode[props[codes[0]]]);
                }

                return value;
            })
            .call(function () {
                // TODO: update map with contour objects names
                this.append('title')
                    .text((d) => {
                        var p = d.properties;
                        return p.name;
                    });
            });

        var grayScale = ['#fbfbfb', '#fffefe', '#fdfdff', '#fdfdfd', '#ffffff'];
        contours.forEach((c, i) => {
            node.append('path')
                .datum(topojson.mesh(topoJSONData, topoJSONData.objects[c]))
                .attr('fill', 'none')
                .attr('stroke', grayScale[i])
                .attr('stroke-linejoin', 'round')
                .attr('d', path);
        });

        if (!latScale.dim || !lonScale.dim) {
            return [];
        }

        var update = function () {
            return this
                .attr({
                    r: ({data: d}) => sizeScale(d[sizeScale.dim]),
                    transform: ({data: d}) => `translate(${d3Projection([d[lonScale.dim], d[latScale.dim]])})`,
                    class: ({data: d}) => colorScale(d[colorScale.dim]),
                    opacity: 0.5
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

        return [];
    }

    _createProjection(topoJSONData, center) {

        // The map's scale out is based on the solution:
        // http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object

        var width = this.W;
        var height = this.H;
        var guide = this.config.guide;

        var scale = guide.projectionScale;
        var offset = [width / 2, height / 2];

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
        return d3
            .geo[guide.projection]()
            .center(center)
            .scale(scale)
            .translate(offset);
    }
}