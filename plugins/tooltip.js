(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauPlugins'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauPlugins');
        module.exports = factory();
    } else {
        factory(this.tauPlugins);
    }
})(function (tauPlugins) {
    /** @class Tooltip
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.tooltip('effort', 'priority'))
     accepts a list of data fields names as properties
     */
    function tooltip(fields) {
        return {

            init: function (chart) {
                this._dataFields = fields;
                this._interval = null;
                this._tooltip = chart.addBallon({spacing:10});
                this._tooltip.getDom().addEventListener('mouseover', function () {
                    this.needHide = false;
                    clearTimeout(this.interval);
                }.bind(this), false);
                this._tooltip.getDom().addEventListener('mouseleave', function () {
                    this.needHide = true;
                    this._tooltip.hide();
                }.bind(this), false);
                this.needHide = true;
            },
            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            onElementMouseOver: function (chart, data) {
                //TODO: this tooltip jumps a bit, need to be fixed
                var text = '';
                for (var i = this._dataFields.length - 1; i >= 0; i--) {
                    var field = this._dataFields[i];
                    text += '<p class="tooltip-' + field + '"><em>' + field + ':</em> ' + data.context.datum[field];
                }
                text += '</p><a>Exclude</a>';

                this._tooltip.content(text);
                this._tooltip.show(data.element.node());
                var dataChart = chart.getData();
                clearInterval(this._interval);
                this._tooltip.getDom().querySelectorAll('a')[0].addEventListener('click',function(){
                     chart.setData(_.without(dataChart, data.context.datum));
                    this._tooltip.hide();
                }.bind(this));
            },
            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            onElementMouseOut: function (context, tools) {
                this._interval = setTimeout(function () {
                    if (this.needHide) {
                        this._tooltip.hide();
                    }
                }.bind(this), 300);
            }
        };

    }

    tauPlugins.add('tooltip', tooltip);
});