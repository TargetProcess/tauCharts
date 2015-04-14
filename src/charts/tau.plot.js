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
import {ScalesFactory} from '../scales-factory';

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

        var plot = this;

        gpl.onUnitsStructureExpanded = function (unitsStructure) {

            plot.fire('units-structure-expanded', unitsStructure);

            var fitModel = gpl.settings.fitModel;
            // none
            // normal
            // entire-view
            // fit-width
            // fit-height

            if (!fitModel) {
                return;
            }

            var chart = this;

            var scales = unitsStructure.scales;

            var scalesCreator = new ScalesFactory(unitsStructure.sources);

            var groupFramesBy = (frames, dim) => {
                return frames
                    .reduce((memo, f) => {
                        var fKey = f.key || {};
                        var fVal = fKey[dim];
                        memo[fVal] = memo[fVal] || [];
                        memo[fVal].push(f);
                        return memo;
                    }, {});
            };

            var calcScaleSize = (xScale, maxTickText) => {

                var r = 0;

                if (['ordinal', 'period'].indexOf(xScale.scaleType) >= 0) {
                    var domain = xScale.domain();
                    r = maxTickText * domain.length;
                } else {
                    r = maxTickText * 4;
                }

                return r;
            };

            var calcWidth = (prop, root, frame = null) => {

                var xCfg = (prop === 'x') ? scales[root.x] : scales[root.y];
                var yCfg = (prop === 'x') ? scales[root.y] : scales[root.x];
                var guide = root.guide;
                var xSize = (prop === 'x') ?
                    Math.max(guide.x.density, guide.x.$maxTickTextW) :
                    guide.y.density;

                var resScaleSize = (prop === 'x') ?
                    (guide.padding.l + guide.padding.r) :
                    (guide.padding.b + guide.padding.t);

                if (root.units[0].type !== 'COORDS.RECT') {

                    var xScale = scalesCreator.create(xCfg, frame, [0, 100]);
                    return resScaleSize + calcScaleSize(xScale, xSize);

                } else {

                    var rows = groupFramesBy(root.frames, yCfg.dim);
                    var rowsSizes = Object
                        .keys(rows)
                        .map((kRow) => {
                            return rows[kRow]
                                .map((f) => calcWidth(prop, f.units[0], f))
                                .reduce((sum, size) => (sum + size), 0);
                        });

                    // pick up max row size
                    var maxRowSize = Math.max(...rowsSizes);
                    return resScaleSize + maxRowSize;
                }
            };

            var srcSize = chart.getSize();

            var newW = srcSize.width;
            var newH = srcSize.height;
            if (fitModel === 'entire-view') {
                newW = srcSize.width;
                newH = srcSize.height;

            } else if (fitModel === 'none') {
                newW = calcWidth('x', unitsStructure.unit);
                newH = calcWidth('y', unitsStructure.unit);

            } else if (fitModel === 'normal') {
                newW = Math.max(srcSize.width, calcWidth('x', unitsStructure.unit));
                newH = Math.max(srcSize.height, calcWidth('y', unitsStructure.unit));

            } else if (fitModel === 'fit-width') {
                newW = srcSize.width;
                newH = calcWidth('y', unitsStructure.unit);

            } else if (fitModel === 'fit-height') {
                newW = calcWidth('x', unitsStructure.unit);
                newH = srcSize.height;
            }

            var prettifySize = (srcSize, newSize) => {

                var scrollSize = gpl.settings.getScrollBarWidth();

                var recommendedWidth = newSize.width;
                var recommendedHeight = newSize.height;

                var deltaW = (srcSize.width - recommendedWidth);
                var deltaH = (srcSize.height - recommendedHeight);

                var scrollW = (deltaH >= 0) ? 0 : scrollSize;
                var scrollH = (deltaW >= 0) ? 0 : scrollSize;

                return {
                    height: recommendedHeight - scrollH,
                    width: recommendedWidth - scrollW
                };
            };

            var newSize = prettifySize(
                srcSize,
                {
                    width: newW,
                    height: newH
                }
            );

            // try optimize spec guides
            var tryOptimizeSpec = (meta, root, size, localSettings) => {

                var mdx = root.guide.x.$minimalDomain || 1;
                var mdy = root.guide.y.$minimalDomain || 1;

                var perTickX = size.width / mdx;
                var perTickY = size.height / mdy;

                var dimXType = meta(root.x);
                var dimYType = meta(root.y);

                var xDensityPadding = localSettings.hasOwnProperty('xDensityPadding:' + dimXType) ?
                    localSettings['xDensityPadding:' + dimXType] :
                    localSettings.xDensityPadding;

                var yDensityPadding = localSettings.hasOwnProperty('yDensityPadding:' + dimYType) ?
                    localSettings['yDensityPadding:' + dimYType] :
                    localSettings.yDensityPadding;

                if (root.guide.x.hide !== true &&
                    root.guide.x.rotate !== 0 &&
                    (perTickX > (root.guide.x.$maxTickTextW + xDensityPadding * 2))) {

                    root.guide.x.rotate = 0;
                    root.guide.x.textAnchor = 'middle';
                    root.guide.x.tickFormatWordWrapLimit = perTickX;
                    var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);

                    var xDelta = 0 - s + root.guide.x.$maxTickTextH;

                    root.guide.padding.b += (root.guide.padding.b > 0) ? xDelta : 0;

                    if (root.guide.x.label.padding > (s + localSettings.xAxisPadding)) {
                        root.guide.x.label.padding += xDelta;
                    }
                }

                if (root.guide.y.hide !== true &&
                    root.guide.y.rotate !== 0 &&
                    (root.guide.y.tickFormatWordWrapLines === 1) &&
                    (perTickY > (root.guide.y.$maxTickTextW + yDensityPadding * 2))) {

                    root.guide.y.tickFormatWordWrapLimit = (perTickY - yDensityPadding * 2);
                }

                var newSize = {
                    width: perTickX,
                    height: perTickY
                };

                root.frames.forEach((f) => {
                    f.units.forEach((u) => {
                        tryOptimizeSpec(meta, u, newSize, localSettings);
                    });
                });
            };

            tryOptimizeSpec(
                (scaleName) => {
                    var dim = unitsStructure.scales[scaleName].dim;
                    var src = unitsStructure.scales[scaleName].source;

                    var dims = unitsStructure.sources[src].dims;

                    return (dims[dim] || {}).type;
                },
                unitsStructure.unit,
                newSize,
                gpl.settings);

            // TODO: re-calculate size and check if optimization affected size

            chart.setSize(newSize);
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