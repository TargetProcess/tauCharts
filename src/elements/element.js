import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

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

            sel.on(eventName, utils.throttleLastEvent(last, eventName, callback, limit));
        });
    }
}