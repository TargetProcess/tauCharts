import {CSS_PREFIX} from '../const';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';

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
        var options = this.config.options;
        var countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);

        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;
        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame-${options.uid}`
        };

        var pathPoints = (x, y) => {
            return ((fiber) => (fiber.map((d) => [x(d), y(d)].join(',')).join(' ')));
        };

        var pathAttributesDefault = {
            points: pathPoints(baseModel.x, baseModel.y0)
        };

        var pathAttributes = {
            fill: (fiber) => baseModel.color(fiber[0]),
            stroke: (fiber) => baseModel.color(fiber[0]),
            points: pathPoints(baseModel.x, baseModel.y)
        };

        baseModel.pathAttributesUpdateInit = null;
        baseModel.pathAttributesUpdateDone = pathAttributes;

        baseModel.pathAttributesEnterInit = pathAttributesDefault;
        baseModel.pathAttributesEnterDone = pathAttributes;

        baseModel.pathElement = 'polygon';

        return baseModel;
    }
}