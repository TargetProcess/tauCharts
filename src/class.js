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

    Class.extend = function extend (prop) {
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