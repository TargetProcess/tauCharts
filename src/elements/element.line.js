import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';
import {d3_createPathTween} from '../utils/d3-decorators';
import getBrushLine from '../utils/path/brush-line-builder';

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
            enableStack ? CartesianGrammar.decorator_groupOrderByColor : CartesianGrammar.decorator_groupOrderByAvg,
            enableStack && BasePath.grammarRuleFillGaps,
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
            })
        ];

        return config;
    },

    buildModel(screenModel) {

        const config = this.node().config;
        const guide = config.guide;
        const options = config.options;
        const isEmptySize = !screenModel.model.scaleSize.dim; // TODO: empty method for size scale???;
        const widthCss = (isEmptySize ?
            (guide.widthCssClass || getLineClassesByWidth(options.width)) :
            (''));
        const countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);
        const tag = isEmptySize ? 'line' : 'area';
        const groupPref = `${CSS_PREFIX}${tag} ${tag} i-role-path ${widthCss} ${countCss} ${guide.cssClass} `;

        const pathAttributes = isEmptySize ?
            ({
                stroke: (fiber) => baseModel.color(fiber[0]),
                class: 'i-role-datum'
            }) :
            ({
                fill: (fiber) => baseModel.color(fiber[0])
            });

        const d3LineBuilder = isEmptySize ?
            d3.svg.line().interpolate(guide.interpolate).x(d => d.x).y(d => d.y) :
            getBrushLine;

        const baseModel = BasePath.baseModel(screenModel);

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
            vertices.unshift(vertices[0]);

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

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame`
        };

        baseModel.pathElement = 'path';
        baseModel.pathAttributesEnterInit = pathAttributes;
        baseModel.pathAttributesUpdateDone = pathAttributes;
        baseModel.pathTween = {
            attr: 'd',
            fn: d3_createPathTween('d', d3LineBuilder, baseModel.toPoint, screenModel.id)
        };

        return baseModel;
    }
};

export {Line};