import Taucharts from 'taucharts';
import * as d3 from 'd3-selection';
import getFieldsTemplate from './fields-template';
import {GrammarElement, Plot} from '../../src/definitions';
import {Formatter} from '../../src/plugins-sdk';

const utils = Taucharts.api.utils;
const domUtils = Taucharts.api.domUtils;
const pluginsSDK = Taucharts.api.pluginsSDK;
const TOOLTIP_CLS = 'tau-chart__tooltip';

export default class Tooltip {

    settings: TooltipSettings;
    state: TooltipState;
    _chart: Plot;
    _tooltip: any;
    _template;
    _formatters: {
        [field: string]: {
            label: string;
            format: (x) => string;
        };
    };
    _scrollHandler: () => void;
    _outerClickHandler: (e: MouseEvent) => void;

    onRender: () => void;

    constructor(settings: TooltipSettings) {
        this.settings = utils.defaults(settings || {}, {
            align: 'bottom-right',
            clsClickable: `${TOOLTIP_CLS}__clickable`,
            clsStuck: 'stuck',
            clsTarget: `${TOOLTIP_CLS}-target`,
            escapeHtml: true,
            fields: null,
            formatters: {},
            getTemplate: null,
            spacing: 24,
            winBound: 12,
        });
        this.onRender = this._getRenderHandler();
    }

    init(chart: Plot) {

        this._chart = chart;

        this._tooltip = this._chart.addBalloon(
            {
                spacing: this.settings.spacing,
                winBound: this.settings.winBound,
                auto: true,
                effectClass: 'fade'
            });

        this._initDomEvents();

        // Handle initial state
        this.state = {
            highlight: null,
            isStuck: false
        };
        this.setState(this.state);

        this._template = this._getTemplate();
    }

    _getTemplate() {
        const defaultTemplate = getFieldsTemplate(this, this.settings);
        if (typeof this.settings.getTemplate === 'function') {
            return this.settings.getTemplate(defaultTemplate, this, this.settings);
        }
        return defaultTemplate;
    }

    _renderTemplate(data, fields) {
        return this._template.render({data, fields});
    }

    _initDomEvents() {
        this._scrollHandler = () => {
            this.setState({
                highlight: null,
                isStuck: false
            });
        };
        window.addEventListener('scroll', this._scrollHandler, true);

        this._outerClickHandler = (e) => {
            const clickableItems = Array.from(document
                .querySelectorAll(`.${this.settings.clsClickable}`))
                .concat(this.getDomNode());

            const rects = clickableItems.map((el) => el.getBoundingClientRect());
            const top = Math.min(...rects.map((r) => r.top));
            const left = Math.min(...rects.map((r) => r.left));
            const right = Math.max(...rects.map((r) => r.right));
            const bottom = Math.max(...rects.map((r) => r.bottom));

            if ((e.clientX < left) ||
                (e.clientX > right) ||
                (e.clientY < top) ||
                (e.clientY > bottom)
            ) {
                this.setState({
                    highlight: null,
                    isStuck: false
                });
            }
        };
    }

    getDomNode() {
        return this._tooltip.getElement();
    }

    setState(newState) {

        const settings = this.settings;

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
            this._tooltip.updateSize();
        }

        // Stick/unstick tooltip
        const tooltipNode = this.getDomNode();
        if (state.isStuck !== prev.isStuck) {
            if (state.isStuck) {
                window.addEventListener('click', this._outerClickHandler, true);
                tooltipNode.classList.add(settings.clsStuck);
                this._setTargetEventsEnabled(false);
                this._accentFocus(state.highlight.data);
                this._tooltip.updateSize();
            } else {
                window.removeEventListener('click', this._outerClickHandler, true);
                tooltipNode.classList.remove(settings.clsStuck);
                // NOTE: Prevent showing tooltip immediately
                // after pointer events appear.
                requestAnimationFrame(() => {
                    this._setTargetEventsEnabled(true);

                    // Dispatch `mouseleave` (should cause `data-hover` with empty data
                    // and should dispatch leaving focus for some plugins like Crosshair)
                    const svg = this._chart.getSVG();
                    if (svg) {
                        domUtils.dispatchMouseEvent(svg, 'mouseleave');
                    }
                });
            }
        }
    }

    _showTooltip(data, cursor) {

        const settings = this.settings;

        const fields = (
            settings.fields
            ||
            ((typeof settings.getFields === 'function') && settings.getFields(this._chart))
            ||
            Object.keys(data)
        );

        const content = this._renderTemplate(data, fields);

        this._tooltip
            .content(content)
            .position(cursor.x, cursor.y)
            .place(settings.align)
            .show()
            .updateSize();

        if (this._template.didMount) {
            this._template.didMount();
        }
    }

    _hideTooltip() {
        window.removeEventListener('click', this._outerClickHandler, true);
        if (this._template.willUnmount) {
            this._template.willUnmount();
        }
        this._tooltip.hide();
    }

    destroy() {
        window.removeEventListener('scroll', this._scrollHandler, true);
        this._setTargetSvgClass(false);
        this.setState({
            highlight: null,
            isStuck: false
        });
        this._tooltip.destroy();
    }

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
    }

    getFieldFormat(k) {
        const format = (this._formatters[k] ?
            this._formatters[k].format :
            (x) => String(x));
        return (this.settings.escapeHtml ?
            (x) => utils.escapeHtml(format(x)) :
            format
        );
    }

    getFieldLabel(k) {
        const label = (this._formatters[k] ? this._formatters[k].label : k);
        return (this.settings.escapeHtml ? utils.escapeHtml(label) : label);
    }

    _accentFocus(data) {
        const filter = ((d) => (d === data));
        this._chart
            .select(() => true)
            .forEach((unit) => {
                unit.fire('highlight', filter);
            });
    }

    _removeFocus() {
        const filter = (() => null);
        this._chart
            .select(() => true)
            .forEach((unit) => {
                unit.fire('highlight', filter);
                unit.fire('highlight-data-points', filter);
            });
    }

    excludeHighlightedElement() {
        const highlightedRow = this.state.highlight.data;
        this._chart
            .addFilter({
                tag: 'exclude',
                predicate: (row) => {
                    return (row !== highlightedRow);
                }
            });
        this._chart.refresh();
    }

    _getRenderHandler() {
        return function (this: Tooltip) {
            this._formatters = pluginsSDK.getFieldFormatters(this._chart.getSpec(), this.settings.formatters);

            this._subscribeToHover();

            this.setState({
                highlight: null,
                isStuck: false
            });
        };
    }

    _setTargetSvgClass(isSet) {
        d3.select(this._chart.getSVG()).classed(this.settings.clsTarget, isSet);
    }

    _setTargetEventsEnabled(isSet) {
        if (isSet) {
            this._chart.enablePointerEvents();
        } else {
            this._chart.disablePointerEvents();
        }
    }
}

interface TooltipCursor {
    x: number;
    y: number;
}

interface TooltipState {
    highlight?: {
        data: any;
        cursor: TooltipCursor;
        unit: GrammarElement;
    };
    isStuck?: boolean;
}

export interface TooltipSettings {
    align?: string;
    clsClickable?: string;
    clsStuck?: string;
    clsTarget?: string;
    escapeHtml?: boolean;
    fields?: string[];
    formatters?: {[field: string]: Formatter};
    getFields?: (chart: Plot) => string[];
    getTemplate?: (defaults, tooltip: Tooltip, settings: TooltipSettings) => any;
    templateSettings?: any;
    spacing?: number;
    winBound?: number;
}
