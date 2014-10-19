/**
 * Internal method to return CSS value for given element and property
 */
var utilsDom =  {
    getStyle: function (el, prop) {
        return window.getComputedStyle(el, undefined).getPropertyValue(prop);
    },
    getContainerSize : function(el) {
        var padding = 2 * parseInt(this.getStyle(el, 'padding'), 10);
        return {
            width: el.clientWidth - padding,
            height: el.clientHeight - padding
        };
    }
};
export {utilsDom};
