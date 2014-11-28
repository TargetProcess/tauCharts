import {DSLReader} from '../dsl-reader';
import {Tooltip} from '../api/balloon';
import {Emitter} from '../event';
import {SpecEngineFactory} from '../spec-engine-factory';
import {LayoutEngineFactory} from '../layout-engine-factory';
import {Plugins, propagateDatumEvents} from '../plugins';
import {utils} from '../utils/utils';
import {utilsDom} from '../utils/utils-dom';
import {CSS_PREFIX} from '../const';
import {UnitDomainMixin} from '../unit-domain-mixin';
import {UnitsRegistry} from '../units-registry';
import {DataProcessor} from '../data-processor';

export class Plot extends Emitter{
    constructor(config) {
        super();
        this.setupConfig(config);
        //plugins
        this._plugins = new Plugins(this.config.plugins, this);
        this._emptyContainer =  config.emptyContainer || '';
    }

    setupConfig(config) {
        this.config = _.defaults(config, {
            spec: {},
            data: [],
            plugins: [],
            settings: {}
        });

        // TODO: remove this particular config cases
        this.config.settings.specEngine   = this.config.specEngine || this.config.settings.specEngine;
        this.config.settings.layoutEngine = this.config.layoutEngine || this.config.settings.layoutEngine;

        this.config.settings        = this.setupSettings(this.config.settings);
        this.config.spec.dimensions = this.setupMetaInfo(this.config.spec.dimensions, this.config.data);

        this.config.data = this.config.settings.excludeNull ?
            DataProcessor.excludeNullValues(this.config.spec.dimensions, this.config.data) :
            this.config.data;
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

        return _.defaults(configSettings || {}, localSettings);
    }
   /* addLine (conf) {
        var unitContainer = this._spec.unit.unit;

        while(true) {
            if(unitContainer[0].unit) {
                unitContainer = unitContainer[0].unit;
            } else {
                break;
            }
        }
        unitContainer.push(conf);
    }*/
    addBalloon(conf) {
        return new Tooltip('', conf || {});
    }
    renderTo(target, xSize) {
       // this.addLine({type:'ELEMENT.LINE', isGuide:true});
        var container = d3.select(target);
        var containerNode = container[0][0];
        this.target = target;
        this.targetSizes = xSize;
        if (containerNode === null) {
            throw new Error('Target element not found');
        }

        //todo don't compute width if width or height were passed
        var size = _.defaults(xSize || {}, utilsDom.getContainerSize(containerNode));

        if (this.config.data.length === 0) {
            containerNode.innerHTML = this._emptyContainer;
            return;
        }
        containerNode.innerHTML = '';

        var domainMixin = new UnitDomainMixin(this.config.spec.dimensions, this.config.data);

        var specEngine = SpecEngineFactory.get(this.config.settings.specEngine, this.config.settings);

        var fullSpec = specEngine(this.config.spec, domainMixin.mix({}));

        var traverseFromDeep = (root) => {
            var r;

            if (!root.unit) {
                r = { w: 0, h: 0 };
            }
            else {
                var s = traverseFromDeep(root.unit[0]);
                var g = root.guide;
                var xmd = g.x.$minimalDomain || 1;
                var ymd = g.y.$minimalDomain || 1;
                var maxW = Math.max((xmd * g.x.density), (xmd * s.w));
                var maxH = Math.max((ymd * g.y.density), (ymd * s.h));

                r = {
                    w: maxW + g.padding.l + g.padding.r,
                    h: maxH + g.padding.t + g.padding.b
                };
            }

            return r;
        };

        var optimalSize = traverseFromDeep(fullSpec.unit);
        var recommendedWidth = optimalSize.w;
        var recommendedHeight = optimalSize.h;

        var scrollSize = utilsDom.getScrollbarWidth();

        var deltaW = (size.width - recommendedWidth);
        var deltaH = (size.height - recommendedHeight);

        var screenW = (deltaW >= 0) ? size.width : recommendedWidth;
        var scrollW = (deltaH >= 0) ? 0 : scrollSize;

        var screenH = (deltaH >= 0) ? size.height : recommendedHeight;
        var scrollH = (deltaW >= 0) ? 0 : scrollSize;

        size.height = screenH - scrollH;
        size.width  = screenW - scrollW;


        // optimize full spec depending on size
        var localSettings = this.config.settings;
        var traverseToDeep = (root, size) => {

            var mdx = root.guide.x.$minimalDomain || 1;
            var mdy = root.guide.y.$minimalDomain || 1;

            var perTickX = size.width / mdx;
            var perTickY = size.height / mdy;

            var densityKoeff = localSettings.xMinimumDensityKoeff;
            if (root.guide.x.hide !== true && root.guide.x.rotate !== 0 && (perTickX > (densityKoeff * root.guide.x.$maxTickTextW))) {
                root.guide.x.rotate = 0;
                root.guide.x.textAnchor = 'middle';
                root.guide.x.tickFormatWordWrapLimit = perTickX;
                var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);

                var xDelta = 0 - s + root.guide.x.$maxTickTextH;

                root.guide.x.label.padding = (root.guide.x.label.padding > 0) ? root.guide.x.label.padding + xDelta : root.guide.x.label.padding;
                root.guide.padding.b = (root.guide.padding.b > 0) ? root.guide.padding.b + xDelta : root.guide.padding.b;
            }

            var newSize = {
                width: perTickX,
                height: perTickY
            };

            if (root.unit) {
                traverseToDeep(root.unit[0], newSize);
            }
        };

        traverseToDeep(fullSpec.unit, size);


        var reader = new DSLReader(domainMixin, UnitsRegistry);

        var logicXGraph = reader.buildGraph(fullSpec);
        var layoutGraph = LayoutEngineFactory.get(this.config.settings.layoutEngine)(logicXGraph);
        var renderGraph = reader.calcLayout(layoutGraph, size);
        var svgXElement = reader.renderGraph(
            renderGraph,
            container
                .append("svg")
                .attr("class", CSS_PREFIX + 'svg')
                .attr("width", size.width)
                .attr("height", size.height)
        );

        //plugins
        svgXElement.selectAll('.i-role-datum').call(propagateDatumEvents(this));
        this.fire('render', svgXElement);
    }
    getData() {
        return this.config.data;
    }
    setData(data) {
        this.config.data = data;
        this.renderTo(this.target, this.targetSizes);
    }
}
