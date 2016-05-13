export class CartesianModel {

    constructor(model) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX;
        this.scaleY = model.scaleY;
        this.yi = model.yi || createFunc(0);
        this.xi = model.xi || createFunc(0);
        this.sizeX = model.sizeX || createFunc(0);
        this.sizeY = model.sizeY || createFunc(0);
    }

    static compose(prev, updates = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new CartesianModel(prev))));
    }

    static decorator_size(model, {}) {
        var sx = model.scaleX;
        var sy = model.scaleY;
        return CartesianModel.compose(model, {
            xi: ((d) => (!d ? model.xi(d) : sx(d[sx.dim]))),
            yi: ((d) => (!d ? model.yi(d) : sy(d[sy.dim]))),
            sizeX: ((d) => (!d ? model.sizeX(d) : sx.stepSize(d[sx.dim]))),
            sizeY: ((d) => (!d ? model.sizeY(d) : sy.stepSize(d[sy.dim])))
        });
    }
}