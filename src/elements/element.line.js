import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {GrammarRegistry} from '../grammar-registry';
import {getLineClassesByWidth, getLineClassesByCount} from '../utils/css-class-map';
import * as utils from '../utils/utils';
import {d3_createPathTween} from '../utils/d3-decorators';
import {getInterpolatorSplineType} from '../utils/path/interpolators/interpolators-registry';
import {getBrushLine, getBrushCurve} from '../utils/path/svg/brush-line';
import {getPolyline, getCurve} from '../utils/path/svg/line';
import {useFillGapsRule} from '../utils/utils-grammar';

const Line = {

    draw: BasePath.draw,
    getClosestElement: BasePath.getClosestElement,
    highlight: BasePath.highlight,
    highlightDataPoints: BasePath.highlightDataPoints,
    addInteraction: BasePath.addInteraction,
    _getBoundsInfo: BasePath._getBoundsInfo,
    _sortElements: BasePath._sortElements,

    init(xConfig) {

        const config = BasePath.init(xConfig);
        const enableStack = config.stack;

        config.guide = utils.defaults(
            (config.guide || {}),
            {
                avoidScalesOverflow: true,
                interpolate: 'linear'
            });

        config.transformRules = [
            config.flip && GrammarRegistry.get('flip'),
            !enableStack && GrammarRegistry.get('groupOrderByAvg'),
            useFillGapsRule(config),
            enableStack && GrammarRegistry.get('stack')
        ];

        const avoidScalesOverflow = config.guide.avoidScalesOverflow;
        const isEmptySize = ((model) => model.scaleSize.isEmptyScale());

        config.adjustRules = [
            ((prevModel, args) => {
                const sizeCfg = utils.defaults(
                    (config.guide.size || {}),
                    {
                        defMinSize: 2,
                        defMaxSize: (isEmptySize(prevModel) ? 6 : 40)
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

                return GrammarRegistry.get('adjustStaticSizeScale')(prevModel, params);
            }),
            (avoidScalesOverflow && ((prevModel, args) => {
                if (isEmptySize(prevModel)) {
                    return (() => ({}));
                }
                const params = Object.assign({}, args, {
                    sizeDirection: 'xy'
                });
                return GrammarRegistry.get('avoidScalesOverflow')(prevModel, params);
            }))
        ].filter(x => x);
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

        const d3LineBuilder = (getInterpolatorSplineType(guide.interpolate) === 'cubic' ?
            (isEmptySize ? getCurve : getBrushCurve) :
            (isEmptySize ? getPolyline : getBrushLine));

        const baseModel = BasePath.baseModel(screenModel);

        const toPoint = isEmptySize ?
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
        baseModel.anchorShape = 'circle';
        baseModel.pathAttributesEnterInit = pathAttributes;
        baseModel.pathAttributesUpdateDone = pathAttributes;
        baseModel.pathTween = {
            attr: 'd',
            fn: d3_createPathTween(
                'd',
                d3LineBuilder,
                [toPoint],
                screenModel.id,
                guide.interpolate
            )
        };

        return baseModel;
    }
};

export {Line};
