(function () {
    var extend = function (obj, key, value) {
        obj[key] = value;
        return obj;
    };

    var toObject = function (key, value) {
        return extend({}, key, value);
    };

    /** @class DataSource */
    var DataSource = Class.extend({
        /**
         * @abstract
         * @param {Function} callback
         */
        get: function (callback) { // TODO: consider deferred and jQuery reference
            throw new Error('not implemented');
        }
    });

    /**
     * @class ArrayDataSource
     * @extends DataSource */
    var ArrayDataSource = DataSource.extend({
        /** @constructs */
        init: function (data) {
            this._data = data;
        },

        get: function (callback) {
            callback(this._data);
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

        format: function (key) {
            return this.binder(key).format.bind(this.binder(key));
        }
    });

    /**
     * @class
     */
    var PropertyMapper = Class.extend({
        /** @constructs */
        init: function (name) {
            this._name = name;
            this._caption = name;
            this._scale = d3.scale.linear();
        },

        map: function (d) {
            return this._scale(d[this._name]);
        },

        format: function(d){
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
            this._scale = d3.scale.category10();
            return this;
        },

        range: function () {
            this._scale.range.apply(this._scale, arguments);
            return this;
        },

        caption: function(value) {
            if (value){
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