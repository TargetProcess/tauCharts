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
const {
    utils,
    pluginsSDK,
    d3_animationInterceptor: createUpdateFunc
} = Taucharts.api;

const ELEMENT_HIGHLIGHT = 'ELEMENT.INTERVAL_HIGHLIGHT';

interface TimeDiffHighlightObject extends GrammarElement {
    addInteraction(this: TimeDiffHighlightObject);
    draw(this: TimeDiffHighlightObject);
    _drawRange(this: TimeDiffHighlightObject, range: number[]);
    _container?: d3.Selection<Element, any, Element, any>;
}

const TimeDiffHighlight = <TimeDiffHighlightObject>{

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
        // const container = config.options.container; // undefined
        const container = this._container;

        const ROOT_CLS = 'interval-highlight';
        const GRADIENT_ID = `${ROOT_CLS}__gradient`;

        const x0 = (range ? range[0] : null);
        const x1 = (range ? range[1] : null);
        const y0 = 0;
        const y1 = node.config.options.height;

        function drawDefs() {

            const DEFS_CLS = `${ROOT_CLS}__defs`;
            const START_CLS = `${ROOT_CLS}__gradient-start`;
            const END_CLS = `${ROOT_CLS}__gradient-end`;

            var svg = container.node();
            while ((svg = svg.parentElement).tagName !== 'svg') {}

            const defs = d3Selection.select(svg)
                .selectAll(`.${DEFS_CLS}`)
                .data(range ? [1] : []);

            defs.exit().remove();

            const defsEnter = defs.enter()
                .append('defs')
                .attr('class', DEFS_CLS)
                .append('linearGradient')
                .attr('id', GRADIENT_ID);

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

            const rect = g.select(`.${RANGE_CLS}`)
            const rectEnter = gEnter
                .append('rect')
                .attr('class', RANGE_CLS)
                .attr('fill', `url(#${GRADIENT_ID})`);

            rectEnter.merge(rect)
                .attr('x', x0)
                .attr('y', y0)
                .attr('width', x1 - x0)
                .attr('height', y1 - y0);
        }

        function drawStart({g, gEnter}: HighlightDataBinding) {

            const START_CLS = `${ROOT_CLS}__range-start`;

            const line = g.select(`.${START_CLS}`);
            const lineEnter = gEnter
                .append('line')
                .attr('class', START_CLS);

            lineEnter.merge(line)
                .attr('x1', x0)
                .attr('y1', y0)
                .attr('x2', x0)
                .attr('y2', y1);
        }

        function drawEnd({g, gEnter}: HighlightDataBinding) {

            const END_CLS = `${ROOT_CLS}__range-end`;

            const line = g.select(`.${END_CLS}`);
            const lineEnter = gEnter
                .append('line')
                .attr('class', END_CLS);

            lineEnter.merge(line)
                .attr('x1', x1)
                .attr('y1', y0)
                .attr('x2', x1)
                .attr('y2', y1);
        }

        utils.take(drawGroups())
            .next((binding) => {
                drawDefs();
                drawRange(binding);
                drawStart(binding);
                drawEnd(binding);
            });
    }
};

Taucharts.api.unitsRegistry.reg(
    ELEMENT_HIGHLIGHT,
    TimeDiffHighlight,
    'ELEMENT.GENERIC.CARTESIAN');

function TimeDiffTooltip(xSettings) {

    const settings = utils.defaults(xSettings || {}, {
        fields: null as string[]
    });

    const Tooltip = Taucharts.api.plugins.get('tooltip');

    const getTemplate = (tooltip) => {

        const TOOLTIP_CLS = 'graphical-report__tooltip';
        const HL_TOOLTIP_CLS = 'interval-highlight-tooltip';

        const root = ({content, buttons}) => [
            `<div class="i-role-content ${TOOLTIP_CLS}__content">`,
            content(),
            '</div>',
            buttons()
        ].join('\n');

        const item = ({label, value, isXDim}) => [
            `<div class="${TOOLTIP_CLS}__list__item${isXDim ? ` ${HL_TOOLTIP_CLS}__header` : ''}">`,
            `  <div class="${TOOLTIP_CLS}__list__elem">${label}</div>`,
            `  <div class="${TOOLTIP_CLS}__list__elem">${value}</div>`,
            '</div>'
        ].join('\n');

        const buttons = () => [
            `<div class="i-role-exclude ${TOOLTIP_CLS}__exclude">`,
            `  <div class="${TOOLTIP_CLS}__exclude__wrap">`,
            '    <span class="tau-icon-close-gray"></span> Exclude',
            '  </div>',
            '</div>'
        ].join('\n');

        const table = ({rows}) => [
            `<div class="${HL_TOOLTIP_CLS}__table" cellpadding="0" cellspacing="0" border="0">`,
            rows(),
            '</div>'
        ].join('\n');

        const ROW_CLS = `${HL_TOOLTIP_CLS}__item`;
        const HEADER_CLS = `${HL_TOOLTIP_CLS}__header`;

        const tableHeader = ({groupLabel, valueLabel}) => [
            `<div class="${HEADER_CLS}">`,
            `  <span class="${HEADER_CLS}__text">${groupLabel}</span>`,
            `  <span class="${HEADER_CLS}__value">${valueLabel}</span>`,
            `  <span class="${HEADER_CLS}__arrow">&#x25BC;&#x25B2;</span>`,
            '</div>'
        ].join('\n');

        const tableRow = ({name, width, color, diff, value, sign, isCurrent}) => [
            `<div class="${ROW_CLS}${isCurrent ? ` ${ROW_CLS}_highlighted` : ''}">`,
            '  <span',
            `      class="${ROW_CLS}__bg"`,
            `      style="width: ${width * 100}%; background-color: ${color};"`,
            `      ></span>`,
            `  <span class="${ROW_CLS}__text">${name}</span>`,
            `  <span class="${ROW_CLS}__value">${value}</span>`,
            `  ${arrow({diff, sign})}`,
            '</div>'
        ].join('\n');

        const arrow = ({diff, sign}) => {
            const arrowCls = `${ROW_CLS}__arrow`;
            const arrowSignCls = `${arrowCls}_${sign > 0 ? 'positive' : 'negative'}`;
            const arrowSymbol = (sign > 0 ? '&#x25B2;' : sign < 0 ? '&#x25BC;' : '');
            const diffVal = (sign === 0 ? '' : diff);

            return [
                `<span class="${arrowCls} ${arrowSignCls}">`,
                `${arrowSymbol}${diffVal}`,
                '</span>'
            ].join('');
        };

        // Todo: reuse Tooltip functionality
        const onExcludeClick = () => {
            tooltip.excludeHighlightedElement();
            tooltip.setState({
                highlight: null,
                isStuck: false
            });
        };

        return {

            render(data, xFields) {

                const unit = tooltip.state.highlight.unit as GrammarElement;
                const {scaleColor, scaleX, scaleY} = unit.screenModel.model;

                const fields = xFields
                    .filter((field) => {
                        return (
                            (field !== scaleColor.dim) &&
                            (field !== scaleX.dim) &&
                            (field !== scaleY.dim)
                        );
                    })
                    .concat(scaleX.dim);

                const fieldsRows = fields
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

                const groupedData = unitsGroupedData.get(unit);
                const [prevX, x] = getHighlightRange(data, unit);
                const colorsIndices = scaleColor.domain().slice().reverse().reduce((map, c, i) => {
                    map[c] = i;
                    return map;
                }, {} as {[c: string]: number});
                const neighbors = Object.keys(groupedData[x])
                    .reduce((arr, g) => arr.concat(groupedData[x][g]), [])
                    .sort((a, b) => colorsIndices[a[scaleColor.dim]] - colorsIndices[b[scaleColor.dim]]);
                const maxV = Math.max(...neighbors.map((d) => d[scaleY.dim]));
                if (x < prevX) {
                    throw new Error('Bug')
                }

                const tableRows = (() => [tableHeader({
                    groupLabel: tooltip.getFieldLabel(scaleColor.dim),
                    valueLabel: tooltip.getFieldLabel(scaleY.dim)
                })].concat(neighbors.map((d) => {
                    const v = d[scaleY.dim];
                    const format = tooltip.getFieldFormat(scaleY.dim);
                    const value = format(v);
                    const name = tooltip.getFieldLabel(d[scaleColor.dim]);
                    const width = (v / maxV);
                    const g = unit.screenModel.model.group(d);
                    const prevV = Number.isFinite(prevX) && groupedData[prevX][g] ? groupedData[prevX][g][0][scaleY.dim] : null;
                    const dv = Number.isFinite(prevV) ? (v - prevV) : 0;
                    const diff = format(Math.abs(dv));
                    const sign = Math.sign(dv);
                    const color = scaleColor(d[scaleColor.dim]);
                    const isCurrent = (d === data);

                    return tableRow({name, width, color, diff, value, sign, isCurrent});
                })).join('\n'));

                const diffTable = table({rows: tableRows});

                return root({content: () => [fieldsRows, diffTable].join('\n'), buttons});
            },

            didMount(tooltipNode) {
                tooltipNode
                    .querySelector('.i-role-exclude')
                    .addEventListener('click', onExcludeClick);
            }
        };
    };

    const extend = (instance, extension) => {
        Object.keys(extension).forEach((prop) => {
            const instanceProp = instance[prop];
            instance[prop] = function () {
                if (instanceProp) {
                    instanceProp.apply(this, arguments);
                }
                extension[prop].apply(this, arguments);
            };
        });
        return instance;
    };

    interface GroupedData {[x: string]: {[g: string]: any[]}};

    function getGroupedData(data: any[], screenModel: ScreenModel) {
        const groupByX = utils.groupBy(data, (d) => screenModel.model.xi(d).toString());
        const groupByXAndGroup = Object.keys(groupByX).reduce((map, x) => {
            map[x] = utils.groupBy(groupByX[x], (d) => screenModel.model.group(d));
            return map;
        }, {} as GroupedData);
        return groupByXAndGroup;
    }

    const unitsGroupedData = new Map<GrammarElement, GroupedData>();

    const getHighlightRange = (data, unit: GrammarElement) => {
        const x = unit.screenModel.model.xi(data);
        const groupedData = unitsGroupedData.get(unit);
        const allX = Object.keys(groupedData).map(Number).sort((a, b) => a - b);
        const xIndex = allX.indexOf(x);
        if (xIndex === 0) {
            return [x, x];
        }
        const prevX = allX[xIndex - 1];
        return [prevX, x];
    };

    const tooltipExt: PluginObject = {

        onRender(chart) {
            const highlights = chart.select((u) => u.config.type === ELEMENT_HIGHLIGHT);
            const units = chart.select((u) => u.config.type.indexOf('ELEMENT.') === 0);
            units.forEach((u) => {
                unitsGroupedData.set(u, getGroupedData(u.data(), u.screenModel));
                u.on('data-hover', (sender, e) => {
                    highlights.forEach((h) => {
                        // Todo: Speed-up by direct linking.
                        const hasData = e.data ? h.data().some((d) => d === e.data) : false;
                        h.fire('interval-highlight', hasData ? getHighlightRange(e.data, u) : null);
                    });
                });
            });

        },

        onSpecReady(chart, specRef) {
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

    };

    return extend(
        Tooltip({...settings, getTemplate}),
        tooltipExt);
}

Taucharts.api.plugins.add('time-diff-tooltip', TimeDiffTooltip);

export default TimeDiffTooltip;
