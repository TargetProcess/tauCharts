import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class Line extends BasePath {

    constructor(config) {

        super(config);

        this.config = config;
        this.config.guide = _.defaults(
            (this.config.guide || {}),
            {
                interpolate: 'linear'
            });

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_group,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            config.adjustPhase && CartesianGrammar.adjustStaticSizeScale
        ];
    }

    buildModel(params) {

        var wMax = this.config.options.width;
        var hMax = this.config.options.height;

        var limit = (x, minN, maxN) => {

            var k = 1000;
            var n = Math.round(x * k) / k;

            if (n < minN) {
                return minN;
            }

            if (n > maxN) {
                return maxN;
            }

            return n;
        };

        var baseModel = super.buildModel(params);

        baseModel.matchRowInCoordinates = (rows, {x, y}) => {
            var by = ((prop) => ((a, b) => (a[prop] - b[prop])));
            var dist = ((x0, x1, y0, y1) => Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2)));

            // d3.invert doesn't work for ordinal axes
            var vertices = rows
                .map((row) => {
                    var rx = baseModel.x(row);
                    var ry = baseModel.y(row);
                    return {
                        x: rx,
                        y: ry,
                        dist: dist(x, rx, y, ry),
                        data: row
                    };
                });

            var pair = _
                .times((vertices.length - 1), (i) => i)
                .map((edge) => {
                    var v0 = vertices[edge];
                    var v1 = vertices[edge + 1];
                    var ab = dist(v1.x, v0.x, v1.y, v0.y);
                    var ax = v0.dist;
                    var bx = v1.dist;
                    var er = Math.abs(ab - (ax + bx));
                    return [er, v0, v1];
                })
                .sort(by('0')) // find minimal distance to edge
                [0]
                .slice(1);

            return pair.sort(by('dist'))[0].data;
        };

        var guide = this.config.guide;
        var options = this.config.options;
        var widthCss = (this.isEmptySize ?
            (guide.widthCssClass || getLineClassesByWidth(options.width)) :
            (''));
        var countCss = getLineClassesByCount(params.colorScale.domain().length);

        var tag = this.isEmptySize ? 'line' : 'area';
        const groupPref = `${CSS_PREFIX}${tag} ${tag} i-role-path ${widthCss} ${countCss} ${guide.cssClass} `;

        var d3Line = d3.svg
            .line()
            .interpolate(guide.interpolate)
            .x(baseModel.x)
            .y(baseModel.y);

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame-${options.uid}`
        };

        baseModel.pathElement = this.isEmptySize ? 'path' : 'polygon';

        baseModel.pathAttributes = this.isEmptySize ?
            ({
                d: d3Line,
                stroke: (fiber) => baseModel.color(fiber[0]),
                class: 'i-role-datum'
            }) :
            ({
                fill: (fiber) => baseModel.color(fiber[0]),
                points: ((fiber) => {

                    var x = baseModel.x;
                    var y = baseModel.y;
                    var w = baseModel.size;

                    var xy = ((d) => ([x(d), y(d)]));

                    var ways = fiber
                        .reduce((memo, d, i, list) => {
                            var dPrev = list[i - 1];
                            var dNext = list[i + 1];
                            var curr = xy(d);
                            var prev = dPrev ? xy(dPrev) : null;
                            var next = dNext ? xy(dNext) : null;

                            var width = w(d);
                            var lAngle = dPrev ? (Math.PI - Math.atan2(curr[1] - prev[1], curr[0] - prev[0])) : Math.PI;
                            var rAngle = dNext ? (Math.atan2(curr[1] - next[1], next[0] - curr[0])) : 0;

                            var gamma = lAngle - rAngle;

                            if (gamma === 0) {
                                // Avoid divide be zero
                                return memo;
                            }

                            var diff = width / 2 / Math.sin(gamma / 2);
                            var aup = rAngle + gamma / 2;
                            var adown = aup - Math.PI;
                            var dxup = diff * Math.cos(aup);
                            var dyup = diff * Math.sin(aup);
                            var dxdown = diff * Math.cos(adown);
                            var dydown = diff * Math.sin(adown);

                            var dir = [
                                limit(curr[0] + dxup, 0, wMax), // x
                                limit(curr[1] - dyup, 0, hMax)  // y
                            ];

                            var rev = [
                                limit(curr[0] + dxdown, 0, wMax),
                                limit(curr[1] - dydown, 0, hMax)
                            ];

                            memo.dir.push(dir);
                            memo.rev.push(rev);

                            return memo;
                        },
                        {
                            dir: [],
                            rev: []
                        });

                    return [].concat(ways.dir).concat(ways.rev.reverse()).join(' ');
                })
            });

        return baseModel;
    }
}