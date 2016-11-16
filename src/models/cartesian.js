export class CartesianModel {

    static decorator_size(model, {}) {
        var sx = model.scaleX;
        var sy = model.scaleY;
        return {
            xi: ((d) => (!d ? model.xi(d) : sx(d[sx.dim]))),
            yi: ((d) => (!d ? model.yi(d) : sy(d[sy.dim]))),
            sizeX: ((d) => (!d ? model.sizeX(d) : sx.stepSize(d[sx.dim]))),
            sizeY: ((d) => (!d ? model.sizeY(d) : sy.stepSize(d[sy.dim])))
        };
    }
}