import Taucharts from 'taucharts';
import * as d3 from 'd3-format';

const utils = Taucharts.api.utils;
const pluginsSDK = Taucharts.api.pluginsSDK;
const RESET_SELECTOR = '.tau-chart__legend__reset';
const COLOR_ITEM_SELECTOR = '.tau-chart__legend__item-color';
const COLOR_TOGGLE_SELECTOR = '.tau-chart__legend__guide--color__overlay';
const SIZE_TICKS_COUNT = 4;
const FONT_SIZE = 13;

let counter = 0;
const getId = () => ++counter;

const xml = Taucharts.api.utils.xml;

const splitEvenly = (domain, parts) => {
    const min = domain[0];
    const max = domain[1];
    const segment = ((max - min) / (parts - 1));
    const chunks = utils.range(parts - 2).map(n => min + segment * (n + 1));
    return [min].concat(chunks).concat(max);
};

const splitRealValuesEvenly = (values, count, funcType) => {

    if (values.length < 3) {
        return values.slice(0);
    }
    if (count < 3) {
        return [values[0], values[values.length - 1]];
    }

    const neg = (values[0] < 0 ? Math.abs(values[0]) : 0);
    const repeat = x => x;
    const sqrt = x => Math.sqrt(x + neg);
    const square = x => x ** 2 - neg;
    const input = (funcType === 'sqrt' ? sqrt : repeat);
    const ouput = (funcType === 'sqrt' ? square : repeat);

    values = values.map(input);
    let result = [values[0]];
    const length = (values[values.length - 1] - values[0]);
    const halfStep = (0.5 * length / (count - 1));

    const steps = utils.range(1, count - 1)
        .map(i => {
            const mid = (length * i / (count - 1));
            return {
                min: mid - halfStep,
                mid,
                max: mid + halfStep,
                diff: Number.MAX_VALUE,
                closest: null
            };
        });
    let si = 0;
    let step;
    const nextStep = () => {
        if (si === steps.length) {
            return;
        }
        const prevStep = step;
        step = steps[si++];
        step.min = Math.max(
            (step.min),
            ((prevStep && prevStep.closest !== null ? prevStep.closest : result[0]) + halfStep)
        );
    };
    nextStep();

    values.forEach(value => {
        if (value < step.min) {
            return;
        }
        if (value > step.max) {
            nextStep();
        }
        const diff = Math.abs(value - step.mid);
        if (diff < step.diff && diff < halfStep) {
            step.diff = diff;
            step.closest = value;
        } else {
            nextStep();
        }
        if (diff === 0) {
            nextStep();
        }
    });

    steps.forEach(s => {
        if (s.closest !== null) {
            result.push(s.closest);
        }
    });

    result.push(values[values.length - 1]);

    result = result.map(ouput);

    return result;
};

const log10 = x => Math.log(x) / Math.LN10;

const getExponent = x => {
    if (x === 0) {
        return 0;
    }
    return Math.floor(log10(Math.abs(x)));
};

const removeRedundantZeros = ((() => {
    const zerosAfterDot = /\.0+([^\d].*)?$/;
    const zerosAfterNotZero = /(\.\d+?)0+([^\d].*)?$/;
    return str => str
        .replace(zerosAfterDot, '$1')
        .replace(zerosAfterNotZero, '$1$2');
}))();

const d3Format3S = d3.format('.3s');
const shortNumFormat = num => removeRedundantZeros(d3Format3S(num));

const getNumberFormatter = (start, end) => {

    const max = Math.max(Math.abs(start), Math.abs(end));
    const absExp = getExponent(max);
    const diff = (start * end > 0 ? Math.abs(end - start) : max);
    const diffExp = getExponent(diff);
    const absExpVsDiffExp = Math.abs(absExp - diffExp);

    if (Math.abs(absExp) > 3 && absExpVsDiffExp <= 3) {
        // Short format
        // 1k, 500k, 1M.
        return shortNumFormat;
    }

    // Show necessary digits:
    // 100001, 100002, 100003;
    // 0.10001, 0.10002, 0.10003.
    return num => {
        const numExp = getExponent(max - num);
        const trailingDigits = Math.min((
            (diffExp < 0 ? Math.abs(diffExp) : 0) +
            (numExp < diffExp ? 1 : 0)
        ), 20); // NOTE: `toFixed` accepts values between 0 and 20.
        return removeRedundantZeros(num.toFixed(trailingDigits));
    };
};

function ChartLegend(xSettings) {
    let firstRender = true;
    const settings = utils.defaults(
        xSettings || {},
        {
            formatters: {},
            onSelect: () => {
            }
        });

    const doEven = n => {
        n = Math.round(n);
        return n % 2 ? n + 1 : n;
    };

    const isEmpty = x => (x === null) || (x === '') || (typeof x === 'undefined');

    const isDateDomain = domain => domain.every(v => utils.isDate(v));

    const createIsRowMatchInterceptor = (dim, val) => row => {
        const d = row[dim];
        const r = JSON.stringify(isEmpty(d) ? null : d);
        return (val === r);
    };

    const _delegateEvent = (element, eventName, selector, callback) => {
        element.addEventListener(eventName, e => {
            let target = e.target;
            while (target !== e.currentTarget && target !== null) {
                if (target.matches(selector)) {
                    callback(e, target);
                }
                target = target.parentNode;
            }
        });
    };

    return {

        init(chart) {
            this.instanceId = getId();

            this._chart = chart;
            this._currentFilters = {};
            this._legendColorByScaleId = {};
            this._legendOrderState = {};

            const spec = this._chart.getSpec();

            const reducer = scaleType => (memo, k) => {
                const s = spec.scales[k];
                if (s.type === scaleType && s.dim) {
                    memo.push(k);
                }
                return memo;
            };

            this._color = Object
                .keys(spec.scales)
                .reduce(reducer('color'), [])
                .filter(scale => chart.getScaleInfo(scale).discrete);

            this._fill = Object
                .keys(spec.scales)
                .reduce(reducer('color'), [])
                .filter(scale => !chart.getScaleInfo(scale).discrete);

            this._size = Object
                .keys(spec.scales)
                .reduce(reducer('size'), []);

            const hasColorScales = (this._color.length > 0);
            const hasFillScales = (this._fill.length > 0);
            const hasSizeScales = (this._size.length > 0);
            this._assignStaticBrewersOrEx();

            if (hasColorScales || hasFillScales || hasSizeScales) {

                switch (settings.position) {
                    case 'left':
                        this._container = this._chart.insertToLeftSidebar(this._containerTemplate);
                        break;
                    case 'right':
                        this._container = this._chart.insertToRightSidebar(this._containerTemplate);
                        break;
                    case 'top':
                        this._container = this._chart.insertToHeader(this._containerTemplate);
                        break;
                    case 'bottom':
                        this._container = this._chart.insertToFooter(this._containerTemplate);
                        break;
                    default:
                        this._container = this._chart.insertToRightSidebar(this._containerTemplate);
                        break;
                }

                if (hasColorScales) {
                    _delegateEvent(
                        this._container,
                        'click',
                        RESET_SELECTOR,
                        (e, currentTarget) => {
                            this._toggleLegendItem(currentTarget, 'reset');
                        });

                    _delegateEvent(
                        this._container,
                        'click',
                        COLOR_ITEM_SELECTOR,
                        (e, currentTarget) => {
                            const mode = (e.ctrlKey || e.target.matches(COLOR_TOGGLE_SELECTOR) ?
                                'leave-others' :
                                'focus-single');
                            this._toggleLegendItem(currentTarget, mode);
                        });

                    _delegateEvent(
                        this._container,
                        'mouseover',
                        COLOR_ITEM_SELECTOR,
                        (e, currentTarget) => {
                            this._highlightToggle(currentTarget, true);
                        }
                    );

                    _delegateEvent(
                        this._container,
                        'mouseout',
                        COLOR_ITEM_SELECTOR,
                        (e, currentTarget) => {
                            this._highlightToggle(currentTarget, false);
                        }
                    );
                }
            }
        },

        destroy() {
            const filters = this._currentFilters;
            const chart = this._chart;
            Object.keys(filters)
                .forEach((id) => chart.removeFilter(filters[id]));

            if (this._container && this._container.parentElement) {
                this._clearPanel();
                this._container.parentElement.removeChild(this._container);
            }
        },

        onSpecReady(chart, specRef) {
            this._formatters = pluginsSDK.getFieldFormatters(specRef, settings.formatters);
        },
        _getFormat(dim) {
            return (this._formatters[dim] ?
                this._formatters[dim].format :
                (x) => String(x));
        },

        onRender() {
            if (firstRender && settings.selectedCategories && settings.selectedCategories.length !== 0) {
                let legendColorByScales = this._getLegendColorByScales();
                Object.keys(legendColorByScales).forEach((key) => {
                    legendColorByScales[key].legendColorItems.forEach(({value: val, dim}) => {
                        if(settings.selectedCategories.indexOf(JSON.parse(val)) === -1) {
                            const key = dim + val;
                            const isRowMatch = createIsRowMatchInterceptor(dim, val);
                            this._currentFilters[key] = this._chart.addFilter({
                                tag: 'legend',
                                predicate(row) {
                                    return !isRowMatch(row);
                                }
                            });
                        }
                    });
                });
                firstRender = false;
                this._chart.refresh();
                return;
            }
            this._clearPanel();
            this._drawColorLegend();
            this._drawFillLegend();
            this._drawSizeLegend();
        },

        // tslint:disable max-line-length
        _containerTemplate: '<div class="tau-chart__legend"></div>',
        _template: utils.template([
            '<div class="tau-chart__legend__wrap">',
            '<%=top%>',
            '<div class="tau-chart__legend__title"><%=name%></div>',
            '<%=items%>',
            '</div>'
        ].join('')),
        _itemTemplate: utils.template([
            '<div data-scale-id=\'<%= scaleId %>\' data-dim=\'<%= dim %>\' data-value=\'<%= value %>\' class="tau-chart__legend__item tau-chart__legend__item-color <%=classDisabled%>">',
            '   <div class="tau-chart__legend__guide__wrap">',
            '   <div class="tau-chart__legend__guide tau-chart__legend__guide--color <%=cssClass%>"',
            '        style="background-color: <%=cssColor%>; border-color: <%=borderColor%>;">',
            '       <div class="tau-chart__legend__guide--color__overlay">',
            '       </div>',
            '   </div>',
            '   </div>',
            '   <span class="tau-chart__legend__guide__label"><%=label%></span>',
            '</div>'
        ].join('')),
        _resetTemplate: utils.template([
            '<div class="tau-chart__legend__reset <%=classDisabled%>">',
            '    <div role="button" class="tau-chart__button">Reset</div>',
            '</div>'
        ].join('')),
        // tslint:enable max-line-length

        _clearPanel() {
            if (this._container) {
                clearTimeout(this._scrollTimeout);
                this._getScrollContainer().removeEventListener('scroll', this._scrollListener);
                this._container.innerHTML = '';
            }
        },

        _drawFillLegend() {
            const self = this;

            self._fill.forEach(c => {
                const firstNode = self
                    ._chart
                    .select(unit => unit.config.color === c)
                    [0];

                if (firstNode) {

                    const guide = firstNode.config.guide || {};

                    const fillScale = firstNode.getScale('color');

                    const domain = fillScale.domain().sort((a, b) => a - b);

                    const isDate = isDateDomain(domain);

                    const numDomain = (isDate ?
                        domain.map(Number) :
                        domain);

                    const numFormatter = getNumberFormatter(numDomain[0], numDomain[numDomain.length - 1]);
                    const dateFormatter = ((() => {
                        const spec = self._chart.getSpec();
                        let formatter = pluginsSDK.extractFieldsFormatInfo(spec)[fillScale.dim].format;
                        if (!formatter) {
                            formatter = x => new Date(x);
                        }
                        return x => String(formatter(x));
                    }))();

                    const formatter = (isDate ?
                        dateFormatter :
                        numFormatter);

                    const brewerLength = fillScale.brewer.length;
                    const title = ((guide.color || {}).label || {}).text || fillScale.dim;

                    const getTextWidth = text => text.length * FONT_SIZE * 0.618;
                    const labelsCount = (!fillScale.isInteger ? 3 :
                            ((numDomain[1] - numDomain[0]) % 3 === 0) ? 4 :
                                ((numDomain[1] - numDomain[0]) % 2 === 0) ? 3 : 2
                    );
                    const splitted = splitEvenly(numDomain, labelsCount);
                    let labels = (isDate ? splitted.map(x => new Date(x)) : splitted).map(formatter);
                    if (labels[0] === labels[labels.length - 1]) {
                        labels = [labels[0]];
                    }

                    self._container
                        .insertAdjacentHTML('beforeend', self._template({
                            name: title,
                            top: null,
                            items: '<div class="tau-chart__legend__gradient-wrapper"></div>'
                        }));
                    const container = self._container
                        .lastElementChild
                        .querySelector('.tau-chart__legend__gradient-wrapper');
                    const width = container.getBoundingClientRect().width;
                    const totalLabelsW = labels.reduce((sum, label) => sum + getTextWidth(label), 0);
                    let isVerticalLayout = false;
                    if (totalLabelsW > width) {
                        if (labels.length > 1 &&
                            getTextWidth(labels[0]) + getTextWidth(labels[labels.length - 1]) > width
                        ) {
                            isVerticalLayout = true;
                        } else {
                            labels = [labels[0], labels[labels.length - 1]];
                        }
                    }

                    const barSize = 20;
                    const layout = (isVerticalLayout ?
                            ((() => {
                                const height = 120;
                                const dy = (FONT_SIZE * (0.618 - 1) / 2);
                                return {
                                    width,
                                    height,
                                    barX: 0,
                                    barY: 0,
                                    barWidth: barSize,
                                    barHeight: height,
                                    textAnchor: 'start',
                                    textX: utils.range(labelsCount).map(() => 25),
                                    textY: (labels.length === 1 ?
                                        (height / 2 + FONT_SIZE * 0.618) :
                                        labels.map((_, i) => {
                                            const t = ((labels.length - 1 - i) / (labels.length - 1));
                                            return (FONT_SIZE * (1 - t) + height * t + dy);
                                        }))
                                };
                            }))() :
                            ((() => {
                                const padL = (getTextWidth(labels[0]) / 2);
                                const padR = (getTextWidth(labels[labels.length - 1]) / 2);
                                const indent = 8;
                                return {
                                    width,
                                    height: (barSize + indent + FONT_SIZE),
                                    barX: 0,
                                    barY: 0,
                                    barWidth: width,
                                    barHeight: barSize,
                                    textAnchor: 'middle',
                                    textX: (labels.length === 1 ?
                                        [width / 2] :
                                        labels.map((_, i) => {
                                            const t = (i / (labels.length - 1));
                                            return (padL * (1 - t) + (width - padR) * t);
                                        })),
                                    textY: utils.range(labelsCount).map(() => barSize + indent + FONT_SIZE)
                                };
                            }))()
                    );

                    const stops = splitEvenly(numDomain, brewerLength)
                        .map((x, i) => {
                            const p = (i / (brewerLength - 1)) * 100;
                            return xml('stop', {
                                offset: `${p}%`,
                                style: `stop-color:${fillScale(x)};stop-opacity:1"`
                            });
                        });

                    const gradientId = `legend-gradient-${self.instanceId}`;

                    const gradient = (
                        xml('svg',
                            {
                                class: 'tau-chart__legend__gradient',
                                width: layout.width,
                                height: layout.height
                            },
                            xml('defs',
                                xml('linearGradient',
                                    {
                                        id: gradientId,
                                        x1: '0%',
                                        y1: (isVerticalLayout ? '100%' : '0%'),
                                        x2: (isVerticalLayout ? '0%' : '100%'),
                                        y2: '0%'
                                    },
                                    ...stops
                                )
                            ),
                            xml('rect', {
                                class: 'tau-chart__legend__gradient__bar',
                                x: layout.barX,
                                y: layout.barY,
                                width: layout.barWidth,
                                height: layout.barHeight,
                                fill: `url(#${gradientId})`
                            }),
                            ...labels.map((text, i) => xml('text', {
                                x: layout.textX[i],
                                y: layout.textY[i],
                                'text-anchor': layout.textAnchor
                            }, text))
                        )
                    );

                    container
                        .insertAdjacentHTML('beforeend', gradient);
                }
            });
        },

        _drawSizeLegend() {
            const self = this;

            self._size.forEach(c => {
                const firstNode = self
                    ._chart
                    .select(unit => unit.config.size === c)
                    [0];

                if (firstNode) {

                    const guide = firstNode.config.guide || {};

                    const sizeScale = firstNode.getScale('size');

                    const domain = sizeScale.domain().sort((a, b) => a - b);
                    if (!Array.isArray(domain) || !domain.every(isFinite)) {
                        return;
                    }

                    const title = ((guide.size || {}).label || {}).text || sizeScale.dim;

                    const first = domain[0];
                    const last = domain[domain.length - 1];

                    let values = [first];
                    if ((last - first)) {
                        const count = log10(last - first);
                        const xF = Math.round((4 - count));
                        const base = 10 ** xF;

                        const realValues = utils.unique(
                            self._chart
                                .getDataSources({
                                    excludeFilter: ['legend']
                                })[sizeScale.source]
                                .data
                                .map(d => d[sizeScale.dim])
                                .filter(s => s >= first && s <= last))
                            .sort((a, b) => a - b);
                        const steps = splitRealValuesEvenly(realValues, SIZE_TICKS_COUNT, sizeScale.funcType);

                        values = utils.unique(steps
                            .map(x => Math.round(x * base) / base));
                    }

                    const castNum = getNumberFormatter(values[0], values[values.length - 1]);

                    const getTextWidth = text => text.length * FONT_SIZE * 0.618;
                    values.reverse();
                    const sizes = values.map(sizeScale);
                    const maxSize = Math.max.apply(null, sizes);

                    const labels = values.map(castNum);
                    self._container
                        .insertAdjacentHTML('beforeend', self._template({
                            name: title,
                            top: null,
                            items: '<div class="tau-chart__legend__size-wrapper"></div>'
                        }));
                    const container = self._container
                        .lastElementChild
                        .querySelector('.tau-chart__legend__size-wrapper');
                    const width = container.getBoundingClientRect().width;
                    const maxLabelW = Math.max.apply(null, labels.map(getTextWidth));
                    let isVerticalLayout = false;
                    if (maxLabelW > width / 4 || labels.length === 1) {
                        isVerticalLayout = true;
                    }

                    const layout = (isVerticalLayout ?
                            ((() => {
                                const gap = FONT_SIZE;
                                const padT = (sizes[0] / 2);
                                const padB = (sizes[sizes.length - 1] / 2);
                                const indent = 8;
                                const cy = [padT];
                                for (let i = 1, n, p; i < sizes.length; i++) {
                                    p = (sizes[i - 1] / 2);
                                    n = (sizes[i] / 2);
                                    cy.push(cy[i - 1] + Math.max(FONT_SIZE * 1.618, p + gap + n));
                                }
                                const dy = (FONT_SIZE * 0.618 / 2);
                                return {
                                    width,
                                    height: (cy[cy.length - 1] + Math.max(padB, FONT_SIZE / 2)),
                                    circleX: utils.range(sizes.length).map(() => maxSize / 2),
                                    circleY: cy,
                                    textAnchor: 'start',
                                    textX: utils.range(labels.length).map(() => maxSize + indent),
                                    textY: cy.map(y => y + dy)
                                };
                            }))() :
                            ((() => {
                                const padL = Math.max(
                                    getTextWidth(labels[0]) / 2,
                                    sizes[0] / 2
                                );
                                const padR = Math.max(
                                    getTextWidth(labels[labels.length - 1]) / 2,
                                    sizes[sizes.length - 1] / 2
                                );
                                const gap = (width - sizes
                                    .reduce((sum, n, i) => {
                                        return sum + (i === 0 || i === sizes.length - 1 ? n / 2 : n);
                                    }, 0) - padL - padR) / (SIZE_TICKS_COUNT - 1);
                                const indent = 8;
                                const cx = [padL];
                                for (let i = 1, n, p; i < sizes.length; i++) {
                                    p = (sizes[i - 1] / 2);
                                    n = (sizes[i] / 2);
                                    cx.push(cx[i - 1] + p + gap + n);
                                }
                                const cy = sizes.map(size => maxSize - size / 2);
                                return {
                                    width,
                                    height: (maxSize + indent + FONT_SIZE),
                                    circleX: cx,
                                    circleY: cy,
                                    textAnchor: 'middle',
                                    textX: cx,
                                    textY: utils.range(labels.length).map(() => maxSize + indent + FONT_SIZE),
                                };
                            }))()
                    );

                    const sizeLegend = (
                        xml('svg',
                            {
                                class: 'tau-chart__legend__size',
                                width: layout.width,
                                height: layout.height
                            },
                            ...sizes.map((size, i) => xml('circle', {
                                class: (
                                    `tau-chart__legend__size__item__circle ${firstNode.config.color ?
                                        'color-definite' :
                                        'color-default-size'}`
                                ),
                                cx: layout.circleX[i],
                                cy: layout.circleY[i],
                                r: (size / 2)
                            })),
                            ...labels.map((text, i) => xml('text', {
                                class: 'tau-chart__legend__size__item__label',
                                x: layout.textX[i],
                                y: layout.textY[i],
                                'text-anchor': layout.textAnchor
                            }, text))
                        )
                    );

                    container
                        .insertAdjacentHTML('beforeend', sizeLegend);
                }
            });
        },
        _getLegendColorByScales() {
            const self = this;
            return self._color.reduce((legendColorsInfo, c) => {
                const firstNode = self
                    ._chart
                    .select(unit => unit.config.color === c)
                    [0];

                if (firstNode) {

                    const guide = firstNode.config.guide || {};

                    const colorScale = firstNode.getScale('color');
                    const dataSource = self
                        ._chart
                        .getDataSources({excludeFilter: ['legend']});

                    let domain = utils.unique(dataSource[colorScale.source].data
                        .map(x => x[colorScale.dim]));

                    const colorScaleConfig = self._chart.getSpec().scales[c];
                    const isDate = isDateDomain(domain);

                    if (colorScaleConfig.order) {
                        domain = utils.union(utils.intersection(colorScaleConfig.order, domain), domain);
                    } else if (colorScaleConfig.dimType === 'order' && isDate) {
                        domain = domain.sort((a, b) => new Date(a) - new Date(b));
                    } else {
                        const orderState = self._legendOrderState[c];
                        domain = domain.sort((a, b) => {
                            const diff = orderState[a] - orderState[b];
                            return (diff && (diff / Math.abs(diff)));
                        });
                    }

                    const title = ((guide.color || {}).label || {}).text || colorScale.dim;
                    const noVal = ((guide.color || {}).tickFormatNullAlias || (`No ${title}`));

                    const format = self._getFormat(colorScale.dim);

                    let legendColorItems = domain.map(d => {
                        const val = JSON.stringify(isEmpty(d) ? null : d);
                        const key = colorScale.dim + val;

                        return {
                            scaleId: c,
                            dim: colorScale.dim,
                            color: colorScale(d),
                            disabled: self._currentFilters.hasOwnProperty(key),
                            label: format(d),
                            value: val
                        };
                    });
                    legendColorsInfo[c] = {
                        legendColorItems,
                        title,
                        colorScale,
                        noVal,
                    };
                }
                return legendColorsInfo;
            }, {});
        },
        _drawColorLegend() {
            const self = this;
            const legendColorByScales = this._getLegendColorByScales();
            Object.keys(legendColorByScales).forEach((key) => {
                const {legendColorItems, title, colorScale, noVal} = legendColorByScales[key];
                self._container
                    .insertAdjacentHTML('beforeend', self._template({
                        name: title,
                        top: self._resetTemplate({
                            classDisabled: (legendColorItems.some(function (d) {
                                return d.disabled;
                            }) ? '' : 'disabled')
                        }),
                        items: legendColorItems
                            .map(function (d) {
                                return self._itemTemplate({
                                    scaleId: d.scaleId,
                                    dim: utils.escape(d.dim),
                                    color: d.color,
                                    cssClass: (colorScale.toClass(d.color)),
                                    cssColor: (d.disabled ? 'transparent' : colorScale.toColor(d.color)),
                                    borderColor: colorScale.toColor(d.color),
                                    classDisabled: d.disabled ? 'disabled' : '',
                                    label: utils.escape(isEmpty(d.label) ? noVal : d.label),
                                    value: utils.escape(d.value)
                                });
                            })
                            .join('')
                    }));
            });

            if (self._color.length > 0) {
                self._updateResetButtonPosition();
                self._scrollTimeout = null;
                self._scrollListener = () => {
                    const reset = self._container.querySelector(RESET_SELECTOR);
                    reset.style.display = 'none';
                    if (self._scrollTimeout) {
                        clearTimeout(self._scrollTimeout);
                    }
                    self._scrollTimeout = setTimeout(() => {
                        self._updateResetButtonPosition();
                        reset.style.display = '';
                        self._scrollTimeout = null;
                    }, 250);
                };
                self._getScrollContainer().addEventListener('scroll', self._scrollListener);
            }
        },

        _toggleLegendItem(target, mode) {
            const filters = this._currentFilters;
            const colorNodes = (target ? Array.prototype.filter.call(
                target.parentNode.childNodes,
                el => el.matches(COLOR_ITEM_SELECTOR)
            ) : null);

            const getColorData = node => {
                const dim = node.getAttribute('data-dim');
                const val = node.getAttribute('data-value');
                return {
                    sid: node.getAttribute('data-scale-id'),
                    dim,
                    val,
                    key: (dim + val)
                };
            };
            const isColorHidden = key => key in filters;
            const toggleColor = (node, show) => {
                const data = getColorData(node);
                if (isColorHidden(data.key) !== show) {
                    return;
                }
                if (show) {
                    const filterId = filters[data.key];
                    delete filters[data.key];
                    node.classList.remove('disabled');
                    this._chart.removeFilter(filterId);
                } else {
                    node.classList.add('disabled');
                    const isRowMatch = createIsRowMatchInterceptor(data.dim, data.val);
                    filters[data.key] = this._chart.addFilter({
                        tag: 'legend',
                        predicate(row) {
                            return !isRowMatch(row);
                        }
                    });
                }
            };
            const isTarget = node => node === target;
            const isTargetHidden = (target ? isColorHidden(getColorData(target).key) : false);

            const setGuideBackground = (node, visible) => {
                node.querySelector('.tau-chart__legend__guide')
                    .style.backgroundColor = (visible ? '' : 'transparent');
            };

            if (mode === 'reset') {
                colorNodes.forEach(node => {
                    toggleColor(node, true);
                    setGuideBackground(node, true);
                });
            } else if (mode === 'leave-others') {
                colorNodes.forEach(node => {
                    if (isTarget(node)) {
                        toggleColor(node, isTargetHidden);
                    }
                });
                setGuideBackground(target, isTargetHidden);
            } else if (mode === 'focus-single') {
                const onlyTargetIsVisible = (
                    !isTargetHidden && colorNodes.every(node => isTarget(node) || isColorHidden(getColorData(node).key))
                );
                colorNodes.forEach(node => {
                    const show = (isTarget(node) || onlyTargetIsVisible);
                    toggleColor(node, show);
                });
                if (isTargetHidden) {
                    setGuideBackground(target, true);
                }
            }
            const selectedCategories = colorNodes
                .filter((node) => !isColorHidden(getColorData(node).key))
                .map((node) => JSON.parse(getColorData(node).val));
            settings.onSelect({
                selectedCategories: selectedCategories
            });
            this._chart.refresh();
        },

        _highlightToggle(target, doHighlight) {

            if (target.matches('.disabled')) {
                return;
            }

            // var scaleId = target.getAttribute('data-scale-id');
            const dim = target.getAttribute('data-dim');
            const val = target.getAttribute('data-value');

            const isRowMatch = doHighlight ?
                (createIsRowMatchInterceptor(dim, val)) :
                (row => null);

            this._chart
                .select(unit => // return unit.config.color === scaleId;
                    // use all found elements
                    true)
                .forEach(unit => {
                    unit.fire('highlight', isRowMatch);
                });
        },

        _getScrollContainer() {
            return this._container.parentNode.parentNode;
        },

        _updateResetButtonPosition() {
            const reset = this._container.querySelector(RESET_SELECTOR);
            reset.style.top = `${this._getScrollContainer().scrollTop}px`;
        },

        _generateColorMap(domain, defBrewer) {

            const limit = defBrewer.length; // 20;

            return domain.reduce((memo, val, i) => {
                    memo[val] = defBrewer[i % limit];
                    return memo;
                },
                {});
        },

        _assignStaticBrewersOrEx() {
            const self = this;
            self._color.forEach(c => {
                const scaleConfig = self
                    ._chart
                    .getSpec()
                    .scales[c];

                const fullLegendDataSource = self
                    ._chart
                    .getDataSources({excludeFilter: ['legend']});

                const fullLegendDomain = self
                    ._chart
                    .getScaleFactory(fullLegendDataSource)
                    .createScaleInfoByName(c)
                    .domain();

                if (!scaleConfig.brewer || Array.isArray(scaleConfig.brewer)) {
                    const defBrewer = scaleConfig.brewer || utils.range(20).map(i => `color20-${1 + i}`);
                    scaleConfig.brewer = self._generateColorMap(fullLegendDomain, defBrewer);
                }

                self._legendOrderState[c] = fullLegendDomain.reduce((memo, x, i) => {
                    memo[x] = i;
                    return memo;
                }, {});
            });
        }
    };
}

Taucharts.api.plugins.add('legend', ChartLegend);

export default ChartLegend;
