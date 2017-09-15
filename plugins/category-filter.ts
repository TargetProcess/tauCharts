import Taucharts from 'taucharts';
import {
    Plot,
    ScaleConfig,
    ScaleFields,
} from '../src/definitions';

export default function CategoryFilterPlugin(settings: CategoryFilterSettings) {
    return new CategoryFilter(settings);
}

const CLS = 'tau-chart__category-filter';

const joinLines = (lines: string[]) => lines.join('\n');

const rootTemplate = ({ categories }: { categories: CategoryInfo[] }) => `
    <div class="${CLS}">
        ${joinLines(categories.map((category) => categoryTemplate(category)))}
    </div>
`;

const categoryTemplate = ({ label, values }: CategoryInfo) => `
    <div class="${CLS}__category">
        <div class="${CLS}__category__label">${label}</div>
        <div class="${CLS}__category__values">
            ${joinLines(values.map((v) => valueTemplate(v)))}
    </div>

`;
const valueTemplate = ({ key, label, checked }) => `
    <div class="${CLS}__value${checked ? ` ${CLS}__value_checked` : ''}" data-key="${key}">
        <span class="${CLS}__value__checkbox"></span>
        <span class="${CLS}__value__label">${label}</span>
    </div>
`;


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

class CategoryFilter {

    settings: CategoryFilterSettings;
    _chart: Plot;
    _fields: string[];
    _categoryScales: ScaleInfo[];
    _node: HTMLDivElement;
    _filters: { [key: string]: number; };
    _filterKeys: {
        [key: string]: {
            dim: string;
            value: any;
        }
    };
    onRender: () => void;

    constructor(settings: CategoryFilterSettings) {
        this.settings = settings || {};
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
                    return { name, config };
                })
                .filter(predicate);
        };

        const categoryScales = filterScales(({ config, name }) => {
            return (config.type === 'ordinal' && config.dim);
        });

        // Todo: how to use fields?
        const fields = this.settings.fields || categoryScales.map(({ config }) => config.dim);

        this._categoryScales = categoryScales;

        this._render();
    }

    _createRenderHandler() {
        return function (this: CategoryFilter) {
            // this._render();
        };
    }

    _getContent(categories: CategoryInfo[]) {
        return rootTemplate({ categories });
    }

    _getCategoriesInfo() {
        const scales = this._categoryScales.map(({ name }) => {
            return this._chart.getScaleInfo(name);
        });
        // Todo: Get labels like in Tooltip.
        const categories = scales.map((scale) => {
            const dim = scale.dim;
            const label = dim;
            const domain = scale.domain();
            const values = domain.map((value) => {
                const label = value;
                const key = this._getFilterKey(dim, value);
                // const checked = !this._filters[key];
                const checked = true;
                return { label, checked, key, value };
            });
            return { dim, label, values };
        });
        return categories;
    }

    _render() {
        this._clear();
        const categories = this._getCategoriesInfo();
        const content = this._getContent(categories);
        const node = createElement(content);
        this._node = node as HTMLDivElement;
        this._chart.insertToRightSidebar(node);
        this._subscribeToEvents();
        this._filterKeys = categories.reduce((map, cat) => {
            const dim = cat.label
            cat.values.forEach(({ key, value }) => {
                map[key] = { dim, value };
            });
            return map;
        }, {});
    }

    _subscribeToEvents() {
        const node = this._node;
        delegateEvent(
            node,
            'click',
            `.${CLS}__value`,
            (e, target) => {
                const key = target.getAttribute('data-key');
                const { dim, value } = this._filterKeys[key];
                if (this._filters[key]) {
                    this._removeFilter(key);
                    target.classList.add(`${CLS}__value_checked`);
                } else {
                    this._addFilter(dim, value);
                    target.classList.remove(`${CLS}__value_checked`);
                }
            }
        );

    }

    _clear() {
        const node = this._node;
        if (node && node.parentElement) {
            node.parentElement.removeChild(node);
        }
    }

    _getFilterKey(dim: string, value: any) {
        return `${dim}__${value}`;
    }

    _addFilter(dim: string, value: any) {
        const isEmpty = (x) => x == null || x === '';
        const key = this._getFilterKey(dim, value);
        const stringify = (x) => JSON.stringify(isEmpty(x) ? null : x);
        const v = stringify(value);
        this._filters[key] = this._chart.addFilter({
            tag: 'category-filter',
            predicate: (row) => {
                const d = row[dim];
                var r = stringify(d);
                return (v !== r);
            }
        });
        this._chart.refresh();
    }

    _removeFilter(key: string) {
        const filterId = this._filters[key];
        delete this._filters[key];
        this._chart.removeFilter(filterId);
        this._chart.refresh();
    }

}

Taucharts.api.plugins.add('category-filter', CategoryFilterPlugin);

interface CategoryFilterSettings {
    fields?: string[];
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
