import * as utilsDraw from '../../utils/utils-draw';
import {EdgeInfo} from './layer-labels';

export interface LabelPenaltyModel {
    i: number;
    x0: number;
    y0: number;
    x: number;
    y: number;
    w: number;
    h: number;
    size: number;
    hide: boolean;
    extr: string;
}

type LabelPenaltyFunction = (
    labels: LabelPenaltyModel[],
    edges: EdgeInfo[],
    penaltyRate?: number
) => (index: number) => number;

var intersect = (x1, x2, x3, x4, y1, y2, y3, y4) => utilsDraw.isIntersect(
    x1, y1,
    x2, y2,
    x3, y3,
    x4, y4
);

const _penalties: {[alias: string]: LabelPenaltyFunction} = {};

export class LayerLabelsPenalties {

    static reg(alias: string, funcPenalty: LabelPenaltyFunction) {
        _penalties[alias] = funcPenalty;
        return this;
    }

    static get(alias) {
        return _penalties[alias];
    }
}

LayerLabelsPenalties
    .reg('auto:avoid-label-label-overlap', (labels, edges, penaltyRate = 1.0) => {
        return (index) => {
            var x21 = labels[index].x;
            var y21 = labels[index].y - labels[index].h + 2.0;
            var x22 = labels[index].x + labels[index].w;
            var y22 = labels[index].y + 2.0;

            return labels.reduce((sum, labi, i) => {
                var k = Number(i !== index);
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
    })
    .reg('auto:avoid-label-anchor-overlap', (labels, edges, penaltyRate = 1.0) => {
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
    })
    .reg('auto:avoid-label-edges-overlap', (labels, edges, penaltyRate = 1.0) => {
        return (index) => {
            var label = labels[index];
            var x0 = label.x - label.w / 2;
            var x1 = label.x + label.w / 2;
            var y0 = label.y - label.h / 2;
            var y1 = label.y + label.h / 2;
            return edges.reduce((sum, edge) => {
                var overlapLeftTopRightBottom = intersect(x0, x1, edge.x0, edge.x1, y0, y1, edge.y0, edge.y1);
                var overlapLeftBottomRightTop = intersect(x0, x1, edge.x0, edge.x1, y1, y0, edge.y0, edge.y1);
                return sum + (Number(overlapLeftTopRightBottom) + Number(overlapLeftBottomRightTop)) * penaltyRate;
            }, 0);
        };
    });
