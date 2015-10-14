import {Emitter} from '../event';

export class Element extends Emitter {

    // add base behaviour here
    constructor(config) {
        super(config);
        this._elementNameSpace = (config.namespace || 'default');
        this._elementScalesHub = {};
    }

    regScale(paramId, scaleObj) {
        this._elementScalesHub[paramId] = scaleObj;
        return this;
    }

    getScale(paramId) {
        return this._elementScalesHub[paramId] || null;
    }

    fireNameSpaceEvent(eventName, eventData) {
        var namespace = this._elementNameSpace;
        this.fire(`${eventName}.${namespace}`, eventData);
    }

    subscribe(sel, dataInterceptor = (x => x), eventInterceptor = (x => x)) {
        var self = this;
        ['mouseover', 'mouseout', 'click', 'mousemove'].forEach((eventName) => {
            sel.on(eventName, function (d) {
                var eventData = {
                    data: dataInterceptor.call(this, d),
                    event: eventInterceptor.call(this, d3.event, d)
                };
                self.fire(eventName, eventData);
                self.fireNameSpaceEvent(eventName, eventData);
            });
        });
    }
}