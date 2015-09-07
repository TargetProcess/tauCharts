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

    subscribe(sel, dataInterceptor = (x => x), eventInterceptor = (x => x)) {
        var self = this;
        ['mouseover', 'mouseout', 'click', 'mousemove'].forEach((eventName) => {
            sel.on(eventName, function (d) {
                self.fire(
                    eventName,
                    {
                        data: dataInterceptor.call(this, d),
                        event: eventInterceptor.call(this, d3.event, d)
                    });
            });
        });
    }
}