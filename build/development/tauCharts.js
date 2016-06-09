/*! taucharts - v0.9.2-beta.2 - 2016-06-09
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2016 Taucraft Limited; Licensed Apache License 2.0 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3"), require("underscore"));
	else if(typeof define === 'function' && define.amd)
		define(["d3", "underscore"], factory);
	else if(typeof exports === 'object')
		exports["tauCharts"] = factory(require("d3"), require("underscore"));
	else
		root["tauCharts"] = factory(root["d3"], root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.api = exports.__api__ = exports.Chart = exports.Plot = exports.GPL = undefined;

	var _utilsDom = __webpack_require__(1);

	var _utils = __webpack_require__(4);

	var _tau = __webpack_require__(22);

	var _tau2 = __webpack_require__(26);

	var _tau3 = __webpack_require__(41);

	var _unitDomainPeriodGenerator = __webpack_require__(24);

	var _formatterRegistry = __webpack_require__(15);

	var _unitsRegistry = __webpack_require__(30);

	var _scalesRegistry = __webpack_require__(31);

	var _coords = __webpack_require__(43);

	var _coords2 = __webpack_require__(47);

	var _coords3 = __webpack_require__(48);

	var _element = __webpack_require__(5);

	var _element2 = __webpack_require__(19);

	var _element3 = __webpack_require__(51);

	var _element4 = __webpack_require__(16);

	var _element5 = __webpack_require__(20);

	var _elementInterval = __webpack_require__(21);

	var _elementParallel = __webpack_require__(52);

	var _color = __webpack_require__(53);

	var _size = __webpack_require__(55);

	var _ordinal = __webpack_require__(56);

	var _period = __webpack_require__(57);

	var _time = __webpack_require__(58);

	var _linear = __webpack_require__(59);

	var _value = __webpack_require__(60);

	var _fill = __webpack_require__(61);

	var _chartAliasRegistry = __webpack_require__(42);

	var _chartMap = __webpack_require__(62);

	var _chartInterval = __webpack_require__(63);

	var _chartScatterplot = __webpack_require__(65);

	var _chartLine = __webpack_require__(66);

	var _chartArea = __webpack_require__(67);

	var _chartParallel = __webpack_require__(68);

	var _error = __webpack_require__(10);

	var _pluginsSdk = __webpack_require__(69);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
	    isChartElement: _utils.utils.isChartElement,
	    isLineElement: _utils.utils.isLineElement,
	    d3: _d2.default,
	    _: _underscore2.default,
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
	    pluginsSDK: _pluginsSdk.PluginsSDK,
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

	        defaultNiceColor: true,

	        // jscs:disable
	        defaultColorBrewer: ["#fde725", "#fbe723", "#f8e621", "#f6e620", "#f4e61e", "#f1e51d", "#efe51c", "#ece51b", "#eae51a", "#e7e419", "#e5e419", "#e2e418", "#dfe318", "#dde318", "#dae319", "#d8e219", "#d5e21a", "#d2e21b", "#d0e11c", "#cde11d", "#cae11f", "#c8e020", "#c5e021", "#c2df23", "#c0df25", "#bddf26", "#bade28", "#b8de29", "#b5de2b", "#b2dd2d", "#b0dd2f", "#addc30", "#aadc32", "#a8db34", "#a5db36", "#a2da37", "#a0da39", "#9dd93b", "#9bd93c", "#98d83e", "#95d840", "#93d741", "#90d743", "#8ed645", "#8bd646", "#89d548", "#86d549", "#84d44b", "#81d34d", "#7fd34e", "#7cd250", "#7ad151", "#77d153", "#75d054", "#73d056", "#70cf57", "#6ece58", "#6ccd5a", "#69cd5b", "#67cc5c", "#65cb5e", "#63cb5f", "#60ca60", "#5ec962", "#5cc863", "#5ac864", "#58c765", "#56c667", "#54c568", "#52c569", "#50c46a", "#4ec36b", "#4cc26c", "#4ac16d", "#48c16e", "#46c06f", "#44bf70", "#42be71", "#40bd72", "#3fbc73", "#3dbc74", "#3bbb75", "#3aba76", "#38b977", "#37b878", "#35b779", "#34b679", "#32b67a", "#31b57b", "#2fb47c", "#2eb37c", "#2db27d", "#2cb17e", "#2ab07f", "#29af7f", "#28ae80", "#27ad81", "#26ad81", "#25ac82", "#25ab82", "#24aa83", "#23a983", "#22a884", "#22a785", "#21a685", "#21a585", "#20a486", "#20a386", "#1fa287", "#1fa187", "#1fa188", "#1fa088", "#1f9f88", "#1f9e89", "#1e9d89", "#1e9c89", "#1e9b8a", "#1f9a8a", "#1f998a", "#1f988b", "#1f978b", "#1f968b", "#1f958b", "#1f948c", "#20938c", "#20928c", "#20928c", "#21918c", "#21908d", "#218f8d", "#218e8d", "#228d8d", "#228c8d", "#228b8d", "#238a8d", "#23898e", "#23888e", "#24878e", "#24868e", "#25858e", "#25848e", "#25838e", "#26828e", "#26828e", "#26818e", "#27808e", "#277f8e", "#277e8e", "#287d8e", "#287c8e", "#297b8e", "#297a8e", "#29798e", "#2a788e", "#2a778e", "#2a768e", "#2b758e", "#2b748e", "#2c738e", "#2c728e", "#2c718e", "#2d718e", "#2d708e", "#2e6f8e", "#2e6e8e", "#2e6d8e", "#2f6c8e", "#2f6b8e", "#306a8e", "#30698e", "#31688e", "#31678e", "#31668e", "#32658e", "#32648e", "#33638d", "#33628d", "#34618d", "#34608d", "#355f8d", "#355e8d", "#365d8d", "#365c8d", "#375b8d", "#375a8c", "#38598c", "#38588c", "#39568c", "#39558c", "#3a548c", "#3a538b", "#3b528b", "#3b518b", "#3c508b", "#3c4f8a", "#3d4e8a", "#3d4d8a", "#3e4c8a", "#3e4a89", "#3e4989", "#3f4889", "#3f4788", "#404688", "#404588", "#414487", "#414287", "#424186", "#424086", "#423f85", "#433e85", "#433d84", "#443b84", "#443a83", "#443983", "#453882", "#453781", "#453581", "#463480", "#46337f", "#46327e", "#46307e", "#472f7d", "#472e7c", "#472d7b", "#472c7a", "#472a7a", "#482979", "#482878", "#482677", "#482576", "#482475", "#482374", "#482173", "#482071", "#481f70", "#481d6f", "#481c6e", "#481b6d", "#481a6c", "#48186a", "#481769", "#481668", "#481467", "#471365", "#471164", "#471063", "#470e61", "#470d60", "#460b5e", "#460a5d", "#46085c", "#46075a", "#450559", "#450457", "#440256", "#440154"],
	        // jscs:enable

	        defaultClassBrewer: _underscore2.default.times(20, function (i) {
	            return 'color20-' + (1 + i);
	        }),

	        log: function log(msg, type) {
	            type = type || 'INFO';
	            if (!Array.isArray(msg)) {
	                msg = [msg];
	            }
	            console[type.toLowerCase()].apply(console, msg); // eslint-disable-line
	        },

	        facetLabelDelimiter: ' → ',
	        excludeNull: true,
	        specEngine: [{
	            name: 'COMPACT',
	            width: 600
	        }, {
	            name: 'AUTO',
	            width: Number.MAX_VALUE
	        }],

	        fitModel: 'normal',
	        layoutEngine: 'EXTRACT',
	        autoRatio: true,
	        defaultSourceMap: ['https://raw.githubusercontent.com', 'TargetProcess/tauCharts/master/src/addons', 'world-countries.json'].join('/'),

	        getAxisTickLabelSize: _underscore2.default.memoize(_utilsDom.utilsDom.getAxisTickLabelSize, function (text) {
	            return (text || '').length;
	        }),

	        getScrollBarWidth: _underscore2.default.memoize(_utilsDom.utilsDom.getScrollbarWidth),

	        xAxisTickLabelLimit: 150,
	        yAxisTickLabelLimit: 150,

	        xTickWordWrapLinesLimit: 2,
	        yTickWordWrapLinesLimit: 2,

	        xTickWidth: 6 + 3,
	        yTickWidth: 6 + 3,

	        distToXAxisLabel: 10,
	        distToYAxisLabel: 10,

	        xAxisPadding: 20,
	        yAxisPadding: 20,

	        xFontLabelHeight: 10,
	        yFontLabelHeight: 10,

	        xDensityPadding: 2,
	        yDensityPadding: 2,
	        'xDensityPadding:measure': 8,
	        'yDensityPadding:measure': 8,

	        defaultFormats: {
	            measure: 'x-num-auto',
	            'measure:time': 'x-time-auto'
	        }
	    }
	};

	_tau2.Plot.__api__ = api;
	_tau2.Plot.globalSettings = api.globalSettings;

	[['COORDS.RECT', _coords.Cartesian], ['COORDS.MAP', _coords3.GeoMap], ['COORDS.PARALLEL', _coords2.Parallel], ['ELEMENT.POINT', _element.Point], ['ELEMENT.LINE', _element4.Line], ['ELEMENT.PATH', _element3.Path], ['ELEMENT.AREA', _element2.Area], ['ELEMENT.INTERVAL', _element5.Interval], ['ELEMENT.INTERVAL.STACKED', _elementInterval.StackedInterval], ['PARALLEL/ELEMENT.LINE', _elementParallel.ParallelLine]].reduce(function (memo, nv) {
	    return memo.reg(nv[0], nv[1]);
	}, api.unitsRegistry);

	[['color', _color.ColorScale, function (config, settings) {
	    return _underscore2.default.defaults(config, {
	        nice: settings.defaultNiceColor,
	        brewer: config.dimType === 'measure' ? settings.defaultColorBrewer : settings.defaultClassBrewer
	    });
	}], ['fill', _fill.FillScale], ['size', _size.SizeScale], ['ordinal', _ordinal.OrdinalScale], ['period', _period.PeriodScale], ['time', _time.TimeScale], ['linear', _linear.LinearScale], ['value', _value.ValueScale]].reduce(function (memo, nv) {
	    return memo.reg.apply(memo, _toConsumableArray(nv));
	}, api.scalesRegistry);

	var commonRules = [function (config) {
	    return !config.data ? ['[data] must be specified'] : [];
	}];

	api.chartTypesRegistry = _chartAliasRegistry.chartTypesRegistry.add('scatterplot', _chartScatterplot.ChartScatterplot, commonRules).add('line', _chartLine.ChartLine, commonRules).add('area', _chartArea.ChartArea, commonRules).add('bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_underscore2.default.defaults(cfg, { flip: false }));
	}, commonRules).add('horizontalBar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_underscore2.default.defaults({ flip: true }, cfg));
	}, commonRules).add('horizontal-bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_underscore2.default.defaults({ flip: true }, cfg));
	}, commonRules).add('stacked-bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_underscore2.default.defaults({ flip: false, stack: true }, cfg));
	}, commonRules).add('horizontal-stacked-bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_underscore2.default.defaults({ flip: true, stack: true }, cfg));
	}, commonRules).add('map', _chartMap.ChartMap, commonRules.concat([function (config) {
	    var shouldSpecifyFillWithCode = config.fill && config.code;
	    if (config.fill && !shouldSpecifyFillWithCode) {
	        return '[code] must be specified when using [fill]';
	    }
	}, function (config) {
	    var shouldSpecifyBothLatLong = config.latitude && config.longitude;
	    if ((config.latitude || config.longitude) && !shouldSpecifyBothLatLong) {
	        return '[latitude] and [longitude] both must be specified';
	    }
	}])).add('parallel', _chartParallel.ChartParallel, commonRules.concat([function (config) {
	    var shouldSpecifyColumns = config.columns && config.columns.length > 1;
	    if (!shouldSpecifyColumns) {
	        return '[columns] property must contain at least 2 dimensions';
	    }
	}]));

	exports.GPL = _tau.GPL;
	exports.Plot = _tau2.Plot;
	exports.Chart = _tau3.Chart;
	exports.__api__ = __api__;
	exports.api = api;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.utilsDom = undefined;

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var tempDiv = document.createElement('div'); /**
	                                              * Internal method to return CSS value for given element and property
	                                              */

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

	        var compiled = _underscore2.default.template(tmpl);

	        var div = document.createElement('div');
	        div.style.position = 'absolute';
	        div.style.visibility = 'hidden';
	        div.style.width = '100px';
	        div.style.height = '100px';
	        div.style.border = '1px solid green';
	        document.body.appendChild(div);

	        div.innerHTML = compiled({ xTick: text });

	        var textNode = _d2.default.select(div).selectAll('.x.axis .tick text')[0][0];

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
	    },

	    getLabelSize: function getLabelSize(text, _ref) {
	        var fontSize = _ref.fontSize;
	        var fontFamily = _ref.fontFamily;
	        var fontWeight = _ref.fontWeight;


	        var xFontSize = typeof fontSize === 'string' ? fontSize : fontSize + 'px';
	        var w = 0;
	        var h = 0;
	        var l = text.length - 1;
	        for (var i = 0; i <= l; i++) {
	            var char = text.charAt(i);
	            var s = utilsDom.getCharSize(char, { fontSize: xFontSize, fontFamily: fontFamily, fontWeight: fontWeight });
	            w += s.width;
	            h = Math.max(h, s.height);
	        }

	        return { width: w, height: h };
	    },

	    getCharSize: _underscore2.default.memoize(function (char, _ref2) {
	        var fontSize = _ref2.fontSize;
	        var fontFamily = _ref2.fontFamily;
	        var fontWeight = _ref2.fontWeight;


	        var div = document.createElement('div');
	        div.style.position = 'absolute';
	        div.style.visibility = 'hidden';
	        div.style.border = '0px';
	        div.style.fontSize = fontSize;
	        div.style.fontFamily = fontFamily;
	        div.style.fontWeight = fontWeight;

	        document.body.appendChild(div);

	        div.innerHTML = char === ' ' ? '&nbsp;' : char;

	        var size = {
	            width: 0,
	            height: 0
	        };

	        // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
	        var rect = div.getBoundingClientRect();
	        size.width = rect.right - rect.left;
	        size.height = rect.bottom - rect.top;

	        document.body.removeChild(div);

	        return size;
	    }, function (char, props) {
	        return char + '_' + JSON.stringify(props);
	    })
	};
	exports.utilsDom = utilsDom;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.utils = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _element = __webpack_require__(5);

	var _element2 = __webpack_require__(16);

	var _element3 = __webpack_require__(19);

	var _element4 = __webpack_require__(20);

	var _elementInterval = __webpack_require__(21);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

	var deepClone = function () {

	    // clone objects, skip other types.
	    function clone(target) {
	        if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) == 'object') {
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
	            // eslint-disable-line
	            return false;
	        },

	        // starts the deep copying process by creating the copy object.  You
	        // can initialize any properties you want, but you can't call recursively
	        // into the DeeopCopyAlgorithm.
	        create: function create(source) {// eslint-disable-line
	        },

	        // Completes the deep copy of the source object by populating any properties
	        // that need to be recursively deep copied.  You can do this by using the
	        // provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
	        // cyclic references for objects already deepCopied, including the source object
	        // itself.  The "result" passed in is the object returned from create().
	        populate: function populate(deepCopyAlgorithm, source, result) {// eslint-disable-line
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
	            if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
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
	}();
	var chartElement = [_element4.Interval, _element.Point, _element2.Line, _element3.Area, _elementInterval.StackedInterval];

	var testColorCode = function testColorCode(x) {
	    return (/^(#|rgb\(|rgba\()/.test(x)
	    );
	};

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
	        return element instanceof _element2.Line;
	    },
	    niceZeroBased: function niceZeroBased(domain) {

	        var m = 10;

	        var low = parseFloat(Math.min.apply(null, domain).toFixed(15));
	        var top = parseFloat(Math.max.apply(null, domain).toFixed(15));

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
	        /*eslint-disable */
	        while (err > correction[++i][0]) {} // jscs:ignore disallowEmptyBlocks
	        /*eslint-enable */

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
	        var xHash = _underscore2.default.memoize(function (data, keys) {
	            return (0, _underscore2.default)(data).chain().map(function (row) {
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
	                return _underscore2.default.values(xHash(data, keys)).reduce(function (sum, v) {
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
	    },

	    throttleLastEvent: function throttleLastEvent(last, eventType, handler) {
	        var limitFromPrev = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];


	        return function () {
	            var curr = { e: eventType, ts: new Date() };
	            var diff = last.e && last.e === curr.e ? curr.ts - last.ts : limitFromPrev;

	            if (diff >= limitFromPrev) {
	                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                    args[_key] = arguments[_key];
	                }

	                handler.apply(this, args);
	            }

	            last.e = curr.e;
	            last.ts = curr.ts;
	        };
	    },

	    splitEvenly: function splitEvenly(domain, parts) {
	        var min = domain[0];
	        var max = domain[1];
	        var segment = (max - min) / (parts - 1);
	        var chunks = _underscore2.default.times(parts - 2, function (n) {
	            return min + segment * (n + 1);
	        });
	        return [min].concat(chunks).concat(max);
	    },

	    extRGBColor: function extRGBColor(x) {
	        return testColorCode(x) ? x : '';
	    },

	    extCSSClass: function extCSSClass(x) {
	        return testColorCode(x) ? '' : x;
	    },

	    toRadian: function toRadian(degree) {
	        return degree / 180 * Math.PI;
	    }
	};

	exports.utils = utils;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Point = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _const = __webpack_require__(6);

	var _element = __webpack_require__(7);

	var _cartesianGrammar = __webpack_require__(9);

	var _layerLabels = __webpack_require__(11);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Point = exports.Point = function (_Element) {
	    _inherits(Point, _Element);

	    function Point(config) {
	        _classCallCheck(this, Point);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Point).call(this, config));

	        _this.config = config;

	        _this.config.guide = _underscore2.default.defaults(_this.config.guide || {}, {
	            prettify: true,
	            enableColorToBarPosition: false
	        });

	        _this.config.guide.size = _underscore2.default.defaults(_this.config.guide.size || {}, {
	            defMinSize: 10,
	            defMaxSize: _this.isEmptySize ? 10 : 40, // TODO: fix when pass scales to constructor
	            enableDistributeEvenly: !_this.isEmptySize
	        });

	        _this.config.guide.label = _underscore2.default.defaults(_this.config.guide.label || {}, {
	            position: ['auto:avoid-label-label-overlap', 'auto:avoid-label-anchor-overlap', 'auto:hide-on-label-label-overlap'
	            // 'auto:hide-on-label-edges-overlap'
	            ]
	        });

	        _this.defMin = config.guide.size.defMinSize;
	        _this.defMax = config.guide.size.defMaxSize;
	        _this.minLimit = config.guide.size.minSize;
	        _this.maxLimit = config.guide.size.maxSize;

	        _this.isHorizontal = false;

	        var enableStack = _this.config.stack;
	        var enableColorPositioning = _this.config.guide.enableColorToBarPosition;
	        var enableDistributeEvenly = _this.config.guide.size.enableDistributeEvenly;

	        _this.decorators = [_cartesianGrammar.CartesianGrammar.decorator_orientation, _cartesianGrammar.CartesianGrammar.decorator_groundY0, _cartesianGrammar.CartesianGrammar.decorator_group, enableStack && _cartesianGrammar.CartesianGrammar.decorator_stack, enableColorPositioning && _cartesianGrammar.CartesianGrammar.decorator_positioningByColor, _cartesianGrammar.CartesianGrammar.decorator_dynamic_size, _cartesianGrammar.CartesianGrammar.decorator_color, _cartesianGrammar.CartesianGrammar.decorator_label, config.adjustPhase && enableStack && _cartesianGrammar.CartesianGrammar.adjustYScale, config.adjustPhase && (enableDistributeEvenly ? _cartesianGrammar.CartesianGrammar.adjustSigmaSizeScale : _cartesianGrammar.CartesianGrammar.adjustStaticSizeScale)];

	        _this.on('highlight', function (sender, e) {
	            return _this.highlight(e);
	        });
	        return _this;
	    }

	    _createClass(Point, [{
	        key: 'createScales',
	        value: function createScales(fnCreateScale) {

	            var config = this.config;

	            this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
	            this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
	            this.size = fnCreateScale('size', config.size, {});
	            this.color = fnCreateScale('color', config.color, {});
	            this.split = fnCreateScale('split', config.split, {});
	            this.label = fnCreateScale('label', config.label, {});

	            var sortDesc = function sortDesc(a, b) {
	                var discreteA = a.discrete ? 1 : 0;
	                var discreteB = b.discrete ? 1 : 0;
	                return discreteB * b.domain().length - discreteA * a.domain().length;
	            };

	            this.isHorizontal = this.yScale === [this.xScale, this.yScale].sort(sortDesc)[0];

	            return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color).regScale('split', this.split).regScale('label', this.label);
	        }
	    }, {
	        key: 'buildModel',
	        value: function buildModel(modelGoG, _ref) {
	            var colorScale = _ref.colorScale;


	            return {
	                x: this.isHorizontal ? modelGoG.yi : modelGoG.xi,
	                y: this.isHorizontal ? modelGoG.xi : modelGoG.yi,
	                size: modelGoG.size,
	                group: modelGoG.group,
	                color: function color(d) {
	                    return colorScale.toColor(modelGoG.color(d));
	                },
	                class: function _class(d) {
	                    return colorScale.toClass(modelGoG.color(d));
	                }
	            };
	        }
	    }, {
	        key: 'walkFrames',
	        value: function walkFrames(frames) {

	            var args = {
	                defMin: this.defMin,
	                defMax: this.defMax,
	                minLimit: this.minLimit,
	                maxLimit: this.maxLimit,
	                isHorizontal: this.isHorizontal,
	                dataSource: frames.reduce(function (memo, f) {
	                    return memo.concat(f.part());
	                }, [])
	            };

	            return this.decorators.filter(function (x) {
	                return x;
	            }).reduce(function (model, transform) {
	                return transform(model, args);
	            }, new _cartesianGrammar.CartesianGrammar({
	                scaleX: this.xScale,
	                scaleY: this.yScale,
	                scaleSize: this.size,
	                scaleLabel: this.label,
	                scaleColor: this.color,
	                scaleSplit: this.split
	            }));
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames(frames) {

	            var self = this;

	            var options = this.config.options;

	            var prefix = _const.CSS_PREFIX + 'dot dot i-role-element i-role-datum';

	            var fullData = frames.reduce(function (memo, f) {
	                return memo.concat(f.part());
	            }, []);

	            var modelGoG = this.walkFrames(frames);
	            var model = this.buildModel(modelGoG, { colorScale: this.color });

	            var kRound = 10000;
	            var attr = {
	                r: function r(d) {
	                    return Math.round(kRound * model.size(d) / 2) / kRound;
	                },
	                cx: function cx(d) {
	                    return model.x(d);
	                },
	                cy: function cy(d) {
	                    return model.y(d);
	                },
	                fill: function fill(d) {
	                    return model.color(d);
	                },
	                class: function _class(d) {
	                    return prefix + ' ' + model.class(d);
	                }
	            };

	            var enter = function enter() {
	                return this.attr(attr).transition().duration(500).attr('r', attr.r);
	            };

	            var update = function update() {
	                return this.attr(attr);
	            };

	            var updateGroups = function updateGroups() {

	                this.attr('class', 'frame-id-' + options.uid).call(function () {
	                    var dots = this.selectAll('circle').data(function (fiber) {
	                        return fiber;
	                    });
	                    dots.exit().remove();
	                    dots.call(update);
	                    dots.enter().append('circle').call(enter);

	                    self.subscribe(dots);
	                });
	            };

	            var groups = _underscore2.default.groupBy(fullData, model.group);
	            var fibers = Object.keys(groups).reduce(function (memo, k) {
	                return memo.concat([groups[k]]);
	            }, []);

	            var frameGroups = options.container.selectAll('.frame-id-' + options.uid).data(fibers);
	            frameGroups.exit().remove();
	            frameGroups.call(updateGroups);
	            frameGroups.enter().append('g').call(updateGroups);

	            self.subscribe(new _layerLabels.LayerLabels(modelGoG, this.isHorizontal, this.config.guide.label, options).draw(fibers));
	        }
	    }, {
	        key: 'highlight',
	        value: function highlight(filter) {
	            var _container$selectAll$, _container$selectAll$2;

	            var x = 'graphical-report__highlighted';
	            var _ = 'graphical-report__dimmed';

	            var container = this.config.options.container;

	            container.selectAll('.dot').classed((_container$selectAll$ = {}, _defineProperty(_container$selectAll$, x, function (d) {
	                return filter(d) === true;
	            }), _defineProperty(_container$selectAll$, _, function (d) {
	                return filter(d) === false;
	            }), _container$selectAll$));

	            container.selectAll('.i-role-label').classed((_container$selectAll$2 = {}, _defineProperty(_container$selectAll$2, x, function (d) {
	                return filter(d) === true;
	            }), _defineProperty(_container$selectAll$2, _, function (d) {
	                return filter(d) === false;
	            }), _container$selectAll$2));
	        }
	    }]);

	    return Point;
	}(_element.Element);

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var CSS_PREFIX = exports.CSS_PREFIX = 'graphical-report__';

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Element = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _event = __webpack_require__(8);

	var _utils = __webpack_require__(4);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Element = exports.Element = function (_Emitter) {
	    _inherits(Element, _Emitter);

	    // add base behaviour here

	    function Element(config) {
	        _classCallCheck(this, Element);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Element).call(this, config));

	        _this._elementNameSpace = config.namespace || 'default';
	        _this._elementScalesHub = {};

	        // TODO: fix when pass scales to constructor
	        _this.isEmptySize = !config.size || config.size.indexOf('size_undefined') === 0 || config.size.indexOf('size_null') === 0;
	        return _this;
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
	        key: 'fireNameSpaceEvent',
	        value: function fireNameSpaceEvent(eventName, eventData) {
	            var namespace = this._elementNameSpace;
	            this.fire(eventName + '.' + namespace, eventData);
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
	            var last = {};
	            [{
	                event: 'mouseover',
	                limit: 0
	            }, {
	                event: 'mouseout',
	                limit: 0
	            }, {
	                event: 'click',
	                limit: 0
	            }, {
	                event: 'mousemove',
	                limit: 25
	            }].forEach(function (item) {
	                var eventName = item.event;
	                var limit = item.limit;

	                var callback = function callback(d) {
	                    var eventData = {
	                        data: dataInterceptor.call(this, d),
	                        event: eventInterceptor.call(this, _d2.default.event, d)
	                    };
	                    self.fire(eventName, eventData);
	                    self.fireNameSpaceEvent(eventName, eventData);
	                };

	                sel.on(eventName, _utils.utils.throttleLastEvent(last, eventName, callback, limit));
	            });
	        }
	    }, {
	        key: 'walkFrames',
	        value: function walkFrames() {
	            // do nothing by default
	        }
	    }]);

	    return Element;
	}(_event.Emitter);

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
	        eventFunction = function eventFunction() {
	            var cursor = this;
	            var args;
	            var fn;
	            var i = 0;
	            var queue = [];
	            while (cursor = cursor.handler) {
	                // eslint-disable-line
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

	                    queue.unshift({
	                        fn: fn,
	                        context: cursor.context,
	                        args: args
	                    });
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

	                    queue.unshift({
	                        fn: fn,
	                        context: cursor.context,
	                        args: [{
	                            sender: this,
	                            type: eventName,
	                            args: args
	                        }]
	                    });
	                }
	            }

	            queue.forEach(function (item) {
	                return item.fn.apply(item.context, item.args);
	            });
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

	var Emitter = function () {
	    /**
	     * @constructor
	     */

	    function Emitter() {
	        _classCallCheck(this, Emitter);

	        this.handler = null;
	        this.emit_destroy = createDispatcher('destroy');
	    }

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
	}();

	//
	// export names
	//


	exports.Emitter = Emitter;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.CartesianGrammar = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _error = __webpack_require__(10);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var delimiter = '(@taucharts@)';
	var synthetic = 'taucharts_synthetic_record';

	var CartesianGrammar = exports.CartesianGrammar = function () {
	    function CartesianGrammar(model) {
	        _classCallCheck(this, CartesianGrammar);

	        var createFunc = function createFunc(x) {
	            return function () {
	                return x;
	            };
	        };
	        this.scaleX = model.scaleX;
	        this.scaleY = model.scaleY;
	        this.scaleSize = model.scaleSize;
	        this.scaleLabel = model.scaleLabel;
	        this.scaleColor = model.scaleColor;
	        this.scaleSplit = model.scaleSplit;

	        this.y0 = model.y0 || createFunc(0);
	        this.yi = model.yi || createFunc(0);
	        this.xi = model.xi || createFunc(0);
	        this.size = model.size || createFunc(1);
	        this.label = model.label || createFunc('');
	        this.color = model.color || createFunc('');
	        this.group = model.group || createFunc('');
	        this.order = model.order || createFunc(0);
	    }

	    _createClass(CartesianGrammar, null, [{
	        key: 'compose',
	        value: function compose(prev) {
	            var updates = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            return Object.keys(updates).reduce(function (memo, propName) {
	                memo[propName] = updates[propName];
	                return memo;
	            }, new CartesianGrammar(prev));
	        }
	    }, {
	        key: 'decorator_identity',
	        value: function decorator_identity(model) {
	            return CartesianGrammar.compose(model);
	        }
	    }, {
	        key: 'decorator_orientation',
	        value: function decorator_orientation(model, _ref) {
	            var isHorizontal = _ref.isHorizontal;


	            var baseScale = isHorizontal ? model.scaleY : model.scaleX;
	            var valsScale = isHorizontal ? model.scaleX : model.scaleY;

	            return CartesianGrammar.compose(model, {
	                scaleX: baseScale,
	                scaleY: valsScale,
	                yi: function yi(d) {
	                    return valsScale.value(d[valsScale.dim]);
	                },
	                xi: function xi(d) {
	                    return baseScale.value(d[baseScale.dim]);
	                }
	            });
	        }
	    }, {
	        key: 'decorator_groundY0',
	        value: function decorator_groundY0(model, _ref2) {
	            var isHorizontal = _ref2.isHorizontal;

	            var k = isHorizontal ? -0.5 : 0.5;
	            var ys = model.scaleY.domain();
	            var min = ys[0];

	            // NOTE: max also can be below 0
	            var _y = model.scaleY.discrete ? model.scaleY.value(min) + model.scaleY.stepSize(min) * k : model.scaleY.value(Math.max(0, Math.min.apply(Math, _toConsumableArray(ys))));

	            return CartesianGrammar.compose(model, {
	                y0: function y0() {
	                    return _y;
	                }
	            });
	        }
	    }, {
	        key: 'decorator_dynamic_size',
	        value: function decorator_dynamic_size(model, _ref3) {
	            _objectDestructuringEmpty(_ref3);

	            return CartesianGrammar.compose(model, {
	                size: function size(d) {
	                    return model.size(d) * model.scaleSize.value(d[model.scaleSize.dim]);
	                }
	            });
	        }
	    }, {
	        key: 'decorator_positioningByColor',
	        value: function decorator_positioningByColor(model, params) {
	            var method = model.scaleX.discrete ? CartesianGrammar.decorator_discrete_positioningByColor : CartesianGrammar.decorator_identity;

	            return method(model, params);
	        }
	    }, {
	        key: 'decorator_discrete_positioningByColor',
	        value: function decorator_discrete_positioningByColor(model, _ref4) {
	            _objectDestructuringEmpty(_ref4);

	            var baseScale = model.scaleX;
	            var categories = model.scaleColor.domain();
	            var categoriesCount = categories.length || 1;
	            var colorIndexScale = function colorIndexScale(d) {
	                return Math.max(0, categories.indexOf(d[model.scaleColor.dim]));
	            }; // -1 (not found) to 0
	            var space = function space(d) {
	                return baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount));
	            };

	            return CartesianGrammar.compose(model, {
	                xi: function xi(d) {
	                    var availableSpace = space(d);
	                    var absTickStart = model.xi(d) - availableSpace / 2;
	                    var middleStep = availableSpace / (categoriesCount + 1);
	                    var relSegmStart = (1 + colorIndexScale(d)) * middleStep;
	                    return absTickStart + relSegmStart;
	                }
	            });
	        }
	    }, {
	        key: 'decorator_color',
	        value: function decorator_color(model, _ref5) {
	            _objectDestructuringEmpty(_ref5);

	            return CartesianGrammar.compose(model, {
	                color: function color(d) {
	                    return model.scaleColor.value(d[model.scaleColor.dim]);
	                }
	            });
	        }
	    }, {
	        key: 'decorator_label',
	        value: function decorator_label(model, _ref6) {
	            _objectDestructuringEmpty(_ref6);

	            return CartesianGrammar.compose(model, {
	                label: function label(d) {
	                    return model.scaleLabel.value(d[model.scaleLabel.dim]);
	                }
	            });
	        }
	    }, {
	        key: 'decorator_group',
	        value: function decorator_group(model, _ref7) {
	            _objectDestructuringEmpty(_ref7);

	            return CartesianGrammar.compose(model, {
	                group: function group(d) {
	                    return '' + d[model.scaleColor.dim] + delimiter + d[model.scaleSplit.dim];
	                }
	            });
	        }
	    }, {
	        key: 'decorator_groupOrderByColor',
	        value: function decorator_groupOrderByColor(model, _ref8) {
	            _objectDestructuringEmpty(_ref8);

	            var _order = model.scaleColor.domain();

	            return CartesianGrammar.compose(model, {
	                order: function order(group) {
	                    var color = group.split(delimiter)[0];
	                    var i = _order.indexOf(color);
	                    return i < 0 ? Number.MAX_VALUE : i;
	                }
	            });
	        }
	    }, {
	        key: 'decorator_groupOrderByAvg',
	        value: function decorator_groupOrderByAvg(model, _ref9) {
	            var dataSource = _ref9.dataSource;


	            var avg = function avg(arr) {
	                return arr.map(model.yi).reduce(function (sum, i) {
	                    return sum + i;
	                }, 0) / arr.length;
	            };

	            var groups = dataSource.reduce(function (memo, row) {
	                var k = model.group(row);
	                memo[k] = memo[k] || [];
	                memo[k].push(row);
	                return memo;
	            }, {});

	            var _order2 = Object.keys(groups).map(function (k) {
	                return [k, avg(groups[k])];
	            }).sort(function (a, b) {
	                return a[1] - b[1];
	            }).map(function (r) {
	                return r[0];
	            });

	            return CartesianGrammar.compose(model, {
	                order: function order(group) {
	                    var i = _order2.indexOf(group);
	                    return i < 0 ? Number.MAX_VALUE : i;
	                }
	            });
	        }
	    }, {
	        key: 'decorator_stack',
	        value: function decorator_stack(model, _ref10) {
	            _objectDestructuringEmpty(_ref10);

	            var xScale = model.scaleX;
	            var yScale = model.scaleY;

	            if (yScale.discrete || yScale.domain().some(function (x) {
	                return typeof x !== 'number';
	            })) {
	                throw new _error.TauChartError('Stacked field [' + yScale.dim + '] should be a number', _error.errorCodes.STACKED_FIELD_NOT_NUMBER, { field: yScale.dim });
	            }

	            var createFnStack = function createFnStack(totalState) {
	                return function (d) {
	                    var x = d[xScale.dim];
	                    var y = d[yScale.dim];

	                    var isPositive = d[synthetic] ? d[synthetic + 'sign'] === 'positive' : y >= 0;
	                    var state = isPositive ? totalState.positive : totalState.negative;

	                    var prevStack = state[x] || 0;
	                    var nextStack = prevStack + y;
	                    state[x] = nextStack;

	                    return { isPositive: isPositive, nextStack: nextStack, prevStack: prevStack };
	                };
	            };

	            var stackYi = createFnStack({ positive: {}, negative: {} });
	            var stackY0 = createFnStack({ positive: {}, negative: {} });

	            var seq = [];
	            var memoize = function memoize(fn) {
	                return _underscore2.default.memoize(fn, function (d) {
	                    var i = seq.indexOf(d);
	                    if (i < 0) {
	                        i = seq.push(d) - 1;
	                    }
	                    return i;
	                });
	            };

	            return CartesianGrammar.compose(model, {
	                yi: memoize(function (d) {
	                    return yScale.value(stackYi(d).nextStack);
	                }),
	                y0: memoize(function (d) {
	                    return yScale.value(stackY0(d).prevStack);
	                })
	            });
	        }
	    }, {
	        key: 'decorator_size_distribute_evenly',
	        value: function decorator_size_distribute_evenly(model, _ref11) {
	            var dataSource = _ref11.dataSource;
	            var minLimit = _ref11.minLimit;
	            var maxLimit = _ref11.maxLimit;
	            var defMin = _ref11.defMin;
	            var defMax = _ref11.defMax;


	            var asc = function asc(a, b) {
	                return a - b;
	            };

	            var stepSize = model.scaleX.discrete ? model.scaleX.stepSize() / 2 : Number.MAX_VALUE;

	            var xs = dataSource.map(function (row) {
	                return model.xi(row);
	            }).sort(asc);

	            var prev = xs[0];
	            var diff = xs.slice(1).map(function (curr) {
	                var diff = curr - prev;
	                prev = curr;
	                return diff;
	            }).filter(function (diff) {
	                return diff > 0;
	            }).sort(asc).concat(Number.MAX_VALUE)[0];

	            var minDiff = Math.min(diff, stepSize);

	            var currMinSize = typeof minLimit === 'number' ? minLimit : defMin;
	            var curr = {
	                minSize: currMinSize,
	                maxSize: typeof maxLimit === 'number' ? maxLimit : Math.max(currMinSize, Math.min(defMax, minDiff))
	            };

	            model.scaleSize.fixup(function (prev) {

	                var next = {};

	                if (!prev.fixed) {
	                    next.fixed = true;
	                    next.minSize = curr.minSize;
	                    next.maxSize = curr.maxSize;
	                } else {
	                    if (prev.maxSize > curr.maxSize) {
	                        next.maxSize = curr.maxSize;
	                    }
	                }

	                return next;
	            });

	            return model;
	        }
	    }, {
	        key: 'adjustYScale',
	        value: function adjustYScale(model, _ref12) {
	            var dataSource = _ref12.dataSource;


	            var minY = Number.MAX_VALUE;
	            var maxY = Number.MIN_VALUE;
	            var trackY = function trackY(y) {
	                minY = y < minY ? y : minY;
	                maxY = y > maxY ? y : maxY;
	            };

	            var scaleY = model.scaleY.value;
	            model.scaleY.value = function (y) {
	                trackY(y);
	                return scaleY(y);
	            };

	            dataSource.forEach(function (row) {
	                model.yi(row);
	                model.y0(row);
	            });

	            model.scaleY.fixup(function (yScaleConfig) {

	                var newConf = {};

	                if (!yScaleConfig.hasOwnProperty('max') || yScaleConfig.max < maxY) {
	                    newConf.max = maxY;
	                }

	                if (!yScaleConfig.hasOwnProperty('min') || yScaleConfig.min > minY) {
	                    newConf.min = minY;
	                }

	                return newConf;
	            });

	            return model;
	        }
	    }, {
	        key: 'adjustStaticSizeScale',
	        value: function adjustStaticSizeScale(model, _ref13) {
	            var minLimit = _ref13.minLimit;
	            var maxLimit = _ref13.maxLimit;
	            var defMin = _ref13.defMin;
	            var defMax = _ref13.defMax;


	            var curr = {
	                minSize: typeof minLimit === 'number' ? minLimit : defMin,
	                maxSize: typeof maxLimit === 'number' ? maxLimit : defMax
	            };

	            model.scaleSize.fixup(function (prev) {

	                var next = {};

	                if (!prev.fixed) {
	                    next.fixed = true;
	                    next.minSize = curr.minSize;
	                    next.maxSize = curr.maxSize;
	                }

	                return next;
	            });

	            return model;
	        }
	    }, {
	        key: 'adjustSigmaSizeScale',
	        value: function adjustSigmaSizeScale(model, _ref14) {
	            var dataSource = _ref14.dataSource;
	            var minLimit = _ref14.minLimit;
	            var maxLimit = _ref14.maxLimit;
	            var defMin = _ref14.defMin;
	            var defMax = _ref14.defMax;


	            var asc = function asc(a, b) {
	                return a - b;
	            };

	            var xs = dataSource.map(function (row) {
	                return model.xi(row);
	            }).sort(asc);

	            var prev = xs[0];
	            var diffX = xs.slice(1).map(function (curr) {
	                var diff = curr - prev;
	                prev = curr;
	                return diff;
	            }).filter(function (diff) {
	                return diff > 0;
	            }).sort(asc).concat(Number.MAX_VALUE)[0];

	            var stepSize = model.scaleX.discrete ? model.scaleX.stepSize() / 2 : Number.MAX_VALUE;

	            var maxSize = Math.min(diffX, stepSize);

	            var currMinSize = typeof minLimit === 'number' ? minLimit : defMin;
	            var maxSizeLimit = typeof maxLimit === 'number' ? maxLimit : defMax;

	            var sigma = function sigma(x) {
	                var Ab = (currMinSize + maxSizeLimit) / 2;
	                var At = maxSizeLimit;
	                var X0 = currMinSize;
	                var Wx = 0.5;

	                return Math.round(Ab + (At - Ab) / (1 + Math.exp(-(x - X0) / Wx)));
	            };

	            var curr = {
	                minSize: currMinSize,
	                maxSize: Math.max(currMinSize, Math.min(maxSizeLimit, sigma(maxSize)))
	            };

	            model.scaleSize.fixup(function (prev) {

	                var next = {};

	                if (!prev.fixed) {
	                    next.fixed = true;
	                    next.minSize = curr.minSize;
	                    next.maxSize = curr.maxSize;
	                } else {
	                    if (prev.maxSize > curr.maxSize) {
	                        next.maxSize = curr.maxSize;
	                    }
	                }

	                return next;
	            });

	            return model;
	        }
	    }, {
	        key: 'toFibers',
	        value: function toFibers(data, model) {
	            var groups = _underscore2.default.groupBy(data, model.group);
	            return Object.keys(groups).sort(function (a, b) {
	                return model.order(a) - model.order(b);
	            }).reduce(function (memo, k) {
	                return memo.concat([groups[k]]);
	            }, []);
	        }
	    }, {
	        key: 'isNonSyntheticRecord',
	        value: function isNonSyntheticRecord(row) {
	            return row[synthetic] !== true;
	        }
	    }, {
	        key: 'toStackedFibers',
	        value: function toStackedFibers(data, model) {

	            var dx = model.scaleX.dim;
	            var dy = model.scaleY.dim;
	            var dc = model.scaleColor.dim;
	            var ds = model.scaleSplit.dim;

	            var sortedData = data.sort(function (a, b) {
	                return model.xi(a) - model.xi(b);
	            });

	            var xs = _underscore2.default.uniq(sortedData.map(function (row) {
	                return row[dx];
	            }), true);

	            var sign = function sign(row) {
	                return row[dy] >= 0 ? 'positive' : 'negative';
	            };

	            var gen = function gen(x, fi, sign) {
	                var r = {};
	                r[dx] = x;
	                r[dy] = 0;
	                r[ds] = fi[ds];
	                r[dc] = fi[dc];
	                r[synthetic] = true;
	                r[synthetic + 'sign'] = sign; // positive / negative
	                return r;
	            };

	            var merge = function merge(templateSorted, fiberSorted, sign) {
	                var groups = _underscore2.default.groupBy(fiberSorted, function (row) {
	                    return row[dx];
	                });
	                var sample = fiberSorted[0];
	                return templateSorted.reduce(function (memo, k) {
	                    return memo.concat(groups[k] || gen(k, sample, sign));
	                }, []);
	            };

	            var groups = _underscore2.default.groupBy(sortedData, model.group);
	            return Object.keys(groups).sort(function (a, b) {
	                return model.order(a) - model.order(b);
	            }).reduce(function (memo, k) {
	                var bySign = _underscore2.default.groupBy(groups[k], sign);
	                return Object.keys(bySign).reduce(function (memo, s) {
	                    return memo.concat([merge(xs, bySign[s], s)]);
	                }, memo);
	            }, []);
	        }
	    }]);

	    return CartesianGrammar;
	}();

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TauChartError = function (_Error) {
	    _inherits(TauChartError, _Error);

	    function TauChartError(message, errorCode, errorArgs) {
	        _classCallCheck(this, TauChartError);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TauChartError).call(this));

	        _this.name = 'TauChartError';
	        _this.message = message;
	        _this.errorCode = errorCode;
	        _this.errorArgs = errorArgs;
	        return _this;
	    }

	    return TauChartError;
	}(Error);

	var errorCodes = {
	    STACKED_FIELD_NOT_NUMBER: 'STACKED_FIELD_NOT_NUMBER',
	    NO_DATA: 'NO_DATA',
	    NOT_SUPPORTED_TYPE_CHART: 'NOT_SUPPORTED_TYPE_CHART',
	    UNKNOWN_UNIT_TYPE: 'UNKNOWN_UNIT_TYPE'
	};

	exports.TauChartError = TauChartError;
	exports.errorCodes = errorCodes;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LayerLabels = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _utilsDom = __webpack_require__(1);

	var _layerLabelsModel = __webpack_require__(12);

	var _layerLabelsRules = __webpack_require__(13);

	var _layerLabelsAnnealingSimulator = __webpack_require__(14);

	var _formatterRegistry = __webpack_require__(15);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var intersect = function intersect(x1, x2, x3, x4, y1, y2, y3, y4) {
	    // returns true if two lines intersect, else false
	    var mua, mub;
	    var denom, numera, numerb;

	    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
	    numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
	    numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

	    /* Is the intersection along the the segments */
	    mua = numera / denom;
	    mub = numerb / denom;

	    return !(mua < 0 || mua > 1 || mub < 0 || mub > 1);
	};

	var LayerLabels = exports.LayerLabels = function () {
	    function LayerLabels(model, isHorizontal, labelGuide, _ref) {
	        var width = _ref.width;
	        var height = _ref.height;
	        var container = _ref.container;

	        _classCallCheck(this, LayerLabels);

	        this.container = container;
	        this.w = width;
	        this.h = height;
	        var guide = _underscore2.default.defaults(labelGuide || {}, {
	            fontFamily: 'Helvetica, Arial, sans-serif',
	            fontWeight: 'normal',
	            fontSize: 10,
	            fontColor: '#000',
	            position: [],
	            tickFormat: null,
	            tickFormatNullAlias: ''
	        });

	        this.guide = guide;

	        var formatter = _formatterRegistry.FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias);

	        var seed = _layerLabelsModel.LayerLabelsModel.seed(model, {
	            fontSize: guide.fontSize,
	            fontColor: guide.fontColor,
	            flip: isHorizontal,
	            formatter: formatter,
	            labelRectSize: function labelRectSize(str) {
	                return _utilsDom.utilsDom.getLabelSize(str, guide);
	            },
	            paddingKoeff: 0.4
	        });

	        var args = { maxWidth: width, maxHeight: height };

	        var fixedPosition = guide.position.filter(function (token) {
	            return token.indexOf('auto:') === -1;
	        }).concat('keep-in-box');

	        this.textModel = fixedPosition.map(_layerLabelsRules.LayerLabelsRules.getRule).reduce(function (prev, rule) {
	            return _layerLabelsModel.LayerLabelsModel.compose(prev, rule(prev, args));
	        }, seed);
	    }

	    _createClass(LayerLabels, [{
	        key: 'draw',
	        value: function draw(fibers) {

	            var self = this;
	            var m = this.textModel;

	            var readBy3 = function readBy3(list, iterator) {
	                var l = list.length - 1;
	                var r = [];
	                for (var i = 0; i <= l; i++) {
	                    var iPrev = i === 0 ? i : i - 1;
	                    var iCurr = i;
	                    var iNext = i === l ? i : i + 1;
	                    r.push(iterator(list[iPrev], list[iCurr], list[iNext]));
	                }
	                return r;
	            };

	            var parallel = fibers.reduce(function (memo, f) {
	                var absFiber = f.map(function (row) {
	                    return {
	                        data: row,
	                        x: m.x(row),
	                        y: m.y(row),
	                        w: m.w(row),
	                        h: m.h(row),
	                        hide: m.hide(row),
	                        extr: null,
	                        size: m.model.size(row),
	                        label: m.label(row),
	                        color: m.color(row)
	                    };
	                });
	                memo.text = memo.text.concat(absFiber);
	                memo.edges = memo.edges.concat(readBy3(absFiber, function (prev, curr, next) {

	                    if (curr.y === Math.max(curr.y, prev.y, next.y)) {
	                        curr.extr = 'min';
	                    } else if (curr.y === Math.min(curr.y, prev.y, next.y)) {
	                        curr.extr = 'max';
	                    } else {
	                        curr.extr = 'norm';
	                    }

	                    return { x0: prev.x, x1: curr.x, y0: prev.y, y1: curr.y };
	                }));

	                return memo;
	            }, { text: [], edges: [] });

	            parallel.text = parallel.text.filter(function (r) {
	                return r.label;
	            }).map(function (r, i) {
	                return _underscore2.default.extend(r, { i: i });
	            });

	            var autoPosition = this.guide.position.filter(function (token) {
	                return token.indexOf('auto:') === 0;
	            });
	            parallel = parallel.text.length > 0 && autoPosition.length > 0 ? this.autoPosition(parallel, autoPosition) : parallel;

	            var labels = parallel.text;

	            var get = function get(prop) {
	                return function (__, i) {
	                    return labels[i][prop];
	                };
	            };

	            var update = function update() {
	                this.style('fill', get('color')).style('font-size', self.guide.fontSize).style('display', function (__, i) {
	                    return labels[i].hide ? 'none' : null;
	                }).attr('text-anchor', 'middle').attr('x', get('x')).attr('y', get('y')).text(get('label'));
	            };

	            var text = this.container.selectAll('.i-role-label').data(labels.map(function (r) {
	                return r.data;
	            }));
	            text.exit().remove();
	            text.call(update);
	            text.enter().append('text').attr('class', 'i-role-label').call(update);

	            return text;
	        }
	    }, {
	        key: 'autoPosition',
	        value: function autoPosition(parallel, tokens) {

	            var flags = tokens.reduce(function (memo, token) {
	                return _underscore2.default.extend(memo, _defineProperty({}, token, true));
	            }, {});

	            var penalties = {
	                'auto:avoid-label-label-overlap': function autoAvoidLabelLabelOverlap(labels, edges) {
	                    var penaltyRate = arguments.length <= 2 || arguments[2] === undefined ? 1.0 : arguments[2];

	                    return function (index) {
	                        var x21 = labels[index].x;
	                        var y21 = labels[index].y - labels[index].h + 2.0;
	                        var x22 = labels[index].x + labels[index].w;
	                        var y22 = labels[index].y + 2.0;

	                        return labels.reduce(function (sum, labi, i) {
	                            var k = i !== index;
	                            var x11 = labi.x;
	                            var y11 = labi.y - labi.h + 2.0;
	                            var x12 = labi.x + labi.w;
	                            var y12 = labi.y + 2.0;
	                            var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
	                            var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
	                            var overlap_area = x_overlap * y_overlap;
	                            return sum + k * (overlap_area * penaltyRate);
	                        }, 0);
	                    };
	                },
	                'auto:avoid-label-anchor-overlap': function autoAvoidLabelAnchorOverlap(labels, edges) {
	                    var penaltyRate = arguments.length <= 2 || arguments[2] === undefined ? 1.0 : arguments[2];

	                    return function (index) {
	                        var lab0 = labels[index];
	                        var x21 = lab0.x - lab0.w / 2;
	                        var x22 = lab0.x + lab0.w / 2;
	                        var y21 = lab0.y - lab0.h / 2 + 2.0;
	                        var y22 = lab0.y + lab0.h / 2 + 2.0;
	                        return labels.reduce(function (sum, anchor) {
	                            var x11 = anchor.x0 - anchor.size / 2;
	                            var x12 = anchor.x0 + anchor.size / 2;
	                            var y11 = anchor.y0 - anchor.size / 2;
	                            var y12 = anchor.y0 + anchor.size / 2;
	                            var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
	                            var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
	                            var overlap_area = x_overlap * y_overlap;
	                            return sum + overlap_area * penaltyRate;
	                        }, 0);
	                    };
	                },
	                'auto:avoid-label-edges-overlap': function autoAvoidLabelEdgesOverlap(labels, edges) {
	                    var penaltyRate = arguments.length <= 2 || arguments[2] === undefined ? 1.0 : arguments[2];

	                    return function (index) {
	                        var label = labels[index];
	                        var x0 = label.x - label.w / 2;
	                        var x1 = label.x + label.w / 2;
	                        var y0 = label.y - label.h / 2;
	                        var y1 = label.y + label.h / 2;
	                        return edges.reduce(function (sum, edge) {
	                            var overlapLeftTopRightBottom = intersect(x0, x1, edge.x0, edge.x1, y0, y1, edge.y0, edge.y1);
	                            var overlapLeftBottomRightTop = intersect(x0, x1, edge.x0, edge.x1, y1, y0, edge.y0, edge.y1);
	                            return sum + (overlapLeftTopRightBottom + overlapLeftBottomRightTop) * penaltyRate;
	                        }, 0);
	                    };
	                }
	            };

	            var edges = parallel.edges;
	            var textData = parallel.text;

	            var labels = textData.map(function (r) {
	                var a = 2 + (r.size + r.w) / 2;
	                var b = 2 + (r.size + r.h) / 2;
	                var m = {
	                    max: -Math.PI / 2,
	                    min: Math.PI / 2,
	                    norm: Math.random() > 0.5 ? Math.PI : 0
	                };
	                var angle = m[r.extr];
	                return {
	                    i: r.i,
	                    x0: r.x,
	                    y0: r.y,
	                    x: r.x + a * Math.cos(angle),
	                    y: r.y + b * Math.sin(angle),
	                    w: r.w,
	                    h: r.h,
	                    size: r.size,
	                    hide: r.hide,
	                    extr: r.extr
	                };
	            }).filter(function (r) {
	                return !r.hide;
	            });

	            var maxWidth = this.w;
	            var maxHeight = this.h;

	            var sim = new _layerLabelsAnnealingSimulator.AnnealingSimulator({
	                items: labels,
	                transactor: function transactor(row) {
	                    var prevX = row.x;
	                    var prevY = row.y;
	                    return {
	                        modify: function modify() {
	                            var a = 2 + (row.size + row.w) / 2;
	                            var b = 2 + (row.size + row.h) / 2;
	                            var m = {
	                                max: -Math.PI,
	                                min: Math.PI,
	                                norm: Math.PI * 2
	                            };
	                            var n = 4;
	                            var maxAngle = m[row.extr];
	                            var angle = maxAngle / n + Math.random() * (maxAngle * (n - 2)) / n;

	                            var nextX = row.x0 + a * Math.cos(angle);
	                            var nextY = row.y0 + b * Math.sin(angle);

	                            row.x = Math.min(Math.max(nextX, row.w / 2), maxWidth - row.w / 2);
	                            row.y = Math.max(Math.min(nextY, maxHeight - row.h / 2), row.h / 2);

	                            return row;
	                        },
	                        revert: function revert() {
	                            row.x = prevX;
	                            row.y = prevY;
	                            return row;
	                        }
	                    };
	                },
	                penalties: tokens.map(function (token) {
	                    return penalties[token];
	                }).filter(function (x) {
	                    return x;
	                }).map(function (penalty) {
	                    return penalty(textData, edges);
	                })
	            });

	            sim.start(4);

	            labels.forEach(function (l) {
	                var r = textData[l.i];
	                r.x = l.x;
	                r.y = l.y;
	            });

	            textData = flags['auto:hide-on-label-edges-overlap'] ? this.hideOnLabelEdgesOverlap(textData, edges) : textData;
	            textData = flags['auto:hide-on-label-label-overlap'] ? this.hideOnLabelLabelOverlap(textData) : textData;

	            return parallel;
	        }
	    }, {
	        key: 'hideOnLabelEdgesOverlap',
	        value: function hideOnLabelEdgesOverlap(data, edges) {

	            function penaltyLabelEdgesOverlap(label, edges) {
	                var x0 = label.x - label.w / 2;
	                var x1 = label.x + label.w / 2;

	                var y0 = label.y - label.h / 2;
	                var y1 = label.y + label.h / 2;
	                return edges.reduce(function (sum, edge) {
	                    var overlapTop = intersect(x0, x1, edge.x0, edge.x1, y0, y1, edge.y0, edge.y1);
	                    var overlapBtm = intersect(x0, x1, edge.x0, edge.x1, y1, y0, edge.y0, edge.y1);
	                    return sum + (overlapTop + overlapBtm) * 2;
	                }, 0);
	            }

	            data.filter(function (r) {
	                return !r.hide;
	            }).forEach(function (r) {
	                if (penaltyLabelEdgesOverlap(r, edges) > 0) {
	                    r.hide = true;
	                }
	            });

	            return data;
	        }
	    }, {
	        key: 'hideOnLabelLabelOverlap',
	        value: function hideOnLabelLabelOverlap(data) {

	            var rect = function rect(a) {
	                var border = 0;
	                return {
	                    x0: a.x - a.w / 2 - border,
	                    x1: a.x + a.w / 2 + border,
	                    y0: a.y - a.h / 2 - border,
	                    y1: a.y + a.h / 2 + border
	                };
	            };

	            var collisionSolveStrategies = {
	                'min/min': function minMin(p0, p1) {
	                    return p1.y - p0.y;
	                }, // desc
	                'max/max': function maxMax(p0, p1) {
	                    return p0.y - p1.y;
	                }, // asc
	                'min/max': function minMax() {
	                    return -1;
	                }, // choose min
	                'min/norm': function minNorm() {
	                    return -1;
	                }, // choose min
	                'max/norm': function maxNorm() {
	                    return -1;
	                }, // choose max
	                'norm/norm': function normNorm(p0, p1) {
	                    return p0.y - p1.y;
	                } // asc
	            };

	            var cross = function cross(a, b) {
	                var ra = rect(a);
	                var rb = rect(b);
	                var k = !(a.hide * b.hide);

	                var x_overlap = k * Math.max(0, Math.min(rb.x1, ra.x1) - Math.max(ra.x0, rb.x0));
	                var y_overlap = k * Math.max(0, Math.min(rb.y1, ra.y1) - Math.max(ra.y0, rb.y0));

	                if (x_overlap * y_overlap > 0) {
	                    var extremumOrder = { min: 0, max: 1, norm: 2 };
	                    [a, b].sort(function (p0, p1) {
	                        return extremumOrder[p0.extr] - extremumOrder[p1.extr];
	                    }).sort(function (p0, p1) {
	                        return collisionSolveStrategies[p0.extr + '/' + p1.extr](p0, p1);
	                    })[1].hide = true;
	                }
	            };

	            data.filter(function (r) {
	                return !r.hide;
	            }).forEach(function (a) {
	                data.forEach(function (b) {
	                    if (a.i !== b.i) {
	                        cross(a, b);
	                    }
	                });
	            });

	            return data;
	        }
	    }]);

	    return LayerLabels;
	}();

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var createFunc = function createFunc(x) {
	    return function () {
	        return x;
	    };
	};

	var LayerLabelsModel = exports.LayerLabelsModel = function () {
	    function LayerLabelsModel(prev) {
	        _classCallCheck(this, LayerLabelsModel);

	        this.model = prev.model;
	        this.x = prev.x || createFunc(0);
	        this.y = prev.y || createFunc(0);
	        this.w = prev.w || createFunc(0);
	        this.h = prev.h || createFunc(0);
	        this.hide = prev.hide || createFunc(false);
	        this.label = prev.label || createFunc('');
	        this.color = prev.color || createFunc('');
	    }

	    _createClass(LayerLabelsModel, null, [{
	        key: 'seed',
	        value: function seed(model, _ref) {
	            var fontColor = _ref.fontColor;
	            var flip = _ref.flip;
	            var formatter = _ref.formatter;
	            var labelRectSize = _ref.labelRectSize;
	            var _ref$paddingKoeff = _ref.paddingKoeff;
	            var paddingKoeff = _ref$paddingKoeff === undefined ? 0.5 : _ref$paddingKoeff;


	            var _x = flip ? model.yi : model.xi;
	            var _y = flip ? model.xi : model.yi;

	            var label = function label(row) {
	                return formatter(model.label(row));
	            };

	            return new LayerLabelsModel({
	                model: model,
	                x: function x(row) {
	                    return _x(row);
	                },
	                y: function y(row) {
	                    return _y(row) + labelRectSize(label(row)).height * paddingKoeff;
	                },
	                w: function w(row) {
	                    return labelRectSize(label(row)).width;
	                },
	                h: function h(row) {
	                    return labelRectSize(label(row)).height;
	                },
	                label: label,
	                color: function color() {
	                    return fontColor;
	                }
	            });
	        }
	    }, {
	        key: 'compose',
	        value: function compose(prev) {
	            var updates = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            return Object.keys(updates).reduce(function (memo, propName) {
	                memo[propName] = updates[propName];
	                return memo;
	            }, new LayerLabelsModel(prev));
	        }
	    }]);

	    return LayerLabelsModel;
	}();

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var rules = {};

	var LayerLabelsRules = exports.LayerLabelsRules = function () {
	    function LayerLabelsRules() {
	        _classCallCheck(this, LayerLabelsRules);
	    }

	    _createClass(LayerLabelsRules, null, [{
	        key: 'regRule',
	        value: function regRule(alias, func) {
	            rules[alias] = func;
	            return this;
	        }
	    }, {
	        key: 'getRule',
	        value: function getRule(alias) {
	            return rules[alias];
	        }
	    }]);

	    return LayerLabelsRules;
	}();

	var isPositive = function isPositive(scale, row) {
	    return scale.discrete || !scale.discrete && row[scale.dim] >= 0;
	};
	var isNegative = function isNegative(scale, row) {
	    return !scale.discrete && row[scale.dim] < 0;
	};
	var alignByX = function alignByX(exp) {
	    return function (prev) {
	        return {
	            x: function x(row) {

	                var ordinateScale = prev.model.scaleY;

	                if (exp[2] === '+' && !isPositive(ordinateScale, row)) {
	                    return prev.x(row);
	                }

	                if (exp[2] === '-' && !isNegative(ordinateScale, row)) {
	                    return prev.x(row);
	                }

	                var k = exp[1];
	                var u = exp[0] === exp[0].toUpperCase() ? 1 : 0;

	                return prev.x(row) + k * (prev.w(row) / 2) + k * u * prev.model.size(row) / 2 + k * 2;
	            }
	        };
	    };
	};

	var alignByY = function alignByY(exp) {
	    return function (prev) {
	        return {
	            y: function y(row) {

	                var ordinateScale = prev.model.scaleY;

	                if (exp[2] === '+' && !isPositive(ordinateScale, row)) {
	                    return prev.y(row);
	                }

	                if (exp[2] === '-' && !isNegative(ordinateScale, row)) {
	                    return prev.y(row);
	                }

	                var k = exp[1];
	                var u = exp[0] === exp[0].toUpperCase() ? 1 : 0;

	                return prev.y(row) + k * (prev.h(row) / 2) + k * u * prev.model.size(row) / 2 + k * 2;
	            }
	        };
	    };
	};

	LayerLabelsRules.regRule('l', alignByX(['l', -1, null])).regRule('L', alignByX(['L', -1, null])).regRule('l+', alignByX(['l', -1, '+'])).regRule('l-', alignByX(['l', -1, '-'])).regRule('L+', alignByX(['L', -1, '+'])).regRule('L-', alignByX(['L', -1, '-'])).regRule('r', alignByX(['r', 1, null])).regRule('R', alignByX(['R', 1, null])).regRule('r+', alignByX(['r', 1, '+'])).regRule('r-', alignByX(['r', 1, '-'])).regRule('R+', alignByX(['R', 1, '+'])).regRule('R-', alignByX(['R', 1, '-'])).regRule('t', alignByY(['t', -1, null])).regRule('T', alignByY(['T', -1, null])).regRule('t+', alignByY(['t', -1, '+'])).regRule('t-', alignByY(['t', -1, '-'])).regRule('T+', alignByY(['T', -1, '+'])).regRule('T-', alignByY(['T', -1, '-'])).regRule('b', alignByY(['b', 1, null])).regRule('B', alignByY(['B', 1, null])).regRule('b+', alignByY(['b', 1, '+'])).regRule('b-', alignByY(['b', 1, '-'])).regRule('B+', alignByY(['B', 1, '+'])).regRule('B-', alignByY(['B', 1, '-'])).regRule('keep-inside-or-hide-vertical', function (prev) {
	    return {
	        hide: function hide(row) {

	            if (prev.model.size(row) < prev.w(row)) {
	                return true;
	            }

	            var h = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	            if (h < prev.h(row)) {
	                return true;
	            }

	            return prev.hide(row);
	        }
	    };
	}).regRule('keep-inside-or-hide-horizontal', function (prev) {
	    return {
	        hide: function hide(row) {

	            if (prev.model.size(row) < prev.h(row)) {
	                return true;
	            }

	            var w = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	            if (w < prev.w(row)) {
	                return true;
	            }

	            return prev.hide(row);
	        }
	    };
	}).regRule('keep-within-diameter-or-top', function (prev) {
	    return {
	        y: function y(row) {

	            if (prev.model.size(row) / prev.w(row) < 1) {
	                return prev.y(row) - prev.h(row) / 2 - prev.model.size(row) / 2;
	            }

	            return prev.y(row);
	        }
	    };
	}).regRule('keep-in-box', function (prev, _ref) {
	    var maxWidth = _ref.maxWidth;
	    var maxHeight = _ref.maxHeight;

	    return {
	        x: function x(row) {
	            var x = prev.x(row);
	            var w = prev.w(row);
	            var l = x - w / 2;
	            var r = x + w / 2;

	            var dl = 0 - l;
	            if (dl > 0) {
	                return x + dl;
	            }

	            var dr = r - maxWidth;
	            if (dr > 0) {
	                return x - dr;
	            }

	            return x;
	        },
	        y: function y(row) {
	            var y = prev.y(row);
	            var h = prev.h(row);
	            var t = y - h / 2;
	            var b = y + h / 2;

	            var dt = 0 - t;
	            if (dt > 0) {
	                return 0;
	            }

	            var db = b - maxHeight;
	            if (db > 0) {
	                return y - db;
	            }

	            return y;
	        }
	    };
	});

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var AnnealingSimulator = exports.AnnealingSimulator = function () {
	    function AnnealingSimulator(config) {
	        _classCallCheck(this, AnnealingSimulator);

	        this.items = config.items;
	        this.penalties = config.penalties;
	        this.transactor = config.transactor;
	        this.cooling_schedule = config.cooling_schedule || function (ti, t0, n) {
	            return ti - t0 / n;
	        };
	    }

	    _createClass(AnnealingSimulator, [{
	        key: "energy",
	        value: function energy(index) {
	            return this.penalties.reduce(function (memo, p) {
	                return memo + p(index);
	            }, 0);
	        }
	    }, {
	        key: "move",
	        value: function move(temperature) {

	            var i = Math.floor(Math.random() * this.items.length);

	            var trans = this.transactor(this.items[i]);
	            var prevEnergy = this.energy(i);
	            this.items[i] = trans.modify();
	            var nextEnergy = this.energy(i);

	            if (Math.random() >= Math.exp(-(nextEnergy - prevEnergy) / temperature)) {
	                this.items[i] = trans.revert();
	            }
	        }
	    }, {
	        key: "start",
	        value: function start(nIterations) {
	            var _this = this;

	            // main simulated annealing function
	            var ti = 1.0;
	            var t0 = 1.0;
	            for (var i = 0; i < nIterations; i++) {
	                this.items.forEach(function () {
	                    return _this.move(ti);
	                });
	                ti = this.cooling_schedule(ti, t0, nIterations);
	            }
	        }
	    }]);

	    return AnnealingSimulator;
	}();

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.FormatterRegistry = undefined;

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* jshint ignore:end */
	/* jshint ignore:start */
	var FORMATS_MAP = {

	    'x-num-auto': function xNumAuto(x) {
	        var v = parseFloat(x.toFixed(2));
	        return Math.abs(v) < 1 ? v.toString() : _d2.default.format('s')(v);
	    },

	    percent: function percent(x) {
	        var v = parseFloat((x * 100).toFixed(2));
	        return v.toString() + '%';
	    },

	    day: _d2.default.time.format('%d-%b-%Y'),

	    'day-short': _d2.default.time.format('%d-%b'),

	    week: _d2.default.time.format('%d-%b-%Y'),

	    'week-short': _d2.default.time.format('%d-%b'),

	    month: function month(x) {
	        var d = new Date(x);
	        var m = d.getMonth();
	        var formatSpec = m === 0 ? '%B, %Y' : '%B';
	        return _d2.default.time.format(formatSpec)(x);
	    },

	    'month-short': function monthShort(x) {
	        var d = new Date(x);
	        var m = d.getMonth();
	        var formatSpec = m === 0 ? '%b \'%y' : '%b';
	        return _d2.default.time.format(formatSpec)(x);
	    },

	    'month-year': _d2.default.time.format('%B, %Y'),

	    quarter: function quarter(x) {
	        var d = new Date(x);
	        var m = d.getMonth();
	        var q = (m - m % 3) / 3;
	        return 'Q' + (q + 1) + ' ' + d.getFullYear();
	    },

	    year: _d2.default.time.format('%Y'),

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
	            formatter = function formatter(v) {
	                var f = _underscore2.default.isDate(v) ? _d2.default.time.format(formatAlias) : _d2.default.format(formatAlias);
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

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Line = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _const = __webpack_require__(6);

	var _elementPath = __webpack_require__(17);

	var _cartesianGrammar = __webpack_require__(9);

	var _cssClassMap = __webpack_require__(18);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Line = exports.Line = function (_BasePath) {
	    _inherits(Line, _BasePath);

	    function Line(config) {
	        _classCallCheck(this, Line);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Line).call(this, config));

	        var enableStack = _this.config.stack;

	        _this.config.guide = _underscore2.default.defaults(_this.config.guide || {}, {
	            interpolate: 'linear'
	        });

	        _this.decorators = [_cartesianGrammar.CartesianGrammar.decorator_orientation, _cartesianGrammar.CartesianGrammar.decorator_groundY0, _cartesianGrammar.CartesianGrammar.decorator_group, _cartesianGrammar.CartesianGrammar.decorator_groupOrderByAvg, enableStack && _cartesianGrammar.CartesianGrammar.decorator_stack, _cartesianGrammar.CartesianGrammar.decorator_dynamic_size, _cartesianGrammar.CartesianGrammar.decorator_color, _cartesianGrammar.CartesianGrammar.decorator_label, config.adjustPhase && _cartesianGrammar.CartesianGrammar.adjustStaticSizeScale, config.adjustPhase && enableStack && _cartesianGrammar.CartesianGrammar.adjustYScale];
	        return _this;
	    }

	    _createClass(Line, [{
	        key: 'buildModel',
	        value: function buildModel(pathModel, params) {

	            var wMax = this.config.options.width;
	            var hMax = this.config.options.height;

	            var limit = function limit(x, minN, maxN) {

	                var k = 1000;
	                var n = Math.round(x * k) / k;

	                if (n < minN) {
	                    return minN;
	                }

	                if (n > maxN) {
	                    return maxN;
	                }

	                return n;
	            };

	            var baseModel = _get(Object.getPrototypeOf(Line.prototype), 'buildModel', this).call(this, pathModel, params);

	            baseModel.matchRowInCoordinates = function (rows, _ref) {
	                var x = _ref.x;
	                var y = _ref.y;

	                var by = function by(prop) {
	                    return function (a, b) {
	                        return a[prop] - b[prop];
	                    };
	                };
	                var dist = function dist(x0, x1, y0, y1) {
	                    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
	                };

	                // d3.invert doesn't work for ordinal axes
	                var vertices = rows.map(function (row) {
	                    var rx = baseModel.x(row);
	                    var ry = baseModel.y(row);
	                    return {
	                        x: rx,
	                        y: ry,
	                        dist: dist(x, rx, y, ry),
	                        data: row
	                    };
	                });

	                // double for consistency in case of
	                // (vertices.length === 1)
	                vertices.push(vertices[0]);

	                var pair = _underscore2.default.times(vertices.length - 1, function (i) {
	                    return i;
	                }).map(function (edge) {
	                    var v0 = vertices[edge];
	                    var v1 = vertices[edge + 1];
	                    var ab = dist(v1.x, v0.x, v1.y, v0.y);
	                    var ax = v0.dist;
	                    var bx = v1.dist;
	                    var er = Math.abs(ab - (ax + bx));
	                    return [er, v0, v1];
	                }).sort(by('0')) // find minimal distance to edge
	                [0].slice(1);

	                return pair.sort(by('dist'))[0].data;
	            };

	            var guide = this.config.guide;
	            var options = this.config.options;
	            var widthCss = this.isEmptySize ? guide.widthCssClass || (0, _cssClassMap.getLineClassesByWidth)(options.width) : '';
	            var countCss = (0, _cssClassMap.getLineClassesByCount)(params.colorScale.domain().length);

	            var tag = this.isEmptySize ? 'line' : 'area';
	            var groupPref = '' + _const.CSS_PREFIX + tag + ' ' + tag + ' i-role-path ' + widthCss + ' ' + countCss + ' ' + guide.cssClass + ' ';

	            var d3Line = _d2.default.svg.line().interpolate(guide.interpolate).x(baseModel.x).y(baseModel.y);

	            baseModel.groupAttributes = {
	                class: function _class(fiber) {
	                    return groupPref + ' ' + baseModel.class(fiber[0]) + ' frame-' + options.uid;
	                }
	            };

	            baseModel.pathElement = this.isEmptySize ? 'path' : 'polygon';

	            baseModel.pathAttributes = this.isEmptySize ? {
	                d: d3Line,
	                stroke: function stroke(fiber) {
	                    return baseModel.color(fiber[0]);
	                },
	                class: 'i-role-datum'
	            } : {
	                fill: function fill(fiber) {
	                    return baseModel.color(fiber[0]);
	                },
	                points: function points(fiber) {

	                    var x = baseModel.x;
	                    var y = baseModel.y;
	                    var w = baseModel.size;

	                    var xy = function xy(d) {
	                        return [x(d), y(d)];
	                    };

	                    var ways = fiber.reduce(function (memo, d, i, list) {
	                        var dPrev = list[i - 1];
	                        var dNext = list[i + 1];
	                        var curr = xy(d);
	                        var prev = dPrev ? xy(dPrev) : null;
	                        var next = dNext ? xy(dNext) : null;

	                        var width = w(d);
	                        var lAngle = dPrev ? Math.PI - Math.atan2(curr[1] - prev[1], curr[0] - prev[0]) : Math.PI;
	                        var rAngle = dNext ? Math.atan2(curr[1] - next[1], next[0] - curr[0]) : 0;

	                        var gamma = lAngle - rAngle;

	                        if (gamma === 0) {
	                            // Avoid divide be zero
	                            return memo;
	                        }

	                        var diff = width / 2 / Math.sin(gamma / 2);
	                        var aup = rAngle + gamma / 2;
	                        var adown = aup - Math.PI;
	                        var dxup = diff * Math.cos(aup);
	                        var dyup = diff * Math.sin(aup);
	                        var dxdown = diff * Math.cos(adown);
	                        var dydown = diff * Math.sin(adown);

	                        var dir = [limit(curr[0] + dxup, 0, wMax), // x
	                        limit(curr[1] - dyup, 0, hMax) // y
	                        ];

	                        var rev = [limit(curr[0] + dxdown, 0, wMax), limit(curr[1] - dydown, 0, hMax)];

	                        memo.dir.push(dir);
	                        memo.rev.push(rev);

	                        return memo;
	                    }, {
	                        dir: [],
	                        rev: []
	                    });

	                    return [].concat(ways.dir).concat(ways.rev.reverse()).join(' ');
	                }
	            };

	            return baseModel;
	        }
	    }]);

	    return Line;
	}(_elementPath.BasePath);

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BasePath = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _element = __webpack_require__(7);

	var _cartesianGrammar = __webpack_require__(9);

	var _layerLabels = __webpack_require__(11);

	var _const = __webpack_require__(6);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var BasePath = exports.BasePath = function (_Element) {
	    _inherits(BasePath, _Element);

	    function BasePath(config) {
	        _classCallCheck(this, BasePath);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BasePath).call(this, config));

	        _this.config = config;
	        _this.config.guide = _this.config.guide || {};

	        _this.config.guide = _underscore2.default.defaults(_this.config.guide, {
	            cssClass: '',
	            widthCssClass: '',
	            showAnchors: true,
	            anchorSize: 0.1,
	            color: {},
	            label: {}
	        });

	        _this.config.guide.label = _underscore2.default.defaults(_this.config.guide.label, {
	            fontSize: 11,
	            position: ['auto:avoid-label-label-overlap', 'auto:avoid-label-anchor-overlap', 'auto:avoid-label-edges-overlap', 'auto:hide-on-label-label-overlap', 'auto:hide-on-label-edges-overlap']
	        });

	        _this.config.guide.color = _underscore2.default.defaults(_this.config.guide.color || {}, { fill: null });

	        _this.config.guide.size = _underscore2.default.defaults(_this.config.guide.size || {}, {
	            defMinSize: 2,
	            defMaxSize: _this.isEmptySize ? 6 : 40
	        });

	        _this.decorators = [];

	        _this.on('highlight', function (sender, e) {
	            return _this.highlight(e);
	        });
	        _this.on('highlight-data-points', function (sender, e) {
	            return _this.highlightDataPoints(e);
	        });

	        if (_this.config.guide.showAnchors) {
	            var activate = function activate(sender, e) {
	                return sender.fire('highlight-data-points', function (row) {
	                    return row === e.data;
	                });
	            };
	            var deactivate = function deactivate(sender) {
	                return sender.fire('highlight-data-points', function () {
	                    return false;
	                });
	            };
	            _this.on('mouseover', activate);
	            _this.on('mousemove', activate);
	            _this.on('mouseout', deactivate);
	        }
	        return _this;
	    }

	    _createClass(BasePath, [{
	        key: 'createScales',
	        value: function createScales(fnCreateScale) {

	            var config = this.config;

	            this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
	            this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
	            this.size = fnCreateScale('size', config.size, {});
	            this.color = fnCreateScale('color', config.color, {});
	            this.label = fnCreateScale('label', config.label, {});
	            this.split = fnCreateScale('split', config.split, {});

	            return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color).regScale('split', this.split).regScale('label', this.label);
	        }
	    }, {
	        key: 'buildModel',
	        value: function buildModel(pathModel, _ref) {
	            var colorScale = _ref.colorScale;
	            var labelScale = _ref.labelScale;


	            var datumClass = 'i-role-datum';
	            var pointPref = _const.CSS_PREFIX + 'dot-line dot-line i-role-dot ' + datumClass + ' ' + _const.CSS_PREFIX + 'dot ';

	            var flip = this.config.flip;
	            var choose = function choose(statement, yes, no) {
	                return statement ? yes : no;
	            };
	            var kRound = 10000;
	            var baseModel = {
	                scaleX: pathModel.scaleX,
	                scaleY: pathModel.scaleY,
	                scaleColor: colorScale,
	                scaleLabel: labelScale,
	                x: choose(flip, pathModel.yi, pathModel.xi),
	                x0: choose(flip, pathModel.y0, pathModel.xi),
	                y: choose(flip, pathModel.xi, pathModel.yi),
	                y0: choose(flip, pathModel.xi, pathModel.y0),
	                size: pathModel.size,
	                group: pathModel.group,
	                order: pathModel.order,
	                color: function color(d) {
	                    return colorScale.toColor(pathModel.color(d));
	                },
	                class: function _class(d) {
	                    return colorScale.toClass(pathModel.color(d));
	                },
	                matchRowInCoordinates: function matchRowInCoordinates() {
	                    throw 'Not implemented';
	                },

	                groupAttributes: {},
	                pathAttributes: {},
	                pathElement: null,
	                dotAttributes: {
	                    r: function r(d) {
	                        return Math.round(kRound * baseModel.size(d) / 2) / kRound;
	                    },
	                    cx: function cx(d) {
	                        return baseModel.x(d);
	                    },
	                    cy: function cy(d) {
	                        return baseModel.y(d);
	                    },
	                    fill: function fill(d) {
	                        return baseModel.color(d);
	                    },
	                    class: function _class(d) {
	                        return pointPref + ' ' + baseModel.class(d);
	                    }
	                }
	            };

	            return baseModel;
	        }
	    }, {
	        key: 'getDistance',
	        value: function getDistance(mx, my, rx, ry) {
	            return Math.sqrt(Math.pow(mx - rx, 2) + Math.pow(my - ry, 2));
	        }
	    }, {
	        key: 'walkFrames',
	        value: function walkFrames(frames) {

	            var args = {
	                isHorizontal: this.config.flip,
	                defMin: this.config.guide.size.defMinSize,
	                defMax: this.config.guide.size.defMaxSize,
	                minLimit: this.config.guide.size.minSize,
	                maxLimit: this.config.guide.size.maxSize,
	                dataSource: frames.reduce(function (memo, f) {
	                    return memo.concat(f.part());
	                }, [])
	            };

	            return this.decorators.filter(function (x) {
	                return x;
	            }).reduce(function (model, transform) {
	                return transform(model, args);
	            }, new _cartesianGrammar.CartesianGrammar({
	                scaleX: this.xScale,
	                scaleY: this.yScale,
	                scaleSize: this.size,
	                scaleLabel: this.label,
	                scaleColor: this.color,
	                scaleSplit: this.split
	            }));
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames(frames) {

	            var self = this;

	            var guide = this.config.guide;
	            var options = this.config.options;

	            var fullData = frames.reduce(function (memo, f) {
	                return memo.concat(f.part());
	            }, []);
	            var pathModel = this.walkFrames(frames);
	            var model = this.buildModel(pathModel, {
	                colorScale: this.color,
	                labelScale: this.label
	            });
	            this.model = model;

	            var updateGroupContainer = function updateGroupContainer() {

	                this.attr(model.groupAttributes);

	                var points = this.selectAll('circle').data(function (fiber) {
	                    return fiber.length <= 1 ? fiber : [];
	                });
	                points.exit().remove();
	                points.attr(model.dotAttributes);
	                points.enter().append('circle').attr(model.dotAttributes);

	                self.subscribe(points, function (d) {
	                    return d;
	                });

	                var series = this.selectAll(model.pathElement).data(function (fiber) {
	                    return fiber.length > 1 ? [fiber] : [];
	                });
	                series.exit().remove();
	                series.attr(model.pathAttributes);
	                series.enter().append(model.pathElement).attr(model.pathAttributes);

	                self.subscribe(series, function (rows) {
	                    var m = _d2.default.mouse(this);
	                    return model.matchRowInCoordinates(rows.filter(_cartesianGrammar.CartesianGrammar.isNonSyntheticRecord), { x: m[0], y: m[1] });
	                });

	                if (guide.showAnchors) {

	                    var attr = {
	                        r: function r() {
	                            return guide.anchorSize;
	                        },
	                        cx: function cx(d) {
	                            return model.x(d);
	                        },
	                        cy: function cy(d) {
	                            return model.y(d);
	                        },
	                        class: 'i-data-anchor'
	                    };

	                    var dots = this.selectAll('.i-data-anchor').data(function (fiber) {
	                        return fiber.filter(_cartesianGrammar.CartesianGrammar.isNonSyntheticRecord);
	                    });
	                    dots.exit().remove();
	                    dots.attr(attr);
	                    dots.enter().append('circle').attr(attr);

	                    self.subscribe(dots);
	                }
	            };

	            var fibers = this.config.stack ? _cartesianGrammar.CartesianGrammar.toStackedFibers(fullData, pathModel) : _cartesianGrammar.CartesianGrammar.toFibers(fullData, pathModel);

	            var frameGroups = options.container.selectAll('.frame-' + options.uid).data(fibers);
	            frameGroups.exit().remove();
	            frameGroups.call(updateGroupContainer);
	            frameGroups.enter().append('g').call(updateGroupContainer);

	            var dataFibers = _cartesianGrammar.CartesianGrammar.toFibers(fullData, pathModel);
	            self.subscribe(new _layerLabels.LayerLabels(pathModel, this.config.flip, this.config.guide.label, options).draw(dataFibers));
	        }
	    }, {
	        key: 'highlight',
	        value: function highlight(filter) {
	            var _container$selectAll$, _container$selectAll$2, _container$selectAll$3;

	            var container = this.config.options.container;

	            var x = 'graphical-report__highlighted';
	            var _ = 'graphical-report__dimmed';

	            container.selectAll('.i-role-path').classed((_container$selectAll$ = {}, _defineProperty(_container$selectAll$, x, function (fiber) {
	                return filter(fiber.filter(_cartesianGrammar.CartesianGrammar.isNonSyntheticRecord)[0]) === true;
	            }), _defineProperty(_container$selectAll$, _, function (fiber) {
	                return filter(fiber.filter(_cartesianGrammar.CartesianGrammar.isNonSyntheticRecord)[0]) === false;
	            }), _container$selectAll$));

	            container.selectAll('.i-role-dot').classed((_container$selectAll$2 = {}, _defineProperty(_container$selectAll$2, x, function (d) {
	                return filter(d) === true;
	            }), _defineProperty(_container$selectAll$2, _, function (d) {
	                return filter(d) === false;
	            }), _container$selectAll$2));

	            container.selectAll('.i-role-label').classed((_container$selectAll$3 = {}, _defineProperty(_container$selectAll$3, x, function (d) {
	                return filter(d) === true;
	            }), _defineProperty(_container$selectAll$3, _, function (d) {
	                return filter(d) === false;
	            }), _container$selectAll$3));
	        }
	    }, {
	        key: 'highlightDataPoints',
	        value: function highlightDataPoints(filter) {
	            var _this2 = this;

	            var cssClass = 'i-data-anchor';
	            this.config.options.container.selectAll('.' + cssClass).attr({
	                r: function r(d) {
	                    return filter(d) ? _this2.model.size(d) / 2 : _this2.config.guide.anchorSize;
	                },
	                fill: function fill(d) {
	                    return _this2.model.color(d);
	                },
	                class: function _class(d) {
	                    return cssClass + ' ' + _this2.model.class(d);
	                }
	            });
	        }
	    }]);

	    return BasePath;
	}(_element.Element);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getLineClassesByCount = exports.getLineClassesByWidth = undefined;

	var _const = __webpack_require__(6);

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

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Area = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _const = __webpack_require__(6);

	var _elementPath = __webpack_require__(17);

	var _cssClassMap = __webpack_require__(18);

	var _cartesianGrammar = __webpack_require__(9);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Area = exports.Area = function (_BasePath) {
	    _inherits(Area, _BasePath);

	    function Area(config) {
	        _classCallCheck(this, Area);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Area).call(this, config));

	        var enableStack = _this.config.stack;

	        _this.decorators = [_cartesianGrammar.CartesianGrammar.decorator_orientation, _cartesianGrammar.CartesianGrammar.decorator_groundY0, _cartesianGrammar.CartesianGrammar.decorator_group, _cartesianGrammar.CartesianGrammar.decorator_groupOrderByAvg, enableStack && _cartesianGrammar.CartesianGrammar.decorator_stack, _cartesianGrammar.CartesianGrammar.decorator_dynamic_size, _cartesianGrammar.CartesianGrammar.decorator_color, _cartesianGrammar.CartesianGrammar.decorator_label, config.adjustPhase && _cartesianGrammar.CartesianGrammar.adjustStaticSizeScale, config.adjustPhase && enableStack && _cartesianGrammar.CartesianGrammar.adjustYScale];
	        return _this;
	    }

	    _createClass(Area, [{
	        key: 'buildModel',
	        value: function buildModel(modelGoG, params) {

	            var self = this;
	            var baseModel = _get(Object.getPrototypeOf(Area.prototype), 'buildModel', this).call(this, modelGoG, params);

	            baseModel.matchRowInCoordinates = function (rows, _ref) {
	                var x = _ref.x;
	                var y = _ref.y;


	                // d3.invert doesn't work for ordinal axes
	                var nearest = rows.map(function (row) {
	                    var rx = baseModel.x(row);
	                    var ry = baseModel.y(row);
	                    return {
	                        x: rx,
	                        y: ry,
	                        dist: self.getDistance(x, y, rx, ry),
	                        data: row
	                    };
	                }).sort(function (a, b) {
	                    return a.dist - b.dist;
	                }) // asc
	                [0];

	                return nearest.data;
	            };

	            var guide = this.config.guide;
	            var options = this.config.options;
	            var countCss = (0, _cssClassMap.getLineClassesByCount)(params.colorScale.domain().length);

	            var groupPref = _const.CSS_PREFIX + 'area area i-role-path ' + countCss + ' ' + guide.cssClass + ' ';
	            baseModel.groupAttributes = {
	                class: function _class(fiber) {
	                    return groupPref + ' ' + baseModel.class(fiber[0]) + ' frame-' + options.uid;
	                }
	            };

	            baseModel.pathAttributes = {
	                fill: function fill(fiber) {
	                    return baseModel.color(fiber[0]);
	                },
	                stroke: function stroke(fiber) {
	                    return baseModel.color(fiber[0]);
	                },
	                points: function points(fiber) {

	                    var ways = fiber.reduce(function (memo, d) {
	                        memo.dir.push([baseModel.x(d), baseModel.y(d)]);
	                        memo.rev.push([baseModel.x0(d), baseModel.y0(d)]);
	                        return memo;
	                    }, {
	                        dir: [],
	                        rev: []
	                    });

	                    return [].concat(ways.dir).concat(ways.rev.reverse()).join(' ');
	                }
	            };

	            baseModel.pathElement = 'polygon';

	            return baseModel;
	        }
	    }, {
	        key: 'getDistance',
	        value: function getDistance(mx, my, rx, ry) {
	            return this.config.flip ? Math.abs(my - ry) : Math.abs(mx - rx);
	        }
	    }]);

	    return Area;
	}(_elementPath.BasePath);

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Interval = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _const = __webpack_require__(6);

	var _element = __webpack_require__(7);

	var _cartesianGrammar = __webpack_require__(9);

	var _layerLabels = __webpack_require__(11);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Interval = exports.Interval = function (_Element) {
	    _inherits(Interval, _Element);

	    function Interval(config) {
	        _classCallCheck(this, Interval);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Interval).call(this, config));

	        _this.config = config;

	        var enableStack = _this.config.stack;
	        _this.config.guide = _this.config.guide || {};
	        _this.config.guide = _underscore2.default.defaults(_this.config.guide, {
	            prettify: true,
	            enableColorToBarPosition: !enableStack
	        });

	        _this.config.guide.size = _underscore2.default.defaults(_this.config.guide.size || {}, {
	            enableDistributeEvenly: true,
	            defMinSize: _this.config.guide.prettify ? 3 : 0,
	            defMaxSize: _this.config.guide.prettify ? 40 : Number.MAX_VALUE
	        });

	        _this.config.guide.label = _underscore2.default.defaults(_this.config.guide.label || {}, {
	            position: _this.config.flip ? ['r-', 'l+', 'keep-inside-or-hide-horizontal'] : ['t-', 'b+', 'keep-inside-or-hide-vertical']
	        });

	        _this.baseCssClass = 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar';

	        _this.defMin = config.guide.size.defMinSize;
	        _this.defMax = config.guide.size.defMaxSize;
	        _this.minLimit = config.guide.size.minSize;
	        _this.maxLimit = config.guide.size.maxSize;

	        var enableColorPositioning = _this.config.guide.enableColorToBarPosition;
	        var enableDistributeEvenly = _this.config.guide.size.enableDistributeEvenly;

	        _this.decorators = [_cartesianGrammar.CartesianGrammar.decorator_orientation, _cartesianGrammar.CartesianGrammar.decorator_groundY0, _cartesianGrammar.CartesianGrammar.decorator_group, _cartesianGrammar.CartesianGrammar.decorator_groupOrderByColor, enableStack && _cartesianGrammar.CartesianGrammar.decorator_stack, enableColorPositioning && _cartesianGrammar.CartesianGrammar.decorator_positioningByColor, _cartesianGrammar.CartesianGrammar.decorator_dynamic_size, _cartesianGrammar.CartesianGrammar.decorator_color, _cartesianGrammar.CartesianGrammar.decorator_label, config.adjustPhase && enableDistributeEvenly && _cartesianGrammar.CartesianGrammar.decorator_size_distribute_evenly, config.adjustPhase && enableStack && _cartesianGrammar.CartesianGrammar.adjustYScale];

	        _this.on('highlight', function (sender, e) {
	            return _this.highlight(e);
	        });
	        return _this;
	    }

	    _createClass(Interval, [{
	        key: 'createScales',
	        value: function createScales(fnCreateScale) {

	            var config = this.config;
	            this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
	            this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
	            this.size = fnCreateScale('size', config.size, {});
	            this.color = fnCreateScale('color', config.color, {});
	            this.split = fnCreateScale('split', config.split, {});
	            this.label = fnCreateScale('label', config.label, {});

	            return this.regScale('x', this.xScale).regScale('y', this.yScale).regScale('size', this.size).regScale('color', this.color).regScale('split', this.split).regScale('label', this.label);
	        }
	    }, {
	        key: 'walkFrames',
	        value: function walkFrames(frames) {

	            var args = {
	                isHorizontal: this.config.flip,
	                minLimit: this.minLimit,
	                maxLimit: this.maxLimit,
	                defMin: this.defMin,
	                defMax: this.defMax,
	                dataSource: this.convertFramesToData(frames)
	            };

	            return this.decorators.filter(function (x) {
	                return x;
	            }).reduce(function (model, transform) {
	                return transform(model, args);
	            }, new _cartesianGrammar.CartesianGrammar({
	                scaleX: this.xScale,
	                scaleY: this.yScale,
	                scaleSize: this.size,
	                scaleLabel: this.label,
	                scaleColor: this.color,
	                scaleSplit: this.split
	            }));
	        }
	    }, {
	        key: 'convertFramesToData',
	        value: function convertFramesToData(frames) {
	            return frames.reduce(function (memo, f) {
	                return memo.concat(f.part());
	            }, []);
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames(frames) {

	            var self = this;

	            var options = this.config.options;
	            var uid = options.uid;
	            var config = this.config;
	            var xScale = this.xScale;
	            var yScale = this.yScale;
	            var colorScale = this.color;
	            var isHorizontal = config.flip;
	            var prettify = config.guide.prettify;
	            var baseCssClass = this.baseCssClass;

	            var modelGoG = this.walkFrames(frames);
	            var barModel = this.buildModel(modelGoG, { colorScale: colorScale });

	            var params = { prettify: prettify, xScale: xScale, yScale: yScale, minBarH: 1, minBarW: 1, baseCssClass: baseCssClass };
	            var d3Attrs = isHorizontal ? this.toHorizontalDrawMethod(barModel, params) : this.toVerticalDrawMethod(barModel, params);

	            var updateBar = function updateBar() {
	                return this.attr(d3Attrs);
	            };

	            var updateBarContainer = function updateBarContainer() {
	                this.attr('class', 'frame-id-' + uid + ' i-role-bar-group');
	                var bars = this.selectAll('.bar').data(function (fiber) {
	                    return fiber;
	                });
	                bars.exit().remove();
	                bars.call(updateBar);
	                bars.enter().append('rect').call(updateBar);

	                self.subscribe(bars);
	            };

	            var data = this.convertFramesToData(frames);

	            var fibers = _cartesianGrammar.CartesianGrammar.toFibers(data, modelGoG);

	            var elements = options.container.selectAll('.frame-id-' + uid).data(fibers);
	            elements.exit().remove();
	            elements.call(updateBarContainer);
	            elements.enter().append('g').call(updateBarContainer);

	            self.subscribe(new _layerLabels.LayerLabels(modelGoG, isHorizontal, config.guide.label, options).draw(fibers));
	        }
	    }, {
	        key: 'toVerticalDrawMethod',
	        value: function toVerticalDrawMethod(_ref, _ref2) {
	            var barX = _ref.barX;
	            var barY = _ref.barY;
	            var barH = _ref.barH;
	            var barW = _ref.barW;
	            var barColor = _ref.barColor;
	            var barClass = _ref.barClass;
	            var prettify = _ref2.prettify;
	            var minBarH = _ref2.minBarH;
	            var minBarW = _ref2.minBarW;
	            var yScale = _ref2.yScale;
	            var baseCssClass = _ref2.baseCssClass;


	            var calculateW = function calculateW(d) {
	                var w = barW(d);
	                if (prettify) {
	                    w = Math.max(minBarW, w);
	                }
	                return w;
	            };

	            return {
	                x: function x(d) {
	                    return barX(d) - calculateW(d) * 0.5;
	                },
	                y: function y(d) {
	                    var y = barY(d);

	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        var h = barH(d);
	                        var isTooSmall = h < minBarH;
	                        return isTooSmall && d[yScale.dim] > 0 ? y - minBarH : y;
	                    } else {
	                        return y;
	                    }
	                },
	                height: function height(d) {
	                    var h = barH(d);
	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        var y = d[yScale.dim];
	                        return y === 0 ? h : Math.max(minBarH, h);
	                    } else {
	                        return h;
	                    }
	                },
	                width: function width(d) {
	                    return calculateW(d);
	                },
	                class: function _class(d) {
	                    return baseCssClass + ' ' + barClass(d);
	                },
	                fill: function fill(d) {
	                    return barColor(d);
	                }
	            };
	        }
	    }, {
	        key: 'toHorizontalDrawMethod',
	        value: function toHorizontalDrawMethod(_ref3, _ref4) {
	            var barX = _ref3.barX;
	            var barY = _ref3.barY;
	            var barH = _ref3.barH;
	            var barW = _ref3.barW;
	            var barColor = _ref3.barColor;
	            var barClass = _ref3.barClass;
	            var prettify = _ref4.prettify;
	            var minBarH = _ref4.minBarH;
	            var minBarW = _ref4.minBarW;
	            var xScale = _ref4.xScale;
	            var baseCssClass = _ref4.baseCssClass;


	            var calculateH = function calculateH(d) {
	                var h = barW(d);
	                if (prettify) {
	                    h = Math.max(minBarW, h);
	                }
	                return h;
	            };

	            return {
	                y: function y(d) {
	                    return barX(d) - calculateH(d) * 0.5;
	                },
	                x: function x(d) {
	                    var x = barY(d);

	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        var h = barH(d);
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
	                height: function height(d) {
	                    return calculateH(d);
	                },
	                width: function width(d) {
	                    var w = barH(d);

	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        var x = d[xScale.dim];
	                        return x === 0 ? w : Math.max(minBarH, w);
	                    } else {
	                        return w;
	                    }
	                },
	                class: function _class(d) {
	                    return baseCssClass + ' ' + barClass(d);
	                },
	                fill: function fill(d) {
	                    return barColor(d);
	                }
	            };
	        }
	    }, {
	        key: 'buildModel',
	        value: function buildModel(modelGoG, _ref5) {
	            var colorScale = _ref5.colorScale;


	            return {
	                barX: function barX(d) {
	                    return modelGoG.xi(d);
	                },
	                barY: function barY(d) {
	                    return Math.min(modelGoG.y0(d), modelGoG.yi(d));
	                },
	                barH: function barH(d) {
	                    return Math.abs(modelGoG.yi(d) - modelGoG.y0(d));
	                },
	                barW: function barW(d) {
	                    return modelGoG.size(d);
	                },
	                barColor: function barColor(d) {
	                    return colorScale.toColor(modelGoG.color(d));
	                },
	                barClass: function barClass(d) {
	                    return colorScale.toClass(modelGoG.color(d));
	                },
	                group: function group(d) {
	                    return modelGoG.group(d);
	                },
	                order: function order(d) {
	                    return modelGoG.order(d);
	                }
	            };
	        }
	    }, {
	        key: 'highlight',
	        value: function highlight(filter) {
	            var _container$selectAll$, _container$selectAll$2;

	            var x = 'graphical-report__highlighted';
	            var _ = 'graphical-report__dimmed';

	            var container = this.config.options.container;

	            container.selectAll('.bar').classed((_container$selectAll$ = {}, _defineProperty(_container$selectAll$, x, function (d) {
	                return filter(d) === true;
	            }), _defineProperty(_container$selectAll$, _, function (d) {
	                return filter(d) === false;
	            }), _container$selectAll$));

	            container.selectAll('.i-role-label').classed((_container$selectAll$2 = {}, _defineProperty(_container$selectAll$2, x, function (d) {
	                return filter(d) === true;
	            }), _defineProperty(_container$selectAll$2, _, function (d) {
	                return filter(d) === false;
	            }), _container$selectAll$2));
	        }
	    }]);

	    return Interval;
	}(_element.Element);

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.StackedInterval = undefined;

	var _element = __webpack_require__(20);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var StackedInterval = exports.StackedInterval = function (_Interval) {
	    _inherits(StackedInterval, _Interval);

	    function StackedInterval(config) {
	        _classCallCheck(this, StackedInterval);

	        config.stack = true;
	        return _possibleConstructorReturn(this, Object.getPrototypeOf(StackedInterval).call(this, config));
	    }

	    return StackedInterval;
	}(_element.Interval);

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GPL = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _event = __webpack_require__(8);

	var _utils = __webpack_require__(4);

	var _utilsDom = __webpack_require__(1);

	var _const = __webpack_require__(6);

	var _algebra = __webpack_require__(23);

	var _dataFrame = __webpack_require__(25);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var cast = function cast(v) {
	    return _underscore2.default.isDate(v) ? v.getTime() : v;
	};

	var GPL = exports.GPL = function (_Emitter) {
	    _inherits(GPL, _Emitter);

	    function GPL(config, scalesRegistryInstance, unitsRegistry) {
	        _classCallCheck(this, GPL);

	        // jscs:disable

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GPL).call(this));

	        _underscore2.default.defaults(config.scales, {
	            'split_null': { type: 'value', source: '?' },
	            'label_null': { type: 'value', source: '?' },
	            'split:default': { type: 'value', source: '?' },
	            'label:default': { type: 'value', source: '?' }
	        });
	        // jscs:enable

	        _this.config = config;

	        _this.config.settings = _this.config.settings || {};
	        _this.sources = config.sources;

	        _this.unitSet = unitsRegistry;
	        _this.scalesHub = scalesRegistryInstance;

	        _this.scales = config.scales;

	        _this.transformations = _underscore2.default.extend(config.transformations || {}, {
	            where: function where(data, tuple) {
	                var predicates = _underscore2.default.map(tuple, function (v, k) {
	                    return function (row) {
	                        return cast(row[k]) === v;
	                    };
	                });
	                return (0, _underscore2.default)(data).filter(function (row) {
	                    return _underscore2.default.every(predicates, function (p) {
	                        return p(row);
	                    });
	                });
	            }
	        });

	        _this.onUnitDraw = config.onUnitDraw;
	        _this.onUnitsStructureExpanded = config.onUnitsStructureExpanded || function (x) {
	            return x;
	        };
	        return _this;
	    }

	    _createClass(GPL, [{
	        key: 'renderTo',
	        value: function renderTo(target, xSize) {
	            var _this2 = this;

	            var d3Target = _d2.default.select(target);

	            this.config.settings.size = xSize || _underscore2.default.defaults(_utilsDom.utilsDom.getContainerSize(d3Target.node()));

	            this.root = this._expandUnitsStructure(this.config.unit);

	            this.onUnitsStructureExpanded(this.config);

	            var xSvg = d3Target.selectAll('svg').data([1]);

	            var size = this.config.settings.size;

	            var attr = {
	                class: _const.CSS_PREFIX + 'svg',
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

	            this._walkUnitsStructure(this.root, this._datify({
	                source: this.root.expression.source,
	                pipe: []
	            }));

	            Object.keys(this.scales).forEach(function (k) {
	                return _this2.scalesHub.createScaleInfo(_this2.scales[k]).commit();
	            });

	            this._drawUnitsStructure(this.root, this._datify({
	                source: this.root.expression.source,
	                pipe: []
	            }));
	        }
	    }, {
	        key: '_expandUnitsStructure',
	        value: function _expandUnitsStructure(root) {
	            var _this3 = this;

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
	                            var clone = _utils.utils.clone(unit);
	                            // pass guide by reference
	                            clone.guide = unit.guide;
	                            return clone;
	                        }) : []
	                    });
	                });
	            }

	            root.frames.forEach(function (f) {
	                return f.units.forEach(function (unit) {
	                    return _this3._expandUnitsStructure(unit, f.pipe);
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
	            }).drawFrames(unitConfig.frames, function (rootUnit) {
	                return function (rootConf, rootFrame) {
	                    self._drawUnitsStructure.bind(self)(rootConf, rootFrame, rootUnit);
	                };
	            }(unitNode));

	            if (self.onUnitDraw) {
	                self.onUnitDraw(unitNode);
	            }

	            return unitConfig;
	        }
	    }, {
	        key: '_walkUnitsStructure',
	        value: function _walkUnitsStructure(unitConfig, rootFrame) {
	            var parentUnit = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];


	            var self = this;

	            // Rule to cancel parent frame inheritance
	            var passFrame = unitConfig.expression.inherit === false ? null : rootFrame;

	            var UnitClass = self.unitSet.get(unitConfig.type);
	            var unitNode = new UnitClass(_underscore2.default.extend({ adjustPhase: true }, unitConfig));
	            unitNode.parentUnit = parentUnit;
	            unitNode.createScales(function (type, alias, dynamicProps) {
	                var key = alias || type + ':default';
	                return self.scalesHub.createScaleInfo(self.scales[key], passFrame).create(dynamicProps);
	            }).walkFrames(unitConfig.frames, function (rootUnit) {
	                return function (rootConf, rootFrame) {
	                    self._walkUnitsStructure.bind(self)(rootConf, rootFrame, rootUnit);
	                };
	            }(unitNode));

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
	            var _this4 = this;

	            var funcName = expr.operator || 'none';
	            var srcAlias = expr.source;
	            var bInherit = expr.inherit !== false; // true by default
	            var funcArgs = expr.params;

	            var frameConfig = {
	                source: srcAlias,
	                pipe: bInherit ? parentPipe : []
	            };

	            var dataFn = function dataFn() {
	                return _this4._datify(frameConfig).part();
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
	    }], [{
	        key: 'destroyNodes',
	        value: function destroyNodes(nodes) {
	            nodes.forEach(function (node) {
	                return node.destroy();
	            });
	            return [];
	        }
	    }]);

	    return GPL;
	}(_event.Emitter);

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.FramesAlgebra = undefined;

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _unitDomainPeriodGenerator = __webpack_require__(24);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var unify = function unify(v) {
	    return v instanceof Date ? v.getTime() : v;
	};

	var FramesAlgebra = {
	    cross: function cross(dataFn, dimX, dimY) {

	        var data = dataFn();

	        var domainX = (0, _underscore2.default)(data).chain().pluck(dimX).unique(unify).value();
	        var domainY = (0, _underscore2.default)(data).chain().pluck(dimY).unique(unify).value();

	        var domX = domainX.length === 0 ? [null] : domainX;
	        var domY = domainY.length === 0 ? [null] : domainY;

	        return (0, _underscore2.default)(domY).reduce(function (memo, rowVal) {

	            return memo.concat((0, _underscore2.default)(domX).map(function (colVal) {

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

	        var domainX = (0, _underscore2.default)(data).chain().pluck(dimX).unique(unify).value();
	        var domainY = (0, _underscore2.default)(data).chain().pluck(dimY).unique(unify).value();

	        var domX = domainX.length === 0 ? [null] : domainX;
	        var domY = domainY.length === 0 ? [null] : domainY;

	        if (xPeriod) {
	            domX = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(_underscore2.default.min(domainX), _underscore2.default.max(domainX), xPeriod);
	        }

	        if (yPeriod) {
	            domY = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(_underscore2.default.min(domainY), _underscore2.default.max(domainY), yPeriod);
	        }

	        return (0, _underscore2.default)(domY).reduce(function (memo, rowVal) {

	            return memo.concat((0, _underscore2.default)(domX).map(function (colVal) {

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
	        var domainX = (0, _underscore2.default)(data).chain().pluck(dim).unique(unify).value();
	        return domainX.map(function (x) {
	            return _defineProperty({}, dim, unify(x));
	        });
	    },
	    none: function none() {
	        return [null];
	    }
	};

	exports.FramesAlgebra = FramesAlgebra;

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var PERIODS_MAP = {

	    day: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            return new Date(date.setHours(0, 0, 0, 0));
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setDate(prev.getDate() + 1));
	            return this.cast(next);
	        }
	    },

	    week: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setHours(0, 0, 0, 0));
	            return new Date(date.setDate(date.getDate() - date.getDay()));
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setDate(prev.getDate() + 7));
	            return this.cast(next);
	        }
	    },

	    month: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setHours(0, 0, 0, 0));
	            date = new Date(date.setDate(1));
	            return date;
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setMonth(prev.getMonth() + 1));
	            return this.cast(next);
	        }
	    },

	    quarter: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setHours(0, 0, 0, 0));
	            date = new Date(date.setDate(1));
	            var currentMonth = date.getMonth();
	            var firstQuarterMonth = currentMonth - currentMonth % 3;
	            return new Date(date.setMonth(firstQuarterMonth));
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setMonth(prev.getMonth() + 3));
	            return this.cast(next);
	        }
	    },

	    year: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setHours(0, 0, 0, 0));
	            date = new Date(date.setDate(1));
	            date = new Date(date.setMonth(0));
	            return date;
	        },

	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setFullYear(prev.getFullYear() + 1));
	            return this.cast(next);
	        }
	    }
	};

	var UnitDomainPeriodGenerator = {

	    add: function add(periodAlias, obj) {
	        PERIODS_MAP[periodAlias.toLowerCase()] = obj;
	        return this;
	    },

	    get: function get(periodAlias) {
	        var alias = periodAlias || '';
	        return PERIODS_MAP[alias.toLowerCase()] || null;
	    },

	    generate: function generate(lTick, rTick, periodAlias) {
	        var r = [];
	        var period = UnitDomainPeriodGenerator.get(periodAlias);
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

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.DataFrame = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(4);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DataFrame = exports.DataFrame = function () {
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

	            return _utils.utils.generateHash(x);
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
	}();

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Plot = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _balloon = __webpack_require__(27);

	var _event = __webpack_require__(8);

	var _plugins = __webpack_require__(29);

	var _utils = __webpack_require__(4);

	var _utilsDom = __webpack_require__(1);

	var _unitsRegistry = __webpack_require__(30);

	var _scalesRegistry = __webpack_require__(31);

	var _scalesFactory = __webpack_require__(32);

	var _dataProcessor = __webpack_require__(33);

	var _layuotTemplate = __webpack_require__(34);

	var _specConverter = __webpack_require__(35);

	var _specTransformAutoLayout = __webpack_require__(36);

	var _specTransformCalcSize = __webpack_require__(37);

	var _specTransformApplyRatio = __webpack_require__(39);

	var _specTransformExtractAxes = __webpack_require__(40);

	var _tau = __webpack_require__(22);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Plot = exports.Plot = function (_Emitter) {
	    _inherits(Plot, _Emitter);

	    function Plot(config) {
	        _classCallCheck(this, Plot);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Plot).call(this));

	        _this._nodes = [];
	        _this._svg = null;
	        _this._filtersStore = {
	            filters: {},
	            tick: 0
	        };
	        _this._layout = (0, _layuotTemplate.getLayout)();

	        if (['sources', 'scales'].filter(function (p) {
	            return config.hasOwnProperty(p);
	        }).length === 2) {
	            _this.configGPL = config;
	        } else {
	            _this.configGPL = new _specConverter.SpecConverter(_this.setupConfig(config)).convert();
	        }

	        _this.configGPL.settings = Plot.setupSettings(_this.configGPL.settings);

	        _this.configGPL = Plot.setupPeriodData(_this.configGPL);

	        var plugins = config.plugins || [];

	        _this.transformers = [_specTransformApplyRatio.SpecTransformApplyRatio, _specTransformAutoLayout.SpecTransformAutoLayout];

	        _this.onUnitsStructureExpandedTransformers = [_specTransformExtractAxes.SpecTransformExtractAxes, _specTransformCalcSize.SpecTransformCalcSize];

	        _this._originData = _underscore2.default.clone(_this.configGPL.sources);
	        _this._chartDataModel = function (src) {
	            return src;
	        };
	        _this._liveSpec = _this.configGPL;
	        _this._plugins = new _plugins.Plugins(plugins, _this);
	        return _this;
	    }

	    _createClass(Plot, [{
	        key: 'destroy',
	        value: function destroy() {
	            this._nodes = _tau.GPL.destroyNodes(this._nodes);
	            _d2.default.select(this._svg).remove();
	            _d2.default.select(this._layout.layout).remove();
	            _get(Object.getPrototypeOf(Plot.prototype), 'destroy', this).call(this);
	        }
	    }, {
	        key: 'setupChartSourceModel',
	        value: function setupChartSourceModel(fnModelTransformation) {
	            this._chartDataModel = fnModelTransformation;
	        }
	    }, {
	        key: 'setupConfig',
	        value: function setupConfig(config) {

	            if (!config.spec || !config.spec.unit) {
	                throw new Error('Provide spec for plot');
	            }

	            var resConfig = _underscore2.default.defaults(config, {
	                spec: {},
	                data: [],
	                plugins: [],
	                settings: {}
	            });

	            this._emptyContainer = config.emptyContainer || '';
	            // TODO: remove this particular config cases
	            resConfig.settings.specEngine = config.specEngine || config.settings.specEngine;
	            resConfig.settings.layoutEngine = config.layoutEngine || config.settings.layoutEngine;
	            resConfig.settings = Plot.setupSettings(resConfig.settings);

	            resConfig.spec.dimensions = Plot.setupMetaInfo(resConfig.spec.dimensions, resConfig.data);

	            var log = resConfig.settings.log;
	            if (resConfig.settings.excludeNull) {
	                this.addFilter({
	                    tag: 'default',
	                    src: '/',
	                    predicate: _dataProcessor.DataProcessor.excludeNullValues(resConfig.spec.dimensions, function (item) {
	                        return log([item, 'point was excluded, because it has undefined values.'], 'WARN');
	                    })
	                });
	            }

	            return resConfig;
	        }
	    }, {
	        key: 'insertToLeftSidebar',
	        value: function insertToLeftSidebar(el) {
	            return _utilsDom.utilsDom.appendTo(el, this._layout.leftSidebar);
	        }
	    }, {
	        key: 'insertToRightSidebar',
	        value: function insertToRightSidebar(el) {
	            return _utilsDom.utilsDom.appendTo(el, this._layout.rightSidebar);
	        }
	    }, {
	        key: 'insertToFooter',
	        value: function insertToFooter(el) {
	            return _utilsDom.utilsDom.appendTo(el, this._layout.footer);
	        }
	    }, {
	        key: 'insertToHeader',
	        value: function insertToHeader(el) {
	            return _utilsDom.utilsDom.appendTo(el, this._layout.header);
	        }
	    }, {
	        key: 'addBalloon',
	        value: function addBalloon(conf) {
	            return new _balloon.Tooltip('', conf || {});
	        }
	    }, {
	        key: 'renderTo',
	        value: function renderTo(target, xSize) {
	            var _this2 = this;

	            this._svg = null;
	            this._target = target;
	            this._defaultSize = _underscore2.default.clone(xSize);

	            var targetNode = _d2.default.select(target).node();
	            if (targetNode === null) {
	                throw new Error('Target element not found');
	            }

	            targetNode.appendChild(this._layout.layout);

	            var content = this._layout.content;
	            var size = _underscore2.default.clone(xSize) || {};
	            if (!size.width || !size.height) {
	                content.style.display = 'none';
	                size = _underscore2.default.defaults(size, _utilsDom.utilsDom.getContainerSize(content.parentNode));
	                content.style.display = '';
	                // TODO: fix this issue
	                if (!size.height) {
	                    size.height = _utilsDom.utilsDom.getContainerSize(this._layout.layout).height;
	                }
	            }

	            this.configGPL.settings.size = size;

	            this._liveSpec = _utils.utils.clone(_underscore2.default.omit(this.configGPL, 'plugins'));
	            this._liveSpec.sources = this.getDataSources();
	            this._liveSpec.settings = this.configGPL.settings;

	            if (this.isEmptySources(this._liveSpec.sources)) {
	                content.innerHTML = this._emptyContainer;
	                return;
	            }

	            this._liveSpec = this.transformers.reduce(function (memo, TransformClass) {
	                return new TransformClass(memo).transform(_this2);
	            }, this._liveSpec);

	            this._nodes = _tau.GPL.destroyNodes(this._nodes);

	            this._liveSpec.onUnitDraw = function (unitNode) {
	                _this2._nodes.push(unitNode);
	                _this2.fire('unitdraw', unitNode);
	                ['click', 'mouseover', 'mouseout'].forEach(function (eventName) {
	                    return unitNode.on(eventName, function (sender, e) {
	                        _this2.fire('element' + eventName, {
	                            element: sender,
	                            data: e.data,
	                            event: e.event
	                        });
	                    });
	                });
	            };

	            this._liveSpec.onUnitsStructureExpanded = function (specRef) {
	                _this2.onUnitsStructureExpandedTransformers.forEach(function (TClass) {
	                    return new TClass(specRef).transform(_this2);
	                });
	                _this2.fire(['units', 'structure', 'expanded'].join(''), specRef);
	            };

	            this.fire('specready', this._liveSpec);

	            new _tau.GPL(this._liveSpec, this.getScaleFactory(), _unitsRegistry.unitsRegistry).renderTo(content, this._liveSpec.settings.size);

	            var svgXElement = _d2.default.select(content).select('svg');

	            this._svg = svgXElement.node();
	            this._layout.rightSidebar.style.maxHeight = this._liveSpec.settings.size.height + 'px';
	            this.fire('render', this._svg);
	        }
	    }, {
	        key: 'getScaleFactory',
	        value: function getScaleFactory() {
	            var dataSources = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

	            return new _scalesFactory.ScalesFactory(_scalesRegistry.scalesRegistry.instance(this._liveSpec.settings), dataSources || this._liveSpec.sources, this._liveSpec.scales);
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

	            var filters = (0, _underscore2.default)(this._filtersStore.filters).chain().values().flatten().reject(function (f) {
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
	            var _this3 = this;

	            var param = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


	            var excludeFiltersByTagAndSource = function excludeFiltersByTagAndSource(k) {
	                return function (f) {
	                    return _underscore2.default.contains(param.excludeFilter, f.tag) || f.src !== k;
	                };
	            };

	            var chartDataModel = this._chartDataModel(this._originData);

	            return Object.keys(chartDataModel).filter(function (k) {
	                return k !== '?';
	            }).reduce(function (memo, k) {
	                var item = chartDataModel[k];
	                var filterIterator = _this3.getSourceFiltersIterator(excludeFiltersByTagAndSource(k));
	                memo[k] = {
	                    dims: item.dims,
	                    data: item.data.filter(filterIterator)
	                };
	                return memo;
	            }, {
	                '?': chartDataModel['?']
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
	        key: 'getChartModelData',
	        value: function getChartModelData() {
	            var param = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	            var src = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

	            var sources = this.getDataSources(param);
	            return sources[src].data;
	        }
	    }, {
	        key: 'getDataDims',
	        value: function getDataDims() {
	            var src = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];

	            return this._originData[src].dims;
	        }
	    }, {
	        key: 'getData',
	        value: function getData() {
	            var src = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];

	            return this._originData[src].data;
	        }
	    }, {
	        key: 'setData',
	        value: function setData(data) {
	            var src = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

	            this._originData[src].data = data;
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
	            var _this4 = this;

	            _underscore2.default.each(this._filtersStore.filters, function (filters, key) {
	                _this4._filtersStore.filters[key] = _underscore2.default.reject(filters, function (item) {
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

	            var traverse = function traverse(node, iterator, parentNode, parentFrame) {

	                iterator(node, parentNode, parentFrame);

	                if (node.frames) {
	                    node.frames.forEach(function (frame) {
	                        (frame.units || []).map(function (x) {
	                            return traverse(x, iterator, node, frame);
	                        });
	                    });
	                } else {
	                    (node.units || []).map(function (x) {
	                        return traverse(x, iterator, node, null);
	                    });
	                }
	            };

	            traverse(spec.unit, iterator, null, null);
	        }

	        // use from plugins to get the most actual chart config

	    }, {
	        key: 'getSpec',
	        value: function getSpec() {
	            return this._liveSpec;
	        }
	    }, {
	        key: 'getLayout',
	        value: function getLayout() {
	            return this._layout;
	        }
	    }], [{
	        key: 'setupPeriodData',
	        value: function setupPeriodData(spec) {
	            var tickPeriod = Plot.__api__.tickPeriod;
	            var log = spec.settings.log;

	            var scales = Object.keys(spec.scales).map(function (s) {
	                return spec.scales[s];
	            });

	            var workPlan = scales.filter(function (s) {
	                return s.type === 'period';
	            }).reduce(function (memo, scaleRef) {
	                var periodCaster = tickPeriod.get(scaleRef.period);
	                if (periodCaster) {
	                    memo.push({ source: scaleRef.source, dim: scaleRef.dim, period: periodCaster });
	                } else {
	                    log(['Unknown period "' + scaleRef.period + '".', 'Docs: http://api.taucharts.com/plugins/customticks.html#how-to-add-custom-tick-period'], 'WARN');
	                    scaleRef.period = null;
	                }

	                return memo;
	            }, []);

	            var isNullOrUndefined = function isNullOrUndefined(x) {
	                return x === null || typeof x === 'undefined';
	            };

	            var reducer = function reducer(refSources, metaDim) {
	                refSources[metaDim.source].data = refSources[metaDim.source].data.map(function (row) {
	                    var val = row[metaDim.dim];
	                    if (!isNullOrUndefined(val)) {
	                        row[metaDim.dim] = metaDim.period.cast(val);
	                    }
	                    return row;
	                });

	                return refSources;
	            };

	            spec.sources = workPlan.reduce(reducer, spec.sources);

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
	                localSettings[k] = _underscore2.default.isFunction(globalSettings[k]) ? globalSettings[k] : _utils.utils.clone(globalSettings[k]);
	            });

	            var r = _underscore2.default.defaults(configSettings || {}, localSettings);

	            if (!_utils.utils.isArray(r.specEngine)) {
	                r.specEngine = [{ width: Number.MAX_VALUE, name: r.specEngine }];
	            }

	            return r;
	        }
	    }]);

	    return Plot;
	}(_event.Emitter);

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Tooltip = undefined;

	var _const = __webpack_require__(6);

	var _tauTooltip = __webpack_require__(28);

	_tauTooltip.Tooltip.defaults.baseClass = _const.CSS_PREFIX + 'tooltip';
	exports.Tooltip = _tauTooltip.Tooltip;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function webpackUniversalModuleDefinition(root, factory) {
	    if(true)
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    else if(typeof module === "object" && module.exports)
			module.exports = factory();
		else if(typeof exports === 'object')
			exports["Tooltip"] = factory();
		else
			root["Tooltip"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports) {

		'use strict';

		Object.defineProperty(exports, '__esModule', {
		    value: true
		});
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
		Tooltip.prototype.getElement = function () {
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
		 * git remote add origin https://github.com/TargetProcess/tau-tooltip.git.
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
		    baseClass: 'tooltip', // Base tooltip class name.
		    typeClass: null, // Type tooltip class name.
		    effectClass: null, // Effect tooltip class name.
		    inClass: 'in', // Class used to transition stuff in.
		    place: 'top', // Default place.
		    spacing: null, // Gap between target and tooltip.
		    auto: 0 // Whether to automatically adjust place to fit into window.
		};

		exports.Tooltip = Tooltip;

	/***/ }
	/******/ ])
	});
	;

/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Plugins = function () {
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
	}();

	exports.Plugins = Plugins;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.unitsRegistry = undefined;

	var _error = __webpack_require__(10);

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

/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ScalesMap = {};
	var ConfigMap = {};

	var scalesRegistry = exports.scalesRegistry = function () {
	    function scalesRegistry() {
	        _classCallCheck(this, scalesRegistry);
	    }

	    _createClass(scalesRegistry, null, [{
	        key: "reg",
	        value: function reg(scaleType, scaleClass) {
	            var configInterceptor = arguments.length <= 2 || arguments[2] === undefined ? function (x) {
	                return x;
	            } : arguments[2];

	            ScalesMap[scaleType] = scaleClass;
	            ConfigMap[scaleType] = configInterceptor;
	            return this;
	        }
	    }, {
	        key: "get",
	        value: function get(scaleType) {
	            return ScalesMap[scaleType];
	        }
	    }, {
	        key: "instance",
	        value: function instance() {
	            var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	            return {
	                create: function create(scaleType, dataFrame, scaleConfig) {
	                    var ScaleClass = scalesRegistry.get(scaleType);
	                    var configFunc = ConfigMap[scaleType];
	                    return new ScaleClass(dataFrame, configFunc(scaleConfig, settings));
	                }
	            };
	        }
	    }]);

	    return scalesRegistry;
	}();

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ScalesFactory = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dataFrame = __webpack_require__(25);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ScalesFactory = exports.ScalesFactory = function () {
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


	            var dim = scaleConfig.dim;
	            var src = scaleConfig.source;

	            var type = (this.sources[src].dims[dim] || {}).type;
	            var data = this.sources[src].data;

	            var frame = dataFrame || new _dataFrame.DataFrame({ source: src }, data);

	            scaleConfig.dimType = type;

	            return this.registry.create(scaleConfig.type, frame, scaleConfig);
	        }
	    }, {
	        key: 'createScaleInfoByName',
	        value: function createScaleInfoByName(name) {
	            var dataFrame = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	            return this.createScaleInfo(this.scales[name], dataFrame);
	        }
	    }]);

	    return ScalesFactory;
	}();

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.DataProcessor = undefined;

	var _utils = __webpack_require__(4);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	            r[k] = _underscore2.default.extend({}, item, {
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

	            if (_underscore2.default.isDate(propertyValue)) {
	                pair.type = 'measure';
	                pair.scale = 'time';
	            } else if (_underscore2.default.isObject(propertyValue)) {
	                pair.type = 'order';
	                pair.scale = 'ordinal';
	            } else if (_underscore2.default.isNumber(propertyValue)) {
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
	                    var typeScalePair = detectType(val, _utils.utils.clone(defaultDetect));
	                    var detectedType = typeScalePair.type;
	                    var detectedScale = typeScalePair.scale;

	                    var isInContraToPrev = memo[key].type !== null && memo[key].type !== detectedType;
	                    memo[key].type = isInContraToPrev ? defaultDetect.type : detectedType;
	                    memo[key].scale = isInContraToPrev ? defaultDetect.scale : detectedScale;
	                }
	            });

	            return memo;
	        };

	        return _underscore2.default.reduce(data, reducer, {});
	    },

	    sortByDim: function sortByDim(data, dimName, dimInfo) {
	        var rows = data;
	        if (dimInfo.type === 'measure' || dimInfo.scale === 'period') {
	            rows = (0, _underscore2.default)(data).sortBy(dimName);
	        } else if (dimInfo.order) {
	            var hashOrder = dimInfo.order.reduce(function (memo, x, i) {
	                memo[x] = i;
	                return memo;
	            }, {});
	            var defaultN = dimInfo.order.length;
	            var k = '(___' + dimName + '___)';
	            rows = data.map(function (row) {
	                var orderN = hashOrder[row[dimName]];
	                orderN = orderN >= 0 ? orderN : defaultN;
	                row[k] = orderN;
	                return row;
	            }).sort(function (a, b) {
	                return a[k] - b[k];
	            }).map(function (row) {
	                delete row[k];
	                return row;
	            });
	        }
	        return rows;
	    }
	};

	exports.DataProcessor = DataProcessor;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getLayout = undefined;

	var _const = __webpack_require__(6);

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

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecConverter = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _utils = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SpecConverter = exports.SpecConverter = function () {
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
	                'size_null': { type: 'size', source: '?' },
	                'color_null': { type: 'color', source: '?', brewer: null },
	                'split_null': { type: 'value', source: '?' },

	                'pos:default': { type: 'ordinal', source: '?' },
	                'size:default': { type: 'size', source: '?' },
	                'label:default': { type: 'value', source: '?' },
	                'color:default': { type: 'color', source: '?', brewer: null },
	                'split:default': { type: 'value', source: '?' }
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

	                childUnit.namespace = 'chart';

	                // leaf elements should inherit coordinates properties
	                if (root && !childUnit.hasOwnProperty('units')) {
	                    childUnit = _underscore2.default.defaults(childUnit, _underscore2.default.pick(root, 'x', 'y'));

	                    var parentGuide = _utils.utils.clone(root.guide || {});
	                    childUnit.guide = childUnit.guide || {};
	                    childUnit.guide.x = _underscore2.default.defaults(childUnit.guide.x || {}, parentGuide.x);
	                    childUnit.guide.y = _underscore2.default.defaults(childUnit.guide.y || {}, parentGuide.y);

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

	                if (_underscore2.default.isObject(row[key]) && !_underscore2.default.isDate(row[key])) {
	                    _underscore2.default.each(row[key], function (v, k) {
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
	                var gplRoot = _utils.utils.clone(_underscore2.default.omit(srcUnit, 'unit'));
	                _this.ruleCreateScales(srcUnit, gplRoot);
	                gplRoot.expression = _this.ruleInferExpression(srcUnit);

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
	            ['color', 'size', 'label', 'x', 'y', 'split'].forEach(function (p) {
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
	                delete myDims[dimName];
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

	                if (guide.hasOwnProperty('min')) {
	                    item.min = guide.min;
	                }

	                if (guide.hasOwnProperty('max')) {
	                    item.max = guide.max;
	                }

	                if (guide.hasOwnProperty('nice')) {
	                    item.nice = guide.nice;
	                }
	            }

	            if (scaleType === 'size' && dimName !== null) {
	                item = {
	                    type: 'size',
	                    source: '/',
	                    dim: this.ruleInferDim(dimName, guide)
	                };

	                if (guide.hasOwnProperty('func')) {
	                    item.func = guide.func;
	                }

	                if (guide.hasOwnProperty('min')) {
	                    item.min = guide.min;
	                }

	                if (guide.hasOwnProperty('max')) {
	                    item.max = guide.max;
	                }

	                if (guide.hasOwnProperty('minSize')) {
	                    item.minSize = guide.minSize;
	                }

	                if (guide.hasOwnProperty('maxSize')) {
	                    item.maxSize = guide.maxSize;
	                }
	            }

	            if (scaleType === 'label' && dimName !== null) {
	                item = {
	                    type: 'value',
	                    source: '/',
	                    dim: this.ruleInferDim(dimName, guide)
	                };
	            }

	            if (scaleType === 'split' && dimName !== null) {
	                item = {
	                    type: 'value',
	                    source: '/',
	                    dim: this.ruleInferDim(dimName, guide)
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

	                if (guide.hasOwnProperty('nice')) {
	                    item.nice = guide.nice;
	                } else {
	                    // #121763
	                    // for backward compatibility with "autoScale" property
	                    item.nice = item.autoScale;
	                }

	                if (guide.hasOwnProperty('niceInterval')) {
	                    item.niceInterval = guide.niceInterval;
	                } else {
	                    item.niceInterval = null;
	                }

	                if (guide.hasOwnProperty('tickPeriod')) {
	                    item.period = guide.tickPeriod;
	                    item.type = 'period';
	                }

	                item.fitToFrameByDims = guide.fitToFrameByDims;

	                item.ratio = guide.ratio;
	            }

	            this.dist.scales[k] = item;

	            return k;
	        }
	    }, {
	        key: 'getScaleConfig',
	        value: function getScaleConfig(scaleType, dimName) {
	            var k = scaleType + '_' + dimName;
	            return this.dist.scales[k];
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

	            var scaleX = this.getScaleConfig('x', srcUnit.x);
	            var scaleY = this.getScaleConfig('y', srcUnit.y);

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
	                    if (scaleX.period || scaleY.period) {
	                        expr = {
	                            operator: 'cross_period',
	                            params: [this.ruleInferDim(srcUnit.x, gx), this.ruleInferDim(srcUnit.y, gy), scaleX.period, scaleY.period]
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

	            return _underscore2.default.extend({ inherit: true, source: '/' }, expr);
	        }
	    }]);

	    return SpecConverter;
	}();

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformAutoLayout = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _utils = __webpack_require__(4);

	var _formatterRegistry = __webpack_require__(15);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var sum = function sum(arr) {
	    return arr.reduce(function (sum, x) {
	        return sum + x;
	    }, 0);
	};

	function extendGuide(guide, targetUnit, dimension, properties) {
	    var guide_dim = guide.hasOwnProperty(dimension) ? guide[dimension] : {};
	    guide_dim = guide_dim || {};
	    _underscore2.default.each(properties, function (prop) {
	        _underscore2.default.extend(targetUnit.guide[dimension][prop], guide_dim[prop]);
	    });
	    _underscore2.default.extend(targetUnit.guide[dimension], _underscore2.default.omit.apply(_underscore2.default, [guide_dim].concat[properties]));
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

	    _underscore2.default.each(config, function (properties, name) {
	        extendGuide(guide, targetUnit, name, properties);
	    });
	    _underscore2.default.extend(targetUnit.guide, _underscore2.default.omit.apply(_underscore2.default, [guide].concat(_underscore2.default.keys(config))));
	    return targetUnit;
	};

	var extendLabel = function extendLabel(guide, dimension, extend) {
	    guide[dimension] = _underscore2.default.defaults(guide[dimension] || {}, {
	        label: ''
	    });
	    guide[dimension].label = _underscore2.default.isObject(guide[dimension].label) ? guide[dimension].label : { text: guide[dimension].label };
	    guide[dimension].label = _underscore2.default.defaults(guide[dimension].label, extend || {}, {
	        padding: 32,
	        rotate: 0,
	        textAnchor: 'middle',
	        cssClass: 'label',
	        dock: null
	    });

	    return guide[dimension];
	};
	var extendAxis = function extendAxis(guide, dimension, extend) {
	    guide[dimension] = _underscore2.default.defaults(guide[dimension], extend || {}, {
	        padding: 0,
	        density: 30,
	        rotate: 0,
	        tickPeriod: null,
	        tickFormat: null,
	        autoScale: true
	    });
	    guide[dimension].tickFormat = guide[dimension].tickFormat || guide[dimension].tickPeriod;
	    guide[dimension].nice = guide[dimension].hasOwnProperty('nice') ? guide[dimension].nice : guide[dimension].autoScale;

	    return guide[dimension];
	};

	var applyNodeDefaults = function applyNodeDefaults(node) {
	    node.options = node.options || {};
	    node.guide = node.guide || {};
	    node.guide.padding = _underscore2.default.defaults(node.guide.padding || {}, { l: 0, b: 0, r: 0, t: 0 });

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
	        childUnit = _underscore2.default.defaults(childUnit, root);
	        childUnit.guide = _underscore2.default.defaults(childUnit.guide, _utils.utils.clone(root.guide));
	        childUnit.guide.x = _underscore2.default.defaults(childUnit.guide.x, _utils.utils.clone(root.guide.x));
	        childUnit.guide.y = _underscore2.default.defaults(childUnit.guide.y, _utils.utils.clone(root.guide.y));
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

	    var maxXTickText = _underscore2.default.max(domainValues, function (x) {
	        return formatter(x).toString().length;
	    });

	    // d3 sometimes produce fractional ticks on wide space
	    // so we intentionally add fractional suffix
	    // to foresee scale density issues
	    var suffix = _underscore2.default.isNumber(maxXTickText) ? '.00' : '';

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

	var getSettings = function getSettings(settings, prop, dimType) {
	    return settings.hasOwnProperty(prop + ':' + dimType) ? settings[prop + ':' + dimType] : settings['' + prop];
	};

	var shortFormat = function shortFormat(format) {
	    var timeFormats = ['day', 'week', 'month'];
	    if (timeFormats.indexOf(format) >= 0) {
	        format += '-short';
	    }

	    return format;
	};

	var rotateBox = function rotateBox(_ref, angle) {
	    var width = _ref.width;
	    var height = _ref.height;

	    var rad = _utils.utils.toRadian(angle);
	    return {
	        width: Math.max(Math.cos(rad) * width, height),
	        height: Math.max(Math.sin(rad) * width, height)
	    };
	};

	var getTextAnchorByAngle = function getTextAnchorByAngle(angle) {
	    var xOrY = arguments.length <= 1 || arguments[1] === undefined ? 'x' : arguments[1];


	    if (Math.abs(angle) >= 360) {
	        angle = angle % 360;
	    }

	    if (angle < 0) {
	        angle = 360 + angle;
	    }

	    var xRules = xOrY === 'x' ? [[0, 45, 'middle'], [45, 135, 'start'], [135, 225, 'middle'], [225, 315, 'end'], [315, 360, 'middle']] : [[0, 90, 'end'], [90, 135, 'middle'], [135, 225, 'start'], [225, 315, 'middle'], [315, 360, 'end']];

	    var i = _underscore2.default.findIndex(xRules, function (r) {
	        return angle >= r[0] && angle < r[1];
	    });

	    return xRules[i][2];
	};

	var wrapLine = function wrapLine(box, lineWidthLimit, linesCountLimit) {
	    var guessLinesCount = Math.ceil(box.width / lineWidthLimit);
	    var koeffLinesCount = Math.min(guessLinesCount, linesCountLimit);
	    return {
	        height: koeffLinesCount * box.height,
	        width: lineWidthLimit
	    };
	};

	var calcXYGuide = function calcXYGuide(guide, settings, xMeta, yMeta, inlineLabels) {

	    var xValues = xMeta.values;
	    var yValues = yMeta.values;
	    var xIsEmptyAxis = xMeta.isEmpty;
	    var yIsEmptyAxis = yMeta.isEmpty;

	    var maxXTickBox = getMaxTickLabelSize(xValues, _formatterRegistry.FormatterRegistry.get(guide.x.tickFormat, guide.x.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.xAxisTickLabelLimit);

	    var maxYTickBox = getMaxTickLabelSize(yValues, _formatterRegistry.FormatterRegistry.get(guide.y.tickFormat, guide.y.tickFormatNullAlias), settings.getAxisTickLabelSize, settings.yAxisTickLabelLimit);

	    var multiLinesXBox = maxXTickBox;
	    var multiLinesYBox = maxYTickBox;

	    if (maxXTickBox.width > settings.xAxisTickLabelLimit) {
	        guide.x.tickFormatWordWrap = true;
	        guide.x.tickFormatWordWrapLines = settings.xTickWordWrapLinesLimit;
	        multiLinesXBox = wrapLine(maxXTickBox, settings.xAxisTickLabelLimit, settings.xTickWordWrapLinesLimit);
	    }

	    if (maxYTickBox.width > settings.yAxisTickLabelLimit) {
	        guide.y.tickFormatWordWrap = true;
	        guide.y.tickFormatWordWrapLines = settings.yTickWordWrapLinesLimit;
	        multiLinesYBox = wrapLine(maxYTickBox, settings.yAxisTickLabelLimit, settings.yTickWordWrapLinesLimit);
	    }

	    var kxAxisW = xIsEmptyAxis ? 0 : 1;
	    var kyAxisW = yIsEmptyAxis ? 0 : 1;

	    var xLabel = guide.x.label;
	    var yLabel = guide.y.label;
	    var kxLabelW = xLabel.text && !xLabel.hide ? 1 : 0;
	    var kyLabelW = yLabel.text && !yLabel.hide ? 1 : 0;

	    var rotXBox = rotateBox(multiLinesXBox, guide.x.rotate);
	    var rotYBox = rotateBox(multiLinesYBox, guide.y.rotate);

	    if (inlineLabels) {

	        xLabel.padding = (-settings.xAxisPadding - settings.xFontLabelHeight) / 2 + settings.xFontLabelHeight;
	        yLabel.padding = (-settings.yAxisPadding - settings.yFontLabelHeight) / 2;

	        kxLabelW = 0;
	        kyLabelW = 0;
	    } else {

	        xLabel.padding = sum([kxAxisW * (settings.xTickWidth + rotXBox.height), kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight - 2)]);

	        yLabel.padding = sum([kyAxisW * (settings.yTickWidth + rotYBox.width), kyLabelW * settings.distToYAxisLabel]);
	    }

	    guide.padding = _underscore2.default.extend(guide.padding, {
	        b: guide.x.hide ? 0 : sum([guide.x.padding, kxAxisW * (settings.xTickWidth + rotXBox.height), kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight)]),
	        l: guide.y.hide ? 0 : sum([guide.y.padding, kyAxisW * (settings.yTickWidth + rotYBox.width), kyLabelW * (settings.distToYAxisLabel + settings.yFontLabelHeight)])
	    });

	    guide.x = _underscore2.default.extend(guide.x, {
	        density: rotXBox.width + getSettings(settings, 'xDensityPadding', xMeta.dimType) * 2,
	        tickFontHeight: maxXTickBox.height,
	        $minimalDomain: xValues.length,
	        $maxTickTextW: multiLinesXBox.width,
	        $maxTickTextH: multiLinesXBox.height,
	        tickFormatWordWrapLimit: settings.xAxisTickLabelLimit
	    });

	    guide.y = _underscore2.default.extend(guide.y, {
	        density: rotYBox.height + getSettings(settings, 'yDensityPadding', yMeta.dimType) * 2,
	        tickFontHeight: maxYTickBox.height,
	        $minimalDomain: yValues.length,
	        $maxTickTextW: multiLinesYBox.width,
	        $maxTickTextH: multiLinesYBox.height,
	        tickFormatWordWrapLimit: settings.yAxisTickLabelLimit
	    });

	    return guide;
	};

	var calcUnitGuide = function calcUnitGuide(unit, meta, settings, allowXVertical, allowYVertical, inlineLabels) {

	    var dimX = meta.dimension(unit.x);
	    var dimY = meta.dimension(unit.y);

	    var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
	    var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
	    var xIsEmptyAxis = xMeta.isEmpty;
	    var yIsEmptyAxis = yMeta.isEmpty;

	    unit.guide.x.tickFormat = shortFormat(unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats));
	    unit.guide.y.tickFormat = shortFormat(unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats));

	    var isXVertical = allowXVertical ? !(dimX.dimType === 'measure') : false;
	    var isYVertical = allowYVertical ? !(dimY.dimType === 'measure') : false;

	    unit.guide.x.padding = xIsEmptyAxis ? 0 : settings.xAxisPadding;
	    unit.guide.y.padding = yIsEmptyAxis ? 0 : settings.yAxisPadding;

	    unit.guide.x.rotate = isXVertical ? 90 : 0;
	    unit.guide.x.textAnchor = getTextAnchorByAngle(unit.guide.x.rotate, 'x');

	    unit.guide.y.rotate = isYVertical ? -90 : 0;
	    unit.guide.y.textAnchor = getTextAnchorByAngle(unit.guide.y.rotate, 'y');

	    unit.guide = calcXYGuide(unit.guide, settings, xMeta, yMeta, inlineLabels);

	    if (inlineLabels) {

	        var xLabel = unit.guide.x.label;
	        var yLabel = unit.guide.y.label;

	        xLabel.cssClass += ' inline';
	        xLabel.dock = 'right';
	        xLabel.textAnchor = 'end';

	        yLabel.cssClass += ' inline';
	        yLabel.dock = 'right';
	        yLabel.textAnchor = 'end';
	    }

	    return unit;
	};

	var SpecEngineTypeMap = {

	    NONE: function NONE(srcSpec, meta, settings) {

	        var spec = _utils.utils.clone(srcSpec);
	        fnTraverseSpec(_utils.utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {
	            unit.guide.x.tickFontHeight = settings.getAxisTickLabelSize('X').height;
	            unit.guide.y.tickFontHeight = settings.getAxisTickLabelSize('Y').height;

	            unit.guide.x.tickFormatWordWrapLimit = settings.xAxisTickLabelLimit;
	            unit.guide.y.tickFormatWordWrapLimit = settings.yAxisTickLabelLimit;

	            return unit;
	        });
	        return spec;
	    },

	    'BUILD-LABELS': function BUILDLABELS(srcSpec, meta) {

	        var spec = _utils.utils.clone(srcSpec);

	        var xLabels = [];
	        var yLabels = [];
	        var xUnit = null;
	        var yUnit = null;

	        _utils.utils.traverseJSON(spec.unit, 'units', createSelectorPredicates, function (selectors, unit) {

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

	            unit.guide.x.label = _underscore2.default.isObject(unit.guide.x.label) ? unit.guide.x.label : { text: unit.guide.x.label };
	            unit.guide.y.label = _underscore2.default.isObject(unit.guide.y.label) ? unit.guide.y.label : { text: unit.guide.y.label };

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
	                unit.guide.x.label._original_text = x;
	            }

	            var y = unit.guide.y.label.text;
	            if (y) {
	                yLabels.push(y);
	                unit.guide.y.tickFormatNullAlias = unit.guide.y.hasOwnProperty('tickFormatNullAlias') ? unit.guide.y.tickFormatNullAlias : 'No ' + y;
	                unit.guide.y.label.text = '';
	                unit.guide.y.label._original_text = y;
	            }

	            return unit;
	        });

	        var rightArrow = ' → ';

	        if (xUnit) {
	            xUnit.guide.x.label.text = xUnit.guide.x.label.hide ? '' : xLabels.join(rightArrow);
	        }

	        if (yUnit) {
	            yUnit.guide.y.label.text = yUnit.guide.y.label.hide ? '' : yLabels.join(rightArrow);
	        }

	        return spec;
	    },

	    'BUILD-GUIDE': function BUILDGUIDE(srcSpec, meta, settings) {

	        var spec = _utils.utils.clone(srcSpec);
	        fnTraverseSpec(_utils.utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {

	            if (selectorPredicates.isLeaf) {
	                return unit;
	            }

	            var isFacetUnit = !selectorPredicates.isLeaf && !selectorPredicates.isLeafParent;

	            var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
	            var yMeta = meta.scaleMeta(unit.y, unit.guide.y);

	            var isXVertical = !isFacetUnit && Boolean(xMeta.dimType) && xMeta.dimType !== 'measure';

	            unit.guide.x.rotate = isXVertical ? 90 : 0;
	            unit.guide.x.textAnchor = getTextAnchorByAngle(unit.guide.x.rotate);

	            unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(xMeta, settings.defaultFormats);
	            unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(yMeta, settings.defaultFormats);

	            unit.guide.x.padding = isFacetUnit ? 0 : settings.xAxisPadding;
	            unit.guide.y.padding = isFacetUnit ? 0 : settings.yAxisPadding;

	            unit.guide = calcXYGuide(unit.guide, _underscore2.default.defaults({
	                distToXAxisLabel: xMeta.isEmpty ? settings.xTickWidth : settings.distToXAxisLabel,
	                distToYAxisLabel: yMeta.isEmpty ? settings.yTickWidth : settings.distToYAxisLabel
	            }, settings), xMeta, yMeta);

	            unit.guide.x = _underscore2.default.extend(unit.guide.x, {
	                cssClass: isFacetUnit ? unit.guide.x.cssClass + ' facet-axis' : unit.guide.x.cssClass,
	                avoidCollisions: isFacetUnit ? true : unit.guide.x.avoidCollisions
	            });

	            unit.guide.y = _underscore2.default.extend(unit.guide.y, {
	                cssClass: isFacetUnit ? unit.guide.y.cssClass + ' facet-axis' : unit.guide.y.cssClass,
	                avoidCollisions: isFacetUnit ? false : unit.guide.y.avoidCollisions
	            });

	            unit.guide = _underscore2.default.extend(unit.guide, {
	                showGridLines: unit.guide.hasOwnProperty('showGridLines') ? unit.guide.showGridLines : selectorPredicates.isLeafParent ? 'xy' : ''
	            });

	            return unit;
	        });

	        return spec;
	    },

	    'BUILD-COMPACT': function BUILDCOMPACT(srcSpec, meta, settings) {

	        var spec = _utils.utils.clone(srcSpec);
	        fnTraverseSpec(_utils.utils.clone(spec.unit), spec.unit, function (selectorPredicates, unit) {

	            if (selectorPredicates.isLeaf) {
	                return unit;
	            }

	            if (!unit.guide.hasOwnProperty('showGridLines')) {
	                unit.guide.showGridLines = selectorPredicates.isLeafParent ? 'xy' : '';
	            }

	            if (selectorPredicates.isLeafParent) {

	                return calcUnitGuide(unit, meta, _underscore2.default.defaults({
	                    xTickWordWrapLinesLimit: 1,
	                    yTickWordWrapLinesLimit: 1
	                }, settings), true, false, true);
	            }

	            // facet level
	            unit.guide.x.cssClass += ' facet-axis compact';
	            unit.guide.x.avoidCollisions = true;
	            unit.guide.y.cssClass += ' facet-axis compact';
	            unit.guide.y.avoidCollisions = true;

	            return calcUnitGuide(unit, meta, _underscore2.default.defaults({
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
	    var prop = _underscore2.default.omit(xRef, 'units');
	    (xRef.units || []).forEach(function (unit) {
	        return fnTraverseSpec(_utils.utils.clone(unit), inheritProps(unit, prop), transformRules);
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
	                var values = scale.domain();

	                var scaleCfg = srcSpec.scales[scaleId];
	                var dim = srcSpec.sources[scaleCfg.source].dims[scaleCfg.dim] || {};
	                return {
	                    dimName: scaleCfg.dim,
	                    dimType: dim.type,
	                    scaleType: scaleCfg.type,
	                    values: values,
	                    isEmpty: values.filter(function (x) {
	                        return !_underscore2.default.isUndefined(x);
	                    }).length === 0
	                };
	            }
	        };

	        var unitSpec = { unit: _utils.utils.clone(srcSpec.unit) };
	        var fullSpec = engine(unitSpec, meta, settings);
	        srcSpec.unit = fullSpec.unit;
	        return srcSpec;
	    }
	};

	var SpecTransformAutoLayout = exports.SpecTransformAutoLayout = function () {
	    function SpecTransformAutoLayout(spec) {
	        _classCallCheck(this, SpecTransformAutoLayout);

	        this.spec = spec;
	        this.isApplicable = _utils.utils.isSpecRectCoordsOnly(spec.unit);
	    }

	    _createClass(SpecTransformAutoLayout, [{
	        key: 'transform',
	        value: function transform(chart) {

	            var spec = this.spec;

	            if (!this.isApplicable) {
	                return spec;
	            }

	            var size = spec.settings.size;

	            var rule = _underscore2.default.find(spec.settings.specEngine, function (rule) {
	                return size.width <= rule.width;
	            });

	            return SpecEngineFactory.get(rule.name, spec.settings, spec, function (type, alias) {
	                return chart.getScaleInfo(alias || type + ':default');
	            });
	        }
	    }]);

	    return SpecTransformAutoLayout;
	}();

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformCalcSize = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(4);

	var _specTransformOptimize = __webpack_require__(38);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var byOptimisticMaxText = function byOptimisticMaxText(gx) {
	    return gx.$maxTickTextW;
	};
	var byPessimisticMaxText = function byPessimisticMaxText(gx) {
	    return gx.rotate == 0 ? gx.$maxTickTextW : gx.$maxTickTextH;
	};
	var byDensity = function byDensity(gx) {
	    return gx.density;
	};

	var fitModelStrategies = {
	    'entire-view': function entireView(srcSize, calcSize, specRef, tryOptimizeSpec) {

	        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
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
	    normal: function normal(srcSize, calcSize, specRef, tryOptimizeSpec) {

	        var newW = srcSize.width;

	        var optimisticWidthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
	        if (optimisticWidthByMaxText <= srcSize.width) {
	            tryOptimizeSpec(specRef.unit, specRef.settings);
	        } else {
	            var pessimisticWidthByMaxText = calcSize('x', specRef.unit, byPessimisticMaxText);
	            if (pessimisticWidthByMaxText > srcSize.width) {
	                var widthByDensity = Math.max(srcSize.width, calcSize('x', specRef.unit, byDensity));
	                newW = Math.min(pessimisticWidthByMaxText, widthByDensity);
	            }
	        }

	        var newH = Math.max(srcSize.height, calcSize('y', specRef.unit, byDensity));

	        return { newW: newW, newH: newH };
	    },
	    'fit-width': function fitWidth(srcSize, calcSize, specRef, tryOptimizeSpec) {
	        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
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

	var SpecTransformCalcSize = exports.SpecTransformCalcSize = function () {
	    function SpecTransformCalcSize(spec) {
	        _classCallCheck(this, SpecTransformCalcSize);

	        this.spec = spec;
	        this.isApplicable = _utils.utils.isSpecRectCoordsOnly(spec.unit);
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

	                if (scaleInfo.discrete) {
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
	                var newSize = strategy(srcSize, calcSizeRecursively, specRef, _specTransformOptimize.SpecTransformOptimize.optimize);
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
	}();

/***/ },
/* 38 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SpecTransformOptimize = exports.SpecTransformOptimize = function () {
	    function SpecTransformOptimize() {
	        _classCallCheck(this, SpecTransformOptimize);
	    }

	    _createClass(SpecTransformOptimize, null, [{
	        key: 'optimize',
	        value: function optimize(root, localSettings) {

	            var enterSpec = function enterSpec(rootUnit, xAxisTickLabelLimit, interceptor) {

	                if (rootUnit.guide.x.hide !== true && rootUnit.guide.x.rotate !== 0) {
	                    rootUnit.guide.x.rotate = 0;
	                    rootUnit.guide.x.textAnchor = 'middle';

	                    var tickTextWidth = Math.min(xAxisTickLabelLimit, rootUnit.guide.x.$maxTickTextW);
	                    var tickTextDelta = 0 - tickTextWidth + rootUnit.guide.x.$maxTickTextH;

	                    interceptor(rootUnit, tickTextDelta);
	                }

	                (rootUnit.units || []).filter(function (u) {
	                    return u.type === 'COORDS.RECT';
	                }).forEach(function (u) {
	                    return enterSpec(u, xAxisTickLabelLimit, interceptor);
	                });
	            };

	            enterSpec(root, localSettings.xAxisTickLabelLimit, function (unit, tickTextDelta) {
	                if (root !== unit && unit.guide.autoLayout === 'extract-axes') {
	                    root.guide.x.padding += tickTextDelta;
	                    root.guide.padding.b += tickTextDelta;
	                } else {
	                    unit.guide.x.label.padding += unit.guide.x.label.padding > 0 ? tickTextDelta : 0;
	                    unit.guide.padding.b += unit.guide.padding.b > 0 ? tickTextDelta : 0;
	                }
	            });
	        }
	    }]);

	    return SpecTransformOptimize;
	}();

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformApplyRatio = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(4);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SpecTransformApplyRatio = exports.SpecTransformApplyRatio = function () {
	    function SpecTransformApplyRatio(spec) {
	        _classCallCheck(this, SpecTransformApplyRatio);

	        this.spec = spec;
	        this.isApplicable = spec.settings.autoRatio && _utils.utils.isSpecRectCoordsOnly(spec.unit);
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

	            traverse(spec.unit, enterIterator, function () {
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
	                            scalesRef[0].ratio = _utils.utils.generateRatioFunction(axis, scalesRef.map(exDim), chartInstance);
	                        }
	                    };

	                    tryApplyRatioToScales('x', realXs);
	                    tryApplyRatioToScales('y', realYs);
	                })();
	            }
	        }
	    }]);

	    return SpecTransformApplyRatio;
	}();

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformExtractAxes = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(4);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SpecTransformExtractAxes = exports.SpecTransformExtractAxes = function () {
	    function SpecTransformExtractAxes(spec) {
	        _classCallCheck(this, SpecTransformExtractAxes);

	        this.spec = spec;
	        this.isApplicable = spec.settings.layoutEngine === 'EXTRACT' && _utils.utils.isSpecRectCoordsOnly(spec.unit);
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
	                    console.log('[TauCharts]: can\'t extract axes for the given chart specification'); // eslint-disable-line
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

	            var pad = function pad(x) {
	                return x ? 10 : 0;
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

	            _utils.utils.traverseSpec(spec.unit, enterIterator, exitIterator);

	            spec.unit.guide.padding = ttl;
	        }
	    }]);

	    return SpecTransformExtractAxes;
	}();

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Chart = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _tau = __webpack_require__(26);

	var _chartAliasRegistry = __webpack_require__(42);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Chart = function (_Plot) {
	    _inherits(Chart, _Plot);

	    function Chart(config) {
	        _classCallCheck(this, Chart);

	        var errors = _chartAliasRegistry.chartTypesRegistry.validate(config.type, config);

	        if (errors.length > 0) {
	            throw new Error(errors[0]);
	        }

	        var chartFactory = _chartAliasRegistry.chartTypesRegistry.get(config.type);

	        config = _underscore2.default.defaults(config, { autoResize: true });
	        config.settings = _tau.Plot.setupSettings(config.settings);
	        config.dimensions = _tau.Plot.setupMetaInfo(config.dimensions, config.data);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Chart).call(this, chartFactory(config)));

	        if (config.autoResize) {
	            Chart.winAware.push(_this);
	        }
	        return _this;
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
	}(_tau.Plot);

	Chart.resizeOnWindowEvent = function () {

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
	}();
	Chart.winAware = [];
	window.addEventListener('resize', Chart.resizeOnWindowEvent);
	exports.Chart = Chart;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.chartTypesRegistry = undefined;

	var _error = __webpack_require__(10);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var chartTypes = {};
	var chartRules = {};

	var throwNotSupported = function throwNotSupported(alias) {
	    var msg = 'Chart type ' + alias + ' is not supported.';
	    console.log(msg); // eslint-disable-line
	    console.log('Use one of ' + _underscore2.default.keys(chartTypes).join(', ') + '.'); // eslint-disable-line
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

	        if (!_underscore2.default.isFunction(chartFactory)) {
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

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Cartesian = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _element = __webpack_require__(7);

	var _cartesian = __webpack_require__(44);

	var _utilsDraw = __webpack_require__(45);

	var _const = __webpack_require__(6);

	var _formatterRegistry = __webpack_require__(15);

	var _d3Decorators = __webpack_require__(46);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Cartesian = exports.Cartesian = function (_Element) {
	    _inherits(Cartesian, _Element);

	    function Cartesian(config) {
	        _classCallCheck(this, Cartesian);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Cartesian).call(this, config));

	        _this.config = config;

	        _this.config.guide = _underscore2.default.defaults(_this.config.guide || {}, {
	            showGridLines: 'xy',
	            padding: { l: 50, r: 0, t: 0, b: 50 }
	        });

	        _this.config.guide.x = _this.config.guide.x || {};
	        _this.config.guide.x = _underscore2.default.defaults(_this.config.guide.x, {
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

	        if (_underscore2.default.isString(_this.config.guide.x.label)) {
	            _this.config.guide.x.label = {
	                text: _this.config.guide.x.label
	            };
	        }

	        _this.config.guide.x.label = _underscore2.default.defaults(_this.config.guide.x.label, {
	            text: 'X',
	            rotate: 0,
	            padding: 40,
	            textAnchor: 'middle'
	        });

	        _this.config.guide.y = _this.config.guide.y || {};
	        _this.config.guide.y = _underscore2.default.defaults(_this.config.guide.y, {
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

	        if (_underscore2.default.isString(_this.config.guide.y.label)) {
	            _this.config.guide.y.label = {
	                text: _this.config.guide.y.label
	            };
	        }

	        _this.config.guide.y.label = _underscore2.default.defaults(_this.config.guide.y.label, {
	            text: 'Y',
	            rotate: -90,
	            padding: 20,
	            textAnchor: 'middle'
	        });

	        var unit = _this.config;
	        var guide = unit.guide;
	        if (guide.autoLayout === 'extract-axes') {
	            var containerHeight = unit.options.containerHeight;
	            var diff = containerHeight - (unit.options.top + unit.options.height);
	            guide.x.hide = Math.floor(diff) > 0;
	            guide.y.hide = Math.floor(unit.options.left) > 0;
	        }
	        return _this;
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
	        key: 'buildModel',
	        value: function buildModel(args) {

	            return [_cartesian.CartesianModel.decorator_size, _cartesian.CartesianModel.decorator_color].filter(function (x) {
	                return x;
	            }).reduce(function (model, transform) {
	                return transform(model, args);
	            }, new _cartesian.CartesianModel({
	                scaleX: args.scaleX,
	                scaleY: args.scaleY,
	                xi: function xi() {
	                    return args.w / 2;
	                },
	                yi: function yi() {
	                    return args.h / 2;
	                },
	                sizeX: function sizeX() {
	                    return args.w;
	                },
	                sizeY: function sizeY() {
	                    return args.h;
	                }
	            }));
	        }
	    }, {
	        key: 'walkFrames',
	        value: function walkFrames(frames, continuation) {

	            var model = this.buildModel({
	                scaleX: this.xScale,
	                scaleY: this.yScale,
	                w: this.W,
	                h: this.H
	            });

	            frames.forEach(function (frame) {

	                var k = frame.key;
	                var options = {
	                    left: model.xi(k) - model.sizeX(k) / 2,
	                    top: model.yi(k) - model.sizeY(k) / 2,
	                    width: model.sizeX(k),
	                    height: model.sizeY(k)
	                };

	                frame.units.forEach(function (unit) {
	                    unit.options = options;
	                    continuation(unit, frame);
	                });
	            });
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames(frames, continuation) {

	            var model = this.buildModel({
	                scaleX: this.xScale,
	                scaleY: this.yScale,
	                w: this.W,
	                h: this.H
	            });

	            var node = _underscore2.default.extend({}, this.config);

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

	            options.container.attr('transform', _utilsDraw.utilsDraw.translate(innerLeft, innerTop));

	            // take into account reposition during resize by orthogonal axis
	            var hashX = node.x.getHash() + innerHeight;
	            var hashY = node.y.getHash() + innerWidth;

	            if (!node.x.guide.hide) {
	                var orientX = node.x.guide.scaleOrient;
	                var positionX = orientX === 'top' ? [0, 0 - node.guide.x.padding] : [0, innerHeight + node.guide.x.padding];

	                this._fnDrawDimAxis(options.container, node.x, positionX, innerWidth, options.frameId + 'x', hashX);
	            }

	            if (!node.y.guide.hide) {
	                var orientY = node.y.guide.scaleOrient;
	                var positionY = orientY === 'right' ? [innerWidth + node.guide.y.padding, 0] : [0 - node.guide.y.padding, 0];

	                this._fnDrawDimAxis(options.container, node.y, positionY, innerHeight, options.frameId + 'y', hashY);
	            }

	            var updateCellLayers = function updateCellLayers(cellId, cell, frame) {

	                var mapper = function (basicOptions, unit, i) {
	                    unit.options = _underscore2.default.extend({ uid: basicOptions.frameId + i }, basicOptions);
	                    return unit;
	                }.bind(null, {
	                    frameId: frame.hash(),
	                    container: cell,
	                    containerWidth: innerWidth,
	                    containerHeight: innerHeight,
	                    left: model.xi(frame.key) - model.sizeX(frame.key) / 2,
	                    top: model.yi(frame.key) - model.sizeY(frame.key) / 2,
	                    width: model.sizeX(frame.key),
	                    height: model.sizeY(frame.key)
	                });

	                var continueDrawUnit = function continueDrawUnit(unit) {
	                    unit.options.container = _d2.default.select(this);
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
	                updateCellLayers(options.frameId, _d2.default.select(this), cellFrame);
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

	            var axisScale = _d2.default.svg.axis().scale(scale.scaleObj).orient(scale.guide.scaleOrient);

	            var formatter = _formatterRegistry.FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
	            if (formatter !== null) {
	                axisScale.ticks(Math.round(size / scale.guide.density));
	                axisScale.tickFormat(formatter);
	            }

	            var axis = container.selectAll('.axis_' + frameId).data([uniqueHash], function (x) {
	                return x;
	            });
	            axis.exit().remove();
	            axis.enter().append('g').attr('class', scale.guide.cssClass + ' axis_' + frameId).attr('transform', _utilsDraw.utilsDraw.translate.apply(_utilsDraw.utilsDraw, _toConsumableArray(position))).call(function (refAxisNode) {
	                if (!refAxisNode.empty()) {

	                    axisScale.call(this, refAxisNode);

	                    var isHorizontal = _utilsDraw.utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h';
	                    var prettifyTick = scale.scaleType === 'ordinal' || scale.scaleType === 'period';
	                    if (prettifyTick) {
	                        (0, _d3Decorators.d3_decorator_prettify_categorical_axis_ticks)(refAxisNode, scale, isHorizontal);
	                    }

	                    (0, _d3Decorators.d3_decorator_wrap_tick_label)(refAxisNode, scale.guide, isHorizontal);

	                    if (prettifyTick && scale.guide.avoidCollisions) {
	                        (0, _d3Decorators.d3_decorator_avoid_labels_collisions)(refAxisNode, isHorizontal);
	                    }

	                    if (!scale.guide.label.hide) {
	                        (0, _d3Decorators.d3_decorator_prettify_axis_label)(refAxisNode, scale.guide.label, isHorizontal);
	                    }

	                    if (isHorizontal && scale.scaleType === 'time') {
	                        (0, _d3Decorators.d3_decorator_fix_horizontal_axis_ticks_overflow)(refAxisNode);
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
	            grid.enter().append('g').attr('class', 'grid grid_' + frameId).attr('transform', _utilsDraw.utilsDraw.translate(0, 0)).call(function (selection) {

	                if (selection.empty()) {
	                    return;
	                }

	                var grid = selection;

	                var linesOptions = (node.guide.showGridLines || '').toLowerCase();
	                if (linesOptions.length > 0) {

	                    var gridLines = grid.append('g').attr('class', 'grid-lines');

	                    if (linesOptions.indexOf('x') > -1) {
	                        var xScale = node.x;
	                        var xOrientKoeff = xScale.guide.scaleOrient === 'top' ? -1 : 1;
	                        var xGridAxis = _d2.default.svg.axis().scale(xScale.scaleObj).orient(xScale.guide.scaleOrient).tickSize(xOrientKoeff * height);

	                        var formatter = _formatterRegistry.FormatterRegistry.get(xScale.guide.tickFormat);
	                        if (formatter !== null) {
	                            xGridAxis.ticks(Math.round(width / xScale.guide.density));
	                            xGridAxis.tickFormat(formatter);
	                        }

	                        var xGridLines = gridLines.append('g').attr('class', 'grid-lines-x').call(xGridAxis);

	                        var isHorizontal = _utilsDraw.utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h';
	                        var prettifyTick = xScale.scaleType === 'ordinal' || xScale.scaleType === 'period';
	                        if (prettifyTick) {
	                            (0, _d3Decorators.d3_decorator_prettify_categorical_axis_ticks)(xGridLines, xScale, isHorizontal);
	                        }

	                        var firstXGridLine = xGridLines.select('g.tick');
	                        if (firstXGridLine.node() && firstXGridLine.attr('transform') !== 'translate(0,0)') {
	                            var zeroNode = firstXGridLine.node().cloneNode(true);
	                            gridLines.node().appendChild(zeroNode);
	                            _d2.default.select(zeroNode).attr('class', 'border').attr('transform', _utilsDraw.utilsDraw.translate(0, 0)).select('line').attr('x1', 0).attr('x2', 0);
	                        }
	                    }

	                    if (linesOptions.indexOf('y') > -1) {
	                        var yScale = node.y;
	                        var yOrientKoeff = yScale.guide.scaleOrient === 'right' ? 1 : -1;
	                        var yGridAxis = _d2.default.svg.axis().scale(yScale.scaleObj).orient(yScale.guide.scaleOrient).tickSize(yOrientKoeff * width);

	                        var _formatter = _formatterRegistry.FormatterRegistry.get(yScale.guide.tickFormat);
	                        if (_formatter !== null) {
	                            yGridAxis.ticks(Math.round(height / yScale.guide.density));
	                            yGridAxis.tickFormat(_formatter);
	                        }

	                        var yGridLines = gridLines.append('g').attr('class', 'grid-lines-y').call(yGridAxis);

	                        var _isHorizontal = _utilsDraw.utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h';
	                        var _prettifyTick = yScale.scaleType === 'ordinal' || yScale.scaleType === 'period';
	                        if (_prettifyTick) {
	                            (0, _d3Decorators.d3_decorator_prettify_categorical_axis_ticks)(yGridLines, yScale, _isHorizontal);
	                        }

	                        var fixLineScales = ['time', 'ordinal', 'period'];
	                        var fixBottomLine = _underscore2.default.contains(fixLineScales, yScale.scaleType);
	                        if (fixBottomLine) {
	                            (0, _d3Decorators.d3_decorator_fix_axis_bottom_line)(yGridLines, height, yScale.scaleType === 'time');
	                        }
	                    }

	                    gridLines.selectAll('text').remove();
	                }
	            });

	            return grid;
	        }
	    }]);

	    return Cartesian;
	}(_element.Element);

/***/ },
/* 44 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var CartesianModel = exports.CartesianModel = function () {
	    function CartesianModel(model) {
	        _classCallCheck(this, CartesianModel);

	        var createFunc = function createFunc(x) {
	            return function () {
	                return x;
	            };
	        };
	        this.scaleX = model.scaleX;
	        this.scaleY = model.scaleY;
	        this.yi = model.yi || createFunc(0);
	        this.xi = model.xi || createFunc(0);
	        this.sizeX = model.sizeX || createFunc(0);
	        this.sizeY = model.sizeY || createFunc(0);
	    }

	    _createClass(CartesianModel, null, [{
	        key: "compose",
	        value: function compose(prev) {
	            var updates = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	            return Object.keys(updates).reduce(function (memo, propName) {
	                memo[propName] = updates[propName];
	                return memo;
	            }, new CartesianModel(prev));
	        }
	    }, {
	        key: "decorator_size",
	        value: function decorator_size(model, _ref) {
	            _objectDestructuringEmpty(_ref);

	            var sx = model.scaleX;
	            var sy = model.scaleY;
	            return CartesianModel.compose(model, {
	                xi: function xi(d) {
	                    return !d ? model.xi(d) : sx(d[sx.dim]);
	                },
	                yi: function yi(d) {
	                    return !d ? model.yi(d) : sy(d[sy.dim]);
	                },
	                sizeX: function sizeX(d) {
	                    return !d ? model.sizeX(d) : sx.stepSize(d[sx.dim]);
	                },
	                sizeY: function sizeY(d) {
	                    return !d ? model.sizeY(d) : sy.stepSize(d[sy.dim]);
	                }
	            });
	        }
	    }]);

	    return CartesianModel;
	}();

/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/* jshint ignore:start */
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

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.cutText = exports.wrapText = exports.d3_decorator_avoid_labels_collisions = exports.d3_decorator_prettify_categorical_axis_ticks = exports.d3_decorator_fix_horizontal_axis_ticks_overflow = exports.d3_decorator_fix_axis_bottom_line = exports.d3_decorator_prettify_axis_label = exports.d3_decorator_wrap_tick_label = undefined;

	var _utilsDraw = __webpack_require__(45);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var d3getComputedTextLength = _underscore2.default.memoize(function (d3Text) {
	    return d3Text.node().getComputedTextLength();
	}, function (d3Text) {
	    return d3Text.node().textContent.length;
	});

	var cutText = function cutText(textString, widthLimit, getComputedTextLength) {

	    getComputedTextLength = getComputedTextLength || d3getComputedTextLength;

	    textString.each(function () {
	        var textD3 = _d2.default.select(this);
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
	        var textD3 = _d2.default.select(this),
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

	        var tickNode = _d2.default.select(node);
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
	    }).attr('transform', _utilsDraw.utilsDraw.translate(0, size - tickOffset));
	};

	var d3_decorator_prettify_axis_label = function d3_decorator_prettify_axis_label(axisNode, guide, isHorizontal) {

	    var koeff = isHorizontal ? 1 : -1;
	    var labelTextNode = axisNode.append('text').attr('transform', _utilsDraw.utilsDraw.rotate(guide.rotate)).attr('class', guide.cssClass).attr('x', koeff * guide.size * 0.5).attr('y', koeff * guide.padding).style('text-anchor', guide.textAnchor);

	    var delimiter = ' → ';
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
	        var _box = axisNode.selectAll('path.domain').node().getBBox();
	        labelTextNode.attr('x', isHorizontal ? 0 : -_box.height);
	    }
	};

	var d3_decorator_wrap_tick_label = function d3_decorator_wrap_tick_label(nodeScale, guide, isHorizontal) {

	    var angle = guide.rotate;

	    var tick = nodeScale.selectAll('.tick text');
	    tick.attr({ transform: _utilsDraw.utilsDraw.rotate(angle) }).style('text-anchor', guide.textAnchor);

	    if (Math.abs(angle / 90) % 2 > 0) {
	        var k = isHorizontal ? 0.5 : -2;
	        var dy = k * parseFloat(tick.attr('dy'));
	        var attr = {
	            x: 9,
	            y: 0,
	            dx: isHorizontal ? null : dy + 'em',
	            dy: dy + 'em'
	        };

	        tick.attr(attr);
	    }

	    if (guide.tickFormatWordWrap) {
	        tick.call(wrapText, guide.tickFormatWordWrapLimit, guide.tickFormatWordWrapLines, guide.tickFontHeight, !isHorizontal);
	    } else {
	        tick.call(cutText, guide.tickFormatWordWrapLimit);
	    }
	};

	var d3_decorator_avoid_labels_collisions = function d3_decorator_avoid_labels_collisions(nodeScale, isHorizontal) {
	    var textOffsetStep = 11;
	    var refOffsetStart = isHorizontal ? -10 : 20;
	    var translateParam = isHorizontal ? 0 : 1;
	    var directionKoeff = isHorizontal ? 1 : -1;
	    var layoutModel = [];
	    nodeScale.selectAll('.tick').each(function () {
	        var tick = _d2.default.select(this);

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

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Parallel = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _element = __webpack_require__(7);

	var _utilsDraw = __webpack_require__(45);

	var _utils = __webpack_require__(4);

	var _const = __webpack_require__(6);

	var _formatterRegistry = __webpack_require__(15);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Parallel = exports.Parallel = function (_Element) {
	    _inherits(Parallel, _Element);

	    function Parallel(config) {
	        _classCallCheck(this, Parallel);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Parallel).call(this, config));

	        _this.config = config;

	        _this.config.guide = _underscore2.default.defaults(_this.config.guide || {}, {
	            padding: { l: 50, r: 50, t: 50, b: 50 },
	            enableBrushing: false
	        });

	        _this.columnsBrushes = {};

	        _this.on('force-brush', function (sender, e) {
	            return _this._forceBrushing(e);
	        });
	        return _this;
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

	            var cfg = _underscore2.default.extend({}, this.config);
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
	                    unit.options.container = _d2.default.select(this);
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
	                updateCellLayers(options.frameId, _d2.default.select(this), cellFrame);
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

	            var grid = container.selectAll('.grid_' + frameId).data([uniqueHash], _underscore2.default.identity);
	            grid.exit().remove();
	            grid.enter().append('g').attr('class', 'grid grid_' + frameId).attr('transform', _utilsDraw.utilsDraw.translate(l, t));

	            return grid;
	        }
	    }, {
	        key: '_fnDrawColumns',
	        value: function _fnDrawColumns(grid, config) {
	            var colsGuide = config.guide.columns || {};
	            var xBase = this.xBase;
	            var columnsScalesMap = this.columnsScalesMap;
	            var d3Axis = _d2.default.svg.axis().orient('left');

	            var cols = grid.selectAll('.column').data(config.columns, _underscore2.default.identity);
	            cols.exit().remove();
	            cols.enter().append('g').attr('class', 'column').attr('transform', function (d) {
	                return _utilsDraw.utilsDraw.translate(xBase(d), 0);
	            }).call(function () {
	                this.append('g').attr('class', 'y axis').each(function (d) {
	                    var propName = columnsScalesMap[d].dim;
	                    var axisScale = d3Axis.scale(columnsScalesMap[d]);
	                    var columnGuide = colsGuide[propName] || {};
	                    var formatter = _formatterRegistry.FormatterRegistry.get(columnGuide.tickFormat, columnGuide.tickFormatNullAlias);
	                    if (formatter !== null) {
	                        axisScale.tickFormat(formatter);
	                    }

	                    _d2.default.select(this).call(axisScale);
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
	            var onBrushEventHandler = function onBrushEventHandler() {
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
	                columnsBrushes[d] = _d2.default.svg.brush().y(columnsScalesMap[d]).on('brushstart', onBrushStartEventHandler).on('brush', onBrushEventHandler).on('brushend', onBrushEndEventHandler);

	                _d2.default.select(this).classed('brush-' + _utils.utils.generateHash(d), true).call(columnsBrushes[d]);
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
	                var hashK = _utils.utils.generateHash(k);
	                columnsBrushes[k].extent(ext);
	                columnsBrushes[k](_d2.default.select('.brush-' + hashK));
	                columnsBrushes[k].event(_d2.default.select('.brush-' + hashK));
	            });
	        }
	    }]);

	    return Parallel;
	}(_element.Element);

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GeoMap = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _topojson = __webpack_require__(49);

	var _topojson2 = _interopRequireDefault(_topojson);

	var _d3Labeler = __webpack_require__(50);

	var _element = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	_d2.default.labeler = _d3Labeler.d3Labeler;

	var avgCharSize = 5.5;
	var iterationsCount = 10;
	var pointOpacity = 0.5;

	var hierarchy = ['land', 'continents', 'georegions', 'countries', 'regions', 'subunits', 'states', 'counties'];

	var GeoMap = exports.GeoMap = function (_Element) {
	    _inherits(GeoMap, _Element);

	    function GeoMap(config) {
	        _classCallCheck(this, GeoMap);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GeoMap).call(this, config));

	        _this.config = config;
	        _this.config.guide = _underscore2.default.defaults(_this.config.guide || {}, {
	            defaultFill: 'rgba(128,128,128,0.25)',
	            padding: { l: 0, r: 0, t: 0, b: 0 },
	            showNames: true
	        });
	        _this.contourToFill = null;

	        _this.on('highlight-area', function (sender, e) {
	            return _this._highlightArea(e);
	        });
	        _this.on('highlight-point', function (sender, e) {
	            return _this._highlightPoint(e);
	        });
	        _this.on('highlight', function (sender, e) {
	            return _this._highlightPoint(e);
	        });
	        return _this;
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

	                _d2.default.json(guide.sourcemap, function (e, topoJSONData) {

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

	                var contourFeatures = _topojson2.default.feature(topoJSONData, topoJSONData.objects[c]).features || [];

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

	                _d2.default.labeler().label(labels).anchor(anchors).width(innerW).height(innerH).start(iterationsCount);

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
	                    console.log('There is no contour for georole "' + codeScale.georole + '"'); // eslint-disable-line
	                    console.log('Available contours are: ' + contours.join(' | ')); // eslint-disable-line

	                    throw new Error('Invalid [georole]');
	                }

	                contourToFill = codeScale.georole;
	            } else {
	                console.log('Specify [georole] for code scale'); // eslint-disable-line
	                throw new Error('[georole] is missing');
	            }

	            this.contourToFill = contourToFill;

	            var center;

	            if (latScale.dim && lonScale.dim) {
	                var lats = _d2.default.extent(latScale.domain());
	                var lons = _d2.default.extent(lonScale.domain());
	                center = [(lons[1] + lons[0]) / 2, (lats[1] + lats[0]) / 2];
	            }

	            var d3Projection = this._createProjection(topoJSONData, contours[0], center);

	            var path = _d2.default.geo.path().projection(d3Projection);

	            var xmap = node.selectAll('.map-container').data(['' + innerW + innerH + center + contours.join('-')], _underscore2.default.identity);
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

	                    node.selectAll('.map-contour-' + c).data(_topojson2.default.feature(topoJSONData, topoJSONData.objects[c]).features || []).enter().append('g').call(function () {

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

	                    var placesFeature = _topojson2.default.feature(topoJSONData, topoJSONData.objects.places);

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

	                    _d2.default.labeler().label(labels).anchor(anchors).width(innerW).height(innerH).start(100);

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

	            xmap.selectAll('.map-contour-' + contourToFill).data(_topojson2.default.feature(topoJSONData, topoJSONData.objects[contourToFill]).features).call(function () {
	                this.classed('map-contour', true).attr('fill', function (d) {
	                    var row = toData(d);
	                    return row === null ? guide.defaultFill : fillScale(row[fillScale.dim]);
	                });
	            }).on('mouseover', function (d) {
	                return _this3.fire('area-mouseover', { data: toData(d), event: _d2.default.event });
	            }).on('mouseout', function (d) {
	                return _this3.fire('area-mouseout', { data: toData(d), event: _d2.default.event });
	            }).on('click', function (d) {
	                return _this3.fire('area-click', { data: toData(d), event: _d2.default.event });
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
	                    class: function _class(_ref3) {
	                        var d = _ref3.data;
	                        return colorScale(d[colorScale.dim]);
	                    },
	                    opacity: pointOpacity
	                }).on('mouseover', function (_ref4) {
	                    var d = _ref4.data;
	                    return self.fire('point-mouseover', { data: d, event: _d2.default.event });
	                }).on('mouseout', function (_ref5) {
	                    var d = _ref5.data;
	                    return self.fire('point-mouseout', { data: d, event: _d2.default.event });
	                }).on('click', function (_ref6) {
	                    var d = _ref6.data;
	                    return self.fire('point-click', { data: d, event: _d2.default.event });
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

	            var path = _d2.default.geo.path().projection(d3Projection);

	            // using the path determine the bounds of the current map and use
	            // these to determine better values for the scale and translation
	            var bounds = path.bounds(_topojson2.default.feature(topoJSONData, topoJSONData.objects[topContour]));

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

	            var d3ProjectionMethod = _d2.default.geo[projection];

	            if (!d3ProjectionMethod) {
	                /*eslint-disable */
	                console.log('Unknown projection "' + projection + '"');
	                console.log('See available projection types here: https://github.com/mbostock/d3/wiki/Geo-Projections');
	                /*eslint-enable */
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
	}(_element.Element);

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.topojson = {})));
	}(this, function (exports) { 'use strict';

	  function noop() {}

	  function absolute(transform) {
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

	  function relative(transform) {
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

	  function reverse(array, n) {
	    var t, j = array.length, i = j - n;
	    while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
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

	  function feature(topology, o) {
	    return o.type === "GeometryCollection" ? {
	      type: "FeatureCollection",
	      features: o.geometries.map(function(o) { return feature$1(topology, o); })
	    } : feature$1(topology, o);
	  }

	  function feature$1(topology, o) {
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
	    var absolute$$ = absolute(topology.transform),
	        arcs = topology.arcs;

	    function arc(i, points) {
	      if (points.length) points.pop();
	      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
	        points.push(p = a[k].slice());
	        absolute$$(p, k);
	      }
	      if (i < 0) reverse(points, n);
	    }

	    function point(p) {
	      p = p.slice();
	      absolute$$(p, 0);
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

	  function mesh(topology) {
	    return object(topology, meshArcs.apply(this, arguments));
	  }

	  function meshArcs(topology, o, filter) {
	    var arcs = [];

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

	    if (arguments.length > 1) {
	      var geomsByArc = [],
	          geom;

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

	  function triangle(triangle) {
	    var a = triangle[0], b = triangle[1], c = triangle[2];
	    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
	  }

	  function ring(ring) {
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

	    return area / 2;
	  }

	  function merge(topology) {
	    return object(topology, mergeArcs.apply(this, arguments));
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
	      polygon.forEach(function(ring$$) {
	        ring$$.forEach(function(arc) {
	          (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
	        });
	      });
	      polygons.push(polygon);
	    }

	    function exterior(ring$$) {
	      return ring(object(topology, {type: "Polygon", arcs: [ring$$]}).coordinates[0]) > 0; // TODO allow spherical?
	    }

	    polygons.forEach(function(polygon) {
	      if (!polygon._) {
	        var component = [],
	            neighbors = [polygon];
	        polygon._ = 1;
	        components.push(component);
	        while (polygon = neighbors.pop()) {
	          component.push(polygon);
	          polygon.forEach(function(ring$$) {
	            ring$$.forEach(function(arc) {
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
	        var arcs = [], n;

	        // Extract the exterior (unique) arcs.
	        polygons.forEach(function(polygon) {
	          polygon.forEach(function(ring$$) {
	            ring$$.forEach(function(arc) {
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

	  function presimplify(topology, triangleArea) {
	    var absolute$$ = absolute(topology.transform),
	        relative$$ = relative(topology.transform),
	        heap = minAreaHeap();

	    if (!triangleArea) triangleArea = triangle;

	    topology.arcs.forEach(function(arc) {
	      var triangles = [],
	          maxArea = 0,
	          triangle,
	          i,
	          n,
	          p;

	      // To store each point’s effective area, we create a new array rather than
	      // extending the passed-in point to workaround a Chrome/V8 bug (getting
	      // stuck in smi mode). For midpoints, the initial effective area of
	      // Infinity will be computed in the next step.
	      for (i = 0, n = arc.length; i < n; ++i) {
	        p = arc[i];
	        absolute$$(arc[i] = [p[0], p[1], Infinity], i);
	      }

	      for (i = 1, n = arc.length - 1; i < n; ++i) {
	        triangle = arc.slice(i - 1, i + 2);
	        triangle[1][2] = triangleArea(triangle);
	        triangles.push(triangle);
	        heap.push(triangle);
	      }

	      for (i = 0, n = triangles.length; i < n; ++i) {
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

	      arc.forEach(relative$$);
	    });

	    function update(triangle) {
	      heap.remove(triangle);
	      triangle[1][2] = triangleArea(triangle);
	      heap.push(triangle);
	    }

	    return topology;
	  }

	  var version = "1.6.24";

	  exports.version = version;
	  exports.mesh = mesh;
	  exports.meshArcs = meshArcs;
	  exports.merge = merge;
	  exports.mergeArcs = mergeArcs;
	  exports.feature = feature;
	  exports.neighbors = neighbors;
	  exports.presimplify = presimplify;

	}));

/***/ },
/* 50 */
/***/ function(module, exports) {

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
	    var user_energy = false;

	    var user_defined_energy;

	    var energy = function energy(index) {
	        // energy function, tailored for label placement

	        var m = lab.length,
	            ener = 0,
	            dx = lab[index].x - anc[index].x,
	            dy = anc[index].y - lab[index].y,
	            dist = Math.sqrt(dx * dx + dy * dy),
	            overlap = true;

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

	    labeler.alt_schedule = function () {
	        // user defined cooling_schedule
	        if (!arguments.length) {
	            return cooling_schedule;
	        }
	        return labeler;
	    };

	    return labeler;
	};

	exports.d3Labeler = d3Labeler;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Path = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _const = __webpack_require__(6);

	var _cartesianGrammar = __webpack_require__(9);

	var _elementPath = __webpack_require__(17);

	var _cssClassMap = __webpack_require__(18);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Path = exports.Path = function (_BasePath) {
	    _inherits(Path, _BasePath);

	    function Path(config) {
	        _classCallCheck(this, Path);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Path).call(this, config));

	        _this.decorators = [_cartesianGrammar.CartesianGrammar.decorator_orientation, _cartesianGrammar.CartesianGrammar.decorator_group, _cartesianGrammar.CartesianGrammar.decorator_dynamic_size, _cartesianGrammar.CartesianGrammar.decorator_color, _cartesianGrammar.CartesianGrammar.decorator_label, config.adjustPhase && _cartesianGrammar.CartesianGrammar.adjustStaticSizeScale];
	        return _this;
	    }

	    _createClass(Path, [{
	        key: 'buildModel',
	        value: function buildModel(pathModel, params) {

	            var self = this;
	            var baseModel = _get(Object.getPrototypeOf(Path.prototype), 'buildModel', this).call(this, pathModel, params);

	            baseModel.matchRowInCoordinates = function (rows, _ref) {
	                var x = _ref.x;
	                var y = _ref.y;


	                // d3.invert doesn't work for ordinal axes
	                var nearest = rows.map(function (row) {
	                    var rx = baseModel.x(row);
	                    var ry = baseModel.y(row);
	                    return {
	                        x: rx,
	                        y: ry,
	                        dist: self.getDistance(x, y, rx, ry),
	                        data: row
	                    };
	                }).sort(function (a, b) {
	                    return a.dist - b.dist;
	                }) // asc
	                [0];

	                return nearest.data;
	            };

	            var guide = this.config.guide;
	            var options = this.config.options;
	            var countCss = (0, _cssClassMap.getLineClassesByCount)(params.colorScale.domain().length);

	            var groupPref = _const.CSS_PREFIX + 'area area i-role-path ' + countCss + ' ' + guide.cssClass + ' ';
	            baseModel.groupAttributes = {
	                class: function _class(fiber) {
	                    return groupPref + ' ' + baseModel.class(fiber[0]) + ' frame-' + options.uid;
	                }
	            };

	            baseModel.pathAttributes = {
	                fill: function fill(fiber) {
	                    return baseModel.color(fiber[0]);
	                },
	                stroke: function stroke(fiber) {
	                    return baseModel.color(fiber[0]);
	                },
	                points: function points(fiber) {
	                    return fiber.map(function (d) {
	                        return [baseModel.x(d), baseModel.y(d)].join(',');
	                    }).join(' ');
	                }
	            };

	            baseModel.pathElement = 'polygon';

	            return baseModel;
	        }
	    }]);

	    return Path;
	}(_elementPath.BasePath);

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ParallelLine = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _const = __webpack_require__(6);

	var _element = __webpack_require__(7);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ParallelLine = exports.ParallelLine = function (_Element) {
	    _inherits(ParallelLine, _Element);

	    function ParallelLine(config) {
	        _classCallCheck(this, ParallelLine);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParallelLine).call(this, config));

	        _this.config = config;
	        _this.config.guide = _underscore2.default.defaults(_this.config.guide || {}, {
	            // params here
	        });

	        _this.on('highlight', function (sender, e) {
	            return _this.highlight(e);
	        });
	        return _this;
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

	            var d3Line = _d2.default.svg.line();

	            var drawPath = function drawPath() {
	                this.attr({
	                    d: function d(row) {
	                        return d3Line(node.columns.map(function (p) {
	                            return [xBase(p), scalesMap[p](row[scalesMap[p].dim])];
	                        }));
	                    }
	                });
	            };

	            var markPath = function markPath() {
	                this.attr({
	                    stroke: function stroke(row) {
	                        return color.toColor(color(row[color.dim]));
	                    },
	                    class: function _class(row) {
	                        return _const.CSS_PREFIX + '__line line ' + color.toClass(color(row[color.dim])) + ' foreground';
	                    }
	                });
	            };

	            var updateFrame = function updateFrame() {
	                var backgroundPath = this.selectAll('.background').data(function (f) {
	                    return f.part();
	                });
	                backgroundPath.exit().remove();
	                backgroundPath.call(drawPath);
	                backgroundPath.enter().append('path').attr('class', 'background line').call(drawPath);

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
	}(_element.Element);

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ColorScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _utils = __webpack_require__(4);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	/* jshint ignore:start */


	/* jshint ignore:end */

	var ColorScale = exports.ColorScale = function (_BaseScale) {
	    _inherits(ColorScale, _BaseScale);

	    function ColorScale(xSource, scaleConfig) {
	        _classCallCheck(this, ColorScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ColorScale).call(this, xSource, scaleConfig));

	        var discrete = scaleConfig.dimType !== 'measure';

	        var scaleBrewer = discrete ? _this.scaleConfig.brewer || _underscore2.default.times(20, function (i) {
	            return 'color20-' + (1 + i);
	        }) : _this.scaleConfig.brewer || ['#eee', '#000'];

	        var props = _this.scaleConfig;

	        if (!discrete) {
	            var vars = _d2.default.extent(_this.vars);

	            var isNum = function isNum(num) {
	                return !isNaN(num) && _underscore2.default.isNumber(num);
	            };
	            var min = isNum(props.min) ? props.min : vars[0];
	            var max = isNum(props.max) ? props.max : vars[1];

	            vars = [Math.min.apply(Math, _toConsumableArray([min, vars[0]].filter(isNum))), Math.max.apply(Math, _toConsumableArray([max, vars[1]].filter(isNum)))];

	            if (props.nice) {

	                if (vars[0] < 0 && vars[1] > 0) {
	                    // symmetry
	                    var maxPart = Math.max.apply(Math, _toConsumableArray(vars.map(Math.abs)));
	                    vars = [-maxPart, maxPart];
	                }
	            }

	            _this.vars = vars;
	        }

	        _this.addField('scaleType', 'color').addField('discrete', discrete).addField('brewer', scaleBrewer).addField('toColor', _utils.utils.extRGBColor).addField('toClass', _utils.utils.extCSSClass);
	        return _this;
	    }

	    _createClass(ColorScale, [{
	        key: 'create',
	        value: function create() {

	            var discrete = this.discrete;

	            var varSet = this.vars;
	            var brewer = this.getField('brewer');

	            var func = discrete ? this.createDiscreteScale(varSet, brewer) : this.createContinuesScale(varSet, brewer);

	            return this.toBaseScale(func);
	        }
	    }, {
	        key: 'createDiscreteScale',
	        value: function createDiscreteScale(varSet, brewer) {

	            var defaultColorClass = _underscore2.default.constant('color-default');

	            var buildArrayGetClass = function buildArrayGetClass(domain, brewer) {
	                if (domain.length === 0 || domain.length === 1 && domain[0] === null) {
	                    return defaultColorClass;
	                } else {
	                    var fullDomain = domain.map(function (x) {
	                        return String(x).toString();
	                    });
	                    return _d2.default.scale.ordinal().range(brewer).domain(fullDomain);
	                }
	            };

	            var buildObjectGetClass = function buildObjectGetClass(brewer, defaultGetClass) {
	                var domain = _underscore2.default.keys(brewer);
	                var range = _underscore2.default.values(brewer);
	                var calculateClass = _d2.default.scale.ordinal().range(range).domain(domain);
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

	            if (_underscore2.default.isArray(brewer)) {

	                func = wrapString(buildArrayGetClass(varSet, brewer));
	            } else if (_underscore2.default.isFunction(brewer)) {

	                func = function func(d) {
	                    return brewer(d, wrapString(buildArrayGetClass(varSet, _underscore2.default.times(20, function (i) {
	                        return 'color20-' + (1 + i);
	                    }))));
	                };
	            } else if (_underscore2.default.isObject(brewer)) {

	                func = buildObjectGetClass(brewer, defaultColorClass);
	            } else {

	                throw new Error('This brewer is not supported');
	            }

	            return func;
	        }
	    }, {
	        key: 'createContinuesScale',
	        value: function createContinuesScale(varSet, brewer) {

	            var func;

	            if (_underscore2.default.isArray(brewer)) {

	                func = _d2.default.scale.linear().domain(_utils.utils.splitEvenly(varSet, brewer.length)).range(brewer);
	            } else {

	                throw new Error('This brewer is not supported');
	            }

	            return func;
	        }
	    }]);

	    return ColorScale;
	}(_base.BaseScale);

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BaseScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	/* jshint ignore:start */


	var _utils = __webpack_require__(4);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/* jshint ignore:end */

	var map_value = function map_value(dimType) {
	    return dimType === 'date' ? function (v) {
	        return new Date(v).getTime();
	    } : function (v) {
	        return v;
	    };
	};

	var generateHashFunction = function generateHashFunction(varSet, interval) {
	    return _utils.utils.generateHash([varSet, interval].map(JSON.stringify).join(''));
	};

	var BaseScale = exports.BaseScale = function () {
	    function BaseScale(dataFrame, scaleConfig) {
	        var _this = this;

	        _classCallCheck(this, BaseScale);

	        this._fields = {};

	        var data;
	        if (_underscore2.default.isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {

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
	            vars = _underscore2.default.union(_underscore2.default.intersection(scaleConfig.order, vars), vars);
	        }

	        this.vars = vars;
	        this.scaleConfig = scaleConfig;

	        // keep for backward compatibility with "autoScale"
	        this.scaleConfig.nice = this.scaleConfig.hasOwnProperty('nice') ? this.scaleConfig.nice : this.scaleConfig.autoScale;

	        this.addField('dim', this.scaleConfig.dim).addField('scaleDim', this.scaleConfig.dim).addField('scaleType', this.scaleConfig.type).addField('source', this.scaleConfig.source).addField('domain', function () {
	            return _this.vars;
	        }).addField('isContains', function (x) {
	            return _this.isInDomain(x);
	        }).addField('fixup', function (fn) {
	            var cfg = _this.scaleConfig;
	            cfg.__fixup__ = cfg.__fixup__ || {};
	            cfg.__fixup__ = _underscore2.default.extend(cfg.__fixup__, fn(_underscore2.default.extend({}, cfg, cfg.__fixup__)));
	        }).addField('commit', function () {
	            _this.scaleConfig = _underscore2.default.extend(_this.scaleConfig, _this.scaleConfig.__fixup__);
	            delete _this.scaleConfig.__fixup__;
	        });
	    }

	    _createClass(BaseScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(val) {
	            return this.domain().indexOf(val) >= 0;
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
	            scaleFn.value = scaleFn;

	            return scaleFn;
	        }
	    }, {
	        key: 'getVarSet',
	        value: function getVarSet(arr, scale) {
	            return (0, _underscore2.default)(arr).chain().pluck(scale.dim).uniq(map_value(scale.dimType)).value();
	        }
	    }]);

	    return BaseScale;
	}();

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SizeScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var funcTypes = {
	    sqrt: function sqrt(x) {
	        return Math.sqrt(x);
	    },
	    linear: function linear(x) {
	        return x;
	    }
	};

	var SizeScale = exports.SizeScale = function (_BaseScale) {
	    _inherits(SizeScale, _BaseScale);

	    function SizeScale(xSource, scaleConfig) {
	        _classCallCheck(this, SizeScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SizeScale).call(this, xSource, scaleConfig));

	        var isNum = function isNum(num) {
	            return !isNaN(num) && _underscore2.default.isNumber(num);
	        };

	        var props = _this.scaleConfig;
	        var vars = _d2.default.extent(_this.vars);

	        var min = isNum(props.min) ? props.min : vars[0];
	        var max = isNum(props.max) ? props.max : vars[1];

	        _this.vars = [Math.min.apply(Math, _toConsumableArray([min, vars[0]].filter(isNum))), Math.max.apply(Math, _toConsumableArray([max, vars[1]].filter(isNum)))];

	        _this.addField('scaleType', 'size');
	        return _this;
	    }

	    _createClass(SizeScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(x) {
	            var domain = this.domain().sort();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !isNaN(min) && !isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create() {

	            var props = this.scaleConfig;
	            var varSet = this.vars;

	            var p = _underscore2.default.defaults({}, props, { func: 'sqrt', minSize: 0, maxSize: 1 });

	            var funType = p.func;
	            var minSize = p.minSize;
	            var maxSize = p.maxSize;

	            var f = funcTypes[funType];

	            var values = _underscore2.default.filter(varSet, _underscore2.default.isFinite);

	            var func;
	            if (values.length === 0) {
	                func = function func() {
	                    return maxSize;
	                };
	            } else {
	                var k = 1;
	                var xMin = 0;

	                var min = Math.min.apply(Math, _toConsumableArray(values));
	                var max = Math.max.apply(Math, _toConsumableArray(values));

	                var len = f(Math.max(Math.abs(min), Math.abs(max), max - min));

	                xMin = min < 0 ? min : 0;
	                k = len === 0 ? 1 : (maxSize - minSize) / len;

	                func = function func(x) {

	                    var numX = x !== null ? parseFloat(x) : 0;

	                    if (!_underscore2.default.isFinite(numX)) {
	                        return maxSize;
	                    }

	                    var posX = numX - xMin; // translate to positive x domain

	                    return minSize + f(posX) * k;
	                };
	            }

	            return this.toBaseScale(func);
	        }
	    }]);

	    return SizeScale;
	}(_base.BaseScale);

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.OrdinalScale = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var OrdinalScale = exports.OrdinalScale = function (_BaseScale) {
	    _inherits(OrdinalScale, _BaseScale);

	    function OrdinalScale(xSource, scaleConfig) {
	        _classCallCheck(this, OrdinalScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OrdinalScale).call(this, xSource, scaleConfig));

	        _this.addField('scaleType', 'ordinal').addField('discrete', true);
	        return _this;
	    }

	    _createClass(OrdinalScale, [{
	        key: 'create',
	        value: function create(interval) {

	            var props = this.scaleConfig;
	            var varSet = this.vars;

	            var d3Domain = _d2.default.scale.ordinal().domain(varSet);

	            var d3Scale = d3Domain.rangePoints(interval, 1);

	            var size = Math.max.apply(Math, _toConsumableArray(interval));

	            var fnRatio = function fnRatio(key) {
	                var ratioType = _typeof(props.ratio);
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
	}(_base.BaseScale);

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.PeriodScale = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _unitDomainPeriodGenerator = __webpack_require__(24);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	/* jshint ignore:start */


	/* jshint ignore:end */

	var PeriodScale = exports.PeriodScale = function (_BaseScale) {
	    _inherits(PeriodScale, _BaseScale);

	    function PeriodScale(xSource, scaleConfig) {
	        _classCallCheck(this, PeriodScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PeriodScale).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _this.vars;

	        var domain = _d2.default.extent(vars);
	        var min = _underscore2.default.isNull(props.min) || _underscore2.default.isUndefined(props.min) ? domain[0] : new Date(props.min).getTime();
	        var max = _underscore2.default.isNull(props.max) || _underscore2.default.isUndefined(props.max) ? domain[1] : new Date(props.max).getTime();

	        var range = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

	        var periodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.get(props.period);
	        if (props.fitToFrameByDims || periodGenerator === null) {
	            _this.vars = (0, _underscore2.default)(vars).chain().uniq(function (x) {
	                return new Date(x).getTime();
	            }).map(function (x) {
	                return new Date(x);
	            }).sortBy(function (x) {
	                return -x;
	            }).value();
	        } else {
	            _this.vars = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(range[0], range[1], props.period);
	        }

	        _this.addField('scaleType', 'period').addField('period', _this.scaleConfig.period).addField('discrete', true);
	        return _this;
	    }

	    _createClass(PeriodScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(aTime) {
	            var gen = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.get(this.scaleConfig.period);
	            var val = gen.cast(new Date(aTime)).getTime();
	            return this.domain().map(function (x) {
	                return x.getTime();
	            }).indexOf(val) >= 0;
	        }
	    }, {
	        key: 'create',
	        value: function create(interval) {

	            var varSet = this.vars;
	            var varSetTicks = this.vars.map(function (t) {
	                return t.getTime();
	            });
	            var props = this.scaleConfig;

	            var d3Domain = _d2.default.scale.ordinal().domain(varSet);
	            var d3Scale = d3Domain.rangePoints(interval, 1);

	            var d3DomainTicks = _d2.default.scale.ordinal().domain(varSetTicks.map(String));
	            var d3ScaleTicks = d3DomainTicks.rangePoints(interval, 1);

	            var size = Math.max.apply(Math, _toConsumableArray(interval));

	            var fnRatio = function fnRatio(key) {

	                var tick = new Date(key).getTime();

	                var ratioType = _typeof(props.ratio);
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
	                    r = d3ScaleTicks(String(tx));
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
	}(_base.BaseScale);

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.TimeScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	/* jshint ignore:start */


	/* jshint ignore:end */

	var TimeScale = exports.TimeScale = function (_BaseScale) {
	    _inherits(TimeScale, _BaseScale);

	    function TimeScale(xSource, scaleConfig) {
	        _classCallCheck(this, TimeScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TimeScale).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _this.vars;

	        var domain = _d2.default.extent(vars).map(function (v) {
	            return new Date(v);
	        });

	        var min = _underscore2.default.isNull(props.min) || _underscore2.default.isUndefined(props.min) ? domain[0] : new Date(props.min).getTime();
	        var max = _underscore2.default.isNull(props.max) || _underscore2.default.isUndefined(props.max) ? domain[1] : new Date(props.max).getTime();

	        vars = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

	        _this.niceIntervalFn = null;
	        if (props.nice) {
	            var niceInterval = props.niceInterval;
	            if (_d2.default.time[niceInterval]) {
	                _this.niceIntervalFn = _d2.default.time[niceInterval];
	            } else {
	                // TODO: show warning?
	                _this.niceIntervalFn = null;
	            }

	            if (vars[0] - vars[1] === 0) {
	                var oneDay = 24 * 60 * 60 * 1000;
	                vars = [new Date(vars[0].getTime() - oneDay), new Date(vars[1].getTime() + oneDay)];
	            }

	            _this.vars = _d2.default.time.scale().domain(vars).nice(_this.niceIntervalFn).domain();
	        } else {
	            _this.vars = vars;
	        }

	        _this.addField('scaleType', 'time');
	        return _this;
	    }

	    _createClass(TimeScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(aTime) {
	            var x = new Date(aTime);
	            var domain = this.domain();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !isNaN(min) && !isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create(interval) {

	            var varSet = this.vars;

	            var d3Domain = _d2.default.time.scale().domain(varSet);
	            if (this.scaleConfig.nice) {
	                d3Domain = d3Domain.nice(this.niceIntervalFn);
	            }

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
	}(_base.BaseScale);

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LinearScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _utils = __webpack_require__(4);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	/* jshint ignore:start */


	/* jshint ignore:end */

	var LinearScale = exports.LinearScale = function (_BaseScale) {
	    _inherits(LinearScale, _BaseScale);

	    function LinearScale(xSource, scaleConfig) {
	        _classCallCheck(this, LinearScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LinearScale).call(this, xSource, scaleConfig));

	        var isNum = function isNum(num) {
	            return !isNaN(num) && _underscore2.default.isNumber(num);
	        };

	        var props = _this.scaleConfig;
	        var vars = _d2.default.extent(_this.vars);

	        var min = isNum(props.min) ? props.min : vars[0];
	        var max = isNum(props.max) ? props.max : vars[1];

	        vars = [Math.min.apply(Math, _toConsumableArray([min, vars[0]].filter(isNum))), Math.max.apply(Math, _toConsumableArray([max, vars[1]].filter(isNum)))];

	        _this.vars = props.nice ? _utils.utils.niceZeroBased(vars) : _d2.default.extent(vars);

	        _this.addField('scaleType', 'linear').addField('discrete', false);
	        return _this;
	    }

	    _createClass(LinearScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(x) {
	            var domain = this.domain();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !isNaN(min) && !isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create(interval) {

	            var varSet = this.vars;

	            var d3Domain = _d2.default.scale.linear().domain(varSet);

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
	}(_base.BaseScale);

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ValueScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ValueScale = exports.ValueScale = function (_BaseScale) {
	    _inherits(ValueScale, _BaseScale);

	    function ValueScale(xSource, scaleConfig) {
	        _classCallCheck(this, ValueScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ValueScale).call(this, xSource, scaleConfig));

	        _this.addField('scaleType', 'value').addField('georole', scaleConfig.georole);
	        return _this;
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
	}(_base.BaseScale);

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.FillScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(54);

	var _utils = __webpack_require__(4);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	/* jshint ignore:start */


	/* jshint ignore:end */

	var FillScale = exports.FillScale = function (_BaseScale) {
	    _inherits(FillScale, _BaseScale);

	    function FillScale(xSource, scaleConfig) {
	        _classCallCheck(this, FillScale);

	        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FillScale).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _d2.default.extent(_this.vars);

	        var min = _underscore2.default.isNumber(props.min) ? props.min : vars[0];
	        var max = _underscore2.default.isNumber(props.max) ? props.max : vars[1];

	        vars = [Math.min(min, vars[0]), Math.max(max, vars[1])];

	        _this.vars = props.nice ? _utils.utils.niceZeroBased(vars) : _d2.default.extent(vars);

	        var opacityStep = (1 - 0.2) / 9;
	        var defBrewer = _underscore2.default.times(10, function (i) {
	            return 'rgba(90,180,90,' + (0.2 + i * opacityStep).toFixed(2) + ')';
	        });

	        var brewer = props.brewer || defBrewer;

	        _this.addField('scaleType', 'fill').addField('brewer', brewer);
	        return _this;
	    }

	    _createClass(FillScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(x) {
	            var domain = this.domain();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !isNaN(min) && !isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create() {

	            var varSet = this.vars;

	            var brewer = this.getField('brewer');

	            if (!_underscore2.default.isArray(brewer)) {
	                throw new Error('This brewer is not supported');
	            }

	            var size = brewer.length;
	            var step = (varSet[1] - varSet[0]) / size;
	            var domain = _underscore2.default.times(size - 1, function (i) {
	                return i + 1;
	            }).reduce(function (memo, i) {
	                return memo.concat([varSet[0] + i * step]);
	            }, []);

	            var func = _d2.default.scale.threshold().domain(domain).range(brewer);

	            return this.toBaseScale(func);
	        }
	    }]);

	    return FillScale;
	}(_base.BaseScale);

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartMap = undefined;

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var ChartMap = function ChartMap(config) {

	    var guide = _underscore2.default.extend({
	        sourcemap: config.settings.defaultSourceMap
	    }, config.guide || {});

	    guide.size = _underscore2.default.defaults(guide.size || {}, { min: 1, max: 10 });
	    guide.code = _underscore2.default.defaults(guide.code || {}, { georole: 'countries' });

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
	            scales[key] = _underscore2.default.extend({ type: type, source: src, dim: dim }, guide);
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
	            latitude: scalesPool('linear', config.latitude, { nice: false }),
	            longitude: scalesPool('linear', config.longitude, { nice: false }),

	            guide: guide
	        },

	        plugins: config.plugins || []
	    };
	};

	exports.ChartMap = ChartMap;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartInterval = undefined;

	var _converterHelpers = __webpack_require__(64);

	var disableColorToBarPositionOnceColorAndAxesUseTheSameDim = function disableColorToBarPositionOnceColorAndAxesUseTheSameDim(normConfig) {

	    var baseScale = normConfig.flip ? normConfig.y : normConfig.x;
	    var isMatch = baseScale.indexOf(normConfig.color) >= 0;
	    var barGuide = normConfig.guide[normConfig.guide.length - 1];
	    if (isMatch && !barGuide.hasOwnProperty('enableColorToBarPosition')) {
	        barGuide.enableColorToBarPosition = false;
	    }

	    return normConfig;
	};

	var ChartInterval = function ChartInterval(rawConfig) {
	    var config = (0, _converterHelpers.normalizeConfig)(rawConfig);

	    config = disableColorToBarPositionOnceColorAndAxesUseTheSameDim(config);

	    return (0, _converterHelpers.transformConfig)('ELEMENT.INTERVAL', config);
	};

	exports.ChartInterval = ChartInterval;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.transformConfig = exports.normalizeConfig = undefined;

	var _strategyNormalizeAxi;

	var _utils = __webpack_require__(4);

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var convertAxis = function convertAxis(data) {
	    return !data ? null : data;
	};

	var normalizeSettings = function normalizeSettings(axis) {
	    var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	    return !_utils.utils.isArray(axis) ? [axis] : axis.length === 0 ? [defaultValue] : axis;
	};

	var createElement = function createElement(type, config) {
	    return {
	        type: type,
	        x: config.x,
	        y: config.y,
	        size: config.size,
	        color: config.color,
	        split: config.split,
	        label: config.label,
	        guide: {
	            color: config.colorGuide,
	            size: config.sizeGuide
	        },
	        flip: config.flip,
	        stack: config.stack
	    };
	};

	var status = {
	    SUCCESS: 'SUCCESS',
	    WARNING: 'WARNING',
	    FAIL: 'FAIL'
	};

	var strategyNormalizeAxis = (_strategyNormalizeAxi = {}, _defineProperty(_strategyNormalizeAxi, status.SUCCESS, function (axis) {
	    return axis;
	}), _defineProperty(_strategyNormalizeAxi, status.FAIL, function (axis, data) {
	    throw new Error((data.messages || []).join('\n') ||
	    // jscs:disable
	    'This configuration is not supported, See http://api.taucharts.com/basic/facet.html#easy-approach-for-creating-facet-chart');
	}), _defineProperty(_strategyNormalizeAxi, status.WARNING, function (axis, config, guide) {
	    var axisName = config.axis;
	    var index = config.indexMeasureAxis[0];
	    var measure = axis[index];
	    var newAxis = _underscore2.default.without(axis, measure);
	    newAxis.push(measure);

	    var measureGuide = guide[index][axisName] || {};
	    var categoryGuide = guide[guide.length - 1][axisName] || {};

	    guide[guide.length - 1][axisName] = measureGuide;
	    guide[index][axisName] = categoryGuide;

	    return newAxis;
	}), _strategyNormalizeAxi);

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

	    var guide = normalizeSettings(config.guide || {}, {});

	    // feel the gaps if needed
	    _underscore2.default.times(maxDeep - guide.length, function () {
	        return guide.push({});
	    });

	    // cut items
	    guide = guide.slice(0, maxDeep);

	    var validatedX = validateAxis(config.dimensions, x, 'x');
	    var validatedY = validateAxis(config.dimensions, y, 'y');
	    x = strategyNormalizeAxis[validatedX.status](x, validatedX, guide);
	    y = strategyNormalizeAxis[validatedY.status](y, validatedY, guide);

	    return _underscore2.default.extend({}, config, {
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
	                split: config.split,
	                color: config.color,
	                label: config.label,
	                size: config.size,
	                flip: config.flip,
	                stack: config.stack,
	                colorGuide: currentGuide.color,
	                sizeGuide: currentGuide.size
	            }));
	            spec.guide = _underscore2.default.defaults(currentGuide, {
	                x: { label: currentX },
	                y: { label: currentY }
	            });
	        } else {
	            spec = {
	                type: 'COORDS.RECT',
	                x: convertAxis(currentX),
	                y: convertAxis(currentY),
	                unit: [spec],
	                guide: _underscore2.default.defaults(currentGuide, {
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

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartScatterplot = undefined;

	var _converterHelpers = __webpack_require__(64);

	var ChartScatterplot = function ChartScatterplot(rawConfig) {
	    var config = (0, _converterHelpers.normalizeConfig)(rawConfig);
	    return (0, _converterHelpers.transformConfig)('ELEMENT.POINT', config);
	};

	exports.ChartScatterplot = ChartScatterplot;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartLine = undefined;

	var _dataProcessor = __webpack_require__(33);

	var _converterHelpers = __webpack_require__(64);

	var ChartLine = function ChartLine(rawConfig) {
	    var config = (0, _converterHelpers.normalizeConfig)(rawConfig);

	    var data = config.data;

	    var log = config.settings.log;

	    var lineOrientationStrategies = {

	        none: function none() {
	            return null;
	        },

	        horizontal: function horizontal(config) {
	            return config.x[config.x.length - 1];
	        },

	        vertical: function vertical(config) {
	            return config.y[config.y.length - 1];
	        },

	        auto: function auto(config) {
	            var xs = config.x;
	            var ys = config.y;
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

	    var orient = (config.lineOrientation || '').toLowerCase();
	    var strategy = lineOrientationStrategies.hasOwnProperty(orient) ? lineOrientationStrategies[orient] : lineOrientationStrategies.auto;

	    var propSortBy = strategy(config);
	    if (propSortBy !== null) {
	        config.data = _dataProcessor.DataProcessor.sortByDim(data, propSortBy, config.dimensions[propSortBy]);
	    }

	    return (0, _converterHelpers.transformConfig)('ELEMENT.LINE', config);
	};

	exports.ChartLine = ChartLine;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartArea = undefined;

	var _dataProcessor = __webpack_require__(33);

	var _converterHelpers = __webpack_require__(64);

	var ChartArea = function ChartArea(rawConfig) {

	    var config = (0, _converterHelpers.normalizeConfig)(rawConfig);

	    var data = config.data;

	    var log = config.settings.log;

	    var orientStrategies = {

	        horizontal: function horizontal(config) {
	            return {
	                prop: config.x[config.x.length - 1],
	                flip: false
	            };
	        },

	        vertical: function vertical(config) {
	            return {
	                prop: config.y[config.y.length - 1],
	                flip: true
	            };
	        },

	        auto: function auto(config) {
	            var xs = config.x;
	            var ys = config.y;
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
	            var flip = null;
	            if (isMatchAny) {
	                propSortBy = variations[variantIndex][0][0];
	                flip = variantIndex !== 0;
	            } else {
	                log('All attempts are failed. Gonna transform AREA to general PATH.');
	                propSortBy = null;
	            }

	            return {
	                prop: propSortBy,
	                flip: flip
	            };
	        }
	    };

	    var orient = typeof config.flip !== 'boolean' ? 'auto' : config.flip ? 'vertical' : 'horizontal';

	    var strategy = orientStrategies[orient];

	    var propSortBy = strategy(config);
	    var elementName = 'ELEMENT.AREA';
	    if (propSortBy.prop !== null) {
	        config.data = _dataProcessor.DataProcessor.sortByDim(data, propSortBy.prop, config.dimensions[propSortBy.prop]);
	        config.flip = propSortBy.flip;
	    }

	    return (0, _converterHelpers.transformConfig)(elementName, config);
	};

	exports.ChartArea = ChartArea;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartParallel = undefined;

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var ChartParallel = function ChartParallel(config) {

	    var guide = _underscore2.default.extend({
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
	            scales[key] = _underscore2.default.extend({ type: type, source: src, dim: dim }, guide);
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

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.PluginsSDK = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _underscore = __webpack_require__(3);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _formatterRegistry = __webpack_require__(15);

	var _unit = __webpack_require__(70);

	var _spec = __webpack_require__(71);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var customTokens = {};

	var PluginsSDK = function () {
	    function PluginsSDK() {
	        _classCallCheck(this, PluginsSDK);
	    }

	    _createClass(PluginsSDK, null, [{
	        key: 'unit',
	        value: function unit(unitRef) {
	            return new _unit.Unit(unitRef);
	        }
	    }, {
	        key: 'spec',
	        value: function spec(specRef) {
	            return new _spec.Spec(specRef);
	        }
	    }, {
	        key: 'cloneObject',
	        value: function cloneObject(obj) {
	            return JSON.parse(JSON.stringify(obj));
	        }
	    }, {
	        key: 'depthFirstSearch',
	        value: function depthFirstSearch(node, predicate) {

	            if (predicate(node)) {
	                return node;
	            }

	            var frames = node.hasOwnProperty('frames') ? node.frames : [{ units: node.units }];
	            for (var f = 0; f < frames.length; f++) {
	                var children = frames[f].units || [];
	                for (var i = 0; i < children.length; i++) {
	                    var found = PluginsSDK.depthFirstSearch(children[i], predicate);
	                    if (found) {
	                        return found;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'traverseSpec',
	        value: function traverseSpec(spec, iterator) {

	            var traverse = function traverse(node, fnIterator, parentNode) {
	                fnIterator(node, parentNode);
	                (node.units || []).map(function (x) {
	                    return traverse(x, fnIterator, node);
	                });
	            };

	            traverse(spec.unit, iterator, null);
	        }
	    }, {
	        key: 'extractFieldsFormatInfo',
	        value: function extractFieldsFormatInfo(spec) {

	            var specScales = spec.scales;

	            var isEmptyScale = function isEmptyScale(key) {
	                return !specScales[key].dim;
	            };

	            var fillSlot = function fillSlot(memoRef, config, key) {
	                var GUIDE = config.guide || {};
	                var scale = specScales[config[key]];
	                var guide = GUIDE[key] || {};
	                memoRef[scale.dim] = memoRef[scale.dim] || { label: [], format: [], nullAlias: [], tickLabel: [] };

	                var label = guide.label;
	                var guideLabel = guide.label || {};
	                memoRef[scale.dim].label.push(_underscore2.default.isString(label) ? label : guideLabel._original_text || guideLabel.text);

	                var format = guide.tickFormat || guide.tickPeriod;
	                memoRef[scale.dim].format.push(format);

	                memoRef[scale.dim].nullAlias.push(guide.tickFormatNullAlias);

	                // TODO: workaround for #complex-objects
	                memoRef[scale.dim].tickLabel.push(guide.tickLabel);
	            };

	            var configs = [];
	            PluginsSDK.traverseSpec(spec, function (node) {
	                configs.push(node);
	            });

	            var summary = configs.reduce(function (memo, config) {

	                if (config.type === 'COORDS.RECT' && config.hasOwnProperty('x') && !isEmptyScale(config.x)) {
	                    fillSlot(memo, config, 'x');
	                }

	                if (config.type === 'COORDS.RECT' && config.hasOwnProperty('y') && !isEmptyScale(config.y)) {
	                    fillSlot(memo, config, 'y');
	                }

	                if (config.hasOwnProperty('color') && !isEmptyScale(config.color)) {
	                    fillSlot(memo, config, 'color');
	                }

	                if (config.hasOwnProperty('size') && !isEmptyScale(config.size)) {
	                    fillSlot(memo, config, 'size');
	                }

	                return memo;
	            }, {});

	            var choiceRule = function choiceRule(arr, defaultValue) {

	                var val = (0, _underscore2.default)(arr).chain().filter(_underscore2.default.identity).uniq().first().value();

	                return val || defaultValue;
	            };

	            return Object.keys(summary).reduce(function (memo, k) {
	                memo[k].label = choiceRule(memo[k].label, k);
	                memo[k].format = choiceRule(memo[k].format, null);
	                memo[k].nullAlias = choiceRule(memo[k].nullAlias, 'No ' + memo[k].label);
	                memo[k].tickLabel = choiceRule(memo[k].tickLabel, null);

	                // very special case for dates
	                var format = memo[k].format === 'x-time-auto' ? 'day' : memo[k].format;
	                var nonVal = memo[k].nullAlias;
	                var fnForm = format ? _formatterRegistry.FormatterRegistry.get(format, nonVal) : function (raw) {
	                    return raw === null ? nonVal : raw;
	                };

	                memo[k].format = fnForm;

	                // TODO: workaround for #complex-objects
	                if (memo[k].tickLabel) {
	                    var kc = k.replace('.' + memo[k].tickLabel, '');
	                    memo[kc] = {
	                        label: memo[k].label,
	                        nullAlias: memo[k].nullAlias,
	                        tickLabel: memo[k].tickLabel,
	                        format: function format(obj) {
	                            return fnForm(obj && obj[memo[kc].tickLabel]);
	                        },
	                        isComplexField: true
	                    };

	                    memo[k].parentField = kc;
	                }

	                return memo;
	            }, summary);
	        }
	    }, {
	        key: 'tokens',
	        value: function tokens() {
	            return {
	                reg: function reg(key, val) {
	                    customTokens[key] = val;
	                    return this;
	                },

	                get: function get(key) {
	                    return customTokens[key] || key;
	                }
	            };
	        }
	    }]);

	    return PluginsSDK;
	}();

	exports.PluginsSDK = PluginsSDK;

/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Unit = function () {
	    function Unit(unitRef) {
	        _classCallCheck(this, Unit);

	        this.unitRef = unitRef;
	    }

	    _createClass(Unit, [{
	        key: 'value',
	        value: function value() {
	            return this.unitRef;
	        }
	    }, {
	        key: 'clone',
	        value: function clone() {
	            return JSON.parse(JSON.stringify(this.unitRef));
	        }
	    }, {
	        key: 'traverse',
	        value: function traverse(iterator) {

	            var fnTraverse = function fnTraverse(node, fnIterator, parentNode) {
	                fnIterator(node, parentNode);
	                (node.units || []).map(function (x) {
	                    return fnTraverse(x, fnIterator, node);
	                });
	            };

	            fnTraverse(this.unitRef, iterator, null);
	            return this;
	        }
	    }, {
	        key: 'reduce',
	        value: function reduce(iterator, memo) {
	            var r = memo;
	            this.traverse(function (unit, parent) {
	                return r = iterator(r, unit, parent);
	            });
	            return r;
	        }
	    }, {
	        key: 'addFrame',
	        value: function addFrame(frameConfig) {
	            this.unitRef.frames = this.unitRef.frames || [];

	            frameConfig.key.__layerid__ = ['L', new Date().getTime(), this.unitRef.frames.length].join('');
	            frameConfig.source = frameConfig.hasOwnProperty('source') ? frameConfig.source : this.unitRef.expression.source;

	            frameConfig.pipe = frameConfig.pipe || [];

	            this.unitRef.frames.push(frameConfig);
	            return this;
	        }
	    }, {
	        key: 'addTransformation',
	        value: function addTransformation(name, params) {
	            this.unitRef.transformation = this.unitRef.transformation || [];
	            this.unitRef.transformation.push({ type: name, args: params });
	            return this;
	        }
	    }, {
	        key: 'isCoordinates',
	        value: function isCoordinates() {
	            return (this.unitRef.type || '').toUpperCase().indexOf('COORDS.') === 0;
	        }
	    }, {
	        key: 'isElementOf',
	        value: function isElementOf(typeOfCoordinates) {

	            if (this.isCoordinates()) {
	                return false;
	            }

	            var xType = this.unitRef.type || '';
	            var parts = xType.split('/');

	            if (parts.length === 1) {
	                parts.unshift('RECT'); // by default
	            }

	            return parts[0].toUpperCase() === typeOfCoordinates.toUpperCase();
	        }
	    }]);

	    return Unit;
	}();

	exports.Unit = Unit;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Spec = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _unit = __webpack_require__(70);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Spec = function () {
	    function Spec(specRef) {
	        _classCallCheck(this, Spec);

	        this.specRef = specRef;
	    }

	    _createClass(Spec, [{
	        key: 'value',
	        value: function value() {
	            return this.specRef;
	        }
	    }, {
	        key: 'unit',
	        value: function unit(newUnit) {
	            if (newUnit) {
	                this.specRef.unit = newUnit;
	            }
	            return new _unit.Unit(this.specRef.unit);
	        }
	    }, {
	        key: 'addTransformation',
	        value: function addTransformation(name, func) {
	            this.specRef.transformations = this.specRef.transformations || {};
	            this.specRef.transformations[name] = func;
	            return this;
	        }
	    }, {
	        key: 'getSettings',
	        value: function getSettings(name) {
	            return this.specRef.settings[name];
	        }
	    }, {
	        key: 'setSettings',
	        value: function setSettings(name, value) {
	            this.specRef.settings = this.specRef.settings || {};
	            this.specRef.settings[name] = value;
	            return this;
	        }
	    }, {
	        key: 'getScale',
	        value: function getScale(name) {
	            return this.specRef.scales[name];
	        }
	    }, {
	        key: 'addScale',
	        value: function addScale(name, props) {
	            this.specRef.scales[name] = props;
	            return this;
	        }
	    }, {
	        key: 'regSource',
	        value: function regSource(sourceName, sourceObject) {
	            this.specRef.sources[sourceName] = sourceObject;
	            return this;
	        }
	    }, {
	        key: 'getSourceData',
	        value: function getSourceData(sourceName) {
	            var srcData = this.specRef.sources[sourceName] || { data: [] };
	            return srcData.data;
	        }
	    }, {
	        key: 'getSourceDim',
	        value: function getSourceDim(sourceName, sourceDim) {
	            var srcDims = this.specRef.sources[sourceName] || { dims: {} };
	            return srcDims.dims[sourceDim] || {};
	        }
	    }]);

	    return Spec;
	}();

	exports.Spec = Spec;

/***/ }
/******/ ])
});
;