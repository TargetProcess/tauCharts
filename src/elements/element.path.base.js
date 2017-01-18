import {LayerLabels} from './decorators/layer-labels';
import {CSS_PREFIX} from '../const';
import {d3_animationInterceptor, d3_transition as transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import d3 from 'd3';

const synthetic = 'taucharts_synthetic_record';
const isNonSyntheticRecord = ((row) => row[synthetic] !== true);

const BasePath = {

    grammarRuleFillGaps: (model) => {
        const data = model.data();
        const groups = utils.groupBy(data, model.group);
        const fibers = (Object
            .keys(groups)
            .sort((a, b) => model.order(a) - model.order(b)))
            .reduce((memo, k) => memo.concat([groups[k]]), []);

        const dx = model.scaleX.dim;
        const dy = model.scaleY.dim;
        const dc = model.scaleColor.dim;
        const ds = model.scaleSplit.dim;
        const calcSign = ((row) => ((row[dy] >= 0) ? 1 : -1));

        const gen = (x, sampleRow, sign) => {
            const genId = [x, model.id(sampleRow), sign].join(' ');
            return {
                [dx]: x,
                [dy]: sign * (1e-10),
                [ds]: sampleRow[ds],
                [dc]: sampleRow[dc],
                [synthetic]: true,
                [synthetic + 'id']: genId
            };
        };

        const merge = (templateSorted, fiberSorted, sign) => {
            const groups = utils.groupBy(fiberSorted, (row) => row[dx]);
            const sample = fiberSorted[0];
            return templateSorted.reduce((memo, k) => memo.concat((groups[k] || (gen(k, sample, sign)))), []);
        };

        const asc = (a, b) => a - b;
        const xs = utils
            .unique(fibers.reduce((memo, fib) => memo.concat(fib.map((row) => row[dx])), []))
            .sort(asc);

        const nextData = fibers
            .map((fib) => fib.sort((a, b) => model.xi(a) - model.xi(b)))
            .reduce((memo, fib) => {
                const bySign = utils.groupBy(fib, calcSign);
                return Object.keys(bySign).reduce((memo, s) => memo.concat(merge(xs, bySign[s], s)), memo);
            }, []);

        return {
            data: () => nextData,
            id: (row) => ((row[synthetic]) ? row[synthetic + 'id'] : model.id(row))
        };
    },

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
                hideEqualLabels: true,
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
        node.on('click-data-points', (sender, e) => this.highlightDataPoints(e));

        if (config.guide.showAnchors !== 'never') {
            const getHighlightEvtObj = (e, data) => {
                const filter = ((d) => d === data);
                filter.data = data;
                filter.domEvent = e;
                return filter;
            };
            const activate = ((sender, e) => sender.fire('highlight-data-points', getHighlightEvtObj(e.event, e.data)));
            const deactivate = ((sender, e) => sender.fire('highlight-data-points', getHighlightEvtObj(e.event, null)));
            const click = ((sender, e) => sender.fire('click-data-points', getHighlightEvtObj(e.event, e.data)));
            node.on('mouseover', activate);
            node.on('mousemove', activate);
            node.on('mouseout', deactivate);
            node.on('click', click);
        }
    },

    draw() {
        const node = this.node();
        const config = node.config;
        const guide = config.guide;
        const options = config.options;
        options.container = options.slot(config.uid);

        const screenModel = node.screenModel;
        const model = this.buildModel(screenModel);

        const createUpdateFunc = d3_animationInterceptor;

        const updateGroupContainer = function () {

            this.attr(model.groupAttributes);

            const points = this
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

            node.subscribe(points, (d) => d);

            const updatePath = (selection) => {
                if (config.guide.animationSpeed > 0) {
                    // HACK: This call fixes stacked area tween (some paths are intersected on
                    // synthetic points). Maybe caused by async call of `toPoint`.
                    selection.attr(model.pathTween.attr, function (d) {
                        return model.pathTween.fn.call(this, d)(0);
                    });

                    transition(selection, config.guide.animationSpeed, 'pathTransition')
                        .attrTween(model.pathTween.attr, model.pathTween.fn);
                } else {
                    selection.attr(model.pathTween.attr, function (d) {
                        return model.pathTween.fn.call(this, d)(1);
                    });
                }
            };

            const series = this
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

            node.subscribe(series, function (rows) {
                const m = d3.mouse(this);
                return model.matchRowInCoordinates(
                    rows.filter(isNonSyntheticRecord),
                    {x: m[0], y: m[1]});
            });

            if (guide.showAnchors !== 'never') {
                const anchorClass = 'i-data-anchor';
                const attr = {
                    r: (guide.showAnchors === 'hover' ? 0 :
                        ((d) => screenModel.size(d) / 2)
                    ),
                    cx: (d) => model.x(d),
                    cy: (d) => model.y(d),
                    opacity: (guide.showAnchors === 'hover' ? 0 : 1),
                    fill: (d) => screenModel.color(d),
                    class: anchorClass
                };

                const dots = this
                    .selectAll(`.${anchorClass}`)
                    .data((fiber) => fiber.filter(isNonSyntheticRecord), screenModel.id);
                dots.exit()
                    .remove();
                dots.call(createUpdateFunc(guide.animationSpeed, null, attr));
                dots.enter()
                    .append('circle')
                    .call(createUpdateFunc(guide.animationSpeed, {r: 0}, attr));

                node.subscribe(dots);
            }
        };

        const fullFibers = screenModel.toFibers();
        const pureFibers = fullFibers.map((arr) => arr.filter(isNonSyntheticRecord));

        const frameSelection = options.container.selectAll('.frame');

        // NOTE: If any point from new dataset is equal to a point from old dataset,
        // we assume that path remains the same.
        // TODO: Id of data array should remain the same (then use `fib => self.screenModel.id(fib)`).
        const getDataSetId = (() => {
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

        const frameBinding = frameSelection
            .data(fullFibers, getDataSetId);
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

        node.subscribe(new LayerLabels(
            screenModel.model,
            config.flip,
            config.guide.label,
            options).draw(pureFibers));
    },

    highlight(filter) {

        const container = this.node().config.options.container;

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        container
            .selectAll('.i-role-path')
            .classed({
                [x]: ((fiber) => filter(fiber.filter(isNonSyntheticRecord)[0]) === true),
                [_]: ((fiber) => filter(fiber.filter(isNonSyntheticRecord)[0]) === false)
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
        const rmin = 4; // Min highlight radius
        const rx = 1.25; // Highlight multiplier
        var anchors = this.node()
            .config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (showOnHover ?
                    ((d) => filter(d) ? Math.max(rmin, (screenModel.size(d) / 2)) : 0) :
                    ((d) => {
                        // NOTE: Highlight point with larger radius.
                        var r = screenModel.size(d) / 2;
                        if (filter(d)) {
                            r = Math.max(rmin, Math.ceil(r * rx));
                        }
                        return r;
                    })
                ),
                opacity: (showOnHover ? ((d) => filter(d) ? 1 : 0) : 1),
                fill: (d) => screenModel.color(d),
                class: (d) => utilsDom.classes(cssClass, screenModel.class(d))
            })
            .classed(`${CSS_PREFIX}highlighted`, filter);

        // Add highlighted elements to event
        filter.targetElements = [];
        anchors.filter(filter).each(function () {
            filter.targetElements.push(this);
        });
    }
};

export {BasePath};