var DSLReader = function (ast) {
    this.ast = ast;
};

DSLReader.prototype = {
    traverse: function (rawData) {
        var unit = this.ast.unit;
        var buildLogicalGraphRecursively = function (unitRef, srcData) {
            return TUnitVisitorFactory(unitRef.type)(unitRef, srcData, buildLogicalGraphRecursively);
        };
        return buildLogicalGraphRecursively(unit, rawData);
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

        var SCALE_STRATEGIES = {
            'ordinal': function(domain) {
                return domain;
            },

            'linear': function(domain) {
                return d3.extent(domain);
            }
        };

        var decorateUnit = function(unit) {

            unit.source = function(filter) {
                return _(rawData).filter(filter || _.identity.bind(_, true));
            };

            unit.partition = function() {
                return this.source(this.$filter);
            };

            // TODO: memoize
            unit.domain = function(dim) {
                return _(rawData).chain().pluck(dim).uniq().value();
            };

            // TODO: memoize
            unit.scale = function(scaleDim, scaleType) {
                return d3.scale[scaleType]().domain(SCALE_STRATEGIES[scaleType](this.domain(scaleDim)));
            };

            return unit;
        };

        var renderLogicalGraphRecursively = function (unitRef) {
            return TNodeVisitorFactory(unitRef.type)(decorateUnit(unitRef), renderLogicalGraphRecursively);
        };

        renderLogicalGraphRecursively(refUnit);

        return refUnit.options.container;
    }
};
