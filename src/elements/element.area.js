import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';
import {CartesianGrammar} from '../models/cartesian-grammar';

export class Area extends BasePath {

    constructor(config) {

        super(config);

        var enableStack = this.config.stack;

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_groundY0,
            CartesianGrammar.decorator_group,
            !enableStack && CartesianGrammar.decorator_groupOrderByAvg,
            enableStack && CartesianGrammar.decorator_groupOrderByColor,
            enableStack && CartesianGrammar.decorator_stack,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && CartesianGrammar.adjustStaticSizeScale,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale
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

                return [].concat(ways.dir).concat(ways.rev.reverse()).join(' ');
            });
        };

        var pathAttributesDefault = {
            points: areaPoints(baseModel.x, baseModel.y0, baseModel.x0, baseModel.y0)
        };

        var pathAttributes = {
            fill: (fiber) => baseModel.color(fiber[0]),
            stroke: (fiber) => baseModel.color(fiber[0]),
            points: areaPoints(baseModel.x, baseModel.y, baseModel.x0, baseModel.y0)
        };

        baseModel.pathAttributesUpdateInit = null;
        baseModel.pathAttributesUpdateDone = pathAttributes;

        baseModel.pathAttributesEnterInit = pathAttributesDefault;
        baseModel.pathAttributesEnterDone = pathAttributes;

        baseModel.pathElement = 'polygon';

        return baseModel;
    }

    getDistance(mx, my, rx, ry) {
        return (this.config.flip ? Math.abs(my - ry) : Math.abs(mx - rx));
    }
}