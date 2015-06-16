import {TauChartError as Error, errorCodes} from './error';

var UnitsMap = {};

var unitsRegistry = {

    reg: function (unitType, xUnit) {
        UnitsMap[unitType] = xUnit;
        return this;
    },

    get: (unitType) => {

        if (!UnitsMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType, errorCodes.UNKNOWN_UNIT_TYPE);
        }

        return UnitsMap[unitType];
    }
};

export {unitsRegistry};