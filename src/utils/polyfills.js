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

if (!Number.MAX_SAFE_INTEGER) {
    Object.defineProperty(Number, 'MAX_SAFE_INTEGER', {
        value: 9007199254740991,
        configurable: false,
        enumerable: false,
        writable: false
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

if (!Array.from) {
    Object.defineProperty(Array, 'from', {
        value: (function () {
            var toStr = Object.prototype.toString;
            var isCallable = function (fn) {
                return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
            };
            var toInteger = function (value) {
                var number = Number(value);
                if (isNaN(number)) { return 0; }
                if (number === 0 || !isFinite(number)) { return number; }
                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function (value) {
                var len = toInteger(value);
                return Math.min(Math.max(len, 0), maxSafeInteger);
            };

            return function from(arrayLike/*, mapFn, thisArg */) {
                var C = this;
                var items = Object(arrayLike);
                if (arrayLike == null) {
                    throw new TypeError('Array.from requires an array-like object - not null or undefined');
                }
                var mapFn = arguments.length > 1 ? arguments[1] : undefined;
                var T;
                if (typeof mapFn !== 'undefined') {
                    if (!isCallable(mapFn)) {
                        throw new TypeError('Array.from: when provided, the second argument must be a function');
                    }
                    if (arguments.length > 2) {
                        T = arguments[2];
                    }
                }
                var len = toLength(items.length);
                var A = isCallable(C) ? Object(new C(len)) : new Array(len);
                var k = 0;
                var kValue;
                while (k < len) {
                    kValue = items[k];
                    if (mapFn) {
                        A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                    } else {
                        A[k] = kValue;
                    }
                    k += 1;
                }
                A.length = len;
                return A;
            };
        }()),
        configurable: true,
        enumerable: false,
        writable: true
    });

    // Assume `Array.from` is only missing in IE11, same for Map methods.
    var ieMapSet = Map.prototype.set;
    Object.defineProperty(Map.prototype, 'set', {
        value: function () {
            ieMapSet.apply(this, arguments);
            return this;
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(Map.prototype, 'values', {
        value: function () {
            var obj = {};
            var i = 0;
            this.forEach((v) => obj[String(i++)] = v);
            obj.length = i;
            return obj;
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
    Object.defineProperty(Map.prototype, 'entries', {
        value: function () {
            var obj = {};
            var i = 0;
            this.forEach((v, k) => obj[String(i++)] = [k, v]);
            obj.length = i;
            return obj;
        },
        configurable: true,
        enumerable: false,
        writable: true
    });
}

if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        value: function (target) {
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
}

if (!Element.prototype.matches) {
    Object.defineProperty(Element.prototype, 'matches', {
        value: Element.prototype.msMatchesSelector,
        configurable: true,
        enumerable: true,
        writable: true
    });
}
