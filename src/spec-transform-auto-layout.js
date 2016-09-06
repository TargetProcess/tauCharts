import {default as _} from 'underscore';
import {utils} from './utils/utils';
import {FormatterRegistry} from './formatter-registry';

var sum = ((arr) => arr.reduce((sum, x) => (sum + x), 0));

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
    guide[dimension].nice = guide[dimension].hasOwnProperty('nice') ?
        guide[dimension].nice :
        guide[dimension].autoScale;

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

var getSettings = (settings, prop, dimType) => {
    return settings.hasOwnProperty(`${prop}:${dimType}`) ?
        settings[`${prop}:${dimType}`] :
        settings[`${prop}`];
};

var shortFormat = (format) => {
    var timeFormats = ['day', 'week', 'month'];
    if (timeFormats.indexOf(format) >= 0) {
        format += '-short';
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

var getTextAnchorByAngle = (xAngle, xOrY = 'x') => {

    var angle = utils.normalizeAngle(xAngle);

    var xRules = (xOrY === 'x') ?
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

    var i = _.findIndex(xRules, (r) => (angle >= r[0] && angle < r[1]));

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

var calcXYGuide = function (guide, settings, xMeta, yMeta, inlineLabels) {

    var xValues = xMeta.values;
    var yValues = yMeta.values;
    var xIsEmptyAxis = (xMeta.isEmpty);
    var yIsEmptyAxis = (yMeta.isEmpty);

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
        yLabel.padding = (-settings.yAxisPadding - settings.yFontLabelHeight) / 2;

        kxLabelW = 0;
        kyLabelW = 0;

    } else {

        xLabel.padding = sum([
            (kxAxisW * (settings.xTickWidth + rotXBox.height)),
            (kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight))
        ]);

        yLabel.padding = sum([
            (kyAxisW * (settings.yTickWidth + rotYBox.width)),
            (kyLabelW * settings.distToYAxisLabel)
        ]);
    }

    const bottomBorder = settings.xFontLabelDescenderLineHeight; // for font descender line
    guide.padding = _.extend(
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

    guide.x = _.extend(
        (guide.x),
        {
            density: (rotXBox.width + getSettings(settings, 'xDensityPadding', xMeta.dimType) * 2),
            tickFontHeight: maxXTickBox.height,
            $minimalDomain: xValues.length,
            $maxTickTextW: multiLinesXBox.width,
            $maxTickTextH: multiLinesXBox.height,
            tickFormatWordWrapLimit: settings.xAxisTickLabelLimit
        });

    guide.y = _.extend(
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

var calcUnitGuide = function (unit, meta, settings, allowXVertical, allowYVertical, inlineLabels) {

    var dimX = meta.dimension(unit.x);
    var dimY = meta.dimension(unit.y);

    var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
    var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
    var xIsEmptyAxis = (xMeta.isEmpty);
    var yIsEmptyAxis = (yMeta.isEmpty);

    unit.guide.x.tickFormat = shortFormat(unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats));
    unit.guide.y.tickFormat = shortFormat(unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats));

    var isXVertical = allowXVertical ? !(dimX.dimType === 'measure') : false;
    var isYVertical = allowYVertical ? !(dimY.dimType === 'measure') : false;

    unit.guide.x.padding = xIsEmptyAxis ? 0 : settings.xAxisPadding;
    unit.guide.y.padding = yIsEmptyAxis ? 0 : settings.yAxisPadding;

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
            (selectorPredicates, unit) => {

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
                unit.guide.y.padding = (isFacetUnit ? 0 : settings.yAxisPadding);

                unit.guide = calcXYGuide(
                    unit.guide,
                    _.defaults(
                        {
                            distToXAxisLabel: (xMeta.isEmpty) ? settings.xTickWidth : settings.distToXAxisLabel,
                            distToYAxisLabel: (yMeta.isEmpty) ? settings.yTickWidth : settings.distToYAxisLabel
                        },
                        settings),
                    xMeta,
                    yMeta);

                unit.guide.x = _.extend(
                    (unit.guide.x),
                    {
                        cssClass: (isFacetUnit) ? (unit.guide.x.cssClass + ' facet-axis') : (unit.guide.x.cssClass),
                        avoidCollisions: (isFacetUnit) ? true : (unit.guide.x.avoidCollisions)
                    });

                unit.guide.y = _.extend(
                    (unit.guide.y),
                    {
                        cssClass: (isFacetUnit) ? (unit.guide.y.cssClass + ' facet-axis') : (unit.guide.y.cssClass),
                        avoidCollisions: (isFacetUnit) ? false : (unit.guide.y.avoidCollisions)
                    });

                unit.guide = _.extend(
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
                    // isEmpty: ((values.filter((x) => !(_.isUndefined(x))).length) === 0)
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