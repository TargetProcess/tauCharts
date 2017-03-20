import {TauChartError as Error, errorCodes} from './error';

var UnitsMap = {};
var SeedsMap = {};

var unitsRegistry = {

    reg(unitType, xUnit, xSeed) {

        if (xSeed) {
            SeedsMap[unitType] = xSeed;
            UnitsMap[unitType] = function (config, Base) {
                this.___tauchartsseed___ = new Base(this.init(config));
            };
            UnitsMap[unitType].prototype = Object.assign(
                {
                    init(config) {
                        return config;
                    },
                    defineGrammarModel(params) {
                        return this.node().defineGrammarModel(params);
                    },
                    getGrammarRules(grammarModel) {
                        return this.node().getGrammarRules(grammarModel);
                    },
                    getAdjustScalesRules(grammarModel) {
                        return this.node().getAdjustScalesRules(grammarModel);
                    },
                    createScreenModel(grammarModel) {
                        return this.node().createScreenModel(grammarModel);
                    },
                    addInteraction() {
                        this.node().addInteraction();
                    },
                    node() {
                        return this.___tauchartsseed___;
                    },
                    draw() {
                        this.node().draw();
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
            var Base = this.get(SeedsMap[unitType]);
            node = new Unit(unitConfig, Base);
        } else {
            node = new Unit(unitConfig);
        }

        return node;
    }
};

export {unitsRegistry};