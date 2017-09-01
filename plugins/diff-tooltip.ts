import Taucharts from 'taucharts';
import Tooltip, {TooltipSettings} from './tooltip/tooltip-base';
import getDiffTemplate, {DIFF_TOOLTIP_CLS, HEADER_CLS, ROW_CLS} from './diff-tooltip/diff-template';
import IntervalHighlight, {ELEMENT_HIGHLIGHT} from './diff-tooltip/interval-highlight';
import {
    GPLSpec,
    GrammarElement,
    Plot,
    PluginObject,
    ScreenModel,
} from '../src/definitions';

const utils = Taucharts.api.utils;

interface GroupedData {
    [x: string]: {
        [g: string]: any[];
    };
}

class DiffTooltip extends Tooltip {

    onSpecReady: (chart: Plot, specRef: GPLSpec) => void;

    constructor(settings) {
        super(settings);
        this.onSpecReady = this._getSpecReadyHandler();
    }

    _unitsGroupedData: Map<GrammarElement, GroupedData>;

    init(chart) {
        super.init(chart);
        this._unitsGroupedData = new Map();
    }

    _getTemplate() {
        const defaultTemplate = getDiffTemplate(this, this.settings);
        if (typeof this.settings.getTemplate === 'function') {
            return this.settings.getTemplate(defaultTemplate, this, this.settings);
        }
        return defaultTemplate;
    }

    _renderTemplate(data, fields) {
        const unit = this.state.highlight.unit;
        const screenModel = unit.screenModel;
        const {scaleColor, scaleX, scaleY} = screenModel.model;

        const groupedData = this._unitsGroupedData.get(unit);
        const [prevX, x] = this._getHighlightRange(data, unit);

        const getPrevItem = (d) => {
            const g = screenModel.model.group(d);
            const hasPrevItem = (isFinite(prevX) && groupedData[prevX][g]);
            // Note: If there are more than 1 items per X, the result is unpredictable.
            return (hasPrevItem ? groupedData[prevX][g][0] : null);
        };
        const prev = getPrevItem(data);

        // Note: Sort stacked elements by color, other by Y
        const shouldSortByColor = unit.config.stack;
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

        const getNeighbors = (x) => {
            return Object.keys(groupedData[x])
                .reduce((arr, g) => arr.concat(groupedData[x][g]), [])
                .sort(shouldSortByColor ? sortByColor : sortByY);
        };

        const neighbors = getNeighbors(x);

        const groups = neighbors.map((data) => {
            const g = screenModel.model.group(data);
            const prev = getPrevItem(data);
            return {
                data,
                prev
            };
        });

        if (isFinite(prevX)) {
            // Note: Should also display data for missing group
            // if it is available for previous X
            const prevNeighbors = getNeighbors(prevX);
            const gs = groups.reduce((map, g) => {
                map[screenModel.model.group(g.data)] = true;
                return map;
            }, {});
            prevNeighbors.forEach((prev) => {
                const g = screenModel.model.group(prev);
                if (!gs[g]) {
                    groups.push({
                        data: null,
                        prev
                    });
                }
            });
            if (shouldSortByColor) {
                groups.sort((a, b) => sortByColor(a.data || a.prev, b.data || b.prev));
            }
        }

        return this._template.render({
            data,
            prev,
            fields,
            groups,
            valueField: scaleY.dim,
            colorField: scaleColor.dim
        });
    }

    _getRenderHandler() {
        const baseOnRender = super._getRenderHandler();
        return function (this: DiffTooltip) {
            baseOnRender.call(this);

            const chart = this._chart;

            const units = chart.select((u) => {
                return (
                    (u.config.namespace === 'chart') &&
                    (u.config.type.indexOf('ELEMENT.') === 0) &&
                    (u.config.type !== ELEMENT_HIGHLIGHT)
                );
            });
            const highlights = chart.select((u) => u.config.type === ELEMENT_HIGHLIGHT);
            const highlightsMap = highlights.reduce((map, h, i) => {
                map[i] = h;
                return map;
            }, {});

            units.forEach((u, i) => {
                const data = u.data();
                this._unitsGroupedData.set(u, this._getGroupedData(data, u));
                u.on('data-hover', (sender, e) => {
                    const highlight = highlightsMap[i];
                    const isTarget = (e.unit && e.unit === u);
                    const range = (isTarget ? this._getHighlightRange(e.data, e.unit) : null);
                    highlight.fire('interval-highlight', range);
                });
            });
        };
    }

    _getSpecReadyHandler() {
        return function (this: DiffTooltip, chart: Plot, specRef: GPLSpec) {
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
        };
    }

    _getGroupedData(data, unit: GrammarElement) {
        const scaleX = unit.screenModel.model.scaleX;
        const groupByX = utils.groupBy(data, (d) => scaleX(d[scaleX.dim]).toString());
        const xPeriod = (unit.config.guide.x.tickPeriod || unit.config.guide.x.timeInterval);
        if (xPeriod) {
            const domain = scaleX.domain();
            const utc = unit.config.guide.utcTime;
            const periods = Taucharts.api.tickPeriod
                .generate(domain[0], domain[1], xPeriod, {utc})
                .filter((t) => t >= domain[0] && t <= domain[1]);
            periods.forEach((t) => {
                const tx = scaleX(t);
                if (!groupByX[tx]) {
                    groupByX[tx] = [];
                }
            });
        }
        const groupByXAndGroup = Object.keys(groupByX).reduce((map, x) => {
            map[x] = utils.groupBy(groupByX[x], (d) => unit.screenModel.model.group(d));
            return map;
        }, {} as GroupedData);
        return groupByXAndGroup;
    }

    _getHighlightRange(data, unit: GrammarElement) {
        const flip = unit.screenModel.flip;
        const scaleX = unit.screenModel.model.scaleX;
        const x = scaleX(data[scaleX.dim]);
        const groupedData = this._unitsGroupedData.get(unit);
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
}

function DiffTooltipPlugin(settings: TooltipSettings) {
    return new DiffTooltip(settings);
}

Taucharts.api.unitsRegistry.reg(
    ELEMENT_HIGHLIGHT,
    IntervalHighlight,
    'ELEMENT.GENERIC.CARTESIAN');

Taucharts.api.plugins.add('diff-tooltip', DiffTooltipPlugin);

export default DiffTooltipPlugin;
