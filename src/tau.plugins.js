(function () {
    /** @class Plugin */
    var Plugin = Class.extend({
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
        },

        /**
         * @param {ClickContext} context
         * @param {ChartElementTools} tools
         */
        click: function (context, tools) {
        }
    });

    tau.plugins = {
        add: function(name, plugin){
            plugin = Plugin.extend(plugin);

            tau.plugins[name] = function(){
                return Class.new(plugin, arguments);
            }
        }
    };
})();
