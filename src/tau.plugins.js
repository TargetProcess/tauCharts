(function () {
    /** @class Plugin */
    var Plugin = Class.extend({
        
        init: function() {            
        },

        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        click: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseover: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mouseout: function (context, tools) {
        },

        /**
         * @param {ElementContext} context
         * @param {ChartElementTools} tools
         */
        mousemove: function (context, tools) {
        }
    });

    tau.plugins = {
        add: function(name, plugin){
            plugin = Plugin.extend(plugin);

            tau.plugins[name] = function(){
                return Class.new(plugin, arguments);
            };
        }
    };
})();
