import {CSS_PREFIX} from '../const';
import {PathModel} from '../models/path';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';

export class Path extends BasePath {

    constructor(config) {
        super(config);

        this.decorators = [
            PathModel.decorator_orientation,
            PathModel.decorator_group,
            PathModel.decorator_size,
            PathModel.decorator_color,
            config.adjustPhase && PathModel.adjustSizeScale
        ];
    }

    buildModel(params) {

        var self = this;
        var baseModel = super.buildModel(params);

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
        var countCss = getLineClassesByCount(params.colorScale.domain().length);

        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;
        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame-${options.uid}`
        };

        baseModel.pathAttributes = {
            fill: (fiber) => baseModel.color(fiber[0]),
            stroke: (fiber) => baseModel.color(fiber[0]),
            points: ((fiber) => (fiber.map((d) => [baseModel.x(d), baseModel.y(d)].join(',')).join(' ')))
        };

        baseModel.pathElement = 'polygon';

        return baseModel;
    }
}