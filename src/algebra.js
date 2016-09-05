import {default as _} from 'underscore';
import {utils} from './utils/utils';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';

var unify = (v) => utils.isDate(v) ? v.getTime() : v;

var FramesAlgebra = {

    cross(dataFn, dimX, dimY) {

        var data = dataFn();

        var domainX = _.unique(data.map(x => x[dimX]));
        var domainY = _.unique(data.map(x => x[dimY]));

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY;

        return domY.reduce(
            (memo, rowVal) => {

                return memo.concat(domX.map((colVal) => {

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

    cross_period(dataFn, dimX, dimY, xPeriod, yPeriod) {
        var data = dataFn();

        var domainX = _.unique(data.map(x => x[dimX]));
        var domainY = _.unique(data.map(x => x[dimY]));

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY;

        if (xPeriod) {
            domX = UnitDomainPeriodGenerator.generate(Math.min(...domainX), Math.max(...domainX), xPeriod);
        }

        if (yPeriod) {
            domY = UnitDomainPeriodGenerator.generate(Math.min(...domainY), Math.max(...domainY), yPeriod);
        }

        return domY.reduce(
            (memo, rowVal) => {

                return memo.concat(domX.map((colVal) => {

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
        var domainX = _.unique(data.map(x => x[dim]));
        return domainX.map((x)=>({[dim]: unify(x)}));
    },

    none() {
        return [null];
    }
};

export {FramesAlgebra};