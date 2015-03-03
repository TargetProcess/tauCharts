import {default as _} from 'underscore';

var unify = (v) => (v instanceof Date) ? v.getTime() : v;

var FramesAlgebra = {

    cross(dataFn, dimX, dimY) {

        var data = dataFn();

        var domainX = _(data).chain().pluck(dimX).unique(unify).value();
        var domainY = _(data).chain().pluck(dimY).unique(unify).value();

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY;

        return _(domY).reduce(
            (memo, rowVal) => {

                return memo.concat(_(domX).map((colVal) => {

                    var r = {};

                    if (dimX) {
                        r[dimX] = unify(colVal);
                    }

                    if (dimY) {
                        r[dimY] = unify(rowVal);
                    }

                    return r;
                }));
            },
            []);
    },

    groupBy(dataFn, dim) {
        var data = dataFn();
        var domainX = _(data).chain().pluck(dim).unique(unify).value();
        return domainX.map((x)=>({[dim]: unify(x)}));
    },

    none() {
        return [null];
    }
};

export {FramesAlgebra};