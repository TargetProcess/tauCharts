import {Tooltip} from '../api/balloon';
import {Emitter} from '../event';
import {Plugins, propagateDatumEvents} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {CSS_PREFIX} from '../const';
import {unitsRegistry} from '../units-registry';
import {DataProcessor} from '../data-processor';
import {getLayout} from '../utils/layuot-template';
import {SpecConverter} from '../spec-converter';
import {SpecTransformExtractAxes} from '../spec-transform-extract-axes';
import {SpecTransformAutoLayout} from '../spec-transform-auto-layout';
import {GPL} from './tau.gpl';

export class Plot extends Emitter {
    constructor(config) {
        super();
        this._nodes = [];
        this._liveSpec = null;
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

        this.configGPL.settings = this.setupSettings(this.configGPL.settings);

        this.transformers = [SpecTransformAutoLayout];
        if (this.configGPL.settings.layoutEngine === 'EXTRACT') {
            this.transformers.push(SpecTransformExtractAxes);
        }

        this._originData = _.clone(this.configGPL.sources);

        this._plugins = new Plugins(this.config.plugins, this);
    }

    setupConfig(config) {

        if (!config.spec && !config.spec.unit) {
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
        this.config.settings = this.setupSettings(this.config.settings);

        this.config.spec.dimensions = this.setupMetaInfo(this.config.spec.dimensions, this.config.data);

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

    setupMetaInfo(dims, data) {
        var meta = (dims) ? dims : DataProcessor.autoDetectDimTypes(data);
        return DataProcessor.autoAssignScales(meta);
    }

    setupSettings(configSettings) {
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

        var gpl = utils.clone(this.configGPL);
        gpl.sources = this.getData({isNew: true});
        gpl.settings = this.configGPL.settings;

        if (this.isEmptySources(gpl.sources)) {
            content.innerHTML = this._emptyContainer;
            return;
        }

        gpl = this
            .transformers
            .reduce((memo, TransformClass) => (new TransformClass(memo).transform()), gpl);

        var optimalSize = gpl.settings.size;

        this._nodes = [];
        gpl.onUnitDraw = (unitNode) => {
            this._nodes.push(unitNode);
            this.fire('unitdraw', unitNode);
        };

        this._liveSpec = gpl;

        this.fire('specready', gpl);

        new GPL(gpl).renderTo(content, optimalSize);

        var svgXElement = d3.select(content).select('svg');

        this._svg = svgXElement.node();
        this._layout.rightSidebar.style.maxHeight = (`${optimalSize.height}px`);
        this.fire('render', this._svg);
    }

    getLiveSpec() {
        return this._liveSpec;
    }

    getData(param = {}) {

        var applyFilterMap = (data, filtersSelector) => {

            var filters = _(this._filtersStore.filters)
                .chain()
                .values()
                .flatten()
                .reject((f) => (_.contains(param.excludeFilter, f.tag) || !filtersSelector(f)))
                .pluck('predicate')
                .value();

            return data.filter((row) => filters.reduce((prev, f) => (prev && f(row)), true));
        };

        if (param.isNew) {
            var filteredSources = {};
            filteredSources['?'] = this._originData['?'];
            return Object
                .keys(this._originData)
                .filter((k) => k !== '?')
                .reduce((memo, key) => {
                    var item = this._originData[key];
                    memo[key] = {
                        dims: item.dims,
                        data: applyFilterMap(item.data, (f) => f.src === key)
                    };
                    return memo;
                },
                filteredSources);
        } else {
            return applyFilterMap(this.config.data, (f) => true);
        }
    }

    isEmptySources(sources) {

        return !Object
            .keys(sources)
            .filter((k) => k !== '?')
            .filter((k) => sources[k].data.length > 0)
            .length;
    }

    setData(data) {
        this.config.data = data;
        this.configGPL.sources['/'].data = data;
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
}