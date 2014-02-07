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
        return function() {
            fn1.apply(fn1, arguments);
            fn2.apply(fn2, arguments);
        }
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

        domain: function (key) {
            return this.binder(key).domain();
        },

        map: function (key) {
            return this.binder(key).map.bind(this.binder(key));
        },

        raw: function (key) {
            return this.binder(key).raw.bind(this.binder(key));
        },

        alias: function (key, prop) {
            this._propertyMappers[key].alias(prop);
        },

        format: function (key) {
            // TODO: get rid of it
            return this.binder(key).format.bind(this.binder(key));
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

        alias: function(name) {
            this._names.push(name);
        },

        raw: function (d) {
            return d[this._names
                .filter(function(name){
                    return d.hasOwnProperty(name)
                })[0]];
        },

        map: function (d) {
            return this._scale(this.raw(d));
        },

        format: function (d) {
            return d[this._name].toString();
        },

        linear: function () {
            //noinspection JSValidateTypes,JSUnresolvedFunction
            this._scale = d3.scale.linear().domain([0, 30]).nice(); // TODO: use 0 - max by default
            return this;
        },

        domain: function () {
            return this._scale.domain().map(toObject.bind(null, this._name));
        },

        category10: function () {
            this._scale = d3.scale.ordinal().range(['color10-1', 'color10-2', 'color10-3', 'color10-4', 'color10-5', 'color10-6', 'color10-7', 'color10-8', 'color10-9', 'color10-10']);
            return this;
        },

        range: function () {
            this._scale.range.apply(this._scale, arguments);
            return this;
        },

        caption: function (value) {
            if (value) {
                this._caption = value;
                return this;
            }

            return this._caption;
        }
    });

    tau.data = {
        Array: function (d) {
            return new ArrayDataSource(d);
        },

        Mapper: function (config) {
            function processConfig() {
                var result = {};

                for (var key in config) {
                    var mapper = config[key];

                    if (typeof(mapper) === 'string') {
                        mapper = new PropertyMapper(mapper);
                    }

                    result[key] = mapper;
                }

                return result
            }

            return new Mapper(processConfig());
        },

        /**
         * @param {String} name
         * @returns {PropertyMapper}
         */
        map: function (name) {
            return new PropertyMapper(name);
        }
    };
})();