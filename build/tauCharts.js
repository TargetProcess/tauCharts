/*! tauCharts - v0.0.1 - 2014-09-29
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2014 Taucraft Limited; Licensed MIT */
// jshint ignore: start
(function(definition){
    if (typeof define === "function" && define.amd) {
        define(definition);
    } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
    } else {
        this.tauChart = definition();
    }
})
(function () {
    'use strict';

var tau = {};

/**
 * @typedef {Object} Class
 * @property {function} init
 * @property {function} _super
 */
var Class = function () {
};
(function (tau, Class) {
    Class.new = function (constructor, args) {
        function Create() {
            return constructor.apply(this, args);
        }

        Create.prototype = constructor.prototype;

        return new Create();
    };

    Class.extend = function extend (prop) {
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
        Class.extend = extend;
        return Class;
    };
})(tau, Class);
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

(function (tau, Class) {
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

        _getDomain: function (key) {
            return this.binder(key).domain();
        },

        _setDomain: function (data) {
            for (var key in this._propertyMappers) {
                this._propertyMappers[key]._setDomain(data); // TODO: messy
            }
        },

        domain: function (args) {
            if (typeof(args) === 'string') {
                return this._getDomain(args);
            } else {
                this._setDomain(args);
            }
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
            // TODO: find way to get rid of it
            this._names.push(name);
        },

        _getOwnProperty: function (d) {
            return this._names
                .filter(function (name) {
                    return d.hasOwnProperty(name);
                })[0];
        },

        raw: function (d) {
            return d[this._getOwnProperty(d)];
        },

        map: function (d) {
            var key = this._getOwnProperty(d);
            return this._scale(key ? d[key] : this._default);
        },

        domain: function () {
            // TODO: do we still need toObject here?
            return this._scale.domain().map(toObject.bind(null, this._names[0]));
        },

        range: function () {
            this._scale.range.apply(this._scale, arguments);
        },

        caption: function () {
            return this._caption;
        },

        format: function() {
            return this._format;
        }

    });

    /**
     * @class
     */
    var PropertyMapperBuilder = Class.extend({
        /**
         * @constructs
         * @param name
         */
        init: function (name, dataType) {
            this._name = name;
            this._dataType = dataType; // we can override data type that is set in _meta by default
            this._scale = null;
        },

        linear: function () {
            //noinspection JSValidateTypes,JSUnresolvedFunction
            this._scale = d3.scale.linear();
            return this;
        },

        range: function() {
            this._scale.range.apply(this._scale.range, arguments);
            return this;
        },

        time: function () {
            this._scale = d3.time.scale();
            return this;
        },

        format: function(format) {
            this._format = format || null;
            return this;
        },

        color10: function () {
            this._scale = tau.data.scale.color10();
            return this;
        },

        caption: function (value) {
            // TODO: maybe better to put it to meta?
            this._caption = value;
            return this;
        },


        domain: function () {
            this._scale.domain.apply(this._scale.domain, arguments);
            return this;
        },

        /**
         * @param {{type: Type, default: Bool, default: Object}} meta
         * @returns {PropertyMapper}
         */
        build: function (meta) {
            var propertyMapper = new PropertyMapper(this._name);
            propertyMapper._scale = this._scale || meta.type.defaultScale();

            //TODO: maybe put meta into init?
            this._dataType = this._dataType || meta.type;
            propertyMapper._setDomain = this._dataType.setDomain.bind(propertyMapper);
            propertyMapper._default = meta.default;
            propertyMapper._caption = this._caption || this._name;
            propertyMapper._format = this._format;
            return propertyMapper;
        }
    });

    /**
     * @class
     */
    var MapperBuilder = Class.extend({
        /**
         * @construct
         */
        init: function () {
        },

        config: function (config) {
            this._config = config;

            return this;
        },

        build: function (meta) {
            var propertyMappers = {};

            for (var key in meta) {
                var propertyMapperBuilder = this._config[key];

                if (typeof(propertyMapperBuilder) === 'undefined') {
                    propertyMapperBuilder = key;
                }

                if (typeof(propertyMapperBuilder) === 'string') {
                    propertyMapperBuilder = new PropertyMapperBuilder(propertyMapperBuilder);
                }

                propertyMappers[key] = propertyMapperBuilder.build(meta[key]);
            }

            return new Mapper(propertyMappers);
        }
    });

    /**
     * @class
     */
    var Scales = Class.extend({
        color10: function() {
            return d3.scale.ordinal().range(['color10-1', 'color10-2', 'color10-3', 'color10-4', 'color10-5', 'color10-6', 'color10-7', 'color10-8', 'color10-9', 'color10-10']);
        }
    });

    tau.data = {
        Array: function (d) {
            return new ArrayDataSource(d);
        },

        /**
         * @type {MapperBuilder}
         */
        MapperBuilder: MapperBuilder,

        /**
         * @param {String} name
         * @returns {PropertyMapperBuilder}
         */
        map: function (name, dataType) {
            return new PropertyMapperBuilder(name, dataType);
        },

        /**
         * @type Scales
         */
        scale: new Scales(),

        identity: function (x) {
            return x;
        }
    };
})(tau, Class);

(function (tau, Class) {
    var notImplemented = function () {
        throw new Error('Not implemented');
    };

    /**
     * @class
     * @extends Class
     */
    var Type = Class.extend({
        /**
         * @abstract
         */
        defaultScale: notImplemented,

        /**
         * @abstract
         */
        setDomain: notImplemented
    });

    /**
     * @class
     * @extends Type
     */
    var Quantitative = Type.extend({
        defaultScale: function () {
            return d3.scale.linear();
        },

        /**
         * @this PropertyMapper
         * @param data
         */
        setDomain: function (data) {
            // TODO: messy
            var hasValue = data.length && this._getOwnProperty(data[0]);
            if (!hasValue) {
                this._scale = this._scale.domain([0, this._default]);
                return;
            }
            //
            
            this._scale = this._scale.domain([0, d3.max(data, this.raw.bind(this))]);
        }
    });

    /**
     * @class
     * @extends Type
     */
    var Time = Type.extend({
        defaultScale: function () {
            return d3.scale.time();
        },

        /**
         * @this PropertyMapper
         * @param data
         */
        setDomain: function (data) {
            // TODO: messy. Maybe we need a different check for Time type?
            var hasValue = data.length && this._getOwnProperty(data[0]);
            if (!hasValue) {
                this._scale = this._scale.domain([0, this._default]);
                return;
            }
            //

            // find min and max dates in time series.
            this._scale = this._scale.domain([d3.min(data, function(d) {return d[hasValue];}), d3.max(data, function(d) {return d[hasValue];})]);
        }
    });

    /**
     * @class
     * @extends Type
     */
    var Categorical = Type.extend({
        defaultScale: function () {
            return tau.data.scale.color10();
        },

        setDomain: function () {
        }
    });

    tau.data.types = {
        quantitative: new Quantitative(),
        categorical: new Categorical(),
        time: new Time()
    };
})(tau, Class);
(function (tau, Class) {
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
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mousemove: function (context, tools) {
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
})(tau, Class);

(function (tau, Class) {
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
})(tau, Class);
(function (tau) {
    /**@class */
    /**@extends BasicChart */
    var BarChart = tau.charts.Base.extend({
        _meta: {
            x: {type: tau.data.types.quantitative},
            y: {type: tau.data.types.quantitative},
            color: {type: tau.data.types.categorical, default: 1}
        },

        map: function (config) {

            this._super(config);
            this._mapper.alias('color', 'key');

            return this;
        },

        _onScalesDomainsLayoutsConfigured: function (config) {
            var mapper = this._mapper;
            var maxValue = 0;

            d3.nest()
                .key(mapper.raw('x'))
                .rollup(function (leaves) {
                    var sum = d3.sum(leaves, mapper.raw('y'));
                    if (sum > maxValue) {
                        maxValue = sum;
                    }
                }).entries(config.data);

            //REMAP MAX VALUE OF DOMAIN
            config.y._scale.domain([0, maxValue]);
        },

        _renderData: function (container, data) {

            var mapper = this._mapper;

            var xValues = d3.nest()
                .key(mapper.raw('x'))
                .entries(data);

            var barWidth = 10;

            var looksGoodBarWidth = Math.round(container.layout('width') / (xValues.length || 1));

            if (looksGoodBarWidth < 1) {
                looksGoodBarWidth = 1;
            }

            if (barWidth > looksGoodBarWidth) {
                barWidth = looksGoodBarWidth;
            }

            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(data);

            var stackData = categories.map(function (category) {
                return category.values.map(function (d) {
                    return {x: mapper.raw('x')(d), y: mapper.raw('y')(d), color: category.key};
                });
            });

            var arrays = d3.layout.stack()(stackData);

            var stack = d3.merge(arrays);

            var getScale = function (name) {
                return mapper.binder(name)._scale;
            };

            var update = function () {

                return this.attr('class', function (d) {
                    return 'bar i-role-datum ' + getScale('color')(d.color);
                })
                    .attr("x", function (d) {
                        return getScale('x')(d.x) - barWidth / 2;
                    })
                    .attr("y", function (d) {
                        var scale = getScale('y');
                        return scale(d.y + d.y0);
                    })
                    .attr("width", barWidth)
                    .attr("height", function (d) {
                        var scale = getScale('y');
                        return container.layout('height') - scale(d.y);
                    });
            };

            var elements = container.selectAll('.bar').data(stack);
            elements.call(update);
            elements.enter().append('rect').call(update);
            elements.exit().remove();
        }
    });

    tau.charts.add('Bar', function (data) {
        return new BarChart(data);
    });

})(tau);
(function(tau) {
    /**@class */
    /**@extends BasicChart */
    var LineChart = tau.charts.Base.extend({
        _meta: {
            x: {type: tau.data.types.quantitative},
            y: {type: tau.data.types.quantitative},
            color: {type: tau.data.types.categorical, default: 1}
        },

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

            //TODO: allow to set interpolation outside?
            var line = d3.svg.line()
                //.interpolate('cardinal')
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

})(tau);
(function(tau) {

    /**@class */
    /**@extends BasicChart */
    var ScatterPlotChart = tau.charts.Base.extend({
        _meta: {
            x: {type: tau.data.types.quantitative},
            y: {type: tau.data.types.quantitative},
            color: {type: tau.data.types.categorical, default: 1},
            size: {type: tau.data.types.quantitative, default: 10}
        },

        _renderData: function (container, data) {
            this._mapper.binder('size').range([0, container.layout('width')/100]);
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

})(tau);
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

                drawTableFn = function () {};  // We invoke this function only once.
            };

            var toggleTable = function (el) {
                (el.attr('class') == 'datatable') ? el.attr('class', 'datatable show') : el.attr('class', 'datatable');
            };
        }
    };

    tau.plugins.add('datatable', DataTable);
})();
(function () {
    /** @class DataTable
     * @extends Plugin */
    var Header = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        init: function (){
            this._header = arguments[0];
            this._description = arguments[1];
        },
        render: function (context, tools) {

            var header = this._header;
            var description = this._description;

            var container = tools.html.above
                .append('header')
                .attr('class', 'title');

            container
                .append('h1')
                .html(header);

            container    
                .append('p')
                .html(description);
        }
    };

    tau.plugins.add('header', Header);
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
            tools.element.classed('highlighted', false);
        }
    };

    tau.plugins.add('highlighter', Highlighter);
})();
(function () {

    /** @class Legend
     * @extends Plugin */
    var Jittering = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */

        render: function (context, tools) {

            var container = tools.html
                .right
                .append('div')
                .attr('class', 'jittering')
                .append('label');

            var checkbox = container
                .insert('input', ':first-child')
                .attr('type', 'checkbox')
                .attr('id', 'applyjittering');

            var width = tools.svg.layout("width");
            var height = tools.svg.layout("height");

            var x = tools.mapper.map('x');

            var y = tools.mapper.map('y');
            var size = tools.mapper.map('size');
            var color = tools.mapper.map('color');

            var radius = 5;
            var padding = 1; /*magic parameters*/

            container
                .append('span')
                .text('Jittering');

            var data = context.data._data.map(function(d){
                return {initialX: x(d), initialY: y(d), x : x(d), y: y(d), radius: size(d)};  
            });


            var node = tools.elements(); 

            var force = d3.layout.force()
                .nodes(data)
                .size([width, height])
                .on("tick", tick)
                .charge(0)
                .gravity(0)
                .chargeDistance(500);


            d3.select("#applyjittering").on("change", function() {
                force.resume();
            });

            force.start();

            function tick(e) {
                node.each(moveTowardDataPosition(e.alpha));

                if (checkbox.node().checked) node.each(collide(e.alpha));

                //node.attr("cx", function(d, i) { return data[i].x; })
                //    .attr("cy", function(d, i) { return data[i].y; });


                node.attr("cx", function(d, i) { return data[i].x = Math.max(0, Math.min(width, data[i].x)); })
                    .attr("cy", function(d, i) { return data[i].y = Math.max(0, Math.min(height, data[i].y)); });

            }            
            function moveTowardDataPosition(alpha) {
                return function(d, i) {

                  data[i].x += (data[i].initialX - data[i].x) * 0.1 * alpha;
                  data[i].y += (data[i].initialY - data[i].y) * 0.1 * alpha;
                };
              } 

              // Resolve collisions between nodes.
              function collide(alpha) {
                var quadtree = d3.geom.quadtree(data);
                return function(_, i) {
                  var d = data[i];
                  var r = d.radius + radius + padding,
                      nx1 = d.x - r,
                      nx2 = d.x + r,
                      ny1 = d.y - r,
                      ny2 = d.y + r;
                  quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                      var x = d.x - quad.point.x,
                          y = d.y - quad.point.y,
                          l = Math.sqrt(x * x + y * y),
                          r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                      if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                      }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                  });
                };
            }
        }
    };

    tau.plugins.add('jittering', Jittering);
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

            tools.svg.append("defs")
                .html('<filter x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" id="outline">' + 
                            '<feMorphology operator="dilate" in="SourceGraphic" result="Outline" radius="3"/>' +
                            '<feColorMatrix result="Outline" in="Outline" type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.95 0" />' +
                            '<feMerge>' +
                                '<feMergeNode in="Outline"></feMergeNode>' +
                                '<feMergeNode in="SourceGraphic"></feMergeNode>' +
                            '</feMerge>' +
                        '</filter>');

            var parent = tools;

            this.mouseover = function (context, tools) {

                var currentY = +tools.element.attr("cy");
                var currentX = +tools.element.attr("cx");

                var projections = parent.svg.selectAll(".projections")
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
                        .attr("x2", currentX)
                        .attr("y2", function(d){
                            return currentY + mapper.map("size")(d);
                        });

                    projections.select(".y")
                        .append("text")
                        .attr("transform", "translate(0, 18)")
                        //TODO: think how to replace constants with some provided values
                        .attr("filter", "url(#outline)")
                        .attr("dx", mapper.map("x"))
                        .attr("dy", height - marginBottom + 10)
                        .text(mapper.raw("x"));
                }

                if (axises.indexOf("y") > -1) {

                    projections.append("g")
                        .attr("class", "x")
                        .append("line")
                        .attr("x1", -padding)
                        .attr("y1", mapper.map("y"))
                        .attr("x2", function(d){
                            return currentX - mapper.map("size")(d);
                        })
                        .attr("y2", currentY);

                    projections.select(".x")
                        .append("text")
                        .attr("transform", "translate(-19, 4)")
                        //TODO: think how to replace constants with some provided values
                        .attr("filter", "url(#outline)")
                        .attr("dx", 0)
                        .attr("dy", mapper.map("y"))
                        .text(mapper.raw("y"));
                }
            };

            this.mouseout = function () {
                tools.svg.selectAll(".projections").remove();
            }
        },
        mouseover: function(context, tools){
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
            .style('transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
            .style('-webkit-transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
            .style('display', 'block')
            .html(text);
        },

        mousemove: function (context, tools) {
            if (this._container.style('display', 'block')) {
                this._container
                    .style('transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
                    .style('-webkit-transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)');
            };
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
(function () {
    function loessFn(xval, yval, bandwidth) {
        function tricube(x) {
            var tmp = 1 - x * x * x;
            return tmp * tmp * tmp;
        }

        var res = [];

        var left = 0;
        var right = Math.floor(bandwidth * xval.length) - 1;

        for (var i in xval) {
            var x = xval[i];

            if (i > 0) {
                if (right < xval.length - 1 &&
                    xval[right + 1] - xval[i] < xval[i] - xval[left]) {
                    left++;
                    right++;
                }
            }

            var edge;
            if (xval[i] - xval[left] > xval[right] - xval[i])
                edge = left;
            else
                edge = right;

            var denom = Math.abs(1.0 / (xval[edge] - x));

            var sumWeights = 0;
            var sumX = 0, sumXSquared = 0, sumY = 0, sumXY = 0;

            var k = left;
            while (k <= right) {
                var xk = xval[k];
                var yk = yval[k];
                var dist;
                if (k < i) {
                    dist = (x - xk);
                } else {
                    dist = (xk - x);
                }
                var w = tricube(dist * denom);
                var xkw = xk * w;
                sumWeights += w;
                sumX += xkw;
                sumXSquared += xk * xkw;
                sumY += yk * w;
                sumXY += yk * xkw;
                k++;
            }

            var meanX = sumX / sumWeights;
            var meanY = sumY / sumWeights;
            var meanXY = sumXY / sumWeights;
            var meanXSquared = sumXSquared / sumWeights;

            var beta;
            if (meanXSquared == meanX * meanX)
                beta = 0;
            else
                beta = (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

            var alpha = meanY - beta * meanX;

            res[i] = beta * x + alpha;
        }

        return res;
    }

    /** @class Trend
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.trend())
     */
    var Trend = {

        init: function () {
        },

        render: function (context, tools) {

            var mapper = tools.mapper;

            mapper.alias('color', 'key');

            var categories = d3.nest()
                .key(mapper.raw('color'))
                .entries(context.data._data);

            var line = d3.svg.line()
                .interpolate('basis')
                .y(function (d) {
                    return d[1];
                })
                .x(function (d) {
                    return d[0];
                });

            var category = tools.svg.selectAll(".category")
                .data(categories)
                .enter().append("g")
                .attr("transform", "translate(20, 0)")
                .attr("class", 'trend-category');


            category.append("path")
                .attr("class", function(d) {
                    return "line trend-line " + mapper.map("color")(d);
                })
                .attr("d", function (d) {
                    var points = { x: [], y: [] };

                    var pushValue = function(axis, value) {
                        var pointValue = mapper.map(axis)(value);
                        points[axis].push(Math.round(pointValue));
                    };

                    for (var i = 0; i < d.values.length; i++) {
                       pushValue("x", d.values[i]);
                       pushValue("y", d.values[i]);
                    }

                    if (points.x.length < 4) {
                        return;
                    }

                    return line(d3.zip(points.x, loessFn(points.x, points.y, 0.5)));
                });
        }
    };


    tau.plugins.add('trend', Trend);
})();

// jshint ignore: start
return tau;

});