//plugins
/** @class
 * @extends Plugin */
class Plugins {
    /** @constructs */
        constructor(plugins, chart) {
        this.chart = chart;
        this._plugins = plugins.map(this.initPlugin, this);
    }

    initPlugin(plugin) {
        if(plugin.init) {
            plugin.init(this.chart);
        }
        Object.keys(plugin).forEach((name)=> {
            if (name.indexOf('on') === 0) {
                var event = name.substr(2);
                this.chart.on(event.charAt(0).toLowerCase() + event.substr(1), plugin[name].bind(plugin));
            }
        });
    }
}


var propagateDatumEvents = function (chart) {
    return function () {
        this
            .on('click', function (d) {
                chart.fire('elementClick', {context:new ElementContext(d), element: d3.select(this)});
            })
            .on('mouseover', function (d) {
                chart.fire('elementMouseOver', {context:new ElementContext(d), element: d3.select(this)});
            })
            .on('mouseout', function (d) {
                chart.fire('elementMouseOut', {context:new ElementContext(d), element: d3.select(this)});
            })
            .on('mousemove', function (d) {
                chart.fire('elementMouseMove', {context:new ElementContext(d), element: d3.select(this)});
            });
    };
};

/** @class ChartElementTools*/
class ChartElementTools {
    /** @constructs */
        constructor(element) {
        this.element = element;
    }
}

/** @class RenderContext*/
class RenderContext {
    /** @constructs */
        constructor(dataSource) {
        this.data = dataSource;
    }
}

/** @class ElementContext */
class ElementContext {
    /**
     * @constructs
     * @param datum
     *
     * */
        constructor(datum) {
        this.datum = datum;
    }
}

/** @class ChartTools */
class ChartTools {
    /**
     * @constructs
     * @param {ChartLayout} layout
     * @param {Mapper} mapper
     **/
        constructor(layout, mapper) {
        this.svg = layout.svg;
        this.html = layout.html;
        this.mapper = mapper;
    }

    elements() {
        return this.svg.selectAll('.i-role-datum');
    }
}

export {propagateDatumEvents, Plugins};
