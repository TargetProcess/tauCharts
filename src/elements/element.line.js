import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class Line extends BasePath {

    constructor(config) {
        super(config);
    }

    buildModel(params) {

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
        var widthCss = guide.widthCssClass || getLineClassesByWidth(options.width);
        var countCss = getLineClassesByCount(params.colorScale.domain().length);

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-dot ${datumClass} ${CSS_PREFIX}dot `;
        const groupPref = `${CSS_PREFIX}line line i-role-path ${widthCss} ${countCss} ${guide.cssClass} `;

        var d3Line = d3.svg.line().x(baseModel.x).y(baseModel.y);
        if (guide.interpolate) {
            d3Line.interpolate(guide.interpolate);
        }

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.color(fiber[0])} frame-${options.uid}`
        };

        baseModel.pathAttributes = {
            d: d3Line,
            class: datumClass
        };

        baseModel.dotAttributes = {
            r: (d) => baseModel.size(d),
            cx: (d) => baseModel.x(d),
            cy: (d) => baseModel.y(d),
            class: (d) => (`${pointPref} ${baseModel.color(d)}`)
        };

        baseModel.pathElement = 'path';

        return baseModel;
    }
}