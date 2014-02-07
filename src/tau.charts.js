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

    var Axes = {
        padding: 10
    };

    /** @class */
    var Axis = Class.extend({
        /**
         * @constructs
         * @param {PropertyMapper} mapper */
        init: function (mapper) {
            this._mapper = mapper;
        },

        render: function (context) {
        }
    });

    /** @class
     * @extends Axis */
    var XAxis = Axis.extend({
        render: function (container) {
            var xAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapper._scale)
                .orient("bottom");

            container
                .append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + Axes.padding + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", container.layout('width'))
                .attr("y", -xAxis.tickSize())
                .style("text-anchor", "end")
                .text(this._mapper.caption());
        }
    });

    /** @class
     * @extends Axis */
    var YAxis = Axis.extend({
        render: function (container) {
            var yAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapper._scale)
                .orient("left");

            container
                .append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(-" + Axes.padding + ", 0)")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", yAxis.tickSize() + container.layout('width'))
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(this._mapper.caption());

            container
                .selectAll(".tick line")
                .attr('x1', container.layout('width') - 6)
                .attr('x2', container.layout('width'));

            container
                .selectAll(".tick text")
                .attr('dx', container.layout('width'));

            container
                .select('.domain')
                .attr('transform', 'translate(' + container.layout('width') + ', 0)');
        }
    });

    /** @class */
    var Grid = Class.extend({
        init: function (mapperX, mapperY) {
            this._mapperX = mapperX;
            this._mapperY = mapperY;
        },

        render: function (container) {
            var xAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapperX._scale)
                .orient('bottom')
                .tickSize(container.layout('height'));

            var yAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapperY._scale)
                .orient('left')
                .tickSize(-container.layout('width'));

            container.select('.grid').append('g').call(xAxis);
            container.select('.grid').append('g').call(yAxis);

            // TODO: make own axes and grid instead of using d3's in such tricky way
            container.selectAll('text').remove();
        }
    });

    /**@class */
    /**@extends Chart */
    var BasicChart = Chart.extend({
        /** @constructs
         * @param {DataSource} dataSource */
        init: function (dataSource) {
            this._super.call(this, dataSource);
        },

        _renderData: function (container, data) {
            throw new Error('Not implemented');
        },

        render: function (selector) {
            var container = tau.svg.paddedBox(d3.select(selector), {top: 20, right: 20, bottom: 30, left: 40});

            this._dataSource.get(/** @this BasicChart */ function (data) {
                var layout = new tau.svg.Layout(container);

                layout.row(-30);
                var yAxisContainer = layout.col(20);
                var dataContainer = layout.col();

                layout.row();
                layout.col(20);
                var xAxisContainer = layout.col();

                dataContainer.append("g").attr("class", "grid"); // TODO: tricky way to create placeholder for grid which will be at the bottom, refactor

                this._renderData(dataContainer, data);
                this._dataSource.update(this._renderData.bind(this, dataContainer));

                new YAxis(this._mapper.binder("y")).render(yAxisContainer);
                new XAxis(this._mapper.binder("x")).render(xAxisContainer);
                new Grid(this._mapper.binder("x"), this._mapper.binder("y")).render(dataContainer);

                tau.svg.bringOnTop(dataContainer);

                this._plugins.render(new RenderContext(this._dataSource), new ChartTools(container, this._mapper));
            }.bind(this));
        }
    });

    /**@class */
    /**@extends BasicChart */
    var ScatterPlotChart = BasicChart.extend({

        _renderData: function (container, data) {
            this._mapper.binder('x').range([0, container.layout('width')]);
            this._mapper.binder('y').range([container.layout('height'), 0]);

            var plugins = this._plugins;
            var mapper = this._mapper;

            var update = function(){
                return this
                    .attr("class",  mapper.map("color"))
                    .classed("dot", true)
                    .attr("r", mapper.map("size"))
                    .attr("cx", mapper.map("x"))
                    .attr("cy", mapper.map("y"))
                    .on('click', function (d) {
                        plugins.click(new ClickContext(d), new ChartElementTools(d3.select(this)));
                    })
                    .on('mouseover', function (d) {
                        plugins.mouseover(new HoverContext(d), new ChartElementTools(d3.select(this)));
                    })
                    .on('mouseout', function (d) {
                        plugins.mouseout(new HoverContext(d), new ChartElementTools(d3.select(this)));
                    });
            };

            var elements = container.selectAll(".dot").data(data);

            elements.call(update);
            elements.enter().append("circle").call(update);
            elements.exit().remove();
        }
    });


    /**@class */
    /**@extends BasicChart */
    var LineChart = BasicChart.extend({

        _renderData: function (container, data) {
            var plugins = this._plugins;
            var mapper = this._mapper;

            mapper.binder('x').range([0, container.layout('width')]);
            mapper.binder('y').range([container.layout('height'), 0]);

            //TODO: allow to set interpolation outside
            var _line = d3.svg.line()
                .interpolate("basis")
                .x(mapper.map("x"))
                .y(mapper.map("y"));

            var groupName = mapper._propertyMappers.color._name;

            // prepare data to build several lines
            // TODO: provide several data transformers to support more formats
            // sometime we will have data already nested, for example.
            var categories = d3.nest()
                .key(function(d) { return d[groupName]; })
                .entries(data);

            var updateLines = function(){
                return this
                .attr("class", function(d){
                    var v = {};
                    v[groupName] = d.key;
                    return mapper.map("color")(v); // TODO: we have to remap value to get color...
                }.bind(this))
                .classed("line", true)
                .attr("d", function(d) {return _line.call(this, d.values); });
            };

            var updateDots = function(){
                 // draw circles (to enable mouse interactions)
                return this
                .attr("class",  mapper.map("color"))
                .classed("dot", true)
                .attr("cx", mapper.map("x"))
                .attr("cy", mapper.map("y"))
                .attr('r', function() { return 3; })
                .on('mouseover', function (d) {
                    plugins.mouseover(new HoverContext(d), new ChartElementTools(d3.select(this)));
                })
                .on('mouseout', function (d) {
                    plugins.mouseout(new HoverContext(d), new ChartElementTools(d3.select(this)));
                });

            };

            var lines = container.selectAll(".line").data(categories);
            lines.call(updateLines);
            lines.enter().append("path").call(updateLines);
            lines.exit().remove();

            var dots = container.selectAll('.dot').data(data);
            dots.call(updateDots);
            dots.enter().append("circle").call(updateDots);
            dots.exit().remove();
        }

    });

    /** @class ChartTools */
    var ChartTools = Class.extend({
        /**
         * @constructs
         * @param d3container
         * @param {Mapper} mapper
         */
        init: function (d3container, mapper) {
            this.d3 = d3container;
            this.mapper = mapper;
        }
    });

    /** @class ChartElementTools*/
    var ChartElementTools = Class.extend({
        /** @constructs */
        init: function (element) {
            this.element = element;
        }
    });

    /** @class RenderContext*/
    var RenderContext = Class.extend({
        /** @constructs */
        init: function(dataSource) {
            this.data = dataSource;
        }
    });

    /** @class ElementContext */
    var ElementContext = Class.extend({
        /**
         * @constructs
         * @param datum
         */
        init: function (datum) {
            this.datum = datum;
        }
    });

    /**
     * @class ClickContext
     * @extends {ElementContext}
     */
    var ClickContext = ElementContext.extend({
    });

    /**
     * @class HoverContext
     * @extends {ElementContext}
     */
    var HoverContext = ElementContext.extend({
    });

    tau.charts = {
        /**
         * @param data
         * @returns {ScatterPlotChart}
         */
        Scatterplot: function (data) {
            return new ScatterPlotChart(data);
        },
        Line: function (data) {
            return new LineChart(data);
        }
    };
})();
