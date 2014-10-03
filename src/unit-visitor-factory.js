import {TMatrix} from './matrix';

var TUnitVisitorFactory = (function () {

    var createEqualPredicate = (propName, shouldEqualTo) => ((row) => row[propName] === shouldEqualTo);

    var cloneObject = (obj) => JSON.parse(JSON.stringify(obj));

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

            // declare defaults
            root.padding = _.defaults(root.padding || {}, { L:0, B:0, R:0, T:0 });
            root.axes = _(root.axes).map((axis, i) => _.defaults(axis || {}, {
                scaleOrient: (i === 0 ? 'bottom' : 'left'),
                padding: 0
            }));

            var unitFunc = TFuncMap[root.func] || (() => [[EMPTY_CELL_FILTER]]);

            var matrixOfPrFilters = new TMatrix(unitFunc(root, root.axes[0].scaleDim, root.axes[1].scaleDim));
            var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

            matrixOfPrFilters.iterate((row, col, $filterRC) => {
                var cellFilter = root.$filter.concat($filterRC);
                var cellNodes = _(root.unit).map((sUnit) => {
                    // keep arguments order. cloned objects are created
                    return _.extend(cloneObject(sUnit), { $filter: cellFilter });
                });
                matrixOfUnitNodes.setRC(row, col, cellNodes);
            });

            root.$matrix = matrixOfUnitNodes;

            matrixOfUnitNodes.iterate((r, c, cellNodes) => {
                _.each(cellNodes, (refSubNode) => continueTraverse(refSubNode));
            });

            return root;
        }
    };

    TUnitMap['COORDS.RECT'] = TUnitMap['COORDS/RECT'];

    return function (unitType) {
        return TUnitMap[unitType] || ((unit) => {
            unit.padding = _.defaults(unit.padding || {}, { L:0, B:0, R:0, T:0 });
            return unit;
        });
    };

})();

export {TUnitVisitorFactory};