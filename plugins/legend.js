(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory();
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {
    var _ = tauCharts.api._;
    var legend = function () {
        return {
            init: function (chart) {

            },
            onUnitReady: function (chart, unit) {
                if (unit.type.indexOf('ELEMENT') !== -1) {
                    this._unit = unit;
                }
            },
            _getColorMap: function (chart) {
                var color = this._unit.options.color;
                var colorDimension = color.dimension;
                var data = chart.getData();
                var groups = _.groupBy(data, function (item) {
                    return item[colorDimension];
                });
                return _.keys(groups).reduce(function (colorMap, item) {
                    colorMap[item] = color.get(item);
                    return colorMap;
                }, {});
            },
            template: _.template('<ul><%=items%></ul>'),
            itemTemplate:_.template('<li><%=color%>-<%=value%></li>'),
            onRender: function (chart) {
                //var config = chart.getConfig();
                var items = _.map(this._getColorMap(chart), function (item, key) {
                    return this.itemTemplate({color:item,value:key});
                },this).join('');
                document.querySelectorAll('.graphical-report_container__center-right')[0].innerHTML = this.template({items:items});
            },
            render: function () {

            }

        };
    };
    tauCharts.api.plugins.add('legend', legend);
});