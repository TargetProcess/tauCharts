(function () {
    var Class = function () {
    };

    Class.extend = function (prop) {
        var _super = this.prototype;
        var initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            //noinspection JSUnfilteredForInLoop
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" ?
                (function (name, fn) {
                    return function () {
                        //noinspection JSPotentiallyInvalidUsageOfThis
                        var tmp = this._super;
                        //noinspection JSPotentiallyInvalidUsageOfThis,JSUnfilteredForInLoop
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        //noinspection JSPotentiallyInvalidUsageOfThis
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        function Class() {
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };

    var DataSource = Class.extend({
        /**
         * @abstract
         * @param {Function} callback
         */
        get: function (callback) { // TODO: deferred
            throw new Error('not implemented');
        }
    });

    /**
     * @class
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

    /**
     * @class
     */
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

    var data = {
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

    /**
     * @class
     */
    var Chart = Class.extend({
        /**
         * @constructs
         * @param {DataSource} dataSource
         */
        init: function (dataSource) {
            this._dataSource = dataSource;
        },

        map: function (config) {
            /** @type Mapper */
            this._mapper = tau.data.Mapper(config);
            return this;
        },

        plugins: function () {
            /** @type {Plugin} */
            this._plugins = new Plugins(arguments);
            return this;
        },

        render: function () {
            throw new Error('Not implemented');
        }
    });

    /** @class */
    var Axis = Class.extend({
        /**
         * @constructs
         * @param {Object} binder */
        init: function (binder) {
            this._binder = binder;
        },

        render: function (context) {
        },

        box: function (width, height) {
            this._width = width;
            this._height = height;
        }
    });

    /** @class
     * @extends Axis */
    var XAxis = Axis.extend({
        render: function (context) {
            // TODO: internal properties of binder are exposed
            this._binder.range([0, this._width]);

            var xAxis = d3.svg.axis()
                .scale(this._binder._scale)
                .orient("bottom");

            context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this._height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", this._width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text(this._binder._name);
        }
    });

    /** @class
     * @extends Axis */
    var YAxis = Axis.extend({
        render: function (context) {
            // TODO: internal properties of binder are exposed
            this._binder.range([this._height, 0]);

            var yAxis = d3.svg.axis()
                .scale(this._binder._scale)
                .orient("left");

            context.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(this._binder._name);
        }
    });

    /**@class */
    /**@extends Chart */
    var ScatterPlotChart = Chart.extend({
        /** @constructs
         * @param {DataSource} dataSource */
        init: function (dataSource) {
            this._super.call(this, dataSource);
        },

        render: function (selector) {
            var axes = [new XAxis(this._mapper.binder("x")), new YAxis(this._mapper.binder("y"))];
            var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var svg = d3.select(selector)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            this._dataSource.get(/** @this ScatterPlotChart */ function (data) {
                for (var i = 0; i < axes.length; i++) {
                    axes[i].box(width, height); // TODO: bad
                    axes[i].render(svg);
                }

                svg.selectAll(".dot")
                    .data(data)
                    .enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", this._mapper.bind("size"))
                    .attr("cx", this._mapper.bind("x"))
                    .attr("cy", this._mapper.bind("y"))
                    .style("fill", this._mapper.bind("color"))
                    .on('click', function (d) {
                        this._plugins.click(new ClickContext(d), new ChartElementTools(svg.selectAll('circle')));
                    }.bind(this));

                this._plugins.render(new RenderContext(), new ChartTools(svg, width, height, this._mapper));
            }.bind(this));
        }
    });

    /** @class */
    var ChartTools = Class.extend({
        /** @constructs */
        init: function (d3Context, width, height, mapper) {
            this.d3 = d3Context;
            this.width = width;
            this.height = height;
            this.mapper = mapper;
        }
    });

    /** @class */
    var ChartElementTools = Class.extend({
        /** @constructs */
        init: function (elementContext) {
            this._elementContext = elementContext;
        },

        highlight: function (datum) {
            this._elementContext.classed('highlighted', function (d) {
                return d === datum
            });
        },

        tooltip: function (html) {
            d3.select('body').append('div').html(html);
        }
    });

    /** @class */
    var RenderContext = Class.extend({
    });

    /** @class */
    var ClickContext = Class.extend({
        /** @constructs */
        init: function (datum) {
            this.datum = datum;
        }
    });

    var charts = {
        /**
         * @param data
         * @returns {ScatterPlotChart}
         */
        Scatterplot: function (data) {
            return new ScatterPlotChart(data);
        }
    };

    /** @class Plugin */
    var Plugin = Class.extend({
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
        },

        /**
         * @param {ClickContext} context
         * @param {ChartElementTools} tools
         */
        click: function (context, tools) {
        }
    });

    /** @class
     * @extends Plugin */
    var Plugins = Plugin.extend({
        /** @constructs */
        init: function (plugins) {
            this._plugins = plugins;
        },

        _call: function (name, args) {
            for (var i = 0; i < this._plugins.length; i++) {
                if (typeof(this._plugins[i][name]) == "function") {
                    this._plugins[i][name].apply(this._plugins[i], args);
                }
            }
        },

        render: function (context, tools) {
            this._call('render', arguments);
        },

        click: function (context, tools) {
            this._call('click', arguments);
        }
    });

    /** @class
     * @extends Plugin */
    var Legend = Class.extend({
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
            // TODO: use via context and tools
            var color = tools.mapper.binder("color")._scale; // TODO: scale exposed - bad
            var width = tools.width;

            var legend = tools.d3.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) {
                    return d;
                });
        }
    });

    /** @class
     * @extends Plugin */
    var Tooltip = Class.extend({
        /**
         * @param {ClickContext} context
         * @param {ChartElementTools} tools
         */
        click: function (context, tools) {
            tools.highlight(context.datum);
            tools.tooltip('<span>effort = ' + context.datum.effort + '</span>');
        }
    });

    var plugins = {
        tooltip: function () {
            return new Tooltip();
        },
        legend: function () {
            return new Legend();
        }
    };

    /** @global */
    window.tau = {
        charts: charts,
        data: data,
        plugins: plugins
    };
})();