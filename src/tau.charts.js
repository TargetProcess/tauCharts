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
         * @param {Graphics} graphics
         * @param {MapperBuilder} mapperBuilder
         */
        init: function (dataSource, graphics, mapperBuilder) {
            this._dataSource = dataSource;
            this._graphics = graphics;
            this._mapperBuilder = mapperBuilder;
            this._plugins = new Plugins([]);
        },

        map: function (config) {
            /** @type Mapper */
            this._mapper = this._mapperBuilder.build(config);
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

        render: function (container) {
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

            layout.row(-20);
            this.yAxis = { svg: layout.col(20), html: container.select('.html-chart')};
            this.data = {svg: layout.col(), html: container.select('.html-chart')};

            layout.row();
            layout.col(20);
            this.xAxis = { svg: layout.col(), html: container.select('.html-chart')};

            this.width = this.data.svg.layout('width');
            this.height = this.data.svg.layout('height');
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

    /** @class Graphics */
    /** @extends Class */
    var Graphics = Class.extend({
        meta: null,

        render: function(container, data, mapper) { // TODO: pass already mapped data?
            throw new Error('not implemented');
        },

        elements: function(container) {
            return container.selectAll('.i-role-datum');
        }
    });

    /** @class */
    /** @extends Chart */
    var BasicChart = Chart.extend({
        map: function (config){
            this._super(config);
            
            this._yAxis = new YAxis(this._mapper.binder('y'));
            this._xAxis = new XAxis(this._mapper.binder('x'));

            return this;
        },

        render: function (selector) {
            var chartLayout = new ChartLayout(selector);

            this._mapper.binder('x').range([0, chartLayout.width]);
            this._mapper.binder('y').range([chartLayout.height, 0]);

            this._dataSource.get(/** @this BasicChart */ function (data) {
                this._mapper.domain(data);

                var renderData = function (data) {
                    this._graphics.render(chartLayout.data.svg, data, this._mapper);
                    this._graphics.elements(chartLayout.data.svg).call(propagateDatumEvents(this._plugins));
                }.bind(this);

                renderData(data);
                this._dataSource.update(renderData);

                this._yAxis.render(chartLayout.yAxis);
                this._xAxis.render(chartLayout.xAxis);
                new Grid(this._mapper.binder('x'), this._mapper.binder('y')).render(chartLayout.data.svg);

                tau.svg.bringOnTop(chartLayout.data.svg);

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

    /**
     * @class
     */
    var CompositeChartLayout = Class.extend({
        _padding: 5,

        init: function (selector, numberOfCharts) {
            var chartLayout = new ChartLayout(selector);

            this._dataLayout = new tau.svg.Layout(chartLayout.data.svg);
            this._yAxisLayout = new tau.svg.Layout(chartLayout.yAxis.svg);

            this._chartHeightWithPadding = chartLayout.height / numberOfCharts;
            this._chartHeight = this._chartHeightWithPadding - this._padding;

            this._html = chartLayout.data.html;
            this._top = 0;

            this.xAxis = chartLayout.xAxis;
            this.data = chartLayout.data;

            this.svg= chartLayout.svg;
            this.html= chartLayout.html;

            this.width = chartLayout.width;
        },

        nextHeight: function(){
            return this._chartHeight;
        },

        nextYAxis: function () {
            this._yAxisLayout.row(this._padding);
            this._yAxisLayout.row(this._chartHeight);
            return this._yAxisLayout.col();
        },

        nextData: function() {
            this._dataLayout.row(this._padding);
            this._dataLayout.row(this._chartHeight);
            return this._dataLayout.col();
        },

        nextHtml: function() {
            this._top += this._chartHeightWithPadding;

            return this._html
                .append('div')
                .style({
                    'position': 'absolute',
                    'top': (this._top - this._chartHeightWithPadding) + 'px',
                    'height': this._chartHeight + 'px'
                });
        }
    });

    var CompositeChart = Chart.extend({
        init: function (data) {
            this._super(data);

            this._graphics = [];
            this._mappers = [];
        },

        render: function (selector) {
            var chartLayout = new CompositeChartLayout(selector, this._graphics.length);

            this._dataSource.get(/** @this BasicChart */ function (data) {
                for (var i = 0; i < this._graphics.length; i++) {
                    var mapper = this._mappers[i];

                    mapper.binder('y').range([chartLayout.nextHeight(), 0]);
                    mapper.binder('x').range([0, chartLayout.width]);
                    mapper.domain(data);

                    var yAxis = new YAxis(mapper.binder('y'));

                    var chartHtml = chartLayout.nextHtml();
                    var dataSvg = chartLayout.nextData();
                    var yAxisSvg = chartLayout.nextYAxis();

                    yAxis.render({svg: yAxisSvg, html: chartHtml});

                    var renderData = function (graphics, container, mapper, data) {
                        graphics.render(container, data, mapper);
                        graphics.elements(container).call(propagateDatumEvents(this._plugins));
                    }.bind(this, this._graphics[i], dataSvg, mapper);

                    renderData(data);
                    this._dataSource.update(renderData);

                    new Grid(mapper.binder('x'), mapper.binder('y')).render(dataSvg);
                }

                tau.svg.bringOnTop(chartLayout.data.svg);

                new XAxis(this._mappers[0].binder('x')).render(chartLayout.xAxis); // TODO: no guarantee that x is the same for all

                this._plugins.render(new RenderContext(this._dataSource), new ChartTools(chartLayout, this._mappers[0]));
            }.bind(this));
        }
    });

    tau.charts = {
        /**
         * @param data
         * @returns {CompositeChart}
         */
        Composite: CompositeChart,

        Graphics: Graphics,

        /**
        * Register new chart
         * @param {String} name
         * @param {Graphics} graphics
        */
        addGraphics: function(name, graphics, meta) {
            // TODO: restrict by 2d only
            CompositeChart.prototype[name] = function(mapping){
                this._graphics.push(graphics);
                this._mappers.push(new tau.data.MapperBuilder(meta).build(mapping));
                return this;
            };

            tau.charts[name] = function(data){
                return new BasicChart(data, graphics, new tau.data.MapperBuilder(meta)); // TODO: single stateless instance?
            };
        }
    };
    
})();
