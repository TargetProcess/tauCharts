/*! tauCharts - v0.2.0 - 2014-12-03
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2014 Taucraft Limited; Licensed Creative Commons */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'd3'],function(_,d3){return factory(_, d3);});
    } else if (typeof module === "object" && module.exports) {
        var _ = require('underscore');
        var d3 = require('d3');
        module.exports = factory(_);
    } else {
        root.tauCharts = factory(root._, root.d3);
    }
}(this, function (_, d3) {/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
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
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

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
  

  /**
   * Internal method to return CSS value for given element and property
   */
  var utilsDom = {
    getScrollbarWidth: function () {
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

    getStyle: function (el, prop) {
      return window.getComputedStyle(el, undefined).getPropertyValue(prop);
    },

    getStyleAsNum: function (el, prop) {
      return parseInt(this.getStyle(el, prop) || 0, 10);
    },

    getContainerSize: function (el) {
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

    getAxisTickLabelSize: function (text) {
      var tmpl = ["<svg class=\"graphical-report__svg\">", "<g class=\"graphical-report__cell cell\">", "<g class=\"x axis\">", "<g class=\"tick\"><text><%= xTick %></text></g>", "</g>",
      //'<g class="y axis">',
      //'<g class="tick"><text><%= xTick %></text></g>',
      //'</g>',
      "</g>", "</svg>"].join("");

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

      document.body.removeChild(div);

      return size;
    }
  };
  exports.utilsDom = utilsDom;
});
define('dsl-reader',["exports"], function (exports) {
  

  var _classProps = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  var DSLReader = (function () {
    var DSLReader = function DSLReader(domainMixin, UnitsRegistry) {
      this.domain = domainMixin;
      this.UnitsRegistry = UnitsRegistry;
    };

    _classProps(DSLReader, null, {
      buildGraph: {
        writable: true,
        value: function (spec) {
          var _this = this;
          var buildRecursively = function (unit) {
            return _this.UnitsRegistry.get(unit.type).walk(_this.domain.mix(unit), buildRecursively);
          };
          return buildRecursively(spec.unit);
        }
      },
      calcLayout: {
        writable: true,
        value: function (graph, size) {
          graph.options = { top: 0, left: 0, width: size.width, height: size.height };

          var fnTraverseLayout = function (node) {
            if (!node.$matrix) {
              return node;
            }

            var options = node.options;
            var padding = node.guide.padding;

            var innerW = options.width - (padding.l + padding.r);
            var innerH = options.height - (padding.t + padding.b);

            var nRows = node.$matrix.sizeR();
            var nCols = node.$matrix.sizeC();

            var cellW = innerW / nCols;
            var cellH = innerH / nRows;

            var calcLayoutStrategy;
            if (node.guide.split) {
              calcLayoutStrategy = {
                calcHeight: (function (cellHeight, rowIndex, elIndex, lenIndex) {
                  return cellHeight / lenIndex;
                }),
                calcTop: (function (cellHeight, rowIndex, elIndex, lenIndex) {
                  return (rowIndex + 1) * (cellHeight / lenIndex) * elIndex;
                })
              };
            } else {
              calcLayoutStrategy = {
                calcHeight: (function (cellHeight, rowIndex, elIndex, lenIndex) {
                  return cellHeight;
                }),
                calcTop: (function (cellHeight, rowIndex, elIndex, lenIndex) {
                  return rowIndex * cellH;
                })
              };
            }

            node.$matrix.iterate(function (iRow, iCol, subNodes) {
              var len = subNodes.length;

              _.each(subNodes, function (node, i) {
                node.options = {
                  width: cellW,
                  left: iCol * cellW,
                  height: calcLayoutStrategy.calcHeight(cellH, iRow, i, len),
                  top: calcLayoutStrategy.calcTop(cellH, iRow, i, len)
                };
                fnTraverseLayout(node);
              });
            });

            return node;
          };

          return fnTraverseLayout(graph);
        }
      },
      renderGraph: {
        writable: true,
        value: function (styledGraph, target, chart) {
          var _this2 = this;
          styledGraph.options.container = target;
          var renderRecursively = function (unit) {
            _this2.UnitsRegistry.get(unit.type).draw(_this2.domain.mix(unit), renderRecursively);
            if (chart) {
              chart.fire("unitready", unit);
            }
          };
          renderRecursively(styledGraph);
          return styledGraph.options.container;
        }
      }
    });

    return DSLReader;
  })();

  exports.DSLReader = DSLReader;
});
define('const',["exports"], function (exports) {
  

  var CSS_PREFIX = exports.CSS_PREFIX = "graphical-report__";
});
define('api/balloon',["exports", "../const"], function (exports, _const) {
  

  var CSS_PREFIX = _const.CSS_PREFIX;
  // jshint ignore: start
  var classes = function (el) {
    return {
      add: function (name) {
        el.classList.add(name);
      },
      remove: function (name) {
        el.classList.remove(name);
      }
    };
  };



  var indexOf = function (arr, obj) {
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
  }());
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
    this.content(content);
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

    if (~indexOf(verticalPlaces, place[0])) {
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
    if (! ~index) {
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
    if (~index) {
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
  }());
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
define('event',["exports"], function (exports) {
  

  var _classProps = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

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
    var Emitter =
    /**
     * @constructor
     */
    function Emitter() {
      this.handler = null;
      this.emit_destroy = createDispatcher("destroy");
    };

    _classProps(Emitter, null, {
      addHandler: {
        writable: true,


        /**
         * Adds new event handler to object.
         * @param {object} callbacks Callback set.
         * @param {object=} context Context object.
         */
        value: function (callbacks, context) {
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
        writable: true,
        value: function (name, callback, context) {
          var obj = {};
          obj[name] = callback;
          this.addHandler(obj, context);
          return obj;
        }
      },
      fire: {
        writable: true,
        value: function (name, data) {
          createDispatcher.call(this, name).call(this, data);
        }
      },
      removeHandler: {
        writable: true,


        /**
         * Removes event handler set from object. For this operation parameters
         * must be the same (equivalent) as used for addHandler method.
         * @param {object} callbacks Callback set.
         * @param {object=} context Context object.
         */
        value: function (callbacks, context) {
          var cursor = this;
          var prev;

          context = context || this;

          // search for handler and remove it
          while (prev = cursor, cursor = cursor.handler) {
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
        writable: true,


        /**
         * @destructor
         */
        value: function () {
          // fire object destroy event handlers
          this.emit_destroy();
          // drop event handlers if any
          this.handler = null;
        }
      }
    });

    return Emitter;
  })();

  exports.Emitter = Emitter;
});
define('utils/utils',["exports"], function (exports) {
  

  var traverseJSON = function (srcObject, byProperty, fnSelectorPredicates, funcTransformRules) {
    var rootRef = funcTransformRules(fnSelectorPredicates(srcObject), srcObject);

    (rootRef[byProperty] || []).forEach(function (unit) {
      return traverseJSON(unit, byProperty, fnSelectorPredicates, funcTransformRules);
    });

    return rootRef;
  };

  var utils = {
    clone: function (obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    isArray: function (obj) {
      return Array.isArray(obj);
    },

    autoScale: function (domain) {
      var m = 10;

      var low = Math.min.apply(null, domain);
      var top = Math.max.apply(null, domain);

      if (low === top) {
        var k = (top >= 0) ? -1 : 1;
        var d = (top || 1);
        top = top - k * d / m;
      }

      var extent = [low, top];
      var span = extent[1] - extent[0];
      var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
      var err = m / span * step;

      var correction = [[0.15, 10], [0.35, 5], [0.75, 2], [1, 1], [2, 1]];

      var i = -1;
      while (err > correction[++i][0]) {}

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

      return [parseFloat(extent[0].toFixed(15)), parseFloat(extent[1].toFixed(15))];
    },

    traverseJSON: traverseJSON
  };

  exports.utils = utils;
});
define('formatter-registry',["exports", "d3"], function (exports, _d3) {
  

  var d3 = _d3;
  /* jshint ignore:end */
  var FORMATS_MAP = {
    "x-num-auto": function (x) {
      var v = parseFloat(x.toFixed(2));
      return (Math.abs(v) < 1) ? v.toString() : d3.format("s")(v);
    },

    percent: function (x) {
      var v = parseFloat((x * 100).toFixed(2));
      return v.toString() + "%";
    },

    day: d3.time.format("%d-%b-%Y"),

    week: d3.time.format("%d-%b-%Y"),

    "week-range": function (x) {
      var sWeek = new Date(x);
      var clone = new Date(x);
      var eWeek = new Date(clone.setDate(clone.getDate() + 7));
      var format = d3.time.format("%d-%b-%Y");
      return format(sWeek) + " - " + format(eWeek);
    },

    month: function (x) {
      var d = new Date(x);
      var m = d.getMonth();
      var formatSpec = (m === 0) ? "%B, %Y" : "%B";
      return d3.time.format(formatSpec)(x);
    },

    "month-year": d3.time.format("%B, %Y"),

    quarter: function (x) {
      var d = new Date(x);
      var m = d.getMonth();
      var q = (m - (m % 3)) / 3;
      return "Q" + (q + 1) + " " + d.getFullYear();
    },

    year: d3.time.format("%Y"),

    "x-time-auto": null
  };

  /* jshint ignore:start */
  FORMATS_MAP["x-time-ms"] = FORMATS_MAP["x-time-auto"];
  FORMATS_MAP["x-time-sec"] = FORMATS_MAP["x-time-auto"];
  FORMATS_MAP["x-time-min"] = FORMATS_MAP["x-time-auto"];
  FORMATS_MAP["x-time-hour"] = FORMATS_MAP["x-time-auto"];
  FORMATS_MAP["x-time-day"] = FORMATS_MAP["x-time-auto"];
  FORMATS_MAP["x-time-week"] = FORMATS_MAP["x-time-auto"];
  FORMATS_MAP["x-time-month"] = FORMATS_MAP.month;
  FORMATS_MAP["x-time-quarter"] = FORMATS_MAP.quarter;
  FORMATS_MAP["x-time-year"] = FORMATS_MAP.year;
  /* jshint ignore:end */

  var identity = (function (x) {
    return (((x === null) || (typeof x === "undefined")) ? "" : x).toString();
  });

  var FormatterRegistry = {
    get: function (formatAlias) {
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
define('utils/utils-draw',["exports", "../utils/utils", "../formatter-registry"], function (exports, _utilsUtils, _formatterRegistry) {
  

  var utils = _utilsUtils.utils;
  var FormatterRegistry = _formatterRegistry.FormatterRegistry;


  var translate = function (left, top) {
    return "translate(" + left + "," + top + ")";
  };
  var rotate = function (angle) {
    return "rotate(" + angle + ")";
  };
  var getOrientation = function (scaleOrient) {
    return _.contains(["bottom", "top"], scaleOrient.toLowerCase()) ? "h" : "v";
  };


  var cutText = function (textString, widthLimit) {
    textString.each(function () {
      var textD3 = d3.select(this);
      var tokens = textD3.text().split(/\s+/).reverse();

      textD3.text(null);

      var line = [];
      var word;
      var stop = false;
      while (!stop && (word = tokens.pop())) {
        line.push(word);
        textD3.text(line.join(" "));
        if (textD3.node().getComputedTextLength() > widthLimit) {
          line.pop();

          var str = line.join(" ");
          str += "...";

          textD3.text(str);

          stop = true;
        }
      }
    });
  };

  var wrapText = function (textNode, widthLimit, linesLimit, tickLabelFontHeight, isY) {
    var addLine = function (targetD3, text, lineHeight, x, y, dy, lineNumber) {
      var dyNew = (lineNumber * lineHeight) + dy;
      var nodeX = targetD3.append("tspan").attr("x", x).attr("y", y).attr("dy", dyNew + "em").text(text);
      return nodeX;
    };

    textNode.each(function () {
      var textD3 = d3.select(this), tokens = textD3.text().split(/\s+/), lineHeight = 1.1, // ems
      x = textD3.attr("x"), y = textD3.attr("y"), dy = parseFloat(textD3.attr("dy"));

      textD3.text(null);
      var tempSpan = addLine(textD3, null, lineHeight, x, y, dy, 0);

      var stopReduce = false;
      var lines = tokens.reduce(function (memo, next) {
        if (stopReduce) return memo;

        var isLimit = memo.length === linesLimit;
        var last = memo[memo.length - 1];
        var over = tempSpan.text(last + next).node().getComputedTextLength() > widthLimit;

        if (over && isLimit) {
          memo[memo.length - 1] = last + "...";
          stopReduce = true;
        }

        if (over && !isLimit) {
          memo.push(next);
        }

        if (!over) {
          memo[memo.length - 1] = last + " " + next;
        }

        return memo;
      }, [""]);

      y = isY ? (-1 * (lines.length - 1) * Math.floor(tickLabelFontHeight * 0.5)) : y;
      lines.forEach(function (text, i) {
        return addLine(textD3, text, lineHeight, x, y, dy, i);
      });

      tempSpan.remove();
    });
  };

  var decorateAxisTicks = function (nodeScale, x, size) {
    var selection = nodeScale.selectAll(".tick line");

    var sectorSize = size / selection[0].length;
    var offsetSize = sectorSize / 2;

    if (x.scaleType === "ordinal" || x.scaleType === "period") {
      var isHorizontal = ("h" === getOrientation(x.guide.scaleOrient));

      var key = (isHorizontal) ? "x" : "y";
      var val = (isHorizontal) ? offsetSize : (-offsetSize);

      selection.attr(key + "1", val).attr(key + "2", val);
    }
  };

  var decorateAxisLabel = function (nodeScale, x) {
    var koeff = ("h" === getOrientation(x.guide.scaleOrient)) ? 1 : -1;
    var labelTextNode = nodeScale.append("text").attr("transform", rotate(x.guide.label.rotate)).attr("class", "label").attr("x", koeff * x.guide.size * 0.5).attr("y", koeff * x.guide.label.padding).style("text-anchor", x.guide.label.textAnchor);

    var delimiter = " > ";
    var tags = x.guide.label.text.split(delimiter);
    var tLen = tags.length;
    tags.forEach(function (token, i) {
      labelTextNode.append("tspan").attr("class", "label-token label-token-" + i).text(token);

      if (i < (tLen - 1)) {
        labelTextNode.append("tspan").attr("class", "label-token-delimiter label-token-delimiter-" + i).text(delimiter);
      }
    });
  };

  var decorateTickLabel = function (nodeScale, x) {
    var isHorizontal = ("h" === getOrientation(x.guide.scaleOrient));

    var angle = x.guide.rotate;

    var ticks = nodeScale.selectAll(".tick text");
    ticks.attr("transform", rotate(angle)).style("text-anchor", x.guide.textAnchor);

    if (angle === 90) {
      ticks.attr("x", 9).attr("y", 0);
    }

    if (x.guide.tickFormatWordWrap) {
      ticks.call(wrapText, x.guide.tickFormatWordWrapLimit, x.guide.tickFormatWordWrapLines, x.guide.$maxTickTextH, !isHorizontal);
    } else {
      ticks.call(cutText, x.guide.tickFormatWordWrapLimit);
    }
  };

  var fnDrawDimAxis = function (x, AXIS_POSITION, size) {
    var container = this;
    if (x.scaleDim) {
      var axisScale = d3.svg.axis().scale(x.scaleObj).orient(x.guide.scaleOrient);

      var formatter = FormatterRegistry.get(x.guide.tickFormat);
      if (formatter !== null) {
        axisScale.ticks(Math.round(size / x.guide.density));
        axisScale.tickFormat(formatter);
      }

      var nodeScale = container.append("g").attr("class", x.guide.cssClass).attr("transform", translate.apply(null, AXIS_POSITION)).call(axisScale);

      decorateAxisTicks(nodeScale, x, size);
      decorateTickLabel(nodeScale, x);
      decorateAxisLabel(nodeScale, x);
    }
  };

  var fnDrawGrid = function (node, H, W) {
    var container = this;

    var grid = container.append("g").attr("class", "grid").attr("transform", translate(0, 0));

    var linesOptions = (node.guide.showGridLines || "").toLowerCase();
    if (linesOptions.length > 0) {
      var gridLines = grid.append("g").attr("class", "grid-lines");

      if ((linesOptions.indexOf("x") > -1) && node.x.scaleDim) {
        var x = node.x;
        var xGridAxis = d3.svg.axis().scale(x.scaleObj).orient(x.guide.scaleOrient).tickSize(H);

        var formatter = FormatterRegistry.get(x.guide.tickFormat);
        if (formatter !== null) {
          xGridAxis.ticks(Math.round(W / x.guide.density));
          xGridAxis.tickFormat(formatter);
        }

        var xGridLines = gridLines.append("g").attr("class", "grid-lines-x").call(xGridAxis);

        decorateAxisTicks(xGridLines, x, W);

        var firstXGridLine = xGridLines.select("g.tick");
        if (firstXGridLine.node() && firstXGridLine.attr("transform") !== "translate(0,0)") {
          var zeroNode = firstXGridLine.node().cloneNode(true);
          gridLines.node().appendChild(zeroNode);
          d3.select(zeroNode).attr("class", "border").attr("transform", translate(0, 0)).select("line").attr("x1", 0).attr("x2", 0);
        }
      }

      if ((linesOptions.indexOf("y") > -1) && node.y.scaleDim) {
        var y = node.y;
        var yGridAxis = d3.svg.axis().scale(y.scaleObj).orient(y.guide.scaleOrient).tickSize(-W);

        var formatter = FormatterRegistry.get(y.guide.tickFormat);
        if (formatter !== null) {
          yGridAxis.ticks(Math.round(H / y.guide.density));
          yGridAxis.tickFormat(formatter);
        }

        var yGridLines = gridLines.append("g").attr("class", "grid-lines-y").call(yGridAxis);

        decorateAxisTicks(yGridLines, y, H);
      }

      // TODO: make own axes and grid instead of using d3's in such tricky way
      gridLines.selectAll("text").remove();
    }

    return grid;
  };
  var defaultRangeColor = _.times(10, function (i) {
    return "color10-" + (1 + i);
  });
  var generateColor = function (node) {
    var range, domain;
    var colorGuide = node.guide.color || {};
    var colorParam = node.color;

    var colorDim = colorParam.scaleDim;
    var brewer = colorGuide.brewer || defaultRangeColor;

    if (utils.isArray(brewer)) {
      domain = node.domain(colorDim);
      range = brewer;
    } else {
      domain = Object.keys(brewer);
      range = domain.map(function (key) {
        return brewer[key];
      });
    }
    var calculateClass = d3.scale.ordinal().range(range).domain(domain);
    var getClass = function (d) {
      return domain.indexOf(d) > -1 ? calculateClass(d) : "color-default";
    };

    return {
      get: function (d) {
        return getClass(d);
      },
      dimension: colorDim
    };
  };

  var applyNodeDefaults = function (node) {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = _.defaults(node.guide.padding || {}, { l: 0, b: 0, r: 0, t: 0 });

    node.guide.x = _.defaults(node.guide.x || {}, {
      label: "",
      padding: 0,
      density: 30,
      cssClass: "x axis",
      scaleOrient: "bottom",
      rotate: 0,
      textAnchor: "middle",
      tickPeriod: null,
      tickFormat: null,
      autoScale: true
    });
    node.guide.x.label = _.isObject(node.guide.x.label) ? node.guide.x.label : { text: node.guide.x.label };
    node.guide.x.label = _.defaults(node.guide.x.label, { padding: 32, rotate: 0, textAnchor: "middle" });

    node.guide.x.tickFormat = node.guide.x.tickFormat || node.guide.x.tickPeriod;

    node.guide.y = _.defaults(node.guide.y || {}, {
      label: "",
      padding: 0,
      density: 30,
      cssClass: "y axis",
      scaleOrient: "left",
      rotate: 0,
      textAnchor: "end",
      tickPeriod: null,
      tickFormat: null,
      autoScale: true
    });
    node.guide.y.label = _.isObject(node.guide.y.label) ? node.guide.y.label : { text: node.guide.y.label };
    node.guide.y.label = _.defaults(node.guide.y.label, { padding: 32, rotate: -90, textAnchor: "middle" });

    node.guide.y.tickFormat = node.guide.y.tickFormat || node.guide.y.tickPeriod;

    return node;
  };

  /* jshint ignore:start */
  var utilsDraw = {
    translate: translate,
    rotate: rotate,
    getOrientation: getOrientation,
    fnDrawDimAxis: fnDrawDimAxis,
    fnDrawGrid: fnDrawGrid,
    generateColor: generateColor,
    applyNodeDefaults: applyNodeDefaults
  };
  exports.utilsDraw = utilsDraw;
});
define('spec-engine-factory',["exports", "./utils/utils", "./utils/utils-draw", "./formatter-registry"], function (exports, _utilsUtils, _utilsUtilsDraw, _formatterRegistry) {
  

  var utils = _utilsUtils.utils;
  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var FormatterRegistry = _formatterRegistry.FormatterRegistry;


  var applyCustomProps = function (targetUnit, customUnit) {
    var guide = customUnit.guide || {};
    var guide_x = guide.hasOwnProperty("x") ? guide.x : {};
    var guide_y = guide.hasOwnProperty("y") ? guide.y : {};
    var guide_padding = guide.hasOwnProperty("padding") ? guide.padding : {};

    _.extend(targetUnit.guide.padding, guide_padding);

    _.extend(targetUnit.guide.x.label, guide_x.label);
    _.extend(targetUnit.guide.x, _.omit(guide_x, "label"));

    _.extend(targetUnit.guide.y.label, guide_y.label);
    _.extend(targetUnit.guide.y, _.omit(guide_y, "label"));

    _.extend(targetUnit.guide, _.omit(guide, "x", "y", "padding"));

    return targetUnit;
  };

  var inheritProps = function (childUnit, root) {
    childUnit.guide = childUnit.guide || {};
    childUnit.guide.padding = childUnit.guide.padding || { l: 0, t: 0, r: 0, b: 0 };

    // leaf elements should inherit coordinates properties
    if (!childUnit.hasOwnProperty("unit")) {
      childUnit = _.defaults(childUnit, root);
      childUnit.guide = _.defaults(childUnit.guide, utils.clone(root.guide));
      childUnit.guide.x = _.defaults(childUnit.guide.x, utils.clone(root.guide.x));
      childUnit.guide.y = _.defaults(childUnit.guide.y, utils.clone(root.guide.y));
    }

    return childUnit;
  };

  var createSelectorPredicates = function (root) {
    var children = root.unit || [];

    var isLeaf = !root.hasOwnProperty("unit");
    var isLeafParent = !children.some(function (c) {
      return c.hasOwnProperty("unit");
    });

    return {
      type: root.type,
      isLeaf: isLeaf,
      isLeafParent: !isLeaf && isLeafParent
    };
  };

  var getMaxTickLabelSize = function (domainValues, formatter, fnCalcTickLabelSize, axisLabelLimit) {
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
    return fnCalcTickLabelSize(formatter(maxXTickText));
  };

  var getTickFormat = function (dim, meta, defaultFormats) {
    var dimType = dim.dimType;
    var scaleType = dim.scaleType;
    var specifier = "*";
    if (dimType === "measure" && scaleType === "time") {
      var src = meta.source.filter(function (x) {
        return (x !== null);
      }).sort();
      var resolutionAvg = 0;
      if (src.length > 1) {
        var i = 1;
        var l = src.length;
        var m = [];
        while (i < l) {
          m.push(src[i] - src[i - 1]);
          ++i;
        }

        var s = m.reduce(function (sum, x) {
          sum += x;
          return sum;
        }, 0);

        resolutionAvg = s / m.length;
      }

      var resolutions = [[1000 * 60 * 60 * 24 * 365, "year"], [1000 * 60 * 60 * 24 * 30 * 3, "quarter"], [1000 * 60 * 60 * 24 * 30, "month"], [1000 * 60 * 60 * 24 * 7, "week"], [1000 * 60 * 60 * 24, "day"], [1000 * 60 * 60, "hour"], [1000 * 60, "min"], [1000, "sec"], [0, "ms"]];

      var r = -1;
      do {
        ++r;
      } while (resolutions[r][0] > resolutionAvg);

      specifier = resolutions[r][1];
    }

    var key = [dimType, scaleType, specifier].join(":");
    var tag = [dimType, scaleType].join(":");
    return defaultFormats[key] || defaultFormats[tag] || defaultFormats[dimType] || null;
  };

  var SpecEngineTypeMap = {
    NONE: function (srcSpec, meta, settings) {
      var spec = utils.clone(srcSpec);
      fnTraverseSpec(utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {
        unit.guide.x.tickFontHeight = settings.getAxisTickLabelSize("X").height;
        unit.guide.y.tickFontHeight = settings.getAxisTickLabelSize("Y").height;
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

      utils.traverseJSON(spec.unit, "unit", createSelectorPredicates, function (selectors, unit) {
        if (selectors.isLeaf) {
          return unit;
        }

        if (!xUnit && unit.x) (xUnit = unit);
        if (!yUnit && unit.y) (yUnit = unit);

        unit.guide = unit.guide || {};

        unit.guide.x = unit.guide.x || { label: "" };
        unit.guide.y = unit.guide.y || { label: "" };

        unit.guide.x.label = _.isObject(unit.guide.x.label) ? unit.guide.x.label : { text: unit.guide.x.label };
        unit.guide.y.label = _.isObject(unit.guide.y.label) ? unit.guide.y.label : { text: unit.guide.y.label };

        if (unit.x) {
          unit.guide.x.label.text = unit.guide.x.label.text || unit.x;
        }

        if (unit.y) {
          unit.guide.y.label.text = unit.guide.y.label.text || unit.y;
        }

        var x = unit.guide.x.label.text;
        if (x) {
          xLabels.push(x);
          unit.guide.x.label.text = "";
        }

        var y = unit.guide.y.label.text;
        if (y) {
          yLabels.push(y);
          unit.guide.y.label.text = "";
        }

        return unit;
      });

      if (xUnit) {
        xUnit.guide.x.label.text = xLabels.map(function (x) {
          return x.toUpperCase();
        }).join(" > ");
      }

      if (yUnit) {
        yUnit.guide.y.label.text = yLabels.map(function (x) {
          return x.toUpperCase();
        }).join(" > ");
      }

      return spec;
    },

    "BUILD-GUIDE": function (srcSpec, meta, settings) {
      var spec = utils.clone(srcSpec);
      fnTraverseSpec(utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {
        if (selectorPredicates.isLeaf) {
          return unit;
        }

        if (selectorPredicates.isLeafParent && !unit.guide.hasOwnProperty("showGridLines")) {
          unit.guide.showGridLines = "xy";
        }

        var isFacetUnit = (!selectorPredicates.isLeaf && !selectorPredicates.isLeafParent);
        if (isFacetUnit) {
          // unit is a facet!
          unit.guide.x.cssClass += " facet-axis";
          unit.guide.y.cssClass += " facet-axis";
        }

        var dimX = meta.dimension(unit.x);
        var dimY = meta.dimension(unit.y);

        var isXContinues = (dimX.dimType === "measure");
        var isYContinues = (dimY.dimType === "measure");

        var xScaleOptions = {
          map: unit.guide.x.tickLabel,
          min: unit.guide.x.tickMin,
          max: unit.guide.x.tickMax,
          period: unit.guide.x.tickPeriod,
          autoScale: unit.guide.x.autoScale
        };

        var yScaleOptions = {
          map: unit.guide.y.tickLabel,
          min: unit.guide.y.tickMin,
          max: unit.guide.y.tickMax,
          period: unit.guide.y.tickPeriod,
          autoScale: unit.guide.y.autoScale
        };

        var xMeta = meta.scaleMeta(unit.x, xScaleOptions);
        var xValues = xMeta.values;
        var yMeta = meta.scaleMeta(unit.y, yScaleOptions);
        var yValues = yMeta.values;


        unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(dimX, xMeta, settings.defaultFormats);
        unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(dimY, yMeta, settings.defaultFormats);

        var xIsEmptyAxis = (xValues.length === 0);
        var yIsEmptyAxis = (yValues.length === 0);

        var maxXTickSize = getMaxTickLabelSize(xValues, FormatterRegistry.get(unit.guide.x.tickFormat), settings.getAxisTickLabelSize, settings.xAxisTickLabelLimit);

        var maxYTickSize = getMaxTickLabelSize(yValues, FormatterRegistry.get(unit.guide.y.tickFormat), settings.getAxisTickLabelSize, settings.yAxisTickLabelLimit);


        var xAxisPadding = selectorPredicates.isLeafParent ? settings.xAxisPadding : 0;
        var yAxisPadding = selectorPredicates.isLeafParent ? settings.yAxisPadding : 0;

        var isXVertical = !isFacetUnit && (!!dimX.dimType && dimX.dimType !== "measure");

        unit.guide.x.padding = xIsEmptyAxis ? 0 : xAxisPadding;
        unit.guide.y.padding = yIsEmptyAxis ? 0 : yAxisPadding;

        unit.guide.x.rotate = isXVertical ? 90 : 0;
        unit.guide.x.textAnchor = isXVertical ? "start" : unit.guide.x.textAnchor;

        var xTickWidth = xIsEmptyAxis ? 0 : settings.xTickWidth;
        var yTickWidth = yIsEmptyAxis ? 0 : settings.yTickWidth;

        unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
        unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

        var maxXTickH = isXVertical ? maxXTickSize.width : maxXTickSize.height;

        if (!isXContinues && (maxXTickH > settings.xAxisTickLabelLimit)) {
          maxXTickH = settings.xAxisTickLabelLimit;
        }

        if (!isXVertical && (maxXTickSize.width > settings.xAxisTickLabelLimit)) {
          unit.guide.x.tickFormatWordWrap = true;
          unit.guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;
          maxXTickH = settings.xTickWordWrapLinesLimit * maxXTickSize.height;
        }

        var maxYTickW = maxYTickSize.width;
        if (!isYContinues && (maxYTickW > settings.yAxisTickLabelLimit)) {
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


        var xTickLabelW = Math.min(settings.xAxisTickLabelLimit, (isXVertical ? maxXTickSize.height : maxXTickSize.width));
        unit.guide.x.density = settings.xDensityKoeff * xTickLabelW;

        var guessLinesCount = Math.ceil(maxYTickSize.width / settings.yAxisTickLabelLimit);
        var koeffLinesCount = Math.min(guessLinesCount, settings.yTickWordWrapLinesLimit);
        var yTickLabelH = Math.min(settings.yAxisTickLabelLimit, koeffLinesCount * maxYTickSize.height);
        unit.guide.y.density = settings.yDensityKoeff * yTickLabelH;


        unit.guide.x.label.padding = (unit.guide.x.label.text) ? (xFontH + distToXAxisLabel) : 0;
        unit.guide.y.label.padding = (unit.guide.y.label.text) ? (yFontW + distToYAxisLabel) : 0;


        var xLabelPadding = (unit.guide.x.label.text) ? (unit.guide.x.label.padding + xFontLabelHeight) : (xFontH);
        var yLabelPadding = (unit.guide.y.label.text) ? (unit.guide.y.label.padding + yFontLabelHeight) : (yFontW);


        unit.guide.padding.b = xAxisPadding + xLabelPadding;
        unit.guide.padding.l = yAxisPadding + yLabelPadding;

        unit.guide.padding.b = (unit.guide.x.hide) ? 0 : unit.guide.padding.b;
        unit.guide.padding.l = (unit.guide.y.hide) ? 0 : unit.guide.padding.l;

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
    }
  };

  SpecEngineTypeMap.AUTO = function (srcSpec, meta, settings) {
    return ["BUILD-LABELS", "BUILD-GUIDE"].reduce(function (spec, engineName) {
      return SpecEngineTypeMap[engineName](spec, meta, settings);
    }, srcSpec);
  };


  var fnTraverseSpec = function (orig, specUnitRef, transformRules) {
    var xRef = utilsDraw.applyNodeDefaults(specUnitRef);
    xRef = transformRules(createSelectorPredicates(xRef), xRef);
    xRef = applyCustomProps(xRef, orig);
    var prop = _.omit(xRef, "unit");
    (xRef.unit || []).forEach(function (unit) {
      return fnTraverseSpec(utils.clone(unit), inheritProps(unit, prop), transformRules);
    });
    return xRef;
  };

  var SpecEngineFactory = {
    get: function (typeName, settings) {
      var engine = (SpecEngineTypeMap[typeName] || SpecEngineTypeMap.NONE);
      return function (srcSpec, meta) {
        return engine(srcSpec, meta, settings);
      };
    }
  };

  exports.SpecEngineFactory = SpecEngineFactory;
});
define('matrix',["exports"], function (exports) {
  

  var TMatrix = (function () {
    var Matrix = function (r, c) {
      var args = _.toArray(arguments);
      var cube;

      if (_.isArray(args[0])) {
        cube = args[0];
      } else {
        cube = _.times(r, function () {
          return _.times(c, function () {
            return null;
          });
        });
      }

      this.cube = cube;
    };

    Matrix.prototype = {
      iterate: function (iterator) {
        var cube = this.cube;
        _.each(cube, function (row, ir) {
          _.each(row, function (colValue, ic) {
            iterator(ir, ic, colValue);
          });
        });
        return this;
      },

      getRC: function (r, c) {
        return this.cube[r][c];
      },

      setRC: function (r, c, val) {
        this.cube[r][c] = val;
        return this;
      },

      sizeR: function () {
        return this.cube.length;
      },

      sizeC: function () {
        var row = this.cube[0] || [];
        return row.length;
      }
    };

    return Matrix;
  })();

  exports.TMatrix = TMatrix;
});
define('layout-engine-factory',["exports", "./utils/utils", "./utils/utils-draw", "./matrix"], function (exports, _utilsUtils, _utilsUtilsDraw, _matrix) {
  

  var utils = _utilsUtils.utils;
  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var TMatrix = _matrix.TMatrix;



  var specUnitSummary = function (spec, boxOpt) {
    var box = boxOpt ? boxOpt : { depth: -1, paddings: [] };
    var p = spec.guide.padding;
    box.depth += 1;
    box.paddings.unshift({ l: p.l, b: p.b, r: p.r, t: p.t });

    if (spec.unit && spec.unit.length) {
      specUnitSummary(spec.unit[0], box);
    }

    return box;
  };

  var LayoutEngineTypeMap = {
    NONE: (function (rootNode) {
      return rootNode;
    }),

    EXTRACT: function (rootNode) {
      var traverse = (function (rootNodeMatrix, depth, rule) {
        var matrix = rootNodeMatrix;

        var rows = matrix.sizeR();
        var cols = matrix.sizeC();

        matrix.iterate(function (r, c, subNodes) {
          subNodes.forEach(function (unit) {
            return rule(unit, {
              firstRow: (r === 0),
              firstCol: (c === 0),
              lastRow: (r === (rows - 1)),
              lastCol: (c === (cols - 1)),
              depth: depth
            });
          });

          subNodes.filter(function (unit) {
            return unit.$matrix;
          }).forEach(function (unit) {
            unit.$matrix = new TMatrix(unit.$matrix.cube);
            traverse(unit.$matrix, depth - 1, rule);
          });
        });
      });

      var coordNode = utils.clone(rootNode);

      var coordMatrix = new TMatrix([[[coordNode]]]);

      var box = specUnitSummary(coordNode);

      var globPadd = box.paddings.reduce(function (memo, item) {
        memo.l += item.l;
        memo.b += item.b;
        return memo;
      }, { l: 0, b: 0 });

      var temp = utils.clone(globPadd);
      var axesPadd = box.paddings.reverse().map(function (item) {
        item.l = temp.l - item.l;
        item.b = temp.b - item.b;
        temp = { l: item.l, b: item.b };
        return item;
      });
      box.paddings = axesPadd.reverse();

      var distanceBetweenFacets = 10;

      var wrapperNode = utilsDraw.applyNodeDefaults({
        type: "COORDS.RECT",
        options: utils.clone(rootNode.options),
        $matrix: new TMatrix([[[coordNode]]]),
        guide: {
          padding: {
            l: globPadd.l - distanceBetweenFacets,
            b: globPadd.b - distanceBetweenFacets,
            r: 0,
            t: 0
          }
        }
      });

      traverse(coordMatrix, box.depth, function (unit, selectorPredicates) {
        var depth = selectorPredicates.depth;

        unit.guide.x.hide = (unit.guide.x.hide) ? unit.guide.x.hide : !selectorPredicates.lastRow;
        unit.guide.y.hide = (unit.guide.y.hide) ? unit.guide.y.hide : !selectorPredicates.firstCol;

        var positiveFeedbackLoop = (depth > 1) ? 0 : distanceBetweenFacets;
        var negativeFeedbackLoop = (depth > 1) ? distanceBetweenFacets : 0;

        unit.guide.x.padding += (box.paddings[depth].b);
        unit.guide.y.padding += (box.paddings[depth].l);

        unit.guide.x.padding -= negativeFeedbackLoop;
        unit.guide.y.padding -= negativeFeedbackLoop;

        unit.guide.padding.l = positiveFeedbackLoop;
        unit.guide.padding.b = positiveFeedbackLoop;
        unit.guide.padding.r = positiveFeedbackLoop;
        unit.guide.padding.t = positiveFeedbackLoop;

        return unit;
      });

      return wrapperNode;
    }
  };

  var LayoutEngineFactory = {
    get: (function (typeName) {
      return (LayoutEngineTypeMap[typeName] || LayoutEngineTypeMap.NONE);
    })

  };

  exports.LayoutEngineFactory = LayoutEngineFactory;
});
define('plugins',["exports"], function (exports) {
  

  var _classProps = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  //plugins
  /** @class
   * @extends Plugin */
  var Plugins = (function () {
    var Plugins =
    /** @constructs */
    function Plugins(plugins, chart) {
      this.chart = chart;
      this._plugins = plugins.map(this.initPlugin, this);
    };

    _classProps(Plugins, null, {
      initPlugin: {
        writable: true,
        value: function (plugin) {
          var _this = this;
          if (plugin.init) {
            plugin.init(this.chart);
          }
          this.chart.on("destroy", plugin.destroy || (function () {}));
          Object.keys(plugin).forEach(function (name) {
            if (name.indexOf("on") === 0) {
              var event = name.substr(2);
              _this.chart.on(event.toLowerCase(), plugin[name].bind(plugin));
            }
          });
        }
      }
    });

    return Plugins;
  })();

  var elementEvents = ["click", "mouseover", "mouseout", "mousemove"];
  var propagateDatumEvents = function (chart) {
    return function () {
      elementEvents.forEach(function (name) {
        this.on(name, function (d) {
          chart.fire("element" + name, {
            elementData: d,
            element: this,
            cellData: d3.select(this.parentNode.parentNode).datum()
          });
        });
      }, this);
    };
  };


  exports.propagateDatumEvents = propagateDatumEvents;
  exports.Plugins = Plugins;
});
define('unit-domain-period-generator',["exports"], function (exports) {
  

  var PERIODS_MAP = {
    day: {
      cast: function (date) {
        return new Date(date.setHours(0, 0, 0, 0));
      },
      next: function (prevDate) {
        return new Date(prevDate.setDate(prevDate.getDate() + 1));
      }
    },

    week: {
      cast: function (date) {
        date = new Date(date.setHours(0, 0, 0, 0));
        date = new Date(date.setDate(date.getDate() - date.getDay()));
        return date;
      },
      next: function (prevDate) {
        return new Date(prevDate.setDate(prevDate.getDate() + 7));
      }
    },

    month: {
      cast: function (date) {
        date = new Date(date.setHours(0, 0, 0, 0));
        date = new Date(date.setDate(1));
        return date;
      },
      next: function (prevDate) {
        return new Date(prevDate.setMonth(prevDate.getMonth() + 1));
      }
    },

    quarter: {
      cast: function (date) {
        date = new Date(date.setHours(0, 0, 0, 0));
        date = new Date(date.setDate(1));
        var currentMonth = date.getMonth();
        var firstQuarterMonth = currentMonth - (currentMonth % 3);
        return new Date(date.setMonth(firstQuarterMonth));
      },
      next: function (prevDate) {
        return new Date(prevDate.setMonth(prevDate.getMonth() + 3));
      }
    },

    year: {
      cast: function (date) {
        date = new Date(date.setHours(0, 0, 0, 0));
        date = new Date(date.setDate(1));
        date = new Date(date.setMonth(0));
        return date;
      },
      next: function (prevDate) {
        return new Date(prevDate.setFullYear(prevDate.getFullYear() + 1));
      }
    }
  };

  var UnitDomainPeriodGenerator = {
    add: function (periodAlias, obj) {
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
define('unit-domain-mixin',["exports", "./unit-domain-period-generator", "./utils/utils", "underscore", "d3"], function (exports, _unitDomainPeriodGenerator, _utilsUtils, _underscore, _d3) {
  

  var _classProps = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;
  var utils = _utilsUtils.utils;
  var _ = _underscore;
  var d3 = _d3;
  /* jshint ignore:end */

  var autoScaleMethods = {
    ordinal: function (inputValues, props) {
      return inputValues;
    },

    linear: function (inputValues, props) {
      var domainParam = (props.autoScale) ? utils.autoScale(inputValues) : d3.extent(inputValues);

      var min = _.isNumber(props.min) ? props.min : domainParam[0];
      var max = _.isNumber(props.max) ? props.max : domainParam[1];

      return [Math.min(min, domainParam[0]), Math.max(max, domainParam[1])];
    },

    period: function (inputValues, props) {
      var domainParam = d3.extent(inputValues);
      var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
      var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

      var range = [new Date(Math.min(min, domainParam[0])), new Date(Math.max(max, domainParam[1]))];

      return UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);
    },

    time: function (inputValues, props) {
      var domainParam = d3.extent(inputValues);
      var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
      var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

      return [new Date(Math.min(min, domainParam[0])), new Date(Math.max(max, domainParam[1]))];
    }
  };

  var rangeMethods = {
    ordinal: function (inputValues, interval) {
      return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    linear: function (inputValues, interval) {
      return d3.scale.linear().domain(inputValues).rangeRound(interval, 1);
    },

    period: function (inputValues, interval) {
      return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
    },

    time: function (inputValues, interval) {
      return d3.time.scale().domain(inputValues).range(interval);
    }
  };

  var UnitDomainMixin = (function () {
    var UnitDomainMixin = function UnitDomainMixin(meta, data) {
      var getPropMapper = function (prop) {
        return (function (propObj) {
          var xObject = (propObj || {});
          return xObject.hasOwnProperty(prop) ? xObject[prop] : null;
        });
      };

      var getValueMapper = function (dim) {
        var d = meta[dim] || {};
        var f = d.value ? getPropMapper(d.value) : (function (x) {
          return x;
        });

        var isTime = _.contains(["period", "time"], d.scale);

        return isTime ? _.compose((function (v) {
          return (new Date(v)).getTime();
        }), f) : f;
      };

      var getOrder = function (dim) {
        var d = meta[dim] || {};
        return d.order || null;
      };

      var getDomainSortStrategy = function (type) {
        var map = {
          category: function (dim, fnMapperId, domain) {
            return domain;
          },

          order: function (dim, fnMapperId, domain) {
            var metaOrder = getOrder(dim);
            return (metaOrder) ? _.union(metaOrder, domain) : // arguments order is important
            _.sortBy(domain, fnMapperId);
          },

          measure: function (dim, fnMapperId, domain) {
            return _.sortBy(domain, fnMapperId);
          },

          "as-is": (function (dim, fnMapperId, domain) {
            return domain;
          })
        };

        return map[type] || map["as-is"];
      };

      var getScaleSortStrategy = function (type) {
        var map = {
          category: getDomainSortStrategy("category"),

          order: function (dim, fnMapperId, domain) {
            var metaOrder = getOrder(dim);
            return (metaOrder) ? _.union(domain, metaOrder) : // arguments order is important
            domain;
          },

          measure: getDomainSortStrategy("measure"),

          "as-is": getDomainSortStrategy("as-is")
        };

        return map[type] || map["as-is"];
      };

      this.fnDimension = function (dimensionName, subUnit) {
        var unit = (subUnit || {}).dimensions || {};
        var xRoot = meta[dimensionName] || {};
        var xNode = unit[dimensionName] || {};
        return {
          scaleDim: dimensionName,
          scaleType: xNode.scale || xRoot.scale,
          dimType: xNode.type || xRoot.type
        };
      };

      this.fnSource = function (whereFilter) {
        var predicates = _.map(whereFilter, function (v, k) {
          return function (row) {
            return getValueMapper(k)(row[k]) === v;
          };
        });
        return _(data).filter(function (row) {
          return _.every(predicates, (function (p) {
            return p(row);
          }));
        });
      };

      var _domain = function (dim, fnSort) {
        if (!meta[dim]) {
          return [null];
        }

        var fnMapperId = getValueMapper(dim);
        var uniqValues = _(data).chain().pluck(dim).uniq(fnMapperId).value();

        return fnSort(dim, fnMapperId, uniqValues);
      };

      this.fnDomain = function (dim) {
        var fnMapperId = getValueMapper(dim);
        var type = (meta[dim] || {}).type;
        var domainSortedAsc = _domain(dim, getDomainSortStrategy(type));
        return domainSortedAsc.map(fnMapperId);
      };

      var _scaleMeta = function (scaleDim, options) {
        var opts = options || {};
        var dimx = _.defaults({}, meta[scaleDim]);

        var fValHub = {
          "order:period": function (xOptions) {
            return (function (x) {
              return UnitDomainPeriodGenerator.get(xOptions.period).cast(new Date(x));
            });
          },

          "*": function (opts) {
            return (function (x) {
              return x;
            });
          }
        };

        var fMap = opts.map ? getPropMapper(opts.map) : getValueMapper(scaleDim);
        var fKey = [dimx.type, dimx.scale].join(":");
        var fVal = (fValHub[fKey] || fValHub["*"])(opts);

        var originalValues = _domain(scaleDim, getScaleSortStrategy(dimx.type)).map(fMap);
        var autoScaledVals = dimx.scale ? autoScaleMethods[dimx.scale](originalValues, opts) : [];

        return {
          extract: function (x) {
            return fVal(fMap(x));
          },
          values: autoScaledVals,
          source: originalValues
        };
      };

      this.fnScaleMeta = _scaleMeta;

      this.fnScaleTo = function (scaleDim, interval, options) {
        var opts = options || {};
        var dimx = _.defaults({}, meta[scaleDim]);

        var info = _scaleMeta(scaleDim, options);

        var func = rangeMethods[dimx.scale](info.values, interval, opts);

        var wrap = function (domainPropObject) {
          return func(info.extract(domainPropObject));
        };
        // have to copy properties since d3 produce Function with methods
        Object.keys(func).forEach(function (p) {
          return (wrap[p] = func[p]);
        });
        return wrap;
      };
    };

    _classProps(UnitDomainMixin, null, {
      mix: {
        writable: true,
        value: function (unit) {
          unit.dimension = this.fnDimension;
          unit.source = this.fnSource;
          unit.domain = this.fnDomain;
          unit.scaleMeta = this.fnScaleMeta;
          unit.scaleTo = this.fnScaleTo;
          unit.partition = (function () {
            return unit.data || unit.source(unit.$where);
          });
          return unit;
        }
      }
    });

    return UnitDomainMixin;
  })();

  exports.UnitDomainMixin = UnitDomainMixin;
});
define('units-registry',["exports"], function (exports) {
  

  var UnitsMap = {};

  var UnitsRegistry = {
    add: function (unitType, xUnit) {
      var unit = {};
      unit.draw = (typeof xUnit === "function") ? xUnit : xUnit.draw;
      unit.walk = xUnit.walk || (function (x) {
        return x;
      });
      UnitsMap[unitType] = unit;
      return this;
    },

    get: function (unitType) {
      if (!UnitsMap.hasOwnProperty(unitType)) {
        throw new Error("Unknown unit type: " + unitType);
      }

      return UnitsMap[unitType];
    }
  };

  exports.UnitsRegistry = UnitsRegistry;
});
define('data-processor',["exports", "./utils/utils"], function (exports, _utilsUtils) {
  

  var utils = _utilsUtils.utils;


  var DataProcessor = {
    isYFunctionOfX: function (data, xFields, yFields) {
      var isRelationAFunction = true;
      var error = null;
      // domain should has only 1 value from range
      try {
        data.reduce(function (memo, item) {
          var fnVar = function (hash, f) {
            hash.push(item[f]);
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

    excludeNullValues: function (dimensions, srcData) {
      var fields = [];
      Object.keys(dimensions).forEach(function (k) {
        var d = dimensions[k];
        if ((!d.hasOwnProperty("hasNull") || d.hasNull) && ((d.type === "measure") || (d.scale === "period"))) {
          // rule: exclude null values of "measure" type or "period" scale
          fields.push(k);
        }
      });

      var r;
      if (fields.length === 0) {
        r = srcData;
      } else {
        r = srcData.filter(function (row) {
          return !fields.some(function (f) {
            return (!row.hasOwnProperty(f) || (row[f] === null));
          });
        });
      }

      return r;
    },

    autoAssignScales: function (dimensions) {
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

    autoDetectDimTypes: function (data) {
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

            var isInContraToPrev = (memo[key].type !== null && memo[key].type !== detectedType);
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
define('charts/tau.plot',["exports", "../dsl-reader", "../api/balloon", "../event", "../spec-engine-factory", "../layout-engine-factory", "../plugins", "../utils/utils", "../utils/utils-dom", "../const", "../unit-domain-mixin", "../units-registry", "../data-processor"], function (exports, _dslReader, _apiBalloon, _event, _specEngineFactory, _layoutEngineFactory, _plugins, _utilsUtils, _utilsUtilsDom, _const, _unitDomainMixin, _unitsRegistry, _dataProcessor) {
  

  var _classProps = function (child, staticProps, instanceProps) {
    if (staticProps) Object.defineProperties(child, staticProps);
    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
  };

  var _extends = function (child, parent) {
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    child.__proto__ = parent;
  };

  var DSLReader = _dslReader.DSLReader;
  var Tooltip = _apiBalloon.Tooltip;
  var Emitter = _event.Emitter;
  var SpecEngineFactory = _specEngineFactory.SpecEngineFactory;
  var LayoutEngineFactory = _layoutEngineFactory.LayoutEngineFactory;
  var Plugins = _plugins.Plugins;
  var propagateDatumEvents = _plugins.propagateDatumEvents;
  var utils = _utilsUtils.utils;
  var utilsDom = _utilsUtilsDom.utilsDom;
  var CSS_PREFIX = _const.CSS_PREFIX;
  var UnitDomainMixin = _unitDomainMixin.UnitDomainMixin;
  var UnitsRegistry = _unitsRegistry.UnitsRegistry;
  var DataProcessor = _dataProcessor.DataProcessor;
  var Plot = (function (Emitter) {
    var Plot = function Plot(config) {
      Emitter.call(this);
      this.setupConfig(config);
      //plugins
      this._plugins = new Plugins(this.config.plugins, this);
      this._emptyContainer = config.emptyContainer || "";
    };

    _extends(Plot, Emitter);

    _classProps(Plot, null, {
      setupConfig: {
        writable: true,
        value: function (config) {
          this.config = _.defaults(config, {
            spec: {},
            data: [],
            plugins: [],
            settings: {}
          });

          // TODO: remove this particular config cases
          this.config.settings.specEngine = this.config.specEngine || this.config.settings.specEngine;
          this.config.settings.layoutEngine = this.config.layoutEngine || this.config.settings.layoutEngine;

          this.config.settings = this.setupSettings(this.config.settings);
          this.config.spec.dimensions = this.setupMetaInfo(this.config.spec.dimensions, this.config.data);

          this.config.data = this.config.settings.excludeNull ? DataProcessor.excludeNullValues(this.config.spec.dimensions, this.config.data) : this.config.data;
        }
      },
      setupMetaInfo: {
        writable: true,
        value: function (dims, data) {
          var meta = (dims) ? dims : DataProcessor.autoDetectDimTypes(data);
          return DataProcessor.autoAssignScales(meta);
        }
      },
      setupSettings: {
        writable: true,
        value: function (configSettings) {
          var globalSettings = Plot.globalSettings;
          var localSettings = {};
          Object.keys(globalSettings).forEach(function (k) {
            localSettings[k] = (_.isFunction(globalSettings[k])) ? globalSettings[k] : utils.clone(globalSettings[k]);
          });

          return _.defaults(configSettings || {}, localSettings);
        }
      },
      addBalloon: {
        writable: true,
        /* addLine (conf) {
             var unitContainer = this._spec.unit.unit;
              while(true) {
                 if(unitContainer[0].unit) {
                     unitContainer = unitContainer[0].unit;
                 } else {
                     break;
                 }
             }
             unitContainer.push(conf);
         }*/
        value: function (conf) {
          return new Tooltip("", conf || {});
        }
      },
      renderTo: {
        writable: true,
        value: function (target, xSize) {
          // this.addLine({type:'ELEMENT.LINE', isGuide:true});
          var container = d3.select(target);
          var containerNode = container[0][0];
          this.target = target;
          this.targetSizes = xSize;
          if (containerNode === null) {
            throw new Error("Target element not found");
          }

          //todo don't compute width if width or height were passed
          var size = _.defaults(xSize || {}, utilsDom.getContainerSize(containerNode));

          if (this.config.data.length === 0) {
            containerNode.innerHTML = this._emptyContainer;
            return;
          }
          containerNode.innerHTML = "";


          var domainMixin = new UnitDomainMixin(this.config.spec.dimensions, this.config.data);

          var specEngine = SpecEngineFactory.get(this.config.settings.specEngine, this.config.settings);

          var fullSpec = specEngine(this.config.spec, domainMixin.mix({}));

          var traverseFromDeep = function (root) {
            var r;

            if (!root.unit) {
              r = { w: 0, h: 0 };
            } else {
              var s = traverseFromDeep(root.unit[0]);
              var g = root.guide;
              var xmd = g.x.$minimalDomain || 1;
              var ymd = g.y.$minimalDomain || 1;
              var maxW = Math.max((xmd * g.x.density), (xmd * s.w));
              var maxH = Math.max((ymd * g.y.density), (ymd * s.h));

              r = {
                w: maxW + g.padding.l + g.padding.r,
                h: maxH + g.padding.t + g.padding.b
              };
            }

            return r;
          };

          var optimalSize = traverseFromDeep(fullSpec.unit);
          var recommendedWidth = optimalSize.w;
          var recommendedHeight = optimalSize.h;

          var scrollSize = utilsDom.getScrollbarWidth();

          var deltaW = (size.width - recommendedWidth);
          var deltaH = (size.height - recommendedHeight);

          var screenW = (deltaW >= 0) ? size.width : recommendedWidth;
          var scrollW = (deltaH >= 0) ? 0 : scrollSize;

          var screenH = (deltaH >= 0) ? size.height : recommendedHeight;
          var scrollH = (deltaW >= 0) ? 0 : scrollSize;

          size.height = screenH - scrollH;
          size.width = screenW - scrollW;


          // optimize full spec depending on size
          var localSettings = this.config.settings;
          var traverseToDeep = function (root, size) {
            var mdx = root.guide.x.$minimalDomain || 1;
            var mdy = root.guide.y.$minimalDomain || 1;

            var perTickX = size.width / mdx;
            var perTickY = size.height / mdy;

            var densityKoeff = localSettings.xMinimumDensityKoeff;
            if (root.guide.x.hide !== true && root.guide.x.rotate !== 0 && (perTickX > (densityKoeff * root.guide.x.$maxTickTextW))) {
              root.guide.x.rotate = 0;
              root.guide.x.textAnchor = "middle";
              root.guide.x.tickFormatWordWrapLimit = perTickX;
              var s = Math.min(localSettings.xAxisTickLabelLimit, root.guide.x.$maxTickTextW);

              var xDelta = 0 - s + root.guide.x.$maxTickTextH;

              root.guide.x.label.padding = (root.guide.x.label.padding > 0) ? root.guide.x.label.padding + xDelta : root.guide.x.label.padding;
              root.guide.padding.b = (root.guide.padding.b > 0) ? root.guide.padding.b + xDelta : root.guide.padding.b;
            }

            var newSize = {
              width: perTickX,
              height: perTickY
            };

            if (root.unit) {
              traverseToDeep(root.unit[0], newSize);
            }
          };

          traverseToDeep(fullSpec.unit, size);


          var reader = new DSLReader(domainMixin, UnitsRegistry);

          var logicXGraph = reader.buildGraph(fullSpec);
          var layoutGraph = LayoutEngineFactory.get(this.config.settings.layoutEngine)(logicXGraph);
          var renderGraph = reader.calcLayout(layoutGraph, size);
          var svgXElement = reader.renderGraph(renderGraph, container.append("svg").attr("class", CSS_PREFIX + "svg").attr("width", size.width).attr("height", size.height), this);
          svgXElement.selectAll(".i-role-datum").call(propagateDatumEvents(this));
          this.fire("render", svgXElement.node());
        }
      },
      getData: {
        writable: true,
        value: function () {
          return this.config.data;
        }
      },
      setData: {
        writable: true,
        value: function (data) {
          this.config.data = data;
          this.renderTo(this.target, this.targetSizes);
        }
      }
    });

    return Plot;
  })(Emitter);

  exports.Plot = Plot;
});
define('charts/tau.chart',["exports", "./tau.plot", "../utils/utils", "../data-processor"], function (exports, _tauPlot, _utilsUtils, _dataProcessor) {
  

  var _extends = function (child, parent) {
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    child.__proto__ = parent;
  };

  var Plot = _tauPlot.Plot;
  var utils = _utilsUtils.utils;
  var DataProcessor = _dataProcessor.DataProcessor;


  var convertAxis = function (data) {
    return (!data) ? null : data;
  };

  var normalizeSettings = function (axis) {
    return (!utils.isArray(axis)) ? [axis] : axis;
  };

  var createElement = function (type, config) {
    return {
      type: type,
      x: config.x,
      y: config.y,
      color: config.color,
      guide: {
        color: config.colorGuide
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
  var strategyNormalizeAxis = (function (_strategyNormalizeAxis) {
    _strategyNormalizeAxis[status.SUCCESS] = function (axis) {
      return axis;
    };
    _strategyNormalizeAxis[status.FAIL] = function () {
      throw new Error("This configuration is not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart");
    };
    _strategyNormalizeAxis[status.WARNING] = function (axis, config) {
      var measure = axis[config.indexMeasureAxis[0]];
      var newAxis = _.without(axis, measure);
      newAxis.push(measure);
      return newAxis;
    };
    return _strategyNormalizeAxis;
  })({});
  /* jshint ignore:end */
  function validateAxis(dimensions, axis) {
    return axis.reduce(function (result, item, index) {
      if (dimensions[item].type === "measure") {
        result.countMeasureAxis++;
        result.indexMeasureAxis.push(index);
      }
      if (dimensions[item].type !== "measure" && result.countMeasureAxis === 1) {
        result.status = status.WARNING;
      } else if (result.countMeasureAxis > 1) {
        result.status = status.FAIL;
      }
      return result;
    }, { status: status.SUCCESS, countMeasureAxis: 0, indexMeasureAxis: [] });
  }
  function transformConfig(type, config) {
    var x = normalizeSettings(config.x);
    var y = normalizeSettings(config.y);

    var validatedX = validateAxis(config.dimensions, x);
    var validatedY = validateAxis(config.dimensions, y);
    x = strategyNormalizeAxis[validatedX.status](x, validatedX);
    y = strategyNormalizeAxis[validatedY.status](y, validatedY);
    var guide = normalizeSettings(config.guide);
    var maxDeep = Math.max(x.length, y.length);

    // feel the gaps if needed
    while (guide.length < maxDeep) {
      guide.push({});
    }

    // cut items
    guide = guide.slice(0, maxDeep);

    var spec = {
      type: "COORDS.RECT",
      unit: []
    };
    var elementGuide = guide[guide.length - 1];
    var colorGuide = elementGuide && elementGuide.color || {};
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
          colorGuide: colorGuide
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

      if (!config.sortedBy) {
        var xs = _.isArray(config.x) ? config.x : [config.x];
        var ys = _.isArray(config.y) ? config.y : [config.y];
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
          log("All attempts are failed. Will use " + primaryX + " property as a sorting key by default.");
          log("It is better to use [scatterplot] here.");
          propSortBy = primaryX;
        }

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

  var Chart = (function (Plot) {
    var Chart = function Chart(config) {
      config.settings = this.setupSettings(config.settings);
      config.dimensions = this.setupMetaInfo(config.dimensions, config.data);
      Plot.call(this, typesChart[config.type](config));
    };

    _extends(Chart, Plot);

    return Chart;
  })(Plot);

  exports.Chart = Chart;
});
define('elements/coords',["exports", "../utils/utils-draw", "../const", "../utils/utils", "../matrix"], function (exports, _utilsUtilsDraw, _const, _utilsUtils, _matrix) {
  

  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var CSS_PREFIX = _const.CSS_PREFIX;
  var utils = _utilsUtils.utils;
  var TMatrix = _matrix.TMatrix;


  var FacetAlgebra = {
    CROSS: function (root, dimX, dimY) {
      var domainX = root.domain(dimX);
      var domainY = root.domain(dimY).reverse();

      return _(domainY).map(function (rowVal) {
        return _(domainX).map(function (colVal) {
          var r = {};

          if (dimX) {
            r[dimX] = colVal;
          }

          if (dimY) {
            r[dimY] = rowVal;
          }

          return r;
        });
      });
    }
  };

  var TFuncMap = function (opName) {
    return FacetAlgebra[opName] || (function () {
      return [[{}]];
    });
  };

  var inheritRootProps = function (unit, root, props) {
    var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
    r.guide = _.extend(utils.clone(root.guide), r.guide);
    return r;
  };

  var coords = {
    walk: function (unit, continueTraverse) {
      var root = _.defaults(unit, { $where: {} });

      var isFacet = _.any(root.unit, function (n) {
        return (n.type.indexOf("COORDS.") === 0);
      });
      var unitFunc = TFuncMap(isFacet ? "CROSS" : "");

      var matrixOfPrFilters = new TMatrix(unitFunc(root, root.x, root.y));
      var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

      matrixOfPrFilters.iterate(function (row, col, $whereRC) {
        var cellWhere = _.extend({}, root.$where, $whereRC);
        var cellNodes = _(root.unit).map(function (sUnit) {
          return _.extend(inheritRootProps(sUnit, root, ["x", "y"]), { $where: cellWhere });
        });
        matrixOfUnitNodes.setRC(row, col, cellNodes);
      });

      root.$matrix = matrixOfUnitNodes;

      matrixOfUnitNodes.iterate(function (r, c, cellNodes) {
        _.each(cellNodes, function (refSubNode) {
          return continueTraverse(refSubNode);
        });
      });

      return root;
    },

    draw: function (node, continueTraverse) {
      var options = node.options;
      var padding = node.guide.padding;

      node.x.guide = node.guide.x;
      node.y.guide = node.guide.y;

      var L = options.left + padding.l;
      var T = options.top + padding.t;

      var W = options.width - (padding.l + padding.r);
      var H = options.height - (padding.t + padding.b);

      var tickX = {
        map: node.x.guide.tickLabel,
        min: node.x.guide.tickMin,
        max: node.x.guide.tickMax,
        period: node.x.guide.tickPeriod,
        autoScale: node.x.guide.autoScale
      };
      node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

      var tickY = {
        map: node.y.guide.tickLabel,
        min: node.y.guide.tickMin,
        max: node.y.guide.tickMax,
        period: node.y.guide.tickPeriod,
        autoScale: node.y.guide.autoScale
      };
      node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

      node.x.guide.size = W;
      node.y.guide.size = H;

      var X_AXIS_POS = [0, H + node.guide.x.padding];
      var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

      var container = options.container.append("g").attr("class", CSS_PREFIX + "cell " + "cell").attr("transform", utilsDraw.translate(L, T)).datum({ $where: node.$where });

      if (!node.x.guide.hide) {
        utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
      }

      if (!node.y.guide.hide) {
        utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
      }

      var grid = utilsDraw.fnDrawGrid.call(container, node, H, W);

      node.$matrix.iterate(function (iRow, iCol, subNodes) {
        subNodes.forEach(function (node) {
          node.options = _.extend({ container: grid }, node.options);
          continueTraverse(node);
        });
      });
    }
  };
  exports.coords = coords;
});
define('elements/size',["exports"], function (exports) {
  

  var sizeScale = function (values, maxSize) {
    values = _.filter(values, _.isFinite);

    var domain = [Math.min.apply(null, values), Math.max.apply(null, values)];
    var domainWidth = domain[0] === 0 ? domain[1] : Math.max(1, domain[1] / domain[0]);

    var range = [Math.max(1, maxSize / (Math.log(domainWidth) + 1)), maxSize];

    return d3.scale.linear().range(range).domain(domain);
  };

  exports.sizeScale = sizeScale;
});
define('elements/point',["exports", "../utils/utils-draw", "../const", "./size"], function (exports, _utilsUtilsDraw, _const, _size) {
  

  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var CSS_PREFIX = _const.CSS_PREFIX;
  var sizeScale = _size.sizeScale;
  var point = function (node) {
    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;

    var color = utilsDraw.generateColor(node);

    var maxAxisSize = _.max([node.guide.x.tickFontHeight, node.guide.y.tickFontHeight].filter(function (x) {
      return x !== 0;
    })) / 2;
    var size = sizeScale(node.domain(node.size.scaleDim), maxAxisSize);

    var update = function () {
      return this.attr("r", function (d) {
        var s = size(d[node.size.scaleDim]);
        return (!_.isFinite(s)) ? maxAxisSize : s;
      }).attr("class", function (d) {
        return CSS_PREFIX + "dot" + " dot i-role-datum " + color.get(d[color.dimension]);
      }).attr("cx", function (d) {
        return xScale(d[node.x.scaleDim]);
      }).attr("cy", function (d) {
        return yScale(d[node.y.scaleDim]);
      });
    };

    var elements = options.container.selectAll(".dot").data(node.partition());
    elements.call(update);
    elements.exit().remove();
    elements.enter().append("circle").call(update);
  };

  exports.point = point;
});
define('utils/css-class-map',["exports", "../const"], function (exports, _const) {
  

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
define('elements/line',["exports", "../utils/utils-draw", "./point", "../const", "../utils/css-class-map"], function (exports, _utilsUtilsDraw, _point, _const, _utilsCssClassMap) {
  

  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var point = _point.point;
  var CSS_PREFIX = _const.CSS_PREFIX;
  var getLineClassesByWidth = _utilsCssClassMap.getLineClassesByWidth;
  var getLineClassesByCount = _utilsCssClassMap.getLineClassesByCount;
  var line = function (node) {
    var options = node.options;

    var xScale = options.xScale;
    var yScale = options.yScale;
    node.size = {};
    var color = utilsDraw.generateColor(node);
    options.color = color;
    var categories = d3.nest().key(function (d) {
      return d[color.dimension];
    }).entries(node.partition());
    var widthClass = getLineClassesByWidth(options.width);
    var countClass = getLineClassesByCount(categories.length);
    var updateLines = function (d) {
      this.attr("class", function (d) {
        return [CSS_PREFIX + "line i-role-datum ", "line", color.get(d.key), widthClass, countClass].join(" ");
      });
      var paths = this.selectAll("path").data(function (d) {
        return [d.values];
      });
      paths.call(updatePaths);
      paths.enter().append("path").call(updatePaths);
      paths.exit().remove();
    };
    var drawPointsIfNeed = function (categories) {
      var data = categories.reduce(function (data, item) {
        var values = item.values;
        if (values.length === 1) {
          data.push(values[0]);
        }
        return data;
      }, []);
      var update = function () {
        return this.attr("r", 1.5).attr("class", function (d) {
          return CSS_PREFIX + "dot-line dot-line i-role-datum " + CSS_PREFIX + "dot " + "i-role-datum " + color.get(d[color.dimension]);
        }).attr("cx", function (d) {
          return xScale(d[node.x.scaleDim]);
        }).attr("cy", function (d) {
          return yScale(d[node.y.scaleDim]);
        });
      };

      var elements = options.container.selectAll(".dot-line").data(data);
      elements.call(update);
      elements.exit().remove();
      elements.enter().append("circle").call(update);
    };

    var line;
    /*if(node.isGuide) {
        var  i = 0;
        line = d3
            .svg
            .line()
            .x((d) => {
                if(i) {
                    return xScale.rangeExtent()[1];
                } else {
                    i++;
                    return 0;
                }
            })
            .y((d) => yScale(45));
    } else {*/
    line = d3.svg.line().x(function (d) {
      return xScale(d[node.x.scaleDim]);
    }).y(function (d) {
      return yScale(d[node.y.scaleDim]);
    });
    /*}*/


    var updatePaths = function () {
      this.attr("d", line);
    };
    drawPointsIfNeed(categories);
    var lines = options.container.selectAll(".line").data(categories);
    lines.call(updateLines);
    lines.enter().append("g").call(updateLines);
    lines.exit().remove();
  };
  exports.line = line;
});
define('elements/interval',["exports", "../utils/utils-draw", "../const"], function (exports, _utilsUtilsDraw, _const) {
  

  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var CSS_PREFIX = _const.CSS_PREFIX;
  var BAR_GROUP = "i-role-bar-group";
  var isMeasure = function (dim) {
    return dim.dimType === "measure";
  };

  var getSizesParams = function (params) {
    var tickWidth, intervalWidth, offsetCategory;
    if (isMeasure(params.dim)) {
      tickWidth = 5;
      intervalWidth = 5;
      offsetCategory = 0;
    } else {
      tickWidth = params.size / (params.domain().length);
      intervalWidth = tickWidth / (params.categories.length + 1);
      offsetCategory = intervalWidth;
    }

    /* jshint ignore:start */
    return {
      tickWidth: tickWidth,
      intervalWidth: intervalWidth,
      offsetCategory: offsetCategory
    };
    /* jshint ignore:end */
  };

  var interval = function (node) {
    var options = node.options;

    var color = utilsDraw.generateColor(node);

    var partition = node.partition();

    var categories = d3.nest().key(function (d) {
      return d[color.dimension];
    }).entries(partition);

    var xScale = options.xScale, yScale = options.yScale, calculateX, calculateY, calculateWidth, calculateHeight, calculateTranslate;

    if (node.flip) {
      var xMin;
      var _ref;
      var tickWidth;
      var intervalWidth;
      var offsetCategory;
      (function () {
        xMin = Math.min.apply(null, xScale.domain());
        var startPoint = (xMin <= 0) ? 0 : xMin;

        _ref = getSizesParams({
          domain: yScale.domain,
          dim: node.y,
          categories: categories,
          size: options.height
        });
        tickWidth = _ref.tickWidth;
        intervalWidth = _ref.intervalWidth;
        offsetCategory = _ref.offsetCategory;
        /* jshint ignore:end */
        calculateX = isMeasure(node.x) ? function (d) {
          return xScale(Math.min(startPoint, d[node.x.scaleDim]));
        } : 0;
        calculateY = function (d) {
          return yScale(d[node.y.scaleDim]) - (tickWidth / 2);
        };
        calculateWidth = isMeasure(node.x) ? function (d) {
          return Math.abs(xScale(d[node.x.scaleDim]) - xScale(startPoint));
        } : function (d) {
          return xScale(d[node.x.scaleDim]);
        };
        calculateHeight = function (d) {
          return intervalWidth;
        };
        calculateTranslate = function (d, index) {
          return utilsDraw.translate(0, index * offsetCategory + offsetCategory / 2);
        };
      })();
    } else {
      var yMin;
      var _ref2;
      var tickWidth;
      var intervalWidth;
      var offsetCategory;
      (function () {
        yMin = Math.min.apply(null, yScale.domain());
        var startPoint = (yMin <= 0) ? 0 : yMin;

        _ref2 = getSizesParams({
          domain: xScale.domain,
          dim: node.x,
          categories: categories,
          size: options.width
        });
        tickWidth = _ref2.tickWidth;
        intervalWidth = _ref2.intervalWidth;
        offsetCategory = _ref2.offsetCategory;
        /* jshint ignore:end */
        calculateX = function (d) {
          return xScale(d[node.x.scaleDim]) - (tickWidth / 2);
        };
        calculateY = isMeasure(node.y) ? function (d) {
          return yScale(Math.max(startPoint, d[node.y.scaleDim]));
        } : function (d) {
          return yScale(d[node.y.scaleDim]);
        };

        calculateWidth = function (d) {
          return intervalWidth;
        };
        calculateHeight = isMeasure(node.y) ? function (d) {
          return Math.abs(yScale(d[node.y.scaleDim]) - yScale(startPoint));
        } : function (d) {
          return (options.height - yScale(d[node.y.scaleDim]));
        };
        calculateTranslate = function (d, index) {
          return utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0);
        };
      })();
    }

    var updateBar = function () {
      return this.attr("class", function (d) {
        return ("i-role-datum bar " + CSS_PREFIX + "bar " + color.get(d[color.dimension]));
      }).attr("x", calculateX).attr("y", calculateY).attr("width", calculateWidth).attr("height", calculateHeight);
    };

    var updateBarContainer = function () {
      this.attr("class", BAR_GROUP).attr("transform", calculateTranslate);
      var bars = this.selectAll("bar").data(function (d) {
        return d.values;
      });
      bars.call(updateBar);
      bars.enter().append("rect").call(updateBar);
      bars.exit().remove();
    };

    var elements = options.container.selectAll("." + BAR_GROUP).data(categories);
    elements.call(updateBarContainer);
    elements.enter().append("g").call(updateBarContainer);
    elements.exit().remove();
  };

  exports.interval = interval;
});
define('elements/coords-parallel',["exports", "../utils/utils-draw", "../const", "../utils/utils", "../matrix"], function (exports, _utilsUtilsDraw, _const, _utilsUtils, _matrix) {
  

  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var CSS_PREFIX = _const.CSS_PREFIX;
  var utils = _utilsUtils.utils;
  var TMatrix = _matrix.TMatrix;


  var inheritRootProps = function (unit, root, props) {
    var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
    r.guide = _.extend(utils.clone(root.guide || {}), (r.guide || {}));
    return r;
  };

  var CoordsParallel = {
    walk: function (unit, continueTraverse) {
      var root = _.defaults(unit, { $where: {} });

      var matrixOfPrFilters = new TMatrix(1, 1);
      var matrixOfUnitNodes = new TMatrix(1, 1);

      matrixOfPrFilters.iterate(function (row, col) {
        var cellWhere = _.extend({}, root.$where);
        var cellNodes = _(root.unit).map(function (sUnit) {
          return _.extend(inheritRootProps(sUnit, root, ["x"]), { $where: cellWhere });
        });
        matrixOfUnitNodes.setRC(row, col, cellNodes);
      });

      root.$matrix = matrixOfUnitNodes;

      matrixOfUnitNodes.iterate(function (r, c, cellNodes) {
        _.each(cellNodes, function (refSubNode) {
          return continueTraverse(refSubNode);
        });
      });

      return root;
    },

    draw: function (node, continueTraverse) {
      var options = node.options;
      var padding = node.guide.padding;

      var L = options.left + padding.l;
      var T = options.top + padding.t;

      var W = options.width - (padding.l + padding.r);
      var H = options.height - (padding.t + padding.b);

      var scaleObjArr = node.x.map(function (xN) {
        return node.scaleTo(xN, [H, 0], {});
      });

      var container = options.container.append("g").attr("class", "graphical-report__" + "cell " + "cell").attr("transform", utilsDraw.translate(L, T));


      var translate = function (left, top) {
        return "translate(" + left + "," + top + ")";
      };
      var rotate = function (angle) {
        return "rotate(" + angle + ")";
      };


      var fnDrawDimAxis = function (xScaleObj, AXIS_POSITION) {
        var container = this;

        var axisScale = d3.svg.axis().scale(xScaleObj).orient("left");

        var nodeScale = container.append("g").attr("class", "y axis").attr("transform", translate.apply(null, AXIS_POSITION)).call(axisScale);

        nodeScale.selectAll(".tick text").attr("transform", rotate(0)).style("text-anchor", "end");
      };

      var offset = W / (node.x.length - 1);
      scaleObjArr.forEach(function (scale, i) {
        fnDrawDimAxis.call(container, scale, [i * offset, 0]);
      });

      var grid = container.append("g").attr("class", "grid").attr("transform", translate(0, 0));

      node.$matrix.iterate(function (iRow, iCol, subNodes) {
        subNodes.forEach(function (node) {
          node.options = _.extend({ container: grid }, node.options);
          continueTraverse(node);
        });
      });
    }
  };
  exports.CoordsParallel = CoordsParallel;
});
define('elements/coords-parallel-line',["exports", "../utils/utils-draw", "../const"], function (exports, _utilsUtilsDraw, _const) {
  

  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var CSS_PREFIX = _const.CSS_PREFIX;


  var CoordsParallelLine = {
    draw: function (node) {
      node.color = node.dimension(node.color, node);

      var options = node.options;

      var scalesMap = node.x.reduce(function (memo, xN) {
        memo[xN] = node.scaleTo(xN, [options.height, 0], {});
        return memo;
      }, {});

      var color = utilsDraw.generateColor(node);

      var categories = d3.nest().key(function (d) {
        return d[color.dimension];
      }).entries(node.partition()).map(function (src) {
        var row = src.values[0];
        var memo = [];
        node.x.forEach(function (propName) {
          memo.push({ key: propName, val: row[propName] });
        });
        return memo;
      });

      var updateLines = function () {
        this.attr("class", function (d) {
          return "graphical-report__" + "line" + " line " + "color10-9";
        });
        var paths = this.selectAll("path").data(function (d) {
          return [d];
        });
        paths.call(updatePaths);
        paths.enter().append("path").call(updatePaths);
        paths.exit().remove();
      };

      var segment = options.width / (node.x.length - 1);
      var segmentMap = {};
      node.x.forEach(function (propName, i) {
        segmentMap[propName] = (i * segment);
      });

      var fnLine = d3.svg.line().x(function (d) {
        return segmentMap[d.key];
      }).y(function (d) {
        return scalesMap[d.key](d.val);
      });

      var updatePaths = function () {
        this.attr("d", fnLine);
      };

      var lines = options.container.selectAll(".line").data(categories);
      lines.call(updateLines);
      lines.enter().append("g").call(updateLines);
      lines.exit().remove();
    }
  };

  exports.CoordsParallelLine = CoordsParallelLine;
});
define('node-map',["exports", "./elements/coords", "./elements/line", "./elements/point", "./elements/interval", "./utils/utils-draw", "./elements/coords-parallel", "./elements/coords-parallel-line"], function (exports, _elementsCoords, _elementsLine, _elementsPoint, _elementsInterval, _utilsUtilsDraw, _elementsCoordsParallel, _elementsCoordsParallelLine) {
  

  var coords = _elementsCoords.coords;
  var line = _elementsLine.line;
  var point = _elementsPoint.point;
  var interval = _elementsInterval.interval;
  var utilsDraw = _utilsUtilsDraw.utilsDraw;
  var CoordsParallel = _elementsCoordsParallel.CoordsParallel;
  var CoordsParallelLine = _elementsCoordsParallelLine.CoordsParallelLine;


  var setupElementNode = function (node, dimensions) {
    dimensions.forEach(function (dimName) {
      node[dimName] = node.dimension(node[dimName], node);
    });

    var options = node.options;

    var W = options.width;
    var H = options.height;

    node.x.guide = node.guide.x;
    node.y.guide = node.guide.y;

    var tickX = {
      map: node.x.guide.tickLabel,
      min: node.x.guide.tickMin,
      max: node.x.guide.tickMax,
      period: node.x.guide.tickPeriod,
      autoScale: node.x.guide.autoScale
    };
    node.options.xScale = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

    var tickY = {
      map: node.y.guide.tickLabel,
      min: node.y.guide.tickMin,
      max: node.y.guide.tickMax,
      period: node.y.guide.tickPeriod,
      autoScale: node.y.guide.autoScale
    };
    node.options.yScale = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

    return node;
  };

  var nodeMap = {
    "COORDS.RECT": {
      walk: coords.walk,
      draw: function (node, continueTraverse) {
        node.x = node.dimension(node.x, node);
        node.y = node.dimension(node.y, node);
        coords.draw(node, continueTraverse);
      }
    },

    "ELEMENT.POINT": function (node) {
      point(setupElementNode(node, ["x", "y", "color", "size"]));
    },

    "ELEMENT.LINE": function (node) {
      line(setupElementNode(node, ["x", "y", "color"]));
    },

    "ELEMENT.INTERVAL": function (node) {
      interval(setupElementNode(node, ["x", "y", "color"]));
    },

    "COORDS.PARALLEL": CoordsParallel,
    "PARALLEL/ELEMENT.LINE": CoordsParallelLine
  };

  exports.nodeMap = nodeMap;
});
define('tau.newCharts',["exports", "./utils/utils-dom", "./charts/tau.plot", "./charts/tau.chart", "./unit-domain-mixin", "./unit-domain-period-generator", "./dsl-reader", "./spec-engine-factory", "./layout-engine-factory", "./formatter-registry", "./node-map", "./units-registry"], function (exports, _utilsUtilsDom, _chartsTauPlot, _chartsTauChart, _unitDomainMixin, _unitDomainPeriodGenerator, _dslReader, _specEngineFactory, _layoutEngineFactory, _formatterRegistry, _nodeMap, _unitsRegistry) {
  

  var utilsDom = _utilsUtilsDom.utilsDom;
  var Plot = _chartsTauPlot.Plot;
  var Chart = _chartsTauChart.Chart;
  var UnitDomainMixin = _unitDomainMixin.UnitDomainMixin;
  var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;
  var DSLReader = _dslReader.DSLReader;
  var SpecEngineFactory = _specEngineFactory.SpecEngineFactory;
  var LayoutEngineFactory = _layoutEngineFactory.LayoutEngineFactory;
  var FormatterRegistry = _formatterRegistry.FormatterRegistry;
  var nodeMap = _nodeMap.nodeMap;
  var UnitsRegistry = _unitsRegistry.UnitsRegistry;
  var colorBrewers = {};
  var plugins = {};

  var __api__ = {
    UnitDomainMixin: UnitDomainMixin,
    UnitDomainPeriodGenerator: UnitDomainPeriodGenerator,
    DSLReader: DSLReader,
    SpecEngineFactory: SpecEngineFactory,
    LayoutEngineFactory: LayoutEngineFactory
  };
  var api = {
    UnitsRegistry: UnitsRegistry,
    tickFormat: FormatterRegistry,
    d3: d3,
    _: _,
    tickPeriod: UnitDomainPeriodGenerator,
    colorBrewers: {
      add: function (name, brewer) {
        if (!(name in colorBrewers)) {
          colorBrewers[name] = brewer;
        }
      },
      get: function (name) {
        return colorBrewers[name];
      }
    },
    plugins: {
      add: function (name, brewer) {
        if (!(name in plugins)) {
          plugins[name] = brewer;
        }
      },
      get: function (name) {
        return plugins[name];
      }
    },
    globalSettings: {
      log: function (msg, type) {
        type = type || "INFO";
        console.log(type + ": " + msg);
      },

      excludeNull: true,
      specEngine: "AUTO",
      layoutEngine: "EXTRACT",
      getAxisTickLabelSize: utilsDom.getAxisTickLabelSize,

      xAxisTickLabelLimit: 100,
      yAxisTickLabelLimit: 100,

      xTickWordWrapLinesLimit: 2,
      yTickWordWrapLinesLimit: 3,

      xTickWidth: 6 + 3,
      yTickWidth: 6 + 3,

      distToXAxisLabel: 20,
      distToYAxisLabel: 20,

      xAxisPadding: 20,
      yAxisPadding: 20,

      xFontLabelHeight: 15,
      yFontLabelHeight: 15,

      xDensityKoeff: 2.2,
      xMinimumDensityKoeff: 1.1,
      yDensityKoeff: 2.2,
      yMinimumDensityKoeff: 1.1,

      defaultFormats: {
        measure: "x-num-auto",
        "measure:time": "x-time-auto",
        "measure:time:year": "x-time-year",
        "measure:time:quarter": "x-time-quarter",
        "measure:time:month": "x-time-month",
        "measure:time:week": "x-time-week",
        "measure:time:day": "x-time-day",
        "measure:time:hour": "x-time-hour",
        "measure:time:min": "x-time-min",
        "measure:time:sec": "x-time-sec",
        "measure:time:ms": "x-time-ms"
      }
    }
  };

  Plot.globalSettings = api.globalSettings;

  api.UnitsRegistry.add("COORDS.PARALLEL", nodeMap["COORDS.PARALLEL"]).add("PARALLEL/ELEMENT.LINE", nodeMap["PARALLEL/ELEMENT.LINE"]).add("COORDS.RECT", nodeMap["COORDS.RECT"]).add("ELEMENT.POINT", nodeMap["ELEMENT.POINT"]).add("ELEMENT.LINE", nodeMap["ELEMENT.LINE"]).add("ELEMENT.INTERVAL", nodeMap["ELEMENT.INTERVAL"]);
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
 return require('tau.newCharts');
}));