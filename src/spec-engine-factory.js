import {utilsDraw} from './utils/utils-draw';

var inheritProps = (unit, root) => {
    unit.guide = unit.guide || {};
    unit.guide.padding = unit.guide.padding || {l: 0, t: 0, r: 0, b: 0};
    unit = _.defaults(unit, root);
    unit.guide = _.defaults(unit.guide, root.guide);
    return unit;
};

var getPhisicalTickWidth = function(text) {

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

    var sel = d3.select('#' + id).selectAll('.x.axis .tick text');

    console.log(sel);
    console.log(sel[0][0].clientWidth);

    return sel[0][0].clientWidth;
};

var SpecEngineTypeMap = {

    'DEFAULT': (spec, meta) => {

        var fnTraverseTree = (specUnitRef) => {
            var root = utilsDraw.applyNodeDefaults(specUnitRef);
            var prop = _.omit(root, 'unit');
            (root.unit || []).forEach((unit) => fnTraverseTree(inheritProps(unit, prop)));
            return root;
        };

        fnTraverseTree(spec.unit);

        return spec;
    },

    'AUTO': (spec, meta) => {

        var fnTraverseTree = (specUnitRef, transform) => {
            var rootUnit = utilsDraw.applyNodeDefaults(specUnitRef);
            var children = rootUnit.unit || [];
            var isLeaf = !rootUnit.hasOwnProperty('unit');
            var isLeafParent = !children.some((c) => c.hasOwnProperty('unit'));

            var predicates = {
                type: rootUnit.type,
                isLeaf: isLeaf,
                isLeafParent: !isLeaf && isLeafParent
            };

            rootUnit = transform(predicates, rootUnit);

            var prop = _.omit(rootUnit, 'unit');
            children.forEach((unit) => fnTraverseTree(inheritProps(unit, prop), transform));
            return rootUnit;
        };

        fnTraverseTree(spec.unit, (selectorPredicates, unit) => {

            if (selectorPredicates.isLeaf) {
                return unit;
            }

            var xAxisPadding = selectorPredicates.isLeafParent ? 20 : 0;
            var yAxisPadding = selectorPredicates.isLeafParent ? 20 : 0;

            unit.guide.x.padding = xAxisPadding;
            unit.guide.y.padding = yAxisPadding;

            var domainY = meta.domain(unit.y);
            var maxYTickText = _.max(domainY, (x) => (x || '').toString().length);

            var tickWidth = 6;
            var maxXTickH = 15;
            var maxYTickW = getPhisicalTickWidth(maxYTickText);

            var xFontH = tickWidth + maxXTickH;
            var yFontW = tickWidth + maxYTickW;

            var kx = 2;
            var ky = 1;
            var xFontLabelHeight = 15;
            var yFontLabelHeight = 15;

            unit.guide.x.label.padding = (unit.guide.x.label.text) ? (xFontH + kx * xFontLabelHeight) : 0;
            unit.guide.y.label.padding = (unit.guide.y.label.text) ? (yFontW + ky * yFontLabelHeight) : 0;

            var xLabelPadding = (unit.guide.x.label.text) ? (xFontH + (kx + 1) * xFontLabelHeight) : (xFontH);
            var yLabelPadding = (unit.guide.y.label.text) ? (yFontW + (ky + 1) * yFontLabelHeight) : (yFontW);

            unit.guide.x.label.text = unit.guide.x.label.text.toUpperCase();
            unit.guide.y.label.text = unit.guide.y.label.text.toUpperCase();

            unit.guide.padding.b = xAxisPadding + xLabelPadding;
            unit.guide.padding.l = yAxisPadding + yLabelPadding;

            return unit;
        });

        return spec;
    }
};

var SpecEngineFactory = {

    get: (typeName) => {
        return (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.DEFAULT).bind(this);
    }

};

export {SpecEngineFactory};