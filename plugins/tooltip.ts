import Taucharts from 'taucharts';
import * as d3 from 'd3-selection';
import {Plot} from '../src/charts/tau.plot';
import {DimMap} from '../src/plugins-sdk';
import {
    GrammarElement,
    PluginObject,
} from '../src/definitions';

const utils = Taucharts.api.utils;
const pluginsSDK = Taucharts.api.pluginsSDK;
const TOOLTIP_CLS = 'graphical-report__tooltip';

const defaultTemplateSettings = {

    rootTemplate: ({content, buttons}) => [
        `<div class="i-role-content ${TOOLTIP_CLS}__content">`,
        content(),
        '</div>',
        buttons()
    ].join('\n'),

    itemTemplate: ({label, value}) => [
        `<div class="${TOOLTIP_CLS}__list__item">`,
        `  <div class="${TOOLTIP_CLS}__list__elem">${label}</div>`,
        `  <div class="${TOOLTIP_CLS}__list__elem">${value}</div>`,
        '</div>'
    ].join('\n'),

    buttonsTemplate: () => [
        `<div class="i-role-exclude ${TOOLTIP_CLS}__exclude">`,
        `  <div class="${TOOLTIP_CLS}__exclude__wrap">`,
        '    <span class="tau-icon-close-gray"></span> Exclude',
        '  </div>',
        '</div>'
    ].join('\n'),

    didMount: (tooltip: TooltipObject) => {
        tooltip.getDomNode()
            .querySelector('.i-role-exclude')
            .addEventListener('click', () => {
                tooltip.excludeHighlightedElement();
                tooltip.setState({
                    highlight: null,
                    isStuck: false
                });
            });
    }
};

const defaultTemplateFactory: TooltipTemplateFactory = (
    tooltip,
    settings,
    templateSettings: typeof defaultTemplateSettings
) => {

    templateSettings = Object.assign({}, templateSettings, defaultTemplateSettings);

    const root = templateSettings.rootTemplate;
    const item = templateSettings.itemTemplate;
    const buttons = templateSettings.buttonsTemplate;
    const didMount = templateSettings.didMount;

    return {

        render(data, fields) {
            const content = (() => fields
                .filter((field) => {
                    const tokens = field.split('.');
                    const matchX = ((tokens.length === 2) && tooltip.skipInfo[tokens[0]]);
                    return !matchX;
                })
                .map((field) => {
                    const v = data[field];
                    const label = tooltip.getFieldLabel(field);
                    const value = tooltip.getFieldFormat(field)(v);
                    return item({label, value});
                })
                .join('\n'));

            return root({content, buttons});
        },

        didMount(tooltip) {
            didMount(tooltip);
        }
    };
};

function Tooltip(xSettings: TooltipSettings) {

    const settings = utils.defaults(
        xSettings || {},
        (Tooltip as any).defaults);
    settings.templateSettings = utils.defaults(
        settings.templateSettings || {},
        (Tooltip as any).defaults.templateSettings);

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

            this._template = settings.getTemplate(this, settings, settings.templateSettings);
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
                var tooltipRect = this.getDomNode().getBoundingClientRect();
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

        getDomNode() {
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
            const tooltipNode = this.getDomNode();
            if (state.isStuck !== prev.isStuck) {
                if (state.isStuck) {
                    window.addEventListener('click', this._outerClickHandler, true);
                    tooltipNode.classList.add(settings.classStuck);
                    this._setTargetEventsEnabled(false);
                    this._accentFocus(state.highlight.data);
                    this._tooltip.updateSize();
                } else {
                    window.removeEventListener('click', this._outerClickHandler, true);
                    tooltipNode.classList.remove(settings.classStuck);
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

            const content = this._template.render(data, fields);

            this._tooltip
                .content(content)
                .position(cursor.x, cursor.y)
                .place(settings.align)
                .show()
                .updateSize();

            if (this._template.didMount) {
                this._template.didMount(this);
            }
        },

        _hideTooltip() {
            window.removeEventListener('click', this._outerClickHandler, true);
            if (this._template.willUnmount) {
                this._template.willUnmount(this);
            }
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
                                unit: e.unit
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
                                unit: e.unit
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
                        return (row !== highlightedRow);
                        // return JSON.stringify(row) !== JSON.stringify(highlightedRow);
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
            d3.select(this._chart.getSVG()).classed(settings.classTarget, isSet);
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

(Tooltip as any).defaults = <TooltipSettings>{
    align: 'bottom-right',
    classStuck: 'stuck',
    classTarget: `${TOOLTIP_CLS}-target`,
    escapeHtml: true,
    fields: null as string[],
    formatters: {} as {[field: string]: (Formatter | FormatterObject)},
    getTemplate: defaultTemplateFactory,
    spacing: 24,
    templateSettings: defaultTemplateSettings,
};

Taucharts.api.plugins.add('tooltip', Tooltip);

interface TooltipSettings {
    align?: string;
    classStuck?: string;
    classTarget?: string;
    escapeHtml?: boolean;
    fields?: string[];
    formatters?: {[field: string]: (Formatter | FormatterObject)};
    getFields?: (chart: Plot) => string[];
    getTemplate?: TooltipTemplateFactory;
    templateSettings?: any;
    spacing?: number;
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
    render(data: any[], fields: string[]): string;
    didMount?(tooltip: TooltipObject);
    willUnmount?(tooltip: TooltipObject);
}
type TooltipTemplateFactory = (
    tooltip: TooltipObject,
    settings: TooltipSettings,
    templateSettings
) => TooltipTemplate;

interface TooltipObject extends PluginObject {
    init(this: TooltipObject, chart: Plot): void;
    state: TooltipState;
    setState(this: TooltipObject, newState: TooltipState): void;
    destroy(this: TooltipObject): void;
    getFieldFormat(this: TooltipObject, k: string): any;
    getFieldLabel(this: TooltipObject, k: string): string;
    getDomNode(this: TooltipObject): HTMLElement;
    excludeHighlightedElement(this: TooltipObject): void;
    onRender(this: TooltipObject): void;
    metaInfo?: DimMap;
    skipInfo?: {[key: string]: boolean};
    _initDomEvents(this: TooltipObject);
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
