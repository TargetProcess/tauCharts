var getDomain = function (data, scaleDim, scaleType) {
    var domain = _(data).chain().pluck(scaleDim);
    return ((scaleType === 'ordinal')?
            domain.uniq().value():
            d3.extent(domain.value()));
};

var TMatrix = function(r, c) {

    var args = _.toArray(arguments);
    var cube;

    if (_.isArray(args[0])) {
        cube = args[0];
    }
    else {
        cube = _.times(r, function() {
            return _.times(c, function() {
                return null;
            });
        });
    }

    this.cube = cube;
};

TMatrix.prototype = {

    iterate: function(iterator) {
        var cube = this.cube;
        _.each(cube, function (row, ir) {
            _.each(row, function (colValue, ic) {
                iterator(ir, ic, colValue);
            });
        });
        return this;
    },

    getRC: function(r, c) {
        return this.cube[r][c];
    },

    setRC: function(r, c, val) {
        this.cube[r][c] = val;
        return this;
    },

    sizeR: function() {
        return this.cube.length;
    },

    sizeC: function() {
        var row = this.cube[0] || [];
        return row.length;
    }
};

var TMap = {

    'COORDS/RECT': function (unit, srcData, continueTraverse) {

        var x = _.defaults(unit.axes[0] || {}, {});
        var y = _.defaults(unit.axes[1] || {}, {});

        var $scales = _.reduce(
            unit.axes,
            function(memo, axis) {
                var x = _.defaults(axis || {}, {});
                memo[x.scaleDim] = ((x.scaleDim)?
                    d3.scale[x.scaleType]().domain(getDomain(srcData, x.scaleDim, x.scaleType)):
                    null);
                return memo;
            },
            {});

        var unitFltr = (unit.$filter || _.identity);
        var unitFunc = (unit.func || function () {
            return [[unitFltr]]; // array: [1 x 1]
        });

        var matrixOfPrFilters = new TMatrix(unitFunc(x.scaleDim, y.scaleDim));
        var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());
        matrixOfPrFilters.iterate(function(r, c, predicateRC) {
            var logicalUnits = _.map(unit.unit, function (subUnit) {
                return continueTraverse(
                    _.extend({ $filter: predicateRC, $scales: $scales }, subUnit),
                    srcData);
            });
            matrixOfUnitNodes.setRC(r, c, logicalUnits);
        });

        unit.$scales = $scales;
        unit.$matrix = matrixOfUnitNodes;

        return unit;
    }
};

var TUnitVisitorFactory = function(unitType) {
    return TMap[unitType] || _.identity;
};

var DSLReader = function (ast) {

    this.W = 1600;
    this.H = 1000;

    $("#chart-container").css({
        width: this.W,
        height: this.H
    });

    this.container = d3
            .select("#chart-container")
            .append("svg")
            .attr("width", this.W)
            .attr("height", this.H);

    this.ast = ast;
};

DSLReader.prototype = {

    process: function (rawData) {

        var unit = this.ast.unit;

        var buildLogicalGraphRecursively = function(unitRef, srcData) {

            TUnitVisitorFactory(unitRef.type)(unitRef, srcData, buildLogicalGraphRecursively);

            return unitRef;
        };

        var refUnit = buildLogicalGraphRecursively(unit);

        refUnit.$matrix.iterate(function(r, c, obj) {
            console.log(r, c, obj);
        });

        var unitIterator = function (sUnit, options) {
            sUnit.options = options;
            sUnit.data = (sUnit.filter) ? sUnit.filter(rawData) : rawData;
            UNITS_MAP[sUnit.type](sUnit, unitIterator);
        };

        unitIterator(
                unit,
                {
                    container: this.container,
                    width: this.W,
                    height: this.H,
                    top: 0,
                    left: 0
                });
    }
};
