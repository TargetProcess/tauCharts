import {default as _} from 'underscore';
import {utilsDraw} from '../../utils/utils-draw';
import {utilsDom} from '../../utils/utils-dom';
import {LayerLabelsModel} from './layer-labels-model';
import {LayerLabelsRules} from './layer-labels-rules';
import {AnnealingSimulator} from './layer-labels-annealing-simulator';
import {FormatterRegistry} from '../../formatter-registry';

var intersect = (x1, x2, x3, x4, y1, y2, y3, y4) => utilsDraw.isIntersect(
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4
);

export class LayerLabels {

    constructor(model, isHorizontal, labelGuide, {width, height, container}) {
        this.container = container;
        this.w = width;
        this.h = height;
        var guide = _.defaults(
            (labelGuide || {}),
            {
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 'normal',
                fontSize: 10,
                fontColor: '#000',
                position: [],
                tickFormat: null,
                tickFormatNullAlias: ''
            });

        this.guide = guide;

        var formatter = FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias);

        var seed = LayerLabelsModel.seed(
            model,
            {
                fontSize: guide.fontSize,
                fontColor: guide.fontColor,
                flip: isHorizontal,
                formatter,
                labelRectSize: (str) => utilsDom.getLabelSize(str, guide),
                paddingKoeff: 0.4
            });

        var args = {maxWidth: width, maxHeight: height};

        var fixedPosition = guide
            .position
            .filter((token) => token.indexOf('auto:') === -1)
            .concat('keep-in-box');

        this.textModel = fixedPosition
            .map(LayerLabelsRules.getRule)
            .reduce((prev, rule) => LayerLabelsModel.compose(prev, rule(prev, args)), seed);
    }

    draw(fibers) {

        var self = this;
        var m = this.textModel;

        var readBy3 = (list, iterator) => {
            var l = list.length - 1;
            var r = [];
            for (var i = 0; i <= l; i++) {
                var iPrev = (i === 0) ? i : (i - 1);
                var iCurr = i;
                var iNext = (i === l) ? i : (i + 1);
                r.push(iterator(list[iPrev], list[iCurr], list[iNext]));
            }
            return r;
        };

        var parallel = fibers.reduce(
            (memo, f) => {
                var absFiber = f.map((row) => {
                    return {
                        data: row,
                        x: m.x(row) + m.dx(row),
                        y: m.y(row) + m.dy(row),
                        w: m.w(row),
                        h: m.h(row),
                        hide: m.hide(row),
                        extr: null,
                        size: m.model.size(row),
                        angle: m.angle(row),
                        label: m.label(row),
                        color: m.color(row)
                    };
                });
                memo.text = memo.text.concat(absFiber);
                memo.edges = memo.edges.concat(readBy3(absFiber, (prev, curr, next) => {

                    if (curr.y === Math.max(curr.y, prev.y, next.y)) {
                        curr.extr = 'min';
                    } else if (curr.y === Math.min(curr.y, prev.y, next.y)) {
                        curr.extr = 'max';
                    } else {
                        curr.extr = 'norm';
                    }

                    return {x0: prev.x, x1: curr.x, y0: prev.y, y1: curr.y};
                }));

                return memo;
            },
            {text: [], edges: []});

        parallel.text = parallel.text
            .filter((r) => r.label)
            .map((r, i) => _.extend(r, {i: i}));

        var tokens = this.guide.position.filter((token) => token.indexOf('auto:avoid') === 0);
        parallel = ((parallel.text.length > 0) && (tokens.length > 0)) ?
            this.autoPosition(parallel, tokens) :
            parallel;

        var flags = this.guide.position.reduce((memo, token) => _.extend(memo, {[token]:true}), {});

        parallel.text = flags['auto:hide-on-label-edges-overlap'] ?
            this.hideOnLabelEdgesOverlap(parallel.text, parallel.edges) :
            parallel.text;

        parallel.text = flags['auto:hide-on-label-label-overlap'] ?
            this.hideOnLabelLabelOverlap(parallel.text) :
            parallel.text;

        var labels = parallel.text;

        var get = ((prop) => ((__, i) => labels[i][prop]));

        var xi = get('x');
        var yi = get('y');
        var angle = get('angle');
        var color = get('color');
        var update = function () {
            this.style('fill', color)
                .style('font-size', self.guide.fontSize)
                .style('display', ((__, i) => labels[i].hide ? 'none' : null))
                .attr('text-anchor', 'middle')
                .attr('transform', (d, i) => `translate(${xi(d, i)},${yi(d, i)}) rotate(${angle(d, i)})`)
                .text(get('label'));
        };

        var text = this
            .container
            .selectAll('.i-role-label')
            .data(labels.map((r) => r.data));
        text.exit()
            .remove();
        text.call(update);
        text.enter()
            .append('text')
            .attr('class', 'i-role-label')
            .call(update);

        return text;
    }

    autoPosition(parallel, tokens) {

        var penalties = {
            'auto:avoid-label-label-overlap': (labels, edges, penaltyRate = 1.0) => {
                return (index) => {
                    var x21 = labels[index].x;
                    var y21 = labels[index].y - labels[index].h + 2.0;
                    var x22 = labels[index].x + labels[index].w;
                    var y22 = labels[index].y + 2.0;

                    return labels.reduce((sum, labi, i) => {
                        var k = (i !== index);
                        var x11 = labi.x;
                        var y11 = labi.y - labi.h + 2.0;
                        var x12 = labi.x + labi.w;
                        var y12 = labi.y + 2.0;
                        var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
                        var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
                        var overlap_area = x_overlap * y_overlap;
                        return sum + (k * (overlap_area * penaltyRate));
                    }, 0);
                };
            },
            'auto:avoid-label-anchor-overlap': (labels, edges, penaltyRate = 1.0) => {
                return (index) => {
                    var lab0 = labels[index];
                    var x21 = lab0.x - lab0.w / 2;
                    var x22 = lab0.x + lab0.w / 2;
                    var y21 = lab0.y - lab0.h / 2 + 2.0;
                    var y22 = lab0.y + lab0.h / 2 + 2.0;
                    return labels.reduce((sum, anchor) => {
                        var x11 = anchor.x0 - anchor.size / 2;
                        var x12 = anchor.x0 + anchor.size / 2;
                        var y11 = anchor.y0 - anchor.size / 2;
                        var y12 = anchor.y0 + anchor.size / 2;
                        var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
                        var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
                        var overlap_area = x_overlap * y_overlap;
                        return sum + (overlap_area * penaltyRate);
                    }, 0);
                };
            },
            'auto:avoid-label-edges-overlap': (labels, edges, penaltyRate = 1.0) => {
                return (index) => {
                    var label = labels[index];
                    var x0 = label.x - label.w / 2;
                    var x1 = label.x + label.w / 2;
                    var y0 = label.y - label.h / 2;
                    var y1 = label.y + label.h / 2;
                    return edges.reduce((sum, edge) => {
                        var overlapLeftTopRightBottom = intersect(x0, x1, edge.x0, edge.x1, y0, y1, edge.y0, edge.y1);
                        var overlapLeftBottomRightTop = intersect(x0, x1, edge.x0, edge.x1, y1, y0, edge.y0, edge.y1);
                        return sum + (overlapLeftTopRightBottom + overlapLeftBottomRightTop) * penaltyRate;
                    }, 0);
                };
            }
        };

        var edges = parallel.edges;
        var textData = parallel.text;

        var labels = textData
            .map((r) => {
                var a = 2 + (r.size + r.w) / 2;
                var b = 2 + (r.size + r.h) / 2;
                var m = {
                    max: -Math.PI / 2,
                    min: Math.PI / 2,
                    norm: (Math.random() > 0.5) ? Math.PI : 0
                };
                var angle = m[r.extr];
                return ({
                    i: r.i,
                    x0: r.x,
                    y0: r.y,
                    x: r.x + (a * Math.cos(angle)),
                    y: r.y + (b * Math.sin(angle)),
                    w: r.w,
                    h: r.h,
                    size: r.size,
                    hide: r.hide,
                    extr: r.extr
                });
            })
            .filter(r => !r.hide);

        var maxWidth = this.w;
        var maxHeight = this.h;

        var sim = new AnnealingSimulator({
            items: labels,
            transactor: function (row) {
                var prevX = row.x;
                var prevY = row.y;
                return {
                    modify: () => {
                        var a = 2 + (row.size + row.w) / 2;
                        var b = 2 + (row.size + row.h) / 2;
                        var m = {
                            max: -Math.PI,
                            min: Math.PI,
                            norm: Math.PI * 2
                        };
                        var n = 4;
                        var maxAngle = m[row.extr];
                        var angle = ((maxAngle / n) + (Math.random() * (maxAngle * (n - 2)) / n));

                        var nextX = row.x0 + (a * Math.cos(angle));
                        var nextY = row.y0 + (b * Math.sin(angle));

                        row.x = Math.min(Math.max(nextX, row.w / 2), (maxWidth - row.w / 2));
                        row.y = Math.max(Math.min(nextY, (maxHeight - row.h / 2)), row.h / 2);

                        return row;
                    },
                    revert: () => {
                        row.x = prevX;
                        row.y = prevY;
                        return row;
                    }
                };
            },
            penalties: tokens
                .map((token) => penalties[token])
                .filter(x => x)
                .map((penalty) => penalty(textData, edges))
        });

        sim.start(4);

        textData = labels.reduce((memo, l) => {
            var r = memo[l.i];
            r.x = l.x;
            r.y = l.y;
            return memo;
        }, textData);

        return parallel;
    }

    hideOnLabelEdgesOverlap(data, edges) {

        function penaltyLabelEdgesOverlap(label, edges) {
            var x0 = label.x - label.w / 2;
            var x1 = label.x + label.w / 2;

            var y0 = label.y - label.h / 2;
            var y1 = label.y + label.h / 2;
            return edges.reduce((sum, edge) => {
                var overlapTop = intersect(x0, x1, edge.x0, edge.x1, y0, y1, edge.y0, edge.y1);
                var overlapBtm = intersect(x0, x1, edge.x0, edge.x1, y1, y0, edge.y0, edge.y1);
                return sum + (overlapTop + overlapBtm) * 2;
            }, 0);
        }

        data.filter((r) => !r.hide)
            .forEach((r) => {
                if (penaltyLabelEdgesOverlap(r, edges) > 0) {
                    r.hide = true;
                }
            });

        return data;
    }

    hideOnLabelLabelOverlap(data) {

        var rect = (a) => {
            var border = 0;
            return {
                x0: a.x - a.w / 2 - border,
                x1: a.x + a.w / 2 + border,
                y0: a.y - a.h / 2 - border,
                y1: a.y + a.h / 2 + border
            };
        };

        var extremumOrder = {min: 0, max: 1, norm: 2};
        var collisionSolveStrategies = {
            'min/min': ((p0, p1) => p1.y - p0.y), // desc
            'max/max': ((p0, p1) => p0.y - p1.y), // asc
            'min/max': (() => -1), // choose min
            'min/norm': (() => -1), // choose min
            'max/norm': (() => -1), // choose max
            'norm/norm': ((p0, p1) => p0.y - p1.y) // asc
        };

        var cross = ((a, b) => {
            var ra = rect(a);
            var rb = rect(b);
            var k = (!a.hide && !b.hide);

            var x_overlap = k * Math.max(0, Math.min(rb.x1, ra.x1) - Math.max(ra.x0, rb.x0));
            var y_overlap = k * Math.max(0, Math.min(rb.y1, ra.y1) - Math.max(ra.y0, rb.y0));

            if ((x_overlap * y_overlap) > 0) {
                [a, b]
                    .sort((p0, p1) => extremumOrder[p0.extr] - extremumOrder[p1.extr])
                    .sort((p0, p1) => collisionSolveStrategies[`${p0.extr}/${p1.extr}`](p0, p1))
                    [1]
                    .hide = true;
            }
        });

        data.filter((r) => !r.hide)
            .sort((p0, p1) => {
                return extremumOrder[p0.extr] - extremumOrder[p1.extr];
            })
            .forEach((a) => {
                data.forEach((b) => {
                    if (a.i !== b.i) {
                        cross(a, b);
                    }
                });
            });

        return data;
    }
}