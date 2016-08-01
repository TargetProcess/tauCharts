import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {default as _} from 'underscore';
import {default as d3} from 'd3';

export class GenericCartesian extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = _.defaults(
            (this.config.guide || {}),
            {
                animationSpeed: 0,
                prettify: true,
                enableColorToBarPosition: false
            });

        this.config.guide.size = _.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: 10,
                defMaxSize: this.isEmptySize ? 10 : 40, // TODO: fix when pass scales to constructor
                enableDistributeEvenly: !this.isEmptySize
            });

        this.defMin = config.guide.size.defMinSize;
        this.defMax = config.guide.size.defMaxSize;
        this.minLimit = config.guide.size.minSize;
        this.maxLimit = config.guide.size.maxSize;

        this.isHorizontal = this.config.flip;

        var enableStack = this.config.stack;
        var enableColorPositioning = this.config.guide.enableColorToBarPosition;
        var enableDistributeEvenly = this.config.guide.size.enableDistributeEvenly;

        this.decorators = [
            CartesianGrammar.decorator_orientation,
            CartesianGrammar.decorator_groundY0,
            CartesianGrammar.decorator_group,
            enableStack && CartesianGrammar.decorator_stack,
            enableColorPositioning && CartesianGrammar.decorator_positioningByColor,
            CartesianGrammar.decorator_dynamic_size,
            CartesianGrammar.decorator_color,
            CartesianGrammar.decorator_label,
            config.adjustPhase && enableStack && CartesianGrammar.adjustYScale,
            config.adjustPhase && (enableDistributeEvenly ?
                CartesianGrammar.adjustSigmaSizeScale :
                CartesianGrammar.adjustStaticSizeScale)
        ].concat(config.transformModel || []);
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.size = fnCreateScale('size', config.size, {});
        this.color = fnCreateScale('color', config.color, {});
        this.split = fnCreateScale('split', config.split, {});
        this.label = fnCreateScale('label', config.label, {});
        this.identity = fnCreateScale('identity', config.identity, {});
        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color)
            .regScale('split', this.split)
            .regScale('label', this.label);
    }

    walkFrames() {

        var args = {
            defMin: this.defMin,
            defMax: this.defMax,
            minLimit: this.minLimit,
            maxLimit: this.maxLimit,
            isHorizontal: this.isHorizontal,
            dataSource: this.data()
        };

        return this
            .decorators
            .filter(x => x)
            .reduce((model, transform) => CartesianGrammar.compose(model, transform(model, args)),
            (new CartesianGrammar({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleSize: this.size,
                scaleLabel: this.label,
                scaleColor: this.color,
                scaleSplit: this.split,
                scaleIdentity: this.identity
            })));
    }

    drawFrames() {

        var self = this;

        var options = this.config.options;

        var round = ((x, decimals) => {
            var kRound = Math.pow(10, decimals);
            return (Math.round(kRound * x) / kRound);
        });
        var size = ((d) => round(self.screenModel.size(d) / 2, 4));
        var createUpdateFunc = d3_animationInterceptor;

        var drawPart = function (that, id, props) {
            var speed = self.config.guide.animationSpeed;
            var part = that
                .selectAll(`.${id}`)
                .data((row) => [row], self.screenModel.id);
            part.exit()
                .call(createUpdateFunc(speed, null, {width: 0}, (node) => d3.select(node).remove()));
            part.call(createUpdateFunc(speed, null, props));
            part.enter()
                .append('rect')
                .style('stroke-width', 0)
                .call(createUpdateFunc(speed, {width: 0}, props));
        };

        var flip = this.config.flip;
        var x = flip ? 'y' : 'x';
        var y = flip ? 'x' : 'y';
        var y0 = flip ? 'x0' : 'y0';
        var w = flip ? 'height' : 'width';
        var h = flip ? 'width' : 'height';
        var drawElement = function () {
            drawPart(this, 'lvl-top', {
                [w]: ((d) => size(d)),
                [h]: 1,
                [x]: ((d) => self.screenModel[x](d) - size(d) / 2),
                [y]: ((d) => self.screenModel[y](d)),
                fill: ((d) => self.screenModel.color(d)),
                class: ((d) => `lvl-top ${self.screenModel.class(d)}`)
            });
            drawPart(this, 'lvl-btm', {
                [w]: ((d) => size(d)),
                [h]: 1,
                [x]: ((d) => self.screenModel[x](d) - size(d) / 2),
                [y]: ((d) => self.screenModel[y0](d)),
                fill: ((d) => self.screenModel.color(d)),
                class: ((d) => `lvl-btm ${self.screenModel.class(d)}`)
            });
            drawPart(this, 'lvl-link', {
                [w]: 0.5,
                [h]: ((d) => Math.abs(self.screenModel[y](d) - self.screenModel[y0](d))),
                [x]: ((d) => self.screenModel[x](d) - 0.25),
                [y]: ((d) => Math.min(self.screenModel[y](d), self.screenModel[y0](d))),
                fill: ((d) => self.screenModel.color(d)),
                class: ((d) => `lvl-link ${self.screenModel.class(d)}`)
            });
        };

        var updateGroups = function () {

            this.attr('class', `frame-id-${self.config.uid}`)
                .call(function () {
                    var generic = this
                        .selectAll('.generic')
                        .data((fiber) => fiber, self.screenModel.id);
                    generic
                        .exit()
                        .remove();
                    generic
                        .call(drawElement);
                    generic
                        .enter()
                        .append('g')
                        .attr('class', 'generic')
                        .call(drawElement);
                });
        };

        var groups = _.groupBy(this.data(), self.screenModel.group);
        var fibers = Object
            .keys(groups)
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        var frameGroups = options
            .container
            .selectAll(`.frame-id-${self.config.uid}`)
            .data(fibers);
        frameGroups
            .exit()
            .remove();
        frameGroups
            .call(updateGroups);
        frameGroups
            .enter()
            .append('g')
            .call(updateGroups);
    }
}