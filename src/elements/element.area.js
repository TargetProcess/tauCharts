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
            CartesianGrammar.decorator_groupOrderByAvg,
            enableStack && CartesianGrammar.decorator_stack,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && CartesianGrammar.adjustStaticSizeScale,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale
        ];
    }

    buildModel(modelGoG, params) {

        var self = this;
        var baseModel = super.buildModel(modelGoG, params);

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
            points: ((fiber) => {

                var ways = fiber
                    .reduce((memo, d) => {
                        memo.dir.push([baseModel.x(d), baseModel.y(d)]);
                        memo.rev.push([baseModel.x0(d), baseModel.y0(d)]);
                        return memo;
                    },
                    {
                        dir: [],
                        rev: []
                    });

                return [].concat(ways.dir).concat(ways.rev.reverse()).join(' ');
            })
        };

        baseModel.pathElement = 'polygon';

        return baseModel;
    }

    getDistance(mx, my, rx, ry) {
        return (this.config.flip ? Math.abs(my - ry) : Math.abs(mx - rx));
    }
}