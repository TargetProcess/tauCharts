import {TUnitVisitorFactory} from './unit-visitor-factory';
import {TNodeVisitorFactory} from './node-visitor-factory';

var SCALE_STRATEGIES = {

    'ordinal': (domain) => domain,

    'linear': (domain) => d3.extent(domain)
};

var metaFilter = (filterPredicates, row) => _.every(filterPredicates, (fnPredicate) => fnPredicate(row));

var DSLReader = function (ast) {
    this.ast = ast;
};

DSLReader.prototype = {
    traverse: function (rawData) {
        var unit = this.ast.unit;

        var decorateUnit = function(unit) {

            unit.source = (filter) => _(rawData).filter(filter || (() => true));

            unit.partition = () => unit.source(unit.$filter);

            // TODO: memoize
            unit.domain = (dim) => _(rawData).chain().pluck(dim).uniq().value();

            // TODO: memoize
            unit.scale = (scaleDim, scaleType) => d3.scale[scaleType]().domain(SCALE_STRATEGIES[scaleType](unit.domain(scaleDim)));

            return unit;
        };

        var buildLogicalGraphRecursively = function (unitRef) {
            return TUnitVisitorFactory(unitRef.type)(decorateUnit(unitRef), buildLogicalGraphRecursively);
        };
        return buildLogicalGraphRecursively(unit);
    },
    traverseToNode: function (refUnit, rawData, c) {
        this.container =  d3
            .select(this.ast.container)
            .append("svg")
            .style("border", 'solid 1px')
            .attr("width", this.ast.W)
            .attr("height", this.ast.H);

        refUnit.options = {
            container: this.container,
            width: this.ast.W,
            height: this.ast.H,
            top: 0,
            left: 0
        };

        var decorateUnit = function(unit) {

            unit.source = (filter) => _(rawData).filter(filter || (() => true));

            unit.partition = () => unit.source(metaFilter.bind(null, unit.$filter));

            // TODO: memoize
            unit.domain = (dim) => _(rawData).chain().pluck(dim).uniq().value();

            // TODO: memoize
            unit.scale = (scaleDim, scaleType) => d3.scale[scaleType]().domain(SCALE_STRATEGIES[scaleType](unit.domain(scaleDim)));

            return unit;
        };

        var renderLogicalGraphRecursively = function (unitRef) {
            return TNodeVisitorFactory(unitRef.type)(decorateUnit(unitRef), renderLogicalGraphRecursively);
        };

        renderLogicalGraphRecursively(refUnit);

        return refUnit.options.container;
    }
};

export {DSLReader};
