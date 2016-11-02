import {GenericCartesian}   from '../elements/element.generic.cartesian';

var traverseJSON = (srcObject, byProperty, fnSelectorPredicates, funcTransformRules) => {

    var rootRef = funcTransformRules(fnSelectorPredicates(srcObject), srcObject);

    (rootRef[byProperty] || []).forEach((unit) => traverseJSON(
            unit,
            byProperty,
            fnSelectorPredicates,
            funcTransformRules)
    );

    return rootRef;
};

var traverseSpec = (root, enterFn, exitFn, level = 0) => {
    var shouldContinue = enterFn(root, level);
    if (shouldContinue) {
        (root.units || []).map((rect) => traverseSpec(rect, enterFn, exitFn, level + 1));
    }
    exitFn(root, level);
};

var hashGen = 0;
var hashMap = {};

var deepClone = (function () {

    // clone objects, skip other types.
    function clone(target) {
        if (typeof target == 'object') {
            return JSON.parse(JSON.stringify(target));
        } else {
            return target;
        }
    }

    // Deep Copy
    var deepCopiers = [];

    function DeepCopier(config) {
        for (var key in config) {
            this[key] = config[key];
        }
    }

    DeepCopier.prototype = {
        constructor: DeepCopier,

        // determines if this DeepCopier can handle the given object.
        canCopy: function (source) { // eslint-disable-line
            return false;
        },

        // starts the deep copying process by creating the copy object.  You
        // can initialize any properties you want, but you can't call recursively
        // into the DeeopCopyAlgorithm.
        create: function (source) { // eslint-disable-line
        },

        // Completes the deep copy of the source object by populating any properties
        // that need to be recursively deep copied.  You can do this by using the
        // provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
        // cyclic references for objects already deepCopied, including the source object
        // itself.  The "result" passed in is the object returned from create().
        populate: function (deepCopyAlgorithm, source, result) { // eslint-disable-line
        }
    };

    function DeepCopyAlgorithm() {
        // copiedObjects keeps track of objects already copied by this
        // deepCopy operation, so we can correctly handle cyclic references.
        this.copiedObjects = [];
        var thisPass = this;
        this.recursiveDeepCopy = function (source) {
            return thisPass.deepCopy(source);
        };
        this.depth = 0;
    }

    DeepCopyAlgorithm.prototype = {
        constructor: DeepCopyAlgorithm,

        maxDepth: 256,

        // add an object to the cache.  No attempt is made to filter duplicates;
        // we always check getCachedResult() before calling it.
        cacheResult: function (source, result) {
            this.copiedObjects.push([source, result]);
        },

        // Returns the cached copy of a given object, or undefined if it's an
        // object we haven't seen before.
        getCachedResult: function (source) {
            var copiedObjects = this.copiedObjects;
            var length = copiedObjects.length;
            for (var i = 0; i < length; i++) {
                if (copiedObjects[i][0] === source) {
                    return copiedObjects[i][1];
                }
            }
            return undefined;
        },

        // deepCopy handles the simple cases itself: non-objects and object's we've seen before.
        // For complex cases, it first identifies an appropriate DeepCopier, then calls
        // applyDeepCopier() to delegate the details of copying the object to that DeepCopier.
        deepCopy: function (source) {
            // null is a special case: it's the only value of type 'object' without properties.
            if (source === null) {
                return null;
            }

            // All non-objects use value semantics and don't need explict copying.
            if (typeof source !== 'object') {
                return source;
            }

            var cachedResult = this.getCachedResult(source);

            // we've already seen this object during this deep copy operation
            // so can immediately return the result.  This preserves the cyclic
            // reference structure and protects us from infinite recursion.
            if (cachedResult) {
                return cachedResult;
            }

            // objects may need special handling depending on their class.  There is
            // a class of handlers call "DeepCopiers"  that know how to copy certain
            // objects.  There is also a final, generic deep copier that can handle any object.
            for (var i = 0; i < deepCopiers.length; i++) {
                var deepCopier = deepCopiers[i];
                if (deepCopier.canCopy(source)) {
                    return this.applyDeepCopier(deepCopier, source);
                }
            }
            // the generic copier can handle anything, so we should never reach this line.
            throw new Error('no DeepCopier is able to copy ' + source);
        },

        // once we've identified which DeepCopier to use, we need to call it in a very
        // particular order: create, cache, populate.  This is the key to detecting cycles.
        // We also keep track of recursion depth when calling the potentially recursive
        // populate(): this is a fail-fast to prevent an infinite loop from consuming all
        // available memory and crashing or slowing down the browser.
        applyDeepCopier: function (deepCopier, source) {
            // Start by creating a stub object that represents the copy.
            var result = deepCopier.create(source);

            // we now know the deep copy of source should always be result, so if we encounter
            // source again during this deep copy we can immediately use result instead of
            // descending into it recursively.
            this.cacheResult(source, result);

            // only DeepCopier::populate() can recursively deep copy.  So, to keep track
            // of recursion depth, we increment this shared counter before calling it,
            // and decrement it afterwards.
            this.depth++;
            if (this.depth > this.maxDepth) {
                throw new Error('Exceeded max recursion depth in deep copy.');
            }

            // It's now safe to let the deepCopier recursively deep copy its properties.
            deepCopier.populate(this.recursiveDeepCopy, source, result);

            this.depth--;

            return result;
        }
    };

    // entry point for deep copy.
    // source is the object to be deep copied.
    // maxDepth is an optional recursion limit. Defaults to 256.
    function deepCopy(source, maxDepth) {
        var deepCopyAlgorithm = new DeepCopyAlgorithm();
        if (maxDepth) {
            deepCopyAlgorithm.maxDepth = maxDepth;
        }
        return deepCopyAlgorithm.deepCopy(source);
    }

    // publicly expose the DeepCopier class.
    deepCopy.DeepCopier = DeepCopier;

    // publicly expose the list of deepCopiers.
    deepCopy.deepCopiers = deepCopiers;

    // make deepCopy() extensible by allowing others to
    // register their own custom DeepCopiers.
    deepCopy.register = function (deepCopier) {
        if (!(deepCopier instanceof DeepCopier)) {
            deepCopier = new DeepCopier(deepCopier);
        }
        deepCopiers.unshift(deepCopier);
    };

    // Generic Object copier
    // the ultimate fallback DeepCopier, which tries to handle the generic case.  This
    // should work for base Objects and many user-defined classes.
    deepCopy.register({

        canCopy: function () {
            return true;
        },

        create: function (source) {
            if (source instanceof source.constructor) {
                return clone(source.constructor.prototype);
            } else {
                return {};
            }
        },

        populate: function (deepCopy, source, result) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = deepCopy(source[key]);
                }
            }
            return result;
        }
    });

    // Array copier
    deepCopy.register({
        canCopy: function (source) {
            return ( source instanceof Array );
        },

        create: function (source) {
            return new source.constructor();
        },

        populate: function (deepCopy, source, result) {
            for (var i = 0; i < source.length; i++) {
                result.push(deepCopy(source[i]));
            }
            return result;
        }
    });

    // Date copier
    deepCopy.register({
        canCopy: function (source) {
            return (source instanceof Date);
        },

        create: function (source) {
            return new Date(source);
        }
    });

    return deepCopy;

})();
var chartElement = [
    GenericCartesian
];

var testColorCode = ((x) => (/^(#|rgb\(|rgba\()/.test(x)));

// TODO Remove this configs and its associated methods
// which are just for templating in some plugins
var noMatch = /(.)^/;

let map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '`': '&#x60;'
};
let escapes = {
    '\'': '\'',
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

let escaper = /\\|'|\r|\n|\u2028|\u2029/g;

let source = '(?:' + Object.keys(map).join('|') + ')';
let testRegexp = RegExp(source);
let replaceRegexp = RegExp(source, 'g');

let templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
};
// End of plugin configs

var utils = {
    clone(obj) {
        return deepClone(obj);
    },
    isDate(obj) {
        return obj instanceof Date && !isNaN(Number(obj));
    },
    isObject(obj) {
        return obj != null && typeof obj === 'object';
    },
    isChartElement(element) {
        return chartElement.some(Element => element instanceof Element);
    },
    niceZeroBased(domain) {

        var m = 10;

        var low = parseFloat(Math.min(...domain).toFixed(15));
        var top = parseFloat(Math.max(...domain).toFixed(15));

        if (low === top) {
            let k = (top >= 0) ? -1 : 1;
            let d = (top || 1);
            top = top - k * d / m;
        }

        var extent = [low, top];
        var span = extent[1] - extent[0];
        var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
        var err = m / span * step;

        var correction = [
            [0.15, 10],
            [0.35, 5],
            [0.75, 2],
            [1.00, 1],
            [2.00, 1]
        ];

        var i = -1;
        /*eslint-disable */
        while (err > correction[++i][0]) {
        }// jscs:ignore disallowEmptyBlocks
        /*eslint-enable */

        step *= correction[i][1];

        extent[0] = Math.floor(extent[0] / step) * step;
        extent[1] = Math.ceil(extent[1] / step) * step;

        var deltaLow = low - extent[0];
        var deltaTop = extent[1] - top;

        var limit = (step / 2);

        if (low >= 0) {
            // include 0 by default
            extent[0] = 0;
        } else {
            var koeffLow = (deltaLow <= limit) ? step : 0;
            extent[0] = (extent[0] - koeffLow);
        }

        if (top <= 0) {
            // include 0 by default
            extent[1] = 0;
        } else {
            var koeffTop = (deltaTop <= limit) ? step : 0;
            extent[1] = extent[1] + koeffTop;
        }

        return [
            parseFloat(extent[0].toFixed(15)),
            parseFloat(extent[1].toFixed(15))
        ];
    },

    traverseJSON,

    generateHash: (str) => {
        var r = btoa(encodeURIComponent(str)).replace(/=/g, '_');
        if (!hashMap.hasOwnProperty(r)) {
            hashMap[r] = (`H${++hashGen}`);
        }
        return hashMap[r];
    },

    generateRatioFunction: (dimPropName, paramsList, chartInstanceRef) => {

        var unify = (v) => utils.isDate(v) ? v.getTime() : v;

        var dataNewSnap = 0;
        var dataPrevRef = null;
        var xHash = utils.memoize(
            (data, keys) => {
                return utils.unique(
                    data.map((row) => (keys.reduce((r, k) => (r.concat(unify(row[k]))), []))),
                    (t) => JSON.stringify(t))
                    .reduce((memo, t) => {
                        var k = t[0];
                        memo[k] = memo[k] || 0;
                        memo[k] += 1;
                        return memo;
                    }, {});
            },
            (data, keys) => {
                let seed = (dataPrevRef === data) ? dataNewSnap : (++dataNewSnap);
                dataPrevRef = data;
                return `${keys.join('')}-${seed}`;
            });

        return (key, size, varSet) => {

            var facetSize = varSet.length;

            var chartSpec = chartInstanceRef.getSpec();

            var data = chartSpec.sources['/'].data;

            var level2Guide = chartSpec.unit.units[0].guide || {};
            level2Guide.padding = level2Guide.padding || {l: 0, r: 0, t: 0, b: 0};

            var pad = 0;
            if (dimPropName === 'x') {
                pad = level2Guide.padding.l + level2Guide.padding.r;
            } else if (dimPropName === 'y') {
                pad = level2Guide.padding.t + level2Guide.padding.b;
            }

            var xTotal = (keys) => {
                var arr = xHash(data, keys);
                return Object.keys(arr).reduce((sum, k) => (sum + arr[k]), 0);
            };

            var xPart = ((keys, k) => (xHash(data, keys)[k]));

            var totalItems = xTotal(paramsList);

            var tickPxSize = (size - (facetSize * pad)) / totalItems;
            var countOfTicksInTheFacet = xPart(paramsList, key);

            return (countOfTicksInTheFacet * tickPxSize + pad) / size;
        };
    },

    traverseSpec: traverseSpec,

    isSpecRectCoordsOnly: function (root) {

        var isApplicable = true;

        try {
            utils.traverseSpec(
                (root),
                (unit) => {
                    if ((unit.type.indexOf('COORDS.') === 0) && (unit.type !== 'COORDS.RECT')) {
                        throw new Error('Not applicable');
                    }
                },
                (unit) => (unit)
            );
        } catch (e) {
            if (e.message === 'Not applicable') {
                isApplicable = false;
            }
        }

        return isApplicable;
    },

    throttleLastEvent: function (last, eventType, handler, limitFromPrev = 0) {

        return function (...args) {
            var curr = {e: eventType, ts: (new Date())};
            var diff = ((last.e && (last.e === curr.e)) ? (curr.ts - last.ts) : (limitFromPrev));

            if (diff >= limitFromPrev) {
                handler.apply(this, args);
            }

            last.e = curr.e;
            last.ts = curr.ts;
        };
    },

    splitEvenly: function (domain, parts) {
        var min = domain[0];
        var max = domain[1];
        var segment = ((max - min) / (parts - 1));
        var chunks = parts >= 2 ?
            utils.range(parts - 2).map((n) => (min + segment * (n + 1)))
            : [];
        return [min, ...chunks, max];
    },

    extRGBColor: function (x) {
        return (testColorCode(x) ? x : '');
    },

    extCSSClass: function (x) {
        return (testColorCode(x) ? '' : x);
    },

    toRadian: function (degree) {
        return (degree / 180) * Math.PI;
    },

    normalizeAngle: function (angle) {
        if (Math.abs(angle) >= 360) {
            angle = (angle % 360);
        }

        if (angle < 0) {
            angle = (360 + angle);
        }

        return angle;
    },

    range: function (start, end) {
        if (arguments.length ===  1) {
            end = start;
            start = 0;
        }
        let  arr = [];
        for (let i = start; i < end; i++) {
            arr.push(i);
        }
        return arr;
    },

    flatten: (array) => {
        if (!Array.isArray(array)) {
            return array;
        }
        return [].concat(...array.map(x => utils.flatten(x)));
    },

    unique: (array, func) => {
        let mappedArray = array;
        let filter = ((elem, pos, arr) => arr.indexOf(elem) === pos);
        if (typeof func === 'function') {
            mappedArray = array.map(func);
            filter = (elem, pos) => {
                let mappedElem = mappedArray[pos];
                return mappedArray.findIndex(x => x === mappedElem) === pos;
            };
        }
        return array.filter(filter);
    },

    groupBy: (array, func) => {
        return array.reduce((obj, v) => {
            var group = func(v);
            obj[group] = obj[group] || [];
            obj[group].push(v);
            return obj;
        }, {});
    },

    union: (arr1, arr2) => utils.unique(arr1.concat(arr2)),

    intersection: (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) !== -1),

    defaults: (obj, ...defaultObjs) => {
        var length = defaultObjs.length;
        if (length === 0 || !obj) {
            return obj;
        }
        for (var index = 0; index < length; index++) {
            var source = defaultObjs[index],
                keys = utils.isObject(source) ? Object.keys(source) : [],
                l = keys.length;
            for (var i = 0; i < l; i++) {
                var key = keys[i];
                if (obj[key] === undefined) {
                    obj[key] = source[key];
                }
            }
        }
        return obj;
    },

    omit: (obj, ...props) => {
        let newObj = Object.assign({}, obj);
        props.forEach((prop) => {
            delete newObj[prop];
        });
        return newObj;
    },

    memoize: function(func, hasher) {
        let memoize = function(key) {
            let cache = memoize.cache;
            let address = String(hasher ? hasher.apply(this, arguments) : key);
            if (!cache.hasOwnProperty(address)) {
                cache[address] = func.apply(this, arguments);
            }
            return cache[address];
        };
        memoize.cache = {};
        return memoize;
    },

    // TODO Remove this methods and its associated configs
    // which are just for templating in some plugins
    pick: (object, ...props) => {
        var result = {};
        if (object == null) {
            return result;
        }

        return props.reduce((result, prop) => {
            let value = object[prop];
            if (value) {
                result[prop] = value;
            }
            return result;
        }, {});
    },

    escape: function(string) {
        string = string == null ? '' : String(string);
        return testRegexp.test(string) ? string.replace(replaceRegexp, match =>map[match]) : string;
    },

    template: (text, settings, oldSettings) => {
        if (!settings && oldSettings){
            settings = oldSettings;
        }
        settings = utils.defaults({}, settings, templateSettings);

        var matcher = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        var index = 0;
        var source = '__p+=\'';
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, match => '\\' + escapes[match]);
            index = offset + match.length;

            if (escape) {
                source += '\'+\n((__t=(' + escape + '))==null?\'\':utils.escape(__t))+\n\'';
            } else if (interpolate) {
                source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
            } else if (evaluate) {
                source += '\';\n' + evaluate + '\n__p+=\'';
            }

            return match;
        });
        source += '\';\n';

        if (!settings.variable) {
            source = 'with(obj||{}){\n' + source + '}\n';
        }

        source = 'var __t,__p=\'\',__j=Array.prototype.join,' +
            'print=function(){__p+=__j.call(arguments,\'\');};\n' +
            source + 'return __p;\n';

        try {
            var render = new Function(settings.variable || 'obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function(data) {
            return render.call(this, data);
        };

        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    }

    // End of plugins methods

};

export {utils};