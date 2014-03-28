(function () {
    var extend = function (obj, key, value) {
        obj[key] = value;
        return obj;
    };

    var toObject = function (key, value) {
        return extend({}, key, value);
    };

    var noop = function () {
    };

    var chain = function (fn1, fn2) {
        return function () {
            fn1.apply(fn1, arguments);
            fn2.apply(fn2, arguments);
        };
    };

    /** @class DataSource
     * @extends Class */
    var DataSource = Class.extend({
        /**
         * @constructs
         */
        init: function () {
            this._observers = {
                'update': noop
            };
        },
        /**
         * @abstract
         * @param {Function} callback
         */
        get: function (callback) {
            throw new Error('not implemented');
        },

        /**
         * @abstract
         * @param {Function} predicate
         */
        filter: function (predicate) {
            throw new Error('not implemented');
        },

        update: function (callback) {
            this._on('update', callback);
        },

        _on: function (e, observer) {
            this._observers[e] = chain(this._observers[e], observer);
        },

        _trigger: function (e, data) {
            this._observers[e](data);
        }
    });

    /**
     * @class ArrayDataSource
     * @extends DataSource */
    var ArrayDataSource = DataSource.extend({
        /** @constructs */
        init: function (data) {
            this._data = data;
            this._super();
        },

        get: function (callback) {
            callback(this._predicate ? this._data.filter(this._predicate) : this._data); // TODO: ix copy-paste
        },

        filter: function (predicate) {
            this._predicate = predicate;
            this._trigger('update', this._predicate ? this._data.filter(this._predicate) : this._data);
        }
    });

    /** @class Mapper */
    var Mapper = Class.extend({
        /** @constructs
         * @param {PropertyMapper[]} propertyMappers */
        init: function (propertyMappers) {
            this._propertyMappers = propertyMappers;
        },

        /**
         * @param key
         * @returns {PropertyMapper}
         */
        binder: function (key) {
            return this._propertyMappers[key]; // TODO: try to get rid of this method
        },

        _getDomain: function (key) {
            return this.binder(key).domain();
        },

        _setDomain: function (data) {
            for (var key in this._propertyMappers) {
                this._propertyMappers[key]._setDomain(data); // TODO: messy
            }
        },

        domain: function (args) {
            if (typeof(args) === 'string') {
                return this._getDomain(args);
            } else {
                this._setDomain(args);
            }
        },

        _bind: function (key, callback, ctx) {
            var regex = /%[^%]*%/g;

            if (regex.test(key)) {
                return function (d) {
                    return key.replace(regex, function (capture) {
                        var key = capture.substr(1, capture.length - 2);
                        return callback.call(ctx, key, d);
                    });
                };
            }

            return function (d) {
                return callback.call(ctx, key, d);
            };
        },

        map: function (key) {
            return this._bind(key, function (key, d) {
                return this.binder(key).map(d);
            }, this);
        },

        raw: function (key) {
            return this._bind(key, function (key, d) {
                return this.binder(key).raw(d);
            }, this);
        },

        alias: function (key, prop) {
            this._propertyMappers[key].alias(prop);
        }
    });

    /**
     * @class
     */
    var PropertyMapper = Class.extend({
        /** @constructs */
        init: function (name) {
            this._names = [name];
            this._caption = name;
            this._scale = d3.scale.linear();
        },

        alias: function (name) {
            // TODO: find way to get rid of it
            this._names.push(name);
        },

        _getOwnProperty: function (d) {
            return this._names
                .filter(function (name) {
                    return d.hasOwnProperty(name);
                })[0];
        },

        raw: function (d) {
            return d[this._getOwnProperty(d)];
        },

        map: function (d) {
            var key = this._getOwnProperty(d);
            return this._scale(key ? d[key] : this._default);
        },

        time: function () {
            this._scale = d3.time.scale();
            return this;
        },

        domain: function () {
            // TODO: do we still need toObject here?
            return this._scale.domain().map(toObject.bind(null, this._names[0]));
        },

        range: function () {
            this._scale.range.apply(this._scale, arguments);
        },

        caption: function () {
            return this._caption;
        }
    });

    /**
     * @class
     */
    var PropertyMapperBuilder = Class.extend({
        /**
         * @constructs
         * @param name
         */
        init: function (name) {
            this._name = name;
            this._scale = null;
        },

        linear: function () {
            //noinspection JSValidateTypes,JSUnresolvedFunction
            this._scale = d3.scale.linear();
            return this;
        },

        range: function() {
            this._scale.range.apply(this._scale.range, arguments);
            return this;
        },

        color10: function () {
            this._scale = tau.data.scale.color10();
            return this;
        },

        caption: function (value) {
            // TODO: maybe better to put it to meta?
            this._caption = value;
            return this;
        },

        domain: function () {
            this._scale.domain.apply(this._scale.domain, arguments);
            return this;
        },

        /**
         * @param {{type: Type, default: Bool, default: Object}} meta
         * @returns {PropertyMapper}
         */
        build: function (meta) {
            var propertyMapper = new PropertyMapper(this._name);
            propertyMapper._scale = this._scale || meta.type.defaultScale();
            propertyMapper._setDomain = meta.type.setDomain.bind(propertyMapper);
            propertyMapper._default = meta.default;
            propertyMapper._caption = this._caption || this._name;
            return propertyMapper;
        }
    });

    /**
     * @class
     */
    var MapperBuilder = Class.extend({
        /**
         * @construct
         */
        init: function () {
        },

        config: function (config) {
            this._config = config;

            return this;
        },

        build: function (meta) {
            var propertyMappers = {};

            for (var key in meta) {
                var propertyMapperBuilder = this._config[key];

                if (typeof(propertyMapperBuilder) === 'undefined') {
                    propertyMapperBuilder = key;
                }

                if (typeof(propertyMapperBuilder) === 'string') {
                    propertyMapperBuilder = new PropertyMapperBuilder(propertyMapperBuilder);
                }

                propertyMappers[key] = propertyMapperBuilder.build(meta[key]);
            }

            return new Mapper(propertyMappers);
        }
    });

    /**
     * @class
     */
    var Scales = Class.extend({
        color10: function() {
            return d3.scale.ordinal().range(['color10-1', 'color10-2', 'color10-3', 'color10-4', 'color10-5', 'color10-6', 'color10-7', 'color10-8', 'color10-9', 'color10-10']);
        }
    });

    tau.data = {
        Array: function (d) {
            return new ArrayDataSource(d);
        },

        /**
         * @type {MapperBuilder}
         */
        MapperBuilder: MapperBuilder,

        /**
         * @param {String} name
         * @returns {PropertyMapperBuilder}
         */
        map: function (name) {
            return new PropertyMapperBuilder(name);
        },

        /**
         * @type Scales
         */
        scale: new Scales(),

        identity: function (x) {
            return x;
        }
    };
})();
