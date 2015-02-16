import {Cartesian} from './elements/coords.cartesian';
import {Point} from './elements/element.point';

var UnitsMap = {};

var UnitsRegistry = {

    add: function(unitType, xUnit) {
        var unit = {};
        unit.draw = (typeof xUnit === 'function') ? xUnit : xUnit.draw;
        unit.walk = xUnit.walk || ((x) => x);
        UnitsMap[unitType] = unit;
        return this;
    },

    get: (unitType) => {

        if (unitType === 'RECT') {
            return Cartesian;
        }

        if (unitType === 'POINT') {
            return Point;
        }

        if (!UnitsMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType);
        }

        return UnitsMap[unitType];
    }
};

export {UnitsRegistry};