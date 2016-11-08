import d3 from 'd3';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {d3_createPathTween} from '../utils/d3-decorators';
import {getPolyline, getSmoothLine} from '../utils/path/line-builder';

const Area = {

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
                smooth: true
            });

        config.transformRules = [
            config.flip && CartesianGrammar.decorator_flip,
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

        const baseModel = BasePath.baseModel(screenModel);

        const guide = this.node().config.guide;
        const countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);
        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;

        /* eslint-disable */
        const getDistance = (screenModel.flip ?
            ((mx, my, rx, ry) => Math.abs(my - ry)) :
            ((mx, my, rx, ry) => Math.abs(mx - rx)));
        /* eslint-enable */

        baseModel.matchRowInCoordinates = (rows, {x, y}) => {

            // d3.invert doesn't work for ordinal axes
            var nearest = rows
                .map((row) => {
                    var rx = baseModel.x(row);
                    var ry = baseModel.y(row);
                    return {
                        x: rx,
                        y: ry,
                        dist: getDistance(x, y, rx, ry),
                        data: row
                    };
                })
                .sort((a, b) => (a.dist - b.dist)) // asc
            [0];

            return nearest.data;
        };

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame`
        };

        baseModel.toPoint = (d) => ({
            id: screenModel.id(d),
            x0: baseModel.x0(d),
            x: baseModel.x(d),
            y0: baseModel.y0(d),
            y: baseModel.y(d)
        });

        var getLine = guide.smooth ? getSmoothLine : getPolyline;
        var areaPoints = (xi, yi, x0, y0) => {
            return ((fiber) => {
                var ways = fiber
                    .reduce((memo, d) => {
                        memo.dir.push([xi(d), yi(d)]);
                        memo.rev.push([x0(d), y0(d)]);
                        return memo;
                    },
                    {
                        dir: [],
                        rev: []
                    });

                if (fiber.length < 2) {
                    return '';
                }
                var dir = getLine(ways.dir.map(d => ({x: d[0], y: d[1]})));
                var rev = getLine(ways.rev.reverse().map(d => ({x: d[0], y: d[1]})));
                var path = `${dir} L${rev.slice(1)} Z`;

                return path;
            });
        };

        var pathAttributes = {
            fill: (fiber) => baseModel.color(fiber[0]),
            stroke: (fiber) => {
                var colorStr = baseModel.color(fiber[0]);
                if (colorStr.length > 0) {
                    colorStr = d3.rgb(colorStr).darker(1);
                }
                return colorStr;
            }
        };

        baseModel.pathAttributesEnterInit = pathAttributes;
        baseModel.pathAttributesUpdateDone = pathAttributes;

        baseModel.pathElement = 'path';

        baseModel.pathTween = {
            attr: 'd',
            fn: d3_createPathTween(
                'd',
                areaPoints(d => d.x, d => d.y, d => d.x0, d => d.y0),
                baseModel.toPoint,
                screenModel.id,
                guide.smooth
            )
        };

        return baseModel;
    }
};

export {Area};