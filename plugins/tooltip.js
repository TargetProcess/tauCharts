(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauPlugins'],function(tauPlugins){return factory(tauPlugins);});
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
    function tooltip (fields) {
        return  {

            init: function (chart) {
                this._dataFields = fields;
                this._tooltip = chart.addBallon();
                /*this._container.on('mouseover',function(){
                    this.needHide = false;
                }.bind(this));
                this._container.on('mouseleave',function(){
                    this.needHide = true;
                    this._tooltip.hide();
                }.bind(this));*/
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
                text+='</p><a>Exclude</a>';
              /*  this._container.classed({'tooltip graphical-report__tooltip': true})
                    .style('transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
                    .style('-webkit-transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
                    .style('display', 'block')
                    .html(text);*/
                this._tooltip.content(text);
                this._tooltip.show(data.element.node());
                var dataChart = chart.getData();
               /* this._container.select('a').on('click',function(){
                    chart.setData(_.without(dataChart, data.context.datum));
                });*/
            },
             /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            onElementMouseOut: function (context, tools) {
                setTimeout(function(){
                    if(this.needHide) {
                        this._tooltip.hide();
                    }
                }.bind(this),300);
            }
        };

    }

    tauPlugins.add('tooltip', tooltip);
});