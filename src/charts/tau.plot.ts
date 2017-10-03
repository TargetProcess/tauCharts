import {Balloon} from '../api/balloon';
import {Emitter, EventHandlerMap} from '../event';
import {Plugins} from '../plugins';
import * as utils from '../utils/utils';
import * as utilsDom from '../utils/utils-dom';
import {
    d3_setClasses as setClasses,
    d3_transition as transition
} from '../utils/d3-decorators';
import {GrammarRegistry} from '../grammar-registry';
import {unitsRegistry} from '../units-registry';
import {scalesRegistry} from '../scales-registry';
import {ScalesFactory} from '../scales-factory';
import {DataProcessor} from '../data-processor';
import {getLayout, ChartLayout} from '../utils/layuot-template';
import {SpecConverter} from '../spec-converter';
import {SpecTransformAutoLayout} from '../spec-transform-auto-layout';

import {SpecTransformCalcSize} from '../spec-transform-calc-size';
import {SpecTransformApplyRatio} from '../spec-transform-apply-ratio';
import {SpecTransformExtractAxes} from '../spec-transform-extract-axes';
import {CSS_PREFIX} from '../const';

import {GPL} from './tau.gpl';
import {UnitDomainPeriodGenerator} from '../unit-domain-period-generator';
import * as d3_selection from 'd3-selection';
const d3 = {...d3_selection};
import 'd3-transition';
import TaskRunner from './task-runner';
var selectOrAppend = utilsDom.selectOrAppend;
var selectImmediate = utilsDom.selectImmediate;

import {
    ChartConfig,
    ChartDimensionsMap,
    ChartSettings,
    ChartSpec,
    DataFrameObject,
    DataSources,
    d3Selection,
    GPLSpec,
    GrammarElement,
    PointerEventArgs,
    Size,
    SpecTransformConstructor,
    Unit
} from '../definitions';

interface Filter {
    tag: string;
    src?: string;
    predicate: (row) => boolean;
    id?: number;
}

interface ExcludeFilter {
    excludeFilter?: string[];
}

export class Plot extends Emitter {

    protected _nodes: GrammarElement[];
    protected _svg: SVGSVGElement;
    protected _filtersStore: {
        filters: {[tag: string]: Filter[]};
        tick: number;
    };
    protected _layout: ChartLayout;
    configGPL: GPLSpec;
    transformers: SpecTransformConstructor[];
    onUnitsStructureExpandedTransformers: SpecTransformConstructor[];
    protected _originData: DataSources;
    protected _chartDataModel: (dataSources: DataSources) => DataSources;
    protected _liveSpec: GPLSpec;
    protected _plugins: Plugins;
    protected _reportProgress: (value: number) => void;
    protected _taskRunner: TaskRunner;
    protected _renderingPhase: 'spec' | 'draw' | null;
    protected _emptyContainer: string;
    protected _pointerAnimationFrameId: number;
    protected _target: HTMLElement | string;
    protected _defaultSize: Size;
    protected _renderedItems: GrammarElement[];
    protected _dataRefs: {
        references: WeakMap<any, number>;
        refCounter: () => number;
    };

    on(
        event: 'render' | 'beforerender',
        callback: (chart: Plot, svg: SVGSVGElement) => void,
        context?
    ): EventHandlerMap;
    on(
        event: 'specready' | 'unitsstructureexpanded',
        callback: (chart: Plot, spec: GPLSpec) => void,
        context?
    ): EventHandlerMap;
    on(event: 'renderingtimeout', callback: (chart: Plot, timeout: number) => void, context?): EventHandlerMap;
    on(event: 'renderingerror', callback: (chart: Plot, error: Error) => void, context?): EventHandlerMap;
    on(event: 'unitdraw', callback: (chart: Plot, unit: GrammarElement) => void, context?): EventHandlerMap;
    on(
        event: 'elementclick' | 'elementmouseout' | 'elementmouseover',
        callback: (chart: Plot, data: PointerEvent) => void,
        context?
    ): EventHandlerMap;
    on(event: string, callback: (chart: Plot, data) => void, context?) {
        return super.on(event, callback, context);
    }

    constructor(config: ChartConfig) {
        super();
        this._nodes = [];
        this._svg = null;
        this._filtersStore = {
            filters: {},
            tick: 0
        };
        this._layout = getLayout();

        this.transformers = [
            SpecTransformApplyRatio,
            SpecTransformAutoLayout
        ];

        this.onUnitsStructureExpandedTransformers = [
            SpecTransformExtractAxes,
            SpecTransformCalcSize
        ];

        this._chartDataModel = (src => src);

        this._reportProgress = null;
        this._taskRunner = null;
        this._renderingPhase = null;

        this.applyConfig(config);
    }

    updateConfig(config: ChartConfig) {
        this.applyConfig(config);
        this.refresh();
    }

    applyConfig(config: ChartConfig) {

        config = this.setupConfigSettings(config);

        this.configGPL = this.createGPLConfig(config);
        this._originData = Object.assign({}, this.configGPL.sources);
        this._liveSpec = this.configGPL;
        this._emptyContainer = config.emptyContainer || '';

        this.setupPlugins(config);
    }

    createGPLConfig(config: ChartConfig) {
        let configGPL: GPLSpec;

        if (this.isGPLConfig(config)) {
            configGPL = config as GPLSpec;
        } else {
            config = this.setupConfig(config);
            configGPL = new SpecConverter(config).convert();
        }

        configGPL = Plot.setupPeriodData(configGPL);

        return configGPL;
    }

    isGPLConfig(config: ChartConfig) {
        return (['sources', 'scales'].filter((p) => config.hasOwnProperty(p)).length === 2);
    }

    setupPlugins(config: ChartConfig) {
        const plugins = (config.plugins || []);
        if (this._plugins) {
            this._plugins.destroy();
        }
        this._plugins = new Plugins(plugins, this);
    }

    setupConfigSettings(config: ChartConfig) {
        this._dataRefs = this._dataRefs || (() => {
            let iref = 0;
            return {
                references: new WeakMap(),
                refCounter: (() => (++iref))
            };
        })();
        config.settings = Plot.setupSettings(utils.defaults(
            (config.settings || {}),
            this._dataRefs
        ));
        return config;
    }

    destroy() {
        this.destroyNodes();
        d3.select(this._svg).remove();
        d3.select(this._layout.layout).remove();
        this._cancelRendering();
        super.destroy();
    }

    setupChartSourceModel(fnModelTransformation: (sources: DataSources) => DataSources) {
        this._chartDataModel = fnModelTransformation;
    }

    setupConfig(config: ChartConfig) {

        if (!config.spec || !config.spec.unit) {
            throw new Error('Provide spec for plot');
        }

        var resConfig: ChartConfig = utils.defaults(
            config,
            {
                spec: {},
                data: [],
                plugins: [],
                settings: {}
            });

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

    static setupPeriodData(spec: GPLSpec) {
        var tickPeriod: typeof UnitDomainPeriodGenerator = Plot.__api__.tickPeriod;
        var log = spec.settings.log;

        var scales = Object
            .keys(spec.scales)
            .map(s => spec.scales[s]);

        scales
            .filter(s => (s.type === 'period'))
            .forEach((scaleRef) => {
                var periodCaster = tickPeriod.get(scaleRef.period, {utc: spec.settings.utcTime});
                if (!periodCaster) {
                    log([
                        `Unknown period "${scaleRef.period}".`,
                        `Docs: http://api.taucharts.com/plugins/customticks.html#how-to-add-custom-tick-period`
                    ], 'WARN');
                    scaleRef.period = null;
                }
            });

        return spec;
    }

    static setupMetaInfo(dims: ChartDimensionsMap, data: any[]) {
        var meta = (dims) ? dims : DataProcessor.autoDetectDimTypes(data);
        return DataProcessor.autoAssignScales(meta);
    }

    static setupSettings(configSettings: ChartSettings) {
        var globalSettings = Plot.globalSettings;
        var localSettings = Object
            .keys(globalSettings)
            .reduce((memo, k) => {
                memo[k] = (typeof globalSettings[k] === 'function') ?
                    globalSettings[k] :
                    utils.clone(globalSettings[k]);
                return memo;
            }, {} as ChartSettings);

        var r = utils.defaults(configSettings || {}, localSettings);

        if (!Array.isArray(r.specEngine)) {
            r.specEngine = [{width: Number.MAX_VALUE, name: r.specEngine}];
        }

        return r;
    }

    insertToLeftSidebar(el: Element) {
        return utilsDom.appendTo(el, this._layout.leftSidebar);
    }

    insertToRightSidebar(el: Element) {
        return utilsDom.appendTo(el, this._layout.rightSidebar);
    }

    insertToFooter(el: Element) {
        return utilsDom.appendTo(el, this._layout.footer);
    }

    insertToHeader(el: Element) {
        return utilsDom.appendTo(el, this._layout.header);
    }

    addBalloon(conf) {
        return new Balloon('', conf || {});
    }

    destroyNodes() {
        this._nodes.forEach((node) => node.destroy());
        this._nodes = [];
        this._renderedItems = [];
    }

    onUnitDraw(unitNode: GrammarElement) {
        this._nodes.push(unitNode);
        this.fire('unitdraw', unitNode);
        ['click', 'mouseover', 'mouseout']
            .forEach((eventName) => unitNode.on(
                (eventName),
                (sender, e) => {
                    this.fire(
                        `element${eventName}`,
                        <PointerEventArgs>{
                            element: sender,
                            data: e.data,
                            event: e.event
                        }
                    );
                }));
    }

    onUnitsStructureExpanded(specRef: GPLSpec) {
        this.onUnitsStructureExpandedTransformers
            .forEach((TClass) => (new TClass(specRef)).transform(this));
        this.fire('unitsstructureexpanded', specRef);
    }

    _getClosestElementPerUnit(x0: number, y0: number) {
        return this._renderedItems
            .filter((d) => d.getClosestElement)
            .map((item) => {
                var closest = item.getClosestElement(x0, y0);
                var unit = item.node();
                return {unit, closest};
            });
    }

    disablePointerEvents() {
        this._layout.layout.style.pointerEvents = 'none';
    }

    enablePointerEvents() {
        this._layout.layout.style.pointerEvents = '';
    }

    _handlePointerEvent(event: MouseEvent) {
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
        var node: Element = null;
        var unit: GrammarElement = null;
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
                unit = sameDistItems[0].unit;
            } else {
                const mx = (sameDistItems.reduce((sum, item) => sum + item.closest.x, 0) / sameDistItems.length);
                const my = (sameDistItems.reduce((sum, item) => sum + item.closest.y, 0) / sameDistItems.length);
                const angle = (Math.atan2(my - y, mx - x) + Math.PI);
                const index = Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI);
                const {closest} = sameDistItems[index];
                data = closest.data;
                node = closest.node;
                unit = sameDistItems[index].unit;
            }
        }

        items.forEach((item) => item.unit.fire(dataEvent, {event, data, node, unit}));
    }

    _initPointerEvents() {
        if (!this._liveSpec.settings.syncPointerEvents) {
            this._pointerAnimationFrameId = null;
        }
        const svg = d3.select(this._svg);
        const wrapEventHandler = (this._liveSpec.settings.syncPointerEvents ?
            ((handler) => () => handler(d3_selection.event)) :
            ((handler) => (() => {
                var e = d3_selection.event;
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
                    .forEach((unit) => unit.fire('data-hover', {event, data: null, node: null, unit: null}));
            }
        }));
    }

    _cancelPointerAnimationFrame() {
        cancelAnimationFrame(this._pointerAnimationFrameId);
        this._pointerAnimationFrameId = null;
    }

    _setupTaskRunner(liveSpec: GPLSpec) {
        this._resetTaskRunner();
        this._taskRunner = new TaskRunner({
            timeout: (liveSpec.settings.renderingTimeout || Number.MAX_SAFE_INTEGER),
            syncInterval: (liveSpec.settings.asyncRendering ?
                liveSpec.settings.syncRenderingInterval :
                Number.MAX_SAFE_INTEGER),
            callbacks: {
                done: () => {
                    this._completeRendering();
                    this._renderingPhase = null;
                },
                timeout: (timeout, taskRunner) => {
                    this._displayTimeoutWarning({
                        timeout,
                        proceed: () => {
                            this.disablePointerEvents();
                            taskRunner.setTimeoutDuration(Number.MAX_SAFE_INTEGER);
                            taskRunner.run();
                        },
                        cancel: () => {
                            this._cancelRendering();
                        }
                    });
                    this.enablePointerEvents();
                    this.fire('renderingtimeout', timeout);
                },
                progress: (progress) => {
                    var phases = {
                        spec: 0,
                        draw: 1
                    };
                    var p = (phases[this._renderingPhase] / 2 + progress / 2);
                    this._reportProgress(p);
                },
                error: (liveSpec.settings.handleRenderingErrors ?
                    ((err) => {
                        this._cancelRendering();
                        this._displayRenderingError(err);
                        this.fire('renderingerror', err);
                        liveSpec.settings.log([
                            `An error occured during chart rendering.`,
                            `Set "handleRenderingErrors: false" in chart settings to debug.`,
                            `Error message: ${err.message}`
                        ].join(' '), 'ERROR');
                    }) :
                    null)
            }
        });
        return this._taskRunner;
    }

    _resetTaskRunner() {
        if (this._taskRunner && this._taskRunner.isRunning()) {
            this._taskRunner.stop();
            this._taskRunner = null;
        }
    }

    renderTo(target: HTMLElement | string, xSize?: Size) {

        this._resetProgressLayout();

        var liveSpec = this._createLiveSpec(target, xSize);
        if (!liveSpec) {
            this._svg = null;
            this._layout.content.innerHTML = this._emptyContainer;
            this.enablePointerEvents();
            return;
        }

        var gpl = this._createGPL(liveSpec);

        var taskRunner = this._setupTaskRunner(liveSpec);
        this._scheduleDrawScenario(taskRunner, gpl);
        this._scheduleDrawing(taskRunner, gpl);
        taskRunner.run();
    }

    _createLiveSpec(target: HTMLElement | string, xSize?: Size) {
        this.disablePointerEvents();
        this._target = target;
        this._defaultSize = Object.assign({}, xSize);

        var targetNode: Element = d3.select(target as any).node();
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
            size = utils.defaults(size, utilsDom.getContainerSize(content.parentNode as HTMLElement));
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

        this._experimentalSetupAnimationSpeed(this._liveSpec);

        if (this.isEmptySources(this._liveSpec.sources)) {
            return null;
        }

        this._liveSpec = this
            .transformers
            .reduce((memo, TransformClass) => (new TransformClass(memo).transform(this)), this._liveSpec);

        this.destroyNodes();

        this.fire('specready', this._liveSpec);

        return this._liveSpec;
    }

    _experimentalSetupAnimationSpeed(spec: GPLSpec) {
        // Determine if it's better to draw chart without animation
        (<any>spec.settings).initialAnimationSpeed = (
            (<any>spec.settings).initialAnimationSpeed ||
            spec.settings.animationSpeed);
        const animationSpeed = (spec.settings.experimentalShouldAnimate(spec) ?
            (<any>spec.settings).initialAnimationSpeed : 0);
        spec.settings.animationSpeed = animationSpeed;
        const setUnitAnimation = (u: Unit) => {
            u.guide = (u.guide || {});
            u.guide.animationSpeed = animationSpeed;
            if (u.units) {
                u.units.forEach(setUnitAnimation);
            }
        };
        setUnitAnimation(spec.unit);
    }

    _createGPL(liveSpec: GPLSpec) {
        var gpl = new GPL(liveSpec, this.getScaleFactory(), unitsRegistry, GrammarRegistry);
        var structure = gpl.unfoldStructure();
        this.onUnitsStructureExpanded(structure);

        return gpl;
    }

    _scheduleDrawScenario(taskRunner: TaskRunner, gpl: GPL) {
        const d3Target = d3.select(this._layout.content);
        const newSize = gpl.config.settings.size;
        taskRunner.addTask(() => this._renderingPhase = 'spec');
        gpl.getDrawScenarioQueue({
            allocateRect: () => ({
                slot: ((uid) => d3Target.selectAll(`.uid_${uid}`) as d3Selection),
                frameId: 'root',
                left: 0,
                top: 0,
                width: newSize.width,
                containerWidth: newSize.width,
                height: newSize.height,
                containerHeight: newSize.height
            })
        }).forEach((task) => taskRunner.addTask(task));
    }

    _scheduleDrawing(taskRunner: TaskRunner, gpl: GPL) {
        const newSize = gpl.config.settings.size;
        taskRunner.addTask((scenario: GrammarElement[]) => {
            this._renderingPhase = 'draw';
            this._renderRoot({scenario, newSize});
            this._cancelPointerAnimationFrame();
            this._scheduleRenderScenario(scenario);
        });
    }

    _resetProgressLayout() {
        this._createProgressBar();
        this._clearRenderingError();
        this._clearTimeoutWarning();
    }

    _renderRoot({scenario, newSize}: {scenario: GrammarElement[]; newSize: Size;}) {
        const d3Target = d3.select(this._layout.content);
        var frameRootId = scenario[0].config.uid;
        var svg = selectOrAppend(d3Target, `svg`)
            .attr('width', Math.floor(newSize.width))
            .attr('height', Math.floor(newSize.height));
        if (!svg.attr('class')) {
            svg.attr('class', `${CSS_PREFIX}svg`);
        }
        this._svg = svg.node() as SVGSVGElement;
        this._initPointerEvents();
        this.fire('beforerender', this._svg);
        var roots = (svg.selectAll('g.frame-root') as d3.Selection<SVGElement, string, SVGSVGElement, any>)
            .data([frameRootId], x => x);

        // NOTE: Fade out removed root, fade-in if removing interrupted.
        roots.enter()
            .append('g')
            .classed(`${CSS_PREFIX}cell cell frame-root uid_${frameRootId}`, true)
            .merge(roots)
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

    _scheduleRenderScenario(scenario: GrammarElement[]) {

        scenario.forEach((item) => {
            this._taskRunner.addTask(() => {
                item.draw();
                this.onUnitDraw(item.node());
                this._renderedItems.push(item);
            });
        });
    }

    _completeRendering() {
        // TODO: Render panels before chart, to
        // prevent chart size shrink. Use some other event.
        utilsDom.setScrollPadding(this._layout.contentContainer);
        this._layout.rightSidebar.style.maxHeight = (`${this._liveSpec.settings.size.height}px`);
        this.enablePointerEvents();
        if (this._svg) {
            this.fire('render', this._svg);
        }

        // NOTE: After plugins have rendered, the panel scrollbar may appear, so need to handle it again.
        utilsDom.setScrollPadding(this._layout.rightSidebarContainer, 'vertical');
    }

    _cancelRendering() {
        this.enablePointerEvents();
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

    _displayRenderingError(error?: Error) {
        this._layout.layout.classList.add(`${CSS_PREFIX}layout_rendering-error`);
    }

    _clearRenderingError() {
        this._layout.layout.classList.remove(`${CSS_PREFIX}layout_rendering-error`);
    }

    getScaleFactory(dataSources: DataSources = null) {
        return new ScalesFactory(
            scalesRegistry.instance(this._liveSpec.settings),
            dataSources || this._liveSpec.sources,
            this._liveSpec.scales
        );
    }

    getScaleInfo(name: string, dataFrame: DataFrameObject = null) {
        return this
            .getScaleFactory()
            .createScaleInfoByName(name, dataFrame);
    }

    getSourceFiltersIterator(rejectFiltersPredicate: (filter: Filter) => boolean) {
        var filters = utils.flatten(Object.keys(this._filtersStore.filters).map(key => this._filtersStore.filters[key]))
            .filter((f) => !rejectFiltersPredicate(f))
            .map(x => x.predicate);

        return (row) => filters.reduce((prev, f) => (prev && f(row)), true);
    }

    getDataSources(param: ExcludeFilter = {}) {
        var excludeFiltersByTagAndSource = (k: string) =>
            ((f: Filter) => (param.excludeFilter && param.excludeFilter.indexOf(f.tag) !== -1) || f.src !== k);

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
            } as DataSources);
    }

    isEmptySources(sources: DataSources) {

        return !Object
            .keys(sources)
            .filter((k) => k !== '?')
            .filter((k) => sources[k].data.length > 0)
            .length;
    }

    getChartModelData(param: ExcludeFilter = {}, src = '/') {
        var sources = this.getDataSources(param);
        return sources[src].data;
    }

    getDataDims(src = '/') {
        return this._originData[src].dims;
    }

    getData(src = '/') {
        return this._originData[src].data;
    }

    setData(data: any[], src = '/') {
        this._originData[src].data = data;
        this.refresh();
    }

    getSVG() {
        return this._svg;
    }

    addFilter(filter: Filter) {
        filter.src = filter.src || '/';
        var tag = filter.tag;
        var filters = this._filtersStore.filters[tag] = this._filtersStore.filters[tag] || [];
        var id = this._filtersStore.tick++;
        filter.id = id;
        filters.push(filter);
        return id;
    }

    removeFilter(id: number) {
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

    resize(sizes: Size = {}) {
        this.renderTo(this._target, sizes);
    }

    select(queryFilter: (unit?: GrammarElement) => boolean) {
        return this._nodes.filter(queryFilter);
    }

    traverseSpec(spec: ChartSpec, iterator: (node: Unit, parentNode: Unit, parentFrame: DataFrameObject) => void) {

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

    _displayTimeoutWarning({proceed, cancel, timeout}: {proceed: () => void, cancel: () => void, timeout: number}) {
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

    static globalSettings: ChartSettings;
    static __api__;
}
