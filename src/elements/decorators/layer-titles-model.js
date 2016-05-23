var createFunc = ((x) => (() => x));

export class LayerTitlesModel {

    constructor(prev) {
        this.model = prev.model;
        this.x = prev.x || createFunc(0);
        this.y = prev.y || createFunc(0);
        this.w = prev.w || createFunc(0);
        this.h = prev.h || createFunc(0);
        this.text = prev.text || createFunc('');
        this.color = prev.color || createFunc('');
    }

    static seed(model, {fontSize, fontColor, flip, formatter}) {
        var charSize = fontSize / 1.7;

        var x = flip ? model.yi : model.xi;
        var y = flip ? model.xi : model.yi;

        var text = (row) => formatter(model.text(row));

        return new LayerTitlesModel({
            model: model,
            x: (row) => x(row),
            y: (row) => y(row) + (fontSize / 2) - 1.5,
            w: (row) => text(row).length * charSize,
            h: () => fontSize,
            text: text,
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
            (new LayerTitlesModel(prev))));
    }
}