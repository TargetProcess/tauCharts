import {CSS_PREFIX} from '../const';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';
import {d3_createPathTween} from '../utils/d3-decorators';

export class Path extends BasePath {

    constructor(config) {
        super(config);

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_group,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && CartesianGrammar.adjustStaticSizeScale
        ].concat(config.transformModel || []);
    }

    buildModel(screenModel) {

        var self = this;
        var baseModel = super.buildModel(screenModel);

        baseModel.matchRowInCoordinates = (rows, {x, y}) => {

            // d3.invert doesn't work for ordinal axes
            var nearest = rows
                .map((row) => {
                    var rx = baseModel.x(row);
                    var ry = baseModel.y(row);
                    return {
                        x: rx,
                        y: ry,
                        dist: self.getDistance(x, y, rx, ry),
                        data: row
                    };
                })
                .sort((a, b) => (a.dist - b.dist)) // asc
                [0];

            return nearest.data;
        };

        var guide = this.config.guide;
        var countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);

        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;
        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame`
        };

        baseModel.toPoint = (d) => ({
            id: self.screenModel.id(d),
            x: baseModel.x(d),
            y: baseModel.y(d)
        });

        var pathPoints = (x, y) => {
            return ((fiber) => (fiber.map((d) => [x(d), y(d)].join(',')).join(' ')));
        };

        var pathAttributes = {
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
                self.screenModel.id
            )
        };

        return baseModel;
    }
}