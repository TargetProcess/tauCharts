/**
 * Internal method to return CSS value for given element and property
 */
var tempDiv = document.createElement('div');

var utilsDom = {
    appendTo: function (el, container) {
        var node;
        if (el instanceof Node) {
            node = el;
        } else {
            tempDiv.insertAdjacentHTML('afterbegin', el);
            node = tempDiv.childNodes[0];
        }
        container.appendChild(node);
        return node;
    },
    getScrollbarWidth: function () {
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

    getStyleAsNum: function (el, prop) {
        return parseInt(this.getStyle(el, prop) || 0, 10);
    },

    getContainerSize: function (el) {
        var pl = this.getStyleAsNum(el, 'padding-left');
        var pr = this.getStyleAsNum(el, 'padding-right');
        var pb = this.getStyleAsNum(el, 'padding-bottom');
        var pt = this.getStyleAsNum(el, 'padding-top');

        var borderWidthT = this.getStyleAsNum(el, 'border-top-width');
        var borderWidthL = this.getStyleAsNum(el, 'border-left-width');
        var borderWidthR = this.getStyleAsNum(el, 'border-right-width');
        var borderWidthB = this.getStyleAsNum(el, 'border-bottom-width');

        var bw = borderWidthT + borderWidthL + borderWidthR + borderWidthB;

        var rect = el.getBoundingClientRect();

        return {
            width: rect.width - pl - pr - 2 * bw,
            height: rect.height - pb - pt - 2 * bw
        };
    },

    getAxisTickLabelSize: function (text) {

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

        div.innerHTML = compiled({xTick: text});

        var textNode = d3.select(div).selectAll('.x.axis .tick text')[0][0];

        var size = {
            width: 0,
            height: 0
        };

        // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
        var rect = textNode.getBoundingClientRect();
        size.width = rect.right - rect.left;
        size.height = rect.bottom - rect.top;

        document.body.removeChild(div);

        return size;
    }
};
export {utilsDom};
