import {Emitter} from '../event';

export class Element extends Emitter {

    // add base behaviour here
    constructor(config) {
        super(config);
        this._elementScalesHub = {};
    }

    regScale(paramId, scaleObj) {
        this._elementScalesHub[paramId] = scaleObj;
        return this;
    }

    getScale(paramId) {
        return this._elementScalesHub[paramId] || null;
    }
}