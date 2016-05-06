export class PathModel {

    constructor(model = {}) {
        var createFunc = ((x) => (() => x));
        this.scaleX = model.scaleX || null;
        this.scaleY = model.scaleY || null;
        this.scaleSize = model.scaleSize || null;
        this.scaleColor = model.scaleColor || null;
        this.scaleSplit = model.scaleSplit || null;

        this.yi = model.yi || createFunc(0);
        this.xi = model.xi || createFunc(0);

        this.y0 = model.y0 || createFunc(0);

        this.size = model.size || createFunc(1);
        this.color = model.color || createFunc('');
        this.group = model.group || createFunc('');
        this.order = model.order || createFunc(0);
    }

    static compose(prev, updates = {}) {
        return (Object
            .keys(updates)
            .reduce((memo, propName) => {
                memo[propName] = updates[propName];
                return memo;
            },
            (new PathModel(prev))));
    }

    static decorator_identity(model) {
        return PathModel.compose(model);
    }

    static decorator_orientation(model, {isHorizontal = false}) {

        var baseScale = (isHorizontal ? model.scaleY : model.scaleX);
        var valsScale = (isHorizontal ? model.scaleX : model.scaleY);

        return PathModel.compose(model, {
            scaleX: baseScale,
            scaleY: valsScale,
            xi: ((d) => (baseScale.value(d[baseScale.dim]))),
            yi: ((d) => (valsScale.value(d[valsScale.dim]))),
            y0: ((d) => (valsScale.value(d[valsScale.dim])))
        });
    }

    static decorator_size(model, {}) {
        return PathModel.compose(model, {
            size: ((d) => (model.scaleSize.value(d[model.scaleSize.dim])))
        });
    }

    static decorator_color(model, {}) {
        return PathModel.compose(model, {
            color: ((d) => model.scaleColor.value(d[model.scaleColor.dim]))
        });
    }

    static decorator_group(model, {}) {
        return PathModel.compose(model, {
            group: ((d) => (`${d[model.scaleColor.dim]}_${d[model.scaleSplit.dim]}`))
        });
    }

    static decorator_groupOrderByAvg(model, {dataSource}) {

        var avg = (arr) => {
            return arr.map(model.yi).reduce(((sum, i) => (sum + i)), 0) / arr.length;
        };

        var groups = dataSource.reduce((memo, row) => {
            var k = model.group(row);
            memo[k] = memo[k] || [];
            memo[k].push(row);
            return memo;
        }, {});

        var order = Object
            .keys(groups)
            .map((k) => ([k, avg(groups[k])]))
            .sort((a, b) => (a[1] - b[1]))
            .map((r) => r[0]);

        return PathModel.compose(model, {
            order: ((group) => {
                var i = order.indexOf(group);
                return ((i < 0) ? Number.MAX_VALUE : i);
            })
        });
    }

    static decorator_groundY0(model, {}) {
        var ys = model.scaleY.domain();
        var min = ys[0];
        var max = ys[ys.length - 1];
        // NOTE: max also can be below 0
        var base = model.scaleY.discrete ?
            (min) :
            ((min < 0) ? (Math.min(0, max)) : (min));

        var y0 = model.scaleY.value(base);

        return PathModel.compose(model, {
            y0: (() => y0)
        });
    }

    static adjustSizeScale(model, {minLimit, maxLimit, defMin, defMax}) {

        var curr = {
            minSize: (typeof (minLimit) === 'number') ? minLimit : defMin,
            maxSize: (typeof (maxLimit) === 'number') ? maxLimit : defMax
        };

        model.scaleSize.fixup((prev) => {

            var next = {};

            if (!prev.fixed) {
                next.fixed = true;
                next.minSize = curr.minSize;
                next.maxSize = curr.maxSize;
            }

            return next;
        });

        return model;
    }
}