import {CSS_PREFIX} from '../../const';
import {
    d3_animationInterceptor as createUpdateFunc,
    d3_setAttrs as attrs,
} from '../../utils/d3-decorators';
import * as utilsDom from '../../utils/utils-dom';
import {
    d3Selection,
    GrammarElement,
    GrammarModel,
    UnitGuide,
} from '../../definitions';
import {getBrushLine} from '../../utils/path/svg/brush-line'

const synthetic = 'taucharts_synthetic_record';
const isNonSyntheticRecord = ((row) => row[synthetic] !== true);

export function drawAnchors(node: GrammarElement, model: any, selection: d3Selection) {
    const shape = model.anchorShape;
    const config = node.config;
    const guide = config.guide;
    const screenModel = node.screenModel;

    const anchorClass = 'i-data-anchor';
    const attr = {
        ...anchorShapes[shape].getInitialAttrs(node, model),
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
        .append(anchorShapes[model.anchorShape].element)
        .call(createUpdateFunc(guide.animationSpeed, {r: 0}, attr))
        .merge(dots) as d3Selection;

    return allDots;
}

export function highlightAnchors(node: GrammarElement, model: any, filter: (row) => boolean | null) {
    const shape = model.anchorShape;
    const cssClass = 'i-data-anchor';
    const screenModel = node.screenModel;
    const showOnHover = node.config.guide.showAnchors === 'hover';
    const container = node.config.options.container;
    const dots = container
        .selectAll(`.${cssClass}`)
        .call(attrs(anchorShapes[shape].getHighlightAttrs(node, model, filter)))
        .attr('opacity', (showOnHover ? ((d) => filter(d) ? 1 : 0) : () => 1))
        .attr('fill', (d) => screenModel.color(d))
        .attr('class', (d) => utilsDom.classes(cssClass, screenModel.class(d)))
        .classed(`${CSS_PREFIX}highlighted`, filter) as d3Selection;

    return dots;
}

interface ShapesAttrsDictionary {
    [shape: string]: {
        element: string;
        getInitialAttrs: (node: GrammarElement, model: any) => Object;
        getHighlightAttrs: (node: GrammarElement, model: any, filter: (row) => boolean | null) => Object;
    }
}

const anchorShapes: ShapesAttrsDictionary = {

    'circle': {

        element: 'circle',

        getInitialAttrs: function (node, model) {
            const config = node.config;
            const guide = config.guide;
            const screenModel = node.screenModel;
            return {
                r: (guide.showAnchors === 'hover' ? 0 :
                    ((d) => screenModel.size(d) / 2)
                ),
                cx: (d) => model.x(d),
                cy: (d) => model.y(d),
            }
        },

        getHighlightAttrs: function (node, model, filter) {
            const config = node.config;
            const guide = config.guide;
            const screenModel = node.screenModel;
            const showOnHover = node.config.guide.showAnchors === 'hover';
            const rmin = 4; // Min highlight radius
            const rx = 1.25; // Highlight multiplier
            return {
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
                )
            };
        }
    },

    'vertical-stick': {

        element: 'path',

        getInitialAttrs: function (node, model) {
            const config = node.config;
            const guide = config.guide;
            const screenModel = node.screenModel;
            return {
                'shape-rendering': 'crispEdges',
                d: (d) => {
                    const x = model.x(d);
                    const y = model.y(d);
                    const x0 = model.x0(d);
                    const y0 = model.y0(d);
                    const r = (guide.showAnchors === 'hover' ? 0 : (screenModel.size(d) / 2));
                    const path = getBrushLine([
                        {x, y, size: r},
                        {x: x0, y: y0, size: r}
                    ])
                    return path;
                }
            }
        },

        getHighlightAttrs: function (node, model, filter) {
            const config = node.config;
            const guide = config.guide;
            const screenModel = node.screenModel;
            const showOnHover = node.config.guide.showAnchors === 'hover';
            const rmin = 4; // Min highlight radius
            const rx = 1.25; // Highlight multiplier
            return {
                d: (d) => {
                    const x = model.x(d);
                    const y = model.y(d);
                    const x0 = model.x0(d);
                    const y0 = model.y0(d);
                    const r = (showOnHover ?
                        (filter(d) ? Math.max(rmin, (screenModel.size(d) / 2)) : 0) :
                        filter(d) ?
                            // Note: Highlight stick with larger width.
                            Math.max(rmin, Math.ceil(screenModel.size(d) / 2 * rx)) :
                            (screenModel.size(d) / 2)
                    );
                    const path = getBrushLine([
                        {x, y, size: r},
                        {x: x0, y: y0, size: r}
                    ])
                    return path;
                }
            };
        }
    }
}
