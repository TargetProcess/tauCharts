import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';
import {d3_createPathTween} from '../utils/d3-decorators';

const Line = {

    draw: BasePath.draw,
    highlight: BasePath.highlight,
    highlightDataPoints: BasePath.highlightDataPoints,
    addInteraction: BasePath.addInteraction,

    init(xConfig) {

        const config = BasePath.init(xConfig);
        const enableStack = config.stack;

        config.guide = utils.defaults(
            (config.guide || {}),
            {
                interpolate: 'linear'
            });

        config.transformRules = [
            config.flip && CartesianGrammar.decorator_flip,
            CartesianGrammar.decorator_groundY0,
            !enableStack && CartesianGrammar.decorator_groupOrderByAvg,
            enableStack && CartesianGrammar.decorator_groupOrderByColor,
            enableStack && CartesianGrammar.decorator_stack
        ].concat(config.transformModel || []);

        config.adjustRules = [
            ((prevModel, args) => {
                const isEmptySize = !prevModel.scaleSize.dim; // TODO: empty method for size scale???
                const sizeCfg = utils.defaults(
                    (config.guide.size || {}),
                    {
                        defMinSize: 2,
                        defMaxSize: (isEmptySize ? 6 : 40)
                    });
                const params = Object.assign(
                    {},
                    args,
                    {
                        defMin: sizeCfg.defMinSize,
                        defMax: sizeCfg.defMaxSize,
                        minLimit: sizeCfg.minSize,
                        maxLimit: sizeCfg.maxSize
                    });

                return CartesianGrammar.adjustStaticSizeScale(prevModel, params);
            }),
            enableStack && CartesianGrammar.adjustYScale
        ];

        return config;
    },

    buildModel(screenModel) {

        const config = this.node().config;
        const wMax = config.options.width;
        const hMax = config.options.height;
        const guide = config.guide;
        const options = config.options;
        const isEmptySize = !screenModel.model.scaleSize.dim; // TODO: empty method for size scale???;
        const widthCss = (isEmptySize ?
            (guide.widthCssClass || getLineClassesByWidth(options.width)) :
            (''));
        const countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);
        const tag = isEmptySize ? 'line' : 'area';
        const groupPref = `${CSS_PREFIX}${tag} ${tag} i-role-path ${widthCss} ${countCss} ${guide.cssClass} `;

        const limit = (x, minN, maxN) => {

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

        var baseModel = BasePath.baseModel(screenModel);

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

            // double for consistency in case of
            // (vertices.length === 1)
            vertices.push(vertices[0]);

            var pair = utils.range(vertices.length - 1)
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

        baseModel.toPoint = isEmptySize ?
            (d) => ({
                id: screenModel.id(d),
                x: baseModel.x(d),
                y: baseModel.y(d)
            }) :
            (d) => ({
                id: screenModel.id(d),
                x: baseModel.x(d),
                y: baseModel.y(d),
                size: baseModel.size(d)
            });

        var d3Line = d3.svg
            .line()
            .interpolate(guide.interpolate)
            .x(d => d.x)
            .y(d => d.y);

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame`
        };

        baseModel.pathElement = isEmptySize ? 'path' : 'polygon';

        var d3LineVarySize = (x, y, w) => {
            return (fiber) => {
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
            };
        };

        var pathAttributes = isEmptySize ?
            ({
                stroke: (fiber) => baseModel.color(fiber[0]),
                class: 'i-role-datum'
            }) :
            ({
                fill: (fiber) => baseModel.color(fiber[0])
            });

        baseModel.pathAttributesEnterInit = pathAttributes;
        baseModel.pathAttributesUpdateDone = pathAttributes;

        if (isEmptySize) {
            baseModel.pathTween = {
                attr: 'd',
                fn: d3_createPathTween('d', d3Line, baseModel.toPoint, screenModel.id)
            };
        } else {
            baseModel.pathTween = {
                attr: 'points',
                fn: d3_createPathTween(
                    'points',
                    d3LineVarySize(d => d.x, d => d.y, d => d.size, baseModel),
                    baseModel.toPoint,
                    screenModel.id
                )
            };
        }

        return baseModel;
    }
};

export {Line};