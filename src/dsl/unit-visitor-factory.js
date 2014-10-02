import {TMatrix} from './matrix';

var TUnitVisitorFactory = (function () {

    var createEqualPredicate = (propName, shouldEqualTo) => ((row) => row[propName] === shouldEqualTo);

    var TFuncMap = {
        'CROSS': function (root, dimX, dimY) {

            var domainX = root.domain(dimX);
            var domainY = root.domain(dimY).reverse();

            return _(domainY).map((RV) =>
            {
                return _(domainX).map((RC) =>
                {
                    return [
                        createEqualPredicate(dimX, RC),
                        createEqualPredicate(dimY, RV)
                    ];
                });
            });
        }
    };

    var EMPTY_CELL_FILTER = [];

    var TUnitMap = {

        'COORDS/RECT': function (unit, continueTraverse) {

            var root = _.defaults(
                unit,
                {
                    $filter: EMPTY_CELL_FILTER
                });

            var x = _.defaults(root.axes[0] || {}, {});
            var y = _.defaults(root.axes[1] || {}, {});

            var unitFunc = TFuncMap[root.func] || (() => [[EMPTY_CELL_FILTER]]);

            var matrixOfPrFilters = new TMatrix(unitFunc(root, x.scaleDim, y.scaleDim));
            var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

            matrixOfPrFilters.iterate((row, col, $filterRC) =>
            {
                var cellFilter = root.$filter.concat($filterRC);
                var cellNodes = _(root.unit).map((sUnit) =>
                {
                    // keep arguments order. cloned objects are created
                    return _.extend({}, sUnit, { $filter: cellFilter });
                });
                matrixOfUnitNodes.setRC(row, col, cellNodes);
            });

            root.$matrix = matrixOfUnitNodes;

            matrixOfUnitNodes.iterate((r, c, cellNodes) =>
            {
                _.each(cellNodes, (refSubNode) => continueTraverse(refSubNode));
            });

            return root;
        }
    };

    TUnitMap['COORDS.RECT'] = TUnitMap['COORDS/RECT'];

    return function (unitType) {
        return TUnitMap[unitType] || _.identity;
    };

})();

export {TUnitVisitorFactory};