import {DSLReader} from './dsl-reader';
import {Plugins, propagateDatumEvents} from './plugins';

class Chart {
    constructor(config) {
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

    _render(graph) {
        return this.reader.traverseToNode(graph, this.data);
    }

    getSvg() {
        return this._chart;
    }

}

var tauChart = {
    Chart:Chart
};

export {tauChart};
