import {TauChartError as Error, errorCodes} from './error';
import {GrammarElement, Unit} from './definitions';

interface ElementConsructor {
    new (config: Unit, Base?: ElementConsructor): GrammarElement;
    prototype: GrammarElement;
}

var UnitsMap: {[type: string]: ElementConsructor } = {};
var SeedsMap: {[type: string]: string} = {};

interface UnitsRegistry {
    reg(unitType: string, xUnit: GrammarElement | ElementConsructor, xSeed?: string): UnitsRegistry;
    get(unitType: string): ElementConsructor;
    create(unitType: string, unitConfig: Unit): GrammarElement;
}

var unitsRegistry: UnitsRegistry = {

    reg(unitType: string, xUnit: GrammarElement | ElementConsructor, xSeed?: string) {

        if (xSeed) {
            SeedsMap[unitType] = xSeed;
            UnitsMap[unitType] = <ElementConsructor><any>function (config, Base) {
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
            UnitsMap[unitType] = xUnit as ElementConsructor;
        }
        return this;
    },

    get(unitType: string) {

        if (!UnitsMap.hasOwnProperty(unitType)) {
            throw new Error('Unknown unit type: ' + unitType, errorCodes.UNKNOWN_UNIT_TYPE);
        }

        return UnitsMap[unitType];
    },

    create(unitType: string, unitConfig: Unit) {
        var Unit = this.get(unitType);
        var node: GrammarElement;
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
