import Taucharts from 'taucharts';
import * as d3 from 'd3-selection';
import {Plot} from '../src/charts/tau.plot';
import {DimMap} from '../src/plugins-sdk';
import {GrammarElement} from '../src/definitions';

const utils = Taucharts.api.utils;
const pluginsSDK = Taucharts.api.pluginsSDK;
const TARGET_SVG_CLASS = 'graphical-report__tooltip-target';

const defaultTemplateFactory: TooltipTemplateFactory = (tooltip, settings) => {

    const templateRoot = ({excludeTemplate, itemsTemplate}) => [
        '<div class="i-role-content graphical-report__tooltip__content">',
        itemsTemplate(),
        '</div>',
        excludeTemplate()
    ].join('\n');

    const itemTemplate = ({label, value}) => [
        '<div class="graphical-report__tooltip__list__item">',
        `  <div class="graphical-report__tooltip__list__elem">${label}</div>`,
        `  <div class="graphical-report__tooltip__list__elem">${value}</div>`,
        '</div>'
    ].join('\n');

    const excludeTemplate = () => [
        '<div class="i-role-exclude graphical-report__tooltip__exclude">',
        '   <div class="graphical-report__tooltip__exclude__wrap">',
        '       <span class="tau-icon-close-gray"></span> Exclude',
        '   </div>',
        '</div>'
    ].join('\n');

    return {

        getHtml(data, fields) {
            const itemsTemplate = (() => fields
                .filter((field) => {
                    const tokens = field.split('.');
                    const matchX = ((tokens.length === 2) && tooltip.skipInfo[tokens[0]]);
                    return !matchX;
                })
                .map((field) => {
                    const v = data[field];
                    const label = tooltip.getFieldLabel(field);
                    const value = tooltip.getFieldFormat(field)(v);
                    return itemTemplate({label, value});
                })
                .join('\n'));

            return templateRoot({itemsTemplate, excludeTemplate});
        },

        afterRender(tooltipNode) {
        },

        init(tooltipNode) {
            tooltipNode.addEventListener('click', (e) => {

                var target = e.target as HTMLElement;

                while (target !== e.currentTarget && target !== null) {
                    if (target.classList.contains('i-role-exclude')) {
                        tooltip.excludeHighlightedElement();
                        tooltip.setState({
                            highlight: null,
                            isStuck: false
                        });
                    }

                    target = target.parentNode as HTMLElement;
                }

            }, false);
        }
    };
};

function Tooltip(xSettings: TooltipSettings) {

    const settings = utils.defaults(
        xSettings || {},
        {
            getTemplate: defaultTemplateFactory,
            align: 'bottom-right',
            escapeHtml: true,
            fields: null as string[],
            formatters: {} as Formatter | FormatterObject,
            spacing: 24
        });

    return <TooltipObject>{

        init(chart: Plot) {

            this._chart = chart;
            this.metaInfo = {};
            this.skipInfo = {};

            this._tooltip = this._chart.addBalloon(
                {
                    spacing: settings.spacing,
                    auto: true,
                    effectClass: 'fade'
                });

            this._initDomEvents();

            // Handle initial state
            this.setState(this.state);

            const template = settings.getTemplate(this, settings);
            const tooltipNode = this._getTooltipNode();
            if (template.init) {
                template.init(tooltipNode);
            }
            this._template = template;
        },

        _initDomEvents() {
            this._scrollHandler = () => {
                this.setState({
                    highlight: null,
                    isStuck: false
                });
            };
            window.addEventListener('scroll', this._scrollHandler, true);

            this._outerClickHandler = (e) => {
                var tooltipRect = this._getTooltipNode().getBoundingClientRect();
                if ((e.clientX < tooltipRect.left) ||
                    (e.clientX > tooltipRect.right) ||
                    (e.clientY < tooltipRect.top) ||
                    (e.clientY > tooltipRect.bottom)
                ) {
                    this.setState({
                        highlight: null,
                        isStuck: false
                    });
                }
            };
        },

        _getTooltipNode() {
            return this._tooltip.getElement();
        },

        state: {
            highlight: null,
            isStuck: false
        },

        setState(newState) {
            const prev = this.state;
            const state = this.state = Object.assign({}, prev, newState);
            prev.highlight = prev.highlight || {data: null, cursor: null, unit: null};
            state.highlight = state.highlight || {data: null, cursor: null, unit: null};

            // If stuck, treat that data has not changed
            if (state.isStuck && prev.highlight.data) {
                state.highlight = prev.highlight;
            }

            // Show/hide tooltip
            if (state.highlight.data !== prev.highlight.data) {
                if (state.highlight.data) {
                    this._hideTooltip();
                    this._showTooltip(
                        state.highlight.data,
                        state.highlight.cursor
                    );
                    this._setTargetSvgClass(true);
                    requestAnimationFrame(() => {
                        this._setTargetSvgClass(true);
                    });
                } else if (!state.isStuck && prev.highlight.data && !state.highlight.data) {
                    this._removeFocus();
                    this._hideTooltip();
                    this._setTargetSvgClass(false);
                }
            }

            // Update tooltip position
            if (state.highlight.data && (
                !prev.highlight.cursor ||
                state.highlight.cursor.x !== prev.highlight.cursor.x ||
                state.highlight.cursor.y !== prev.highlight.cursor.y
            )) {
                this._tooltip.position(state.highlight.cursor.x, state.highlight.cursor.y);
            }

            // Stick/unstick tooltip
            const tooltipNode = this._getTooltipNode();
            if (state.isStuck !== prev.isStuck) {
                if (state.isStuck) {
                    window.addEventListener('click', this._outerClickHandler, true);
                    tooltipNode.classList.add('stuck');
                    this._setTargetEventsEnabled(false);
                    this._accentFocus(state.highlight.data);
                    this._tooltip.updateSize();
                } else {
                    window.removeEventListener('click', this._outerClickHandler, true);
                    tooltipNode.classList.remove('stuck');
                    // NOTE: Prevent showing tooltip immediately
                    // after pointer events appear.
                    requestAnimationFrame(() => {
                        this._setTargetEventsEnabled(true);
                    });
                }
            }
        },

        _showTooltip(data, cursor) {

            const fields = (
                settings.fields
                ||
                ((typeof settings.getFields === 'function') && settings.getFields(this._chart))
                ||
                Object.keys(data)
            );

            const content = this._template.getHtml(data, fields);

            this._tooltip
                .content(content)
                .position(cursor.x, cursor.y)
                .place(settings.align)
                .show()
                .updateSize();

            if (this._template.afterRender) {
                this._template.afterRender(this._getTooltipNode());
            }
        },

        _hideTooltip() {
            window.removeEventListener('click', this._outerClickHandler, true);
            this._tooltip.hide();
        },

        destroy() {
            window.removeEventListener('scroll', this._scrollHandler, true);
            this._setTargetSvgClass(false);
            this.setState({
                highlight: null,
                isStuck: false
            });
            this._tooltip.destroy();
        },

        _subscribeToHover() {

            var elementsToMatch = [
                'ELEMENT.LINE',
                'ELEMENT.AREA',
                'ELEMENT.PATH',
                'ELEMENT.INTERVAL',
                'ELEMENT.INTERVAL.STACKED',
                'ELEMENT.POINT'
            ];

            this._chart
                .select((node) => {
                    return (elementsToMatch.indexOf(node.config.type) >= 0);
                })
                .forEach((node) => {

                    node.on('data-hover', (sender, e) => {
                        var bodyRect = document.body.getBoundingClientRect();
                        this.setState({
                            highlight: (e.data ? {
                                data: e.data,
                                cursor: {
                                    x: (e.event.clientX - bodyRect.left),
                                    y: (e.event.clientY - bodyRect.top)
                                },
                                unit: sender
                            } : null)
                        });
                    });

                    node.on('data-click', (sender, e) => {
                        const bodyRect = document.body.getBoundingClientRect();
                        this.setState(e.data ? {
                            highlight: {
                                data: e.data,
                                cursor: {
                                    x: (e.event.clientX - bodyRect.left),
                                    y: (e.event.clientY - bodyRect.top)
                                },
                                unit: sender
                            },
                            isStuck: true
                        } : {
                                highlight: null,
                                isStuck: null
                            });
                    });
                });
        },

        getFieldFormat(k) {
            const format = (this.metaInfo[k] ?
                this.metaInfo[k].format :
                (x) => String(x));
            return (settings.escapeHtml ?
                (x) => utils.escapeHtml(format(x)) :
                format
            );
        },

        getFieldLabel(k) {
            const label = (this.metaInfo[k] ? this.metaInfo[k].label : k);
            return (settings.escapeHtml ? utils.escapeHtml(label) : label);
        },

        _accentFocus(data) {
            const filter = ((d) => (d === data));
            this._chart
                .select(() => true)
                .forEach((unit) => {
                    unit.fire('highlight', filter);
                });
        },

        _removeFocus() {
            const filter = (() => null);
            this._chart
                .select(() => true)
                .forEach((unit) => {
                    unit.fire('highlight', filter);
                    unit.fire('highlight-data-points', filter);
                });
        },

        excludeHighlightedElement() {
            const highlightedRow = this.state.highlight.data;
            this._chart
                .addFilter({
                    tag: 'exclude',
                    predicate: (row) => {
                        return JSON.stringify(row) !== JSON.stringify(highlightedRow);
                    }
                });
            this._chart.refresh();
        },

        onRender() {

            const info = this._getFormatters();
            this.metaInfo = info.meta;
            this.skipInfo = info.skip;

            this._subscribeToHover();

            this.setState({
                highlight: null,
                isStuck: false
            });
        },

        _setTargetSvgClass(isSet) {
            d3.select(this._chart.getSVG()).classed(TARGET_SVG_CLASS, isSet);
        },

        _setTargetEventsEnabled(isSet) {
            if (isSet) {
                this._chart.enablePointerEvents();
            } else {
                this._chart.disablePointerEvents();
            }
        },

        _getFormatters() {

            const info = pluginsSDK.extractFieldsFormatInfo(this._chart.getSpec());
            const skip = {} as {[key: string]: boolean};
            Object.keys(info).forEach((k) => {

                if (info[k].isComplexField) {
                    skip[k] = true;
                }

                if (info[k].parentField) {
                    delete info[k];
                }
            });

            const toLabelValuePair = (x: Formatter | FormatterObject) => {

                interface Pair {
                    format: Formatter | FormatterObject;
                    label?: string;
                    nullAlias?: string;
                }

                var res = {} as Pair;

                if (typeof x === 'function' || typeof x === 'string') {
                    res = {format: x};
                } else if (utils.isObject(x)) {
                    res = utils.pick(x, 'label', 'format', 'nullAlias') as Pair;
                }

                return res;
            };

            Object.keys(settings.formatters).forEach((k) => {

                var fmt = toLabelValuePair(settings.formatters[k]);

                info[k] = Object.assign(
                    ({label: k, nullAlias: ('No ' + k)}),
                    (info[k] || {}),
                    (utils.pick(fmt, 'label', 'nullAlias'))) as any;

                if (fmt.hasOwnProperty('format')) {
                    info[k].format = (typeof fmt.format === 'function') ?
                        (fmt.format) :
                        (Taucharts.api.tickFormat.get(fmt.format as any, info[k].nullAlias));
                } else {
                    info[k].format = (info[k].hasOwnProperty('format')) ?
                        (info[k].format) :
                        (Taucharts.api.tickFormat.get(null, info[k].nullAlias));
                }
            });

            return {
                meta: info,
                skip
            };
        }
    };
}

Taucharts.api.plugins.add('tooltip', Tooltip);

interface TooltipSettings {
    fields?: string[];
    formatters?: {[field: string]: (Formatter | FormatterObject)};
    align?: string;
    escapeHtml?: boolean;
    spacing?: number;
    getFields?: (chart: Plot) => string[];
    getTemplate?: TooltipTemplateFactory;
}

type Formatter = (x: any) => string;

interface FormatterObject {
    label?: string;
    format: (x: any) => string;
    nullAlias?: string;
}

interface TooltipState {
    highlight?: {
        data: any;
        cursor: TooltipCursor;
        unit: GrammarElement;
    };
    isStuck?: boolean;
}

interface TooltipCursor {
    x: number;
    y: number;
}

interface TooltipTemplate {
    getHtml(data: any[], fields: string[]): string;
    afterRender?(node: HTMLElement);
    init?(tooltipNode: HTMLElement);
}
type TooltipTemplateFactory = (tooltip: TooltipObject, settings: TooltipSettings) => TooltipTemplate;

interface TooltipObject {
    init(this: TooltipObject, chart: Plot): void;
    state: TooltipState;
    setState(this: TooltipObject, newState: TooltipState): void;
    destroy(this: TooltipObject): void;
    getFieldFormat(this: TooltipObject, k: string): any;
    getFieldLabel(this: TooltipObject, k: string): string;
    excludeHighlightedElement(this: TooltipObject): void;
    onRender(this: TooltipObject): void;
    metaInfo?: DimMap;
    skipInfo?: {[key: string]: boolean};
    _initDomEvents(this: TooltipObject);
    _getTooltipNode(this: TooltipObject): HTMLElement;
    _showTooltip(this: TooltipObject, data: any, cursor: TooltipCursor);
    _hideTooltip(this: TooltipObject): void;
    _subscribeToHover(this: TooltipObject): void;
    _accentFocus(this: TooltipObject, data): void;
    _removeFocus(this: TooltipObject): void;
    _setTargetSvgClass(this: TooltipObject, isSet: boolean): void;
    _setTargetEventsEnabled(this: TooltipObject, isSet: boolean): void;
    _getFormatters(this: TooltipObject): {
        meta: DimMap;
        skip: {[key: string]: boolean};
    };
    _chart?: Plot;
    _tooltip?: any;
    _template?: TooltipTemplate;
    _scrollHandler?: (this: TooltipObject) => void;
    _outerClickHandler?: (this: TooltipObject, e) => void;
}

export default Tooltip;
