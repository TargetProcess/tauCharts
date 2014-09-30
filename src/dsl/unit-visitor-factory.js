var TUnitVisitorFactory = (function () {

    var getDomain = function (data, scaleDim, scaleType) {
        var domain = _(data).chain().pluck(scaleDim);
        return ((scaleType === 'ordinal')?
                domain.uniq().value():
                d3.extent(domain.value()));
    };

    var metaFilter = function (filterPredicates, row) {
        return _.every(
                filterPredicates,
                function (fnPredicate) {
                    return fnPredicate(row);
                });
    };

    var createEqualPredicate = function (propName, shouldEqualTo) {
        return function (row) {
            return row[propName] === shouldEqualTo;
        };
    };

    var TFuncMap = {
        'CROSS': function (srcData, dimX, dimY) {

            var domains = {
                x: _(srcData).chain().pluck(dimX).uniq().value(),
                y: _(srcData).chain().pluck(dimY).uniq().value().reverse()
            };

            return _(domains.y).map(function (RV) {
                return _(domains.x).map(function (RC) {
                    return metaFilter.bind(
                        null,
                        [
                            createEqualPredicate(dimX, RC),
                            createEqualPredicate(dimY, RV)
                        ]);
                });
            });
        }
    };

    var TUnitMap = {

        'COORDS/RECT': function (unit, srcData, continueTraverse) {

            var x = _.defaults(unit.axes[0] || {}, {});
            var y = _.defaults(unit.axes[1] || {}, {});

            var $scales = _.reduce(
                unit.axes,
                function (memo, axis) {
                    var x = _.defaults(axis || {}, {});
                    memo[x.scaleDim] = ((x.scaleDim) ?
                        d3.scale[x.scaleType]().domain(getDomain(srcData, x.scaleDim, x.scaleType)):
                        null);
                    return memo;
                },
                {});

            unit.$filter = unit.$filter || _.identity;
            var unitFltr = unit.$filter;
            var unitFunc = (TFuncMap[unit.func] || function () {
                return [
                    [unitFltr]
                ]; // array: [1 x 1]
            });

            var matrixOfPrFilters = new TMatrix(unitFunc(srcData, x.scaleDim, y.scaleDim));
            var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());
            matrixOfPrFilters.iterate(function (r, c, predicateRC) {
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

    return function (unitType) {
        return TUnitMap[unitType] || _.identity;
    };

})();