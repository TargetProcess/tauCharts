/*! tauCharts - v0.0.1 - 2014-03-27
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2014 Taucraft Limited; Licensed MIT */
(function () {
    /**
     * @typedef {Object} Class
     * @property {function} init
     * @property {function} _super
     */

    var Class = function () {
    };

    Class.new = function (constructor, args) {
        function create() {
            return constructor.apply(this, args);
        }

        create.prototype = constructor.prototype;

        return new create();
    };

    Class.extend = function (prop) {
        var _super = this.prototype;
        var initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" ?
                (function (name, fn) {
                    /** @this {Class} */
                    return function () {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        /** @this {Class} */
        function Class() {
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };

    window.Class = Class;
    window.tau = {};
})();
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
                .orient('bottom');

            container
                .append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0, ' + Axes.padding + ')')
                .call(xAxis)
                .append('text')
                .attr('class', 'label')
                .attr('x', container.layout('width'))
                .attr('y', -xAxis.tickSize())
                .style('text-anchor', 'end')
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
                .orient('left');

            container
                .append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(-' + Axes.padding + ', 0)')
                .call(yAxis)
                .append('text')
                .attr('class', 'label')
                .attr('transform', 'rotate(-90)')
                .attr('x', yAxis.tickSize())
                .attr('y', yAxis.tickSize() + container.layout('width'))
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text(this._mapper.caption());

            container
                .selectAll('.tick line')
                .attr('x1', container.layout('width') - 6)
                .attr('x2', container.layout('width'));

            container
                .selectAll('.tick text')
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
            this.yAxis = layout.col(20);
            this.data = layout.col();

            layout.row();
            layout.col(20);
            this.xAxis = layout.col();

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

        render: function (selector) {
            var chartLayout = new ChartLayout(selector);

            this._mapper.binder('x').range([0, chartLayout.width]);
            this._mapper.binder('y').range([chartLayout.height, 0]);

            this._dataSource.get(/** @this BasicChart */ function (data) {
                // TODO: use metadata to get domain when implemented
                this._mapper.binder('x').domain([0, d3.max(data, this._mapper.raw('x'))]);
                this._mapper.binder('y').domain([0, d3.max(data, this._mapper.raw('y'))]);

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
    
})();

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

        domain: function (key) {
            return this.binder(key).domain();
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
            this._names.push(name);
        },

        raw: function (d) {
            return d[this._names
                .filter(function (name) {
                    return d.hasOwnProperty(name);
                })[0]];
        },

        map: function (d) {
            return this._scale(this.raw(d));
        },

        linear: function () {
            //noinspection JSValidateTypes,JSUnresolvedFunction
            this._scale = d3.scale.linear();
            return this;
        },

        domain: function () {
            // TODO: messy, clean up
            if (!arguments.length) {
                return this._scale.domain().map(toObject.bind(null, this._names[0]));
            }
            return this._scale.domain.apply(this._scale.domain, arguments);
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

    /**
     * @class
     */
    var ConstantMapper = Class.extend({
        /** @constructs */
        init: function (value) {
            this._value = value;
        },

        raw: function (d) {
            return this._value;
        },

        map: function (d) {
            return this._value;
        },

        domain: function () {
        },

        range: function () {
            throw new Error('range is not implemented for constants');
        },

        caption: function (value) {
            throw new Error('caption is not implemented for constants');
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

                return result;
            }

            return new Mapper(processConfig());
        },

        /**
         * @param {String} name
         * @returns {PropertyMapper}
         */
        map: function (name) {
            return new PropertyMapper(name);
        },

        /**
         * @param value
         * @returns {ConstantMapper}
         */
        constant: function (value) {
            return new ConstantMapper(value);
        },

        identity: function (x) {
            return x;
        }
    };
})();
(function () {
    /** @class Plugin */
    var Plugin = Class.extend({
        
        init: function() {            
        },

        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        click: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
        }
    });

    tau.plugins = {
        add: function(name, plugin){
            plugin = Plugin.extend(plugin);

            tau.plugins[name] = function(){
                return Class.new(plugin, arguments);
            };
        }
    };
})();

(function () {
    function absolute(value, base) {
        return value > 0 ? value : base + value;
    }

    /** @class */
    var Layout = Class.extend({
        /** @constructs */
        init: function (svg, box) {
            this._svg = svg;

            if (box){
                this._width = box.width;
                this._height = box.height;
            } else {
                this._width = svg.layout('width');
                this._height = svg.layout('height');
            }

            this._x = 0;
            this._y = 0;

            this._translateX = 0;
            this._translateY = 0;
        },

        _translate: function(d3_selection){
            if (this._translateX || this._translateY){
                d3_selection.attr('transform', 'translate(' + (this._translateX || 0) + ',' + (this._translateY || 0) + ')');
            }
        },

        _extend: function(d3_selection){
            var layout = {
                width: absolute(this._x - this._translateX, this._width),
                height: absolute(this._y - this._translateY, this._height)
            };

            d3_selection.layout = function(key){
                return layout[key];
            };
        },

        /**
         * @param [height]
         */
        row: function(height){
            this._translateX = 0;
            this._translateY = this._y;
            this._y = height ? this._y + absolute(height - this._y, this._height) : null; // TODO: handle several rows without specification
        },

        /**
         * @param [width]
         * @returns d3_selection
         */
        col: function(width){
            this._translateX = this._x;
            this._x = width ? this._x + absolute(width - this._x, this._width) : null; // TODO: handle several cols without specification
            return this._svg
                .append('g')
                .call(this._translate.bind(this))
                .call(this._extend.bind(this));
        }
    });

    var bringOnTop = function(d3_element){
        d3_element.node().parentNode.appendChild(d3_element.node());
    };

    var getSVGLengthValue = function(element, property){
        var value = element[property].baseVal;

        switch(value.unitType){
            case 1: // SVG_LENGTHTYPE_NUMBER
                return value.value;
            case 2: // SVG_LENGTHTYPE_PERCENTAGE
                return (element.parentNode[property] || element.parentNode.getBoundingClientRect()[property]) * value.valueInSpecifiedUnits / 100;
            default:
                throw new Error('unitType ' + value.unitType + ' is not supported');
        }
    };

    var getBBox = function(svgElement) {
        return {
            width: getSVGLengthValue(svgElement, 'width'),
            height: getSVGLengthValue(svgElement, 'height')
        };
    };

    var paddedBox = function(d3_element, padding){
        var layout = new tau.svg.Layout(d3_element, getBBox(d3_element.node()));
        layout.row(padding.top);
        layout.row(-padding.bottom);
        layout.col(padding.left);

        return layout.col(-padding.right);
    };

    tau.svg = {
        getBBox: getBBox,
        bringOnTop: bringOnTop,
        paddedBox: paddedBox,
        Layout: Layout
    };
})();
(function() {
    /**@class */
    /**@extends BasicChart */
    var LineChart = tau.charts.Base.extend({
        map: function (config) {
            this._super(config);
            this._mapper.alias('color', 'key');

            return this;
        },
        _renderData: function (container, data) {
            var mapper = this._mapper;

            // prepare data to build several lines
            // TODO: provide several data transformers to support more formats
            // sometime we will have data already nested, for example.
            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(data);

            var updateLines = function () {
                this.attr('class', mapper.map('line %color%'));

                var paths = this.selectAll('path').data(function (d) {
                    return [d.values];
                });

                // TODO: extract update pattern to some place
                paths.call(updatePaths);
                paths.enter().append('path').call(updatePaths);
                paths.exit().remove();

                var dots = this.selectAll('.dot').data(function (d) {
                    return d.values;
                });

                dots.call(updateDots);
                dots.enter().append('circle').attr('class', 'dot i-role-datum').call(updateDots);
                dots.exit().remove();
            };

            //TODO: allow to set interpolation outside
            var line = d3.svg.line()
                .interpolate('cardinal')
                .x(mapper.map('x'))
                .y(mapper.map('y'));

            var updatePaths = function () {
                this.attr('d', line);
            };

            var updateDots = function () {
                // draw circles (to enable mouse interactions)
                return this
                    .attr('cx', mapper.map('x'))
                    .attr('cy', mapper.map('y'))
                    .attr('r', function () {
                        return 3;
                    });
            };

            var lines = container.selectAll('.line').data(categories);
            lines.call(updateLines);
            lines.enter().append('g').call(updateLines);
            lines.exit().remove();
        }
    });

    tau.charts.add('Line', function (data) {
        return new LineChart(data);
    });
    
})();
(function() {

    /**@class */
    /**@extends BasicChart */
    var ScatterPlotChart = tau.charts.Base.extend({

        _renderData: function (container, data) {
            this._mapper.binder('size').domain(d3.extent(data, this._mapper.raw('size'))); // TODO: should be done automatically using chart metadata

            var mapper = this._mapper;

            var update = function () {
                return this
                    .attr('class', mapper.map('dot i-role-datum %color%'))
                    .attr('r', mapper.map('size'))
                    .attr('cx', mapper.map('x'))
                    .attr('cy', mapper.map('y'));
            };

            var elements = container.selectAll('.dot').data(data);

            elements.call(update);
            elements.enter().append('circle').call(update);
            elements.exit().remove();
        }
    });

    tau.charts.add('Scatterplot', function (data) {
        return new ScatterPlotChart(data);
    });

})();
(function () {
    /** @class DataTable
     * @extends Plugin */
    var DataTable = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
            // TODO: think about css for plugins
            var container = tools.html.right
                .append('div')
                .attr('class', 'datatable');

            container
                .append('a')
                .attr('href', '#')
                .html("Show data table")
                .on('click', function (d) {
                    drawTableFn();
                    toggleTable(container);
                    d3.event.preventDefault();
                });

            var tableContainer = container.append('div');

            var drawTableFn = function () {

                var table = tableContainer.append('table'),
                    thead = table.append('thead'),
                    tbody = table.append('tbody');

                // TODO: fix when metadata and data types introduced
                var columns = Object.keys(context.data._data[0]);

                table
                    .attr('class', function(){return 'col-' + columns.length});

                // create the table header
                thead.selectAll('th')
                    .data(columns)
                    .enter()
                    .append('th')
                    .text(tau.data.identity);

                var tr = tbody.selectAll('tr')
                    .data(context.data._data)
                    .enter()
                    .append('tr');

                tr.selectAll('td')
                    .data(function (d) {
                        return d3.values(d)
                    })
                    .enter()
                    .append('td')
                    .text(function (d) {
                        return d
                    });

                drawTableFn = function () {
                };  // We invoke this function only once.
            };

            var toggleTable = function (el) {
                (el.attr('class') == 'datatable') ? el.attr('class', 'datatable show') : el.attr('class', 'datatable');
            };
        }
    };

    tau.plugins.add('datatable', DataTable);
})();
(function () {
    /** @class Tooltip
     * @extends Plugin */
    var Highlighter = {
        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            tools.element.classed('highlighted', true);
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            tools.element.classed('highlighted', false)
        }
    };

    tau.plugins.add('highlighter', Highlighter);
})();
(function () {
    function not(x) {
        return function (d) {
            return x != d;
        }
    }

    /** @class Legend
     * @extends Plugin */
    var Legend = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
            var width = tools.svg.layout('width');

            // TODO: bad that we have mapper in tools interface
            var domain = tools.mapper.domain('color');
            var disabled = [];

            var container = tools.html
                .right
                .append('ul')
                .attr('class', 'legend');

            var legend = container
                .selectAll('li')
                .data(domain)
                .enter()
                .append('li');

            legend
                .attr('class', tools.mapper.map("color"))
                .on('click', function (d) {
                    // TODO: quick and dirty filtering, will be removed when data types and legend controls for them are introduced
                    var value = tools.mapper.raw("color")(d);

                    if (disabled.indexOf(value) == -1) {
                        disabled.push(value);
                        d3.select(this).classed('disabled', true);
                    } else {
                        disabled = disabled.filter(not(value));
                        d3.select(this).classed('disabled', false);
                    }

                    context.data.filter(function (d) {
                        return disabled.indexOf(tools.mapper.raw("color")(d)) == -1;
                    });
                })
                .on('mouseover', function (d) {
                    var value = tools.mapper.raw("color")(d);

                    tools.elements().classed('highlighted',
                        function (d) {
                            return tools.mapper.raw('color')(d) === value;
                        })
                })
                .on('mouseout', function () {
                    tools.elements().classed('highlighted', false);
                });

            legend
                .text(tools.mapper.raw('color'));
        }
    };

    tau.plugins.add('legend', Legend);
})();
(function () {
    /** @class Projection
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.projection('x', 'y'))
     */
    var Projection = {

        init: function () {
            if (arguments.length === 0) {
                this._axises = ["x", "y"];
            } else {
                this._axises = Array.prototype.slice.call(arguments, 0);
            }
        },

        render: function (context, tools) {
            var marginLeft = 20;
            var marginBottom = 30;
            var padding = 10;

            //TODO: remove magic numbers
            var width = tools.svg.layout("width");
            var height = tools.svg.layout("height");
            var mapper = tools.mapper;

            var axises = this._axises;

            this.mouseover = function (context) {

                var projections = tools.svg.selectAll(".projections")
                    .data([context.datum])
                    .enter().append("g")
                    .attr("transform", "translate(" + marginLeft + ", 0)")
                    .attr("class", mapper.map("color"))
                    .classed("projections", true);

                if (axises.indexOf("x") > -1) {

                    projections
                        .append("g")
                        .attr("class", "y")
                        .append("line")
                        .attr("x1", mapper.map("x"))
                        .attr("y1", height - marginBottom + padding)
                        .attr("x2", mapper.map("x"))
                        .attr("y2", mapper.map("y"));

                    projections.select(".y")
                        .append("text")
                        .attr("transform", "translate(0, 18)")
                        //TODO: think how to replace constants with some provided values
                        .attr("dx", mapper.map("x"))
                        .attr("dy", height - marginBottom + 10)
                        .text(mapper.raw("x"));
                }

                if (axises.indexOf("y") > -1) {

                    projections.append("g")
                        .attr("class", "x")
                        .append("line")
                        .attr("x1", 0)
                        .attr("y1", mapper.map("y"))
                        .attr("x2", mapper.map("x"))
                        .attr("y2", mapper.map("y"));

                    projections.select(".x")
                        .append("text")
                        .attr("transform", "translate(-19, 4)")
                        //TODO: think how to replace constants with some provided values
                        .attr("dx", 0)
                        .attr("dy", mapper.map("y"))
                        .text(mapper.raw("y"));
                }
            };

            this.mouseout = function () {
                tools.svg.selectAll(".projections").remove();
            }
        }
    };

    tau.plugins.add('projection', Projection);
})();

(function () {
    /** @class Tooltip
     * @extends Plugin */
     /* Usage
     .plugins(tau.plugins.tooltip('effort', 'priority'))
    accepts a list of data fields names as properties
    */
    var Tooltip = {

        init: function () {      
            this._dataFields = arguments;
            this._container = d3.select('body').append('div');    
        },
        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            //TODO: this tooltip jumps a bit, need to be fixed

            var text = '';
            for (var i = this._dataFields.length - 1; i >= 0; i--) {
                var field = this._dataFields[i];
                text += '<p class="tooltip-' + field + '"><em>' + field + ':</em> ' + context.datum[field] + '</p>'
            };

            this._container.classed('tooltip', true)
            .style('top', (d3.mouse(this._container[0].parentNode)[1]-10) + 'px')
            .style('left',(d3.mouse(this._container[0].parentNode)[0]+10) + 'px')
            .style('display', 'block')
            .html(text);
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            this._container.style("display", "none");
        }
    };

    tau.plugins.add('tooltip', Tooltip);
})();