//plugins
/** @class
 * @extends Plugin */
class Plugins {
    /** @constructs */
    constructor(plugins) {
        this._plugins = plugins;
    }

    _call(name, args) {
        for (var i = 0; i < this._plugins.length; i++) {
            if (typeof(this._plugins[i][name]) == 'function') {
                this._plugins[i][name].apply(this._plugins[i], args);
            }
        }
    }

    render(context, tools) {
        this._call('render', arguments);
    }

    click(context, tools) {
        this._call('click', arguments);
    }

    mouseover(context, tools) {
        this._call('mouseover', arguments);
    }

    mouseout(context, tools) {
        this._call('mouseout', arguments);
    }

    mousemove(context, tools) {
        this._call('mousemove', arguments);
    }
}


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
