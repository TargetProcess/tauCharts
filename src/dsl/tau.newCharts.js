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
    this._chart = this._render(this.reader.traverse(this.data)).node();
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