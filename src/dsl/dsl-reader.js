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
            .attr("width", this.ast.W)
            .attr("height", this.ast.H);

        refUnit.options = {
            container: this.container,
            width: this.ast.W,
            height: this.ast.H,
            top: 0,
            left: 0
        };
        var renderLogicalGraphRecursively = function (unitRef, srcData) {
            return TNodeVisitorFactory(unitRef.type)(unitRef, _(srcData).filter(unitRef.$filter), renderLogicalGraphRecursively);
        };
        renderLogicalGraphRecursively(refUnit, rawData);
        return refUnit.options.container;
    }
};
