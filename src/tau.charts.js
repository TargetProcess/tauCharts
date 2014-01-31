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
                .attr("class", "x axis")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", container.layout('width'))
                .attr("y", -6)
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
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6 + container.layout('width'))
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

    /**@class */
    /**@extends Chart */
    var ScatterPlotChart = Chart.extend({
        /** @constructs
         * @param {DataSource} dataSource */
        init: function (dataSource) {
            this._super.call(this, dataSource);
        },

        _renderData: function (container, data) {
            this._mapper.binder('x').range([0, container.layout('width')]);
            this._mapper.binder('y').range([container.layout('height'), 0]);

            container
                .selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", function(d){
                    return "dot " + this._mapper.map("color")(d); // TODO: think on more elegant syntax like in next lines
                }.bind(this))
                .attr("r", this._mapper.map("size"))
                .attr("cx", this._mapper.map("x"))
                .attr("cy", this._mapper.map("y"))
                .on('click', function (d) {
                    this._plugins.click(new ClickContext(d), new ChartElementTools(container.selectAll('circle')));
                }.bind(this))
                .on('mouseover', function (d) {
                    this._plugins.mouseover(new HoverContext(d), new ChartElementTools(container.selectAll('circle')));
                }.bind(this))
                .on('mouseout', function (d) {
                    this._plugins.mouseout(new HoverContext(d), new ChartElementTools(container.selectAll('circle')));
                }.bind(this));
        },

        render: function (selector) {
            var container = tau.svg.paddedBox(d3.select(selector), {top: 20, right: 20, bottom: 30, left: 40});

            this._dataSource.get(/** @this ScatterPlotChart */ function (data) {
                var layout = new tau.svg.Layout(container);

                layout.row(-30);
                var yAxisContainer = layout.col(20);
                var dataContainer = layout.col();

                layout.row();
                layout.col(20);
                var xAxisContainer = layout.col();

                this._renderData(dataContainer, data);

                new YAxis(this._mapper.binder("y")).render(yAxisContainer);
                new XAxis(this._mapper.binder("x")).render(xAxisContainer);

                tau.svg.bringOnTop(dataContainer);

                this._plugins.render(new RenderContext(), new ChartTools(container, this._mapper));
            }.bind(this));
        }
    });


    /**@class */
    /**@extends Chart */
    var LineChart = Chart.extend({
        /** @constructs
         * @param {DataSource} dataSource */
        init: function (dataSource) {
            this._super.call(this, dataSource);
        },

        _renderData: function (container, data) {
            this._mapper.binder('x').range([0, container.layout('width')]);
            this._mapper.binder('y').range([container.layout('height'), 0]);

        var line = d3.svg.line()
          .x(this._mapper.map("x"))
          .y(this._mapper.map("y"));

           container
                .append("path")
                .attr("class", "line")
                .attr("d", line.call(this, data));
        },

        render: function (selector) {
            var container = tau.svg.paddedBox(d3.select(selector), {top: 20, right: 20, bottom: 30, left: 40});

            this._dataSource.get(/** @this ScatterPlotChart */ function (data) {
                var layout = new tau.svg.Layout(container);

                layout.row(-30);
                var yAxisContainer = layout.col(20);
                var dataContainer = layout.col();

                layout.row();
                layout.col(20);
                var xAxisContainer = layout.col();

                this._renderData(dataContainer, data);

                new YAxis(this._mapper.binder("y")).render(yAxisContainer);
                new XAxis(this._mapper.binder("x")).render(xAxisContainer);

                tau.svg.bringOnTop(dataContainer);

                this._plugins.render(new RenderContext(), new ChartTools(container, this._mapper));
            }.bind(this));
        }
    });

    /** @class ChartTools */
    var ChartTools = Class.extend({
        /**
         * @constructs
         * @param d3container
         * @param width
         * @param height
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
        },
        Line: function (data) {
            return new LineChart(data);
        }
    };
})();
