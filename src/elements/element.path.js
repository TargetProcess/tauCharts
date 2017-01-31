import {CSS_PREFIX} from '../const';
import {GrammarRegistry} from '../grammar-registry';
import {BasePath} from './element.path.base';
import {utils} from '../utils/utils';
import {getLineClassesByCount} from '../utils/css-class-map';
import {d3_createPathTween} from '../utils/d3-decorators';

const Path = {

    draw: BasePath.draw,
    getClosestElement: BasePath.getClosestElement,
    highlight: BasePath.highlight,
    highlightDataPoints: BasePath.highlightDataPoints,
    addInteraction: BasePath.addInteraction,
    _getBoundsInfo: BasePath._getBoundsInfo,

    init(xConfig) {

        const config = BasePath.init(xConfig);

        config.transformRules = [
            config.flip && GrammarRegistry.get('flip')
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
            x: baseModel.x(d),
            y: baseModel.y(d)
        });

        const pathPoints = (x, y) => {
            return ((fiber) => (fiber.map((d) => [x(d), y(d)].join(',')).join(' ')));
        };

        const pathAttributes = {
            fill: (fiber) => baseModel.color(fiber[0]),
            stroke: (fiber) => baseModel.color(fiber[0])
        };

        baseModel.pathAttributesEnterInit = pathAttributes;
        baseModel.pathAttributesUpdateDone = pathAttributes;

        baseModel.pathElement = 'polygon';

        baseModel.pathTween = {
            attr: 'points',
            fn: d3_createPathTween(
                'points',
                pathPoints(d => d.x, d => d.y),
                baseModel.toPoint,
                screenModel.id
            )
        };

        return baseModel;
    }
};

export {Path};