export type EventCallback = (sender?: Emitter, data?: any) => void;

export interface EventHandlerMap {
    [event: string]: EventCallback;
}

var NULL_HANDLER: EventHandlerMap = {};
var events: EventHandlerMap = {};

/**
 * Creates new type of event or returns existing one, if it was created before.
 * @param {string} eventName
 * @return {function(..eventArgs)}
 */
function createDispatcher(eventName: string) {
    var eventFunction = events[eventName];

    if (!eventFunction) {
        eventFunction = function () {
            var cursor = this;
            var args;
            var fn;
            var i = 0;
            var queue = [];
            while (cursor = cursor.handler) { // eslint-disable-line
                // callback call
                fn = cursor.callbacks[eventName];
                if (typeof fn === 'function') {
                    if (!args) {
                        // it should be better for browser optimizations
                        // (instead of [this].concat(slice.call(arguments)))
                        args = [this];
                        for (i = 0; i < arguments.length; i++) {
                            args.push(arguments[i]);
                        }
                    }

                    queue.unshift({
                        fn: fn,
                        context: cursor.context,
                        args:args
                    });
                }

                // any event callback call
                fn = cursor.callbacks['*'];
                if (typeof fn === 'function') {
                    if (!args) {
                        // it should be better for browser optimizations
                        // (instead of [this].concat(slice.call(arguments)))
                        args = [this];
                        for (i = 0; i < arguments.length; i++) {
                            args.push(arguments[i]);
                        }
                    }

                    queue.unshift({
                        fn: fn,
                        context: cursor.context,
                        args: [
                            {
                                sender: this,
                                type: eventName,
                                args: args
                            }
                        ]
                    });
                }
            }

            queue.forEach((item) => item.fn.apply(item.context, item.args));
        };

        events[eventName] = eventFunction;
    }

    return eventFunction;
}

type HandlerObject = {
    callbacks: EventHandlerMap;
    context: any;
    handler: HandlerObject;
};

/**
 * Base class for event dispatching. It provides interface for instance
 * to add and remove handler for desired events, and call it when event happens.
 * @class
 */

class Emitter {
    handler: HandlerObject;
    emit_destroy: EventCallback;

    /**
     * @constructor
     */
    constructor() {
        this.handler = null;
        this.emit_destroy = createDispatcher('destroy');
    }

    /**
     * Adds new event handler to object.
     * @param {object} callbacks Callback set.
     * @param {object=} context Context object.
     */
    addHandler(callbacks: EventHandlerMap, context?: any) {
        context = context || this;
        // add handler
        this.handler = {
            callbacks: callbacks,
            context: context,
            handler: this.handler
        };
    }

    on(name: string, callback: EventCallback, context?: any): EventHandlerMap {
        var obj = {};
        obj[name] = callback;
        this.addHandler(obj, context);
        return obj;
    }

    fire(name: string, data?: any) {
        createDispatcher.call(this, name).call(this, data);
    }

    /**
     * Removes event handler set from object. For this operation parameters
     * must be the same (equivalent) as used for addHandler method.
     * @param {object} callbacks Callback set.
     * @param {object=} context Context object.
     */
    removeHandler(callbacks: EventHandlerMap, context?: any) {
        var cursor: HandlerObject | this = this;
        var prev;

        context = context || this;

        // search for handler and remove it
        while (prev = cursor, cursor = cursor.handler) { // jshint ignore:line
            if (cursor.callbacks === callbacks && cursor.context === context) {
                // make it non-callable
                cursor.callbacks = NULL_HANDLER;

                // remove from list
                prev.handler = cursor.handler;

                return;
            }
        }

    }

    /**
     * @destructor
     */
    destroy() {
        // fire object destroy event handlers
        this.emit_destroy();
        // drop event handlers if any
        this.handler = null;
    }
}

//
// export names
//
export {Emitter};