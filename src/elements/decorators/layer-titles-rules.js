var rules = {};

export class LayerTitlesRules {

    static regRule(alias, func) {
        rules[alias] = func;
        return this;
    }

    static getRule(alias) {
        return rules[alias];
    }
}

var isPositive = (scale, row) => scale.discrete || (!scale.discrete && row[scale.dim] >= 0);
var isNegative = (scale, row) => !scale.discrete && row[scale.dim] < 0;
var alignByX = (exp) => {
    return (prev) => {
        return {
            x: (row) => {

                var ordinateScale = prev.model.scaleY;

                if ((exp[2] === '+') && !isPositive(ordinateScale, row)) {
                    return prev.x(row);
                }

                if ((exp[2] === '-') && !isNegative(ordinateScale, row)) {
                    return prev.x(row);
                }

                var k = (exp[1]);
                var u = (exp[0] === exp[0].toUpperCase()) ? 1 : 0;

                return prev.x(row) + (k * (prev.w(row) / 2)) + (k * u * prev.model.size(row) / 2);
            }
        };
    };
};

var alignByY = (exp) => {
    return (prev) => {
        return {
            y: (row) => {

                var ordinateScale = prev.model.scaleY;

                if ((exp[2] === '+') && !isPositive(ordinateScale, row)) {
                    return prev.y(row);
                }

                if ((exp[2] === '-') && !isNegative(ordinateScale, row)) {
                    return prev.y(row);
                }

                var k = (exp[1]);
                var u = (exp[0] === exp[0].toUpperCase()) ? 1 : 0;

                return prev.y(row) + (k * (prev.h(row) / 2)) + (k * u * prev.model.size(row) / 2);
            }
        };
    };
};

LayerTitlesRules
    .regRule('l', alignByX(['l', -1, null]))
    .regRule('L', alignByX(['L', -1, null]))
    .regRule('l+', alignByX(['l', -1, '+']))
    .regRule('l-', alignByX(['l', -1, '-']))
    .regRule('L+', alignByX(['L', -1, '+']))
    .regRule('L-', alignByX(['L', -1, '-']))

    .regRule('r', alignByX(['r', 1, null]))
    .regRule('R', alignByX(['R', 1, null]))
    .regRule('r+', alignByX(['r', 1, '+']))
    .regRule('r-', alignByX(['r', 1, '-']))
    .regRule('R+', alignByX(['R', 1, '+']))
    .regRule('R-', alignByX(['R', 1, '-']))

    .regRule('t', alignByY(['t', -1, null]))
    .regRule('T', alignByY(['T', -1, null]))
    .regRule('t+', alignByY(['t', -1, '+']))
    .regRule('t-', alignByY(['t', -1, '-']))
    .regRule('T+', alignByY(['T', -1, '+']))
    .regRule('T-', alignByY(['T', -1, '-']))

    .regRule('b', alignByY(['b', 1, null]))
    .regRule('B', alignByY(['B', 1, null]))
    .regRule('b+', alignByY(['b', 1, '+']))
    .regRule('b-', alignByY(['b', 1, '-']))
    .regRule('B+', alignByY(['B', 1, '+']))
    .regRule('B-', alignByY(['B', 1, '-']))

    .regRule('keep-within-diameter-or-top', (prev) => {
        return {
            y: (row) => {

                if ((prev.model.size(row) / prev.w(row)) < 1) {
                    return (prev.y(row) - (prev.h(row) / 2) - (prev.model.size(row) / 2));
                }

                return prev.y(row);
            }
        };
    })

    .regRule('keep-in-box', (prev, {maxWidth, maxHeight}) => {
        return {
            x: (row) => {
                var x = prev.x(row);
                var w = prev.w(row);
                var l = x - w / 2;
                var r = x + w / 2;

                var dl = 0 - l;
                if (dl > 0) {
                    return 0;
                }

                var dr = r - maxWidth;
                if (dr > 0) {
                    return x - dr;
                }

                return x;
            },
            y: (row) => {
                var y = prev.y(row);
                var h = prev.h(row);
                var t = y - h / 2;
                var b = y + h / 2;

                var dt = 0 - t;
                if (dt > 0) {
                    return 0;
                }

                var db = b - maxHeight;
                if (db > 0) {
                    return y - db;
                }

                return y;
            }
        };
    });