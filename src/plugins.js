class Plugins {

    constructor(plugins, chart) {
        this.chart = chart;
        this.handlers = new Map();
        this.plugins = plugins.map(this.initPlugin, this);
    }

    initPlugin(plugin) {

        if (plugin.init) {
            plugin.init(this.chart);
        }

        const handlers = [];
        this.handlers.set(plugin, handlers);
        const addHandler = (event, handler) => {
            handlers.push(this.chart.on(event, handler, plugin));
        };

        if (plugin.destroy) {
            addHandler('destroy', plugin.destroy.bind(plugin));
        }

        Object
            .keys(plugin)
            .forEach((name) => {
                if (name.indexOf('on') === 0) {
                    const event = name.substr(2).toLowerCase();
                    addHandler(event, plugin[name].bind(plugin));
                }
            });

        return plugin;
    }

    destroyPlugin(plugin) {
        if (plugin.destroy) {
            plugin.destroy();
        }
        this.handlers.get(plugin)
            .forEach((handler) => {
                this.chart.removeHandler(handler, plugin);
            });
    }

    destroy() {
        this.plugins.forEach((p) => this.destroyPlugin(p));
    }
}

export {Plugins};
