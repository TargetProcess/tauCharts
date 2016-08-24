/**
 * Internal method to return CSS value for given element and property
 */
import {default as d3} from 'd3';
var tempDiv = document.createElement('div');
import {default as _} from 'underscore';
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
        var div = document.createElement('div');
        div.style.overflow = 'scroll';
        div.style.visibility = 'hidden';
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

        var avgLetterSize = (text.length !== 0) ? (size.width / text.length) : 0;
        size.width = size.width + (1.5 * avgLetterSize);

        document.body.removeChild(div);

        return size;
    },

    getLabelSize: function (text, {fontSize, fontFamily, fontWeight}) {

        var xFontSize = typeof(fontSize) === 'string' ? fontSize : (`${fontSize}px`);
        var w = 0;
        var h = 0;
        var l = text.length - 1;
        for (var i = 0; i <= l; i++) {
            var char = text.charAt(i);
            var s = utilsDom.getCharSize(char, {fontSize: xFontSize, fontFamily, fontWeight});
            w += s.width;
            h = Math.max(h, s.height);
        }

        return {width: w, height: h};
    },

    getCharSize: _.memoize(
        (char, {fontSize, fontFamily, fontWeight}) => {

            var div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.border = '0px';
            div.style.fontSize = fontSize;
            div.style.fontFamily = fontFamily;
            div.style.fontWeight = fontWeight;

            document.body.appendChild(div);

            div.innerHTML = (char === ' ') ? '&nbsp;' : char;

            var size = {
                width: 0,
                height: 0
            };

            // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
            var rect = div.getBoundingClientRect();
            size.width = rect.right - rect.left;
            size.height = rect.bottom - rect.top;

            document.body.removeChild(div);

            return size;
        },
        (char, props) => `${char}_${JSON.stringify(props)}`
    ),

    /**
     * Searches for immediate child element by specified selector.
     * If missing, creates an element that matches the selector.
     */
    selectOrAppend: function (container, selector) {
        var delimitersActions = {
            '.': (text, el) => el.classed(text, true),
            '#': (text, el) => el.attr('id', text)
        };
        var delimiters = Object.keys(delimitersActions).join('');

        if (selector.indexOf(' ') >= 0) {
            throw new Error('Selector contains whitespace.');
        }
        if (delimiters.indexOf(selector[0]) >= 0) {
            throw new Error('Selector must have tag at the beginning.');
        }

        // Search for existing immediate child
        var child = utilsDom.selectImmediate(container.node(), selector);
        if (child) {
            return d3.select(child);
        }

        // Create new element
        var element;
        var lastFoundIndex = -1;
        var lastFoundDelimiter = null;
        for (var i = 1, l = selector.length, text; i <= l; i++) {
            if (i == l || delimiters.indexOf(selector[i]) >= 0) {
                text = selector.substring(lastFoundIndex + 1, i);
                if (lastFoundIndex < 0) {
                    element = container.append(text);
                } else {
                    delimitersActions[lastFoundDelimiter].call(null, text, element);
                }
                lastFoundDelimiter = selector[i];
                lastFoundIndex = i;
            }
        }

        return element;
    },

    selectImmediate: function (container, selector) {
        var matches = (
            Element.prototype.matches ||
            Element.prototype.matchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector
        );
        for (
            var child = container.firstElementChild;
            Boolean(child);
            child = child.nextElementSibling
        ) {
            if (matches.call(child, selector)) {
                return child;
            }
        }
        return null;
    },

    /**
     * Generates "class" attribute string.
     */
    classes: function (...args) {
        var classes = [];
        args.filter((c) => Boolean(c))
            .forEach((c) => {
                if (typeof c === 'string') {
                    classes.push(c);
                } else if (typeof c === 'object') {
                    classes.push.apply(
                        classes,
                        Object.keys(c)
                            .filter((key) => Boolean(c[key]))
                    );
                }
            });
        return _.uniq(classes).join(' ');
    }
};
export {utilsDom};