/*! tauCharts - v0.1.0 - 2014-10-31
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
        root.tauChart = factory(root._, root.d3);
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



define('utils/utils',["exports"], function(exports) {
  var utils = {
      clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      isArray: function(obj) {
        return Array.isArray(obj);
      }
  };

  exports.utils = utils;
});


define('unit-domain-period-generator',["exports"], function(exports) {
  var PERIODS_MAP = {

      'day': {
          cast: function (date) {
              return new Date(date.setHours(0, 0, 0, 0));
          },
          next: function (prevDate) {
              return new Date(prevDate.setDate(prevDate.getDate() + 1));
          }
      },

      'week': {
          cast: function (date) {
              date = new Date(date.setHours(0, 0, 0, 0));
              date = new Date(date.setDate(date.getDate() - date.getDay()));
              return date;
          },
          next: function (prevDate) {
              return new Date(prevDate.setDate(prevDate.getDate() + 7));
          }
      },

      'month': {
          cast: function (date) {
              date = new Date(date.setHours(0, 0, 0, 0));
              date = new Date(date.setDate(1));
              return date;
          },
          next: function (prevDate) {
              return new Date(prevDate.setMonth(prevDate.getMonth() + 1));
          }
      },

      'quarter': {
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

      'year': {
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

      add: function(periodAlias, obj) {
          PERIODS_MAP[periodAlias.toLowerCase()] = obj;
          return this;
      },

      get: function(periodAlias) {
        return PERIODS_MAP[periodAlias.toLowerCase()];
      },

      generate: function(lTick, rTick, periodAlias) {
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


define(
  'unit-domain-mixin',["exports", "./unit-domain-period-generator", "underscore", "d3"],
  function(exports, _unitDomainPeriodGenerator, _underscore, _d3) {
    var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;
    var _ = _underscore;
    var d3 = _d3;
    /* jshint ignore:end */

    var rangeMethods = {

        'ordinal': function(inputValues, interval, props) {
            return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
        },

        'linear': function(inputValues, interval, props) {
            var domainParam = d3.extent(inputValues);
            var min = _.isNumber(props.min) ? props.min : domainParam[0];
            var max = _.isNumber(props.max) ? props.max : domainParam[1];
            var range = [
                Math.min(min, domainParam[0]),
                Math.max(max, domainParam[1])
            ];
            return d3.scale.linear().domain(range).nice().rangeRound(interval, 1);
        },

        'period': function(inputValues, interval, props) {
            var domainParam = d3.extent(inputValues);
            var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
            var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

            var range = [
                Math.min(min, domainParam[0]),
                Math.max(max, domainParam[1])
            ];

            var dates = UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);

            return d3.scale.ordinal().domain(dates).rangePoints(interval, 1);
        },

        'time': function(inputValues, interval, props) {
            var domainParam = d3.extent(inputValues);
            var min = (_.isNull(props.min) || _.isUndefined(props.min)) ? domainParam[0] : new Date(props.min).getTime();
            var max = (_.isNull(props.max) || _.isUndefined(props.max)) ? domainParam[1] : new Date(props.max).getTime();

            var range = [
                Math.min(min, domainParam[0]),
                Math.max(max, domainParam[1])
            ];

            return d3.time.scale().domain(range).range(interval);
        }
    };

    var UnitDomainMixin = function() {
      var UnitDomainMixin = function UnitDomainMixin(meta, data) {

          var getPropMapper = function(prop) {
            return function(propObj) {
              return propObj[prop];
            };
          };

          var getValueMapper = function(dim) {
              var d = meta[dim] || {};
              var f = d.value ? getPropMapper(d.value) : (function(x) {
                return x;
              });

              var isTime = _.contains(['period', 'time'], d.scale);

              return isTime ? _.compose((function(v) {
                return (new Date(v)).getTime();
              }), f) : f;
          };

          var getOrder = function(dim) {
              var d = meta[dim] || {};
              return d.order || null;
          };

          var getDomainSortStrategy = function(type) {

              var map = {

                  category: function(dim, fnMapperId, domain) {
                      return domain;
                  },

                  order: function(dim, fnMapperId, domain) {
                      var metaOrder = getOrder(dim);
                      return (metaOrder) ?
                          _.union(metaOrder, domain) : // arguments order is important
                          _.sortBy(domain, fnMapperId);
                  },

                  measure: function(dim, fnMapperId, domain) {
                      return _.sortBy(domain, fnMapperId);
                  },

                  'as-is': (function(dim, fnMapperId, domain) {
                    return domain;
                  })
              };

              return map[type] || map['as-is'];
          };

          var getScaleSortStrategy = function(type) {

              var map = {

                  category: getDomainSortStrategy('category'),

                  order: function(dim, fnMapperId, domain) {
                      var metaOrder = getOrder(dim);
                      return (metaOrder) ?
                          _.union(domain, metaOrder) : // arguments order is important
                          domain;
                  },

                  measure: getDomainSortStrategy('measure'),

                  'as-is': getDomainSortStrategy('as-is')
              };

              return map[type] || map['as-is'];
          };

          this.fnDimension = function(dimensionName, subUnit) {
              var unit = (subUnit || {}).dimensions || {};
              var xRoot = meta[dimensionName] || {};
              var xNode = unit[dimensionName] || {};
              return {
                  scaleDim: dimensionName,
                  scaleType: xNode.scale || xRoot.scale
              };
          };

          this.fnSource = function(whereFilter) {
              var predicates = _.map(whereFilter, function(v, k) {
                return function(row) {
                  return getValueMapper(k)(row[k]) === v;
                };
              });
              return _(data).filter(function(row) {
                return _.every(predicates, (function(p) {
                  return p(row);
                }));
              });
          };

          var _domain = function(dim, fnSort) {

              if (!meta[dim]) {
                  return [null];
              }

              var fnMapperId = getValueMapper(dim);
              var uniqValues = _(data).chain().pluck(dim).uniq(fnMapperId).value();

              return fnSort(dim, fnMapperId, uniqValues);
          };

          this.fnDomain = function(dim) {
              var fnMapperId = getValueMapper(dim);
              var type = (meta[dim] || {}).type;
              var domainSortedAsc = _domain(dim, getDomainSortStrategy(type));
              return domainSortedAsc.map(fnMapperId);
          };

          this.fnScaleTo = function(scaleDim, interval, options) {
              var opts = options || {};
              var dimx = _.defaults({}, meta[scaleDim]);

              var fMap = opts.map ? getPropMapper(opts.map) : getValueMapper(scaleDim);
              var fVal = opts.period ?
                  (function(x) {
                return UnitDomainPeriodGenerator.get(opts.period).cast(new Date(x));
              }) :
                  (function(x) {
                return x;
              });

              var vals = _domain(scaleDim, getScaleSortStrategy(dimx.type)).map(fMap);

              var func = rangeMethods[dimx.scale](vals, interval, opts);

              var wrap = function(domainPropObject) {
                return func(fVal(fMap(domainPropObject)));
              };
              // have to copy properties since d3 produce Function with methods
              for (var p in func) {
                  if (func.hasOwnProperty(p)) {
                      wrap[p] = func[p];
                  }
              }
              return wrap;
          };
      };

      Object.defineProperties(UnitDomainMixin.prototype, {
        mix: {
          writable: true,

          value: function(unit) {
              unit.dimension = this.fnDimension;
              unit.source = this.fnSource;
              unit.domain = this.fnDomain;
              unit.scaleTo = this.fnScaleTo;
              unit.partition = (function() {
                return unit.source(unit.$where);
              });

              return unit;
          }
        }
      });

      return UnitDomainMixin;
    }();

    exports.UnitDomainMixin = UnitDomainMixin;
  }
);


define('units-registry',["exports"], function(exports) {
  var UnitsMap = {};

  var UnitsRegistry = {

      add: function(unitType, xUnit) {
          var unit = {};
          unit.draw = (typeof xUnit === 'function') ? xUnit : xUnit.draw;
          unit.walk = xUnit.walk || (function(x) {
            return x;
          });
          UnitsMap[unitType] = unit;
          return this;
      },

      get: function(unitType) {

          if (!UnitsMap.hasOwnProperty(unitType)) {
              throw new Error('Unknown unit type: ' + unitType);
          }

          return UnitsMap[unitType];
      }
  };

  exports.UnitsRegistry = UnitsRegistry;
});


define(
  'dsl-reader',["exports", "./utils/utils", "./unit-domain-mixin", "./units-registry"],
  function(exports, _utilsUtils, _unitDomainMixin, _unitsRegistry) {
    var utils = _utilsUtils.utils;
    var UnitDomainMixin = _unitDomainMixin.UnitDomainMixin;
    var UnitsRegistry = _unitsRegistry.UnitsRegistry;

    var DSLReader = function() {
      var DSLReader = function DSLReader(spec, data) {
          this.spec = utils.clone(spec);
          this.domain = new UnitDomainMixin(this.spec.dimensions, data);
      };

      Object.defineProperties(DSLReader.prototype, {
        buildGraph: {
          writable: true,

          value: function() {
            var _this = this;
            var buildRecursively = function(unit) {
              return UnitsRegistry.get(unit.type).walk(_this.domain.mix(unit), buildRecursively);
            };
            return buildRecursively(this.spec.unit);
          }
        },

        calcLayout: {
          writable: true,

          value: function(graph, layoutEngine, size) {

              graph.options = {
                  top: 0,
                  left: 0,
                  width: size.width,
                  height: size.height
              };

              return layoutEngine(graph, this.domain);
          }
        },

        renderGraph: {
          writable: true,

          value: function(styledGraph, target) {
            var _this2 = this;

            styledGraph.options.container = target;

            var renderRecursively = function(unit) {
              return UnitsRegistry.get(unit.type).draw(_this2.domain.mix(unit), renderRecursively);
            };

            renderRecursively(styledGraph);
            return styledGraph.options.container;
          }
        }
      });

      return DSLReader;
    }();

    exports.DSLReader = DSLReader;
  }
);



define('matrix',["exports"], function(exports) {
  var TMatrix = (function () {

      var Matrix = function (r, c) {

          var args = _.toArray(arguments);
          var cube;

          if (_.isArray(args[0])) {
              cube = args[0];
          }
          else {
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


define(
  'layout-engine-factory',["exports", "./utils/utils", "./matrix"],
  function(exports, _utilsUtils, _matrix) {
    var _this = this;
    var utils = _utilsUtils.utils;
    var TMatrix = _matrix.TMatrix;

    var applyNodeDefaults = function(node) {
        node.options = node.options || {};
        node.guide = node.guide || {};
        node.guide.padding = _.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

        node.guide.x = _.defaults(node.guide.x || {}, {
            label: '',
            padding: 0,
            density: 30,
            cssClass: 'x axis',
            scaleOrient: 'bottom',
            rotate: 0,
            textAnchor: 'middle',
            tickPeriod: null,
            tickFormat: null
        });
        node.guide.x.label = _.isObject(node.guide.x.label) ? node.guide.x.label : {text: node.guide.x.label};
        node.guide.x.label = _.defaults(node.guide.x.label, {padding: 32, rotate: 0, textAnchor: 'middle'});

        node.guide.x.tickFormat = node.guide.x.tickFormat || node.guide.x.tickPeriod;

        node.guide.y = _.defaults(node.guide.y || {}, {
            label: '',
            padding: 0,
            density: 30,
            cssClass: 'y axis',
            scaleOrient: 'left',
            rotate: 0,
            textAnchor: 'end',
            tickPeriod: null,
            tickFormat: null
        });
        node.guide.y.label = _.isObject(node.guide.y.label) ? node.guide.y.label : {text: node.guide.y.label};
        node.guide.y.label = _.defaults(node.guide.y.label, {padding: 32, rotate: -90, textAnchor: 'middle'});

        node.guide.y.tickFormat = node.guide.y.tickFormat || node.guide.y.tickPeriod;

        return node;
    };

    var fnDefaultLayoutEngine = function(rootNode, domainMixin) {

        var fnTraverseLayout = function(rawNode) {

            var node = applyNodeDefaults(rawNode);

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
                    calcHeight: (function(cellHeight, rowIndex, elIndex, lenIndex) {
                      return cellHeight / lenIndex;
                    }),
                    calcTop: (function(cellHeight, rowIndex, elIndex, lenIndex) {
                      return (rowIndex + 1) * (cellHeight / lenIndex) * elIndex;
                    })
                };
            }
            else {
                calcLayoutStrategy = {
                    calcHeight: (function(cellHeight, rowIndex, elIndex, lenIndex) {
                      return cellHeight;
                    }),
                    calcTop: (function(cellHeight, rowIndex, elIndex, lenIndex) {
                      return rowIndex * cellH;
                    })
                };
            }

            node.$matrix.iterate(function(iRow, iCol, subNodes) {

                var len = subNodes.length;

                _.each(
                    subNodes,
                    function(node, i) {
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

        return fnTraverseLayout(rootNode);
    };

    var LayoutEngineTypeMap = {

        'DEFAULT': fnDefaultLayoutEngine,

        'EXTRACT-AXES': function(rootNode, domainMixin) {

            var fnExtractAxesTransformation = (function(root) {

                var traverse = (function(rootNode, wrapperNode) {

                    var node = applyNodeDefaults(rootNode);

                    _.each([node.guide.x || {}, node.guide.y || {}], function(a) {
                      return a.hide = true;
                    });

                    var nRows = node.$matrix.sizeR();
                    var nCols = node.$matrix.sizeC();

                    wrapperNode.$axes = new TMatrix(nRows, nCols);

                    node.$matrix.iterate(function(r, c, subNodes) {

                        var axesMap = [];
                        wrapperNode.$axes.setRC(r, c, axesMap);

                        var isHeadCol = (c === 0);
                        var isTailRow = (r === (nRows - 1));

                        subNodes.forEach(function(subNode) {
                            var node = applyNodeDefaults(subNode);
                            if (node.$matrix) {
                                var axis = _.extend(utils.clone(_.omit(node, '$matrix')), { type: 'WRAP.AXIS' });
                                axesMap.push(axis);

                                node.guide.padding.l = 0;
                                node.guide.padding.b = 0;

                                axis.guide.padding.l = (isHeadCol ? axis.guide.padding.l : 0);
                                axis.guide.padding.b = (isTailRow ? axis.guide.padding.b : 0);

                                traverse(node, axis);
                            }
                        });
                    });

                    return node;
                });

                var wrapperNode = applyNodeDefaults({
                    type: 'WRAP.MULTI_AXES',
                    options: utils.clone(root.options),
                    x: {},
                    y: {},
                    $matrix: new TMatrix([[[root]]])
                });

                traverse(domainMixin.mix(wrapperNode), wrapperNode);

                wrapperNode.$matrix = new TMatrix([
                    [
                        [
                            applyNodeDefaults({
                                type: 'WRAP.MULTI_GRID',
                                x: {},
                                y: {},
                                $matrix: new TMatrix([[[root]]])
                            })
                        ]
                    ]
                ]);

                return wrapperNode;
            });

            var fnTraverseExtAxesLayout = function(wrapperNode) {

                var multiAxisDecorator = function(node) {

                    var options = node.options;
                    var padding = node.guide.padding;

                    var innerW = options.width - (padding.l + padding.r);
                    var innerH = options.height - (padding.t + padding.b);

                    var nR = node.$axes.sizeR();
                    var nC = node.$axes.sizeC();

                    var leftBottomItem = applyNodeDefaults(node.$axes.getRC(nR - 1, 0)[0] || {});
                    var lPadding = leftBottomItem.guide.padding.l;
                    var bPadding = leftBottomItem.guide.padding.b;

                    var sharedWidth = (innerW - lPadding);
                    var sharedHeight = (innerH - bPadding);

                    var cellW = sharedWidth / nC;
                    var cellH = sharedHeight / nR;

                    node.$axes.iterate(function(iRow, iCol, subNodes) {

                        var isHeadCol = (iCol === 0);
                        var isTailRow = (iRow === (nR - 1));

                        if (isHeadCol || isTailRow) {

                            subNodes.forEach(function(node) {
                                node.options = {
                                    showX: isTailRow,
                                    showY: isHeadCol,

                                    width : cellW + (isHeadCol ? lPadding: 0),
                                    height: cellH + (isTailRow ? bPadding: 0),

                                    top : iRow * cellH,
                                    left: iCol * cellW + (isHeadCol ? 0 : lPadding)
                                };

                                if (node.$axes) {
                                    multiAxisDecorator(node);
                                }
                            });
                        }
                    });

                    return node;
                };

                multiAxisDecorator(wrapperNode);

                var gridL = 0;
                var gridB = 0;
                var axisOffsetTraverser = function(node) {
                    var padding = node.guide.padding;
                    var nR = node.$axes.sizeR();
                    node.$axes.iterate(function(iRow, iCol, subNodes) {
                        if (iCol === 0 && (iRow === (nR - 1))) {
                            gridL += padding.l;
                            gridB += padding.b;
                            subNodes.forEach(function(node) {
                              return axisOffsetTraverser(node);
                            });
                        }
                    });

                    return node;
                };

                axisOffsetTraverser(wrapperNode);

                var gridW = wrapperNode.options.width - gridL;
                var gridH = wrapperNode.options.height - gridB;

                var refRoot = wrapperNode.$matrix.getRC(0, 0)[0];
                refRoot.options = {
                    top: 0,
                    left: gridL,
                    width: gridW,
                    height: gridH
                };

                fnDefaultLayoutEngine(refRoot, domainMixin);

                return wrapperNode;
            };

            return (fnTraverseExtAxesLayout(fnExtractAxesTransformation(rootNode)));
        }
    };

    var LayoutEngineFactory = {

        get: function(typeName) {
            return (LayoutEngineTypeMap[typeName] || LayoutEngineTypeMap.DEFAULT).bind(_this);
        }

    };

    exports.LayoutEngineFactory = LayoutEngineFactory;
  }
);
//plugins
/** @class
 * @extends Plugin */


define('plugins',["exports"], function(exports) {
  var Plugins = function() {
    var Plugins = function Plugins(plugins) {
        this._plugins = plugins;
    };

    Object.defineProperties(Plugins.prototype, {
      _call: {
        writable: true,

        value: function(name, args) {
            for (var i = 0; i < this._plugins.length; i++) {
                if (typeof(this._plugins[i][name]) == 'function') {
                    this._plugins[i][name].apply(this._plugins[i], args);
                }
            }
        }
      },

      render: {
        writable: true,

        value: function(context, tools) {
            this._call('render', arguments);
        }
      },

      click: {
        writable: true,

        value: function(context, tools) {
            this._call('click', arguments);
        }
      },

      mouseover: {
        writable: true,

        value: function(context, tools) {
            this._call('mouseover', arguments);
        }
      },

      mouseout: {
        writable: true,

        value: function(context, tools) {
            this._call('mouseout', arguments);
        }
      },

      mousemove: {
        writable: true,

        value: function(context, tools) {
            this._call('mousemove', arguments);
        }
      }
    });

    return Plugins;
  }();


  var propagateDatumEvents = function (plugins) {
      return function () {
          this
              .on('click', function (d) {
                  plugins.click(new ElementContext(d), new ChartElementTools(d3.select(this)));
              })
              .on('mouseover', function (d) {
                  plugins.mouseover(new ElementContext(d), new ChartElementTools(d3.select(this)));
              })
              .on('mouseout', function (d) {
                  plugins.mouseout(new ElementContext(d), new ChartElementTools(d3.select(this)));
              })
              .on('mousemove', function (d) {
                  plugins.mousemove(new ElementContext(d), new ChartElementTools(d3.select(this)));
              });
      };
  };

  var ChartElementTools = function() {
    var ChartElementTools = function ChartElementTools(element) {
    this.element = element;
};

    return ChartElementTools;
  }();

  var RenderContext = function() {
    var RenderContext = function RenderContext(dataSource) {
        this.data = dataSource;
    };

    return RenderContext;
  }();

  var ElementContext = function() {
    var ElementContext = function ElementContext(datum) {
       this.datum = datum;
   };

    return ElementContext;
  }();

  var ChartTools = function() {
    var ChartTools = function ChartTools(layout, mapper) {
       this.svg = layout.svg;
       this.html = layout.html;
       this.mapper = mapper;
   };

    Object.defineProperties(ChartTools.prototype, {
      elements: {
        writable: true,

        value: function() {
            return this.svg.selectAll('.i-role-datum');
        }
      }
    });

    return ChartTools;
  }();

  exports.propagateDatumEvents = propagateDatumEvents;
  exports.Plugins = Plugins;
});

/**
 * Internal method to return CSS value for given element and property
 */


define('utils/utils-dom',["exports"], function(exports) {
  var utilsDom =  {
      getStyle: function (el, prop) {
          return window.getComputedStyle(el, undefined).getPropertyValue(prop);
      },
      getContainerSize : function(el) {
          var padding = 2 * parseInt(this.getStyle(el, 'padding') || 0, 10);
          var rect = el.getBoundingClientRect();
          return {
              width: rect.width - padding,
              height: rect.height - padding
          };
      }
  };
  exports.utilsDom = utilsDom;
});



define('const',["exports"], function(exports) {
  var _CSSPREFIX = 'graphical-report__';
  exports.CSS_PREFIX = _CSSPREFIX;
});


define(
  'charts/tau.plot',["exports", "../dsl-reader", "../layout-engine-factory", "../plugins", "../utils/utils-dom", "../const"],
  function(
    exports,
    _dslReader,
    _layoutEngineFactory,
    _plugins,
    _utilsUtilsDom,
    _const) {
    var DSLReader = _dslReader.DSLReader;
    var LayoutEngineFactory = _layoutEngineFactory.LayoutEngineFactory;
    var Plugins = _plugins.Plugins;
    var propagateDatumEvents = _plugins.propagateDatumEvents;
    var utilsDom = _utilsUtilsDom.utilsDom;
    var CSS_PREFIX = _const.CSS_PREFIX;

    var Plot = function() {
      var Plot = function Plot(config) {

          var chartConfig = this.convertConfig(config);

          this.config = _.defaults(chartConfig, {
              spec: null,
              data: [],
              plugins: []
          });

          chartConfig.spec.dimensions = this._normalizeDimensions(chartConfig.spec.dimensions, chartConfig.data);

          this.plugins = this.config.plugins;
          this.spec = this.config.spec;
          this.data = this.config.data;

          //plugins
          this._plugins = new Plugins(this.config.plugins);
      };

      Object.defineProperties(Plot.prototype, {
        renderTo: {
          writable: true,

          value: function(target, xSize) {

              var container = d3.select(target);
              var containerNode = container[0][0];

              if (containerNode === null) {
                  throw new Error('Target element not found');
              }

              //todo don't compute width if width or height were passed
              var size = _.defaults(xSize || {}, utilsDom.getContainerSize(containerNode));

              if (this.data.length === 0) {
                  // empty data source
                  return;
              }

              containerNode.innerHTML = '';

              var svgContainer = container
                  .append("svg")
                  .attr("class",CSS_PREFIX + 'svg')
                  .attr("width", size.width)
                  .attr("height", size.height);

              var reader = new DSLReader(this.spec, this.data);
              var xGraph = reader.buildGraph();
              var engine = LayoutEngineFactory.get(this.config.layoutEngine || 'EXTRACT-AXES');
              var layout = reader.calcLayout(xGraph, engine, size);
              var canvas = reader.renderGraph(layout, svgContainer);

              //plugins
              canvas.selectAll('.i-role-datum').call(propagateDatumEvents(this._plugins));
              this._plugins.render(canvas);
          }
        },

        _autoDetectDimensions: {
          writable: true,

          value: function(data) {

              var detectType = function(propertyValue) {
                  var type;
                  if (_.isObject(propertyValue)) {
                      type = 'order';
                  }
                  else if (_.isNumber(propertyValue)) {
                      type = 'measure';
                  }
                  else {
                      type = 'category';
                  }

                  return type;
              };

              return _.reduce(
                  data,
                  function(dimMemo, rowItem) {

                      _.each(rowItem, function(val, key) {
                          var assumedType = detectType(val);
                          dimMemo[key] = dimMemo[key] || {type: assumedType};
                          dimMemo[key].type = (dimMemo[key].type === assumedType) ? assumedType : 'category';
                      });

                      return dimMemo;
                  },
                  {});
          }
        },

        _autoAssignScales: {
          writable: true,

          value: function(dimensions) {

              var scaleMap = {
                  category: 'ordinal',
                  order: 'ordinal',
                  measure:'linear'
              };

              _.each(dimensions, function(val, key) {
                  var t = val.type.toLowerCase();
                  val.scale = val.scale || scaleMap[t];
              });

              return dimensions;
          }
        },

        _normalizeDimensions: {
          writable: true,

          value: function(dimensions, data) {
              var dims = (dimensions) ? dimensions : this._autoDetectDimensions(data);
              return this._autoAssignScales(dims);
          }
        },

        convertConfig: {
          writable: true,

          value: function(config) {
              return config;
          }
        }
      });

      return Plot;
    }();

    exports.Plot = Plot;
  }
);



define('charts/tau.chart',["exports", "./tau.plot"], function(exports, _tauPlot) {
  var _extends = function(child, parent) {
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

  function convertAxis(data) {
      if (!data) {
          return null;
      }

      return data;
  }

  function generateSimpleConfig(type, config) {
      var chartConfig = _.omit(config, 'spec');
      var colorGuide = config.guide && config.guide.color || {};
      var element = {
          type: type,
          x: config.x,
          y: config.y,
          color: config.color,
          guide: {
              color: colorGuide
          }
      };
      if (config.size) {
          element.size = config.size;
      }
      if (config.hasOwnProperty('flip')) {
          element.flip = config.flip;
      }
      chartConfig.spec = {
          dimensions: config.dimensions,
          unit: {
              type: 'COORDS.RECT',
              x: convertAxis(config.x),
              y: convertAxis(config.y),
              guide: config.guide || {
                  padding: {l: 54, b: 24, r: 24, t: 24},
                  showGridLines: 'xy',
                  x: {label: config.x},
                  y: {label: config.y}
              },
              unit: [element]
          }

      };
      return chartConfig;
  }
  var typesChart = {
      'scatterplot': function(config) {
          return generateSimpleConfig('ELEMENT.POINT', config);
      },
      'line': function(config) {
          return generateSimpleConfig('ELEMENT.LINE', config);
      },
      'bar': function(config) {
          config.flip = false;
          return generateSimpleConfig('ELEMENT.INTERVAL', config);
      },
      'horizontalBar': function(config) {
          config.flip  = true;
          return generateSimpleConfig('ELEMENT.INTERVAL', config);
      }
  };

  var Chart = function(Plot) {
    var Chart = function Chart() {
      Plot.apply(this, arguments);
    };

    _extends(Chart, Plot);

    Object.defineProperties(Chart.prototype, {
      convertConfig: {
        writable: true,

        value: function(config) {
            return typesChart[config.type](config);
        }
      }
    });

    return Chart;
  }(Plot);

  exports.Chart = Chart;
});
/* jshint ignore:start */


define('formatter-registry',["exports", "d3"], function(exports, _d3) {
  var d3 = _d3;
  /* jshint ignore:end */
  var FORMATS_MAP = {

      'day': d3.time.format('%d-%b-%Y'),

      'week': d3.time.format('%d-%b-%Y'),

      'week-range': function(x) {
          var sWeek = new Date(x);
          var clone = new Date(x);
          var eWeek = new Date(clone.setDate(clone.getDate() + 7));
          var format = d3.time.format('%d-%b-%Y');
          return format(sWeek) + ' - ' + format(eWeek);
      },

      'month': function(x) {
          var d = new Date(x);
          var m = d.getMonth();
          var formatSpec = (m === 0) ? '%B, %Y' : '%B';
          return d3.time.format(formatSpec)(x);
      },

      'month-year': d3.time.format('%B, %Y'),

      'quarter': function(x) {
          var d = new Date(x);
          var m = d.getMonth();
          var q = (m - (m % 3)) / 3;
          return 'Q' + (q + 1) + ' ' + d.getFullYear();
      },

      'year': d3.time.format('%Y')
  };

  var FormatterRegistry = {

      get: function(formatAlias) {
          var formatter = FORMATS_MAP[formatAlias];
          if (!formatter) {
              formatter = function(v) {
                  var f = _.isDate(v) ? d3.time.format(formatAlias) : d3.format(formatAlias);
                  return f(v);
              };
          }
          return formatter;
      },

      add: function(formatAlias, formatter) {
          FORMATS_MAP[formatAlias] = formatter;
      }
  };

  exports.FormatterRegistry = FormatterRegistry;
});


define(
  'utils/utils-draw',["exports", "../utils/utils", "../formatter-registry"],
  function(exports, _utilsUtils, _formatterRegistry) {
    var utils = _utilsUtils.utils;
    var FormatterRegistry = _formatterRegistry.FormatterRegistry;

    var translate = function(left, top) {
      return 'translate(' + left + ',' + top + ')';
    };
    var rotate = function(angle) {
      return 'rotate(' + angle + ')';
    };
    var getOrientation = function(scaleOrient) {
      return _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v';
    };
    var s;
    var decorateAxisTicks = function(nodeScale, x, size) {

        var selection = nodeScale.selectAll('.tick line');

        var sectorSize = size / selection[0].length;
        var offsetSize = sectorSize / 2;

        if (x.scaleType === 'ordinal' || x.scaleType === 'period') {

            var isHorizontal = ('h' === getOrientation(x.guide.scaleOrient));

            var key = (isHorizontal) ? 'x' : 'y';
            var val = (isHorizontal) ? offsetSize : (-offsetSize);

            selection.attr(key + '1', val).attr(key + '2', val);
        }
    };

    var decorateAxisLabel = function(nodeScale, x) {
        var koeff = ('h' === getOrientation(x.guide.scaleOrient)) ? 1 : -1;
        nodeScale
            .append('text')
            .attr('transform', rotate(x.guide.label.rotate))
            .attr('class', 'label')
            .attr('x', koeff * x.guide.size * 0.5)
            .attr('y', koeff * x.guide.label.padding)
            .style('text-anchor', x.guide.label.textAnchor)
            .text(x.guide.label.text);
    };

    var decorateTickLabel = function(nodeScale, x) {
        nodeScale
            .selectAll('.tick text')
            .attr('transform', rotate(x.guide.rotate))
            .style('text-anchor', x.guide.textAnchor);
    };

    var fnDrawDimAxis = function (x, AXIS_POSITION, size) {
        var container = this;
        if (x.scaleDim) {

            var axisScale = d3.svg.axis()
                .scale(x.scaleObj)
                .orient(x.guide.scaleOrient)
                .ticks(_.max([Math.round(size / x.guide.density), 4]));

            if (x.guide.tickFormat) {
                axisScale.tickFormat(FormatterRegistry.get(x.guide.tickFormat));
            }

            var nodeScale = container
                .append('g')
                .attr('class', x.guide.cssClass)
                .attr('transform', translate.apply(null, AXIS_POSITION))
                .call(axisScale);

            decorateAxisTicks(nodeScale, x, size);
            decorateTickLabel(nodeScale, x);
            decorateAxisLabel(nodeScale, x);
        }
    };

    var fnDrawGrid = function (node, H, W) {

        var container = this;

        var grid = container
            .append('g')
            .attr('class', 'grid')
            .attr('transform', translate(0, 0));

        var linesOptions = (node.guide.showGridLines || '').toLowerCase();
        if (linesOptions.length > 0) {

            var gridLines = grid.append('g').attr('class', 'grid-lines');

            if ((linesOptions.indexOf('x') > -1) && node.x.scaleDim) {
                var x = node.x;
                var xGridAxis = d3.svg
                    .axis()
                    .scale(x.scaleObj)
                    .orient(x.guide.scaleOrient)
                    .tickSize(H)
                    .ticks(_.max([Math.round(W / x.guide.density), 4]));

                var xGridLines = gridLines.append('g').attr('class', 'grid-lines-x').call(xGridAxis);

                decorateAxisTicks(xGridLines, x, W);
            }

            if ((linesOptions.indexOf('y') > -1) && node.y.scaleDim) {
                var y = node.y;
                var yGridAxis = d3.svg
                    .axis()
                    .scale(y.scaleObj)
                    .orient(y.guide.scaleOrient)
                    .tickSize(-W)
                    .ticks(_.max([Math.round(H / y.guide.density), 4]));

                var yGridLines = gridLines.append('g').attr('class', 'grid-lines-y').call(yGridAxis);

                decorateAxisTicks(yGridLines, y, H);
            }

            // TODO: make own axes and grid instead of using d3's in such tricky way
            gridLines.selectAll('text').remove();
        }

        return grid;
    };

    var generateColor = function (node) {
        var defaultRange = _.times(10, function(i) {
          return 'color10-' + (1 + i);
        });
        var range, domain;
        var colorGuide = (node.guide || {}).color || {};
        var colorParam = node.color;

        var colorDim = colorParam.scaleDim;
        var brewer = colorGuide.brewer || defaultRange;

        if (utils.isArray(brewer)) {
            domain = node.domain(colorDim);
            range = brewer;
        }
        else {
            domain = Object.keys(brewer);
            range = domain.map(function(key) {
              return brewer[key];
            });
        }

        return {
            get: function(d) {
              return d3.scale.ordinal().range(range).domain(domain)(d);
            },
            dimension:colorDim
        };
    };
    /* jshint ignore:start */
    var utilsDraw = {
        translate: translate,
        rotate: rotate,
        getOrientation: getOrientation,
        fnDrawDimAxis: fnDrawDimAxis,
        fnDrawGrid: fnDrawGrid,
        generateColor: generateColor
    };
    exports.utilsDraw = utilsDraw;
  }
);


define(
  'elements/coords',["exports", "../utils/utils-draw", "../const", "../utils/utils", "../matrix"],
  function(exports, _utilsUtilsDraw, _const, _utilsUtils, _matrix) {
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var utils = _utilsUtils.utils;
    var TMatrix = _matrix.TMatrix;

    var FacetAlgebra = {

        'CROSS': function (root, dimX, dimY) {

            var domainX = root.domain(dimX);
            var domainY = root.domain(dimY).reverse();

            return _(domainY).map(function(rowVal) {
                return _(domainX).map(function(colVal) {

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

    var TFuncMap = function(opName) {
      return FacetAlgebra[opName] || (function() {
        return [[{}]];
      });
    };

    var inheritRootProps = function(unit, root, props) {
        var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
        r.guide = _.extend(utils.clone(root.guide || {}), (r.guide || {}));
        return r;
    };

    var coords = {

        walk: function (unit, continueTraverse) {

            var root = _.defaults(unit, {$where: {}});

            var isFacet = _.any(root.unit, function(n) {
              return n.type.indexOf('COORDS.') === 0;
            });
            var unitFunc = TFuncMap(isFacet ? 'CROSS' : '');

            var matrixOfPrFilters = new TMatrix(unitFunc(root, root.x, root.y));
            var matrixOfUnitNodes = new TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

            matrixOfPrFilters.iterate(function(row, col, $whereRC) {
                var cellWhere = _.extend({}, root.$where, $whereRC);
                var cellNodes = _(root.unit).map(function(sUnit) {
                    return _.extend(inheritRootProps(sUnit, root, ['x', 'y']), {$where: cellWhere});
                });
                matrixOfUnitNodes.setRC(row, col, cellNodes);
            });

            root.$matrix = matrixOfUnitNodes;

            matrixOfUnitNodes.iterate(function(r, c, cellNodes) {
                _.each(cellNodes, function(refSubNode) {
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
                period: node.x.guide.tickPeriod
            };
            node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

            var tickY = {
                map: node.y.guide.tickLabel,
                min: node.y.guide.tickMin,
                max: node.y.guide.tickMax,
                period: node.y.guide.tickPeriod
            };
            node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

            node.x.guide.size = W;
            node.y.guide.size = H;

            var X_AXIS_POS = [0, H + node.guide.x.padding];
            var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

            var container = options
                .container
                .append('g')
                .attr('class', CSS_PREFIX + 'cell ' + 'cell')
                .attr('transform', utilsDraw.translate(L, T));

            if (!node.x.guide.hide) {
                utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
            }

            if (!node.y.guide.hide) {
                utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
            }

            var grid = utilsDraw.fnDrawGrid.call(container, node, H, W);

            node.$matrix.iterate(function(iRow, iCol, subNodes) {
                subNodes.forEach(function(node) {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        }
    };
    exports.coords = coords;
  }
);


define(
  'elements/line',["exports", "../utils/utils-draw", "../const"],
  function(exports, _utilsUtilsDraw, _const) {
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var line = function (node) {

        var options = node.options;

        var xScale = options.xScale;
        var yScale = options.yScale;

        var color = utilsDraw.generateColor(node);

        var categories = d3
            .nest()
            .key(function(d) {
          return d[color.dimension];
        })
            .entries(node.partition());

        var updateLines = function () {
            this.attr('class', function(d) {
                return CSS_PREFIX + 'line' + ' line ' + color.get(d.key);
            });
            var paths = this.selectAll('path').data(function(d) {
              return [d.values];
            });
            paths.call(updatePaths);
            paths.enter().append('path').call(updatePaths);
            paths.exit().remove();
        };

        var line = d3
            .svg
            .line()
            .x(function(d) {
          return xScale(d[node.x.scaleDim]);
        })
            .y(function(d) {
          return yScale(d[node.y.scaleDim]);
        });

        var updatePaths = function () {
            this.attr('d', line);
        };

        var lines = options.container.selectAll('.line').data(categories);
        lines.call(updateLines);
        lines.enter().append('g').call(updateLines);
        lines.exit().remove();
    };
    exports.line = line;
  }
);


define('elements/size',["exports"], function(exports) {
  var sizeScale = function (values, maxSize) {
      values = _.filter(values, _.isFinite);

      var domain = [Math.min.apply(null, values), Math.max.apply(null, values)];
      var domainWidth = domain[0] == 0 ? domain[1] : Math.max(1, domain[1] / domain[0]);

      var range = [Math.max(1, maxSize / (Math.log(domainWidth) + 1)), maxSize];

      return d3
          .scale
          .linear()
          .range(range)
          .domain(domain);
  };

  exports.sizeScale = sizeScale;
});


define(
  'elements/point',["exports", "../utils/utils-draw", "../const", "./size"],
  function(exports, _utilsUtilsDraw, _const, _size) {
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var sizeScale = _size.sizeScale;
    var point = function (node) {

        var options = node.options;

        var xScale = options.xScale;
        var yScale = options.yScale;

        var color = utilsDraw.generateColor(node);

        var maxAxis = _.max([options.width, options.height]);
        var size = sizeScale(node.domain(node.size.scaleDim), maxAxis / 100);

        var update = function () {
            return this
                .attr('r', function(d) {
                    var s = size(d[node.size.scaleDim]);
                    return (!_.isFinite(s)) ? maxAxis / 100 : s;
                })
                .attr('class', function(d) {
                    return CSS_PREFIX + 'dot' + ' dot i-role-datum ' + color.get(d[color.dimension]);
                })
                .attr('cx', function(d) {
              return xScale(d[node.x.scaleDim]);
            })
                .attr('cy', function(d) {
              return yScale(d[node.y.scaleDim]);
            });
        };

        var elements = options.container.selectAll('.dot').data(node.partition());
        elements.call(update);
        elements.exit().remove();
        elements.enter().append('circle').call(update);
    };

    exports.point = point;
  }
);



define(
  'elements/interval',["exports", "../utils/utils-draw", "../const"],
  function(exports, _utilsUtilsDraw, _const) {
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var _BARGROUP = 'i-role-bar-group';
    var interval = function (node) {

        var options = node.options;

        var color = utilsDraw.generateColor(node);

        var partition = node.partition();
        var categories = d3
            .nest()
            .key(function(d) {
          return d[color.dimension];
        })
            .entries(partition);

        var xScale,
            yScale,
            tickWidth,
            intervalWidth,
            offsetCategory,

            calculateX,
            calculateY,
            calculateWidth,
            calculateHeight,
            calculateTranslate;
        if (node.flip) {
            xScale = options.yScale;
            yScale = options.xScale;
            tickWidth = options.height / (node.domain(node.y.scaleDim).length);
            intervalWidth = tickWidth / (categories.length + 1);
            offsetCategory = intervalWidth;

            calculateX = function(d) {
              return 0;
            };
            calculateY = function(d) {
              return xScale(d[node.y.scaleDim]) - (tickWidth / 2);
            };
            calculateWidth = function(d) {
              return yScale(d[node.x.scaleDim]);
            };
            calculateHeight = function(d) {
              return intervalWidth;
            };
            calculateTranslate = function(d, index) {
              return utilsDraw.translate(0, index * offsetCategory + offsetCategory / 2);
            };

        } else {
            xScale = options.xScale;
            yScale = options.yScale;
            tickWidth = options.width / (node.domain(node.x.scaleDim).length);
            intervalWidth = tickWidth / (categories.length + 1);
            offsetCategory = intervalWidth;

            calculateX = function(d) {
              return xScale(d[node.x.scaleDim]) - (tickWidth / 2);
            };
            calculateY = function(d) {
              return yScale(d[node.y.scaleDim]);
            };
            calculateWidth = function(d) {
              return intervalWidth;
            };
            calculateHeight = function(d) {
              return options.height - yScale(d[node.y.scaleDim]);
            };
            calculateTranslate = function(d, index) {
              return utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0);
            };
        }

        var updateBar = function () {
            return this
                .attr('class', function(d) {
                    return 'i-role-datum bar ' + CSS_PREFIX + 'bar ' + color.get(d[color.dimension]);
                })
                .attr('x', calculateX)
                .attr('y', calculateY)
                .attr('width', calculateWidth)
                .attr('height', calculateHeight);
        };
        var updateBarContainer = function () {

            this
                .attr('class', _BARGROUP)
                .attr('transform', calculateTranslate);
            var bars = this.selectAll('bar').data(function(d) {
              return d.values;
            });
            bars.call(updateBar);
            bars.enter().append('rect').call(updateBar);
            bars.exit().remove();
        };

        var elements = options.container.selectAll('.' + _BARGROUP).data(categories);
        elements.call(updateBarContainer);
        elements.enter().append('g').call(updateBarContainer);
        elements.exit().remove();
    };

    exports.interval = interval;
  }
);


define(
  'elements/coords-parallel',["exports", "../utils/utils-draw", "../const", "../utils/utils", "../matrix"],
  function(exports, _utilsUtilsDraw, _const, _utilsUtils, _matrix) {
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;
    var utils = _utilsUtils.utils;
    var TMatrix = _matrix.TMatrix;

    var inheritRootProps = function(unit, root, props) {
        var r = _.defaults(utils.clone(unit), _.pick.apply(_, [root].concat(props)));
        r.guide = _.extend(utils.clone(root.guide || {}), (r.guide || {}));
        return r;
    };

    var CoordsParallel = {

        walk: function (unit, continueTraverse) {
            var root = _.defaults(unit, {$where: {}});

            var matrixOfPrFilters = new TMatrix(1, 1);
            var matrixOfUnitNodes = new TMatrix(1, 1);

            matrixOfPrFilters.iterate(function(row, col) {
                var cellWhere = _.extend({}, root.$where);
                var cellNodes = _(root.unit).map(function(sUnit) {
                    return _.extend(inheritRootProps(sUnit, root, ['x']), {$where: cellWhere});
                });
                matrixOfUnitNodes.setRC(row, col, cellNodes);
            });

            root.$matrix = matrixOfUnitNodes;

            matrixOfUnitNodes.iterate(function(r, c, cellNodes) {
                _.each(cellNodes, function(refSubNode) {
                  return continueTraverse(refSubNode);
                });
            });

            return root;
        },

        draw: function(node, continueTraverse) {

            var options = node.options;
            var padding = node.guide.padding;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var W = options.width - (padding.l + padding.r);
            var H = options.height - (padding.t + padding.b);

            var scaleObjArr = node.x.map(function(xN) {
              return node.scaleTo(xN, [H, 0], {});
            });

            var container = options
                .container
                .append('g')
                .attr('class', 'graphical-report__' + 'cell ' + 'cell')
                .attr('transform', utilsDraw.translate(L, T));


            var translate = function(left, top) {
              return 'translate(' + left + ',' + top + ')';
            };
            var rotate = function(angle) {
              return 'rotate(' + angle + ')';
            };


            var fnDrawDimAxis = function (xScaleObj, AXIS_POSITION) {
                var container = this;

                var axisScale = d3.svg.axis().scale(xScaleObj).orient('left');

                var nodeScale = container
                    .append('g')
                    .attr('class', 'y axis')
                    .attr('transform', translate.apply(null, AXIS_POSITION))
                    .call(axisScale);

                nodeScale
                    .selectAll('.tick text')
                    .attr('transform', rotate(0))
                    .style('text-anchor', 'end');
            };

            var offset = W / (node.x.length - 1);
            scaleObjArr.forEach(function(scale, i) {
                fnDrawDimAxis.call(container, scale, [i * offset, 0]);
            });

            var grid = container
                .append('g')
                .attr('class', 'grid')
                .attr('transform', translate(0, 0));

            node.$matrix.iterate(function(iRow, iCol, subNodes) {
                subNodes.forEach(function(node) {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        }
    };
    exports.CoordsParallel = CoordsParallel;
  }
);


define(
  'elements/coords-parallel-line',["exports", "../utils/utils-draw", "../const"],
  function(exports, _utilsUtilsDraw, _const) {
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CSS_PREFIX = _const.CSS_PREFIX;

    var CoordsParallelLine = {

        draw: function (node) {

            node.color = node.dimension(node.color, node);

            var options = node.options;

            var scalesMap = node.x.reduce(
                function(memo, xN) {
                    memo[xN] = node.scaleTo(xN, [options.height, 0], {});
                    return memo;
                },
                {});

            var color = utilsDraw.generateColor(node);

            var categories = d3
                .nest()
                .key(function(d) {
              return d[color.dimension];
            })
                .entries(node.partition())
                .map(function(src) {
                    var row = src.values[0];
                    var memo = [];
                    node.x.forEach(function(propName) {
                        memo.push({key: propName, val: row[propName]});
                    });
                    return memo;
                });

            var updateLines = function () {
                this.attr('class', function(d) {
                  return 'graphical-report__' + 'line' + ' line ' + 'color10-9';
                });
                var paths = this.selectAll('path').data(function(d) {
                  return [d];
                });
                paths.call(updatePaths);
                paths.enter().append('path').call(updatePaths);
                paths.exit().remove();
            };

            var segment = options.width / (node.x.length - 1);
            var segmentMap = {};
            node.x.forEach(function(propName, i) {
                segmentMap[propName] = (i * segment);
            });

            var fnLine = d3.svg.line()
                .x(function(d) {
              return segmentMap[d.key];
            })
                .y(function(d) {
              return scalesMap[d.key](d.val);
            });

            var updatePaths = function () {
                this.attr('d', fnLine);
            };

            var lines = options.container.selectAll('.line').data(categories);
            lines.call(updateLines);
            lines.enter().append('g').call(updateLines);
            lines.exit().remove();
        }
    };

    exports.CoordsParallelLine = CoordsParallelLine;
  }
);


define(
  'node-map',["exports", "./elements/coords", "./elements/line", "./elements/point", "./elements/interval", "./utils/utils-draw", "./elements/coords-parallel", "./elements/coords-parallel-line"],
  function(
    exports,
    _elementsCoords,
    _elementsLine,
    _elementsPoint,
    _elementsInterval,
    _utilsUtilsDraw,
    _elementsCoordsParallel,
    _elementsCoordsParallelLine) {
    var coords = _elementsCoords.coords;
    var line = _elementsLine.line;
    var point = _elementsPoint.point;
    var interval = _elementsInterval.interval;
    var utilsDraw = _utilsUtilsDraw.utilsDraw;
    var CoordsParallel = _elementsCoordsParallel.CoordsParallel;
    var CoordsParallelLine = _elementsCoordsParallelLine.CoordsParallelLine;

    var setupElementNode = function(node, dimensions) {

        dimensions.forEach(function(dimName) {
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
            period: node.x.guide.tickPeriod
        };
        node.options.xScale = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

        var tickY = {
            map: node.y.guide.tickLabel,
            min: node.y.guide.tickMin,
            max: node.y.guide.tickMax,
            period: node.y.guide.tickPeriod
        };
        node.options.yScale = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

        return node;
    };

    var nodeMap = {

        'COORDS.RECT': {
            walk: coords.walk,
            draw: function(node, continueTraverse) {
                node.x = node.dimension(node.x, node);
                node.y = node.dimension(node.y, node);
                coords.draw(node, continueTraverse);
            }
        },

        'ELEMENT.POINT': function(node) {
            point(setupElementNode(node, ['x', 'y', 'color', 'size']));
        },

        'ELEMENT.LINE': function(node) {
            line(setupElementNode(node, ['x', 'y', 'color']));
        },

        'ELEMENT.INTERVAL': function (node) {
            interval(setupElementNode(node, ['x', 'y', 'color']));
        },

        'WRAP.AXIS': function (node, continueTraverse) {

            node.x = node.dimension(node.x, node);
            node.y = node.dimension(node.y, node);

            var options = node.options;
            var padding = node.guide.padding;

            node.x.guide = node.guide.x;
            node.y.guide = node.guide.y;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var W = options.width - (padding.l + padding.r);
            var H = options.height - (padding.t + padding.b);

            node.x.guide.size = W;
            node.y.guide.size = H;

            var tickX = {
                map: node.x.guide.tickLabel,
                min: node.x.guide.tickMin,
                max: node.x.guide.tickMax
            };
            node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

            var tickY = {
                map: node.y.guide.tickLabel,
                min: node.y.guide.tickMin,
                max: node.y.guide.tickMax
            };
            node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

            var X_AXIS_POS = [0, H + node.guide.x.padding];
            var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

            var container = options
                .container
                .append('g')
                .attr('class', 'axis-container')
                .attr('transform', utilsDraw.translate(L, T));

            if (options.showX && !node.x.guide.hide) {
                utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W);
            }

            if (options.showY && !node.y.guide.hide) {
                utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H);
            }

            var grid = container
                .append('g')
                .attr('class', 'sub-axis-container')
                .attr('transform', utilsDraw.translate(0, 0));

            var nRows = node.$axes.sizeR();
            var nCols = node.$axes.sizeC();

            node.$axes.iterate(function(iRow, iCol, subNodes) {
                if (iCol === 0 || (iRow === (nRows - 1))) {
                    subNodes.forEach(function(node) {
                        node.options = _.extend(
                            {
                                container: grid
                            },
                            node.options || {});

                        if (node.$axes) {
                            continueTraverse(node);
                        }
                    });
                }
            });
        },

        'WRAP.MULTI_AXES': function (node, continueTraverse) {
            var options = node.options;
            var padding = node.guide.padding;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var W = options.width - (padding.l + padding.r);
            var H = options.height - (padding.t + padding.b);

            var container = options
                .container
                .append('g')
                .attr('class', 'cell-wrapper')
                .attr('transform', utilsDraw.translate(L, T));

            node.$axes.iterate(function(r, c, subAxesNodes) {
                subAxesNodes.forEach(function(node) {
                    node.options = _.extend({container: container}, node.options);
                    continueTraverse(node);
                });
            });

            node.$matrix.iterate(function(r, c, subNodes) {
                subNodes.forEach(function(node) {
                    node.options = _.extend({container: container}, node.options);
                    continueTraverse(node);
                });
            });
        },

        'WRAP.MULTI_GRID': function (node, continueTraverse) {
            var options = node.options;
            var padding = node.guide.padding;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var grid = options
                .container
                .append('g')
                .attr('class', 'grid-wrapper')
                .attr('transform', utilsDraw.translate(L, T));

            node.$matrix.iterate(function(r, c, subNodes) {
                subNodes.forEach(function(node) {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        },

        'COORDS.PARALLEL': CoordsParallel,
        'PARALLEL/ELEMENT.LINE': CoordsParallelLine
    };

    exports.nodeMap = nodeMap;
  }
);



define(
  'tau.newCharts',["exports", "./charts/tau.plot", "./charts/tau.chart", "./unit-domain-mixin", "./unit-domain-period-generator", "./dsl-reader", "./layout-engine-factory", "./formatter-registry", "./node-map", "./units-registry"],
  function(
    exports,
    _chartsTauPlot,
    _chartsTauChart,
    _unitDomainMixin,
    _unitDomainPeriodGenerator,
    _dslReader,
    _layoutEngineFactory,
    _formatterRegistry,
    _nodeMap,
    _unitsRegistry) {
    var Plot = _chartsTauPlot.Plot;
    var Chart = _chartsTauChart.Chart;
    var UnitDomainMixin = _unitDomainMixin.UnitDomainMixin;
    var UnitDomainPeriodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator;
    var DSLReader = _dslReader.DSLReader;
    var LayoutEngineFactory = _layoutEngineFactory.LayoutEngineFactory;
    var FormatterRegistry = _formatterRegistry.FormatterRegistry;
    var nodeMap = _nodeMap.nodeMap;
    var UnitsRegistry = _unitsRegistry.UnitsRegistry;


    var tauChart = {
        Plot: Plot,
        Chart: Chart,
        __api__: {
            UnitDomainMixin: UnitDomainMixin,
            UnitDomainPeriodGenerator: UnitDomainPeriodGenerator,
            DSLReader: DSLReader,
            LayoutEngineFactory: LayoutEngineFactory
        },
        api: {
            UnitsRegistry: UnitsRegistry,
            tickFormat: FormatterRegistry,
            tickPeriod: UnitDomainPeriodGenerator
        }
    };

    tauChart.api.UnitsRegistry
        .add('COORDS.PARALLEL', nodeMap['COORDS.PARALLEL'])
        .add('PARALLEL/ELEMENT.LINE', nodeMap['PARALLEL/ELEMENT.LINE'])
        .add('COORDS.RECT', nodeMap['COORDS.RECT'])
        .add('ELEMENT.POINT', nodeMap['ELEMENT.POINT'])
        .add('ELEMENT.LINE', nodeMap['ELEMENT.LINE'])
        .add('ELEMENT.INTERVAL', nodeMap['ELEMENT.INTERVAL'])
        .add('WRAP.AXIS', nodeMap['WRAP.AXIS'])
        .add('WRAP.MULTI_AXES', nodeMap['WRAP.MULTI_AXES'])
        .add('WRAP.MULTI_GRID', nodeMap['WRAP.MULTI_GRID']);

    exports.tauChart = tauChart;
  }
);
 define('underscore',function(){
   return _;
 });
 define('d3',function(){
    return d3;
  });
 return require('tau.newCharts').tauChart;
}));