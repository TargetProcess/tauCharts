/**
 * Internal method to return CSS value for given element and property
 */
import {default as d3} from 'd3';
var tempDiv = document.createElement('div');
import {utils} from './utils';
import WeakMap from 'core-js/library/fn/weak-map';
var scrollbarSizes = new WeakMap();

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
    getScrollbarSize: function (container) {
        if (scrollbarSizes.has(container)) {
            return scrollbarSizes.get(container);
        }
        var initialOverflow = container.style.overflow;
        container.style.overflow = 'scroll';
        var size = {
            width: (container.offsetWidth - container.clientWidth),
            height: (container.offsetHeight - container.clientHeight)
        };
        container.style.overflow = initialOverflow;
        scrollbarSizes.set(container, size);
        return size;
    },

    /**
     * Sets padding as a placeholder for scrollbars.
     * @param el Target element.
     * @param [direction=both] Scrollbar direction ("horizontal", "vertical" or "both").
     */
    setScrollPadding: function (el, direction) {
        direction = direction || 'both';
        var isBottom = direction === 'horizontal' || direction === 'both';
        var isRight = direction === 'vertical' || direction === 'both';

        var scrollbars = utilsDom.getScrollbarSize(el);
        var initialPaddingRight = isRight ? `${scrollbars.width}px` : '0';
        var initialPaddingBottom = isBottom ? `${scrollbars.height}px` : '0';
        el.style.overflow = 'hidden';
        el.style.padding = `0 ${initialPaddingRight} ${initialPaddingBottom} 0`;

        var hasBottomScroll = el.scrollWidth > el.clientWidth;
        var hasRightScroll = el.scrollHeight > el.clientHeight;
        var paddingRight = isRight && !hasRightScroll ? `${scrollbars.width}px` : '0';
        var paddingBottom = isBottom && !hasBottomScroll ? `${scrollbars.height}px` : '0';
        el.style.padding = `0 ${paddingRight} ${paddingBottom} 0`;

        // NOTE: Manually set scroll due to overflow:auto Chrome 53 bug
        // https://bugs.chromium.org/p/chromium/issues/detail?id=644450
        el.style.overflow = '';
        el.style.overflowX = hasBottomScroll ? 'scroll' : 'hidden';
        el.style.overflowY = hasRightScroll ? 'scroll' : 'hidden';

        return scrollbars;
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
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.border = '1px solid green';
        div.style.top = '0';
        document.body.appendChild(div);

        div.innerHTML = `<svg class="graphical-report__svg">
            <g class="graphical-report__cell cell">
            <g class="x axis">
            <g class="tick"><text>${text}</text></g>
            </g>
            </g>
            </svg>`;

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

        return {width: w, height: parseInt(xFontSize)};
    },

    getCharSize: utils.memoize(
        (char, {fontSize, fontFamily, fontWeight}) => {

            var div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.border = '0px';
            div.style.top = '0';
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
            throw new Error('Selector should not contain whitespaces.');
        }
        if (delimiters.indexOf(selector[0]) >= 0) {
            throw new Error('Selector must have tag at the beginning.');
        }

        var isElement = (container instanceof Element);
        if (isElement) {
            container = d3.select(container);
        }
        var result = (d3El) => (isElement ? d3El.node() : d3El);

        // Search for existing immediate child
        var child = container.selectAll(selector)
            .filter(function () { return this.parentNode === container.node(); })
            .filter((d, i) => i === 0);
        if (!child.empty()) {
            return result(child);
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

        return result(element);
    },

    selectImmediate: function (container, selector) {
        return utilsDom.selectAllImmediate(container, selector)[0] || null;
    },

    selectAllImmediate: function (container, selector) {
        var results = [];
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
                results.push(child);
            }
        }
        return results;
    },

    sortChildren: function (parent, sorter) {
        if (parent.childElementCount > 0) {

            // Note: move DOM elements with
            // minimal number of iterations
            // and affected nodes to prevent
            // unneccessary repaints.

            // Get from/to index pairs.
            const unsorted = Array.prototype.filter.call(
                parent.childNodes,
                (el) => el.nodeType === Node.ELEMENT_NODE);
            const sorted = unsorted.slice().sort(sorter);
            const unsortedIndices = unsorted.reduce((map, el, i) => {
                map.set(el, i);
                return map;
            }, new Map());

            // Get groups (sequences of elements with unchanged order)
            var currGroup;
            var currDiff;
            const groups = sorted.reduce((groupsInfo, el, to) => {
                const from = unsortedIndices.get(el);
                const diff = (to - from);
                if (diff !== currDiff) {
                    if (currGroup) {
                        groupsInfo.push(currGroup);
                    }
                    currDiff = diff;
                    currGroup = {
                        from,
                        to,
                        elements: []
                    };
                }
                currGroup.elements.push(el);
                if (to === sorted.length - 1) {
                    groupsInfo.push(currGroup);
                }
                return groupsInfo;
            }, []);
            const unsortedGroups = groups.slice().sort((a, b) => {
                return (a.from - b.from);
            });
            const unsortedGroupsIndices = unsortedGroups.reduce((map, g, i) => {
                map.set(g, i);
                return map;
            }, new Map());

            // Get required iterations
            const createIterations = (forward) => {
                const iterations = groups
                    .map((g, i) => {
                        return {
                            elements: g.elements,
                            from: unsortedGroupsIndices.get(g),
                            to: i
                        };
                    })
                    .sort(utils.createMultiSorter(
                        ((a, b) => a.elements.length - b.elements.length),
                        (forward ? ((a, b) => b.to - a.to) : ((a, b) => a.to - b.to))
                    ));
                for (var i = 0, j, g, h; i < iterations.length; i++) {
                    g = iterations[i];
                    if (g.from > g.to) {
                        for (j = i + 1; j < iterations.length; j++) {
                            h = iterations[j];
                            if (h.from >= g.to && h.from < g.from) {
                                h.from++;
                            }
                        }
                    }
                    if (g.from < g.to) {
                        for (j = i + 1; j < iterations.length; j++) {
                            h = iterations[j];
                            if (h.from > g.from && h.from <= g.to) {
                                h.from--;
                            }
                        }
                    }
                }
                return iterations.filter((g) => g.from !== g.to);
            };
            const forwardIterations = createIterations(true);
            const backwardIterations = createIterations(false);
            const iterations = (forwardIterations.length < backwardIterations.length ?
                forwardIterations :
                backwardIterations);

            // Finally sort DOM nodes
            const mirror = unsortedGroups.map(g => g.elements);
            iterations
                .forEach((g) => {
                    const targetGroup = mirror.splice(g.from, 1)[0];
                    const groupAfter = mirror[g.to];
                    const siblingAfter = (groupAfter ? groupAfter[0] : null);
                    var targetNode;
                    if (g.elements.length === 1) {
                        targetNode = targetGroup[0];
                    } else {
                        targetNode = document.createDocumentFragment();
                        targetGroup.forEach((el) => {
                            targetNode.appendChild(el);
                        });
                    }
                    parent.insertBefore(targetNode, siblingAfter);
                    mirror.splice(g.to, 0, targetGroup);
                });
        }
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
        return (
            utils.unique(classes)
                .join(' ')
                .trim()
                .replace(/\s{2,}/g, ' ')
        );
    }
};
// TODO: Export functions separately.
export {utilsDom};