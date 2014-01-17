(function () {
    /** @class Tooltip
     * @extends Plugin */
    var Tooltip = {
        /**
         * @param {ClickContext} context
         * @param {ChartElementTools} tools
         */
        click: function (context, tools) {
            tools.highlight(context.datum);
            tools.tooltip('<span>effort = ' + context.datum.effort + '</span>');
        }
    };

    tau.plugins.add('tooltip', Tooltip);
})();