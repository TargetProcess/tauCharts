import {api} from 'taucharts';
import {timeFormat as d3TimeFormat} from 'd3-time-format';
import * as d3Selection from 'd3-selection';
const {
    utils,
    pluginsSDK,
    d3_animationInterceptor: createUpdateFunc
} = api;

const defaultRangeFormatter = function formatRange(dateRange) {

    const d0 = d3.timeFormat('%d')(dateRange[0]);
    const d1 = d3.timeFormat('%d')(dateRange[1]);

    const m0 = d3.timeFormat('%b')(dateRange[0]);
    const m1 = d3.timeFormat('%b')(dateRange[1]);

    const y0 = d3.timeFormat('%Y')(dateRange[0]);
    const y1 = d3.timeFormat('%Y')(dateRange[1]);

    const date0 = `${d0}${m0 === m1 ? '' : ` ${m0}`}${y0 === y1 ? '' : ` ${y0}`}`;
    const date1 = `${d1} ${m1} ${y1}`;

    return `${date0}&ndash;${date1}`;
};

function findRangeValue(xIndex, x) {
    const nextItem = xIndex.find((r) => r.pos >= x) || xIndex[xIndex.length - 1];
    const prevIndex = nextItem.ind > 0 ? (nextItem.ind - 1) : nextItem.ind;
    const prevItem = xIndex[prevIndex];
    return [prevItem.val, nextItem.val];
}

function filterValuesStack(data, screenModel, x) {
    return data.filter((row) => String(row[screenModel.model.scaleX.dim]) === String(x));
}

function areRangesEqual(r1, r2) {
    return (
        Number(r1[0]) === Number(r2[0]) &&
        Number(r1[1]) === Number(r2[1])
    );
}

function drawRect(container, className, props) {

    const animationSpeed = props.hasOwnProperty('animationSpeed') ? props.animationSpeed : 0;

    const rect = container
        .selectAll(`.${className}`)
        .data([1]);
    rect.exit()
        .remove();
    rect.call(createUpdateFunc(animationSpeed, null, props));
    const enter = rect.enter()
        .append('rect')
        .attr('class', className)
        .call(createUpdateFunc(animationSpeed, {width: 0}, props));

    return rect.merge(enter);
}

const ELEMENT_HIGHLIGHT = 'ELEMENT.INTERVAL_HIGHLIGHT';

const IntervalHighlight = {

    addInteraction() {
        const node = this.node();
        this.cover = null;
        this.activeRange = [];
        node.on('range-blur', () => {
            this.activeRange = [];
            drawRect(this.cover, 'interval-highlight__cursor', {width: 0});
        });
    },

    prepareData(data, screenModel) {
        var groups = utils.groupBy(this.node().data(), screenModel.group);
        return Object
            .keys(groups)
            .sort(function(a, b) {
                return screenModel.order(a) - screenModel.order(b);
            })
            .reduce(function(memo, k, i) {
                return memo.concat([groups[k]]);
            }, [])
            .reduce(function(memo, fiber) {
                fiber.forEach(function(row) {
                    screenModel.y(row);
                    screenModel.y0(row);
                });
                return memo.concat(fiber);
            }, []);
    },

    createXIndex: function(data, screenModel) {
        return utils.unique(data.map(function(x) {
            return x[screenModel.model.scaleX.dim];
        }), String)
            .sort(function(x1, x2) {
                return x1 - x2;
            })
            .map(function(date, i) {
                return {
                    ind: i,
                    val: date,
                    pos: screenModel.model.scaleX.value(date)
                };
            });
    },

    draw() {

        const node = this.node();
        const screenModel = node.screenModel;
        const cfg = node.config;
        const container = cfg.options.slot(cfg.uid);

        const data = this.prepareData(node.data(), screenModel);
        const xIndex = this.createXIndex(data, screenModel);

        const drawCover = (selection) => {

            const element = this;

            drawRect(selection, 'interval-highlight__cursor', {
                class: 'interval-highlight__cursor',
                x: 0,
                y: 0,
                width: 0,
                height: cfg.options.height,
                animationSpeed: 0
            });

            const rect = drawRect(selection, 'interval-highlight__cover-rect', {
                class: 'interval-highlight__cover-rect',
                x: 0,
                y: 0,
                width: cfg.options.width,
                height: cfg.options.height,
                animationSpeed: 0
            });

            // Todo: Use chart pointer events.

            const getPointer = () => {
                const domEvent = d3.event;
                const mouseCoords = d3.mouse(domEvent.target);
                const e = {
                    x: mouseCoords[0],
                    y: mouseCoords[1],
                    pageX: domEvent.pageX,
                    pageY: domEvent.pageY
                };
                return e;
            };

            const getRange = (pointer) => {
                const range = findRangeValue(xIndex, pointer.x);
                return range;
            };

            const getStacks = (range, pointer) => {
                const [prevValue, nextValue] = range;
                const nextValues = filterValuesStack(data, screenModel, nextValue);
                const prevValues = filterValuesStack(data, screenModel, prevValue);

                const propY = screenModel.model.scaleY.dim;
                const propCategory = screenModel.model.scaleColor.dim;

                const prevStack = prevValues.reduce(
                    (memo, item) => {
                        memo[item[propCategory]] = item[propY];
                        return memo;
                    },
                    {date: prevValue});

                const nextStack = nextValues.reduce(
                    (memo, item) => {
                        memo[item[propCategory]] = item[propY];
                        return memo;
                    },
                    {date: nextValue});

                return {
                    data: nextStack,
                    prev: prevStack,
                    event: pointer
                };
            };

            const animationFrameId = null;
            const wrapIntoAnimationFrame = function(handler) {
                return function() {
                    const pointer = getPointer();
                    if (!animationFrameId) {
                        animationFrameId = requestAnimationFrame(() => {
                            handler.call(this, pointer);
                            animationFrameId = null;
                        })
                    }
                };
            };

            rect.on('mouseleave', () => {
                node.fire('range-blur');
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            });

            rect.on('mousemove', wrapIntoAnimationFrame(function(e) {

                const range = getRange(e);

                if (areRangesEqual(element.activeRange, range)) {

                    node.fire('range-active', {
                        data: range,
                        event: e
                    });

                    return;
                }

                element.activeRange = range;

                const prevX = screenModel.model.scaleX(range[0]);
                const nextX = screenModel.model.scaleX(range[1]);

                drawRect(selection, 'interval-highlight__cursor', {
                    x: prevX,
                    width: nextX - prevX,
                    animationSpeed: 0
                });

                node.fire('range-changed', getStacks(range, e));
            }));

            rect.on('click', function() {

                const e = getPointer();
                const range = getRange(e);

                node.fire('range-focus', getStacks(range, e));
            });
        };

        const cover = container
            .selectAll('.interval-highlight__cover')
            .data([1]);
        cover
            .exit()
            .remove();
        cover
            .call(drawCover);
        const enter = cover
            .enter()
            .append('g')
            .attr('class', 'interval-highlight__cover')
            .call(drawCover);

        this.cover = cover.merge(enter);
    }
};

api.unitsRegistry.reg(
    ELEMENT_HIGHLIGHT,
    IntervalHighlight,
    'ELEMENT.GENERIC.CARTESIAN');

const html = utils.xml;

const tooltipTemplate = ({dateRange, diffDays, items}) => (
    html('div', {class: 'interval-highlight-tooltip'},
        html('div', {class: 'interval-highlight-tooltip__header'},
            html('span', {class: 'interval-highlight-tooltip__header__date-range'},
                dateRange
            ),
            html('span',
                diffDays
            )
        ),
        html('table',
            {
                cellpadding: 0,
                cellspacing: 0,
                border: 0
            },
            ...items.map(tooltipItemTemplate)
        )
    )
);
const tooltipItemTemplate = ({name, width, color, diff, value}) => (
    html('tr', {class: 'interval-highlight-tooltip__item'},
        html('td', name),
        html('td',
            html('div',
                {
                    class: 'interval-highlight-tooltip__item__value',
                    style: `width: ${width}px; background-color: ${color};`
                },
                String(parseFloat((value).toFixed(2)))
            )
        ),
        html('td',
            {
                class: [
                    'interval-highlight-tooltip__item__arrow',
                    `interval-highlight-tooltip__item__arrow_${diff > 0 ? 'positive' : 'negative'}`
                ].join(' '),
            },
            html('div', {class: 'interval-highlight-tooltip__item__arrow__val'},
                html('span', {class: 'interval-highlight-tooltip__item__arrow__dir'},
                    (diff > 0 ? '&#x25B2;' : diff < 0 ? '&#x25BC;' : ''),
                    (diff === 0 ? '' : String(parseFloat((Math.abs(diff)).toFixed(2))))
                )
            )
        )
    )
);

const IntervalTooltip = (pluginSettings = {}) => {

    const formatRange = pluginSettings.rangeFormatter || defaultRangeFormatter;

    return {

        init(chart) {
            this._chart = chart;
            this._tooltip = this._chart.addBalloon(
                {
                    spacing: 24,
                    place: 'bottom-right',
                    auto: true,
                    effectClass: 'fade'
                });
        },

        destroy() {
            this._tooltip.destroy();
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

                unit.guide = utils.defaults(unit.guide || {}, {
                    showAnchors: 'never'
                });

                parentUnit.units.push(over);
            });
        },

        getContent(dateRange, states) {
            const formattedDateRange = formatRange(dateRange);
            const dateDiff = Math.round((dateRange[1] - dateRange[0]) / 1000 / 60 / 60 / 24);
            const max = Math.max(...states.map(function(state) {
                return state['value'];
            }));

            states.forEach(state => {
                state.width = 80 * state.value / max;
            });

            var formatDays = 'day';
            var diffStr = String(dateDiff);
            if (diffStr[diffStr.length - 1] !== '1') {
                formatDays += 's';
            }

            return tooltipTemplate({
                dateRange: formattedDateRange,
                items: states,
                diffDays: `(${dateDiff} ${formatDays})`
            });
        },

        onRender(chart) {
            const info = pluginsSDK.extractFieldsFormatInfo(chart.getSpec());

            this._tooltip.hide();

            const node = chart.select((node) => node.config.type === ELEMENT_HIGHLIGHT)[0];
            this.node = node;

            const hideTooltip = () => {
                this._tooltip.hide();
            };

            const showTooltip = (unit, e) => {
                const scaleColor = unit.screenModel.model.scaleColor;
                const categories = scaleColor.domain();
                const states = categories
                    .map((cat) => {
                        const curr = e.data[cat] || 0;
                        const prev = e.prev[cat] || 0;
                        return {
                            name: info[scaleColor.dim].format(cat || null, info[scaleColor.dim].nullAlias),
                            color: scaleColor.value(cat),
                            value: curr,
                            diff: curr - prev
                        };
                    })
                    .reverse();

                this._tooltip
                    .content(this.getContent([e.prev.date, e.data.date], states))
                    .show(e.event.pageX, e.event.pageY);
            };

            const updateTooltip = (e) => {
                this._tooltip
                    .position(e.event.pageX, e.event.pageY);
            };

            const onClick = (sender, e) => {
                if (pluginSettings.onClick) {
                    pluginSettings.onClick.call(null, sender, e);
                }
            };

            node.on('range-changed', (sender, e) => showTooltip(sender, e));
            node.on('range-blur', () => hideTooltip());
            node.on('range-focus', (sender, e) => onClick(sender, e));
            node.on('range-active', (sender, e) => updateTooltip(e));
        }
    };
};

api.plugins.add('interval-highlight', IntervalTooltip);

export default IntervalTooltip;
