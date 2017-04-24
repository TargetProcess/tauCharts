(function (tauCharts) {

    var utils = tauCharts.api.utils;

    tauCharts.api.unitsRegistry.reg(
        'ELEMENT.BRUSHER',
        {
            draw: function () {
                var cfg = this.node().config;
                this.drawElement(cfg.options.slot(cfg.uid));
            },

            drawElement: function (container) {

                var self = this;
                var screenModel = this.node().screenModel;
                var createUpdateFunc = tauCharts.api.d3_animationInterceptor;
                var drawElement = function () {
                    var that = this;
                    var speed = self.node().config.guide.animationSpeed;
                    var props = {
                        x: 0,
                        y: 0,
                        height: 200,
                        width: 200,
                        fill: 'rgba(0,255,0,0.25)'
                    };
                    var part = that
                        .selectAll('.' + props.class)
                        .data(function(row) {
                            return [row];
                        }, screenModel.id);
                    part.exit()
                        .call(createUpdateFunc(speed, null, {width: 0}, function (node) {
                            d3.select(node).remove();
                        }));
                    part.call(createUpdateFunc(speed, null, props));
                    part.enter()
                        .append('rect')
                        .style('stroke-width', 0)
                        .call(createUpdateFunc(speed, {width: 0}, props));
                };

                var frameGroups = container
                    .selectAll('.brusher-node')
                    .data([{}]);
                frameGroups
                    .exit()
                    .remove();
                frameGroups
                    .call(drawElement);
                frameGroups
                    .enter()
                    .append('g')
                    .attr('class', 'brusher-node')
                    .call(drawElement);
            }
        },
        'ELEMENT.GENERIC.CARTESIAN');

    function BrushPlugin(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                verbose: false,
                forceBrush: {}
            });

        var plugin = {

            init: function (chart) {
                this._chart = chart;
            },

            onSpecReady: function (chart, specRef) {
                specRef.transformations = specRef.transformations || {};
                chart.traverseSpec(
                    specRef,
                    function (unit, parentUnit) {

                        if (unit.type !== 'COORDS.RECT') {
                            return;
                        }

                        var brusher = JSON.parse(JSON.stringify(unit));
                        brusher.type = 'ELEMENT.BRUSHER';
                        brusher.namespace = 'brusher';
                        brusher.guide = brusher.guide || {};
                        unit.transformation = unit.transformation || [];
                        unit.units.push(brusher);
                    });
            },

            onRender: function (chart) {
                // do nothing
            },

            template: utils.template('<div class="graphical-report__chart_brushing_panel"></div>')
        };

        return plugin;
    }

    tauCharts.api.plugins.add('brush', BrushPlugin);

})(tauCharts);

dev.spec({

    _name: 'Scatterplot of period / mass correlation',
    _desc: 'There are no data on exoplanets similar to Earth by mass',

    type: 'bar',
    x: ['mass'],
    y: ['period'],
    color: 'name',
    size: 'eccentricity',

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('brush')()
    ],

    data: dev.dataset('exoplanets', function (data) {
        return data.filter(function (row) {
            return row['jupiter mass'] <= 1;
        });
    })
});