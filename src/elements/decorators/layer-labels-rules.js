var rules = {};

export class LayerLabelsRules {

    static regRule(alias, func) {
        rules[alias] = func;
        return this;
    }

    static getRule(alias) {
        return rules[alias];
    }
}

const findCutIndex = (text, labelWidth, availableSpace) => {
    return ((availableSpace < labelWidth) ?
        (Math.max(1, Math.floor(availableSpace * text.length / labelWidth)) - 1) :
        (text.length));
};

const cutString = (str, index) => ((index === 0) ? '' : str.slice(0, index).replace(/\.+$/g, '') + '\u2026');

var isPositive = (scale, row) => scale.discrete || (!scale.discrete && row[scale.dim] >= 0);
var isNegative = (scale, row) => !scale.discrete && row[scale.dim] < 0;
var alignByX = (exp) => {
    return (prev) => {
        return {
            dx: (row) => {

                var ordinateScale = prev.model.scaleY;

                if ((exp[2] === '+') && !isPositive(ordinateScale, row)) {
                    return prev.dx(row);
                }

                if ((exp[2] === '-') && !isNegative(ordinateScale, row)) {
                    return prev.dx(row);
                }

                var k = (exp[1]);
                var u = (exp[0] === exp[0].toUpperCase()) ? 1 : 0;

                return prev.dx(row) + (k * (prev.w(row) / 2)) + (k * u * prev.model.size(row) / 2) + k * 2;
            }
        };
    };
};

var alignByY = (exp) => {
    return (prev) => {
        return {
            dy: (row) => {

                var ordinateScale = prev.model.scaleY;

                if ((exp[2] === '+') && !isPositive(ordinateScale, row)) {
                    return prev.dy(row);
                }

                if ((exp[2] === '-') && !isNegative(ordinateScale, row)) {
                    return prev.dy(row);
                }

                var k = (exp[1]);
                var u = (exp[0] === exp[0].toUpperCase()) ? 1 : 0;

                return prev.dy(row) + (k * (prev.h(row) / 2)) + (k * u * prev.model.size(row) / 2) + k * 2;
            }
        };
    };
};

LayerLabelsRules
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

    .regRule('rotate-on-size-overflow', (prev, {data}) => {

        var out = ((row) => prev.model.size(row) < prev.w(row));
        var overflowCount = data.reduce((memo, row) => (memo + (out(row) ? 1 : 0)), 0);

        var isRot = ((overflowCount / data.length) > 0.5);

        var changes = {};
        if (isRot) {
            var padKoeff = 0.5;
            changes = {
                angle: () => -90,
                w: (row) => prev.h(row),
                h: (row) => prev.w(row),
                dx: (row) => (prev.h(row) * padKoeff - 2),
                dy: () => 0
            };
        }

        return changes;
    })

    .regRule('hide-by-label-height-vertical', (prev) => {

        return {

            hide: (row) => {

                let availableSpace;
                let requiredSpace;
                if (prev.angle(row) === 0) {
                    requiredSpace = prev.h(row);
                    availableSpace = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                } else {
                    requiredSpace = prev.w(row);
                    availableSpace = prev.model.size(row);
                }

                if (requiredSpace > availableSpace) {
                    return true;
                }

                return prev.hide(row);
            }
        };
    })

    .regRule('cut-label-vertical', (prev) => {

        return {

            h: (row) => {
                const reserved = prev.h(row);
                if (Math.abs(prev.angle(row)) > 0) {
                    const text = prev.label(row);
                    const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                    const index = findCutIndex(text, reserved, available);
                    return ((index < text.length) ? available : reserved);
                }

                return reserved;
            },

            w: (row) => {
                const reserved = prev.w(row);
                if (prev.angle(row) === 0) {
                    const text = prev.label(row);
                    const available = prev.model.size(row);
                    const index = findCutIndex(text, reserved, available);
                    return ((index < text.length) ? available : reserved);
                }

                return reserved;
            },

            label: (row) => {
                let reserved;
                let available;
                if (prev.angle(row) === 0) {
                    reserved = prev.w(row);
                    available = prev.model.size(row);
                } else {
                    reserved = prev.h(row);
                    available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                }

                const text = prev.label(row);
                const index = findCutIndex(text, reserved, available);

                return ((index < text.length) ? cutString(text, index) : text);
            },

            dy: (row) => {
                const prevDy = prev.dy(row);

                if (prev.angle(row) !== 0) {
                    const reserved = prev.h(row);
                    const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                    const text = prev.label(row);
                    const index = findCutIndex(text, reserved, available);

                    return ((index < text.length) ?
                            (available * prevDy / reserved) :
                            (prevDy)
                    );
                }

                return prevDy;
            }
        };
    })

    .regRule('hide-by-label-height-horizontal', (prev) => {

        return {

            hide: (row) => {

                if (prev.model.size(row) < prev.h(row)) {
                    return true;
                }

                return prev.hide(row);
            }
        };
    })

    .regRule('cut-label-horizontal', (prev) => {

        return {

            dx: (row) => {
                const text = prev.label(row);
                const required = prev.w(row);
                const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                const index = findCutIndex(text, required, available);
                const prevDx = prev.dx(row);
                return ((index < text.length) ? (available * prevDx / required) : (prevDx));
            },

            w: (row) => {
                const text = prev.label(row);
                const required = prev.w(row);
                const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                const index = findCutIndex(text, required, available);
                return ((index < text.length) ? available : required);
            },

            label: (row) => {
                const text = prev.label(row);
                const required = prev.w(row);
                const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                const index = findCutIndex(text, required, available);
                return ((index < text.length) ?
                        (cutString(text, index)) :
                        (text)
                );
            }
        };
    })

    .regRule('keep-within-diameter-or-top', (prev) => {
        return {
            dy: (row) => {

                if ((prev.model.size(row) / prev.w(row)) < 1) {
                    return (prev.dy(row) - (prev.h(row) / 2) - (prev.model.size(row) / 2));
                }

                return prev.dy(row);
            }
        };
    })

    .regRule('keep-in-box', (prev, {maxWidth, maxHeight}) => {
        return {
            dx: (row) => {
                var dx = prev.dx(row);
                var x = prev.x(row) + dx;
                var w = prev.w(row);
                var l = x - w / 2;
                var r = x + w / 2;

                var dl = 0 - l;
                if (dl > 0) {
                    return dx + dl;
                }

                var dr = r - maxWidth;
                if (dr > 0) {
                    return dx - dr;
                }

                return dx;
            },
            dy: (row) => {
                var dy = prev.dy(row);
                var y = prev.y(row) + dy;
                var h = prev.h(row);
                var t = y - h / 2;
                var b = y + h / 2;

                var dt = 0 - t;
                if (dt > 0) {
                    return 0;
                }

                var db = b - maxHeight;
                if (db > 0) {
                    return dy - db;
                }

                return dy;
            }
        };
    });