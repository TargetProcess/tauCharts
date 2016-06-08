var createFunc = ((x) => (() => x));

export class LayerLabelsModel {

    constructor(prev) {
        this.model = prev.model;
        this.x = prev.x || createFunc(0);
        this.y = prev.y || createFunc(0);
        this.w = prev.w || createFunc(0);
        this.h = prev.h || createFunc(0);
        this.hide = prev.hide || createFunc(false);
        this.label = prev.label || createFunc('');
        this.color = prev.color || createFunc('');
    }

    static seed(model, {fontColor, flip, formatter, labelRectSize, paddingKoeff = 0.5}) {

        var x = flip ? model.yi : model.xi;
        var y = flip ? model.xi : model.yi;

        var label = (row) => formatter(model.label(row));

        return new LayerLabelsModel({
            model: model,
            x: (row) => x(row),
            y: (row) => y(row) + ((labelRectSize(label(row)).height) * paddingKoeff),
            w: (row) => (labelRectSize(label(row)).width),
            h: (row) => (labelRectSize(label(row)).height),
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