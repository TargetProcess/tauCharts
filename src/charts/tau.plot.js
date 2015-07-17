import {Tooltip} from '../api/balloon';
import {Emitter} from '../event';
import {Plugins, propagateDatumEvents} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {DataFrame} from '../data-frame';
import {CSS_PREFIX} from '../const';
import {unitsRegistry} from '../units-registry';
import {scalesRegistry} from '../scales-registry';
import {ScalesFactory} from '../scales-factory';
import {DataProcessor} from '../data-processor';
import {getLayout} from '../utils/layuot-template';
import {SpecConverter} from '../spec-converter';
import {SpecTransformAutoLayout} from '../spec-transform-auto-layout';

import {SpecTransformCalcSize} from '../spec-transform-calc-size';
import {SpecTransformApplyRatio} from '../spec-transform-apply-ratio';
import {SpecTransformExtractAxes} from '../spec-transform-extract-axes';

import {GPL} from './tau.gpl';

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

        if (['sources', 'scales'].filter((p) => config.hasOwnProperty(p)).length === 2) {
            this.config = config;
            this.configGPL = config;
        } else {
            this.config = this.setupConfig(config);
            this.configGPL = new SpecConverter(this.config).convert();
        }

        this.config.plugins = this.config.plugins || [];

        this.configGPL.settings = Plot.setupSettings(this.configGPL.settings);

        this.transformers = [
            SpecTransformApplyRatio,
            SpecTransformAutoLayout
        ];

        this.onUnitsStructureExpandedTransformers = [
            SpecTransformCalcSize,
            SpecTransformExtractAxes
        ];

        this._originData = _.clone(this.configGPL.sources);
        this._liveSpec = this.configGPL;
        this._plugins = new Plugins(this.config.plugins, this);
    }

    setupConfig(config) {

        if (!config.spec || !config.spec.unit) {
            throw new Error('Provide spec for plot');
        }

        this.config = _.defaults(config, {
            spec: {},
            data: [],
            plugins: [],
            settings: {}
        });
        this._emptyContainer = config.emptyContainer || '';
        // TODO: remove this particular config cases
        this.config.settings.specEngine   = config.specEngine || config.settings.specEngine;
        this.config.settings.layoutEngine = config.layoutEngine || config.settings.layoutEngine;
        this.config.settings = Plot.setupSettings(this.config.settings);

        this.config.spec.dimensions = Plot.setupMetaInfo(this.config.spec.dimensions, this.config.data);

        var log = this.config.settings.log;
        if (this.config.settings.excludeNull) {
            this.addFilter({
                tag: 'default',
                src: '/',
                predicate: DataProcessor.excludeNullValues(
                    this.config.spec.dimensions,
                    (item) => log([item, 'point was excluded, because it has undefined values.'], 'WARN')
                )
            });
        }

        return this.config;
    }

    // fixme after all migrate
    getConfig(isOld) {
        // this.configGPL
        return isOld ? this.config : this.configGPL || this.config;
    }

    static setupMetaInfo(dims, data) {
        var meta = (dims) ? dims : DataProcessor.autoDetectDimTypes(data);
        return DataProcessor.autoAssignScales(meta);
    }

    static setupSettings(configSettings) {
        var globalSettings = Plot.globalSettings;
        var localSettings = {};
        Object.keys(globalSettings).forEach((k) => {
            localSettings[k] = (_.isFunction(globalSettings[k])) ?
                globalSettings[k] :
                utils.clone(globalSettings[k]);
        });

        var r = _.defaults(configSettings || {}, localSettings);

        if (!utils.isArray(r.specEngine)) {
            r.specEngine = [{width: Number.MAX_VALUE, name: r.specEngine}];
        }

        return r;
    }

    insertToRightSidebar(el) {
        return utilsDom.appendTo(el, this._layout.rightSidebar);
    }

    insertToHeader(el) {
        return utilsDom.appendTo(el, this._layout.header);
    }

    addBalloon(conf) {
        return new Tooltip('', conf || {});
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
        this._scalesHub = new ScalesFactory(scalesRegistry, this._liveSpec.sources, this._liveSpec.scales);

        if (this.isEmptySources(this._liveSpec.sources)) {
            content.innerHTML = this._emptyContainer;
            return;
        }

        this._liveSpec = this
            .transformers
            .reduce((memo, TransformClass) => (new TransformClass(memo).transform(this)), this._liveSpec);

        this._nodes = [];

        this._liveSpec.onUnitDraw = (unitNode) => {
            this._nodes.push(unitNode);
            this.fire('unitdraw', unitNode);
        };

        this._liveSpec.onUnitsStructureExpanded = (specRef) => {
            this.onUnitsStructureExpandedTransformers
                .forEach((TClass) => (new TClass(specRef)).transform(this));
            this.fire(['units', 'structure', 'expanded'].join(''), specRef);
        };

        this.fire('specready', this._liveSpec);

        new GPL(this._liveSpec, this.getScaleFactory(), unitsRegistry)
            .renderTo(content, this._liveSpec.settings.size);

        var svgXElement = d3.select(content).select('svg');

        this._svg = svgXElement.node();
        this._layout.rightSidebar.style.maxHeight = (`${this._liveSpec.settings.size.height}px`);
        this.fire('render', this._svg);
    }

    getScaleFactory(dataSources = null) {
        return new ScalesFactory(
            scalesRegistry,
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

        return Object
            .keys(this._originData)
            .filter((k) => k !== '?')
            .reduce((memo, k) => {
                var item = this._originData[k];
                var filterIterator = this.getSourceFiltersIterator(excludeFiltersByTagAndSource(k));
                memo[k] = {
                    dims: item.dims,
                    data: item.data.filter(filterIterator)
                };
                return memo;
            },
            {
                '?': this._originData['?']
            });
    }

    isEmptySources(sources) {

        return !Object
            .keys(sources)
            .filter((k) => k !== '?')
            .filter((k) => sources[k].data.length > 0)
            .length;
    }

    getData(param = {}, src = '/') {
        var sources = this.getDataSources(param);
        return sources[src].data;
    }

    setData(data, src = '/') {
        this.config.data = data;
        this.configGPL.sources[src].data = data;
        this._originData = _.clone(this.configGPL.sources);
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
        this.refresh();
        return id;
    }

    removeFilter(id) {
        _.each(this._filtersStore.filters, (filters, key) => {
            this._filtersStore.filters[key] = _.reject(filters, (item) => item.id === id);
        });
        this.refresh();
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

        var traverse = (node, iterator, parentNode) => {
            iterator(node, parentNode);
            (node.units || []).map((x) => traverse(x, iterator, node));
        };

        traverse(spec.unit, iterator, null);
    }

    // use from plugins to get the most actual chart config
    getSpec() {
        return this._liveSpec;
    }
}