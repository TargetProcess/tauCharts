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
    },

    getAxisTickLabelSize: function(text) {

        var tmpl = [
            '<svg class="graphical-report__svg">',
            '<g class="graphical-report__cell cell">',
            '<g class="x axis">',
            '<g class="tick"><text><%= xTick %></text></g>',
            '</g>',
            //'<g class="y axis">',
            //'<g class="tick"><text><%= xTick %></text></g>',
            //'</g>',
            '</g>',
            '</svg>'
        ].join('');

        var compiled = _.template(tmpl);

        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.border = '1px solid green';
        document.body.appendChild(div);

        div.innerHTML = compiled({ xTick: text });

        var textNode = d3.select(div).selectAll('.x.axis .tick text')[0][0];

        var size = {
            width: textNode.clientWidth,
            height: textNode.clientHeight
        };

        document.body.removeChild(div);

        return size;
    }
};
export {utilsDom};
