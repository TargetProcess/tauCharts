var UnitsMap = {};

var unitsRegistry = {

    reg: function (unitType, xUnit) {
        UnitsMap[unitType] = xUnit;
        return this;
    },

    add: function (unitType, xUnit) {
        var unit = {};
        unit.draw = (typeof xUnit === 'function') ? xUnit : xUnit.draw;
        unit.walk = xUnit.walk || ((x) => x);
        UnitsMap[unitType] = unit;
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