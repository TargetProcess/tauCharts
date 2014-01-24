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
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) { 
            //TODO: this tooltip jumps a bit, need to be fixed

            var text = '';
            for (var i = this._dataFields.length - 1; i >= 0; i--) {
                var field = this._dataFields[i];
                text += field + ': ' + context.datum[field] + '<br>'
            };

            this._container.classed('tooltip', true)
            .style('top', (event.pageY-10) + 'px')
            .style('left',(event.pageX+10) + 'px')
            .style('display', 'block')
            .html(text);
        },

        /**
         * @param {HoverContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
            this._container.style("display", "none");
        }
    };

    tau.plugins.add('tooltip', Tooltip);
})();