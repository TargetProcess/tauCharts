import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {CSS_PREFIX} from '../const';
import {d3_animationInterceptor, d3_transition as transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {default as d3} from 'd3';

const BasePath = {

    init(xConfig) {

        const config = xConfig;

        config.guide = utils.defaults(
            (config.guide || {}),
            {
                animationSpeed: 0,
                cssClass: '',
                widthCssClass: '',
                color: {},
                label: {}
            }
        );

        config.guide.label = utils.defaults(
            config.guide.label,
            {
                fontSize: 11,
                position: [
                    'auto:avoid-label-label-overlap',
                    'auto:avoid-label-anchor-overlap',
                    'auto:avoid-label-edges-overlap',
                    'auto:adjust-on-label-overflow',
                    'auto:hide-on-label-label-overlap',
                    'auto:hide-on-label-edges-overlap'
                ]
            });

        config.guide.color = utils.defaults(config.guide.color || {}, {fill: null});

        if (['never', 'hover', 'always'].indexOf(config.guide.showAnchors) < 0) {
            config.guide.showAnchors = 'hover';
        }

        config.transformRules = [];
        config.adjustRules = [];

        return config;
    },

    baseModel(screenModel) {

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-dot ${datumClass} ${CSS_PREFIX}dot `;
        const kRound = 10000;
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
    },

    addInteraction() {
        const node = this.node();
        const config = this.node().config;

        node.on('highlight', (sender, e) => this.highlight(e));
        node.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        if (config.guide.showAnchors !== 'never') {
            const activate = ((sender, e) => sender.fire('highlight-data-points', (row) => (row === e.data)));
            const deactivate = ((sender) => sender.fire('highlight-data-points', () => (false)));
            node.on('mouseover', activate);
            node.on('mousemove', activate);
            node.on('mouseout', deactivate);
        }
    },

    draw() {

        const self = this;
        const config = this.node().config;
        const guide = config.guide;
        const options = config.options;
        options.container = options.slot(config.uid);

        var fullData = this.node().data();
        var screenModel = this.node().screenModel;
        var pathModel = screenModel.model;
        var model = this.buildModel(screenModel);

        var createUpdateFunc = d3_animationInterceptor;

        var updateGroupContainer = function () {

            this.attr(model.groupAttributes);

            var points = this
                .selectAll('circle')
                .data((fiber) => (fiber.length <= 1) ? fiber : [], screenModel.id);
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

            self.node().subscribe(points, (d) => d);

            var updatePath = (selection) => {
                if (config.guide.animationSpeed > 0) {
                    // HACK: This call fixes stacked area tween (some paths are intersected on
                    // synthetic points). Maybe caused by async call of `toPoint`.
                    selection.attr(model.pathTween.attr, (d) => model.pathTween.fn(d)(0));

                    transition(selection, config.guide.animationSpeed, 'pathTransition')
                        .attrTween(model.pathTween.attr, model.pathTween.fn);
                } else {
                    selection.attr(model.pathTween.attr, (d) => model.pathTween.fn(d)(1));
                }
            };

            var series = this
                .selectAll(model.pathElement)
                .data((fiber) => (fiber.length > 1) ? [fiber] : [], getDataSetId);
            series
                .exit()
                .remove();
            series
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesUpdateInit,
                    model.pathAttributesUpdateDone,
                    model.afterPathUpdate
                ))
                .call(updatePath);
            series
                .enter()
                .append(model.pathElement)
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesEnterInit,
                    model.pathAttributesEnterDone,
                    model.afterPathUpdate
                ))
                .call(updatePath);

            self.node().subscribe(series, function (rows) {
                var m = d3.mouse(this);
                return model.matchRowInCoordinates(
                    rows.filter(CartesianGrammar.isNonSyntheticRecord),
                    {x: m[0], y: m[1]});
            });

            if (guide.showAnchors !== 'never') {
                let anchorClass = 'i-data-anchor';

                let attr = {
                    r: (guide.showAnchors === 'hover' ? 0 :
                        ((d) => screenModel.size(d) / 2)
                    ),
                    cx: (d) => model.x(d),
                    cy: (d) => model.y(d),
                    opacity: (guide.showAnchors === 'hover' ? 0 : 1),
                    fill: (d) => screenModel.color(d),
                    class: anchorClass
                };

                let dots = this
                    .selectAll(`.${anchorClass}`)
                    .data((fiber) => fiber.filter(CartesianGrammar.isNonSyntheticRecord), screenModel.id);
                dots.exit()
                    .remove();
                dots.call(createUpdateFunc(guide.animationSpeed, null, attr));
                dots.enter()
                    .append('circle')
                    .call(createUpdateFunc(guide.animationSpeed, {r: 0}, attr));

                self.node().subscribe(dots);
            }
        };

        var fibers = config.stack ?
            CartesianGrammar.toStackedFibers(fullData, pathModel) :
            CartesianGrammar.toFibers(fullData, pathModel);

        var frameSelection = options.container.selectAll('.frame');

        // NOTE: If any point from new dataset is equal to a point from old dataset,
        // we assume that path remains the same.
        // TODO: Id of data array should remain the same (then use `fib => self.screenModel.id(fib)`).
        var getDataSetId = (() => {
            var currentDataSets = (frameSelection.empty() ? [] : frameSelection.data());
            var currentDatasetsIds = currentDataSets.map((ds) => ds.map(screenModel.id));
            var notFoundDatasets = 0;
            return (fib) => {
                var fibIds = fib.map((f) => screenModel.id(f));
                var currentIndex = currentDatasetsIds.findIndex((currIds) => {
                    return fibIds.some((newId) => {
                        return currIds.some((id) => id === newId);
                    });
                });
                if (currentIndex < 0) {
                    ++notFoundDatasets;
                    return -notFoundDatasets;
                }
                return currentIndex;
            };
        })();

        var frameBinding = frameSelection
            .data(fibers, getDataSetId);
        frameBinding
            .exit()
            .remove();
        frameBinding
            .call(updateGroupContainer);
        frameBinding
            .enter()
            .append('g')
            .call(updateGroupContainer);

        frameBinding.order();

        var dataFibers = CartesianGrammar.toFibers(fullData, pathModel);
        self.node()
            .subscribe(new LayerLabels(
                pathModel,
                config.flip,
                config.guide.label,
                options).draw(dataFibers));
    },

    highlight(filter) {

        const container = this.node().config.options.container;

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        container
            .selectAll('.i-role-path')
            .classed({
                [x]: ((fiber) => filter(fiber.filter(CartesianGrammar.isNonSyntheticRecord)[0]) === true),
                [_]: ((fiber) => filter(fiber.filter(CartesianGrammar.isNonSyntheticRecord)[0]) === false)
            });

        const classed = {
            [x]: ((d) => filter(d) === true),
            [_]: ((d) => filter(d) === false)
        };

        container
            .selectAll('.i-role-dot')
            .classed(classed);

        container
            .selectAll('.i-role-label')
            .classed(classed);
    },

    highlightDataPoints(filter) {
        const cssClass = 'i-data-anchor';
        const screenModel = this.node().screenModel;
        const showOnHover = this.node().config.guide.showAnchors === 'hover';
        this.node()
            .config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (showOnHover ?
                    ((d) => filter(d) ? (screenModel.size(d) / 2) : 0) :
                    ((d) => {
                        // NOTE: Highlight point with larger radius.
                        var r = screenModel.size(d) / 2;
                        if (filter(d)) {
                            return Math.ceil(r * 1.25);
                        }
                        return r;
                    })
                ),
                opacity: (showOnHover ? ((d) => filter(d) ? 1 : 0) : 1),
                fill: (d) => screenModel.color(d),
                class: (d) => utilsDom.classes(cssClass, screenModel.class(d))
            });
    }
};

export {BasePath};