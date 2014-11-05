(function (definition) {
    if (typeof define === "function" && define.amd) {
        define(definition);
    } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
    } else {
        this.tauPlugins = definition();
    }
})(function () {
    var tau = {};

    /**
     * @typedef {Object} Class
     * @property {function} init
     * @property {function} _super
     */
    var Class = function () {
    };
    (function (tau, Class) {
        Class.new = function (constructor, args) {
            function Create() {
                return constructor.apply(this, args);
            }

            Create.prototype = constructor.prototype;

            return new Create();
        };

        Class.extend = function extend(prop) {
            var _super = this.prototype;
            var initializing = true;
            var prototype = new this();
            initializing = false;
            for (var name in prop) {
                prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" ?
                    (function (name, fn) {
                        /** @this {Class} */
                        return function () {
                            var tmp = this._super;
                            this._super = _super[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
            }

            /** @this {Class} */
            function Class() {
                if (!initializing && this.init)
                    this.init.apply(this, arguments);
            }

            Class.prototype = prototype;
            Class.prototype.constructor = Class;
            Class.extend = extend;
            return Class;
        };
    })(tau, Class);
    (function (tau, Class) {
        /** @class Plugin */
        var Plugin = Class.extend({

            init: function () {
            },

            /**
             * @param {RenderContext} context
             * @param {ChartTools} tools
             */
            render: function (context, tools) {
            },

            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            click: function (context, tools) {
            },

            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            mouseover: function (context, tools) {
            },

            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            mouseout: function (context, tools) {
            },

            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            mousemove: function (context, tools) {
            }
        });

        tau.plugins = {
            add: function (name, plugin) {
                plugin = Plugin.extend(plugin);

                tau.plugins[name] = function () {
                    return Class.new(plugin, arguments);
                };
            }
        };
    })(tau, Class);
    return tau.plugins;
});