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

            init: function () {
                this._dataFields = fields;
                this._container = d3.select('body').append('div');
                this._container.on('mouseover',function(){
                    this.needHide = false;
                }.bind(this));
                this._container.on('mouseleave',function(){
                    this.needHide = true;
                    this._container.style("display", "none");
                }.bind(this));
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
                this._container.classed({'tooltip graphical-report__tooltip': true})
                    .style('transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
                    .style('-webkit-transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
                    .style('display', 'block')
                    .html(text);
                var dataChart = chart.getData();
                this._container.select('a').on('click',function(){
                    chart.setData(_.without(dataChart, data.context.datum));
                });
            },

            onElementMouseMove: function (context, tools) {
                if (this._container.style('display', 'block')) {
                    this._container
                        .style('transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)')
                        .style('-webkit-transform', 'translate(' + (d3.mouse(this._container[0].parentNode)[0]+10) + 'px, ' + (d3.mouse(this._container[0].parentNode)[1]-10) + 'px)');
                }
            },

            /**
             * @param {ElementContext} context
             * @param {ChartElementTools} tools
             */
            onElementMouseOut: function (context, tools) {
                setTimeout(function(){
                    if(this.needHide) {
                        this._container.style("display", "none");
                    }
                }.bind(this),300);
            }
        };

    }

    tauPlugins.add('tooltip', tooltip);
});