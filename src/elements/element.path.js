import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';

export class Path extends BasePath {

    constructor(config) {
        super(config);
    }

    buildModel(params) {

        var self = this;
        var baseModel = super.buildModel(params);

        baseModel.matchRowInCoordinates = (rows, {x, y}) => {

            // d3.invert doesn't work for ordinal axes
            var nearest = self
                .unpackFrameData(rows)
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

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-dot ${datumClass} ${CSS_PREFIX}dot `;
        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;
        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.color(fiber[0])} frame-${options.uid}`
        };

        baseModel.pathAttributes = {
            points: ((fiber) => (fiber.map((d) => [baseModel.x(d), baseModel.y(d)].join(',')).join(' ')))
        };

        baseModel.dotAttributes = {
            r: (d) => baseModel.size(d),
            cx: (d) => baseModel.x(d),
            cy: (d) => baseModel.y(d),
            class: (d) => (`${pointPref} ${baseModel.color(d)}`)
        };

        baseModel.pathElement = 'polygon';

        return baseModel;
    }
}