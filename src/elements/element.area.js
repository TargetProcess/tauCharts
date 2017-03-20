import d3 from 'd3';
import {CSS_PREFIX} from '../const';
import {utils} from '../utils/utils';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';
import {GrammarRegistry} from '../grammar-registry';
import {d3_createPathTween} from '../utils/d3-decorators';
import getAreaPath from '../utils/path/svg/area-path';

const Area = {

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

        config.transformRules = [
            config.flip && GrammarRegistry.get('flip'),
            !enableStack && GrammarRegistry.get('groupOrderByAvg'),
            enableStack && BasePath.grammarRuleFillGaps,
            enableStack && GrammarRegistry.get('stack')
        ].concat(config.transformModel || []);

        config.adjustRules = [
            ((prevModel, args) => {
                const isEmptySize = prevModel.scaleSize.isEmptyScale();
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

                return GrammarRegistry.get('adjustStaticSizeScale')(prevModel, params);
            })
        ];

        return config;
    },

    buildModel(screenModel) {

        const baseModel = BasePath.baseModel(screenModel);

        const guide = this.node().config.guide;
        const countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);
        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;

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

        const pathAttributes = {
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

        baseModel.pathElement = 'polygon';

        baseModel.pathTween = {
            attr: 'points',
            fn: d3_createPathTween(
                'points',
                getAreaPath,
                baseModel.toPoint,
                screenModel.id
            )
        };

        return baseModel;
    }
};

export {Area};