import * as d3 from 'd3-selection';

    export function translate(left: number, top: number) {
        return `translate(${left},${top})`;
    }

    export function rotate(angle: number) {
        return `rotate(${angle})`;
    }

    export function getOrientation(scaleOrient: string) {
        return ((['bottom', 'top'].indexOf(scaleOrient.toLowerCase()) >= 0) ? 'h' : 'v');
    }

    export function parseTransformTranslate(transform: string) {
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
    }

    export function isIntersect(
        ax0: number,
        ay0: number,
        ax1: number,
        ay1: number,
        bx0: number,
        by0: number,
        bx1: number,
        by1: number
    ) {
        var s1_x, s1_y, s2_x, s2_y;
        s1_x = ax1 - ax0;
        s1_y = ay1 - ay0;
        s2_x = bx1 - bx0;
        s2_y = by1 - by0;

        var s, t;
        s = (-s1_y * (ax0 - bx0) + s1_x * (ay0 - by0)) / (-s2_x * s1_y + s1_x * s2_y);
        t = (s2_x * (ay0 - by0) - s2_y * (ax0 - bx0)) / (-s2_x * s1_y + s1_x * s2_y);

        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    }

    export function getDeepTransformTranslate(node: Element) {
        var translate = {x: 0, y: 0};
        var parent = node;
        var tr, attr;
        while (parent && parent.nodeName.toUpperCase() !== 'SVG') {
            attr = parent.getAttribute('transform');
            if (attr) {
                tr = parseTransformTranslate(attr);
                translate.x += tr.x;
                translate.y += tr.y;
            }
            parent = parent.parentNode as Element;
        }
        return translate;
    }

    export function raiseElements(
        container: d3.Selection<Element, any, Element, any>,
        selector: string,
        filter: (d) => boolean
    ) {
        const highlighted: d3.Selection<Element, any, Element, any> = <any>container
            .selectAll(selector)
            .filter(filter);
        if (highlighted.empty()) {
            return;
        }
        const untargeted = d3.select((<any>highlighted.node()).parentNode)
            .selectAll(selector)
            .filter((d) => !filter(d)).nodes();
        const lastUntargeted: Element = <any>untargeted[untargeted.length - 1];
        if (lastUntargeted) {
            const untargetedIndex = Array.prototype.indexOf.call(
                lastUntargeted.parentNode.childNodes,
                lastUntargeted);
            const nextSibling = lastUntargeted.nextSibling;
            highlighted.each(function (this: Element) {
                const index = Array.prototype.indexOf.call(this.parentNode.childNodes, this);
                if (index > untargetedIndex) {
                    return;
                }
                this.parentNode.insertBefore(this, nextSibling);
            });
        }
    }
