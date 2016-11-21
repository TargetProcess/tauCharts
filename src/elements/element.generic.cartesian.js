import {Element} from './element';
import {GrammarRegistry} from '../grammar-registry';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

export class GenericCartesian extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = utils.defaults(
            (this.config.guide || {}),
            {
                animationSpeed: 0,
                enableColorToBarPosition: false
            });

        this.config.guide.size = (this.config.guide.size || {});

        var enableStack = this.config.stack;
        var enableColorPositioning = this.config.guide.enableColorToBarPosition;

        var defaultDecorators = [
            config.flip && GrammarRegistry.get('flip'),
            enableStack && GrammarRegistry.get('stack'),
            enableColorPositioning && GrammarRegistry.get('positioningByColor')
        ];

        this.decorators = (this.config.transformRules || defaultDecorators).concat(config.transformModel || []);
        this.adjusters = (this.config.adjustRules || []);
    }

    defineGrammarModel(fnCreateScale) {
        const config = this.config;
        this.regScale('x', fnCreateScale('pos', config.x, [0, config.options.width]))
            .regScale('y', fnCreateScale('pos', config.y, [config.options.height, 0]))
            .regScale('size', fnCreateScale('size', config.size, {}))
            .regScale('color', fnCreateScale('color', config.color, {}))
            .regScale('split', fnCreateScale('split', config.split, {}))
            .regScale('label', fnCreateScale('label', config.label, {}))
            .regScale('identity', fnCreateScale('identity', config.identity, {}));

        const scaleX = this.getScale('x');
        const scaleY = this.getScale('y');
        const scaleSize = this.getScale('size');
        const scaleLabel = this.getScale('label');
        const scaleColor = this.getScale('color');
        const scaleSplit = this.getScale('split');
        const scaleIdentity = this.getScale('identity');

        const ys = scaleY.domain();
        const min = scaleY.discrete ?
            ys[0] :
            Math.max(0, Math.min(...ys)); // NOTE: max also can be below 0
        const y0 = scaleY.value(min) + scaleY.stepSize(min) * 0.5;
        const order = scaleColor.domain();
        const delimiter = '(@taucharts@)';

        return {
            data: (() => this.data()),
            flip: false,
            scaleX,
            scaleY,
            scaleSize,
            scaleLabel,
            scaleColor,
            scaleSplit,
            scaleIdentity,
            color: ((d) => scaleColor.value(d[scaleColor.dim])),
            label: ((d) => scaleLabel.value(d[scaleLabel.dim])),
            group: ((d) => (`${d[scaleColor.dim]}${delimiter}${d[scaleSplit.dim]}`)),
            order: ((group) => {
                const color = group.split(delimiter)[0];
                const i = order.indexOf(color);
                return ((i < 0) ? Number.MAX_VALUE : i);
            }),
            size: ((d) => (scaleSize.value(d[scaleSize.dim]))),
            id: ((row) => scaleIdentity.value(row[scaleIdentity.dim], row)),
            xi: ((d) => scaleX.value(d[scaleX.dim])),
            yi: ((d) => scaleY.value(d[scaleY.dim])),
            y0: (() => y0)
        };
    }

    getGrammarRules() {
        return this.decorators.filter(x => x);
    }

    getAdjustScalesRules() {
        return (this.adjusters || []).filter(x => x);
    }

    createScreenModel(grammarModel) {
        const flip = grammarModel.flip;
        const iff = ((statement, yes, no) => statement ? yes : no);
        return {
            flip,
            id: grammarModel.id,
            x: iff(flip, grammarModel.yi, grammarModel.xi),
            y: iff(flip, grammarModel.xi, grammarModel.yi),
            x0: iff(flip, grammarModel.y0, grammarModel.xi),
            y0: iff(flip, grammarModel.xi, grammarModel.y0),
            size: grammarModel.size,
            group: grammarModel.group,
            order: grammarModel.order,
            label: grammarModel.label,
            color: (d) => grammarModel.scaleColor.toColor(grammarModel.color(d)),
            class: (d) => grammarModel.scaleColor.toClass(grammarModel.color(d)),
            model: grammarModel,
            toFibers: () => {
                const data = grammarModel.data();
                const groups = utils.groupBy(data, grammarModel.group);
                return (Object
                    .keys(groups)
                    .sort((a, b) => grammarModel.order(a) - grammarModel.order(b))
                    .reduce((memo, k) => memo.concat([groups[k]]), []));
            }
        };
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

        var groups = utils.groupBy(this.data(), self.screenModel.group);
        var fibers = Object
            .keys(groups)
            .sort((a, b) => self.screenModel.order(a) - self.screenModel.order(b))
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