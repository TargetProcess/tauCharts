import {Tooltip} from '../api/balloon';
import {Emitter} from '../event';
import {Plugins} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {d3_transition as transition} from '../utils/d3-decorators';
import {GrammarRegistry} from '../grammar-registry';
import {unitsRegistry} from '../units-registry';
import {scalesRegistry} from '../scales-registry';
import {ScalesFactory} from '../scales-factory';
import {DataProcessor} from '../data-processor';
import WeakMap from 'core-js/library/fn/weak-map';
import {getLayout} from '../utils/layuot-template';
import {SpecConverter} from '../spec-converter';
import {SpecTransformAutoLayout} from '../spec-transform-auto-layout';

import {SpecTransformCalcSize} from '../spec-transform-calc-size';
import {SpecTransformApplyRatio} from '../spec-transform-apply-ratio';
import {SpecTransformExtractAxes} from '../spec-transform-extract-axes';
import {CSS_PREFIX} from '../const';

import {GPL} from './tau.gpl';
import d3 from 'd3';
import TaskRunner from './task-runner';
var selectOrAppend = utilsDom.selectOrAppend;
var selectImmediate = utilsDom.selectImmediate;

export class Plot extends Emitter {
    constructor(config) {
        super();
        this._nodes = [];
        this._svg = null;
        this._filtersStore = {
            filters: {},
            tick: 0
        };
        this._layout = getLayout();

        var iref = 0;
        config.settings = Plot.setupSettings(utils.defaults(
            (config.settings || {}),
            {
                references: new WeakMap(),
                refCounter: (() => (++iref))
            }
        ));

        if (['sources', 'scales'].filter((p) => config.hasOwnProperty(p)).length === 2) {
            this.configGPL = config;
        } else {
            this.configGPL = new SpecConverter(this.setupConfig(config)).convert();
        }

        this.configGPL = Plot.setupPeriodData(this.configGPL);

        var plugins = (config.plugins || []);

        this.transformers = [
            SpecTransformApplyRatio,
            SpecTransformAutoLayout
        ];

        this.onUnitsStructureExpandedTransformers = [
            SpecTransformExtractAxes,
            SpecTransformCalcSize
        ];

        this._originData = Object.assign({}, this.configGPL.sources);
        this._chartDataModel = (src => src);
        this._liveSpec = this.configGPL;
        this._plugins = new Plugins(plugins, this);

        this._reportProgress = null;
        this._taskRunner = null;
        this._renderingPhase = null;
        this._pointerEnentsEnabled = true;
    }

    destroy() {
        this.destroyNodes();
        d3.select(this._svg).remove();
        d3.select(this._layout.layout).remove();
        this._cancelRendering();
        super.destroy();
    }

    setupChartSourceModel(fnModelTransformation) {
        this._chartDataModel = fnModelTransformation;
    }

    setupConfig(config) {

        if (!config.spec || !config.spec.unit) {
            throw new Error('Provide spec for plot');
        }

        var resConfig = utils.defaults(
            config,
            {
                spec: {},
                data: [],
                plugins: [],
                settings: {}
            });

        this._emptyContainer = config.emptyContainer || '';

        resConfig.spec.dimensions = Plot.setupMetaInfo(resConfig.spec.dimensions, resConfig.data);

        var log = resConfig.settings.log;
        if (resConfig.settings.excludeNull) {
            this.addFilter({
                tag: 'default',
                src: '/',
                predicate: DataProcessor.excludeNullValues(
                    resConfig.spec.dimensions,
                    (item) => log([item, 'point was excluded, because it has undefined values.'], 'WARN')
                )
            });
        }

        return resConfig;
    }

    static setupPeriodData(spec) {
        var tickPeriod = Plot.__api__.tickPeriod;
        var log = spec.settings.log;

        var scales = Object
            .keys(spec.scales)
            .map(s => spec.scales[s]);

        var workPlan = scales
            .filter(s => (s.type === 'period'))
            .reduce((memo, scaleRef) => {
                var periodCaster = tickPeriod.get(scaleRef.period, {utc: spec.settings.utcTime});
                if (periodCaster) {
                    memo.push({source: scaleRef.source, dim: scaleRef.dim, period: periodCaster});
                } else {
                    log([
                        `Unknown period "${scaleRef.period}".`,
                        `Docs: http://api.taucharts.com/plugins/customticks.html#how-to-add-custom-tick-period`
                    ], 'WARN');
                    scaleRef.period = null;
                }

                return memo;
            }, []);

        var isNullOrUndefined = ((x) => ((x === null) || (x === undefined)));

        var reducer = (refSources, metaDim) => {
            refSources[metaDim.source].data = refSources[metaDim.source]
                .data
                .map(row => {
                    var val = row[metaDim.dim];
                    if (!isNullOrUndefined(val)) {
                        row[metaDim.dim] = metaDim.period.cast(val);
                    }
                    return row;
                });

            return refSources;
        };

        spec.sources = workPlan.reduce(reducer, spec.sources);

        return spec;
    }

    static setupMetaInfo(dims, data) {
        var meta = (dims) ? dims : DataProcessor.autoDetectDimTypes(data);
        return DataProcessor.autoAssignScales(meta);
    }

    static setupSettings(configSettings) {
        var globalSettings = Plot.globalSettings;
        var localSettings = Object
            .keys(globalSettings)
            .reduce((memo, k) => {
                memo[k] = (typeof globalSettings[k] === 'function') ?
                    globalSettings[k] :
                    utils.clone(globalSettings[k]);
                return memo;
            }, {});

        var r = utils.defaults(configSettings || {}, localSettings);

        if (!Array.isArray(r.specEngine)) {
            r.specEngine = [{width: Number.MAX_VALUE, name: r.specEngine}];
        }

        return r;
    }

    insertToLeftSidebar(el) {
        return utilsDom.appendTo(el, this._layout.leftSidebar);
    }

    insertToRightSidebar(el) {
        return utilsDom.appendTo(el, this._layout.rightSidebar);
    }

    insertToFooter(el) {
        return utilsDom.appendTo(el, this._layout.footer);
    }

    insertToHeader(el) {
        return utilsDom.appendTo(el, this._layout.header);
    }

    addBalloon(conf) {
        return new Tooltip('', conf || {});
    }

    destroyNodes() {
        this._nodes.forEach((node) => node.destroy());
        this._nodes = [];
        this._renderedItems = [];
    }

    onUnitDraw(unitNode) {
        this._nodes.push(unitNode);
        this.fire('unitdraw', unitNode);
        ['click', 'mouseover', 'mouseout']
            .forEach((eventName) => unitNode.on(
                (eventName),
                (sender, e) => {
                    this.fire(
                        `element${eventName}`,
                        {
                            element: sender,
                            data: e.data,
                            event: e.event
                        }
                    );
                }));
    }

    onUnitsStructureExpanded(specRef) {
        this.onUnitsStructureExpandedTransformers
            .forEach((TClass) => (new TClass(specRef)).transform(this));
        this.fire(['units', 'structure', 'expanded'].join(''), specRef);
    }

    _getClosestElementPerUnit(x0, y0) {
        return this._renderedItems
            .filter((d) => d.getClosestElement)
            .map((item) => {
                var closest = item.getClosestElement(x0, y0);
                var unit = item.node();
                return {unit, closest};
            });
    }

    disablePointerEvents() {
        this._pointerEnentsEnabled = false;
        this._layout.layout.style.pointerEvents = 'none';
    }

    enablePointerEvents() {
        this._pointerEnentsEnabled = true;
        this._layout.layout.style.pointerEvents = '';
    }

    _handlePointerEvent(event) {
        // TODO: Highlight API seems not consistent.
        // Just predicate is not enough, also
        // need coordinates or event object.
        const svgRect = this._svg.getBoundingClientRect();
        const x = (event.clientX - svgRect.left);
        const y = (event.clientY - svgRect.top);
        const eventType = event.type;
        const isClick = (eventType === 'click');
        const dataEvent = (isClick ? 'data-click' : 'data-hover');
        var data = null;
        var node = null;
        const items = this._getClosestElementPerUnit(x, y);
        const nonEmpty = items
            .filter((d) => d.closest)
            .sort((a, b) => (a.closest.distance === b.closest.distance ?
                (a.closest.secondaryDistance - b.closest.secondaryDistance) :
                (a.closest.distance - b.closest.distance)));
        if (nonEmpty.length > 0) {
            const largerDistIndex = nonEmpty.findIndex((d) => (
                (d.closest.distance !== nonEmpty[0].closest.distance) ||
                (d.closest.secondaryDistance !== nonEmpty[0].closest.secondaryDistance)
            ));
            const sameDistItems = (largerDistIndex < 0 ? nonEmpty : nonEmpty.slice(0, largerDistIndex));
            if (sameDistItems.length === 1) {
                data = sameDistItems[0].closest.data;
                node = sameDistItems[0].closest.node;
            } else {
                const mx = (sameDistItems.reduce((sum, item) => sum + item.closest.x, 0) / sameDistItems.length);
                const my = (sameDistItems.reduce((sum, item) => sum + item.closest.y, 0) / sameDistItems.length);
                const angle = (Math.atan2(my - y, mx - x) + Math.PI);
                const {closest} = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)];
                data = closest.data;
                node = closest.node;
            }
        }

        items.forEach((item) => item.unit.fire(dataEvent, {event, data, node}));
    }

    _initPointerEvents() {
        if (!this._liveSpec.settings.syncPointerEvents) {
            this._pointerAnimationFrameId = null;
        }
        const svg = d3.select(this._svg);
        const wrapEventHandler = (this._liveSpec.settings.syncPointerEvents ?
            ((handler) => () => handler(d3.event)) :
            ((handler) => (() => {
                var e = d3.event;
                if (this._pointerAnimationFrameId && e.type !== 'mousemove') {
                    this._cancelPointerAnimationFrame();
                }
                if (!this._pointerAnimationFrameId) {
                    this._pointerAnimationFrameId = requestAnimationFrame(() => {
                        this._pointerAnimationFrameId = null;
                        handler(e);
                    });
                }
            }))
        );
        const handler = ((e) => this._handlePointerEvent(e));
        svg.on('mousemove', wrapEventHandler(handler));
        svg.on('click', wrapEventHandler(handler));
        svg.on('mouseleave', wrapEventHandler((event) => {
            if (window.getComputedStyle(this._svg).pointerEvents !== 'none') {
                this.select(() => true)
                    .forEach((unit) => unit.fire('data-hover', {event, data: null, node: null}));
            }
        }));
    }

    _cancelPointerAnimationFrame() {
        cancelAnimationFrame(this._pointerAnimationFrameId);
        this._pointerAnimationFrameId = null;
    }

    _setupTaskRunner() {
        this._resetTaskRunner();
        this._taskRunner = new TaskRunner({
            timeout: (this._liveSpec.settings.renderingTimeout || Number.MAX_SAFE_INTEGER),
            syncInterval: (this._liveSpec.settings.asyncRendering ?
                this._liveSpec.settings.syncRenderingInterval :
                Number.MAX_SAFE_INTEGER),
            callbacks: {
                done: () => {
                    this._completeRender();
                    this._renderingPhase = null;
                },
                timeout: (timeout) => {
                    this._displayTimeoutWarning({
                        timeout,
                        proceed: () => {
                            this.disablePointerEvents();
                            this._taskRunner.setTimeout(Number.MAX_SAFE_INTEGER);
                            this._taskRunner.run();
                        },
                        cancel: () => {
                            this._cancelRendering();
                        }
                    });
                    this.enablePointerEvents();
                    this.fire('renderingtimeout');
                },
                progress: (progress) => {
                    var phases = {
                        spec: 0,
                        draw: 1
                    };
                    var p = (phases[this._renderingPhase] / 2 + progress / 2);
                    this._reportProgress(p);
                },
                error: (this._liveSpec.settings.handleRenderingErrors ?
                    ((err) => {
                        this._cancelRendering();
                        this._displayRenderingError(err);
                        this.fire('renderingerror', err);
                        if (this._liveSpec.settings.asyncRendering) {
                            this._liveSpec.settings.log(
                                `An arror occured during chart rendering: ${err.message}`,
                                'ERROR'
                            );
                        } else {
                            throw err;
                        }
                    }) :
                    null)
            }
        });
    }

    _resetTaskRunner() {
        if (this._taskRunner && this._taskRunner.isRunning()) {
            this._taskRunner.stop();
            this._taskRunner = null;
        }
    }

    renderTo(target, xSize) {
        this.disablePointerEvents();
        this._target = target;
        this._defaultSize = Object.assign({}, xSize);

        var targetNode = d3.select(target).node();
        if (targetNode === null) {
            throw new Error('Target element not found');
        }

        if (this._layout.layout.parentNode !== targetNode) {
            targetNode.appendChild(this._layout.layout);
        }

        var content = this._layout.content;

        // Set padding to fit scrollbar size
        var s = utilsDom.getScrollbarSize(this._layout.contentContainer);
        this._layout.contentContainer.style.padding = `0 ${s.width}px ${s.height}px 0`;
        utilsDom.setScrollPadding(this._layout.rightSidebarContainer, 'vertical');

        var size = Object.assign({}, xSize) || {};
        if (!size.width || !size.height) {
            let {scrollLeft, scrollTop} = content.parentElement;
            content.style.display = 'none';
            size = utils.defaults(size, utilsDom.getContainerSize(content.parentNode));
            content.style.display = '';
            content.parentElement.scrollLeft = scrollLeft;
            content.parentElement.scrollTop = scrollTop;
            // TODO: fix this issue
            if (!size.height) {
                size.height = utilsDom.getContainerSize(this._layout.layout).height;
            }
        }

        this.configGPL.settings.size = size;

        this._liveSpec = utils.clone(utils.omit(this.configGPL, 'plugins'));
        this._liveSpec.sources = this.getDataSources();
        this._liveSpec.settings = this.configGPL.settings;

        if (this.isEmptySources(this._liveSpec.sources)) {
            content.innerHTML = this._emptyContainer;
            return;
        }

        this._liveSpec = this
            .transformers
            .reduce((memo, TransformClass) => (new TransformClass(memo).transform(this)), this._liveSpec);

        this.destroyNodes();

        this.fire('specready', this._liveSpec);

        var xGpl = new GPL(this._liveSpec, this.getScaleFactory(), unitsRegistry, GrammarRegistry);
        var structure = xGpl.unfoldStructure();

        this.onUnitsStructureExpanded(structure);

        var newSize = xGpl.config.settings.size;
        var d3Target = d3.select(content);

        this._resetProgressLayout();
        this._setupTaskRunner();

        this._renderingPhase = 'spec';
        xGpl.getDrawScenarioQueue({
            allocateRect: () => ({
                slot: ((uid) => d3Target.selectAll(`.uid_${uid}`)),
                frameId: 'root',
                left: 0,
                top: 0,
                width: newSize.width,
                containerWidth: newSize.width,
                height: newSize.height,
                containerHeight: newSize.height
            })
        }).forEach((task) => this._taskRunner.addTask(task));

        this._taskRunner.addTask((scenario) => {
            this._renderingPhase = 'draw';
            this._renderRoot({scenario, d3Target, newSize});
            this._cancelPointerAnimationFrame();
            this._scheduleRenderScenario(scenario);
        });

        this._taskRunner.run();
    }

    _resetProgressLayout() {
        this._createProgressBar();
        this._clearRenderingError();
        this._clearTimeoutWarning();
    }

    _renderRoot({scenario, d3Target, newSize}) {
        var frameRootId = scenario[0].config.uid;
        var svg = selectOrAppend(d3Target, `svg`).attr({
            width: Math.floor(newSize.width),
            height: Math.floor(newSize.height)
        });
        if (!svg.attr('class')) {
            svg.attr('class', `${CSS_PREFIX}svg`);
        }
        this._svg = svg.node();
        this._initPointerEvents();
        this.fire('beforerender', this._svg);
        var roots = svg.selectAll('g.frame-root')
            .data([frameRootId], x => x);

        // NOTE: Fade out removed root, fade-in if removing interrupted.
        roots.enter()
            .append('g')
            .classed(`${CSS_PREFIX}cell cell frame-root uid_${frameRootId}`, true);
        roots
            .call((selection) => {
                selection.classed('tau-active', true);
                transition(selection, this.configGPL.settings.animationSpeed, 'frameRootToggle')
                    .attr('opacity', 1);
            });
        roots.exit()
            .call((selection) => {
                selection.classed('tau-active', false);
                transition(selection, this.configGPL.settings.animationSpeed, 'frameRootToggle')
                    .attr('opacity', 1e-6)
                    .remove();
            });
    }

    _scheduleRenderScenario(scenario) {

        scenario.forEach((item) => {
            this._taskRunner.addTask(() => {
                item.draw();
                this.onUnitDraw(item.node());
                this._renderedItems.push(item);
            });
        });
    }

    _completeRender() {
        // TODO: Render panels before chart, to
        // prevent chart size shrink. Use some other event.
        utilsDom.setScrollPadding(this._layout.contentContainer);
        this._layout.rightSidebar.style.maxHeight = (`${this._liveSpec.settings.size.height}px`);
        this.enablePointerEvents();
        this.fire('render', this._svg);

        // NOTE: After plugins have rendered, the panel scrollbar may appear, so need to handle it again.
        utilsDom.setScrollPadding(this._layout.rightSidebarContainer, 'vertical');
    }

    _cancelRendering() {
        this._resetTaskRunner();
        this._cancelPointerAnimationFrame();
    }

    _createProgressBar() {
        var header = d3.select(this._layout.header);
        var progressBar = selectOrAppend(header, `div.${CSS_PREFIX}progress`);
        progressBar.select(`div.${CSS_PREFIX}progress__value`).remove();
        var progressValue = progressBar.append('div')
            .classed(`${CSS_PREFIX}progress__value`, true)
            .style('width', 0);
        this._reportProgress = function (value) {
            requestAnimationFrame(() => {
                progressBar.classed(`${CSS_PREFIX}progress_active`, value < 1);
                progressValue.style('width', `${value * 100}%`);
            });
        };
    }

    _displayRenderingError() {
        this._layout.layout.classList.add(`${CSS_PREFIX}layout_rendering-error`);
    }

    _clearRenderingError() {
        this._layout.layout.classList.remove(`${CSS_PREFIX}layout_rendering-error`);
    }

    getScaleFactory(dataSources = null) {
        return new ScalesFactory(
            scalesRegistry.instance(this._liveSpec.settings),
            dataSources || this._liveSpec.sources,
            this._liveSpec.scales
        );
    }

    getScaleInfo(name, dataFrame = null) {
        return this
            .getScaleFactory()
            .createScaleInfoByName(name, dataFrame);
    }

    getSourceFiltersIterator(rejectFiltersPredicate) {
        var filters = utils.flatten(Object.keys(this._filtersStore.filters).map(key => this._filtersStore.filters[key]))
            .filter((f) => !rejectFiltersPredicate(f))
            .map(x => x.predicate);

        return (row) => filters.reduce((prev, f) => (prev && f(row)), true);
    }

    getDataSources(param = {}) {
        var excludeFiltersByTagAndSource = (k) =>
            ((f) => (param.excludeFilter && param.excludeFilter.indexOf(f.tag) !== -1) || f.src !== k);

        var chartDataModel = this._chartDataModel(this._originData);

        return Object
            .keys(chartDataModel)
            .filter((k) => k !== '?')
            .reduce((memo, k) => {
                var item = chartDataModel[k];
                var filterIterator = this.getSourceFiltersIterator(excludeFiltersByTagAndSource(k));
                memo[k] = {
                    dims: item.dims,
                    data: item.data.filter(filterIterator)
                };
                return memo;
            },
            {
                '?': chartDataModel['?']
            });
    }

    isEmptySources(sources) {

        return !Object
            .keys(sources)
            .filter((k) => k !== '?')
            .filter((k) => sources[k].data.length > 0)
            .length;
    }

    getChartModelData(param = {}, src = '/') {
        var sources = this.getDataSources(param);
        return sources[src].data;
    }

    getDataDims(src = '/') {
        return this._originData[src].dims;
    }

    getData(src = '/') {
        return this._originData[src].data;
    }

    setData(data, src = '/') {
        this._originData[src].data = data;
        this.refresh();
    }

    getSVG() {
        return this._svg;
    }

    addFilter(filter) {
        filter.src = filter.src || '/';
        var tag = filter.tag;
        var filters = this._filtersStore.filters[tag] = this._filtersStore.filters[tag] || [];
        var id = this._filtersStore.tick++;
        filter.id = id;
        filters.push(filter);
        return id;
    }

    removeFilter(id) {
        Object.keys(this._filtersStore.filters).map((key) => {
            this._filtersStore.filters[key] = this._filtersStore.filters[key].filter((item) => item.id !== id);
        });
        return this;
    }

    refresh() {
        if (this._target) {
            this.renderTo(this._target, this._defaultSize);
        }
    }

    resize(sizes = {}) {
        this.renderTo(this._target, sizes);
    }

    select(queryFilter) {
        return this._nodes.filter(queryFilter);
    }

    traverseSpec(spec, iterator) {

        var traverse = (node, iterator, parentNode, parentFrame) => {

            iterator(node, parentNode, parentFrame);

            if (node.frames) {
                node.frames.forEach((frame) => {
                    (frame.units || []).map((x) => traverse(x, iterator, node, frame));
                });
            } else {
                (node.units || []).map((x) => traverse(x, iterator, node, null));
            }
        };

        traverse(spec.unit, iterator, null, null);
    }

    // use from plugins to get the most actual chart config
    getSpec() {
        return this._liveSpec;
    }

    getLayout() {
        return this._layout;
    }

    _displayTimeoutWarning({proceed, cancel, timeout}) {
        var width = 200;
        var height = 100;
        var linesCount = 3;
        var lineSpacing = 1.5;
        var midX = width / 2;
        var fontSize = Math.round(height / linesCount / lineSpacing);
        var getY = function (line) {
            return Math.round(height / linesCount / lineSpacing * line);
        };
        this._layout.content.style.height = '100%';
        this._layout.content.insertAdjacentHTML('beforeend', `
            <div class="${CSS_PREFIX}rendering-timeout-warning">
            <svg
                viewBox="0 0 ${width} ${height}">
                <text
                    text-anchor="middle"
                    font-size="${fontSize}">
                    <tspan x="${midX}" y="${getY(1)}">Rendering took more than ${Math.round(timeout) / 1000}s</tspan>
                    <tspan x="${midX}" y="${getY(2)}">Would you like to continue?</tspan>
                </text>
                <text
                    class="${CSS_PREFIX}rendering-timeout-continue-btn"
                    text-anchor="end"
                    font-size="${fontSize}"
                    cursor="pointer"
                    text-decoration="underline"
                    x="${midX - fontSize / 3}"
                    y="${getY(3)}">
                    Continue
                </text>
                <text
                    class="${CSS_PREFIX}rendering-timeout-cancel-btn"
                    text-anchor="start"
                    font-size="${fontSize}"
                    cursor="pointer"
                    text-decoration="underline"
                    x="${midX + fontSize / 3}"
                    y="${getY(3)}">
                    Cancel
                </text>
            </svg>
            </div>
        `);
        this._layout.content
            .querySelector(`.${CSS_PREFIX}rendering-timeout-continue-btn`)
            .addEventListener('click', () => {
                this._clearTimeoutWarning();
                proceed.call(this);
            });
        this._layout.content
            .querySelector(`.${CSS_PREFIX}rendering-timeout-cancel-btn`)
            .addEventListener('click', () => {
                this._clearTimeoutWarning();
                cancel.call(this);
            });
    }

    _clearTimeoutWarning() {
        var warning = selectImmediate(this._layout.content, `.${CSS_PREFIX}rendering-timeout-warning`);
        if (warning) {
            this._layout.content.removeChild(warning);
            this._layout.content.style.height = '';
        }
    }
}
