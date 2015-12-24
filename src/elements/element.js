import {Emitter} from '../event';

var throttleLastEvent = function (last, eventType, handler, limitFromPrev = 0) {

    return function (eventData) {
        var curr = {e: eventType, ts: (new Date())};
        var diff = ((last.e && (last.e === curr.e)) ? (curr.ts - last.ts) : (limitFromPrev));

        if (diff >= limitFromPrev) {
            handler.call(this, eventData);
        }

        last.e = curr.e;
        last.ts = curr.ts;
    };
};

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
        var last = {};
        [
            {
                event: 'mouseover',
                limit: 0
            },
            {
                event: 'mouseout',
                limit: 0
            },
            {
                event: 'click',
                limit: 0
            },
            {
                event: 'mousemove',
                limit: 25
            }
        ].forEach((item) => {
            var eventName = item.event;
            var limit = item.limit;

            var callback = function (d) {
                var eventData = {
                    data: dataInterceptor.call(this, d),
                    event: eventInterceptor.call(this, d3.event, d)
                };
                self.fire(eventName, eventData);
                self.fireNameSpaceEvent(eventName, eventData);
            };

            sel.on(eventName, throttleLastEvent(last, eventName, callback, limit));
        });
    }
}