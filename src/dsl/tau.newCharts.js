import {DSLReader} from './dsl-reader';
function Chart(config) {
    this.config = _.defaults(config, {
        spec: null,
        data: [],
        plugins: []
    });
    this.plugins = this.config.plugins;
    this.spec = this.config.spec;
    this.data = this.config.data;
    this.reader = new DSLReader(this.spec);
    var render = this._render(this.reader.traverse(this.data));
    this._chart = render.node();

    //plugins
    this._plugins = new Plugins(this.config.plugins);
    render.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
}

Chart.prototype = {
    _render: function (graph) {
        return this.reader.traverseToNode(graph, this.data);
    },
    getSvg: function () {
        return this._chart;
    }/*,
    appendTo: function (el) {
        return d3.select(el).node().appendChild(this._chart);
    }*/
};

export {Chart};

//plugins
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
