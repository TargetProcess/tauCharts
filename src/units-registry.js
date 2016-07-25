import {default as _} from 'underscore';
import {TauChartError as Error, errorCodes} from './error';

var UnitsMap = {};
var SeedsMap = {};

var unitsRegistry = {

    reg(unitType, xUnit, xSeed) {

        if (xSeed) {
            SeedsMap[unitType] = xSeed;
            UnitsMap[unitType] = function (seed) {
                this.___tauchartsseed___ = seed;
            };
            UnitsMap[unitType].prototype = _.extend(
                {
                    node() {
                        return this.___tauchartsseed___;
                    },
                    init() {
                        this.node().init();
                    },
                    draw() {
                        this.node().draw();
                    },
                    walkFrames() {
                        // TODO: remove
                    }
                },
                xUnit);
        } else {
            UnitsMap[unitType] = xUnit;
        }
        return this;
    },

    get(unitType) {

        if (!UnitsMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType, errorCodes.UNKNOWN_UNIT_TYPE);
        }

        return UnitsMap[unitType];
    },

    create(unitType, unitConfig) {
        var Unit = this.get(unitType);
        var node;
        if (SeedsMap[unitType]) {
            var Seed = this.get(SeedsMap[unitType]);
            node = new Unit(new Seed(unitConfig));
        } else {
            node = new Unit(unitConfig);
        }

        return node;
    }
};

export {unitsRegistry};