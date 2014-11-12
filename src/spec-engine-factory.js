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

var fnTraverseTree = (specUnitRef, transformRules) => {
    var temp = utilsDraw.applyNodeDefaults(specUnitRef);
    var root = transformRules(createSelectorPredicates(temp), temp);
    var prop = _.omit(root, 'unit');
    (root.unit || []).forEach((unit) => fnTraverseTree(inheritProps(unit, prop), transformRules));
    return root;
};

var getPhisicalTickSize = function(text) {

    if (text === '') {
        return {
            width: 0,
            height: 0
        };
    }

    var id = _.uniqueId('tauChartHelper');

    var tmpl = [
        '<svg class="graphical-report__svg">',
        '<g class="graphical-report__cell cell">',
            '<g class="x axis">',
                '<g class="tick"><text><%= xTick %></text></g>',
            '</g>',
            '<g class="y axis">',
                '<g class="tick"><text><%= xTick %></text></g>',
            '</g>',
        '</g>',
        '</svg>'
    ].join('');

    var compiled = _.template(tmpl);

    var div = document.createElement('div');
    document.body.appendChild(div);

    div.outerHTML = ('<div id="' + id + '" style="position: absolute; width: 100px; height: 100px; border: 1px solid red"><div>');

    document.getElementById(id).innerHTML = compiled({
        xTick: text,
        yTick: text
    });

    var textNode = d3.select('#' + id).selectAll('.x.axis .tick text')[0][0];

    return {
        width: textNode.clientWidth,
        height: textNode.clientHeight
    };
};

var SpecEngineTypeMap = {

    'DEFAULT': (spec, meta) => {
        return (selectorPredicates, unit) => unit;
    },

    'AUTO': (spec, meta) => {

        var xLabels = [];
        var yLabels = [];
        var xUnit = null;
        var yUnit = null;
        fnTraverseTree(spec.unit, (selectors, unit) => {

            if (selectors.isLeaf) {
                return unit;
            }

            if (!xUnit && unit.x) {
                xUnit = unit;
            }

            if (!yUnit && unit.y) {
                yUnit = unit;
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

            var xAxisPadding = selectorPredicates.isLeafParent ? 20 : 0;
            var yAxisPadding = selectorPredicates.isLeafParent ? 20 : 0;

            var isXVertical = (!!dimX.dimType && dimX.dimType !== 'measure');


            unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
            unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;


            unit.guide.x.rotate = isXVertical ? -90 : 0;
            unit.guide.x.textAnchor = isXVertical ? 'end' : unit.guide.x.textAnchor;


            var xFormatter = FormatterRegistry.get(unit.guide.x.tickFormat);
            var yFormatter = FormatterRegistry.get(unit.guide.y.tickFormat);

            var maxXTickText = xIsEmptyAxis ?
                '' :
                (_.max(xValues, (x) => xFormatter(x || '').toString().length));

            var maxYTickText = yIsEmptyAxis ?
                '' :
                (_.max(yValues, (y) => yFormatter(y || '').toString().length));

            var xTickWidth = xIsEmptyAxis ? 0 : (6 + 3);
            var yTickWidth = yIsEmptyAxis ? 0 : (6 + 3);

            var defaultTickSize = { width: 0, height: 0 };

            var maxXTickSize = xIsEmptyAxis ? defaultTickSize : getPhisicalTickSize(xFormatter(maxXTickText));
            var maxXTickH = isXVertical ? maxXTickSize.width : maxXTickSize.height;


            var maxYTickSize = yIsEmptyAxis ? defaultTickSize : getPhisicalTickSize(yFormatter(maxYTickText));
            var maxYTickW = maxYTickSize.width;


            var xFontH = xTickWidth + maxXTickH;
            var yFontW = yTickWidth + maxYTickW;

            var xFontLabelHeight = 15;
            var yFontLabelHeight = 15;

            var distToAxisLabel = 20;

            unit.guide.x.label.padding = (unit.guide.x.label.text) ? (xFontH + distToAxisLabel) : 0;
            unit.guide.y.label.padding = (unit.guide.y.label.text) ? (yFontW + distToAxisLabel) : 0;

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

    get: (typeName) => {

        var rules = (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.DEFAULT);
        return (spec, meta) => {
            fnTraverseTree(spec.unit, rules(spec, meta));
            return spec;
        }
    }

};

export {SpecEngineFactory};