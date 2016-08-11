import {Tooltip} from '../api/balloon';
import {Emitter} from '../event';
import {Plugins} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
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
import {default as _} from 'underscore';
import {default as d3} from 'd3';
var selectOrAppend = utilsDom.selectOrAppend;

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
        config.settings = Plot.setupSettings(_.defaults(
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

        this._originData = _.clone(this.configGPL.sources);
        this._chartDataModel = (src => src);
        this._liveSpec = this.configGPL;
        this._plugins = new Plugins(plugins, this);
    }

    destroy() {
        this.destroyNodes();
        d3.select(this._svg).remove();
        d3.select(this._layout.layout).remove();
        super.destroy();
    }

    setupChartSourceModel(fnModelTransformation) {
        this._chartDataModel = fnModelTransformation;
    }

    setupConfig(config) {

        if (!config.spec || !config.spec.unit) {
            throw new Error('Provide spec for plot');
        }

        var resConfig = _.defaults(
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
                var periodCaster = tickPeriod.get(scaleRef.period);
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

        var isNullOrUndefined = ((x) => ((x === null) || (typeof(x) === 'undefined')));

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
                memo[k] = (_.isFunction(globalSettings[k])) ?
                    globalSettings[k] :
                    utils.clone(globalSettings[k]);
                return memo;
            }, {});

        var r = _.defaults(configSettings || {}, localSettings);

        if (!utils.isArray(r.specEngine)) {
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

    renderTo(target, xSize) {
        this._svg = null;
        this._target = target;
        this._defaultSize = _.clone(xSize);

        var targetNode = d3.select(target).node();
        if (targetNode === null) {
            throw new Error('Target element not found');
        }

        targetNode.appendChild(this._layout.layout);

        var content = this._layout.content;
        var size = _.clone(xSize) || {};
        if (!size.width || !size.height) {
            content.style.display = 'none';
            size = _.defaults(size, utilsDom.getContainerSize(content.parentNode));
            content.style.display = '';
            // TODO: fix this issue
            if (!size.height) {
                size.height = utilsDom.getContainerSize(this._layout.layout).height;
            }
        }

        this.configGPL.settings.size = size;

        this._liveSpec = utils.clone(_.omit(this.configGPL, 'plugins'));
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

        var xGpl = new GPL(this._liveSpec, this.getScaleFactory(), unitsRegistry);
        var structure = xGpl.unfoldStructure();

        this.onUnitsStructureExpanded(structure);

        var newSize = xGpl.config.settings.size;
        var d3Target = d3.select(content);
        var attr = {
            class: (`${CSS_PREFIX}svg`),
            width: newSize.width,
            height: newSize.height
        };

        var xSvg = selectOrAppend(d3Target, `svg`).attr(attr);
        selectOrAppend(xSvg, `g.${CSS_PREFIX}cell.cell.frame-root`);

        var scenario = xGpl.getDrawScenario({
            allocateRect: () => ({
                slot: (() => d3Target.select('.frame-root')),
                frameId: 'root',
                left: 0,
                top: 0,
                width: newSize.width,
                containerWidth: newSize.width,
                height: newSize.height,
                containerHeight: newSize.height
            })
        });

        scenario.forEach((item) => {
            item.draw();
            this.onUnitDraw(item.node());
        });

        this._svg = xSvg.node();
        this._layout.rightSidebar.style.maxHeight = (`${this._liveSpec.settings.size.height}px`);
        this.fire('render', this._svg);
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

        var filters = _(this._filtersStore.filters)
            .chain()
            .values()
            .flatten()
            .reject((f) => rejectFiltersPredicate(f))
            .pluck('predicate')
            .value();

        return (row) => filters.reduce((prev, f) => (prev && f(row)), true);
    }

    getDataSources(param = {}) {

        var excludeFiltersByTagAndSource = (k) => ((f) => ((_.contains(param.excludeFilter, f.tag)) || f.src !== k));

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
        _.each(this._filtersStore.filters, (filters, key) => {
            this._filtersStore.filters[key] = _.reject(filters, (item) => item.id === id);
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
}
