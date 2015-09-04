import {default as _} from 'underscore';
import {utils} from './utils/utils';
import {utilsDraw} from './utils/utils-draw';
import {FormatterRegistry} from './formatter-registry';
import {utilsDom} from './utils/utils-dom';

function extendGuide(guide, targetUnit, dimension, properties) {
    var guide_dim = guide.hasOwnProperty(dimension) ? guide[dimension] : {};
    guide_dim = guide_dim || {};
    _.each(properties, (prop) => {
        _.extend(targetUnit.guide[dimension][prop], guide_dim[prop]);
    });
    _.extend(targetUnit.guide[dimension], _.omit.apply(_, [guide_dim].concat[properties]));
}

var applyCustomProps = (targetUnit, customUnit) => {
    var guide = customUnit.guide || {};
    var config = {
        x: ['label'],
        y: ['label'],
        size: ['label'],
        color: ['label'],
        padding: []
    };

    _.each(config, (properties, name)=> {
        extendGuide(guide, targetUnit, name, properties);
    });
    _.extend(targetUnit.guide, _.omit.apply(_, [guide].concat(_.keys(config))));
    return targetUnit;
};

var extendLabel = function (guide, dimension, extend) {
    guide[dimension] = _.defaults(guide[dimension] || {}, {
        label: ''
    });
    guide[dimension].label = _.isObject(guide[dimension].label) ?
        guide[dimension].label :
    {text: guide[dimension].label};
    guide[dimension].label = _.defaults(
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
var extendAxis = function (guide, dimension, extend) {
    guide[dimension] = _.defaults(
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
    return guide[dimension];
};

var applyNodeDefaults = (node) => {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = _.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

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

var inheritProps = (childUnit, root) => {

    childUnit.guide = childUnit.guide || {};
    childUnit.guide.padding = childUnit.guide.padding || {l: 0, t: 0, r: 0, b: 0};

    // leaf elements should inherit coordinates properties
    if (!childUnit.hasOwnProperty('units')) {
        childUnit = _.defaults(childUnit, root);
        childUnit.guide = _.defaults(childUnit.guide, utils.clone(root.guide));
        childUnit.guide.x = _.defaults(childUnit.guide.x, utils.clone(root.guide.x));
        childUnit.guide.y = _.defaults(childUnit.guide.y, utils.clone(root.guide.y));
    }

    return childUnit;
};

var createSelectorPredicates = (root) => {

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

    var maxXTickText = _.max(domainValues, (x) => formatter(x).toString().length);

    // d3 sometimes produce fractional ticks on wide space
    // so we intentionally add fractional suffix
    // to foresee scale density issues
    var suffix = _.isNumber(maxXTickText) ? '.00' : '';

    return fnCalcTickLabelSize(formatter(maxXTickText) + suffix);
};

var getTickFormat = (dim, defaultFormats) => {
    var dimType = dim.dimType;
    var scaleType = dim.scaleType;
    var specifier = '*';

    var key = [dimType, scaleType, specifier].join(':');
    var tag = [dimType, scaleType].join(':');
    return defaultFormats[key] || defaultFormats[tag] || defaultFormats[dimType] || null;
};

var calcUnitGuide = function (unit, meta, settings, allowXVertical, allowYVertical, inlineLabels) {

    var dimX = meta.dimension(unit.x);
    var dimY = meta.dimension(unit.y);

    var isXContinues = (dimX.dimType === 'measure');
    var isYContinues = (dimY.dimType === 'measure');

    var xDensityPadding = settings.hasOwnProperty('xDensityPadding:' + dimX.dimType) ?
        settings['xDensityPadding:' + dimX.dimType] :
        settings.xDensityPadding;

    var yDensityPadding = settings.hasOwnProperty('yDensityPadding:' + dimY.dimType) ?
        settings['yDensityPadding:' + dimY.dimType] :
        settings.yDensityPadding;

    var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
    var xValues = xMeta.values;
    var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
    var yValues = yMeta.values;

    unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats);
    unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats);

    if (['day', 'week', 'month'].indexOf(unit.guide.x.tickFormat) >= 0) {
        unit.guide.x.tickFormat += '-short';
    }

    if (['day', 'week', 'month'].indexOf(unit.guide.y.tickFormat) >= 0) {
        unit.guide.y.tickFormat += '-short';
    }

    var xIsEmptyAxis = (xValues.length === 0);
    var yIsEmptyAxis = (yValues.length === 0);

    var maxXTickSize = getMaxTickLabelSize(
        xValues,
        FormatterRegistry.get(unit.guide.x.tickFormat, unit.guide.x.tickFormatNullAlias),
        settings.getAxisTickLabelSize,
        settings.xAxisTickLabelLimit);

    var maxYTickSize = getMaxTickLabelSize(
        yValues,
        FormatterRegistry.get(unit.guide.y.tickFormat, unit.guide.y.tickFormatNullAlias),
        settings.getAxisTickLabelSize,
        settings.yAxisTickLabelLimit);

    var xAxisPadding = settings.xAxisPadding;
    var yAxisPadding = settings.yAxisPadding;

    var isXVertical = allowXVertical ? !isXContinues : false;
    var isYVertical = allowYVertical ? !isYContinues : false;

    unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
    unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

    unit.guide.x.rotate = isXVertical ? 90 : 0;
    unit.guide.x.textAnchor = isXVertical ? 'start' : unit.guide.x.textAnchor;

    unit.guide.y.rotate = isYVertical ? -90 : 0;
    unit.guide.y.textAnchor = isYVertical ? 'middle' : unit.guide.y.textAnchor;

    var xTickWidth = xIsEmptyAxis ? 0 : settings.xTickWidth;
    var yTickWidth = yIsEmptyAxis ? 0 : settings.yTickWidth;

    unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
    unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

    var xTickBox = isXVertical ?
    {w: maxXTickSize.height, h: maxXTickSize.width} :
    {h: maxXTickSize.height, w: maxXTickSize.width};

    if (maxXTickSize.width > settings.xAxisTickLabelLimit) {

        unit.guide.x.tickFormatWordWrap = true;
        unit.guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;

        let guessLinesCount = Math.ceil(maxXTickSize.width / settings.xAxisTickLabelLimit);
        let koeffLinesCount = Math.min(guessLinesCount, settings.xTickWordWrapLinesLimit);
        let textLinesHeight = koeffLinesCount * maxXTickSize.height;

        if (isXVertical) {
            xTickBox.h = settings.xAxisTickLabelLimit;
            xTickBox.w = textLinesHeight;
        } else {
            xTickBox.h = textLinesHeight;
            xTickBox.w = settings.xAxisTickLabelLimit;
        }
    }

    var yTickBox = isYVertical ?
    {w: maxYTickSize.height, h: maxYTickSize.width} :
    {h: maxYTickSize.height, w: maxYTickSize.width};

    if (maxYTickSize.width > settings.yAxisTickLabelLimit) {

        unit.guide.y.tickFormatWordWrap = true;
        unit.guide.y.tickFormatWordWrapLines = settings.yTickWordWrapLinesLimit;

        let guessLinesCount = Math.ceil(maxYTickSize.width / settings.yAxisTickLabelLimit);
        let koeffLinesCount = Math.min(guessLinesCount, settings.yTickWordWrapLinesLimit);
        let textLinesHeight = koeffLinesCount * maxYTickSize.height;

        if (isYVertical) {
            yTickBox.w = textLinesHeight;
            yTickBox.h = settings.yAxisTickLabelLimit;
        } else {
            yTickBox.w = settings.yAxisTickLabelLimit;
            yTickBox.h = textLinesHeight;
        }
    }

    var xFontH = xTickWidth + xTickBox.h;
    var yFontW = yTickWidth + yTickBox.w;

    var xFontLabelHeight = settings.xFontLabelHeight;
    var yFontLabelHeight = settings.yFontLabelHeight;

    var distToXAxisLabel = settings.distToXAxisLabel;
    var distToYAxisLabel = settings.distToYAxisLabel;

    unit.guide.x.density = xTickBox.w + xDensityPadding * 2;
    unit.guide.y.density = yTickBox.h + yDensityPadding * 2;

    if (!inlineLabels) {
        unit.guide.x.label.padding = xFontLabelHeight + ((unit.guide.x.label.text) ? (xFontH + distToXAxisLabel) : 0);
        unit.guide.y.label.padding = -xFontLabelHeight + ((unit.guide.y.label.text) ? (yFontW + distToYAxisLabel) : 0);

        let xLabelPadding = (unit.guide.x.label.text) ? (unit.guide.x.label.padding + xFontLabelHeight) : (xFontH);
        let yLabelPadding = (unit.guide.y.label.text) ? (unit.guide.y.label.padding + yFontLabelHeight) : (yFontW);

        unit.guide.padding.b = xAxisPadding + xLabelPadding - xTickWidth;
        unit.guide.padding.l = yAxisPadding + yLabelPadding;

        unit.guide.padding.b = (unit.guide.x.hide) ? 0 : unit.guide.padding.b;
        unit.guide.padding.l = (unit.guide.y.hide) ? 0 : unit.guide.padding.l;
    } else {
        var pd = (xAxisPadding - xFontLabelHeight) / 2;
        unit.guide.x.label.padding = 0 + xFontLabelHeight - distToXAxisLabel + pd;
        unit.guide.y.label.padding = 0 - distToYAxisLabel + pd;

        unit.guide.x.label.cssClass += ' inline';
        unit.guide.x.label.dock = 'right';
        unit.guide.x.label.textAnchor = 'end';

        unit.guide.y.label.cssClass += ' inline';
        unit.guide.y.label.dock = 'right';
        unit.guide.y.label.textAnchor = 'end';

        unit.guide.padding.b = xAxisPadding + xFontH;
        unit.guide.padding.l = yAxisPadding + yFontW;

        unit.guide.padding.b = (unit.guide.x.hide) ? 0 : unit.guide.padding.b;
        unit.guide.padding.l = (unit.guide.y.hide) ? 0 : unit.guide.padding.l;
    }

    unit.guide.x.tickFontHeight = maxXTickSize.height;
    unit.guide.y.tickFontHeight = maxYTickSize.height;

    unit.guide.x.$minimalDomain = xValues.length;
    unit.guide.y.$minimalDomain = yValues.length;

    unit.guide.x.$maxTickTextW = maxXTickSize.width;
    unit.guide.x.$maxTickTextH = maxXTickSize.height;

    unit.guide.y.$maxTickTextW = maxYTickSize.width;
    unit.guide.y.$maxTickTextH = maxYTickSize.height;

    return unit;
};

var SpecEngineTypeMap = {

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

    'BUILD-LABELS': (srcSpec, meta, settings) => {

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

                unit.guide.x.label = _.isObject(unit.guide.x.label) ? unit.guide.x.label : {text: unit.guide.x.label};
                unit.guide.y.label = _.isObject(unit.guide.y.label) ? unit.guide.y.label : {text: unit.guide.y.label};

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
                }

                var y = unit.guide.y.label.text;
                if (y) {
                    yLabels.push(y);
                    unit.guide.y.tickFormatNullAlias = unit.guide.y.hasOwnProperty('tickFormatNullAlias') ?
                        unit.guide.y.tickFormatNullAlias :
                    'No ' + y;
                    unit.guide.y.label.text = '';
                }

                return unit;
            });

        if (xUnit) {
            xUnit.guide.x.label.text = xLabels.join(' → ');
        }

        if (yUnit) {
            yUnit.guide.y.label.text = yLabels.join(' → ');
        }

        return spec;
    },

    'BUILD-GUIDE': (srcSpec, meta, settings) => {

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

                var isFacetUnit = (!selectorPredicates.isLeaf && !selectorPredicates.isLeafParent);
                if (isFacetUnit) {
                    // unit is a facet!
                    unit.guide.x.cssClass += ' facet-axis';
                    unit.guide.x.avoidCollisions = true;
                    unit.guide.y.cssClass += ' facet-axis';
                    unit.guide.y.avoidCollisions = false;
                }

                var dimX = meta.dimension(unit.x);
                var dimY = meta.dimension(unit.y);

                var isXContinues = (dimX.dimType === 'measure');
                var isYContinues = (dimY.dimType === 'measure');

                var xDensityPadding = settings.hasOwnProperty('xDensityPadding:' + dimX.dimType) ?
                    settings['xDensityPadding:' + dimX.dimType] :
                    settings.xDensityPadding;

                var yDensityPadding = settings.hasOwnProperty('yDensityPadding:' + dimY.dimType) ?
                    settings['yDensityPadding:' + dimY.dimType] :
                    settings.yDensityPadding;

                var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
                var xValues = xMeta.values;
                var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
                var yValues = yMeta.values;

                unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats);
                unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats);

                var xIsEmptyAxis = (xValues.length === 0);
                var yIsEmptyAxis = (yValues.length === 0);

                var maxXTickSize = getMaxTickLabelSize(
                    xValues,
                    FormatterRegistry.get(unit.guide.x.tickFormat, unit.guide.x.tickFormatNullAlias),
                    settings.getAxisTickLabelSize,
                    settings.xAxisTickLabelLimit);

                var maxYTickSize = getMaxTickLabelSize(
                    yValues,
                    FormatterRegistry.get(unit.guide.y.tickFormat, unit.guide.y.tickFormatNullAlias),
                    settings.getAxisTickLabelSize,
                    settings.yAxisTickLabelLimit);

                var xAxisPadding = selectorPredicates.isLeafParent ? settings.xAxisPadding : 0;
                var yAxisPadding = selectorPredicates.isLeafParent ? settings.yAxisPadding : 0;

                var isXVertical = !isFacetUnit && (Boolean(dimX.dimType) && dimX.dimType !== 'measure');

                unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
                unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

                unit.guide.x.rotate = isXVertical ? 90 : 0;
                unit.guide.x.textAnchor = isXVertical ? 'start' : unit.guide.x.textAnchor;

                var xTickWidth = xIsEmptyAxis ? 0 : settings.xTickWidth;
                var yTickWidth = yIsEmptyAxis ? 0 : settings.yTickWidth;

                unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
                unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

                var maxXTickH = isXVertical ? maxXTickSize.width : maxXTickSize.height;

                if (!isXContinues && (maxXTickH > settings.xAxisTickLabelLimit)) {
                    maxXTickH = settings.xAxisTickLabelLimit;
                }

                if (!isXVertical && (maxXTickSize.width > settings.xAxisTickLabelLimit)) {
                    unit.guide.x.tickFormatWordWrap = true;
                    unit.guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;
                    maxXTickH = settings.xTickWordWrapLinesLimit * maxXTickSize.height;
                }

                var maxYTickW = maxYTickSize.width;
                if (!isYContinues && (maxYTickW > settings.yAxisTickLabelLimit)) {
                    maxYTickW = settings.yAxisTickLabelLimit;
                    unit.guide.y.tickFormatWordWrap = true;
                    unit.guide.y.tickFormatWordWrapLines = settings.yTickWordWrapLinesLimit;
                }

                var xFontH = xTickWidth + maxXTickH;
                var yFontW = yTickWidth + maxYTickW;

                var xFontLabelHeight = settings.xFontLabelHeight;
                var yFontLabelHeight = settings.yFontLabelHeight;

                var distToXAxisLabel = settings.distToXAxisLabel;
                var distToYAxisLabel = settings.distToYAxisLabel;

                var xTickLabelW = Math.min(
                    settings.xAxisTickLabelLimit,
                    (isXVertical ? maxXTickSize.height : maxXTickSize.width)
                );
                unit.guide.x.density = xTickLabelW + xDensityPadding * 2;

                var guessLinesCount = Math.ceil(maxYTickSize.width / settings.yAxisTickLabelLimit);
                var koeffLinesCount = Math.min(guessLinesCount, settings.yTickWordWrapLinesLimit);
                var yTickLabelH = Math.min(settings.yAxisTickLabelLimit, koeffLinesCount * maxYTickSize.height);
                unit.guide.y.density = yTickLabelH + yDensityPadding * 2;

                unit.guide.x.label.padding = (unit.guide.x.label.text) ? (xFontH + distToXAxisLabel) : 0;
                unit.guide.y.label.padding = (unit.guide.y.label.text) ? (yFontW + distToYAxisLabel) : 0;

                var xLabelPadding = (unit.guide.x.label.text) ?
                    (unit.guide.x.label.padding + xFontLabelHeight) :
                    (xFontH);
                var yLabelPadding = (unit.guide.y.label.text) ?
                    (unit.guide.y.label.padding + yFontLabelHeight) :
                    (yFontW);

                unit.guide.padding.b = xAxisPadding + xLabelPadding;
                unit.guide.padding.l = yAxisPadding + yLabelPadding;

                unit.guide.padding.b = (unit.guide.x.hide) ? 0 : unit.guide.padding.b;
                unit.guide.padding.l = (unit.guide.y.hide) ? 0 : unit.guide.padding.l;

                unit.guide.x.tickFontHeight = maxXTickSize.height;
                unit.guide.y.tickFontHeight = maxYTickSize.height;

                unit.guide.x.$minimalDomain = xValues.length;
                unit.guide.y.$minimalDomain = yValues.length;

                unit.guide.x.$maxTickTextW = maxXTickSize.width;
                unit.guide.x.$maxTickTextH = maxXTickSize.height;

                unit.guide.y.$maxTickTextW = maxYTickSize.width;
                unit.guide.y.$maxTickTextH = maxYTickSize.height;

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

                    return calcUnitGuide(
                        unit,
                        meta,
                        _.defaults(
                            {
                                xTickWordWrapLinesLimit: 1,
                                yTickWordWrapLinesLimit: 1
                            },
                            settings),
                        true,
                        false,
                        true);
                }

                // facet level
                unit.guide.x.cssClass += ' facet-axis compact';
                unit.guide.x.avoidCollisions = true;
                unit.guide.y.cssClass += ' facet-axis compact';
                unit.guide.y.avoidCollisions = true;

                return calcUnitGuide(
                    unit,
                    meta,
                    _.defaults(
                        {
                            xAxisPadding: 0,
                            yAxisPadding: 0,
                            distToXAxisLabel: 0,
                            distToYAxisLabel: 0,
                            xTickWordWrapLinesLimit: 1,
                            yTickWordWrapLinesLimit: 1
                        },
                        settings),
                    false,
                    true,
                    false);
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
    var prop = _.omit(xRef, 'units');
    (xRef.units || []).forEach((unit) => fnTraverseSpec(utils.clone(unit), inheritProps(unit, prop), transformRules));
    return xRef;
};

var SpecEngineFactory = {
    get: (typeName, settings, srcSpec, fnCreateScale) => {

        var engine = (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.NONE);
        var meta = {

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
                return {
                    values: scale.domain()
                };
            }
        };

        var unitSpec = {unit: utils.clone(srcSpec.unit)};
        var fullSpec = engine(unitSpec, meta, settings);
        srcSpec.unit = fullSpec.unit;
        return srcSpec;
    }
};

export class SpecTransformAutoLayout {

    constructor(spec) {
        this.spec = spec;
        this.isApplicable = utils.isSpecRectCoordsOnly(spec.unit);
    }

    transform(chart) {

        var spec = this.spec;

        if (!this.isApplicable) {
            return spec;
        }

        var size = spec.settings.size;

        var rule = _.find(spec.settings.specEngine, (rule) => (size.width <= rule.width));

        return SpecEngineFactory.get(
            rule.name,
            spec.settings,
            spec,
            (type, alias) => chart.getScaleInfo(alias || `${type}:default`)
        );
    }
}