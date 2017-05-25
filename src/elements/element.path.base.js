import {LayerLabels} from './decorators/layer-labels';
import {CSS_PREFIX} from '../const';
import {
    d3_animationInterceptor,
    d3_setAttrs as attrs,
    d3_setClasses as classes,
    d3_transition as transition
} from '../utils/d3-decorators';
import * as utils from '../utils/utils';
import * as utilsDom from '../utils/utils-dom';
import * as utilsDraw from '../utils/utils-draw';
import * as d3 from 'd3';

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

        const updateGroupContainer = function (selection) {

            selection.call(attrs(model.groupAttributes));

            const points = selection
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
            const merged = points
                .enter()
                .append('circle')
                .call(createUpdateFunc(guide.animationSpeed, model.dotAttributesDefault, model.dotAttributes))
                .merge(points);

            node.subscribe(merged);

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

            const series = selection
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
                ));
            const allSeries = series
                .enter()
                .append(model.pathElement)
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesEnterInit,
                    model.pathAttributesEnterDone,
                    model.afterPathUpdate
                ))
                .merge(series)
                .call(updatePath);

            node.subscribe(merged);

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

                const dots = selection
                    .selectAll(`.${anchorClass}`)
                    .data((fiber) => fiber.filter(isNonSyntheticRecord), screenModel.id);
                dots.exit()
                    .remove();
                dots.call(createUpdateFunc(guide.animationSpeed, null, attr));
                const allDots = dots.enter()
                    .append('circle')
                    .call(createUpdateFunc(guide.animationSpeed, {r: 0}, attr))
                    .merge(dots);

                node.subscribe(allDots);
            }
        };

        const fullFibers = screenModel.toFibers();
        const pureFibers = fullFibers.map((arr) => arr.filter(isNonSyntheticRecord));

        const frameSelection = options.container.selectAll('.frame');

        // NOTE: If any point from new dataset is equal to a point from old dataset,
        // we assume that path remains the same.
        // TODO: Id of data array should remain the same (then use `fib => self.screenModel.id(fib)`).
        const getDataSetId = (() => {
            const current = (frameSelection.empty() ? [] : frameSelection.data());
            const currentIds = new Map();
            frameSelection.each(function (d) {
                currentIds.set(d, Number(this.getAttribute('data-id')));
            });
            const currentInnerIds = current.reduce((map, ds) => {
                map.set(ds, ds.map(screenModel.id));
                return map;
            }, new Map());
            const newIds = new Map();
            var notFoundCounter = Math.max(0, ...Array.from(currentIds.values()));
            return (fib) => {
                if (newIds.has(fib)) {
                    return newIds.get(fib);
                }
                const fibIds = fib.map((f) => screenModel.id(f));
                const matching = (Array.from(currentInnerIds.entries()).find(([, currIds]) => {
                    return fibIds.some((newId) => {
                        return currIds.some((id) => id === newId);
                    });
                }) || [null])[0];
                var result;
                if (matching) {
                    result = currentIds.get(matching);
                } else {
                    ++notFoundCounter;
                    result = notFoundCounter;
                }
                newIds.set(fib, result);
                return result;
            };
        })();
        this._getDataSetId = getDataSetId;

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
            .attr('data-id', getDataSetId)
            .call(updateGroupContainer);

        frameBinding.order();

        // TODO: Exclude removed elements from calculation.
        this._boundsInfo = this._getBoundsInfo(options.container.selectAll('.i-data-anchor').nodes());

        node.subscribe(new LayerLabels(
            screenModel.model,
            config.flip,
            config.guide.label,
            options).draw(pureFibers));
    },

    _getBoundsInfo(dots) {
        if (dots.length === 0) {
            return null;
        }

        const screenModel = this.node().screenModel;
        const {flip} = this.node().config;

        const items = dots
            .map((node) => {
                const data = d3.select(node).data()[0];
                const x = screenModel.x(data);
                const y = screenModel.y(data);

                return {node, data, x, y};
            })
            // TODO: Removed elements should not be passed to this function.
            .filter((item) => !isNaN(item.x) && !isNaN(item.y));

        const bounds = items.reduce(
            (bounds, {x, y}) => {
                bounds.left = Math.min(x, bounds.left);
                bounds.right = Math.max(x, bounds.right);
                bounds.top = Math.min(y, bounds.top);
                bounds.bottom = Math.max(y, bounds.bottom);
                return bounds;
            }, {
                left: Number.MAX_VALUE,
                right: Number.MIN_VALUE,
                top: Number.MAX_VALUE,
                bottom: Number.MIN_VALUE
            });

        const ticks = utils.unique(items.map(flip ?
            ((item) => item.y) :
            ((item) => item.x))).sort((a, b) => a - b);
        const groups = ticks.reduce(((obj, value) => (obj[value] = [], obj)), {});
        items.forEach((item) => {
            const tick = ticks.find(flip ? ((value) => item.y === value) : ((value) => item.x === value));
            groups[tick].push(item);
        });
        const split = (values) => {
            if (values.length === 1) {
                return groups[values];
            }
            const midIndex = Math.ceil(values.length / 2);
            const middle = (values[midIndex - 1] + values[midIndex]) / 2;
            return {
                middle,
                lower: split(values.slice(0, midIndex)),
                greater: split(values.slice(midIndex))
            };
        };
        const tree = split(ticks);

        return {bounds, tree};
    },

    getClosestElement(cursorX, cursorY) {
        if (!this._boundsInfo) {
            return null;
        }
        const {bounds, tree} = this._boundsInfo;
        const container = this.node().config.options.container;
        const {flip} = this.node().config;
        const translate = utilsDraw.getDeepTransformTranslate(container.node());
        const {maxHighlightDistance} = this.node().config.guide;
        if ((cursorX < bounds.left + translate.x - maxHighlightDistance) ||
            (cursorX > bounds.right + translate.x + maxHighlightDistance) ||
            (cursorY < bounds.top + translate.y - maxHighlightDistance) ||
            (cursorY > bounds.bottom + translate.y + maxHighlightDistance)
        ) {
            return null;
        }

        const cursor = (flip ? (cursorY - translate.y) : (cursorX - translate.x));
        const items = (function getClosestElements(el) {
            if (Array.isArray(el)) {
                return el;
            }
            return getClosestElements(cursor > el.middle ? el.greater : el.lower);
        })(tree)
            .map((el) => {
                const x = (el.x + translate.x);
                const y = (el.y + translate.y);
                const distance = Math.abs(flip ? (cursorY - y) : (cursorX - x));
                const secondaryDistance = Math.abs(flip ? (cursorX - x) : (cursorY - y));
                return {node: el.node, data: el.data, distance, secondaryDistance, x, y};
            })
            .sort((a, b) => (a.distance === b.distance ?
                (a.secondaryDistance - b.secondaryDistance) :
                (a.distance - b.distance)
            ));

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
            .call(classes({
                [x]: ((fiber) => hasTarget && targetFibers.indexOf(fiber) >= 0),
                [_]: ((fiber) => hasTarget && targetFibers.indexOf(fiber) < 0)
            }));

        const classed = {
            [x]: ((d) => filter(d) === true),
            [_]: ((d) => filter(d) === false)
        };

        container
            .selectAll('.i-role-dot')
            .call(classes(classed));

        container
            .selectAll('.i-role-label')
            .call(classes(classed));

        this._sortElements(filter);
    },

    highlightDataPoints(filter) {
        const cssClass = 'i-data-anchor';
        const screenModel = this.node().screenModel;
        const showOnHover = this.node().config.guide.showAnchors === 'hover';
        const rmin = 4; // Min highlight radius
        const rx = 1.25; // Highlight multiplier
        const unit = this.node();
        const container = unit.config.options.container;
        const dots = container
            .selectAll(`.${cssClass}`)
            .attr('r', (showOnHover ?
                ((d) => filter(d) ? Math.max(rmin, (screenModel.size(d) / 2)) : 0) :
                ((d) => {
                    // NOTE: Highlight point with larger radius.
                    var r = screenModel.size(d) / 2;
                    if (filter(d)) {
                        r = Math.max(rmin, Math.ceil(r * rx));
                    }
                    return r;
                })
            ))
            .attr('opacity', (showOnHover ? ((d) => filter(d) ? 1 : 0) : 1))
            .attr('fill', (d) => screenModel.color(d))
            .attr('class', (d) => utilsDom.classes(cssClass, screenModel.class(d)))
            .classed(`${CSS_PREFIX}highlighted`, filter);

        // Display cursor line
        const flip = unit.config.flip;
        const highlighted = dots.filter(filter);
        var cursorLine = container.select('.cursor-line');
        if (highlighted.empty()) {
            cursorLine.remove();
        } else {
            if (cursorLine.empty()) {
                cursorLine = container.append('line');
            }
            const model = unit.screenModel.model;
            const x1 = model.xi(highlighted.data()[0]);
            const x2 = model.xi(highlighted.data()[0]);
            const domain = model.scaleY.domain();
            const y1 = model.scaleY(domain[0]);
            const y2 = model.scaleY(domain[1]);
            cursorLine
                .attr('class', 'cursor-line')
                .attr('x1', flip ? y1 : x1)
                .attr('y1', flip ? x1 : y1)
                .attr('x2', flip ? y2 : x2)
                .attr('y2', flip ? x2 : y2);
        }

        this._sortElements(filter);
    },

    _sortElements(filter) {

        const container = this.node().config.options.container;

        const pathId = new Map();
        const pathFilter = new Map();
        const getDataSetId = this._getDataSetId;
        container.selectAll('.i-role-path').each(function (d) {
            pathId.set(this, getDataSetId(d));
            pathFilter.set(this, d
                .filter(isNonSyntheticRecord)
                .some(filter));
        });

        const compareFilterThenGroupId = utils.createMultiSorter(
            (a, b) => (pathFilter.get(a) - pathFilter.get(b)),
            (a, b) => (pathId.get(a) - pathId.get(b))
        );
        const elementsOrder = {
            line: 0,
            g: 1,
            text: 2
        };
        utilsDom.sortChildren(container.node(), (a, b) => {
            if (a.tagName === 'g' && b.tagName === 'g') {
                return compareFilterThenGroupId(a, b);
            }
            return (elementsOrder[a.tagName] - elementsOrder[b.tagName]);
        });
    }
};

export {BasePath};