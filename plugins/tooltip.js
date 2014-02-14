(function () {
    /** @class Tooltip
     * @extends Plugin */
     /* Usage
     .plugins(tau.plugins.tooltip('effort', 'priority'))
    accepts a list of data fields names as properties
    */
    var Tooltip = {

        init: function () {      
            this._dataFields = arguments;
            this._container = d3.select('body').append('div');    
        },
        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            //TODO: this tooltip jumps a bit, need to be fixed

            var text = '';
            for (var i = this._dataFields.length - 1; i >= 0; i--) {
                var field = this._dataFields[i];
                text += '<p class="tooltip-' + field + '"><em>' + field + ':</em> ' + context.datum[field] + '</p>'
            };

            this._container.classed('tooltip', true)
            .style('top', (d3.mouse(this._container[0].parentNode)[1]-10) + 'px')
            .style('left',(d3.mouse(this._container[0].parentNode)[0]+10) + 'px')
            .style('display', 'block')
            .html(text);
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            this._container.style("display", "none");
        }
    };

    tau.plugins.add('tooltip', Tooltip);
})();