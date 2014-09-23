(function (tau, Class) {
    /** @class
     * @extends Plugin */
    var Plugins = Class.extend({
        /** @constructs */
        init: function (plugins) {
            this._plugins = plugins;
        },

        _call: function (name, args) {
            for (var i = 0; i < this._plugins.length; i++) {
                if (typeof(this._plugins[i][name]) == 'function') {
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
        },

        mousemove: function (context, tools) {
            this._call('mousemove', arguments);
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
            this._mapper = new tau.data.MapperBuilder().config(config).build(this._meta);
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
                .orient('bottom');

            if (this._mapper.format()) {
                xAxis.tickFormat(this._mapper.format());
            }

            container.svg
                .append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, ' + Axes.padding + ')')
                .call(xAxis)
                .append('text')
                .attr('class', 'label')
                .attr('x', container.svg.layout('width'))
                .attr('y', -xAxis.tickSize())
                .style('text-anchor', 'end')
                .text(this._mapper.caption());

            container.html
                .append('div')
                .attr('class', 'x axis')
                .html(this._mapper.caption());
        }
    });

    /** @class
     * @extends Axis */
    var YAxis = Axis.extend({
        render: function (container) {
            var yAxis = d3.svg.axis()
                // TODO: internal _scale property of binder is exposed
                .scale(this._mapper._scale)
                .orient('left');

            if (this._mapper.format()) {
                yAxis.tickFormat(this._mapper.format());
            }

            container.svg
                .append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(-' + Axes.padding + ', 0)')
                .call(yAxis)
                .append('text')
                .attr('class', 'label')
                .attr('transform', 'rotate(-90)')
                .attr('x', yAxis.tickSize())
                .attr('y', yAxis.tickSize() + container.svg.layout('width'))
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text(this._mapper.caption());

            container.svg
                .selectAll('.tick line')
                .attr('x1', container.svg.layout('width') - 6)
                .attr('x2', container.svg.layout('width'));

            container.svg
                .selectAll('.tick text')
                .attr('dx', container.svg.layout('width'));

            container.svg
                .select('.domain')
                .attr('transform', 'translate(' + container.svg.layout('width') + ', 0)');

            container.html
                .append('div')
                .attr('class', 'y axis')
                .html(this._mapper.caption());
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

            var grid = container.insert('g', ':first-child').attr('class', 'grid');

            grid.append('g').call(xAxis);
            grid.append('g').call(yAxis);

            // TODO: make own axes and grid instead of using d3's in such tricky way
            grid.selectAll('text').remove();
        }
    });

    var CHART_PADDINGS = {top: 20, right: 20, bottom: 30, left: 40};

    var CHART_HTML =
        '<div class="html html-left"></div>' +
        '<div class="html html-chart"></div>' + 
        '<svg></svg>' +
        '<div class="html html-right"></div>' +
        '<div class="html html-above"></div>' +
        '<div class="html html-below"></div>';

    /** @class */
    var ChartLayout = Class.extend({
        /** @constructs */
        init: function(selector){
            var container = d3.select(selector)
                .classed('tau-chart', true)
                .html(CHART_HTML);

            this.html = {
                left: container.select('.html-left'),
                right: container.select('.html-right'),
                above: container.select('.html-above'),
                below: container.select('.html-below')
            };

            this.svg = tau.svg.paddedBox(container.select('svg'), CHART_PADDINGS);

            var layout = new tau.svg.Layout(this.svg);

            layout.row(-30);
            this.yAxis = { svg: layout.col(20), html: container.select('.html-chart')};
            this.data = layout.col();

            layout.row();
            layout.col(20);
            this.xAxis = { svg: layout.col(), html: container.select('.html-chart')};

            this.width = this.data.layout('width');
            this.height = this.data.layout('height');
        }
    });

    var propagateDatumEvents = function (plugins) {
        return function () {
            this
                .on('click', function (d) {
                    plugins.click(new ElementContext(d), new ChartElementTools(d3.select(this)));
                })
                .on('mouseover', function (d) {
                    plugins.mouseover(new ElementContext(d), new ChartElementTools(d3.select(this)));
                })
                .on('mouseout', function (d) {
                    plugins.mouseout(new ElementContext(d), new ChartElementTools(d3.select(this)));
                })
                .on('mousemove', function (d) {
                    plugins.mousemove(new ElementContext(d), new ChartElementTools(d3.select(this)));
                });
        };
    };

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

        _onScalesDomainsLayoutsConfigured: function(config) {
        },

        render: function (selector) {
            var chartLayout = new ChartLayout(selector);

            var scaleX = this._mapper.binder('x');
            scaleX.range([0, chartLayout.width]);
            var scaleY = this._mapper.binder('y');
            scaleY.range([chartLayout.height, 0]);

            this._dataSource.get(/** @this BasicChart */ function (data) {

                this._mapper.domain(data);

                this._onScalesDomainsLayoutsConfigured({ x: scaleX, y : scaleY, layout: chartLayout.data, data: data });

                var renderData = function(data){
                    this._renderData(chartLayout.data, data);
                    chartLayout.data.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
                }.bind(this);

                renderData(data);
                this._dataSource.update(renderData);

                new YAxis(this._mapper.binder('y')).render(chartLayout.yAxis);
                new XAxis(this._mapper.binder('x')).render(chartLayout.xAxis);
                new Grid(this._mapper.binder('x'), this._mapper.binder('y')).render(chartLayout.data);

                tau.svg.bringOnTop(chartLayout.data);

                this._plugins.render(new RenderContext(this._dataSource), new ChartTools(chartLayout, this._mapper));
            }.bind(this));
        }
    });

    
    /** @class ChartTools */
    var ChartTools = Class.extend({
        /**
         * @constructs
         * @param {ChartLayout} layout
         * @param {Mapper} mapper
         */
        init: function (layout, mapper) {
            this.svg = layout.svg;
            this.html = layout.html;
            this.mapper = mapper;
        },

        elements: function(){
            return this.svg.selectAll('.i-role-datum');
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
        init: function (dataSource) {
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

    tau.charts = {
        /**
         * @param data
         * @returns {BasicChart}
         */
        Base: BasicChart,

        /**
        * Register new chart
        */
        add: function(name, fn) {
            tau.charts[name] = fn;    
        }
    };

})(tau, Class);
