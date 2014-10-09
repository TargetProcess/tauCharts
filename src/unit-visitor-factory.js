import {TMatrix} from './matrix';

var TUnitVisitorFactory = (function () {

    var cloneObject = (obj) => JSON.parse(JSON.stringify(obj));

    var FacetAlgebra = {

        'CROSS': function (root, dimX, dimY) {

            var domainX = root.domain(dimX);
            var domainY = root.domain(dimY).reverse();

            return _(domainY).map((rowVal) => {
                return _(domainX).map((colVal) => {

                    var r = {};

                    if (dimX) {
                        r[dimX] = colVal;
                    }

                    if (dimY) {
                        r[dimY] = rowVal;
                    }

                    return r;
                });
            });
        }
    };

    var TFuncMap = (opName) => FacetAlgebra[opName] || (() => [[{}]]);

    var TUnitMap = {

        'COORDS.RECT': function (unit, continueTraverse) {

            var root = _.defaults(
                unit,
                {
                    $where: {}
                });

            root.axes = _(root.axes).map((axis, i) => _.defaults(axis || {}, {
                scaleOrient: (i === 0 ? 'bottom' : 'left'),
                padding: 0
            }));

            var isFacet = _.any(root.unit, (n) => (n.type.indexOf('COORDS.') === 0));
            var unitFunc = TFuncMap(isFacet ? 'CROSS' : '');

            var matrixOfPrFilters = new TMatrix(unitFunc(root, root.axes[0].scaleDim, root.axes[1].scaleDim));
            var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

            matrixOfPrFilters.iterate((row, col, $whereRC) => {
                var cellWhere = _.extend({}, root.$where, $whereRC);
                var cellNodes = _(root.unit).map((sUnit) => {
                    // keep arguments order. cloned objects are created
                    return _.extend(cloneObject(sUnit), { $where: cellWhere });
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

    return function (unitType) {
        return TUnitMap[unitType] || ((unit) => unit);
    };

})();

export {TUnitVisitorFactory};