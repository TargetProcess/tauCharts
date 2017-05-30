import * as utils from './utils/utils';
import {UnitDomainPeriodGenerator} from './unit-domain-period-generator';
import {UnitGuide} from './definitions';

type FrameAlgebraFunction = (dataFn: () => any[], ...args: any[]) => any[];

var unify = ((v) => utils.isDate(v) ? v.getTime() : v);

var FramesAlgebra: {[algebra: string]: FrameAlgebraFunction} = {

    cross(dataFn: () => any[], dimX: string, dimY: string): any[] {

        var data = dataFn();

        var domainX = utils.unique(data.map(x => x[dimX]), unify);
        var domainY = utils.unique(data.map(x => x[dimY]), unify);

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

    cross_period(dataFn: () => any[], dimX: string, dimY: string, xPeriod: string, yPeriod: string, guide: UnitGuide): any[] {
        var data = dataFn();
        var utc = (guide ? guide.utcTime : false);

        var domainX = utils.unique(data.map(x => x[dimX]), unify);
        var domainY = utils.unique(data.map(x => x[dimY]), unify);

        var domX = domainX.length === 0 ? [null] : domainX;
        var domY = domainY.length === 0 ? [null] : domainY;

        if (xPeriod) {
            domX = UnitDomainPeriodGenerator.generate(Math.min(...domainX), Math.max(...domainX), xPeriod, {utc});
        }

        if (yPeriod) {
            domY = UnitDomainPeriodGenerator.generate(Math.min(...domainY), Math.max(...domainY), yPeriod, {utc});
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

    groupBy(dataFn: () => any[], dim: string) {
        var data = dataFn();
        var domainX = utils.unique(data.map(x => x[dim]), unify);
        return domainX.map((x)=>({[dim]: unify(x)}));
    },

    none() {
        return [null];
    }
};

export {FramesAlgebra};