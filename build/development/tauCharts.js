/*! taucharts - v0.4.6 - 2015-06-19
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
define('elements/element.point',['exports', '../const'], function (exports, _const) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Point = (function () {
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

        _createClass(Point, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

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

                return this;
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var options = this.config.options;

                var prefix = '' + _const.CSS_PREFIX + 'dot dot i-role-element i-role-datum';

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
                            return '' + prefix + ' ' + cScale(d[cScale.dim]);
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
                            return '' + prefix + ' ' + cScale(d[cScale.dim]);
                        }
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
                        points.enter().append('circle').call(enter);
                    });
                };

                var mapper = function mapper(f) {
                    return { tags: f.key || {}, hash: f.hash(), data: f.take() };
                };

                var frameGroups = options.container.selectAll('.frame-id-' + options.uid).data(frames.map(mapper), function (f) {
                    return f.hash;
                });
                frameGroups.exit().remove();
                frameGroups.call(updateGroups);
                frameGroups.enter().append('g').call(updateGroups);

                return [];
            }
        }]);

        return Point;
    })();

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
define('elements/element.line',['exports', '../const', '../utils/css-class-map'], function (exports, _const, _utilsCssClassMap) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Line = (function () {
        function Line(config) {
            _classCallCheck(this, Line);

            this.config = config;
            this.config.guide = this.config.guide || {};
            this.config.guide = _.defaults(this.config.guide, {
                cssClass: 'i-role-datum',
                widthCssClass: '',
                anchors: false
            });
        }

        _createClass(Line, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

                var config = this.config;

                this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
                this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
                this.color = fnCreateScale('color', config.color, {});
                this.size = fnCreateScale('size', config.size, {});

                return this;
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {

                var guide = this.config.guide;
                var options = this.config.options;

                var xScale = this.xScale;
                var yScale = this.yScale;
                var colorScale = this.color;
                var sizeScale = this.size;

                var widthCss = guide.widthCssClass || (0, _utilsCssClassMap.getLineClassesByWidth)(options.width);
                var countCss = (0, _utilsCssClassMap.getLineClassesByCount)(frames.length);

                var d3Line = d3.svg.line().x(function (d) {
                    return xScale(d[xScale.dim]);
                }).y(function (d) {
                    return yScale(d[yScale.dim]);
                });

                if (guide.interpolate) {
                    d3Line.interpolate(guide.interpolate);
                }

                var linePref = '' + _const.CSS_PREFIX + 'line i-role-element line ' + widthCss + ' ' + countCss + ' ' + guide.cssClass;
                var updateLines = function updateLines() {
                    var paths = this.selectAll('path').data(function (_ref) {
                        var frame = _ref.data;
                        return [frame.data];
                    });
                    paths.exit().remove();
                    paths.attr('d', d3Line);
                    paths.enter().append('path').attr('d', d3Line);
                };

                var pointPref = '' + _const.CSS_PREFIX + 'dot-line dot-line i-role-element ' + _const.CSS_PREFIX + 'dot ';
                var updatePoints = function updatePoints() {

                    var points = this.selectAll('circle').data(function (frame) {
                        return frame.data.data.map(function (item) {
                            return { data: item, uid: options.uid };
                        });
                    });
                    var attr = {
                        r: function r(_ref2) {
                            var d = _ref2.data;
                            return sizeScale(d[sizeScale.dim]);
                        },
                        cx: function cx(_ref3) {
                            var d = _ref3.data;
                            return xScale(d[xScale.dim]);
                        },
                        cy: function cy(_ref4) {
                            var d = _ref4.data;
                            return yScale(d[yScale.dim]);
                        },
                        'class': function _class(_ref5) {
                            var d = _ref5.data;
                            return '' + pointPref + ' ' + colorScale(d[colorScale.dim]);
                        }
                    };
                    points.exit().remove();
                    points.attr(attr);
                    points.enter().append('circle').attr(attr);
                };

                var updateGroups = function updateGroups(x, drawPath, drawPoints) {

                    return function () {

                        this.attr('class', function (_ref6) {
                            var f = _ref6.data;
                            return '' + linePref + ' ' + colorScale(f.tags[colorScale.dim]) + ' ' + x + ' frame-' + f.hash;
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

                var mapper = function mapper(f) {
                    return { data: { tags: f.key || {}, hash: f.hash(), data: f.take() }, uid: options.uid };
                };

                var drawFrame = function drawFrame(tag, id, filter) {

                    var isDrawLine = tag === 'line';
                    var isDrawAnchor = !isDrawLine || guide.anchors;

                    var frameGroups = options.container.selectAll('.frame-' + id).data(frames.map(mapper).filter(filter), function (_ref7) {
                        var f = _ref7.data;
                        return f.hash;
                    });
                    frameGroups.exit().remove();
                    frameGroups.call(updateGroups('frame-' + id, isDrawLine, isDrawAnchor));
                    frameGroups.enter().append('g').call(updateGroups('frame-' + id, isDrawLine, isDrawAnchor));
                };

                drawFrame('line', 'line-' + options.uid, function (_ref8) {
                    var f = _ref8.data;
                    return f.data.length > 1;
                });
                drawFrame('anch', 'anch-' + options.uid, function (_ref9) {
                    var f = _ref9.data;
                    return f.data.length < 2;
                });
            }
        }]);

        return Line;
    })();

    exports.Line = Line;
});
define('elements/element.interval',['exports', '../const'], function (exports, _const) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Interval = (function () {
        function Interval(config) {
            _classCallCheck(this, Interval);

            this.config = config;
            this.config.guide = _.defaults(this.config.guide || {}, { prettify: true });
        }

        _createClass(Interval, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

                var config = this.config;
                this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
                this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
                this.color = fnCreateScale('color', config.color, {});
                this.size = fnCreateScale('size', config.size, {});

                return this;
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {
                var _this = this;

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
                };
                var elements = options.container.selectAll('.i-role-bar-group').data(frames.map(function (fr) {
                    return { key: fr.key, values: fr.data, uid: _this.config.options.uid };
                }));
                elements.exit().remove();
                elements.call(updateBarContainer);
                elements.enter().append('g').call(updateBarContainer);
            }
        }, {
            key: '_buildVerticalDrawMethod',
            value: function _buildVerticalDrawMethod(_ref) {
                var colorScale = _ref.colorScale;
                var xScale = _ref.xScale;
                var yScale = _ref.yScale;
                var colorIndexScale = _ref.colorIndexScale;
                var width = _ref.width;
                var height = _ref.height;
                var prettify = _ref.prettify;

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
                    x: function x(_ref2) {
                        var d = _ref2.data;
                        return calculateBarX(d);
                    },
                    y: function y(_ref3) {
                        var d = _ref3.data;

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
                    height: function height(_ref4) {
                        var d = _ref4.data;

                        var h = calculateBarH(d);
                        if (prettify) {
                            // decorate for better visual look & feel
                            var y = d[yScale.dim];
                            return y === 0 ? h : Math.max(minBarH, h);
                        } else {
                            return h;
                        }
                    },
                    width: function width(_ref5) {
                        var d = _ref5.data;
                        return calculateBarW(d);
                    },
                    'class': function _class(_ref6) {
                        var d = _ref6.data;
                        return 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar ' + colorScale(d[colorScale.dim]);
                    }
                };
            }
        }, {
            key: '_buildHorizontalDrawMethod',
            value: function _buildHorizontalDrawMethod(_ref7) {
                var colorScale = _ref7.colorScale;
                var xScale = _ref7.xScale;
                var yScale = _ref7.yScale;
                var colorIndexScale = _ref7.colorIndexScale;
                var width = _ref7.width;
                var height = _ref7.height;
                var prettify = _ref7.prettify;

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
                    y: function y(_ref8) {
                        var d = _ref8.data;
                        return calculateBarX(d);
                    },
                    x: function x(_ref9) {
                        var d = _ref9.data;

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
                    height: function height(_ref10) {
                        var d = _ref10.data;
                        return calculateBarW(d);
                    },
                    width: function width(_ref11) {
                        var d = _ref11.data;

                        var w = calculateBarH(d);

                        if (prettify) {
                            // decorate for better visual look & feel
                            var x = d[xScale.dim];
                            return x === 0 ? w : Math.max(minBarH, w);
                        } else {
                            return w;
                        }
                    },
                    'class': function _class(_ref12) {
                        var d = _ref12.data;
                        return 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar ' + colorScale(d[colorScale.dim]);
                    }
                };
            }
        }, {
            key: '_buildDrawMethod',
            value: function _buildDrawMethod(_ref13) {
                var valsScale = _ref13.valsScale;
                var baseScale = _ref13.baseScale;
                var colorIndexScale = _ref13.colorIndexScale;
                var defaultBaseAbsPosition = _ref13.defaultBaseAbsPosition;

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
        }]);

        return Interval;
    })();

    exports.Interval = Interval;
});
define('error',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var TauChartError = (function (_Error) {
        function TauChartError(message, errorCode) {
            _classCallCheck(this, TauChartError);

            _get(Object.getPrototypeOf(TauChartError.prototype), 'constructor', this).call(this);
            this.name = 'TauChartError';
            this.message = message;
            this.errorCode = errorCode;
        }

        _inherits(TauChartError, _Error);

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
define('elements/element.interval.stacked',['exports', 'underscore', './../const', './../error'], function (exports, _underscore, _const, _error) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _2 = _interopRequireDefault(_underscore);

    var StackedInterval = (function () {
        function StackedInterval(config) {
            _classCallCheck(this, StackedInterval);

            this.config = config;
            this.config.guide = _2['default'].defaults(this.config.guide || {}, { prettify: true });
        }

        _createClass(StackedInterval, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

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

                return this;
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {
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
                        var stack = totals[y] = (totals[y] || 0) + x;
                        var size = d[sizeScale.dim];
                        var color = d[colorScale.dim];
                        return {
                            x: stack,
                            y: y,
                            h: x,
                            w: size,
                            c: color
                        };
                    };
                } else {
                    viewMapper = function (totals, d) {
                        var x = d[xScale.dim];
                        var y = d[yScale.dim];
                        var stack = totals[x] = (totals[x] || 0) + y;
                        var size = d[sizeScale.dim];
                        var color = d[colorScale.dim];
                        return {
                            x: x,
                            y: stack,
                            h: y,
                            w: size,
                            c: color
                        };
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
                    return this.attr(d3Attrs)
                    // TODO: move to CSS styles
                    .style('stroke-width', 1).style('stroke', '#fff').style('stroke-opacity', '0.5');
                };

                var uid = options.uid;
                var totals = {};
                var updateGroups = function updateGroups() {
                    this.attr('class', function (f) {
                        return 'frame-id-' + uid + ' frame-' + f.hash + ' i-role-bar-group';
                    }).call(function () {
                        var bars = this.selectAll('.bar').data(function (frame) {
                            // var totals = {}; // if 1-only frame support is required
                            return frame.data.map(function (d) {
                                return { uid: uid, data: d, view: viewMapper(totals, d) };
                            });
                        });
                        bars.exit().remove();
                        bars.call(updateBar);
                        bars.enter().append('rect').call(updateBar);
                    });
                };

                var mapper = function mapper(f) {
                    return { tags: f.key || {}, hash: f.hash(), data: f.take() };
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
            value: function _buildDrawModel(isHorizontal, _ref) {
                var xScale = _ref.xScale;
                var yScale = _ref.yScale;
                var sizeScale = _ref.sizeScale;
                var colorScale = _ref.colorScale;
                var prettify = _ref.prettify;

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
                    x: function x(_ref2) {
                        var d = _ref2.view;
                        return calculateX(d);
                    },
                    y: function y(_ref3) {
                        var d = _ref3.view;
                        return calculateY(d);
                    },
                    height: function height(_ref4) {
                        var d = _ref4.view;
                        return calculateH(d);
                    },
                    width: function width(_ref5) {
                        var d = _ref5.view;
                        return calculateW(d);
                    },
                    'class': function _class(_ref6) {
                        var d = _ref6.view;
                        return 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar ' + colorScale(d.c);
                    }
                };
            }
        }], [{
            key: 'embedUnitFrameToSpec',
            value: function embedUnitFrameToSpec(cfg, spec) {

                var isHorizontal = cfg.flip;

                var stackedScaleName = isHorizontal ? cfg.x : cfg.y;
                var baseScaleName = isHorizontal ? cfg.y : cfg.x;
                var stackScale = spec.scales[stackedScaleName];
                var baseScale = spec.scales[baseScaleName];
                var baseDim = baseScale.dim;

                var prop = stackScale.dim;

                var sums = cfg.frames.reduce(function (s0, f) {
                    return f.take().reduce(function (s, d) {
                        var stackedVal = d[prop];

                        if (typeof stackedVal !== 'number' || stackedVal < 0) {
                            throw new _error.TauChartError('Stacked field [' + prop + '] should be a non-negative number', _error.errorCodes.INVALID_DATA_TO_STACKED_BAR_CHART);
                        }

                        var baseVal = d[baseDim];
                        s[baseVal] = s[baseVal] || 0;
                        s[baseVal] += stackedVal;
                        return s;
                    }, s0);
                }, {});

                var maxSum = Math.max.apply(Math, _toConsumableArray(_2['default'].values(sums)));

                if (!stackScale.hasOwnProperty('max') || stackScale.max < maxSum) {
                    stackScale.max = maxSum;
                }
            }
        }]);

        return StackedInterval;
    })();

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
        var level = arguments[3] === undefined ? 0 : arguments[3];

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

                var xHash = function xHash(keys) {
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
                };

                var xTotal = function xTotal(keys) {
                    return _.values(xHash(keys)).reduce(function (sum, v) {
                        return sum + v;
                    }, 0);
                };

                var xPart = function xPart(keys, k) {
                    return xHash(keys)[k];
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

        _createClass(Emitter, [{
            key: 'addHandler',

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
        }, {
            key: 'removeHandler',

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
        }, {
            key: 'destroy',

            /**
             * @destructor
             */
            value: function destroy() {
                // fire object destroy event handlers
                this.emit_destroy();
                // drop event handlers if any
                this.handler = null;
            }
        }]);

        return Emitter;
    })();

    //
    // export names
    //
    exports.Emitter = Emitter;
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
define('scales-factory',['exports', './scales-registry'], function (exports, _scalesRegistry) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var ScalesFactory = (function () {
        function ScalesFactory(sources) {
            _classCallCheck(this, ScalesFactory);

            this.sources = sources;
        }

        _createClass(ScalesFactory, [{
            key: 'create',
            value: function create(scaleConfig, frame, dynamicConfig) {

                var ScaleClass = _scalesRegistry.scalesRegistry.get(scaleConfig.type);

                var dim = scaleConfig.dim;
                var src = scaleConfig.source;

                var type = (this.sources[src].dims[dim] || {}).type;
                var data = this.sources[src].data;
                var xSrc = {
                    full: function full() {
                        return data;
                    },
                    part: function part() {
                        return frame ? frame.take() : data;
                    },
                    partByDims: function partByDims(dims) {
                        return frame ? frame.partByDims(dims) : data;
                    }
                };

                scaleConfig.dimType = type;

                return new ScaleClass(xSrc, scaleConfig).create(dynamicConfig);
            }
        }]);

        return ScalesFactory;
    })();

    exports.ScalesFactory = ScalesFactory;
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

    function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

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
define('charts/tau.gpl',['exports', '../event', '../utils/utils', '../utils/utils-dom', '../units-registry', '../utils/layuot-template', '../scales-factory', '../const', '../algebra'], function (exports, _event, _utilsUtils, _utilsUtilsDom, _unitsRegistry, _utilsLayuotTemplate, _scalesFactory, _const, _algebra) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var cast = function cast(v) {
        return _.isDate(v) ? v.getTime() : v;
    };

    var GPL = (function (_Emitter) {
        function GPL(config) {
            _classCallCheck(this, GPL);

            _get(Object.getPrototypeOf(GPL.prototype), 'constructor', this).call(this);

            this.config = config;

            this.config.settings = this.config.settings || {};

            this.unitSet = config.unitsRegistry || _unitsRegistry.unitsRegistry;

            this.sources = config.sources;

            this.scalesCreator = new _scalesFactory.ScalesFactory(config.sources);

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

        _inherits(GPL, _Emitter);

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
                    'class': '' + _const.CSS_PREFIX + 'svg',
                    width: size.width,
                    height: size.height
                };

                xSvg.attr(attr);

                xSvg.enter().append('svg').attr(attr).append('g').attr('class', '' + _const.CSS_PREFIX + 'cell cell frame-root');

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

                var parentPipe = arguments[1] === undefined ? [] : arguments[1];

                var self = this;

                if (root.expression.operator !== false) {

                    var expr = this._parseExpression(root.expression, parentPipe);

                    root.transformation = root.transformation || [];

                    root.frames = expr.exec().map(function (tuple) {

                        var flow = expr.inherit ? parentPipe : [];
                        var pipe = flow.concat([{ type: 'where', args: tuple }]).concat(root.transformation);

                        var item = {
                            source: expr.source,
                            pipe: pipe
                        };

                        if (tuple) {
                            item.key = tuple;
                        }

                        item.units = root.units ? root.units.map(function (unit) {
                            var clone = _utilsUtils.utils.clone(unit);
                            // pass guide by reference
                            clone.guide = unit.guide;
                            return clone;
                        }) : [];

                        return self._datify(item);
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
                var rootUnit = arguments[2] === undefined ? null : arguments[2];

                var self = this;

                var UnitClass = self.unitSet.get(unitConfig.type);
                var unitNode = new UnitClass(unitConfig);
                unitNode.parentUnit = rootUnit;
                unitNode.drawLayout(function (type, alias, settings) {

                    var name = alias ? alias : '' + type + ':default';

                    return self.scalesCreator.create(self.scales[name], rootFrame, settings);
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
                var data = this.sources[frame.source].data;
                var trans = this.transformations;
                var pipeReducer = function pipeReducer(data, pipeCfg) {
                    return trans[pipeCfg.type](data, pipeCfg.args);
                };
                frame.hash = function () {
                    return _utilsUtils.utils.generateHash([frame.pipe, frame.key, frame.source].map(JSON.stringify).join(''));
                };
                frame.take = function () {
                    return frame.pipe.reduce(pipeReducer, data);
                };
                frame.partByDims = function (dims) {
                    return frame.pipe.map(function (f) {
                        var r = {};
                        if (f.type === 'where' && f.args) {
                            r.type = f.type;
                            r.args = dims.reduce(function (memo, d) {
                                if (f.args.hasOwnProperty(d)) {
                                    memo[d] = f.args[d];
                                }
                                return memo;
                            }, {});
                        } else {
                            r = f;
                        }

                        return r;
                    }).reduce(pipeReducer, data);
                };
                frame.data = frame.take();
                return frame;
            }
        }, {
            key: '_parseExpression',
            value: function _parseExpression(expr, parentPipe) {
                var _this3 = this;

                var funcName = expr.operator || 'none';
                var srcAlias = expr.source;
                var bInherit = expr.inherit !== false; // true by default
                var funcArgs = expr.params;

                var src = this.sources[srcAlias];
                var dataFn = bInherit ? function () {
                    return parentPipe.reduce(function (data, cfg) {
                        return _this3.transformations[cfg.type](data, cfg.args);
                    }, src.data);
                } : function () {
                    return src.data;
                };

                var func = _algebra.FramesAlgebra[funcName];

                if (!func) {
                    throw new Error('' + funcName + ' operator is not supported');
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
    var body = doc.body;
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
            body.appendChild(this.element);
        }
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        if (this.spacing == null) {
            this.spacing = this.options.spacing != null ? this.options.spacing : parsePx(style(this.element, 'top'));
        }
        if (this.hidden) {
            body.removeChild(this.element);
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
            this._p = arguments;
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
        return this[this.hidden ? 'show' : 'hide'](x, y);
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
define('plugins',['exports', 'd3', './utils/utils'], function (exports, _d3, _utilsUtils) {
    /* jshint ignore:start */
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _d32 = _interopRequireDefault(_d3);

    var elementEvents = ['click', 'mouseover', 'mouseout', 'mousemove'];

    var Plugins = (function () {
        function Plugins(plugins, chart) {
            var _this = this;

            _classCallCheck(this, Plugins);

            this.chart = chart;
            this._unitMap = {};
            this._plugins = plugins.map(this.initPlugin, this);
            chart.on('render', function (el, svg) {
                _d32['default'].select(svg).selectAll('.i-role-datum').call(this._propagateDatumEvents(chart));
            }, this);
            chart.on('unitdraw', function (chart, element) {
                _this._unitMap[element.config.options.uid] = element;
            }, this);
        }

        _createClass(Plugins, [{
            key: 'initPlugin',
            value: function initPlugin(plugin) {
                var _this2 = this;

                if (plugin.init) {
                    plugin.init(this.chart);
                }
                // jscs:disable disallowEmptyBlocks
                var empty = function empty() {};
                // jscs:enable disallowEmptyBlocks
                this.chart.on('destroy', plugin.destroy && plugin.destroy.bind(plugin) || empty);
                Object.keys(plugin).forEach(function (name) {
                    if (name.indexOf('on') === 0) {
                        var event = name.substr(2);
                        _this2.chart.on(event.toLowerCase(), plugin[name].bind(plugin));
                    }
                });
            }
        }, {
            key: '_getUnitByHash',
            value: function _getUnitByHash(id) {
                return this._unitMap[id];
            }
        }, {
            key: '_propagateDatumEvents',
            value: function _propagateDatumEvents(chart) {
                var self = this;
                return function () {
                    elementEvents.forEach(function (name) {
                        this.on(name, function (d) {
                            var cellData = _d32['default'].select(this.parentNode.parentNode).datum();
                            var unit = self._getUnitByHash(d.uid);
                            var data = d.data;
                            chart.fire('element' + name, {
                                elementData: data,
                                element: this,
                                cellData: cellData,
                                unit: unit
                            });
                        });
                    }, this);
                };
            }
        }]);

        return Plugins;
    })();

    exports.Plugins = Plugins;
});

/* jshint ignore:end */;
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
                    r = '' + dimName + '.' + guide.tickLabel;
                } else if (dims[dimName].value) {
                    r = '' + dimName + '.' + dims[dimName].value;
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

                var k = '' + scaleType + '_' + dimName;

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
define('spec-transform-auto-layout',['exports', 'underscore', './utils/utils', './utils/utils-draw', './formatter-registry', './utils/utils-dom', './scales-factory'], function (exports, _underscore, _utilsUtils, _utilsUtilsDraw, _formatterRegistry, _utilsUtilsDom, _scalesFactory) {
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
                unit.guide.y.cssClass += ' facet-axis compact';

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
            this.scalesCreator = new _scalesFactory.ScalesFactory(spec.sources);
            this.isApplicable = _utilsUtils.utils.isSpecRectCoordsOnly(spec.unit);
        }

        _createClass(SpecTransformAutoLayout, [{
            key: 'transform',
            value: function transform() {
                var _this = this;

                var spec = this.spec;

                if (!this.isApplicable) {
                    return spec;
                }

                var size = spec.settings.size;

                var rule = _2['default'].find(spec.settings.specEngine, function (rule) {
                    return size.width <= rule.width;
                });

                var auto = SpecEngineFactory.get(rule.name, spec.settings, spec, function (type, alias) {

                    var name = alias ? alias : '' + type + ':default';

                    return _this.scalesCreator.create(spec.scales[name], null, [0, 100]);
                });

                return auto;
            }
        }]);

        return SpecTransformAutoLayout;
    })();

    exports.SpecTransformAutoLayout = SpecTransformAutoLayout;
});
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
            value: function transform() {

                var specRef = this.spec;

                if (!this.isApplicable) {
                    return specRef;
                }

                var fitModel = specRef.settings.fitModel;

                if (!fitModel) {
                    return specRef;
                }

                var scales = specRef.scales;

                var scalesCreator = new _scalesFactory.ScalesFactory(specRef.sources);

                var groupFramesBy = function groupFramesBy(frames, dim) {
                    return frames.reduce(function (memo, f) {
                        var fKey = f.key || {};
                        var fVal = fKey[dim];
                        memo[fVal] = memo[fVal] || [];
                        memo[fVal].push(f);
                        return memo;
                    }, {});
                };

                var calcScaleSize = function calcScaleSize(xScale, maxTickText) {

                    var r = 0;

                    if (['ordinal', 'period'].indexOf(xScale.scaleType) >= 0) {
                        var domain = xScale.domain();
                        r = maxTickText * domain.length;
                    } else {
                        r = maxTickText * 4;
                    }

                    return r;
                };

                var calcSizeRecursively = function calcSizeRecursively(prop, root, takeStepSizeStrategy) {
                    var frame = arguments[3] === undefined ? null : arguments[3];

                    var xCfg = prop === 'x' ? scales[root.x] : scales[root.y];
                    var yCfg = prop === 'x' ? scales[root.y] : scales[root.x];
                    var guide = root.guide;
                    var xSize = prop === 'x' ? takeStepSizeStrategy(guide.x) : takeStepSizeStrategy(guide.y);

                    var resScaleSize = prop === 'x' ? guide.padding.l + guide.padding.r : guide.padding.b + guide.padding.t;

                    if (root.units[0].type !== 'COORDS.RECT') {

                        var xScale = scalesCreator.create(xCfg, frame, [0, 100]);
                        return resScaleSize + calcScaleSize(xScale, xSize);
                    } else {

                        var rows = groupFramesBy(root.frames, yCfg.dim);
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
                    var level = arguments[3] === undefined ? 0 : arguments[3];

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
define('charts/tau.plot',['exports', '../api/balloon', '../event', '../plugins', '../utils/utils', '../utils/utils-dom', '../const', '../units-registry', '../data-processor', '../utils/layuot-template', '../spec-converter', '../spec-transform-auto-layout', '../spec-transform-calc-size', '../spec-transform-apply-ratio', '../spec-transform-extract-axes', './tau.gpl'], function (exports, _apiBalloon, _event, _plugins, _utilsUtils, _utilsUtilsDom, _const, _unitsRegistry, _dataProcessor, _utilsLayuotTemplate, _specConverter, _specTransformAutoLayout, _specTransformCalcSize, _specTransformApplyRatio, _specTransformExtractAxes, _tauGpl) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var Plot = (function (_Emitter) {
        function Plot(config) {
            _classCallCheck(this, Plot);

            _get(Object.getPrototypeOf(Plot.prototype), 'constructor', this).call(this);
            this._nodes = [];
            this._liveSpec = null;
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

            this.config.plugins = this.config.plugins || [];

            this.configGPL.settings = Plot.setupSettings(this.configGPL.settings);

            this.transformers = [_specTransformApplyRatio.SpecTransformApplyRatio, _specTransformAutoLayout.SpecTransformAutoLayout];

            this.onUnitsStructureExpandedTransformers = [_specTransformCalcSize.SpecTransformCalcSize, _specTransformExtractAxes.SpecTransformExtractAxes];

            this._originData = _.clone(this.configGPL.sources);

            this._plugins = new _plugins.Plugins(this.config.plugins, this);
        }

        _inherits(Plot, _Emitter);

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
        }, {
            key: 'getConfig',

            // fixme after all migrate
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

                var gpl = _utilsUtils.utils.clone(_.omit(this.configGPL, 'plugins'));
                gpl.sources = this.getData({ isNew: true });
                gpl.settings = this.configGPL.settings;

                if (this.isEmptySources(gpl.sources)) {
                    content.innerHTML = this._emptyContainer;
                    return;
                }

                gpl = this.transformers.reduce(function (memo, TransformClass) {
                    return new TransformClass(memo).transform(_this);
                }, gpl);

                this._nodes = [];
                gpl.onUnitDraw = function (unitNode) {
                    _this._nodes.push(unitNode);
                    _this.fire('unitdraw', unitNode);
                };

                gpl.onUnitsStructureExpanded = function (specRef) {
                    _this.onUnitsStructureExpandedTransformers.forEach(function (TClass) {
                        return new TClass(specRef).transform();
                    });
                    _this.fire(['units', 'structure', 'expanded'].join(''), specRef);
                };

                this._liveSpec = gpl;

                this.fire('specready', gpl);

                new _tauGpl.GPL(gpl).renderTo(content, gpl.settings.size);

                var svgXElement = d3.select(content).select('svg');

                this._svg = svgXElement.node();
                this._layout.rightSidebar.style.maxHeight = '' + gpl.settings.size.height + 'px';
                this.fire('render', this._svg);
            }
        }, {
            key: 'getData',
            value: function getData() {
                var _this2 = this;

                var param = arguments[0] === undefined ? {} : arguments[0];

                var applyFilterMap = function applyFilterMap(data, filtersSelector) {

                    var filters = _(_this2._filtersStore.filters).chain().values().flatten().reject(function (f) {
                        return _.contains(param.excludeFilter, f.tag) || !filtersSelector(f);
                    }).pluck('predicate').value();

                    return data.filter(function (row) {
                        return filters.reduce(function (prev, f) {
                            return prev && f(row);
                        }, true);
                    });
                };

                if (param.isNew) {
                    var filteredSources = {};
                    filteredSources['?'] = this._originData['?'];
                    return Object.keys(this._originData).filter(function (k) {
                        return k !== '?';
                    }).reduce(function (memo, key) {
                        var item = _this2._originData[key];
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
            key: 'setData',
            value: function setData(data) {
                this.config.data = data;
                this.configGPL.sources['/'].data = data;
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
                this.refresh();
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
                this.refresh();
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
                var sizes = arguments[0] === undefined ? {} : arguments[0];

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
        }, {
            key: 'getSpec',

            // use from plugins to get the most actual chart config
            value: function getSpec() {
                return this._liveSpec;
            }
        }], [{
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
            var rules = arguments[2] === undefined ? [] : arguments[2];

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
define('charts/tau.chart',['exports', './tau.plot', '../chart-alias-registry'], function (exports, _tauPlot, _chartAliasRegistry) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var Chart = (function (_Plot) {
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

        _inherits(Chart, _Plot);

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
            ticks.attr('x', 9).attr('y', 0).attr('dy', '' + dy + 'em');
        }

        if (guide.tickFormatWordWrap) {
            ticks.call(wrapText, guide.tickFormatWordWrapLimit, guide.tickFormatWordWrapLines, guide.$maxTickTextH, !isHorizontal);
        } else {
            ticks.call(cutText, guide.tickFormatWordWrapLimit);
        }
    };

    var d3_decorator_avoid_labels_collisions = function d3_decorator_avoid_labels_collisions(nodeScale) {
        var textOffsetStep = 11;
        var refOffsetStart = -10;
        var layoutModel = [];
        nodeScale.selectAll('.tick').each(function (a, i) {
            var tick = _d32['default'].select(this);
            var text = tick.text();
            var translateX = parseFloat(tick.attr('transform').replace('translate(', '').split(',')[0]);
            var tText = tick.selectAll('text');
            var tSpan = tText.selectAll('tspan');
            var tNode = tSpan.empty() ? tText : tSpan;

            var textWidth = tNode.node().getBBox().width;

            var halfText = textWidth / 2;
            var s = translateX - halfText;
            var e = translateX + halfText;
            layoutModel.push({ s: s, e: e, l: 0, textRef: tNode, tickRef: tick });
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

        iterateByTriples(layoutModel, function (prev, curr, next) {

            var collideL = prev.e > curr.s;
            var collideR = next.s < curr.e;

            if (collideL || collideR) {
                curr.l = resolveCollide(prev.l, collideL);

                var oldY = parseFloat(curr.textRef.attr('y'));

                var newY = oldY + curr.l * textOffsetStep; // -1 | 0 | +1

                curr.textRef.attr('y', newY);
                curr.tickRef.append('line').attr('class', 'label-ref').attr({
                    x1: 0,
                    x2: 0,
                    y1: newY - 1,
                    y2: refOffsetStart
                });
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
define('elements/coords.cartesian',['exports', 'd3', 'underscore', '../utils/utils-draw', '../const', '../formatter-registry', '../utils/d3-decorators'], function (exports, _d3, _underscore, _utilsUtilsDraw, _const, _formatterRegistry, _utilsD3Decorators) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _d32 = _interopRequireDefault(_d3);

    var _2 = _interopRequireDefault(_underscore);

    var Cartesian = (function () {
        function Cartesian(config) {
            _classCallCheck(this, Cartesian);

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
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

                var node = this.config;

                var options = node.options;
                var padding = node.guide.padding;

                var innerWidth = options.width - (padding.l + padding.r);
                var innerHeight = options.height - (padding.t + padding.b);

                this.xScale = fnCreateScale('pos', node.x, [0, innerWidth]);
                this.yScale = fnCreateScale('pos', node.y, [innerHeight, 0]);

                this.W = innerWidth;
                this.H = innerHeight;

                return this;
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
                    this._fnDrawDimAxis(options.container, node.x, [0, innerHeight + node.guide.x.padding], innerWidth, '' + options.frameId + 'x', hashX);
                }

                if (!node.y.guide.hide) {
                    this._fnDrawDimAxis(options.container, node.y, [0 - node.guide.y.padding, 0], innerHeight, '' + options.frameId + 'y', hashY);
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
                    return '' + _const.CSS_PREFIX + 'cell cell parent-frame-' + options.frameId + ' frame-' + d.hash();
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

                        if (prettifyTick && isHorizontal && scale.guide.avoidCollisions) {
                            (0, _utilsD3Decorators.d3_decorator_avoid_labels_collisions)(refAxisNode);
                        }

                        (0, _utilsD3Decorators.d3_decorator_wrap_tick_label)(refAxisNode, scale.guide, isHorizontal);
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
    })();

    exports.Cartesian = Cartesian;
});
define('elements/element',['exports', '../event'], function (exports, _event) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var Element = (function (_Emitter) {
        function Element() {
            _classCallCheck(this, Element);

            if (_Emitter != null) {
                _Emitter.apply(this, arguments);
            }
        }

        _inherits(Element, _Emitter);

        return Element;
    })(_event.Emitter);

    exports.Element = Element;
});

// add base behaviour here;
define('elements/coords.parallel',['exports', 'd3', 'underscore', './element', '../utils/utils-draw', '../utils/utils', '../const'], function (exports, _d3, _underscore, _element, _utilsUtilsDraw, _utilsUtils, _const) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _d32 = _interopRequireDefault(_d3);

    var _2 = _interopRequireDefault(_underscore);

    var Parallel = (function (_Element) {
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

        _inherits(Parallel, _Element);

        _createClass(Parallel, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

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

                return this;
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
                    return '' + _const.CSS_PREFIX + 'cell cell parent-frame-' + options.frameId + ' frame-' + d.hash();
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
                        _d32['default'].select(this).call(d3Axis.scale(columnsScalesMap[d]));
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
                        if (columnsScalesMap[k].descrete) {
                            rng = columnsScalesMap[k].domain().filter(function (val) {
                                var pos = columnsScalesMap[k](val);
                                return ext[0] <= pos && ext[1] >= pos;
                            });
                        } else {
                            rng = [ext[0], ext[1]];
                        }

                        return {
                            dim: columnsScalesMap[k].dim,
                            func: columnsScalesMap[k].descrete ? 'inset' : 'between',
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
                var colsBrushSettings = arguments[0] === undefined ? {} : arguments[0];

                var columnsBrushes = this.columnsBrushes;
                var columnsScalesMap = this.columnsScalesMap;

                Object.keys(colsBrushSettings).filter(function (k) {
                    return columnsBrushes[k] && columnsScalesMap[k] && colsBrushSettings[k];
                }).forEach(function (k) {
                    var brushExt = colsBrushSettings[k];
                    var ext = [];
                    if (columnsScalesMap[k].descrete) {
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

        var max_move = 5,
            max_angle = 0.5,
            acc = 0,
            rej = 0;

        // weights
        var w_len = 0.2,
            // leader line length
        w_inter = 1,
            // leader line intersenpm testction
        w_lab2 = 30,
            // label-label overlap
        w_lab_anc = 30,
            // label-anchor overlap
        w_orient = 3; // orientation bias

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
                y21 = lab[index].y - lab[index].height + 2,
                x22 = lab[index].x + lab[index].width,
                y22 = lab[index].y + 2;
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
                    y11 = lab[i].y - lab[i].height + 2;
                    x12 = lab[i].x + lab[i].width;
                    y12 = lab[i].y + 2;
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
                currT = 1,
                initialT = 1;

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
define('elements/coords.geomap',['exports', 'd3', 'underscore', 'topojson', '../utils/utils-draw', '../utils/d3-labeler', '../const', '../formatter-registry'], function (exports, _d3, _underscore, _topojson, _utilsUtilsDraw, _utilsD3Labeler, _const, _formatterRegistry) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _d32 = _interopRequireDefault(_d3);

    var _2 = _interopRequireDefault(_underscore);

    var _topojson2 = _interopRequireDefault(_topojson);

    _d32['default'].labeler = _utilsD3Labeler.d3Labeler;

    var avgCharSize = 5.5;

    var hierarchy = ['land', 'continents', 'georegions', 'countries', 'regions', 'subunits', 'states', 'counties'];

    var GeoMap = (function () {
        function GeoMap(config) {
            _classCallCheck(this, GeoMap);

            this.config = config;
            this.config.guide = _2['default'].defaults(this.config.guide || {}, {
                defaultFill: 'rgba(128,128,128,0.25)',
                padding: { l: 0, r: 0, t: 0, b: 0 },
                showNames: true
            });
        }

        _createClass(GeoMap, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

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

                return this;
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {
                var _this = this;

                var guide = this.config.guide;

                if (typeof guide.sourcemap === 'string') {

                    _d32['default'].json(guide.sourcemap, function (e, topoJSONData) {

                        if (e) {
                            throw e;
                        }

                        _this._drawMap(frames, topoJSONData);
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
                            id: '' + c + '-' + d.id,
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

                    _d32['default'].labeler().label(labels).anchor(anchors).width(innerW).height(innerH).start(100);

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

                var center;

                if (latScale.dim && lonScale.dim) {
                    var lats = _d32['default'].extent(latScale.domain());
                    var lons = _d32['default'].extent(lonScale.domain());
                    center = [(lons[1] + lons[0]) / 2, (lats[1] + lats[0]) / 2];
                }

                var d3Projection = this._createProjection(topoJSONData, contours[0], center);

                var path = _d32['default'].geo.path().projection(d3Projection);

                var xmap = node.selectAll('.map-container').data(['' + innerW + '' + innerH + '' + contours.join('-')], _2['default'].identity);
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
                            return labelsHash['' + c + '-' + d.id];
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
                            return '' + d.r + 'px';
                        });

                        node.selectAll('.place-label').data(labels).enter().append('text').attr('class', 'place-label').attr('transform', function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        }).text(function (d) {
                            return d.name;
                        });
                    }
                });

                var groupByCode = frames.reduce(function (groups, f) {
                    var data = f.take();
                    return data.reduce(function (memo, rec) {
                        var key = (rec[codeScale.dim] || '').toLowerCase();
                        memo[key] = rec[fillScale.dim];
                        return memo;
                    }, groups);
                }, {});

                xmap.selectAll('.map-contour-' + contourToFill).data(_topojson2['default'].feature(topoJSONData, topoJSONData.objects[contourToFill]).features).call(function () {
                    this.classed('map-contour', true).attr('fill', function (d) {
                        var prop = d.properties;
                        var codes = ['c1', 'c2', 'c3', 'abbr', 'name'].filter(function (c) {
                            return prop.hasOwnProperty(c) && prop[c] && groupByCode.hasOwnProperty(prop[c].toLowerCase());
                        });

                        var value;
                        if (codes.length === 0) {
                            // doesn't match
                            value = guide.defaultFill;
                        } else if (codes.length > 0) {
                            value = fillScale(groupByCode[prop[codes[0]].toLowerCase()]);
                        }

                        return value;
                    });
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
                        opacity: 0.5
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
                    return { tags: f.key || {}, hash: f.hash(), data: f.take() };
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
    })();

    exports.GeoMap = GeoMap;
});
define('elements/element.pie',['exports', '../const', '../utils/css-class-map'], function (exports, _const, _utilsCssClassMap) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Pie = (function () {
        function Pie(config) {
            _classCallCheck(this, Pie);

            this.config = config;
            this.config.guide = this.config.guide || {};
            this.config.guide = _.defaults(this.config.guide, {
                cssClass: ''
            });
        }

        _createClass(Pie, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

                var config = this.config;

                this.proportionScale = fnCreateScale('value', config.proportion);
                this.labelScale = fnCreateScale('value', config.label);
                this.colorScale = fnCreateScale('color', config.color, {});

                return this;
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

                var data = frames[0].take();

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
    })();

    exports.Pie = Pie;
});
define('elements/element.parallel.line',['exports', '../const', './element'], function (exports, _const, _element) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var ParallelLine = (function (_Element) {
        function ParallelLine(config) {
            var _this = this;

            _classCallCheck(this, ParallelLine);

            _get(Object.getPrototypeOf(ParallelLine.prototype), 'constructor', this).call(this, config);

            this.config = config;
            this.config.guide = _.defaults(this.config.guide || {}, {});

            this.on('highlight', function (sender, e) {
                return _this.highlight(e);
            });
        }

        _inherits(ParallelLine, _Element);

        _createClass(ParallelLine, [{
            key: 'drawLayout',
            value: function drawLayout(fnCreateScale) {

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

                return this;
            }
        }, {
            key: 'drawFrames',
            value: function drawFrames(frames) {
                var _this2 = this;

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
                        return '' + _const.CSS_PREFIX + '__line line ' + color(row[color.dim]) + ' foreground';
                    });
                };

                var updateFrame = function updateFrame() {
                    var backgroundPath = this.selectAll('.background').data(function (f) {
                        return f.take();
                    });
                    backgroundPath.exit().remove();
                    backgroundPath.call(drawPath);
                    backgroundPath.enter().append('path').attr('class', 'background').call(drawPath);

                    var foregroundPath = this.selectAll('.foreground').data(function (f) {
                        return f.take();
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

                options.container.selectAll('.lines-frame .foreground').on('mouseover', function (d) {
                    return _this2.fire('mouseover', { data: d, event: d3.event });
                }).on('mouseout', function (d) {
                    return _this2.fire('mouseout', { data: d, event: d3.event });
                }).on('click', function (d) {
                    return _this2.fire('click', { data: d, event: d3.event });
                });
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

// params here;
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
        function BaseScale(xSource, scaleConfig) {
            _classCallCheck(this, BaseScale);

            var data;
            if (_2['default'].isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {
                data = xSource.partByDims(scaleConfig.fitToFrameByDims);
            } else {
                data = xSource.full();
            }

            var vars = this.getVarSet(data, scaleConfig);

            if (scaleConfig.order) {
                vars = _2['default'].union(_2['default'].intersection(scaleConfig.order, vars), vars);
            }

            this.vars = vars;
            this.scaleConfig = scaleConfig;
        }

        _createClass(BaseScale, [{
            key: 'toBaseScale',
            value: function toBaseScale(func) {
                var _this = this;

                var dynamicProps = arguments[1] === undefined ? null : arguments[1];

                func.dim = this.scaleConfig.dim;
                func.scaleDim = this.scaleConfig.dim;
                func.source = this.scaleConfig.source;

                func.domain = function () {
                    return _this.vars;
                };
                func.getHash = function () {
                    return generateHashFunction(_this.vars, dynamicProps);
                };

                return func;
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

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var ColorScale = (function (_BaseScale) {
        function ColorScale() {
            _classCallCheck(this, ColorScale);

            if (_BaseScale != null) {
                _BaseScale.apply(this, arguments);
            }
        }

        _inherits(ColorScale, _BaseScale);

        _createClass(ColorScale, [{
            key: 'create',
            value: function create() {

                var props = this.scaleConfig;
                var varSet = this.vars;

                var brewer = props.brewer;

                var defaultColorClass = _2['default'].constant('color-default');

                var defaultRangeColor = _2['default'].times(20, function (i) {
                    return 'color20-' + (1 + i);
                });

                var buildArrayGetClass = function buildArrayGetClass(domain, brewer) {
                    if (domain.length === 0 || domain.length === 1 && domain[0] === null) {
                        return defaultColorClass;
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

                if (!brewer) {
                    func = wrapString(buildArrayGetClass(varSet, defaultRangeColor));
                } else if (_2['default'].isArray(brewer)) {
                    func = wrapString(buildArrayGetClass(varSet, brewer));
                } else if (_2['default'].isFunction(brewer)) {
                    func = function (d) {
                        return brewer(d, wrapString(buildArrayGetClass(varSet, defaultRangeColor)));
                    };
                } else if (_2['default'].isObject(brewer)) {
                    func = buildObjectGetClass(brewer, defaultColorClass);
                } else {
                    throw new Error('This brewer is not supported');
                }

                func.scaleType = 'color';

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

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

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
        function SizeScale() {
            _classCallCheck(this, SizeScale);

            if (_BaseScale != null) {
                _BaseScale.apply(this, arguments);
            }
        }

        _inherits(SizeScale, _BaseScale);

        _createClass(SizeScale, [{
            key: 'create',
            value: function create() {
                var localProps = arguments[0] === undefined ? {} : arguments[0];

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

                func.scaleType = 'size';

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

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var OrdinalScale = (function (_BaseScale) {
        function OrdinalScale() {
            _classCallCheck(this, OrdinalScale);

            if (_BaseScale != null) {
                _BaseScale.apply(this, arguments);
            }
        }

        _inherits(OrdinalScale, _BaseScale);

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

                scale.scaleType = 'ordinal';
                scale.stepSize = function (x) {
                    return fnRatio(x) * size;
                };
                scale.descrete = true;

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

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var PeriodScale = (function (_BaseScale) {
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
        }

        _inherits(PeriodScale, _BaseScale);

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

                scale.scaleType = 'period';
                scale.stepSize = function (x) {
                    return fnRatio(x) * size;
                };
                scale.descrete = true;

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

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var TimeScale = (function (_BaseScale) {
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
        }

        _inherits(TimeScale, _BaseScale);

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

                scale.scaleType = 'time';
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

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var LinearScale = (function (_BaseScale) {
        function LinearScale(xSource, scaleConfig) {
            _classCallCheck(this, LinearScale);

            _get(Object.getPrototypeOf(LinearScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            var props = this.scaleConfig;
            var vars = _d32['default'].extent(this.vars);

            var min = _2['default'].isNumber(props.min) ? props.min : vars[0];
            var max = _2['default'].isNumber(props.max) ? props.max : vars[1];

            vars = [Math.min(min, vars[0]), Math.max(max, vars[1])];

            this.vars = props.autoScale ? _utilsUtils.utils.autoScale(vars) : _d32['default'].extent(vars);
        }

        _inherits(LinearScale, _BaseScale);

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

                scale.scaleType = 'linear';
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

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var ValueScale = (function (_BaseScale) {
        function ValueScale() {
            _classCallCheck(this, ValueScale);

            if (_BaseScale != null) {
                _BaseScale.apply(this, arguments);
            }
        }

        _inherits(ValueScale, _BaseScale);

        _createClass(ValueScale, [{
            key: 'create',
            value: function create() {

                var scale = function scale(x) {
                    return x;
                };
                scale.scaleType = 'value';
                scale.georole = this.scaleConfig.georole;

                return this.toBaseScale(scale);
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

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    /* jshint ignore:start */

    var _2 = _interopRequireDefault(_underscore);

    var _d32 = _interopRequireDefault(_d3);

    /* jshint ignore:end */

    var FillScale = (function (_BaseScale) {
        function FillScale(xSource, scaleConfig) {
            _classCallCheck(this, FillScale);

            _get(Object.getPrototypeOf(FillScale.prototype), 'constructor', this).call(this, xSource, scaleConfig);

            var props = this.scaleConfig;
            var vars = _d32['default'].extent(this.vars);

            var min = _2['default'].isNumber(props.min) ? props.min : vars[0];
            var max = _2['default'].isNumber(props.max) ? props.max : vars[1];

            vars = [Math.min(min, vars[0]), Math.max(max, vars[1])];

            this.vars = props.autoScale ? _utilsUtils.utils.autoScale(vars) : _d32['default'].extent(vars);
        }

        _inherits(FillScale, _BaseScale);

        _createClass(FillScale, [{
            key: 'create',
            value: function create() {

                var props = this.scaleConfig;
                var varSet = this.vars;

                var opacityStep = (1 - 0.2) / 9;
                var defBrewer = _2['default'].times(10, function (i) {
                    return 'rgba(90,180,90,' + (0.2 + i * opacityStep).toFixed(2) + ')';
                });

                var brewer = props.brewer || defBrewer;

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

                func.scaleType = 'fill';

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
            var guide = arguments[2] === undefined ? {} : arguments[2];

            var key;
            var dim = prop;
            var src;
            if (!prop) {
                key = '' + type + ':default';
                src = '?';
            } else {
                key = '' + type + '_' + prop;
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
            }
        };
    };

    exports.ChartMap = ChartMap;
});
define('api/converter-helpers',['exports', 'd3', '../utils/utils'], function (exports, _d3, _utilsUtils) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _strategyNormalizeAxis;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

    var _d32 = _interopRequireDefault(_d3);

    var convertAxis = function convertAxis(data) {
        return !data ? null : data;
    };

    var normalizeSettings = function normalizeSettings(axis) {
        var defaultValue = arguments[1] === undefined ? null : arguments[1];

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
            var guide = arguments[2] === undefined ? {} : arguments[2];

            var key;
            var dim = prop;
            var src;
            if (!prop) {
                key = '' + type + ':default';
                src = '?';
            } else {
                key = '' + type + '_' + prop;
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
                    throw new Error('' + x + ' plugin is not defined');
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