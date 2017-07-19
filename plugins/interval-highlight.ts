import Taucharts from 'taucharts';
import {timeFormat as d3TimeFormat} from 'd3-time-format';
import * as d3Selection from 'd3-selection';
import {
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

// const defaultRangeFormatter = function formatRange(dateRange) {

//     const d0 = d3TimeFormat('%d')(dateRange[0]);
//     const d1 = d3TimeFormat('%d')(dateRange[1]);

//     const m0 = d3TimeFormat('%b')(dateRange[0]);
//     const m1 = d3TimeFormat('%b')(dateRange[1]);

//     const y0 = d3TimeFormat('%Y')(dateRange[0]);
//     const y1 = d3TimeFormat('%Y')(dateRange[1]);

//     const date0 = `${d0}${m0 === m1 ? '' : ` ${m0}`}${y0 === y1 ? '' : ` ${y0}`}`;
//     const date1 = `${d1} ${m1} ${y1}`;

//     return `${date0}&ndash;${date1}`;
// };

// function findRangeValue(xIndex, x) {
//     const nextItem = xIndex.find((r) => r.pos >= x) || xIndex[xIndex.length - 1];
//     const prevIndex = nextItem.ind > 0 ? (nextItem.ind - 1) : nextItem.ind;
//     const prevItem = xIndex[prevIndex];
//     return [prevItem.val, nextItem.val];
// }

// function filterValuesStack(data, screenModel, x) {
//     return data.filter((row) => String(row[screenModel.model.scaleX.dim]) === String(x));
// }

// function areRangesEqual(r1, r2) {
//     return (
//         Number(r1[0]) === Number(r2[0]) &&
//         Number(r1[1]) === Number(r2[1])
//     );
// }

// function drawRect(container, className, props) {

//     const animationSpeed = props.hasOwnProperty('animationSpeed') ? props.animationSpeed : 0;

//     const rect = container
//         .selectAll(`.${className}`)
//         .data([1]);
//     rect.exit()
//         .remove();
//     rect.call(createUpdateFunc(animationSpeed, null, props));
//     const enter = rect.enter()
//         .append('rect')
//         .attr('class', className)
//         .call(createUpdateFunc(animationSpeed, {width: 0}, props));

//     return rect.merge(enter);
// }

const ELEMENT_HIGHLIGHT = 'ELEMENT.INTERVAL_HIGHLIGHT';

// const IntervalHighlight = {

//     addInteraction() {
//         const node = this.node();
//         this.cover = null;
//         this.activeRange = [];
//         node.on('range-blur', () => {
//             this.activeRange = [];
//             drawRect(this.cover, 'interval-highlight__cursor', {width: 0});
//         });
//     },

//     prepareData(data, screenModel) {
//         var groups = utils.groupBy(this.node().data(), screenModel.group);
//         return Object
//             .keys(groups)
//             .sort(function (a, b) {
//                 return screenModel.order(a) - screenModel.order(b);
//             })
//             .reduce(function (memo, k, i) {
//                 return memo.concat([groups[k]]);
//             }, [])
//             .reduce(function (memo, fiber) {
//                 fiber.forEach(function (row) {
//                     screenModel.y(row);
//                     screenModel.y0(row);
//                 });
//                 return memo.concat(fiber);
//             }, []);
//     },

//     createXIndex: function (data: any[], screenModel) {
//         return utils.unique(data.map(function (x) {
//             return x[screenModel.model.scaleX.dim] as number;
//         }), String)
//             .sort(function (x1, x2) {
//                 return x1 - x2;
//             })
//             .map(function (date, i) {
//                 return {
//                     ind: i,
//                     val: date,
//                     pos: screenModel.model.scaleX.value(date)
//                 };
//             });
//     },

//     draw() {

//         const node = this.node();
//         const screenModel = node.screenModel;
//         const cfg = node.config;
//         const container = cfg.options.slot(cfg.uid);

//         const data = this.prepareData(node.data(), screenModel);
//         const xIndex = this.createXIndex(data, screenModel);

//         const drawCover = (selection) => {

//             const element = this;

//             drawRect(selection, 'interval-highlight__cursor', {
//                 class: 'interval-highlight__cursor',
//                 x: 0,
//                 y: 0,
//                 width: 0,
//                 height: cfg.options.height,
//                 animationSpeed: 0
//             });

//             const rect = drawRect(selection, 'interval-highlight__cover-rect', {
//                 class: 'interval-highlight__cover-rect',
//                 x: 0,
//                 y: 0,
//                 width: cfg.options.width,
//                 height: cfg.options.height,
//                 animationSpeed: 0
//             });

//             // Todo: Use chart pointer events.

//             const getPointer = () => {
//                 const domEvent = d3Selection.event;
//                 const mouseCoords = d3Selection.mouse(domEvent.target);
//                 const e = {
//                     x: mouseCoords[0],
//                     y: mouseCoords[1],
//                     pageX: domEvent.pageX,
//                     pageY: domEvent.pageY
//                 };
//                 return e;
//             };

//             const getRange = (pointer) => {
//                 const range = findRangeValue(xIndex, pointer.x);
//                 return range;
//             };

//             const getStacks = (range, pointer) => {
//                 const [prevValue, nextValue] = range;
//                 const nextValues = filterValuesStack(data, screenModel, nextValue);
//                 const prevValues = filterValuesStack(data, screenModel, prevValue);

//                 const propY = screenModel.model.scaleY.dim;
//                 const propCategory = screenModel.model.scaleColor.dim;

//                 const prevStack = prevValues.reduce(
//                     (memo, item) => {
//                         memo[item[propCategory]] = item[propY];
//                         return memo;
//                     },
//                     {date: prevValue});

//                 const nextStack = nextValues.reduce(
//                     (memo, item) => {
//                         memo[item[propCategory]] = item[propY];
//                         return memo;
//                     },
//                     {date: nextValue});

//                 return {
//                     data: nextStack,
//                     prev: prevStack,
//                     event: pointer
//                 };
//             };

//             var animationFrameId = null;
//             const wrapIntoAnimationFrame = function (handler) {
//                 return function () {
//                     const pointer = getPointer();
//                     if (!animationFrameId) {
//                         animationFrameId = requestAnimationFrame(() => {
//                             handler.call(this, pointer);
//                             animationFrameId = null;
//                         })
//                     }
//                 };
//             };

//             rect.on('mouseleave', () => {
//                 node.fire('range-blur');
//                 cancelAnimationFrame(animationFrameId);
//                 animationFrameId = null;
//             });

//             rect.on('mousemove', wrapIntoAnimationFrame(function (e) {

//                 const range = getRange(e);

//                 if (areRangesEqual(element.activeRange, range)) {

//                     node.fire('range-active', {
//                         data: range,
//                         event: e
//                     });

//                     return;
//                 }

//                 element.activeRange = range;

//                 const prevX = screenModel.model.scaleX(range[0]);
//                 const nextX = screenModel.model.scaleX(range[1]);

//                 drawRect(selection, 'interval-highlight__cursor', {
//                     x: prevX,
//                     width: nextX - prevX,
//                     animationSpeed: 0
//                 });

//                 node.fire('range-changed', getStacks(range, e));
//             }));

//             rect.on('click', function () {

//                 const e = getPointer();
//                 const range = getRange(e);

//                 node.fire('range-focus', getStacks(range, e));
//             });
//         };

//         const cover = container
//             .selectAll('.interval-highlight__cover')
//             .data([1]);
//         cover
//             .exit()
//             .remove();
//         cover
//             .call(drawCover);
//         const enter = cover
//             .enter()
//             .append('g')
//             .attr('class', 'interval-highlight__cover')
//             .call(drawCover);

//         this.cover = cover.merge(enter);
//     }
// };

// Taucharts.api.unitsRegistry.reg(
//     ELEMENT_HIGHLIGHT,
//     IntervalHighlight,
//     'ELEMENT.GENERIC.CARTESIAN');

// const html = utils.xml;

// const tooltipTemplate = ({dateRange, diffDays, items}) => (
//     html('div', {class: 'interval-highlight-tooltip'},
//         html('div', {class: 'interval-highlight-tooltip__header'},
//             html('span', {class: 'interval-highlight-tooltip__header__date-range'},
//                 dateRange
//             ),
//             html('span',
//                 diffDays
//             )
//         ),
//         html('table',
//             {
//                 cellpadding: 0,
//                 cellspacing: 0,
//                 border: 0
//             },
//             ...items.map(tooltipItemTemplate)
//         )
//     )
// );
// const tooltipItemTemplate = ({name, width, color, diff, value}) => (
//     html('tr', {class: 'interval-highlight-tooltip__item'},
//         html('td', name),
//         html('td',
//             html('div',
//                 {
//                     class: 'interval-highlight-tooltip__item__value',
//                     style: `width: ${width}px; background-color: ${color};`
//                 },
//                 String(parseFloat((value).toFixed(2)))
//             )
//         ),
//         html('td',
//             {
//                 class: [
//                     'interval-highlight-tooltip__item__arrow',
//                     `interval-highlight-tooltip__item__arrow_${diff > 0 ? 'positive' : 'negative'}`
//                 ].join(' '),
//             },
//             html('div', {class: 'interval-highlight-tooltip__item__arrow__val'},
//                 html('span', {class: 'interval-highlight-tooltip__item__arrow__dir'},
//                     (diff > 0 ? '&#x25B2;' : diff < 0 ? '&#x25BC;' : ''),
//                     (diff === 0 ? '' : String(parseFloat((Math.abs(diff)).toFixed(2))))
//                 )
//             )
//         )
//     )
// );

// const IntervalTooltip = (pluginSettings = {} as any) => {

//     const formatRange = pluginSettings.rangeFormatter || defaultRangeFormatter;

//     return {

//         init(chart) {
//             this._chart = chart;
//             this._tooltip = this._chart.addBalloon(
//                 {
//                     spacing: 24,
//                     place: 'bottom-right',
//                     auto: true,
//                     effectClass: 'fade'
//                 });
//         },

//         destroy() {
//             this._tooltip.destroy();
//         },

//         onSpecReady(chart, specRef) {
//             chart.traverseSpec(specRef, (unit, parentUnit) => {
//                 if (unit.type.indexOf('ELEMENT.') !== 0) {
//                     return;
//                 }

//                 const over = JSON.parse(JSON.stringify(unit));
//                 over.type = ELEMENT_HIGHLIGHT;
//                 over.namespace = 'highlight';
//                 over.guide = over.guide || {};

//                 unit.guide = utils.defaults(unit.guide || {}, {
//                     showAnchors: 'never'
//                 });

//                 parentUnit.units.push(over);
//             });
//         },

//         getContent(dateRange, states) {
//             const formattedDateRange = formatRange(dateRange);
//             const dateDiff = Math.round((dateRange[1] - dateRange[0]) / 1000 / 60 / 60 / 24);
//             const max = Math.max(...states.map(function (state) {
//                 return state['value'];
//             }));

//             states.forEach(state => {
//                 state.width = 80 * state.value / max;
//             });

//             var formatDays = 'day';
//             var diffStr = String(dateDiff);
//             if (diffStr[diffStr.length - 1] !== '1') {
//                 formatDays += 's';
//             }

//             return tooltipTemplate({
//                 dateRange: formattedDateRange,
//                 items: states,
//                 diffDays: `(${dateDiff} ${formatDays})`
//             });
//         },

//         onRender(chart) {
//             const info = pluginsSDK.extractFieldsFormatInfo(chart.getSpec());

//             this._tooltip.hide();

//             const node = chart.select((node) => node.config.type === ELEMENT_HIGHLIGHT)[0];
//             this.node = node;

//             const hideTooltip = () => {
//                 this._tooltip.hide();
//             };

//             const showTooltip = (unit, e) => {
//                 const scaleColor = unit.screenModel.model.scaleColor;
//                 const categories = scaleColor.domain();
//                 const states = categories
//                     .map((cat) => {
//                         const curr = e.data[cat] || 0;
//                         const prev = e.prev[cat] || 0;
//                         return {
//                             name: info[scaleColor.dim].format(cat || null, info[scaleColor.dim].nullAlias),
//                             color: scaleColor.value(cat),
//                             value: curr,
//                             diff: curr - prev
//                         };
//                     })
//                     .reverse();

//                 this._tooltip
//                     .content(this.getContent([e.prev.date, e.data.date], states))
//                     .show(e.event.pageX, e.event.pageY);
//             };

//             const updateTooltip = (e) => {
//                 this._tooltip
//                     .position(e.event.pageX, e.event.pageY);
//             };

//             const onClick = (sender, e) => {
//                 if (pluginSettings.onClick) {
//                     pluginSettings.onClick.call(null, sender, e);
//                 }
//             };

//             node.on('range-changed', (sender, e) => showTooltip(sender, e));
//             node.on('range-blur', () => hideTooltip());
//             node.on('range-focus', (sender, e) => onClick(sender, e));
//             node.on('range-active', (sender, e) => updateTooltip(e));
//         }
//     };
// };

// Taucharts.api.plugins.add('interval-highlight', IntervalTooltip);

// export default IntervalTooltip;

interface TimeDiffHighlightObject extends GrammarElement {
    addInteraction(this: TimeDiffHighlightObject);
    draw(this: TimeDiffHighlightObject);
    // _fibers?: any[][];
    _drawRange(this: TimeDiffHighlightObject, range: number[]);
    _container?: d3.Selection<Element, any, Element, any>;
}

const TimeDiffHighlight = <TimeDiffHighlightObject>{

    draw() {
        const node = this.node();
        const config = node.config;
        this._container = config.options.slot(config.uid);
        // this._fibers = this.node().screenModel.toFibers();
    },

    addInteraction() {
        const node = this.node();

        // node.on('data-hover', (sender, range) => {

        //     const fibers = this._fibers;
        //     var range: number[];
        //     if (fibers.some((d) => d === e.data)) {
        //         range = range
        //     }

        //     drawHighlightRect(range);
        // });

        node.on('interval-highlight', (sender, range) => {
            // var range: number[];
            // if (fibers.some((d) => d === e.data)) {
            //     range = range
            // }

            this._drawRange(range);
        });
    },

    _drawRange(range: number[]) {
        const node = this.node();
        const config = node.config;
        // const container = config.options.container; // undefined
        const container = this._container;
        const screenModel = node.screenModel;

        const HIGHLIGHT_CLS = 'interval-highlight__cursor';

        const rect = container
            .selectAll(`.${HIGHLIGHT_CLS}`)
            .data(range ? [1] : []);

        rect
            .exit()
            .remove();

        if (!range) {
            return;
        }

        // const x0 = screenModel.model.scaleX(range[0]);
        // const x1 = screenModel.model.scaleX(range[1]);
        const [x0, x1] = range;
        const y0 = 0;
        const y1 = node.config.options.height;

        rect
            .enter()
            .append('rect')
            .attr('class', HIGHLIGHT_CLS)
            .merge(rect)
            .attr('x', x0)
            .attr('y', y0)
            .attr('width', x1 - x0)
            .attr('height', y1 - y0)
            .attr('pointer-events', 'none');
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

    // const elementHighlights = {} as {[elUid: string]: string};

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
                over.guide = over.guide || {};

                // unit.guide = utils.defaults(unit.guide || {}, {
                //     // showAnchors: 'never'
                // });

                // const index = parentUnit.units.indexOf(unit);

                // parentUnit.units.splice(index, 0, over);
                parentUnit.units.push(over);
            });
        },

    };

    return extend(
        Tooltip({...settings, getTemplate}),
        tooltipExt);
}

Taucharts.api.plugins.add('time-diff-tooltip', TimeDiffTooltip);

export default TimeDiffTooltip;
