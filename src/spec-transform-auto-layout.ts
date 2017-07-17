import * as utils from './utils/utils';
import {FormatterRegistry} from './formatter-registry';
import * as d3 from 'd3-scale';
import {
    ChartSettings,
    GPLSpec,
    GPLSpecScale,
    ScaleGuide,
    SpecTransformer,
    Unit,
    UnitGuide
} from './definitions';
import {Plot} from './charts/tau.plot';

interface EngineMeta {
    dimension(scaleId: string): {
        dimName: string;
        dimType: string;
        scaleType: string;
    };
    scaleMeta(scaleId: string, guide: ScaleGuide): {
        dimName: string;
        dimType: string;
        scaleType: string;
        values: any[];
        isEmpty: boolean;
    };
}

var sum = ((arr: number[]) => arr.reduce((sum, x) => (sum + x), 0));

function extendGuide(guide: UnitGuide, targetUnit: Unit, dimension: string, properties: any[]) {
    var guide_dim = guide.hasOwnProperty(dimension) ? guide[dimension] : {};
    guide_dim = guide_dim || {};
    properties.forEach((prop) => {
        Object.assign(targetUnit.guide[dimension][prop], guide_dim[prop]);
    });
}

var applyCustomProps = (targetUnit: Unit, customUnit: Unit) => {
    var guide = customUnit.guide || {};
    var config = {
        x: ['label'],
        y: ['label'],
        size: ['label'],
        color: ['label'],
        padding: []
    };

    Object.keys(config).forEach((name) => {
        let properties = config[name];
        extendGuide(guide, targetUnit, name, properties);
    });
    Object.assign(targetUnit.guide, Object.keys(guide).reduce((obj, k) => {
        if (!config.hasOwnProperty(k)) {
            obj[k] = guide[k];
        }
        return obj;
    }, {}));

    return targetUnit;
};

var extendLabel = function (guide: UnitGuide, dimension: string, extend?) {
    guide[dimension] = utils.defaults(guide[dimension] || {}, {
        label: ''
    });
    guide[dimension].label = utils.isObject(guide[dimension].label) ?
        guide[dimension].label :
    {text: guide[dimension].label};
    guide[dimension].label = utils.defaults(
        guide[dimension].label,
        extend || {},
        {
            padding: 32,
            rotate: 0,
            textAnchor: 'middle',
            cssClass: 'label',
            dock: null
        }
    );

    return guide[dimension];
};
var extendAxis = function (guide: UnitGuide, dimension: 'x' | 'y', extend?) {
    guide[dimension] = utils.defaults(
        guide[dimension],
        extend || {},
        {
            padding: 0,
            density: 30,
            rotate: 0,
            tickPeriod: null,
            tickFormat: null,
            autoScale: true
        }
    );
    guide[dimension].tickFormat = guide[dimension].tickFormat || guide[dimension].tickPeriod;
    guide[dimension].nice = guide[dimension].hasOwnProperty('nice') ?
        guide[dimension].nice :
        guide[dimension].autoScale;

    return guide[dimension];
};

var applyNodeDefaults = (node: Unit) => {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = utils.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

    node.guide.x = extendLabel(node.guide, 'x');
    node.guide.x = extendAxis(node.guide, 'x', {
        cssClass: 'x axis',
        scaleOrient: 'bottom',
        textAnchor: 'middle'
    });

    node.guide.y = extendLabel(node.guide, 'y', {rotate: -90});
    node.guide.y = extendAxis(node.guide, 'y', {
        cssClass: 'y axis',
        scaleOrient: 'left',
        textAnchor: 'end'
    });

    node.guide.size = extendLabel(node.guide, 'size');
    node.guide.color = extendLabel(node.guide, 'color');

    return node;
};

var inheritProps = (childUnit: Unit, root: Unit) => {

    childUnit.guide = childUnit.guide || {};
    childUnit.guide.padding = childUnit.guide.padding || {l: 0, t: 0, r: 0, b: 0};

    // leaf elements should inherit coordinates properties
    if (!childUnit.hasOwnProperty('units')) {
        childUnit = utils.defaults(childUnit, root);
        childUnit.guide = utils.defaults(childUnit.guide, utils.clone(root.guide));
        childUnit.guide.x = utils.defaults(childUnit.guide.x, utils.clone(root.guide.x));
        childUnit.guide.y = utils.defaults(childUnit.guide.y, utils.clone(root.guide.y));
    }

    return childUnit;
};

var createSelectorPredicates = (root: Unit) => {

    var children = root.units || [];

    var isLeaf = !root.hasOwnProperty('units');
    var isLeafParent = !children.some((c) => c.hasOwnProperty('units'));

    return {
        type: root.type,
        isLeaf: isLeaf,
        isLeafParent: !isLeaf && isLeafParent
    };
};

var getMaxTickLabelSize = function (domainValues, formatter, fnCalcTickLabelSize, axisLabelLimit) {

    if (domainValues.length === 0) {
        return {width: 0, height: 0};
    }

    if (formatter === null) {
        var size = fnCalcTickLabelSize('TauChart Library');
        size.width = axisLabelLimit * 0.625; // golden ratio
        return size;
    }

    if (domainValues.every(d => (typeof d === 'number'))) {
        domainValues = d3.scaleLinear().domain(domainValues).ticks();
    }

    var maxXTickText = domainValues.reduce((prev, value) => {
        let computed = formatter(value).toString().length;

        if (!prev.computed || computed > prev.computed) {
            return {
                value: value,
                computed: computed
            };
        }
        return prev;
    }, {}).value;

    return fnCalcTickLabelSize(formatter(maxXTickText));
};

var getTickFormat = (dim, defaultFormats) => {
    var dimType = dim.dimType;
    var scaleType = dim.scaleType;
    var specifier = '*';

    var key = [dimType, scaleType, specifier].join(':');
    var tag = [dimType, scaleType].join(':');
    return defaultFormats[key] || defaultFormats[tag] || defaultFormats[dimType] || null;
};

var getSettings = (settings, prop, dimType) => {
    return settings.hasOwnProperty(`${prop}:${dimType}`) ?
        settings[`${prop}:${dimType}`] :
        settings[`${prop}`];
};

var shortFormat = (format, utc) => {
    var timeFormats = ['day', 'week', 'month'];
    if (timeFormats.indexOf(format) >= 0) {
        format += `-short${utc ? '-utc' : ''}`;
    }

    return format;
};

var rotateBox = ({width, height}, angle) => {
    var rad = Math.abs(utils.toRadian(angle));
    return {
        width: Math.max(Math.cos(rad) * width, height),
        height: Math.max(Math.sin(rad) * width, height)
    };
};

var getTextAnchorByAngle = (xAngle: number, xOrY = 'x') => {

    var angle = utils.normalizeAngle(xAngle);

    var xRules: [number, number, string][] = (xOrY === 'x') ?
        ([
            [0, 45, 'middle'],
            [45, 135, 'start'],
            [135, 225, 'middle'],
            [225, 315, 'end'],
            [315, 360, 'middle']
        ]) :
        ([
            [0, 90, 'end'],
            [90, 135, 'middle'],
            [135, 225, 'start'],
            [225, 315, 'middle'],
            [315, 360, 'end']
        ]);

    var i = xRules.findIndex((r) => (angle >= r[0] && angle < r[1]));

    return xRules[i][2];
};

var wrapLine = (box, lineWidthLimit, linesCountLimit) => {
    let guessLinesCount = Math.ceil(box.width / lineWidthLimit);
    let koeffLinesCount = Math.min(guessLinesCount, linesCountLimit);
    return {
        height: koeffLinesCount * box.height,
        width: lineWidthLimit
    };
};

var calcXYGuide = function (guide: UnitGuide, settings: ChartSettings, xMeta, yMeta, inlineLabels?: boolean) {

    var xValues = xMeta.values;
    var yValues = yMeta.values;
    var xIsEmptyAxis = (xMeta.isEmpty || guide.x.hideTicks);
    var yIsEmptyAxis = (yMeta.isEmpty || guide.y.hideTicks);

    var maxXTickBox = getMaxTickLabelSize(
        xValues,
        FormatterRegistry.get(guide.x.tickFormat, guide.x.tickFormatNullAlias),
        settings.getAxisTickLabelSize,
        settings.xAxisTickLabelLimit);

    var maxYTickBox = getMaxTickLabelSize(
        yValues,
        FormatterRegistry.get(guide.y.tickFormat, guide.y.tickFormatNullAlias),
        settings.getAxisTickLabelSize,
        settings.yAxisTickLabelLimit);

    var multiLinesXBox = maxXTickBox;
    var multiLinesYBox = maxYTickBox;

    if (maxXTickBox.width > settings.xAxisTickLabelLimit) {
        guide.x.tickFormatWordWrap = true;
        guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;
        multiLinesXBox = wrapLine(maxXTickBox, settings.xAxisTickLabelLimit, settings.xTickWordWrapLinesLimit);
    }

    if (maxYTickBox.width > settings.yAxisTickLabelLimit) {
        guide.y.tickFormatWordWrap = true;
        guide.y.tickFormatWordWrapLines = settings.yTickWordWrapLinesLimit;
        multiLinesYBox = wrapLine(maxYTickBox, settings.yAxisTickLabelLimit, settings.yTickWordWrapLinesLimit);
    }

    var kxAxisW = xIsEmptyAxis ? 0 : 1;
    var kyAxisW = yIsEmptyAxis ? 0 : 1;

    var xLabel = guide.x.label;
    var yLabel = guide.y.label;
    var kxLabelW = (xLabel.text && !xLabel.hide) ? 1 : 0;
    var kyLabelW = (yLabel.text && !yLabel.hide) ? 1 : 0;

    var rotXBox = rotateBox(multiLinesXBox, guide.x.rotate);
    var rotYBox = rotateBox(multiLinesYBox, guide.y.rotate);

    if (inlineLabels) {

        xLabel.padding = (-settings.xAxisPadding - settings.xFontLabelHeight) / 2 + settings.xFontLabelHeight;
        xLabel.paddingNoTicks = xLabel.padding;
        yLabel.padding = (-settings.yAxisPadding - settings.yFontLabelHeight) / 2;
        yLabel.paddingNoTicks = yLabel.padding;

        kxLabelW = 0;
        kyLabelW = 0;

    } else {

        xLabel.padding = sum([
            (kxAxisW * (settings.xTickWidth + rotXBox.height)),
            (kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight))
        ]);
        xLabel.paddingNoTicks = (kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight));

        yLabel.padding = sum([
            (kyAxisW * (settings.yTickWidth + rotYBox.width)),
            (kyLabelW * settings.distToYAxisLabel)
        ]);
        yLabel.paddingNoTicks = (kyLabelW * settings.distToYAxisLabel);
    }

    const bottomBorder = settings.xFontLabelDescenderLineHeight; // for font descender line
    guide.padding = Object.assign(
        (guide.padding),
        {
            b: (guide.x.hide) ?
                (0) :
                sum([
                    (guide.x.padding),
                    (kxAxisW * (settings.xTickWidth + rotXBox.height)),
                    (kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight + bottomBorder))
                ]),
            l: (guide.y.hide) ?
                (0) :
                sum([
                    (guide.y.padding),
                    (kyAxisW * (settings.yTickWidth + rotYBox.width)),
                    (kyLabelW * (settings.distToYAxisLabel + settings.yFontLabelHeight))
                ])
        });
    guide.paddingNoTicks = Object.assign(
        {},
        (guide.paddingNoTicks),
        {
            b: (guide.x.hide) ?
                (0) :
                sum([
                    (guide.x.padding),
                    (kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight + bottomBorder))
                ]),
            l: (guide.y.hide) ?
                (0) :
                sum([
                    (guide.y.padding),
                    (kyLabelW * (settings.distToYAxisLabel + settings.yFontLabelHeight))
                ])
        });

    guide.x = Object.assign(
        (guide.x),
        {
            density: (rotXBox.width + getSettings(settings, 'xDensityPadding', xMeta.dimType) * 2),
            tickFontHeight: maxXTickBox.height,
            $minimalDomain: xValues.length,
            $maxTickTextW: multiLinesXBox.width,
            $maxTickTextH: multiLinesXBox.height,
            tickFormatWordWrapLimit: settings.xAxisTickLabelLimit
        });

    guide.y = Object.assign(
        (guide.y),
        {
            density: (rotYBox.height + getSettings(settings, 'yDensityPadding', yMeta.dimType) * 2),
            tickFontHeight: maxYTickBox.height,
            $minimalDomain: yValues.length,
            $maxTickTextW: multiLinesYBox.width,
            $maxTickTextH: multiLinesYBox.height,
            tickFormatWordWrapLimit: settings.yAxisTickLabelLimit
        });

    return guide;
};

interface CalcUnitArgs {
    unit: Unit;
    meta: EngineMeta;
    settings: ChartSettings;
    allowXVertical: boolean;
    allowYVertical: boolean;
    inlineLabels: boolean;
}

var calcUnitGuide = function ({unit, meta, settings, allowXVertical, allowYVertical, inlineLabels}: CalcUnitArgs) {

    var dimX = meta.dimension(unit.x);
    var dimY = meta.dimension(unit.y);

    var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
    var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
    var xIsEmptyAxis = (xMeta.isEmpty);
    var yIsEmptyAxis = (yMeta.isEmpty);

    unit.guide.x.tickFormat = shortFormat(
        (unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats)),
        settings.utcTime);
    unit.guide.y.tickFormat = shortFormat(
        (unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats)),
        settings.utcTime);

    var isXVertical = allowXVertical ? !(dimX.dimType === 'measure') : false;
    var isYVertical = allowYVertical ? !(dimY.dimType === 'measure') : false;

    unit.guide.x.padding = xIsEmptyAxis ? 0 : settings.xAxisPadding;
    unit.guide.x.paddingNoTicks = unit.guide.x.padding;
    unit.guide.y.padding = yIsEmptyAxis ? 0 : settings.yAxisPadding;
    unit.guide.y.paddingNoTicks = unit.guide.y.padding;

    unit.guide.x.rotate = isXVertical ? -90 : 0;
    unit.guide.x.textAnchor = getTextAnchorByAngle(unit.guide.x.rotate, 'x');

    unit.guide.y.rotate = isYVertical ? -90 : 0;
    unit.guide.y.textAnchor = getTextAnchorByAngle(unit.guide.y.rotate, 'y');

    unit.guide = calcXYGuide(unit.guide, settings, xMeta, yMeta, inlineLabels);

    if (inlineLabels) {

        let xLabel = unit.guide.x.label;
        let yLabel = unit.guide.y.label;

        xLabel.cssClass += ' inline';
        xLabel.dock = 'right';
        xLabel.textAnchor = 'end';

        yLabel.cssClass += ' inline';
        yLabel.dock = 'right';
        yLabel.textAnchor = 'end';
    }

    return unit;
};

type SpecEngineFunction = (srcSpec: {unit: Unit}, meta: EngineMeta, settings: ChartSettings) => {unit: Unit};

interface SpecEngines {
    [engine: string]: SpecEngineFunction;
}

var SpecEngineTypeMap: SpecEngines = {

    NONE: (srcSpec, meta, settings) => {

        var spec = utils.clone(srcSpec);
        fnTraverseSpec(
            utils.clone(spec.unit),
            spec.unit,
            (selectorPredicates, unit) => {
                unit.guide.x.tickFontHeight = settings.getAxisTickLabelSize('X').height;
                unit.guide.y.tickFontHeight = settings.getAxisTickLabelSize('Y').height;

                unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
                unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

                return unit;
            });
        return spec;
    },

    'BUILD-LABELS': (srcSpec, meta) => {

        var spec = utils.clone(srcSpec);

        var xLabels = [];
        var yLabels = [];
        var xUnit = null;
        var yUnit = null;

        utils.traverseJSON(
            spec.unit,
            'units',
            createSelectorPredicates,
            (selectors, unit) => {

                if (selectors.isLeaf) {
                    return unit;
                }

                if (!xUnit && unit.x) {
                    xUnit = unit;
                }

                if (!yUnit && unit.y) {
                    yUnit = unit;
                }

                unit.guide = unit.guide || {};

                unit.guide.x = unit.guide.x || {label: ''};
                unit.guide.y = unit.guide.y || {label: ''};

                unit.guide.x.label = utils.isObject(unit.guide.x.label)
                    ? unit.guide.x.label
                    : {text: unit.guide.x.label};
                unit.guide.y.label = utils.isObject(unit.guide.y.label)
                    ? unit.guide.y.label
                    : {text: unit.guide.y.label};

                if (unit.x) {
                    unit.guide.x.label.text = unit.guide.x.label.text || meta.dimension(unit.x).dimName;
                }

                if (unit.y) {
                    unit.guide.y.label.text = unit.guide.y.label.text || meta.dimension(unit.y).dimName;
                }

                var x = unit.guide.x.label.text;
                if (x) {
                    xLabels.push(x);
                    unit.guide.x.tickFormatNullAlias = unit.guide.x.hasOwnProperty('tickFormatNullAlias') ?
                        unit.guide.x.tickFormatNullAlias :
                    'No ' + x;
                    unit.guide.x.label.text = '';
                    unit.guide.x.label._original_text = x;
                }

                var y = unit.guide.y.label.text;
                if (y) {
                    yLabels.push(y);
                    unit.guide.y.tickFormatNullAlias = unit.guide.y.hasOwnProperty('tickFormatNullAlias') ?
                        unit.guide.y.tickFormatNullAlias :
                    'No ' + y;
                    unit.guide.y.label.text = '';
                    unit.guide.y.label._original_text = y;
                }

                return unit;
            });

        const rightArrow = ' \u2192 ';

        if (xUnit) {
            xUnit.guide.x.label.text = (xUnit.guide.x.label.hide) ? '' : xLabels.join(rightArrow);
        }

        if (yUnit) {
            yUnit.guide.y.label.text = (yUnit.guide.y.label.hide) ? '' : yLabels.join(rightArrow);
        }

        return spec;
    },

    'BUILD-GUIDE': (srcSpec, meta, settings) => {

        var spec = utils.clone(srcSpec);
        fnTraverseSpec(
            utils.clone(spec.unit),
            spec.unit,
            (selectorPredicates, unit: Unit) => {

                if (selectorPredicates.isLeaf) {
                    return unit;
                }

                var isFacetUnit = (!selectorPredicates.isLeaf && !selectorPredicates.isLeafParent);

                var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
                var yMeta = meta.scaleMeta(unit.y, unit.guide.y);

                var isXVertical = !isFacetUnit && (Boolean(xMeta.dimType) && xMeta.dimType !== 'measure');

                unit.guide.x.rotate = (isXVertical ? -90 : 0);
                unit.guide.x.textAnchor = getTextAnchorByAngle(unit.guide.x.rotate);

                unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(xMeta, settings.defaultFormats);
                unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(yMeta, settings.defaultFormats);

                unit.guide.x.padding = (isFacetUnit ? 0 : settings.xAxisPadding);
                unit.guide.x.paddingNoTicks = unit.guide.x.padding;
                unit.guide.y.padding = (isFacetUnit ? 0 : settings.yAxisPadding);
                unit.guide.y.paddingNoTicks = unit.guide.y.padding;

                unit.guide = calcXYGuide(
                    unit.guide,
                    utils.defaults(
                        {
                            distToXAxisLabel: (xMeta.isEmpty) ? settings.xTickWidth : settings.distToXAxisLabel,
                            distToYAxisLabel: (yMeta.isEmpty) ? settings.yTickWidth : settings.distToYAxisLabel
                        },
                        settings),
                    xMeta,
                    yMeta);

                unit.guide.x = Object.assign(
                    (unit.guide.x),
                    {
                        cssClass: (isFacetUnit) ? (unit.guide.x.cssClass + ' facet-axis') : (unit.guide.x.cssClass),
                        avoidCollisions: (isFacetUnit) ? true : (unit.guide.x.avoidCollisions)
                    });

                unit.guide.y = Object.assign(
                    (unit.guide.y),
                    {
                        cssClass: (isFacetUnit) ? (unit.guide.y.cssClass + ' facet-axis') : (unit.guide.y.cssClass),
                        avoidCollisions: (isFacetUnit) ? false : (unit.guide.y.avoidCollisions)
                    });

                unit.guide = Object.assign(
                    (unit.guide),
                    {
                        showGridLines: ((unit.guide.hasOwnProperty('showGridLines')) ?
                            (unit.guide.showGridLines) :
                            (selectorPredicates.isLeafParent ? 'xy' : ''))
                    });

                return unit;
            });

        return spec;
    },

    'BUILD-COMPACT': (srcSpec, meta, settings) => {

        var spec = utils.clone(srcSpec);
        fnTraverseSpec(
            utils.clone(spec.unit),
            spec.unit,
            (selectorPredicates, unit) => {

                if (selectorPredicates.isLeaf) {
                    return unit;
                }

                if (!unit.guide.hasOwnProperty('showGridLines')) {
                    unit.guide.showGridLines = selectorPredicates.isLeafParent ? 'xy' : '';
                }

                if (selectorPredicates.isLeafParent) {

                    return calcUnitGuide({
                        unit,
                        meta,
                        settings: utils.defaults(
                            {
                                xTickWordWrapLinesLimit: 1,
                                yTickWordWrapLinesLimit: 1
                            },
                            settings),
                        allowXVertical: true,
                        allowYVertical: false,
                        inlineLabels: true
                    });
                }

                // facet level
                unit.guide.x.cssClass += ' facet-axis compact';
                unit.guide.x.avoidCollisions = true;
                unit.guide.y.cssClass += ' facet-axis compact';
                unit.guide.y.avoidCollisions = true;

                return calcUnitGuide({
                    unit,
                    meta,
                    settings: utils.defaults(
                        {
                            xAxisPadding: 0,
                            yAxisPadding: 0,
                            distToXAxisLabel: 0,
                            distToYAxisLabel: 0,
                            xTickWordWrapLinesLimit: 1,
                            yTickWordWrapLinesLimit: 1
                        },
                        settings),
                    allowXVertical: false,
                    allowYVertical: true,
                    inlineLabels: false
                });
            });

        return spec;
    }
};

SpecEngineTypeMap.AUTO = (srcSpec, meta, settings) => {
    return ['BUILD-LABELS', 'BUILD-GUIDE'].reduce(
        (spec, engineName) => SpecEngineTypeMap[engineName](spec, meta, settings),
        srcSpec
    );
};

SpecEngineTypeMap.COMPACT = (srcSpec, meta, settings) => {
    return ['BUILD-LABELS', 'BUILD-COMPACT'].reduce(
        (spec, engineName) => SpecEngineTypeMap[engineName](spec, meta, settings),
        srcSpec
    );
};

var fnTraverseSpec = (orig, specUnitRef, transformRules) => {
    var xRef = applyNodeDefaults(specUnitRef);
    xRef = transformRules(createSelectorPredicates(xRef), xRef);
    xRef = applyCustomProps(xRef, orig);
    var prop = utils.omit(xRef, 'units');
    (xRef.units || []).forEach((unit) => fnTraverseSpec(utils.clone(unit), inheritProps(unit, prop), transformRules));
    return xRef;
};

var SpecEngineFactory = {
    get: (typeName, settings, srcSpec, fnCreateScale) => {

        var engine = (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.NONE);

        var meta: EngineMeta = {

            dimension: (scaleId) => {
                var scaleCfg = srcSpec.scales[scaleId];
                var dim = srcSpec.sources[scaleCfg.source].dims[scaleCfg.dim] || {};
                return {
                    dimName: scaleCfg.dim,
                    dimType: dim.type,
                    scaleType: scaleCfg.type
                };
            },

            scaleMeta: (scaleId) => {
                var scale = fnCreateScale('pos', scaleId);
                var values = scale.domain();

                var scaleCfg = srcSpec.scales[scaleId];
                var dim = srcSpec.sources[scaleCfg.source].dims[scaleCfg.dim] || {};
                return {
                    dimName: scaleCfg.dim,
                    dimType: dim.type,
                    scaleType: scaleCfg.type,
                    values: values,
                    isEmpty: (dim.type == null)
                    // isEmpty: (source == '?')
                    // isEmpty: ((values.filter((x) => !(x === undefined)).length) === 0)
                };
            }
        };

        var unitSpec = {unit: utils.clone(srcSpec.unit)};
        var fullSpec = engine(unitSpec, meta, settings);
        srcSpec.unit = fullSpec.unit;
        return srcSpec;
    }
};

export class SpecTransformAutoLayout implements SpecTransformer {

    spec: GPLSpec;
    isApplicable: boolean;

    constructor(spec: GPLSpec) {
        this.spec = spec;
        this.isApplicable = utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform(chart: Plot) {

        var spec = this.spec;

        if (!this.isApplicable) {
            return spec;
        }

        var size = spec.settings.size;

        var rule = spec.settings.specEngine.find((rule) => (
            (size.width <= rule.width) ||
            (size.height <= rule.height)
        ));

        return SpecEngineFactory.get(
            rule.name,
            spec.settings,
            spec,
            (type, alias) => chart.getScaleInfo(alias || `${type}:default`)
        );
    }
}
