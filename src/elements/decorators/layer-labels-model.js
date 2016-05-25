var createFunc = ((x) => (() => x));

export class LayerLabelsModel {

    constructor(prev) {
        this.model = prev.model;
        this.x = prev.x || createFunc(0);
        this.y = prev.y || createFunc(0);
        this.w = prev.w || createFunc(0);
        this.h = prev.h || createFunc(0);
        this.label = prev.label || createFunc('');
        this.color = prev.color || createFunc('');
    }

    static seed(model, {fontSize, fontColor, flip, formatter, textSize, textPad = 1.5}) {

        var fnTextSize = textSize || ((str) => str.length * fontSize * 0.6);

        var x = flip ? model.yi : model.xi;
        var y = flip ? model.xi : model.yi;

        var label = (row) => formatter(model.label(row));

        return new LayerLabelsModel({
            model: model,
            x: (row) => x(row),
            y: (row) => y(row) + (fontSize / 2) - textPad,
            w: (row) => fnTextSize(label(row)),
            h: () => fontSize,
            label: label,
            color: () => fontColor
        });
    }

    static compose(prev, updates = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new LayerLabelsModel(prev))));
    }
}