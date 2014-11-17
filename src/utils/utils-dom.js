/**
 * Internal method to return CSS value for given element and property
 */
var utilsDom =  {

    getScrollbarWidth: function() {
        var div = document.createElement("div");
        div.style.overflow = "scroll";
        div.style.visibility = "hidden";
        div.style.position = 'absolute';
        div.style.width = '100px';
        div.style.height = '100px';

        document.body.appendChild(div);

        var r = div.offsetWidth - div.clientWidth;

        document.body.removeChild(div);

        return r;
    },

    getStyle: function (el, prop) {
        return window.getComputedStyle(el, undefined).getPropertyValue(prop);
    },
    getContainerSize : function(el) {
        var pl = parseInt(this.getStyle(el, 'padding-left') || 0, 10);
        var pr = parseInt(this.getStyle(el, 'padding-right') || 0, 10);
        var pb = parseInt(this.getStyle(el, 'padding-bottom') || 0, 10);
        var pt = parseInt(this.getStyle(el, 'padding-top') || 0, 10);

        var bw = parseInt(this.getStyle(el, 'border-width') || 0, 10);

        var rect = el.getBoundingClientRect();

        return {
            width: rect.width - pl - pr - 2 * bw,
            height: rect.height - pb - pt - 2 * bw
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
            width: textNode.clientWidth || textNode.scrollWidth,
            height: textNode.clientHeight || textNode.scrollHeight
        };

        document.body.removeChild(div);

        return size;
    }
};
export {utilsDom};
