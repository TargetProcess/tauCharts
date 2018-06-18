import {LayerLabelsModel, LayerLabelsModelObj} from './layer-labels-model';
import {ScaleFunction} from '../../definitions';
import {hasXOverflow, hasYOverflow} from '../../utils/utils';
var rules: {[alias: string]: LabelRule} = {};

type LabelRule = (prev?: LayerLabelsModelObj, args?) => LayerLabelsModelObj;

export class LayerLabelsRules {

    static regRule(alias: string, func: LabelRule) {
        rules[alias] = func;
        return this;
    }

    static getRule(alias: string) {
        return rules[alias];
    }
}

const findCutIndex = (text: string, labelWidth: number, availableSpace: number) => {
    return ((availableSpace < labelWidth) ?
        (Math.max(1, Math.floor(availableSpace * text.length / labelWidth)) - 1) :
        (text.length));
};

const cutString = (str: string, index: number) => ((index === 0) ?
    '' :
    str.slice(0, index).replace(/\.+$/g, '') + '\u2026');

const cutLines = ({lines, linesWidths, separator}, availableSpace: number) => {
    return lines
        .map(function (line, lineIndex) {
            const index = findCutIndex(line, linesWidths[lineIndex], availableSpace);
            return ((index < line.length) ? cutString(line, index) : line);
        })
        .join(separator);
};

var getPadDivider = (prev, row): number => {
    var labelInfo = prev.labelLinesAndSeparator(row);
    var pad = 5 - (labelInfo.lines.length - 1);
    return pad < 1 ? 1 : pad;
};
var isPositive = (scale, row) => scale.discrete || (!scale.discrete && row[scale.dim] >= 0);
var isNegative = (scale, row) => !scale.discrete && row[scale.dim] < 0;
var getXPad = (prev, row) => ((prev.w(row) / 2) + Math.floor(prev.model.size(row) / getPadDivider(prev, row)));
var getYPad = (prev, row) => ((prev.h(row) / 2) + Math.floor(prev.model.size(row) / getPadDivider(prev, row)));
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

                return prev.dx(row) + (k * u * prev.model.size(row) / 2) + (k * getXPad(prev, row));
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

                return prev.dy(row) + (k * u * prev.model.size(row) / 2) + (k * getYPad(prev, row));
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

    .regRule('rotate-on-size-overflow', (prev, {data, lineBreakAvailable}) => {

        var out = ((row) => prev.model.size(row) < prev.w(row));
        var overflowCount = data.reduce((memo, row) => (memo + (out(row) ? 1 : 0)), 0);

        var isRot = ((overflowCount / data.length) > 0.5);

        var changes = {};
        if (isRot) {
            var padKoeff = lineBreakAvailable ? -0.5 : 0.5;
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
                    const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                    return ((available < reserved) ? available : reserved);
                }

                return reserved;
            },

            w: (row) => {
                const reserved = prev.w(row);
                if (prev.angle(row) === 0) {
                    const available = prev.model.size(row);
                    return ((available < reserved) ? available : reserved);
                }

                return reserved;
            },

            label: (row) => {
                let available;

                if (prev.angle(row) === 0) {
                    available = prev.model.size(row);
                } else {
                    available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                }

                return cutLines(prev.labelLinesAndSeparator(row), available);
            },

            dy: (row) => {
                const prevDy = prev.dy(row);

                if (prev.angle(row) !== 0) {
                    const reserved = prev.h(row);
                    const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));

                    return ((available < reserved) ?
                            (available * prevDy / reserved) :
                            (prevDy)
                    );
                }

                return prevDy;
            }
        };
    })

    .regRule('cut-outer-label-vertical', (prev) => {

        return {

            h: (row, args) => {
                const reserved = prev.h(row);
                if (Math.abs(prev.angle(row)) > 0) {
                    const available = (prev.model.y0(row) < prev.model.yi(row) ?
                        (args.maxHeight - prev.model.yi(row)) :
                        (prev.model.yi(row)));
                    return ((available < reserved) ? available : reserved);
                }

                return reserved;
            },

            w: (row) => {
                const reserved = prev.w(row);
                if (prev.angle(row) === 0) {
                    const available = prev.model.size(row);
                    return ((available < reserved) ? available : reserved);
                }

                return reserved;
            },

            label: (row, args) => {
                let available;

                if (prev.angle(row) === 0) {
                    available = prev.model.size(row);
                } else {
                    available = (prev.model.y0(row) < prev.model.yi(row) ?
                        (args.maxHeight - prev.model.yi(row)) :
                        (prev.model.yi(row)));
                }

                return cutLines(prev.labelLinesAndSeparator(row), available);
            },

            dy: (row, args) => {
                const prevDy = prev.dy(row);

                if (prev.angle(row) !== 0) {
                    const reserved = prev.h(row);
                    const available = (prev.model.y0(row) < prev.model.yi(row) ?
                        (args.maxHeight - prev.model.yi(row)) :
                        (prev.model.yi(row)));

                    return ((available < reserved) ?
                            (available * prevDy / reserved) :
                            (prevDy)
                    );
                }

                return prevDy;
            }
        };
    })

    .regRule('from-beginning', (prev) => {
        var y0 = (row) => prev.model.y0(row);
        return (prev.model.flip ? {x: y0} : {y: y0});
    })

    .regRule('to-end', (prev) => {
        var yi = (row) => prev.model.yi(row);
        return (prev.model.flip ? {x: yi} : {y: yi});
    })

    .regRule('towards', (prev) => {
        var getSign = (prev, row) => (prev.model.yi(row) - prev.model.y0(row) >= 0 ? 1 : -1);
        var getPad = (prev.model.flip ? getXPad : getYPad);
        var dy = (row) => (getSign(prev, row) * getPad(prev, row));
        return (prev.model.flip ? {dx: dy} : {dy: dy});
    })

    .regRule('inside-start-then-outside-end-horizontal', (prev, args) => {

        var innerStart = [
            LayerLabelsRules.getRule('from-beginning'),
            LayerLabelsRules.getRule('towards'),
            LayerLabelsRules.getRule('cut-label-horizontal')
        ].reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var outerEnd = [
            LayerLabelsRules.getRule('to-end'),
            LayerLabelsRules.getRule('towards'),
            LayerLabelsRules.getRule('cut-outer-label-horizontal')
        ].reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var betterInside = (row) => (innerStart.label(row).length >= outerEnd.label(row).length);

        return Object.assign(
            {},
            innerStart,
            ['x', 'dx', 'hide', 'label'].reduce((obj, prop) => {
                obj[prop] = (row) => ((betterInside(row) ? innerStart : outerEnd)[prop](row));
                return obj;
            }, {})
        );

    })

    .regRule('inside-start-then-outside-end-vertical', (prev, args) => {

        var innerStart = [
            LayerLabelsRules.getRule('from-beginning'),
            LayerLabelsRules.getRule('towards'),
            LayerLabelsRules.getRule('cut-label-vertical')
        ].reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var outerEnd = [
            LayerLabelsRules.getRule('to-end'),
            LayerLabelsRules.getRule('towards'),
            LayerLabelsRules.getRule('cut-outer-label-vertical')
        ].reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var betterInside = (row) => (innerStart.label(row).length >= outerEnd.label(row).length);

        return Object.assign(
            {},
            innerStart,
            ['y', 'dy', 'hide', 'label'].reduce((obj, prop) => {
                obj[prop] = (row) => ((betterInside(row) ? innerStart : outerEnd)[prop](row));
                return obj;
            }, {})
        );

    })

    .regRule('outside-then-inside-horizontal', (prev, args) => {

        var outer = ['r+', 'l-', 'cut-outer-label-horizontal']
            .map(LayerLabelsRules.getRule)
            .reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var inner = ['r-', 'l+', 'hide-by-label-height-horizontal', 'cut-label-horizontal']
            .map(LayerLabelsRules.getRule)
            .reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var betterInside = (row) => (inner.label(row).length > outer.label(row).length);

        return Object.assign(
            {},
            outer,
            ['x', 'dx', 'hide', 'label'].reduce((obj, prop) => {
                obj[prop] = (row) => ((betterInside(row) ? inner : outer)[prop](row));
                return obj;
            }, {})
        );
    })

    .regRule('outside-then-inside-vertical', (prev, args) => {

        var outer = ['t+', 'b-', 'cut-outer-label-vertical']
            .map(LayerLabelsRules.getRule)
            .reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var inner = ['t-', 'b+', 'hide-by-label-height-vertical', 'cut-label-vertical']
            .map(LayerLabelsRules.getRule)
            .reduce((p, r) => LayerLabelsModel.compose(p, r(p, args)), prev);

        var betterInside = (row) => {
            var yPosition = outer.y(row, args) + outer.dy(row, args);
            return yPosition <= 0 || yPosition >= args.maxHeight;
        };

        return Object.assign(
            {},
            outer,
            ['y', 'dy', 'hide', 'label'].reduce((obj, prop) => {
                obj[prop] = (row) => ((betterInside(row) ? inner : outer)[prop](row, args));
                return obj;
            }, {})
        );
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
                const required = prev.w(row);
                const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                const prevDx = prev.dx(row);
                return ((available < required) ? (available * prevDx / required) : (prevDx));
            },

            w: (row) => {
                const required = prev.w(row);
                const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
                return ((available < required) ? available : required);
            },

            label: (row) => {
                const available = Math.abs(prev.model.y0(row) - prev.model.yi(row));

                return cutLines(prev.labelLinesAndSeparator(row), available);
            }
        };
    })

    .regRule('cut-outer-label-horizontal', (prev, args) => {

        return {

            dx: (row) => {
                const required = prev.w(row);
                const available = (prev.model.y0(row) < prev.model.yi(row) ?
                    (args.maxWidth - prev.model.yi(row)) :
                    (prev.model.yi(row)));
                const prevDx = prev.dx(row);
                return ((available < required) ? (available * prevDx / required) : (prevDx));
            },

            w: (row) => {
                const required = prev.w(row);
                const available = (prev.model.y0(row) < prev.model.yi(row) ?
                    (args.maxWidth - prev.model.yi(row)) :
                    (prev.model.yi(row)));
                return ((available < required) ? available : required);
            },

            label: (row) => {
                const available = (prev.model.y0(row) < prev.model.yi(row) ?
                    (args.maxWidth - prev.model.yi(row)) :
                    (prev.model.yi(row)));

                return cutLines(prev.labelLinesAndSeparator(row), available);
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
    })

    .regRule('multiline-label-left-align', (prev) => {
        return {
            dy: (row) => {
                const prevDy = prev.dy(row);

                if (prev.angle(row) === -90) {
                    return prevDy + (prev.h(row) / 2);
                }

                return prevDy;
            }
        };
    })

    .regRule('multiline-label-vertical-center-align', (prev) => {
        return {
            dy: (row) => {
                return prev.dy(row) - (prev.h(row) / 2);
            }
        };
    })

    .regRule('multiline-hide-on-container-overflow', (prev, {maxWidth, maxHeight}) => {
        return {
            hide: (row) => {
                var angle = prev.angle(row);
                var x = prev.x(row) + prev.dx(row);
                var y = prev.y(row) + prev.dy(row);

                if (hasXOverflow(x, prev.w(row), angle, maxWidth) || hasYOverflow(y, prev.h(row), angle, maxHeight)) {
                    return true;
                }

                return prev.hide(row);
            }
        };
    });
