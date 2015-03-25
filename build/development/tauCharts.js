/*! taucharts - v0.3.22 - 2015-03-25
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

define('utils/utils-dom',["exports"], function (exports) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * Internal method to return CSS value for given element and property
     */
    var tempDiv = document.createElement("div");

    var utilsDom = {
        appendTo: function appendTo(el, container) {
            var node;
            if (el instanceof Node) {
                node = el;
            } else {
                tempDiv.insertAdjacentHTML("afterbegin", el);
                node = tempDiv.childNodes[0];
            }
            container.appendChild(node);
            return node;
        },
        getScrollbarWidth: function getScrollbarWidth() {
            var div = document.createElement("div");
            div.style.overflow = "scroll";
            div.style.visibility = "hidden";
            div.style.position = "absolute";
            div.style.width = "100px";
            div.style.height = "100px";

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
            var pl = this.getStyleAsNum(el, "padding-left");
            var pr = this.getStyleAsNum(el, "padding-right");
            var pb = this.getStyleAsNum(el, "padding-bottom");
            var pt = this.getStyleAsNum(el, "padding-top");

            var borderWidthT = this.getStyleAsNum(el, "border-top-width");
            var borderWidthL = this.getStyleAsNum(el, "border-left-width");
            var borderWidthR = this.getStyleAsNum(el, "border-right-width");
            var borderWidthB = this.getStyleAsNum(el, "border-bottom-width");

            var bw = borderWidthT + borderWidthL + borderWidthR + borderWidthB;

            var rect = el.getBoundingClientRect();

            return {
                width: rect.width - pl - pr - 2 * bw,
                height: rect.height - pb - pt - 2 * bw
            };
        },

        getAxisTickLabelSize: function getAxisTickLabelSize(text) {

            var tmpl = ["<svg class=\"graphical-report__svg\">", "<g class=\"graphical-report__cell cell\">", "<g class=\"x axis\">", "<g class=\"tick\"><text><%= xTick %></text></g>", "</g>", "</g>", "</svg>"].join("");

            var compiled = _.template(tmpl);

            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.visibility = "hidden";
            div.style.width = "100px";
            div.style.height = "100px";
            div.style.border = "1px solid green";
            document.body.appendChild(div);

            div.innerHTML = compiled({ xTick: text });

            var textNode = d3.select(div).selectAll(".x.axis .tick text")[0][0];

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
define('const',["exports"], function (exports) {
  

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var CSS_PREFIX = "graphical-report__";
  exports.CSS_PREFIX = CSS_PREFIX;
});
define('elements/element.point',["exports", "../const"], function (exports, _const) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;

    var Point = exports.Point = (function () {
        function Point(config) {
            _classCallCheck(this, Point);

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
        }

        _createClass(Point, {
            drawLayout: {
                value: function drawLayout(fnCreateScale) {

                    var config = this.config;

                    this.xScale = fnCreateScale("pos", config.x, [0, config.options.width]);
                    this.yScale = fnCreateScale("pos", config.y, [config.options.height, 0]);
                    this.color = fnCreateScale("color", config.color, {});

                    var fitSize = function (w, h, maxRelLimit, srcSize, minimalSize) {
                        var minRefPoint = Math.min(w, h);
                        var minSize = minRefPoint * maxRelLimit;
                        return Math.max(minimalSize, Math.min(srcSize, minSize));
                    };

                    var width = config.options.width;
                    var height = config.options.height;
                    var g = config.guide;
                    var minimalSize = 1;
                    var maxRelLimit = 0.035;
                    var isNotZero = function (x) {
                        return x !== 0;
                    };
                    var minFontSize = _.min([g.x.tickFontHeight, g.y.tickFontHeight].filter(isNotZero)) * 0.5;
                    var minTickStep = _.min([g.x.density, g.y.density].filter(isNotZero)) * 0.5;

                    this.size = fnCreateScale("size", config.size, {
                        min: fitSize(width, height, maxRelLimit, 2, minimalSize),
                        max: fitSize(width, height, maxRelLimit, minTickStep, minimalSize),
                        mid: fitSize(width, height, maxRelLimit, minFontSize, minimalSize)
                    });

                    return this;
                }
            },
            drawFrames: {
                value: function drawFrames(frames) {

                    var options = this.config.options;

                    var prefix = "" + CSS_PREFIX + "dot dot i-role-element i-role-datum";

                    var xScale = this.xScale;
                    var yScale = this.yScale;
                    var cScale = this.color;
                    var sScale = this.size;

                    var enter = function enter() {
                        return this.attr({
                            r: function (_ref) {
                                var d = _ref.data;
                                return sScale(d[sScale.dim]);
                            },
                            cx: function (_ref) {
                                var d = _ref.data;
                                return xScale(d[xScale.dim]);
                            },
                            cy: function (_ref) {
                                var d = _ref.data;
                                return yScale(d[yScale.dim]);
                            },
                            "class": function (_ref) {
                                var d = _ref.data;
                                return "" + prefix + " " + cScale(d[cScale.dim]);
                            }
                        }).transition().duration(500).attr("r", function (_ref) {
                            var d = _ref.data;
                            return sScale(d[sScale.dim]);
                        });
                    };

                    var update = function update() {
                        return this.attr({
                            r: function (_ref) {
                                var d = _ref.data;
                                return sScale(d[sScale.dim]);
                            },
                            cx: function (_ref) {
                                var d = _ref.data;
                                return xScale(d[xScale.dim]);
                            },
                            cy: function (_ref) {
                                var d = _ref.data;
                                return yScale(d[yScale.dim]);
                            },
                            "class": function (_ref) {
                                var d = _ref.data;
                                return "" + prefix + " " + cScale(d[cScale.dim]);
                            }
                        });
                    };

                    var updateGroups = function updateGroups() {

                        this.attr("class", function (f) {
                            return "frame-id-" + options.uid + " frame-" + f.hash;
                        }).call(function () {
                            var points = this.selectAll("circle").data(function (frame) {
                                return frame.data.map(function (item) {
                                    return { data: item, uid: options.uid };
                                });
                            });
                            points.exit().remove();
                            points.call(update);
                            points.enter().append("circle").call(enter);
                        });
                    };

                    var mapper = function (f) {
                        return { tags: f.key || {}, hash: f.hash(), data: f.take() };
                    };

                    var frameGroups = options.container.selectAll(".frame-id-" + options.uid).data(frames.map(mapper), function (f) {
                        return f.hash;
                    });
                    frameGroups.exit().remove();
                    frameGroups.call(updateGroups);
                    frameGroups.enter().append("g").call(updateGroups);

                    return [];
                }
            }
        });

        return Point;
    })();
});
define('utils/css-class-map',["exports", "../const"], function (exports, _const) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;

    var arrayNumber = [1, 2, 3, 4, 5];
    var countLineClasses = arrayNumber.map(function (i) {
        return CSS_PREFIX + "line-opacity-" + i;
    });
    var widthLineClasses = arrayNumber.map(function (i) {
        return CSS_PREFIX + "line-width-" + i;
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
define('elements/element.line',["exports", "../const", "../utils/css-class-map"], function (exports, _const, _utilsCssClassMap) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;
    var getLineClassesByWidth = _utilsCssClassMap.getLineClassesByWidth;
    var getLineClassesByCount = _utilsCssClassMap.getLineClassesByCount;

    var Line = exports.Line = (function () {
        function Line(config) {
            _classCallCheck(this, Line);

            this.config = config;
            this.config.guide = this.config.guide || {};
            this.config.guide = _.defaults(this.config.guide, {
                cssClass: "i-role-datum",
                widthCssClass: "",
                anchors: false
            });
        }

        _createClass(Line, {
            drawLayout: {
                value: function drawLayout(fnCreateScale) {

                    var config = this.config;

                    this.xScale = fnCreateScale("pos", config.x, [0, config.options.width]);
                    this.yScale = fnCreateScale("pos", config.y, [config.options.height, 0]);
                    this.color = fnCreateScale("color", config.color, {});
                    this.size = fnCreateScale("size", config.size, {});

                    return this;
                }
            },
            drawFrames: {
                value: function drawFrames(frames) {

                    var guide = this.config.guide;
                    var options = this.config.options;

                    var xScale = this.xScale;
                    var yScale = this.yScale;
                    var colorScale = this.color;
                    var sizeScale = this.size;

                    var widthCss = guide.widthCssClass || getLineClassesByWidth(options.width);
                    var countCss = getLineClassesByCount(frames.length);

                    var d3Line = d3.svg.line().x(function (d) {
                        return xScale(d[xScale.dim]);
                    }).y(function (d) {
                        return yScale(d[yScale.dim]);
                    });

                    if (guide.interpolate) {
                        d3Line.interpolate(guide.interpolate);
                    }

                    var linePref = "" + CSS_PREFIX + "line i-role-element line " + widthCss + " " + countCss + " " + guide.cssClass;
                    var updateLines = function updateLines() {
                        var paths = this.selectAll("path").data(function (_ref) {
                            var frame = _ref.data;
                            return [frame.data];
                        });
                        paths.exit().remove();
                        paths.attr("d", d3Line);
                        paths.enter().append("path").attr("d", d3Line);
                    };

                    var pointPref = "" + CSS_PREFIX + "dot-line dot-line i-role-element " + CSS_PREFIX + "dot ";
                    var updatePoints = function updatePoints() {

                        var points = this.selectAll("circle").data(function (frame) {
                            return frame.data.data.map(function (item) {
                                return { data: item, uid: options.uid };
                            });
                        });
                        var attr = {
                            r: function (_ref) {
                                var d = _ref.data;
                                return sizeScale(d[sizeScale.dim]);
                            },
                            cx: function (_ref) {
                                var d = _ref.data;
                                return xScale(d[xScale.dim]);
                            },
                            cy: function (_ref) {
                                var d = _ref.data;
                                return yScale(d[yScale.dim]);
                            },
                            "class": function (_ref) {
                                var d = _ref.data;
                                return "" + pointPref + " " + colorScale(d[colorScale.dim]);
                            }
                        };
                        points.exit().remove();
                        points.attr(attr);
                        points.enter().append("circle").attr(attr);
                    };

                    var updateGroups = function (x, drawPath, drawPoints) {

                        return function () {

                            this.attr("class", function (_ref) {
                                var f = _ref.data;
                                return "" + linePref + " " + colorScale(f.tags[colorScale.dim]) + " " + x + " frame-" + f.hash;
                            }).call(function () {

                                if (drawPath) {
                                    updateLines.call(this);
                                }

                                if (drawPoints) {
                                    updatePoints.call(this);
                                }
                            });
                        };
                    };

                    var mapper = function (f) {
                        return { data: { tags: f.key || {}, hash: f.hash(), data: f.take() }, uid: options.uid };
                    };

                    var drawFrame = function (tag, id, filter) {

                        var isDrawLine = tag === "line";
                        var isDrawAnchor = !isDrawLine || guide.anchors;

                        var frameGroups = options.container.selectAll(".frame-" + id).data(frames.map(mapper).filter(filter), function (_ref) {
                            var f = _ref.data;
                            return f.hash;
                        });
                        frameGroups.exit().remove();
                        frameGroups.call(updateGroups("frame-" + id, isDrawLine, isDrawAnchor));
                        frameGroups.enter().append("g").call(updateGroups("frame-" + id, isDrawLine, isDrawAnchor));
                    };

                    drawFrame("line", "line-" + options.uid, function (_ref) {
                        var f = _ref.data;
                        return f.data.length > 1;
                    });
                    drawFrame("anch", "anch-" + options.uid, function (_ref) {
                        var f = _ref.data;
                        return f.data.length < 2;
                    });
                }
            }
        });

        return Line;
    })();
});
define('utils/utils-draw',["exports"], function (exports) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /* jshint ignore:start */
    var utilsDraw = {
        translate: function (left, top) {
            return "translate(" + left + "," + top + ")";
        },
        rotate: function (angle) {
            return "rotate(" + angle + ")";
        },
        getOrientation: function (scaleOrient) {
            return ["bottom", "top"].indexOf(scaleOrient.toLowerCase()) >= 0 ? "h" : "v";
        }
    };
    /* jshint ignore:end */

    exports.utilsDraw = utilsDraw;
});
define('elements/element.interval.fn',["exports", "../utils/utils-draw", "../const"], function (exports, _utilsUtilsDraw, _const) {
    

    var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;

    var BAR_GROUP = "i-role-bar-group";
    var getSizesParams = function (params) {
        var countDomainValue = params.domain().length;
        var countCategory = params.categoryLength;
        var tickWidth = params.size / countDomainValue;
        var intervalWidth = tickWidth / (countCategory + 1);
        return {
            tickWidth: tickWidth,
            intervalWidth: intervalWidth,
            offsetCategory: intervalWidth
        };
    };
    var isMeasure = function (dim) {
        return dim.scaleType === "linear" || dim.scaleType === "time";
    };
    var flipHub = {
        NORM: function (_ref) {
            var colorScale = _ref.colorScale;
            var node = _ref.node;
            var xScale = _ref.xScale;
            var yScale = _ref.yScale;
            var colorIndexScale = _ref.colorIndexScale;
            var width = _ref.width;
            var height = _ref.height;
            var defaultSizeParams = _ref.defaultSizeParams;

            var minimalHeight = 1;
            var yMin = Math.min.apply(Math, _toConsumableArray(yScale.domain()));
            var isYNumber = !isNaN(yMin);
            var startValue = !isYNumber || yMin <= 0 ? 0 : yMin;
            var isXNumber = isMeasure(node.x);

            var _ref2 = isXNumber ? defaultSizeParams : getSizesParams({
                domain: xScale.domain,
                categoryLength: colorIndexScale.count(),
                size: width
            });

            var tickWidth = _ref2.tickWidth;
            var intervalWidth = _ref2.intervalWidth;
            var offsetCategory = _ref2.offsetCategory;

            var calculateX = function (_ref3) {
                var d = _ref3.data;
                return xScale(d[node.x.scaleDim]) - tickWidth / 2;
            };
            var calculateY = isYNumber ? function (_ref3) {
                var d = _ref3.data;

                var valY = d[node.y.scaleDim];
                var dotY = yScale(Math.max(startValue, valY));
                var h = Math.abs(yScale(valY) - yScale(startValue));
                var isTooSmall = h < minimalHeight;
                return isTooSmall && valY > 0 ? dotY - minimalHeight : dotY;
            } : function (_ref3) {
                var d = _ref3.data;
                return yScale(d[node.y.scaleDim]);
            };

            var calculateWidth = function (_ref3) {
                var d = _ref3.data;
                return intervalWidth;
            };
            var calculateHeight = isYNumber ? function (_ref3) {
                var d = _ref3.data;

                var valY = d[node.y.scaleDim];
                var h = Math.abs(yScale(valY) - yScale(startValue));
                return valY === 0 ? h : Math.max(minimalHeight, h);
            } : function (_ref3) {
                var d = _ref3.data;
                return height - yScale(d[node.y.scaleDim]);
            };

            var calculateTranslate = function (_ref3) {
                var d = _ref3.data;
                return utilsDraw.translate(colorIndexScale({ data: d }) * offsetCategory + offsetCategory / 2, 0);
            };

            return { colorScale: colorScale, calculateX: calculateX, calculateY: calculateY, calculateWidth: calculateWidth, calculateHeight: calculateHeight, calculateTranslate: calculateTranslate };
        },

        FLIP: function (_ref) {
            var colorScale = _ref.colorScale;
            var node = _ref.node;
            var xScale = _ref.xScale;
            var yScale = _ref.yScale;
            var colorIndexScale = _ref.colorIndexScale;
            var width = _ref.width;
            var height = _ref.height;
            var defaultSizeParams = _ref.defaultSizeParams;

            var minimalHeight = 1;
            var xMin = Math.min.apply(Math, _toConsumableArray(xScale.domain()));
            var isXNumber = !isNaN(xMin);
            var startValue = !isXNumber || xMin <= 0 ? 0 : xMin;
            var isYNumber = isMeasure(node.y);

            var _ref2 = isYNumber ? defaultSizeParams : getSizesParams({
                domain: yScale.domain,
                categoryLength: colorIndexScale.count(),
                size: height
            });

            var tickWidth = _ref2.tickWidth;
            var intervalWidth = _ref2.intervalWidth;
            var offsetCategory = _ref2.offsetCategory;

            var calculateX = isXNumber ? function (_ref3) {
                var d = _ref3.data;

                var valX = d[node.x.scaleDim];
                var h = Math.abs(xScale(valX) - xScale(startValue));
                var dotX = xScale(Math.min(startValue, valX));
                var delta = h - minimalHeight;
                var offset = valX > 0 ? minimalHeight + delta : valX < 0 ? 0 - minimalHeight : 0;

                var isTooSmall = delta < 0;
                return isTooSmall ? dotX + offset : dotX;
            } : 0;
            var calculateY = function (_ref3) {
                var d = _ref3.data;
                return yScale(d[node.y.scaleDim]) - tickWidth / 2;
            };
            var calculateWidth = isXNumber ? function (_ref3) {
                var d = _ref3.data;

                var valX = d[node.x.scaleDim];
                var h = Math.abs(xScale(valX) - xScale(startValue));
                return valX === 0 ? h : Math.max(minimalHeight, h);
            } : function (_ref3) {
                var d = _ref3.data;
                return xScale(d[node.x.scaleDim]);
            };
            var calculateHeight = function (_ref3) {
                var d = _ref3.data;
                return intervalWidth;
            };
            var calculateTranslate = function (_ref3) {
                var d = _ref3.data;
                return utilsDraw.translate(0, colorIndexScale({ data: d }) * offsetCategory + offsetCategory / 2);
            };

            return { colorScale: colorScale, calculateX: calculateX, calculateY: calculateY, calculateWidth: calculateWidth, calculateHeight: calculateHeight, calculateTranslate: calculateTranslate };
        }
    };

    function drawInterval(_ref, container, data) {
        var calculateX = _ref.calculateX;
        var calculateY = _ref.calculateY;
        var colorScale = _ref.colorScale;
        var calculateWidth = _ref.calculateWidth;
        var calculateHeight = _ref.calculateHeight;
        var calculateTranslate = _ref.calculateTranslate;

        var updateBar = function updateBar() {
            return this.attr("height", calculateHeight).attr("width", calculateWidth).attr("class", function (_ref2) {
                var d = _ref2.data;

                return "i-role-element i-role-datum bar " + CSS_PREFIX + "bar " + colorScale(d[colorScale.scaleDim]);
            }).attr("x", calculateX).attr("y", calculateY);
        };

        var updateBarContainer = function updateBarContainer() {
            this.attr("class", BAR_GROUP).attr("transform", calculateTranslate);
            var bars = this.selectAll(".bar").data(function (d) {
                return d.values.map(function (item) {
                    return {
                        data: item,
                        uid: d.uid
                    };
                });
            });
            bars.call(updateBar);
            bars.enter().append("rect").call(updateBar);
            bars.exit().remove();
        };
        var elements = container.selectAll("." + BAR_GROUP).data(data);
        elements.call(updateBarContainer);
        elements.enter().append("g").call(updateBarContainer);
        elements.exit().remove();
    }

    exports.flipHub = flipHub;
    exports.drawInterval = drawInterval;
});
define('elements/element.interval',["exports", "../const", "./element.interval.fn"], function (exports, _const, _elementIntervalFn) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;
    var flipHub = _elementIntervalFn.flipHub;
    var drawInterval = _elementIntervalFn.drawInterval;

    var Interval = exports.Interval = (function () {
        function Interval(config) {
            _classCallCheck(this, Interval);

            this.config = config;
        }

        _createClass(Interval, {
            drawLayout: {
                value: function drawLayout(fnCreateScale) {

                    var config = this.config;
                    this.xScale = fnCreateScale("pos", config.x, [0, config.options.width]);
                    this.yScale = fnCreateScale("pos", config.y, [config.options.height, 0]);
                    this.color = fnCreateScale("color", config.color, {});
                    this.size = fnCreateScale("size", config.size, {});

                    return this;
                }
            },
            drawFrames: {
                value: function drawFrames(frames) {
                    var _this = this;

                    var canvas = this.config.options.container;
                    var config = this.config;
                    var xScale = this.xScale;
                    var yScale = this.yScale;
                    var colorScale = this.color;
                    var node = {
                        options: {
                            container: canvas,
                            xScale: xScale,
                            yScale: yScale,
                            color: colorScale,
                            width: config.options.width,
                            height: config.options.height
                        },
                        x: xScale,
                        y: yScale,
                        color: colorScale
                    };
                    var method = flipHub[this.config.flip ? "FLIP" : "NORM"];
                    var colorIndexScale = function (d) {
                        var findIndex = _.findIndex(domain, function (value) {
                            return value === (d.key || {})[colorScale.scaleDim];
                        });
                        return findIndex === -1 ? 0 : findIndex;
                    };
                    //  colorScale.scaleDim = node.color.scaleDim;
                    var domain = colorScale.domain();
                    colorIndexScale.count = function () {
                        return domain.length || 1;
                    };

                    var params = method({
                        node: node,
                        xScale: xScale,
                        yScale: yScale,
                        colorScale: colorScale,
                        colorIndexScale: colorIndexScale,
                        width: config.options.width,
                        height: config.options.height,
                        defaultSizeParams: {
                            tickWidth: 5,
                            intervalWidth: 5,
                            offsetCategory: 0
                        }
                    });
                    drawInterval(params, canvas, frames.map(function (fr) {
                        return { key: fr.key, values: fr.data, uid: _this.config.options.uid };
                    }));
                }
            }
        });

        return Interval;
    })();
});
define('utils/utils',["exports", "../elements/element.point", "../elements/element.line", "../elements/element.interval"], function (exports, _elementsElementPoint, _elementsElementLine, _elementsElementInterval) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var Point = _elementsElementPoint.Point;
    var Line = _elementsElementLine.Line;
    var Interval = _elementsElementInterval.Interval;

    var traverseJSON = function (srcObject, byProperty, fnSelectorPredicates, funcTransformRules) {

        var rootRef = funcTransformRules(fnSelectorPredicates(srcObject), srcObject);

        (rootRef[byProperty] || []).forEach(function (unit) {
            return traverseJSON(unit, byProperty, fnSelectorPredicates, funcTransformRules);
        });

        return rootRef;
    };

    var hashGen = 0;
    var hashMap = {};

    var utils = {
        clone: function clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        isArray: function isArray(obj) {
            return Array.isArray(obj);
        },
        isChartElement: function isChartElement(element) {
            return element instanceof Interval || element instanceof Point || element instanceof Line;
        },
        isLineElement: function isLineElement(element) {
            return element instanceof Line;
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

            var correction = [[0.15, 10], [0.35, 5], [0.75, 2], [1, 1], [2, 1]];

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

        generateHash: function (str) {
            var r = btoa(encodeURIComponent(str)).replace(/=/g, "_");
            if (!hashMap.hasOwnProperty(r)) {
                hashMap[r] = "H" + ++hashGen;
            }
            return hashMap[r];
        }
    };

    exports.utils = utils;
});
define('event',["exports"], function (exports) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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
                    if (typeof fn === "function") {
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
                    fn = cursor.callbacks["*"];
                    if (typeof fn === "function") {
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
            this.emit_destroy = createDispatcher("destroy");
        }

        _createClass(Emitter, {
            addHandler: {

                /**
                 * Adds new event handler to object.
                 * @param {object} callbacks Callback set.
                 * @param {object=} context Context object.
                 */

                value: function addHandler(callbacks, context) {
                    context = context || this;
                    // add handler
                    this.handler = {
                        callbacks: callbacks,
                        context: context,
                        handler: this.handler
                    };
                }
            },
            on: {
                value: function on(name, callback, context) {
                    var obj = {};
                    obj[name] = callback;
                    this.addHandler(obj, context);
                    return obj;
                }
            },
            fire: {
                value: function fire(name, data) {
                    createDispatcher.call(this, name).call(this, data);
                }
            },
            removeHandler: {

                /**
                 * Removes event handler set from object. For this operation parameters
                 * must be the same (equivalent) as used for addHandler method.
                 * @param {object} callbacks Callback set.
                 * @param {object=} context Context object.
                 */

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
            },
            destroy: {

                /**
                 * @destructor
                 */

                value: function destroy() {
                    // fire object destroy event handlers
                    this.emit_destroy();
                    // drop event handlers if any
                    this.handler = null;
                }
            }
        });

        return Emitter;
    })();

    //
    // export names
    //
    exports.Emitter = Emitter;
});
define('units-registry',["exports"], function (exports) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var UnitsMap = {};

    var unitsRegistry = {

        reg: function reg(unitType, xUnit) {
            UnitsMap[unitType] = xUnit;
            return this;
        },

        get: function (unitType) {

            if (!UnitsMap.hasOwnProperty(unitType)) {
                throw new Error("Unknown unit type: " + unitType);
            }

            return UnitsMap[unitType];
        }
    };

    exports.unitsRegistry = unitsRegistry;
});
define('utils/layuot-template',["exports", "../const"], function (exports, _const) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;

    var createElement = function createElement(cssClass, parent) {
        var tag = "div";
        var element = document.createElement(tag);
        element.classList.add(CSS_PREFIX + cssClass);
        if (parent) {
            parent.appendChild(element);
        }
        return element;
    };
    var getLayout = function getLayout() {
        var layout = createElement("layout");
        var header = createElement("layout__header", layout);
        var centerContainer = createElement("layout__container", layout);
        var leftSidebar = createElement("layout__sidebar", centerContainer);
        var contentContainer = createElement("layout__content", centerContainer);
        var content = createElement("layout__content__wrap", contentContainer);
        var rightSidebarContainer = createElement("layout__sidebar-right", centerContainer);
        var rightSidebar = createElement("layout__sidebar-right__wrap", rightSidebarContainer);
        var footer = createElement("layout__footer", layout);
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
define('unit-domain-period-generator',["exports"], function (exports) {
    

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

        get: function (periodAlias) {
            return PERIODS_MAP[periodAlias.toLowerCase()];
        },

        generate: function (lTick, rTick, periodAlias) {
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
define('scales-factory',["exports", "./unit-domain-period-generator", "./utils/utils", "underscore", "d3"], function (exports, _unitDomainPeriodGenerator, _utilsUtils, _underscore, _d3) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;
    var utils = _utilsUtils.utils;

    /* jshint ignore:start */

    var _ = _interopRequire(_underscore);

    var d3 = _interopRequire(_d3);

    /* jshint ignore:end */
    var generateHashFunction = function (varSet, interval) {
        return utils.generateHash([varSet, interval].map(JSON.stringify).join(""));
    };
    var scalesStrategies = {

        color: function (vars, props) {

            var varSet = vars;

            var brewer = props.brewer;

            var defaultColorClass = _.constant("color-default");

            var defaultRangeColor = _.times(20, function (i) {
                return "color20-" + (1 + i);
            });

            var buildArrayGetClass = function (domain, brewer) {
                if (domain.length === 0 || domain.length === 1 && domain[0] === null) {
                    return defaultColorClass;
                } else {
                    var fullDomain = domain.map(function (x) {
                        return String(x).toString();
                    });
                    return d3.scale.ordinal().range(brewer).domain(fullDomain);
                }
            };

            var buildObjectGetClass = function (brewer, defaultGetClass) {
                var domain = _.keys(brewer);
                var range = _.values(brewer);
                var calculateClass = d3.scale.ordinal().range(range).domain(domain);
                return function (d) {
                    return brewer.hasOwnProperty(d) ? calculateClass(d) : defaultGetClass(d);
                };
            };

            var wrapString = function (f) {
                return function (d) {
                    return f(String(d).toString());
                };
            };

            var func;
            if (!brewer) {
                func = wrapString(buildArrayGetClass(varSet, defaultRangeColor));
            } else if (_.isArray(brewer)) {
                func = wrapString(buildArrayGetClass(varSet, brewer));
            } else if (_.isFunction(brewer)) {
                func = function (d) {
                    return brewer(d, wrapString(buildArrayGetClass(varSet, defaultRangeColor)));
                };
            } else if (_.isObject(brewer)) {
                func = buildObjectGetClass(brewer, defaultColorClass);
            } else {
                throw new Error("This brewer is not supported");
            }

            func.dim = props.dim;
            func.domain = function () {
                return varSet;
            };
            func.source = props.source;
            func.scaleDim = props.dim;
            func.scaleType = "color";

            return func;
        },

        size: function (varSet, props, localProps) {

            var minSize = localProps.min || props.min;
            var maxSize = localProps.max || props.max;
            var midSize = localProps.mid || props.mid;

            var f = function (x) {
                return Math.sqrt(x);
            };

            var values = _.filter(varSet, _.isFinite);
            if (values.length === 0) {
                return function (x) {
                    return midSize;
                };
            }

            var k = 1;
            var xMin = 0;

            var min = Math.min.apply(null, values);
            var max = Math.max.apply(null, values);

            var len = f(Math.max.apply(null, [Math.abs(min), Math.abs(max), max - min]));

            xMin = min < 0 ? min : 0;
            k = len === 0 ? 1 : (maxSize - minSize) / len;

            var func = function (x) {

                var numX = x !== null ? parseFloat(x) : 0;

                if (!_.isFinite(numX)) {
                    return maxSize;
                }

                var posX = numX - xMin; // translate to positive x domain

                return minSize + f(posX) * k;
            };

            func.dim = props.dim;
            func.domain = function () {
                return varSet;
            };
            func.source = props.source;
            func.scaleDim = props.dim;
            func.scaleType = "size";

            return func;
        },

        ordinal: function (varSet, props, interval) {

            var d3Domain = d3.scale.ordinal().domain(varSet);

            var scale = d3Domain.rangePoints(interval, 1);
            scale.dim = props.dim;
            scale.domain = function () {
                return varSet;
            };
            scale.source = props.source;
            scale.scaleDim = props.dim;
            scale.scaleType = "ordinal";
            scale.getHash = function () {
                return generateHashFunction(varSet, interval);
            };
            return scale;
        },

        linear: function (vars, props, interval) {

            var domain = props.autoScale ? utils.autoScale(vars) : d3.extent(vars);

            var min = _.isNumber(props.min) ? props.min : domain[0];
            var max = _.isNumber(props.max) ? props.max : domain[1];

            var varSet = [Math.min(min, domain[0]), Math.max(max, domain[1])];

            var d3Domain = d3.scale.linear().domain(varSet);

            var d3Scale = d3Domain.rangeRound(interval, 1);
            var scale = function (int) {
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

            scale.dim = props.dim;
            scale.domain = function () {
                return varSet;
            };
            scale.source = props.source;
            scale.scaleDim = props.dim;
            scale.scaleType = "linear";
            scale.getHash = function () {
                return generateHashFunction(varSet, interval);
            };

            return scale;
        },

        period: function (vars, props, interval) {

            // extract: ((x) => UnitDomainPeriodGenerator.get(xOptions.period).cast(new Date(x)))

            var domain = d3.extent(vars);
            var min = _.isNull(props.min) || _.isUndefined(props.min) ? domain[0] : new Date(props.min).getTime();
            var max = _.isNull(props.max) || _.isUndefined(props.max) ? domain[1] : new Date(props.max).getTime();

            var range = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

            var varSet = UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);

            var d3Domain = d3.scale.ordinal().domain(varSet);

            var d3Scale = d3Domain.rangePoints(interval, 1);

            var scale = function (x) {
                return d3Scale(new Date(x));
            };

            // have to copy properties since d3 produce Function with methods
            Object.keys(d3Scale).forEach(function (p) {
                return scale[p] = d3Scale[p];
            });

            scale.dim = props.dim;
            scale.domain = function () {
                return varSet;
            };
            scale.source = props.source;
            scale.scaleDim = props.dim;
            scale.scaleType = "period";
            scale.getHash = function () {
                return generateHashFunction(varSet, interval);
            };
            return scale;
        },

        time: function (vars, props, interval) {

            var domain = d3.extent(vars).map(function (v) {
                return new Date(v);
            });

            var min = _.isNull(props.min) || _.isUndefined(props.min) ? domain[0] : new Date(props.min).getTime();
            var max = _.isNull(props.max) || _.isUndefined(props.max) ? domain[1] : new Date(props.max).getTime();

            var varSet = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

            var d3Domain = d3.time.scale().domain(varSet);

            var d3Scale = d3Domain.range(interval);

            var scale = function (x) {
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

            scale.dim = props.dim;
            scale.domain = function () {
                return varSet;
            };
            scale.source = props.source;
            scale.scaleDim = props.dim;
            scale.scaleType = "time";
            scale.getHash = function () {
                return generateHashFunction(varSet, interval);
            };

            return scale;
        },

        value: function (vars, props, interval) {
            var scale = function (x) {
                return x;
            };
            scale.dim = props.dim;
            scale.domain = function () {
                return vars;
            };
            scale.source = props.source;
            scale.scaleDim = props.dim;
            scale.scaleType = "value";

            return scale;
        }
    };

    var map_value = function (dimType) {
        return dimType === "date" ? function (v) {
            return new Date(v).getTime();
        } : function (v) {
            return v;
        };
    };

    var ScalesFactory = exports.ScalesFactory = (function () {
        function ScalesFactory(sources) {
            _classCallCheck(this, ScalesFactory);

            this.sources = sources;
        }

        _createClass(ScalesFactory, {
            create: {
                value: function create(scaleConfig, frame, interval) {

                    var dim = scaleConfig.dim;
                    var src = scaleConfig.source;

                    var type = (this.sources[src].dims[dim] || {}).type;
                    var data = scaleConfig.fitToFrame ? frame.take() : this.sources[scaleConfig.source].data;

                    var vars = _(data).chain().pluck(dim).uniq(map_value(type)).value();

                    return scalesStrategies[scaleConfig.type](vars, scaleConfig, interval);
                }
            }
        });

        return ScalesFactory;
    })();
});
define('algebra',["exports", "underscore", "./unit-domain-period-generator"], function (exports, _underscore, _unitDomainPeriodGenerator) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _ = _interopRequire(_underscore);

    var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;

    var unify = function (v) {
        return v instanceof Date ? v.getTime() : v;
    };

    var FramesAlgebra = {

        cross: function cross(dataFn, dimX, dimY) {

            var data = dataFn();

            var domainX = _(data).chain().pluck(dimX).unique(unify).value();
            var domainY = _(data).chain().pluck(dimY).unique(unify).value();

            var domX = domainX.length === 0 ? [null] : domainX;
            var domY = domainY.length === 0 ? [null] : domainY;

            return _(domY).reduce(function (memo, rowVal) {

                return memo.concat(_(domX).map(function (colVal) {

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

            var domainX = _(data).chain().pluck(dimX).unique(unify).value();
            var domainY = _(data).chain().pluck(dimY).unique(unify).value();

            var domX = domainX.length === 0 ? [null] : domainX;
            var domY = domainY.length === 0 ? [null] : domainY;

            if (xPeriod) {
                domX = UnitDomainPeriodGenerator.generate(_.min(domainX), _.max(domainX), xPeriod);
            }

            if (yPeriod) {
                domY = UnitDomainPeriodGenerator.generate(_.min(domainY), _.max(domainY), yPeriod);
            }

            return _(domY).reduce(function (memo, rowVal) {

                return memo.concat(_(domX).map(function (colVal) {

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
            var domainX = _(data).chain().pluck(dim).unique(unify).value();
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
define('charts/tau.gpl',["exports", "../event", "../utils/utils", "../utils/utils-dom", "../units-registry", "../utils/layuot-template", "../scales-factory", "../const", "../algebra"], function (exports, _event, _utilsUtils, _utilsUtilsDom, _unitsRegistry, _utilsLayuotTemplate, _scalesFactory, _const, _algebra) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var Emitter = _event.Emitter;
    var utils = _utilsUtils.utils;
    var utilsDom = _utilsUtilsDom.utilsDom;
    var unitsRegistry = _unitsRegistry.unitsRegistry;
    var getLayout = _utilsLayuotTemplate.getLayout;
    var ScalesFactory = _scalesFactory.ScalesFactory;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var FramesAlgebra = _algebra.FramesAlgebra;

    var calcBaseFrame = function (unitExpression, baseFrame) {

        var tmpFrame = _.pick(baseFrame || {}, "source", "pipe");

        var srcAlias = unitExpression.source;
        var bInherit = unitExpression.inherit;
        var ownFrame = { source: srcAlias, pipe: [] };

        if (bInherit && ownFrame.source !== tmpFrame.source) {
            // jscs:disable maximumLineLength
            throw new Error("base [" + tmpFrame.source + "] and own [" + ownFrame.source + "] sources should be equal to apply inheritance");
            // jscs:enable maximumLineLength
        }

        return bInherit ? tmpFrame : ownFrame;
    };

    var cast = function (v) {
        return _.isDate(v) ? v.getTime() : v;
    };

    var GPL = exports.GPL = (function (_Emitter) {
        function GPL(config) {
            _classCallCheck(this, GPL);

            _get(Object.getPrototypeOf(GPL.prototype), "constructor", this).call(this);

            this.config = config;

            this.unitSet = config.unitsRegistry || unitsRegistry;

            this.sources = config.sources;

            this.scalesCreator = new ScalesFactory(config.sources);

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
        }

        _inherits(GPL, _Emitter);

        _createClass(GPL, {
            renderTo: {
                value: function renderTo(target, xSize) {

                    var d3Target = d3.select(target);

                    var size = xSize || _.defaults(utilsDom.getContainerSize(d3Target.node()));

                    this.root = this._expandUnitsStructure(this.config.unit);

                    var xSvg = d3Target.selectAll("svg").data([1]);

                    var attr = {
                        "class": "" + CSS_PREFIX + "svg",
                        width: size.width,
                        height: size.height
                    };

                    xSvg.attr(attr);

                    xSvg.enter().append("svg").attr(attr).append("g").attr("class", "" + CSS_PREFIX + "cell cell frame-root");

                    this.root.options = {
                        container: d3Target.select(".frame-root"),
                        frameId: "root",
                        left: 0,
                        top: 0,
                        width: size.width,
                        height: size.height
                    };

                    this._drawUnitsStructure(this.root);
                }
            },
            _expandUnitsStructure: {
                value: function _expandUnitsStructure(root) {
                    var _this = this;

                    var parentPipe = arguments[1] === undefined ? [] : arguments[1];

                    if (root.expression.operator !== false) {

                        var expr = this._parseExpression(root.expression, parentPipe);

                        root.transformation = root.transformation || [];

                        root.frames = expr.exec().map(function (tuple) {

                            var pipe = parentPipe.concat([{
                                type: "where",
                                args: tuple
                            }]).concat(root.transformation);

                            var item = {
                                source: expr.source,
                                pipe: pipe
                            };

                            if (tuple) {
                                item.key = tuple;
                            }

                            item.units = root.units ? root.units.map(function (unit) {
                                return utils.clone(unit);
                            }) : [];

                            return item;
                        });
                    }

                    root.frames.forEach(function (f) {
                        return f.units.forEach(function (unit) {
                            return _this._expandUnitsStructure(unit, f.pipe);
                        });
                    });

                    return root;
                }
            },
            _drawUnitsStructure: {
                value: function _drawUnitsStructure(rootConf) {
                    var rootFrame = arguments[1] === undefined ? null : arguments[1];
                    var rootUnit = arguments[2] === undefined ? null : arguments[2];

                    var self = this;

                    var dataFrame = self._datify(calcBaseFrame(rootConf.expression, rootFrame));

                    var UnitClass = self.unitSet.get(rootConf.type);
                    var unitNode = new UnitClass(rootConf);
                    unitNode.parentUnit = rootUnit;
                    unitNode.drawLayout(function (type, alias, settings) {

                        var name = alias ? alias : "" + type + ":default";

                        return self.scalesCreator.create(self.scales[name], dataFrame, settings);
                    }).drawFrames(rootConf.frames.map(self._datify.bind(self)), (function (rootUnit) {
                        return function (rootConf, rootFrame) {
                            self._drawUnitsStructure.bind(self)(rootConf, rootFrame, rootUnit);
                        };
                    })(unitNode));

                    if (self.onUnitDraw) {
                        self.onUnitDraw(unitNode);
                    }

                    return rootConf;
                }
            },
            _datify: {
                value: function _datify(frame) {
                    var data = this.sources[frame.source].data;
                    var trans = this.transformations;
                    frame.hash = function () {
                        return utils.generateHash([frame.pipe, frame.key, frame.source].map(JSON.stringify).join(""));
                    };
                    frame.take = function () {
                        return frame.pipe.reduce(function (data, pipeCfg) {
                            return trans[pipeCfg.type](data, pipeCfg.args);
                        }, data);
                    };
                    frame.data = frame.take();
                    return frame;
                }
            },
            _parseExpression: {
                value: function _parseExpression(expr, parentPipe) {
                    var _this = this;

                    var funcName = expr.operator || "none";
                    var srcAlias = expr.source;
                    var bInherit = expr.inherit;
                    var funcArgs = expr.params;

                    var src = this.sources[srcAlias];
                    var dataFn = bInherit ? function () {
                        return parentPipe.reduce(function (data, cfg) {
                            return _this.transformations[cfg.type](data, cfg.args);
                        }, src.data);
                    } : function () {
                        return src.data;
                    };

                    var func = FramesAlgebra[funcName];

                    if (!func) {
                        throw new Error("" + funcName + " operator is not supported");
                    }

                    return {
                        source: srcAlias,
                        func: func,
                        args: funcArgs,
                        exec: function () {
                            return func.apply(null, [dataFn].concat(funcArgs));
                        }
                    };
                }
            }
        });

        return GPL;
    })(Emitter);
});
define('api/balloon',["exports", "../const"], function (exports, _const) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;

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
    var body = doc.body;
    var docEl = doc.documentElement;
    var verticalPlaces = ["top", "bottom"];

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
        return 0 | Math.round(String(value).replace(/[^\-0-9.]/g, ""));
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
            if (match[2] === "s") {
                duration *= 1000;
            }
        }
        return 0 | duration;
    }
    transitionDuration.propName = (function () {
        var element = doc.createElement("div");
        var names = ["transitionDuration", "webkitTransitionDuration"];
        var value = "1s";
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
        this.element = doc.createElement("div");
        this.classes = classes(this.element);
        this.classes.add(this.options.baseClass);
        var propName;
        for (var i = 0; i < Tooltip.classTypes.length; i++) {
            propName = Tooltip.classTypes[i] + "Class";
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
        return this.changeClassType("type", name);
    };

    /**
     * Changes tooltip's effect class type.
     *
     * @param {String} name
     *
     * @return {Tooltip}
     */
    Tooltip.prototype.effect = function (name) {
        return this.changeClassType("effect", name);
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
        propName += "Class";
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
            this.element.style.visibility = "hidden";
            body.appendChild(this.element);
        }
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        if (this.spacing == null) {
            this.spacing = this.options.spacing != null ? this.options.spacing : parsePx(style(this.element, "top"));
        }
        if (this.hidden) {
            body.removeChild(this.element);
            this.element.style.visibility = "";
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
        if (typeof content === "object") {
            this.element.innerHTML = "";
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
        var place = this.options.place.split("-");
        var spacing = this.spacing;

        if (indexOf(verticalPlaces, place[0]) !== -1) {
            if (target.top - this.height - spacing <= winPos.top) {
                place[0] = "bottom";
            } else if (target.bottom + this.height + spacing >= winPos.bottom) {
                place[0] = "top";
            }
            switch (place[1]) {
                case "left":
                    if (target.right - this.width <= winPos.left) {
                        place[1] = "right";
                    }
                    break;
                case "right":
                    if (target.left + this.width >= winPos.right) {
                        place[1] = "left";
                    }
                    break;
                default:
                    if (target.left + target.width / 2 + this.width / 2 >= winPos.right) {
                        place[1] = "left";
                    } else if (target.right - target.width / 2 - this.width / 2 <= winPos.left) {
                        place[1] = "right";
                    }
            }
        } else {
            if (target.left - this.width - spacing <= winPos.left) {
                place[0] = "right";
            } else if (target.right + this.width + spacing >= winPos.right) {
                place[0] = "left";
            }
            switch (place[1]) {
                case "top":
                    if (target.bottom - this.height <= winPos.top) {
                        place[1] = "bottom";
                    }
                    break;
                case "bottom":
                    if (target.top + this.height >= winPos.bottom) {
                        place[1] = "top";
                    }
                    break;
                default:
                    if (target.top + target.height / 2 + this.height / 2 >= winPos.bottom) {
                        place[1] = "top";
                    } else if (target.bottom - target.height / 2 - this.height / 2 <= winPos.top) {
                        place[1] = "bottom";
                    }
            }
        }

        return place.join("-");
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
            this._p = arguments;
        }
        var target = typeof x === "number" ? {
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
            case "top":
                top = target.top - this.height - spacing;
                left = target.left + target.width / 2 - this.width / 2;
                break;
            case "top-left":
                top = target.top - this.height - spacing;
                left = target.right - this.width;
                break;
            case "top-right":
                top = target.top - this.height - spacing;
                left = target.left;
                break;

            case "bottom":
                top = target.bottom + spacing;
                left = target.left + target.width / 2 - this.width / 2;
                break;
            case "bottom-left":
                top = target.bottom + spacing;
                left = target.right - this.width;
                break;
            case "bottom-right":
                top = target.bottom + spacing;
                left = target.left;
                break;

            case "left":
                top = target.top + target.height / 2 - this.height / 2;
                left = target.left - this.width - spacing;
                break;
            case "left-top":
                top = target.bottom - this.height;
                left = target.left - this.width - spacing;
                break;
            case "left-bottom":
                top = target.top;
                left = target.left - this.width - spacing;
                break;

            case "right":
                top = target.top + target.height / 2 - this.height / 2;
                left = target.right + spacing;
                break;
            case "right-top":
                top = target.bottom - this.height;
                left = target.right + spacing;
                break;
            case "right-bottom":
                top = target.top;
                left = target.right + spacing;
                break;
        }

        // Set tip position & class
        this.element.style.top = Math.round(top) + "px";
        this.element.style.left = Math.round(left) + "px";

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
            body.appendChild(this.element);
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
            body.removeChild(self.element);
            self.hidden = 1;
        }, duration);

        return this;
    };

    Tooltip.prototype.toggle = function (x, y) {
        return this[this.hidden ? "show" : "hide"](x, y);
    };

    Tooltip.prototype.destroy = function () {
        clearTimeout(this.aIndex);
        this._unaware();
        if (!this.hidden) {
            body.removeChild(this.element);
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
    window.addEventListener("resize", Tooltip.reposition);
    window.addEventListener("scroll", Tooltip.reposition);

    /**
     * Array with dynamic class types.
     *
     * @type {Array}
     */
    Tooltip.classTypes = ["type", "effect"];

    /**
     * Default options for Tooltip constructor.
     *
     * @type {Object}
     */
    Tooltip.defaults = {
        baseClass: CSS_PREFIX + "tooltip", // Base tooltip class name.
        typeClass: null, // Type tooltip class name.
        effectClass: null, // Effect tooltip class name.
        inClass: "in", // Class used to transition stuff in.
        place: "top", // Default place.
        spacing: null, // Gap between target and tooltip.
        auto: 0 // Whether to automatically adjust place to fit into window.
    };

    exports.Tooltip = Tooltip;
});
define('plugins',["exports", "d3", "./utils/utils"], function (exports, _d3, _utilsUtils) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /* jshint ignore:start */

    var d3 = _interopRequire(_d3);

    /* jshint ignore:end */
    var utils = _utilsUtils.utils;

    var elementEvents = ["click", "mouseover", "mouseout", "mousemove"];

    var Plugins = (function () {
        function Plugins(plugins, chart) {
            var _this = this;

            _classCallCheck(this, Plugins);

            this.chart = chart;
            this._unitMap = {};
            this._plugins = plugins.map(this.initPlugin, this);
            chart.on("render", function (el, svg) {
                d3.select(svg).selectAll(".i-role-datum").call(this._propagateDatumEvents(chart));
            }, this);
            chart.on("unitdraw", function (chart, element) {
                _this._unitMap[element.config.options.uid] = element;
            }, this);
        }

        _createClass(Plugins, {
            initPlugin: {
                value: function initPlugin(plugin) {
                    var _this = this;

                    if (plugin.init) {
                        plugin.init(this.chart);
                    }
                    // jscs:disable disallowEmptyBlocks
                    var empty = function () {};
                    // jscs:enable disallowEmptyBlocks
                    this.chart.on("destroy", plugin.destroy && plugin.destroy.bind(plugin) || empty);
                    Object.keys(plugin).forEach(function (name) {
                        if (name.indexOf("on") === 0) {
                            var event = name.substr(2);
                            _this.chart.on(event.toLowerCase(), plugin[name].bind(plugin));
                        }
                    });
                }
            },
            _getUnitByHash: {
                value: function _getUnitByHash(id) {
                    return this._unitMap[id];
                }
            },
            _propagateDatumEvents: {
                value: function _propagateDatumEvents(chart) {
                    var self = this;
                    return function () {
                        elementEvents.forEach(function (name) {
                            this.on(name, function (d) {
                                var cellData = d3.select(this.parentNode.parentNode).datum();
                                var unit = self._getUnitByHash(d.uid);
                                var data = d.data;
                                chart.fire("element" + name, {
                                    elementData: data,
                                    element: this,
                                    cellData: cellData,
                                    unit: unit
                                });
                            });
                        }, this);
                    };
                }
            }
        });

        return Plugins;
    })();

    exports.Plugins = Plugins;
});
define('data-processor',["exports", "./utils/utils"], function (exports, _utilsUtils) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var utils = _utilsUtils.utils;

    var isObject = function (obj) {
        return obj === Object(obj);
    };

    var DataProcessor = {

        isYFunctionOfX: function (data, xFields, yFields) {
            var isRelationAFunction = true;
            var error = null;
            // domain should has only 1 value from range
            try {
                data.reduce(function (memo, item) {

                    var fnVar = function (hash, f) {
                        var propValue = item[f];
                        var hashValue = isObject(propValue) ? JSON.stringify(propValue) : propValue;
                        hash.push(hashValue);
                        return hash;
                    };

                    var key = xFields.reduce(fnVar, []).join("/");
                    var val = yFields.reduce(fnVar, []).join("/");

                    if (!memo.hasOwnProperty(key)) {
                        memo[key] = val;
                    } else {
                        var prevVal = memo[key];
                        if (prevVal !== val) {
                            error = {
                                type: "RelationIsNotAFunction",
                                keyX: xFields.join("/"),
                                keyY: yFields.join("/"),
                                valX: key,
                                errY: [prevVal, val]
                            };

                            throw new Error("RelationIsNotAFunction");
                        }
                    }
                    return memo;
                }, {});
            } catch (ex) {

                if (ex.message !== "RelationIsNotAFunction") {
                    throw ex;
                }

                isRelationAFunction = false;
            }

            return {
                result: isRelationAFunction,
                error: error
            };
        },

        excludeNullValues: function (dimensions, onExclude) {
            var fields = Object.keys(dimensions).reduce(function (fields, k) {
                var d = dimensions[k];
                if ((!d.hasOwnProperty("hasNull") || d.hasNull) && (d.type === "measure" || d.scale === "period")) {
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

            var defaultType = "category";
            var scaleMap = {
                category: "ordinal",
                order: "ordinal",
                measure: "linear"
            };

            var r = {};
            Object.keys(dimensions).forEach(function (k) {
                var v = dimensions[k];
                var t = (v.type || defaultType).toLowerCase();
                r[k] = {};
                r[k].type = t;
                r[k].scale = v.scale || scaleMap[t];
                r[k].value = v.value;
            });

            return r;
        },

        autoDetectDimTypes: function autoDetectDimTypes(data) {

            var defaultDetect = {
                type: "category",
                scale: "ordinal"
            };

            var detectType = function (propertyValue, defaultDetect) {

                var pair = defaultDetect;

                if (_.isDate(propertyValue)) {
                    pair.type = "measure";
                    pair.scale = "time";
                } else if (_.isObject(propertyValue)) {
                    pair.type = "order";
                    pair.scale = "ordinal";
                } else if (_.isNumber(propertyValue)) {
                    pair.type = "measure";
                    pair.scale = "linear";
                }

                return pair;
            };

            var reducer = function (memo, rowItem) {

                Object.keys(rowItem).forEach(function (key) {

                    var val = rowItem.hasOwnProperty(key) ? rowItem[key] : null;

                    memo[key] = memo[key] || {
                        type: null,
                        hasNull: false
                    };

                    if (val === null) {
                        memo[key].hasNull = true;
                    } else {
                        var typeScalePair = detectType(val, utils.clone(defaultDetect));
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
define('spec-converter',["exports", "underscore", "./utils/utils"], function (exports, _underscore, _utilsUtils) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _ = _interopRequire(_underscore);

    var utils = _utilsUtils.utils;

    var SpecConverter = exports.SpecConverter = (function () {
        function SpecConverter(spec) {
            _classCallCheck(this, SpecConverter);

            this.spec = spec;

            this.dist = {
                sources: {
                    "?": {
                        dims: {},
                        data: [{}]
                    },
                    "/": {
                        dims: {},
                        data: []
                    }
                },
                scales: {
                    // jscs:disable disallowQuotedKeysInObjects
                    x_null: { type: "ordinal", source: "?" },
                    y_null: { type: "ordinal", source: "?" },
                    size_null: { type: "size", source: "?", mid: 5 },
                    color_null: { type: "color", source: "?", brewer: null },

                    "pos:default": { type: "ordinal", source: "?" },
                    "size:default": { type: "size", source: "?", mid: 5 },
                    "color:default": { type: "color", source: "?", brewer: null }
                    // jscs:enable disallowQuotedKeysInObjects
                },
                settings: spec.settings
            };
        }

        _createClass(SpecConverter, {
            convert: {
                value: function convert() {
                    var srcSpec = this.spec;
                    var gplSpec = this.dist;
                    this.ruleAssignSourceDims(srcSpec, gplSpec);
                    this.ruleAssignStructure(srcSpec, gplSpec);
                    this.ruleAssignSourceData(srcSpec, gplSpec);
                    this.ruleApplyDefaults(gplSpec);

                    return gplSpec;
                }
            },
            ruleApplyDefaults: {
                value: function ruleApplyDefaults(spec) {
                    var traverse = function (node, iterator, parentNode) {
                        iterator(node, parentNode);
                        (node.units || []).map(function (x) {
                            return traverse(x, iterator, node);
                        });
                    };

                    var iterator = function (childUnit, root) {

                        // leaf elements should inherit coordinates properties
                        if (root && !childUnit.hasOwnProperty("units")) {
                            childUnit = _.defaults(childUnit, _.pick(root, "x", "y"));

                            var parentGuide = utils.clone(root.guide || {});
                            childUnit.guide = childUnit.guide || {};
                            childUnit.guide.x = _.defaults(childUnit.guide.x || {}, parentGuide.x);
                            childUnit.guide.y = _.defaults(childUnit.guide.y || {}, parentGuide.y);
                        }

                        return childUnit;
                    };

                    traverse(spec.unit, iterator, null);
                }
            },
            ruleAssignSourceData: {
                value: function ruleAssignSourceData(srcSpec, gplSpec) {

                    var dims = gplSpec.sources["/"].dims;

                    var reduceIterator = function (row, key) {

                        if (_.isObject(row[key]) && !_.isDate(row[key])) {
                            _.each(row[key], function (v, k) {
                                return row[key + "." + k] = v;
                            });
                        }

                        return row;
                    };

                    gplSpec.sources["/"].data = srcSpec.data.map(function (rowN) {
                        var row = Object.keys(rowN).reduce(reduceIterator, rowN);
                        row = Object.keys(dims).reduce(function (r, k) {

                            if (!r.hasOwnProperty(k)) {
                                r[k] = null;
                            }

                            return r;
                        }, row);

                        return row;
                    });
                }
            },
            ruleAssignSourceDims: {
                value: function ruleAssignSourceDims(srcSpec, gplSpec) {
                    var dims = srcSpec.spec.dimensions;
                    gplSpec.sources["/"].dims = Object.keys(dims).reduce(function (memo, k) {
                        memo[k] = { type: dims[k].type };
                        return memo;
                    }, {});
                }
            },
            ruleAssignStructure: {
                value: function ruleAssignStructure(srcSpec, gplSpec) {
                    var _this = this;

                    var walkStructure = function (srcUnit) {
                        var gplRoot = utils.clone(_.omit(srcUnit, "unit"));
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
            },
            ruleCreateScales: {
                value: function ruleCreateScales(srcUnit, gplRoot) {
                    var _this = this;

                    var guide = srcUnit.guide || {};
                    ["color", "size", "x", "y"].forEach(function (p) {
                        if (srcUnit.hasOwnProperty(p)) {
                            gplRoot[p] = _this.scalesPool(p, srcUnit[p], guide[p] || {});
                        }
                    });
                }
            },
            ruleInferDim: {
                value: function ruleInferDim(dimName, guide) {

                    var r = dimName;

                    var dims = this.spec.spec.dimensions;

                    if (!dims.hasOwnProperty(r)) {
                        return r;
                    }

                    if (guide.hasOwnProperty("tickLabel")) {
                        r = "" + dimName + "." + guide.tickLabel;
                    } else if (dims[dimName].value) {
                        r = "" + dimName + "." + dims[dimName].value;
                    }

                    var myDims = this.dist.sources["/"].dims;
                    if (!myDims.hasOwnProperty(r)) {
                        myDims[r] = { type: myDims[dimName].type };
                    }

                    return r;
                }
            },
            scalesPool: {
                value: function scalesPool(scaleType, dimName, guide) {

                    var k = "" + scaleType + "_" + dimName;

                    if (this.dist.scales.hasOwnProperty(k)) {
                        return k;
                    }

                    var dims = this.spec.spec.dimensions;

                    var item = {};
                    if (scaleType === "color" && dimName !== null) {
                        item = {
                            type: "color",
                            source: "/",
                            dim: this.ruleInferDim(dimName, guide)
                        };

                        if (guide.hasOwnProperty("brewer")) {
                            item.brewer = guide.brewer;
                        }
                    }

                    if (scaleType === "size" && dimName !== null) {
                        item = {
                            type: "size",
                            source: "/",
                            dim: this.ruleInferDim(dimName, guide),
                            min: 2,
                            max: 10,
                            mid: 5
                        };
                    }

                    if (dims.hasOwnProperty(dimName) && (scaleType === "x" || scaleType === "y")) {
                        item = {
                            type: dims[dimName].scale,
                            source: "/",
                            dim: this.ruleInferDim(dimName, guide)
                        };

                        if (guide.hasOwnProperty("min")) {
                            item.min = guide.min;
                        }

                        if (guide.hasOwnProperty("max")) {
                            item.max = guide.max;
                        }

                        if (guide.hasOwnProperty("autoScale")) {
                            item.autoScale = guide.autoScale;
                        } else {
                            item.autoScale = true;
                        }

                        if (guide.hasOwnProperty("tickPeriod")) {
                            item.period = guide.tickPeriod;
                        }
                    }

                    this.dist.scales[k] = item;

                    return k;
                }
            },
            ruleInferExpression: {
                value: function ruleInferExpression(srcUnit) {

                    var expr = {
                        operator: "none",
                        params: []
                    };

                    var g = srcUnit.guide || {};
                    var gx = g.x || {};
                    var gy = g.y || {};

                    if (srcUnit.type.indexOf("ELEMENT.") === 0) {

                        if (srcUnit.color) {
                            expr = {
                                operator: "groupBy",
                                params: [this.ruleInferDim(srcUnit.color, g.color || {})]
                            };
                        }
                    } else if (srcUnit.type === "COORDS.RECT") {

                        if (srcUnit.unit.length === 1 && srcUnit.unit[0].type === "COORDS.RECT") {

                            // jshint ignore:start
                            // jscs:disable requireDotNotation
                            if (gx.tickPeriod || gy.tickPeriod) {
                                expr = {
                                    operator: "cross_period",
                                    params: [this.ruleInferDim(srcUnit.x, gx), this.ruleInferDim(srcUnit.y, gy), gx.tickPeriod, gy.tickPeriod]
                                };
                            } else {
                                expr = {
                                    operator: "cross",
                                    params: [this.ruleInferDim(srcUnit.x, gx), this.ruleInferDim(srcUnit.y, gy)]
                                };
                            }
                            // jscs:enable requireDotNotation
                            // jshint ignore:end
                        }
                    }

                    return _.extend({ inherit: false, source: "/" }, expr);
                }
            }
        });

        return SpecConverter;
    })();
});
define('spec-transform-extract-axes',["exports", "underscore", "./utils/utils"], function (exports, _underscore, _utilsUtils) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _ = _interopRequire(_underscore);

    var utils = _utilsUtils.utils;

    var SpecTransformExtractAxes = exports.SpecTransformExtractAxes = (function () {
        function SpecTransformExtractAxes(spec) {
            _classCallCheck(this, SpecTransformExtractAxes);

            this.spec = spec;
        }

        _createClass(SpecTransformExtractAxes, {
            transform: {
                value: function transform() {
                    var refSpec = this.spec;

                    try {
                        this.ruleExtractAxes(refSpec);
                    } catch (ex) {
                        if (ex.message === "Not applicable") {
                            console.log("[TauCharts]: can't extract axes for the given chart specification", refSpec);
                        } else {
                            throw ex;
                        }
                    }

                    return refSpec;
                }
            },
            ruleExtractAxes: {
                value: function ruleExtractAxes(spec) {

                    var isCoordsRect = function (unitRef) {
                        return unitRef.type === "COORDS.RECT" || unitRef.type === "RECT";
                    };

                    var isElement = function (unitRef) {
                        return unitRef.type.indexOf("ELEMENT.") === 0;
                    };

                    var traverse = function (root, enterFn, exitFn) {
                        var level = arguments[3] === undefined ? 0 : arguments[3];

                        var shouldContinue = enterFn(root, level);

                        if (shouldContinue) {
                            (root.units || []).map(function (rect) {
                                return traverse(rect, enterFn, exitFn, level + 1);
                            });
                        }

                        exitFn(root, level);
                    };

                    var ttl = { l: 0, r: 10, t: 10, b: 0 };
                    var seq = [];
                    var enterIterator = function (unitRef, level) {

                        if (level > 1 || !isCoordsRect(unitRef)) {
                            throw new Error("Not applicable");
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
                                throw new Error("Not applicable");
                            }

                            return x;
                        }).filter(isCoordsRect);

                        return rects.length === 1;
                    };

                    var pad = function (x) {
                        return x ? 10 : 0;
                    };
                    var exitIterator = function (unitRef) {

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

                        guide.autoLayout = "extract-axes";

                        guide.x.padding += ttl.b - lvl.b;
                        guide.y.padding += ttl.l - lvl.l;
                    };

                    traverse(spec.unit, enterIterator, exitIterator);

                    spec.unit.guide.padding = ttl;
                    spec.unit.guide.autoLayout = "";
                }
            }
        });

        return SpecTransformExtractAxes;
    })();
});
define('formatter-registry',["exports", "d3"], function (exports, _d3) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /* jshint ignore:start */

    var d3 = _interopRequire(_d3);

    /* jshint ignore:end */
    var FORMATS_MAP = {

        "x-num-auto": function xNumAuto(x) {
            var v = parseFloat(x.toFixed(2));
            return Math.abs(v) < 1 ? v.toString() : d3.format("s")(v);
        },

        percent: function percent(x) {
            var v = parseFloat((x * 100).toFixed(2));
            return v.toString() + "%";
        },

        day: d3.time.format("%d-%b-%Y"),

        "day-short": d3.time.format("%d-%b"),

        week: d3.time.format("%d-%b-%Y"),

        "week-short": d3.time.format("%d-%b"),

        month: function (x) {
            var d = new Date(x);
            var m = d.getMonth();
            var formatSpec = m === 0 ? "%B, %Y" : "%B";
            return d3.time.format(formatSpec)(x);
        },

        "month-short": function (x) {
            var d = new Date(x);
            var m = d.getMonth();
            var formatSpec = m === 0 ? "%b '%y" : "%b";
            return d3.time.format(formatSpec)(x);
        },

        "month-year": d3.time.format("%B, %Y"),

        quarter: function (x) {
            var d = new Date(x);
            var m = d.getMonth();
            var q = (m - m % 3) / 3;
            return "Q" + (q + 1) + " " + d.getFullYear();
        },

        year: d3.time.format("%Y"),

        "x-time-auto": null
    };

    var FormatterRegistry = {

        get: function (formatAlias, nullOrUndefinedAlias) {

            var nullAlias = nullOrUndefinedAlias || "";

            var identity = function (x) {
                return (x === null || typeof x === "undefined" ? nullAlias : x).toString();
            };

            var hasFormat = FORMATS_MAP.hasOwnProperty(formatAlias);
            var formatter = hasFormat ? FORMATS_MAP[formatAlias] : identity;

            if (hasFormat) {
                formatter = FORMATS_MAP[formatAlias];
            }

            if (!hasFormat && formatAlias) {
                formatter = function (v) {
                    var f = _.isDate(v) ? d3.time.format(formatAlias) : d3.format(formatAlias);
                    return f(v);
                };
            }

            if (!hasFormat && !formatAlias) {
                formatter = identity;
            }

            return formatter;
        },

        add: function (formatAlias, formatter) {
            FORMATS_MAP[formatAlias] = formatter;
        }
    };

    exports.FormatterRegistry = FormatterRegistry;
});
define('spec-transform-auto-layout',["exports", "underscore", "./utils/utils", "./utils/utils-draw", "./formatter-registry", "./utils/utils-dom", "./scales-factory"], function (exports, _underscore, _utilsUtils, _utilsUtilsDraw, _formatterRegistry, _utilsUtilsDom, _scalesFactory) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _ = _interopRequire(_underscore);

    var utils = _utilsUtils.utils;
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var FormatterRegistry = _formatterRegistry.FormatterRegistry;
    var utilsDom = _utilsUtilsDom.utilsDom;
    var ScalesFactory = _scalesFactory.ScalesFactory;

    function extendGuide(guide, targetUnit, dimension, properties) {
        var guide_dim = guide.hasOwnProperty(dimension) ? guide[dimension] : {};
        _.each(properties, function (prop) {
            _.extend(targetUnit.guide[dimension][prop], guide_dim[prop]);
        });
        _.extend(targetUnit.guide[dimension], _.omit.apply(_, [guide_dim].concat[properties]));
    }

    var applyCustomProps = function (targetUnit, customUnit) {
        var guide = customUnit.guide || {};
        var config = {
            x: ["label"],
            y: ["label"],
            size: ["label"],
            color: ["label"],
            padding: []
        };

        _.each(config, function (properties, name) {
            extendGuide(guide, targetUnit, name, properties);
        });
        _.extend(targetUnit.guide, _.omit.apply(_, [guide].concat(_.keys(config))));
        return targetUnit;
    };

    var extendLabel = function extendLabel(guide, dimension, extend) {
        guide[dimension] = _.defaults(guide[dimension] || {}, {
            label: ""
        });
        guide[dimension].label = _.isObject(guide[dimension].label) ? guide[dimension].label : { text: guide[dimension].label };
        guide[dimension].label = _.defaults(guide[dimension].label, extend || {}, {
            padding: 32,
            rotate: 0,
            textAnchor: "middle",
            cssClass: "label",
            dock: null
        });

        return guide[dimension];
    };
    var extendAxis = function extendAxis(guide, dimension, extend) {
        guide[dimension] = _.defaults(guide[dimension], extend || {}, {
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

    var applyNodeDefaults = function (node) {
        node.options = node.options || {};
        node.guide = node.guide || {};
        node.guide.padding = _.defaults(node.guide.padding || {}, { l: 0, b: 0, r: 0, t: 0 });

        node.guide.x = extendLabel(node.guide, "x");
        node.guide.x = extendAxis(node.guide, "x", {
            cssClass: "x axis",
            scaleOrient: "bottom",
            textAnchor: "middle"
        });

        node.guide.y = extendLabel(node.guide, "y", { rotate: -90 });
        node.guide.y = extendAxis(node.guide, "y", {
            cssClass: "y axis",
            scaleOrient: "left",
            textAnchor: "end"
        });

        node.guide.size = extendLabel(node.guide, "size");
        node.guide.color = extendLabel(node.guide, "color");

        return node;
    };

    var inheritProps = function (childUnit, root) {

        childUnit.guide = childUnit.guide || {};
        childUnit.guide.padding = childUnit.guide.padding || { l: 0, t: 0, r: 0, b: 0 };

        // leaf elements should inherit coordinates properties
        if (!childUnit.hasOwnProperty("units")) {
            childUnit = _.defaults(childUnit, root);
            childUnit.guide = _.defaults(childUnit.guide, utils.clone(root.guide));
            childUnit.guide.x = _.defaults(childUnit.guide.x, utils.clone(root.guide.x));
            childUnit.guide.y = _.defaults(childUnit.guide.y, utils.clone(root.guide.y));
        }

        return childUnit;
    };

    var createSelectorPredicates = function (root) {

        var children = root.units || [];

        var isLeaf = !root.hasOwnProperty("units");
        var isLeafParent = !children.some(function (c) {
            return c.hasOwnProperty("units");
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
            var size = fnCalcTickLabelSize("TauChart Library");
            size.width = axisLabelLimit * 0.625; // golden ratio
            return size;
        }

        var maxXTickText = _.max(domainValues, function (x) {
            return formatter(x).toString().length;
        });

        // d3 sometimes produce fractional ticks on wide space
        // so we intentionally add fractional suffix
        // to foresee scale density issues
        var suffix = _.isNumber(maxXTickText) ? ".00" : "";

        return fnCalcTickLabelSize(formatter(maxXTickText) + suffix);
    };

    var getTickFormat = function (dim, defaultFormats) {
        var dimType = dim.dimType;
        var scaleType = dim.scaleType;
        var specifier = "*";

        var key = [dimType, scaleType, specifier].join(":");
        var tag = [dimType, scaleType].join(":");
        return defaultFormats[key] || defaultFormats[tag] || defaultFormats[dimType] || null;
    };

    var calcUnitGuide = function calcUnitGuide(unit, meta, settings, allowXVertical, allowYVertical, inlineLabels) {

        var dimX = meta.dimension(unit.x);
        var dimY = meta.dimension(unit.y);

        var isXContinues = dimX.dimType === "measure";
        var isYContinues = dimY.dimType === "measure";

        var xDensityPadding = settings.hasOwnProperty("xDensityPadding:" + dimX.dimType) ? settings["xDensityPadding:" + dimX.dimType] : settings.xDensityPadding;

        var yDensityPadding = settings.hasOwnProperty("yDensityPadding:" + dimY.dimType) ? settings["yDensityPadding:" + dimY.dimType] : settings.yDensityPadding;

        var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
        var xValues = xMeta.values;
        var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
        var yValues = yMeta.values;

        unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats);
        unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats);

        if (["day", "week", "month"].indexOf(unit.guide.x.tickFormat) >= 0) {
            unit.guide.x.tickFormat += "-short";
        }

        if (["day", "week", "month"].indexOf(unit.guide.y.tickFormat) >= 0) {
            unit.guide.y.tickFormat += "-short";
        }

        var xIsEmptyAxis = xValues.length === 0;
        var yIsEmptyAxis = yValues.length === 0;

        var maxXTickSize = getMaxTickLabelSize(xValues, FormatterRegistry.get(unit.guide.x.tickFormat, unit.guide.x.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.xAxisTickLabelLimit);

        var maxYTickSize = getMaxTickLabelSize(yValues, FormatterRegistry.get(unit.guide.y.tickFormat, unit.guide.y.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.yAxisTickLabelLimit);

        var xAxisPadding = settings.xAxisPadding;
        var yAxisPadding = settings.yAxisPadding;

        var isXVertical = allowXVertical ? !isXContinues : false;
        var isYVertical = allowYVertical ? !isYContinues : false;

        unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
        unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

        unit.guide.x.rotate = isXVertical ? 90 : 0;
        unit.guide.x.textAnchor = isXVertical ? "start" : unit.guide.x.textAnchor;

        unit.guide.y.rotate = isYVertical ? -90 : 0;
        unit.guide.y.textAnchor = isYVertical ? "middle" : unit.guide.y.textAnchor;

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

            unit.guide.x.label.cssClass += " inline";
            unit.guide.x.label.dock = "right";
            unit.guide.x.label.textAnchor = "end";

            unit.guide.y.label.cssClass += " inline";
            unit.guide.y.label.dock = "right";
            unit.guide.y.label.textAnchor = "end";

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

        NONE: function (srcSpec, meta, settings) {

            var spec = utils.clone(srcSpec);
            fnTraverseSpec(utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {
                unit.guide.x.tickFontHeight = settings.getAxisTickLabelSize("X").height;
                unit.guide.y.tickFontHeight = settings.getAxisTickLabelSize("Y").height;

                unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
                unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

                return unit;
            });
            return spec;
        },

        "BUILD-LABELS": function (srcSpec, meta, settings) {

            var spec = utils.clone(srcSpec);

            var xLabels = [];
            var yLabels = [];
            var xUnit = null;
            var yUnit = null;

            utils.traverseJSON(spec.unit, "units", createSelectorPredicates, function (selectors, unit) {

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

                unit.guide.x = unit.guide.x || { label: "" };
                unit.guide.y = unit.guide.y || { label: "" };

                unit.guide.x.label = _.isObject(unit.guide.x.label) ? unit.guide.x.label : { text: unit.guide.x.label };
                unit.guide.y.label = _.isObject(unit.guide.y.label) ? unit.guide.y.label : { text: unit.guide.y.label };

                if (unit.x) {
                    unit.guide.x.label.text = unit.guide.x.label.text || meta.dimension(unit.x).dimName;
                }

                if (unit.y) {
                    unit.guide.y.label.text = unit.guide.y.label.text || meta.dimension(unit.y).dimName;
                }

                var x = unit.guide.x.label.text;
                if (x) {
                    xLabels.push(x);
                    unit.guide.x.tickFormatNullAlias = unit.guide.x.hasOwnProperty("tickFormatNullAlias") ? unit.guide.x.tickFormatNullAlias : "No " + x;
                    unit.guide.x.label.text = "";
                }

                var y = unit.guide.y.label.text;
                if (y) {
                    yLabels.push(y);
                    unit.guide.y.tickFormatNullAlias = unit.guide.y.hasOwnProperty("tickFormatNullAlias") ? unit.guide.y.tickFormatNullAlias : "No " + y;
                    unit.guide.y.label.text = "";
                }

                return unit;
            });

            if (xUnit) {
                xUnit.guide.x.label.text = xLabels.join(" > ");
            }

            if (yUnit) {
                yUnit.guide.y.label.text = yLabels.join(" > ");
            }

            return spec;
        },

        "BUILD-GUIDE": function (srcSpec, meta, settings) {

            var spec = utils.clone(srcSpec);
            fnTraverseSpec(utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {

                if (selectorPredicates.isLeaf) {
                    return unit;
                }

                if (!unit.guide.hasOwnProperty("showGridLines")) {
                    unit.guide.showGridLines = selectorPredicates.isLeafParent ? "xy" : "";
                }

                var isFacetUnit = !selectorPredicates.isLeaf && !selectorPredicates.isLeafParent;
                if (isFacetUnit) {
                    // unit is a facet!
                    unit.guide.x.cssClass += " facet-axis";
                    unit.guide.y.cssClass += " facet-axis";
                }

                var dimX = meta.dimension(unit.x);
                var dimY = meta.dimension(unit.y);

                var isXContinues = dimX.dimType === "measure";
                var isYContinues = dimY.dimType === "measure";

                var xDensityPadding = settings.hasOwnProperty("xDensityPadding:" + dimX.dimType) ? settings["xDensityPadding:" + dimX.dimType] : settings.xDensityPadding;

                var yDensityPadding = settings.hasOwnProperty("yDensityPadding:" + dimY.dimType) ? settings["yDensityPadding:" + dimY.dimType] : settings.yDensityPadding;

                var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
                var xValues = xMeta.values;
                var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
                var yValues = yMeta.values;

                unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats);
                unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats);

                var xIsEmptyAxis = xValues.length === 0;
                var yIsEmptyAxis = yValues.length === 0;

                var maxXTickSize = getMaxTickLabelSize(xValues, FormatterRegistry.get(unit.guide.x.tickFormat, unit.guide.x.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.xAxisTickLabelLimit);

                var maxYTickSize = getMaxTickLabelSize(yValues, FormatterRegistry.get(unit.guide.y.tickFormat, unit.guide.y.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.yAxisTickLabelLimit);

                var xAxisPadding = selectorPredicates.isLeafParent ? settings.xAxisPadding : 0;
                var yAxisPadding = selectorPredicates.isLeafParent ? settings.yAxisPadding : 0;

                var isXVertical = !isFacetUnit && (Boolean(dimX.dimType) && dimX.dimType !== "measure");

                unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
                unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

                unit.guide.x.rotate = isXVertical ? 90 : 0;
                unit.guide.x.textAnchor = isXVertical ? "start" : unit.guide.x.textAnchor;

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

        "BUILD-COMPACT": function (srcSpec, meta, settings) {

            var spec = utils.clone(srcSpec);
            fnTraverseSpec(utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {

                if (selectorPredicates.isLeaf) {
                    return unit;
                }

                if (selectorPredicates.isLeafParent) {

                    unit.guide.showGridLines = unit.guide.hasOwnProperty("showGridLines") ? unit.guide.showGridLines : "xy";

                    return calcUnitGuide(unit, meta, _.defaults({
                        xTickWordWrapLinesLimit: 1,
                        yTickWordWrapLinesLimit: 1
                    }, settings), true, false, true);
                }

                // facet level
                unit.guide.x.cssClass += " facet-axis compact";
                unit.guide.y.cssClass += " facet-axis compact";

                return calcUnitGuide(unit, meta, _.defaults({
                    xAxisPadding: 0,
                    yAxisPadding: 0,
                    distToXAxisLabel: 0,
                    distToYAxisLabel: 0,
                    xTickWordWrapLinesLimit: 1,
                    yTickWordWrapLinesLimit: 1
                }, settings), false, true, false);
            });

            return spec;
        },

        "OPTIMAL-SIZE": function (srcSpec, meta, settings) {

            var spec = utils.clone(srcSpec);

            var traverseFromDeep = function (root) {
                var r;

                if (!root.units) {
                    r = { w: 0, h: 0 };
                } else {
                    var s = traverseFromDeep(root.units[0]);
                    var g = root.guide;
                    var xmd = g.x.$minimalDomain || 1;
                    var ymd = g.y.$minimalDomain || 1;
                    var maxW = Math.max(xmd * g.x.density, xmd * s.w);
                    var maxH = Math.max(ymd * g.y.density, ymd * s.h);

                    r = {
                        w: maxW + g.padding.l + g.padding.r,
                        h: maxH + g.padding.t + g.padding.b
                    };
                }

                return r;
            };

            var traverseToDeep = function (meta, root, size, localSettings) {

                var mdx = root.guide.x.$minimalDomain || 1;
                var mdy = root.guide.y.$minimalDomain || 1;

                var perTickX = size.width / mdx;
                var perTickY = size.height / mdy;

                var dimX = meta.dimension(root.x);
                var dimY = meta.dimension(root.y);
                var xDensityPadding = localSettings.hasOwnProperty("xDensityPadding:" + dimX.dimType) ? localSettings["xDensityPadding:" + dimX.dimType] : localSettings.xDensityPadding;

                var yDensityPadding = localSettings.hasOwnProperty("yDensityPadding:" + dimY.dimType) ? localSettings["yDensityPadding:" + dimY.dimType] : localSettings.yDensityPadding;

                if (root.guide.x.hide !== true && root.guide.x.rotate !== 0 && perTickX > root.guide.x.$maxTickTextW + xDensityPadding * 2) {

                    root.guide.x.rotate = 0;
                    root.guide.x.textAnchor = "middle";
                    root.guide.x.tickFormatWordWrapLimit = perTickX;
                    var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);

                    var xDelta = 0 - s + root.guide.x.$maxTickTextH;

                    root.guide.padding.b += root.guide.padding.b > 0 ? xDelta : 0;

                    if (root.guide.x.label.padding > s + localSettings.xAxisPadding) {
                        root.guide.x.label.padding += xDelta;
                    }
                }

                if (root.guide.y.hide !== true && root.guide.y.rotate !== 0 && root.guide.y.tickFormatWordWrapLines === 1 && perTickY > root.guide.y.$maxTickTextW + yDensityPadding * 2) {

                    root.guide.y.tickFormatWordWrapLimit = perTickY - yDensityPadding * 2;
                }

                var newSize = {
                    width: perTickX,
                    height: perTickY
                };

                if (root.units) {
                    traverseToDeep(meta, root.units[0], newSize, localSettings);
                }
            };

            var optimalSize = traverseFromDeep(spec.unit);
            var recommendedWidth = optimalSize.w;
            var recommendedHeight = optimalSize.h;

            var size = settings.size;
            var scrollSize = settings.getScrollBarWidth();

            var deltaW = size.width - recommendedWidth;
            var deltaH = size.height - recommendedHeight;

            var screenW = deltaW >= 0 ? size.width : recommendedWidth;
            var scrollW = deltaH >= 0 ? 0 : scrollSize;

            var screenH = deltaH >= 0 ? size.height : recommendedHeight;
            var scrollH = deltaW >= 0 ? 0 : scrollSize;

            settings.size.height = screenH - scrollH;
            settings.size.width = screenW - scrollW;

            // optimize full spec depending on size
            traverseToDeep(meta, spec.unit, settings.size, settings);

            return spec;
        }
    };

    SpecEngineTypeMap.AUTO = function (srcSpec, meta, settings) {
        return ["BUILD-LABELS", "BUILD-GUIDE"].reduce(function (spec, engineName) {
            return SpecEngineTypeMap[engineName](spec, meta, settings);
        }, srcSpec);
    };

    SpecEngineTypeMap.COMPACT = function (srcSpec, meta, settings) {
        return ["BUILD-LABELS", "BUILD-COMPACT"].reduce(function (spec, engineName) {
            return SpecEngineTypeMap[engineName](spec, meta, settings);
        }, srcSpec);
    };

    var fnTraverseSpec = function (orig, specUnitRef, transformRules) {
        var xRef = applyNodeDefaults(specUnitRef);
        xRef = transformRules(createSelectorPredicates(xRef), xRef);
        xRef = applyCustomProps(xRef, orig);
        var prop = _.omit(xRef, "units");
        (xRef.units || []).forEach(function (unit) {
            return fnTraverseSpec(utils.clone(unit), inheritProps(unit, prop), transformRules);
        });
        return xRef;
    };

    var SpecEngineFactory = {
        get: function (typeName, settings, srcSpec, fnCreateScale) {

            var engine = SpecEngineTypeMap[typeName] || SpecEngineTypeMap.NONE;
            var meta = {

                dimension: function (scaleId) {
                    var scaleCfg = srcSpec.scales[scaleId];
                    var dim = srcSpec.sources[scaleCfg.source].dims[scaleCfg.dim] || {};
                    return {
                        dimName: scaleCfg.dim,
                        dimType: dim.type,
                        scaleType: scaleCfg.type
                    };
                },

                scaleMeta: function (scaleId) {
                    var scale = fnCreateScale("pos", scaleId);
                    return {
                        values: scale.domain()
                    };
                }
            };

            var unitSpec = { unit: utils.clone(srcSpec.unit) };
            var fullSpec = engine(unitSpec, meta, settings);
            if (settings.fitSize) {
                fullSpec = SpecEngineTypeMap["OPTIMAL-SIZE"](fullSpec, meta, settings);
            }
            srcSpec.unit = fullSpec.unit;
            return srcSpec;
        }
    };

    var SpecTransformAutoLayout = exports.SpecTransformAutoLayout = (function () {
        function SpecTransformAutoLayout(spec) {
            _classCallCheck(this, SpecTransformAutoLayout);

            this.spec = spec;
            this.scalesCreator = new ScalesFactory(spec.sources);
        }

        _createClass(SpecTransformAutoLayout, {
            transform: {
                value: function transform() {
                    var _this = this;

                    var spec = this.spec;
                    var size = spec.settings.size;

                    var rule = _.find(spec.settings.specEngine, function (rule) {
                        return size.width <= rule.width;
                    });

                    var auto = SpecEngineFactory.get(rule.name, spec.settings, spec, function (type, alias) {

                        var name = alias ? alias : "" + type + ":default";

                        return _this.scalesCreator.create(spec.scales[name], null, [0, 100]);
                    });

                    return auto;
                }
            }
        });

        return SpecTransformAutoLayout;
    })();
});
define('charts/tau.plot',["exports", "../api/balloon", "../event", "../plugins", "../utils/utils", "../utils/utils-dom", "../const", "../units-registry", "../data-processor", "../utils/layuot-template", "../spec-converter", "../spec-transform-extract-axes", "../spec-transform-auto-layout", "./tau.gpl"], function (exports, _apiBalloon, _event, _plugins, _utilsUtils, _utilsUtilsDom, _const, _unitsRegistry, _dataProcessor, _utilsLayuotTemplate, _specConverter, _specTransformExtractAxes, _specTransformAutoLayout, _tauGpl) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var Tooltip = _apiBalloon.Tooltip;
    var Emitter = _event.Emitter;
    var Plugins = _plugins.Plugins;
    var propagateDatumEvents = _plugins.propagateDatumEvents;
    var utils = _utilsUtils.utils;
    var utilsDom = _utilsUtilsDom.utilsDom;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var unitsRegistry = _unitsRegistry.unitsRegistry;
    var DataProcessor = _dataProcessor.DataProcessor;
    var getLayout = _utilsLayuotTemplate.getLayout;
    var SpecConverter = _specConverter.SpecConverter;
    var SpecTransformExtractAxes = _specTransformExtractAxes.SpecTransformExtractAxes;
    var SpecTransformAutoLayout = _specTransformAutoLayout.SpecTransformAutoLayout;
    var GPL = _tauGpl.GPL;

    var Plot = exports.Plot = (function (_Emitter) {
        function Plot(config) {
            _classCallCheck(this, Plot);

            _get(Object.getPrototypeOf(Plot.prototype), "constructor", this).call(this);
            this._nodes = [];
            this._svg = null;
            this._filtersStore = {
                filters: {},
                tick: 0
            };
            this._layout = getLayout();

            if (["sources", "scales"].filter(function (p) {
                return config.hasOwnProperty(p);
            }).length === 2) {
                this.config = config;
                this.configGPL = config;
            } else {
                this.config = this.setupConfig(config);
                this.configGPL = new SpecConverter(this.config).convert();
            }

            this.configGPL.settings = this.setupSettings(this.configGPL.settings);

            this.transformers = [SpecTransformAutoLayout];
            if (this.configGPL.settings.layoutEngine === "EXTRACT") {
                this.transformers.push(SpecTransformExtractAxes);
            }

            this._originData = _.clone(this.configGPL.sources);

            this._plugins = new Plugins(this.config.plugins, this);
        }

        _inherits(Plot, _Emitter);

        _createClass(Plot, {
            setupConfig: {
                value: function setupConfig(config) {

                    if (!config.spec && !config.spec.unit) {
                        throw new Error("Provide spec for plot");
                    }

                    this.config = _.defaults(config, {
                        spec: {},
                        data: [],
                        plugins: [],
                        settings: {}
                    });
                    this._emptyContainer = config.emptyContainer || "";
                    // TODO: remove this particular config cases
                    this.config.settings.specEngine = config.specEngine || config.settings.specEngine;
                    this.config.settings.layoutEngine = config.layoutEngine || config.settings.layoutEngine;
                    this.config.settings = this.setupSettings(this.config.settings);

                    this.config.spec.dimensions = this.setupMetaInfo(this.config.spec.dimensions, this.config.data);

                    var log = this.config.settings.log;
                    if (this.config.settings.excludeNull) {
                        this.addFilter({
                            tag: "default",
                            src: "/",
                            predicate: DataProcessor.excludeNullValues(this.config.spec.dimensions, function (item) {
                                return log([item, "point was excluded, because it has undefined values."], "WARN");
                            })
                        });
                    }

                    return this.config;
                }
            },
            getConfig: {

                // fixme after all migrate

                value: function getConfig(isOld) {
                    // this.configGPL
                    return isOld ? this.config : this.configGPL || this.config;
                }
            },
            setupMetaInfo: {
                value: function setupMetaInfo(dims, data) {
                    var meta = dims ? dims : DataProcessor.autoDetectDimTypes(data);
                    return DataProcessor.autoAssignScales(meta);
                }
            },
            setupSettings: {
                value: function setupSettings(configSettings) {
                    var globalSettings = Plot.globalSettings;
                    var localSettings = {};
                    Object.keys(globalSettings).forEach(function (k) {
                        localSettings[k] = _.isFunction(globalSettings[k]) ? globalSettings[k] : utils.clone(globalSettings[k]);
                    });

                    var r = _.defaults(configSettings || {}, localSettings);

                    if (!utils.isArray(r.specEngine)) {
                        r.specEngine = [{ width: Number.MAX_VALUE, name: r.specEngine }];
                    }

                    return r;
                }
            },
            insertToRightSidebar: {
                value: function insertToRightSidebar(el) {
                    return utilsDom.appendTo(el, this._layout.rightSidebar);
                }
            },
            insertToHeader: {
                value: function insertToHeader(el) {
                    return utilsDom.appendTo(el, this._layout.header);
                }
            },
            addBalloon: {
                value: function addBalloon(conf) {
                    return new Tooltip("", conf || {});
                }
            },
            renderTo: {
                value: function renderTo(target, xSize) {
                    var _this = this;

                    this._svg = null;
                    this._target = target;
                    this._defaultSize = _.clone(xSize);

                    var targetNode = d3.select(target).node();
                    if (targetNode === null) {
                        throw new Error("Target element not found");
                    }

                    targetNode.appendChild(this._layout.layout);

                    var content = this._layout.content;
                    var size = _.clone(xSize) || {};
                    if (!size.width || !size.height) {
                        content.style.display = "none";
                        size = _.defaults(size, utilsDom.getContainerSize(content.parentNode));
                        content.style.display = "";
                        // TODO: fix this issue
                        if (!size.height) {
                            size.height = utilsDom.getContainerSize(this._layout.layout).height;
                        }
                    }

                    this.configGPL.settings.size = size;

                    var gpl = utils.clone(this.configGPL);
                    gpl.sources = this.getData({ isNew: true });
                    gpl.settings = this.configGPL.settings;

                    if (this.isEmptySources(gpl.sources)) {
                        content.innerHTML = this._emptyContainer;
                        return;
                    }

                    gpl = this.transformers.reduce(function (memo, TransformClass) {
                        return new TransformClass(memo).transform();
                    }, gpl);

                    var optimalSize = gpl.settings.size;

                    this._nodes = [];
                    gpl.onUnitDraw = function (unitNode) {
                        _this._nodes.push(unitNode);
                        _this.fire("unitdraw", unitNode);
                    };

                    this.fire("specready", gpl);

                    new GPL(gpl).renderTo(content, optimalSize);

                    var svgXElement = d3.select(content).select("svg");

                    this._svg = svgXElement.node();
                    this._layout.rightSidebar.style.maxHeight = "" + optimalSize.height + "px";
                    this.fire("render", this._svg);
                }
            },
            getData: {
                value: function getData() {
                    var _this = this;

                    var param = arguments[0] === undefined ? {} : arguments[0];

                    var applyFilterMap = function (data, filtersSelector) {

                        var filters = _(_this._filtersStore.filters).chain().values().flatten().reject(function (f) {
                            return _.contains(param.excludeFilter, f.tag) || !filtersSelector(f);
                        }).pluck("predicate").value();

                        return data.filter(function (row) {
                            return filters.reduce(function (prev, f) {
                                return prev && f(row);
                            }, true);
                        });
                    };

                    if (param.isNew) {
                        var filteredSources = {};
                        filteredSources["?"] = this._originData["?"];
                        return Object.keys(this._originData).filter(function (k) {
                            return k !== "?";
                        }).reduce(function (memo, key) {
                            var item = _this._originData[key];
                            memo[key] = {
                                dims: item.dims,
                                data: applyFilterMap(item.data, function (f) {
                                    return f.src === key;
                                })
                            };
                            return memo;
                        }, filteredSources);
                    } else {
                        return applyFilterMap(this.config.data, function (f) {
                            return true;
                        });
                    }
                }
            },
            isEmptySources: {
                value: function isEmptySources(sources) {

                    return !Object.keys(sources).filter(function (k) {
                        return k !== "?";
                    }).filter(function (k) {
                        return sources[k].data.length > 0;
                    }).length;
                }
            },
            setData: {
                value: function setData(data) {
                    this.config.data = data;
                    this.configGPL.sources["/"].data = data;
                    this._originData = _.clone(this.configGPL.sources);
                    this.refresh();
                }
            },
            getSVG: {
                value: function getSVG() {
                    return this._svg;
                }
            },
            addFilter: {
                value: function addFilter(filter) {
                    filter.src = filter.src || "/";
                    var tag = filter.tag;
                    var filters = this._filtersStore.filters[tag] = this._filtersStore.filters[tag] || [];
                    var id = this._filtersStore.tick++;
                    filter.id = id;
                    filters.push(filter);
                    this.refresh();
                    return id;
                }
            },
            removeFilter: {
                value: function removeFilter(id) {
                    var _this = this;

                    _.each(this._filtersStore.filters, function (filters, key) {
                        _this._filtersStore.filters[key] = _.reject(filters, function (item) {
                            return item.id === id;
                        });
                    });
                    this.refresh();
                }
            },
            refresh: {
                value: function refresh() {
                    if (this._target) {
                        this.renderTo(this._target, this._defaultSize);
                    }
                }
            },
            resize: {
                value: function resize() {
                    var sizes = arguments[0] === undefined ? {} : arguments[0];

                    this.renderTo(this._target, sizes);
                }
            },
            select: {
                value: function select(queryFilter) {
                    return this._nodes.filter(queryFilter);
                }
            },
            traverseSpec: {
                value: function traverseSpec(spec, iterator) {

                    var traverse = function (node, iterator, parentNode) {
                        iterator(node, parentNode);
                        (node.units || []).map(function (x) {
                            return traverse(x, iterator, node);
                        });
                    };

                    traverse(spec.unit, iterator, null);
                }
            }
        });

        return Plot;
    })(Emitter);
});
define('charts/tau.chart',["exports", "./tau.plot", "../utils/utils", "../data-processor"], function (exports, _tauPlot, _utilsUtils, _dataProcessor) {
    

    var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var Plot = _tauPlot.Plot;
    var utils = _utilsUtils.utils;
    var DataProcessor = _dataProcessor.DataProcessor;

    var convertAxis = function (data) {
        return !data ? null : data;
    };

    var normalizeSettings = function (axis) {
        return !utils.isArray(axis) ? [axis] : axis.length === 0 ? [null] : axis;
    };

    var createElement = function (type, config) {
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
        SUCCESS: "SUCCESS",
        WARNING: "WARNING",
        FAIL: "FAIL"
    };
    /* jshint ignore:start */

    var strategyNormalizeAxis = (function () {
        var _strategyNormalizeAxis = {};

        _defineProperty(_strategyNormalizeAxis, status.SUCCESS, function (axis) {
            return axis;
        });

        _defineProperty(_strategyNormalizeAxis, status.FAIL, function (axis, data) {
            throw new Error((data.messages || []).join("\n") ||
            // jscs:disable
            "This configuration is not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart");
        });

        _defineProperty(_strategyNormalizeAxis, status.WARNING, function (axis, config, guide) {
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
        });

        return _strategyNormalizeAxis;
    })();
    /* jshint ignore:end */
    function validateAxis(dimensions, axis, axisName) {
        return axis.reduce(function (result, item, index) {
            var dimension = dimensions[item];
            if (!dimension) {
                result.status = status.FAIL;
                if (item) {
                    result.messages.push("\"" + item + "\" dimension is undefined for \"" + axisName + "\" axis");
                } else {
                    result.messages.push("\"" + axisName + "\" axis should be specified");
                }
            } else if (result.status != status.FAIL) {
                if (dimension.type === "measure") {
                    result.countMeasureAxis++;
                    result.indexMeasureAxis.push(index);
                }
                if (dimension.type !== "measure" && result.countMeasureAxis === 1) {
                    result.status = status.WARNING;
                } else if (result.countMeasureAxis > 1) {
                    result.status = status.FAIL;
                    result.messages.push("There is more than one measure dimension for \"" + axisName + "\" axis");
                }
            }
            return result;
        }, { status: status.SUCCESS, countMeasureAxis: 0, indexMeasureAxis: [], messages: [], axis: axisName });
    }
    function transformConfig(type, config) {
        var x = normalizeSettings(config.x);
        var y = normalizeSettings(config.y);

        var maxDeep = Math.max(x.length, y.length);

        var guide = normalizeSettings(config.guide);

        // feel the gaps if needed
        while (guide.length < maxDeep) {
            guide.push({});
        }

        // cut items
        guide = guide.slice(0, maxDeep);

        var validatedX = validateAxis(config.dimensions, x, "x");
        var validatedY = validateAxis(config.dimensions, y, "y");
        x = strategyNormalizeAxis[validatedX.status](x, validatedX, guide);
        y = strategyNormalizeAxis[validatedY.status](y, validatedY, guide);

        var spec = {
            type: "COORDS.RECT",
            unit: []
        };

        for (var i = maxDeep; i > 0; i--) {
            var currentX = x.pop();
            var currentY = y.pop();
            var currentGuide = guide.pop() || {};
            if (i === maxDeep) {
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
                    type: "COORDS.RECT",
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

    var typesChart = {
        scatterplot: function (config) {
            return transformConfig("ELEMENT.POINT", config);
        },
        line: function (config) {

            var data = config.data;

            var log = config.settings.log;

            var lineOrientationStrategies = {

                none: function (config) {
                    return null;
                },

                horizontal: function (config) {
                    var xs = utils.isArray(config.x) ? config.x : [config.x];
                    return xs[xs.length - 1];
                },

                vertical: function (config) {
                    var ys = utils.isArray(config.y) ? config.y : [config.y];
                    return ys[ys.length - 1];
                },

                auto: function (config) {
                    var xs = utils.isArray(config.x) ? config.x : [config.x];
                    var ys = utils.isArray(config.y) ? config.y : [config.y];
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
                        var r = DataProcessor.isYFunctionOfX(data, domainFields, [rangeProperty]);
                        if (r.result) {
                            variantIndex = i;
                        } else {
                            log(["Attempt to find a functional relation between", item[0] + " and " + item[1] + " is failed.", "There are several " + r.error.keyY + " values (e.g. " + r.error.errY.join(",") + ")", "for (" + r.error.keyX + " = " + r.error.valX + ")."].join(" "));
                        }
                        return r.result;
                    });

                    var propSortBy;
                    if (isMatchAny) {
                        propSortBy = variations[variantIndex][0][0];
                    } else {
                        log(["All attempts are failed.", "Will orient line horizontally by default.", "NOTE: the [scatterplot] chart is more convenient for that data."].join(" "));
                        propSortBy = primaryX;
                    }

                    return propSortBy;
                }
            };

            var orient = (config.lineOrientation || "auto").toLowerCase();
            var strategy = lineOrientationStrategies.hasOwnProperty(orient) ? lineOrientationStrategies[orient] : lineOrientationStrategies.auto;

            var propSortBy = strategy(config);
            if (propSortBy !== null) {
                config.data = _(data).sortBy(propSortBy);
            }

            return transformConfig("ELEMENT.LINE", config);
        },
        bar: function (config) {
            config.flip = false;
            return transformConfig("ELEMENT.INTERVAL", config);
        },
        horizontalBar: function (config) {
            config.flip = true;
            return transformConfig("ELEMENT.INTERVAL", config);
        }
    };

    var Chart = (function (_Plot) {
        function Chart(config) {
            _classCallCheck(this, Chart);

            config = _.defaults(config, { autoResize: true });
            if (config.autoResize) {
                Chart.winAware.push(this);
            }
            config.settings = this.setupSettings(config.settings);
            config.dimensions = this.setupMetaInfo(config.dimensions, config.data);
            var chartFactory = typesChart[config.type];

            if (_.isFunction(chartFactory)) {
                _get(Object.getPrototypeOf(Chart.prototype), "constructor", this).call(this, chartFactory(config));
            } else {
                throw new Error("Chart type " + config.type + " is not supported. Use one of " + _.keys(typesChart).join(", ") + ".");
            }
        }

        _inherits(Chart, _Plot);

        _createClass(Chart, {
            destroy: {
                value: function destroy() {
                    var index = Chart.winAware.indexOf(this);
                    if (index !== -1) {
                        Chart.winAware.splice(index, 1);
                    }
                    _get(Object.getPrototypeOf(Chart.prototype), "destroy", this).call(this);
                }
            }
        });

        return Chart;
    })(Plot);

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
    window.addEventListener("resize", Chart.resizeOnWindowEvent);
    exports.Chart = Chart;
});
define('utils/d3-decorators',["exports", "../utils/utils-draw", "underscore", "d3"], function (exports, _utilsUtilsDraw, _underscore, _d3) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var utilsDraw = _utilsUtilsDraw.utilsDraw;

    var _ = _interopRequire(_underscore);

    var d3 = _interopRequire(_d3);

    var d3getComputedTextLength = _.memoize(function (d3Text) {
        return d3Text.node().getComputedTextLength();
    }, function (d3Text) {
        return d3Text.node().textContent.length;
    });

    var cutText = function (textString, widthLimit, getComputedTextLength) {

        getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

        textString.each(function () {
            var textD3 = d3.select(this);
            var tokens = textD3.text().split(/\s+/);

            var stop = false;
            var parts = tokens.reduce(function (memo, t, i) {

                if (stop) {
                    return memo;
                }

                var text = i > 0 ? [memo, t].join(" ") : t;
                var len = getComputedTextLength(textD3.text(text));
                if (len < widthLimit) {
                    memo = text;
                } else {
                    var available = Math.floor(widthLimit / len * text.length);
                    memo = text.substr(0, available - 4) + "...";
                    stop = true;
                }

                return memo;
            }, "");

            textD3.text(parts);
        });
    };

    var wrapText = function (textNode, widthLimit, linesLimit, tickLabelFontHeight, isY, getComputedTextLength) {

        getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

        var addLine = function (targetD3, text, lineHeight, x, y, dy, lineNumber) {
            var dyNew = lineNumber * lineHeight + dy;
            return targetD3.append("tspan").attr("x", x).attr("y", y).attr("dy", dyNew + "em").text(text);
        };

        textNode.each(function () {
            var textD3 = d3.select(this),
                tokens = textD3.text().split(/\s+/),
                lineHeight = 1.1,
                // ems
            x = textD3.attr("x"),
                y = textD3.attr("y"),
                dy = parseFloat(textD3.attr("dy"));

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
                var text = last !== "" ? last + " " + next : next;
                var tLen = getComputedTextLength(tempSpan.text(text));
                var over = tLen > widthLimit;

                if (over && isLimit) {
                    var available = Math.floor(widthLimit / tLen * text.length);
                    memo[memo.length - 1] = text.substr(0, available - 4) + "...";
                    stopReduce = true;
                }

                if (over && !isLimit) {
                    memo.push(next);
                }

                if (!over) {
                    memo[memo.length - 1] = text;
                }

                return memo;
            }, [""]).filter(function (l) {
                return l.length > 0;
            });

            y = isY ? -1 * (lines.length - 1) * Math.floor(tickLabelFontHeight * 0.5) : y;
            lines.forEach(function (text, i) {
                return addLine(textD3, text, lineHeight, x, y, dy, i);
            });

            tempSpan.remove();
        });
    };

    var d3_decorator_prettify_categorical_axis_ticks = function (nodeAxis, size, isHorizontal) {

        var selection = nodeAxis.selectAll(".tick line");
        if (selection.empty()) {
            return;
        }

        var sectorSize = size / selection[0].length;
        var offsetSize = sectorSize / 2;

        var key = isHorizontal ? "x" : "y";
        var val = isHorizontal ? offsetSize : -offsetSize;

        selection.attr(key + "1", val).attr(key + "2", val);
    };

    var d3_decorator_fix_horizontal_axis_ticks_overflow = function (axisNode) {

        var timeTicks = axisNode.selectAll(".tick")[0];
        if (timeTicks.length < 2) {
            return;
        }

        var tick0 = parseFloat(timeTicks[0].attributes.transform.value.replace("translate(", ""));
        var tick1 = parseFloat(timeTicks[1].attributes.transform.value.replace("translate(", ""));

        var tickStep = tick1 - tick0;

        var maxTextLn = 0;
        var iMaxTexts = -1;
        var timeTexts = axisNode.selectAll(".tick text")[0];
        timeTexts.forEach(function (textNode, i) {
            var innerHTML = textNode.textContent || "";
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
                axisNode.classed({ "graphical-report__d3-time-overflown": true });
            }
        }
    };

    var d3_decorator_fix_axis_bottom_line = function (axisNode, size, isContinuesScale) {

        var selection = axisNode.selectAll(".tick line");
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

        var tickGroupClone = axisNode.select(".tick").node().cloneNode(true);
        axisNode.append(function () {
            return tickGroupClone;
        }).attr("transform", utilsDraw.translate(0, size - tickOffset));
    };

    var d3_decorator_prettify_axis_label = function (axisNode, guide, isHorizontal) {

        var koeff = isHorizontal ? 1 : -1;
        var labelTextNode = axisNode.append("text").attr("transform", utilsDraw.rotate(guide.rotate)).attr("class", guide.cssClass).attr("x", koeff * guide.size * 0.5).attr("y", koeff * guide.padding).style("text-anchor", guide.textAnchor);

        var delimiter = " > ";
        var tags = guide.text.split(delimiter);
        var tLen = tags.length;
        tags.forEach(function (token, i) {

            labelTextNode.append("tspan").attr("class", "label-token label-token-" + i).text(token);

            if (i < tLen - 1) {
                labelTextNode.append("tspan").attr("class", "label-token-delimiter label-token-delimiter-" + i).text(delimiter);
            }
        });

        if (guide.dock === "right") {
            var box = axisNode.selectAll("path.domain").node().getBBox();
            labelTextNode.attr("x", isHorizontal ? box.width : 0);
        } else if (guide.dock === "left") {
            var box = axisNode.selectAll("path.domain").node().getBBox();
            labelTextNode.attr("x", isHorizontal ? 0 : -box.height);
        }
    };

    var d3_decorator_wrap_tick_label = function (nodeScale, guide, isHorizontal) {

        var angle = guide.rotate;

        var ticks = nodeScale.selectAll(".tick text");
        ticks.attr("transform", utilsDraw.rotate(angle)).style("text-anchor", guide.textAnchor);

        if (angle === 90) {
            var dy = parseFloat(ticks.attr("dy")) / 2;
            ticks.attr("x", 9).attr("y", 0).attr("dy", "" + dy + "em");
        }

        if (guide.tickFormatWordWrap) {
            ticks.call(wrapText, guide.tickFormatWordWrapLimit, guide.tickFormatWordWrapLines, guide.$maxTickTextH, !isHorizontal);
        } else {
            ticks.call(cutText, guide.tickFormatWordWrapLimit);
        }
    };

    exports.d3_decorator_wrap_tick_label = d3_decorator_wrap_tick_label;
    exports.d3_decorator_prettify_axis_label = d3_decorator_prettify_axis_label;
    exports.d3_decorator_fix_axis_bottom_line = d3_decorator_fix_axis_bottom_line;
    exports.d3_decorator_fix_horizontal_axis_ticks_overflow = d3_decorator_fix_horizontal_axis_ticks_overflow;
    exports.d3_decorator_prettify_categorical_axis_ticks = d3_decorator_prettify_categorical_axis_ticks;
    exports.wrapText = wrapText;
    exports.cutText = cutText;
});
define('elements/coords.cartesian',["exports", "d3", "underscore", "../utils/utils-draw", "../const", "../formatter-registry", "../utils/d3-decorators"], function (exports, _d3, _underscore, _utilsUtilsDraw, _const, _formatterRegistry, _utilsD3Decorators) {
    

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var d3 = _interopRequire(_d3);

    var _ = _interopRequire(_underscore);

    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var FormatterRegistry = _formatterRegistry.FormatterRegistry;
    var d3_decorator_wrap_tick_label = _utilsD3Decorators.d3_decorator_wrap_tick_label;
    var d3_decorator_prettify_axis_label = _utilsD3Decorators.d3_decorator_prettify_axis_label;
    var d3_decorator_fix_axis_bottom_line = _utilsD3Decorators.d3_decorator_fix_axis_bottom_line;
    var d3_decorator_fix_horizontal_axis_ticks_overflow = _utilsD3Decorators.d3_decorator_fix_horizontal_axis_ticks_overflow;
    var d3_decorator_prettify_categorical_axis_ticks = _utilsD3Decorators.d3_decorator_prettify_categorical_axis_ticks;

    var Cartesian = exports.Cartesian = (function () {
        function Cartesian(config) {
            _classCallCheck(this, Cartesian);

            _get(Object.getPrototypeOf(Cartesian.prototype), "constructor", this).call(this);

            this.config = config;

            this.config.guide = _.defaults(this.config.guide || {}, {
                showGridLines: "xy",
                padding: { l: 50, r: 0, t: 0, b: 50 }
            });

            this.config.guide.x = this.config.guide.x || {};
            this.config.guide.x = _.defaults(this.config.guide.x, {
                cssClass: "x axis",
                textAnchor: "middle",
                padding: 10,
                hide: false,
                scaleOrient: "bottom",
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

            if (_.isString(this.config.guide.x.label)) {
                this.config.guide.x.label = {
                    text: this.config.guide.x.label
                };
            }

            this.config.guide.x.label = _.defaults(this.config.guide.x.label, {
                text: "X",
                rotate: 0,
                padding: 40,
                textAnchor: "middle"
            });

            this.config.guide.y = this.config.guide.y || {};
            this.config.guide.y = _.defaults(this.config.guide.y, {
                cssClass: "y axis",
                textAnchor: "start",
                padding: 10,
                hide: false,
                scaleOrient: "left",
                rotate: 0,
                density: 20,
                label: {},
                tickFormatWordWrapLimit: 100
            });

            if (_.isString(this.config.guide.y.label)) {
                this.config.guide.y.label = {
                    text: this.config.guide.y.label
                };
            }

            this.config.guide.y.label = _.defaults(this.config.guide.y.label, {
                text: "Y",
                rotate: -90,
                padding: 20,
                textAnchor: "middle"
            });

            var unit = this.config;
            var guide = unit.guide;
            if (guide.autoLayout === "extract-axes") {
                var containerHeight = unit.options.containerHeight;
                guide.x.hide = unit.options.top + unit.options.height < containerHeight;
                guide.y.hide = unit.options.left > 0;
            }
        }

        _createClass(Cartesian, {
            drawLayout: {
                value: function drawLayout(fnCreateScale) {

                    var node = this.config;

                    var options = node.options;
                    var padding = node.guide.padding;

                    var innerWidth = options.width - (padding.l + padding.r);
                    var innerHeight = options.height - (padding.t + padding.b);

                    this.xScale = fnCreateScale("pos", node.x, [0, innerWidth]);
                    this.yScale = fnCreateScale("pos", node.y, [innerHeight, 0]);

                    this.W = innerWidth;
                    this.H = innerHeight;

                    return this;
                }
            },
            drawFrames: {
                value: function drawFrames(frames, continuation) {

                    var node = _.extend({}, this.config);

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

                    options.container.attr("transform", utilsDraw.translate(innerLeft, innerTop));

                    // take into account reposition during resize by orthogonal axis
                    var hashX = node.x.getHash() + innerHeight;
                    var hashY = node.y.getHash() + innerWidth;

                    if (!node.x.guide.hide) {
                        this._fnDrawDimAxis(options.container, node.x, [0, innerHeight + node.guide.x.padding], innerWidth, "" + options.frameId + "x", hashX);
                    }

                    if (!node.y.guide.hide) {
                        this._fnDrawDimAxis(options.container, node.y, [0 - node.guide.y.padding, 0], innerHeight, "" + options.frameId + "y", hashY);
                    }

                    var updateCellLayers = function (cellId, cell, frame) {

                        var mapper;
                        var frameId = frame.hash();
                        if (frame.key) {

                            var coordX = node.x(frame.key[node.x.dim]);
                            var coordY = node.y(frame.key[node.y.dim]);

                            var xDomain = node.x.domain();
                            var yDomain = node.y.domain();

                            var xPart = innerWidth / xDomain.length;
                            var yPart = innerHeight / yDomain.length;

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
                            unit.options.container = d3.select(this);
                            continuation(unit, frame);
                        };

                        var layers = cell.selectAll(".layer_" + cellId).data(frame.units.map(mapper), function (unit) {
                            return unit.options.uid + unit.type;
                        });
                        layers.exit().remove();
                        layers.each(continueDrawUnit);
                        layers.enter().append("g").attr("class", "layer_" + cellId).each(continueDrawUnit);
                    };

                    var cellFrameIterator = function cellFrameIterator(cellFrame) {
                        updateCellLayers(options.frameId, d3.select(this), cellFrame);
                    };

                    var cells = this._fnDrawGrid(options.container, node, innerHeight, innerWidth, options.frameId, hashX + hashY).selectAll(".parent-frame-" + options.frameId).data(frames, function (f) {
                        return f.hash();
                    });
                    cells.exit().remove();
                    cells.each(cellFrameIterator);
                    cells.enter().append("g").attr("class", function (d) {
                        return "" + CSS_PREFIX + "cell cell parent-frame-" + options.frameId + " frame-" + d.hash();
                    }).each(cellFrameIterator);
                }
            },
            _fnDrawDimAxis: {
                value: function _fnDrawDimAxis(container, scale, position, size, frameId, uniqueHash) {

                    if (scale.scaleDim) {

                        var axisScale = d3.svg.axis().scale(scale.scaleObj).orient(scale.guide.scaleOrient);

                        var formatter = FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
                        if (formatter !== null) {
                            axisScale.ticks(Math.round(size / scale.guide.density));
                            axisScale.tickFormat(formatter);
                        }

                        var axis = container.selectAll(".axis_" + frameId).data([uniqueHash], function (x) {
                            return x;
                        });
                        axis.exit().remove();
                        axis.enter().append("g").attr("class", scale.guide.cssClass + " axis_" + frameId).attr("transform", utilsDraw.translate.apply(utilsDraw, _toConsumableArray(position))).call(function (refAxisNode) {
                            if (!refAxisNode.empty()) {

                                axisScale.call(this, refAxisNode);

                                var isHorizontal = utilsDraw.getOrientation(scale.guide.scaleOrient) === "h";
                                var prettifyTick = scale.scaleType === "ordinal" || scale.scaleType === "period";
                                if (prettifyTick) {
                                    d3_decorator_prettify_categorical_axis_ticks(refAxisNode, size, isHorizontal);
                                }

                                d3_decorator_wrap_tick_label(refAxisNode, scale.guide, isHorizontal);
                                d3_decorator_prettify_axis_label(refAxisNode, scale.guide.label, isHorizontal);

                                if (isHorizontal && scale.scaleType === "time") {
                                    d3_decorator_fix_horizontal_axis_ticks_overflow(refAxisNode);
                                }
                            }
                        });
                    }
                }
            },
            _fnDrawGrid: {
                value: function _fnDrawGrid(container, node, height, width, frameId, uniqueHash) {

                    var grid = container.selectAll(".grid_" + frameId).data([uniqueHash], function (x) {
                        return x;
                    });
                    grid.exit().remove();
                    grid.enter().append("g").attr("class", "grid grid_" + frameId).attr("transform", utilsDraw.translate(0, 0)).call(function (selection) {

                        if (selection.empty()) {
                            return;
                        }

                        var grid = selection;

                        var linesOptions = (node.guide.showGridLines || "").toLowerCase();
                        if (linesOptions.length > 0) {

                            var gridLines = grid.append("g").attr("class", "grid-lines");

                            if (linesOptions.indexOf("x") > -1 && node.x.scaleDim) {
                                var xScale = node.x;
                                var xGridAxis = d3.svg.axis().scale(xScale.scaleObj).orient(xScale.guide.scaleOrient).tickSize(height);

                                var formatter = FormatterRegistry.get(xScale.guide.tickFormat);
                                if (formatter !== null) {
                                    xGridAxis.ticks(Math.round(width / xScale.guide.density));
                                    xGridAxis.tickFormat(formatter);
                                }

                                var xGridLines = gridLines.append("g").attr("class", "grid-lines-x").call(xGridAxis);

                                var isHorizontal = utilsDraw.getOrientation(xScale.guide.scaleOrient) === "h";
                                var prettifyTick = xScale.scaleType === "ordinal" || xScale.scaleType === "period";
                                if (prettifyTick) {
                                    d3_decorator_prettify_categorical_axis_ticks(xGridLines, width, isHorizontal);
                                }

                                var firstXGridLine = xGridLines.select("g.tick");
                                if (firstXGridLine.node() && firstXGridLine.attr("transform") !== "translate(0,0)") {
                                    var zeroNode = firstXGridLine.node().cloneNode(true);
                                    gridLines.node().appendChild(zeroNode);
                                    d3.select(zeroNode).attr("class", "border").attr("transform", utilsDraw.translate(0, 0)).select("line").attr("x1", 0).attr("x2", 0);
                                }
                            }

                            if (linesOptions.indexOf("y") > -1 && node.y.scaleDim) {
                                var yScale = node.y;
                                var yGridAxis = d3.svg.axis().scale(yScale.scaleObj).orient(yScale.guide.scaleOrient).tickSize(-width);

                                var formatter = FormatterRegistry.get(yScale.guide.tickFormat);
                                if (formatter !== null) {
                                    yGridAxis.ticks(Math.round(height / yScale.guide.density));
                                    yGridAxis.tickFormat(formatter);
                                }

                                var yGridLines = gridLines.append("g").attr("class", "grid-lines-y").call(yGridAxis);

                                var isHorizontal = utilsDraw.getOrientation(yScale.guide.scaleOrient) === "h";
                                var prettifyTick = yScale.scaleType === "ordinal" || yScale.scaleType === "period";
                                if (prettifyTick) {
                                    d3_decorator_prettify_categorical_axis_ticks(yGridLines, height, isHorizontal);
                                }

                                var fixLineScales = ["time", "ordinal", "period"];
                                var fixBottomLine = _.contains(fixLineScales, yScale.scaleType);
                                if (fixBottomLine) {
                                    d3_decorator_fix_axis_bottom_line(yGridLines, height, yScale.scaleType === "time");
                                }
                            }

                            gridLines.selectAll("text").remove();
                        }
                    });

                    return grid;
                }
            }
        });

        return Cartesian;
    })();
});
define('elements/element.pie',["exports", "../const", "../utils/css-class-map"], function (exports, _const, _utilsCssClassMap) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var CSS_PREFIX = _const.CSS_PREFIX;
    var getLineClassesByWidth = _utilsCssClassMap.getLineClassesByWidth;
    var getLineClassesByCount = _utilsCssClassMap.getLineClassesByCount;

    var Pie = exports.Pie = (function () {
        function Pie(config) {
            _classCallCheck(this, Pie);

            this.config = config;
            this.config.guide = this.config.guide || {};
            this.config.guide = _.defaults(this.config.guide, {
                cssClass: ""
            });
        }

        _createClass(Pie, {
            drawLayout: {
                value: function drawLayout(fnCreateScale) {

                    var config = this.config;

                    this.proportionScale = fnCreateScale("value", config.proportion);
                    this.labelScale = fnCreateScale("value", config.label);
                    this.colorScale = fnCreateScale("color", config.color, {});

                    return this;
                }
            },
            drawFrames: {
                value: function drawFrames(frames) {

                    var config = this.config;

                    var options = config.options;

                    var proportion = this.proportionScale;
                    var label = this.labelScale;
                    var color = this.colorScale;

                    var w = options.width;
                    var h = options.height;
                    var r = h / 2;

                    var data = frames[0].take();

                    var vis = options.container.append("svg:svg").data([data]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");

                    var pie = d3.layout.pie().value(function (d) {
                        return d[proportion.dim];
                    });

                    // declare an arc generator function
                    var arc = d3.svg.arc().outerRadius(r);

                    // select paths, use arc generator to draw
                    var arcs = vis.selectAll(".slice").data(pie).enter().append("g").attr("class", "slice");

                    arcs.append("path").attr("class", function (d) {
                        var dm = d.data || {};
                        return color(dm[color.dim]);
                    }).attr("d", function (d) {
                        return arc(d);
                    });

                    // add the text
                    arcs.append("text").attr("transform", function (d) {
                        d.innerRadius = 0;
                        d.outerRadius = r;
                        return "translate(" + arc.centroid(d) + ")";
                    }).attr("text-anchor", "middle").text(function (d) {
                        var dm = d.data || {};
                        return label(dm[label.dim]);
                    });
                }
            }
        });

        return Pie;
    })();
});
define('tau.charts',["exports", "./utils/utils-dom", "./utils/utils", "./charts/tau.gpl", "./charts/tau.plot", "./charts/tau.chart", "./unit-domain-period-generator", "./formatter-registry", "./units-registry", "./elements/coords.cartesian", "./elements/element.point", "./elements/element.line", "./elements/element.pie", "./elements/element.interval"], function (exports, _utilsUtilsDom, _utilsUtils, _chartsTauGpl, _chartsTauPlot, _chartsTauChart, _unitDomainPeriodGenerator, _formatterRegistry, _unitsRegistry, _elementsCoordsCartesian, _elementsElementPoint, _elementsElementLine, _elementsElementPie, _elementsElementInterval) {
    

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var utilsDom = _utilsUtilsDom.utilsDom;
    var utils = _utilsUtils.utils;
    var GPL = _chartsTauGpl.GPL;
    var Plot = _chartsTauPlot.Plot;
    var Chart = _chartsTauChart.Chart;
    var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;
    var FormatterRegistry = _formatterRegistry.FormatterRegistry;
    var unitsRegistry = _unitsRegistry.unitsRegistry;
    var Cartesian = _elementsCoordsCartesian.Cartesian;
    var Point = _elementsElementPoint.Point;
    var Line = _elementsElementLine.Line;
    var Pie = _elementsElementPie.Pie;
    var Interval = _elementsElementInterval.Interval;

    var colorBrewers = {};
    var plugins = {};

    var __api__ = {
        UnitDomainPeriodGenerator: UnitDomainPeriodGenerator
    };
    var api = {
        unitsRegistry: unitsRegistry,
        tickFormat: FormatterRegistry,
        isChartElement: utils.isChartElement,
        isLineElement: utils.isLineElement,
        d3: d3,
        _: _,
        tickPeriod: UnitDomainPeriodGenerator,
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
                    throw new Error("Plugin is already registered.");
                }
            },
            get: function get(name) {
                return plugins[name] || function (x) {
                    throw new Error("" + x + " plugin is not defined");
                };
            }
        },
        globalSettings: {

            log: function (msg, type) {
                type = type || "INFO";
                if (!Array.isArray(msg)) {
                    msg = [msg];
                }
                console[type.toLowerCase()].apply(console, msg);
            },

            excludeNull: true,
            specEngine: [{
                name: "COMPACT",
                width: 600
            }, {
                name: "AUTO",
                width: Number.MAX_VALUE
            }],

            fitSize: true,

            layoutEngine: "EXTRACT",
            getAxisTickLabelSize: _.memoize(utilsDom.getAxisTickLabelSize, function (text) {
                return (text || "").length;
            }),

            getScrollBarWidth: _.memoize(utilsDom.getScrollbarWidth),

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
            "xDensityPadding:measure": 8,
            "yDensityPadding:measure": 8,

            defaultFormats: {
                measure: "x-num-auto",
                "measure:time": "x-time-auto"
            }
        }
    };

    Plot.globalSettings = api.globalSettings;

    api.unitsRegistry.reg("COORDS.RECT", Cartesian).reg("ELEMENT.POINT", Point).reg("ELEMENT.LINE", Line).reg("ELEMENT.INTERVAL", Interval).reg("RECT", Cartesian).reg("POINT", Point).reg("INTERVAL", Interval).reg("LINE", Line).reg("PIE", Pie);

    exports.GPL = GPL;
    exports.Plot = Plot;
    exports.Chart = Chart;
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