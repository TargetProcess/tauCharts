var UnitsMap = {};

var unitsRegistry = {

    reg: function (unitType, xUnit) {
        UnitsMap[unitType] = xUnit;
        return this;
    },

    get: (unitType) => {

        if (!UnitsMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType);
        }

        return UnitsMap[unitType];
    }
};

export {unitsRegistry};