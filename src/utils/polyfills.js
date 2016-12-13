'use strict';

if (!window.requestAnimationFrame) {
    (function () {
        var lastTime = 0;
        window.requestAnimationFrame = function (fn) {
            var currTime = Date.now();
            var delay = Math.max(0, 16 - currTime + lastTime);
            lastTime = currTime + delay;
            return setTimeout(function () {
                fn.call(null, currTime + delay);
            }, delay);
        };
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    })();
}

if (!Number.isFinite) {
    Object.defineProperty(Number, 'isFinite', {
        value: function (value) {
            return typeof value === 'number' && isFinite(value);
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
}

if (!Number.isNaN) {
    Object.defineProperty(Number, 'isNaN', {
        value: function (value) {
            return typeof value === 'number' && isNaN(value);
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
}

if (!Number.isInteger) {
    Object.defineProperty(Number, 'isInteger', {
        value: function (value) {
            return typeof value === 'number' &&
                isFinite(value) &&
                Math.floor(value) === value;
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
}

if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
}

if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
}

if (typeof Object.assign != 'function') {
    (function () {
        Object.defineProperty(Object, 'assign', {
            value: function (target) {
                // We must check against these specific cases.
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            },
            configurable: true,
            enumerable: false,
            writable: true
        });
    })();
}

if (!Element.prototype.matches) {
    Object.defineProperty(Element.prototype, 'matches', {
        value: Element.prototype.msMatchesSelector,
        configurable: true,
        enumerable: true,
        writable: true
    });
}
