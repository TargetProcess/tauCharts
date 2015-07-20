import {default as d3} from 'd3';
import {default as _} from 'underscore';
import {default as topojson} from 'topojson';
import {utilsDraw} from '../utils/utils-draw';
import {d3Labeler} from '../utils/d3-labeler';
import {CSS_PREFIX} from '../const';
import {FormatterRegistry} from '../formatter-registry';
import {Element} from './element';

d3.labeler = d3Labeler;

const avgCharSize = 5.5;
const iterationsCount = 10;
const pointOpacity = 0.5;

var hierarchy = [

    'land',

    'continents',

    'georegions',

    'countries',

    'regions',
    'subunits',
    'states',

    'counties'
];

export class GeoMap extends Element {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(
            this.config.guide || {},
            {
                defaultFill: 'rgba(128,128,128,0.25)',
                padding: {l: 0, r: 0, t: 0, b: 0},
                showNames: true
            });
        this.contourToFill = null;

        this.on('highlight-area', (sender, e) => this._highlightArea(e));
        this.on('highlight-point', (sender, e) => this._highlightPoint(e));
        this.on('highlight', (sender, e) => this._highlightPoint(e));
    }

    createScales(fnCreateScale) {

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

        return this
            .regScale('latitude', this.latScale)
            .regScale('longitude', this.lonScale)
            .regScale('size', this.sizeScale)
            .regScale('color', this.colorScale)
            .regScale('code', this.codeScale)
            .regScale('fill', this.fillScale);
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

    _calcLabels(topoJSONData, reverseContours, path) {

        var innerW = this.W;
        var innerH = this.H;

        var labelsHashRef = {};

        reverseContours.forEach((c) => {

            var contourFeatures = topojson.feature(topoJSONData, topoJSONData.objects[c]).features || [];

            var labels = contourFeatures
                .map((d) => {

                    var info = (d.properties || {});

                    var center = path.centroid(d);
                    var bounds = path.bounds(d);

                    var sx = center[0];
                    var sy = center[1];

                    var br = bounds[1][0];
                    var bl = bounds[0][0];
                    var size = br - bl;
                    var name = info.name || '';
                    var abbr = info.abbr || name;
                    var isAbbr = (size < (name.length * avgCharSize));
                    var text = isAbbr ? abbr : name;
                    var isRef = (size < (2.5 * avgCharSize));
                    var r = (isRef ? (innerW - sx - 3 * avgCharSize) : 0);

                    return {
                        id: `${c}-${d.id}`,
                        sx: sx,
                        sy: sy,
                        x: sx + r,
                        y: sy,
                        width: text.length * avgCharSize,
                        height: 10,
                        name: text,
                        r: r,
                        isRef: isRef
                    };
                })
                .filter((d) => !isNaN(d.x) && !isNaN(d.y));

            var anchors = labels.map(d => ({x: d.sx, y: d.sy, r: d.r}));

            d3.labeler()
                .label(labels)
                .anchor(anchors)
                .width(innerW)
                .height(innerH)
                .start(iterationsCount);

            labels
                .filter((item) => !item.isRef)
                .map((item) => {
                    item.x = item.sx;
                    item.y = item.sy;
                    return item;
                })
                .reduce((memo, item) => {
                    memo[item.id] = item;
                    return memo;
                },
                labelsHashRef);

            var references = labels.filter((item) => item.isRef);
            if (references.length < 6) {
                references.reduce((memo, item) => {
                    memo[item.id] = item;
                    return memo;
                }, labelsHashRef);
            }
        });

        return labelsHashRef;
    }

    _drawMap(frames, topoJSONData) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;
        var node = this.config.options.container;

        var latScale = this.latScale;
        var lonScale = this.lonScale;
        var sizeScale = this.sizeScale;
        var colorScale = this.colorScale;

        var codeScale = this.codeScale;
        var fillScale = this.fillScale;

        var innerW = this.W;
        var innerH = this.H;

        var contours = hierarchy.filter((h) => (topoJSONData.objects || {}).hasOwnProperty(h));

        if (contours.length === 0) {
            throw new Error('Invalid map: should contain some contours');
        }

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

        this.contourToFill = contourToFill;

        var center;

        if (latScale.dim && lonScale.dim) {
            var lats = d3.extent(latScale.domain());
            var lons = d3.extent(lonScale.domain());
            center = [
                ((lons[1] + lons[0]) / 2),
                ((lats[1] + lats[0]) / 2)
            ];
        }

        var d3Projection = this._createProjection(topoJSONData, contours[0], center);

        var path = d3.geo.path().projection(d3Projection);

        var xmap = node
            .selectAll('.map-container')
            .data([`${innerW}${innerH}${center}${contours.join('-')}`], _.identity);
        xmap.exit()
            .remove();
        xmap.enter()
            .append('g')
            .call(function () {

                var node = this;

                node.attr('class', 'map-container');

                var labelsHash = {};
                var reverseContours = contours.reduceRight((m, t) => (m.concat(t)), []);

                if (guide.showNames) {
                    labelsHash = self._calcLabels(topoJSONData, reverseContours, path);
                }

                reverseContours.forEach((c, i) => {

                    var getInfo = (d) => labelsHash[`${c}-${d.id}`];

                    node.selectAll(`.map-contour-${c}`)
                        .data(topojson.feature(topoJSONData, topoJSONData.objects[c]).features || [])
                        .enter()
                        .append('g')
                        .call(function () {

                            var cont = this;

                            cont.attr('class', `map-contour-${c} map-contour-level map-contour-level-${i}`)
                                .attr('fill', 'none');

                            cont.append('title')
                                .text((d) => (d.properties || {}).name);

                            cont.append('path')
                                .attr('d', path);

                            cont.append('text')
                                .attr('class', `place-label-${c}`)
                                .attr('transform', (d) => {
                                    var i = getInfo(d);
                                    return i ? `translate(${[i.x, i.y]})` : '';
                                })
                                .text(d => {
                                    var i = getInfo(d);
                                    return i ? i.name : '';
                                });

                            cont.append('line')
                                .attr('class', `place-label-link-${c}`)
                                .attr('stroke', 'gray')
                                .attr('stroke-width', 0.25)
                                .attr('x1', (d) => {
                                    var i = getInfo(d);
                                    return (i && i.isRef) ? i.sx : 0;
                                })
                                .attr('y1', (d) => {
                                    var i = getInfo(d);
                                    return (i && i.isRef) ? i.sy : 0;
                                })
                                .attr('x2', (d) => {
                                    var i = getInfo(d);
                                    return (i && i.isRef) ? (i.x - i.name.length * 0.6 * avgCharSize) : 0;
                                })
                                .attr('y2', (d) => {
                                    var i = getInfo(d);
                                    return (i && i.isRef) ? (i.y - 3.5) : 0;
                                });
                        });
                });

                if (topoJSONData.objects.hasOwnProperty('places')) {

                    var placesFeature = topojson.feature(topoJSONData, topoJSONData.objects.places);

                    var labels = placesFeature
                        .features
                        .map((d) => {
                            var coords = d3Projection(d.geometry.coordinates);
                            return {
                                x: coords[0] + 3.5,
                                y: coords[1] + 3.5,
                                width: d.properties.name.length * avgCharSize,
                                height: 12,
                                name: d.properties.name
                            };
                        });

                    var anchors = placesFeature
                        .features
                        .map((d) => {
                            var coords = d3Projection(d.geometry.coordinates);
                            return {
                                x: coords[0],
                                y: coords[1],
                                r: 2.5
                            };
                        });

                    d3.labeler()
                        .label(labels)
                        .anchor(anchors)
                        .width(innerW)
                        .height(innerH)
                        .start(100);

                    node.selectAll('.place')
                        .data(anchors)
                        .enter()
                        .append('circle')
                        .attr('class', 'place')
                        .attr('transform', (d) => `translate(${d.x},${d.y})`)
                        .attr('r', (d) => `${d.r}px`);

                    node.selectAll('.place-label')
                        .data(labels)
                        .enter()
                        .append('text')
                        .attr('class', 'place-label')
                        .attr('transform', (d) => `translate(${d.x},${d.y})`)
                        .text((d) => d.name);
                }
            });

        this.groupByCode = frames.reduce(
            (groups, f) => {
                return f.part().reduce(
                    (memo, rec) => {
                        var key = (rec[codeScale.dim] || '').toLowerCase();
                        memo[key] = rec;
                        return memo;
                    },
                    groups);
            },
            {});

        var toData = this._resolveFeature.bind(this);

        xmap.selectAll(`.map-contour-${contourToFill}`)
            .data(topojson.feature(topoJSONData, topoJSONData.objects[contourToFill]).features)
            .call(function () {
                this.classed('map-contour', true)
                    .attr('fill', (d) => {
                        var row = toData(d);
                        return (row === null) ?
                            guide.defaultFill :
                            fillScale(row[fillScale.dim]);
                    });
            })
            .on('mouseover', (d) => this.fire('area-mouseover', {data: toData(d), event: d3.event}))
            .on('mouseout',  (d) => this.fire('area-mouseout', {data: toData(d), event: d3.event}))
            .on('click',     (d) => this.fire('area-click', {data: toData(d), event: d3.event}));

        if (!latScale.dim || !lonScale.dim) {
            return [];
        }

        var update = function () {
            return this
                .attr({
                    r: ({data: d}) => sizeScale(d[sizeScale.dim]),
                    transform: ({data: d}) => `translate(${d3Projection([d[lonScale.dim], d[latScale.dim]])})`,
                    class: ({data: d}) => colorScale(d[colorScale.dim]),
                    opacity: pointOpacity
                })
                .on('mouseover', ({data:d}) => self.fire('point-mouseover', {data: d, event: d3.event}))
                .on('mouseout',  ({data:d}) => self.fire('point-mouseout', {data: d, event: d3.event}))
                .on('click',     ({data:d}) => self.fire('point-click', {data: d, event: d3.event}));
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

        var mapper = (f) => ({tags: f.key || {}, hash: f.hash(), data: f.part()});

        var frameGroups = xmap
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

    _resolveFeature(d) {
        var groupByCode = this.groupByCode;
        var prop = d.properties;
        var codes = ['c1', 'c2', 'c3', 'abbr', 'name'].filter((c) => {
            return prop.hasOwnProperty(c) &&
                prop[c] &&
                groupByCode.hasOwnProperty(prop[c].toLowerCase());
        });

        var value;
        if (codes.length === 0) {
            // doesn't match
            value = null;
        } else if (codes.length > 0) {
            let k = prop[codes[0]].toLowerCase();
            value = groupByCode[k];
        }

        return value;
    }

    _highlightArea(filter) {
        var node = this.config.options.container;
        var contourToFill = this.contourToFill;
        node.selectAll(`.map-contour-${contourToFill}`)
            .classed('map-contour-highlighted', (d) => filter(this._resolveFeature(d)));
    }

    _highlightPoint(filter) {
        this.config
            .options
            .container
            .selectAll('circle')
            .attr('opacity', ({data:d}) => (filter(d) ? pointOpacity : 0.1));
    }

    _createProjection(topoJSONData, topContour, center) {

        // The map's scale out is based on the solution:
        // http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object

        var width = this.W;
        var height = this.H;
        var guide = this.config.guide;

        var scale = 100;
        var offset = [width / 2, height / 2];

        var mapCenter = center || topoJSONData.center;
        var mapProjection = guide.projection || topoJSONData.projection || 'mercator';

        var d3Projection = this._createD3Projection(mapProjection, mapCenter, scale, offset);

        var path = d3.geo.path().projection(d3Projection);

        // using the path determine the bounds of the current map and use
        // these to determine better values for the scale and translation
        var bounds = path.bounds(topojson.feature(topoJSONData, topoJSONData.objects[topContour]));

        var hscale = scale * width  / (bounds[1][0] - bounds[0][0]);
        var vscale = scale * height / (bounds[1][1] - bounds[0][1]);

        scale = (hscale < vscale) ? hscale : vscale;
        offset = [
            width - (bounds[0][0] + bounds[1][0]) / 2,
            height - (bounds[0][1] + bounds[1][1]) / 2
        ];

        // new projection
        return this._createD3Projection(mapProjection, mapCenter, scale, offset);
    }

    _createD3Projection(projection, center, scale, translate) {

        var d3ProjectionMethod = d3.geo[projection];

        if (!d3ProjectionMethod) {
            console.log(`Unknown projection "${projection}"`);
            console.log(`See available projection types here: https://github.com/mbostock/d3/wiki/Geo-Projections`);
            throw new Error(`Invalid map: unknown projection "${projection}"`);
        }

        var d3Projection = d3ProjectionMethod();

        var steps = [
            {method:'scale', args: scale},
            {method:'center', args: center},
            {method:'translate', args: translate}
        ].filter((step) => step.args);

        // because the Albers USA projection does not support rotation or centering
        return steps.reduce(
            (proj, step) => {
                if (proj[step.method]) {
                    proj = proj[step.method](step.args);
                }
                return proj;
            },
            d3Projection);
    }
}