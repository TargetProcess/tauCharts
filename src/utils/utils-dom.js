/**
 * Internal method to return CSS value for given element and property
 */
var utilsDom =  {
    getStyle: function (el, prop) {
        return window.getComputedStyle(el, undefined).getPropertyValue(prop);
    },
    getContainerSize : function(el) {
        var padding = 2 * parseInt(this.getStyle(el, 'padding') || 0, 10);
        var rect = el.getBoundingClientRect();
        return {
            width: rect.width - padding,
            height: rect.height - padding
        };
    }
};
export {utilsDom};
