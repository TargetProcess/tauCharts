import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {CSS_PREFIX} from '../const';
import {d3_animationInterceptor} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

export class BasePath extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = utils.defaults(
            (this.config.guide || {}),
            {
                animationSpeed: 0,
                cssClass: '',
                widthCssClass: '',
                showAnchors: true,
                anchorSize: 0.1,
                color: {},
                label: {}
            }
        );

        this.config.guide.label = utils.defaults(
            this.config.guide.label,
            {
                fontSize: 11,
                position: [
                    'auto:avoid-label-label-overlap',
                    'auto:avoid-label-anchor-overlap',
                    'auto:avoid-label-edges-overlap',
                    'auto:hide-on-label-label-overlap',
                    'auto:hide-on-label-edges-overlap',
                    'keep-in-box'
                ]
            });

        this.config.guide.color = utils.defaults(this.config.guide.color || {}, {fill: null});

        this.config.guide.size = utils.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: 2,
                defMaxSize: (this.isEmptySize ? 6 : 40)
            });

        this.decorators = [];

        this.on('highlight', (sender, e) => this.highlight(e));
        this.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        if (this.config.guide.showAnchors) {
            var activate = ((sender, e) => sender.fire('highlight-data-points', (row) => (row === e.data)));
            var deactivate = ((sender) => sender.fire('highlight-data-points', () => (false)));
            this.on('mouseover', activate);
            this.on('mousemove', activate);
            this.on('mouseout', deactivate);
        }
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.size = fnCreateScale('size', config.size, {});
        this.color = fnCreateScale('color', config.color, {});
        this.label = fnCreateScale('label', config.label, {});
        this.split = fnCreateScale('split', config.split, {});
        this.identity = fnCreateScale('identity', config.identity, {});

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color)
            .regScale('split', this.split)
            .regScale('label', this.label);
    }

    buildModel(screenModel) {

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-dot ${datumClass} ${CSS_PREFIX}dot `;
        var kRound = 10000;
        var baseModel = {
            gog: screenModel.model,
            x: screenModel.x,
            y: screenModel.y,
            x0: screenModel.x0,
            y0: screenModel.y0,
            size: screenModel.size,
            group: screenModel.group,
            order: screenModel.order,
            color: screenModel.color,
            class: screenModel.class,
            matchRowInCoordinates() {
                throw 'Not implemented';
            },
            groupAttributes: {},
            pathAttributesUpdateInit: {},
            pathAttributesUpdateDone: {},
            pathAttributesEnterInit: {},
            pathAttributesEnterDone: {},
            pathElement: null,
            dotAttributes: {
                r: ((d) => (Math.round(kRound * baseModel.size(d) / 2) / kRound)),
                cx: (d) => baseModel.x(d),
                cy: (d) => baseModel.y(d),
                fill: (d) => baseModel.color(d),
                class: (d) => (`${pointPref} ${baseModel.class(d)}`)
            },
            dotAttributesDefault: {
                r: 0,
                cy: (d) => baseModel.y0(d)
            }
        };

        return baseModel;
    }

    getDistance(mx, my, rx, ry) {
        return Math.sqrt(Math.pow((mx - rx), 2) + Math.pow((my - ry), 2));
    }

    walkFrames(frames) {

        var args = {
            isHorizontal: this.config.flip,
            defMin: this.config.guide.size.defMinSize,
            defMax: this.config.guide.size.defMaxSize,
            minLimit: this.config.guide.size.minSize,
            maxLimit: this.config.guide.size.maxSize,
            dataSource: frames.reduce(((memo, f) => memo.concat(f.part())), [])
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

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);
        var pathModel = this.walkFrames(frames);
        this.screenModel = pathModel.toScreenModel();
        var model = this.buildModel(this.screenModel);

        var createUpdateFunc = d3_animationInterceptor;

        var updateGroupContainer = function () {

            this.attr(model.groupAttributes);

            var points = this
                .selectAll('circle')
                .data((fiber) => (fiber.length <= 1) ? fiber : [], self.screenModel.id);
            points
                .exit()
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    null,
                    {r: 0},
                    (node) => d3.select(node).remove()));
            points
                .call(createUpdateFunc(guide.animationSpeed, null, model.dotAttributes));
            points
                .enter()
                .append('circle')
                .call(createUpdateFunc(guide.animationSpeed, model.dotAttributesDefault, model.dotAttributes));

            self.subscribe(points, (d) => d);

            var series = this
                .selectAll(model.pathElement)
                .data((fiber) => (fiber.length > 1) ? [fiber] : [], ((fib) => fib.map(self.screenModel.id).join('-')));
            series
                .exit()
                .remove();
            series
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesUpdateInit,
                    model.pathAttributesUpdateDone,
                    model.afterPathUpdate
                ));
            series
                .enter()
                .append(model.pathElement)
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesEnterInit,
                    model.pathAttributesEnterDone,
                    model.afterPathUpdate
                ));

            self.subscribe(series, function (rows) {
                var m = d3.mouse(this);
                return model.matchRowInCoordinates(
                    rows.filter(CartesianGrammar.isNonSyntheticRecord),
                    {x: m[0], y: m[1]});
            });

            if (guide.showAnchors) {

                let attr = {
                    r: () => guide.anchorSize,
                    cx: (d) => model.x(d),
                    cy: (d) => model.y(d),
                    opacity: 0,
                    class: 'i-data-anchor'
                };

                let dots = this
                    .selectAll('.i-data-anchor')
                    .data((fiber) => fiber.filter(CartesianGrammar.isNonSyntheticRecord));
                dots.exit()
                    .remove();
                dots.call(createUpdateFunc(guide.animationSpeed, null, attr));
                dots.enter()
                    .append('circle')
                    .call(createUpdateFunc(guide.animationSpeed, {r: 0}, attr));

                self.subscribe(dots);
            }
        };

        var fibers = this.config.stack ?
            CartesianGrammar.toStackedFibers(fullData, pathModel) :
            CartesianGrammar.toFibers(fullData, pathModel);

        var frameGroups = options
            .container
            .selectAll('.frame')
            .data(fibers);
        frameGroups
            .exit()
            .remove();
        frameGroups
            .call(updateGroupContainer);
        frameGroups
            .enter()
            .append('g')
            .call(updateGroupContainer);

        var dataFibers = CartesianGrammar.toFibers(fullData, pathModel);
        self.subscribe(new LayerLabels(pathModel, this.config.flip, this.config.guide.label, options).draw(dataFibers));
    }

    highlight(filter) {

        var container = this.config.options.container;

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        container
            .selectAll('.i-role-path')
            .classed({
                [x]: ((fiber) => filter(fiber.filter(CartesianGrammar.isNonSyntheticRecord)[0]) === true),
                [_]: ((fiber) => filter(fiber.filter(CartesianGrammar.isNonSyntheticRecord)[0]) === false)
            });

        container
            .selectAll('.i-role-dot')
            .classed({
                [x]: ((d) => filter(d) === true),
                [_]: ((d) => filter(d) === false)
            });

        container
            .selectAll('.i-role-label')
            .classed({
                [x]: ((d) => filter(d) === true),
                [_]: ((d) => filter(d) === false)
            });
    }

    highlightDataPoints(filter) {
        const cssClass = 'i-data-anchor';
        this.config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (d) => (filter(d) ? (this.screenModel.size(d) / 2) : this.config.guide.anchorSize),
                opacity: (d) => (filter(d) ? 1 : 0),
                fill: (d) => this.screenModel.color(d),
                class: (d) => (`${cssClass} ${this.screenModel.class(d)}`)
            });
    }
}