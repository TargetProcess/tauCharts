import {default as d3} from 'd3';
import {CSS_PREFIX} from '../const';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {d3_createPathTween} from '../utils/d3-decorators';

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

        baseModel.toPoint = (d) => ({
            id: self.screenModel.id(d),
            x0: baseModel.x0(d),
            x: baseModel.x(d),
            y0: baseModel.y0(d),
            y: baseModel.y(d)
        });

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

        var pathAttributes = {
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
                areaPoints(d => d.x, d => d.y, d => d.x0, d => d.y0),
                baseModel.toPoint,
                self.screenModel.id
            )
        };

        return baseModel;
    }

    getDistance(mx, my, rx, ry) {
        return (this.config.flip ? Math.abs(my - ry) : Math.abs(mx - rx));
    }
}