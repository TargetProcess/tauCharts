import {
    GrammarModel
} from '../../definitions';

var createFunc = (<T>(x: T) => (() => x));

export interface LayerLabelsModelObj {
    model?: GrammarModel;
    x?: (row, args?) => number;
    y?: (row, args?) => number;
    dx?: (row, args?) => number;
    dy?: (row, args?) => number;
    w?: (row, args?) => number;
    h?: (row, args?) => number;
    hide?: (row, args?) => boolean;
    label?: (row, args?) => string;
    labelLinesAndSeparator?: (row, args?) => {lines: string[], separator: string};
    color?: (row, args?) => string;
    angle?: (row, args?) => number;
}

export class LayerLabelsModel implements LayerLabelsModelObj {

    model: GrammarModel;
    x: (row, args?) => number;
    y: (row, args?) => number;
    dx: (row, args?) => number;
    dy: (row, args?) => number;
    w: (row, args?) => number;
    h: (row, args?) => number;
    hide: (row, args?) => boolean;
    label: (row, args?) => string;
    labelLinesAndSeparator: (row, args?) => {lines: string[], separator: string};
    color: (row, args?) => string;
    angle: (row, args?) => number;

    constructor(prev: LayerLabelsModelObj) {
        this.model = prev.model;
        this.x = prev.x || createFunc(0);
        this.y = prev.y || createFunc(0);
        this.dx = prev.dx || createFunc(0);
        this.dy = prev.dy || createFunc(0);
        this.w = prev.w || createFunc(0);
        this.h = prev.h || createFunc(0);
        this.hide = prev.hide || createFunc(false);
        this.label = prev.label || createFunc('');
        this.color = prev.color || createFunc('');
        this.angle = prev.angle || createFunc(0);
        this.labelLinesAndSeparator = prev.labelLinesAndSeparator || createFunc({lines: [], separator: ''});
    }

    static seed(model: GrammarModel, {
        fontColor, flip, formatter, labelRectSize, paddingKoeff = 0.5, lineBreakAvailable, lineBreakSeparator
    }) {
        var x = flip ? model.yi : model.xi;
        var y = flip ? model.xi : model.yi;

        var label = (row) => formatter(model.label(row));
        var labelLinesAndSeparator = (row) => lineBreakAvailable
            ? ({lines: label(row).split(lineBreakSeparator), separator: lineBreakSeparator})
            : ({lines: [label(row)], separator: lineBreakSeparator});

        return new LayerLabelsModel({
            model: model,
            x: (row) => x(row),
            y: (row) => y(row),
            dy: (row) => ((labelRectSize(labelLinesAndSeparator(row).lines).height) * paddingKoeff),
            w: (row) => (labelRectSize(labelLinesAndSeparator(row).lines).width),
            h: (row) => (labelRectSize(labelLinesAndSeparator(row).lines).height),
            label: label,
            labelLinesAndSeparator: labelLinesAndSeparator,
            color: (() => fontColor),
            angle: (() => 0)
        });
    }

    static compose(prev: LayerLabelsModelObj, updates: LayerLabelsModelObj = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new LayerLabelsModel(prev))));
    }
}
