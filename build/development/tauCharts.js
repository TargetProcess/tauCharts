/*! taucharts - v0.5.1 - 2015-09-01
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2015 Taucraft Limited; Licensed Apache License 2.0 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'd3'],function(_,d3){return factory(_, d3);});
    } else if (typeof module === "object" && module.exports) {
        var _ = require('underscore');
        var d3 = require('d3');
        module.exports = factory(_, d3);
    } else {
        root.tauCharts = factory(root._, root.d3);
    }
}(this, function (_, d3) {/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

define('utils/utils-dom',['exports'], function (exports) {
    /**
     * Internal method to return CSS value for given element and property
     */
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    var tempDiv = document.createElement('div');

    var utilsDom = {
        appendTo: function appendTo(el, container) {
            var node;
            if (el instanceof Node) {
                node = el;
            } else {
                tempDiv.insertAdjacentHTML('afterbegin', el);
                node = tempDiv.childNodes[0];
            }
            container.appendChild(node);
            return node;
        },
        getScrollbarWidth: function getScrollbarWidth() {
            var div = document.createElement('div');
            div.style.overflow = 'scroll';
            div.style.visibility = 'hidden';
            div.style.position = 'absolute';
            div.style.width = '100px';
            div.style.height = '100px';

            document.body.appendChild(div);

            var r = div.offsetWidth - div.clientWidth;

            document.body.removeChild(div);

            return r;
        },

        getStyle: function getStyle(el, prop) {
            return window.getComputedStyle(el, undefined).getPropertyValue(prop);
        },

        getStyleAsNum: function getStyleAsNum(el, prop) {
            return parseInt(this.getStyle(el, prop) || 0, 10);
        },

        getContainerSize: function getContainerSize(el) {
            var pl = this.getStyleAsNum(el, 'padding-left');
            var pr = this.getStyleAsNum(el, 'padding-right');
            var pb = this.getStyleAsNum(el, 'padding-bottom');
            var pt = this.getStyleAsNum(el, 'padding-top');

            var borderWidthT = this.getStyleAsNum(el, 'border-top-width');
            var borderWidthL = this.getStyleAsNum(el, 'border-left-width');
            var borderWidthR = this.getStyleAsNum(el, 'border-right-width');
            var borderWidthB = this.getStyleAsNum(el, 'border-bottom-width');

            var bw = borderWidthT + borderWidthL + borderWidthR + borderWidthB;

            var rect = el.getBoundingClientRect();

            return {
                width: rect.width - pl - pr - 2 * bw,
                height: rect.height - pb - pt - 2 * bw
            };
        },

        getAxisTickLabelSize: function getAxisTickLabelSize(text) {

            var tmpl = ['<svg class="graphical-report__svg">', '<g class="graphical-report__cell cell">', '<g class="x axis">', '<g class="tick"><text><%= xTick %></text></g>', '</g>', '</g>', '</svg>'].join('');

            var compiled = _.template(tmpl);

            var div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.width = '100px';
            div.style.height = '100px';
            div.style.border = '1px solid green';
            document.body.appendChild(div);

            div.innerHTML = compiled({ xTick: text });

            var textNode = d3.select(div).selectAll('.x.axis .tick text')[0][0];

            var size = {
                width: 0,
                height: 0
            };

            // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
            var rect = textNode.getBoundingClientRect();
            size.width = rect.right - rect.left;
            size.height = rect.bottom - rect.top;

            var avgLetterSize = text.length !== 0 ? size.width / text.length : 0;
            size.width = size.width + 1.5 * avgLetterSize;

            document.body.removeChild(div);

            return size;
        }
    };
    exports.utilsDom = utilsDom;
});
define('const',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var CSS_PREFIX = 'graphical-report__';
  exports.CSS_PREFIX = CSS_PREFIX;
});
define('event',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var NULL_HANDLER = {};
    var events = {};

    /**
     * Creates new type of event or returns existing one, if it was created before.
     * @param {string} eventName
     * @return {function(..eventArgs)}
     */
    function createDispatcher(eventName) {
        var eventFunction = events[eventName];

        if (!eventFunction) {
            eventFunction = function () {
                var cursor = this;
                var args;
                var fn;
                var i = 0;
                while (cursor = cursor.handler) {
                    // jshint ignore:line
                    // callback call
                    fn = cursor.callbacks[eventName];
                    if (typeof fn === 'function') {
                        if (!args) {
                            // it should be better for browser optimizations
                            // (instead of [this].concat(slice.call(arguments)))
                            args = [this];
                            for (i = 0; i < arguments.length; i++) {
                                args.push(arguments[i]);
                            }
                        }

                        fn.apply(cursor.context, args);
                    }

                    // any event callback call
                    fn = cursor.callbacks['*'];
                    if (typeof fn === 'function') {
                        if (!args) {
                            // it should be better for browser optimizations
                            // (instead of [this].concat(slice.call(arguments)))
                            args = [this];
                            for (i = 0; i < arguments.length; i++) {
                                args.push(arguments[i]);
                            }
                        }

                        fn.call(cursor.context, {
                            sender: this,
                            type: eventName,
                            args: args
                        });
                    }
                }
            };

            events[eventName] = eventFunction;
        }

        return eventFunction;
    }

    /**
     * Base class for event dispatching. It provides interface for instance
     * to add and remove handler for desired events, and call it when event happens.
     * @class
     */

    var Emitter = (function () {
        /**
         * @constructor
         */

        function Emitter() {
            _classCallCheck(this, Emitter);

            this.handler = null;
            this.emit_destroy = createDispatcher('destroy');
        }

        //
        // export names
        //

        /**
         * Adds new event handler to object.
         * @param {object} callbacks Callback set.
         * @param {object=} context Context object.
         */

        _createClass(Emitter, [{
            key: 'addHandler',
            value: function addHandler(callbacks, context) {
                context = context || this;
                // add handler
                this.handler = {
                    callbacks: callbacks,
                    context: context,
                    handler: this.handler
                };
            }
        }, {
            key: 'on',
            value: function on(name, callback, context) {
                var obj = {};
                obj[name] = callback;
                this.addHandler(obj, context);
                return obj;
            }
        }, {
            key: 'fire',
            value: function fire(name, data) {
                createDispatcher.call(this, name).call(this, data);
            }

            /**
             * Removes event handler set from object. For this operation parameters
             * must be the same (equivalent) as used for addHandler method.
             * @param {object} callbacks Callback set.
             * @param {object=} context Context object.
             */
        }, {
            key: 'removeHandler',
            value: function removeHandler(callbacks, context) {
                var cursor = this;
                var prev;

                context = context || this;

                // search for handler and remove it
                while ((prev = cursor, cursor = cursor.handler)) {
                    // jshint ignore:line
                    if (cursor.callbacks === callbacks && cursor.context === context) {
                        // make it non-callable
                        cursor.callbacks = NULL_HANDLER;

                        // remove from list
                        prev.handler = cursor.handler;

                        return;
                    }
                }
            }

            /**
             * @destructor
             */
        }, {
            key: 'destroy',
            value: function destroy() {
                // fire object destroy event handlers
                this.emit_destroy();
                // drop event handlers if any
                this.handler = null;
            }
        }]);

        return Emitter;
    })();

    exports.Emitter = Emitter;
});
define('elements/element',['exports', '../event'], function (exports, _event) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Element = (function (_Emitter) {
        _inherits(Element, _Emitter);

        // add base behaviour here

        function Element(config) {
            _classCallCheck(this, Element);

            _get(Object.getPrototypeOf(Element.prototype), 'constructor', this).call(this, config);
            this._elementScalesHub = {};
        }

        _createClass(Element, [{
            key: 'regScale',
            value: function regScale(paramId, scaleObj) {
                this._elementScalesHub[paramId] = scaleObj;
                return this;
            }
        }, {
            key: 'getScale',
            value: function getScale(paramId) {
                return this._elementScalesHub[paramId] || null;
            }
        }, {
            key: 'subscribe',
            value: function subscribe(sel) {
                var dataInterceptor = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
                    return x;
                } : arguments[1];
                var eventInterceptor = arguments.length <= 2 || arguments[2] === undefined ? function (x) {
                    return x;
                } : arguments[2];

                var self = this;
                ['mouseover', 'mouseout', 'click'].forEach(function (eventName) {
                    sel.on(eventName, function (d) {
                        self.fire(eventName, {
                            data: dataInterceptor.call(this, d),
                            event: eventInterceptor.call(this, d3.event, d)
                        });
                    });
                });
            }
        }]);

        return Element;
    })(_event.Emitter);

    exports.Element = Element;
});
define('elements/element.point',['exports', '../const', './element'], function (exports, _const, _element) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Point = (function (_Element) {
        _inherits(Point, _Element);

        function Point(config) {
            var _this = this;

            _classCallCheck(this, Point);

            _get(Object.getPrototypeOf(Point.prototype), 'constructor', this).call(this, config);

            this.config = config;

            this.config.guide = this.config.guide || {};

            this.config.guide.x = this.config.guide.x || {};
            this.config.guide.x = _.defaults(this.config.guide.x, {
                tickFontHeight: 0,
                density: 20
            });

            this.config.guide.y = this.config.guide.y || {};
            this.config.guide.y = _.defaults(this.config.guide.y, {
                tickFontHeight: 0,
                density: 20
            });

            this.on('highlight', function (sender, e) {
                return _this.highlight(e);
            });
        }

        _createClass(Point, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var config = this.config;

                this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
                this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
                this.color = fnCreateScale('color', config.color, {});

                var fitSize = function fitSize(w, h, maxRelLimit, srcSize, minimalSize) {
                    var minRefPoint = Math.min(w, h);
                    var minSize = minRefPoint * maxRelLimit;
                    return Math.max(minimalSize, Math.min(srcSize, minSize));
                };

                var width = config.options.width;
                var height = config.options.height;
                var g = config.guide;
                var minimalSize = 1;
                var maxRelLimit = 0.035;
                var isNotZero = function isNotZero(x) {
                    return x !== 0;
                };
                var minFontSize = _.min([g.x.tickFontHeight, g.y.tickFontHeight].filter(isNotZero)) * 0.5;
                var minTickStep = _.min([g.x.density, g.y.density].filter(isNotZero)) * 0.5;

                this.size = fnCreateScale('size', config.size, {
                    min: fitSize(width, height, maxRelLimit, 2, minimalSize),
                    max: fitSize(width, height, maxRelLimit, minTickStep, minimalSize),
                    mid: fitSize(width, height, maxRelLimit, minFontSize, minimalSize)
                });

                return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var self = this;

                var options = this.config.options;

                var prefix = _const.CSS_PREFIX + 'dot dot i-role-element i-role-datum';

                var xScale = this.xScale;
                var yScale = this.yScale;
                var cScale = this.color;
                var sScale = this.size;

                var enter = function enter() {
                    return this.attr({
                        r: function r(_ref) {
                            var d = _ref.data;
                            return sScale(d[sScale.dim]);
                        },
                        cx: function cx(_ref2) {
                            var d = _ref2.data;
                            return xScale(d[xScale.dim]);
                        },
                        cy: function cy(_ref3) {
                            var d = _ref3.data;
                            return yScale(d[yScale.dim]);
                        },
                        'class': function _class(_ref4) {
                            var d = _ref4.data;
                            return prefix + ' ' + cScale(d[cScale.dim]);
                        }
                    }).transition().duration(500).attr('r', function (_ref5) {
                        var d = _ref5.data;
                        return sScale(d[sScale.dim]);
                    });
                };

                var update = function update() {
                    return this.attr({
                        r: function r(_ref6) {
                            var d = _ref6.data;
                            return sScale(d[sScale.dim]);
                        },
                        cx: function cx(_ref7) {
                            var d = _ref7.data;
                            return xScale(d[xScale.dim]);
                        },
                        cy: function cy(_ref8) {
                            var d = _ref8.data;
                            return yScale(d[yScale.dim]);
                        },
                        'class': function _class(_ref9) {
                            var d = _ref9.data;
                            return prefix + ' ' + cScale(d[cScale.dim]);
                        }
                    });
                };

                var updateGroups = function updateGroups() {

                    this.attr('class', function (f) {
                        return 'frame-id-' + options.uid + ' frame-' + f.hash;
                    }).call(function () {
                        var dots = this.selectAll('circle').data(function (frame) {
                            return frame.data.map(function (item) {
                                return { data: item, uid: options.uid };
                            });
                        });
                        dots.exit().remove();
                        dots.call(update);
                        dots.enter().append('circle').call(enter);

                        self.subscribe(dots, function (_ref10) {
                            var d = _ref10.data;
                            return d;
                        });
                    });
                };

                var mapper = function mapper(f) {
                    return { tags: f.key || {}, hash: f.hash(), data: f.part() };
                };

                var frameGroups = options.container.selectAll('.frame-id-' + options.uid).data(frames.map(mapper), function (f) {
                    return f.hash;
                });
                frameGroups.exit().remove();
                frameGroups.call(updateGroups);
                frameGroups.enter().append('g').call(updateGroups);

                return [];
            }
        }, {
            key: 'highlight',
            value: function highlight(filter) {
                this.config.options.container.selectAll('.dot').classed({
                    'graphical-report__highlighted': function graphicalReport__highlighted(_ref11) {
                        var d = _ref11.data;
                        return filter(d) === true;
                    },
                    'graphical-report__dimmed': function graphicalReport__dimmed(_ref12) {
                        var d = _ref12.data;
                        return filter(d) === false;
                    }
                });
            }
        }]);

        return Point;
    })(_element.Element);

    exports.Point = Point;
});
define('utils/css-class-map',['exports', '../const'], function (exports, _const) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var arrayNumber = [1, 2, 3, 4, 5];
    var countLineClasses = arrayNumber.map(function (i) {
        return _const.CSS_PREFIX + 'line-opacity-' + i;
    });
    var widthLineClasses = arrayNumber.map(function (i) {
        return _const.CSS_PREFIX + 'line-width-' + i;
    });
    function getLineClassesByCount(count) {
        return countLineClasses[count - 1] || countLineClasses[4];
    }
    function getLineClassesByWidth(width) {
        var index = 0;
        if (width >= 160 && width < 320) {
            index = 1;
        } else if (width >= 320 && width < 480) {
            index = 2;
        } else if (width >= 480 && width < 640) {
            index = 3;
        } else if (width >= 640) {
            index = 4;
        }
        return widthLineClasses[index];
    }
    exports.getLineClassesByWidth = getLineClassesByWidth;
    exports.getLineClassesByCount = getLineClassesByCount;
});
define('elements/element.line',['exports', '../const', './element', '../utils/css-class-map'], function (exports, _const, _element, _utilsCssClassMap) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Line = (function (_Element) {
        _inherits(Line, _Element);

        function Line(config) {
            var _this = this;

            _classCallCheck(this, Line);

            _get(Object.getPrototypeOf(Line.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = this.config.guide || {};
            this.config.guide = _.defaults(this.config.guide, {
                cssClass: '',
                widthCssClass: '',
                showAnchors: true,
                anchorSize: 0.1
            });

            this.on('highlight', function (sender, e) {
                return _this.highlight(e);
            });
            this.on('highlight-data-points', function (sender, e) {
                return _this.highlightDataPoints(e);
            });

            if (this.config.guide.showAnchors) {

                this.on('mouseover', function (sender, e) {
                    return sender.fire('highlight-data-points', function (row) {
                        return row === e.data;
                    });
                });

                this.on('mouseout', function (sender, e) {
                    return sender.fire('highlight-data-points', function (row) {
                        return false;
                    });
                });
            }
        }

        _createClass(Line, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var config = this.config;

                this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
                this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
                this.color = fnCreateScale('color', config.color, {});
                this.size = fnCreateScale('size', config.size, {});

                return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var self = this;

                var guide = this.config.guide;
                var options = this.config.options;

                var xScale = this.xScale;
                var yScale = this.yScale;
                var colorScale = this.color;
                var sizeScale = this.size;

                var widthCss = guide.widthCssClass || (0, _utilsCssClassMap.getLineClassesByWidth)(options.width);
                var countCss = (0, _utilsCssClassMap.getLineClassesByCount)(frames.length);

                var datumClass = 'i-role-datum';
                var pointPref = _const.CSS_PREFIX + 'dot-line dot-line i-role-element ' + datumClass + ' ' + _const.CSS_PREFIX + 'dot ';
                var linePref = _const.CSS_PREFIX + 'line i-role-element line ' + widthCss + ' ' + countCss + ' ' + guide.cssClass + ' ';

                var d3Line = d3.svg.line().x(function (d) {
                    return xScale(d[xScale.dim]);
                }).y(function (d) {
                    return yScale(d[yScale.dim]);
                });

                if (guide.interpolate) {
                    d3Line.interpolate(guide.interpolate);
                }

                var updateLines = function updateLines() {
                    var path = this.selectAll('path').data(function (_ref) {
                        var frame = _ref.data;
                        return [frame.data];
                    });
                    path.exit().remove();
                    path.attr('d', d3Line).attr('class', datumClass);
                    path.enter().append('path').attr('d', d3Line).attr('class', datumClass);

                    self.subscribe(path, function (rows) {

                        var m = d3.mouse(this);
                        var mx = m[0];
                        var my = m[1];

                        // d3.invert doesn't work for ordinal axes
                        var nearest = rows.map(function (row) {
                            var rx = xScale(row[xScale.dim]);
                            var ry = yScale(row[yScale.dim]);
                            return {
                                x: rx,
                                y: ry,
                                dist: Math.sqrt(Math.pow(mx - rx, 2) + Math.pow(my - ry, 2)),
                                data: row
                            };
                        }).sort(function (a, b) {
                            return a.dist - b.dist;
                        }) // asc
                        [0];

                        return nearest.data;
                    });

                    if (guide.showAnchors && !this.empty()) {

                        var anchUpdate = function anchUpdate() {
                            return this.attr({
                                r: guide.anchorSize,
                                cx: function cx(d) {
                                    return xScale(d[xScale.dim]);
                                },
                                cy: function cy(d) {
                                    return yScale(d[yScale.dim]);
                                },
                                'class': 'i-data-anchor'
                            });
                        };

                        var anch = this.selectAll('circle').data(function (_ref2) {
                            var frame = _ref2.data;
                            return frame.data;
                        });
                        anch.exit().remove();
                        anch.call(anchUpdate);
                        anch.enter().append('circle').call(anchUpdate);

                        self.subscribe(anch);
                    }
                };

                var updatePoints = function updatePoints() {

                    var dots = this.selectAll('circle').data(function (frame) {
                        return frame.data.data.map(function (item) {
                            return { data: item, uid: options.uid };
                        });
                    });
                    var attr = {
                        r: function r(_ref3) {
                            var d = _ref3.data;
                            return sizeScale(d[sizeScale.dim]);
                        },
                        cx: function cx(_ref4) {
                            var d = _ref4.data;
                            return xScale(d[xScale.dim]);
                        },
                        cy: function cy(_ref5) {
                            var d = _ref5.data;
                            return yScale(d[yScale.dim]);
                        },
                        'class': function _class(_ref6) {
                            var d = _ref6.data;
                            return pointPref + ' ' + colorScale(d[colorScale.dim]);
                        }
                    };
                    dots.exit().remove();
                    dots.attr(attr);
                    dots.enter().append('circle').attr(attr);

                    self.subscribe(dots, function (_ref7) {
                        var d = _ref7.data;
                        return d;
                    });
                };

                var updateGroups = function updateGroups(x, isLine) {

                    return function () {

                        this.attr('class', function (_ref8) {
                            var f = _ref8.data;
                            return linePref + ' ' + colorScale(f.tags[colorScale.dim]) + ' ' + x + ' frame-' + f.hash;
                        }).call(function () {
                            if (isLine) {
                                updateLines.call(this);
                            } else {
                                updatePoints.call(this);
                            }
                        });
                    };
                };

                var mapper = function mapper(f) {
                    return { data: { tags: f.key || {}, hash: f.hash(), data: f.part() }, uid: options.uid };
                };

                var drawFrame = function drawFrame(tag, id, filter) {

                    var isDrawLine = tag === 'line';

                    var frameGroups = options.container.selectAll('.frame-' + id).data(frames.map(mapper).filter(filter), function (_ref9) {
                        var f = _ref9.data;
                        return f.hash;
                    });
                    frameGroups.exit().remove();
                    frameGroups.call(updateGroups('frame-' + id, isDrawLine));
                    frameGroups.enter().append('g').call(updateGroups('frame-' + id, isDrawLine));
                };

                drawFrame('line', 'line-' + options.uid, function (_ref10) {
                    var f = _ref10.data;
                    return f.data.length > 1;
                });
                drawFrame('anch', 'anch-' + options.uid, function (_ref11) {
                    var f = _ref11.data;
                    return f.data.length < 2;
                });
            }
        }, {
            key: 'highlight',
            value: function highlight(filter) {

                var container = this.config.options.container;

                container.selectAll('.line').classed({
                    'graphical-report__highlighted': function graphicalReport__highlighted(_ref12) {
                        var d = _ref12.data;
                        return filter(d.tags) === true;
                    },
                    'graphical-report__dimmed': function graphicalReport__dimmed(_ref13) {
                        var d = _ref13.data;
                        return filter(d.tags) === false;
                    }
                });

                container.selectAll('.dot-line').classed({
                    'graphical-report__highlighted': function graphicalReport__highlighted(_ref14) {
                        var d = _ref14.data;
                        return filter(d) === true;
                    },
                    'graphical-report__dimmed': function graphicalReport__dimmed(_ref15) {
                        var d = _ref15.data;
                        return filter(d) === false;
                    }
                });
            }
        }, {
            key: 'highlightDataPoints',
            value: function highlightDataPoints(filter) {
                var _this2 = this;

                var colorScale = this.color;
                var cssClass = 'i-data-anchor';
                this.config.options.container.selectAll('.' + cssClass).attr({
                    r: function r(d) {
                        return filter(d) ? 3 : _this2.config.guide.anchorSize;
                    },
                    'class': function _class(d) {
                        return cssClass + ' ' + colorScale(d[colorScale.dim]);
                    }
                });
            }
        }]);

        return Line;
    })(_element.Element);

    exports.Line = Line;
});
define('elements/element.interval',['exports', '../const', './element'], function (exports, _const, _element) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Interval = (function (_Element) {
        _inherits(Interval, _Element);

        function Interval(config) {
            var _this = this;

            _classCallCheck(this, Interval);

            _get(Object.getPrototypeOf(Interval.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = _.defaults(this.config.guide || {}, { prettify: true });

            this.on('highlight', function (sender, e) {
                return _this.highlight(e);
            });
        }

        _createClass(Interval, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var config = this.config;
                this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
                this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
                this.color = fnCreateScale('color', config.color, {});
                this.size = fnCreateScale('size', config.size, {});

                return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {
                var _this2 = this;

                var self = this;

                var options = this.config.options;
                var config = this.config;
                var xScale = this.xScale;
                var yScale = this.yScale;
                var colorScale = this.color;

                var domain = colorScale.domain();
                var colorIndexScale = function colorIndexScale(d) {
                    var findIndex = domain.indexOf(d[colorScale.dim]);
                    return findIndex === -1 ? 0 : findIndex;
                };
                colorIndexScale.koeff = 1 / ((domain.length || 1) + 1);

                var args = {
                    xScale: xScale,
                    yScale: yScale,
                    colorScale: colorScale,
                    colorIndexScale: colorIndexScale,
                    width: config.options.width,
                    height: config.options.height,
                    prettify: config.guide.prettify
                };

                var isHorizontal = config.flip || config.guide.flip;

                var d3Attrs = isHorizontal ? this._buildHorizontalDrawMethod(args) : this._buildVerticalDrawMethod(args);

                var updateBar = function updateBar() {
                    return this.attr(d3Attrs);
                };

                var updateBarContainer = function updateBarContainer() {
                    this.attr('class', 'i-role-bar-group');
                    var bars = this.selectAll('.bar').data(function (d) {
                        return d.values.map(function (item) {
                            return {
                                data: item,
                                uid: d.uid
                            };
                        });
                    });
                    bars.exit().remove();
                    bars.call(updateBar);
                    bars.enter().append('rect').call(updateBar);

                    self.subscribe(bars, function (_ref) {
                        var d = _ref.data;
                        return d;
                    });
                };

                var elements = options.container.selectAll('.i-role-bar-group').data(frames.map(function (fr) {
                    return { key: fr.key, values: fr.part(), uid: _this2.config.options.uid };
                }));
                elements.exit().remove();
                elements.call(updateBarContainer);
                elements.enter().append('g').call(updateBarContainer);
            }
        }, {
            key: '_buildVerticalDrawMethod',
            value: function _buildVerticalDrawMethod(_ref2) {
                var colorScale = _ref2.colorScale;
                var xScale = _ref2.xScale;
                var yScale = _ref2.yScale;
                var colorIndexScale = _ref2.colorIndexScale;
                var width = _ref2.width;
                var height = _ref2.height;
                var prettify = _ref2.prettify;

                var _buildDrawMethod2 = this._buildDrawMethod({
                    baseScale: xScale,
                    valsScale: yScale,
                    colorIndexScale: colorIndexScale,
                    defaultBaseAbsPosition: height
                });

                var calculateBarX = _buildDrawMethod2.calculateBarX;
                var calculateBarY = _buildDrawMethod2.calculateBarY;
                var calculateBarH = _buildDrawMethod2.calculateBarH;
                var calculateBarW = _buildDrawMethod2.calculateBarW;

                var minBarH = 1;

                return {
                    x: function x(_ref3) {
                        var d = _ref3.data;
                        return calculateBarX(d);
                    },
                    y: function y(_ref4) {
                        var d = _ref4.data;

                        var y = calculateBarY(d);

                        if (prettify) {
                            // decorate for better visual look & feel
                            var h = calculateBarH(d);
                            var isTooSmall = h < minBarH;
                            return isTooSmall && d[yScale.dim] > 0 ? y - minBarH : y;
                        } else {
                            return y;
                        }
                    },
                    height: function height(_ref5) {
                        var d = _ref5.data;

                        var h = calculateBarH(d);
                        if (prettify) {
                            // decorate for better visual look & feel
                            var y = d[yScale.dim];
                            return y === 0 ? h : Math.max(minBarH, h);
                        } else {
                            return h;
                        }
                    },
                    width: function width(_ref6) {
                        var d = _ref6.data;
                        return calculateBarW(d);
                    },
                    'class': function _class(_ref7) {
                        var d = _ref7.data;
                        return 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar ' + colorScale(d[colorScale.dim]);
                    }
                };
            }
        }, {
            key: '_buildHorizontalDrawMethod',
            value: function _buildHorizontalDrawMethod(_ref8) {
                var colorScale = _ref8.colorScale;
                var xScale = _ref8.xScale;
                var yScale = _ref8.yScale;
                var colorIndexScale = _ref8.colorIndexScale;
                var width = _ref8.width;
                var height = _ref8.height;
                var prettify = _ref8.prettify;

                var _buildDrawMethod3 = this._buildDrawMethod({
                    baseScale: yScale,
                    valsScale: xScale,
                    colorIndexScale: colorIndexScale,
                    defaultBaseAbsPosition: 0
                });

                var calculateBarX = _buildDrawMethod3.calculateBarX;
                var calculateBarY = _buildDrawMethod3.calculateBarY;
                var calculateBarH = _buildDrawMethod3.calculateBarH;
                var calculateBarW = _buildDrawMethod3.calculateBarW;

                var minBarH = 1;

                return {
                    y: function y(_ref9) {
                        var d = _ref9.data;
                        return calculateBarX(d);
                    },
                    x: function x(_ref10) {
                        var d = _ref10.data;

                        var x = calculateBarY(d);

                        if (prettify) {
                            // decorate for better visual look & feel
                            var h = calculateBarH(d);
                            var dx = d[xScale.dim];
                            var offset = 0;

                            if (dx === 0) {
                                offset = 0;
                            }
                            if (dx > 0) {
                                offset = h;
                            }
                            if (dx < 0) {
                                offset = 0 - minBarH;
                            }

                            var isTooSmall = h < minBarH;
                            return isTooSmall ? x + offset : x;
                        } else {
                            return x;
                        }
                    },
                    height: function height(_ref11) {
                        var d = _ref11.data;
                        return calculateBarW(d);
                    },
                    width: function width(_ref12) {
                        var d = _ref12.data;

                        var w = calculateBarH(d);

                        if (prettify) {
                            // decorate for better visual look & feel
                            var x = d[xScale.dim];
                            return x === 0 ? w : Math.max(minBarH, w);
                        } else {
                            return w;
                        }
                    },
                    'class': function _class(_ref13) {
                        var d = _ref13.data;
                        return 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar ' + colorScale(d[colorScale.dim]);
                    }
                };
            }
        }, {
            key: '_buildDrawMethod',
            value: function _buildDrawMethod(_ref14) {
                var valsScale = _ref14.valsScale;
                var baseScale = _ref14.baseScale;
                var colorIndexScale = _ref14.colorIndexScale;
                var defaultBaseAbsPosition = _ref14.defaultBaseAbsPosition;

                var minBarW = 5;
                var barsGap = 1;

                var baseAbsPos = (function () {
                    // TODO: create [.isContinues] property on scale object
                    var xMin = Math.min.apply(Math, _toConsumableArray(valsScale.domain()));
                    var isXNumber = !isNaN(xMin);

                    return isXNumber ? valsScale(xMin <= 0 ? 0 : xMin) : defaultBaseAbsPosition;
                })();

                var calculateIntervalWidth = function calculateIntervalWidth(d) {
                    return baseScale.stepSize(d[baseScale.dim]) * colorIndexScale.koeff || minBarW;
                };
                var calculateGapSize = function calculateGapSize(intervalWidth) {
                    return intervalWidth > 2 * barsGap ? barsGap : 0;
                };
                var calculateOffset = function calculateOffset(d) {
                    return baseScale.stepSize(d[baseScale.dim]) === 0 ? 0 : calculateIntervalWidth(d);
                };

                var calculateBarW = function calculateBarW(d) {
                    var intSize = calculateIntervalWidth(d);
                    var gapSize = calculateGapSize(intSize);
                    return intSize - 2 * gapSize;
                };

                var calculateBarH = function calculateBarH(d) {
                    return Math.abs(valsScale(d[valsScale.dim]) - baseAbsPos);
                };

                var calculateBarX = function calculateBarX(d) {
                    var dy = d[baseScale.dim];
                    var absTickMiddle = baseScale(dy) - baseScale.stepSize(dy) / 2;
                    var absBarMiddle = absTickMiddle - calculateBarW(d) / 2;
                    var absBarOffset = (colorIndexScale(d) + 1) * calculateOffset(d);

                    return absBarMiddle + absBarOffset;
                };

                var calculateBarY = function calculateBarY(d) {
                    return Math.min(baseAbsPos, valsScale(d[valsScale.dim]));
                };

                return {
                    calculateBarX: calculateBarX,
                    calculateBarY: calculateBarY,
                    calculateBarH: calculateBarH,
                    calculateBarW: calculateBarW
                };
            }
        }, {
            key: 'highlight',
            value: function highlight(filter) {

                this.config.options.container.selectAll('.bar').classed({
                    'graphical-report__highlighted': function graphicalReport__highlighted(_ref15) {
                        var d = _ref15.data;
                        return filter(d) === true;
                    },
                    'graphical-report__dimmed': function graphicalReport__dimmed(_ref16) {
                        var d = _ref16.data;
                        return filter(d) === false;
                    }
                });
            }
        }]);

        return Interval;
    })(_element.Element);

    exports.Interval = Interval;
});
define('error',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TauChartError = (function (_Error) {
        _inherits(TauChartError, _Error);

        function TauChartError(message, errorCode) {
            _classCallCheck(this, TauChartError);

            _get(Object.getPrototypeOf(TauChartError.prototype), 'constructor', this).call(this);
            this.name = 'TauChartError';
            this.message = message;
            this.errorCode = errorCode;
        }

        return TauChartError;
    })(Error);

    var errorCodes = {
        INVALID_DATA_TO_STACKED_BAR_CHART: 'INVALID_DATA_TO_STACKED_BAR_CHART',
        NO_DATA: 'NO_DATA',
        NOT_SUPPORTED_TYPE_CHART: 'NOT_SUPPORTED_TYPE_CHART',
        UNKNOWN_UNIT_TYPE: 'UNKNOWN_UNIT_TYPE'
    };

    exports.TauChartError = TauChartError;
    exports.errorCodes = errorCodes;
});
define('elements/element.interval.stacked',['exports', 'underscore', './../const', './element', './../error'], function (exports, _underscore, _const, _element, _error) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var _2 = _interopRequireDefault(_underscore);

    var StackedInterval = (function (_Element) {
        _inherits(StackedInterval, _Element);

        _createClass(StackedInterval, null, [{
            key: 'embedUnitFrameToSpec',
            value: function embedUnitFrameToSpec(cfg, spec) {

                var isHorizontal = cfg.flip;

                var stackedScaleName = isHorizontal ? cfg.x : cfg.y;
                var baseScaleName = isHorizontal ? cfg.y : cfg.x;
                var stackScale = spec.scales[stackedScaleName];
                var baseScale = spec.scales[baseScaleName];
                var baseDim = baseScale.dim;

                var prop = stackScale.dim;

                var groupsSums = cfg.frames.reduce(function (groups, f) {
                    var dataFrame = f.part();
                    var hasErrors = dataFrame.some(function (d) {
                        return typeof d[prop] !== 'number';
                    });
                    if (hasErrors) {
                        throw new _error.TauChartError('Stacked field [' + prop + '] should be a number', _error.errorCodes.INVALID_DATA_TO_STACKED_BAR_CHART);
                    }

                    dataFrame.reduce(function (hash, d) {
                        var stackedVal = d[prop];
                        var baseVal = d[baseDim];
                        var ttl = stackedVal >= 0 ? hash.positive : hash.negative;
                        ttl[baseVal] = ttl[baseVal] || 0;
                        ttl[baseVal] += stackedVal;
                        return hash;
                    }, groups);

                    return groups;
                }, { negative: {}, positive: {} });

                var negativeSum = Math.min.apply(Math, _toConsumableArray(_2['default'].values(groupsSums.negative).concat(0)));
                var positiveSum = Math.max.apply(Math, _toConsumableArray(_2['default'].values(groupsSums.positive).concat(0)));

                if (!stackScale.hasOwnProperty('max') || stackScale.max < positiveSum) {
                    stackScale.max = positiveSum;
                }

                if (!stackScale.hasOwnProperty('min') || stackScale.min > negativeSum) {
                    stackScale.min = negativeSum;
                }
            }
        }]);

        function StackedInterval(config) {
            var _this = this;

            _classCallCheck(this, StackedInterval);

            _get(Object.getPrototypeOf(StackedInterval.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = _2['default'].defaults(this.config.guide || {}, { prettify: true });

            this.on('highlight', function (sender, e) {
                return _this.highlight(e);
            });
        }

        _createClass(StackedInterval, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var config = this.config;
                this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
                this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
                this.color = fnCreateScale('color', config.color, {});

                var fitSize = function fitSize(w, h, maxRelLimit, srcSize, minimalSize) {
                    var minRefPoint = Math.min(w, h);
                    var minSize = minRefPoint * maxRelLimit;
                    return Math.max(minimalSize, Math.min(srcSize, minSize));
                };

                var width = config.options.width;
                var height = config.options.height;
                var g = config.guide;
                var minimalSize = 1;
                var maxRelLimit = 1;
                var isNotZero = function isNotZero(x) {
                    return x !== 0;
                };
                var minFontSize = _2['default'].min([g.x.tickFontHeight, g.y.tickFontHeight].filter(isNotZero)) * 0.5;
                var minTickStep = _2['default'].min([g.x.density, g.y.density].filter(isNotZero)) * 0.5;

                this.size = fnCreateScale('size', config.size, {
                    normalize: true,

                    func: 'linear',

                    min: 0,
                    max: fitSize(width, height, maxRelLimit, minTickStep, minimalSize),
                    mid: fitSize(width, height, maxRelLimit, minFontSize, minimalSize)
                });

                return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var self = this;

                var config = this.config;
                var options = config.options;
                var xScale = this.xScale;
                var yScale = this.yScale;
                var sizeScale = this.size;
                var colorScale = this.color;

                var isHorizontal = config.flip;

                var viewMapper;

                if (isHorizontal) {
                    viewMapper = function (totals, d) {
                        var x = d[xScale.dim];
                        var y = d[yScale.dim];

                        var item = {
                            y: y,
                            w: d[sizeScale.dim],
                            c: d[colorScale.dim]
                        };

                        if (x >= 0) {
                            totals.positive[y] = (totals.positive[y] || 0) + x;
                            item.x = totals.positive[y];
                            item.h = x;
                        } else {
                            var prevStack = totals.negative[y] || 0;
                            totals.negative[y] = prevStack + x;
                            item.x = prevStack;
                            item.h = Math.abs(x);
                        }

                        return item;
                    };
                } else {
                    viewMapper = function (totals, d) {
                        var x = d[xScale.dim];
                        var y = d[yScale.dim];

                        var item = {
                            x: x,
                            w: d[sizeScale.dim],
                            c: d[colorScale.dim]
                        };

                        if (y >= 0) {
                            totals.positive[x] = (totals.positive[x] || 0) + y;
                            item.y = totals.positive[x];
                            item.h = y;
                        } else {
                            var prevStack = totals.negative[x] || 0;
                            totals.negative[x] = prevStack + y;
                            item.y = prevStack;
                            item.h = Math.abs(y);
                        }

                        return item;
                    };
                }

                var d3Attrs = this._buildDrawModel(isHorizontal, {
                    xScale: xScale,
                    yScale: yScale,
                    sizeScale: sizeScale,
                    colorScale: colorScale,
                    prettify: config.guide.prettify
                });

                var updateBar = function updateBar() {
                    return this.attr(d3Attrs);
                };

                var uid = options.uid;
                var totals = {
                    positive: {},
                    negative: {}
                };
                var updateGroups = function updateGroups() {
                    this.attr('class', function (f) {
                        return 'frame-id-' + uid + ' frame-' + f.hash + ' i-role-bar-group';
                    }).call(function () {
                        var bars = this.selectAll('.bar-stack').data(function (frame) {
                            // var totals = {}; // if 1-only frame support is required
                            return frame.data.map(function (d) {
                                return { uid: uid, data: d, view: viewMapper(totals, d) };
                            });
                        });
                        bars.exit().remove();
                        bars.call(updateBar);
                        bars.enter().append('rect').call(updateBar);

                        self.subscribe(bars, function (_ref) {
                            var d = _ref.data;
                            return d;
                        }, function (d3Event, _ref2) {
                            var v = _ref2.view;

                            d3Event.chartElementViewModel = v;
                            return d3Event;
                        });
                    });
                };

                var mapper = function mapper(f) {
                    return { tags: f.key || {}, hash: f.hash(), data: f.part() };
                };
                var frameGroups = options.container.selectAll('.frame-id-' + uid).data(frames.map(mapper), function (f) {
                    return f.hash;
                });
                frameGroups.exit().remove();
                frameGroups.call(updateGroups);
                frameGroups.enter().append('g').call(updateGroups);

                return [];
            }
        }, {
            key: '_buildDrawModel',
            value: function _buildDrawModel(isHorizontal, _ref3) {
                var xScale = _ref3.xScale;
                var yScale = _ref3.yScale;
                var sizeScale = _ref3.sizeScale;
                var colorScale = _ref3.colorScale;
                var prettify = _ref3.prettify;

                // show at least 1px gap for bar to make it clickable
                var minH = 1;
                // default width for continues scales is 5px
                var minW = 5;
                var relW = 0.5;

                var calculateH;
                var calculateW;
                var calculateY;
                var calculateX;

                if (isHorizontal) {

                    calculateW = function (d) {
                        var w = Math.abs(xScale(d.x) - xScale(d.x - d.h));
                        if (prettify) {
                            w = Math.max(minH, w);
                        }
                        return w;
                    };

                    calculateH = function (d) {
                        var h = (yScale.stepSize(d.y) || minW) * relW * sizeScale(d.w);
                        if (prettify) {
                            h = Math.max(minH, h);
                        }
                        return h;
                    };

                    calculateX = function (d) {
                        return xScale(d.x - d.h);
                    };
                    calculateY = function (d) {
                        return yScale(d.y) - calculateH(d) / 2;
                    };
                } else {

                    calculateW = function (d) {
                        var w = (xScale.stepSize(d.x) || minW) * relW * sizeScale(d.w);
                        if (prettify) {
                            w = Math.max(minH, w);
                        }
                        return w;
                    };

                    calculateH = function (d) {
                        var h = Math.abs(yScale(d.y) - yScale(d.y - d.h));
                        if (prettify) {
                            h = Math.max(minH, h);
                        }
                        return h;
                    };

                    calculateX = function (d) {
                        return xScale(d.x) - calculateW(d) / 2;
                    };
                    calculateY = function (d) {
                        return yScale(d.y);
                    };
                }

                return {
                    x: function x(_ref4) {
                        var d = _ref4.view;
                        return calculateX(d);
                    },
                    y: function y(_ref5) {
                        var d = _ref5.view;
                        return calculateY(d);
                    },
                    height: function height(_ref6) {
                        var d = _ref6.view;
                        return calculateH(d);
                    },
                    width: function width(_ref7) {
                        var d = _ref7.view;
                        return calculateW(d);
                    },
                    'class': function _class(_ref8) {
                        var d = _ref8.view;
                        return 'i-role-element i-role-datum bar-stack ' + _const.CSS_PREFIX + 'bar-stacked ' + colorScale(d.c);
                    }
                };
            }
        }, {
            key: 'highlight',
            value: function highlight(filter) {

                this.config.options.container.selectAll('.bar-stack').classed({
                    'graphical-report__highlighted': function graphicalReport__highlighted(_ref9) {
                        var d = _ref9.data;
                        return filter(d) === true;
                    },
                    'graphical-report__dimmed': function graphicalReport__dimmed(_ref10) {
                        var d = _ref10.data;
                        return filter(d) === false;
                    }
                });
            }
        }]);

        return StackedInterval;
    })(_element.Element);

    exports.StackedInterval = StackedInterval;
});
define('utils/utils',['exports', '../elements/element.point', '../elements/element.line', '../elements/element.interval', '../elements/element.interval.stacked'], function (exports, _elementsElementPoint, _elementsElementLine, _elementsElementInterval, _elementsElementIntervalStacked) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var traverseJSON = function traverseJSON(srcObject, byProperty, fnSelectorPredicates, funcTransformRules) {

        var rootRef = funcTransformRules(fnSelectorPredicates(srcObject), srcObject);

        (rootRef[byProperty] || []).forEach(function (unit) {
            return traverseJSON(unit, byProperty, fnSelectorPredicates, funcTransformRules);
        });

        return rootRef;
    };

    var traverseSpec = function traverseSpec(root, enterFn, exitFn) {
        var level = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

        var shouldContinue = enterFn(root, level);
        if (shouldContinue) {
            (root.units || []).map(function (rect) {
                return traverseSpec(rect, enterFn, exitFn, level + 1);
            });
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
            canCopy: function canCopy(source) {
                return false;
            },

            // starts the deep copying process by creating the copy object.  You
            // can initialize any properties you want, but you can't call recursively
            // into the DeeopCopyAlgorithm.
            create: function create(source) {},

            // Completes the deep copy of the source object by populating any properties
            // that need to be recursively deep copied.  You can do this by using the
            // provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
            // cyclic references for objects already deepCopied, including the source object
            // itself.  The "result" passed in is the object returned from create().
            populate: function populate(deepCopyAlgorithm, source, result) {}
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
            cacheResult: function cacheResult(source, result) {
                this.copiedObjects.push([source, result]);
            },

            // Returns the cached copy of a given object, or undefined if it's an
            // object we haven't seen before.
            getCachedResult: function getCachedResult(source) {
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
            deepCopy: function deepCopy(source) {
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
            applyDeepCopier: function applyDeepCopier(deepCopier, source) {
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

            canCopy: function canCopy() {
                return true;
            },

            create: function create(source) {
                if (source instanceof source.constructor) {
                    return clone(source.constructor.prototype);
                } else {
                    return {};
                }
            },

            populate: function populate(deepCopy, source, result) {
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
            canCopy: function canCopy(source) {
                return source instanceof Array;
            },

            create: function create(source) {
                return new source.constructor();
            },

            populate: function populate(deepCopy, source, result) {
                for (var i = 0; i < source.length; i++) {
                    result.push(deepCopy(source[i]));
                }
                return result;
            }
        });

        // Date copier
        deepCopy.register({
            canCopy: function canCopy(source) {
                return source instanceof Date;
            },

            create: function create(source) {
                return new Date(source);
            }
        });

        return deepCopy;
    })();
    var chartElement = [_elementsElementInterval.Interval, _elementsElementPoint.Point, _elementsElementLine.Line, _elementsElementIntervalStacked.StackedInterval];
    var utils = {
        clone: function clone(obj) {
            return deepClone(obj);
        },
        isArray: function isArray(obj) {
            return Array.isArray(obj);
        },
        isChartElement: function isChartElement(element) {
            return chartElement.some(function (Element) {
                return element instanceof Element;
            });
        },
        isLineElement: function isLineElement(element) {
            return element instanceof _elementsElementLine.Line;
        },
        autoScale: function autoScale(domain) {

            var m = 10;

            var low = Math.min.apply(null, domain);
            var top = Math.max.apply(null, domain);

            if (low === top) {
                var k = top >= 0 ? -1 : 1;
                var d = top || 1;
                top = top - k * d / m;
            }

            var extent = [low, top];
            var span = extent[1] - extent[0];
            var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
            var err = m / span * step;

            var correction = [[0.15, 10], [0.35, 5], [0.75, 2], [1.00, 1], [2.00, 1]];

            var i = -1;
            // jscs:disable disallowEmptyBlocks
            while (err > correction[++i][0]) {}
            // jscs:enable disallowEmptyBlocks

            step *= correction[i][1];

            extent[0] = Math.floor(extent[0] / step) * step;
            extent[1] = Math.ceil(extent[1] / step) * step;

            var deltaLow = low - extent[0];
            var deltaTop = extent[1] - top;

            var limit = step / 2;

            if (low >= 0) {
                // include 0 by default
                extent[0] = 0;
            } else {
                var koeffLow = deltaLow <= limit ? step : 0;
                extent[0] = extent[0] - koeffLow;
            }

            if (top <= 0) {
                // include 0 by default
                extent[1] = 0;
            } else {
                var koeffTop = deltaTop <= limit ? step : 0;
                extent[1] = extent[1] + koeffTop;
            }

            return [parseFloat(extent[0].toFixed(15)), parseFloat(extent[1].toFixed(15))];
        },

        traverseJSON: traverseJSON,

        generateHash: function generateHash(str) {
            var r = btoa(encodeURIComponent(str)).replace(/=/g, '_');
            if (!hashMap.hasOwnProperty(r)) {
                hashMap[r] = 'H' + ++hashGen;
            }
            return hashMap[r];
        },

        generateRatioFunction: function generateRatioFunction(dimPropName, paramsList, chartInstanceRef) {

            var unify = function unify(v) {
                return v instanceof Date ? v.getTime() : v;
            };

            var dataNewSnap = 0;
            var dataPrevRef = null;
            var xHash = _.memoize(function (data, keys) {
                return _(data).chain().map(function (row) {
                    return keys.reduce(function (r, k) {
                        return r.concat(unify(row[k]));
                    }, []);
                }).uniq(function (t) {
                    return JSON.stringify(t);
                }).reduce(function (memo, t) {
                    var k = t[0];
                    memo[k] = memo[k] || 0;
                    memo[k] += 1;
                    return memo;
                }, {}).value();
            }, function (data, keys) {
                var seed = dataPrevRef === data ? dataNewSnap : ++dataNewSnap;
                dataPrevRef = data;
                return keys.join('') + '-' + seed;
            });

            return function (key, size, varSet) {

                var facetSize = varSet.length;

                var chartSpec = chartInstanceRef.getSpec();

                var data = chartSpec.sources['/'].data;

                var level2Guide = chartSpec.unit.units[0].guide || {};
                level2Guide.padding = level2Guide.padding || { l: 0, r: 0, t: 0, b: 0 };

                var pad = 0;
                if (dimPropName === 'x') {
                    pad = level2Guide.padding.l + level2Guide.padding.r;
                } else if (dimPropName === 'y') {
                    pad = level2Guide.padding.t + level2Guide.padding.b;
                }

                var xTotal = function xTotal(keys) {
                    return _.values(xHash(data, keys)).reduce(function (sum, v) {
                        return sum + v;
                    }, 0);
                };

                var xPart = function xPart(keys, k) {
                    return xHash(data, keys)[k];
                };

                var totalItems = xTotal(paramsList);

                var tickPxSize = (size - facetSize * pad) / totalItems;
                var countOfTicksInTheFacet = xPart(paramsList, key);

                return (countOfTicksInTheFacet * tickPxSize + pad) / size;
            };
        },

        traverseSpec: traverseSpec,

        isSpecRectCoordsOnly: function isSpecRectCoordsOnly(root) {

            var isApplicable = true;

            try {
                utils.traverseSpec(root, function (unit) {
                    if (unit.type.indexOf('COORDS.') === 0 && unit.type !== 'COORDS.RECT') {
                        throw new Error('Not applicable');
                    }
                }, function (unit) {
                    return unit;
                });
            } catch (e) {
                if (e.message === 'Not applicable') {
                    isApplicable = false;
                }
            }

            return isApplicable;
        }
    };

    exports.utils = utils;
});
define('unit-domain-period-generator',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var PERIODS_MAP = {

        day: {
            cast: function cast(date) {
                return new Date(date.setHours(0, 0, 0, 0));
            },
            next: function next(prevDate) {
                return new Date(prevDate.setDate(prevDate.getDate() + 1));
            }
        },

        week: {
            cast: function cast(date) {
                date = new Date(date.setHours(0, 0, 0, 0));
                date = new Date(date.setDate(date.getDate() - date.getDay()));
                return date;
            },
            next: function next(prevDate) {
                return new Date(prevDate.setDate(prevDate.getDate() + 7));
            }
        },

        month: {
            cast: function cast(date) {
                date = new Date(date.setHours(0, 0, 0, 0));
                date = new Date(date.setDate(1));
                return date;
            },
            next: function next(prevDate) {
                return new Date(prevDate.setMonth(prevDate.getMonth() + 1));
            }
        },

        quarter: {
            cast: function cast(date) {
                date = new Date(date.setHours(0, 0, 0, 0));
                date = new Date(date.setDate(1));
                var currentMonth = date.getMonth();
                var firstQuarterMonth = currentMonth - currentMonth % 3;
                return new Date(date.setMonth(firstQuarterMonth));
            },
            next: function next(prevDate) {
                return new Date(prevDate.setMonth(prevDate.getMonth() + 3));
            }
        },

        year: {
            cast: function cast(date) {
                date = new Date(date.setHours(0, 0, 0, 0));
                date = new Date(date.setDate(1));
                date = new Date(date.setMonth(0));
                return date;
            },
            next: function next(prevDate) {
                return new Date(prevDate.setFullYear(prevDate.getFullYear() + 1));
            }
        }
    };

    var UnitDomainPeriodGenerator = {

        add: function add(periodAlias, obj) {
            PERIODS_MAP[periodAlias.toLowerCase()] = obj;
            return this;
        },

        get: function get(periodAlias) {
            return PERIODS_MAP[periodAlias.toLowerCase()];
        },

        generate: function generate(lTick, rTick, periodAlias) {
            var r = [];
            var period = PERIODS_MAP[periodAlias.toLowerCase()];
            if (period) {
                var last = period.cast(new Date(rTick));
                var curr = period.cast(new Date(lTick));
                r.push(curr);
                while ((curr = period.next(new Date(curr))) <= last) {
                    r.push(curr);
                }
            }
            return r;
        }
    };

    exports.UnitDomainPeriodGenerator = UnitDomainPeriodGenerator;
});
define('algebra',['exports', 'underscore', './unit-domain-period-generator'], function (exports, _underscore, _unitDomainPeriodGenerator) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    var _2 = _interopRequireDefault(_underscore);

    var unify = function unify(v) {
        return v instanceof Date ? v.getTime() : v;
    };

    var FramesAlgebra = {

        cross: function cross(dataFn, dimX, dimY) {

            var data = dataFn();

            var domainX = (0, _2['default'])(data).chain().pluck(dimX).unique(unify).value();
            var domainY = (0, _2['default'])(data).chain().pluck(dimY).unique(unify).value();

            var domX = domainX.length === 0 ? [null] : domainX;
            var domY = domainY.length === 0 ? [null] : domainY;

            return (0, _2['default'])(domY).reduce(function (memo, rowVal) {

                return memo.concat((0, _2['default'])(domX).map(function (colVal) {

                    var r = {};

                    if (dimX) {
                        r[dimX] = unify(colVal);
                    }

                    if (dimY) {
                        r[dimY] = unify(rowVal);
                    }

                    return r;
                }));
            }, []);
        },

        cross_period: function cross_period(dataFn, dimX, dimY, xPeriod, yPeriod) {
            var data = dataFn();

            var domainX = (0, _2['default'])(data).chain().pluck(dimX).unique(unify).value();
            var domainY = (0, _2['default'])(data).chain().pluck(dimY).unique(unify).value();

            var domX = domainX.length === 0 ? [null] : domainX;
            var domY = domainY.length === 0 ? [null] : domainY;

            if (xPeriod) {
                domX = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(_2['default'].min(domainX), _2['default'].max(domainX), xPeriod);
            }

            if (yPeriod) {
                domY = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(_2['default'].min(domainY), _2['default'].max(domainY), yPeriod);
            }

            return (0, _2['default'])(domY).reduce(function (memo, rowVal) {

                return memo.concat((0, _2['default'])(domX).map(function (colVal) {

                    var r = {};

                    if (dimX) {
                        r[dimX] = unify(colVal);
                    }

                    if (dimY) {
                        r[dimY] = unify(rowVal);
                    }

                    return r;
                }));
            }, []);
        },

        groupBy: function groupBy(dataFn, dim) {
            var data = dataFn();
            var domainX = (0, _2['default'])(data).chain().pluck(dim).unique(unify).value();
            return domainX.map(function (x) {
                return _defineProperty({}, dim, unify(x));
            });
        },

        none: function none() {
            return [null];
        }
    };

    exports.FramesAlgebra = FramesAlgebra;
});
define('data-frame',['exports', './utils/utils'], function (exports, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var DataFrame = (function () {
        function DataFrame(_ref, dataSource) {
            var key = _ref.key;
            var pipe = _ref.pipe;
            var source = _ref.source;
            var units = _ref.units;
            var transformations = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            _classCallCheck(this, DataFrame);

            this.key = key;
            this.pipe = pipe || [];
            this.source = source;
            this.units = units;

            this._frame = { key: key, source: source, pipe: this.pipe };
            this._data = dataSource;
            this._pipeReducer = function (data, pipeCfg) {
                return transformations[pipeCfg.type](data, pipeCfg.args);
            };
        }

        _createClass(DataFrame, [{
            key: 'hash',
            value: function hash() {
                var x = [this._frame.pipe, this._frame.key, this._frame.source].map(JSON.stringify).join('');

                return _utilsUtils.utils.generateHash(x);
            }
        }, {
            key: 'full',
            value: function full() {
                return this._data;
            }
        }, {
            key: 'part',
            value: function part() {
                var pipeMapper = arguments.length <= 0 || arguments[0] === undefined ? function (x) {
                    return x;
                } : arguments[0];

                return this._frame.pipe.map(pipeMapper).reduce(this._pipeReducer, this._data);
            }
        }]);

        return DataFrame;
    })();

    exports.DataFrame = DataFrame;
});
define('charts/tau.gpl',['exports', '../event', '../utils/utils', '../utils/utils-dom', '../const', '../algebra', '../data-frame'], function (exports, _event, _utilsUtils, _utilsUtilsDom, _const, _algebra, _dataFrame) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var cast = function cast(v) {
        return _.isDate(v) ? v.getTime() : v;
    };

    var GPL = (function (_Emitter) {
        _inherits(GPL, _Emitter);

        function GPL(config, scalesRegistryInstance, unitsRegistry) {
            _classCallCheck(this, GPL);

            _get(Object.getPrototypeOf(GPL.prototype), 'constructor', this).call(this);

            this.config = config;

            this.config.settings = this.config.settings || {};
            this.sources = config.sources;

            this.unitSet = unitsRegistry;
            this.scalesHub = scalesRegistryInstance;

            this.scales = config.scales;

            this.transformations = _.extend(config.transformations || {}, {
                where: function where(data, tuple) {
                    var predicates = _.map(tuple, function (v, k) {
                        return function (row) {
                            return cast(row[k]) === v;
                        };
                    });
                    return _(data).filter(function (row) {
                        return _.every(predicates, function (p) {
                            return p(row);
                        });
                    });
                }
            });

            this.onUnitDraw = config.onUnitDraw;
            this.onUnitsStructureExpanded = config.onUnitsStructureExpanded || function (x) {
                return x;
            };
        }

        _createClass(GPL, [{
            key: 'renderTo',
            value: function renderTo(target, xSize) {

                var d3Target = d3.select(target);

                this.config.settings.size = xSize || _.defaults(_utilsUtilsDom.utilsDom.getContainerSize(d3Target.node()));

                this.root = this._expandUnitsStructure(this.config.unit);

                this._adaptSpecToUnitsStructure(this.root, this.config);

                this.onUnitsStructureExpanded(this.config);

                var xSvg = d3Target.selectAll('svg').data([1]);

                var size = this.config.settings.size;

                var attr = {
                    'class': _const.CSS_PREFIX + 'svg',
                    width: size.width,
                    height: size.height
                };

                xSvg.attr(attr);

                xSvg.enter().append('svg').attr(attr).append('g').attr('class', _const.CSS_PREFIX + 'cell cell frame-root');

                this.root.options = {
                    container: d3Target.select('.frame-root'),
                    frameId: 'root',
                    left: 0,
                    top: 0,
                    width: size.width,
                    height: size.height
                };

                this._drawUnitsStructure(this.root, this._datify({
                    source: this.root.expression.source,
                    pipe: []
                }));
            }
        }, {
            key: '_expandUnitsStructure',
            value: function _expandUnitsStructure(root) {
                var _this = this;

                var parentPipe = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

                var self = this;

                if (root.expression.operator === false) {

                    root.frames = root.frames.map(function (f) {
                        return self._datify(f);
                    });
                } else {

                    var expr = this._parseExpression(root.expression, parentPipe);

                    root.transformation = root.transformation || [];

                    root.frames = expr.exec().map(function (tuple) {

                        var flow = expr.inherit ? parentPipe : [];
                        var pipe = flow.concat([{ type: 'where', args: tuple }]).concat(root.transformation);

                        return self._datify({
                            key: tuple,
                            pipe: pipe,
                            source: expr.source,
                            units: root.units ? root.units.map(function (unit) {
                                var clone = _utilsUtils.utils.clone(unit);
                                // pass guide by reference
                                clone.guide = unit.guide;
                                return clone;
                            }) : []
                        });
                    });
                }

                root.frames.forEach(function (f) {
                    return f.units.forEach(function (unit) {
                        return _this._expandUnitsStructure(unit, f.pipe);
                    });
                });

                return root;
            }
        }, {
            key: '_adaptSpecToUnitsStructure',
            value: function _adaptSpecToUnitsStructure(root, spec) {
                var _this2 = this;

                var UnitClass = this.unitSet.get(root.type);
                if (UnitClass.embedUnitFrameToSpec) {
                    UnitClass.embedUnitFrameToSpec(root, spec); // static method
                }

                root.frames.forEach(function (f) {
                    return f.units.forEach(function (unit) {
                        return _this2._adaptSpecToUnitsStructure(unit, spec);
                    });
                });

                return root;
            }
        }, {
            key: '_drawUnitsStructure',
            value: function _drawUnitsStructure(unitConfig, rootFrame) {
                var rootUnit = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

                var self = this;

                // Rule to cancel parent frame inheritance
                var passFrame = unitConfig.expression.inherit === false ? null : rootFrame;

                var UnitClass = self.unitSet.get(unitConfig.type);
                var unitNode = new UnitClass(unitConfig);
                unitNode.parentUnit = rootUnit;
                unitNode.createScales(function (type, alias, dynamicProps) {
                    var key = alias || type + ':default';
                    return self.scalesHub.createScaleInfo(self.scales[key], passFrame).create(dynamicProps);
                }).drawFrames(unitConfig.frames, (function (rootUnit) {
                    return function (rootConf, rootFrame) {
                        self._drawUnitsStructure.bind(self)(rootConf, rootFrame, rootUnit);
                    };
                })(unitNode));

                if (self.onUnitDraw) {
                    self.onUnitDraw(unitNode);
                }

                return unitConfig;
            }
        }, {
            key: '_datify',
            value: function _datify(frame) {
                return new _dataFrame.DataFrame(frame, this.sources[frame.source].data, this.transformations);
            }
        }, {
            key: '_parseExpression',
            value: function _parseExpression(expr, parentPipe) {
                var _this3 = this;

                var funcName = expr.operator || 'none';
                var srcAlias = expr.source;
                var bInherit = expr.inherit !== false; // true by default
                var funcArgs = expr.params;

                var frameConfig = {
                    source: srcAlias,
                    pipe: bInherit ? parentPipe : []
                };

                var dataFn = function dataFn() {
                    return _this3._datify(frameConfig).part();
                };

                var func = _algebra.FramesAlgebra[funcName];

                if (!func) {
                    throw new Error(funcName + ' operator is not supported');
                }

                return {
                    source: srcAlias,
                    inherit: bInherit,
                    func: func,
                    args: funcArgs,
                    exec: function exec() {
                        return func.apply(null, [dataFn].concat(funcArgs));
                    }
                };
            }
        }]);

        return GPL;
    })(_event.Emitter);

    exports.GPL = GPL;
});
define('api/balloon',['exports', '../const'], function (exports, _const) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    // jshint ignore: start
    var classes = function classes(el) {
        return {
            add: function add(name) {
                el.classList.add(name);
            },
            remove: function remove(name) {
                el.classList.remove(name);
            }
        };
    };

    var indexOf = function indexOf(arr, obj) {
        return arr.indexOf(obj);
    };

    /**
     * Globals.
     */
    var win = window;
    var doc = win.document;
    var docEl = doc.documentElement;
    var verticalPlaces = ['top', 'bottom'];

    /**
     * Poor man's shallow object extend.
     *
     * @param {Object} a
     * @param {Object} b
     *
     * @return {Object}
     */
    function extend(a, b) {
        for (var key in b) {
            // jshint ignore:line
            a[key] = b[key];
        }
        return a;
    }

    /**
     * Checks whether object is window.
     *
     * @param {Object} obj
     *
     * @return {Boolean}
     */
    function isWin(obj) {
        return obj && obj.setInterval != null;
    }

    /**
     * Returns element's object with `left`, `top`, `bottom`, `right`, `width`, and `height`
     * properties indicating the position and dimensions of element on a page.
     *
     * @param {Element} element
     *
     * @return {Object}
     */
    function position(element) {
        var winTop = win.pageYOffset || docEl.scrollTop;
        var winLeft = win.pageXOffset || docEl.scrollLeft;
        var box = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };

        if (isWin(element)) {
            box.width = win.innerWidth || docEl.clientWidth;
            box.height = win.innerHeight || docEl.clientHeight;
        } else if (docEl.contains(element) && element.getBoundingClientRect != null) {
            extend(box, element.getBoundingClientRect());
            // width & height don't exist in <IE9
            box.width = box.right - box.left;
            box.height = box.bottom - box.top;
        } else {
            return box;
        }

        box.top = box.top + winTop - docEl.clientTop;
        box.left = box.left + winLeft - docEl.clientLeft;
        box.right = box.left + box.width;
        box.bottom = box.top + box.height;

        return box;
    }
    /**
     * Parse integer from strings like '-50px'.
     *
     * @param {Mixed} value
     *
     * @return {Integer}
     */
    function parsePx(value) {
        return 0 | Math.round(String(value).replace(/[^\-0-9.]/g, ''));
    }

    /**
     * Get computed style of element.
     *
     * @param {Element} element
     *
     * @type {String}
     */
    var style = win.getComputedStyle;

    /**
     * Returns transition duration of element in ms.
     *
     * @param {Element} element
     *
     * @return {Integer}
     */
    function transitionDuration(element) {
        var duration = String(style(element, transitionDuration.propName));
        var match = duration.match(/([0-9.]+)([ms]{1,2})/);
        if (match) {
            duration = Number(match[1]);
            if (match[2] === 's') {
                duration *= 1000;
            }
        }
        return 0 | duration;
    }
    transitionDuration.propName = (function () {
        var element = doc.createElement('div');
        var names = ['transitionDuration', 'webkitTransitionDuration'];
        var value = '1s';
        for (var i = 0; i < names.length; i++) {
            element.style[names[i]] = value;
            if (element.style[names[i]] === value) {
                return names[i];
            }
        }
    })();
    var objectCreate = Object.create;
    /**
     * Tooltip construnctor.
     *
     * @param {String|Element} content
     * @param {Object}         options
     *
     * @return {Tooltip}
     */
    function Tooltip(content, options) {
        if (!(this instanceof Tooltip)) {
            return new Tooltip(content, options);
        }
        this.hidden = 1;
        this.options = extend(objectCreate(Tooltip.defaults), options);
        this._createElement();
        if (content) {
            this.content(content);
        }
    }

    /**
     * Creates a tooltip element.
     *
     * @return {Void}
     */
    Tooltip.prototype._createElement = function () {
        this.element = doc.createElement('div');
        this.classes = classes(this.element);
        this.classes.add(this.options.baseClass);
        var propName;
        for (var i = 0; i < Tooltip.classTypes.length; i++) {
            propName = Tooltip.classTypes[i] + 'Class';
            if (this.options[propName]) {
                this.classes.add(this.options[propName]);
            }
        }
    };

    /**
     * Changes tooltip's type class type.
     *
     * @param {String} name
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.type = function (name) {
        return this.changeClassType('type', name);
    };

    /**
     * Changes tooltip's effect class type.
     *
     * @param {String} name
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.effect = function (name) {
        return this.changeClassType('effect', name);
    };

    /**
     * Changes class type.
     *
     * @param {String} propName
     * @param {String} newClass
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.changeClassType = function (propName, newClass) {
        propName += 'Class';
        if (this.options[propName]) {
            this.classes.remove(this.options[propName]);
        }
        this.options[propName] = newClass;
        if (newClass) {
            this.classes.add(newClass);
        }
        return this;
    };

    /**
     * Updates tooltip's dimensions.
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.updateSize = function () {
        if (this.hidden) {
            this.element.style.visibility = 'hidden';
            doc.body.appendChild(this.element);
        }
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        if (this.spacing == null) {
            this.spacing = this.options.spacing != null ? this.options.spacing : parsePx(style(this.element, 'top'));
        }
        if (this.hidden) {
            doc.body.removeChild(this.element);
            this.element.style.visibility = '';
        } else {
            this.position();
        }
        return this;
    };

    /**
     * Change tooltip content.
     *
     * When tooltip is visible, its size is automatically
     * synced and tooltip correctly repositioned.
     *
     * @param {String|Element} content
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.content = function (content) {
        if (typeof content === 'object') {
            this.element.innerHTML = '';
            this.element.appendChild(content);
        } else {
            this.element.innerHTML = content;
        }
        this.updateSize();
        return this;
    };

    /**
     * Pick new place tooltip should be displayed at.
     *
     * When the tooltip is visible, it is automatically positioned there.
     *
     * @param {String} place
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.place = function (place) {
        this.options.place = place;
        if (!this.hidden) {
            this.position();
        }
        return this;
    };

    /**
     * Attach tooltip to an element.
     *
     * @param {Element} element
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.attach = function (element) {
        this.attachedTo = element;
        if (!this.hidden) {
            this.position();
        }
        return this;
    };

    /**
     * Detach tooltip from element.
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.detach = function () {
        this.hide();
        this.attachedTo = null;
        return this;
    };

    /**
     * Pick the most reasonable place for target position.
     *
     * @param {Object} target
     *
     * @return {Tooltip}
     */
    Tooltip.prototype._pickPlace = function (target) {
        if (!this.options.auto) {
            return this.options.place;
        }
        var winPos = position(win);
        var place = this.options.place.split('-');
        var spacing = this.spacing;

        if (indexOf(verticalPlaces, place[0]) !== -1) {
            if (target.top - this.height - spacing <= winPos.top) {
                place[0] = 'bottom';
            } else if (target.bottom + this.height + spacing >= winPos.bottom) {
                place[0] = 'top';
            }
            switch (place[1]) {
                case 'left':
                    if (target.right - this.width <= winPos.left) {
                        place[1] = 'right';
                    }
                    break;
                case 'right':
                    if (target.left + this.width >= winPos.right) {
                        place[1] = 'left';
                    }
                    break;
                default:
                    if (target.left + target.width / 2 + this.width / 2 >= winPos.right) {
                        place[1] = 'left';
                    } else if (target.right - target.width / 2 - this.width / 2 <= winPos.left) {
                        place[1] = 'right';
                    }
            }
        } else {
            if (target.left - this.width - spacing <= winPos.left) {
                place[0] = 'right';
            } else if (target.right + this.width + spacing >= winPos.right) {
                place[0] = 'left';
            }
            switch (place[1]) {
                case 'top':
                    if (target.bottom - this.height <= winPos.top) {
                        place[1] = 'bottom';
                    }
                    break;
                case 'bottom':
                    if (target.top + this.height >= winPos.bottom) {
                        place[1] = 'top';
                    }
                    break;
                default:
                    if (target.top + target.height / 2 + this.height / 2 >= winPos.bottom) {
                        place[1] = 'top';
                    } else if (target.bottom - target.height / 2 - this.height / 2 <= winPos.top) {
                        place[1] = 'bottom';
                    }
            }
        }

        return place.join('-');
    };

    /**
     * Position the element to an element or a specific coordinates.
     *
     * @param {Integer|Element} x
     * @param {Integer}         y
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.position = function (x, y) {
        if (this.attachedTo) {
            x = this.attachedTo;
        }
        if (x == null && this._p) {
            x = this._p[0];
            y = this._p[1];
        } else {
            this._p = [x, y];
        }
        var target = typeof x === 'number' ? {
            left: 0 | x,
            right: 0 | x,
            top: 0 | y,
            bottom: 0 | y,
            width: 0,
            height: 0
        } : position(x);
        var spacing = this.spacing;
        var newPlace = this._pickPlace(target);

        // Add/Change place class when necessary
        if (newPlace !== this.curPlace) {
            if (this.curPlace) {
                this.classes.remove(this.curPlace);
            }
            this.classes.add(newPlace);
            this.curPlace = newPlace;
        }

        // Position the tip
        var top, left;
        switch (this.curPlace) {
            case 'top':
                top = target.top - this.height - spacing;
                left = target.left + target.width / 2 - this.width / 2;
                break;
            case 'top-left':
                top = target.top - this.height - spacing;
                left = target.right - this.width;
                break;
            case 'top-right':
                top = target.top - this.height - spacing;
                left = target.left;
                break;

            case 'bottom':
                top = target.bottom + spacing;
                left = target.left + target.width / 2 - this.width / 2;
                break;
            case 'bottom-left':
                top = target.bottom + spacing;
                left = target.right - this.width;
                break;
            case 'bottom-right':
                top = target.bottom + spacing;
                left = target.left;
                break;

            case 'left':
                top = target.top + target.height / 2 - this.height / 2;
                left = target.left - this.width - spacing;
                break;
            case 'left-top':
                top = target.bottom - this.height;
                left = target.left - this.width - spacing;
                break;
            case 'left-bottom':
                top = target.top;
                left = target.left - this.width - spacing;
                break;

            case 'right':
                top = target.top + target.height / 2 - this.height / 2;
                left = target.right + spacing;
                break;
            case 'right-top':
                top = target.bottom - this.height;
                left = target.right + spacing;
                break;
            case 'right-bottom':
                top = target.top;
                left = target.right + spacing;
                break;
        }

        // Set tip position & class
        this.element.style.top = Math.round(top) + 'px';
        this.element.style.left = Math.round(left) + 'px';

        return this;
    };

    /**
     * Show the tooltip.
     *
     * @param {Integer|Element} x
     * @param {Integer}         y
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.show = function (x, y) {
        x = this.attachedTo ? this.attachedTo : x;

        // Clear potential ongoing animation
        clearTimeout(this.aIndex);

        // Position the element when requested
        if (x != null) {
            this.position(x, y);
        }

        // Stop here if tip is already visible
        if (this.hidden) {
            this.hidden = 0;
            doc.body.appendChild(this.element);
        }

        // Make tooltip aware of window resize
        if (this.attachedTo) {
            this._aware();
        }

        // Trigger layout and kick in the transition
        if (this.options.inClass) {
            if (this.options.effectClass) {
                void this.element.clientHeight;
            }
            this.classes.add(this.options.inClass);
        }

        return this;
    };
    Tooltip.prototype.getElement = function (x, y) {
        return this.element;
    };

    /**
     * Hide the tooltip.
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.hide = function () {
        if (this.hidden) {
            return;
        }

        var self = this;
        var duration = 0;

        // Remove .in class and calculate transition duration if any
        if (this.options.inClass) {
            this.classes.remove(this.options.inClass);
            if (this.options.effectClass) {
                duration = transitionDuration(this.element);
            }
        }

        // Remove tip from window resize awareness
        if (this.attachedTo) {
            this._unaware();
        }

        // Remove the tip from the DOM when transition is done
        clearTimeout(this.aIndex);
        this.aIndex = setTimeout(function () {
            self.aIndex = 0;
            doc.body.removeChild(self.element);
            self.hidden = 1;
        }, duration);

        return this;
    };

    Tooltip.prototype.toggle = function (x, y) {
        return this[this.hidden ? 'show' : 'hide'](x, y);
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.aIndex);
        this._unaware();
        if (!this.hidden) {
            doc.body.removeChild(this.element);
        }
        this.element = this.options = null;
    };

    /**
     * Make the tip window resize aware.
     *
     * @return {Void}
     */
    Tooltip.prototype._aware = function () {
        var index = indexOf(Tooltip.winAware, this);
        if (index === -1) {
            Tooltip.winAware.push(this);
        }
    };

    /**
     * Remove the window resize awareness.
     *
     * @return {Void}
     */
    Tooltip.prototype._unaware = function () {
        var index = indexOf(Tooltip.winAware, this);
        if (index !== -1) {
            Tooltip.winAware.splice(index, 1);
        }
    };

    /**
     * Handles repositioning of tooltips on window resize.
     *
     * @return {Void}
     */
    Tooltip.reposition = (function () {

        var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
            return setTimeout(fn, 17);
        };
        var rIndex;

        function requestReposition() {
            if (rIndex || !Tooltip.winAware.length) {
                return;
            }
            rIndex = rAF(reposition);
        }

        function reposition() {
            rIndex = 0;
            var tip;
            for (var i = 0, l = Tooltip.winAware.length; i < l; i++) {
                tip = Tooltip.winAware[i];
                tip.position();
            }
        }

        return requestReposition;
    })();
    Tooltip.winAware = [];

    // Bind winAware repositioning to window resize event
    window.addEventListener('resize', Tooltip.reposition);
    window.addEventListener('scroll', Tooltip.reposition);

    /**
     * Array with dynamic class types.
     *
     * @type {Array}
     */
    Tooltip.classTypes = ['type', 'effect'];

    /**
     * Default options for Tooltip constructor.
     *
     * @type {Object}
     */
    Tooltip.defaults = {
        baseClass: _const.CSS_PREFIX + 'tooltip', // Base tooltip class name.
        typeClass: null, // Type tooltip class name.
        effectClass: null, // Effect tooltip class name.
        inClass: 'in', // Class used to transition stuff in.
        place: 'top', // Default place.
        spacing: null, // Gap between target and tooltip.
        auto: 0 // Whether to automatically adjust place to fit into window.
    };

    exports.Tooltip = Tooltip;
});
define('plugins',['exports', 'd3'], function (exports, _d3) {
    /* jshint ignore:start */
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var Plugins = (function () {
        function Plugins(plugins, chart) {
            _classCallCheck(this, Plugins);

            this.chart = chart;
            this._plugins = plugins.map(this.initPlugin, this);
        }

        _createClass(Plugins, [{
            key: 'initPlugin',
            value: function initPlugin(plugin) {
                var _this = this;

                if (plugin.init) {
                    plugin.init(this.chart);
                }

                // jscs:disable disallowEmptyBlocks
                var empty = function empty() {
                    // do nothing
                };
                // jscs:enable disallowEmptyBlocks

                this.chart.on('destroy', plugin.destroy && plugin.destroy.bind(plugin) || empty);

                Object.keys(plugin).forEach(function (name) {
                    if (name.indexOf('on') === 0) {
                        var event = name.substr(2);
                        _this.chart.on(event.toLowerCase(), plugin[name].bind(plugin));
                    }
                });
            }
        }]);

        return Plugins;
    })();

    exports.Plugins = Plugins;
});
define('units-registry',['exports', './error'], function (exports, _error) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var UnitsMap = {};

    var unitsRegistry = {

        reg: function reg(unitType, xUnit) {
            UnitsMap[unitType] = xUnit;
            return this;
        },

        get: function get(unitType) {

            if (!UnitsMap.hasOwnProperty(unitType)) {
                throw new _error.TauChartError('Unknown unit type: ' + unitType, _error.errorCodes.UNKNOWN_UNIT_TYPE);
            }

            return UnitsMap[unitType];
        }
    };

    exports.unitsRegistry = unitsRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91bml0cy1yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUEsUUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVsQixRQUFJLGFBQWEsR0FBRzs7QUFFaEIsV0FBRyxFQUFFLGFBQVUsUUFBUSxFQUFFLEtBQUssRUFBRTtBQUM1QixvQkFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUMzQixtQkFBTyxJQUFJLENBQUM7U0FDZjs7QUFFRCxXQUFHLEVBQUUsYUFBQyxRQUFRLEVBQUs7O0FBRWYsZ0JBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ3BDLHNCQUFNLFdBZFYsYUFBYSxDQWNPLHFCQUFxQixHQUFHLFFBQVEsRUFBRSxPQWQ5QixVQUFVLENBYytCLGlCQUFpQixDQUFDLENBQUM7YUFDbkY7O0FBRUQsbUJBQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdCO0tBQ0osQ0FBQzs7WUFFTSxhQUFhLEdBQWIsYUFBYSIsImZpbGUiOiJzcmMvdW5pdHMtcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1RhdUNoYXJ0RXJyb3IgYXMgRXJyb3IsIGVycm9yQ29kZXN9IGZyb20gJy4vZXJyb3InO1xuXG52YXIgVW5pdHNNYXAgPSB7fTtcblxudmFyIHVuaXRzUmVnaXN0cnkgPSB7XG5cbiAgICByZWc6IGZ1bmN0aW9uICh1bml0VHlwZSwgeFVuaXQpIHtcbiAgICAgICAgVW5pdHNNYXBbdW5pdFR5cGVdID0geFVuaXQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBnZXQ6ICh1bml0VHlwZSkgPT4ge1xuXG4gICAgICAgIGlmICghVW5pdHNNYXAuaGFzT3duUHJvcGVydHkodW5pdFR5cGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdW5pdCB0eXBlOiAnICsgdW5pdFR5cGUsIGVycm9yQ29kZXMuVU5LTk9XTl9VTklUX1RZUEUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFVuaXRzTWFwW3VuaXRUeXBlXTtcbiAgICB9XG59O1xuXG5leHBvcnQge3VuaXRzUmVnaXN0cnl9OyJdfQ==;
define('scales-registry',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var ScalesMap = {};

    var scalesRegistry = {

        reg: function reg(scaleType, scaleClass) {
            ScalesMap[scaleType] = scaleClass;
            return this;
        },

        get: function get(scaleType) {
            return ScalesMap[scaleType];
        }
    };

    exports.scalesRegistry = scalesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zY2FsZXMtcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsUUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVuQixRQUFJLGNBQWMsR0FBRzs7QUFFakIsV0FBRyxFQUFFLGFBQVUsU0FBUyxFQUFFLFVBQVUsRUFBRTtBQUNsQyxxQkFBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUNsQyxtQkFBTyxJQUFJLENBQUM7U0FDZjs7QUFFRCxXQUFHLEVBQUUsYUFBVSxTQUFTLEVBQUU7QUFDdEIsbUJBQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQy9CO0tBQ0osQ0FBQzs7WUFFTSxjQUFjLEdBQWQsY0FBYyIsImZpbGUiOiJzcmMvc2NhbGVzLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFNjYWxlc01hcCA9IHt9O1xuXG52YXIgc2NhbGVzUmVnaXN0cnkgPSB7XG5cbiAgICByZWc6IGZ1bmN0aW9uIChzY2FsZVR5cGUsIHNjYWxlQ2xhc3MpIHtcbiAgICAgICAgU2NhbGVzTWFwW3NjYWxlVHlwZV0gPSBzY2FsZUNsYXNzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAoc2NhbGVUeXBlKSB7XG4gICAgICAgIHJldHVybiBTY2FsZXNNYXBbc2NhbGVUeXBlXTtcbiAgICB9XG59O1xuXG5leHBvcnQge3NjYWxlc1JlZ2lzdHJ5fTsiXX0=;
define('scales-factory',['exports', './data-frame'], function (exports, _dataFrame) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var ScalesFactory = (function () {
        function ScalesFactory(scalesRegistry, sources, scales) {
            _classCallCheck(this, ScalesFactory);

            this.registry = scalesRegistry;
            this.sources = sources;
            this.scales = scales;
        }

        _createClass(ScalesFactory, [{
            key: 'createScaleInfo',
            value: function createScaleInfo(scaleConfig) {
                var dataFrame = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

                var ScaleClass = this.registry.get(scaleConfig.type);

                var dim = scaleConfig.dim;
                var src = scaleConfig.source;

                var type = (this.sources[src].dims[dim] || {}).type;
                var data = this.sources[src].data;

                var frame = dataFrame || new _dataFrame.DataFrame({ source: src }, data);

                scaleConfig.dimType = type;

                return new ScaleClass(frame, scaleConfig);
            }
        }, {
            key: 'createScaleInfoByName',
            value: function createScaleInfoByName(name) {
                var dataFrame = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

                return this.createScaleInfo(this.scales[name], dataFrame);
            }
        }]);

        return ScalesFactory;
    })();

    exports.ScalesFactory = ScalesFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zY2FsZXMtZmFjdG9yeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztRQUVhLGFBQWE7QUFFWCxpQkFGRixhQUFhLENBRVYsY0FBYyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7a0NBRnBDLGFBQWE7O0FBR2xCLGdCQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQztBQUMvQixnQkFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsZ0JBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1NBQ3hCOztxQkFOUSxhQUFhOzttQkFRUCx5QkFBQyxXQUFXLEVBQW9CO29CQUFsQixTQUFTLHlEQUFHLElBQUk7O0FBRXpDLG9CQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJELG9CQUFJLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0FBQzFCLG9CQUFJLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDOztBQUU3QixvQkFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUEsQ0FBRSxJQUFJLENBQUM7QUFDcEQsb0JBQUksSUFBSSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxBQUFDLENBQUM7O0FBRXBDLG9CQUFJLEtBQUssR0FBRyxTQUFTLElBQUssZUFwQjFCLFNBQVMsQ0FvQitCLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBQyxFQUFFLElBQUksQ0FBQyxBQUFDLENBQUM7O0FBRTlELDJCQUFXLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFFM0IsdUJBQVEsSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFFO2FBQy9DOzs7bUJBRW9CLCtCQUFDLElBQUksRUFBb0I7b0JBQWxCLFNBQVMseURBQUcsSUFBSTs7QUFDeEMsdUJBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQzdEOzs7ZUEzQlEsYUFBYSIsImZpbGUiOiJzcmMvc2NhbGVzLWZhY3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RhdGFGcmFtZX0gZnJvbSAnLi9kYXRhLWZyYW1lJztcblxuZXhwb3J0IGNsYXNzIFNjYWxlc0ZhY3Rvcnkge1xuXG4gICAgY29uc3RydWN0b3Ioc2NhbGVzUmVnaXN0cnksIHNvdXJjZXMsIHNjYWxlcykge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5ID0gc2NhbGVzUmVnaXN0cnk7XG4gICAgICAgIHRoaXMuc291cmNlcyA9IHNvdXJjZXM7XG4gICAgICAgIHRoaXMuc2NhbGVzID0gc2NhbGVzO1xuICAgIH1cblxuICAgIGNyZWF0ZVNjYWxlSW5mbyhzY2FsZUNvbmZpZywgZGF0YUZyYW1lID0gbnVsbCkge1xuXG4gICAgICAgIHZhciBTY2FsZUNsYXNzID0gdGhpcy5yZWdpc3RyeS5nZXQoc2NhbGVDb25maWcudHlwZSk7XG5cbiAgICAgICAgdmFyIGRpbSA9IHNjYWxlQ29uZmlnLmRpbTtcbiAgICAgICAgdmFyIHNyYyA9IHNjYWxlQ29uZmlnLnNvdXJjZTtcblxuICAgICAgICB2YXIgdHlwZSA9ICh0aGlzLnNvdXJjZXNbc3JjXS5kaW1zW2RpbV0gfHwge30pLnR5cGU7XG4gICAgICAgIHZhciBkYXRhID0gKHRoaXMuc291cmNlc1tzcmNdLmRhdGEpO1xuXG4gICAgICAgIHZhciBmcmFtZSA9IGRhdGFGcmFtZSB8fCAobmV3IERhdGFGcmFtZSh7c291cmNlOiBzcmN9LCBkYXRhKSk7XG5cbiAgICAgICAgc2NhbGVDb25maWcuZGltVHlwZSA9IHR5cGU7XG5cbiAgICAgICAgcmV0dXJuIChuZXcgU2NhbGVDbGFzcyhmcmFtZSwgc2NhbGVDb25maWcpKTtcbiAgICB9XG5cbiAgICBjcmVhdGVTY2FsZUluZm9CeU5hbWUobmFtZSwgZGF0YUZyYW1lID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVTY2FsZUluZm8odGhpcy5zY2FsZXNbbmFtZV0sIGRhdGFGcmFtZSk7XG4gICAgfVxufSJdfQ==;
define('data-processor',['exports', './utils/utils'], function (exports, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var isObject = function isObject(obj) {
        return obj === Object(obj);
    };

    var DataProcessor = {

        isYFunctionOfX: function isYFunctionOfX(data, xFields, yFields) {
            var isRelationAFunction = true;
            var error = null;
            // domain should has only 1 value from range
            try {
                data.reduce(function (memo, item) {

                    var fnVar = function fnVar(hash, f) {
                        var propValue = item[f];
                        var hashValue = isObject(propValue) ? JSON.stringify(propValue) : propValue;
                        hash.push(hashValue);
                        return hash;
                    };

                    var key = xFields.reduce(fnVar, []).join('/');
                    var val = yFields.reduce(fnVar, []).join('/');

                    if (!memo.hasOwnProperty(key)) {
                        memo[key] = val;
                    } else {
                        var prevVal = memo[key];
                        if (prevVal !== val) {
                            error = {
                                type: 'RelationIsNotAFunction',
                                keyX: xFields.join('/'),
                                keyY: yFields.join('/'),
                                valX: key,
                                errY: [prevVal, val]
                            };

                            throw new Error('RelationIsNotAFunction');
                        }
                    }
                    return memo;
                }, {});
            } catch (ex) {

                if (ex.message !== 'RelationIsNotAFunction') {
                    throw ex;
                }

                isRelationAFunction = false;
            }

            return {
                result: isRelationAFunction,
                error: error
            };
        },

        excludeNullValues: function excludeNullValues(dimensions, onExclude) {
            var fields = Object.keys(dimensions).reduce(function (fields, k) {
                var d = dimensions[k];
                if ((!d.hasOwnProperty('hasNull') || d.hasNull) && (d.type === 'measure' || d.scale === 'period')) {
                    // rule: exclude null values of "measure" type or "period" scale
                    fields.push(k);
                }
                return fields;
            }, []);
            return function (row) {
                var result = !fields.some(function (f) {
                    return !(f in row) || row[f] === null;
                });
                if (!result) {
                    onExclude(row);
                }
                return result;
            };
        },

        autoAssignScales: function autoAssignScales(dimensions) {

            var defaultType = 'category';
            var scaleMap = {
                category: 'ordinal',
                order: 'ordinal',
                measure: 'linear'
            };

            var r = {};
            Object.keys(dimensions).forEach(function (k) {
                var item = dimensions[k];
                var type = (item.type || defaultType).toLowerCase();
                r[k] = _.extend({}, item, {
                    type: type,
                    scale: item.scale || scaleMap[type],
                    value: item.value
                });
            });

            return r;
        },

        autoDetectDimTypes: function autoDetectDimTypes(data) {

            var defaultDetect = {
                type: 'category',
                scale: 'ordinal'
            };

            var detectType = function detectType(propertyValue, defaultDetect) {

                var pair = defaultDetect;

                if (_.isDate(propertyValue)) {
                    pair.type = 'measure';
                    pair.scale = 'time';
                } else if (_.isObject(propertyValue)) {
                    pair.type = 'order';
                    pair.scale = 'ordinal';
                } else if (_.isNumber(propertyValue)) {
                    pair.type = 'measure';
                    pair.scale = 'linear';
                }

                return pair;
            };

            var reducer = function reducer(memo, rowItem) {

                Object.keys(rowItem).forEach(function (key) {

                    var val = rowItem.hasOwnProperty(key) ? rowItem[key] : null;

                    memo[key] = memo[key] || {
                        type: null,
                        hasNull: false
                    };

                    if (val === null) {
                        memo[key].hasNull = true;
                    } else {
                        var typeScalePair = detectType(val, _utilsUtils.utils.clone(defaultDetect));
                        var detectedType = typeScalePair.type;
                        var detectedScale = typeScalePair.scale;

                        var isInContraToPrev = memo[key].type !== null && memo[key].type !== detectedType;
                        memo[key].type = isInContraToPrev ? defaultDetect.type : detectedType;
                        memo[key].scale = isInContraToPrev ? defaultDetect.scale : detectedScale;
                    }
                });

                return memo;
            };

            return _.reduce(data, reducer, {});
        }
    };

    exports.DataProcessor = DataProcessor;
});
//# sourceMappingURL=data:application/json;base64,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SixDQUFDOztZQUVNLGFBQWEsR0FBYixhQUFhIiwiZmlsZSI6InNyYy9kYXRhLXByb2Nlc3Nvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dXRpbHN9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuXG52YXIgaXNPYmplY3QgPSAob2JqKSA9PiBvYmogPT09IE9iamVjdChvYmopO1xuXG52YXIgRGF0YVByb2Nlc3NvciA9IHtcblxuICAgIGlzWUZ1bmN0aW9uT2ZYOiAoZGF0YSwgeEZpZWxkcywgeUZpZWxkcykgPT4ge1xuICAgICAgICB2YXIgaXNSZWxhdGlvbkFGdW5jdGlvbiA9IHRydWU7XG4gICAgICAgIHZhciBlcnJvciA9IG51bGw7XG4gICAgICAgIC8vIGRvbWFpbiBzaG91bGQgaGFzIG9ubHkgMSB2YWx1ZSBmcm9tIHJhbmdlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkYXRhLnJlZHVjZShcbiAgICAgICAgICAgICAgICAobWVtbywgaXRlbSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBmblZhciA9IChoYXNoLCBmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcFZhbHVlID0gaXRlbVtmXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNoVmFsdWUgPSBpc09iamVjdChwcm9wVmFsdWUpID8gSlNPTi5zdHJpbmdpZnkocHJvcFZhbHVlKSA6IHByb3BWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc2gucHVzaChoYXNoVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IHhGaWVsZHMucmVkdWNlKGZuVmFyLCBbXSkuam9pbignLycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsID0geUZpZWxkcy5yZWR1Y2UoZm5WYXIsIFtdKS5qb2luKCcvJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1vLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmV2VmFsID0gbWVtb1trZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZWYWwgIT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVsYXRpb25Jc05vdEFGdW5jdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleVg6IHhGaWVsZHMuam9pbignLycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlZOiB5RmllbGRzLmpvaW4oJy8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsWDoga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJZOiBbcHJldlZhbCwgdmFsXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbGF0aW9uSXNOb3RBRnVuY3Rpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHt9KTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcblxuICAgICAgICAgICAgaWYgKGV4Lm1lc3NhZ2UgIT09ICdSZWxhdGlvbklzTm90QUZ1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpc1JlbGF0aW9uQUZ1bmN0aW9uID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdWx0OiBpc1JlbGF0aW9uQUZ1bmN0aW9uLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGV4Y2x1ZGVOdWxsVmFsdWVzOiAoZGltZW5zaW9ucywgb25FeGNsdWRlKSA9PiB7XG4gICAgICAgIHZhciBmaWVsZHMgPSBPYmplY3Qua2V5cyhkaW1lbnNpb25zKS5yZWR1Y2UoKGZpZWxkcywgaykgPT4ge1xuICAgICAgICAgICAgdmFyIGQgPSBkaW1lbnNpb25zW2tdO1xuICAgICAgICAgICAgaWYgKCghZC5oYXNPd25Qcm9wZXJ0eSgnaGFzTnVsbCcpIHx8IGQuaGFzTnVsbCkgJiYgKChkLnR5cGUgPT09ICdtZWFzdXJlJykgfHwgKGQuc2NhbGUgPT09ICdwZXJpb2QnKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBydWxlOiBleGNsdWRlIG51bGwgdmFsdWVzIG9mIFwibWVhc3VyZVwiIHR5cGUgb3IgXCJwZXJpb2RcIiBzY2FsZVxuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpZWxkcztcbiAgICAgICAgfSwgW10pO1xuICAgICAgICByZXR1cm4gKHJvdykgPT4ge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICFmaWVsZHMuc29tZSgoZikgPT4gKCEoZiBpbiByb3cpIHx8IChyb3dbZl0gPT09IG51bGwpKSk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgIG9uRXhjbHVkZShyb3cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYXV0b0Fzc2lnblNjYWxlczogZnVuY3Rpb24gKGRpbWVuc2lvbnMpIHtcblxuICAgICAgICB2YXIgZGVmYXVsdFR5cGUgPSAnY2F0ZWdvcnknO1xuICAgICAgICB2YXIgc2NhbGVNYXAgPSB7XG4gICAgICAgICAgICBjYXRlZ29yeTogJ29yZGluYWwnLFxuICAgICAgICAgICAgb3JkZXI6ICdvcmRpbmFsJyxcbiAgICAgICAgICAgIG1lYXN1cmU6ICdsaW5lYXInXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHIgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMoZGltZW5zaW9ucykuZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBkaW1lbnNpb25zW2tdO1xuICAgICAgICAgICAgdmFyIHR5cGUgPSAoaXRlbS50eXBlIHx8IGRlZmF1bHRUeXBlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcltrXSA9IF8uZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogaXRlbS5zY2FsZSB8fCBzY2FsZU1hcFt0eXBlXSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0udmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfSxcblxuICAgIGF1dG9EZXRlY3REaW1UeXBlczogZnVuY3Rpb24gKGRhdGEpIHtcblxuICAgICAgICB2YXIgZGVmYXVsdERldGVjdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yeScsXG4gICAgICAgICAgICBzY2FsZTogJ29yZGluYWwnXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGRldGVjdFR5cGUgPSAocHJvcGVydHlWYWx1ZSwgZGVmYXVsdERldGVjdCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcGFpciA9IGRlZmF1bHREZXRlY3Q7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRGF0ZShwcm9wZXJ0eVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHBhaXIudHlwZSA9ICdtZWFzdXJlJztcbiAgICAgICAgICAgICAgICBwYWlyLnNjYWxlID0gJ3RpbWUnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHByb3BlcnR5VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcGFpci50eXBlID0gJ29yZGVyJztcbiAgICAgICAgICAgICAgICBwYWlyLnNjYWxlID0gJ29yZGluYWwnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHByb3BlcnR5VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcGFpci50eXBlID0gJ21lYXN1cmUnO1xuICAgICAgICAgICAgICAgIHBhaXIuc2NhbGUgPSAnbGluZWFyJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhaXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHJlZHVjZXIgPSAobWVtbywgcm93SXRlbSkgPT4ge1xuXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyb3dJdGVtKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSByb3dJdGVtLmhhc093blByb3BlcnR5KGtleSkgPyByb3dJdGVtW2tleV0gOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgbWVtb1trZXldID0gbWVtb1trZXldIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaGFzTnVsbDogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0uaGFzTnVsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGVTY2FsZVBhaXIgPSBkZXRlY3RUeXBlKHZhbCwgdXRpbHMuY2xvbmUoZGVmYXVsdERldGVjdCkpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGV0ZWN0ZWRUeXBlID0gdHlwZVNjYWxlUGFpci50eXBlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGV0ZWN0ZWRTY2FsZSA9IHR5cGVTY2FsZVBhaXIuc2NhbGU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzSW5Db250cmFUb1ByZXYgPSAobWVtb1trZXldLnR5cGUgIT09IG51bGwgJiYgbWVtb1trZXldLnR5cGUgIT09IGRldGVjdGVkVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XS50eXBlID0gaXNJbkNvbnRyYVRvUHJldiA/IGRlZmF1bHREZXRlY3QudHlwZSA6IGRldGVjdGVkVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1trZXldLnNjYWxlID0gaXNJbkNvbnRyYVRvUHJldiA/IGRlZmF1bHREZXRlY3Quc2NhbGUgOiBkZXRlY3RlZFNjYWxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gXy5yZWR1Y2UoZGF0YSwgcmVkdWNlciwge30pO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7RGF0YVByb2Nlc3Nvcn07Il19;
define('utils/layuot-template',['exports', '../const'], function (exports, _const) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var createElement = function createElement(cssClass, parent) {
        var tag = 'div';
        var element = document.createElement(tag);
        element.classList.add(_const.CSS_PREFIX + cssClass);
        if (parent) {
            parent.appendChild(element);
        }
        return element;
    };
    var getLayout = function getLayout() {
        var layout = createElement('layout');
        var header = createElement('layout__header', layout);
        var centerContainer = createElement('layout__container', layout);
        var leftSidebar = createElement('layout__sidebar', centerContainer);
        var contentContainer = createElement('layout__content', centerContainer);
        var content = createElement('layout__content__wrap', contentContainer);
        var rightSidebarContainer = createElement('layout__sidebar-right', centerContainer);
        var rightSidebar = createElement('layout__sidebar-right__wrap', rightSidebarContainer);
        var footer = createElement('layout__footer', layout);
        /* jshint ignore:start */
        return {
            layout: layout,
            header: header,
            content: content,
            leftSidebar: leftSidebar,
            rightSidebar: rightSidebar,
            footer: footer
        };
        /* jshint ignore:end */
    };

    exports.getLayout = getLayout;
});
define('spec-converter',['exports', 'underscore', './utils/utils'], function (exports, _underscore, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _2 = _interopRequireDefault(_underscore);

    var SpecConverter = (function () {
        function SpecConverter(spec) {
            _classCallCheck(this, SpecConverter);

            this.spec = spec;

            this.dist = {
                sources: {
                    '?': {
                        dims: {},
                        data: [{}]
                    },
                    '/': {
                        dims: {},
                        data: []
                    }
                },
                scales: {
                    // jscs:disable disallowQuotedKeysInObjects
                    'x_null': { type: 'ordinal', source: '?' },
                    'y_null': { type: 'ordinal', source: '?' },
                    'size_null': { type: 'size', source: '?', mid: 5 },
                    'color_null': { type: 'color', source: '?', brewer: null },

                    'pos:default': { type: 'ordinal', source: '?' },
                    'size:default': { type: 'size', source: '?', mid: 5 },
                    'color:default': { type: 'color', source: '?', brewer: null }
                    // jscs:enable disallowQuotedKeysInObjects
                },
                settings: spec.settings
            };
        }

        _createClass(SpecConverter, [{
            key: 'convert',
            value: function convert() {
                var srcSpec = this.spec;
                var gplSpec = this.dist;
                this.ruleAssignSourceDims(srcSpec, gplSpec);
                this.ruleAssignStructure(srcSpec, gplSpec);
                this.ruleAssignSourceData(srcSpec, gplSpec);
                this.ruleApplyDefaults(gplSpec);

                return gplSpec;
            }
        }, {
            key: 'ruleApplyDefaults',
            value: function ruleApplyDefaults(spec) {
                var traverse = function traverse(node, iterator, parentNode) {
                    iterator(node, parentNode);
                    (node.units || []).map(function (x) {
                        return traverse(x, iterator, node);
                    });
                };

                var iterator = function iterator(childUnit, root) {

                    // leaf elements should inherit coordinates properties
                    if (root && !childUnit.hasOwnProperty('units')) {
                        childUnit = _2['default'].defaults(childUnit, _2['default'].pick(root, 'x', 'y'));

                        var parentGuide = _utilsUtils.utils.clone(root.guide || {});
                        childUnit.guide = childUnit.guide || {};
                        childUnit.guide.x = _2['default'].defaults(childUnit.guide.x || {}, parentGuide.x);
                        childUnit.guide.y = _2['default'].defaults(childUnit.guide.y || {}, parentGuide.y);

                        childUnit.expression.inherit = root.expression.inherit;
                    }

                    return childUnit;
                };

                traverse(spec.unit, iterator, null);
            }
        }, {
            key: 'ruleAssignSourceData',
            value: function ruleAssignSourceData(srcSpec, gplSpec) {

                var meta = srcSpec.spec.dimensions || {};

                var dims = gplSpec.sources['/'].dims;

                var reduceIterator = function reduceIterator(row, key) {

                    if (_2['default'].isObject(row[key]) && !_2['default'].isDate(row[key])) {
                        _2['default'].each(row[key], function (v, k) {
                            return row[key + '.' + k] = v;
                        });
                    }

                    return row;
                };

                gplSpec.sources['/'].data = srcSpec.data.map(function (rowN) {
                    var row = Object.keys(rowN).reduce(reduceIterator, rowN);
                    return Object.keys(dims).reduce(function (r, k) {

                        if (!r.hasOwnProperty(k)) {
                            r[k] = null;
                        }

                        if (r[k] !== null && meta[k] && ['period', 'time'].indexOf(meta[k].scale) >= 0) {
                            r[k] = new Date(r[k]);
                        }

                        return r;
                    }, row);
                });
            }
        }, {
            key: 'ruleAssignSourceDims',
            value: function ruleAssignSourceDims(srcSpec, gplSpec) {
                var dims = srcSpec.spec.dimensions;
                gplSpec.sources['/'].dims = Object.keys(dims).reduce(function (memo, k) {
                    memo[k] = { type: dims[k].type };
                    return memo;
                }, {});
            }
        }, {
            key: 'ruleAssignStructure',
            value: function ruleAssignStructure(srcSpec, gplSpec) {
                var _this = this;

                var walkStructure = function walkStructure(srcUnit) {
                    var gplRoot = _utilsUtils.utils.clone(_2['default'].omit(srcUnit, 'unit'));
                    gplRoot.expression = _this.ruleInferExpression(srcUnit);
                    _this.ruleCreateScales(srcUnit, gplRoot);

                    if (srcUnit.unit) {
                        gplRoot.units = srcUnit.unit.map(walkStructure);
                    }

                    return gplRoot;
                };

                var root = walkStructure(srcSpec.spec.unit);
                root.expression.inherit = false;
                gplSpec.unit = root;
            }
        }, {
            key: 'ruleCreateScales',
            value: function ruleCreateScales(srcUnit, gplRoot) {
                var _this2 = this;

                var guide = srcUnit.guide || {};
                ['color', 'size', 'x', 'y'].forEach(function (p) {
                    if (srcUnit.hasOwnProperty(p)) {
                        gplRoot[p] = _this2.scalesPool(p, srcUnit[p], guide[p] || {});
                    }
                });
            }
        }, {
            key: 'ruleInferDim',
            value: function ruleInferDim(dimName, guide) {

                var r = dimName;

                var dims = this.spec.spec.dimensions;

                if (!dims.hasOwnProperty(r)) {
                    return r;
                }

                if (guide.hasOwnProperty('tickLabel')) {
                    r = dimName + '.' + guide.tickLabel;
                } else if (dims[dimName].value) {
                    r = dimName + '.' + dims[dimName].value;
                }

                var myDims = this.dist.sources['/'].dims;
                if (!myDims.hasOwnProperty(r)) {
                    myDims[r] = { type: myDims[dimName].type };
                }

                return r;
            }
        }, {
            key: 'scalesPool',
            value: function scalesPool(scaleType, dimName, guide) {

                var k = scaleType + '_' + dimName;

                if (this.dist.scales.hasOwnProperty(k)) {
                    return k;
                }

                var dims = this.spec.spec.dimensions;

                var item = {};
                if (scaleType === 'color' && dimName !== null) {
                    item = {
                        type: 'color',
                        source: '/',
                        dim: this.ruleInferDim(dimName, guide)
                    };

                    if (guide.hasOwnProperty('brewer')) {
                        item.brewer = guide.brewer;
                    }

                    if (dims[dimName] && dims[dimName].hasOwnProperty('order')) {
                        item.order = dims[dimName].order;
                    }
                }

                if (scaleType === 'size' && dimName !== null) {
                    item = {
                        type: 'size',
                        source: '/',
                        dim: this.ruleInferDim(dimName, guide),
                        min: 2,
                        max: 10,
                        mid: 5
                    };
                }

                if (dims.hasOwnProperty(dimName) && (scaleType === 'x' || scaleType === 'y')) {
                    item = {
                        type: dims[dimName].scale,
                        source: '/',
                        dim: this.ruleInferDim(dimName, guide)
                    };

                    if (dims[dimName].hasOwnProperty('order')) {
                        item.order = dims[dimName].order;
                    }

                    if (guide.hasOwnProperty('min')) {
                        item.min = guide.min;
                    }

                    if (guide.hasOwnProperty('max')) {
                        item.max = guide.max;
                    }

                    if (guide.hasOwnProperty('autoScale')) {
                        item.autoScale = guide.autoScale;
                    } else {
                        item.autoScale = true;
                    }

                    if (guide.hasOwnProperty('tickPeriod')) {
                        item.period = guide.tickPeriod;
                    }

                    item.fitToFrameByDims = guide.fitToFrameByDims;

                    item.ratio = guide.ratio;
                }

                this.dist.scales[k] = item;

                return k;
            }
        }, {
            key: 'ruleInferExpression',
            value: function ruleInferExpression(srcUnit) {

                var expr = {
                    operator: 'none',
                    params: []
                };

                var g = srcUnit.guide || {};
                var gx = g.x || {};
                var gy = g.y || {};

                if (srcUnit.type.indexOf('ELEMENT.') === 0) {

                    if (srcUnit.color) {
                        expr = {
                            operator: 'groupBy',
                            params: [this.ruleInferDim(srcUnit.color, g.color || {})]
                        };
                    }
                } else if (srcUnit.type === 'COORDS.RECT') {

                    if (srcUnit.unit.length === 1 && srcUnit.unit[0].type === 'COORDS.RECT') {

                        // jshint ignore:start
                        // jscs:disable requireDotNotation
                        if (gx['tickPeriod'] || gy['tickPeriod']) {
                            expr = {
                                operator: 'cross_period',
                                params: [this.ruleInferDim(srcUnit.x, gx), this.ruleInferDim(srcUnit.y, gy), gx['tickPeriod'], gy['tickPeriod']]
                            };
                        } else {
                            expr = {
                                operator: 'cross',
                                params: [this.ruleInferDim(srcUnit.x, gx), this.ruleInferDim(srcUnit.y, gy)]
                            };
                        }
                        // jscs:enable requireDotNotation
                        // jshint ignore:end
                    }
                }

                return _2['default'].extend({ inherit: true, source: '/' }, expr);
            }
        }]);

        return SpecConverter;
    })();

    exports.SpecConverter = SpecConverter;
});
//# sourceMappingURL=data:application/json;base64,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YUFBYSxFQUFFOztBQUV2Qyx3QkFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUFFOzs7O0FBSXJFLDRCQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDdEMsZ0NBQUksR0FBRztBQUNILHdDQUFRLEVBQUUsY0FBYztBQUN4QixzQ0FBTSxFQUFFLENBQ0osSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQ2hDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFDaEIsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUNuQjs2QkFDSixDQUFDO3lCQUNMLE1BQU07QUFDSCxnQ0FBSSxHQUFHO0FBQ0gsd0NBQVEsRUFBRSxPQUFPO0FBQ2pCLHNDQUFNLEVBQUUsQ0FDSixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQ2hDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDbkM7NkJBQ0osQ0FBQzt5QkFDTDs7O3FCQUdKO2lCQUNKOztBQUVELHVCQUFPLGNBQUUsTUFBTSxDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkQ7OztlQTFTUSxhQUFhIiwiZmlsZSI6InNyYy9zcGVjLWNvbnZlcnRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZGVmYXVsdCBhcyBffSBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCB7dXRpbHN9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuXG5leHBvcnQgY2xhc3MgU3BlY0NvbnZlcnRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcGVjKSB7XG4gICAgICAgIHRoaXMuc3BlYyA9IHNwZWM7XG5cbiAgICAgICAgdGhpcy5kaXN0ID0ge1xuICAgICAgICAgICAgc291cmNlczoge1xuICAgICAgICAgICAgICAgICc/Jzoge1xuICAgICAgICAgICAgICAgICAgICBkaW1zOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW3t9XVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy8nOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpbXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzY2FsZXM6IHtcbiAgICAgICAgICAgICAgICAvLyBqc2NzOmRpc2FibGUgZGlzYWxsb3dRdW90ZWRLZXlzSW5PYmplY3RzXG4gICAgICAgICAgICAgICAgJ3hfbnVsbCc6IHt0eXBlOiAnb3JkaW5hbCcsIHNvdXJjZTogJz8nfSxcbiAgICAgICAgICAgICAgICAneV9udWxsJzoge3R5cGU6ICdvcmRpbmFsJywgc291cmNlOiAnPyd9LFxuICAgICAgICAgICAgICAgICdzaXplX251bGwnOiAge3R5cGU6ICdzaXplJywgc291cmNlOiAnPycsIG1pZDogNX0sXG4gICAgICAgICAgICAgICAgJ2NvbG9yX251bGwnOiB7dHlwZTogJ2NvbG9yJywgc291cmNlOiAnPycsIGJyZXdlcjogbnVsbH0sXG5cbiAgICAgICAgICAgICAgICAncG9zOmRlZmF1bHQnOiB7dHlwZTogJ29yZGluYWwnLCBzb3VyY2U6ICc/J30sXG4gICAgICAgICAgICAgICAgJ3NpemU6ZGVmYXVsdCc6IHt0eXBlOiAnc2l6ZScsIHNvdXJjZTogJz8nLCBtaWQ6IDV9LFxuICAgICAgICAgICAgICAgICdjb2xvcjpkZWZhdWx0Jzoge3R5cGU6ICdjb2xvcicsIHNvdXJjZTogJz8nLCBicmV3ZXI6IG51bGx9XG4gICAgICAgICAgICAgICAgLy8ganNjczplbmFibGUgZGlzYWxsb3dRdW90ZWRLZXlzSW5PYmplY3RzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHNwZWMuc2V0dGluZ3NcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb252ZXJ0KCkge1xuICAgICAgICB2YXIgc3JjU3BlYyA9IHRoaXMuc3BlYztcbiAgICAgICAgdmFyIGdwbFNwZWMgPSB0aGlzLmRpc3Q7XG4gICAgICAgIHRoaXMucnVsZUFzc2lnblNvdXJjZURpbXMoc3JjU3BlYywgZ3BsU3BlYyk7XG4gICAgICAgIHRoaXMucnVsZUFzc2lnblN0cnVjdHVyZShzcmNTcGVjLCBncGxTcGVjKTtcbiAgICAgICAgdGhpcy5ydWxlQXNzaWduU291cmNlRGF0YShzcmNTcGVjLCBncGxTcGVjKTtcbiAgICAgICAgdGhpcy5ydWxlQXBwbHlEZWZhdWx0cyhncGxTcGVjKTtcblxuICAgICAgICByZXR1cm4gZ3BsU3BlYztcbiAgICB9XG5cbiAgICBydWxlQXBwbHlEZWZhdWx0cyhzcGVjKSB7XG4gICAgICAgIHZhciB0cmF2ZXJzZSA9IChub2RlLCBpdGVyYXRvciwgcGFyZW50Tm9kZSkgPT4ge1xuICAgICAgICAgICAgaXRlcmF0b3Iobm9kZSwgcGFyZW50Tm9kZSk7XG4gICAgICAgICAgICAobm9kZS51bml0cyB8fCBbXSkubWFwKCh4KSA9PiB0cmF2ZXJzZSh4LCBpdGVyYXRvciwgbm9kZSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpdGVyYXRvciA9IChjaGlsZFVuaXQsIHJvb3QpID0+IHtcblxuICAgICAgICAgICAgLy8gbGVhZiBlbGVtZW50cyBzaG91bGQgaW5oZXJpdCBjb29yZGluYXRlcyBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZiAocm9vdCAmJiAhY2hpbGRVbml0Lmhhc093blByb3BlcnR5KCd1bml0cycpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRVbml0ID0gXy5kZWZhdWx0cyhjaGlsZFVuaXQsIF8ucGljayhyb290LCAneCcsICd5JykpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudEd1aWRlID0gdXRpbHMuY2xvbmUocm9vdC5ndWlkZSB8fCB7fSk7XG4gICAgICAgICAgICAgICAgY2hpbGRVbml0Lmd1aWRlID0gY2hpbGRVbml0Lmd1aWRlIHx8IHt9O1xuICAgICAgICAgICAgICAgIGNoaWxkVW5pdC5ndWlkZS54ID0gXy5kZWZhdWx0cyhjaGlsZFVuaXQuZ3VpZGUueCB8fCB7fSwgcGFyZW50R3VpZGUueCk7XG4gICAgICAgICAgICAgICAgY2hpbGRVbml0Lmd1aWRlLnkgPSBfLmRlZmF1bHRzKGNoaWxkVW5pdC5ndWlkZS55IHx8IHt9LCBwYXJlbnRHdWlkZS55KTtcblxuICAgICAgICAgICAgICAgIGNoaWxkVW5pdC5leHByZXNzaW9uLmluaGVyaXQgPSByb290LmV4cHJlc3Npb24uaW5oZXJpdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNoaWxkVW5pdDtcbiAgICAgICAgfTtcblxuICAgICAgICB0cmF2ZXJzZShzcGVjLnVuaXQsIGl0ZXJhdG9yLCBudWxsKTtcbiAgICB9XG5cbiAgICBydWxlQXNzaWduU291cmNlRGF0YShzcmNTcGVjLCBncGxTcGVjKSB7XG5cbiAgICAgICAgdmFyIG1ldGEgPSBzcmNTcGVjLnNwZWMuZGltZW5zaW9ucyB8fCB7fTtcblxuICAgICAgICB2YXIgZGltcyA9IGdwbFNwZWMuc291cmNlc1snLyddLmRpbXM7XG5cbiAgICAgICAgdmFyIHJlZHVjZUl0ZXJhdG9yID0gKHJvdywga2V5KSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChfLmlzT2JqZWN0KHJvd1trZXldKSAmJiAhXy5pc0RhdGUocm93W2tleV0pKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKHJvd1trZXldLCAodiwgaykgPT4gKHJvd1trZXkgKyAnLicgKyBrXSA9IHYpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfTtcblxuICAgICAgICBncGxTcGVjLnNvdXJjZXNbJy8nXS5kYXRhID0gc3JjU3BlY1xuICAgICAgICAgICAgLmRhdGFcbiAgICAgICAgICAgIC5tYXAoKHJvd04pID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gKE9iamVjdC5rZXlzKHJvd04pLnJlZHVjZShyZWR1Y2VJdGVyYXRvciwgcm93TikpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoT2JqZWN0LmtleXMoZGltcykucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAociwgaykgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXIuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByW2tdID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChyW2tdICE9PSBudWxsKSAmJiBtZXRhW2tdICYmIChbJ3BlcmlvZCcsICd0aW1lJ10uaW5kZXhPZihtZXRhW2tdLnNjYWxlKSA+PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJba10gPSBuZXcgRGF0ZShyW2tdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJvdykpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcnVsZUFzc2lnblNvdXJjZURpbXMoc3JjU3BlYywgZ3BsU3BlYykge1xuICAgICAgICB2YXIgZGltcyA9IHNyY1NwZWMuc3BlYy5kaW1lbnNpb25zO1xuICAgICAgICBncGxTcGVjLnNvdXJjZXNbJy8nXS5kaW1zID0gT2JqZWN0XG4gICAgICAgICAgICAua2V5cyhkaW1zKVxuICAgICAgICAgICAgLnJlZHVjZSgobWVtbywgaykgPT4ge1xuICAgICAgICAgICAgICAgIG1lbW9ba10gPSB7dHlwZTogZGltc1trXS50eXBlfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgIH0sIHt9KTtcbiAgICB9XG5cbiAgICBydWxlQXNzaWduU3RydWN0dXJlKHNyY1NwZWMsIGdwbFNwZWMpIHtcblxuICAgICAgICB2YXIgd2Fsa1N0cnVjdHVyZSA9IChzcmNVbml0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZ3BsUm9vdCA9IHV0aWxzLmNsb25lKF8ub21pdChzcmNVbml0LCAndW5pdCcpKTtcbiAgICAgICAgICAgIGdwbFJvb3QuZXhwcmVzc2lvbiA9IHRoaXMucnVsZUluZmVyRXhwcmVzc2lvbihzcmNVbml0KTtcbiAgICAgICAgICAgIHRoaXMucnVsZUNyZWF0ZVNjYWxlcyhzcmNVbml0LCBncGxSb290KTtcblxuICAgICAgICAgICAgaWYgKHNyY1VuaXQudW5pdCkge1xuICAgICAgICAgICAgICAgIGdwbFJvb3QudW5pdHMgPSBzcmNVbml0LnVuaXQubWFwKHdhbGtTdHJ1Y3R1cmUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZ3BsUm9vdDtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcm9vdCA9IHdhbGtTdHJ1Y3R1cmUoc3JjU3BlYy5zcGVjLnVuaXQpO1xuICAgICAgICByb290LmV4cHJlc3Npb24uaW5oZXJpdCA9IGZhbHNlO1xuICAgICAgICBncGxTcGVjLnVuaXQgPSByb290O1xuICAgIH1cblxuICAgIHJ1bGVDcmVhdGVTY2FsZXMoc3JjVW5pdCwgZ3BsUm9vdCkge1xuXG4gICAgICAgIHZhciBndWlkZSA9IHNyY1VuaXQuZ3VpZGUgfHwge307XG4gICAgICAgIFsnY29sb3InLCAnc2l6ZScsICd4JywgJ3knXS5mb3JFYWNoKChwKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3JjVW5pdC5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgICAgICAgICAgIGdwbFJvb3RbcF0gPSB0aGlzLnNjYWxlc1Bvb2wocCwgc3JjVW5pdFtwXSwgZ3VpZGVbcF0gfHwge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBydWxlSW5mZXJEaW0oZGltTmFtZSwgZ3VpZGUpIHtcblxuICAgICAgICB2YXIgciA9IGRpbU5hbWU7XG5cbiAgICAgICAgdmFyIGRpbXMgPSB0aGlzLnNwZWMuc3BlYy5kaW1lbnNpb25zO1xuXG4gICAgICAgIGlmICghZGltcy5oYXNPd25Qcm9wZXJ0eShyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ3VpZGUuaGFzT3duUHJvcGVydHkoJ3RpY2tMYWJlbCcpKSB7XG4gICAgICAgICAgICByID0gYCR7ZGltTmFtZX0uJHtndWlkZS50aWNrTGFiZWx9YDtcbiAgICAgICAgfSBlbHNlIGlmIChkaW1zW2RpbU5hbWVdLnZhbHVlKSB7XG4gICAgICAgICAgICByID0gYCR7ZGltTmFtZX0uJHtkaW1zW2RpbU5hbWVdLnZhbHVlfWA7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbXlEaW1zID0gdGhpcy5kaXN0LnNvdXJjZXNbJy8nXS5kaW1zO1xuICAgICAgICBpZiAoIW15RGltcy5oYXNPd25Qcm9wZXJ0eShyKSkge1xuICAgICAgICAgICAgbXlEaW1zW3JdID0ge3R5cGU6bXlEaW1zW2RpbU5hbWVdLnR5cGV9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfVxuXG4gICAgc2NhbGVzUG9vbChzY2FsZVR5cGUsIGRpbU5hbWUsIGd1aWRlKSB7XG5cbiAgICAgICAgdmFyIGsgPSBgJHtzY2FsZVR5cGV9XyR7ZGltTmFtZX1gO1xuXG4gICAgICAgIGlmICh0aGlzLmRpc3Quc2NhbGVzLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICByZXR1cm4gaztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaW1zID0gdGhpcy5zcGVjLnNwZWMuZGltZW5zaW9ucztcblxuICAgICAgICB2YXIgaXRlbSA9IHt9O1xuICAgICAgICBpZiAoc2NhbGVUeXBlID09PSAnY29sb3InICYmIGRpbU5hbWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJyxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICcvJyxcbiAgICAgICAgICAgICAgICBkaW06IHRoaXMucnVsZUluZmVyRGltKGRpbU5hbWUsIGd1aWRlKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGd1aWRlLmhhc093blByb3BlcnR5KCdicmV3ZXInKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uYnJld2VyID0gZ3VpZGUuYnJld2VyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGltc1tkaW1OYW1lXSAmJiBkaW1zW2RpbU5hbWVdLmhhc093blByb3BlcnR5KCdvcmRlcicpKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5vcmRlciA9IGRpbXNbZGltTmFtZV0ub3JkZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2NhbGVUeXBlID09PSAnc2l6ZScgJiYgZGltTmFtZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2l6ZScsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnLycsXG4gICAgICAgICAgICAgICAgZGltOiB0aGlzLnJ1bGVJbmZlckRpbShkaW1OYW1lLCBndWlkZSksXG4gICAgICAgICAgICAgICAgbWluOiAyLFxuICAgICAgICAgICAgICAgIG1heDogMTAsXG4gICAgICAgICAgICAgICAgbWlkOiA1XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpbXMuaGFzT3duUHJvcGVydHkoZGltTmFtZSkgJiYgKHNjYWxlVHlwZSA9PT0gJ3gnIHx8IHNjYWxlVHlwZSA9PT0gJ3knKSkge1xuICAgICAgICAgICAgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBkaW1zW2RpbU5hbWVdLnNjYWxlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJy8nLFxuICAgICAgICAgICAgICAgIGRpbTogdGhpcy5ydWxlSW5mZXJEaW0oZGltTmFtZSwgZ3VpZGUpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoZGltc1tkaW1OYW1lXS5oYXNPd25Qcm9wZXJ0eSgnb3JkZXInKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0ub3JkZXIgPSBkaW1zW2RpbU5hbWVdLm9yZGVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZ3VpZGUuaGFzT3duUHJvcGVydHkoJ21pbicpKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5taW4gPSBndWlkZS5taW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChndWlkZS5oYXNPd25Qcm9wZXJ0eSgnbWF4JykpIHtcbiAgICAgICAgICAgICAgICBpdGVtLm1heCA9IGd1aWRlLm1heDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGd1aWRlLmhhc093blByb3BlcnR5KCdhdXRvU2NhbGUnKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uYXV0b1NjYWxlID0gZ3VpZGUuYXV0b1NjYWxlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtLmF1dG9TY2FsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChndWlkZS5oYXNPd25Qcm9wZXJ0eSgndGlja1BlcmlvZCcpKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5wZXJpb2QgPSBndWlkZS50aWNrUGVyaW9kO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpdGVtLmZpdFRvRnJhbWVCeURpbXMgPSBndWlkZS5maXRUb0ZyYW1lQnlEaW1zO1xuXG4gICAgICAgICAgICBpdGVtLnJhdGlvID0gZ3VpZGUucmF0aW87XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpc3Quc2NhbGVzW2tdID0gaXRlbTtcblxuICAgICAgICByZXR1cm4gaztcbiAgICB9XG5cbiAgICBydWxlSW5mZXJFeHByZXNzaW9uKHNyY1VuaXQpIHtcblxuICAgICAgICB2YXIgZXhwciA9IHtcbiAgICAgICAgICAgIG9wZXJhdG9yOiAnbm9uZScsXG4gICAgICAgICAgICBwYXJhbXM6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGcgPSBzcmNVbml0Lmd1aWRlIHx8IHt9O1xuICAgICAgICB2YXIgZ3ggPSBnLnggfHwge307XG4gICAgICAgIHZhciBneSA9IGcueSB8fCB7fTtcblxuICAgICAgICBpZiAoc3JjVW5pdC50eXBlLmluZGV4T2YoJ0VMRU1FTlQuJykgPT09IDApIHtcblxuICAgICAgICAgICAgaWYgKHNyY1VuaXQuY29sb3IpIHtcbiAgICAgICAgICAgICAgICBleHByID0ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjogJ2dyb3VwQnknLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVsZUluZmVyRGltKHNyY1VuaXQuY29sb3IsIGcuY29sb3IgfHwge30pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoc3JjVW5pdC50eXBlID09PSAnQ09PUkRTLlJFQ1QnKSB7XG5cbiAgICAgICAgICAgIGlmIChzcmNVbml0LnVuaXQubGVuZ3RoID09PSAxICYmIHNyY1VuaXQudW5pdFswXS50eXBlID09PSAnQ09PUkRTLlJFQ1QnKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBqc2hpbnQgaWdub3JlOnN0YXJ0XG4gICAgICAgICAgICAgICAgLy8ganNjczpkaXNhYmxlIHJlcXVpcmVEb3ROb3RhdGlvblxuICAgICAgICAgICAgICAgIGlmIChneFsndGlja1BlcmlvZCddIHx8IGd5Wyd0aWNrUGVyaW9kJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yOiAnY3Jvc3NfcGVyaW9kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVsZUluZmVyRGltKHNyY1VuaXQueCwgZ3gpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVsZUluZmVyRGltKHNyY1VuaXQueSwgZ3kpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4Wyd0aWNrUGVyaW9kJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3lbJ3RpY2tQZXJpb2QnXVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cHIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcjogJ2Nyb3NzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVsZUluZmVyRGltKHNyY1VuaXQueCwgZ3gpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVsZUluZmVyRGltKHNyY1VuaXQueSwgZ3kpXG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGpzY3M6ZW5hYmxlIHJlcXVpcmVEb3ROb3RhdGlvblxuICAgICAgICAgICAgICAgIC8vIGpzaGludCBpZ25vcmU6ZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gXy5leHRlbmQoe2luaGVyaXQ6IHRydWUsIHNvdXJjZTogJy8nfSwgZXhwcik7XG4gICAgfVxufSJdfQ==;
define('utils/utils-draw',['exports'], function (exports) {
    /* jshint ignore:start */
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    var utilsDraw = {
        translate: function translate(left, top) {
            return 'translate(' + left + ',' + top + ')';
        },
        rotate: function rotate(angle) {
            return 'rotate(' + angle + ')';
        },
        getOrientation: function getOrientation(scaleOrient) {
            return ['bottom', 'top'].indexOf(scaleOrient.toLowerCase()) >= 0 ? 'h' : 'v';
        },
        isIntersect: function isIntersect(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
            var s1_x, s1_y, s2_x, s2_y;
            s1_x = ax1 - ax0;
            s1_y = ay1 - ay0;
            s2_x = bx1 - bx0;
            s2_y = by1 - by0;

            var s, t;
            s = (-s1_y * (ax0 - bx0) + s1_x * (ay0 - by0)) / (-s2_x * s1_y + s1_x * s2_y);
            t = (s2_x * (ay0 - by0) - s2_y * (ax0 - bx0)) / (-s2_x * s1_y + s1_x * s2_y);

            return s >= 0 && s <= 1 && t >= 0 && t <= 1;
        }
    };
    /* jshint ignore:end */

    exports.utilsDraw = utilsDraw;
});
define('formatter-registry',['exports', 'd3'], function (exports, _d3) {
    /* jshint ignore:start */
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */
    var FORMATS_MAP = {

        'x-num-auto': function xNumAuto(x) {
            var v = parseFloat(x.toFixed(2));
            return Math.abs(v) < 1 ? v.toString() : _d32['default'].format('s')(v);
        },

        percent: function percent(x) {
            var v = parseFloat((x * 100).toFixed(2));
            return v.toString() + '%';
        },

        day: _d32['default'].time.format('%d-%b-%Y'),

        'day-short': _d32['default'].time.format('%d-%b'),

        week: _d32['default'].time.format('%d-%b-%Y'),

        'week-short': _d32['default'].time.format('%d-%b'),

        month: function month(x) {
            var d = new Date(x);
            var m = d.getMonth();
            var formatSpec = m === 0 ? '%B, %Y' : '%B';
            return _d32['default'].time.format(formatSpec)(x);
        },

        'month-short': function monthShort(x) {
            var d = new Date(x);
            var m = d.getMonth();
            var formatSpec = m === 0 ? '%b \'%y' : '%b';
            return _d32['default'].time.format(formatSpec)(x);
        },

        'month-year': _d32['default'].time.format('%B, %Y'),

        quarter: function quarter(x) {
            var d = new Date(x);
            var m = d.getMonth();
            var q = (m - m % 3) / 3;
            return 'Q' + (q + 1) + ' ' + d.getFullYear();
        },

        year: _d32['default'].time.format('%Y'),

        'x-time-auto': null
    };

    var FormatterRegistry = {

        get: function get(formatAlias, nullOrUndefinedAlias) {

            var nullAlias = nullOrUndefinedAlias || '';

            var identity = function identity(x) {
                return (x === null || typeof x === 'undefined' ? nullAlias : x).toString();
            };

            var hasFormat = FORMATS_MAP.hasOwnProperty(formatAlias);
            var formatter = hasFormat ? FORMATS_MAP[formatAlias] : identity;

            if (hasFormat) {
                formatter = FORMATS_MAP[formatAlias];
            }

            if (!hasFormat && formatAlias) {
                formatter = function (v) {
                    var f = _.isDate(v) ? _d32['default'].time.format(formatAlias) : _d32['default'].format(formatAlias);
                    return f(v);
                };
            }

            if (!hasFormat && !formatAlias) {
                formatter = identity;
            }

            return formatter;
        },

        add: function add(formatAlias, formatter) {
            FORMATS_MAP[formatAlias] = formatter;
        }
    };

    exports.FormatterRegistry = FormatterRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9mb3JtYXR0ZXItcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUdBLFFBQUksV0FBVyxHQUFHOztBQUVkLG9CQUFZLEVBQUUsa0JBQVUsQ0FBQyxFQUFFO0FBQ3ZCLGdCQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLG1CQUFPLEFBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLGdCQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvRDs7QUFFRCxlQUFPLEVBQUUsaUJBQVUsQ0FBQyxFQUFFO0FBQ2xCLGdCQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBLENBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsbUJBQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztTQUM3Qjs7QUFFRCxXQUFHLEVBQUUsZ0JBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7O0FBRS9CLG1CQUFXLEVBQUUsZ0JBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7O0FBRXBDLFlBQUksRUFBRSxnQkFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQzs7QUFFaEMsb0JBQVksRUFBRSxnQkFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7QUFFckMsYUFBSyxFQUFFLGVBQUMsQ0FBQyxFQUFLO0FBQ1YsZ0JBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLGdCQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsZ0JBQUksVUFBVSxHQUFHLEFBQUMs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cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBqc2hpbnQgaWdub3JlOnN0YXJ0ICovXG5pbXBvcnQge2RlZmF1bHQgYXMgZDN9IGZyb20gJ2QzJztcbi8qIGpzaGludCBpZ25vcmU6ZW5kICovXG52YXIgRk9STUFUU19NQVAgPSB7XG5cbiAgICAneC1udW0tYXV0byc6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHZhciB2ID0gcGFyc2VGbG9hdCh4LnRvRml4ZWQoMikpO1xuICAgICAgICByZXR1cm4gKE1hdGguYWJzKHYpIDwgMSkgPyB2LnRvU3RyaW5nKCkgOiBkMy5mb3JtYXQoJ3MnKSh2KTtcbiAgICB9LFxuXG4gICAgcGVyY2VudDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgdmFyIHYgPSBwYXJzZUZsb2F0KCh4ICogMTAwKS50b0ZpeGVkKDIpKTtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoKSArICclJztcbiAgICB9LFxuXG4gICAgZGF5OiBkMy50aW1lLmZvcm1hdCgnJWQtJWItJVknKSxcblxuICAgICdkYXktc2hvcnQnOiBkMy50aW1lLmZvcm1hdCgnJWQtJWInKSxcblxuICAgIHdlZWs6IGQzLnRpbWUuZm9ybWF0KCclZC0lYi0lWScpLFxuXG4gICAgJ3dlZWstc2hvcnQnOiBkMy50aW1lLmZvcm1hdCgnJWQtJWInKSxcblxuICAgIG1vbnRoOiAoeCkgPT4ge1xuICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKHgpO1xuICAgICAgICB2YXIgbSA9IGQuZ2V0TW9udGgoKTtcbiAgICAgICAgdmFyIGZvcm1hdFNwZWMgPSAobSA9PT0gMCkgPyAnJUIsICVZJyA6ICclQic7XG4gICAgICAgIHJldHVybiBkMy50aW1lLmZvcm1hdChmb3JtYXRTcGVjKSh4KTtcbiAgICB9LFxuXG4gICAgJ21vbnRoLXNob3J0JzogKHgpID0+IHtcbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSh4KTtcbiAgICAgICAgdmFyIG0gPSBkLmdldE1vbnRoKCk7XG4gICAgICAgIHZhciBmb3JtYXRTcGVjID0gKG0gPT09IDApID8gJyViIFxcJyV5JyA6ICclYic7XG4gICAgICAgIHJldHVybiBkMy50aW1lLmZvcm1hdChmb3JtYXRTcGVjKSh4KTtcbiAgICB9LFxuXG4gICAgJ21vbnRoLXllYXInOiBkMy50aW1lLmZvcm1hdCgnJUIsICVZJyksXG5cbiAgICBxdWFydGVyOiAoeCkgPT4ge1xuICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKHgpO1xuICAgICAgICB2YXIgbSA9IGQuZ2V0TW9udGgoKTtcbiAgICAgICAgdmFyIHEgPSAobSAtIChtICUgMykpIC8gMztcbiAgICAgICAgcmV0dXJuICdRJyArIChxICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XG4gICAgfSxcblxuICAgIHllYXI6IGQzLnRpbWUuZm9ybWF0KCclWScpLFxuXG4gICAgJ3gtdGltZS1hdXRvJzogbnVsbFxufTtcblxudmFyIEZvcm1hdHRlclJlZ2lzdHJ5ID0ge1xuXG4gICAgZ2V0OiAoZm9ybWF0QWxpYXMsIG51bGxPclVuZGVmaW5lZEFsaWFzKSA9PiB7XG5cbiAgICAgICAgdmFyIG51bGxBbGlhcyA9IG51bGxPclVuZGVmaW5lZEFsaWFzIHx8ICcnO1xuXG4gICAgICAgIHZhciBpZGVudGl0eSA9ICgoeCkgPT4gKCgoeCA9PT0gbnVsbCkgfHwgKHR5cGVvZiB4ID09PSAndW5kZWZpbmVkJykpID8gbnVsbEFsaWFzIDogeCkudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgdmFyIGhhc0Zvcm1hdCA9IEZPUk1BVFNfTUFQLmhhc093blByb3BlcnR5KGZvcm1hdEFsaWFzKTtcbiAgICAgICAgdmFyIGZvcm1hdHRlciA9IGhhc0Zvcm1hdCA/IEZPUk1BVFNfTUFQW2Zvcm1hdEFsaWFzXSA6IGlkZW50aXR5O1xuXG4gICAgICAgIGlmIChoYXNGb3JtYXQpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlciA9IEZPUk1BVFNfTUFQW2Zvcm1hdEFsaWFzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFzRm9ybWF0ICYmIGZvcm1hdEFsaWFzKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZXIgPSAodikgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBmID0gXy5pc0RhdGUodikgPyBkMy50aW1lLmZvcm1hdChmb3JtYXRBbGlhcykgOiBkMy5mb3JtYXQoZm9ybWF0QWxpYXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmKHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFzRm9ybWF0ICYmICFmb3JtYXRBbGlhcykge1xuICAgICAgICAgICAgZm9ybWF0dGVyID0gaWRlbnRpdHk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybWF0dGVyO1xuICAgIH0sXG5cbiAgICBhZGQ6IChmb3JtYXRBbGlhcywgZm9ybWF0dGVyKSA9PiB7XG4gICAgICAgIEZPUk1BVFNfTUFQW2Zvcm1hdEFsaWFzXSA9IGZvcm1hdHRlcjtcbiAgICB9XG59O1xuXG5leHBvcnQge0Zvcm1hdHRlclJlZ2lzdHJ5fTsiXX0=;
define('spec-transform-auto-layout',['exports', 'underscore', './utils/utils', './utils/utils-draw', './formatter-registry', './utils/utils-dom'], function (exports, _underscore, _utilsUtils, _utilsUtilsDraw, _formatterRegistry, _utilsUtilsDom) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _2 = _interopRequireDefault(_underscore);

    function extendGuide(guide, targetUnit, dimension, properties) {
        var guide_dim = guide.hasOwnProperty(dimension) ? guide[dimension] : {};
        guide_dim = guide_dim || {};
        _2['default'].each(properties, function (prop) {
            _2['default'].extend(targetUnit.guide[dimension][prop], guide_dim[prop]);
        });
        _2['default'].extend(targetUnit.guide[dimension], _2['default'].omit.apply(_2['default'], [guide_dim].concat[properties]));
    }

    var applyCustomProps = function applyCustomProps(targetUnit, customUnit) {
        var guide = customUnit.guide || {};
        var config = {
            x: ['label'],
            y: ['label'],
            size: ['label'],
            color: ['label'],
            padding: []
        };

        _2['default'].each(config, function (properties, name) {
            extendGuide(guide, targetUnit, name, properties);
        });
        _2['default'].extend(targetUnit.guide, _2['default'].omit.apply(_2['default'], [guide].concat(_2['default'].keys(config))));
        return targetUnit;
    };

    var extendLabel = function extendLabel(guide, dimension, extend) {
        guide[dimension] = _2['default'].defaults(guide[dimension] || {}, {
            label: ''
        });
        guide[dimension].label = _2['default'].isObject(guide[dimension].label) ? guide[dimension].label : { text: guide[dimension].label };
        guide[dimension].label = _2['default'].defaults(guide[dimension].label, extend || {}, {
            padding: 32,
            rotate: 0,
            textAnchor: 'middle',
            cssClass: 'label',
            dock: null
        });

        return guide[dimension];
    };
    var extendAxis = function extendAxis(guide, dimension, extend) {
        guide[dimension] = _2['default'].defaults(guide[dimension], extend || {}, {
            padding: 0,
            density: 30,
            rotate: 0,
            tickPeriod: null,
            tickFormat: null,
            autoScale: true
        });
        guide[dimension].tickFormat = guide[dimension].tickFormat || guide[dimension].tickPeriod;
        return guide[dimension];
    };

    var applyNodeDefaults = function applyNodeDefaults(node) {
        node.options = node.options || {};
        node.guide = node.guide || {};
        node.guide.padding = _2['default'].defaults(node.guide.padding || {}, { l: 0, b: 0, r: 0, t: 0 });

        node.guide.x = extendLabel(node.guide, 'x');
        node.guide.x = extendAxis(node.guide, 'x', {
            cssClass: 'x axis',
            scaleOrient: 'bottom',
            textAnchor: 'middle'
        });

        node.guide.y = extendLabel(node.guide, 'y', { rotate: -90 });
        node.guide.y = extendAxis(node.guide, 'y', {
            cssClass: 'y axis',
            scaleOrient: 'left',
            textAnchor: 'end'
        });

        node.guide.size = extendLabel(node.guide, 'size');
        node.guide.color = extendLabel(node.guide, 'color');

        return node;
    };

    var inheritProps = function inheritProps(childUnit, root) {

        childUnit.guide = childUnit.guide || {};
        childUnit.guide.padding = childUnit.guide.padding || { l: 0, t: 0, r: 0, b: 0 };

        // leaf elements should inherit coordinates properties
        if (!childUnit.hasOwnProperty('units')) {
            childUnit = _2['default'].defaults(childUnit, root);
            childUnit.guide = _2['default'].defaults(childUnit.guide, _utilsUtils.utils.clone(root.guide));
            childUnit.guide.x = _2['default'].defaults(childUnit.guide.x, _utilsUtils.utils.clone(root.guide.x));
            childUnit.guide.y = _2['default'].defaults(childUnit.guide.y, _utilsUtils.utils.clone(root.guide.y));
        }

        return childUnit;
    };

    var createSelectorPredicates = function createSelectorPredicates(root) {

        var children = root.units || [];

        var isLeaf = !root.hasOwnProperty('units');
        var isLeafParent = !children.some(function (c) {
            return c.hasOwnProperty('units');
        });

        return {
            type: root.type,
            isLeaf: isLeaf,
            isLeafParent: !isLeaf && isLeafParent
        };
    };

    var getMaxTickLabelSize = function getMaxTickLabelSize(domainValues, formatter, fnCalcTickLabelSize, axisLabelLimit) {

        if (domainValues.length === 0) {
            return { width: 0, height: 0 };
        }

        if (formatter === null) {
            var size = fnCalcTickLabelSize('TauChart Library');
            size.width = axisLabelLimit * 0.625; // golden ratio
            return size;
        }

        var maxXTickText = _2['default'].max(domainValues, function (x) {
            return formatter(x).toString().length;
        });

        // d3 sometimes produce fractional ticks on wide space
        // so we intentionally add fractional suffix
        // to foresee scale density issues
        var suffix = _2['default'].isNumber(maxXTickText) ? '.00' : '';

        return fnCalcTickLabelSize(formatter(maxXTickText) + suffix);
    };

    var getTickFormat = function getTickFormat(dim, defaultFormats) {
        var dimType = dim.dimType;
        var scaleType = dim.scaleType;
        var specifier = '*';

        var key = [dimType, scaleType, specifier].join(':');
        var tag = [dimType, scaleType].join(':');
        return defaultFormats[key] || defaultFormats[tag] || defaultFormats[dimType] || null;
    };

    var calcUnitGuide = function calcUnitGuide(unit, meta, settings, allowXVertical, allowYVertical, inlineLabels) {

        var dimX = meta.dimension(unit.x);
        var dimY = meta.dimension(unit.y);

        var isXContinues = dimX.dimType === 'measure';
        var isYContinues = dimY.dimType === 'measure';

        var xDensityPadding = settings.hasOwnProperty('xDensityPadding:' + dimX.dimType) ? settings['xDensityPadding:' + dimX.dimType] : settings.xDensityPadding;

        var yDensityPadding = settings.hasOwnProperty('yDensityPadding:' + dimY.dimType) ? settings['yDensityPadding:' + dimY.dimType] : settings.yDensityPadding;

        var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
        var xValues = xMeta.values;
        var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
        var yValues = yMeta.values;

        unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats);
        unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats);

        if (['day', 'week', 'month'].indexOf(unit.guide.x.tickFormat) >= 0) {
            unit.guide.x.tickFormat += '-short';
        }

        if (['day', 'week', 'month'].indexOf(unit.guide.y.tickFormat) >= 0) {
            unit.guide.y.tickFormat += '-short';
        }

        var xIsEmptyAxis = xValues.length === 0;
        var yIsEmptyAxis = yValues.length === 0;

        var maxXTickSize = getMaxTickLabelSize(xValues, _formatterRegistry.FormatterRegistry.get(unit.guide.x.tickFormat, unit.guide.x.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.xAxisTickLabelLimit);

        var maxYTickSize = getMaxTickLabelSize(yValues, _formatterRegistry.FormatterRegistry.get(unit.guide.y.tickFormat, unit.guide.y.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.yAxisTickLabelLimit);

        var xAxisPadding = settings.xAxisPadding;
        var yAxisPadding = settings.yAxisPadding;

        var isXVertical = allowXVertical ? !isXContinues : false;
        var isYVertical = allowYVertical ? !isYContinues : false;

        unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
        unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

        unit.guide.x.rotate = isXVertical ? 90 : 0;
        unit.guide.x.textAnchor = isXVertical ? 'start' : unit.guide.x.textAnchor;

        unit.guide.y.rotate = isYVertical ? -90 : 0;
        unit.guide.y.textAnchor = isYVertical ? 'middle' : unit.guide.y.textAnchor;

        var xTickWidth = xIsEmptyAxis ? 0 : settings.xTickWidth;
        var yTickWidth = yIsEmptyAxis ? 0 : settings.yTickWidth;

        unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
        unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

        var xTickBox = isXVertical ? { w: maxXTickSize.height, h: maxXTickSize.width } : { h: maxXTickSize.height, w: maxXTickSize.width };

        if (maxXTickSize.width > settings.xAxisTickLabelLimit) {

            unit.guide.x.tickFormatWordWrap = true;
            unit.guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;

            var guessLinesCount = Math.ceil(maxXTickSize.width / settings.xAxisTickLabelLimit);
            var koeffLinesCount = Math.min(guessLinesCount, settings.xTickWordWrapLinesLimit);
            var textLinesHeight = koeffLinesCount * maxXTickSize.height;

            if (isXVertical) {
                xTickBox.h = settings.xAxisTickLabelLimit;
                xTickBox.w = textLinesHeight;
            } else {
                xTickBox.h = textLinesHeight;
                xTickBox.w = settings.xAxisTickLabelLimit;
            }
        }

        var yTickBox = isYVertical ? { w: maxYTickSize.height, h: maxYTickSize.width } : { h: maxYTickSize.height, w: maxYTickSize.width };

        if (maxYTickSize.width > settings.yAxisTickLabelLimit) {

            unit.guide.y.tickFormatWordWrap = true;
            unit.guide.y.tickFormatWordWrapLines = settings.yTickWordWrapLinesLimit;

            var guessLinesCount = Math.ceil(maxYTickSize.width / settings.yAxisTickLabelLimit);
            var koeffLinesCount = Math.min(guessLinesCount, settings.yTickWordWrapLinesLimit);
            var textLinesHeight = koeffLinesCount * maxYTickSize.height;

            if (isYVertical) {
                yTickBox.w = textLinesHeight;
                yTickBox.h = settings.yAxisTickLabelLimit;
            } else {
                yTickBox.w = settings.yAxisTickLabelLimit;
                yTickBox.h = textLinesHeight;
            }
        }

        var xFontH = xTickWidth + xTickBox.h;
        var yFontW = yTickWidth + yTickBox.w;

        var xFontLabelHeight = settings.xFontLabelHeight;
        var yFontLabelHeight = settings.yFontLabelHeight;

        var distToXAxisLabel = settings.distToXAxisLabel;
        var distToYAxisLabel = settings.distToYAxisLabel;

        unit.guide.x.density = xTickBox.w + xDensityPadding * 2;
        unit.guide.y.density = yTickBox.h + yDensityPadding * 2;

        if (!inlineLabels) {
            unit.guide.x.label.padding = xFontLabelHeight + (unit.guide.x.label.text ? xFontH + distToXAxisLabel : 0);
            unit.guide.y.label.padding = -xFontLabelHeight + (unit.guide.y.label.text ? yFontW + distToYAxisLabel : 0);

            var xLabelPadding = unit.guide.x.label.text ? unit.guide.x.label.padding + xFontLabelHeight : xFontH;
            var yLabelPadding = unit.guide.y.label.text ? unit.guide.y.label.padding + yFontLabelHeight : yFontW;

            unit.guide.padding.b = xAxisPadding + xLabelPadding - xTickWidth;
            unit.guide.padding.l = yAxisPadding + yLabelPadding;

            unit.guide.padding.b = unit.guide.x.hide ? 0 : unit.guide.padding.b;
            unit.guide.padding.l = unit.guide.y.hide ? 0 : unit.guide.padding.l;
        } else {
            var pd = (xAxisPadding - xFontLabelHeight) / 2;
            unit.guide.x.label.padding = 0 + xFontLabelHeight - distToXAxisLabel + pd;
            unit.guide.y.label.padding = 0 - distToYAxisLabel + pd;

            unit.guide.x.label.cssClass += ' inline';
            unit.guide.x.label.dock = 'right';
            unit.guide.x.label.textAnchor = 'end';

            unit.guide.y.label.cssClass += ' inline';
            unit.guide.y.label.dock = 'right';
            unit.guide.y.label.textAnchor = 'end';

            unit.guide.padding.b = xAxisPadding + xFontH;
            unit.guide.padding.l = yAxisPadding + yFontW;

            unit.guide.padding.b = unit.guide.x.hide ? 0 : unit.guide.padding.b;
            unit.guide.padding.l = unit.guide.y.hide ? 0 : unit.guide.padding.l;
        }

        unit.guide.x.tickFontHeight = maxXTickSize.height;
        unit.guide.y.tickFontHeight = maxYTickSize.height;

        unit.guide.x.$minimalDomain = xValues.length;
        unit.guide.y.$minimalDomain = yValues.length;

        unit.guide.x.$maxTickTextW = maxXTickSize.width;
        unit.guide.x.$maxTickTextH = maxXTickSize.height;

        unit.guide.y.$maxTickTextW = maxYTickSize.width;
        unit.guide.y.$maxTickTextH = maxYTickSize.height;

        return unit;
    };

    var SpecEngineTypeMap = {

        NONE: function NONE(srcSpec, meta, settings) {

            var spec = _utilsUtils.utils.clone(srcSpec);
            fnTraverseSpec(_utilsUtils.utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {
                unit.guide.x.tickFontHeight = settings.getAxisTickLabelSize('X').height;
                unit.guide.y.tickFontHeight = settings.getAxisTickLabelSize('Y').height;

                unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
                unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

                return unit;
            });
            return spec;
        },

        'BUILD-LABELS': function BUILDLABELS(srcSpec, meta, settings) {

            var spec = _utilsUtils.utils.clone(srcSpec);

            var xLabels = [];
            var yLabels = [];
            var xUnit = null;
            var yUnit = null;

            _utilsUtils.utils.traverseJSON(spec.unit, 'units', createSelectorPredicates, function (selectors, unit) {

                if (selectors.isLeaf) {
                    return unit;
                }

                if (!xUnit && unit.x) {
                    xUnit = unit;
                }

                if (!yUnit && unit.y) {
                    yUnit = unit;
                }

                unit.guide = unit.guide || {};

                unit.guide.x = unit.guide.x || { label: '' };
                unit.guide.y = unit.guide.y || { label: '' };

                unit.guide.x.label = _2['default'].isObject(unit.guide.x.label) ? unit.guide.x.label : { text: unit.guide.x.label };
                unit.guide.y.label = _2['default'].isObject(unit.guide.y.label) ? unit.guide.y.label : { text: unit.guide.y.label };

                if (unit.x) {
                    unit.guide.x.label.text = unit.guide.x.label.text || meta.dimension(unit.x).dimName;
                }

                if (unit.y) {
                    unit.guide.y.label.text = unit.guide.y.label.text || meta.dimension(unit.y).dimName;
                }

                var x = unit.guide.x.label.text;
                if (x) {
                    xLabels.push(x);
                    unit.guide.x.tickFormatNullAlias = unit.guide.x.hasOwnProperty('tickFormatNullAlias') ? unit.guide.x.tickFormatNullAlias : 'No ' + x;
                    unit.guide.x.label.text = '';
                }

                var y = unit.guide.y.label.text;
                if (y) {
                    yLabels.push(y);
                    unit.guide.y.tickFormatNullAlias = unit.guide.y.hasOwnProperty('tickFormatNullAlias') ? unit.guide.y.tickFormatNullAlias : 'No ' + y;
                    unit.guide.y.label.text = '';
                }

                return unit;
            });

            if (xUnit) {
                xUnit.guide.x.label.text = xLabels.join(' > ');
            }

            if (yUnit) {
                yUnit.guide.y.label.text = yLabels.join(' > ');
            }

            return spec;
        },

        'BUILD-GUIDE': function BUILDGUIDE(srcSpec, meta, settings) {

            var spec = _utilsUtils.utils.clone(srcSpec);
            fnTraverseSpec(_utilsUtils.utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {

                if (selectorPredicates.isLeaf) {
                    return unit;
                }

                if (!unit.guide.hasOwnProperty('showGridLines')) {
                    unit.guide.showGridLines = selectorPredicates.isLeafParent ? 'xy' : '';
                }

                var isFacetUnit = !selectorPredicates.isLeaf && !selectorPredicates.isLeafParent;
                if (isFacetUnit) {
                    // unit is a facet!
                    unit.guide.x.cssClass += ' facet-axis';
                    unit.guide.x.avoidCollisions = true;
                    unit.guide.y.cssClass += ' facet-axis';
                    unit.guide.y.avoidCollisions = false;
                }

                var dimX = meta.dimension(unit.x);
                var dimY = meta.dimension(unit.y);

                var isXContinues = dimX.dimType === 'measure';
                var isYContinues = dimY.dimType === 'measure';

                var xDensityPadding = settings.hasOwnProperty('xDensityPadding:' + dimX.dimType) ? settings['xDensityPadding:' + dimX.dimType] : settings.xDensityPadding;

                var yDensityPadding = settings.hasOwnProperty('yDensityPadding:' + dimY.dimType) ? settings['yDensityPadding:' + dimY.dimType] : settings.yDensityPadding;

                var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
                var xValues = xMeta.values;
                var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
                var yValues = yMeta.values;

                unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats);
                unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats);

                var xIsEmptyAxis = xValues.length === 0;
                var yIsEmptyAxis = yValues.length === 0;

                var maxXTickSize = getMaxTickLabelSize(xValues, _formatterRegistry.FormatterRegistry.get(unit.guide.x.tickFormat, unit.guide.x.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.xAxisTickLabelLimit);

                var maxYTickSize = getMaxTickLabelSize(yValues, _formatterRegistry.FormatterRegistry.get(unit.guide.y.tickFormat, unit.guide.y.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.yAxisTickLabelLimit);

                var xAxisPadding = selectorPredicates.isLeafParent ? settings.xAxisPadding : 0;
                var yAxisPadding = selectorPredicates.isLeafParent ? settings.yAxisPadding : 0;

                var isXVertical = !isFacetUnit && (Boolean(dimX.dimType) && dimX.dimType !== 'measure');

                unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
                unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

                unit.guide.x.rotate = isXVertical ? 90 : 0;
                unit.guide.x.textAnchor = isXVertical ? 'start' : unit.guide.x.textAnchor;

                var xTickWidth = xIsEmptyAxis ? 0 : settings.xTickWidth;
                var yTickWidth = yIsEmptyAxis ? 0 : settings.yTickWidth;

                unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
                unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

                var maxXTickH = isXVertical ? maxXTickSize.width : maxXTickSize.height;

                if (!isXContinues && maxXTickH > settings.xAxisTickLabelLimit) {
                    maxXTickH = settings.xAxisTickLabelLimit;
                }

                if (!isXVertical && maxXTickSize.width > settings.xAxisTickLabelLimit) {
                    unit.guide.x.tickFormatWordWrap = true;
                    unit.guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;
                    maxXTickH = settings.xTickWordWrapLinesLimit * maxXTickSize.height;
                }

                var maxYTickW = maxYTickSize.width;
                if (!isYContinues && maxYTickW > settings.yAxisTickLabelLimit) {
                    maxYTickW = settings.yAxisTickLabelLimit;
                    unit.guide.y.tickFormatWordWrap = true;
                    unit.guide.y.tickFormatWordWrapLines = settings.yTickWordWrapLinesLimit;
                }

                var xFontH = xTickWidth + maxXTickH;
                var yFontW = yTickWidth + maxYTickW;

                var xFontLabelHeight = settings.xFontLabelHeight;
                var yFontLabelHeight = settings.yFontLabelHeight;

                var distToXAxisLabel = settings.distToXAxisLabel;
                var distToYAxisLabel = settings.distToYAxisLabel;

                var xTickLabelW = Math.min(settings.xAxisTickLabelLimit, isXVertical ? maxXTickSize.height : maxXTickSize.width);
                unit.guide.x.density = xTickLabelW + xDensityPadding * 2;

                var guessLinesCount = Math.ceil(maxYTickSize.width / settings.yAxisTickLabelLimit);
                var koeffLinesCount = Math.min(guessLinesCount, settings.yTickWordWrapLinesLimit);
                var yTickLabelH = Math.min(settings.yAxisTickLabelLimit, koeffLinesCount * maxYTickSize.height);
                unit.guide.y.density = yTickLabelH + yDensityPadding * 2;

                unit.guide.x.label.padding = unit.guide.x.label.text ? xFontH + distToXAxisLabel : 0;
                unit.guide.y.label.padding = unit.guide.y.label.text ? yFontW + distToYAxisLabel : 0;

                var xLabelPadding = unit.guide.x.label.text ? unit.guide.x.label.padding + xFontLabelHeight : xFontH;
                var yLabelPadding = unit.guide.y.label.text ? unit.guide.y.label.padding + yFontLabelHeight : yFontW;

                unit.guide.padding.b = xAxisPadding + xLabelPadding;
                unit.guide.padding.l = yAxisPadding + yLabelPadding;

                unit.guide.padding.b = unit.guide.x.hide ? 0 : unit.guide.padding.b;
                unit.guide.padding.l = unit.guide.y.hide ? 0 : unit.guide.padding.l;

                unit.guide.x.tickFontHeight = maxXTickSize.height;
                unit.guide.y.tickFontHeight = maxYTickSize.height;

                unit.guide.x.$minimalDomain = xValues.length;
                unit.guide.y.$minimalDomain = yValues.length;

                unit.guide.x.$maxTickTextW = maxXTickSize.width;
                unit.guide.x.$maxTickTextH = maxXTickSize.height;

                unit.guide.y.$maxTickTextW = maxYTickSize.width;
                unit.guide.y.$maxTickTextH = maxYTickSize.height;

                return unit;
            });
            return spec;
        },

        'BUILD-COMPACT': function BUILDCOMPACT(srcSpec, meta, settings) {

            var spec = _utilsUtils.utils.clone(srcSpec);
            fnTraverseSpec(_utilsUtils.utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {

                if (selectorPredicates.isLeaf) {
                    return unit;
                }

                if (!unit.guide.hasOwnProperty('showGridLines')) {
                    unit.guide.showGridLines = selectorPredicates.isLeafParent ? 'xy' : '';
                }

                if (selectorPredicates.isLeafParent) {

                    return calcUnitGuide(unit, meta, _2['default'].defaults({
                        xTickWordWrapLinesLimit: 1,
                        yTickWordWrapLinesLimit: 1
                    }, settings), true, false, true);
                }

                // facet level
                unit.guide.x.cssClass += ' facet-axis compact';
                unit.guide.x.avoidCollisions = true;
                unit.guide.y.cssClass += ' facet-axis compact';
                unit.guide.y.avoidCollisions = true;

                return calcUnitGuide(unit, meta, _2['default'].defaults({
                    xAxisPadding: 0,
                    yAxisPadding: 0,
                    distToXAxisLabel: 0,
                    distToYAxisLabel: 0,
                    xTickWordWrapLinesLimit: 1,
                    yTickWordWrapLinesLimit: 1
                }, settings), false, true, false);
            });

            return spec;
        }
    };

    SpecEngineTypeMap.AUTO = function (srcSpec, meta, settings) {
        return ['BUILD-LABELS', 'BUILD-GUIDE'].reduce(function (spec, engineName) {
            return SpecEngineTypeMap[engineName](spec, meta, settings);
        }, srcSpec);
    };

    SpecEngineTypeMap.COMPACT = function (srcSpec, meta, settings) {
        return ['BUILD-LABELS', 'BUILD-COMPACT'].reduce(function (spec, engineName) {
            return SpecEngineTypeMap[engineName](spec, meta, settings);
        }, srcSpec);
    };

    var fnTraverseSpec = function fnTraverseSpec(orig, specUnitRef, transformRules) {
        var xRef = applyNodeDefaults(specUnitRef);
        xRef = transformRules(createSelectorPredicates(xRef), xRef);
        xRef = applyCustomProps(xRef, orig);
        var prop = _2['default'].omit(xRef, 'units');
        (xRef.units || []).forEach(function (unit) {
            return fnTraverseSpec(_utilsUtils.utils.clone(unit), inheritProps(unit, prop), transformRules);
        });
        return xRef;
    };

    var SpecEngineFactory = {
        get: function get(typeName, settings, srcSpec, fnCreateScale) {

            var engine = SpecEngineTypeMap[typeName] || SpecEngineTypeMap.NONE;
            var meta = {

                dimension: function dimension(scaleId) {
                    var scaleCfg = srcSpec.scales[scaleId];
                    var dim = srcSpec.sources[scaleCfg.source].dims[scaleCfg.dim] || {};
                    return {
                        dimName: scaleCfg.dim,
                        dimType: dim.type,
                        scaleType: scaleCfg.type
                    };
                },

                scaleMeta: function scaleMeta(scaleId) {
                    var scale = fnCreateScale('pos', scaleId);
                    return {
                        values: scale.domain()
                    };
                }
            };

            var unitSpec = { unit: _utilsUtils.utils.clone(srcSpec.unit) };
            var fullSpec = engine(unitSpec, meta, settings);
            srcSpec.unit = fullSpec.unit;
            return srcSpec;
        }
    };

    var SpecTransformAutoLayout = (function () {
        function SpecTransformAutoLayout(spec) {
            _classCallCheck(this, SpecTransformAutoLayout);

            this.spec = spec;
            this.isApplicable = _utilsUtils.utils.isSpecRectCoordsOnly(spec.unit);
        }

        _createClass(SpecTransformAutoLayout, [{
            key: 'transform',
            value: function transform(chart) {

                var spec = this.spec;

                if (!this.isApplicable) {
                    return spec;
                }

                var size = spec.settings.size;

                var rule = _2['default'].find(spec.settings.specEngine, function (rule) {
                    return size.width <= rule.width;
                });

                return SpecEngineFactory.get(rule.name, spec.settings, spec, function (type, alias) {
                    return chart.getScaleInfo(alias || type + ':default');
                });
            }
        }]);

        return SpecTransformAutoLayout;
    })();

    exports.SpecTransformAutoLayout = SpecTransformAutoLayout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zcGVjLXRyYW5zZm9ybS1hdXRvLWxheW91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFNQSxhQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7QUFDM0QsWUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3hFLGlCQUFTLEdBQUcsU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUM1QixzQkFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ3pCLDBCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2hFLENBQUMsQ0FBQztBQUNILHNCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLGNBQUUsSUFBSSxDQUFDLEtBQUssZ0JBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFGOztBQUVELFFBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUksVUFBVSxFQUFFLFVBQVUsRUFBSztBQUMvQyxZQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztBQUNuQyxZQUFJLE1BQU0sR0FBRztBQUNULGFBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNaLGFBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNaLGdCQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDZixpQkFBSyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ2hCLG1CQUFPLEVBQUUsRUFBRTtTQUNkLENBQUM7O0FBRUYsc0JBQUUsSUFBSSxD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LENBQUMsSUFBSSxFQUNULElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxFQUNKLFVBQUMsSUFBSSxFQUFFLEtBQUs7MkJBQUssS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLElBQU8sSUFBSSxhQUFVLENBQUM7aUJBQUEsQ0FDbEUsQ0FBQzthQUNMOzs7ZUF6QlEsdUJBQXVCIiwiZmlsZSI6InNyYy9zcGVjLXRyYW5zZm9ybS1hdXRvLWxheW91dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZGVmYXVsdCBhcyBffSBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCB7dXRpbHN9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHt1dGlsc0RyYXd9IGZyb20gJy4vdXRpbHMvdXRpbHMtZHJhdyc7XG5pbXBvcnQge0Zvcm1hdHRlclJlZ2lzdHJ5fSBmcm9tICcuL2Zvcm1hdHRlci1yZWdpc3RyeSc7XG5pbXBvcnQge3V0aWxzRG9tfSBmcm9tICcuL3V0aWxzL3V0aWxzLWRvbSc7XG5cbmZ1bmN0aW9uIGV4dGVuZEd1aWRlKGd1aWRlLCB0YXJnZXRVbml0LCBkaW1lbnNpb24sIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgZ3VpZGVfZGltID0gZ3VpZGUuaGFzT3duUHJvcGVydHkoZGltZW5zaW9uKSA/IGd1aWRlW2RpbWVuc2lvbl0gOiB7fTtcbiAgICBndWlkZV9kaW0gPSBndWlkZV9kaW0gfHwge307XG4gICAgXy5lYWNoKHByb3BlcnRpZXMsIChwcm9wKSA9PiB7XG4gICAgICAgIF8uZXh0ZW5kKHRhcmdldFVuaXQuZ3VpZGVbZGltZW5zaW9uXVtwcm9wXSwgZ3VpZGVfZGltW3Byb3BdKTtcbiAgICB9KTtcbiAgICBfLmV4dGVuZCh0YXJnZXRVbml0Lmd1aWRlW2RpbWVuc2lvbl0sIF8ub21pdC5hcHBseShfLCBbZ3VpZGVfZGltXS5jb25jYXRbcHJvcGVydGllc10pKTtcbn1cblxudmFyIGFwcGx5Q3VzdG9tUHJvcHMgPSAodGFyZ2V0VW5pdCwgY3VzdG9tVW5pdCkgPT4ge1xuICAgIHZhciBndWlkZSA9IGN1c3RvbVVuaXQuZ3VpZGUgfHwge307XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgeDogWydsYWJlbCddLFxuICAgICAgICB5OiBbJ2xhYmVsJ10sXG4gICAgICAgIHNpemU6IFsnbGFiZWwnXSxcbiAgICAgICAgY29sb3I6IFsnbGFiZWwnXSxcbiAgICAgICAgcGFkZGluZzogW11cbiAgICB9O1xuXG4gICAgXy5lYWNoKGNvbmZpZywgKHByb3BlcnRpZXMsIG5hbWUpPT4ge1xuICAgICAgICBleHRlbmRHdWlkZShndWlkZSwgdGFyZ2V0VW5pdCwgbmFtZSwgcHJvcGVydGllcyk7XG4gICAgfSk7XG4gICAgXy5leHRlbmQodGFyZ2V0VW5pdC5ndWlkZSwgXy5vbWl0LmFwcGx5KF8sIFtndWlkZV0uY29uY2F0KF8ua2V5cyhjb25maWcpKSkpO1xuICAgIHJldHVybiB0YXJnZXRVbml0O1xufTtcblxudmFyIGV4dGVuZExhYmVsID0gZnVuY3Rpb24gKGd1aWRlLCBkaW1lbnNpb24sIGV4dGVuZCkge1xuICAgIGd1aWRlW2RpbWVuc2lvbl0gPSBfLmRlZmF1bHRzKGd1aWRlW2RpbWVuc2lvbl0gfHwge30sIHtcbiAgICAgICAgbGFiZWw6ICcnXG4gICAgfSk7XG4gICAgZ3VpZGVbZGltZW5zaW9uXS5sYWJlbCA9IF8uaXNPYmplY3QoZ3VpZGVbZGltZW5zaW9uXS5sYWJlbCkgP1xuICAgICAgICBndWlkZVtkaW1lbnNpb25dLmxhYmVsIDpcbiAgICB7dGV4dDogZ3VpZGVbZGltZW5zaW9uXS5sYWJlbH07XG4gICAgZ3VpZGVbZGltZW5zaW9uXS5sYWJlbCA9IF8uZGVmYXVsdHMoXG4gICAgICAgIGd1aWRlW2RpbWVuc2lvbl0ubGFiZWwsXG4gICAgICAgIGV4dGVuZCB8fCB7fSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGFkZGluZzogMzIsXG4gICAgICAgICAgICByb3RhdGU6IDAsXG4gICAgICAgICAgICB0ZXh0QW5jaG9yOiAnbWlkZGxlJyxcbiAgICAgICAgICAgIGNzc0NsYXNzOiAnbGFiZWwnLFxuICAgICAgICAgICAgZG9jazogbnVsbFxuICAgICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiBndWlkZVtkaW1lbnNpb25dO1xufTtcbnZhciBleHRlbmRBeGlzID0gZnVuY3Rpb24gKGd1aWRlLCBkaW1lbnNpb24sIGV4dGVuZCkge1xuICAgIGd1aWRlW2RpbWVuc2lvbl0gPSBfLmRlZmF1bHRzKFxuICAgICAgICBndWlkZVtkaW1lbnNpb25dLFxuICAgICAgICBleHRlbmQgfHwge30sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgICBkZW5zaXR5OiAzMCxcbiAgICAgICAgICAgIHJvdGF0ZTogMCxcbiAgICAgICAgICAgIHRpY2tQZXJpb2Q6IG51bGwsXG4gICAgICAgICAgICB0aWNrRm9ybWF0OiBudWxsLFxuICAgICAgICAgICAgYXV0b1NjYWxlOiB0cnVlXG4gICAgICAgIH1cbiAgICApO1xuICAgIGd1aWRlW2RpbWVuc2lvbl0udGlja0Zvcm1hdCA9IGd1aWRlW2RpbWVuc2lvbl0udGlja0Zvcm1hdCB8fCBndWlkZVtkaW1lbnNpb25dLnRpY2tQZXJpb2Q7XG4gICAgcmV0dXJuIGd1aWRlW2RpbWVuc2lvbl07XG59O1xuXG52YXIgYXBwbHlOb2RlRGVmYXVsdHMgPSAobm9kZSkgPT4ge1xuICAgIG5vZGUub3B0aW9ucyA9IG5vZGUub3B0aW9ucyB8fCB7fTtcbiAgICBub2RlLmd1aWRlID0gbm9kZS5ndWlkZSB8fCB7fTtcbiAgICBub2RlLmd1aWRlLnBhZGRpbmcgPSBfLmRlZmF1bHRzKG5vZGUuZ3VpZGUucGFkZGluZyB8fCB7fSwge2w6IDAsIGI6IDAsIHI6IDAsIHQ6IDB9KTtcblxuICAgIG5vZGUuZ3VpZGUueCA9IGV4dGVuZExhYmVsKG5vZGUuZ3VpZGUsICd4Jyk7XG4gICAgbm9kZS5ndWlkZS54ID0gZXh0ZW5kQXhpcyhub2RlLmd1aWRlLCAneCcsIHtcbiAgICAgICAgY3NzQ2xhc3M6ICd4IGF4aXMnLFxuICAgICAgICBzY2FsZU9yaWVudDogJ2JvdHRvbScsXG4gICAgICAgIHRleHRBbmNob3I6ICdtaWRkbGUnXG4gICAgfSk7XG5cbiAgICBub2RlLmd1aWRlLnkgPSBleHRlbmRMYWJlbChub2RlLmd1aWRlLCAneScsIHtyb3RhdGU6IC05MH0pO1xuICAgIG5vZGUuZ3VpZGUueSA9IGV4dGVuZEF4aXMobm9kZS5ndWlkZSwgJ3knLCB7XG4gICAgICAgIGNzc0NsYXNzOiAneSBheGlzJyxcbiAgICAgICAgc2NhbGVPcmllbnQ6ICdsZWZ0JyxcbiAgICAgICAgdGV4dEFuY2hvcjogJ2VuZCdcbiAgICB9KTtcblxuICAgIG5vZGUuZ3VpZGUuc2l6ZSA9IGV4dGVuZExhYmVsKG5vZGUuZ3VpZGUsICdzaXplJyk7XG4gICAgbm9kZS5ndWlkZS5jb2xvciA9IGV4dGVuZExhYmVsKG5vZGUuZ3VpZGUsICdjb2xvcicpO1xuXG4gICAgcmV0dXJuIG5vZGU7XG59O1xuXG52YXIgaW5oZXJpdFByb3BzID0gKGNoaWxkVW5pdCwgcm9vdCkgPT4ge1xuXG4gICAgY2hpbGRVbml0Lmd1aWRlID0gY2hpbGRVbml0Lmd1aWRlIHx8IHt9O1xuICAgIGNoaWxkVW5pdC5ndWlkZS5wYWRkaW5nID0gY2hpbGRVbml0Lmd1aWRlLnBhZGRpbmcgfHwge2w6IDAsIHQ6IDAsIHI6IDAsIGI6IDB9O1xuXG4gICAgLy8gbGVhZiBlbGVtZW50cyBzaG91bGQgaW5oZXJpdCBjb29yZGluYXRlcyBwcm9wZXJ0aWVzXG4gICAgaWYgKCFjaGlsZFVuaXQuaGFzT3duUHJvcGVydHkoJ3VuaXRzJykpIHtcbiAgICAgICAgY2hpbGRVbml0ID0gXy5kZWZhdWx0cyhjaGlsZFVuaXQsIHJvb3QpO1xuICAgICAgICBjaGlsZFVuaXQuZ3VpZGUgPSBfLmRlZmF1bHRzKGNoaWxkVW5pdC5ndWlkZSwgdXRpbHMuY2xvbmUocm9vdC5ndWlkZSkpO1xuICAgICAgICBjaGlsZFVuaXQuZ3VpZGUueCA9IF8uZGVmYXVsdHMoY2hpbGRVbml0Lmd1aWRlLngsIHV0aWxzLmNsb25lKHJvb3QuZ3VpZGUueCkpO1xuICAgICAgICBjaGlsZFVuaXQuZ3VpZGUueSA9IF8uZGVmYXVsdHMoY2hpbGRVbml0Lmd1aWRlLnksIHV0aWxzLmNsb25lKHJvb3QuZ3VpZGUueSkpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZFVuaXQ7XG59O1xuXG52YXIgY3JlYXRlU2VsZWN0b3JQcmVkaWNhdGVzID0gKHJvb3QpID0+IHtcblxuICAgIHZhciBjaGlsZHJlbiA9IHJvb3QudW5pdHMgfHwgW107XG5cbiAgICB2YXIgaXNMZWFmID0gIXJvb3QuaGFzT3duUHJvcGVydHkoJ3VuaXRzJyk7XG4gICAgdmFyIGlzTGVhZlBhcmVudCA9ICFjaGlsZHJlbi5zb21lKChjKSA9PiBjLmhhc093blByb3BlcnR5KCd1bml0cycpKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHJvb3QudHlwZSxcbiAgICAgICAgaXNMZWFmOiBpc0xlYWYsXG4gICAgICAgIGlzTGVhZlBhcmVudDogIWlzTGVhZiAmJiBpc0xlYWZQYXJlbnRcbiAgICB9O1xufTtcblxudmFyIGdldE1heFRpY2tMYWJlbFNpemUgPSBmdW5jdGlvbiAoZG9tYWluVmFsdWVzLCBmb3JtYXR0ZXIsIGZuQ2FsY1RpY2tMYWJlbFNpemUsIGF4aXNMYWJlbExpbWl0KSB7XG5cbiAgICBpZiAoZG9tYWluVmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge3dpZHRoOiAwLCBoZWlnaHQ6IDB9O1xuICAgIH1cblxuICAgIGlmIChmb3JtYXR0ZXIgPT09IG51bGwpIHtcbiAgICAgICAgdmFyIHNpemUgPSBmbkNhbGNUaWNrTGFiZWxTaXplKCdUYXVDaGFydCBMaWJyYXJ5Jyk7XG4gICAgICAgIHNpemUud2lkdGggPSBheGlzTGFiZWxMaW1pdCAqIDAuNjI1OyAvLyBnb2xkZW4gcmF0aW9cbiAgICAgICAgcmV0dXJuIHNpemU7XG4gICAgfVxuXG4gICAgdmFyIG1heFhUaWNrVGV4dCA9IF8ubWF4KGRvbWFpblZhbHVlcywgKHgpID0+IGZvcm1hdHRlcih4KS50b1N0cmluZygpLmxlbmd0aCk7XG5cbiAgICAvLyBkMyBzb21ldGltZXMgcHJvZHVjZSBmcmFjdGlvbmFsIHRpY2tzIG9uIHdpZGUgc3BhY2VcbiAgICAvLyBzbyB3ZSBpbnRlbnRpb25hbGx5IGFkZCBmcmFjdGlvbmFsIHN1ZmZpeFxuICAgIC8vIHRvIGZvcmVzZWUgc2NhbGUgZGVuc2l0eSBpc3N1ZXNcbiAgICB2YXIgc3VmZml4ID0gXy5pc051bWJlcihtYXhYVGlja1RleHQpID8gJy4wMCcgOiAnJztcblxuICAgIHJldHVybiBmbkNhbGNUaWNrTGFiZWxTaXplKGZvcm1hdHRlcihtYXhYVGlja1RleHQpICsgc3VmZml4KTtcbn07XG5cbnZhciBnZXRUaWNrRm9ybWF0ID0gKGRpbSwgZGVmYXVsdEZvcm1hdHMpID0+IHtcbiAgICB2YXIgZGltVHlwZSA9IGRpbS5kaW1UeXBlO1xuICAgIHZhciBzY2FsZVR5cGUgPSBkaW0uc2NhbGVUeXBlO1xuICAgIHZhciBzcGVjaWZpZXIgPSAnKic7XG5cbiAgICB2YXIga2V5ID0gW2RpbVR5cGUsIHNjYWxlVHlwZSwgc3BlY2lmaWVyXS5qb2luKCc6Jyk7XG4gICAgdmFyIHRhZyA9IFtkaW1UeXBlLCBzY2FsZVR5cGVdLmpvaW4oJzonKTtcbiAgICByZXR1cm4gZGVmYXVsdEZvcm1hdHNba2V5XSB8fCBkZWZhdWx0Rm9ybWF0c1t0YWddIHx8IGRlZmF1bHRGb3JtYXRzW2RpbVR5cGVdIHx8IG51bGw7XG59O1xuXG52YXIgY2FsY1VuaXRHdWlkZSA9IGZ1bmN0aW9uICh1bml0LCBtZXRhLCBzZXR0aW5ncywgYWxsb3dYVmVydGljYWwsIGFsbG93WVZlcnRpY2FsLCBpbmxpbmVMYWJlbHMpIHtcblxuICAgIHZhciBkaW1YID0gbWV0YS5kaW1lbnNpb24odW5pdC54KTtcbiAgICB2YXIgZGltWSA9IG1ldGEuZGltZW5zaW9uKHVuaXQueSk7XG5cbiAgICB2YXIgaXNYQ29udGludWVzID0gKGRpbVguZGltVHlwZSA9PT0gJ21lYXN1cmUnKTtcbiAgICB2YXIgaXNZQ29udGludWVzID0gKGRpbVkuZGltVHlwZSA9PT0gJ21lYXN1cmUnKTtcblxuICAgIHZhciB4RGVuc2l0eVBhZGRpbmcgPSBzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgneERlbnNpdHlQYWRkaW5nOicgKyBkaW1YLmRpbVR5cGUpID9cbiAgICAgICAgc2V0dGluZ3NbJ3hEZW5zaXR5UGFkZGluZzonICsgZGltWC5kaW1UeXBlXSA6XG4gICAgICAgIHNldHRpbmdzLnhEZW5zaXR5UGFkZGluZztcblxuICAgIHZhciB5RGVuc2l0eVBhZGRpbmcgPSBzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgneURlbnNpdHlQYWRkaW5nOicgKyBkaW1ZLmRpbVR5cGUpID9cbiAgICAgICAgc2V0dGluZ3NbJ3lEZW5zaXR5UGFkZGluZzonICsgZGltWS5kaW1UeXBlXSA6XG4gICAgICAgIHNldHRpbmdzLnlEZW5zaXR5UGFkZGluZztcblxuICAgIHZhciB4TWV0YSA9IG1ldGEuc2NhbGVNZXRhKHVuaXQueCwgdW5pdC5ndWlkZS54KTtcbiAgICB2YXIgeFZhbHVlcyA9IHhNZXRhLnZhbHVlcztcbiAgICB2YXIgeU1ldGEgPSBtZXRhLnNjYWxlTWV0YSh1bml0LnksIHVuaXQuZ3VpZGUueSk7XG4gICAgdmFyIHlWYWx1ZXMgPSB5TWV0YS52YWx1ZXM7XG5cbiAgICB1bml0Lmd1aWRlLngudGlja0Zvcm1hdCA9IHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0IHx8IGdldFRpY2tGb3JtYXQoZGltWCwgc2V0dGluZ3MuZGVmYXVsdEZvcm1hdHMpO1xuICAgIHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0ID0gdW5pdC5ndWlkZS55LnRpY2tGb3JtYXQgfHwgZ2V0VGlja0Zvcm1hdChkaW1ZLCBzZXR0aW5ncy5kZWZhdWx0Rm9ybWF0cyk7XG5cbiAgICBpZiAoWydkYXknLCAnd2VlaycsICdtb250aCddLmluZGV4T2YodW5pdC5ndWlkZS54LnRpY2tGb3JtYXQpID49IDApIHtcbiAgICAgICAgdW5pdC5ndWlkZS54LnRpY2tGb3JtYXQgKz0gJy1zaG9ydCc7XG4gICAgfVxuXG4gICAgaWYgKFsnZGF5JywgJ3dlZWsnLCAnbW9udGgnXS5pbmRleE9mKHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0KSA+PSAwKSB7XG4gICAgICAgIHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0ICs9ICctc2hvcnQnO1xuICAgIH1cblxuICAgIHZhciB4SXNFbXB0eUF4aXMgPSAoeFZhbHVlcy5sZW5ndGggPT09IDApO1xuICAgIHZhciB5SXNFbXB0eUF4aXMgPSAoeVZhbHVlcy5sZW5ndGggPT09IDApO1xuXG4gICAgdmFyIG1heFhUaWNrU2l6ZSA9IGdldE1heFRpY2tMYWJlbFNpemUoXG4gICAgICAgIHhWYWx1ZXMsXG4gICAgICAgIEZvcm1hdHRlclJlZ2lzdHJ5LmdldCh1bml0Lmd1aWRlLngudGlja0Zvcm1hdCwgdW5pdC5ndWlkZS54LnRpY2tGb3JtYXROdWxsQWxpYXMpLFxuICAgICAgICBzZXR0aW5ncy5nZXRBeGlzVGlja0xhYmVsU2l6ZSxcbiAgICAgICAgc2V0dGluZ3MueEF4aXNUaWNrTGFiZWxMaW1pdCk7XG5cbiAgICB2YXIgbWF4WVRpY2tTaXplID0gZ2V0TWF4VGlja0xhYmVsU2l6ZShcbiAgICAgICAgeVZhbHVlcyxcbiAgICAgICAgRm9ybWF0dGVyUmVnaXN0cnkuZ2V0KHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0LCB1bml0Lmd1aWRlLnkudGlja0Zvcm1hdE51bGxBbGlhcyksXG4gICAgICAgIHNldHRpbmdzLmdldEF4aXNUaWNrTGFiZWxTaXplLFxuICAgICAgICBzZXR0aW5ncy55QXhpc1RpY2tMYWJlbExpbWl0KTtcblxuICAgIHZhciB4QXhpc1BhZGRpbmcgPSBzZXR0aW5ncy54QXhpc1BhZGRpbmc7XG4gICAgdmFyIHlBeGlzUGFkZGluZyA9IHNldHRpbmdzLnlBeGlzUGFkZGluZztcblxuICAgIHZhciBpc1hWZXJ0aWNhbCA9IGFsbG93WFZlcnRpY2FsID8gIWlzWENvbnRpbnVlcyA6IGZhbHNlO1xuICAgIHZhciBpc1lWZXJ0aWNhbCA9IGFsbG93WVZlcnRpY2FsID8gIWlzWUNvbnRpbnVlcyA6IGZhbHNlO1xuXG4gICAgdW5pdC5ndWlkZS54LnBhZGRpbmcgPSB4SXNFbXB0eUF4aXMgPyAwIDogeEF4aXNQYWRkaW5nO1xuICAgIHVuaXQuZ3VpZGUueS5wYWRkaW5nID0geUlzRW1wdHlBeGlzID8gMCA6IHlBeGlzUGFkZGluZztcblxuICAgIHVuaXQuZ3VpZGUueC5yb3RhdGUgPSBpc1hWZXJ0aWNhbCA/IDkwIDogMDtcbiAgICB1bml0Lmd1aWRlLngudGV4dEFuY2hvciA9IGlzWFZlcnRpY2FsID8gJ3N0YXJ0JyA6IHVuaXQuZ3VpZGUueC50ZXh0QW5jaG9yO1xuXG4gICAgdW5pdC5ndWlkZS55LnJvdGF0ZSA9IGlzWVZlcnRpY2FsID8gLTkwIDogMDtcbiAgICB1bml0Lmd1aWRlLnkudGV4dEFuY2hvciA9IGlzWVZlcnRpY2FsID8gJ21pZGRsZScgOiB1bml0Lmd1aWRlLnkudGV4dEFuY2hvcjtcblxuICAgIHZhciB4VGlja1dpZHRoID0geElzRW1wdHlBeGlzID8gMCA6IHNldHRpbmdzLnhUaWNrV2lkdGg7XG4gICAgdmFyIHlUaWNrV2lkdGggPSB5SXNFbXB0eUF4aXMgPyAwIDogc2V0dGluZ3MueVRpY2tXaWR0aDtcblxuICAgIHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0V29yZFdyYXBMaW1pdCA9IHNldHRpbmdzLnhBeGlzVGlja0xhYmVsTGltaXQ7XG4gICAgdW5pdC5ndWlkZS55LnRpY2tGb3JtYXRXb3JkV3JhcExpbWl0ID0gc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdDtcblxuICAgIHZhciB4VGlja0JveCA9IGlzWFZlcnRpY2FsID9cbiAgICB7dzogbWF4WFRpY2tTaXplLmhlaWdodCwgaDogbWF4WFRpY2tTaXplLndpZHRofSA6XG4gICAge2g6IG1heFhUaWNrU2l6ZS5oZWlnaHQsIHc6IG1heFhUaWNrU2l6ZS53aWR0aH07XG5cbiAgICBpZiAobWF4WFRpY2tTaXplLndpZHRoID4gc2V0dGluZ3MueEF4aXNUaWNrTGFiZWxMaW1pdCkge1xuXG4gICAgICAgIHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0V29yZFdyYXAgPSB0cnVlO1xuICAgICAgICB1bml0Lmd1aWRlLngudGlja0Zvcm1hdFdvcmRXcmFwTGluZXMgPSBzZXR0aW5ncy54VGlja1dvcmRXcmFwTGluZXNMaW1pdDtcblxuICAgICAgICBsZXQgZ3Vlc3NMaW5lc0NvdW50ID0gTWF0aC5jZWlsKG1heFhUaWNrU2l6ZS53aWR0aCAvIHNldHRpbmdzLnhBeGlzVGlja0xhYmVsTGltaXQpO1xuICAgICAgICBsZXQga29lZmZMaW5lc0NvdW50ID0gTWF0aC5taW4oZ3Vlc3NMaW5lc0NvdW50LCBzZXR0aW5ncy54VGlja1dvcmRXcmFwTGluZXNMaW1pdCk7XG4gICAgICAgIGxldCB0ZXh0TGluZXNIZWlnaHQgPSBrb2VmZkxpbmVzQ291bnQgKiBtYXhYVGlja1NpemUuaGVpZ2h0O1xuXG4gICAgICAgIGlmIChpc1hWZXJ0aWNhbCkge1xuICAgICAgICAgICAgeFRpY2tCb3guaCA9IHNldHRpbmdzLnhBeGlzVGlja0xhYmVsTGltaXQ7XG4gICAgICAgICAgICB4VGlja0JveC53ID0gdGV4dExpbmVzSGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeFRpY2tCb3guaCA9IHRleHRMaW5lc0hlaWdodDtcbiAgICAgICAgICAgIHhUaWNrQm94LncgPSBzZXR0aW5ncy54QXhpc1RpY2tMYWJlbExpbWl0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHlUaWNrQm94ID0gaXNZVmVydGljYWwgP1xuICAgIHt3OiBtYXhZVGlja1NpemUuaGVpZ2h0LCBoOiBtYXhZVGlja1NpemUud2lkdGh9IDpcbiAgICB7aDogbWF4WVRpY2tTaXplLmhlaWdodCwgdzogbWF4WVRpY2tTaXplLndpZHRofTtcblxuICAgIGlmIChtYXhZVGlja1NpemUud2lkdGggPiBzZXR0aW5ncy55QXhpc1RpY2tMYWJlbExpbWl0KSB7XG5cbiAgICAgICAgdW5pdC5ndWlkZS55LnRpY2tGb3JtYXRXb3JkV3JhcCA9IHRydWU7XG4gICAgICAgIHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0V29yZFdyYXBMaW5lcyA9IHNldHRpbmdzLnlUaWNrV29yZFdyYXBMaW5lc0xpbWl0O1xuXG4gICAgICAgIGxldCBndWVzc0xpbmVzQ291bnQgPSBNYXRoLmNlaWwobWF4WVRpY2tTaXplLndpZHRoIC8gc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdCk7XG4gICAgICAgIGxldCBrb2VmZkxpbmVzQ291bnQgPSBNYXRoLm1pbihndWVzc0xpbmVzQ291bnQsIHNldHRpbmdzLnlUaWNrV29yZFdyYXBMaW5lc0xpbWl0KTtcbiAgICAgICAgbGV0IHRleHRMaW5lc0hlaWdodCA9IGtvZWZmTGluZXNDb3VudCAqIG1heFlUaWNrU2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKGlzWVZlcnRpY2FsKSB7XG4gICAgICAgICAgICB5VGlja0JveC53ID0gdGV4dExpbmVzSGVpZ2h0O1xuICAgICAgICAgICAgeVRpY2tCb3guaCA9IHNldHRpbmdzLnlBeGlzVGlja0xhYmVsTGltaXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB5VGlja0JveC53ID0gc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdDtcbiAgICAgICAgICAgIHlUaWNrQm94LmggPSB0ZXh0TGluZXNIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgeEZvbnRIID0geFRpY2tXaWR0aCArIHhUaWNrQm94Lmg7XG4gICAgdmFyIHlGb250VyA9IHlUaWNrV2lkdGggKyB5VGlja0JveC53O1xuXG4gICAgdmFyIHhGb250TGFiZWxIZWlnaHQgPSBzZXR0aW5ncy54Rm9udExhYmVsSGVpZ2h0O1xuICAgIHZhciB5Rm9udExhYmVsSGVpZ2h0ID0gc2V0dGluZ3MueUZvbnRMYWJlbEhlaWdodDtcblxuICAgIHZhciBkaXN0VG9YQXhpc0xhYmVsID0gc2V0dGluZ3MuZGlzdFRvWEF4aXNMYWJlbDtcbiAgICB2YXIgZGlzdFRvWUF4aXNMYWJlbCA9IHNldHRpbmdzLmRpc3RUb1lBeGlzTGFiZWw7XG5cbiAgICB1bml0Lmd1aWRlLnguZGVuc2l0eSA9IHhUaWNrQm94LncgKyB4RGVuc2l0eVBhZGRpbmcgKiAyO1xuICAgIHVuaXQuZ3VpZGUueS5kZW5zaXR5ID0geVRpY2tCb3guaCArIHlEZW5zaXR5UGFkZGluZyAqIDI7XG5cbiAgICBpZiAoIWlubGluZUxhYmVscykge1xuICAgICAgICB1bml0Lmd1aWRlLngubGFiZWwucGFkZGluZyA9IHhGb250TGFiZWxIZWlnaHQgKyAoKHVuaXQuZ3VpZGUueC5sYWJlbC50ZXh0KSA/ICh4Rm9udEggKyBkaXN0VG9YQXhpc0xhYmVsKSA6IDApO1xuICAgICAgICB1bml0Lmd1aWRlLnkubGFiZWwucGFkZGluZyA9IC14Rm9udExhYmVsSGVpZ2h0ICsgKCh1bml0Lmd1aWRlLnkubGFiZWwudGV4dCkgPyAoeUZvbnRXICsgZGlzdFRvWUF4aXNMYWJlbCkgOiAwKTtcblxuICAgICAgICBsZXQgeExhYmVsUGFkZGluZyA9ICh1bml0Lmd1aWRlLngubGFiZWwudGV4dCkgPyAodW5pdC5ndWlkZS54LmxhYmVsLnBhZGRpbmcgKyB4Rm9udExhYmVsSGVpZ2h0KSA6ICh4Rm9udEgpO1xuICAgICAgICBsZXQgeUxhYmVsUGFkZGluZyA9ICh1bml0Lmd1aWRlLnkubGFiZWwudGV4dCkgPyAodW5pdC5ndWlkZS55LmxhYmVsLnBhZGRpbmcgKyB5Rm9udExhYmVsSGVpZ2h0KSA6ICh5Rm9udFcpO1xuXG4gICAgICAgIHVuaXQuZ3VpZGUucGFkZGluZy5iID0geEF4aXNQYWRkaW5nICsgeExhYmVsUGFkZGluZyAtIHhUaWNrV2lkdGg7XG4gICAgICAgIHVuaXQuZ3VpZGUucGFkZGluZy5sID0geUF4aXNQYWRkaW5nICsgeUxhYmVsUGFkZGluZztcblxuICAgICAgICB1bml0Lmd1aWRlLnBhZGRpbmcuYiA9ICh1bml0Lmd1aWRlLnguaGlkZSkgPyAwIDogdW5pdC5ndWlkZS5wYWRkaW5nLmI7XG4gICAgICAgIHVuaXQuZ3VpZGUucGFkZGluZy5sID0gKHVuaXQuZ3VpZGUueS5oaWRlKSA/IDAgOiB1bml0Lmd1aWRlLnBhZGRpbmcubDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcGQgPSAoeEF4aXNQYWRkaW5nIC0geEZvbnRMYWJlbEhlaWdodCkgLyAyO1xuICAgICAgICB1bml0Lmd1aWRlLngubGFiZWwucGFkZGluZyA9IDAgKyB4Rm9udExhYmVsSGVpZ2h0IC0gZGlzdFRvWEF4aXNMYWJlbCArIHBkO1xuICAgICAgICB1bml0Lmd1aWRlLnkubGFiZWwucGFkZGluZyA9IDAgLSBkaXN0VG9ZQXhpc0xhYmVsICsgcGQ7XG5cbiAgICAgICAgdW5pdC5ndWlkZS54LmxhYmVsLmNzc0NsYXNzICs9ICcgaW5saW5lJztcbiAgICAgICAgdW5pdC5ndWlkZS54LmxhYmVsLmRvY2sgPSAncmlnaHQnO1xuICAgICAgICB1bml0Lmd1aWRlLngubGFiZWwudGV4dEFuY2hvciA9ICdlbmQnO1xuXG4gICAgICAgIHVuaXQuZ3VpZGUueS5sYWJlbC5jc3NDbGFzcyArPSAnIGlubGluZSc7XG4gICAgICAgIHVuaXQuZ3VpZGUueS5sYWJlbC5kb2NrID0gJ3JpZ2h0JztcbiAgICAgICAgdW5pdC5ndWlkZS55LmxhYmVsLnRleHRBbmNob3IgPSAnZW5kJztcblxuICAgICAgICB1bml0Lmd1aWRlLnBhZGRpbmcuYiA9IHhBeGlzUGFkZGluZyArIHhGb250SDtcbiAgICAgICAgdW5pdC5ndWlkZS5wYWRkaW5nLmwgPSB5QXhpc1BhZGRpbmcgKyB5Rm9udFc7XG5cbiAgICAgICAgdW5pdC5ndWlkZS5wYWRkaW5nLmIgPSAodW5pdC5ndWlkZS54LmhpZGUpID8gMCA6IHVuaXQuZ3VpZGUucGFkZGluZy5iO1xuICAgICAgICB1bml0Lmd1aWRlLnBhZGRpbmcubCA9ICh1bml0Lmd1aWRlLnkuaGlkZSkgPyAwIDogdW5pdC5ndWlkZS5wYWRkaW5nLmw7XG4gICAgfVxuXG4gICAgdW5pdC5ndWlkZS54LnRpY2tGb250SGVpZ2h0ID0gbWF4WFRpY2tTaXplLmhlaWdodDtcbiAgICB1bml0Lmd1aWRlLnkudGlja0ZvbnRIZWlnaHQgPSBtYXhZVGlja1NpemUuaGVpZ2h0O1xuXG4gICAgdW5pdC5ndWlkZS54LiRtaW5pbWFsRG9tYWluID0geFZhbHVlcy5sZW5ndGg7XG4gICAgdW5pdC5ndWlkZS55LiRtaW5pbWFsRG9tYWluID0geVZhbHVlcy5sZW5ndGg7XG5cbiAgICB1bml0Lmd1aWRlLnguJG1heFRpY2tUZXh0VyA9IG1heFhUaWNrU2l6ZS53aWR0aDtcbiAgICB1bml0Lmd1aWRlLnguJG1heFRpY2tUZXh0SCA9IG1heFhUaWNrU2l6ZS5oZWlnaHQ7XG5cbiAgICB1bml0Lmd1aWRlLnkuJG1heFRpY2tUZXh0VyA9IG1heFlUaWNrU2l6ZS53aWR0aDtcbiAgICB1bml0Lmd1aWRlLnkuJG1heFRpY2tUZXh0SCA9IG1heFlUaWNrU2l6ZS5oZWlnaHQ7XG5cbiAgICByZXR1cm4gdW5pdDtcbn07XG5cbnZhciBTcGVjRW5naW5lVHlwZU1hcCA9IHtcblxuICAgIE5PTkU6IChzcmNTcGVjLCBtZXRhLCBzZXR0aW5ncykgPT4ge1xuXG4gICAgICAgIHZhciBzcGVjID0gdXRpbHMuY2xvbmUoc3JjU3BlYyk7XG4gICAgICAgIGZuVHJhdmVyc2VTcGVjKFxuICAgICAgICAgICAgdXRpbHMuY2xvbmUoc3BlYy51bml0KSxcbiAgICAgICAgICAgIHNwZWMudW5pdCxcbiAgICAgICAgICAgIChzZWxlY3RvclByZWRpY2F0ZXMsIHVuaXQpID0+IHtcbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngudGlja0ZvbnRIZWlnaHQgPSBzZXR0aW5ncy5nZXRBeGlzVGlja0xhYmVsU2l6ZSgnWCcpLmhlaWdodDtcbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnkudGlja0ZvbnRIZWlnaHQgPSBzZXR0aW5ncy5nZXRBeGlzVGlja0xhYmVsU2l6ZSgnWScpLmhlaWdodDtcblxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0V29yZFdyYXBMaW1pdCA9IHNldHRpbmdzLnhBeGlzVGlja0xhYmVsTGltaXQ7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LnRpY2tGb3JtYXRXb3JkV3JhcExpbWl0ID0gc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdDtcblxuICAgICAgICAgICAgICAgIHJldHVybiB1bml0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzcGVjO1xuICAgIH0sXG5cbiAgICAnQlVJTEQtTEFCRUxTJzogKHNyY1NwZWMsIG1ldGEsIHNldHRpbmdzKSA9PiB7XG5cbiAgICAgICAgdmFyIHNwZWMgPSB1dGlscy5jbG9uZShzcmNTcGVjKTtcblxuICAgICAgICB2YXIgeExhYmVscyA9IFtdO1xuICAgICAgICB2YXIgeUxhYmVscyA9IFtdO1xuICAgICAgICB2YXIgeFVuaXQgPSBudWxsO1xuICAgICAgICB2YXIgeVVuaXQgPSBudWxsO1xuXG4gICAgICAgIHV0aWxzLnRyYXZlcnNlSlNPTihcbiAgICAgICAgICAgIHNwZWMudW5pdCxcbiAgICAgICAgICAgICd1bml0cycsXG4gICAgICAgICAgICBjcmVhdGVTZWxlY3RvclByZWRpY2F0ZXMsXG4gICAgICAgICAgICAoc2VsZWN0b3JzLCB1bml0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3JzLmlzTGVhZikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5pdDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXhVbml0ICYmIHVuaXQueCkge1xuICAgICAgICAgICAgICAgICAgICB4VW5pdCA9IHVuaXQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF5VW5pdCAmJiB1bml0LnkpIHtcbiAgICAgICAgICAgICAgICAgICAgeVVuaXQgPSB1bml0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUgPSB1bml0Lmd1aWRlIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54ID0gdW5pdC5ndWlkZS54IHx8IHtsYWJlbDogJyd9O1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueSA9IHVuaXQuZ3VpZGUueSB8fCB7bGFiZWw6ICcnfTtcblxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC5sYWJlbCA9IF8uaXNPYmplY3QodW5pdC5ndWlkZS54LmxhYmVsKSA/IHVuaXQuZ3VpZGUueC5sYWJlbCA6IHt0ZXh0OiB1bml0Lmd1aWRlLngubGFiZWx9O1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS5sYWJlbCA9IF8uaXNPYmplY3QodW5pdC5ndWlkZS55LmxhYmVsKSA/IHVuaXQuZ3VpZGUueS5sYWJlbCA6IHt0ZXh0OiB1bml0Lmd1aWRlLnkubGFiZWx9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHVuaXQueCkge1xuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngubGFiZWwudGV4dCA9IHVuaXQuZ3VpZGUueC5sYWJlbC50ZXh0IHx8IG1ldGEuZGltZW5zaW9uKHVuaXQueCkuZGltTmFtZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodW5pdC55KSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS5sYWJlbC50ZXh0ID0gdW5pdC5ndWlkZS55LmxhYmVsLnRleHQgfHwgbWV0YS5kaW1lbnNpb24odW5pdC55KS5kaW1OYW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciB4ID0gdW5pdC5ndWlkZS54LmxhYmVsLnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgeExhYmVscy5wdXNoKHgpO1xuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngudGlja0Zvcm1hdE51bGxBbGlhcyA9IHVuaXQuZ3VpZGUueC5oYXNPd25Qcm9wZXJ0eSgndGlja0Zvcm1hdE51bGxBbGlhcycpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0TnVsbEFsaWFzIDpcbiAgICAgICAgICAgICAgICAgICAgJ05vICcgKyB4O1xuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngubGFiZWwudGV4dCA9ICcnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciB5ID0gdW5pdC5ndWlkZS55LmxhYmVsLnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHkpIHtcbiAgICAgICAgICAgICAgICAgICAgeUxhYmVscy5wdXNoKHkpO1xuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnkudGlja0Zvcm1hdE51bGxBbGlhcyA9IHVuaXQuZ3VpZGUueS5oYXNPd25Qcm9wZXJ0eSgndGlja0Zvcm1hdE51bGxBbGlhcycpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0TnVsbEFsaWFzIDpcbiAgICAgICAgICAgICAgICAgICAgJ05vICcgKyB5O1xuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnkubGFiZWwudGV4dCA9ICcnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB1bml0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHhVbml0KSB7XG4gICAgICAgICAgICB4VW5pdC5ndWlkZS54LmxhYmVsLnRleHQgPSB4TGFiZWxzLmpvaW4oJyA+ICcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHlVbml0KSB7XG4gICAgICAgICAgICB5VW5pdC5ndWlkZS55LmxhYmVsLnRleHQgPSB5TGFiZWxzLmpvaW4oJyA+ICcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgfSxcblxuICAgICdCVUlMRC1HVUlERSc6IChzcmNTcGVjLCBtZXRhLCBzZXR0aW5ncykgPT4ge1xuXG4gICAgICAgIHZhciBzcGVjID0gdXRpbHMuY2xvbmUoc3JjU3BlYyk7XG4gICAgICAgIGZuVHJhdmVyc2VTcGVjKFxuICAgICAgICAgICAgdXRpbHMuY2xvbmUoc3BlYy51bml0KSxcbiAgICAgICAgICAgIHNwZWMudW5pdCxcbiAgICAgICAgICAgIChzZWxlY3RvclByZWRpY2F0ZXMsIHVuaXQpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RvclByZWRpY2F0ZXMuaXNMZWFmKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bml0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghdW5pdC5ndWlkZS5oYXNPd25Qcm9wZXJ0eSgnc2hvd0dyaWRMaW5lcycpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUuc2hvd0dyaWRMaW5lcyA9IHNlbGVjdG9yUHJlZGljYXRlcy5pc0xlYWZQYXJlbnQgPyAneHknIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGlzRmFjZXRVbml0ID0gKCFzZWxlY3RvclByZWRpY2F0ZXMuaXNMZWFmICYmICFzZWxlY3RvclByZWRpY2F0ZXMuaXNMZWFmUGFyZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGYWNldFVuaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdW5pdCBpcyBhIGZhY2V0IVxuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnguY3NzQ2xhc3MgKz0gJyBmYWNldC1heGlzJztcbiAgICAgICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54LmF2b2lkQ29sbGlzaW9ucyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS5jc3NDbGFzcyArPSAnIGZhY2V0LWF4aXMnO1xuICAgICAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnkuYXZvaWRDb2xsaXNpb25zID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGRpbVggPSBtZXRhLmRpbWVuc2lvbih1bml0LngpO1xuICAgICAgICAgICAgICAgIHZhciBkaW1ZID0gbWV0YS5kaW1lbnNpb24odW5pdC55KTtcblxuICAgICAgICAgICAgICAgIHZhciBpc1hDb250aW51ZXMgPSAoZGltWC5kaW1UeXBlID09PSAnbWVhc3VyZScpO1xuICAgICAgICAgICAgICAgIHZhciBpc1lDb250aW51ZXMgPSAoZGltWS5kaW1UeXBlID09PSAnbWVhc3VyZScpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHhEZW5zaXR5UGFkZGluZyA9IHNldHRpbmdzLmhhc093blByb3BlcnR5KCd4RGVuc2l0eVBhZGRpbmc6JyArIGRpbVguZGltVHlwZSkgP1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc1sneERlbnNpdHlQYWRkaW5nOicgKyBkaW1YLmRpbVR5cGVdIDpcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MueERlbnNpdHlQYWRkaW5nO1xuXG4gICAgICAgICAgICAgICAgdmFyIHlEZW5zaXR5UGFkZGluZyA9IHNldHRpbmdzLmhhc093blByb3BlcnR5KCd5RGVuc2l0eVBhZGRpbmc6JyArIGRpbVkuZGltVHlwZSkgP1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc1sneURlbnNpdHlQYWRkaW5nOicgKyBkaW1ZLmRpbVR5cGVdIDpcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MueURlbnNpdHlQYWRkaW5nO1xuXG4gICAgICAgICAgICAgICAgdmFyIHhNZXRhID0gbWV0YS5zY2FsZU1ldGEodW5pdC54LCB1bml0Lmd1aWRlLngpO1xuICAgICAgICAgICAgICAgIHZhciB4VmFsdWVzID0geE1ldGEudmFsdWVzO1xuICAgICAgICAgICAgICAgIHZhciB5TWV0YSA9IG1ldGEuc2NhbGVNZXRhKHVuaXQueSwgdW5pdC5ndWlkZS55KTtcbiAgICAgICAgICAgICAgICB2YXIgeVZhbHVlcyA9IHlNZXRhLnZhbHVlcztcblxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0ID0gdW5pdC5ndWlkZS54LnRpY2tGb3JtYXQgfHwgZ2V0VGlja0Zvcm1hdChkaW1YLCBzZXR0aW5ncy5kZWZhdWx0Rm9ybWF0cyk7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LnRpY2tGb3JtYXQgPSB1bml0Lmd1aWRlLnkudGlja0Zvcm1hdCB8fCBnZXRUaWNrRm9ybWF0KGRpbVksIHNldHRpbmdzLmRlZmF1bHRGb3JtYXRzKTtcblxuICAgICAgICAgICAgICAgIHZhciB4SXNFbXB0eUF4aXMgPSAoeFZhbHVlcy5sZW5ndGggPT09IDApO1xuICAgICAgICAgICAgICAgIHZhciB5SXNFbXB0eUF4aXMgPSAoeVZhbHVlcy5sZW5ndGggPT09IDApO1xuXG4gICAgICAgICAgICAgICAgdmFyIG1heFhUaWNrU2l6ZSA9IGdldE1heFRpY2tMYWJlbFNpemUoXG4gICAgICAgICAgICAgICAgICAgIHhWYWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgIEZvcm1hdHRlclJlZ2lzdHJ5LmdldCh1bml0Lmd1aWRlLngudGlja0Zvcm1hdCwgdW5pdC5ndWlkZS54LnRpY2tGb3JtYXROdWxsQWxpYXMpLFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5nZXRBeGlzVGlja0xhYmVsU2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MueEF4aXNUaWNrTGFiZWxMaW1pdCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF4WVRpY2tTaXplID0gZ2V0TWF4VGlja0xhYmVsU2l6ZShcbiAgICAgICAgICAgICAgICAgICAgeVZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgRm9ybWF0dGVyUmVnaXN0cnkuZ2V0KHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0LCB1bml0Lmd1aWRlLnkudGlja0Zvcm1hdE51bGxBbGlhcyksXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmdldEF4aXNUaWNrTGFiZWxTaXplLFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy55QXhpc1RpY2tMYWJlbExpbWl0KTtcblxuICAgICAgICAgICAgICAgIHZhciB4QXhpc1BhZGRpbmcgPSBzZWxlY3RvclByZWRpY2F0ZXMuaXNMZWFmUGFyZW50ID8gc2V0dGluZ3MueEF4aXNQYWRkaW5nIDogMDtcbiAgICAgICAgICAgICAgICB2YXIgeUF4aXNQYWRkaW5nID0gc2VsZWN0b3JQcmVkaWNhdGVzLmlzTGVhZlBhcmVudCA/IHNldHRpbmdzLnlBeGlzUGFkZGluZyA6IDA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXNYVmVydGljYWwgPSAhaXNGYWNldFVuaXQgJiYgKEJvb2xlYW4oZGltWC5kaW1UeXBlKSAmJiBkaW1YLmRpbVR5cGUgIT09ICdtZWFzdXJlJyk7XG5cbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngucGFkZGluZyA9IHhJc0VtcHR5QXhpcyA/IDAgOiB4QXhpc1BhZGRpbmc7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LnBhZGRpbmcgPSB5SXNFbXB0eUF4aXMgPyAwIDogeUF4aXNQYWRkaW5nO1xuXG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54LnJvdGF0ZSA9IGlzWFZlcnRpY2FsID8gOTAgOiAwO1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC50ZXh0QW5jaG9yID0gaXNYVmVydGljYWwgPyAnc3RhcnQnIDogdW5pdC5ndWlkZS54LnRleHRBbmNob3I7XG5cbiAgICAgICAgICAgICAgICB2YXIgeFRpY2tXaWR0aCA9IHhJc0VtcHR5QXhpcyA/IDAgOiBzZXR0aW5ncy54VGlja1dpZHRoO1xuICAgICAgICAgICAgICAgIHZhciB5VGlja1dpZHRoID0geUlzRW1wdHlBeGlzID8gMCA6IHNldHRpbmdzLnlUaWNrV2lkdGg7XG5cbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngudGlja0Zvcm1hdFdvcmRXcmFwTGltaXQgPSBzZXR0aW5ncy54QXhpc1RpY2tMYWJlbExpbWl0O1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0V29yZFdyYXBMaW1pdCA9IHNldHRpbmdzLnlBeGlzVGlja0xhYmVsTGltaXQ7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF4WFRpY2tIID0gaXNYVmVydGljYWwgPyBtYXhYVGlja1NpemUud2lkdGggOiBtYXhYVGlja1NpemUuaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc1hDb250aW51ZXMgJiYgKG1heFhUaWNrSCA+IHNldHRpbmdzLnhBeGlzVGlja0xhYmVsTGltaXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heFhUaWNrSCA9IHNldHRpbmdzLnhBeGlzVGlja0xhYmVsTGltaXQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFpc1hWZXJ0aWNhbCAmJiAobWF4WFRpY2tTaXplLndpZHRoID4gc2V0dGluZ3MueEF4aXNUaWNrTGFiZWxMaW1pdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54LnRpY2tGb3JtYXRXb3JkV3JhcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC50aWNrRm9ybWF0V29yZFdyYXBMaW5lcyA9IHNldHRpbmdzLnhUaWNrV29yZFdyYXBMaW5lc0xpbWl0O1xuICAgICAgICAgICAgICAgICAgICBtYXhYVGlja0ggPSBzZXR0aW5ncy54VGlja1dvcmRXcmFwTGluZXNMaW1pdCAqIG1heFhUaWNrU2l6ZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG1heFlUaWNrVyA9IG1heFlUaWNrU2l6ZS53aWR0aDtcbiAgICAgICAgICAgICAgICBpZiAoIWlzWUNvbnRpbnVlcyAmJiAobWF4WVRpY2tXID4gc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4WVRpY2tXID0gc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdDtcbiAgICAgICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LnRpY2tGb3JtYXRXb3JkV3JhcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS50aWNrRm9ybWF0V29yZFdyYXBMaW5lcyA9IHNldHRpbmdzLnlUaWNrV29yZFdyYXBMaW5lc0xpbWl0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciB4Rm9udEggPSB4VGlja1dpZHRoICsgbWF4WFRpY2tIO1xuICAgICAgICAgICAgICAgIHZhciB5Rm9udFcgPSB5VGlja1dpZHRoICsgbWF4WVRpY2tXO1xuXG4gICAgICAgICAgICAgICAgdmFyIHhGb250TGFiZWxIZWlnaHQgPSBzZXR0aW5ncy54Rm9udExhYmVsSGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciB5Rm9udExhYmVsSGVpZ2h0ID0gc2V0dGluZ3MueUZvbnRMYWJlbEhlaWdodDtcblxuICAgICAgICAgICAgICAgIHZhciBkaXN0VG9YQXhpc0xhYmVsID0gc2V0dGluZ3MuZGlzdFRvWEF4aXNMYWJlbDtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdFRvWUF4aXNMYWJlbCA9IHNldHRpbmdzLmRpc3RUb1lBeGlzTGFiZWw7XG5cbiAgICAgICAgICAgICAgICB2YXIgeFRpY2tMYWJlbFcgPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MueEF4aXNUaWNrTGFiZWxMaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgKGlzWFZlcnRpY2FsID8gbWF4WFRpY2tTaXplLmhlaWdodCA6IG1heFhUaWNrU2l6ZS53aWR0aClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC5kZW5zaXR5ID0geFRpY2tMYWJlbFcgKyB4RGVuc2l0eVBhZGRpbmcgKiAyO1xuXG4gICAgICAgICAgICAgICAgdmFyIGd1ZXNzTGluZXNDb3VudCA9IE1hdGguY2VpbChtYXhZVGlja1NpemUud2lkdGggLyBzZXR0aW5ncy55QXhpc1RpY2tMYWJlbExpbWl0KTtcbiAgICAgICAgICAgICAgICB2YXIga29lZmZMaW5lc0NvdW50ID0gTWF0aC5taW4oZ3Vlc3NMaW5lc0NvdW50LCBzZXR0aW5ncy55VGlja1dvcmRXcmFwTGluZXNMaW1pdCk7XG4gICAgICAgICAgICAgICAgdmFyIHlUaWNrTGFiZWxIID0gTWF0aC5taW4oc2V0dGluZ3MueUF4aXNUaWNrTGFiZWxMaW1pdCwga29lZmZMaW5lc0NvdW50ICogbWF4WVRpY2tTaXplLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LmRlbnNpdHkgPSB5VGlja0xhYmVsSCArIHlEZW5zaXR5UGFkZGluZyAqIDI7XG5cbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLngubGFiZWwucGFkZGluZyA9ICh1bml0Lmd1aWRlLngubGFiZWwudGV4dCkgPyAoeEZvbnRIICsgZGlzdFRvWEF4aXNMYWJlbCkgOiAwO1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS5sYWJlbC5wYWRkaW5nID0gKHVuaXQuZ3VpZGUueS5sYWJlbC50ZXh0KSA/ICh5Rm9udFcgKyBkaXN0VG9ZQXhpc0xhYmVsKSA6IDA7XG5cbiAgICAgICAgICAgICAgICB2YXIgeExhYmVsUGFkZGluZyA9ICh1bml0Lmd1aWRlLngubGFiZWwudGV4dCkgP1xuICAgICAgICAgICAgICAgICAgICAodW5pdC5ndWlkZS54LmxhYmVsLnBhZGRpbmcgKyB4Rm9udExhYmVsSGVpZ2h0KSA6XG4gICAgICAgICAgICAgICAgICAgICh4Rm9udEgpO1xuICAgICAgICAgICAgICAgIHZhciB5TGFiZWxQYWRkaW5nID0gKHVuaXQuZ3VpZGUueS5sYWJlbC50ZXh0KSA/XG4gICAgICAgICAgICAgICAgICAgICh1bml0Lmd1aWRlLnkubGFiZWwucGFkZGluZyArIHlGb250TGFiZWxIZWlnaHQpIDpcbiAgICAgICAgICAgICAgICAgICAgKHlGb250Vyk7XG5cbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnBhZGRpbmcuYiA9IHhBeGlzUGFkZGluZyArIHhMYWJlbFBhZGRpbmc7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS5wYWRkaW5nLmwgPSB5QXhpc1BhZGRpbmcgKyB5TGFiZWxQYWRkaW5nO1xuXG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS5wYWRkaW5nLmIgPSAodW5pdC5ndWlkZS54LmhpZGUpID8gMCA6IHVuaXQuZ3VpZGUucGFkZGluZy5iO1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUucGFkZGluZy5sID0gKHVuaXQuZ3VpZGUueS5oaWRlKSA/IDAgOiB1bml0Lmd1aWRlLnBhZGRpbmcubDtcblxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC50aWNrRm9udEhlaWdodCA9IG1heFhUaWNrU2l6ZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LnRpY2tGb250SGVpZ2h0ID0gbWF4WVRpY2tTaXplLmhlaWdodDtcblxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC4kbWluaW1hbERvbWFpbiA9IHhWYWx1ZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueS4kbWluaW1hbERvbWFpbiA9IHlWYWx1ZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54LiRtYXhUaWNrVGV4dFcgPSBtYXhYVGlja1NpemUud2lkdGg7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54LiRtYXhUaWNrVGV4dEggPSBtYXhYVGlja1NpemUuaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LiRtYXhUaWNrVGV4dFcgPSBtYXhZVGlja1NpemUud2lkdGg7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LiRtYXhUaWNrVGV4dEggPSBtYXhZVGlja1NpemUuaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuaXQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgfSxcblxuICAgICdCVUlMRC1DT01QQUNUJzogKHNyY1NwZWMsIG1ldGEsIHNldHRpbmdzKSA9PiB7XG5cbiAgICAgICAgdmFyIHNwZWMgPSB1dGlscy5jbG9uZShzcmNTcGVjKTtcbiAgICAgICAgZm5UcmF2ZXJzZVNwZWMoXG4gICAgICAgICAgICB1dGlscy5jbG9uZShzcGVjLnVuaXQpLFxuICAgICAgICAgICAgc3BlYy51bml0LFxuICAgICAgICAgICAgKHNlbGVjdG9yUHJlZGljYXRlcywgdW5pdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdG9yUHJlZGljYXRlcy5pc0xlYWYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuaXQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF1bml0Lmd1aWRlLmhhc093blByb3BlcnR5KCdzaG93R3JpZExpbmVzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pdC5ndWlkZS5zaG93R3JpZExpbmVzID0gc2VsZWN0b3JQcmVkaWNhdGVzLmlzTGVhZlBhcmVudCA/ICd4eScgOiAnJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3JQcmVkaWNhdGVzLmlzTGVhZlBhcmVudCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxjVW5pdEd1aWRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRlZmF1bHRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeFRpY2tXb3JkV3JhcExpbmVzTGltaXQ6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlUaWNrV29yZFdyYXBMaW5lc0xpbWl0OiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyksXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBmYWNldCBsZXZlbFxuICAgICAgICAgICAgICAgIHVuaXQuZ3VpZGUueC5jc3NDbGFzcyArPSAnIGZhY2V0LWF4aXMgY29tcGFjdCc7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS54LmF2b2lkQ29sbGlzaW9ucyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdW5pdC5ndWlkZS55LmNzc0NsYXNzICs9ICcgZmFjZXQtYXhpcyBjb21wYWN0JztcbiAgICAgICAgICAgICAgICB1bml0Lmd1aWRlLnkuYXZvaWRDb2xsaXNpb25zID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxjVW5pdEd1aWRlKFxuICAgICAgICAgICAgICAgICAgICB1bml0LFxuICAgICAgICAgICAgICAgICAgICBtZXRhLFxuICAgICAgICAgICAgICAgICAgICBfLmRlZmF1bHRzKFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzUGFkZGluZzogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5QXhpc1BhZGRpbmc6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdFRvWEF4aXNMYWJlbDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0VG9ZQXhpc0xhYmVsOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhUaWNrV29yZFdyYXBMaW5lc0xpbWl0OiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlUaWNrV29yZFdyYXBMaW5lc0xpbWl0OiAxXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MpLFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgfVxufTtcblxuU3BlY0VuZ2luZVR5cGVNYXAuQVVUTyA9IChzcmNTcGVjLCBtZXRhLCBzZXR0aW5ncykgPT4ge1xuICAgIHJldHVybiBbJ0JVSUxELUxBQkVMUycsICdCVUlMRC1HVUlERSddLnJlZHVjZShcbiAgICAgICAgKHNwZWMsIGVuZ2luZU5hbWUpID0+IFNwZWNFbmdpbmVUeXBlTWFwW2VuZ2luZU5hbWVdKHNwZWMsIG1ldGEsIHNldHRpbmdzKSxcbiAgICAgICAgc3JjU3BlY1xuICAgICk7XG59O1xuXG5TcGVjRW5naW5lVHlwZU1hcC5DT01QQUNUID0gKHNyY1NwZWMsIG1ldGEsIHNldHRpbmdzKSA9PiB7XG4gICAgcmV0dXJuIFsnQlVJTEQtTEFCRUxTJywgJ0JVSUxELUNPTVBBQ1QnXS5yZWR1Y2UoXG4gICAgICAgIChzcGVjLCBlbmdpbmVOYW1lKSA9PiBTcGVjRW5naW5lVHlwZU1hcFtlbmdpbmVOYW1lXShzcGVjLCBtZXRhLCBzZXR0aW5ncyksXG4gICAgICAgIHNyY1NwZWNcbiAgICApO1xufTtcblxudmFyIGZuVHJhdmVyc2VTcGVjID0gKG9yaWcsIHNwZWNVbml0UmVmLCB0cmFuc2Zvcm1SdWxlcykgPT4ge1xuICAgIHZhciB4UmVmID0gYXBwbHlOb2RlRGVmYXVsdHMoc3BlY1VuaXRSZWYpO1xuICAgIHhSZWYgPSB0cmFuc2Zvcm1SdWxlcyhjcmVhdGVTZWxlY3RvclByZWRpY2F0ZXMoeFJlZiksIHhSZWYpO1xuICAgIHhSZWYgPSBhcHBseUN1c3RvbVByb3BzKHhSZWYsIG9yaWcpO1xuICAgIHZhciBwcm9wID0gXy5vbWl0KHhSZWYsICd1bml0cycpO1xuICAgICh4UmVmLnVuaXRzIHx8IFtdKS5mb3JFYWNoKCh1bml0KSA9PiBmblRyYXZlcnNlU3BlYyh1dGlscy5jbG9uZSh1bml0KSwgaW5oZXJpdFByb3BzKHVuaXQsIHByb3ApLCB0cmFuc2Zvcm1SdWxlcykpO1xuICAgIHJldHVybiB4UmVmO1xufTtcblxudmFyIFNwZWNFbmdpbmVGYWN0b3J5ID0ge1xuICAgIGdldDogKHR5cGVOYW1lLCBzZXR0aW5ncywgc3JjU3BlYywgZm5DcmVhdGVTY2FsZSkgPT4ge1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSAoU3BlY0VuZ2luZVR5cGVNYXBbdHlwZU5hbWVdIHx8IFNwZWNFbmdpbmVUeXBlTWFwLk5PTkUpO1xuICAgICAgICB2YXIgbWV0YSA9IHtcblxuICAgICAgICAgICAgZGltZW5zaW9uOiAoc2NhbGVJZCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBzY2FsZUNmZyA9IHNyY1NwZWMuc2NhbGVzW3NjYWxlSWRdO1xuICAgICAgICAgICAgICAgIHZhciBkaW0gPSBzcmNTcGVjLnNvdXJjZXNbc2NhbGVDZmcuc291cmNlXS5kaW1zW3NjYWxlQ2ZnLmRpbV0gfHwge307XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZGltTmFtZTogc2NhbGVDZmcuZGltLFxuICAgICAgICAgICAgICAgICAgICBkaW1UeXBlOiBkaW0udHlwZSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVUeXBlOiBzY2FsZUNmZy50eXBlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNjYWxlTWV0YTogKHNjYWxlSWQpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgc2NhbGUgPSBmbkNyZWF0ZVNjYWxlKCdwb3MnLCBzY2FsZUlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHNjYWxlLmRvbWFpbigpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdW5pdFNwZWMgPSB7dW5pdDogdXRpbHMuY2xvbmUoc3JjU3BlYy51bml0KX07XG4gICAgICAgIHZhciBmdWxsU3BlYyA9IGVuZ2luZSh1bml0U3BlYywgbWV0YSwgc2V0dGluZ3MpO1xuICAgICAgICBzcmNTcGVjLnVuaXQgPSBmdWxsU3BlYy51bml0O1xuICAgICAgICByZXR1cm4gc3JjU3BlYztcbiAgICB9XG59O1xuXG5leHBvcnQgY2xhc3MgU3BlY1RyYW5zZm9ybUF1dG9MYXlvdXQge1xuXG4gICAgY29uc3RydWN0b3Ioc3BlYykge1xuICAgICAgICB0aGlzLnNwZWMgPSBzcGVjO1xuICAgICAgICB0aGlzLmlzQXBwbGljYWJsZSA9IHV0aWxzLmlzU3BlY1JlY3RDb29yZHNPbmx5KHNwZWMudW5pdCk7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtKGNoYXJ0KSB7XG5cbiAgICAgICAgdmFyIHNwZWMgPSB0aGlzLnNwZWM7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzQXBwbGljYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHNwZWM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2l6ZSA9IHNwZWMuc2V0dGluZ3Muc2l6ZTtcblxuICAgICAgICB2YXIgcnVsZSA9IF8uZmluZChzcGVjLnNldHRpbmdzLnNwZWNFbmdpbmUsIChydWxlKSA9PiAoc2l6ZS53aWR0aCA8PSBydWxlLndpZHRoKSk7XG5cbiAgICAgICAgcmV0dXJuIFNwZWNFbmdpbmVGYWN0b3J5LmdldChcbiAgICAgICAgICAgIHJ1bGUubmFtZSxcbiAgICAgICAgICAgIHNwZWMuc2V0dGluZ3MsXG4gICAgICAgICAgICBzcGVjLFxuICAgICAgICAgICAgKHR5cGUsIGFsaWFzKSA9PiBjaGFydC5nZXRTY2FsZUluZm8oYWxpYXMgfHwgYCR7dHlwZX06ZGVmYXVsdGApXG4gICAgICAgICk7XG4gICAgfVxufSJdfQ==;
define('spec-transform-calc-size',['exports', './scales-factory', './utils/utils'], function (exports, _scalesFactory, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var tryOptimizeSpec = function tryOptimizeSpec(root, localSettings) {

        if (root.guide.x.hide !== true && root.guide.x.rotate !== 0) {
            root.guide.x.rotate = 0;
            root.guide.x.textAnchor = 'middle';
            // root.guide.x.tickFormatWordWrapLimit = perTickX;

            var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);
            var xDelta = 0 - s + root.guide.x.$maxTickTextH;

            root.guide.padding.b += root.guide.padding.b > 0 ? xDelta : 0;

            if (root.guide.x.label.padding > s + localSettings.xAxisPadding) {
                root.guide.x.label.padding += xDelta;
            }
        }

        (root.units || []).filter(function (u) {
            return u.type === 'COORDS.RECT';
        }).forEach(function (u) {
            return tryOptimizeSpec(u, localSettings);
        });
    };

    var byMaxText = function byMaxText(gx) {
        return gx.$maxTickTextW;
    };
    var byDensity = function byDensity(gx) {
        return gx.density;
    };

    var fitModelStrategies = {

        'entire-view': function entireView(srcSize, calcSize, specRef) {

            var widthByMaxText = calcSize('x', specRef.unit, byMaxText);
            if (widthByMaxText <= srcSize.width) {
                tryOptimizeSpec(specRef.unit, specRef.settings);
            }

            var newW = srcSize.width;
            var newH = srcSize.height;

            return { newW: newW, newH: newH };
        },

        minimal: function minimal(srcSize, calcSize, specRef) {
            var newW = calcSize('x', specRef.unit, byDensity);
            var newH = calcSize('y', specRef.unit, byDensity);
            return { newW: newW, newH: newH };
        },

        normal: function normal(srcSize, calcSize, specRef) {

            var newW;

            var widthByMaxText = calcSize('x', specRef.unit, byMaxText);
            var originalWidth = srcSize.width;

            if (widthByMaxText <= originalWidth) {
                tryOptimizeSpec(specRef.unit, specRef.settings);
                newW = Math.max(originalWidth, widthByMaxText);
            } else {
                newW = Math.max(originalWidth, Math.max(srcSize.width, calcSize('x', specRef.unit, byDensity)));
            }

            var newH = Math.max(srcSize.height, calcSize('y', specRef.unit, byDensity));

            return { newW: newW, newH: newH };
        },

        'fit-width': function fitWidth(srcSize, calcSize, specRef) {
            var widthByMaxText = calcSize('x', specRef.unit, byMaxText);
            if (widthByMaxText <= srcSize.width) {
                tryOptimizeSpec(specRef.unit, specRef.settings);
            }

            var newW = srcSize.width;
            var newH = calcSize('y', specRef.unit, byDensity);
            return { newW: newW, newH: newH };
        },

        'fit-height': function fitHeight(srcSize, calcSize, specRef) {
            var newW = calcSize('x', specRef.unit, byDensity);
            var newH = srcSize.height;
            return { newW: newW, newH: newH };
        }
    };

    var SpecTransformCalcSize = (function () {
        function SpecTransformCalcSize(spec) {
            _classCallCheck(this, SpecTransformCalcSize);

            this.spec = spec;
            this.isApplicable = _utilsUtils.utils.isSpecRectCoordsOnly(spec.unit);
        }

        _createClass(SpecTransformCalcSize, [{
            key: 'transform',
            value: function transform(chart) {

                var specRef = this.spec;

                if (!this.isApplicable) {
                    return specRef;
                }

                var fitModel = specRef.settings.fitModel;

                if (!fitModel) {
                    return specRef;
                }

                var scales = specRef.scales;

                var groupFramesBy = function groupFramesBy(frames, dim) {
                    return frames.reduce(function (memo, f) {
                        var fKey = f.key || {};
                        var fVal = fKey[dim];
                        memo[fVal] = memo[fVal] || [];
                        memo[fVal].push(f);
                        return memo;
                    }, {});
                };

                var calcScaleSize = function calcScaleSize(scaleInfo, maxTickText) {

                    var r = 0;

                    var isDiscrete = ['ordinal', 'period'].indexOf(scaleInfo.scaleType) >= 0;

                    if (isDiscrete) {
                        r = maxTickText * scaleInfo.domain().length;
                    } else {
                        r = maxTickText * 4;
                    }

                    return r;
                };

                var calcSizeRecursively = function calcSizeRecursively(prop, root, takeStepSizeStrategy) {
                    var frame = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

                    var xCfg = prop === 'x' ? root.x : root.y;
                    var yCfg = prop === 'x' ? root.y : root.x;
                    var guide = root.guide;
                    var xSize = prop === 'x' ? takeStepSizeStrategy(guide.x) : takeStepSizeStrategy(guide.y);

                    var resScaleSize = prop === 'x' ? guide.padding.l + guide.padding.r : guide.padding.b + guide.padding.t;

                    if (root.units[0].type !== 'COORDS.RECT') {

                        var xScale = chart.getScaleInfo(xCfg, frame);
                        return resScaleSize + calcScaleSize(xScale, xSize);
                    } else {

                        var rows = groupFramesBy(root.frames, scales[yCfg].dim);
                        var rowsSizes = Object.keys(rows).map(function (kRow) {
                            return rows[kRow].map(function (f) {
                                return calcSizeRecursively(prop, f.units[0], takeStepSizeStrategy, f);
                            }).reduce(function (sum, size) {
                                return sum + size;
                            }, 0);
                        });

                        // pick up max row size
                        var maxRowSize = Math.max.apply(Math, _toConsumableArray(rowsSizes));
                        return resScaleSize + maxRowSize;
                    }
                };

                var srcSize = specRef.settings.size;

                var newW = srcSize.width;
                var newH = srcSize.height;

                var strategy = fitModelStrategies[fitModel];
                if (strategy) {
                    var newSize = strategy(srcSize, calcSizeRecursively, specRef);
                    newW = newSize.newW;
                    newH = newSize.newH;
                }

                var prettifySize = function prettifySize(srcSize, newSize) {

                    var scrollSize = specRef.settings.getScrollBarWidth();

                    var recommendedWidth = newSize.width;
                    var recommendedHeight = newSize.height;

                    var deltaW = srcSize.width - recommendedWidth;
                    var deltaH = srcSize.height - recommendedHeight;

                    var scrollW = deltaH >= 0 ? 0 : scrollSize;
                    var scrollH = deltaW >= 0 ? 0 : scrollSize;

                    return {
                        height: recommendedHeight - scrollH,
                        width: recommendedWidth - scrollW
                    };
                };

                specRef.settings.size = prettifySize(srcSize, { width: newW, height: newH });

                return specRef;
            }
        }]);

        return SpecTransformCalcSize;
    })();

    exports.SpecTransformCalcSize = SpecTransformCalcSize;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zcGVjLXRyYW5zZm9ybS1jYWxjLXNpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUdBLFFBQUksZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBSSxJQUFJLEVBQUUsYUFBYSxFQUFLOztBQUUzQyxZQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN6RCxnQkFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QixnQkFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQzs7O0FBR25DLGdCQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNoRixnQkFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7O0FBRWhELGdCQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWhFLGdCQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxZQUFZLEFBQUMsRUFBRTtBQUMvRCxvQkFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUM7YUFDeEM7U0FDSjs7QUFFRCxTQUFDLElBQUksQ0FBQyxLQUFLLElBQUks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LENBQUksT0FBTyxFQUFFLE9BQU8sRUFBSzs7QUFFckMsd0JBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzs7QUFFdEQsd0JBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUNyQyx3QkFBSSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDOztBQUV2Qyx3QkFBSSxNQUFNLEdBQUksT0FBTyxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsQUFBQyxDQUFDO0FBQ2hELHdCQUFJLE1BQU0sR0FBSSxPQUFPLENBQUMsTUFBTSxHQUFHLGlCQUFpQixBQUFDLENBQUM7O0FBRWxELHdCQUFJLE9BQU8sR0FBRyxBQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUM3Qyx3QkFBSSxPQUFPLEdBQUcsQUFBQyxNQUFNLElBQUksQ0FBQyxHQUFJLENBQUMsR0FBRyxVQUFVLENBQUM7O0FBRTdDLDJCQUFPO0FBQ0gsOEJBQU0sRUFBRSxpQkFBaUIsR0FBRyxPQUFPO0FBQ25DLDZCQUFLLEVBQUUsZ0JBQWdCLEdBQUcsT0FBTztxQkFDcEMsQ0FBQztpQkFDTCxDQUFDOztBQUVGLHVCQUFPLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzs7QUFFM0UsdUJBQU8sT0FBTyxDQUFDO2FBQ2xCOzs7ZUFwSFEscUJBQXFCIiwiZmlsZSI6InNyYy9zcGVjLXRyYW5zZm9ybS1jYWxjLXNpemUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1NjYWxlc0ZhY3Rvcnl9IGZyb20gJy4vc2NhbGVzLWZhY3RvcnknO1xuaW1wb3J0IHt1dGlsc30gZnJvbSAnLi91dGlscy91dGlscyc7XG5cbnZhciB0cnlPcHRpbWl6ZVNwZWMgPSAocm9vdCwgbG9jYWxTZXR0aW5ncykgPT4ge1xuXG4gICAgaWYgKHJvb3QuZ3VpZGUueC5oaWRlICE9PSB0cnVlICYmIHJvb3QuZ3VpZGUueC5yb3RhdGUgIT09IDApIHtcbiAgICAgICAgcm9vdC5ndWlkZS54LnJvdGF0ZSA9IDA7XG4gICAgICAgIHJvb3QuZ3VpZGUueC50ZXh0QW5jaG9yID0gJ21pZGRsZSc7XG4gICAgICAgIC8vIHJvb3QuZ3VpZGUueC50aWNrRm9ybWF0V29yZFdyYXBMaW1pdCA9IHBlclRpY2tYO1xuXG4gICAgICAgIHZhciBzID0gTWF0aC5taW4obG9jYWxTZXR0aW5ncy54QXhpc1RpY2tMYWJlbExpbWl0LCByb290Lmd1aWRlLnguJG1heFRpY2tUZXh0Vyk7XG4gICAgICAgIHZhciB4RGVsdGEgPSAwIC0gcyArIHJvb3QuZ3VpZGUueC4kbWF4VGlja1RleHRIO1xuXG4gICAgICAgIHJvb3QuZ3VpZGUucGFkZGluZy5iICs9IChyb290Lmd1aWRlLnBhZGRpbmcuYiA+IDApID8geERlbHRhIDogMDtcblxuICAgICAgICBpZiAocm9vdC5ndWlkZS54LmxhYmVsLnBhZGRpbmcgPiAocyArIGxvY2FsU2V0dGluZ3MueEF4aXNQYWRkaW5nKSkge1xuICAgICAgICAgICAgcm9vdC5ndWlkZS54LmxhYmVsLnBhZGRpbmcgKz0geERlbHRhO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKHJvb3QudW5pdHMgfHwgW10pXG4gICAgICAgIC5maWx0ZXIoKHUpID0+IHUudHlwZSA9PT0gJ0NPT1JEUy5SRUNUJylcbiAgICAgICAgLmZvckVhY2goKHUpID0+IHRyeU9wdGltaXplU3BlYyh1LCBsb2NhbFNldHRpbmdzKSk7XG59O1xuXG52YXIgYnlNYXhUZXh0ID0gKChneCkgPT4gZ3guJG1heFRpY2tUZXh0Vyk7XG52YXIgYnlEZW5zaXR5ID0gKChneCkgPT4gZ3guZGVuc2l0eSk7XG5cbnZhciBmaXRNb2RlbFN0cmF0ZWdpZXMgPSB7XG5cbiAgICAnZW50aXJlLXZpZXcnIChzcmNTaXplLCBjYWxjU2l6ZSwgc3BlY1JlZikge1xuXG4gICAgICAgIHZhciB3aWR0aEJ5TWF4VGV4dCA9IGNhbGNTaXplKCd4Jywgc3BlY1JlZi51bml0LCBieU1heFRleHQpO1xuICAgICAgICBpZiAod2lkdGhCeU1heFRleHQgPD0gc3JjU2l6ZS53aWR0aCkge1xuICAgICAgICAgICAgdHJ5T3B0aW1pemVTcGVjKHNwZWNSZWYudW5pdCwgc3BlY1JlZi5zZXR0aW5ncyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3VyA9IHNyY1NpemUud2lkdGg7XG4gICAgICAgIHZhciBuZXdIID0gc3JjU2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgcmV0dXJuIHtuZXdXLCBuZXdIfTtcbiAgICB9LFxuXG4gICAgbWluaW1hbCAoc3JjU2l6ZSwgY2FsY1NpemUsIHNwZWNSZWYpIHtcbiAgICAgICAgdmFyIG5ld1cgPSBjYWxjU2l6ZSgneCcsIHNwZWNSZWYudW5pdCwgYnlEZW5zaXR5KTtcbiAgICAgICAgdmFyIG5ld0ggPSBjYWxjU2l6ZSgneScsIHNwZWNSZWYudW5pdCwgYnlEZW5zaXR5KTtcbiAgICAgICAgcmV0dXJuIHtuZXdXLCBuZXdIfTtcbiAgICB9LFxuXG4gICAgbm9ybWFsIChzcmNTaXplLCBjYWxjU2l6ZSwgc3BlY1JlZikge1xuXG4gICAgICAgIHZhciBuZXdXO1xuXG4gICAgICAgIHZhciB3aWR0aEJ5TWF4VGV4dCA9IGNhbGNTaXplKCd4Jywgc3BlY1JlZi51bml0LCBieU1heFRleHQpO1xuICAgICAgICB2YXIgb3JpZ2luYWxXaWR0aCA9IHNyY1NpemUud2lkdGg7XG5cbiAgICAgICAgaWYgKHdpZHRoQnlNYXhUZXh0IDw9IG9yaWdpbmFsV2lkdGgpIHtcbiAgICAgICAgICAgIHRyeU9wdGltaXplU3BlYyhzcGVjUmVmLnVuaXQsIHNwZWNSZWYuc2V0dGluZ3MpO1xuICAgICAgICAgICAgbmV3VyA9IE1hdGgubWF4KG9yaWdpbmFsV2lkdGgsIHdpZHRoQnlNYXhUZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld1cgPSBNYXRoLm1heChvcmlnaW5hbFdpZHRoLCBNYXRoLm1heChzcmNTaXplLndpZHRoLCBjYWxjU2l6ZSgneCcsIHNwZWNSZWYudW5pdCwgYnlEZW5zaXR5KSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5ld0ggPSBNYXRoLm1heChzcmNTaXplLmhlaWdodCwgY2FsY1NpemUoJ3knLCBzcGVjUmVmLnVuaXQsIGJ5RGVuc2l0eSkpO1xuXG4gICAgICAgIHJldHVybiB7bmV3VywgbmV3SH07XG4gICAgfSxcblxuICAgICdmaXQtd2lkdGgnIChzcmNTaXplLCBjYWxjU2l6ZSwgc3BlY1JlZikge1xuICAgICAgICB2YXIgd2lkdGhCeU1heFRleHQgPSBjYWxjU2l6ZSgneCcsIHNwZWNSZWYudW5pdCwgYnlNYXhUZXh0KTtcbiAgICAgICAgaWYgKHdpZHRoQnlNYXhUZXh0IDw9IHNyY1NpemUud2lkdGgpIHtcbiAgICAgICAgICAgIHRyeU9wdGltaXplU3BlYyhzcGVjUmVmLnVuaXQsIHNwZWNSZWYuc2V0dGluZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5ld1cgPSBzcmNTaXplLndpZHRoO1xuICAgICAgICB2YXIgbmV3SCA9IGNhbGNTaXplKCd5Jywgc3BlY1JlZi51bml0LCBieURlbnNpdHkpO1xuICAgICAgICByZXR1cm4ge25ld1csIG5ld0h9O1xuICAgIH0sXG5cbiAgICAnZml0LWhlaWdodCcgKHNyY1NpemUsIGNhbGNTaXplLCBzcGVjUmVmKSB7XG4gICAgICAgIHZhciBuZXdXID0gY2FsY1NpemUoJ3gnLCBzcGVjUmVmLnVuaXQsIGJ5RGVuc2l0eSk7XG4gICAgICAgIHZhciBuZXdIID0gc3JjU2l6ZS5oZWlnaHQ7XG4gICAgICAgIHJldHVybiB7bmV3VywgbmV3SH07XG4gICAgfVxufTtcblxuZXhwb3J0IGNsYXNzIFNwZWNUcmFuc2Zvcm1DYWxjU2l6ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcGVjKSB7XG4gICAgICAgIHRoaXMuc3BlYyA9IHNwZWM7XG4gICAgICAgIHRoaXMuaXNBcHBsaWNhYmxlID0gdXRpbHMuaXNTcGVjUmVjdENvb3Jkc09ubHkoc3BlYy51bml0KTtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm0oY2hhcnQpIHtcblxuICAgICAgICB2YXIgc3BlY1JlZiA9IHRoaXMuc3BlYztcblxuICAgICAgICBpZiAoIXRoaXMuaXNBcHBsaWNhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3BlY1JlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXRNb2RlbCA9IHNwZWNSZWYuc2V0dGluZ3MuZml0TW9kZWw7XG5cbiAgICAgICAgaWYgKCFmaXRNb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHNwZWNSZWY7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2NhbGVzID0gc3BlY1JlZi5zY2FsZXM7XG5cbiAgICAgICAgdmFyIGdyb3VwRnJhbWVzQnkgPSAoZnJhbWVzLCBkaW0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBmcmFtZXNcbiAgICAgICAgICAgICAgICAucmVkdWNlKChtZW1vLCBmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmS2V5ID0gZi5rZXkgfHwge307XG4gICAgICAgICAgICAgICAgICAgIHZhciBmVmFsID0gZktleVtkaW1dO1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2ZWYWxdID0gbWVtb1tmVmFsXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1tmVmFsXS5wdXNoKGYpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICB9LCB7fSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGNhbGNTY2FsZVNpemUgPSAoc2NhbGVJbmZvLCBtYXhUaWNrVGV4dCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgciA9IDA7XG5cbiAgICAgICAgICAgIHZhciBpc0Rpc2NyZXRlID0gKFsnb3JkaW5hbCcsICdwZXJpb2QnXS5pbmRleE9mKHNjYWxlSW5mby5zY2FsZVR5cGUpID49IDApO1xuXG4gICAgICAgICAgICBpZiAoaXNEaXNjcmV0ZSkge1xuICAgICAgICAgICAgICAgIHIgPSBtYXhUaWNrVGV4dCAqIHNjYWxlSW5mby5kb21haW4oKS5sZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHIgPSBtYXhUaWNrVGV4dCAqIDQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBjYWxjU2l6ZVJlY3Vyc2l2ZWx5ID0gKHByb3AsIHJvb3QsIHRha2VTdGVwU2l6ZVN0cmF0ZWd5LCBmcmFtZSA9IG51bGwpID0+IHtcblxuICAgICAgICAgICAgdmFyIHhDZmcgPSAocHJvcCA9PT0gJ3gnKSA/IHJvb3QueCA6IHJvb3QueTtcbiAgICAgICAgICAgIHZhciB5Q2ZnID0gKHByb3AgPT09ICd4JykgPyByb290LnkgOiByb290Lng7XG4gICAgICAgICAgICB2YXIgZ3VpZGUgPSByb290Lmd1aWRlO1xuICAgICAgICAgICAgdmFyIHhTaXplID0gKHByb3AgPT09ICd4JykgPyB0YWtlU3RlcFNpemVTdHJhdGVneShndWlkZS54KSA6IHRha2VTdGVwU2l6ZVN0cmF0ZWd5KGd1aWRlLnkpO1xuXG4gICAgICAgICAgICB2YXIgcmVzU2NhbGVTaXplID0gKHByb3AgPT09ICd4JykgP1xuICAgICAgICAgICAgICAgIChndWlkZS5wYWRkaW5nLmwgKyBndWlkZS5wYWRkaW5nLnIpIDpcbiAgICAgICAgICAgICAgICAoZ3VpZGUucGFkZGluZy5iICsgZ3VpZGUucGFkZGluZy50KTtcblxuICAgICAgICAgICAgaWYgKHJvb3QudW5pdHNbMF0udHlwZSAhPT0gJ0NPT1JEUy5SRUNUJykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHhTY2FsZSA9IGNoYXJ0LmdldFNjYWxlSW5mbyh4Q2ZnLCBmcmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc1NjYWxlU2l6ZSArIGNhbGNTY2FsZVNpemUoeFNjYWxlLCB4U2l6ZSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcm93cyA9IGdyb3VwRnJhbWVzQnkocm9vdC5mcmFtZXMsIHNjYWxlc1t5Q2ZnXS5kaW0pO1xuICAgICAgICAgICAgICAgIHZhciByb3dzU2l6ZXMgPSBPYmplY3RcbiAgICAgICAgICAgICAgICAgICAgLmtleXMocm93cylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoa1JvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvd3Nba1Jvd11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChmKSA9PiBjYWxjU2l6ZVJlY3Vyc2l2ZWx5KHByb3AsIGYudW5pdHNbMF0sIHRha2VTdGVwU2l6ZVN0cmF0ZWd5LCBmKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKChzdW0sIHNpemUpID0+IChzdW0gKyBzaXplKSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcGljayB1cCBtYXggcm93IHNpemVcbiAgICAgICAgICAgICAgICB2YXIgbWF4Um93U2l6ZSA9IE1hdGgubWF4KC4uLnJvd3NTaXplcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc1NjYWxlU2l6ZSArIG1heFJvd1NpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNyY1NpemUgPSBzcGVjUmVmLnNldHRpbmdzLnNpemU7XG5cbiAgICAgICAgdmFyIG5ld1cgPSBzcmNTaXplLndpZHRoO1xuICAgICAgICB2YXIgbmV3SCA9IHNyY1NpemUuaGVpZ2h0O1xuXG4gICAgICAgIHZhciBzdHJhdGVneSA9IGZpdE1vZGVsU3RyYXRlZ2llc1tmaXRNb2RlbF07XG4gICAgICAgIGlmIChzdHJhdGVneSkge1xuICAgICAgICAgICAgbGV0IG5ld1NpemUgPSBzdHJhdGVneShzcmNTaXplLCBjYWxjU2l6ZVJlY3Vyc2l2ZWx5LCBzcGVjUmVmKTtcbiAgICAgICAgICAgIG5ld1cgPSBuZXdTaXplLm5ld1c7XG4gICAgICAgICAgICBuZXdIID0gbmV3U2l6ZS5uZXdIO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByZXR0aWZ5U2l6ZSA9IChzcmNTaXplLCBuZXdTaXplKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciBzY3JvbGxTaXplID0gc3BlY1JlZi5zZXR0aW5ncy5nZXRTY3JvbGxCYXJXaWR0aCgpO1xuXG4gICAgICAgICAgICB2YXIgcmVjb21tZW5kZWRXaWR0aCA9IG5ld1NpemUud2lkdGg7XG4gICAgICAgICAgICB2YXIgcmVjb21tZW5kZWRIZWlnaHQgPSBuZXdTaXplLmhlaWdodDtcblxuICAgICAgICAgICAgdmFyIGRlbHRhVyA9IChzcmNTaXplLndpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCk7XG4gICAgICAgICAgICB2YXIgZGVsdGFIID0gKHNyY1NpemUuaGVpZ2h0IC0gcmVjb21tZW5kZWRIZWlnaHQpO1xuXG4gICAgICAgICAgICB2YXIgc2Nyb2xsVyA9IChkZWx0YUggPj0gMCkgPyAwIDogc2Nyb2xsU2l6ZTtcbiAgICAgICAgICAgIHZhciBzY3JvbGxIID0gKGRlbHRhVyA+PSAwKSA/IDAgOiBzY3JvbGxTaXplO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhlaWdodDogcmVjb21tZW5kZWRIZWlnaHQgLSBzY3JvbGxILFxuICAgICAgICAgICAgICAgIHdpZHRoOiByZWNvbW1lbmRlZFdpZHRoIC0gc2Nyb2xsV1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBzcGVjUmVmLnNldHRpbmdzLnNpemUgPSBwcmV0dGlmeVNpemUoc3JjU2l6ZSwge3dpZHRoOiBuZXdXLCBoZWlnaHQ6IG5ld0h9KTtcblxuICAgICAgICByZXR1cm4gc3BlY1JlZjtcbiAgICB9XG59Il19;
define('spec-transform-apply-ratio',['exports', 'underscore', './utils/utils'], function (exports, _underscore, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _2 = _interopRequireDefault(_underscore);

    var SpecTransformApplyRatio = (function () {
        function SpecTransformApplyRatio(spec) {
            _classCallCheck(this, SpecTransformApplyRatio);

            this.spec = spec;
            this.isApplicable = spec.settings.autoRatio && _utilsUtils.utils.isSpecRectCoordsOnly(spec.unit);
        }

        _createClass(SpecTransformApplyRatio, [{
            key: 'transform',
            value: function transform(chartInstance) {

                var refSpec = this.spec;

                if (!this.isApplicable) {
                    return refSpec;
                }

                try {
                    this.ruleApplyRatio(refSpec, chartInstance);
                } catch (ex) {
                    if (ex.message !== 'Not applicable') {
                        throw ex;
                    }
                }

                return refSpec;
            }
        }, {
            key: 'ruleApplyRatio',
            value: function ruleApplyRatio(spec, chartInstance) {

                var isCoordsRect = function isCoordsRect(unitRef) {
                    return unitRef.type === 'COORDS.RECT' || unitRef.type === 'RECT';
                };

                var isElement = function isElement(unitRef) {
                    return unitRef.type.indexOf('ELEMENT.') === 0;
                };

                var traverse = function traverse(root, enterFn, exitFn) {
                    var level = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

                    var shouldContinue = enterFn(root, level);

                    if (shouldContinue) {
                        (root.units || []).map(function (rect) {
                            return traverse(rect, enterFn, exitFn, level + 1);
                        });
                    }

                    exitFn(root, level);
                };

                var xs = [];
                var ys = [];

                var enterIterator = function enterIterator(unitRef, level) {

                    if (level > 1 || !isCoordsRect(unitRef)) {
                        throw new Error('Not applicable');
                    }

                    xs.push(unitRef.x);
                    ys.push(unitRef.y);

                    var units = unitRef.units || [];
                    var rects = units.map(function (x) {

                        if (!(isCoordsRect(x) || isElement(x))) {
                            throw new Error('Not applicable');
                        }

                        return x;
                    }).filter(isCoordsRect);

                    return rects.length === 1;
                };

                traverse(spec.unit, enterIterator, function (unitRef, level) {
                    return 0;
                });

                var toScaleConfig = function toScaleConfig(scaleName) {
                    return spec.scales[scaleName];
                };
                var isValidScale = function isValidScale(scale) {
                    return scale.source === '/' && !scale.ratio && !scale.fitToFrameByDims;
                };
                var isOrdinalScale = function isOrdinalScale(scale) {
                    return scale.type === 'ordinal' || scale.type === 'period' && !scale.period;
                };

                var realXs = xs.map(toScaleConfig).filter(isValidScale);
                var realYs = ys.map(toScaleConfig).filter(isValidScale);

                var xyProd = 2;
                if ([realXs.length, realYs.length].some(function (l) {
                    return l === xyProd;
                })) {
                    (function () {
                        var exDim = function exDim(s) {
                            return s.dim;
                        };
                        var scalesIterator = function scalesIterator(s, i, list) {
                            return s.fitToFrameByDims = list.slice(0, i).map(exDim);
                        };
                        var tryApplyRatioToScales = function tryApplyRatioToScales(axis, scalesRef) {
                            if (scalesRef.filter(isOrdinalScale).length === xyProd) {
                                scalesRef.forEach(scalesIterator);
                                scalesRef[0].ratio = _utilsUtils.utils.generateRatioFunction(axis, scalesRef.map(exDim), chartInstance);
                            }
                        };

                        tryApplyRatioToScales('x', realXs);
                        tryApplyRatioToScales('y', realYs);
                    })();
                }
            }
        }]);

        return SpecTransformApplyRatio;
    })();

    exports.SpecTransformApplyRatio = SpecTransformApplyRatio;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zcGVjLXRyYW5zZm9ybS1hcHBseS1yYXRpby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7UUFHYSx1QkFBdUI7QUFFckIsaUJBRkYsdUJBQXVCLENBRXBCLElBQUksRUFBRTtrQ0FGVCx1QkFBdUI7O0FBRzVCLGdCQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixnQkFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxZQU4vQyxLQUFLLENBTWdELG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4Rjs7cUJBTFEsdUJBQXVCOzttQkFPdkIsbUJBQUMsYUFBYSxFQUFFOztBQUVyQixvQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFeEIsb0JBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3BCLDJCQUFPLE9BQU8sQ0FBQztpQkFDbEI7O0FBRUQsb0JBQUk7QUFDQSx3QkFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7aUJBQy9DLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDVCx3QkFBSSxFQUFFLENBQUMsT0FBTyxLQUFLLGdCQUFnQixFQUFFO0FBQ2pDLDhCQUFNLEVBQUUsQ0FBQztxQkFDWjtpQkFDSjs7QUFFRCx1QkFBTyxPQUFPLENBQUM7YUFDbEI7OzttQkFFYSx3QkFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFOztBQUVoQyxvQkFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksT0FBTyxFQUFLO0FBQzVCLDJCQUFRLE9BQU8sQ0FBQyxJQUFJLEtBQUssYUFBYSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFFO2lCQUN0RSxDQUFDOztBQUVGLG9CQUFJLFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxPQUFPLEVBQUs7QUFDekIsMkJBQVEsT0FBTyxDQUFDLElBQUksQ0FB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aW1wb3J0IHtkZWZhdWx0IGFzIF99IGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IHt1dGlsc30gZnJvbSAnLi91dGlscy91dGlscyc7XG5cbmV4cG9ydCBjbGFzcyBTcGVjVHJhbnNmb3JtQXBwbHlSYXRpbyB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcGVjKSB7XG4gICAgICAgIHRoaXMuc3BlYyA9IHNwZWM7XG4gICAgICAgIHRoaXMuaXNBcHBsaWNhYmxlID0gc3BlYy5zZXR0aW5ncy5hdXRvUmF0aW8gJiYgdXRpbHMuaXNTcGVjUmVjdENvb3Jkc09ubHkoc3BlYy51bml0KTtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm0oY2hhcnRJbnN0YW5jZSkge1xuXG4gICAgICAgIHZhciByZWZTcGVjID0gdGhpcy5zcGVjO1xuXG4gICAgICAgIGlmICghdGhpcy5pc0FwcGxpY2FibGUpIHtcbiAgICAgICAgICAgIHJldHVybiByZWZTcGVjO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucnVsZUFwcGx5UmF0aW8ocmVmU3BlYywgY2hhcnRJbnN0YW5jZSk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICBpZiAoZXgubWVzc2FnZSAhPT0gJ05vdCBhcHBsaWNhYmxlJykge1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlZlNwZWM7XG4gICAgfVxuXG4gICAgcnVsZUFwcGx5UmF0aW8oc3BlYywgY2hhcnRJbnN0YW5jZSkge1xuXG4gICAgICAgIHZhciBpc0Nvb3Jkc1JlY3QgPSAodW5pdFJlZikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICh1bml0UmVmLnR5cGUgPT09ICdDT09SRFMuUkVDVCcgfHwgdW5pdFJlZi50eXBlID09PSAnUkVDVCcpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpc0VsZW1lbnQgPSAodW5pdFJlZikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICh1bml0UmVmLnR5cGUuaW5kZXhPZignRUxFTUVOVC4nKSA9PT0gMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHRyYXZlcnNlID0gKHJvb3QsIGVudGVyRm4sIGV4aXRGbiwgbGV2ZWwgPSAwKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciBzaG91bGRDb250aW51ZSA9IGVudGVyRm4ocm9vdCwgbGV2ZWwpO1xuXG4gICAgICAgICAgICBpZiAoc2hvdWxkQ29udGludWUpIHtcbiAgICAgICAgICAgICAgICAocm9vdC51bml0cyB8fCBbXSkubWFwKChyZWN0KSA9PiB0cmF2ZXJzZShyZWN0LCBlbnRlckZuLCBleGl0Rm4sIGxldmVsICsgMSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleGl0Rm4ocm9vdCwgbGV2ZWwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB4cyA9IFtdO1xuICAgICAgICB2YXIgeXMgPSBbXTtcblxuICAgICAgICB2YXIgZW50ZXJJdGVyYXRvciA9ICh1bml0UmVmLCBsZXZlbCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoKGxldmVsID4gMSkgfHwgIWlzQ29vcmRzUmVjdCh1bml0UmVmKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGFwcGxpY2FibGUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeHMucHVzaCh1bml0UmVmLngpO1xuICAgICAgICAgICAgeXMucHVzaCh1bml0UmVmLnkpO1xuXG4gICAgICAgICAgICB2YXIgdW5pdHMgPSB1bml0UmVmLnVuaXRzIHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJlY3RzID0gdW5pdHNcbiAgICAgICAgICAgICAgICAubWFwKCh4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoaXNDb29yZHNSZWN0KHgpIHx8IGlzRWxlbWVudCh4KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGFwcGxpY2FibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihpc0Nvb3Jkc1JlY3QpO1xuXG4gICAgICAgICAgICByZXR1cm4gKHJlY3RzLmxlbmd0aCA9PT0gMSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHJhdmVyc2Uoc3BlYy51bml0LCBlbnRlckl0ZXJhdG9yLCAoKHVuaXRSZWYsIGxldmVsKSA9PiAwKSk7XG5cbiAgICAgICAgdmFyIHRvU2NhbGVDb25maWcgPSAoKHNjYWxlTmFtZSkgPT4gc3BlYy5zY2FsZXNbc2NhbGVOYW1lXSk7XG4gICAgICAgIHZhciBpc1ZhbGlkU2NhbGUgPSAoKHNjYWxlKSA9PiAoKHNjYWxlLnNvdXJjZSA9PT0gJy8nKSAmJiAhc2NhbGUucmF0aW8gJiYgIXNjYWxlLmZpdFRvRnJhbWVCeURpbXMpKTtcbiAgICAgICAgdmFyIGlzT3JkaW5hbFNjYWxlID0gKChzY2FsZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNjYWxlLnR5cGUgPT09ICdvcmRpbmFsJyB8fCAoc2NhbGUudHlwZSA9PT0gJ3BlcmlvZCcgJiYgIXNjYWxlLnBlcmlvZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByZWFsWHMgPSB4cy5tYXAodG9TY2FsZUNvbmZpZykuZmlsdGVyKGlzVmFsaWRTY2FsZSk7XG4gICAgICAgIHZhciByZWFsWXMgPSB5cy5tYXAodG9TY2FsZUNvbmZpZykuZmlsdGVyKGlzVmFsaWRTY2FsZSk7XG5cbiAgICAgICAgdmFyIHh5UHJvZCA9IDI7XG4gICAgICAgIGlmIChbcmVhbFhzLmxlbmd0aCwgcmVhbFlzLmxlbmd0aF0uc29tZShsID0+IGwgPT09IHh5UHJvZCkpIHtcbiAgICAgICAgICAgIGxldCBleERpbSA9ICgocykgPT4gcy5kaW0pO1xuICAgICAgICAgICAgbGV0IHNjYWxlc0l0ZXJhdG9yID0gKChzLCBpLCBsaXN0KSA9PiAocy5maXRUb0ZyYW1lQnlEaW1zID0gbGlzdC5zbGljZSgwLCBpKS5tYXAoZXhEaW0pKSk7XG4gICAgICAgICAgICBsZXQgdHJ5QXBwbHlSYXRpb1RvU2NhbGVzID0gKGF4aXMsIHNjYWxlc1JlZikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzY2FsZXNSZWYuZmlsdGVyKGlzT3JkaW5hbFNjYWxlKS5sZW5ndGggPT09IHh5UHJvZCkge1xuICAgICAgICAgICAgICAgICAgICBzY2FsZXNSZWYuZm9yRWFjaChzY2FsZXNJdGVyYXRvcik7XG4gICAgICAgICAgICAgICAgICAgIHNjYWxlc1JlZlswXS5yYXRpbyA9IHV0aWxzLmdlbmVyYXRlUmF0aW9GdW5jdGlvbihheGlzLCBzY2FsZXNSZWYubWFwKGV4RGltKSwgY2hhcnRJbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5QXBwbHlSYXRpb1RvU2NhbGVzKCd4JywgcmVhbFhzKTtcbiAgICAgICAgICAgIHRyeUFwcGx5UmF0aW9Ub1NjYWxlcygneScsIHJlYWxZcyk7XG4gICAgICAgIH1cbiAgICB9XG59Il19;
define('spec-transform-extract-axes',['exports', 'underscore', './utils/utils'], function (exports, _underscore, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _2 = _interopRequireDefault(_underscore);

    var SpecTransformExtractAxes = (function () {
        function SpecTransformExtractAxes(spec) {
            _classCallCheck(this, SpecTransformExtractAxes);

            this.spec = spec;
            this.isApplicable = spec.settings.layoutEngine === 'EXTRACT' && _utilsUtils.utils.isSpecRectCoordsOnly(spec.unit);
        }

        _createClass(SpecTransformExtractAxes, [{
            key: 'transform',
            value: function transform() {

                var refSpec = this.spec;

                if (!this.isApplicable) {
                    return refSpec;
                }

                try {
                    this.ruleExtractAxes(refSpec);
                } catch (ex) {
                    if (ex.message === 'Not applicable') {
                        console.log('[TauCharts]: can\'t extract axes for the given chart specification', refSpec);
                    } else {
                        throw ex;
                    }
                }

                return refSpec;
            }
        }, {
            key: 'ruleExtractAxes',
            value: function ruleExtractAxes(spec) {

                var isCoordsRect = function isCoordsRect(unitRef) {
                    return unitRef.type === 'COORDS.RECT' || unitRef.type === 'RECT';
                };

                var isElement = function isElement(unitRef) {
                    return unitRef.type.indexOf('ELEMENT.') === 0;
                };

                var ttl = { l: 0, r: 10, t: 10, b: 0 };
                var seq = [];
                var enterIterator = function enterIterator(unitRef, level) {

                    if (level > 1 || !isCoordsRect(unitRef)) {
                        throw new Error('Not applicable');
                    }

                    unitRef.guide = unitRef.guide || {};
                    var guide = unitRef.guide;

                    var p = guide.padding || { l: 0, r: 0, t: 0, b: 0 };

                    ttl.l += p.l;
                    ttl.r += p.r;
                    ttl.t += p.t;
                    ttl.b += p.b;

                    seq.push({
                        l: ttl.l,
                        r: ttl.r,
                        t: ttl.t,
                        b: ttl.b
                    });

                    var units = unitRef.units || [];
                    var rects = units.map(function (x) {

                        if (!(isCoordsRect(x) || isElement(x))) {
                            throw new Error('Not applicable');
                        }

                        return x;
                    }).filter(isCoordsRect);

                    return rects.length === 1;
                };

                var pad = function pad(x) {
                    return x ? 10 : 0;
                };
                var exitIterator = function exitIterator(unitRef) {

                    var lvl = seq.pop();

                    var guide = unitRef.guide || {};
                    guide.x = guide.x || {};
                    guide.x.padding = guide.x.padding || 0;
                    guide.y = guide.y || {};
                    guide.y.padding = guide.y.padding || 0;

                    guide.padding = {
                        l: pad(unitRef.y),
                        r: pad(1),
                        t: pad(1),
                        b: pad(unitRef.x)
                    };

                    guide.autoLayout = 'extract-axes';

                    guide.x.padding += ttl.b - lvl.b;
                    guide.y.padding += ttl.l - lvl.l;
                };

                _utilsUtils.utils.traverseSpec(spec.unit, enterIterator, exitIterator);

                spec.unit.guide.padding = ttl;
                spec.unit.guide.autoLayout = '';
            }
        }]);

        return SpecTransformExtractAxes;
    })();

    exports.SpecTransformExtractAxes = SpecTransformExtractAxes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zcGVjLXRyYW5zZm9ybS1leHRyYWN0LWF4ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2Esd0JBQXdCO0FBRXRCLGlCQUZGLHdCQUF3QixDQUVyQixJQUFJLEVBQUU7a0NBRlQsd0JBQXdCOztBQUc3QixnQkFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsQUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksS0FBSyxTQUFTLElBQUssWUFObEUsS0FBSyxDQU1tRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0c7O3FCQUxRLHdCQUF3Qjs7bUJBT3hCLHFCQUFHOztBQUVSLG9CQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUV4QixvQkFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDcEIsMkJBQU8sT0FBTyxDQUFDO2lCQUNsQjs7QUFFRCxvQkFBSTtBQUNBLHdCQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNqQyxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ1Qsd0JBQUksRUFBRSxDQUFDLE9BQU8sS0FBSyxnQkFBZ0IsRUFBRTtBQUNqQywrQkFBTyxDQUFDLEdBQUcsdUVBQXNFLE9BQU8sQ0FBQyxDQUFDO3FCQUM3RixNQUFNO0FBQ0gsOEJBQU0sRUFBRSxDQUFDO3FCQUNaO2lCQUNKOztBQUVELHVCQUFPLE9BQU8sQ0FBQzthQUNsQjs7O21CQUVjLHlCQUFDLElBQUksRUFBRTs7QUFFbEIsb0JBQUksWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFJLE9BQU8sRUFBSztBQUM1QiwyQkFBUSxPQUFPLENBQUMsSUFBSSxLQUFLLGFBQWEsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBRTtpQkFDdEUsQ0FBQzs7QUFFRixvQkFBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUks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QUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDOztBQUV2Qyx5QkFBSyxDQUFDLE9BQU8sR0FBRztBQUNaLHlCQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDakIseUJBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ1QseUJBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ1QseUJBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztxQkFDcEIsQ0FBQzs7QUFFRix5QkFBSyxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUM7O0FBRWxDLHlCQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEFBQUMsQ0FBQztBQUNuQyx5QkFBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxBQUFDLENBQUM7aUJBQ3RDLENBQUM7O0FBRUYsNEJBeEdBLEtBQUssQ0F3R0MsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQUUzRCxvQkFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztBQUM5QixvQkFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQzthQUNuQzs7O2VBMUdRLHdCQUF3QiIsImZpbGUiOiJzcmMvc3BlYy10cmFuc2Zvcm0tZXh0cmFjdC1heGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtkZWZhdWx0IGFzIF99IGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IHt1dGlsc30gZnJvbSAnLi91dGlscy91dGlscyc7XG5cbmV4cG9ydCBjbGFzcyBTcGVjVHJhbnNmb3JtRXh0cmFjdEF4ZXMge1xuXG4gICAgY29uc3RydWN0b3Ioc3BlYykge1xuICAgICAgICB0aGlzLnNwZWMgPSBzcGVjO1xuICAgICAgICB0aGlzLmlzQXBwbGljYWJsZSA9IChzcGVjLnNldHRpbmdzLmxheW91dEVuZ2luZSA9PT0gJ0VYVFJBQ1QnKSAmJiB1dGlscy5pc1NwZWNSZWN0Q29vcmRzT25seShzcGVjLnVuaXQpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybSgpIHtcblxuICAgICAgICB2YXIgcmVmU3BlYyA9IHRoaXMuc3BlYztcblxuICAgICAgICBpZiAoIXRoaXMuaXNBcHBsaWNhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVmU3BlYztcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnJ1bGVFeHRyYWN0QXhlcyhyZWZTcGVjKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGlmIChleC5tZXNzYWdlID09PSAnTm90IGFwcGxpY2FibGUnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtUYXVDaGFydHNdOiBjYW4ndCBleHRyYWN0IGF4ZXMgZm9yIHRoZSBnaXZlbiBjaGFydCBzcGVjaWZpY2F0aW9uYCwgcmVmU3BlYyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlZlNwZWM7XG4gICAgfVxuXG4gICAgcnVsZUV4dHJhY3RBeGVzKHNwZWMpIHtcblxuICAgICAgICB2YXIgaXNDb29yZHNSZWN0ID0gKHVuaXRSZWYpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAodW5pdFJlZi50eXBlID09PSAnQ09PUkRTLlJFQ1QnIHx8IHVuaXRSZWYudHlwZSA9PT0gJ1JFQ1QnKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaXNFbGVtZW50ID0gKHVuaXRSZWYpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAodW5pdFJlZi50eXBlLmluZGV4T2YoJ0VMRU1FTlQuJykgPT09IDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0dGwgPSB7bDowLCByOjEwLCB0OjEwLCBiOjB9O1xuICAgICAgICB2YXIgc2VxID0gW107XG4gICAgICAgIHZhciBlbnRlckl0ZXJhdG9yID0gKHVuaXRSZWYsIGxldmVsKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICgobGV2ZWwgPiAxKSB8fCAhaXNDb29yZHNSZWN0KHVuaXRSZWYpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYXBwbGljYWJsZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB1bml0UmVmLmd1aWRlID0gdW5pdFJlZi5ndWlkZSB8fCB7fTtcbiAgICAgICAgICAgIHZhciBndWlkZSA9IHVuaXRSZWYuZ3VpZGU7XG5cbiAgICAgICAgICAgIHZhciBwID0gZ3VpZGUucGFkZGluZyB8fCB7bDowLCByOjAsIHQ6MCwgYjowfTtcblxuICAgICAgICAgICAgdHRsLmwgKz0gcC5sO1xuICAgICAgICAgICAgdHRsLnIgKz0gcC5yO1xuICAgICAgICAgICAgdHRsLnQgKz0gcC50O1xuICAgICAgICAgICAgdHRsLmIgKz0gcC5iO1xuXG4gICAgICAgICAgICBzZXEucHVzaCh7XG4gICAgICAgICAgICAgICAgbDogdHRsLmwsXG4gICAgICAgICAgICAgICAgcjogdHRsLnIsXG4gICAgICAgICAgICAgICAgdDogdHRsLnQsXG4gICAgICAgICAgICAgICAgYjogdHRsLmJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdW5pdHMgPSB1bml0UmVmLnVuaXRzIHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJlY3RzID0gdW5pdHNcbiAgICAgICAgICAgICAgICAubWFwKCh4KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoaXNDb29yZHNSZWN0KHgpIHx8IGlzRWxlbWVudCh4KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGFwcGxpY2FibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihpc0Nvb3Jkc1JlY3QpO1xuXG4gICAgICAgICAgICByZXR1cm4gKHJlY3RzLmxlbmd0aCA9PT0gMSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHBhZCA9ICh4KSA9PiAoeCA/IDEwIDogMCk7XG4gICAgICAgIHZhciBleGl0SXRlcmF0b3IgPSAodW5pdFJlZikgPT4ge1xuXG4gICAgICAgICAgICB2YXIgbHZsID0gc2VxLnBvcCgpO1xuXG4gICAgICAgICAgICB2YXIgZ3VpZGUgPSB1bml0UmVmLmd1aWRlIHx8IHt9O1xuICAgICAgICAgICAgZ3VpZGUueCA9IGd1aWRlLnggfHwge307XG4gICAgICAgICAgICBndWlkZS54LnBhZGRpbmcgPSBndWlkZS54LnBhZGRpbmcgfHwgMDtcbiAgICAgICAgICAgIGd1aWRlLnkgPSBndWlkZS55IHx8IHt9O1xuICAgICAgICAgICAgZ3VpZGUueS5wYWRkaW5nID0gZ3VpZGUueS5wYWRkaW5nIHx8IDA7XG5cbiAgICAgICAgICAgIGd1aWRlLnBhZGRpbmcgPSB7XG4gICAgICAgICAgICAgICAgbDogcGFkKHVuaXRSZWYueSksXG4gICAgICAgICAgICAgICAgcjogcGFkKDEpLFxuICAgICAgICAgICAgICAgIHQ6IHBhZCgxKSxcbiAgICAgICAgICAgICAgICBiOiBwYWQodW5pdFJlZi54KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZ3VpZGUuYXV0b0xheW91dCA9ICdleHRyYWN0LWF4ZXMnO1xuXG4gICAgICAgICAgICBndWlkZS54LnBhZGRpbmcgKz0gKHR0bC5iIC0gbHZsLmIpO1xuICAgICAgICAgICAgZ3VpZGUueS5wYWRkaW5nICs9ICh0dGwubCAtIGx2bC5sKTtcbiAgICAgICAgfTtcblxuICAgICAgICB1dGlscy50cmF2ZXJzZVNwZWMoc3BlYy51bml0LCBlbnRlckl0ZXJhdG9yLCBleGl0SXRlcmF0b3IpO1xuXG4gICAgICAgIHNwZWMudW5pdC5ndWlkZS5wYWRkaW5nID0gdHRsO1xuICAgICAgICBzcGVjLnVuaXQuZ3VpZGUuYXV0b0xheW91dCA9ICcnO1xuICAgIH1cbn0iXX0=;
define('charts/tau.plot',['exports', '../api/balloon', '../event', '../plugins', '../utils/utils', '../utils/utils-dom', '../data-frame', '../const', '../units-registry', '../scales-registry', '../scales-factory', '../data-processor', '../utils/layuot-template', '../spec-converter', '../spec-transform-auto-layout', '../spec-transform-calc-size', '../spec-transform-apply-ratio', '../spec-transform-extract-axes', './tau.gpl'], function (exports, _apiBalloon, _event, _plugins, _utilsUtils, _utilsUtilsDom, _dataFrame, _const, _unitsRegistry, _scalesRegistry, _scalesFactory, _dataProcessor, _utilsLayuotTemplate, _specConverter, _specTransformAutoLayout, _specTransformCalcSize, _specTransformApplyRatio, _specTransformExtractAxes, _tauGpl) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x8, _x9, _x10) { var _again = true; _function: while (_again) { var object = _x8, property = _x9, receiver = _x10; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x8 = parent; _x9 = property; _x10 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Plot = (function (_Emitter) {
        _inherits(Plot, _Emitter);

        function Plot(config) {
            _classCallCheck(this, Plot);

            _get(Object.getPrototypeOf(Plot.prototype), 'constructor', this).call(this);
            this._nodes = [];
            this._svg = null;
            this._filtersStore = {
                filters: {},
                tick: 0
            };
            this._layout = (0, _utilsLayuotTemplate.getLayout)();

            if (['sources', 'scales'].filter(function (p) {
                return config.hasOwnProperty(p);
            }).length === 2) {
                this.config = config;
                this.configGPL = config;
            } else {
                this.config = this.setupConfig(config);
                this.configGPL = new _specConverter.SpecConverter(this.config).convert();
            }

            this.configGPL = Plot.setupPeriodData(this.configGPL);

            this.config.plugins = this.config.plugins || [];

            this.configGPL.settings = Plot.setupSettings(this.configGPL.settings);

            this.transformers = [_specTransformApplyRatio.SpecTransformApplyRatio, _specTransformAutoLayout.SpecTransformAutoLayout];

            this.onUnitsStructureExpandedTransformers = [_specTransformCalcSize.SpecTransformCalcSize, _specTransformExtractAxes.SpecTransformExtractAxes];

            this._originData = _.clone(this.configGPL.sources);
            this._liveSpec = this.configGPL;
            this._plugins = new _plugins.Plugins(this.config.plugins, this);
        }

        _createClass(Plot, [{
            key: 'setupConfig',
            value: function setupConfig(config) {

                if (!config.spec || !config.spec.unit) {
                    throw new Error('Provide spec for plot');
                }

                this.config = _.defaults(config, {
                    spec: {},
                    data: [],
                    plugins: [],
                    settings: {}
                });
                this._emptyContainer = config.emptyContainer || '';
                // TODO: remove this particular config cases
                this.config.settings.specEngine = config.specEngine || config.settings.specEngine;
                this.config.settings.layoutEngine = config.layoutEngine || config.settings.layoutEngine;
                this.config.settings = Plot.setupSettings(this.config.settings);

                this.config.spec.dimensions = Plot.setupMetaInfo(this.config.spec.dimensions, this.config.data);

                var log = this.config.settings.log;
                if (this.config.settings.excludeNull) {
                    this.addFilter({
                        tag: 'default',
                        src: '/',
                        predicate: _dataProcessor.DataProcessor.excludeNullValues(this.config.spec.dimensions, function (item) {
                            return log([item, 'point was excluded, because it has undefined values.'], 'WARN');
                        })
                    });
                }

                return this.config;
            }

            // fixme after all migrate
        }, {
            key: 'getConfig',
            value: function getConfig(isOld) {
                // this.configGPL
                return isOld ? this.config : this.configGPL || this.config;
            }
        }, {
            key: 'insertToRightSidebar',
            value: function insertToRightSidebar(el) {
                return _utilsUtilsDom.utilsDom.appendTo(el, this._layout.rightSidebar);
            }
        }, {
            key: 'insertToHeader',
            value: function insertToHeader(el) {
                return _utilsUtilsDom.utilsDom.appendTo(el, this._layout.header);
            }
        }, {
            key: 'addBalloon',
            value: function addBalloon(conf) {
                return new _apiBalloon.Tooltip('', conf || {});
            }
        }, {
            key: 'renderTo',
            value: function renderTo(target, xSize) {
                var _this = this;

                this._svg = null;
                this._target = target;
                this._defaultSize = _.clone(xSize);

                var targetNode = d3.select(target).node();
                if (targetNode === null) {
                    throw new Error('Target element not found');
                }

                targetNode.appendChild(this._layout.layout);

                var content = this._layout.content;
                var size = _.clone(xSize) || {};
                if (!size.width || !size.height) {
                    content.style.display = 'none';
                    size = _.defaults(size, _utilsUtilsDom.utilsDom.getContainerSize(content.parentNode));
                    content.style.display = '';
                    // TODO: fix this issue
                    if (!size.height) {
                        size.height = _utilsUtilsDom.utilsDom.getContainerSize(this._layout.layout).height;
                    }
                }

                this.configGPL.settings.size = size;

                this._liveSpec = _utilsUtils.utils.clone(_.omit(this.configGPL, 'plugins'));
                this._liveSpec.sources = this.getDataSources();
                this._liveSpec.settings = this.configGPL.settings;

                if (this.isEmptySources(this._liveSpec.sources)) {
                    content.innerHTML = this._emptyContainer;
                    return;
                }

                this._liveSpec = this.transformers.reduce(function (memo, TransformClass) {
                    return new TransformClass(memo).transform(_this);
                }, this._liveSpec);

                this._nodes = [];

                this._liveSpec.onUnitDraw = function (unitNode) {
                    _this._nodes.push(unitNode);
                    _this.fire('unitdraw', unitNode);
                    ['click', 'mouseover', 'mouseout'].forEach(function (eventName) {
                        return unitNode.on(eventName, function (sender, e) {
                            _this.fire('element' + eventName, {
                                element: sender,
                                data: e.data,
                                event: e.event
                            });
                        });
                    });
                };

                this._liveSpec.onUnitsStructureExpanded = function (specRef) {
                    _this.onUnitsStructureExpandedTransformers.forEach(function (TClass) {
                        return new TClass(specRef).transform(_this);
                    });
                    _this.fire(['units', 'structure', 'expanded'].join(''), specRef);
                };

                this.fire('specready', this._liveSpec);

                new _tauGpl.GPL(this._liveSpec, this.getScaleFactory(), _unitsRegistry.unitsRegistry).renderTo(content, this._liveSpec.settings.size);

                var svgXElement = d3.select(content).select('svg');

                this._svg = svgXElement.node();
                this._layout.rightSidebar.style.maxHeight = this._liveSpec.settings.size.height + 'px';
                this.fire('render', this._svg);
            }
        }, {
            key: 'getScaleFactory',
            value: function getScaleFactory() {
                var dataSources = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

                return new _scalesFactory.ScalesFactory(_scalesRegistry.scalesRegistry, dataSources || this._liveSpec.sources, this._liveSpec.scales);
            }
        }, {
            key: 'getScaleInfo',
            value: function getScaleInfo(name) {
                var dataFrame = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

                return this.getScaleFactory().createScaleInfoByName(name, dataFrame);
            }
        }, {
            key: 'getSourceFiltersIterator',
            value: function getSourceFiltersIterator(rejectFiltersPredicate) {

                var filters = _(this._filtersStore.filters).chain().values().flatten().reject(function (f) {
                    return rejectFiltersPredicate(f);
                }).pluck('predicate').value();

                return function (row) {
                    return filters.reduce(function (prev, f) {
                        return prev && f(row);
                    }, true);
                };
            }
        }, {
            key: 'getDataSources',
            value: function getDataSources() {
                var _this2 = this;

                var param = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var excludeFiltersByTagAndSource = function excludeFiltersByTagAndSource(k) {
                    return function (f) {
                        return _.contains(param.excludeFilter, f.tag) || f.src !== k;
                    };
                };

                return Object.keys(this._originData).filter(function (k) {
                    return k !== '?';
                }).reduce(function (memo, k) {
                    var item = _this2._originData[k];
                    var filterIterator = _this2.getSourceFiltersIterator(excludeFiltersByTagAndSource(k));
                    memo[k] = {
                        dims: item.dims,
                        data: item.data.filter(filterIterator)
                    };
                    return memo;
                }, {
                    '?': this._originData['?']
                });
            }
        }, {
            key: 'isEmptySources',
            value: function isEmptySources(sources) {

                return !Object.keys(sources).filter(function (k) {
                    return k !== '?';
                }).filter(function (k) {
                    return sources[k].data.length > 0;
                }).length;
            }
        }, {
            key: 'getData',
            value: function getData() {
                var param = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                var src = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

                var sources = this.getDataSources(param);
                return sources[src].data;
            }
        }, {
            key: 'setData',
            value: function setData(data) {
                var src = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

                this.config.data = data;
                this.configGPL.sources[src].data = data;
                this._originData = _.clone(this.configGPL.sources);
                this.refresh();
            }
        }, {
            key: 'getSVG',
            value: function getSVG() {
                return this._svg;
            }
        }, {
            key: 'addFilter',
            value: function addFilter(filter) {
                filter.src = filter.src || '/';
                var tag = filter.tag;
                var filters = this._filtersStore.filters[tag] = this._filtersStore.filters[tag] || [];
                var id = this._filtersStore.tick++;
                filter.id = id;
                filters.push(filter);
                return id;
            }
        }, {
            key: 'removeFilter',
            value: function removeFilter(id) {
                var _this3 = this;

                _.each(this._filtersStore.filters, function (filters, key) {
                    _this3._filtersStore.filters[key] = _.reject(filters, function (item) {
                        return item.id === id;
                    });
                });
                return this;
            }
        }, {
            key: 'refresh',
            value: function refresh() {
                if (this._target) {
                    this.renderTo(this._target, this._defaultSize);
                }
            }
        }, {
            key: 'resize',
            value: function resize() {
                var sizes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                this.renderTo(this._target, sizes);
            }
        }, {
            key: 'select',
            value: function select(queryFilter) {
                return this._nodes.filter(queryFilter);
            }
        }, {
            key: 'traverseSpec',
            value: function traverseSpec(spec, iterator) {

                var traverse = function traverse(node, iterator, parentNode) {
                    iterator(node, parentNode);
                    (node.units || []).map(function (x) {
                        return traverse(x, iterator, node);
                    });
                };

                traverse(spec.unit, iterator, null);
            }

            // use from plugins to get the most actual chart config
        }, {
            key: 'getSpec',
            value: function getSpec() {
                return this._liveSpec;
            }
        }], [{
            key: 'setupPeriodData',
            value: function setupPeriodData(spec) {
                var tickPeriod = Plot.__api__.tickPeriod;
                var dims = Object.keys(spec.scales).map(function (s) {
                    return spec.scales[s];
                }).filter(function (s) {
                    return s.type === 'period';
                }).map(function (s) {
                    return { source: s.source, dim: s.dim, period: s.period };
                });

                var isNullOrUndefined = function isNullOrUndefined(x) {
                    return x === null || typeof x === 'undefined';
                };

                var reducer = function reducer(refSources, d) {
                    refSources[d.source].data = refSources[d.source].data.map(function (row) {
                        var val = row[d.dim];
                        if (!isNullOrUndefined(val) && d.period) {
                            row[d.dim] = tickPeriod.get(d.period).cast(val);
                        }
                        return row;
                    });

                    return refSources;
                };

                spec.sources = dims.reduce(reducer, spec.sources);

                return spec;
            }
        }, {
            key: 'setupMetaInfo',
            value: function setupMetaInfo(dims, data) {
                var meta = dims ? dims : _dataProcessor.DataProcessor.autoDetectDimTypes(data);
                return _dataProcessor.DataProcessor.autoAssignScales(meta);
            }
        }, {
            key: 'setupSettings',
            value: function setupSettings(configSettings) {
                var globalSettings = Plot.globalSettings;
                var localSettings = {};
                Object.keys(globalSettings).forEach(function (k) {
                    localSettings[k] = _.isFunction(globalSettings[k]) ? globalSettings[k] : _utilsUtils.utils.clone(globalSettings[k]);
                });

                var r = _.defaults(configSettings || {}, localSettings);

                if (!_utilsUtils.utils.isArray(r.specEngine)) {
                    r.specEngine = [{ width: Number.MAX_VALUE, name: r.specEngine }];
                }

                return r;
            }
        }]);

        return Plot;
    })(_event.Emitter);

    exports.Plot = Plot;
});
define('chart-alias-registry',['exports', 'd3', './utils/utils', './data-processor', './error'], function (exports, _d3, _utilsUtils, _dataProcessor, _error) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _d32 = _interopRequireDefault(_d3);

    var chartTypes = {};
    var chartRules = {};

    var throwNotSupported = function throwNotSupported(alias) {
        var msg = 'Chart type ' + alias + ' is not supported.';
        console.log(msg);
        console.log('Use one of ' + _.keys(chartTypes).join(', ') + '.');
        throw new _error.TauChartError(msg, _error.errorCodes.NOT_SUPPORTED_TYPE_CHART);
    };

    var chartTypesRegistry = {

        validate: function validate(alias, config) {

            if (!chartRules.hasOwnProperty(alias)) {
                throwNotSupported(alias);
            }

            return chartRules[alias].reduce(function (e, rule) {
                return e.concat(rule(config) || []);
            }, []);
        },

        get: function get(alias) {

            var chartFactory = chartTypes[alias];

            if (!_.isFunction(chartFactory)) {
                throwNotSupported(alias);
            }

            return chartFactory;
        },

        add: function add(alias, converter) {
            var rules = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

            chartTypes[alias] = converter;
            chartRules[alias] = rules;
            return this;
        },
        getAllRegisteredTypes: function getAllRegisteredTypes() {
            return chartTypes;
        }
    };

    exports.chartTypesRegistry = chartTypesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jaGFydC1hbGlhcy1yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUlBLFFBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNwQixRQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLFFBQUksaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQUksS0FBSyxFQUFLO0FBQy9CLFlBQUksR0FBRyxtQkFBaUIsS0FBSyx1QkFBb0IsQ0FBQztBQUNsRCxlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLGVBQU8sQ0FBQyxHQUFHLGlCQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFJLENBQUM7QUFDNUQsY0FBTSxXQVJGLGFBQWEsQ0FRRCxHQUFHLEVBQUUsT0FSTyxVQUFVLENBUU4sd0JBQXdCLENBQUMsQ0FBQztLQUM3RCxDQUFDOztBQUVGLFFBQUksa0JBQWtCLEdBQUc7O0FBRXJCLGdCQUFRLEVBQUMsa0JBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTs7QUFFckIsZ0JBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ25DLGlDQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCOztBQUVELG1CQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsSUFBSTt1QkFBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7YUFBQSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ2xGOztBQUVELFdBQUcsRUFBQyxhQUFDLEtBQUssRUFBRTs7QUFFUixnQkFBSSxZQUFZLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVyQyxnQkFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDN0IsaUNBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDNUI7O0FBRUQsbUJBQU8sWUFBWSxDQUFDO1NBQ3ZCOztBQUVELFdBQUcsRUFBQyxhQUFDLEtBQUssRUFBRSxTQUFTLEVBQWM7Z0JBQVosS0FBSyx5REFBRyxFQUFFOztBQUM3QixzQkFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUM5QixzQkFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUMxQixtQkFBTyxJQUFJLENBQUM7U0FDZjtBQUNELDZCQUFxQixFQUFFLGlDQUFZO0FBQy9CLG1CQUFPLFVBQVUsQ0FBQztTQUNyQjtLQUNKLENBQUM7O1lBRU0sa0JBQWtCLEdBQWxCLGtCQUFrQiIsImZpbGUiOiJzcmMvY2hhcnQtYWxpYXMtcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RlZmF1bHQgYXMgZDN9IGZyb20gJ2QzJztcbmltcG9ydCB7dXRpbHN9IGZyb20gJy4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHtEYXRhUHJvY2Vzc29yfSBmcm9tICcuL2RhdGEtcHJvY2Vzc29yJztcbmltcG9ydCB7VGF1Q2hhcnRFcnJvciBhcyBFcnJvciwgZXJyb3JDb2Rlc30gZnJvbSAnLi9lcnJvcic7XG52YXIgY2hhcnRUeXBlcyA9IHt9O1xudmFyIGNoYXJ0UnVsZXMgPSB7fTtcblxudmFyIHRocm93Tm90U3VwcG9ydGVkID0gKGFsaWFzKSA9PiB7XG4gICAgbGV0IG1zZyA9IGBDaGFydCB0eXBlICR7YWxpYXN9IGlzIG5vdCBzdXBwb3J0ZWQuYDtcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgIGNvbnNvbGUubG9nKGBVc2Ugb25lIG9mICR7Xy5rZXlzKGNoYXJ0VHlwZXMpLmpvaW4oJywgJyl9LmApO1xuICAgIHRocm93IG5ldyBFcnJvcihtc2csIGVycm9yQ29kZXMuTk9UX1NVUFBPUlRFRF9UWVBFX0NIQVJUKTtcbn07XG5cbnZhciBjaGFydFR5cGVzUmVnaXN0cnkgPSB7XG5cbiAgICB2YWxpZGF0ZSAoYWxpYXMsIGNvbmZpZykge1xuXG4gICAgICAgIGlmICghY2hhcnRSdWxlcy5oYXNPd25Qcm9wZXJ0eShhbGlhcykpIHtcbiAgICAgICAgICAgIHRocm93Tm90U3VwcG9ydGVkKGFsaWFzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGFydFJ1bGVzW2FsaWFzXS5yZWR1Y2UoKGUsIHJ1bGUpID0+IGUuY29uY2F0KHJ1bGUoY29uZmlnKSB8fCBbXSksIFtdKTtcbiAgICB9LFxuXG4gICAgZ2V0IChhbGlhcykge1xuXG4gICAgICAgIHZhciBjaGFydEZhY3RvcnkgPSBjaGFydFR5cGVzW2FsaWFzXTtcblxuICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihjaGFydEZhY3RvcnkpKSB7XG4gICAgICAgICAgICB0aHJvd05vdFN1cHBvcnRlZChhbGlhcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hhcnRGYWN0b3J5O1xuICAgIH0sXG5cbiAgICBhZGQgKGFsaWFzLCBjb252ZXJ0ZXIsIHJ1bGVzID0gW10pIHtcbiAgICAgICAgY2hhcnRUeXBlc1thbGlhc10gPSBjb252ZXJ0ZXI7XG4gICAgICAgIGNoYXJ0UnVsZXNbYWxpYXNdID0gcnVsZXM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZ2V0QWxsUmVnaXN0ZXJlZFR5cGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjaGFydFR5cGVzO1xuICAgIH1cbn07XG5cbmV4cG9ydCB7Y2hhcnRUeXBlc1JlZ2lzdHJ5fTtcbiJdfQ==;
define('charts/tau.chart',['exports', './tau.plot', '../chart-alias-registry'], function (exports, _tauPlot, _chartAliasRegistry) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Chart = (function (_Plot) {
        _inherits(Chart, _Plot);

        function Chart(config) {
            _classCallCheck(this, Chart);

            var errors = _chartAliasRegistry.chartTypesRegistry.validate(config.type, config);

            if (errors.length > 0) {
                throw new Error(errors[0]);
            }

            var chartFactory = _chartAliasRegistry.chartTypesRegistry.get(config.type);

            config = _.defaults(config, { autoResize: true });
            config.settings = _tauPlot.Plot.setupSettings(config.settings);
            config.dimensions = _tauPlot.Plot.setupMetaInfo(config.dimensions, config.data);

            _get(Object.getPrototypeOf(Chart.prototype), 'constructor', this).call(this, chartFactory(config));

            if (config.autoResize) {
                Chart.winAware.push(this);
            }
        }

        _createClass(Chart, [{
            key: 'destroy',
            value: function destroy() {
                var index = Chart.winAware.indexOf(this);
                if (index !== -1) {
                    Chart.winAware.splice(index, 1);
                }
                _get(Object.getPrototypeOf(Chart.prototype), 'destroy', this).call(this);
            }
        }]);

        return Chart;
    })(_tauPlot.Plot);

    Chart.resizeOnWindowEvent = (function () {

        var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
            return setTimeout(fn, 17);
        };
        var rIndex;

        function requestReposition() {
            if (rIndex || !Chart.winAware.length) {
                return;
            }
            rIndex = rAF(resize);
        }

        function resize() {
            rIndex = 0;
            var chart;
            for (var i = 0, l = Chart.winAware.length; i < l; i++) {
                chart = Chart.winAware[i];
                chart.resize();
            }
        }

        return requestReposition;
    })();
    Chart.winAware = [];
    window.addEventListener('resize', Chart.resizeOnWindowEvent);
    exports.Chart = Chart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jaGFydHMvdGF1LmNoYXJ0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztRQUdNLEtBQUs7a0JBQUwsS0FBSzs7QUFFSSxpQkFGVCxLQUFLLENBRUssTUFBTSxFQUFFO2tDQUZsQixLQUFLOztBQUlILGdCQUFJLE1BQU0sR0FBRyxvQkFOYixrQkFBa0IsQ0FNYyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFOUQsZ0JBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDbkIsc0JBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDOUI7O0FBRUQsZ0JBQUksWUFBWSxHQUFHLG9CQVpuQixrQkFBa0IsQ0FZb0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdkQsa0JBQU0sR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ2hELGtCQUFNLENBQUMsUUFBUSxHQUFHLFNBaEJsQixJQUFJLENBZ0JtQixhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3RELGtCQUFNLENBQUMsVUFBVSxHQUFHLFNBakJwQixJQUFJLENBaUJxQixhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXZFLHVDQWhCRixLQUFLLDZDQWdCRyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7O0FBRTVCLGdCQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7QUFDbkIscUJBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7O3FCQXJCQyxLQUFLOzttQkF1QkEsbUJBQUc7QUFDTixvQkFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsb0JBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2QseUJBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDbkM7QUFDRCwyQ0E1QkYsS0FBSyx5Q0E0QmE7YUFDbkI7OztlQTdCQyxLQUFLO2dCQUhILElBQUk7O0FBbUNaLFNBQUssQ0FBQyxtQkFBbUIsR0FBSSxDQUFBLFlBQVk7O0FBRXJDLFlBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxNQUFNLENBQUMsMkJBQTJCLElBQUksVUFBVSxFQUFFLEVBQUU7QUFDdEYsbUJBQU8sVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM3QixDQUFDO0FBQ04sWUFBSSxNQUFNLENBQUM7O0FBRVgsaUJBQVMsaUJBQWlCLEdBQUc7QUFDekIsZ0JBQUksTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDbEMsdUJBQU87YUFDVjtBQUNELGtCQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3hCOztBQUVELGlCQUFTLE1BQU0sR0FBRztBQUNkLGtCQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsZ0JBQUksS0FBSyxDQUFDO0FBQ1YsaUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25ELHFCQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixxQkFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2xCO1NBQ0o7O0FBRUQsZUFBTyxpQkFBaUIsQ0FBQztLQUM1QixDQUFBLEVBQUUsQUFBQyxDQUFDO0FBQ0wsU0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDcEIsVUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNyRCxLQUFLLEdBQUwsS0FBSyIsImZpbGUiOiJzcmMvY2hhcnRzL3RhdS5jaGFydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGxvdH0gZnJvbSAnLi90YXUucGxvdCc7XG5pbXBvcnQge2NoYXJ0VHlwZXNSZWdpc3RyeX0gZnJvbSAnLi4vY2hhcnQtYWxpYXMtcmVnaXN0cnknO1xuXG5jbGFzcyBDaGFydCBleHRlbmRzIFBsb3Qge1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnKSB7XG5cbiAgICAgICAgdmFyIGVycm9ycyA9IGNoYXJ0VHlwZXNSZWdpc3RyeS52YWxpZGF0ZShjb25maWcudHlwZSwgY29uZmlnKTtcblxuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcnNbMF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoYXJ0RmFjdG9yeSA9IGNoYXJ0VHlwZXNSZWdpc3RyeS5nZXQoY29uZmlnLnR5cGUpO1xuXG4gICAgICAgIGNvbmZpZyA9IF8uZGVmYXVsdHMoY29uZmlnLCB7YXV0b1Jlc2l6ZTogdHJ1ZX0pO1xuICAgICAgICBjb25maWcuc2V0dGluZ3MgPSBQbG90LnNldHVwU2V0dGluZ3MoY29uZmlnLnNldHRpbmdzKTtcbiAgICAgICAgY29uZmlnLmRpbWVuc2lvbnMgPSBQbG90LnNldHVwTWV0YUluZm8oY29uZmlnLmRpbWVuc2lvbnMsIGNvbmZpZy5kYXRhKTtcblxuICAgICAgICBzdXBlcihjaGFydEZhY3RvcnkoY29uZmlnKSk7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5hdXRvUmVzaXplKSB7XG4gICAgICAgICAgICBDaGFydC53aW5Bd2FyZS5wdXNoKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gQ2hhcnQud2luQXdhcmUuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgQ2hhcnQud2luQXdhcmUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgfVxufVxuXG5DaGFydC5yZXNpemVPbldpbmRvd0V2ZW50ID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciByQUYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmbiwgMTcpO1xuICAgICAgICB9O1xuICAgIHZhciBySW5kZXg7XG5cbiAgICBmdW5jdGlvbiByZXF1ZXN0UmVwb3NpdGlvbigpIHtcbiAgICAgICAgaWYgKHJJbmRleCB8fCAhQ2hhcnQud2luQXdhcmUubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgckluZGV4ID0gckFGKHJlc2l6ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzaXplKCkge1xuICAgICAgICBySW5kZXggPSAwO1xuICAgICAgICB2YXIgY2hhcnQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gQ2hhcnQud2luQXdhcmUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBjaGFydCA9IENoYXJ0LndpbkF3YXJlW2ldO1xuICAgICAgICAgICAgY2hhcnQucmVzaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWVzdFJlcG9zaXRpb247XG59KCkpO1xuQ2hhcnQud2luQXdhcmUgPSBbXTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBDaGFydC5yZXNpemVPbldpbmRvd0V2ZW50KTtcbmV4cG9ydCB7Q2hhcnR9O1xuIl19;
define('utils/d3-decorators',['exports', '../utils/utils-draw', 'underscore', 'd3'], function (exports, _utilsUtilsDraw, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    var d3getComputedTextLength = _2['default'].memoize(function (d3Text) {
        return d3Text.node().getComputedTextLength();
    }, function (d3Text) {
        return d3Text.node().textContent.length;
    });

    var cutText = function cutText(textString, widthLimit, getComputedTextLength) {

        getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

        textString.each(function () {
            var textD3 = _d32['default'].select(this);
            var tokens = textD3.text().split(/\s+/);

            var stop = false;
            var parts = tokens.reduce(function (memo, t, i) {

                if (stop) {
                    return memo;
                }

                var text = i > 0 ? [memo, t].join(' ') : t;
                var len = getComputedTextLength(textD3.text(text));
                if (len < widthLimit) {
                    memo = text;
                } else {
                    var available = Math.floor(widthLimit / len * text.length);
                    memo = text.substr(0, available - 4) + '...';
                    stop = true;
                }

                return memo;
            }, '');

            textD3.text(parts);
        });
    };

    var wrapText = function wrapText(textNode, widthLimit, linesLimit, tickLabelFontHeight, isY, getComputedTextLength) {

        getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

        var addLine = function addLine(targetD3, text, lineHeight, x, y, dy, lineNumber) {
            var dyNew = lineNumber * lineHeight + dy;
            return targetD3.append('tspan').attr('x', x).attr('y', y).attr('dy', dyNew + 'em').text(text);
        };

        textNode.each(function () {
            var textD3 = _d32['default'].select(this),
                tokens = textD3.text().split(/\s+/),
                lineHeight = 1.1,
                // ems
            x = textD3.attr('x'),
                y = textD3.attr('y'),
                dy = parseFloat(textD3.attr('dy'));

            textD3.text(null);
            var tempSpan = addLine(textD3, null, lineHeight, x, y, dy, 0);

            var stopReduce = false;
            var tokensCount = tokens.length - 1;
            var lines = tokens.reduce(function (memo, next, i) {

                if (stopReduce) {
                    return memo;
                }

                var isLimit = memo.length === linesLimit || i === tokensCount;
                var last = memo[memo.length - 1];
                var text = last !== '' ? last + ' ' + next : next;
                var tLen = getComputedTextLength(tempSpan.text(text));
                var over = tLen > widthLimit;

                if (over && isLimit) {
                    var available = Math.floor(widthLimit / tLen * text.length);
                    memo[memo.length - 1] = text.substr(0, available - 4) + '...';
                    stopReduce = true;
                }

                if (over && !isLimit) {
                    memo.push(next);
                }

                if (!over) {
                    memo[memo.length - 1] = text;
                }

                return memo;
            }, ['']).filter(function (l) {
                return l.length > 0;
            });

            y = isY ? -1 * (lines.length - 1) * Math.floor(tickLabelFontHeight * 0.5) : y;
            lines.forEach(function (text, i) {
                return addLine(textD3, text, lineHeight, x, y, dy, i);
            });

            tempSpan.remove();
        });
    };

    var d3_decorator_prettify_categorical_axis_ticks = function d3_decorator_prettify_categorical_axis_ticks(nodeAxis, logicalScale, isHorizontal) {

        if (nodeAxis.selectAll('.tick line').empty()) {
            return;
        }

        nodeAxis.selectAll('.tick')[0].forEach(function (node) {

            var tickNode = _d32['default'].select(node);
            var tickData = tickNode.data()[0];

            var coord = logicalScale(tickData);
            var tx = isHorizontal ? coord : 0;
            var ty = isHorizontal ? 0 : coord;
            tickNode.attr('transform', 'translate(' + tx + ',' + ty + ')');

            var offset = logicalScale.stepSize(tickData) * 0.5;
            var key = isHorizontal ? 'x' : 'y';
            var val = isHorizontal ? offset : -offset;
            tickNode.select('line').attr(key + '1', val).attr(key + '2', val);
        });
    };

    var d3_decorator_fix_horizontal_axis_ticks_overflow = function d3_decorator_fix_horizontal_axis_ticks_overflow(axisNode) {

        var timeTicks = axisNode.selectAll('.tick')[0];
        if (timeTicks.length < 2) {
            return;
        }

        var tick0 = parseFloat(timeTicks[0].attributes.transform.value.replace('translate(', ''));
        var tick1 = parseFloat(timeTicks[1].attributes.transform.value.replace('translate(', ''));

        var tickStep = tick1 - tick0;

        var maxTextLn = 0;
        var iMaxTexts = -1;
        var timeTexts = axisNode.selectAll('.tick text')[0];
        timeTexts.forEach(function (textNode, i) {
            var innerHTML = textNode.textContent || '';
            var textLength = innerHTML.length;
            if (textLength > maxTextLn) {
                maxTextLn = textLength;
                iMaxTexts = i;
            }
        });

        if (iMaxTexts >= 0) {
            var rect = timeTexts[iMaxTexts].getBoundingClientRect();
            // 2px from each side
            if (tickStep - rect.width < 8) {
                axisNode.classed({ 'graphical-report__d3-time-overflown': true });
            }
        }
    };

    var d3_decorator_fix_axis_bottom_line = function d3_decorator_fix_axis_bottom_line(axisNode, size, isContinuesScale) {

        var selection = axisNode.selectAll('.tick line');
        if (selection.empty()) {
            return;
        }

        var tickOffset = -1;

        if (isContinuesScale) {
            tickOffset = 0;
        } else {
            var sectorSize = size / selection[0].length;
            var offsetSize = sectorSize / 2;
            tickOffset = -offsetSize;
        }

        var tickGroupClone = axisNode.select('.tick').node().cloneNode(true);
        axisNode.append(function () {
            return tickGroupClone;
        }).attr('transform', _utilsUtilsDraw.utilsDraw.translate(0, size - tickOffset));
    };

    var d3_decorator_prettify_axis_label = function d3_decorator_prettify_axis_label(axisNode, guide, isHorizontal) {

        var koeff = isHorizontal ? 1 : -1;
        var labelTextNode = axisNode.append('text').attr('transform', _utilsUtilsDraw.utilsDraw.rotate(guide.rotate)).attr('class', guide.cssClass).attr('x', koeff * guide.size * 0.5).attr('y', koeff * guide.padding).style('text-anchor', guide.textAnchor);

        var delimiter = ' > ';
        var tags = guide.text.split(delimiter);
        var tLen = tags.length;
        tags.forEach(function (token, i) {

            labelTextNode.append('tspan').attr('class', 'label-token label-token-' + i).text(token);

            if (i < tLen - 1) {
                labelTextNode.append('tspan').attr('class', 'label-token-delimiter label-token-delimiter-' + i).text(delimiter);
            }
        });

        if (guide.dock === 'right') {
            var box = axisNode.selectAll('path.domain').node().getBBox();
            labelTextNode.attr('x', isHorizontal ? box.width : 0);
        } else if (guide.dock === 'left') {
            var box = axisNode.selectAll('path.domain').node().getBBox();
            labelTextNode.attr('x', isHorizontal ? 0 : -box.height);
        }
    };

    var d3_decorator_wrap_tick_label = function d3_decorator_wrap_tick_label(nodeScale, guide, isHorizontal) {

        var angle = guide.rotate;

        var ticks = nodeScale.selectAll('.tick text');
        ticks.attr('transform', _utilsUtilsDraw.utilsDraw.rotate(angle)).style('text-anchor', guide.textAnchor);

        if (angle === 90) {
            var dy = parseFloat(ticks.attr('dy')) / 2;
            ticks.attr('x', 9).attr('y', 0).attr('dy', dy + 'em');
        }

        if (guide.tickFormatWordWrap) {
            ticks.call(wrapText, guide.tickFormatWordWrapLimit, guide.tickFormatWordWrapLines, guide.$maxTickTextH, !isHorizontal);
        } else {
            ticks.call(cutText, guide.tickFormatWordWrapLimit);
        }
    };

    var d3_decorator_avoid_labels_collisions = function d3_decorator_avoid_labels_collisions(nodeScale, isHorizontal) {
        var textOffsetStep = 11;
        var refOffsetStart = isHorizontal ? -10 : 20;
        var translateParam = isHorizontal ? 0 : 1;
        var directionKoeff = isHorizontal ? 1 : -1;
        var layoutModel = [];
        nodeScale.selectAll('.tick').each(function (a, i) {
            var tick = _d32['default'].select(this);
            var text = tick.text();

            var translateXStr = tick.attr('transform').replace('translate(', '').replace(' ', ',') // IE specific
            .split(',')[translateParam];

            var translateX = directionKoeff * parseFloat(translateXStr);
            var tNode = tick.selectAll('text');

            var textWidth = tNode.node().getBBox().width;

            var halfText = textWidth / 2;
            var s = translateX - halfText;
            var e = translateX + halfText;
            layoutModel.push({ c: translateX, s: s, e: e, l: 0, textRef: tNode, tickRef: tick });
        });

        var iterateByTriples = function iterateByTriples(coll, iterator) {
            return coll.map(function (curr, i, list) {
                return iterator(list[i - 1] || { e: -Infinity, s: -Infinity, l: 0 }, curr, list[i + 1] || { e: Infinity, s: Infinity, l: 0 });
            });
        };

        var resolveCollide = function resolveCollide(prevLevel, prevCollide) {

            var rules = {
                '[T][1]': -1,
                '[T][-1]': 0,
                '[T][0]': 1,
                '[F][0]': -1
            };

            var k = '[' + prevCollide.toString().toUpperCase().charAt(0) + '][' + prevLevel + ']';

            return rules.hasOwnProperty(k) ? rules[k] : 0;
        };

        var axisLayoutModel = layoutModel.sort(function (a, b) {
            return a.c - b.c;
        });

        iterateByTriples(axisLayoutModel, function (prev, curr, next) {

            var collideL = prev.e > curr.s;
            var collideR = next.s < curr.e;

            if (collideL || collideR) {

                curr.l = resolveCollide(prev.l, collideL);

                var size = curr.textRef[0].length;
                var text = curr.textRef.text();

                if (size > 1) {
                    text = text.replace(/([\.]*$)/gi, '') + '...';
                }

                var oldY = parseFloat(curr.textRef.attr('y'));
                var newY = oldY + curr.l * textOffsetStep; // -1 | 0 | +1

                curr.textRef.text(function (d, i) {
                    return i === 0 ? text : '';
                }).attr('y', newY);

                var attrs = {
                    x1: 0,
                    x2: 0,
                    y1: newY + (isHorizontal ? -1 : 5),
                    y2: refOffsetStart
                };

                if (!isHorizontal) {
                    attrs.transform = 'rotate(-90)';
                }

                curr.tickRef.append('line').attr('class', 'label-ref').attr(attrs);
            }

            return curr;
        });
    };

    exports.d3_decorator_wrap_tick_label = d3_decorator_wrap_tick_label;
    exports.d3_decorator_prettify_axis_label = d3_decorator_prettify_axis_label;
    exports.d3_decorator_fix_axis_bottom_line = d3_decorator_fix_axis_bottom_line;
    exports.d3_decorator_fix_horizontal_axis_ticks_overflow = d3_decorator_fix_horizontal_axis_ticks_overflow;
    exports.d3_decorator_prettify_categorical_axis_ticks = d3_decorator_prettify_categorical_axis_ticks;
    exports.d3_decorator_avoid_labels_collisions = d3_decorator_avoid_labels_collisions;
    exports.wrapText = wrapText;
    exports.cutText = cutText;
});
define('elements/coords.cartesian',['exports', 'd3', 'underscore', './element', '../utils/utils-draw', '../const', '../formatter-registry', '../utils/d3-decorators'], function (exports, _d3, _underscore, _element, _utilsUtilsDraw, _const, _formatterRegistry, _utilsD3Decorators) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var _d32 = _interopRequireDefault(_d3);

    var _2 = _interopRequireDefault(_underscore);

    var Cartesian = (function (_Element) {
        _inherits(Cartesian, _Element);

        function Cartesian(config) {
            _classCallCheck(this, Cartesian);

            _get(Object.getPrototypeOf(Cartesian.prototype), 'constructor', this).call(this, config);

            this.config = config;

            this.config.guide = _2['default'].defaults(this.config.guide || {}, {
                showGridLines: 'xy',
                padding: { l: 50, r: 0, t: 0, b: 50 }
            });

            this.config.guide.x = this.config.guide.x || {};
            this.config.guide.x = _2['default'].defaults(this.config.guide.x, {
                cssClass: 'x axis',
                textAnchor: 'middle',
                padding: 10,
                hide: false,
                scaleOrient: 'bottom',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

            if (_2['default'].isString(this.config.guide.x.label)) {
                this.config.guide.x.label = {
                    text: this.config.guide.x.label
                };
            }

            this.config.guide.x.label = _2['default'].defaults(this.config.guide.x.label, {
                text: 'X',
                rotate: 0,
                padding: 40,
                textAnchor: 'middle'
            });

            this.config.guide.y = this.config.guide.y || {};
            this.config.guide.y = _2['default'].defaults(this.config.guide.y, {
                cssClass: 'y axis',
                textAnchor: 'start',
                padding: 10,
                hide: false,
                scaleOrient: 'left',
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

            if (_2['default'].isString(this.config.guide.y.label)) {
                this.config.guide.y.label = {
                    text: this.config.guide.y.label
                };
            }

            this.config.guide.y.label = _2['default'].defaults(this.config.guide.y.label, {
                text: 'Y',
                rotate: -90,
                padding: 20,
                textAnchor: 'middle'
            });

            var unit = this.config;
            var guide = unit.guide;
            if (guide.autoLayout === 'extract-axes') {
                var containerHeight = unit.options.containerHeight;
                var diff = containerHeight - (unit.options.top + unit.options.height);
                guide.x.hide = Math.floor(diff) > 0;
                guide.y.hide = Math.floor(unit.options.left) > 0;
            }
        }

        _createClass(Cartesian, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var node = this.config;

                var options = node.options;
                var padding = node.guide.padding;

                var innerWidth = options.width - (padding.l + padding.r);
                var innerHeight = options.height - (padding.t + padding.b);

                this.xScale = fnCreateScale('pos', node.x, [0, innerWidth]);
                this.yScale = fnCreateScale('pos', node.y, [innerHeight, 0]);

                this.W = innerWidth;
                this.H = innerHeight;

                return this.regScale('x', this.xScale).regScale('y', this.yScale);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames, continuation) {

                var node = _2['default'].extend({}, this.config);

                var options = node.options;
                var padding = node.guide.padding;

                var innerLeft = options.left + padding.l;
                var innerTop = options.top + padding.t;

                var innerWidth = this.W;
                var innerHeight = this.H;

                node.x = this.xScale;
                node.y = this.yScale;

                node.x.scaleObj = this.xScale;
                node.y.scaleObj = this.yScale;

                node.x.guide = node.guide.x;
                node.y.guide = node.guide.y;

                node.x.guide.label.size = innerWidth;
                node.y.guide.label.size = innerHeight;

                options.container.attr('transform', _utilsUtilsDraw.utilsDraw.translate(innerLeft, innerTop));

                // take into account reposition during resize by orthogonal axis
                var hashX = node.x.getHash() + innerHeight;
                var hashY = node.y.getHash() + innerWidth;

                if (!node.x.guide.hide) {
                    this._fnDrawDimAxis(options.container, node.x, [0, innerHeight + node.guide.x.padding], innerWidth, options.frameId + 'x', hashX);
                }

                if (!node.y.guide.hide) {
                    this._fnDrawDimAxis(options.container, node.y, [0 - node.guide.y.padding, 0], innerHeight, options.frameId + 'y', hashY);
                }

                var updateCellLayers = function updateCellLayers(cellId, cell, frame) {

                    var mapper;
                    var frameId = frame.hash();
                    if (frame.key) {

                        var xKey = frame.key[node.x.dim];
                        var yKey = frame.key[node.y.dim];

                        var coordX = node.x(xKey);
                        var coordY = node.y(yKey);

                        var xPart = node.x.stepSize(xKey);
                        var yPart = node.y.stepSize(yKey);

                        mapper = function (unit, i) {
                            unit.options = {
                                uid: frameId + i,
                                frameId: frameId,
                                container: cell,
                                containerWidth: innerWidth,
                                containerHeight: innerHeight,
                                left: coordX - xPart / 2,
                                top: coordY - yPart / 2,
                                width: xPart,
                                height: yPart
                            };
                            return unit;
                        };
                    } else {
                        mapper = function (unit, i) {
                            unit.options = {
                                uid: frameId + i,
                                frameId: frameId,
                                container: cell,
                                containerWidth: innerWidth,
                                containerHeight: innerHeight,
                                left: 0,
                                top: 0,
                                width: innerWidth,
                                height: innerHeight
                            };
                            return unit;
                        };
                    }

                    var continueDrawUnit = function continueDrawUnit(unit) {
                        unit.options.container = _d32['default'].select(this);
                        continuation(unit, frame);
                    };

                    var layers = cell.selectAll('.layer_' + cellId).data(frame.units.map(mapper), function (unit) {
                        return unit.options.uid + unit.type;
                    });
                    layers.exit().remove();
                    layers.each(continueDrawUnit);
                    layers.enter().append('g').attr('class', 'layer_' + cellId).each(continueDrawUnit);
                };

                var cellFrameIterator = function cellFrameIterator(cellFrame) {
                    updateCellLayers(options.frameId, _d32['default'].select(this), cellFrame);
                };

                var cells = this._fnDrawGrid(options.container, node, innerHeight, innerWidth, options.frameId, hashX + hashY).selectAll('.parent-frame-' + options.frameId).data(frames, function (f) {
                    return f.hash();
                });
                cells.exit().remove();
                cells.each(cellFrameIterator);
                cells.enter().append('g').attr('class', function (d) {
                    return _const.CSS_PREFIX + 'cell cell parent-frame-' + options.frameId + ' frame-' + d.hash();
                }).each(cellFrameIterator);
            }
        }, {
            key: '_fnDrawDimAxis',
            value: function _fnDrawDimAxis(container, scale, position, size, frameId, uniqueHash) {

                var axisScale = _d32['default'].svg.axis().scale(scale.scaleObj).orient(scale.guide.scaleOrient);

                var formatter = _formatterRegistry.FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
                if (formatter !== null) {
                    axisScale.ticks(Math.round(size / scale.guide.density));
                    axisScale.tickFormat(formatter);
                }

                var axis = container.selectAll('.axis_' + frameId).data([uniqueHash], function (x) {
                    return x;
                });
                axis.exit().remove();
                axis.enter().append('g').attr('class', scale.guide.cssClass + ' axis_' + frameId).attr('transform', _utilsUtilsDraw.utilsDraw.translate.apply(_utilsUtilsDraw.utilsDraw, _toConsumableArray(position))).call(function (refAxisNode) {
                    if (!refAxisNode.empty()) {

                        axisScale.call(this, refAxisNode);

                        var isHorizontal = _utilsUtilsDraw.utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h';
                        var prettifyTick = scale.scaleType === 'ordinal' || scale.scaleType === 'period';
                        if (prettifyTick) {
                            (0, _utilsD3Decorators.d3_decorator_prettify_categorical_axis_ticks)(refAxisNode, scale, isHorizontal);
                        }

                        (0, _utilsD3Decorators.d3_decorator_wrap_tick_label)(refAxisNode, scale.guide, isHorizontal);

                        if (prettifyTick && scale.guide.avoidCollisions) {
                            (0, _utilsD3Decorators.d3_decorator_avoid_labels_collisions)(refAxisNode, isHorizontal);
                        }

                        (0, _utilsD3Decorators.d3_decorator_prettify_axis_label)(refAxisNode, scale.guide.label, isHorizontal);

                        if (isHorizontal && scale.scaleType === 'time') {
                            (0, _utilsD3Decorators.d3_decorator_fix_horizontal_axis_ticks_overflow)(refAxisNode);
                        }
                    }
                });
            }
        }, {
            key: '_fnDrawGrid',
            value: function _fnDrawGrid(container, node, height, width, frameId, uniqueHash) {

                var grid = container.selectAll('.grid_' + frameId).data([uniqueHash], function (x) {
                    return x;
                });
                grid.exit().remove();
                grid.enter().append('g').attr('class', 'grid grid_' + frameId).attr('transform', _utilsUtilsDraw.utilsDraw.translate(0, 0)).call(function (selection) {

                    if (selection.empty()) {
                        return;
                    }

                    var grid = selection;

                    var linesOptions = (node.guide.showGridLines || '').toLowerCase();
                    if (linesOptions.length > 0) {

                        var gridLines = grid.append('g').attr('class', 'grid-lines');

                        if (linesOptions.indexOf('x') > -1) {
                            var xScale = node.x;
                            var xGridAxis = _d32['default'].svg.axis().scale(xScale.scaleObj).orient(xScale.guide.scaleOrient).tickSize(height);

                            var formatter = _formatterRegistry.FormatterRegistry.get(xScale.guide.tickFormat);
                            if (formatter !== null) {
                                xGridAxis.ticks(Math.round(width / xScale.guide.density));
                                xGridAxis.tickFormat(formatter);
                            }

                            var xGridLines = gridLines.append('g').attr('class', 'grid-lines-x').call(xGridAxis);

                            var isHorizontal = _utilsUtilsDraw.utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h';
                            var prettifyTick = xScale.scaleType === 'ordinal' || xScale.scaleType === 'period';
                            if (prettifyTick) {
                                (0, _utilsD3Decorators.d3_decorator_prettify_categorical_axis_ticks)(xGridLines, xScale, isHorizontal);
                            }

                            var firstXGridLine = xGridLines.select('g.tick');
                            if (firstXGridLine.node() && firstXGridLine.attr('transform') !== 'translate(0,0)') {
                                var zeroNode = firstXGridLine.node().cloneNode(true);
                                gridLines.node().appendChild(zeroNode);
                                _d32['default'].select(zeroNode).attr('class', 'border').attr('transform', _utilsUtilsDraw.utilsDraw.translate(0, 0)).select('line').attr('x1', 0).attr('x2', 0);
                            }
                        }

                        if (linesOptions.indexOf('y') > -1) {
                            var yScale = node.y;
                            var yGridAxis = _d32['default'].svg.axis().scale(yScale.scaleObj).orient(yScale.guide.scaleOrient).tickSize(-width);

                            var formatter = _formatterRegistry.FormatterRegistry.get(yScale.guide.tickFormat);
                            if (formatter !== null) {
                                yGridAxis.ticks(Math.round(height / yScale.guide.density));
                                yGridAxis.tickFormat(formatter);
                            }

                            var yGridLines = gridLines.append('g').attr('class', 'grid-lines-y').call(yGridAxis);

                            var isHorizontal = _utilsUtilsDraw.utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h';
                            var prettifyTick = yScale.scaleType === 'ordinal' || yScale.scaleType === 'period';
                            if (prettifyTick) {
                                (0, _utilsD3Decorators.d3_decorator_prettify_categorical_axis_ticks)(yGridLines, yScale, isHorizontal);
                            }

                            var fixLineScales = ['time', 'ordinal', 'period'];
                            var fixBottomLine = _2['default'].contains(fixLineScales, yScale.scaleType);
                            if (fixBottomLine) {
                                (0, _utilsD3Decorators.d3_decorator_fix_axis_bottom_line)(yGridLines, height, yScale.scaleType === 'time');
                            }
                        }

                        gridLines.selectAll('text').remove();
                    }
                });

                return grid;
            }
        }]);

        return Cartesian;
    })(_element.Element);

    exports.Cartesian = Cartesian;
});
define('elements/coords.parallel',['exports', 'd3', 'underscore', './element', '../utils/utils-draw', '../utils/utils', '../const', '../formatter-registry'], function (exports, _d3, _underscore, _element, _utilsUtilsDraw, _utilsUtils, _const, _formatterRegistry) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var _d32 = _interopRequireDefault(_d3);

    var _2 = _interopRequireDefault(_underscore);

    var Parallel = (function (_Element) {
        _inherits(Parallel, _Element);

        function Parallel(config) {
            var _this = this;

            _classCallCheck(this, Parallel);

            _get(Object.getPrototypeOf(Parallel.prototype), 'constructor', this).call(this, config);

            this.config = config;

            this.config.guide = _2['default'].defaults(this.config.guide || {}, {
                padding: { l: 50, r: 50, t: 50, b: 50 },
                enableBrushing: false
            });

            this.columnsBrushes = {};

            this.on('force-brush', function (sender, e) {
                return _this._forceBrushing(e);
            });
        }

        _createClass(Parallel, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var cfg = this.config;

                var options = cfg.options;
                var padding = cfg.guide.padding;

                var innerWidth = options.width - (padding.l + padding.r);
                var innerHeight = options.height - (padding.t + padding.b);

                this.W = innerWidth;
                this.H = innerHeight;

                this.columnsScalesMap = cfg.columns.reduce(function (memo, xi) {
                    memo[xi] = fnCreateScale('pos', xi, [innerHeight, 0]);
                    return memo;
                }, {});

                var step = innerWidth / (cfg.columns.length - 1);

                var colsMap = cfg.columns.reduce(function (memo, p, i) {
                    memo[p] = i * step;
                    return memo;
                }, {});

                this.xBase = function (p) {
                    return colsMap[p];
                };

                return this.regScale('columns', this.columnsScalesMap);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames, continuation) {
                var _this2 = this;

                var cfg = _2['default'].extend({}, this.config);
                var options = cfg.options;
                var padding = cfg.guide.padding;

                var innerW = options.width - (padding.l + padding.r);
                var innerH = options.height - (padding.t + padding.b);

                var updateCellLayers = function updateCellLayers(cellId, cell, frame) {

                    var frameId = frame.hash();
                    var mapper = function mapper(unit, i) {
                        unit.options = {
                            uid: frameId + i,
                            frameId: frameId,
                            container: cell,
                            containerWidth: innerW,
                            containerHeight: innerH,
                            left: 0,
                            top: 0,
                            width: innerW,
                            height: innerH
                        };
                        return unit;
                    };

                    var continueDrawUnit = function continueDrawUnit(unit) {
                        unit.options.container = _d32['default'].select(this);
                        continuation(unit, frame);
                    };

                    var layers = cell.selectAll('.layer_' + cellId).data(frame.units.map(mapper), function (unit) {
                        return unit.options.uid + unit.type;
                    });
                    layers.exit().remove();
                    layers.each(continueDrawUnit);
                    layers.enter().append('g').attr('class', 'layer_' + cellId).each(continueDrawUnit);
                };

                var cellFrameIterator = function cellFrameIterator(cellFrame) {
                    updateCellLayers(options.frameId, _d32['default'].select(this), cellFrame);
                };

                var grid = this._fnDrawGrid(options.container, cfg, options.frameId, Object.keys(this.columnsScalesMap).reduce(function (memo, k) {
                    return memo.concat([_this2.columnsScalesMap[k].getHash()]);
                }, []).join('_'));

                var frms = grid.selectAll('.parent-frame-' + options.frameId).data(frames, function (f) {
                    return f.hash();
                });
                frms.exit().remove();
                frms.each(cellFrameIterator);
                frms.enter().append('g').attr('class', function (d) {
                    return _const.CSS_PREFIX + 'cell cell parent-frame-' + options.frameId + ' frame-' + d.hash();
                }).each(cellFrameIterator);

                var cols = this._fnDrawColumns(grid, cfg);

                if (cfg.guide.enableBrushing) {
                    this._enableBrushing(cols);
                }
            }
        }, {
            key: '_fnDrawGrid',
            value: function _fnDrawGrid(container, config, frameId, uniqueHash) {

                var options = config.options;
                var padding = config.guide.padding;

                var l = options.left + padding.l;
                var t = options.top + padding.t;

                var grid = container.selectAll('.grid_' + frameId).data([uniqueHash], _2['default'].identity);
                grid.exit().remove();
                grid.enter().append('g').attr('class', 'grid grid_' + frameId).attr('transform', _utilsUtilsDraw.utilsDraw.translate(l, t));

                return grid;
            }
        }, {
            key: '_fnDrawColumns',
            value: function _fnDrawColumns(grid, config) {
                var colsGuide = config.guide.columns || {};
                var xBase = this.xBase;
                var columnsScalesMap = this.columnsScalesMap;
                var d3Axis = _d32['default'].svg.axis().orient('left');

                var cols = grid.selectAll('.column').data(config.columns, _2['default'].identity);
                cols.exit().remove();
                cols.enter().append('g').attr('class', 'column').attr('transform', function (d) {
                    return _utilsUtilsDraw.utilsDraw.translate(xBase(d), 0);
                }).call(function () {
                    this.append('g').attr('class', 'y axis').each(function (d) {
                        var propName = columnsScalesMap[d].dim;
                        var axisScale = d3Axis.scale(columnsScalesMap[d]);
                        var columnGuide = colsGuide[propName] || {};
                        var formatter = _formatterRegistry.FormatterRegistry.get(columnGuide.tickFormat, columnGuide.tickFormatNullAlias);
                        if (formatter !== null) {
                            axisScale.tickFormat(formatter);
                        }

                        _d32['default'].select(this).call(axisScale);
                    }).append('text').attr('class', 'label').attr('text-anchor', 'middle').attr('y', -9).text(function (d) {
                        return ((colsGuide[d] || {}).label || {}).text || columnsScalesMap[d].dim;
                    });
                });

                return cols;
            }
        }, {
            key: '_enableBrushing',
            value: function _enableBrushing(cols) {
                var _this3 = this;

                var brushWidth = 16;

                var columnsScalesMap = this.columnsScalesMap;
                var columnsBrushes = this.columnsBrushes;

                var onBrushStartEventHandler = function onBrushStartEventHandler(e) {
                    return e;
                };
                var onBrushEndEventHandler = function onBrushEndEventHandler(e) {
                    return e;
                };
                var onBrushEventHandler = function onBrushEventHandler(e) {
                    var eventBrush = Object.keys(columnsBrushes).filter(function (k) {
                        return !columnsBrushes[k].empty();
                    }).map(function (k) {
                        var ext = columnsBrushes[k].extent();
                        var rng = [];
                        if (columnsScalesMap[k].discrete) {
                            rng = columnsScalesMap[k].domain().filter(function (val) {
                                var pos = columnsScalesMap[k](val);
                                return ext[0] <= pos && ext[1] >= pos;
                            });
                        } else {
                            rng = [ext[0], ext[1]];
                        }

                        return {
                            dim: columnsScalesMap[k].dim,
                            func: columnsScalesMap[k].discrete ? 'inset' : 'between',
                            args: rng
                        };
                    });

                    _this3.fire('brush', eventBrush);
                };

                cols.selectAll('.brush').remove();
                cols.append('g').attr('class', 'brush').each(function (d) {
                    columnsBrushes[d] = _d32['default'].svg.brush().y(columnsScalesMap[d]).on('brushstart', onBrushStartEventHandler).on('brush', onBrushEventHandler).on('brushend', onBrushEndEventHandler);

                    _d32['default'].select(this).classed('brush-' + _utilsUtils.utils.generateHash(d), true).call(columnsBrushes[d]);
                }).selectAll('rect').attr('x', brushWidth / 2 * -1).attr('width', brushWidth);

                return cols;
            }
        }, {
            key: '_forceBrushing',
            value: function _forceBrushing() {
                var colsBrushSettings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var columnsBrushes = this.columnsBrushes;
                var columnsScalesMap = this.columnsScalesMap;

                Object.keys(colsBrushSettings).filter(function (k) {
                    return columnsBrushes[k] && columnsScalesMap[k] && colsBrushSettings[k];
                }).forEach(function (k) {
                    var brushExt = colsBrushSettings[k];
                    var ext = [];
                    if (columnsScalesMap[k].discrete) {
                        var positions = brushExt.map(columnsScalesMap[k]).filter(function (x) {
                            return x >= 0;
                        });
                        var stepSize = columnsScalesMap[k].stepSize() / 2;
                        ext = [Math.min.apply(Math, _toConsumableArray(positions)) - stepSize, Math.max.apply(Math, _toConsumableArray(positions)) + stepSize];
                    } else {
                        ext = [brushExt[0], brushExt[1]];
                    }
                    var hashK = _utilsUtils.utils.generateHash(k);
                    columnsBrushes[k].extent(ext);
                    columnsBrushes[k](_d32['default'].select('.brush-' + hashK));
                    columnsBrushes[k].event(_d32['default'].select('.brush-' + hashK));
                });
            }
        }]);

        return Parallel;
    })(_element.Element);

    exports.Parallel = Parallel;
});
!function() {
  var topojson = {
    version: "1.6.19",
    mesh: function(topology) { return object(topology, meshArcs.apply(this, arguments)); },
    meshArcs: meshArcs,
    merge: function(topology) { return object(topology, mergeArcs.apply(this, arguments)); },
    mergeArcs: mergeArcs,
    feature: featureOrCollection,
    neighbors: neighbors,
    presimplify: presimplify
  };

  function stitchArcs(topology, arcs) {
    var stitchedArcs = {},
        fragmentByStart = {},
        fragmentByEnd = {},
        fragments = [],
        emptyIndex = -1;

    // Stitch empty arcs first, since they may be subsumed by other arcs.
    arcs.forEach(function(i, j) {
      var arc = topology.arcs[i < 0 ? ~i : i], t;
      if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
        t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
      }
    });

    arcs.forEach(function(i) {
      var e = ends(i),
          start = e[0],
          end = e[1],
          f, g;

      if (f = fragmentByEnd[start]) {
        delete fragmentByEnd[f.end];
        f.push(i);
        f.end = end;
        if (g = fragmentByStart[end]) {
          delete fragmentByStart[g.start];
          var fg = g === f ? f : f.concat(g);
          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else if (f = fragmentByStart[end]) {
        delete fragmentByStart[f.start];
        f.unshift(i);
        f.start = start;
        if (g = fragmentByEnd[start]) {
          delete fragmentByEnd[g.end];
          var gf = g === f ? f : g.concat(f);
          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
        } else {
          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
        }
      } else {
        f = [i];
        fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
      }
    });

    function ends(i) {
      var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
      if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
      else p1 = arc[arc.length - 1];
      return i < 0 ? [p1, p0] : [p0, p1];
    }

    function flush(fragmentByEnd, fragmentByStart) {
      for (var k in fragmentByEnd) {
        var f = fragmentByEnd[k];
        delete fragmentByStart[f.start];
        delete f.start;
        delete f.end;
        f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
        fragments.push(f);
      }
    }

    flush(fragmentByEnd, fragmentByStart);
    flush(fragmentByStart, fragmentByEnd);
    arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

    return fragments;
  }

  function meshArcs(topology, o, filter) {
    var arcs = [];

    if (arguments.length > 1) {
      var geomsByArc = [],
          geom;

      function arc(i) {
        var j = i < 0 ? ~i : i;
        (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
      }

      function line(arcs) {
        arcs.forEach(arc);
      }

      function polygon(arcs) {
        arcs.forEach(line);
      }

      function geometry(o) {
        if (o.type === "GeometryCollection") o.geometries.forEach(geometry);
        else if (o.type in geometryType) geom = o, geometryType[o.type](o.arcs);
      }

      var geometryType = {
        LineString: line,
        MultiLineString: polygon,
        Polygon: polygon,
        MultiPolygon: function(arcs) { arcs.forEach(polygon); }
      };

      geometry(o);

      geomsByArc.forEach(arguments.length < 3
          ? function(geoms) { arcs.push(geoms[0].i); }
          : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });
    } else {
      for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push(i);
    }

    return {type: "MultiLineString", arcs: stitchArcs(topology, arcs)};
  }

  function mergeArcs(topology, objects) {
    var polygonsByArc = {},
        polygons = [],
        components = [];

    objects.forEach(function(o) {
      if (o.type === "Polygon") register(o.arcs);
      else if (o.type === "MultiPolygon") o.arcs.forEach(register);
    });

    function register(polygon) {
      polygon.forEach(function(ring) {
        ring.forEach(function(arc) {
          (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
        });
      });
      polygons.push(polygon);
    }

    function exterior(ring) {
      return cartesianRingArea(object(topology, {type: "Polygon", arcs: [ring]}).coordinates[0]) > 0; // TODO allow spherical?
    }

    polygons.forEach(function(polygon) {
      if (!polygon._) {
        var component = [],
            neighbors = [polygon];
        polygon._ = 1;
        components.push(component);
        while (polygon = neighbors.pop()) {
          component.push(polygon);
          polygon.forEach(function(ring) {
            ring.forEach(function(arc) {
              polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
                if (!polygon._) {
                  polygon._ = 1;
                  neighbors.push(polygon);
                }
              });
            });
          });
        }
      }
    });

    polygons.forEach(function(polygon) {
      delete polygon._;
    });

    return {
      type: "MultiPolygon",
      arcs: components.map(function(polygons) {
        var arcs = [];

        // Extract the exterior (unique) arcs.
        polygons.forEach(function(polygon) {
          polygon.forEach(function(ring) {
            ring.forEach(function(arc) {
              if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
                arcs.push(arc);
              }
            });
          });
        });

        // Stitch the arcs into one or more rings.
        arcs = stitchArcs(topology, arcs);

        // If more than one ring is returned,
        // at most one of these rings can be the exterior;
        // this exterior ring has the same winding order
        // as any exterior ring in the original polygons.
        if ((n = arcs.length) > 1) {
          var sgn = exterior(polygons[0][0]);
          for (var i = 0, t; i < n; ++i) {
            if (sgn === exterior(arcs[i])) {
              t = arcs[0], arcs[0] = arcs[i], arcs[i] = t;
              break;
            }
          }
        }

        return arcs;
      })
    };
  }

  function featureOrCollection(topology, o) {
    return o.type === "GeometryCollection" ? {
      type: "FeatureCollection",
      features: o.geometries.map(function(o) { return feature(topology, o); })
    } : feature(topology, o);
  }

  function feature(topology, o) {
    var f = {
      type: "Feature",
      id: o.id,
      properties: o.properties || {},
      geometry: object(topology, o)
    };
    if (o.id == null) delete f.id;
    return f;
  }

  function object(topology, o) {
    var absolute = transformAbsolute(topology.transform),
        arcs = topology.arcs;

    function arc(i, points) {
      if (points.length) points.pop();
      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
        points.push(p = a[k].slice());
        absolute(p, k);
      }
      if (i < 0) reverse(points, n);
    }

    function point(p) {
      p = p.slice();
      absolute(p, 0);
      return p;
    }

    function line(arcs) {
      var points = [];
      for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
      if (points.length < 2) points.push(points[0].slice());
      return points;
    }

    function ring(arcs) {
      var points = line(arcs);
      while (points.length < 4) points.push(points[0].slice());
      return points;
    }

    function polygon(arcs) {
      return arcs.map(ring);
    }

    function geometry(o) {
      var t = o.type;
      return t === "GeometryCollection" ? {type: t, geometries: o.geometries.map(geometry)}
          : t in geometryType ? {type: t, coordinates: geometryType[t](o)}
          : null;
    }

    var geometryType = {
      Point: function(o) { return point(o.coordinates); },
      MultiPoint: function(o) { return o.coordinates.map(point); },
      LineString: function(o) { return line(o.arcs); },
      MultiLineString: function(o) { return o.arcs.map(line); },
      Polygon: function(o) { return polygon(o.arcs); },
      MultiPolygon: function(o) { return o.arcs.map(polygon); }
    };

    return geometry(o);
  }

  function reverse(array, n) {
    var t, j = array.length, i = j - n; while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
  }

  function bisect(a, x) {
    var lo = 0, hi = a.length;
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (a[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function neighbors(objects) {
    var indexesByArc = {}, // arc index -> array of object indexes
        neighbors = objects.map(function() { return []; });

    function line(arcs, i) {
      arcs.forEach(function(a) {
        if (a < 0) a = ~a;
        var o = indexesByArc[a];
        if (o) o.push(i);
        else indexesByArc[a] = [i];
      });
    }

    function polygon(arcs, i) {
      arcs.forEach(function(arc) { line(arc, i); });
    }

    function geometry(o, i) {
      if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
      else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
    }

    var geometryType = {
      LineString: line,
      MultiLineString: polygon,
      Polygon: polygon,
      MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
    };

    objects.forEach(geometry);

    for (var i in indexesByArc) {
      for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
        for (var k = j + 1; k < m; ++k) {
          var ij = indexes[j], ik = indexes[k], n;
          if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
          if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
        }
      }
    }

    return neighbors;
  }

  function presimplify(topology, triangleArea) {
    var absolute = transformAbsolute(topology.transform),
        relative = transformRelative(topology.transform),
        heap = minAreaHeap();

    if (!triangleArea) triangleArea = cartesianTriangleArea;

    topology.arcs.forEach(function(arc) {
      var triangles = [],
          maxArea = 0,
          triangle;

      // To store each point’s effective area, we create a new array rather than
      // extending the passed-in point to workaround a Chrome/V8 bug (getting
      // stuck in smi mode). For midpoints, the initial effective area of
      // Infinity will be computed in the next step.
      for (var i = 0, n = arc.length, p; i < n; ++i) {
        p = arc[i];
        absolute(arc[i] = [p[0], p[1], Infinity], i);
      }

      for (var i = 1, n = arc.length - 1; i < n; ++i) {
        triangle = arc.slice(i - 1, i + 2);
        triangle[1][2] = triangleArea(triangle);
        triangles.push(triangle);
        heap.push(triangle);
      }

      for (var i = 0, n = triangles.length; i < n; ++i) {
        triangle = triangles[i];
        triangle.previous = triangles[i - 1];
        triangle.next = triangles[i + 1];
      }

      while (triangle = heap.pop()) {
        var previous = triangle.previous,
            next = triangle.next;

        // If the area of the current point is less than that of the previous point
        // to be eliminated, use the latter's area instead. This ensures that the
        // current point cannot be eliminated without eliminating previously-
        // eliminated points.
        if (triangle[1][2] < maxArea) triangle[1][2] = maxArea;
        else maxArea = triangle[1][2];

        if (previous) {
          previous.next = next;
          previous[2] = triangle[2];
          update(previous);
        }

        if (next) {
          next.previous = previous;
          next[0] = triangle[0];
          update(next);
        }
      }

      arc.forEach(relative);
    });

    function update(triangle) {
      heap.remove(triangle);
      triangle[1][2] = triangleArea(triangle);
      heap.push(triangle);
    }

    return topology;
  };

  function cartesianRingArea(ring) {
    var i = -1,
        n = ring.length,
        a,
        b = ring[n - 1],
        area = 0;

    while (++i < n) {
      a = b;
      b = ring[i];
      area += a[0] * b[1] - a[1] * b[0];
    }

    return area * .5;
  }

  function cartesianTriangleArea(triangle) {
    var a = triangle[0], b = triangle[1], c = triangle[2];
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
  }

  function compareArea(a, b) {
    return a[1][2] - b[1][2];
  }

  function minAreaHeap() {
    var heap = {},
        array = [],
        size = 0;

    heap.push = function(object) {
      up(array[object._ = size] = object, size++);
      return size;
    };

    heap.pop = function() {
      if (size <= 0) return;
      var removed = array[0], object;
      if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
      return removed;
    };

    heap.remove = function(removed) {
      var i = removed._, object;
      if (array[i] !== removed) return; // invalid request
      if (i !== --size) object = array[size], (compareArea(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
      return i;
    };

    function up(object, i) {
      while (i > 0) {
        var j = ((i + 1) >> 1) - 1,
            parent = array[j];
        if (compareArea(object, parent) >= 0) break;
        array[parent._ = i] = parent;
        array[object._ = i = j] = object;
      }
    }

    function down(object, i) {
      while (true) {
        var r = (i + 1) << 1,
            l = r - 1,
            j = i,
            child = array[j];
        if (l < size && compareArea(array[l], child) < 0) child = array[j = l];
        if (r < size && compareArea(array[r], child) < 0) child = array[j = r];
        if (j === i) break;
        array[child._ = i] = child;
        array[object._ = i = j] = object;
      }
    }

    return heap;
  }

  function transformAbsolute(transform) {
    if (!transform) return noop;
    var x0,
        y0,
        kx = transform.scale[0],
        ky = transform.scale[1],
        dx = transform.translate[0],
        dy = transform.translate[1];
    return function(point, i) {
      if (!i) x0 = y0 = 0;
      point[0] = (x0 += point[0]) * kx + dx;
      point[1] = (y0 += point[1]) * ky + dy;
    };
  }

  function transformRelative(transform) {
    if (!transform) return noop;
    var x0,
        y0,
        kx = transform.scale[0],
        ky = transform.scale[1],
        dx = transform.translate[0],
        dy = transform.translate[1];
    return function(point, i) {
      if (!i) x0 = y0 = 0;
      var x1 = (point[0] - dx) / kx | 0,
          y1 = (point[1] - dy) / ky | 0;
      point[0] = x1 - x0;
      point[1] = y1 - y0;
      x0 = x1;
      y0 = y1;
    };
  }

  function noop() {}

  if (typeof define === "function" && define.amd) define('topojson',topojson);
  else if (typeof module === "object" && module.exports) module.exports = topojson;
  else this.topojson = topojson;
}();

define('utils/d3-labeler',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var d3Labeler = function d3Labeler() {
        var lab = [],
            anc = [],
            w = 1,
            // box width
        h = 1,
            // box width
        labeler = {};

        var max_move = 5.0,
            max_angle = 0.5,
            acc = 0,
            rej = 0;

        // weights
        var w_len = 0.2,
            // leader line length
        w_inter = 1.0,
            // leader line intersenpm testction
        w_lab2 = 30.0,
            // label-label overlap
        w_lab_anc = 30.0,
            // label-anchor overlap
        w_orient = 3.0; // orientation bias

        // booleans for user defined functions
        var user_energy = false,
            user_schedule = false;

        var user_defined_energy, user_defined_schedule;

        var energy = function energy(index) {
            // energy function, tailored for label placement

            var m = lab.length,
                ener = 0,
                dx = lab[index].x - anc[index].x,
                dy = anc[index].y - lab[index].y,
                dist = Math.sqrt(dx * dx + dy * dy),
                overlap = true,
                amount = 0,
                theta = 0;

            // penalty for length of leader line
            if (dist > 0) {
                ener += dist * w_len;
            }

            // label orientation bias
            dx /= dist;
            dy /= dist;
            if (dx > 0 && dy > 0) {
                ener += 0 * w_orient;
            } else if (dx < 0 && dy > 0) {
                ener += 1 * w_orient;
            } else if (dx < 0 && dy < 0) {
                ener += 2 * w_orient;
            } else {
                ener += 3 * w_orient;
            }

            var x21 = lab[index].x,
                y21 = lab[index].y - lab[index].height + 2.0,
                x22 = lab[index].x + lab[index].width,
                y22 = lab[index].y + 2.0;
            var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;

            for (var i = 0; i < m; i++) {
                if (i != index) {

                    // penalty for intersection of leader lines
                    overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x, anc[index].y, lab[index].y, anc[i].y, lab[i].y);
                    if (overlap) {
                        ener += w_inter;
                    }

                    // penalty for label-label overlap
                    x11 = lab[i].x;
                    y11 = lab[i].y - lab[i].height + 2.0;
                    x12 = lab[i].x + lab[i].width;
                    y12 = lab[i].y + 2.0;
                    x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
                    y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
                    overlap_area = x_overlap * y_overlap;
                    ener += overlap_area * w_lab2;
                }

                // penalty for label-anchor overlap
                x11 = anc[i].x - anc[i].r;
                y11 = anc[i].y - anc[i].r;
                x12 = anc[i].x + anc[i].r;
                y12 = anc[i].y + anc[i].r;
                x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
                y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
                overlap_area = x_overlap * y_overlap;
                ener += overlap_area * w_lab_anc;
            }
            return ener;
        };

        var mcmove = function mcmove(currT) {
            // Monte Carlo translation move

            // select a random label
            var i = Math.floor(Math.random() * lab.length);

            // save old coordinates
            var x_old = lab[i].x;
            var y_old = lab[i].y;

            // old energy
            var old_energy;
            if (user_energy) {
                old_energy = user_defined_energy(i, lab, anc);
            } else {
                old_energy = energy(i);
            }

            // random translation
            lab[i].x += (Math.random() - 0.5) * max_move;
            lab[i].y += (Math.random() - 0.5) * max_move;

            // hard wall boundaries
            if (lab[i].x > w) {
                lab[i].x = x_old;
            }
            if (lab[i].x < 0) {
                lab[i].x = x_old;
            }
            if (lab[i].y > h) {
                lab[i].y = y_old;
            }
            if (lab[i].y < 0) {
                lab[i].y = y_old;
            }

            // new energy
            var new_energy;
            if (user_energy) {
                new_energy = user_defined_energy(i, lab, anc);
            } else {
                new_energy = energy(i);
            }

            // delta E
            var delta_energy = new_energy - old_energy;

            if (Math.random() < Math.exp(-delta_energy / currT)) {
                acc += 1;
            } else {
                // move back to old coordinates
                lab[i].x = x_old;
                lab[i].y = y_old;
                rej += 1;
            }
        };

        var mcrotate = function mcrotate(currT) {
            // Monte Carlo rotation move

            // select a random label
            var i = Math.floor(Math.random() * lab.length);

            // save old coordinates
            var x_old = lab[i].x;
            var y_old = lab[i].y;

            // old energy
            var old_energy;
            if (user_energy) {
                old_energy = user_defined_energy(i, lab, anc);
            } else {
                old_energy = energy(i);
            }

            // random angle
            var angle = (Math.random() - 0.5) * max_angle;

            var s = Math.sin(angle);
            var c = Math.cos(angle);

            // translate label (relative to anchor at origin):
            lab[i].x -= anc[i].x;
            lab[i].y -= anc[i].y;

            // rotate label
            var x_new = lab[i].x * c - lab[i].y * s,
                y_new = lab[i].x * s + lab[i].y * c;

            // translate label back
            lab[i].x = x_new + anc[i].x;
            lab[i].y = y_new + anc[i].y;

            // hard wall boundaries
            if (lab[i].x > w) {
                lab[i].x = x_old;
            }
            if (lab[i].x < 0) {
                lab[i].x = x_old;
            }
            if (lab[i].y > h) {
                lab[i].y = y_old;
            }
            if (lab[i].y < 0) {
                lab[i].y = y_old;
            }

            // new energy
            var new_energy;
            if (user_energy) {
                new_energy = user_defined_energy(i, lab, anc);
            } else {
                new_energy = energy(i);
            }

            // delta E
            var delta_energy = new_energy - old_energy;

            if (Math.random() < Math.exp(-delta_energy / currT)) {
                acc += 1;
            } else {
                // move back to old coordinates
                lab[i].x = x_old;
                lab[i].y = y_old;
                rej += 1;
            }
        };

        var intersect = function intersect(x1, x2, x3, x4, y1, y2, y3, y4) {
            // returns true if two lines intersect, else false
            // from http://paulbourke.net/geometry/lineline2d/

            var mua, mub;
            var denom, numera, numerb;

            denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
            numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
            numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

            /* Is the intersection along the the segments */
            mua = numera / denom;
            mub = numerb / denom;
            if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
                return true;
            }
            return false;
        };

        var cooling_schedule = function cooling_schedule(currT, initialT, nsweeps) {
            // linear cooling
            return currT - initialT / nsweeps;
        };

        labeler.start = function (nsweeps) {
            // main simulated annealing function
            var m = lab.length,
                currT = 1.0,
                initialT = 1.0;

            for (var i = 0; i < nsweeps; i++) {
                for (var j = 0; j < m; j++) {
                    if (Math.random() < 0.5) {
                        mcmove(currT);
                    } else {
                        mcrotate(currT);
                    }
                }
                currT = cooling_schedule(currT, initialT, nsweeps);
            }
        };

        labeler.width = function (x) {
            // users insert graph width
            if (!arguments.length) {
                return w;
            }
            w = x;
            return labeler;
        };

        labeler.height = function (x) {
            // users insert graph height
            if (!arguments.length) {
                return h;
            }
            h = x;
            return labeler;
        };

        labeler.label = function (x) {
            // users insert label positions
            if (!arguments.length) {
                return lab;
            }
            lab = x;
            return labeler;
        };

        labeler.anchor = function (x) {
            // users insert anchor positions
            if (!arguments.length) {
                return anc;
            }
            anc = x;
            return labeler;
        };

        labeler.alt_energy = function (x) {
            // user defined energy
            if (!arguments.length) {
                return energy;
            }
            user_defined_energy = x;
            user_energy = true;
            return labeler;
        };

        labeler.alt_schedule = function (x) {
            // user defined cooling_schedule
            if (!arguments.length) {
                return cooling_schedule;
            }
            user_defined_schedule = x;
            user_schedule = true;
            return labeler;
        };

        return labeler;
    };

    exports.d3Labeler = d3Labeler;
});
define('elements/coords.geomap',['exports', 'd3', 'underscore', 'topojson', '../utils/utils-draw', '../utils/d3-labeler', '../const', '../formatter-registry', './element'], function (exports, _d3, _underscore, _topojson, _utilsUtilsDraw, _utilsD3Labeler, _const, _formatterRegistry, _element) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var _d32 = _interopRequireDefault(_d3);

    var _2 = _interopRequireDefault(_underscore);

    var _topojson2 = _interopRequireDefault(_topojson);

    _d32['default'].labeler = _utilsD3Labeler.d3Labeler;

    var avgCharSize = 5.5;
    var iterationsCount = 10;
    var pointOpacity = 0.5;

    var hierarchy = ['land', 'continents', 'georegions', 'countries', 'regions', 'subunits', 'states', 'counties'];

    var GeoMap = (function (_Element) {
        _inherits(GeoMap, _Element);

        function GeoMap(config) {
            var _this = this;

            _classCallCheck(this, GeoMap);

            _get(Object.getPrototypeOf(GeoMap.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = _2['default'].defaults(this.config.guide || {}, {
                defaultFill: 'rgba(128,128,128,0.25)',
                padding: { l: 0, r: 0, t: 0, b: 0 },
                showNames: true
            });
            this.contourToFill = null;

            this.on('highlight-area', function (sender, e) {
                return _this._highlightArea(e);
            });
            this.on('highlight-point', function (sender, e) {
                return _this._highlightPoint(e);
            });
            this.on('highlight', function (sender, e) {
                return _this._highlightPoint(e);
            });
        }

        _createClass(GeoMap, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var node = this.config;

                var options = node.options;
                var padding = node.guide.padding;

                var innerWidth = options.width - (padding.l + padding.r);
                var innerHeight = options.height - (padding.t + padding.b);

                // y - latitude
                this.latScale = fnCreateScale('pos', node.latitude, [0, innerHeight]);
                // x - longitude
                this.lonScale = fnCreateScale('pos', node.longitude, [innerWidth, 0]);
                // size
                this.sizeScale = fnCreateScale('size', node.size);
                // color
                this.colorScale = fnCreateScale('color', node.color);

                // code
                this.codeScale = fnCreateScale('value', node.code);
                // fill
                this.fillScale = fnCreateScale('fill', node.fill);

                this.W = innerWidth;
                this.H = innerHeight;

                return this.regScale('latitude', this.latScale).regScale('longitude', this.lonScale).regScale('size', this.sizeScale).regScale('color', this.colorScale).regScale('code', this.codeScale).regScale('fill', this.fillScale);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {
                var _this2 = this;

                var guide = this.config.guide;

                if (typeof guide.sourcemap === 'string') {

                    _d32['default'].json(guide.sourcemap, function (e, topoJSONData) {

                        if (e) {
                            throw e;
                        }

                        _this2._drawMap(frames, topoJSONData);
                    });
                } else {
                    this._drawMap(frames, guide.sourcemap);
                }
            }
        }, {
            key: '_calcLabels',
            value: function _calcLabels(topoJSONData, reverseContours, path) {

                var innerW = this.W;
                var innerH = this.H;

                var labelsHashRef = {};

                reverseContours.forEach(function (c) {

                    var contourFeatures = _topojson2['default'].feature(topoJSONData, topoJSONData.objects[c]).features || [];

                    var labels = contourFeatures.map(function (d) {

                        var info = d.properties || {};

                        var center = path.centroid(d);
                        var bounds = path.bounds(d);

                        var sx = center[0];
                        var sy = center[1];

                        var br = bounds[1][0];
                        var bl = bounds[0][0];
                        var size = br - bl;
                        var name = info.name || '';
                        var abbr = info.abbr || name;
                        var isAbbr = size < name.length * avgCharSize;
                        var text = isAbbr ? abbr : name;
                        var isRef = size < 2.5 * avgCharSize;
                        var r = isRef ? innerW - sx - 3 * avgCharSize : 0;

                        return {
                            id: c + '-' + d.id,
                            sx: sx,
                            sy: sy,
                            x: sx + r,
                            y: sy,
                            width: text.length * avgCharSize,
                            height: 10,
                            name: text,
                            r: r,
                            isRef: isRef
                        };
                    }).filter(function (d) {
                        return !isNaN(d.x) && !isNaN(d.y);
                    });

                    var anchors = labels.map(function (d) {
                        return { x: d.sx, y: d.sy, r: d.r };
                    });

                    _d32['default'].labeler().label(labels).anchor(anchors).width(innerW).height(innerH).start(iterationsCount);

                    labels.filter(function (item) {
                        return !item.isRef;
                    }).map(function (item) {
                        item.x = item.sx;
                        item.y = item.sy;
                        return item;
                    }).reduce(function (memo, item) {
                        memo[item.id] = item;
                        return memo;
                    }, labelsHashRef);

                    var references = labels.filter(function (item) {
                        return item.isRef;
                    });
                    if (references.length < 6) {
                        references.reduce(function (memo, item) {
                            memo[item.id] = item;
                            return memo;
                        }, labelsHashRef);
                    }
                });

                return labelsHashRef;
            }
        }, {
            key: '_drawMap',
            value: function _drawMap(frames, topoJSONData) {
                var _this3 = this;

                var self = this;

                var guide = this.config.guide;
                var options = this.config.options;
                var node = this.config.options.container;

                var latScale = this.latScale;
                var lonScale = this.lonScale;
                var sizeScale = this.sizeScale;
                var colorScale = this.colorScale;

                var codeScale = this.codeScale;
                var fillScale = this.fillScale;

                var innerW = this.W;
                var innerH = this.H;

                var contours = hierarchy.filter(function (h) {
                    return (topoJSONData.objects || {}).hasOwnProperty(h);
                });

                if (contours.length === 0) {
                    throw new Error('Invalid map: should contain some contours');
                }

                var contourToFill;
                if (!fillScale.dim) {

                    contourToFill = contours[contours.length - 1];
                } else if (codeScale.georole) {

                    if (contours.indexOf(codeScale.georole) === -1) {
                        console.log('There is no contour for georole "' + codeScale.georole + '"');
                        console.log('Available contours are: ' + contours.join(' | '));

                        throw new Error('Invalid [georole]');
                    }

                    contourToFill = codeScale.georole;
                } else {
                    console.log('Specify [georole] for code scale');
                    throw new Error('[georole] is missing');
                }

                this.contourToFill = contourToFill;

                var center;

                if (latScale.dim && lonScale.dim) {
                    var lats = _d32['default'].extent(latScale.domain());
                    var lons = _d32['default'].extent(lonScale.domain());
                    center = [(lons[1] + lons[0]) / 2, (lats[1] + lats[0]) / 2];
                }

                var d3Projection = this._createProjection(topoJSONData, contours[0], center);

                var path = _d32['default'].geo.path().projection(d3Projection);

                var xmap = node.selectAll('.map-container').data(['' + innerW + innerH + center + contours.join('-')], _2['default'].identity);
                xmap.exit().remove();
                xmap.enter().append('g').call(function () {

                    var node = this;

                    node.attr('class', 'map-container');

                    var labelsHash = {};
                    var reverseContours = contours.reduceRight(function (m, t) {
                        return m.concat(t);
                    }, []);

                    if (guide.showNames) {
                        labelsHash = self._calcLabels(topoJSONData, reverseContours, path);
                    }

                    reverseContours.forEach(function (c, i) {

                        var getInfo = function getInfo(d) {
                            return labelsHash[c + '-' + d.id];
                        };

                        node.selectAll('.map-contour-' + c).data(_topojson2['default'].feature(topoJSONData, topoJSONData.objects[c]).features || []).enter().append('g').call(function () {

                            var cont = this;

                            cont.attr('class', 'map-contour-' + c + ' map-contour-level map-contour-level-' + i).attr('fill', 'none');

                            cont.append('title').text(function (d) {
                                return (d.properties || {}).name;
                            });

                            cont.append('path').attr('d', path);

                            cont.append('text').attr('class', 'place-label-' + c).attr('transform', function (d) {
                                var i = getInfo(d);
                                return i ? 'translate(' + [i.x, i.y] + ')' : '';
                            }).text(function (d) {
                                var i = getInfo(d);
                                return i ? i.name : '';
                            });

                            cont.append('line').attr('class', 'place-label-link-' + c).attr('stroke', 'gray').attr('stroke-width', 0.25).attr('x1', function (d) {
                                var i = getInfo(d);
                                return i && i.isRef ? i.sx : 0;
                            }).attr('y1', function (d) {
                                var i = getInfo(d);
                                return i && i.isRef ? i.sy : 0;
                            }).attr('x2', function (d) {
                                var i = getInfo(d);
                                return i && i.isRef ? i.x - i.name.length * 0.6 * avgCharSize : 0;
                            }).attr('y2', function (d) {
                                var i = getInfo(d);
                                return i && i.isRef ? i.y - 3.5 : 0;
                            });
                        });
                    });

                    if (topoJSONData.objects.hasOwnProperty('places')) {

                        var placesFeature = _topojson2['default'].feature(topoJSONData, topoJSONData.objects.places);

                        var labels = placesFeature.features.map(function (d) {
                            var coords = d3Projection(d.geometry.coordinates);
                            return {
                                x: coords[0] + 3.5,
                                y: coords[1] + 3.5,
                                width: d.properties.name.length * avgCharSize,
                                height: 12,
                                name: d.properties.name
                            };
                        });

                        var anchors = placesFeature.features.map(function (d) {
                            var coords = d3Projection(d.geometry.coordinates);
                            return {
                                x: coords[0],
                                y: coords[1],
                                r: 2.5
                            };
                        });

                        _d32['default'].labeler().label(labels).anchor(anchors).width(innerW).height(innerH).start(100);

                        node.selectAll('.place').data(anchors).enter().append('circle').attr('class', 'place').attr('transform', function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        }).attr('r', function (d) {
                            return d.r + 'px';
                        });

                        node.selectAll('.place-label').data(labels).enter().append('text').attr('class', 'place-label').attr('transform', function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        }).text(function (d) {
                            return d.name;
                        });
                    }
                });

                this.groupByCode = frames.reduce(function (groups, f) {
                    return f.part().reduce(function (memo, rec) {
                        var key = (rec[codeScale.dim] || '').toLowerCase();
                        memo[key] = rec;
                        return memo;
                    }, groups);
                }, {});

                var toData = this._resolveFeature.bind(this);

                xmap.selectAll('.map-contour-' + contourToFill).data(_topojson2['default'].feature(topoJSONData, topoJSONData.objects[contourToFill]).features).call(function () {
                    this.classed('map-contour', true).attr('fill', function (d) {
                        var row = toData(d);
                        return row === null ? guide.defaultFill : fillScale(row[fillScale.dim]);
                    });
                }).on('mouseover', function (d) {
                    return _this3.fire('area-mouseover', { data: toData(d), event: _d32['default'].event });
                }).on('mouseout', function (d) {
                    return _this3.fire('area-mouseout', { data: toData(d), event: _d32['default'].event });
                }).on('click', function (d) {
                    return _this3.fire('area-click', { data: toData(d), event: _d32['default'].event });
                });

                if (!latScale.dim || !lonScale.dim) {
                    return [];
                }

                var update = function update() {
                    return this.attr({
                        r: function r(_ref) {
                            var d = _ref.data;
                            return sizeScale(d[sizeScale.dim]);
                        },
                        transform: function transform(_ref2) {
                            var d = _ref2.data;
                            return 'translate(' + d3Projection([d[lonScale.dim], d[latScale.dim]]) + ')';
                        },
                        'class': function _class(_ref3) {
                            var d = _ref3.data;
                            return colorScale(d[colorScale.dim]);
                        },
                        opacity: pointOpacity
                    }).on('mouseover', function (_ref4) {
                        var d = _ref4.data;
                        return self.fire('point-mouseover', { data: d, event: _d32['default'].event });
                    }).on('mouseout', function (_ref5) {
                        var d = _ref5.data;
                        return self.fire('point-mouseout', { data: d, event: _d32['default'].event });
                    }).on('click', function (_ref6) {
                        var d = _ref6.data;
                        return self.fire('point-click', { data: d, event: _d32['default'].event });
                    });
                };

                var updateGroups = function updateGroups() {

                    this.attr('class', function (f) {
                        return 'frame-id-' + options.uid + ' frame-' + f.hash;
                    }).call(function () {
                        var points = this.selectAll('circle').data(function (frame) {
                            return frame.data.map(function (item) {
                                return { data: item, uid: options.uid };
                            });
                        });
                        points.exit().remove();
                        points.call(update);
                        points.enter().append('circle').call(update);
                    });
                };

                var mapper = function mapper(f) {
                    return { tags: f.key || {}, hash: f.hash(), data: f.part() };
                };

                var frameGroups = xmap.selectAll('.frame-id-' + options.uid).data(frames.map(mapper), function (f) {
                    return f.hash;
                });
                frameGroups.exit().remove();
                frameGroups.call(updateGroups);
                frameGroups.enter().append('g').call(updateGroups);

                return [];
            }
        }, {
            key: '_resolveFeature',
            value: function _resolveFeature(d) {
                var groupByCode = this.groupByCode;
                var prop = d.properties;
                var codes = ['c1', 'c2', 'c3', 'abbr', 'name'].filter(function (c) {
                    return prop.hasOwnProperty(c) && prop[c] && groupByCode.hasOwnProperty(prop[c].toLowerCase());
                });

                var value;
                if (codes.length === 0) {
                    // doesn't match
                    value = null;
                } else if (codes.length > 0) {
                    var k = prop[codes[0]].toLowerCase();
                    value = groupByCode[k];
                }

                return value;
            }
        }, {
            key: '_highlightArea',
            value: function _highlightArea(filter) {
                var _this4 = this;

                var node = this.config.options.container;
                var contourToFill = this.contourToFill;
                node.selectAll('.map-contour-' + contourToFill).classed('map-contour-highlighted', function (d) {
                    return filter(_this4._resolveFeature(d));
                });
            }
        }, {
            key: '_highlightPoint',
            value: function _highlightPoint(filter) {
                this.config.options.container.selectAll('circle').classed('map-point-highlighted', function (_ref7) {
                    var d = _ref7.data;
                    return filter(d);
                }).attr('opacity', function (_ref8) {
                    var d = _ref8.data;
                    return filter(d) ? pointOpacity : 0.1;
                });
            }
        }, {
            key: '_createProjection',
            value: function _createProjection(topoJSONData, topContour, center) {

                // The map's scale out is based on the solution:
                // http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object

                var width = this.W;
                var height = this.H;
                var guide = this.config.guide;

                var scale = 100;
                var offset = [width / 2, height / 2];

                var mapCenter = center || topoJSONData.center;
                var mapProjection = guide.projection || topoJSONData.projection || 'mercator';

                var d3Projection = this._createD3Projection(mapProjection, mapCenter, scale, offset);

                var path = _d32['default'].geo.path().projection(d3Projection);

                // using the path determine the bounds of the current map and use
                // these to determine better values for the scale and translation
                var bounds = path.bounds(_topojson2['default'].feature(topoJSONData, topoJSONData.objects[topContour]));

                var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
                var vscale = scale * height / (bounds[1][1] - bounds[0][1]);

                scale = hscale < vscale ? hscale : vscale;
                offset = [width - (bounds[0][0] + bounds[1][0]) / 2, height - (bounds[0][1] + bounds[1][1]) / 2];

                // new projection
                return this._createD3Projection(mapProjection, mapCenter, scale, offset);
            }
        }, {
            key: '_createD3Projection',
            value: function _createD3Projection(projection, center, scale, translate) {

                var d3ProjectionMethod = _d32['default'].geo[projection];

                if (!d3ProjectionMethod) {
                    console.log('Unknown projection "' + projection + '"');
                    console.log('See available projection types here: https://github.com/mbostock/d3/wiki/Geo-Projections');
                    throw new Error('Invalid map: unknown projection "' + projection + '"');
                }

                var d3Projection = d3ProjectionMethod();

                var steps = [{ method: 'scale', args: scale }, { method: 'center', args: center }, { method: 'translate', args: translate }].filter(function (step) {
                    return step.args;
                });

                // because the Albers USA projection does not support rotation or centering
                return steps.reduce(function (proj, step) {
                    if (proj[step.method]) {
                        proj = proj[step.method](step.args);
                    }
                    return proj;
                }, d3Projection);
            }
        }]);

        return GeoMap;
    })(_element.Element);

    exports.GeoMap = GeoMap;
});
define('elements/element.pie',['exports', '../const', './element', '../utils/css-class-map'], function (exports, _const, _element, _utilsCssClassMap) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Pie = (function (_Element) {
        _inherits(Pie, _Element);

        function Pie(config) {
            _classCallCheck(this, Pie);

            _get(Object.getPrototypeOf(Pie.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = this.config.guide || {};
            this.config.guide = _.defaults(this.config.guide, {
                cssClass: ''
            });
        }

        _createClass(Pie, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var config = this.config;

                this.proportionScale = fnCreateScale('value', config.proportion);
                this.labelScale = fnCreateScale('value', config.label);
                this.colorScale = fnCreateScale('color', config.color, {});

                return this.regScale('proportion', this.proportionScale).regScale('label', this.labelScale).regScale('color', this.colorScale);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var config = this.config;

                var options = config.options;

                var proportion = this.proportionScale;
                var label = this.labelScale;
                var color = this.colorScale;

                var w = options.width;
                var h = options.height;
                var r = h / 2;

                var data = frames[0].part();

                var vis = options.container.append('svg:svg').data([data]).attr('width', w).attr('height', h).append('svg:g').attr('transform', 'translate(' + r + ',' + r + ')');

                var pie = d3.layout.pie().value(function (d) {
                    return d[proportion.dim];
                });

                // declare an arc generator function
                var arc = d3.svg.arc().outerRadius(r);

                // select paths, use arc generator to draw
                var arcs = vis.selectAll('.slice').data(pie).enter().append('g').attr('class', 'slice');

                arcs.append('path').attr('class', function (d) {
                    var dm = d.data || {};
                    return color(dm[color.dim]);
                }).attr('d', function (d) {
                    return arc(d);
                });

                // add the text
                arcs.append('text').attr('transform', function (d) {
                    d.innerRadius = 0;
                    d.outerRadius = r;
                    return 'translate(' + arc.centroid(d) + ')';
                }).attr('text-anchor', 'middle').text(function (d) {
                    var dm = d.data || {};
                    return label(dm[label.dim]);
                });
            }
        }]);

        return Pie;
    })(_element.Element);

    exports.Pie = Pie;
});
define('elements/element.parallel.line',['exports', '../const', './element'], function (exports, _const, _element) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ParallelLine = (function (_Element) {
        _inherits(ParallelLine, _Element);

        function ParallelLine(config) {
            var _this = this;

            _classCallCheck(this, ParallelLine);

            _get(Object.getPrototypeOf(ParallelLine.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = _.defaults(this.config.guide || {}, {
                // params here
            });

            this.on('highlight', function (sender, e) {
                return _this.highlight(e);
            });
        }

        _createClass(ParallelLine, [{
            key: 'createScales',
            value: function createScales(fnCreateScale) {

                var config = this.config;
                var options = config.options;

                this.color = fnCreateScale('color', config.color, {});
                this.scalesMap = config.columns.reduce(function (memo, xi) {
                    memo[xi] = fnCreateScale('pos', xi, [options.height, 0]);
                    return memo;
                }, {});

                var step = options.width / (config.columns.length - 1);
                var colsMap = config.columns.reduce(function (memo, p, i) {
                    memo[p] = i * step;
                    return memo;
                }, {});

                this.xBase = function (p) {
                    return colsMap[p];
                };

                return this.regScale('columns', this.scalesMap).regScale('color', this.color);
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var node = this.config;
                var options = this.config.options;

                var scalesMap = this.scalesMap;
                var xBase = this.xBase;
                var color = this.color;

                var d3Line = d3.svg.line();

                var drawPath = function drawPath() {
                    this.attr('d', function (row) {
                        return d3Line(node.columns.map(function (p) {
                            return [xBase(p), scalesMap[p](row[scalesMap[p].dim])];
                        }));
                    });
                };

                var markPath = function markPath() {
                    this.attr('class', function (row) {
                        return _const.CSS_PREFIX + '__line line ' + color(row[color.dim]) + ' foreground';
                    });
                };

                var updateFrame = function updateFrame() {
                    var backgroundPath = this.selectAll('.background').data(function (f) {
                        return f.part();
                    });
                    backgroundPath.exit().remove();
                    backgroundPath.call(drawPath);
                    backgroundPath.enter().append('path').attr('class', 'background').call(drawPath);

                    var foregroundPath = this.selectAll('.foreground').data(function (f) {
                        return f.part();
                    });
                    foregroundPath.exit().remove();
                    foregroundPath.call(function () {
                        drawPath.call(this);
                        markPath.call(this);
                    });
                    foregroundPath.enter().append('path').call(function () {
                        drawPath.call(this);
                        markPath.call(this);
                    });
                };

                var part = options.container.selectAll('.lines-frame').data(frames, function (f) {
                    return f.hash();
                });
                part.exit().remove();
                part.call(updateFrame);
                part.enter().append('g').attr('class', 'lines-frame').call(updateFrame);

                this.subscribe(options.container.selectAll('.lines-frame .foreground'));
            }
        }, {
            key: 'highlight',
            value: function highlight(filter) {
                this.config.options.container.selectAll('.lines-frame .foreground').style('visibility', function (d) {
                    return filter(d) ? '' : 'hidden';
                });
            }
        }]);

        return ParallelLine;
    })(_element.Element);

    exports.ParallelLine = ParallelLine;
});
define('scales/base',['exports', '../utils/utils', 'underscore'], function (exports, _utilsUtils, _underscore) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    /* jshint ignore:end */

    var map_value = function map_value(dimType) {
        return dimType === 'date' ? function (v) {
            return new Date(v).getTime();
        } : function (v) {
            return v;
        };
    };

    var generateHashFunction = function generateHashFunction(varSet, interval) {
        return _utilsUtils.utils.generateHash([varSet, interval].map(JSON.stringify).join(''));
    };

    var BaseScale = (function () {
        function BaseScale(dataFrame, scaleConfig) {
            var _this = this;

            _classCallCheck(this, BaseScale);

            this._fields = {};

            var data;
            if (_2['default'].isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {

                var leaveDimsInWhereArgsOrEx = function leaveDimsInWhereArgsOrEx(f) {
                    var r = {};
                    if (f.type === 'where' && f.args) {
                        r.type = f.type;
                        r.args = scaleConfig.fitToFrameByDims.reduce(function (memo, d) {
                            if (f.args.hasOwnProperty(d)) {
                                memo[d] = f.args[d];
                            }
                            return memo;
                        }, {});
                    } else {
                        r = f;
                    }

                    return r;
                };

                data = dataFrame.part(leaveDimsInWhereArgsOrEx);
            } else {
                data = dataFrame.full();
            }

            var vars = this.getVarSet(data, scaleConfig);

            if (scaleConfig.order) {
                vars = _2['default'].union(_2['default'].intersection(scaleConfig.order, vars), vars);
            }

            this.vars = vars;
            this.scaleConfig = scaleConfig;

            this.addField('dim', this.scaleConfig.dim).addField('scaleDim', this.scaleConfig.dim).addField('scaleType', this.scaleConfig.type).addField('source', this.scaleConfig.source).addField('domain', function () {
                return _this.vars;
            });
        }

        _createClass(BaseScale, [{
            key: 'domain',
            value: function domain() {
                return this.vars;
            }
        }, {
            key: 'addField',
            value: function addField(key, val) {
                this._fields[key] = val;
                this[key] = val;
                return this;
            }
        }, {
            key: 'getField',
            value: function getField(key) {
                return this._fields[key];
            }
        }, {
            key: 'toBaseScale',
            value: function toBaseScale(func) {
                var _this2 = this;

                var dynamicProps = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

                var scaleFn = Object.keys(this._fields).reduce(function (memo, k) {
                    memo[k] = _this2._fields[k];
                    return memo;
                }, func);

                scaleFn.getHash = function () {
                    return generateHashFunction(_this2.vars, dynamicProps);
                };

                return scaleFn;
            }
        }, {
            key: 'getVarSet',
            value: function getVarSet(arr, scale) {
                return (0, _2['default'])(arr).chain().pluck(scale.dim).uniq(map_value(scale.dimType)).value();
            }
        }]);

        return BaseScale;
    })();

    exports.BaseScale = BaseScale;
});
define('scales/color',['exports', './base', 'underscore', 'd3'], function (exports, _base, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var ColorScale = (function (_BaseScale) {
        _inherits(ColorScale, _BaseScale);

        function ColorScale(xSource, scaleConfig) {
            _classCallCheck(this, ColorScale);

            _get(Object.getPrototypeOf(ColorScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            this.defaultColorClass = _2['default'].constant('color-default');
            var scaleBrewer = this.scaleConfig.brewer || _2['default'].times(20, function (i) {
                return 'color20-' + (1 + i);
            });

            this.addField('scaleType', 'color').addField('brewer', scaleBrewer);
        }

        _createClass(ColorScale, [{
            key: 'create',
            value: function create() {
                var _this = this;

                var varSet = this.vars;

                var brewer = this.getField('brewer');

                var buildArrayGetClass = function buildArrayGetClass(domain, brewer) {
                    if (domain.length === 0 || domain.length === 1 && domain[0] === null) {
                        return _this.defaultColorClass;
                    } else {
                        var fullDomain = domain.map(function (x) {
                            return String(x).toString();
                        });
                        return _d32['default'].scale.ordinal().range(brewer).domain(fullDomain);
                    }
                };

                var buildObjectGetClass = function buildObjectGetClass(brewer, defaultGetClass) {
                    var domain = _2['default'].keys(brewer);
                    var range = _2['default'].values(brewer);
                    var calculateClass = _d32['default'].scale.ordinal().range(range).domain(domain);
                    return function (d) {
                        return brewer.hasOwnProperty(d) ? calculateClass(d) : defaultGetClass(d);
                    };
                };

                var wrapString = function wrapString(f) {
                    return function (d) {
                        return f(String(d).toString());
                    };
                };

                var func;

                if (_2['default'].isArray(brewer)) {

                    func = wrapString(buildArrayGetClass(varSet, brewer));
                } else if (_2['default'].isFunction(brewer)) {

                    func = function (d) {
                        return brewer(d, wrapString(buildArrayGetClass(varSet, _2['default'].times(20, function (i) {
                            return 'color20-' + (1 + i);
                        }))));
                    };
                } else if (_2['default'].isObject(brewer)) {

                    func = buildObjectGetClass(brewer, this.defaultColorClass);
                } else {

                    throw new Error('This brewer is not supported');
                }

                return this.toBaseScale(func);
            }
        }]);

        return ColorScale;
    })(_base.BaseScale);

    exports.ColorScale = ColorScale;
});
define('scales/size',['exports', './base', 'underscore', 'd3'], function (exports, _base, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var funcTypes = {
        sqrt: function sqrt(x) {
            return Math.sqrt(x);
        },
        linear: function linear(x) {
            return x;
        }
    };

    var SizeScale = (function (_BaseScale) {
        _inherits(SizeScale, _BaseScale);

        function SizeScale(xSource, scaleConfig) {
            _classCallCheck(this, SizeScale);

            _get(Object.getPrototypeOf(SizeScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            this.addField('scaleType', 'size');
        }

        _createClass(SizeScale, [{
            key: 'create',
            value: function create() {
                var localProps = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var props = this.scaleConfig;
                var varSet = this.vars;

                var p = _2['default'].defaults({}, localProps, props, { func: 'sqrt', normalize: false });

                var funType = p.func;
                var minSize = p.min;
                var maxSize = p.max;
                var midSize = p.mid;

                var f = funcTypes[funType];

                var values = _2['default'].filter(varSet, _2['default'].isFinite);

                var normalize = props.normalize || localProps.normalize;

                var fnNorm = normalize ? function (x, maxX) {
                    return x / maxX;
                } : function (x) {
                    return x;
                };

                var func;
                if (values.length === 0) {
                    func = function (x) {
                        return fnNorm(midSize, midSize);
                    };
                } else {
                    var k = 1;
                    var xMin = 0;

                    var min = Math.min.apply(Math, _toConsumableArray(values));
                    var max = Math.max.apply(Math, _toConsumableArray(values));

                    var len = f(Math.max.apply(Math, [Math.abs(min), Math.abs(max), max - min]));

                    xMin = min < 0 ? min : 0;
                    k = len === 0 ? 1 : (maxSize - minSize) / len;

                    func = function (x) {

                        var numX = x !== null ? parseFloat(x) : 0;

                        if (!_2['default'].isFinite(numX)) {
                            return fnNorm(maxSize, maxSize);
                        }

                        var posX = numX - xMin; // translate to positive x domain

                        return fnNorm(minSize + f(posX) * k, maxSize);
                    };
                }

                return this.toBaseScale(func, localProps);
            }
        }]);

        return SizeScale;
    })(_base.BaseScale);

    exports.SizeScale = SizeScale;
});
define('scales/ordinal',['exports', './base', 'underscore', 'd3'], function (exports, _base, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var OrdinalScale = (function (_BaseScale) {
        _inherits(OrdinalScale, _BaseScale);

        function OrdinalScale(xSource, scaleConfig) {
            _classCallCheck(this, OrdinalScale);

            _get(Object.getPrototypeOf(OrdinalScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            this.addField('scaleType', 'ordinal').addField('discrete', true);
        }

        _createClass(OrdinalScale, [{
            key: 'create',
            value: function create(interval) {

                var props = this.scaleConfig;
                var varSet = this.vars;

                var d3Domain = _d32['default'].scale.ordinal().domain(varSet);

                var d3Scale = d3Domain.rangePoints(interval, 1);

                var size = Math.max.apply(Math, _toConsumableArray(interval));

                var fnRatio = function fnRatio(key) {
                    var ratioType = typeof props.ratio;
                    if (ratioType === 'function') {
                        return props.ratio(key, size, varSet);
                    } else if (ratioType === 'object') {
                        return props.ratio[key];
                    } else {
                        // uniform distribution
                        return 1 / varSet.length;
                    }
                };

                var scale = function scale(x) {

                    var r;

                    if (!props.ratio) {
                        r = d3Scale(x);
                    } else {
                        r = size - varSet.slice(varSet.indexOf(x) + 1).reduce(function (acc, v) {
                            return acc + size * fnRatio(v);
                        }, size * fnRatio(x) * 0.5);
                    }

                    return r;
                };

                // have to copy properties since d3 produce Function with methods
                Object.keys(d3Scale).forEach(function (p) {
                    return scale[p] = d3Scale[p];
                });

                scale.stepSize = function (x) {
                    return fnRatio(x) * size;
                };

                return this.toBaseScale(scale, interval);
            }
        }]);

        return OrdinalScale;
    })(_base.BaseScale);

    exports.OrdinalScale = OrdinalScale;
});
define('scales/period',['exports', './base', '../unit-domain-period-generator', 'underscore', 'd3'], function (exports, _base, _unitDomainPeriodGenerator, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var PeriodScale = (function (_BaseScale) {
        _inherits(PeriodScale, _BaseScale);

        function PeriodScale(xSource, scaleConfig) {
            _classCallCheck(this, PeriodScale);

            _get(Object.getPrototypeOf(PeriodScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            var props = this.scaleConfig;
            var vars = this.vars;

            var domain = _d32['default'].extent(vars);
            var min = _2['default'].isNull(props.min) || _2['default'].isUndefined(props.min) ? domain[0] : new Date(props.min).getTime();
            var max = _2['default'].isNull(props.max) || _2['default'].isUndefined(props.max) ? domain[1] : new Date(props.max).getTime();

            var range = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

            if (props.fitToFrameByDims) {
                this.vars = (0, _2['default'])(vars).chain().uniq(function (x) {
                    return new Date(x).getTime();
                }).map(function (x) {
                    return new Date(x);
                }).sortBy(function (x) {
                    return -x;
                }).value();
            } else {
                this.vars = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);
            }

            this.addField('scaleType', 'period').addField('discrete', true);
        }

        _createClass(PeriodScale, [{
            key: 'create',
            value: function create(interval) {

                var varSet = this.vars;
                var varSetTicks = this.vars.map(function (t) {
                    return t.getTime();
                });
                var props = this.scaleConfig;

                var d3Domain = _d32['default'].scale.ordinal().domain(varSet);

                var d3Scale = d3Domain.rangePoints(interval, 1);

                var size = Math.max.apply(Math, _toConsumableArray(interval));

                var fnRatio = function fnRatio(key) {

                    var tick = new Date(key).getTime();

                    var ratioType = typeof props.ratio;
                    if (ratioType === 'function') {
                        return props.ratio(tick, size, varSetTicks);
                    } else if (ratioType === 'object') {
                        return props.ratio[tick];
                    } else {
                        // uniform distribution
                        return 1 / varSet.length;
                    }
                };

                var scale = function scale(x) {

                    var r;
                    var dx = new Date(x);
                    var tx = dx.getTime();

                    if (!props.ratio) {
                        r = d3Scale(dx);
                    } else {
                        r = size - varSetTicks.slice(varSetTicks.indexOf(tx) + 1).reduce(function (acc, v) {
                            return acc + size * fnRatio(v);
                        }, size * fnRatio(x) * 0.5);
                    }

                    return r;
                };

                // have to copy properties since d3 produce Function with methods
                Object.keys(d3Scale).forEach(function (p) {
                    return scale[p] = d3Scale[p];
                });

                scale.stepSize = function (x) {
                    return fnRatio(x) * size;
                };

                return this.toBaseScale(scale, interval);
            }
        }]);

        return PeriodScale;
    })(_base.BaseScale);

    exports.PeriodScale = PeriodScale;
});
define('scales/time',['exports', './base', 'underscore', 'd3'], function (exports, _base, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var TimeScale = (function (_BaseScale) {
        _inherits(TimeScale, _BaseScale);

        function TimeScale(xSource, scaleConfig) {
            _classCallCheck(this, TimeScale);

            _get(Object.getPrototypeOf(TimeScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            var props = this.scaleConfig;
            var vars = this.vars;

            var domain = _d32['default'].extent(vars).map(function (v) {
                return new Date(v);
            });

            var min = _2['default'].isNull(props.min) || _2['default'].isUndefined(props.min) ? domain[0] : new Date(props.min).getTime();
            var max = _2['default'].isNull(props.max) || _2['default'].isUndefined(props.max) ? domain[1] : new Date(props.max).getTime();

            this.vars = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

            this.addField('scaleType', 'time');
        }

        _createClass(TimeScale, [{
            key: 'create',
            value: function create(interval) {

                var varSet = this.vars;

                var d3Domain = _d32['default'].time.scale().domain(varSet);

                var d3Scale = d3Domain.range(interval);

                var scale = function scale(x) {
                    var min = varSet[0];
                    var max = varSet[1];

                    if (x > max) {
                        x = max;
                    }
                    if (x < min) {
                        x = min;
                    }
                    return d3Scale(new Date(x));
                };

                // have to copy properties since d3 produce Function with methods
                Object.keys(d3Scale).forEach(function (p) {
                    return scale[p] = d3Scale[p];
                });

                scale.stepSize = function () {
                    return 0;
                };

                return this.toBaseScale(scale, interval);
            }
        }]);

        return TimeScale;
    })(_base.BaseScale);

    exports.TimeScale = TimeScale;
});
define('scales/linear',['exports', './base', '../utils/utils', 'underscore', 'd3'], function (exports, _base, _utilsUtils, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var LinearScale = (function (_BaseScale) {
        _inherits(LinearScale, _BaseScale);

        function LinearScale(xSource, scaleConfig) {
            _classCallCheck(this, LinearScale);

            _get(Object.getPrototypeOf(LinearScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            var props = this.scaleConfig;
            var vars = _d32['default'].extent(this.vars);

            var min = _2['default'].isNumber(props.min) ? props.min : vars[0];
            var max = _2['default'].isNumber(props.max) ? props.max : vars[1];

            vars = [Math.min(min, vars[0]), Math.max(max, vars[1])];

            this.vars = props.autoScale ? _utilsUtils.utils.autoScale(vars) : _d32['default'].extent(vars);

            this.addField('scaleType', 'linear').addField('discrete', false);
        }

        _createClass(LinearScale, [{
            key: 'create',
            value: function create(interval) {

                var varSet = this.vars;

                var d3Domain = _d32['default'].scale.linear().domain(varSet);

                var d3Scale = d3Domain.rangeRound(interval, 1);
                var scale = function scale(int) {
                    var min = varSet[0];
                    var max = varSet[1];
                    var x = int;
                    if (x > max) {
                        x = max;
                    }
                    if (x < min) {
                        x = min;
                    }

                    return d3Scale(x);
                };

                // have to copy properties since d3 produce Function with methods
                Object.keys(d3Scale).forEach(function (p) {
                    return scale[p] = d3Scale[p];
                });

                scale.stepSize = function () {
                    return 0;
                };

                return this.toBaseScale(scale, interval);
            }
        }]);

        return LinearScale;
    })(_base.BaseScale);

    exports.LinearScale = LinearScale;
});
define('scales/value',['exports', './base', 'underscore', 'd3'], function (exports, _base, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var ValueScale = (function (_BaseScale) {
        _inherits(ValueScale, _BaseScale);

        function ValueScale(xSource, scaleConfig) {
            _classCallCheck(this, ValueScale);

            _get(Object.getPrototypeOf(ValueScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            this.addField('scaleType', 'value').addField('georole', scaleConfig.georole);
        }

        _createClass(ValueScale, [{
            key: 'create',
            value: function create() {
                return this.toBaseScale(function (x) {
                    return x;
                });
            }
        }]);

        return ValueScale;
    })(_base.BaseScale);

    exports.ValueScale = ValueScale;
});
define('scales/fill',['exports', './base', '../utils/utils', 'underscore', 'd3'], function (exports, _base, _utilsUtils, _underscore, _d3) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var FillScale = (function (_BaseScale) {
        _inherits(FillScale, _BaseScale);

        function FillScale(xSource, scaleConfig) {
            _classCallCheck(this, FillScale);

            _get(Object.getPrototypeOf(FillScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            var props = this.scaleConfig;
            var vars = _d32['default'].extent(this.vars);

            var min = _2['default'].isNumber(props.min) ? props.min : vars[0];
            var max = _2['default'].isNumber(props.max) ? props.max : vars[1];

            vars = [Math.min(min, vars[0]), Math.max(max, vars[1])];

            this.vars = props.autoScale ? _utilsUtils.utils.autoScale(vars) : _d32['default'].extent(vars);

            var opacityStep = (1 - 0.2) / 9;
            var defBrewer = _2['default'].times(10, function (i) {
                return 'rgba(90,180,90,' + (0.2 + i * opacityStep).toFixed(2) + ')';
            });

            var brewer = props.brewer || defBrewer;

            this.addField('scaleType', 'fill').addField('brewer', brewer);
        }

        _createClass(FillScale, [{
            key: 'create',
            value: function create() {

                var varSet = this.vars;

                var brewer = this.getField('brewer');

                if (!_2['default'].isArray(brewer)) {
                    throw new Error('This brewer is not supported');
                }

                var size = brewer.length;
                var step = (varSet[1] - varSet[0]) / size;
                var domain = _2['default'].times(size - 1, function (i) {
                    return i + 1;
                }).reduce(function (memo, i) {
                    return memo.concat([varSet[0] + i * step]);
                }, []);

                var func = _d32['default'].scale.threshold().domain(domain).range(brewer);

                return this.toBaseScale(func);
            }
        }]);

        return FillScale;
    })(_base.BaseScale);

    exports.FillScale = FillScale;
});
define('api/chart-map',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    var ChartMap = function ChartMap(config) {

        var guide = _.extend({
            sourcemap: config.settings.defaultSourceMap
        }, config.guide || {});

        guide.size = _.defaults(guide.size || {}, { min: 1, max: 10 });
        guide.code = _.defaults(guide.code || {}, { georole: 'countries' });

        var scales = {};

        var scalesPool = function scalesPool(type, prop) {
            var guide = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var key;
            var dim = prop;
            var src;
            if (!prop) {
                key = type + ':default';
                src = '?';
            } else {
                key = type + '_' + prop;
                src = '/';
            }

            if (!scales.hasOwnProperty(key)) {
                scales[key] = _.extend({ type: type, source: src, dim: dim }, guide);
            }

            return key;
        };

        return {
            sources: {
                '?': {
                    dims: {},
                    data: [{}]
                },
                '/': {
                    dims: Object.keys(config.dimensions).reduce(function (dims, k) {
                        dims[k] = { type: config.dimensions[k].type };
                        return dims;
                    }, {}),
                    data: config.data
                }
            },

            scales: scales,

            unit: {
                type: 'COORDS.MAP',

                expression: { operator: 'none', source: '/' },

                code: scalesPool('value', config.code, guide.code),
                fill: scalesPool('fill', config.fill, guide.fill),

                size: scalesPool('size', config.size, guide.size),
                color: scalesPool('color', config.color, guide.color),
                latitude: scalesPool('linear', config.latitude, { autoScale: false }),
                longitude: scalesPool('linear', config.longitude, { autoScale: false }),

                guide: guide
            },

            plugins: config.plugins || []
        };
    };

    exports.ChartMap = ChartMap;
});
//# sourceMappingURL=data:application/json;base64,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QyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNqRCxxQkFBSyxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JELHdCQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDO0FBQ25FLHlCQUFTLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDOztBQUVyRSxxQkFBSyxFQUFFLEtBQUs7YUFDZjs7QUFFRCxtQkFBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRTtTQUNoQyxDQUFDO0tBQ0wsQ0FBQzs7WUFFTSxRQUFRLEdBQVIsUUFBUSIsImZpbGUiOiJzcmMvYXBpL2NoYXJ0LW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBDaGFydE1hcCA9IChjb25maWcpID0+IHtcblxuICAgIHZhciBndWlkZSA9IF8uZXh0ZW5kKFxuICAgICAgICB7XG4gICAgICAgICAgICBzb3VyY2VtYXA6IGNvbmZpZy5zZXR0aW5ncy5kZWZhdWx0U291cmNlTWFwXG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZy5ndWlkZSB8fCB7fSk7XG5cbiAgICBndWlkZS5zaXplID0gXy5kZWZhdWx0cyhndWlkZS5zaXplIHx8IHt9LCB7bWluOiAxLCBtYXg6IDEwfSk7XG4gICAgZ3VpZGUuY29kZSA9IF8uZGVmYXVsdHMoZ3VpZGUuY29kZSB8fCB7fSwge2dlb3JvbGU6ICdjb3VudHJpZXMnfSk7XG5cbiAgICB2YXIgc2NhbGVzID0ge307XG5cbiAgICB2YXIgc2NhbGVzUG9vbCA9ICh0eXBlLCBwcm9wLCBndWlkZSA9IHt9KSA9PiB7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIHZhciBkaW0gPSBwcm9wO1xuICAgICAgICB2YXIgc3JjO1xuICAgICAgICBpZiAoIXByb3ApIHtcbiAgICAgICAgICAgIGtleSA9IGAke3R5cGV9OmRlZmF1bHRgO1xuICAgICAgICAgICAgc3JjID0gJz8nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gYCR7dHlwZX1fJHtwcm9wfWA7XG4gICAgICAgICAgICBzcmMgPSAnLyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNjYWxlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBzY2FsZXNba2V5XSA9IF8uZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHt0eXBlOiB0eXBlLCBzb3VyY2U6IHNyYywgZGltOiBkaW19LFxuICAgICAgICAgICAgICAgIGd1aWRlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlczoge1xuICAgICAgICAgICAgJz8nOiB7XG4gICAgICAgICAgICAgICAgZGltczoge30sXG4gICAgICAgICAgICAgICAgZGF0YTogW3t9XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICcvJzoge1xuICAgICAgICAgICAgICAgIGRpbXM6IE9iamVjdFxuICAgICAgICAgICAgICAgICAgICAua2V5cyhjb25maWcuZGltZW5zaW9ucylcbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgoZGltcywgaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGltc1trXSA9IHt0eXBlOiBjb25maWcuZGltZW5zaW9uc1trXS50eXBlfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkaW1zO1xuICAgICAgICAgICAgICAgICAgICB9LCB7fSksXG4gICAgICAgICAgICAgICAgZGF0YTogY29uZmlnLmRhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzY2FsZXM6IHNjYWxlcyxcblxuICAgICAgICB1bml0OiB7XG4gICAgICAgICAgICB0eXBlOiAnQ09PUkRTLk1BUCcsXG5cbiAgICAgICAgICAgIGV4cHJlc3Npb246IHtvcGVyYXRvcjogJ25vbmUnLCBzb3VyY2U6ICcvJ30sXG5cbiAgICAgICAgICAgIGNvZGU6IHNjYWxlc1Bvb2woJ3ZhbHVlJywgY29uZmlnLmNvZGUsIGd1aWRlLmNvZGUpLFxuICAgICAgICAgICAgZmlsbDogc2NhbGVzUG9vbCgnZmlsbCcsIGNvbmZpZy5maWxsLCBndWlkZS5maWxsKSxcblxuICAgICAgICAgICAgc2l6ZTogc2NhbGVzUG9vbCgnc2l6ZScsIGNvbmZpZy5zaXplLCBndWlkZS5zaXplKSxcbiAgICAgICAgICAgIGNvbG9yOiBzY2FsZXNQb29sKCdjb2xvcicsIGNvbmZpZy5jb2xvciwgZ3VpZGUuY29sb3IpLFxuICAgICAgICAgICAgbGF0aXR1ZGU6IHNjYWxlc1Bvb2woJ2xpbmVhcicsIGNvbmZpZy5sYXRpdHVkZSwge2F1dG9TY2FsZTogZmFsc2V9KSxcbiAgICAgICAgICAgIGxvbmdpdHVkZTogc2NhbGVzUG9vbCgnbGluZWFyJywgY29uZmlnLmxvbmdpdHVkZSwge2F1dG9TY2FsZTogZmFsc2V9KSxcblxuICAgICAgICAgICAgZ3VpZGU6IGd1aWRlXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGx1Z2luczogY29uZmlnLnBsdWdpbnMgfHwgW11cbiAgICB9O1xufTtcblxuZXhwb3J0IHtDaGFydE1hcH07Il19;
define('api/converter-helpers',['exports', 'd3', '../utils/utils'], function (exports, _d3, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _strategyNormalizeAxis;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    var _d32 = _interopRequireDefault(_d3);

    var convertAxis = function convertAxis(data) {
        return !data ? null : data;
    };

    var normalizeSettings = function normalizeSettings(axis) {
        var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        return !_utilsUtils.utils.isArray(axis) ? [axis] : axis.length === 0 ? [defaultValue] : axis;
    };

    var createElement = function createElement(type, config) {
        return {
            type: type,
            x: config.x,
            y: config.y,
            color: config.color,
            guide: {
                color: config.colorGuide,
                size: config.sizeGuide
            },
            flip: config.flip,
            size: config.size
        };
    };

    var status = {
        SUCCESS: 'SUCCESS',
        WARNING: 'WARNING',
        FAIL: 'FAIL'
    };

    var strategyNormalizeAxis = (_strategyNormalizeAxis = {}, _defineProperty(_strategyNormalizeAxis, status.SUCCESS, function (axis) {
        return axis;
    }), _defineProperty(_strategyNormalizeAxis, status.FAIL, function (axis, data) {
        throw new Error((data.messages || []).join('\n') ||
        // jscs:disable
        'This configuration is not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart');
    }), _defineProperty(_strategyNormalizeAxis, status.WARNING, function (axis, config, guide) {
        var axisName = config.axis;
        var index = config.indexMeasureAxis[0];
        var measure = axis[index];
        var newAxis = _.without(axis, measure);
        newAxis.push(measure);

        var measureGuide = guide[index][axisName] || {};
        var categoryGuide = guide[guide.length - 1][axisName] || {};

        guide[guide.length - 1][axisName] = measureGuide;
        guide[index][axisName] = categoryGuide;

        return newAxis;
    }), _strategyNormalizeAxis);

    function validateAxis(dimensions, axis, axisName) {
        return axis.reduce(function (result, item, index) {
            var dimension = dimensions[item];
            if (!dimension) {
                result.status = status.FAIL;
                if (item) {
                    result.messages.push('"' + item + '" dimension is undefined for "' + axisName + '" axis');
                } else {
                    result.messages.push('"' + axisName + '" axis should be specified');
                }
            } else if (result.status != status.FAIL) {
                if (dimension.type === 'measure') {
                    result.countMeasureAxis++;
                    result.indexMeasureAxis.push(index);
                }
                if (dimension.type !== 'measure' && result.countMeasureAxis === 1) {
                    result.status = status.WARNING;
                } else if (result.countMeasureAxis > 1) {
                    result.status = status.FAIL;
                    result.messages.push('There is more than one measure dimension for "' + axisName + '" axis');
                }
            }
            return result;
        }, { status: status.SUCCESS, countMeasureAxis: 0, indexMeasureAxis: [], messages: [], axis: axisName });
    }

    function normalizeConfig(config) {

        var x = normalizeSettings(config.x);
        var y = normalizeSettings(config.y);

        var maxDeep = Math.max(x.length, y.length);

        var guide = normalizeSettings(config.guide, {});

        // feel the gaps if needed
        _.times(maxDeep - guide.length, function () {
            return guide.push({});
        });

        // cut items
        guide = guide.slice(0, maxDeep);

        var validatedX = validateAxis(config.dimensions, x, 'x');
        var validatedY = validateAxis(config.dimensions, y, 'y');
        x = strategyNormalizeAxis[validatedX.status](x, validatedX, guide);
        y = strategyNormalizeAxis[validatedY.status](y, validatedY, guide);

        return _.extend({}, config, {
            x: x,
            y: y,
            guide: guide
        });
    }

    function transformConfig(type, config) {

        var x = config.x;
        var y = config.y;
        var guide = config.guide;
        var maxDepth = Math.max(x.length, y.length);

        var spec = {
            type: 'COORDS.RECT',
            unit: []
        };

        var xs = [].concat(x);
        var ys = [].concat(y);
        var gs = [].concat(guide);

        for (var i = maxDepth; i > 0; i--) {
            var currentX = xs.pop();
            var currentY = ys.pop();
            var currentGuide = gs.pop() || {};
            if (i === maxDepth) {
                spec.x = currentX;
                spec.y = currentY;
                spec.unit.push(createElement(type, {
                    x: convertAxis(currentX),
                    y: convertAxis(currentY),
                    color: config.color,
                    size: config.size,
                    flip: config.flip,
                    colorGuide: currentGuide.color,
                    sizeGuide: currentGuide.size
                }));
                spec.guide = _.defaults(currentGuide, {
                    x: { label: currentX },
                    y: { label: currentY }
                });
            } else {
                spec = {
                    type: 'COORDS.RECT',
                    x: convertAxis(currentX),
                    y: convertAxis(currentY),
                    unit: [spec],
                    guide: _.defaults(currentGuide, {
                        x: { label: currentX },
                        y: { label: currentY }
                    })
                };
            }
        }

        config.spec = {
            dimensions: config.dimensions,
            unit: spec
        };
        return config;
    }

    exports.normalizeConfig = normalizeConfig;
    exports.transformConfig = transformConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcGkvY29udmVydGVyLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsUUFBSSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksSUFBSTtlQUFLLEFBQUMsQ0FBQyxJQUFJLEdBQUksSUFBSSxHQUFHLElBQUk7S0FBQSxDQUFDOztBQUVsRCxRQUFJLGlCQUFpQixHQUFHLFNBQXBCLGlCQUFpQixDQUFJLElBQUksRUFBMEI7WUFBeEIsWUFBWSx5REFBRyxJQUFJOztBQUM5QyxlQUFPLEFBQUMsQ0FBQyxZQUxMLEtBQUssQ0FLTSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQ3hCLENBQUMsSUFBSSxDQUFDLEdBQ04sQUFBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQztLQUNuRCxDQUFDOztBQUVGLFFBQUksYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBSSxJQUFJLEVBQUUsTUFBTSxFQUFLO0FBQ2xDLGVBQU87QUFDSCxnQkFBSSxFQUFFLElBQUk7QUFDVixhQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDWCxhQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDWCxpQkFBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0FBQ25CLGlCQUFLLEVBQUU7QUFDSCxxQkFBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVO0FBQ3hCLG9CQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVM7YUFDekI7QUFDRCxnQkFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0FBQ2pCLGdCQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7U0FDcEIsQ0FBQztLQUNMLENBQUM7O0FBRUYsUUFBTSxNQUFNLEdBQUc7QUFDWCxlQUFPLEVBQUUsU0FBUztBQUNsQixlQUFPLEVBQUUsU0FBUztBQUNsQixZQUFJLEVBQUUsTUFBTTtLQUNmLENBQUM7O0FBRUYsUUFBSSxxQkFBcUIseUVBQ3BCLE1BQU0sQ0FBQyxPQUFP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RSxJQUFJO1NBQ2IsQ0FBQztBQUNGLGVBQU8sTUFBTSxDQUFDO0tBQ2pCOztZQUVPLGVBQWUsR0FBZixlQUFlO1lBQUUsZUFBZSxHQUFmLGVBQWUiLCJmaWxlIjoic3JjL2FwaS9jb252ZXJ0ZXItaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZGVmYXVsdCBhcyBkM30gZnJvbSAnZDMnO1xuaW1wb3J0IHt1dGlsc30gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuXG52YXIgY29udmVydEF4aXMgPSAoZGF0YSkgPT4gKCFkYXRhKSA/IG51bGwgOiBkYXRhO1xuXG52YXIgbm9ybWFsaXplU2V0dGluZ3MgPSAoYXhpcywgZGVmYXVsdFZhbHVlID0gbnVsbCkgPT4ge1xuICAgIHJldHVybiAoIXV0aWxzLmlzQXJyYXkoYXhpcykpID9cbiAgICAgICAgW2F4aXNdIDpcbiAgICAgICAgKGF4aXMubGVuZ3RoID09PSAwKSA/IFtkZWZhdWx0VmFsdWVdIDogYXhpcztcbn07XG5cbnZhciBjcmVhdGVFbGVtZW50ID0gKHR5cGUsIGNvbmZpZykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIHg6IGNvbmZpZy54LFxuICAgICAgICB5OiBjb25maWcueSxcbiAgICAgICAgY29sb3I6IGNvbmZpZy5jb2xvcixcbiAgICAgICAgZ3VpZGU6IHtcbiAgICAgICAgICAgIGNvbG9yOiBjb25maWcuY29sb3JHdWlkZSxcbiAgICAgICAgICAgIHNpemU6IGNvbmZpZy5zaXplR3VpZGVcbiAgICAgICAgfSxcbiAgICAgICAgZmxpcDogY29uZmlnLmZsaXAsXG4gICAgICAgIHNpemU6IGNvbmZpZy5zaXplXG4gICAgfTtcbn07XG5cbmNvbnN0IHN0YXR1cyA9IHtcbiAgICBTVUNDRVNTOiAnU1VDQ0VTUycsXG4gICAgV0FSTklORzogJ1dBUk5JTkcnLFxuICAgIEZBSUw6ICdGQUlMJ1xufTtcblxudmFyIHN0cmF0ZWd5Tm9ybWFsaXplQXhpcyA9IHtcbiAgICBbc3RhdHVzLlNVQ0NFU1NdOiAoYXhpcykgPT4gYXhpcyxcbiAgICBbc3RhdHVzLkZBSUxdOiAoYXhpcywgZGF0YSkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKGRhdGEubWVzc2FnZXMgfHwgW10pLmpvaW4oJ1xcbicpIHx8XG4gICAgICAgICAgICAvLyBqc2NzOmRpc2FibGVcbiAgICAgICAgJ1RoaXMgY29uZmlndXJhdGlvbiBpcyBub3Qgc3VwcG9ydGVkLCBTZWUgaHR0cDovL2FwaS50YXVjaGFydHMuY29tL2Jhc2ljL2ZhY2V0Lmh0bWwjZWFzeS1hcHByb2FjaC1mb3ItY3JlYXRpbmctZmFjZXQtY2hhcnQnKTtcbiAgICB9LFxuICAgIFtzdGF0dXMuV0FSTklOR106IChheGlzLCBjb25maWcsIGd1aWRlKSA9PiB7XG4gICAgICAgIHZhciBheGlzTmFtZSA9IGNvbmZpZy5heGlzO1xuICAgICAgICB2YXIgaW5kZXggPSBjb25maWcuaW5kZXhNZWFzdXJlQXhpc1swXTtcbiAgICAgICAgdmFyIG1lYXN1cmUgPSBheGlzW2luZGV4XTtcbiAgICAgICAgdmFyIG5ld0F4aXMgPSBfLndpdGhvdXQoYXhpcywgbWVhc3VyZSk7XG4gICAgICAgIG5ld0F4aXMucHVzaChtZWFzdXJlKTtcblxuICAgICAgICB2YXIgbWVhc3VyZUd1aWRlID0gZ3VpZGVbaW5kZXhdW2F4aXNOYW1lXSB8fCB7fTtcbiAgICAgICAgdmFyIGNhdGVnb3J5R3VpZGUgPSBndWlkZVtndWlkZS5sZW5ndGggLSAxXVtheGlzTmFtZV0gfHwge307XG5cbiAgICAgICAgZ3VpZGVbZ3VpZGUubGVuZ3RoIC0gMV1bYXhpc05hbWVdID0gbWVhc3VyZUd1aWRlO1xuICAgICAgICBndWlkZVtpbmRleF1bYXhpc05hbWVdID0gY2F0ZWdvcnlHdWlkZTtcblxuICAgICAgICByZXR1cm4gbmV3QXhpcztcbiAgICB9XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUF4aXMoZGltZW5zaW9ucywgYXhpcywgYXhpc05hbWUpIHtcbiAgICByZXR1cm4gYXhpcy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwgaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbiA9IGRpbWVuc2lvbnNbaXRlbV07XG4gICAgICAgIGlmICghZGltZW5zaW9uKSB7XG4gICAgICAgICAgICByZXN1bHQuc3RhdHVzID0gc3RhdHVzLkZBSUw7XG4gICAgICAgICAgICBpZihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2VzLnB1c2goYFwiJHtpdGVtfVwiIGRpbWVuc2lvbiBpcyB1bmRlZmluZWQgZm9yIFwiJHtheGlzTmFtZX1cIiBheGlzYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlcy5wdXNoKGBcIiR7YXhpc05hbWV9XCIgYXhpcyBzaG91bGQgYmUgc3BlY2lmaWVkYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQuc3RhdHVzICE9IHN0YXR1cy5GQUlMKSB7XG4gICAgICAgICAgICBpZiAoZGltZW5zaW9uLnR5cGUgPT09ICdtZWFzdXJlJykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5jb3VudE1lYXN1cmVBeGlzKys7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmluZGV4TWVhc3VyZUF4aXMucHVzaChpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGltZW5zaW9uLnR5cGUgIT09ICdtZWFzdXJlJyAmJiByZXN1bHQuY291bnRNZWFzdXJlQXhpcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5zdGF0dXMgPSBzdGF0dXMuV0FSTklORztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LmNvdW50TWVhc3VyZUF4aXMgPiAxKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnN0YXR1cyA9IHN0YXR1cy5GQUlMO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlcy5wdXNoKGBUaGVyZSBpcyBtb3JlIHRoYW4gb25lIG1lYXN1cmUgZGltZW5zaW9uIGZvciBcIiR7YXhpc05hbWV9XCIgYXhpc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge3N0YXR1czogc3RhdHVzLlNVQ0NFU1MsIGNvdW50TWVhc3VyZUF4aXM6IDAsIGluZGV4TWVhc3VyZUF4aXM6IFtdLCBtZXNzYWdlczogW10sIGF4aXM6IGF4aXNOYW1lfSk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNvbmZpZyhjb25maWcpIHtcblxuICAgIHZhciB4ID0gbm9ybWFsaXplU2V0dGluZ3MoY29uZmlnLngpO1xuICAgIHZhciB5ID0gbm9ybWFsaXplU2V0dGluZ3MoY29uZmlnLnkpO1xuXG4gICAgdmFyIG1heERlZXAgPSBNYXRoLm1heCh4Lmxlbmd0aCwgeS5sZW5ndGgpO1xuXG4gICAgdmFyIGd1aWRlID0gbm9ybWFsaXplU2V0dGluZ3MoY29uZmlnLmd1aWRlLCB7fSk7XG5cbiAgICAvLyBmZWVsIHRoZSBnYXBzIGlmIG5lZWRlZFxuICAgIF8udGltZXMoKG1heERlZXAgLSBndWlkZS5sZW5ndGgpLCAoKSA9PiBndWlkZS5wdXNoKHt9KSk7XG5cbiAgICAvLyBjdXQgaXRlbXNcbiAgICBndWlkZSA9IGd1aWRlLnNsaWNlKDAsIG1heERlZXApO1xuXG4gICAgdmFyIHZhbGlkYXRlZFggPSB2YWxpZGF0ZUF4aXMoY29uZmlnLmRpbWVuc2lvbnMsIHgsICd4Jyk7XG4gICAgdmFyIHZhbGlkYXRlZFkgPSB2YWxpZGF0ZUF4aXMoY29uZmlnLmRpbWVuc2lvbnMsIHksICd5Jyk7XG4gICAgeCA9IHN0cmF0ZWd5Tm9ybWFsaXplQXhpc1t2YWxpZGF0ZWRYLnN0YXR1c10oeCwgdmFsaWRhdGVkWCwgZ3VpZGUpO1xuICAgIHkgPSBzdHJhdGVneU5vcm1hbGl6ZUF4aXNbdmFsaWRhdGVkWS5zdGF0dXNdKHksIHZhbGlkYXRlZFksIGd1aWRlKTtcblxuICAgIHJldHVybiBfLmV4dGVuZChcbiAgICAgICAge30sXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICBndWlkZTogZ3VpZGVcbiAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUNvbmZpZyh0eXBlLCBjb25maWcpIHtcblxuICAgIHZhciB4ID0gY29uZmlnLng7XG4gICAgdmFyIHkgPSBjb25maWcueTtcbiAgICB2YXIgZ3VpZGUgPSBjb25maWcuZ3VpZGU7XG4gICAgdmFyIG1heERlcHRoID0gTWF0aC5tYXgoeC5sZW5ndGgsIHkubGVuZ3RoKTtcblxuICAgIHZhciBzcGVjID0ge1xuICAgICAgICB0eXBlOiAnQ09PUkRTLlJFQ1QnLFxuICAgICAgICB1bml0OiBbXVxuICAgIH07XG5cbiAgICB2YXIgeHMgPSBbXS5jb25jYXQoeCk7XG4gICAgdmFyIHlzID0gW10uY29uY2F0KHkpO1xuICAgIHZhciBncyA9IFtdLmNvbmNhdChndWlkZSk7XG5cbiAgICBmb3IgKHZhciBpID0gbWF4RGVwdGg7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGN1cnJlbnRYID0geHMucG9wKCk7XG4gICAgICAgIHZhciBjdXJyZW50WSA9IHlzLnBvcCgpO1xuICAgICAgICB2YXIgY3VycmVudEd1aWRlID0gZ3MucG9wKCkgfHwge307XG4gICAgICAgIGlmIChpID09PSBtYXhEZXB0aCkge1xuICAgICAgICAgICAgc3BlYy54ID0gY3VycmVudFg7XG4gICAgICAgICAgICBzcGVjLnkgPSBjdXJyZW50WTtcbiAgICAgICAgICAgIHNwZWMudW5pdC5wdXNoKGNyZWF0ZUVsZW1lbnQodHlwZSwge1xuICAgICAgICAgICAgICAgIHg6IGNvbnZlcnRBeGlzKGN1cnJlbnRYKSxcbiAgICAgICAgICAgICAgICB5OiBjb252ZXJ0QXhpcyhjdXJyZW50WSksXG4gICAgICAgICAgICAgICAgY29sb3I6IGNvbmZpZy5jb2xvcixcbiAgICAgICAgICAgICAgICBzaXplOiBjb25maWcuc2l6ZSxcbiAgICAgICAgICAgICAgICBmbGlwOiBjb25maWcuZmxpcCxcbiAgICAgICAgICAgICAgICBjb2xvckd1aWRlOiBjdXJyZW50R3VpZGUuY29sb3IsXG4gICAgICAgICAgICAgICAgc2l6ZUd1aWRlOiBjdXJyZW50R3VpZGUuc2l6ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3BlYy5ndWlkZSA9IF8uZGVmYXVsdHMoXG4gICAgICAgICAgICAgICAgY3VycmVudEd1aWRlLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgeDoge2xhYmVsOiBjdXJyZW50WH0sXG4gICAgICAgICAgICAgICAgICAgIHk6IHtsYWJlbDogY3VycmVudFl9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzcGVjID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdDT09SRFMuUkVDVCcsXG4gICAgICAgICAgICAgICAgeDogY29udmVydEF4aXMoY3VycmVudFgpLFxuICAgICAgICAgICAgICAgIHk6IGNvbnZlcnRBeGlzKGN1cnJlbnRZKSxcbiAgICAgICAgICAgICAgICB1bml0OiBbc3BlY10sXG4gICAgICAgICAgICAgICAgZ3VpZGU6IF8uZGVmYXVsdHMoXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRHdWlkZSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDoge2xhYmVsOiBjdXJyZW50WH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB7bGFiZWw6IGN1cnJlbnRZfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbmZpZy5zcGVjID0ge1xuICAgICAgICBkaW1lbnNpb25zOiBjb25maWcuZGltZW5zaW9ucyxcbiAgICAgICAgdW5pdDogc3BlY1xuICAgIH07XG4gICAgcmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IHtub3JtYWxpemVDb25maWcsIHRyYW5zZm9ybUNvbmZpZ307Il19;
define('api/chart-interval',['exports', './converter-helpers'], function (exports, _converterHelpers) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var ChartInterval = function ChartInterval(rawConfig) {
        var config = (0, _converterHelpers.normalizeConfig)(rawConfig);
        return (0, _converterHelpers.transformConfig)('ELEMENT.INTERVAL', config);
    };

    exports.ChartInterval = ChartInterval;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcGkvY2hhcnQtaW50ZXJ2YWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLFFBQUksYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBSSxTQUFTLEVBQUs7QUFDL0IsWUFBSSxNQUFNLEdBQUcsc0JBSFQsZUFBZSxFQUdVLFNBQVMsQ0FBQyxDQUFDO0FBQ3hDLGVBQU8sc0JBSmMsZUFBZSxFQUliLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3RELENBQUM7O1lBRU0sYUFBYSxHQUFiLGFBQWEiLCJmaWxlIjoic3JjL2FwaS9jaGFydC1pbnRlcnZhbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7bm9ybWFsaXplQ29uZmlnLCB0cmFuc2Zvcm1Db25maWd9IGZyb20gJy4vY29udmVydGVyLWhlbHBlcnMnO1xuXG52YXIgQ2hhcnRJbnRlcnZhbCA9IChyYXdDb25maWcpID0+IHtcbiAgICB2YXIgY29uZmlnID0gbm9ybWFsaXplQ29uZmlnKHJhd0NvbmZpZyk7XG4gICAgcmV0dXJuIHRyYW5zZm9ybUNvbmZpZygnRUxFTUVOVC5JTlRFUlZBTCcsIGNvbmZpZyk7XG59O1xuXG5leHBvcnQge0NoYXJ0SW50ZXJ2YWx9OyJdfQ==;
define('api/chart-scatterplot',['exports', './converter-helpers'], function (exports, _converterHelpers) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var ChartScatterplot = function ChartScatterplot(rawConfig) {
        var config = (0, _converterHelpers.normalizeConfig)(rawConfig);
        return (0, _converterHelpers.transformConfig)('ELEMENT.POINT', config);
    };

    exports.ChartScatterplot = ChartScatterplot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcGkvY2hhcnQtc2NhdHRlcnBsb3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLFFBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUksU0FBUyxFQUFLO0FBQ2xDLFlBQUksTUFBTSxHQUFHLHNCQUhULGVBQWUsRUFHVSxTQUFTLENBQUMsQ0FBQztBQUN4QyxlQUFPLHNCQUpjLGVBQWUsRUFJYixlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDbkQsQ0FBQzs7WUFFTSxnQkFBZ0IsR0FBaEIsZ0JBQWdCIiwiZmlsZSI6InNyYy9hcGkvY2hhcnQtc2NhdHRlcnBsb3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge25vcm1hbGl6ZUNvbmZpZywgdHJhbnNmb3JtQ29uZmlnfSBmcm9tICcuL2NvbnZlcnRlci1oZWxwZXJzJztcblxudmFyIENoYXJ0U2NhdHRlcnBsb3QgPSAocmF3Q29uZmlnKSA9PiB7XG4gICAgdmFyIGNvbmZpZyA9IG5vcm1hbGl6ZUNvbmZpZyhyYXdDb25maWcpO1xuICAgIHJldHVybiB0cmFuc2Zvcm1Db25maWcoJ0VMRU1FTlQuUE9JTlQnLCBjb25maWcpO1xufTtcblxuZXhwb3J0IHtDaGFydFNjYXR0ZXJwbG90fTsiXX0=;
define('api/chart-line',['exports', '../utils/utils', '../data-processor', './converter-helpers'], function (exports, _utilsUtils, _dataProcessor, _converterHelpers) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var ChartLine = function ChartLine(rawConfig) {
        var config = (0, _converterHelpers.normalizeConfig)(rawConfig);

        var data = config.data;

        var log = config.settings.log;

        var lineOrientationStrategies = {

            none: function none(config) {
                return null;
            },

            horizontal: function horizontal(config) {
                var xs = _utilsUtils.utils.isArray(config.x) ? config.x : [config.x];
                return xs[xs.length - 1];
            },

            vertical: function vertical(config) {
                var ys = _utilsUtils.utils.isArray(config.y) ? config.y : [config.y];
                return ys[ys.length - 1];
            },

            auto: function auto(config) {
                var xs = _utilsUtils.utils.isArray(config.x) ? config.x : [config.x];
                var ys = _utilsUtils.utils.isArray(config.y) ? config.y : [config.y];
                var primaryX = xs[xs.length - 1];
                var secondaryX = xs.slice(0, xs.length - 1);
                var primaryY = ys[ys.length - 1];
                var secondaryY = ys.slice(0, ys.length - 1);
                var colorProp = config.color;

                var rest = secondaryX.concat(secondaryY).concat([colorProp]).filter(function (x) {
                    return x !== null;
                });

                var variantIndex = -1;
                var variations = [[[primaryX].concat(rest), primaryY], [[primaryY].concat(rest), primaryX]];
                var isMatchAny = variations.some(function (item, i) {
                    var domainFields = item[0];
                    var rangeProperty = item[1];
                    var r = _dataProcessor.DataProcessor.isYFunctionOfX(data, domainFields, [rangeProperty]);
                    if (r.result) {
                        variantIndex = i;
                    } else {
                        log(['Attempt to find a functional relation between', item[0] + ' and ' + item[1] + ' is failed.', 'There are several ' + r.error.keyY + ' values (e.g. ' + r.error.errY.join(',') + ')', 'for (' + r.error.keyX + ' = ' + r.error.valX + ').'].join(' '));
                    }
                    return r.result;
                });

                var propSortBy;
                if (isMatchAny) {
                    propSortBy = variations[variantIndex][0][0];
                } else {
                    log(['All attempts are failed.', 'Will orient line horizontally by default.', 'NOTE: the [scatterplot] chart is more convenient for that data.'].join(' '));
                    propSortBy = primaryX;
                }

                return propSortBy;
            }
        };

        var orient = (config.lineOrientation || 'auto').toLowerCase();
        var strategy = lineOrientationStrategies.hasOwnProperty(orient) ? lineOrientationStrategies[orient] : lineOrientationStrategies.auto;

        var propSortBy = strategy(config);
        if (propSortBy !== null) {
            config.data = _(data).sortBy(propSortBy);
        }

        return (0, _converterHelpers.transformConfig)('ELEMENT.LINE', config);
    };

    exports.ChartLine = ChartLine;
});
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQyxDQUFDO0FBQ2IsOEJBQVUsR0FBRyxRQUFRLENBQUM7aUJBQ3pCOztBQUVELHVCQUFPLFVBQVUsQ0FBQzthQUNyQjtTQUNKLENBQUM7O0FBRUYsWUFBSSxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxJQUFJLE1BQU0sQ0FBQSxDQUFFLFdBQVcsRUFBRSxDQUFDO0FBQzlELFlBQUksUUFBUSxHQUFHLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FDM0QseUJBQXlCLENBQUMsTUFBTSxDQUFDLEdBQ2pDLHlCQUF5QixDQUFDLElBQUksQ0FBQzs7QUFFbkMsWUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLFlBQUksVUFBVSxLQUFLLElBQUksRUFBRTtBQUNyQixrQkFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzVDOztBQUVELGVBQU8sc0JBbEZjLGVBQWUsRUFrRmIsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ2xELENBQUM7O1lBRU0sU0FBUyxHQUFULFNBQVMiLCJmaWxlIjoic3JjL2FwaS9jaGFydC1saW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt1dGlsc30gZnJvbSAnLi4vdXRpbHMvdXRpbHMnO1xuaW1wb3J0IHtEYXRhUHJvY2Vzc29yfSBmcm9tICcuLi9kYXRhLXByb2Nlc3Nvcic7XG5pbXBvcnQge25vcm1hbGl6ZUNvbmZpZywgdHJhbnNmb3JtQ29uZmlnfSBmcm9tICcuL2NvbnZlcnRlci1oZWxwZXJzJztcblxudmFyIENoYXJ0TGluZSA9IChyYXdDb25maWcpID0+IHtcbiAgICB2YXIgY29uZmlnID0gbm9ybWFsaXplQ29uZmlnKHJhd0NvbmZpZyk7XG5cbiAgICB2YXIgZGF0YSA9IGNvbmZpZy5kYXRhO1xuXG4gICAgdmFyIGxvZyA9IGNvbmZpZy5zZXR0aW5ncy5sb2c7XG5cbiAgICB2YXIgbGluZU9yaWVudGF0aW9uU3RyYXRlZ2llcyA9IHtcblxuICAgICAgICBub25lOiAoY29uZmlnKSA9PiBudWxsLFxuXG4gICAgICAgIGhvcml6b250YWw6IChjb25maWcpID0+IHtcbiAgICAgICAgICAgIHZhciB4cyA9IHV0aWxzLmlzQXJyYXkoY29uZmlnLngpID8gY29uZmlnLnggOiBbY29uZmlnLnhdO1xuICAgICAgICAgICAgcmV0dXJuIHhzW3hzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZlcnRpY2FsOiAoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICB2YXIgeXMgPSB1dGlscy5pc0FycmF5KGNvbmZpZy55KSA/IGNvbmZpZy55IDogW2NvbmZpZy55XTtcbiAgICAgICAgICAgIHJldHVybiB5c1t5cy5sZW5ndGggLSAxXTtcbiAgICAgICAgfSxcblxuICAgICAgICBhdXRvOiAoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICB2YXIgeHMgPSB1dGlscy5pc0FycmF5KGNvbmZpZy54KSA/IGNvbmZpZy54IDogW2NvbmZpZy54XTtcbiAgICAgICAgICAgIHZhciB5cyA9IHV0aWxzLmlzQXJyYXkoY29uZmlnLnkpID8gY29uZmlnLnkgOiBbY29uZmlnLnldO1xuICAgICAgICAgICAgdmFyIHByaW1hcnlYID0geHNbeHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB2YXIgc2Vjb25kYXJ5WCA9IHhzLnNsaWNlKDAsIHhzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgdmFyIHByaW1hcnlZID0geXNbeXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB2YXIgc2Vjb25kYXJ5WSA9IHlzLnNsaWNlKDAsIHlzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgdmFyIGNvbG9yUHJvcCA9IGNvbmZpZy5jb2xvcjtcblxuICAgICAgICAgICAgdmFyIHJlc3QgPSBzZWNvbmRhcnlYLmNvbmNhdChzZWNvbmRhcnlZKS5jb25jYXQoW2NvbG9yUHJvcF0pLmZpbHRlcigoeCkgPT4geCAhPT0gbnVsbCk7XG5cbiAgICAgICAgICAgIHZhciB2YXJpYW50SW5kZXggPSAtMTtcbiAgICAgICAgICAgIHZhciB2YXJpYXRpb25zID0gW1xuICAgICAgICAgICAgICAgIFtbcHJpbWFyeVhdLmNvbmNhdChyZXN0KSwgcHJpbWFyeVldLFxuICAgICAgICAgICAgICAgIFtbcHJpbWFyeVldLmNvbmNhdChyZXN0KSwgcHJpbWFyeVhdXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdmFyIGlzTWF0Y2hBbnkgPSB2YXJpYXRpb25zLnNvbWUoKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgZG9tYWluRmllbGRzID0gaXRlbVswXTtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2VQcm9wZXJ0eSA9IGl0ZW1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBEYXRhUHJvY2Vzc29yLmlzWUZ1bmN0aW9uT2ZYKGRhdGEsIGRvbWFpbkZpZWxkcywgW3JhbmdlUHJvcGVydHldKTtcbiAgICAgICAgICAgICAgICBpZiAoci5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2coW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0dGVtcHQgdG8gZmluZCBhIGZ1bmN0aW9uYWwgcmVsYXRpb24gYmV0d2VlbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtWzBdICsgJyBhbmQgJyArIGl0ZW1bMV0gKyAnIGlzIGZhaWxlZC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RoZXJlIGFyZSBzZXZlcmFsICcgKyByLmVycm9yLmtleVkgKyAnIHZhbHVlcyAoZS5nLiAnICsgci5lcnJvci5lcnJZLmpvaW4oJywnKSArICcpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmb3IgKCcgKyByLmVycm9yLmtleVggKyAnID0gJyArIHIuZXJyb3IudmFsWCArICcpLidcbiAgICAgICAgICAgICAgICAgICAgXS5qb2luKCcgJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gci5yZXN1bHQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHByb3BTb3J0Qnk7XG4gICAgICAgICAgICBpZiAoaXNNYXRjaEFueSkge1xuICAgICAgICAgICAgICAgIHByb3BTb3J0QnkgPSB2YXJpYXRpb25zW3ZhcmlhbnRJbmRleF1bMF1bMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZyhbXG4gICAgICAgICAgICAgICAgICAgICdBbGwgYXR0ZW1wdHMgYXJlIGZhaWxlZC4nLFxuICAgICAgICAgICAgICAgICAgICAnV2lsbCBvcmllbnQgbGluZSBob3Jpem9udGFsbHkgYnkgZGVmYXVsdC4nLFxuICAgICAgICAgICAgICAgICAgICAnTk9URTogdGhlIFtzY2F0dGVycGxvdF0gY2hhcnQgaXMgbW9yZSBjb252ZW5pZW50IGZvciB0aGF0IGRhdGEuJ1xuICAgICAgICAgICAgICAgIF0uam9pbignICcpKTtcbiAgICAgICAgICAgICAgICBwcm9wU29ydEJ5ID0gcHJpbWFyeVg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwcm9wU29ydEJ5O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBvcmllbnQgPSAoY29uZmlnLmxpbmVPcmllbnRhdGlvbiB8fCAnYXV0bycpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIHN0cmF0ZWd5ID0gbGluZU9yaWVudGF0aW9uU3RyYXRlZ2llcy5oYXNPd25Qcm9wZXJ0eShvcmllbnQpID9cbiAgICAgICAgbGluZU9yaWVudGF0aW9uU3RyYXRlZ2llc1tvcmllbnRdIDpcbiAgICAgICAgbGluZU9yaWVudGF0aW9uU3RyYXRlZ2llcy5hdXRvO1xuXG4gICAgdmFyIHByb3BTb3J0QnkgPSBzdHJhdGVneShjb25maWcpO1xuICAgIGlmIChwcm9wU29ydEJ5ICE9PSBudWxsKSB7XG4gICAgICAgIGNvbmZpZy5kYXRhID0gXyhkYXRhKS5zb3J0QnkocHJvcFNvcnRCeSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zZm9ybUNvbmZpZygnRUxFTUVOVC5MSU5FJywgY29uZmlnKTtcbn07XG5cbmV4cG9ydCB7Q2hhcnRMaW5lfTsiXX0=;
define('api/chart-interval-stacked',['exports', './converter-helpers'], function (exports, _converterHelpers) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var ChartIntervalStacked = function ChartIntervalStacked(rawConfig) {
        var config = (0, _converterHelpers.normalizeConfig)(rawConfig);
        return (0, _converterHelpers.transformConfig)('ELEMENT.INTERVAL.STACKED', config);
    };

    exports.ChartIntervalStacked = ChartIntervalStacked;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcGkvY2hhcnQtaW50ZXJ2YWwtc3RhY2tlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUEsUUFBSSxvQkFBb0IsR0FBRyxTQUF2QixvQkFBb0IsQ0FBSSxTQUFTLEVBQUs7QUFDdEMsWUFBSSxNQUFNLEdBQUcsc0JBSFQsZUFBZSxFQUdVLFNBQVMsQ0FBQyxDQUFDO0FBQ3hDLGVBQU8sc0JBSmMsZUFBZSxFQUliLDBCQUEwQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzlELENBQUM7O1lBRU0sb0JBQW9CLEdBQXBCLG9CQUFvQiIsImZpbGUiOiJzcmMvYXBpL2NoYXJ0LWludGVydmFsLXN0YWNrZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge25vcm1hbGl6ZUNvbmZpZywgdHJhbnNmb3JtQ29uZmlnfSBmcm9tICcuL2NvbnZlcnRlci1oZWxwZXJzJztcblxudmFyIENoYXJ0SW50ZXJ2YWxTdGFja2VkID0gKHJhd0NvbmZpZykgPT4ge1xuICAgIHZhciBjb25maWcgPSBub3JtYWxpemVDb25maWcocmF3Q29uZmlnKTtcbiAgICByZXR1cm4gdHJhbnNmb3JtQ29uZmlnKCdFTEVNRU5ULklOVEVSVkFMLlNUQUNLRUQnLCBjb25maWcpO1xufTtcblxuZXhwb3J0IHtDaGFydEludGVydmFsU3RhY2tlZH07Il19;
define('api/chart-parallel',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    var ChartParallel = function ChartParallel(config) {

        var guide = _.extend({
            columns: {}
        }, config.guide || {});

        var scales = {};

        var scalesPool = function scalesPool(type, prop) {
            var guide = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var key;
            var dim = prop;
            var src;
            if (!prop) {
                key = type + ':default';
                src = '?';
            } else {
                key = type + '_' + prop;
                src = '/';
            }

            if (!scales.hasOwnProperty(key)) {
                scales[key] = _.extend({ type: type, source: src, dim: dim }, guide);
            }

            return key;
        };

        var cols = config.columns.map(function (c) {
            return scalesPool(config.dimensions[c].scale, c, guide.columns[c]);
        });

        return {
            sources: {
                '?': {
                    dims: {},
                    data: [{}]
                },
                '/': {
                    dims: Object.keys(config.dimensions).reduce(function (dims, k) {
                        dims[k] = { type: config.dimensions[k].type };
                        return dims;
                    }, {}),
                    data: config.data
                }
            },

            scales: scales,

            unit: {
                type: 'COORDS.PARALLEL',
                expression: { operator: 'none', source: '/' },
                columns: cols,
                guide: guide,
                units: [{
                    type: 'PARALLEL/ELEMENT.LINE',
                    color: scalesPool('color', config.color, guide.color),
                    columns: cols,
                    expression: { operator: 'none', source: '/' }
                }]
            },

            plugins: config.plugins || []
        };
    };

    exports.ChartParallel = ChartParallel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcGkvY2hhcnQtcGFyYWxsZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsUUFBSSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLE1BQU0sRUFBSzs7QUFFNUIsWUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FDaEI7QUFDSSxtQkFBTyxFQUFFLEVBQUU7U0FDZCxFQUNELE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUM7O0FBRXhCLFlBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsWUFBSSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksSUFBSSxFQUFFLElBQUksRUFBaUI7Z0JBQWYsS0FBSyx5REFBRyxFQUFFOztBQUNwQyxnQkFBSSxHQUFHLENBQUM7QUFDUixnQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2YsZ0JBQUksR0FBRyxDQUFDO0FBQ1IsZ0JBQUksQ0FBQyxJQUFJLEVBQUU7QUFDUCxtQkFBRyxHQUFNLElBQUksYUFBVSxDQUFDO0FBQ3hCLG1CQUFHLEdBQUcsR0FBRyxDQUFDO2FBQ2IsTUFBTTtBQUNILG1CQUFHLEdBQU0sSUFBSSxTQUFJLElBQUksQUFBRSxDQUFDO0FBQ3hCLG1CQUFHLEdBQUcsR0FBRyxDQUFDO2FBQ2I7O0FBRUQsZ0JBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLHNCQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FDbEIsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBQyxFQUNuQyxLQUFLLENBQ1IsQ0FBQzthQUNMOztBQUVELG1CQUFPLEdBQUcsQ0FBQztTQUNkLENBQUM7O0FBRUYsWUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDO21CQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFBLENBQUMsQ0FBQzs7QUFFbEcsZUFBTztBQUNILG1CQUFPLEVBQUU7QUFDTCxtQkFBRyxFQUFFO0FBQ0Qsd0JBQUksRUFBRSxFQUFFO0FBQ1Isd0JBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztpQkFDYjtBQUNELG1CQUFHLEVBQUU7QUFDRCx3QkFBSSxFQUFFLE1BQU0sQ0FDUCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUN2QixNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFLO0FBQ2pCLDRCQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQztBQUM1QywrQkFBTyxJQUFJLENBQUM7cUJBQ2YsRUFBRSxFQUFFLENBQUM7QUFDVix3QkFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO2lCQUNwQjthQUNKOztBQUVELGtCQUFNLEVBQUUsTUFBTTs7QUFFZCxnQkFBSSxFQUFFO0FBQ0Ysb0JBQUksRUFBRSxpQkFBaUI7QUFDdkIsMEJBQVUsRUFBRSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBQztBQUMzQyx1QkFBTyxFQUFFLElBQUk7QUFDYixxQkFBSyxFQUFFLEtBQUs7QUFDWixxQkFBSyxFQUFFLENBQ0g7QUFDSSx3QkFBSSxFQUFFLHVCQUF1QjtBQUM3Qix5QkFBSyxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3JELDJCQUFPLEVBQUUsSUFBSTtBQUNiLDhCQUFVLEVBQUUsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUM7aUJBQzlDLENBQ0o7YUFDSjs7QUFFRCxtQkFBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRTtTQUNoQyxDQUFDO0tBQ0wsQ0FBQzs7WUFFTSxhQUFhLEdBQWIsYUFBYSIsImZpbGUiOiJzcmMvYXBpL2NoYXJ0LXBhcmFsbGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIENoYXJ0UGFyYWxsZWwgPSAoY29uZmlnKSA9PiB7XG5cbiAgICB2YXIgZ3VpZGUgPSBfLmV4dGVuZChcbiAgICAgICAge1xuICAgICAgICAgICAgY29sdW1uczoge31cbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlnLmd1aWRlIHx8IHt9KTtcblxuICAgIHZhciBzY2FsZXMgPSB7fTtcblxuICAgIHZhciBzY2FsZXNQb29sID0gKHR5cGUsIHByb3AsIGd1aWRlID0ge30pID0+IHtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgdmFyIGRpbSA9IHByb3A7XG4gICAgICAgIHZhciBzcmM7XG4gICAgICAgIGlmICghcHJvcCkge1xuICAgICAgICAgICAga2V5ID0gYCR7dHlwZX06ZGVmYXVsdGA7XG4gICAgICAgICAgICBzcmMgPSAnPyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBgJHt0eXBlfV8ke3Byb3B9YDtcbiAgICAgICAgICAgIHNyYyA9ICcvJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2NhbGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHNjYWxlc1trZXldID0gXy5leHRlbmQoXG4gICAgICAgICAgICAgICAge3R5cGU6IHR5cGUsIHNvdXJjZTogc3JjLCBkaW06IGRpbX0sXG4gICAgICAgICAgICAgICAgZ3VpZGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ga2V5O1xuICAgIH07XG5cbiAgICB2YXIgY29scyA9IGNvbmZpZy5jb2x1bW5zLm1hcCgoYykgPT4gc2NhbGVzUG9vbChjb25maWcuZGltZW5zaW9uc1tjXS5zY2FsZSwgYywgZ3VpZGUuY29sdW1uc1tjXSkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlczoge1xuICAgICAgICAgICAgJz8nOiB7XG4gICAgICAgICAgICAgICAgZGltczoge30sXG4gICAgICAgICAgICAgICAgZGF0YTogW3t9XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICcvJzoge1xuICAgICAgICAgICAgICAgIGRpbXM6IE9iamVjdFxuICAgICAgICAgICAgICAgICAgICAua2V5cyhjb25maWcuZGltZW5zaW9ucylcbiAgICAgICAgICAgICAgICAgICAgLnJlZHVjZSgoZGltcywgaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGltc1trXSA9IHt0eXBlOiBjb25maWcuZGltZW5zaW9uc1trXS50eXBlfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkaW1zO1xuICAgICAgICAgICAgICAgICAgICB9LCB7fSksXG4gICAgICAgICAgICAgICAgZGF0YTogY29uZmlnLmRhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzY2FsZXM6IHNjYWxlcyxcblxuICAgICAgICB1bml0OiB7XG4gICAgICAgICAgICB0eXBlOiAnQ09PUkRTLlBBUkFMTEVMJyxcbiAgICAgICAgICAgIGV4cHJlc3Npb246IHtvcGVyYXRvcjogJ25vbmUnLCBzb3VyY2U6ICcvJ30sXG4gICAgICAgICAgICBjb2x1bW5zOiBjb2xzLFxuICAgICAgICAgICAgZ3VpZGU6IGd1aWRlLFxuICAgICAgICAgICAgdW5pdHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQQVJBTExFTC9FTEVNRU5ULkxJTkUnLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogc2NhbGVzUG9vbCgnY29sb3InLCBjb25maWcuY29sb3IsIGd1aWRlLmNvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uczogY29scyxcbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjoge29wZXJhdG9yOiAnbm9uZScsIHNvdXJjZTogJy8nfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcblxuICAgICAgICBwbHVnaW5zOiBjb25maWcucGx1Z2lucyB8fCBbXVxuICAgIH07XG59O1xuXG5leHBvcnQge0NoYXJ0UGFyYWxsZWx9OyJdfQ==;
define('tau.charts',['exports', './utils/utils-dom', './utils/utils', './charts/tau.gpl', './charts/tau.plot', './charts/tau.chart', './unit-domain-period-generator', './formatter-registry', './units-registry', './scales-registry', './elements/coords.cartesian', './elements/coords.parallel', './elements/coords.geomap', './elements/element.point', './elements/element.line', './elements/element.pie', './elements/element.interval', './elements/element.interval.stacked', './elements/element.parallel.line', './scales/color', './scales/size', './scales/ordinal', './scales/period', './scales/time', './scales/linear', './scales/value', './scales/fill', './chart-alias-registry', './api/chart-map', './api/chart-interval', './api/chart-scatterplot', './api/chart-line', './api/chart-interval-stacked', './api/chart-parallel', './error'], function (exports, _utilsUtilsDom, _utilsUtils, _chartsTauGpl, _chartsTauPlot, _chartsTauChart, _unitDomainPeriodGenerator, _formatterRegistry, _unitsRegistry, _scalesRegistry, _elementsCoordsCartesian, _elementsCoordsParallel, _elementsCoordsGeomap, _elementsElementPoint, _elementsElementLine, _elementsElementPie, _elementsElementInterval, _elementsElementIntervalStacked, _elementsElementParallelLine, _scalesColor, _scalesSize, _scalesOrdinal, _scalesPeriod, _scalesTime, _scalesLinear, _scalesValue, _scalesFill, _chartAliasRegistry, _apiChartMap, _apiChartInterval, _apiChartScatterplot, _apiChartLine, _apiChartIntervalStacked, _apiChartParallel, _error) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var colorBrewers = {};
    var plugins = {};

    var __api__ = {
        UnitDomainPeriodGenerator: _unitDomainPeriodGenerator.UnitDomainPeriodGenerator
    };
    var api = {
        errorCodes: _error.errorCodes,
        unitsRegistry: _unitsRegistry.unitsRegistry,
        scalesRegistry: _scalesRegistry.scalesRegistry,
        tickFormat: _formatterRegistry.FormatterRegistry,
        isChartElement: _utilsUtils.utils.isChartElement,
        isLineElement: _utilsUtils.utils.isLineElement,
        d3: d3,
        _: _,
        tickPeriod: _unitDomainPeriodGenerator.UnitDomainPeriodGenerator,
        colorBrewers: {
            add: function add(name, brewer) {
                if (!(name in colorBrewers)) {
                    colorBrewers[name] = brewer;
                }
            },
            get: function get(name) {
                return colorBrewers[name];
            }
        },
        plugins: {
            add: function add(name, brewer) {
                if (!(name in plugins)) {
                    plugins[name] = brewer;
                } else {
                    throw new Error('Plugin is already registered.');
                }
            },
            get: function get(name) {
                return plugins[name] || function (x) {
                    throw new Error(x + ' plugin is not defined');
                };
            }
        },
        globalSettings: {

            log: function log(msg, type) {
                type = type || 'INFO';
                if (!Array.isArray(msg)) {
                    msg = [msg];
                }
                console[type.toLowerCase()].apply(console, msg);
            },

            excludeNull: true,
            specEngine: [{
                name: 'COMPACT',
                width: 600
            }, {
                name: 'AUTO',
                width: Number.MAX_VALUE
            }],

            fitModel: 'normal',
            optimizeGuideBySize: true,
            layoutEngine: 'EXTRACT',
            autoRatio: true,
            defaultSourceMap: ['https://raw.githubusercontent.com', 'TargetProcess/tauCharts/master/src/addons', 'world-countries.json'].join('/'),

            getAxisTickLabelSize: _.memoize(_utilsUtilsDom.utilsDom.getAxisTickLabelSize, function (text) {
                return (text || '').length;
            }),

            getScrollBarWidth: _.memoize(_utilsUtilsDom.utilsDom.getScrollbarWidth),

            xAxisTickLabelLimit: 100,
            yAxisTickLabelLimit: 100,

            xTickWordWrapLinesLimit: 2,
            yTickWordWrapLinesLimit: 2,

            xTickWidth: 6 + 3,
            yTickWidth: 6 + 3,

            distToXAxisLabel: 20,
            distToYAxisLabel: 20,

            xAxisPadding: 20,
            yAxisPadding: 20,

            xFontLabelHeight: 10,
            yFontLabelHeight: 10,

            xDensityPadding: 4,
            yDensityPadding: 4,
            'xDensityPadding:measure': 8,
            'yDensityPadding:measure': 8,

            defaultFormats: {
                measure: 'x-num-auto',
                'measure:time': 'x-time-auto'
            }
        }
    };

    _chartsTauPlot.Plot.__api__ = api;
    _chartsTauPlot.Plot.globalSettings = api.globalSettings;

    api.unitsRegistry.reg('COORDS.RECT', _elementsCoordsCartesian.Cartesian).reg('COORDS.MAP', _elementsCoordsGeomap.GeoMap).reg('COORDS.PARALLEL', _elementsCoordsParallel.Parallel).reg('ELEMENT.POINT', _elementsElementPoint.Point).reg('ELEMENT.LINE', _elementsElementLine.Line).reg('ELEMENT.INTERVAL', _elementsElementInterval.Interval).reg('ELEMENT.INTERVAL.STACKED', _elementsElementIntervalStacked.StackedInterval).reg('RECT', _elementsCoordsCartesian.Cartesian).reg('POINT', _elementsElementPoint.Point).reg('INTERVAL', _elementsElementInterval.Interval).reg('LINE', _elementsElementLine.Line).reg('PARALLEL/ELEMENT.LINE', _elementsElementParallelLine.ParallelLine).reg('PIE', _elementsElementPie.Pie);

    api.scalesRegistry.reg('color', _scalesColor.ColorScale).reg('fill', _scalesFill.FillScale).reg('size', _scalesSize.SizeScale).reg('ordinal', _scalesOrdinal.OrdinalScale).reg('period', _scalesPeriod.PeriodScale).reg('time', _scalesTime.TimeScale).reg('linear', _scalesLinear.LinearScale).reg('value', _scalesValue.ValueScale);

    var commonRules = [function (config) {
        return !config.data ? ['[data] must be specified'] : [];
    }];

    api.chartTypesRegistry = _chartAliasRegistry.chartTypesRegistry.add('scatterplot', _apiChartScatterplot.ChartScatterplot, commonRules).add('line', _apiChartLine.ChartLine, commonRules).add('bar', function (cfg) {
        return (0, _apiChartInterval.ChartInterval)(_.defaults({ flip: false }, cfg));
    }, commonRules).add('horizontalBar', function (cfg) {
        return (0, _apiChartInterval.ChartInterval)(_.defaults({ flip: true }, cfg));
    }, commonRules).add('horizontal-bar', function (cfg) {
        return (0, _apiChartInterval.ChartInterval)(_.defaults({ flip: true }, cfg));
    }, commonRules).add('map', _apiChartMap.ChartMap, commonRules.concat([function (config) {
        var shouldSpecifyFillWithCode = config.fill && config.code;
        if (config.fill && !shouldSpecifyFillWithCode) {
            return '[code] must be specified when using [fill]';
        }
    }, function (config) {
        var shouldSpecifyBothLatLong = config.latitude && config.longitude;
        if ((config.latitude || config.longitude) && !shouldSpecifyBothLatLong) {
            return '[latitude] and [longitude] both must be specified';
        }
    }])).add('stacked-bar', function (cfg) {
        return (0, _apiChartIntervalStacked.ChartIntervalStacked)(_.defaults({ flip: false }, cfg));
    }, commonRules).add('horizontal-stacked-bar', function (cfg) {
        return (0, _apiChartIntervalStacked.ChartIntervalStacked)(_.defaults({ flip: true }, cfg));
    }, commonRules).add('parallel', _apiChartParallel.ChartParallel, commonRules.concat([function (config) {
        var shouldSpecifyColumns = config.columns && config.columns.length > 1;
        if (!shouldSpecifyColumns) {
            return '[columns] property must contain at least 2 dimensions';
        }
    }]));

    exports.GPL = _chartsTauGpl.GPL;
    exports.Plot = _chartsTauPlot.Plot;
    exports.Chart = _chartsTauChart.Chart;
    exports.__api__ = __api__;
    exports.api = api;
});
 define('underscore',function(){
   return _;
 });
 define('d3',function(){
    return d3;
  });
 return require('tau.charts');
}));