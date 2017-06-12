import {Emitter} from '../event';
import * as utils from '../utils/utils';
import * as d3 from 'd3';
import {
    global_Element,
    GrammarElement,
    GrammarModel,
    ScaleFunction,
    ScreenModel,
    Unit
} from '../definitions';

import {DataFrame} from '../data-frame';

export abstract class Element extends Emitter implements GrammarElement {

    abstract init(config: Unit);

    config: Unit;
    screenModel: GrammarModel;
    _elementNameSpace: string;
    _elementScalesHub: {[scale: string]: ScaleFunction};

    // add base behaviour here
    constructor(config: Unit) {
        super();
        this.screenModel = null;
        this._elementNameSpace = (config.namespace || 'default');
        this._elementScalesHub = {};
    }

    regScale(paramId: string, scaleObj: ScaleFunction) {
        this._elementScalesHub[paramId] = scaleObj;
        return this;
    }

    getScale(paramId: string) {
        return this._elementScalesHub[paramId] || null;
    }

    fireNameSpaceEvent(eventName: string, eventData: any) {
        var namespace = this._elementNameSpace;
        this.fire(`${eventName}.${namespace}`, eventData);
    }

    subscribe(sel: GrammarElement, dataInterceptor = ((x: any) => x), eventInterceptor = ((x: Event) => x)) {
        var self = this;
        var last = {};
        ([
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
                limit: 'requestAnimationFrame'
            }
        ] as {event: string; limit: 'requestAnimationFrame' | number}[]).forEach((item) => {
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
        return null;
    }

    getClosestElement(x, y) {
        return null;
    }
    /* eslint-enable */

    addInteraction() {
        // do nothing
    }

    abstract drawFrames(frames: DataFrame[]);

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