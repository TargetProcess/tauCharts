(function () {
    /** @class
     * @extends Plugin */
    var Plugins = Class.extend({
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
        },

        mouseover: function (context, tools) {
            this._call('mouseover', arguments);
        },

        mouseout: function (context, tools) {
            this._call('mouseout', arguments);
        }
    });

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
         * @param {PropertyMapper} mapper */
        init: function (mapper) {
            this._mapper = mapper;
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
            this._mapper.range([0, this._width]);

            var xAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapper._scale)
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
                .text(this._mapper.caption());
        }
    });

    /** @class
     * @extends Axis */
    var YAxis = Axis.extend({
        render: function (context) {
            this._mapper.range([this._height, 0]);

            var yAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapper._scale)
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
                .text(this._mapper.caption());
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
                    .attr("r", this._mapper.map("size"))
                    .attr("cx", this._mapper.map("x"))
                    .attr("cy", this._mapper.map("y"))
                    .style("fill", this._mapper.map("color"))
                    .on('click', function (d) {
                        this._plugins.click(new ClickContext(d), new ChartElementTools(svg.selectAll('circle')));
                    }.bind(this))
                    .on('mouseover', function (d) {
                        this._plugins.mouseover(new HoverContext(d), new ChartElementTools(svg.selectAll('circle')));
                    }.bind(this))
                    .on('mouseout', function (d) {
                        this._plugins.mouseout(new HoverContext(d), new ChartElementTools(svg.selectAll('circle')));
                    }.bind(this));

                this._plugins.render(new RenderContext(), new ChartTools(svg, width, height, this._mapper));
            }.bind(this));
        }
    });

    /** @class ChartTools */
    var ChartTools = Class.extend({
        /**
         * @constructs
         * @param d3Context
         * @param width
         * @param height
         * @param {Mapper} mapper
         */
        init: function (d3Context, width, height, mapper) {
            this.d3 = d3Context;
            this.width = width;
            this.height = height;
            this.mapper = mapper;
        }
    });

    /** @class ChartElementTools*/
    var ChartElementTools = Class.extend({
        /** @constructs */
        init: function (elementContext) {
            this._elementContext = elementContext;
        }
        //TODO: I don't think this is required (MD)
        /*
        highlight: function (datum) {
            this._elementContext.classed('highlighted', function (d) {
                return d === datum
            });
        },

        tooltip: function (html) {
            d3.select('body')
            .append('div')
            .classed('tooltip', true)
            .style('top', (event.pageY-10)+"px")
            .style('left',(event.pageX+10)+"px")
            .style('display', 'block')
            .html(html);
        }*/
    });

    /** @class RenderContext*/
    var RenderContext = Class.extend({
    });

    /** @class ClickContext*/
    var ClickContext = Class.extend({
        /** @constructs */
        init: function (datum) {
            this.datum = datum;
        }
    });

    /** @class HoverContext*/
    var HoverContext = Class.extend({
        /** @constructs */
        init: function (datum) {
            this.datum = datum;
        }
    });

    tau.charts = {
        /**
         * @param data
         * @returns {ScatterPlotChart}
         */
        Scatterplot: function (data) {
            return new ScatterPlotChart(data);
        }
    };
})();
