import * as d3 from 'd3';
import {CSS_PREFIX} from '../const';
import * as utils from '../utils/utils';
import * as utilsDraw from '../utils/utils-draw';
import {BasePath} from './element.path.base';
import {getLineClassesByCount} from '../utils/css-class-map';
import {GrammarRegistry} from '../grammar-registry';
import {d3_createPathTween} from '../utils/d3-decorators';
import {getInterpolatorSplineType} from '../utils/path/interpolators/interpolators-registry';
import {getAreaPolygon, getSmoothAreaPath} from '../utils/path/svg/area-path';
import {
    GrammarElement
} from '../definitions';

const Area = {

    draw: BasePath.draw,
    highlight: BasePath.highlight,
    highlightDataPoints: BasePath.highlightDataPoints,
    addInteraction: BasePath.addInteraction,
    _sortElements: BasePath._sortElements,

    init(xConfig) {

        const config = BasePath.init(xConfig);
        const enableStack = config.stack;

        config.transformRules = [
            config.flip && GrammarRegistry.get('flip'),
            !enableStack && GrammarRegistry.get('groupOrderByAvg'),
            enableStack && BasePath.grammarRuleFillGaps,
            enableStack && GrammarRegistry.get('stack')
        ];

        config.adjustRules = [
            ((prevModel, args) => {
                const isEmptySize = prevModel.scaleSize.isEmptyScale();
                const sizeCfg = utils.defaults(
                    (config.guide.size || {}),
                    {
                        defMinSize: 2,
                        defMaxSize: (isEmptySize ? 6 : 40)
                    });
                const params = Object.assign(
                    {},
                    args,
                    {
                        defMin: sizeCfg.defMinSize,
                        defMax: sizeCfg.defMaxSize,
                        minLimit: sizeCfg.minSize,
                        maxLimit: sizeCfg.maxSize
                    });

                return GrammarRegistry.get('adjustStaticSizeScale')(prevModel, params);
            })
        ];

        return config;
    },

    buildModel(screenModel) {

        const baseModel = BasePath.baseModel(screenModel);

        const guide = this.node().config.guide;
        const countCss = getLineClassesByCount(screenModel.model.scaleColor.domain().length);
        const groupPref = `${CSS_PREFIX}area area i-role-path ${countCss} ${guide.cssClass} `;

        baseModel.groupAttributes = {
            class: (fiber) => `${groupPref} ${baseModel.class(fiber[0])} frame`
        };

        const toDirPoint = (d) => ({
            id: screenModel.id(d),
            x: baseModel.x(d),
            y: baseModel.y(d)
        });

        const toRevPoint = (d) => ({
            id: screenModel.id(d),
            x: baseModel.x0(d),
            y: baseModel.y0(d)
        });

        const pathAttributes = {
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

        const isPolygon = (getInterpolatorSplineType(guide.interpolate) === 'polyline');
        baseModel.pathElement = (isPolygon ? 'polygon' : 'path');
        baseModel.anchorShape = 'vertical-stick';

        baseModel.pathTween = {
            attr: (isPolygon ? 'points' : 'd'),
            fn: d3_createPathTween(
                (isPolygon ? 'points' : 'd'),
                (isPolygon ? getAreaPolygon : getSmoothAreaPath),
                [toDirPoint, toRevPoint],
                screenModel.id,
                guide.interpolate
            )
        };

        return baseModel;
    },

    _getBoundsInfo(this: GrammarElement, dots: Element[]) {
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
                const y0 = screenModel.y0(data);
                const group = screenModel.group(data);

                const item = {node, data, x, y, y0, group};

                return item;
            });

        const bounds = items.reduce(
            (bounds, {x, y, y0}) => {
                bounds.left = Math.min(x, bounds.left);
                bounds.right = Math.max(x, bounds.right);
                bounds.top = Math.min(y, y0, bounds.top);
                bounds.bottom = Math.max(y, y0, bounds.bottom);
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
        const groups = ticks.reduce(((obj, value) => (obj[value] = [], obj)), {} as {[x: number]: ElementInfo[]});
        items.forEach((item) => {
            const tick = ticks.find(flip ? ((value) => item.y === value) : ((value) => item.x === value));
            groups[tick].push(item);
        });
        const split = (values: number[]): TreeNode => {
            if (values.length === 2) {
                let [start, end] = values;
                return {
                    start,
                    end,
                    isLeaf: true,
                    items: {
                        start: groups[start],
                        end: groups[end]
                    }
                };
            }

            const midIndex = ((values.length % 2 === 0) ?
                (values.length / 2) :
                ((values.length - 1) / 2));
            const middle = values[midIndex];
            return {
                start: values[0],
                end: values[values.length - 1],
                isLeaf: false,
                left: split(values.slice(0, midIndex + 1)),
                right: split(values.slice(midIndex))
            };
        };
        const tree = split(ticks);

        return {bounds, tree};
    },

    getClosestElement(cursorX: number, cursorY: number) {
        if (!this._boundsInfo) {
            return null;
        }
        const {bounds, tree} = this._boundsInfo as BoundsInfo;
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
        const closestSpan = (function getClosestSpan(span): TreeNode {
            if (span.isLeaf) {
                return span;
            }
            const mid = span.left.end;
            return getClosestSpan(cursor < mid ? span.left : span.right);
        })(tree);
        var kx = ((cursor - closestSpan.start) / (closestSpan.end - closestSpan.start));
        if (kx < 0) {
            kx = 0;
        }
        if (kx > 1) {
            kx = 1;
        }
        const interpolated = (() => {
            interface Pair {
                start: ElementInfo;
                end: ElementInfo;
                y: number;
                y0: number;
            }
            const groups = closestSpan.items.start.reduce((map, el) => {
                map[el.group] = {
                    start: el,
                    end: null,
                    y: null,
                    y0: null
                };
                return map;
            }, {} as {[group: string]: Pair});
            closestSpan.items.end.forEach((el) => {
                if (groups[el.group] === undefined) {
                    delete groups[el.group];
                    return;
                }
                groups[el.group].end = el;
            });
            Object.keys(groups).forEach((key) => {
                const g = groups[key];
                if (!g.end) {
                    delete groups[key];
                    return;
                }
                g.y = (g.start.y + kx * (g.end.y - g.start.y));
                g.y0 = (g.start.y0 + kx * (g.end.y0 - g.start.y0));
            });

            return Object.keys(groups).map((g) => groups[g])
                .map((d) => ({
                    y: d.y,
                    y0: d.y0,
                    el: (kx < 0.5 ? d.start : d.end)
                }));
        })();
        const items = interpolated
            .filter((d) => (cursorY >= d.y && cursorY <= d.y0))
            .map((d) => d.el)
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
    }
};

interface BoundsInfo {
    bounds: {left; right; top; bottom;};
    tree: TreeNode;
}

interface ElementInfo {
    x: number;
    y: number;
    y0: number;
    data: any;
    group: string;
    node: Element;
}

interface TreeNode {
    start: number;
    end: number;
    isLeaf: boolean;
    left?: TreeNode;
    right?: TreeNode;
    items?: {
        start: ElementInfo[];
        end: ElementInfo[];
    };
}

export {Area};
