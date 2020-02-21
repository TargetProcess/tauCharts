import Taucharts from 'taucharts';
import {
    Plot,
    ScaleConfig,
    ScaleFields,
} from '../src/definitions';
import {Formatter} from '../src/plugins-sdk';

const utils = Taucharts.api.utils;
const pluginsSDK = Taucharts.api.pluginsSDK;

const CLS = 'tau-chart__category-filter';
const CLS_VALUE = `${CLS}__value`;
const CLS_VALUE_CHECKED = `${CLS_VALUE}_checked`;
const CLS_VALUE_TOGGLE = `${CLS_VALUE}__toggle`;

const joinLines = (lines: string[]) => lines.join('\n');

const rootTemplate = ({categories}: {categories: CategoryInfo[]}) => `
    <div class="${CLS}">
        ${joinLines(categories.map((category) => categoryTemplate(category)))}
    </div>
`;

const categoryTemplate = ({label, values}: CategoryInfo) => `
    <div class="${CLS}__category">
        <div class="${CLS}__category__label">${label}</div>
        <div class="${CLS}__category__values">
            ${joinLines(values.map((v) => valueTemplate(v)))}
    </div>

`;

const valueTemplate = ({key, label, checked}) => `
    <div class="${CLS_VALUE}${checked ? ` ${CLS_VALUE_CHECKED}` : ''}" data-key="${key}">
        ${toggleIconTemplate()}
        <span class="${CLS_VALUE}__label">${label}</span>
    </div>
`;

const toggleIconTemplate = () => [
    `<span class="${CLS_VALUE_TOGGLE}">`,
    `<span class="${CLS_VALUE_TOGGLE}__icon"></span>`,
    '</span>'
].join('');

const createElement = (html: string) => {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.firstElementChild;
};

const delegateEvent = (element, eventName, selector, callback: (e: MouseEvent, target: HTMLElement) => void) => {
    element.addEventListener(eventName, function (e) {
        let target = e.target;
        while (target !== e.currentTarget && target !== null) {
            if (target.matches(selector)) {
                callback(e, target);
            }
            target = target.parentNode;
        }
    });
};

const createRowPredicate = (dim: string, value: any) => {
    const isEmpty = (x) => x == null || x === '';
    const stringify = (x) => JSON.stringify(isEmpty(x) ? null : x);
    const v = stringify(value);
    return (row) => {
        const d = row[dim];
        const r = stringify(d);
        return (v === r);
    };
};

class CategoryFilter {

    settings: CategoryFilterSettings;
    _chart: Plot;
    _fields: string[];
    _categoryScales: ScaleInfo[];
    _node: HTMLDivElement;
    _filters: {[key: string]: number;};
    _filterKeys: {
        [key: string]: {
            dim: string;
            value: any;
        }
    };
    _formatters: {
        [field: string]: {
            label: string;
            format: (x) => string;
        };
    };
    _lastClickedScrollInfo: {
        key: string;
        top: number;
    };
    onRender: () => void;

    constructor(settings: CategoryFilterSettings) {
        this.settings = utils.defaults(settings || {}, {
            formatters: {},
            fields: null,
            skipColorDim: true,
        });
        this._filters = {};
        this.onRender = this._createRenderHandler();
    }

    init(chart: Plot) {
        this._chart = chart;

        const filterScales = (predicate: (info: ScaleInfo) => any) => {
            const scales = chart.getSpec().scales;
            return Object.keys(scales)
                .map((name) => {
                    const config = scales[name];
                    return {name, config};
                })
                .filter(predicate);
        };

        let categoryScales = filterScales(({config, name}) => {
            return (config.type === 'ordinal' && config.dim);
        });

        let fields = utils.unique(categoryScales.map(({config}) => config.dim));
        if (this.settings.fields) {
            fields = fields.filter((f) => this.settings.fields.indexOf(f) >= 0);
        }
        if (this.settings.skipColorDim) {
            const colorDims = filterScales(({config, name}) => {
                return (config.type === 'color' && config.dim);
            }).map(({config}) => config.dim);
            fields = fields.filter((dim) => {
                return colorDims.indexOf(dim) < 0;
            });
        }

        categoryScales = categoryScales.filter((scale) => {
            return fields.indexOf(scale.config.dim) >= 0;
        });

        this._categoryScales = categoryScales;

        this._render();
    }

    destroy() {
        const filters = this._filters;
        const chart = this._chart;
        Object.keys(filters)
            .forEach((id) => chart.removeFilter(filters[id]));

        const remove = (node) => node && node.parentElement && node.parentElement.removeChild(node);
        remove(this._node);
    }

    _createRenderHandler() {
        return function (this: CategoryFilter) {
            if (this._lastClickedScrollInfo) {
                const key = this._lastClickedScrollInfo.key;
                const el = this._node.querySelector(`[data-key="${key}"]`) as HTMLElement;
                if (el) {
                    const top = this._lastClickedScrollInfo.top;
                    const elTop = el.getBoundingClientRect().top;
                    const container = this._getScrollContainer();
                    const boxTop = container.getBoundingClientRect().top;
                    container.scrollTop = (container.scrollTop - top - boxTop + elTop);
                }
                this._lastClickedScrollInfo = null;
            }
        };
    }

    _getContent(categories: CategoryInfo[]) {
        return rootTemplate({categories});
    }

    _getCategoriesInfo() {
        const scales = this._categoryScales.map(({name}) => {
            return this._chart.getScaleInfo(name);
        });
        const categories = scales.map((scale) => {
            const dim = scale.dim;
            const label = this._getFieldLabel(dim);
            const format = this._getFieldFormat(dim);

            const dataSource = this._chart.getDataSources({excludeFilter: ['category-filter']});
            const domain = utils.unique(dataSource[scale.source].data.map((d) => d[dim]));

            const values = domain.map((value) => {
                const label = format(value);
                const key = this._getFilterKey(dim, value);
                const checked = !this._filters[key];
                return {label, checked, key, value};
            });
            return {dim, label, values};
        });
        return categories;
    }

    _render() {
        this._clear();
        this._formatters = pluginsSDK.getFieldFormatters(
            this._chart.getSpec(),
            this.settings.formatters);
        const categories = this._getCategoriesInfo();
        const content = this._getContent(categories);
        const node = createElement(content);
        this._node = node as HTMLDivElement;
        this._chart.insertToRightSidebar(node);
        this._subscribeToEvents();
        this._filterKeys = categories.reduce((map, category) => {
            const dim = category.dim;
            category.values.forEach(({key, value}) => {
                map[key] = {dim, value};
            });
            return map;
        }, {});
    }

    _subscribeToEvents() {
        const node = this._node;

        delegateEvent(
            node,
            'click',
            `.${CLS_VALUE}`,
            (e, target) => {
                const key = target.getAttribute('data-key');
                const toggle = (e.target as HTMLElement).matches(`.${CLS_VALUE_TOGGLE}`);
                this._toggleCategory(key, toggle ? 'toggle' : 'focus');
            }
        );

        delegateEvent(
            node,
            'mouseover',
            `.${CLS_VALUE}`,
            (e, target) => {
                const key = target.getAttribute('data-key');
                this._toggleHighlight(key, true);
            }
        );
        delegateEvent(
            node,
            'mouseout',
            `.${CLS_VALUE}`,
            (e, target) => {
                const key = target.getAttribute('data-key');
                this._toggleHighlight(key, false);
            }
        );
    }

    _isFilteredOut(key) {
        return (key in this._filters);
    }

    _toggleCategory(key, type: 'toggle' | 'focus') {

        interface Item {
            node: HTMLElement;
            key: string;
            dim: string;
            value: any;
            isChecked: boolean;
        }

        const nodes = Array.from(this._node.querySelectorAll(`.${CLS_VALUE}`))
            .reduce((map, node) => {
                const k = node.getAttribute('data-key');
                map[k] = node as HTMLElement;
                return map;
            }, {} as {[key: string]: HTMLElement});
        const items = Object.keys(this._filterKeys)
            .map((k) => {
                const {dim, value} = this._filterKeys[k];
                return {
                    node: nodes[k],
                    key: k,
                    dim,
                    value,
                    isChecked: !this._isFilteredOut(k)
                };
            });
        const itemsMap = items
            .reduce((map, item) => {
                map[item.key] = item;
                return map;
            }, {} as {[key: string]: Item});

        const target = itemsMap[key];
        const dimItems = items.filter((item) => item.dim === target.dim);

        const toggleNode = (node: HTMLElement, checked: boolean) => {
            if (checked) {
                node.classList.add(CLS_VALUE_CHECKED);
            } else {
                node.classList.remove(CLS_VALUE_CHECKED);
            }
        };

        switch (type) {

            case 'toggle': {
                if (target.isChecked) {
                    this._addFilter(key);
                    toggleNode(target.node, false);
                } else {
                    this._removeFilter(key);
                    toggleNode(target.node, true);
                }
                break;
            }

            case 'focus': {
                const allOthersAreFilteredOut = (target.isChecked && dimItems.every((item) => {
                    return (item === target || !item.isChecked);
                }));
                if (allOthersAreFilteredOut) {
                    dimItems.forEach((item) => {
                        if (!item.isChecked) {
                            toggleNode(item.node, true);
                            this._removeFilter(item.key);
                        }
                    });
                } else {
                    dimItems.forEach((item) => {
                        if (item !== target && item.isChecked) {
                            toggleNode(item.node, false);
                            this._addFilter(item.key);
                        }
                    });
                    if (!target.isChecked) {
                        toggleNode(target.node, true);
                        this._removeFilter(target.key);
                    }
                }
                break;
            }
        }

        this._lastClickedScrollInfo = {
            key,
            top: (
                target.node.getBoundingClientRect().top -
                this._getScrollContainer().getBoundingClientRect().top
            )
        };
        this._chart.refresh();
    }

    _toggleHighlight(key: string, highlight: boolean) {
        if (this._isFilteredOut(key)) {
            return;
        }

        const {dim, value} = this._filterKeys[key];
        const matches = (highlight ?
            createRowPredicate(dim, value) :
            ((row) => null));

        this._chart
            .select((unit) => true)
            .forEach((unit) => unit.fire('highlight', matches));
    }

    _clear() {
        const node = this._node;
        if (node && node.parentElement) {
            node.parentElement.removeChild(node);
        }
    }

    _getScrollContainer() {
        return this._node.parentElement.parentElement;
    }

    _getFilterKey(dim: string, value: any) {
        return `${dim}__${value}`;
    }

    _addFilter(key) {
        const {dim, value} = this._filterKeys[key];
        const matches = createRowPredicate(dim, value);
        this._filters[key] = this._chart.addFilter({
            tag: 'category-filter',
            predicate: (row) => {
                return !matches(row);
            }
        });
    }

    _removeFilter(key: string) {
        const filterId = this._filters[key];
        delete this._filters[key];
        this._chart.removeFilter(filterId);
    }

    _getFieldLabel(k) {
        return (this._formatters[k] ? this._formatters[k].label : k);
    }

    _getFieldFormat(k) {
        return (this._formatters[k] ? this._formatters[k].format : (x) => String(x));
    }

}

Taucharts.api.plugins.add('category-filter', CategoryFilterPlugin);

export default function CategoryFilterPlugin(settings: CategoryFilterSettings) {
    return new CategoryFilter(settings);
}

interface CategoryFilterSettings {
    fields?: string[];
    formatters?: {[field: string]: Formatter};
    skipColorDim?: boolean;
}

interface CategoryInfo {
    dim: string;
    label: string;
    values: {
        checked: boolean;
        label: string;
        key: string;
        value: any;
    }[];
}

interface ScaleInfo {
    name: string;
    config: ScaleConfig;
}
