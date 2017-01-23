import d3 from 'd3';

var utilsDraw = {
    translate: ((left, top) => `translate(${left},${top})`),
    rotate: ((angle) => `rotate(${angle})`),
    getOrientation: ((scaleOrient) => (['bottom', 'top'].indexOf(scaleOrient.toLowerCase()) >= 0) ? 'h' : 'v'),
    isIntersect(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
        var s1_x, s1_y, s2_x, s2_y;
        s1_x = ax1 - ax0;
        s1_y = ay1 - ay0;
        s2_x = bx1 - bx0;
        s2_y = by1 - by0;

        var s, t;
        s = (-s1_y * (ax0 - bx0) + s1_x * (ay0 - by0)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (ay0 - by0) - s2_y * (ax0 - bx0)) / (-s2_x * s1_y + s1_x * s2_y);

        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    },

    getDeepTransformTranslate(node) {
        const parseTransformTranslate = (transform) => {
            var result = {x: 0, y: 0};
            var ts = transform.indexOf('translate(');
            if (ts >= 0) {
                var te = transform.indexOf(')', ts + 10);
                var translateStr = transform.substring(ts + 10, te);
                var translateParts = translateStr.trim().replace(',', ' ').replace(/\s+/, ' ').split(' ');
                result.x = parseFloat(translateParts[0]);
                if (translateParts.length > 1) {
                    result.y = parseFloat(translateParts[1]);
                }
            }
            return result;
        };
        var translate = {x: 0, y: 0};
        var parent = node;
        var tr, attr;
        while (parent.nodeName.toUpperCase() !== 'SVG') {
            attr = parent.getAttribute('transform');
            if (attr) {
                tr = parseTransformTranslate(attr);
                translate.x += tr.x;
                translate.y += tr.y;
            }
            parent = parent.parentNode;
        }
        return translate;
    },

    raiseElements(container, selector, filter) {
        const highlighted = container
            .selectAll(selector)
            .filter(filter);
        if (highlighted.empty()) {
            return;
        }
        const untargeted = d3.select(highlighted.node().parentNode)
            .selectAll(selector)
            .filter((d) => !filter(d))[0];
        const lastUntargeted = untargeted[untargeted.length - 1];
        if (lastUntargeted) {
            const untargetedIndex = Array.prototype.indexOf.call(
                lastUntargeted.parentNode.childNodes,
                lastUntargeted);
            const nextSibling = lastUntargeted.nextSibling;
            highlighted.each(function () {
                const index = Array.prototype.indexOf.call(this.parentNode.childNodes, this);
                if (index > untargetedIndex) {
                    return;
                }
                this.parentNode.insertBefore(this, nextSibling);
            });
        }
    }
};

export {utilsDraw};
