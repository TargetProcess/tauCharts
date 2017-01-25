import {LayerLabels} from './decorators/layer-labels';
import {CSS_PREFIX} from '../const';
import {d3_animationInterceptor, d3_transition as transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {utilsDraw} from '../utils/utils-draw';
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
                maxHighlightDistance: 32,
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
        const createFilter = ((data, falsy) => ((row) => row === data ? true : falsy));
        node.on('highlight', (sender, filter) => this.highlight(filter));
        node.on('highlight-data-points', (sender, filter) => this.highlightDataPoints(filter));
        if (config.guide.showAnchors !== 'never') {
            node.on('data-hover', ((sender, e) => this.highlightDataPoints(createFilter(e.data, null))));
            node.on('data-click', ((sender, e) => this.highlight(createFilter(e.data, e.data ? false : null))));
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

            node.subscribe(points);

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

            node.subscribe(series);

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

    getClosestElement(cursorX, cursorY) {
        const container = this.node().config.options.container;
        const screenModel = this.node().screenModel;
        const {flip} = this.node().config;
        const {maxHighlightDistance} = this.node().config.guide;

        const dots = container.selectAll('.i-data-anchor');
        var minX = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        const items = dots[0]
            .map((node) => {
                const data = d3.select(node).data()[0];
                const translate = utilsDraw.getDeepTransformTranslate(node);
                const x = (screenModel.x(data) + translate.x);
                const y = (screenModel.y(data) + translate.y);
                var distance = Math.abs(flip ? (y - cursorY) : (x - cursorX));
                var secondaryDistance = Math.abs(flip ? (x - cursorX) : (y - cursorY));
                minX = Math.min(x, minX);
                maxX = Math.max(x, maxX);
                minY = Math.min(y, minY);
                maxY = Math.max(y, maxY);
                return {node, data, distance, secondaryDistance, x, y};
            })
            .filter((d) => d && !isNaN(d.x) && !isNaN(d.y))
            .sort((a, b) => (a.distance === b.distance ?
                (a.secondaryDistance - b.secondaryDistance) :
                (a.distance - b.distance)
            ));

        if ((items.length === 0) ||
            (cursorX < minX - maxHighlightDistance) ||
            (cursorX > maxX + maxHighlightDistance) ||
            (cursorY < minY - maxHighlightDistance) ||
            (cursorY > maxY + maxHighlightDistance)
        ) {
            return null;
        }

        const largerDistIndex = items.findIndex((d) => (
            (d.distance !== items[0].distance) ||
            (d.secondaryDistance !== items[0].secondaryDistance)
        ));
        const sameDistItems = (largerDistIndex < 0 ? items : items.slice(0, largerDistIndex));
        if (sameDistItems.length === 1) {
            return sameDistItems[0];
        }
        const mx = (sameDistItems.reduce((sum, item) => sum + item.x, 0) / sameDistItems.length);
        const my = (sameDistItems.reduce((sum, item) => sum + item.y, 0) / sameDistItems.length);
        const angle = (Math.atan2(my - cursorY, mx - cursorX) + Math.PI);
        const closest = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)];
        return closest;
    },

    highlight(filter) {

        const container = this.node().config.options.container;

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        const paths = container.selectAll('.i-role-path');
        const targetFibers = paths.data()
            .filter((fiber) => {
                return fiber
                    .filter(isNonSyntheticRecord)
                    .some(filter);
            });
        const hasTarget = (targetFibers.length > 0);

        paths
            .classed({
                [x]: ((fiber) => hasTarget && targetFibers.indexOf(fiber) >= 0),
                [_]: ((fiber) => hasTarget && targetFibers.indexOf(fiber) < 0)
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
        const container = this.node().config.options.container;
        container
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

        utilsDraw.raiseElements(container, '.i-role-path', (fiber) => {
            return fiber
                .filter(isNonSyntheticRecord)
                .some(filter);
        });
    }
};

export {BasePath};