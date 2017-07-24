import Taucharts from 'taucharts';
import {timeFormat as d3TimeFormat} from 'd3-time-format';
import * as d3Selection from 'd3-selection';
import {
    d3Selection as Selection,
    GrammarElement,
    Plot,
    PluginObject,
    ScreenModel,
} from '../src/definitions';

const utils = Taucharts.api.utils;

const ELEMENT_HIGHLIGHT = 'ELEMENT.INTERVAL_HIGHLIGHT';

interface HighlightElement extends GrammarElement {
    addInteraction(this: HighlightElement);
    draw(this: HighlightElement);
    _drawRange(this: HighlightElement, range: number[]);
    _container?: d3.Selection<Element, any, Element, any>;
}

const IntervalHighlight = <HighlightElement>{

    draw() {
        const node = this.node();
        const config = node.config;
        this._container = config.options.slot(config.uid);
    },

    addInteraction() {
        const node = this.node();

        node.on('interval-highlight', (sender, range) => {
            this._drawRange(range);
        });
    },

    _drawRange(range: number[]) {
        const node = this.node();
        const config = node.config;
        const flip = node.screenModel.flip;
        // Todo: Fix undefined container
        // const container = config.options.container; // undefined
        const container = this._container;

        const ROOT_CLS = 'interval-highlight';
        const GRADIENT_ID = `${ROOT_CLS}__gradient`;

        const start = (range ? range[0] : null);
        const end = (range ? range[1] : null);
        const size = (flip ? config.options.width : config.options.height);

        function defineGradient() {

            const DEFS_CLS = `${ROOT_CLS}__defs`;
            const START_CLS = `${ROOT_CLS}__gradient-start`;
            const END_CLS = `${ROOT_CLS}__gradient-end`;

            var svg = container.node();
            while ((svg = svg.parentElement).tagName !== 'svg') {}

            const id = `${DEFS_CLS}__${config.uid}`;

            const defs = d3Selection.select(svg)
                .selectAll(`#${id}`)
                .data(range ? [1] : []);

            defs.exit().remove();

            const defsEnter = defs.enter()
                .append('defs')
                .attr('class', DEFS_CLS)
                .attr('id', id)
                .append('linearGradient')
                .attr('id', GRADIENT_ID)
                .attr('x1', '0%')
                .attr('y1', flip ? '100%' : '0%')
                .attr('x2', flip ? '0%' : '100%')
                .attr('y2', '0%');

            defsEnter
                .append('stop')
                .attr('class', START_CLS)
                .attr('offset', '0%');

            defsEnter
                .append('stop')
                .attr('class', END_CLS)
                .attr('offset', '100%');
        }

        interface HighlightDataBinding {
            g: Selection;
            gEnter: Selection;
        }

        function drawGroups(): HighlightDataBinding {

            const g = container
                .selectAll(`.${ROOT_CLS}`)
                .data(range ? [1] : []) as Selection;

            g.exit().remove();

            const gEnter = g
                .enter()
                .append('g')
                .attr('class', ROOT_CLS)
                .attr('pointer-events', 'none') as Selection;

            return {g, gEnter};
        }

        function drawRange({g, gEnter}: HighlightDataBinding) {

            const RANGE_CLS = `${ROOT_CLS}__range`;

            const rect = g.select(`.${RANGE_CLS}`);
            const rectEnter = gEnter
                .append('rect')
                .attr('class', RANGE_CLS)
                .attr('fill', `url(#${GRADIENT_ID})`);

            const {x, y, width, height} = (flip ?
                {
                    x: 0,
                    y: end,
                    width: size,
                    height: (start - end)
                } : {
                    x: start,
                    y: 0,
                    width: (end - start),
                    height: size
                });

            rectEnter.merge(rect)
                .attr('x', x)
                .attr('y', y)
                .attr('width', width)
                .attr('height', height);
        }

        function drawStart({g, gEnter}: HighlightDataBinding) {

            const START_CLS = `${ROOT_CLS}__range-start`;

            const line = g.select(`.${START_CLS}`);
            const lineEnter = gEnter
                .append('line')
                .attr('class', START_CLS);

            const {x1, y1, x2, y2} = (flip ?
                {
                    x1: 0,
                    y1: start,
                    x2: size,
                    y2: start
                } : {
                    x1: start,
                    y1: 0,
                    x2: start,
                    y2: size
                });

            lineEnter.merge(line)
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
        }

        function drawEnd({g, gEnter}: HighlightDataBinding) {

            const END_CLS = `${ROOT_CLS}__range-end`;

            const line = g.select(`.${END_CLS}`);
            const lineEnter = gEnter
                .append('line')
                .attr('class', END_CLS);

            const {x1, y1, x2, y2} = (flip ?
                {
                    x1: 0,
                    y1: end,
                    x2: size,
                    y2: end
                } : {
                    x1: end,
                    y1: 0,
                    x2: end,
                    y2: size
                });

            lineEnter.merge(line)
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
        }

        utils.take(drawGroups())
            .next((binding) => {
                defineGradient();
                drawRange(binding);
                drawStart(binding);
                drawEnd(binding);
            });
    }
};

Taucharts.api.unitsRegistry.reg(
    ELEMENT_HIGHLIGHT,
    IntervalHighlight,
    'ELEMENT.GENERIC.CARTESIAN');

const IntervalTooltipTemplateFactory = (tooltip, tooltipSettings, settings) => {

    const TOOLTIP_CLS = 'graphical-report__tooltip';
    const DIFF_TOOLTIP_CLS = 'diff-tooltip';

    const root = settings.rootTemplate;

    const item = (settings.itemTemplate || (({label, value, isXDim}) => [
        `<div class="${TOOLTIP_CLS}__list__item${isXDim ? ` ${DIFF_TOOLTIP_CLS}__header` : ''}">`,
        `  <div class="${TOOLTIP_CLS}__list__elem">${label}</div>`,
        `  <div class="${TOOLTIP_CLS}__list__elem">${value}</div>`,
        '</div>'
    ].join('\n')));

    const buttons = settings.buttonsTemplate;

    const table = (settings.tableTemplate || (({content}) => [
        `<div class="${DIFF_TOOLTIP_CLS}__table">`,
        content(),
        '</div>'
    ].join('\n')));

    const ROW_CLS = `${DIFF_TOOLTIP_CLS}__item`;
    const HEADER_CLS = `${DIFF_TOOLTIP_CLS}__header`;

    const tableHeader = (settings.tableHeaderTemplate || (({groupLabel, valueLabel}) => [
        `<div class="${HEADER_CLS}">`,
        `  <span class="${HEADER_CLS}__text">${groupLabel}</span>`,
        `  <span class="${HEADER_CLS}__value">${valueLabel}</span>`,
        `  <span class="${HEADER_CLS}__arrow">&#x25BC;&#x25B2;</span>`,
        '</div>'
    ].join('\n')));

    const tableBody = (settings.tableBodyTemplate || (({rows}) => [
        `<div class="${DIFF_TOOLTIP_CLS}__body">`,
        `<div class="${DIFF_TOOLTIP_CLS}__body__content">`,
        rows(),
        `</div>`,
        `</div>`
    ].join('\n')));

    const tableRow = (settings.tableRowTemplate || (({name, diff, value, sign, isCurrent, bar}) => [
        `<div class="${ROW_CLS}${isCurrent ? ` ${ROW_CLS}_highlighted` : ''}">`,
        `  ${bar()}`,
        `  <span class="${ROW_CLS}__text">${name}</span>`,
        `  <span class="${ROW_CLS}__value">${value}</span>`,
        `  ${arrow({diff, sign})}`,
        '</div>'
    ].join('\n')));

    const valueBar = (settings.valueBarTemplate || (({min, max, v, color, cls}) => {
        min = Math.min(min, 0);
        max = Math.max(0, max);
        const range = (max - min);
        const left = ((v < 0 ? v - min : -min) / range);
        const width = ((v < 0 ? -v : v) / range);
        return [
            '<span',
            `    class="${ROW_CLS}__bg${cls ? ` ${cls}` : ''}"`,
            `    style="left: ${left * 100}%; width: ${width * 100}%; background-color: ${color};"`,
            `    ></span>`,
        ].join('\n');
    }));

    const arrow = (settings.arrowTemplate || (({diff, sign}) => {
        const arrowCls = `${ROW_CLS}__arrow`;
        const arrowSignCls = `${arrowCls}_${sign > 0 ? 'positive' : 'negative'}`;
        const arrowSymbol = (sign > 0 ? '&#x25B2;' : sign < 0 ? '&#x25BC;' : '');
        const diffVal = (sign === 0 ? '' : diff);

        return [
            `<span class="${arrowCls} ${arrowSignCls}">`,
            `${arrowSymbol}${diffVal}`,
            '</span>'
        ].join('');
    }));

    return {

        render(data, xFields) {

            const unit = tooltip.state.highlight.unit as GrammarElement;
            const screenModel = unit.screenModel;
            const {scaleColor, scaleX, scaleY} = screenModel.model;

            const fields = xFields
                .filter((field) => {
                    return (
                        (field !== scaleColor.dim) &&
                        (field !== scaleX.dim) &&
                        (field !== scaleY.dim)
                    );
                })
                .concat(scaleX.dim) // Place X field at end
                .filter((field) => {
                    const tokens = field.split('.');
                    const matchX = ((tokens.length === 2) && tooltip.skipInfo[tokens[0]]);
                    return !matchX;
                })
                .map((field) => {
                    const v = data[field];
                    const label = tooltip.getFieldLabel(field);
                    const value = tooltip.getFieldFormat(field)(v);
                    const isXDim = (field === scaleX.dim);
                    return item({label, value, isXDim});
                })
                .join('\n');

            const groupedData = tooltip.unitsGroupedData.get(unit);
            const [prevX, x] = tooltip.getHighlightRange(data, unit);

            // Sort stacked elements by color, other by Y
            const sortByColor = (() => {
                const ci = scaleColor.domain().slice().reverse().reduce((map, c, i) => {
                    map[c] = i;
                    return map;
                }, {} as {[c: string]: number});
                return ((a, b) => ci[a[scaleColor.dim]] - ci[b[scaleColor.dim]]);
            })();
            const sortByY = (unit.config.flip ?
                ((a, b) => scaleY(b[scaleY.dim]) - scaleY(a[scaleY.dim])) :
                ((a, b) => scaleY(a[scaleY.dim]) - scaleY(b[scaleY.dim])));
            const neighbors = Object.keys(groupedData[x])
                .reduce((arr, g) => arr.concat(groupedData[x][g]), [])
                .sort(unit.config.stack ? sortByColor : sortByY);
            const vals = neighbors.map((d) => d[scaleY.dim]);
            const minV = Math.min(...vals);
            const maxV = Math.max(...vals);

            const header = tableHeader({
                groupLabel: tooltip.getFieldLabel(scaleColor.dim),
                valueLabel: tooltip.getFieldLabel(scaleY.dim)
            });

            const tableRows = neighbors.map((d) => {

                const name = tooltip.getFieldLabel(d[scaleColor.dim]);

                const v = d[scaleY.dim];
                const format = tooltip.getFieldFormat(scaleY.dim);
                const value = format(v);
                const width = (v / maxV);

                const g = screenModel.model.group(d);
                const prevV = (Number.isFinite(prevX) && groupedData[prevX][g] ?
                    groupedData[prevX][g][0][scaleY.dim] :
                    null);
                const dv = Number.isFinite(prevV) ? (v - prevV) : 0;
                const diff = format(Math.abs(dv));
                const sign = Math.sign(dv);

                const color = screenModel.color(d);
                const cls = screenModel.class(d);

                const isCurrent = (d === data);

                return tableRow({
                    name,
                    diff,
                    value,
                    sign,
                    isCurrent,
                    bar: () => valueBar({
                        min: minV,
                        max: maxV,
                        v,
                        color,
                        cls,
                    })
                });
            }).join('\n');

            const body = tableBody({rows: () => tableRows});

            const diffTable = table({
                content: () => [
                    header,
                    body
                ].join('\n')
            });

            return root({
                content: () => [
                    fields,
                    diffTable
                ].join('\n'),
                buttons
            });
        },

        didMount(tooltip) {
            const node = tooltip.getDomNode() as HTMLElement;
            const body = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body`) as HTMLElement;
            const content = node.querySelector(`.${DIFF_TOOLTIP_CLS}__body__content`) as HTMLElement;
            const highlighted = node.querySelector(`.${ROW_CLS}_highlighted`) as HTMLElement;

            const b = body.getBoundingClientRect();
            const c = content.getBoundingClientRect();
            const h = highlighted.getBoundingClientRect();

            if (c.bottom > b.bottom) {
                body.classList.add(`${DIFF_TOOLTIP_CLS}__body_overflow`);
            }

            if (h.bottom > b.bottom) {
                // Scroll to highlighted item
                const dy = ((h.bottom - b.bottom) + h.height);
                const limitDy = (c.bottom - b.bottom);
                content.style.transform = `translateY(${-Math.min(dy, limitDy)}px)`;
            }

            settings.didMount(tooltip);
        }
    };
};

function DiffTooltip(xSettings) {

    const Tooltip = ((xSettings && xSettings.Tooltip) || Taucharts.api.plugins.get('tooltip'));

    const settings = utils.defaults(
        xSettings || {},
        {
            getTemplate: IntervalTooltipTemplateFactory
        },
        Tooltip.defaults);
    settings.templateSettings = utils.defaults(
        settings.templateSettings || {},
        Tooltip.defaults.templateSettings);

    const extend = (instance, extension) => {
        Object.keys(extension).forEach((prop) => {
            const instanceProp = instance[prop];
            instance[prop] = function () {
                if (instanceProp) {
                    instanceProp.apply(this, arguments);
                }
                return extension[prop].apply(this, arguments);
            };
        });
        return instance;
    };

    function getGroupedData(data: any[], screenModel: ScreenModel) {
        const scaleX = screenModel.model.scaleX;
        const groupByX = utils.groupBy(data, (d) => scaleX(d[scaleX.dim]).toString());
        const groupByXAndGroup = Object.keys(groupByX).reduce((map, x) => {
            map[x] = utils.groupBy(groupByX[x], (d) => screenModel.model.group(d));
            return map;
        }, {} as GroupedData);
        return groupByXAndGroup;
    }

    const tooltipExt: IntervalTooltipObject = {

        init() {
            this.unitsGroupedData = new Map();
        },

        onRender(chart) {
            const units = chart.select((u) => {
                return (
                    (u.config.type.indexOf('ELEMENT.') === 0) &&
                    (u.config.type !== ELEMENT_HIGHLIGHT)
                );
            });
            const highlights = chart.select((u) => u.config.type === ELEMENT_HIGHLIGHT);

            // Link highlights with units
            const highlightsMap = highlights.reduce((map, h, i) => {
                map[i] = h;
                return map;
            }, {});

            units.forEach((u, i) => {
                const data = u.data();
                this.unitsGroupedData.set(u, getGroupedData(data, u.screenModel));
                u.on('data-hover', (sender, e) => {
                    const highlight = highlightsMap[i];
                    const isTarget = (e.unit && e.unit === u);
                    const range = (isTarget ? this.getHighlightRange(e.data, e.unit) : null);
                    highlight.fire('interval-highlight', range);
                });
            });

        },

        onSpecReady(chart, specRef) {
            var highlightsCount = 0;
            chart.traverseSpec(specRef, (unit, parentUnit) => {
                if (unit.type.indexOf('ELEMENT.') !== 0) {
                    return;
                }

                const over = JSON.parse(JSON.stringify(unit));
                over.type = ELEMENT_HIGHLIGHT;
                over.namespace = 'highlight';

                // Place highlight under element
                const index = parentUnit.units.indexOf(unit);
                parentUnit.units.splice(index, 0, over);
            });
        },

        getHighlightRange(data, unit: GrammarElement) {
            const flip = unit.screenModel.flip;
            const scaleX = unit.screenModel.model.scaleX;
            const x = scaleX(data[scaleX.dim]);
            const groupedData = this.unitsGroupedData.get(unit);
            const asc = ((a, b) => a - b);
            const desc = ((a, b) => b - a);
            const allX = Object.keys(groupedData).map(Number).sort(flip ? desc : asc);
            const xIndex = allX.indexOf(x);
            if (xIndex === 0) {
                return [x, x];
            }
            const prevX = allX[xIndex - 1];
            return [prevX, x];
        }

    };

    return extend(
        Tooltip({...settings}),
        tooltipExt);
}

Taucharts.api.plugins.add('diff-tooltip', DiffTooltip);

interface IntervalTooltipObject extends PluginObject {
    onRender(this: IntervalTooltipObject, chart: Plot);
    getHighlightRange(this: IntervalTooltipObject, data, unit: GrammarElement): number[];
    unitsGroupedData?: Map<GrammarElement, GroupedData>;
}

interface GroupedData {
    [x: string]: {
        [g: string]: any[];
    };
}

export default DiffTooltip;
