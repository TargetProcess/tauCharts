(function () {

    /** @class Legend
     * @extends Plugin */
    var Jittering = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */

        render: function (context, tools) {

            var container = tools.html
                .right
                .append('div')
                .attr('class', 'jittering')
                .append('label');

            var selector = container
                .insert('input', ':first-child')
                .attr('type', 'checkbox')
                .attr('id', 'applyJittering');

            container
                .append('span')
                .text('Jittering');
        }
    };

    tau.plugins.add('jittering', Jittering);
})();