var NULL_HANDLER = {};
var events = {};


/**
 * Creates new type of event or returns existing one, if it was created before.
 * @param {string} eventName
 * @return {function(..eventArgs)}
 */
function createDispatcher(eventName) {
    var eventFunction = events[eventName];

    if (!eventFunction) {
        eventFunction = function () {
            var cursor = this;
            var args;
            var fn;
            var i = 0;
            while (cursor = cursor.handler) { // jshint ignore:line
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

                    fn.apply(cursor.context, args);
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

                    fn.call(cursor.context, {
                        sender: this,
                        type: eventName,
                        args: args
                    });
                }
            }

        };

        events[eventName] = eventFunction;
    }

    return eventFunction;
}

/**
 * Base class for event dispatching. It provides interface for instance
 * to add and remove handler for desired events, and call it when event happens.
 * @class
 */
class Emitter {
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
    addHandler(callbacks, context) {
        context = context || this;
        // add handler
        this.handler = {
            callbacks: callbacks,
            context: context,
            handler: this.handler
        };
    }

    on(name, callback, context) {
        var obj = {};
        obj[name] = callback;
        this.addHandler(obj, context);
        return obj;
    }

    fire(name, data) {
        createDispatcher.call(this, name).call(this, data);
    }

    /**
     * Removes event handler set from object. For this operation parameters
     * must be the same (equivalent) as used for addHandler method.
     * @param {object} callbacks Callback set.
     * @param {object=} context Context object.
     */
    removeHandler(callbacks, context) {
        var cursor = this;
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



