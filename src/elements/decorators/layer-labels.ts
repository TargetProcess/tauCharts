import * as utilsDraw from '../../utils/utils-draw';
import * as utilsDom from '../../utils/utils-dom';
import * as utils from '../../utils/utils';
import {LayerLabelsModel} from './layer-labels-model';
import {LayerLabelsRules} from './layer-labels-rules';
import {AnnealingSimulator} from './layer-labels-annealing-simulator';
import {LayerLabelsPenalties, LabelPenaltyModel} from './layer-labels-penalties';
import {FormatterRegistry} from '../../formatter-registry';
import * as d3SelectionJs from 'd3-selection';

import {
    d3Selection,
    GrammarModel,
    ScaleGuide
} from '../../definitions';

export interface TextInfo {
    data;
    x: number;
    y: number;
    w: number;
    h: number;
    hide: boolean;
    extr: string;
    size: number;
    angle: number;
    label: string;
    color: string;
    i?: number;
}

export interface EdgeInfo {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

interface Parallel {
    text: TextInfo[];
    edges: EdgeInfo[];
}

var intersect = (x1, x2, x3, x4, y1, y2, y3, y4) => utilsDraw.isIntersect(
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4
);

export class LayerLabels {

    container: d3Selection;
    model: GrammarModel;
    flip: boolean;
    w: number;
    h: number;
    guide: ScaleGuide;

    constructor(
        model: GrammarModel,
        isHorizontal: boolean,
        labelGuide: ScaleGuide,
        {width, height, container}: {width?: number, height?: number, container?: d3Selection}
    ) {
        this.container = container;
        this.model = model;
        this.flip = isHorizontal;
        this.w = width;
        this.h = height;
        this.guide = utils.defaults(
            (labelGuide || {}),
            {
                fontFamily: 'Helvetica Neue, Segoe UI, Open Sans, Ubuntu, sans-serif',
                fontWeight: 'normal',
                fontSize: 10,
                fontColor: '#000',
                hideEqualLabels: false,
                wordBreak: false,
                wordBreakSeparator: '',
                position: [],
                tickFormat: null,
                tickFormatNullAlias: ''
            });
    }

    draw(fibers: any[][]) {

        var self = this;

        var model = this.model;
        var guide = this.guide;
        var wordBreakAvailable = guide.wordBreak;
        var wordBreakSeparator = guide.wordBreakSeparator;

        var seed = LayerLabelsModel.seed(
            model,
            {
                // fontSize: guide.fontSize,
                fontColor: guide.fontColor,
                flip: self.flip,
                formatter: FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias),
                labelRectSize: (lines) => utilsDom.getLabelSize(lines, guide),
                wordBreakAvailable: wordBreakAvailable,
                wordBreakSeparator: wordBreakSeparator
            });

        var args = {maxWidth: self.w, maxHeight: self.h, data: fibers.reduce((memo, f) => memo.concat(f), [])};

        var fixedPosition = guide
            .position
            .filter((token) => token.indexOf('auto:') === -1);

        if (wordBreakAvailable) {
            fixedPosition.push('multiline-label-left-align');
        }

        var m = fixedPosition
            .map(LayerLabelsRules.getRule)
            .reduce((prev, rule) => LayerLabelsModel.compose(prev, rule(prev, args)), seed);

        var readBy3 = <T, K>(list: T[], iterator: (a: T, b: T, c: T) => K) => {
            var l = list.length - 1;
            var r: K[] = [];
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
                        h: m.h(row, args),
                        hide: m.hide(row),
                        extr: null,
                        size: m.model.size(row),
                        angle: m.angle(row),
                        label: m.label(row),
                        labelLinesAndSeparator: m.labelLinesAndSeparator(row),
                        color: m.color(row),
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
            <Parallel>{text: [], edges: []});

        parallel.text = parallel.text
            .filter((r) => r.label)
            .map((r, i) => Object.assign(r, {i: i}));

        var tokens = this.guide.position.filter((token) => token.indexOf('auto:avoid') === 0);
        parallel = ((parallel.text.length > 0) && (tokens.length > 0)) ?
            this.autoPosition(parallel, tokens) :
            parallel;

        var flags = this.guide.position.reduce((memo, token) => Object.assign(memo, {[token]:true}), {});

        parallel.text = parallel.text = flags['auto:adjust-on-label-overflow'] ?
            this.adjustOnOverflow(parallel.text, args) :
            parallel.text;

        parallel.text = flags['auto:hide-on-label-edges-overlap'] ?
            this.hideOnLabelEdgesOverlap(parallel.text, parallel.edges) :
            parallel.text;

        parallel.text = flags['auto:hide-on-label-label-overlap'] ?
            this.hideOnLabelLabelOverlap(parallel.text) :
            parallel.text;

        parallel.text = flags['auto:hide-on-label-anchor-overlap'] ?
            this.hideOnLabelAnchorOverlap(parallel.text) :
            parallel.text;

        var labels = parallel.text;

        var get = ((prop) => ((__, i) => labels[i][prop]));

        var xi = get('x');
        var yi = get('y');
        var angle = get('angle');
        var color = get('color');
        var label = get('label');
        var update = function (elements: d3Selection) {
            elements
                .style('fill', color)
                .style('font-size', `${self.guide.fontSize}px`)
                .style('display', ((__, i) => labels[i].hide ? 'none' : null))
                .attr('class', 'i-role-label')
                .attr('text-anchor', 'middle')
                .attr('transform', (d, i) => `translate(${xi(d, i)},${yi(d, i)}) rotate(${angle(d, i)})`);

            if (wordBreakAvailable) {
                elements.each(function (d, i) {
                    var d3Label = d3SelectionJs.select(this);

                    d3Label.text(null);

                    label(d, i)
                        .split(wordBreakSeparator)
                        .forEach(function (word, index) {
                            d3Label
                                .append('tspan')
                                .attr('text-anchor', 'start')
                                .attr('x', 0)
                                .attr('y', 0)
                                .attr('dy', (index + 1) * 1.2 + 'em')
                                .text(word);
                        });
                });
            } else {
                elements.text(label);
            }
        };

        if (guide.hideEqualLabels) {
            labels
                .filter((d) => !d.hide)
                .filter((d, i, visibleLabels) => (
                    (i < visibleLabels.length - 1) &&
                    (d.label === visibleLabels[i + 1].label)
                ))
                .forEach((d) => d.hide = true);
        }

        var text = this
            .container
            .selectAll('.i-role-label')
            .data(labels.map((r) => r.data));
        text.exit()
            .remove();
        text.call(update);
        text.enter()
            .append('text')
            .call(update);

        return text as d3Selection;
    }

    autoPosition(parallel: Parallel, tokens: string[]) {

        const calcEllipticXY = (r, angle) => {
            const xReserve = 4;
            const yReserve = 2;
            const a = xReserve + (r.size + r.w) / 2;
            const b = yReserve + (r.size + r.h) / 2;
            return {
                x: (a * Math.cos(angle)),
                y: (b * Math.sin(angle))
            };
        };

        var edges = parallel.edges;
        var labels = parallel.text
            .map((r) => {
                const maxAngles = {
                    max: -Math.PI / 2,
                    min: Math.PI / 2,
                    norm: (Math.random() * Math.PI * 2)
                };
                const xy = calcEllipticXY(r, maxAngles[r.extr]);
                return <LabelPenaltyModel>{
                    i: r.i,
                    x0: r.x,
                    y0: r.y,
                    x: r.x + xy.x,
                    y: r.y + xy.y,
                    w: r.w,
                    h: r.h,
                    size: r.size,
                    hide: r.hide,
                    extr: r.extr
                };
            })
            .filter(r => !r.hide);

        var sim = new AnnealingSimulator({
            items: labels,
            transactor: (row) => {
                const prevX = row.x;
                const prevY = row.y;
                return {
                    modify: () => {
                        const maxAngles = {
                            max: -Math.PI,
                            min: Math.PI,
                            norm: Math.PI * 2
                        };
                        const segm = 4;
                        const maxAngle = maxAngles[row.extr];
                        const angle = ((maxAngle / segm) + (Math.random() * (maxAngle * (segm - 2)) / segm));
                        const xy = calcEllipticXY(row, angle);

                        row.x = row.x0 + xy.x;
                        row.y = row.y0 + xy.y;

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
                .map((token) => LayerLabelsPenalties.get(token))
                .filter(x => x)
                .map((penalty) => penalty(labels, edges))
        });

        const bestRevision = sim.start(5);

        parallel.text = bestRevision.reduce((memo, l) => {
            var r = memo[l.i];
            r.x = l.x;
            r.y = l.y;
            return memo;
        }, parallel.text);

        return parallel;
    }

    hideOnLabelEdgesOverlap(data: TextInfo[], edges: EdgeInfo[]) {

        const penaltyLabelEdgesOverlap = (label: TextInfo, edges: EdgeInfo[]) => {
            const rect = this.getLabelRect(label);
            return edges.reduce((sum, edge) => {
                var overlapTop = intersect(rect.x0, rect.x1, edge.x0, edge.x1, rect.y0, rect.y1, edge.y0, edge.y1);
                var overlapBtm = intersect(rect.x0, rect.x1, edge.x0, edge.x1, rect.y1, rect.y0, edge.y0, edge.y1);
                return sum + (Number(overlapTop) + Number(overlapBtm)) * 2;
            }, 0);
        };

        data.filter((r) => !r.hide)
            .forEach((r) => {
                if (penaltyLabelEdgesOverlap(r, edges) > 0) {
                    r.hide = true;
                }
            });

        return data;
    }

    hideOnLabelLabelOverlap(data: TextInfo[]) {

        var extremumOrder = {min: 0, max: 1, norm: 2};
        var collisionSolveStrategies = {
            'min/min': ((p0, p1) => p1.y - p0.y), // desc
            'max/max': ((p0, p1) => p0.y - p1.y), // asc
            'min/max': (() => -1), // choose min
            'min/norm': (() => -1), // choose min
            'max/norm': (() => -1), // choose max
            'norm/norm': ((p0, p1) => p0.y - p1.y) // asc
        };

        var cross = ((a: TextInfo, b: TextInfo) => {
            var ra = this.getLabelRect(a);
            var rb = this.getLabelRect(b);
            var k = Number(!a.hide && !b.hide);

            var x_overlap = k * Math.max(0, Math.min(rb.x1, ra.x1) - Math.max(ra.x0, rb.x0));
            var y_overlap = k * Math.max(0, Math.min(rb.y1, ra.y1) - Math.max(ra.y0, rb.y0));

            if ((x_overlap * y_overlap) > 0) {
                let p = [a, b];
                p.sort((p0, p1) => extremumOrder[p0.extr] - extremumOrder[p1.extr]);
                let r = (collisionSolveStrategies[`${p[0].extr}/${p[1].extr}`](p[0], p[1]) < 0 ?
                    p[0] :
                    p[1]
                );
                r.hide = true;
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

    getLabelRect(a: TextInfo, border = 0) {
        return {
            x0: a.x - a.w / 2 - border,
            x1: a.x + a.w / 2 + border,
            y0: a.y - a.h / 2 - border,
            y1: a.y + a.h / 2 + border
        };
    }

    getPointRect(a: TextInfo, border = 0) {
        return {
            x0: a.x - a.size / 2 - border,
            x1: a.x + a.size / 2 + border,
            y0: a.y - a.size / 2 - border,
            y1: a.y + a.size / 2 + border
        };
    }

    hideOnLabelAnchorOverlap(data: TextInfo[]) {

        var isIntersects = ((label, point) => {
            const labelRect = this.getLabelRect(label, 2);
            const pointRect = this.getPointRect(point, 2);

            var x_overlap = Math.max(
                0,
                Math.min(pointRect.x1, labelRect.x1) - Math.max(pointRect.x0, labelRect.x0));

            var y_overlap = Math.max(
                0,
                Math.min(pointRect.y1, labelRect.y1) - Math.max(pointRect.y0, labelRect.y0));

            return (x_overlap * y_overlap) > 0.001;
        });

        data.filter((row) => !row.hide)
            .forEach((label) => {
                const dataLength = data.length;
                for (let i = 0; i < dataLength; i++) {
                    const point = data[i];
                    if ((label.i !== point.i) && isIntersects(label, point)) {
                        label.hide = true;
                        break;
                    }
                }
            });

        return data;
    }

    adjustOnOverflow(data: TextInfo[], {maxWidth, maxHeight}) {
        return data.map((row) => {
            if (!row.hide) {
                row.x = Math.min(Math.max(row.x, row.w / 2), (maxWidth - row.w / 2));
                row.y = Math.max(Math.min(row.y, (maxHeight - row.h / 2)), row.h / 2);
            }
            return row;
        });
    }
}
