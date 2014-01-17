(function(){
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

        binder: function (key) {
            return this._propertyMappers[key]; // TODO: try to get rid of this method
        },

        bind: function (key) {
            var binder = this.binder(key);
            return binder.bind.bind(binder);
        }
    });

    /**
     * @class
     */
    var PropertyMapper = Class.extend({
        /** @constructs */
        init: function (name) {
            this._name = name;
            this._scale = d3.scale.linear();
        },

        bind: function (d) {
            return this._scale(d[this._name]);
        },

        linear: function () {
            //noinspection JSValidateTypes,JSUnresolvedFunction
            this._scale = d3.scale.linear().domain([0, 30]).nice(); // TODO: use 0 - max by default
            return this;
        },

        category10: function () {
            this._scale = d3.scale.category10();
            return this;
        },

        range: function () {
            this._scale.range.apply(this._scale, arguments);
            return this;
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