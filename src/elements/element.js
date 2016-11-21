import {Emitter} from '../event';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

export class Element extends Emitter {

    // add base behaviour here
    constructor(config) {
        super(config);
        this.screenModel = null;
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

    allocateRect() {
        return {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
    }

    /* eslint-disable */
    defineGrammarModel(fnCreateScale) {
        return {};
    }

    getGrammarRules() {
        return [];
    }

    getAdjustScalesRules() {
        return [];
    }

    createScreenModel(grammarModel) {
        // return nothing
    }
    /* eslint-enable */

    addInteraction() {
        // do nothing
    }

    draw() {
        // TODO: expose to explicit call everywhere
        this.config.options.container = this.config.options.slot(this.config.uid);
        this.drawFrames(this.config.frames);
    }

    data() {
        return this
            .config
            .frames
            .reduce(((data, frame) => data.concat(frame.part())), []);
    }

    node() {
        return this;
    }
}