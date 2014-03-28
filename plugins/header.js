(function () {
    /** @class DataTable
     * @extends Plugin */
    var Header = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        init: function (){
            this._header = arguments[0];
            this._description = arguments[1];
        },
        render: function (context, tools) {

            var header = this._header;
            var description = this._description;

            var container = tools.html.above
                .append('header')
                .attr('class', 'title');

            container
                .append('h1')
                .html(header);

            container    
                .append('p')
                .html(description);
        }
    };

    tau.plugins.add('header', Header);
})();