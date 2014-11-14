import {utils} from './utils/utils';
import {utilsDraw} from './utils/utils-draw';
import {FormatterRegistry} from './formatter-registry';

var inheritProps = (unit, root) => {
    unit.guide = unit.guide || {};
    unit.guide.padding = unit.guide.padding || {l: 0, t: 0, r: 0, b: 0};
    unit = _.defaults(unit, root);
    unit.guide = _.defaults(unit.guide, root.guide);
    return unit;
};

var createSelectorPredicates = (root) => {

    var children = root.unit || [];

    var isLeaf = !root.hasOwnProperty('unit');
    var isLeafParent = !children.some((c) => c.hasOwnProperty('unit'));

    return {
        type: root.type,
        isLeaf: isLeaf,
        isLeafParent: !isLeaf && isLeafParent
    };
};

var getTickFormat = (dimType, scaleType, defaultFormats) => {
    var key = [dimType, scaleType].join(':');
    return defaultFormats[key] || defaultFormats[dimType] || null;
};

var fnTraverseTree = (specUnitRef, transformRules) => {
    var temp = utilsDraw.applyNodeDefaults(specUnitRef);
    var root = transformRules(createSelectorPredicates(temp), temp);
    var prop = _.omit(root, 'unit');
    (root.unit || []).forEach((unit) => fnTraverseTree(inheritProps(unit, prop), transformRules));
    return root;
};

var SpecEngineTypeMap = {

    'DEFAULT': (spec, meta, measurer) => {
        return (selectorPredicates, unit) => unit;
    },

    'AUTO': (spec, meta, measurer) => {

        var xLabels = [];
        var yLabels = [];
        var xUnit = null;
        var yUnit = null;
        fnTraverseTree(spec.unit, (selectors, unit) => {

            if (selectors.isLeaf) {
                return unit;
            }


            if (!xUnit && unit.x) (xUnit = unit);
            if (!yUnit && unit.y) (yUnit = unit);


            if (unit.x) {
                unit.guide.x.label.text = unit.guide.x.label.text || unit.x;
                var dimX = meta.dimension(unit.x);
                unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX.dimType, dimX.scaleType, measurer.defaultFormats);
            }

            if (unit.y) {
                unit.guide.y.label.text = unit.guide.y.label.text || unit.y;
                var dimY = meta.dimension(unit.y);
                unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY.dimType, dimY.scaleType, measurer.defaultFormats);
            }

            var x = unit.guide.x.label.text;
            if (x) {
                xLabels.push(x);
                unit.guide.x.label.text = '';
            }

            var y = unit.guide.y.label.text;
            if (y) {
                yLabels.push(y);
                unit.guide.y.label.text = '';
            }

            return unit;
        });

        if (xUnit) {
            xUnit.guide.x.label.text = xLabels.join(' > ');
        }

        if (yUnit) {
            yUnit.guide.y.label.text = yLabels.join(' > ');
        }

        return (selectorPredicates, unit) => {

            if (selectorPredicates.isLeaf) {
                return unit;
            }

            var isFacetUnit = (!selectorPredicates.isLeaf && !selectorPredicates.isLeafParent);
            if (isFacetUnit) {
                // unit is a facet!
                unit.guide.x.cssClass += ' facet-axis';
                unit.guide.y.cssClass += ' facet-axis';
            }

            var dimX = meta.dimension(unit.x);
            var dimY = meta.dimension(unit.y);

            var xScaleOptions = {
                map: unit.guide.x.tickLabel,
                min: unit.guide.x.tickMin,
                max: unit.guide.x.tickMax,
                period: unit.guide.x.tickPeriod,
                autoScale: unit.guide.x.autoScale
            };

            var yScaleOptions = {
                map: unit.guide.y.tickLabel,
                min: unit.guide.y.tickMin,
                max: unit.guide.y.tickMax,
                period: unit.guide.y.tickPeriod,
                autoScale: unit.guide.y.autoScale
            };

            var xValues = meta.scaleMeta(unit.x, xScaleOptions).values;
            var yValues = meta.scaleMeta(unit.y, yScaleOptions).values;

            var xIsEmptyAxis = (xValues.length === 0);
            var yIsEmptyAxis = (yValues.length === 0);

            var xAxisPadding = selectorPredicates.isLeafParent ? measurer.xAxisPadding : 0;
            var yAxisPadding = selectorPredicates.isLeafParent ? measurer.yAxisPadding : 0;

            var isXVertical = !isFacetUnit && (!!dimX.dimType && dimX.dimType !== 'measure');

            unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
            unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

            unit.guide.x.rotate = isXVertical ? 90 : 0;
            unit.guide.x.textAnchor = isXVertical ? 'start' : unit.guide.x.textAnchor;


            var xFormatter = FormatterRegistry.get(unit.guide.x.tickFormat);
            var yFormatter = FormatterRegistry.get(unit.guide.y.tickFormat);

            var maxXTickText = xIsEmptyAxis ?
                '' :
                (_.max(xValues, (x) => xFormatter(x || '').toString().length));

            var maxYTickText = yIsEmptyAxis ?
                '' :
                (_.max(yValues, (y) => yFormatter(y || '').toString().length));

            var xTickWidth = xIsEmptyAxis ? 0 : measurer.xTickWidth;
            var yTickWidth = yIsEmptyAxis ? 0 : measurer.xTickWidth;

            var defaultTickSize = { width: 0, height: 0 };

            var maxXTickSize = xIsEmptyAxis ? defaultTickSize : measurer.getAxisTickLabelSize(xFormatter(maxXTickText));
            var maxXTickH = isXVertical ? maxXTickSize.width : maxXTickSize.height;
            if (dimX.dimType !== 'measure' && (maxXTickH > measurer.axisTickLabelLimit)) {
                unit.guide.x.tickFormatLimit = measurer.axisTickLabelLimit / (maxXTickH / maxXTickText.length);
                maxXTickH = measurer.axisTickLabelLimit;
            }


            var maxYTickSize = yIsEmptyAxis ? defaultTickSize : measurer.getAxisTickLabelSize(yFormatter(maxYTickText));
            var maxYTickW = maxYTickSize.width;
            if (dimY.dimType !== 'measure' && (maxYTickW > measurer.axisTickLabelLimit)) {
                unit.guide.y.tickFormatLimit = measurer.axisTickLabelLimit / (maxYTickW / maxYTickText.length);
                maxYTickW = measurer.axisTickLabelLimit;
            }


            var xFontH = xTickWidth + maxXTickH;
            var yFontW = yTickWidth + maxYTickW;

            var xFontLabelHeight = measurer.xFontLabelHeight;
            var yFontLabelHeight = measurer.yFontLabelHeight;

            var distToXAxisLabel = measurer.distToXAxisLabel;
            var distToYAxisLabel = measurer.distToYAxisLabel;

            var densityKoeff = measurer.densityKoeff;


            unit.guide.x.density = densityKoeff * (isXVertical ? maxXTickSize.height : maxXTickSize.width);
            unit.guide.y.density = densityKoeff * maxYTickSize.height;


            unit.guide.x.label.padding = (unit.guide.x.label.text) ? (xFontH + distToXAxisLabel) : 0;
            unit.guide.y.label.padding = (unit.guide.y.label.text) ? (yFontW + distToYAxisLabel) : 0;

            var xLabelPadding = (unit.guide.x.label.text) ? (unit.guide.x.label.padding + xFontLabelHeight) : (xFontH);
            var yLabelPadding = (unit.guide.y.label.text) ? (unit.guide.y.label.padding + yFontLabelHeight) : (yFontW);

            unit.guide.x.label.text = unit.guide.x.label.text.toUpperCase();
            unit.guide.y.label.text = unit.guide.y.label.text.toUpperCase();

            unit.guide.padding.b = xAxisPadding + xLabelPadding;
            unit.guide.padding.l = yAxisPadding + yLabelPadding;

            return unit;
        };
    }
};

var SpecEngineFactory = {

    get: (typeName, measurer) => {

        var rules = (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.DEFAULT);
        return (spec, meta) => {
            fnTraverseTree(spec.unit, rules(spec, meta, measurer));
            return spec;
        };
    }

};

export {SpecEngineFactory};