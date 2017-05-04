/*! taucharts - v1.1.3 - 2017-05-04
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2017 Taucraft Limited; Licensed Apache License 2.0 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3"));
	else if(typeof define === 'function' && define.amd)
		define(["d3"], factory);
	else if(typeof exports === 'object')
		exports["tauCharts"] = factory(require("d3"));
	else
		root["tauCharts"] = factory(root["d3"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
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
	exports.version = exports.api = exports.__api__ = exports.Chart = exports.Plot = exports.GPL = undefined;

	var _utilsDom = __webpack_require__(1);

	var _utils = __webpack_require__(3);

	var _utilsDraw = __webpack_require__(10);

	var _tau = __webpack_require__(16);

	var _tau2 = __webpack_require__(20);

	var _tau3 = __webpack_require__(38);

	var _unitDomainPeriodGenerator = __webpack_require__(18);

	var _formatterRegistry = __webpack_require__(32);

	var _unitsRegistry = __webpack_require__(25);

	var _scalesRegistry = __webpack_require__(26);

	var _grammarRegistry = __webpack_require__(7);

	var _coords = __webpack_require__(40);

	var _coords2 = __webpack_require__(41);

	var _coords3 = __webpack_require__(42);

	var _elementGeneric = __webpack_require__(4);

	var _element = __webpack_require__(45);

	var _element2 = __webpack_require__(51);

	var _element3 = __webpack_require__(55);

	var _element4 = __webpack_require__(56);

	var _element5 = __webpack_require__(59);

	var _elementParallel = __webpack_require__(60);

	var _identity = __webpack_require__(61);

	var _color = __webpack_require__(63);

	var _size = __webpack_require__(64);

	var _ordinal = __webpack_require__(65);

	var _period = __webpack_require__(66);

	var _time = __webpack_require__(67);

	var _linear = __webpack_require__(68);

	var _logarithmic = __webpack_require__(69);

	var _value = __webpack_require__(70);

	var _fill = __webpack_require__(71);

	var _chartAliasRegistry = __webpack_require__(39);

	var _chartMap = __webpack_require__(72);

	var _chartInterval = __webpack_require__(73);

	var _chartScatterplot = __webpack_require__(75);

	var _chartLine = __webpack_require__(76);

	var _chartArea = __webpack_require__(77);

	var _chartParallel = __webpack_require__(78);

	var _d3Decorators = __webpack_require__(9);

	var _error = __webpack_require__(8);

	var _pluginsSdk = __webpack_require__(79);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	__webpack_require__(82);

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
	    grammarRegistry: _grammarRegistry.GrammarRegistry,
	    tickFormat: _formatterRegistry.FormatterRegistry,
	    isChartElement: _utils.utils.isChartElement,
	    d3: _d2.default,
	    utils: _utils.utils,
	    svgUtils: _utilsDraw.utilsDraw,
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
	    d3_animationInterceptor: _d3Decorators.d3_animationInterceptor,
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

	        animationSpeed: 750,
	        renderingTimeout: 10000,
	        asyncRendering: false,
	        syncRenderingInterval: 50,
	        syncPointerEvents: false,
	        handleRenderingErrors: true,
	        experimentalShouldAnimate: function experimentalShouldAnimate(spec) {
	            var createSvg = function createSvg(tag, attrs) {
	                var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
	                Object.keys(attrs).forEach(function (k) {
	                    return el.setAttribute(k, String(attrs[k]));
	                });
	                return el;
	            };
	            var div = document.createElement('div');
	            div.style.position = 'absolute';
	            div.style.visibility = 'hidden';
	            document.body.appendChild(div);
	            var svg = createSvg('svg', {
	                width: 100,
	                height: 100
	            });
	            div.appendChild(svg);
	            var start = performance.now();
	            var i, j, c;
	            for (i = 0, j, c; i < 10; i++) {
	                for (j = 0; j < 10; j++) {
	                    c = createSvg('circle', {
	                        fill: 'black',
	                        r: 5,
	                        cx: i * 10,
	                        cy: j * 10
	                    });
	                    svg.appendChild(c);
	                }
	            }
	            var duration = performance.now() - start;
	            document.body.removeChild(div);
	            return spec.sources['/'].data.length * duration < 500;
	        },

	        defaultNiceColor: true,

	        // jscs:disable
	        defaultColorBrewer: ["#fde725", "#fbe723", "#f8e621", "#f6e620", "#f4e61e", "#f1e51d", "#efe51c", "#ece51b", "#eae51a", "#e7e419", "#e5e419", "#e2e418", "#dfe318", "#dde318", "#dae319", "#d8e219", "#d5e21a", "#d2e21b", "#d0e11c", "#cde11d", "#cae11f", "#c8e020", "#c5e021", "#c2df23", "#c0df25", "#bddf26", "#bade28", "#b8de29", "#b5de2b", "#b2dd2d", "#b0dd2f", "#addc30", "#aadc32", "#a8db34", "#a5db36", "#a2da37", "#a0da39", "#9dd93b", "#9bd93c", "#98d83e", "#95d840", "#93d741", "#90d743", "#8ed645", "#8bd646", "#89d548", "#86d549", "#84d44b", "#81d34d", "#7fd34e", "#7cd250", "#7ad151", "#77d153", "#75d054", "#73d056", "#70cf57", "#6ece58", "#6ccd5a", "#69cd5b", "#67cc5c", "#65cb5e", "#63cb5f", "#60ca60", "#5ec962", "#5cc863", "#5ac864", "#58c765", "#56c667", "#54c568", "#52c569", "#50c46a", "#4ec36b", "#4cc26c", "#4ac16d", "#48c16e", "#46c06f", "#44bf70", "#42be71", "#40bd72", "#3fbc73", "#3dbc74", "#3bbb75", "#3aba76", "#38b977", "#37b878", "#35b779", "#34b679", "#32b67a", "#31b57b", "#2fb47c", "#2eb37c", "#2db27d", "#2cb17e", "#2ab07f", "#29af7f", "#28ae80", "#27ad81", "#26ad81", "#25ac82", "#25ab82", "#24aa83", "#23a983", "#22a884", "#22a785", "#21a685", "#21a585", "#20a486", "#20a386", "#1fa287", "#1fa187", "#1fa188", "#1fa088", "#1f9f88", "#1f9e89", "#1e9d89", "#1e9c89", "#1e9b8a", "#1f9a8a", "#1f998a", "#1f988b", "#1f978b", "#1f968b", "#1f958b", "#1f948c", "#20938c", "#20928c", "#20928c", "#21918c", "#21908d", "#218f8d", "#218e8d", "#228d8d", "#228c8d", "#228b8d", "#238a8d", "#23898e", "#23888e", "#24878e", "#24868e", "#25858e", "#25848e", "#25838e", "#26828e", "#26828e", "#26818e", "#27808e", "#277f8e", "#277e8e", "#287d8e", "#287c8e", "#297b8e", "#297a8e", "#29798e", "#2a788e", "#2a778e", "#2a768e", "#2b758e", "#2b748e", "#2c738e", "#2c728e", "#2c718e", "#2d718e", "#2d708e", "#2e6f8e", "#2e6e8e", "#2e6d8e", "#2f6c8e", "#2f6b8e", "#306a8e", "#30698e", "#31688e", "#31678e", "#31668e", "#32658e", "#32648e", "#33638d", "#33628d", "#34618d", "#34608d", "#355f8d", "#355e8d", "#365d8d", "#365c8d", "#375b8d", "#375a8c", "#38598c", "#38588c", "#39568c", "#39558c", "#3a548c", "#3a538b", "#3b528b", "#3b518b", "#3c508b", "#3c4f8a", "#3d4e8a", "#3d4d8a", "#3e4c8a", "#3e4a89", "#3e4989", "#3f4889", "#3f4788", "#404688", "#404588", "#414487", "#414287", "#424186", "#424086", "#423f85", "#433e85", "#433d84", "#443b84", "#443a83", "#443983", "#453882", "#453781", "#453581", "#463480", "#46337f", "#46327e", "#46307e", "#472f7d", "#472e7c", "#472d7b", "#472c7a", "#472a7a", "#482979", "#482878", "#482677", "#482576", "#482475", "#482374", "#482173", "#482071", "#481f70", "#481d6f", "#481c6e", "#481b6d", "#481a6c", "#48186a", "#481769", "#481668", "#481467", "#471365", "#471164", "#471063", "#470e61", "#470d60", "#460b5e", "#460a5d", "#46085c", "#46075a", "#450559", "#450457", "#440256", "#440154"],
	        // jscs:enable

	        defaultClassBrewer: _utils.utils.range(20).map(function (i) {
	            return 'color20-' + (1 + i);
	        }),

	        log: function log(msg, type) {
	            type = type || 'INFO';
	            if (!Array.isArray(msg)) {
	                msg = [msg];
	            }
	            console[type.toLowerCase()].apply(console, msg); // eslint-disable-line
	        },

	        facetLabelDelimiter: ' \u2192 ',
	        excludeNull: true,
	        minChartWidth: 300,
	        minChartHeight: 200,
	        minFacetWidth: 150,
	        minFacetHeight: 100,
	        specEngine: [{
	            name: 'COMPACT',
	            width: 600,
	            height: 400
	        }, {
	            name: 'AUTO',
	            width: Number.MAX_VALUE,
	            height: Number.MAX_VALUE
	        }],

	        fitModel: 'normal',
	        layoutEngine: 'EXTRACT',
	        autoRatio: true,
	        defaultSourceMap: ['https://raw.githubusercontent.com', 'TargetProcess/tauCharts/master/src/addons', 'world-countries.json'].join('/'),

	        getAxisTickLabelSize: _utils.utils.memoize(_utilsDom.utilsDom.getAxisTickLabelSize, function (text) {
	            return String(text).length;
	        }),

	        getScrollbarSize: _utilsDom.utilsDom.getScrollbarSize,

	        avoidScrollAtRatio: 1.5,

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

	        xFontLabelDescenderLineHeight: 4,
	        xFontLabelHeight: 10,
	        yFontLabelHeight: 10,

	        xDensityPadding: 2,
	        yDensityPadding: 2,
	        'xDensityPadding:measure': 8,
	        'yDensityPadding:measure': 8,

	        utcTime: false,

	        defaultFormats: {
	            measure: 'x-num-auto',
	            'measure:time': 'x-time-auto'
	        }
	    }
	};

	_tau2.Plot.__api__ = api;
	_tau2.Plot.globalSettings = api.globalSettings;

	[['COORDS.RECT', _coords.Cartesian], ['COORDS.MAP', _coords3.GeoMap], ['COORDS.PARALLEL', _coords2.Parallel], ['ELEMENT.GENERIC.CARTESIAN', _elementGeneric.GenericCartesian], ['ELEMENT.POINT', _element.Point, 'ELEMENT.GENERIC.CARTESIAN'], ['ELEMENT.LINE', _element4.Line, 'ELEMENT.GENERIC.CARTESIAN'], ['ELEMENT.PATH', _element3.Path, 'ELEMENT.GENERIC.CARTESIAN'], ['ELEMENT.AREA', _element2.Area, 'ELEMENT.GENERIC.CARTESIAN'], ['ELEMENT.INTERVAL', _element5.Interval, 'ELEMENT.GENERIC.CARTESIAN'], ['ELEMENT.INTERVAL.STACKED', _element5.Interval, 'ELEMENT.GENERIC.CARTESIAN'], ['PARALLEL/ELEMENT.LINE', _elementParallel.ParallelLine]].reduce(function (memo, nv) {
	    return memo.reg.apply(memo, _toConsumableArray(nv));
	}, api.unitsRegistry);

	[['identity', _identity.IdentityScale, function (config, settings) {
	    return _utils.utils.defaults(config, {
	        references: settings.references,
	        refCounter: settings.refCounter
	    });
	}], ['color', _color.ColorScale, function (config, settings) {
	    return _utils.utils.defaults(config, {
	        nice: settings.defaultNiceColor,
	        brewer: config.dimType === 'measure' ? settings.defaultColorBrewer : settings.defaultClassBrewer
	    });
	}], ['fill', _fill.FillScale], ['size', _size.SizeScale], ['ordinal', _ordinal.OrdinalScale], ['period', _period.PeriodScale, function (config, settings) {
	    return _utils.utils.defaults(config, {
	        utcTime: settings.utcTime
	    });
	}], ['time', _time.TimeScale, function (config, settings) {
	    return _utils.utils.defaults(config, {
	        utcTime: settings.utcTime
	    });
	}], ['linear', _linear.LinearScale], ['logarithmic', _logarithmic.LogarithmicScale], ['value', _value.ValueScale]].reduce(function (memo, nv) {
	    return memo.reg.apply(memo, _toConsumableArray(nv));
	}, api.scalesRegistry);

	var commonRules = [function (config) {
	    return !config.data ? ['[data] must be specified'] : [];
	}];

	api.chartTypesRegistry = _chartAliasRegistry.chartTypesRegistry.add('scatterplot', _chartScatterplot.ChartScatterplot, commonRules).add('line', _chartLine.ChartLine, commonRules).add('area', _chartArea.ChartArea, commonRules).add('stacked-area', function (cfg) {
	    return (0, _chartArea.ChartArea)(_utils.utils.defaults(cfg, { stack: true }));
	}, commonRules).add('bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_utils.utils.defaults(cfg, { flip: false }));
	}, commonRules).add('horizontalBar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_utils.utils.defaults({ flip: true }, cfg));
	}, commonRules).add('horizontal-bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_utils.utils.defaults({ flip: true }, cfg));
	}, commonRules).add('stacked-bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_utils.utils.defaults({ flip: false, stack: true }, cfg));
	}, commonRules).add('horizontal-stacked-bar', function (cfg) {
	    return (0, _chartInterval.ChartInterval)(_utils.utils.defaults({ flip: true, stack: true }, cfg));
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

	/* global VERSION:false */
	var version = ("1.1.3");
	exports.GPL = _tau.GPL;
	exports.Plot = _tau2.Plot;
	exports.Chart = _tau3.Chart;
	exports.__api__ = __api__;
	exports.api = api;
	exports.version = version;
	exports.default = { GPL: _tau.GPL, Plot: _tau2.Plot, Chart: _tau3.Chart, __api__: __api__, api: api, version: version };

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.utilsDom = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                                               * Internal method to return CSS value for given element and property
	                                                                                                                                                                                                                                                                               */


	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _utils = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var tempDiv = document.createElement('div');

	var scrollbarSizes = new WeakMap();

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
	    getScrollbarSize: function getScrollbarSize(container) {
	        if (scrollbarSizes.has(container)) {
	            return scrollbarSizes.get(container);
	        }
	        var initialOverflow = container.style.overflow;
	        container.style.overflow = 'scroll';
	        var size = {
	            width: container.offsetWidth - container.clientWidth,
	            height: container.offsetHeight - container.clientHeight
	        };
	        container.style.overflow = initialOverflow;
	        scrollbarSizes.set(container, size);
	        return size;
	    },

	    /**
	     * Sets padding as a placeholder for scrollbars.
	     * @param el Target element.
	     * @param [direction=both] Scrollbar direction ("horizontal", "vertical" or "both").
	     */
	    setScrollPadding: function setScrollPadding(el, direction) {
	        direction = direction || 'both';
	        var isBottom = direction === 'horizontal' || direction === 'both';
	        var isRight = direction === 'vertical' || direction === 'both';

	        var scrollbars = utilsDom.getScrollbarSize(el);
	        var initialPaddingRight = isRight ? scrollbars.width + 'px' : '0';
	        var initialPaddingBottom = isBottom ? scrollbars.height + 'px' : '0';
	        el.style.overflow = 'hidden';
	        el.style.padding = '0 ' + initialPaddingRight + ' ' + initialPaddingBottom + ' 0';

	        var hasBottomScroll = el.scrollWidth > el.clientWidth;
	        var hasRightScroll = el.scrollHeight > el.clientHeight;
	        var paddingRight = isRight && !hasRightScroll ? scrollbars.width + 'px' : '0';
	        var paddingBottom = isBottom && !hasBottomScroll ? scrollbars.height + 'px' : '0';
	        el.style.padding = '0 ' + paddingRight + ' ' + paddingBottom + ' 0';

	        // NOTE: Manually set scroll due to overflow:auto Chrome 53 bug
	        // https://bugs.chromium.org/p/chromium/issues/detail?id=644450
	        el.style.overflow = '';
	        el.style.overflowX = hasBottomScroll ? 'scroll' : 'hidden';
	        el.style.overflowY = hasRightScroll ? 'scroll' : 'hidden';

	        return scrollbars;
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
	        var div = document.createElement('div');
	        div.style.position = 'absolute';
	        div.style.visibility = 'hidden';
	        div.style.width = '100px';
	        div.style.height = '100px';
	        div.style.border = '1px solid green';
	        div.style.top = '0';
	        document.body.appendChild(div);

	        div.innerHTML = '<svg class="graphical-report__svg">\n            <g class="graphical-report__cell cell">\n            <g class="x axis">\n            <g class="tick"><text>' + text + '</text></g>\n            </g>\n            </g>\n            </svg>';

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
	        var fontSize = _ref.fontSize,
	            fontFamily = _ref.fontFamily,
	            fontWeight = _ref.fontWeight;


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

	        return { width: w, height: parseInt(xFontSize) };
	    },

	    getCharSize: _utils.utils.memoize(function (char, _ref2) {
	        var fontSize = _ref2.fontSize,
	            fontFamily = _ref2.fontFamily,
	            fontWeight = _ref2.fontWeight;


	        var div = document.createElement('div');
	        div.style.position = 'absolute';
	        div.style.visibility = 'hidden';
	        div.style.border = '0px';
	        div.style.top = '0';
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
	    }),

	    /**
	     * Searches for immediate child element by specified selector.
	     * If missing, creates an element that matches the selector.
	     */
	    selectOrAppend: function selectOrAppend(container, selector) {
	        var delimitersActions = {
	            '.': function _(text, el) {
	                return el.classed(text, true);
	            },
	            '#': function _(text, el) {
	                return el.attr('id', text);
	            }
	        };
	        var delimiters = Object.keys(delimitersActions).join('');

	        if (selector.indexOf(' ') >= 0) {
	            throw new Error('Selector should not contain whitespaces.');
	        }
	        if (delimiters.indexOf(selector[0]) >= 0) {
	            throw new Error('Selector must have tag at the beginning.');
	        }

	        var isElement = container instanceof Element;
	        if (isElement) {
	            container = _d2.default.select(container);
	        }
	        var result = function result(d3El) {
	            return isElement ? d3El.node() : d3El;
	        };

	        // Search for existing immediate child
	        var child = container.selectAll(selector).filter(function () {
	            return this.parentNode === container.node();
	        }).filter(function (d, i) {
	            return i === 0;
	        });
	        if (!child.empty()) {
	            return result(child);
	        }

	        // Create new element
	        var element;
	        var lastFoundIndex = -1;
	        var lastFoundDelimiter = null;
	        for (var i = 1, l = selector.length, text; i <= l; i++) {
	            if (i == l || delimiters.indexOf(selector[i]) >= 0) {
	                text = selector.substring(lastFoundIndex + 1, i);
	                if (lastFoundIndex < 0) {
	                    element = container.append(text);
	                } else {
	                    delimitersActions[lastFoundDelimiter].call(null, text, element);
	                }
	                lastFoundDelimiter = selector[i];
	                lastFoundIndex = i;
	            }
	        }

	        return result(element);
	    },

	    selectImmediate: function selectImmediate(container, selector) {
	        return utilsDom.selectAllImmediate(container, selector)[0] || null;
	    },

	    selectAllImmediate: function selectAllImmediate(container, selector) {
	        var results = [];
	        var matches = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	        for (var child = container.firstElementChild; Boolean(child); child = child.nextElementSibling) {
	            if (matches.call(child, selector)) {
	                results.push(child);
	            }
	        }
	        return results;
	    },

	    sortChildren: function sortChildren(parent, sorter) {
	        if (parent.childElementCount > 0) {

	            // Note: move DOM elements with
	            // minimal number of iterations
	            // and affected nodes to prevent
	            // unneccessary repaints.

	            // Get from/to index pairs.
	            var unsorted = Array.prototype.filter.call(parent.childNodes, function (el) {
	                return el.nodeType === Node.ELEMENT_NODE;
	            });
	            var sorted = unsorted.slice().sort(sorter);
	            var unsortedIndices = unsorted.reduce(function (map, el, i) {
	                map.set(el, i);
	                return map;
	            }, new Map());

	            // Get groups (sequences of elements with unchanged order)
	            var currGroup;
	            var currDiff;
	            var groups = sorted.reduce(function (groupsInfo, el, to) {
	                var from = unsortedIndices.get(el);
	                var diff = to - from;
	                if (diff !== currDiff) {
	                    if (currGroup) {
	                        groupsInfo.push(currGroup);
	                    }
	                    currDiff = diff;
	                    currGroup = {
	                        from: from,
	                        to: to,
	                        elements: []
	                    };
	                }
	                currGroup.elements.push(el);
	                if (to === sorted.length - 1) {
	                    groupsInfo.push(currGroup);
	                }
	                return groupsInfo;
	            }, []);
	            var unsortedGroups = groups.slice().sort(function (a, b) {
	                return a.from - b.from;
	            });
	            var unsortedGroupsIndices = unsortedGroups.reduce(function (map, g, i) {
	                map.set(g, i);
	                return map;
	            }, new Map());

	            // Get required iterations
	            var createIterations = function createIterations(forward) {
	                var iterations = groups.map(function (g, i) {
	                    return {
	                        elements: g.elements,
	                        from: unsortedGroupsIndices.get(g),
	                        to: i
	                    };
	                }).sort(_utils.utils.createMultiSorter(function (a, b) {
	                    return a.elements.length - b.elements.length;
	                }, forward ? function (a, b) {
	                    return b.to - a.to;
	                } : function (a, b) {
	                    return a.to - b.to;
	                }));
	                for (var i = 0, j, g, h; i < iterations.length; i++) {
	                    g = iterations[i];
	                    if (g.from > g.to) {
	                        for (j = i + 1; j < iterations.length; j++) {
	                            h = iterations[j];
	                            if (h.from >= g.to && h.from < g.from) {
	                                h.from++;
	                            }
	                        }
	                    }
	                    if (g.from < g.to) {
	                        for (j = i + 1; j < iterations.length; j++) {
	                            h = iterations[j];
	                            if (h.from > g.from && h.from <= g.to) {
	                                h.from--;
	                            }
	                        }
	                    }
	                }
	                return iterations.filter(function (g) {
	                    return g.from !== g.to;
	                });
	            };
	            var forwardIterations = createIterations(true);
	            var backwardIterations = createIterations(false);
	            var iterations = forwardIterations.length < backwardIterations.length ? forwardIterations : backwardIterations;

	            // Finally sort DOM nodes
	            var mirror = unsortedGroups.map(function (g) {
	                return g.elements;
	            });
	            iterations.forEach(function (g) {
	                var targetGroup = mirror.splice(g.from, 1)[0];
	                var groupAfter = mirror[g.to];
	                var siblingAfter = groupAfter ? groupAfter[0] : null;
	                var targetNode;
	                if (g.elements.length === 1) {
	                    targetNode = targetGroup[0];
	                } else {
	                    targetNode = document.createDocumentFragment();
	                    targetGroup.forEach(function (el) {
	                        targetNode.appendChild(el);
	                    });
	                }
	                parent.insertBefore(targetNode, siblingAfter);
	                mirror.splice(g.to, 0, targetGroup);
	            });
	        }
	    },

	    /**
	     * Generates "class" attribute string.
	     */
	    classes: function classes() {
	        var classes = [];

	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }

	        args.filter(function (c) {
	            return Boolean(c);
	        }).forEach(function (c) {
	            if (typeof c === 'string') {
	                classes.push(c);
	            } else if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
	                classes.push.apply(classes, Object.keys(c).filter(function (key) {
	                    return Boolean(c[key]);
	                }));
	            }
	        });
	        return _utils.utils.unique(classes).join(' ').trim().replace(/\s{2,}/g, ' ');
	    }
	};
	// TODO: Export functions separately.
	exports.utilsDom = utilsDom;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.utils = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _elementGeneric = __webpack_require__(4);

	var _d2 = __webpack_require__(2);

	var _d3 = _interopRequireDefault(_d2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var traverseJSON = function traverseJSON(srcObject, byProperty, fnSelectorPredicates, funcTransformRules) {

	    var rootRef = funcTransformRules(fnSelectorPredicates(srcObject), srcObject);

	    (rootRef[byProperty] || []).forEach(function (unit) {
	        return traverseJSON(unit, byProperty, fnSelectorPredicates, funcTransformRules);
	    });

	    return rootRef;
	};

	var traverseSpec = function traverseSpec(root, enterFn, exitFn) {
	    var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

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
	var chartElement = [_elementGeneric.GenericCartesian];

	var testColorCode = function testColorCode(x) {
	    return (/^(#|rgb\(|rgba\()/.test(x)
	    );
	};

	// TODO Remove this configs and its associated methods
	// which are just for templating in some plugins
	var noMatch = /(.)^/;

	var map = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    '\'': '&#x27;',
	    '`': '&#x60;'
	};
	var escapes = {
	    '\'': '\'',
	    '\\': '\\',
	    '\r': 'r',
	    '\n': 'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	};

	var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	var source = '(?:' + Object.keys(map).join('|') + ')';
	var testRegexp = RegExp(source);
	var replaceRegexp = RegExp(source, 'g');

	var templateSettings = {
	    evaluate: /<%([\s\S]+?)%>/g,
	    interpolate: /<%=([\s\S]+?)%>/g,
	    escape: /<%-([\s\S]+?)%>/g
	};
	// End of plugin configs

	var utils = {
	    clone: function clone(obj) {
	        return deepClone(obj);
	    },
	    isDate: function isDate(obj) {
	        return obj instanceof Date && !isNaN(Number(obj));
	    },
	    isObject: function isObject(obj) {
	        return obj != null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
	    },
	    isChartElement: function isChartElement(element) {
	        return chartElement.some(function (Element) {
	            return element instanceof Element;
	        });
	    },
	    niceZeroBased: function niceZeroBased(domain) {

	        var m = 10;

	        var low = parseFloat(Math.min.apply(Math, _toConsumableArray(domain)).toFixed(15));
	        var top = parseFloat(Math.max.apply(Math, _toConsumableArray(domain)).toFixed(15));

	        if (low === top) {
	            var k = top >= 0 ? -1 : 1;
	            var d = top || 1;
	            top = top - k * d / m;
	        }

	        // include 0 by default
	        low = Math.min(0, low);
	        top = Math.max(0, top);

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

	        if (low < 0) {
	            var koeffLow = deltaLow >= limit ? -deltaLow : 0;
	            extent[0] = extent[0] - koeffLow;
	        }

	        if (top > 0) {
	            var koeffTop = deltaTop >= limit ? -deltaTop : 0;
	            extent[1] = extent[1] + koeffTop;
	        }

	        return [parseFloat(extent[0].toFixed(15)), parseFloat(extent[1].toFixed(15))];
	    },
	    niceTimeDomain: function niceTimeDomain(domain, niceIntervalFn) {
	        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { utc: false },
	            utc = _ref.utc;

	        var _d3$extent = _d3.default.extent(domain),
	            _d3$extent2 = _slicedToArray(_d3$extent, 2),
	            low = _d3$extent2[0],
	            top = _d3$extent2[1];

	        var span = top - low;
	        var d3TimeScale = utc ? _d3.default.time.scale.utc : _d3.default.time.scale;

	        if (span === 0) {
	            var oneDay = 24 * 60 * 60 * 1000;
	            low = new Date(low.getTime() - oneDay);
	            top = new Date(top.getTime() + oneDay);
	            return d3TimeScale().domain([low, top]).nice(niceIntervalFn).domain();
	        }

	        var niceScale = d3TimeScale().domain([low, top]).nice(niceIntervalFn);
	        if (niceIntervalFn) {
	            return niceScale.domain();
	        }

	        var _d3TimeScale$domain$n = d3TimeScale().domain([low, top]).nice(niceIntervalFn).domain(),
	            _d3TimeScale$domain$n2 = _slicedToArray(_d3TimeScale$domain$n, 2),
	            niceLow = _d3TimeScale$domain$n2[0],
	            niceTop = _d3TimeScale$domain$n2[1];

	        var ticks = niceScale.ticks();
	        var last = ticks.length - 1;
	        if ((low - niceLow) / (ticks[1] - niceLow) < 0.5) {
	            low = niceLow;
	        }
	        if ((niceTop - top) / (niceTop - ticks[last - 1]) < 0.5) {
	            top = niceTop;
	        }

	        return [low, top];
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
	            return utils.isDate(v) ? v.getTime() : v;
	        };

	        var dataNewSnap = 0;
	        var dataPrevRef = null;
	        var xHash = utils.memoize(function (data, keys) {
	            return utils.unique(data.map(function (row) {
	                return keys.reduce(function (r, k) {
	                    return r.concat(unify(row[k]));
	                }, []);
	            }), function (t) {
	                return JSON.stringify(t);
	            }).reduce(function (memo, t) {
	                var k = t[0];
	                memo[k] = memo[k] || 0;
	                memo[k] += 1;
	                return memo;
	            }, {});
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
	                var arr = xHash(data, keys);
	                return Object.keys(arr).reduce(function (sum, k) {
	                    return sum + arr[k];
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
	        var limitFromPrev = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;


	        if (limitFromPrev === 'requestAnimationFrame') {
	            var frameRequested = false;
	            return function () {
	                if (!frameRequested) {
	                    requestAnimationFrame(function () {
	                        frameRequested = false;
	                    });
	                    // NOTE: Have to call sync cause
	                    // D3 event info disappears later.

	                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                        args[_key] = arguments[_key];
	                    }

	                    handler.apply(this, args);
	                    frameRequested = true;
	                }
	                last.e = eventType;
	                last.ts = new Date();
	            };
	        }

	        return function () {
	            var curr = { e: eventType, ts: new Date() };
	            var diff = last.e && last.e === curr.e ? curr.ts - last.ts : limitFromPrev;

	            if (diff >= limitFromPrev) {
	                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	                    args[_key2] = arguments[_key2];
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
	        var chunks = parts >= 2 ? utils.range(parts - 2).map(function (n) {
	            return min + segment * (n + 1);
	        }) : [];
	        return [min].concat(_toConsumableArray(chunks), [max]);
	    },

	    extRGBColor: function extRGBColor(x) {
	        return testColorCode(x) ? x : '';
	    },

	    extCSSClass: function extCSSClass(x) {
	        return testColorCode(x) ? '' : x;
	    },

	    toRadian: function toRadian(degree) {
	        return degree / 180 * Math.PI;
	    },

	    normalizeAngle: function normalizeAngle(angle) {
	        if (Math.abs(angle) >= 360) {
	            angle = angle % 360;
	        }

	        if (angle < 0) {
	            angle = 360 + angle;
	        }

	        return angle;
	    },

	    range: function range(start, end) {
	        if (arguments.length === 1) {
	            end = start;
	            start = 0;
	        }
	        var arr = [];
	        for (var i = start; i < end; i++) {
	            arr.push(i);
	        }
	        return arr;
	    },

	    flatten: function flatten(array) {
	        var _ref2;

	        if (!Array.isArray(array)) {
	            return array;
	        }
	        return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(array.map(function (x) {
	            return utils.flatten(x);
	        })));
	    },

	    unique: function unique(array, func) {
	        var hash = {};
	        var result = [];
	        var len = array.length;
	        var hasher = func || function (x) {
	            return String(x);
	        };
	        for (var i = 0; i < len; ++i) {
	            var item = array[i];
	            var key = hasher(item);
	            if (!hash.hasOwnProperty(key)) {
	                hash[key] = true;
	                result.push(item);
	            }
	        }
	        return result;
	    },

	    groupBy: function groupBy(array, func) {
	        return array.reduce(function (obj, v) {
	            var group = func(v);
	            obj[group] = obj[group] || [];
	            obj[group].push(v);
	            return obj;
	        }, {});
	    },

	    union: function union(arr1, arr2) {
	        return utils.unique(arr1.concat(arr2));
	    },

	    intersection: function intersection(arr1, arr2) {
	        return arr1.filter(function (x) {
	            return arr2.indexOf(x) !== -1;
	        });
	    },

	    defaults: function defaults(obj) {
	        for (var _len3 = arguments.length, defaultObjs = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
	            defaultObjs[_key3 - 1] = arguments[_key3];
	        }

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

	    omit: function omit(obj) {
	        for (var _len4 = arguments.length, props = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
	            props[_key4 - 1] = arguments[_key4];
	        }

	        var newObj = Object.assign({}, obj);
	        props.forEach(function (prop) {
	            delete newObj[prop];
	        });
	        return newObj;
	    },

	    memoize: function memoize(func, hasher) {
	        var memoize = function memoize(key) {
	            var cache = memoize.cache;
	            var address = String(hasher ? hasher.apply(this, arguments) : key);
	            if (!cache.hasOwnProperty(address)) {
	                cache[address] = func.apply(this, arguments);
	            }
	            return cache[address];
	        };
	        memoize.cache = {};
	        return memoize;
	    },

	    createMultiSorter: function createMultiSorter() {
	        for (var _len5 = arguments.length, sorters = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	            sorters[_key5] = arguments[_key5];
	        }

	        return function (a, b) {
	            var result = 0;
	            sorters.every(function (s) {
	                result = s(a, b);
	                return result === 0;
	            });
	            return result;
	        };
	    },

	    // TODO Remove this methods and its associated configs
	    // which are just for templating in some plugins
	    pick: function pick(object) {
	        for (var _len6 = arguments.length, props = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
	            props[_key6 - 1] = arguments[_key6];
	        }

	        var result = {};
	        if (object == null) {
	            return result;
	        }

	        return props.reduce(function (result, prop) {
	            var value = object[prop];
	            if (value) {
	                result[prop] = value;
	            }
	            return result;
	        }, {});
	    },

	    escape: function escape(string) {
	        string = string == null ? '' : String(string);
	        return testRegexp.test(string) ? string.replace(replaceRegexp, function (match) {
	            return map[match];
	        }) : string;
	    },

	    template: function template(text, settings, oldSettings) {
	        if (!settings && oldSettings) {
	            settings = oldSettings;
	        }
	        settings = utils.defaults({}, settings, templateSettings);

	        var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

	        var index = 0;
	        var source = '__p+=\'';
	        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
	            source += text.slice(index, offset).replace(escaper, function (match) {
	                return '\\' + escapes[match];
	            });
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

	        source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';

	        try {
	            var render = new Function(settings.variable || 'obj', source);
	        } catch (e) {
	            e.source = source;
	            throw e;
	        }

	        var template = function template(data) {
	            return render.call(this, data);
	        };

	        var argument = settings.variable || 'obj';
	        template.source = 'function(' + argument + '){\n' + source + '}';

	        return template;
	    }

	    // End of plugins methods

	};

	exports.utils = utils;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GenericCartesian = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _element = __webpack_require__(5);

	var _grammarRegistry = __webpack_require__(7);

	var _d3Decorators = __webpack_require__(9);

	var _utils = __webpack_require__(3);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var GenericCartesian = exports.GenericCartesian = function (_Element) {
	    _inherits(GenericCartesian, _Element);

	    function GenericCartesian(config) {
	        _classCallCheck(this, GenericCartesian);

	        var _this = _possibleConstructorReturn(this, (GenericCartesian.__proto__ || Object.getPrototypeOf(GenericCartesian)).call(this, config));

	        _this.config = config;

	        _this.config.guide = _utils.utils.defaults(_this.config.guide || {}, {
	            animationSpeed: 0,
	            enableColorToBarPosition: false
	        });

	        _this.config.guide.size = _this.config.guide.size || {};

	        var enableStack = _this.config.stack;
	        var enableColorPositioning = _this.config.guide.enableColorToBarPosition;

	        var defaultDecorators = [config.flip && _grammarRegistry.GrammarRegistry.get('flip'), enableStack && _grammarRegistry.GrammarRegistry.get('stack'), enableColorPositioning && _grammarRegistry.GrammarRegistry.get('positioningByColor')];

	        _this.decorators = (_this.config.transformRules || defaultDecorators).concat(config.transformModel || []);
	        _this.adjusters = _this.config.adjustRules || [];
	        return _this;
	    }

	    _createClass(GenericCartesian, [{
	        key: 'defineGrammarModel',
	        value: function defineGrammarModel(fnCreateScale) {
	            var _this2 = this;

	            var config = this.config;
	            this.regScale('x', fnCreateScale('pos', config.x, [0, config.options.width])).regScale('y', fnCreateScale('pos', config.y, [config.options.height, 0])).regScale('size', fnCreateScale('size', config.size, {})).regScale('color', fnCreateScale('color', config.color, {})).regScale('split', fnCreateScale('split', config.split, {})).regScale('label', fnCreateScale('label', config.label, {})).regScale('identity', fnCreateScale('identity', config.identity, {}));

	            var scaleX = this.getScale('x');
	            var scaleY = this.getScale('y');
	            var scaleSize = this.getScale('size');
	            var scaleLabel = this.getScale('label');
	            var scaleColor = this.getScale('color');
	            var scaleSplit = this.getScale('split');
	            var scaleIdentity = this.getScale('identity');

	            var ys = scaleY.domain();
	            var min = scaleY.discrete ? ys[0] : Math.max(0, Math.min.apply(Math, _toConsumableArray(ys))); // NOTE: max also can be below 0
	            var _y = scaleY.value(min) + scaleY.stepSize(min) * 0.5;
	            var _order = scaleColor.domain();
	            var delimiter = '(@taucharts@)';

	            return {
	                data: function data() {
	                    return _this2.data();
	                },
	                flip: false,
	                scaleX: scaleX,
	                scaleY: scaleY,
	                scaleSize: scaleSize,
	                scaleLabel: scaleLabel,
	                scaleColor: scaleColor,
	                scaleSplit: scaleSplit,
	                scaleIdentity: scaleIdentity,
	                color: function color(d) {
	                    return scaleColor.value(d[scaleColor.dim]);
	                },
	                label: function label(d) {
	                    return scaleLabel.value(d[scaleLabel.dim]);
	                },
	                group: function group(d) {
	                    return '' + d[scaleColor.dim] + delimiter + d[scaleSplit.dim];
	                },
	                order: function order(group) {
	                    var color = group.split(delimiter)[0];
	                    var i = _order.indexOf(color);
	                    return i < 0 ? Number.MAX_VALUE : i;
	                },
	                size: function size(d) {
	                    return scaleSize.value(d[scaleSize.dim]);
	                },
	                id: function id(row) {
	                    return scaleIdentity.value(row[scaleIdentity.dim], row);
	                },
	                xi: function xi(d) {
	                    return scaleX.value(d[scaleX.dim]);
	                },
	                yi: function yi(d) {
	                    return scaleY.value(d[scaleY.dim]);
	                },
	                y0: function y0() {
	                    return _y;
	                }
	            };
	        }
	    }, {
	        key: 'getGrammarRules',
	        value: function getGrammarRules() {
	            return this.decorators.filter(function (x) {
	                return x;
	            });
	        }
	    }, {
	        key: 'getAdjustScalesRules',
	        value: function getAdjustScalesRules() {
	            return (this.adjusters || []).filter(function (x) {
	                return x;
	            });
	        }
	    }, {
	        key: 'createScreenModel',
	        value: function createScreenModel(grammarModel) {
	            var flip = grammarModel.flip;
	            var iff = function iff(statement, yes, no) {
	                return statement ? yes : no;
	            };
	            return {
	                flip: flip,
	                id: grammarModel.id,
	                x: iff(flip, grammarModel.yi, grammarModel.xi),
	                y: iff(flip, grammarModel.xi, grammarModel.yi),
	                x0: iff(flip, grammarModel.y0, grammarModel.xi),
	                y0: iff(flip, grammarModel.xi, grammarModel.y0),
	                size: grammarModel.size,
	                group: grammarModel.group,
	                order: grammarModel.order,
	                label: grammarModel.label,
	                color: function color(d) {
	                    return grammarModel.scaleColor.toColor(grammarModel.color(d));
	                },
	                class: function _class(d) {
	                    return grammarModel.scaleColor.toClass(grammarModel.color(d));
	                },
	                model: grammarModel,
	                toFibers: function toFibers() {
	                    var data = grammarModel.data();
	                    var groups = _utils.utils.groupBy(data, grammarModel.group);
	                    return Object.keys(groups).sort(function (a, b) {
	                        return grammarModel.order(a) - grammarModel.order(b);
	                    }).reduce(function (memo, k) {
	                        return memo.concat([groups[k]]);
	                    }, []);
	                }
	            };
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames() {

	            var self = this;

	            var options = this.config.options;

	            var round = function round(x, decimals) {
	                var kRound = Math.pow(10, decimals);
	                return Math.round(kRound * x) / kRound;
	            };
	            var size = function size(d) {
	                return round(self.screenModel.size(d) / 2, 4);
	            };
	            var createUpdateFunc = _d3Decorators.d3_animationInterceptor;

	            var drawPart = function drawPart(that, id, props) {
	                var speed = self.config.guide.animationSpeed;
	                var part = that.selectAll('.' + id).data(function (row) {
	                    return [row];
	                }, self.screenModel.id);
	                part.exit().call(createUpdateFunc(speed, null, { width: 0 }, function (node) {
	                    return _d2.default.select(node).remove();
	                }));
	                part.call(createUpdateFunc(speed, null, props));
	                part.enter().append('rect').style('stroke-width', 0).call(createUpdateFunc(speed, { width: 0 }, props));
	            };

	            var flip = this.config.flip;
	            var x = flip ? 'y' : 'x';
	            var y = flip ? 'x' : 'y';
	            var y0 = flip ? 'x0' : 'y0';
	            var w = flip ? 'height' : 'width';
	            var h = flip ? 'width' : 'height';
	            var drawElement = function drawElement() {
	                var _drawPart, _drawPart2, _drawPart3;

	                drawPart(this, 'lvl-top', (_drawPart = {}, _defineProperty(_drawPart, w, function (d) {
	                    return size(d);
	                }), _defineProperty(_drawPart, h, 1), _defineProperty(_drawPart, x, function (d) {
	                    return self.screenModel[x](d) - size(d) / 2;
	                }), _defineProperty(_drawPart, y, function (d) {
	                    return self.screenModel[y](d);
	                }), _defineProperty(_drawPart, 'fill', function fill(d) {
	                    return self.screenModel.color(d);
	                }), _defineProperty(_drawPart, 'class', function _class(d) {
	                    return 'lvl-top ' + self.screenModel.class(d);
	                }), _drawPart));
	                drawPart(this, 'lvl-btm', (_drawPart2 = {}, _defineProperty(_drawPart2, w, function (d) {
	                    return size(d);
	                }), _defineProperty(_drawPart2, h, 1), _defineProperty(_drawPart2, x, function (d) {
	                    return self.screenModel[x](d) - size(d) / 2;
	                }), _defineProperty(_drawPart2, y, function (d) {
	                    return self.screenModel[y0](d);
	                }), _defineProperty(_drawPart2, 'fill', function fill(d) {
	                    return self.screenModel.color(d);
	                }), _defineProperty(_drawPart2, 'class', function _class(d) {
	                    return 'lvl-btm ' + self.screenModel.class(d);
	                }), _drawPart2));
	                drawPart(this, 'lvl-link', (_drawPart3 = {}, _defineProperty(_drawPart3, w, 0.5), _defineProperty(_drawPart3, h, function (d) {
	                    return Math.abs(self.screenModel[y](d) - self.screenModel[y0](d));
	                }), _defineProperty(_drawPart3, x, function (d) {
	                    return self.screenModel[x](d) - 0.25;
	                }), _defineProperty(_drawPart3, y, function (d) {
	                    return Math.min(self.screenModel[y](d), self.screenModel[y0](d));
	                }), _defineProperty(_drawPart3, 'fill', function fill(d) {
	                    return self.screenModel.color(d);
	                }), _defineProperty(_drawPart3, 'class', function _class(d) {
	                    return 'lvl-link ' + self.screenModel.class(d);
	                }), _drawPart3));
	            };

	            var updateGroups = function updateGroups() {

	                this.attr('class', 'frame-id-' + self.config.uid).call(function () {
	                    var generic = this.selectAll('.generic').data(function (fiber) {
	                        return fiber;
	                    }, self.screenModel.id);
	                    generic.exit().remove();
	                    generic.call(drawElement);
	                    generic.enter().append('g').attr('class', 'generic').call(drawElement);
	                });
	            };

	            var groups = _utils.utils.groupBy(this.data(), self.screenModel.group);
	            var fibers = Object.keys(groups).sort(function (a, b) {
	                return self.screenModel.order(a) - self.screenModel.order(b);
	            }).reduce(function (memo, k) {
	                return memo.concat([groups[k]]);
	            }, []);

	            var frameGroups = options.container.selectAll('.frame-id-' + self.config.uid).data(fibers);
	            frameGroups.exit().remove();
	            frameGroups.call(updateGroups);
	            frameGroups.enter().append('g').call(updateGroups);
	        }
	    }]);

	    return GenericCartesian;
	}(_element.Element);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Element = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _event = __webpack_require__(6);

	var _utils = __webpack_require__(3);

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

	        var _this = _possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, config));

	        _this.screenModel = null;
	        _this._elementNameSpace = config.namespace || 'default';
	        _this._elementScalesHub = {};
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
	            var dataInterceptor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {
	                return x;
	            };
	            var eventInterceptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x) {
	                return x;
	            };

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
	                limit: 'requestAnimationFrame'
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
	        key: 'allocateRect',
	        value: function allocateRect() {
	            return {
	                left: 0,
	                top: 0,
	                width: 0,
	                height: 0
	            };
	        }

	        /* eslint-disable */

	    }, {
	        key: 'defineGrammarModel',
	        value: function defineGrammarModel(fnCreateScale) {
	            return {};
	        }
	    }, {
	        key: 'getGrammarRules',
	        value: function getGrammarRules() {
	            return [];
	        }
	    }, {
	        key: 'getAdjustScalesRules',
	        value: function getAdjustScalesRules() {
	            return [];
	        }
	    }, {
	        key: 'createScreenModel',
	        value: function createScreenModel(grammarModel) {
	            // return nothing
	        }
	    }, {
	        key: 'getClosestElement',
	        value: function getClosestElement(x, y) {
	            return null;
	        }
	        /* eslint-enable */

	    }, {
	        key: 'addInteraction',
	        value: function addInteraction() {
	            // do nothing
	        }
	    }, {
	        key: 'draw',
	        value: function draw() {
	            // TODO: expose to explicit call everywhere
	            this.config.options.container = this.config.options.slot(this.config.uid);
	            this.drawFrames(this.config.frames);
	        }
	    }, {
	        key: 'data',
	        value: function data() {
	            return this.config.frames.reduce(function (data, frame) {
	                return data.concat(frame.part());
	            }, []);
	        }
	    }, {
	        key: 'node',
	        value: function node() {
	            return this;
	        }
	    }]);

	    return Element;
	}(_event.Emitter);

/***/ },
/* 6 */
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GrammarRegistry = undefined;

	var _utils = __webpack_require__(3);

	var _error = __webpack_require__(8);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var rules = {};
	var GrammarRegistry = {
	    get: function get(name) {
	        return rules[name];
	    },
	    reg: function reg(name, func) {
	        rules[name] = func;
	        return this;
	    }
	};

	GrammarRegistry.reg('identity', function () {
	    return {};
	}).reg('flip', function (model) {
	    var baseScale = model.scaleY;
	    var valsScale = model.scaleX;

	    var k = -0.5;
	    var ys = valsScale.domain();
	    var min = valsScale.discrete ? ys[0] : Math.max(0, Math.min.apply(Math, _toConsumableArray(ys))); // NOTE: max also can be below 0
	    var _y = valsScale.value(min) + valsScale.stepSize(min) * k;

	    return {
	        flip: true,
	        scaleX: baseScale,
	        scaleY: valsScale,
	        xi: function xi(d) {
	            return baseScale.value(d[baseScale.dim]);
	        },
	        yi: function yi(d) {
	            return valsScale.value(d[valsScale.dim]);
	        },
	        y0: function y0() {
	            return _y;
	        }
	    };
	}).reg('positioningByColor', function (model) {

	    var method = model.scaleX.discrete ? function (model) {
	        var dataSource = model.data();
	        var xColors = dataSource.reduce(function (map, row) {
	            var x = row[model.scaleX.dim];
	            var color = row[model.scaleColor.dim];
	            if (!(x in map)) {
	                map[x] = [];
	            }
	            if (map[x].indexOf(color) < 0) {
	                map[x].push(color);
	            }
	            return map;
	        }, {});

	        var baseScale = model.scaleX;
	        var scaleColor = model.scaleColor;
	        var categories = scaleColor.discrete ? scaleColor.domain() : scaleColor.originalSeries().sort(function (a, b) {
	            return a - b;
	        });
	        var categoriesCount = categories.length || 1;
	        var space = function space(d) {
	            return baseScale.stepSize(d[baseScale.dim]) * (categoriesCount / (1 + categoriesCount));
	        };

	        return {
	            xi: function xi(d) {
	                var x = d[model.scaleX.dim];
	                var colors = xColors[x] || [d[model.scaleColor.dim]];
	                var total = colors.length;
	                var index = colors.indexOf(d[model.scaleColor.dim]);
	                var availableSpace = space(d);
	                var middleStep = availableSpace / (categoriesCount + 1);
	                var absTickStart = model.xi(d) - (total + 1) * middleStep / 2;
	                var relSegmStart = (1 + index) * middleStep;
	                return absTickStart + relSegmStart;
	            }
	        };
	    } : function () {
	        return {};
	    };

	    return method(model);
	}).reg('groupOrderByAvg', function (model) {

	    var dataSource = model.data();

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

	    var _order = Object.keys(groups).map(function (k) {
	        return [k, avg(groups[k])];
	    }).sort(function (a, b) {
	        return a[1] - b[1];
	    }).map(function (r) {
	        return r[0];
	    });

	    return {
	        order: function order(group) {
	            var i = _order.indexOf(group);
	            return i < 0 ? Number.MAX_VALUE : i;
	        }
	    };
	}).reg('stack', function (model) {

	    var dataSource = model.data();

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

	            var state = y >= 0 ? totalState.positive : totalState.negative;

	            var prevStack = state[x] || 0;
	            var nextStack = prevStack + y;
	            state[x] = nextStack;

	            return { nextStack: nextStack, prevStack: prevStack };
	        };
	    };

	    var stackYi = createFnStack({ positive: {}, negative: {} });
	    var stackY0 = createFnStack({ positive: {}, negative: {} });

	    var memoize = function memoize(fn) {
	        return _utils.utils.memoize(fn, model.id);
	    };

	    var trackedMinY = Number.MAX_VALUE;
	    var trackedMaxY = Number.MIN_VALUE;
	    var trackAndEval = function trackAndEval(y) {
	        trackedMinY = y < trackedMinY ? y : trackedMinY;
	        trackedMaxY = y > trackedMaxY ? y : trackedMaxY;
	        return yScale.value(y);
	    };

	    var nextYi = memoize(function (d) {
	        return trackAndEval(stackYi(d).nextStack);
	    });
	    var nextY0 = memoize(function (d) {
	        return trackAndEval(stackY0(d).prevStack);
	    });
	    var nextGroup = function nextGroup(row) {
	        return model.group(row) + '/' + (row[yScale.dim] >= 0 ? 1 : -1);
	    };

	    var groups = _utils.utils.groupBy(dataSource, nextGroup);
	    var nextData = Object.keys(groups).sort(function (a, b) {
	        return model.order(a) - model.order(b);
	    }).reduce(function (memo, k) {
	        return memo.concat(groups[k]);
	    }, []);

	    nextData.forEach(function (row) {
	        nextYi(row);
	        nextY0(row);
	    });

	    yScale.fixup(function (yScaleConfig) {

	        var newConf = {};

	        if (!yScaleConfig.hasOwnProperty('max') || yScaleConfig.max < trackedMaxY) {
	            newConf.max = trackedMaxY;
	        }

	        if (!yScaleConfig.hasOwnProperty('min') || yScaleConfig.min > trackedMinY) {
	            newConf.min = trackedMinY;
	        }

	        return newConf;
	    });

	    return {
	        group: nextGroup,
	        data: function data() {
	            return nextData;
	        },
	        yi: nextYi,
	        y0: nextY0
	    };
	}).reg('size_distribute_evenly', function (model, _ref) {
	    var minLimit = _ref.minLimit,
	        maxLimit = _ref.maxLimit,
	        defMin = _ref.defMin,
	        defMax = _ref.defMax;


	    var dataSource = model.data();

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

	    return {};
	}).reg('adjustStaticSizeScale', function (model, _ref2) {
	    var minLimit = _ref2.minLimit,
	        maxLimit = _ref2.maxLimit,
	        defMin = _ref2.defMin,
	        defMax = _ref2.defMax;


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

	    return {};
	}).reg('adjustSigmaSizeScale', function (model, _ref3) {
	    var minLimit = _ref3.minLimit,
	        maxLimit = _ref3.maxLimit,
	        defMin = _ref3.defMin,
	        defMax = _ref3.defMax;


	    var dataSource = model.data();

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

	    return {};
	}).reg('avoidScalesOverflow', function (model, _ref4) {
	    var sizeDirection = _ref4.sizeDirection;


	    // TODO: Don't ignore logarithmic scale,
	    // add scale method for extending it's domain.
	    var shouldIgnoreScale = function shouldIgnoreScale(scale, direction) {
	        return !scale || scale.discrete || scale.scaleType === 'logarithmic' || sizeDirection.indexOf(direction) < 0;
	    };

	    var ignoreX = shouldIgnoreScale(model.scaleX, 'x');
	    var ignoreY = shouldIgnoreScale(model.scaleY, 'y');

	    if (ignoreX && ignoreY) {
	        return {};
	    }

	    var plannedMinSize;
	    var plannedMaxSize;
	    model.scaleSize.fixup(function (prev) {
	        plannedMinSize = prev.minSize;
	        plannedMaxSize = prev.maxSize;
	        return prev;
	    });

	    var border = model.data().reduce(function (memo, row) {
	        var s = model.size(row);
	        var r = (s >= plannedMinSize ? s : plannedMinSize + s * (plannedMaxSize - plannedMinSize)) / 2;
	        var x, y;
	        if (!ignoreX) {
	            x = model.xi(row);
	            memo.left = Math.min(memo.left, x - r);
	            memo.right = Math.max(memo.right, x + r);
	        }
	        if (!ignoreY) {
	            y = model.yi(row);
	            memo.top = Math.min(memo.top, y - r);
	            memo.bottom = Math.max(memo.bottom, y + r);
	        }
	        return memo;
	    }, {
	        top: Number.MAX_VALUE,
	        right: -Number.MAX_VALUE,
	        bottom: -Number.MAX_VALUE,
	        left: Number.MAX_VALUE
	    });

	    var fixScale = function fixScale(scale, start, end, flip) {

	        var domain = scale.domain();
	        var length = Math.abs(scale.value(domain[1]) - scale.value(domain[0]));
	        var koeff = (domain[1] - domain[0]) / length;

	        var _startPad = Math.max(0, -start);
	        var _endPad = Math.max(0, end - length);

	        var startPad = model.flip ? _endPad : _startPad;
	        var endPad = model.flip ? _startPad : _endPad;

	        var startVal = Number(domain[0]) - (flip ? endPad : startPad) * koeff;
	        var endVal = Number(domain[1]) + (flip ? startPad : endPad) * koeff;

	        scale.fixup(function (prev) {
	            var next = {};
	            if (!prev.fixed) {
	                next.fixed = true;
	                next.min = startVal;
	                next.max = endVal;
	                next.nice = false;
	            } else {
	                next.min = prev.min > startVal ? next.min : prev.min;
	                next.max = prev.max < endVal ? next.max : prev.max;
	            }

	            return next;
	        });

	        return length / (startPad + length + endPad);
	    };

	    var kx = ignoreX ? 1 : fixScale(model.scaleX, border.left, border.right, false);
	    var ky = ignoreY ? 1 : fixScale(model.scaleY, border.top, border.bottom, true);

	    var linearlyScaledMinSize = Math.min(plannedMinSize * kx, plannedMinSize * ky);
	    var linearlyScaledMaxSize = Math.min(plannedMaxSize * kx, plannedMaxSize * ky);
	    model.scaleSize.fixup(function () {
	        return {
	            minSize: linearlyScaledMinSize,
	            maxSize: linearlyScaledMaxSize
	        };
	    });

	    return {};
	});

	exports.GrammarRegistry = GrammarRegistry;

/***/ },
/* 8 */
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

	        var _this = _possibleConstructorReturn(this, (TauChartError.__proto__ || Object.getPrototypeOf(TauChartError)).call(this));

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
	    UNKNOWN_UNIT_TYPE: 'UNKNOWN_UNIT_TYPE',
	    INVALID_LOG_DOMAIN: 'INVALID_LOG_DOMAIN'
	};

	exports.TauChartError = TauChartError;
	exports.errorCodes = errorCodes;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.cutText = exports.wrapText = exports.d3_selectAllImmediate = exports.d3_transition = exports.d3_decorator_avoidLabelsCollisions = exports.d3_decorator_prettify_categorical_axis_ticks = exports.d3_decorator_highlightZeroTick = exports.d3_decorator_fixEdgeAxisTicksOverflow = exports.d3_decorator_fixHorizontalAxisTicksOverflow = exports.d3_decorator_fix_axis_start_line = exports.d3_decorator_prettify_axis_label = exports.d3_decorator_wrap_tick_label = exports.d3_createPathTween = exports.d3_animationInterceptor = undefined;

	var _utils = __webpack_require__(3);

	var _utilsDom = __webpack_require__(1);

	var _utilsDraw = __webpack_require__(10);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _pathPoints = __webpack_require__(11);

	var _pathPoints2 = _interopRequireDefault(_pathPoints);

	var _interpolatorsRegistry = __webpack_require__(13);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var d3getComputedTextLength = function d3getComputedTextLength() {
	    return _utils.utils.memoize(function (d3Text) {
	        return d3Text.node().getComputedTextLength();
	    }, function (d3Text) {
	        return d3Text.node().textContent.length;
	    });
	};

	var cutText = function cutText(textString, getScaleStepSize, getComputedTextLength) {

	    getComputedTextLength = getComputedTextLength || d3getComputedTextLength();

	    textString.each(function () {

	        var tickNode = _d2.default.select(this.parentNode);
	        var tickData = tickNode.data()[0];
	        var stepSize = getScaleStepSize(tickData);

	        var textD3 = _d2.default.select(this);
	        var tokens = textD3.text().split(/\s+/);

	        var stop = false;
	        var parts = tokens.reduce(function (memo, t, i) {

	            if (stop) {
	                return memo;
	            }

	            var text = i > 0 ? [memo, t].join(' ') : t;
	            var len = getComputedTextLength(textD3.text(text));
	            if (len < stepSize) {
	                memo = text;
	            } else {
	                var available = Math.floor(stepSize / len * text.length);
	                memo = text.substr(0, available - 4) + '...';
	                stop = true;
	            }

	            return memo;
	        }, '');

	        textD3.text(parts);
	    });
	};

	var wrapText = function wrapText(textNode, getScaleStepSize, linesLimit, tickLabelFontHeight, isY, getComputedTextLength) {

	    getComputedTextLength = getComputedTextLength || d3getComputedTextLength();

	    var addLine = function addLine(targetD3, text, lineHeight, x, y, dy, lineNumber) {
	        var dyNew = lineNumber * lineHeight + dy;
	        return targetD3.append('tspan').attr('x', x).attr('y', y).attr('dy', dyNew + 'em').text(text);
	    };

	    textNode.each(function () {

	        var tickNode = _d2.default.select(this.parentNode);
	        var tickData = tickNode.data()[0];
	        var stepSize = getScaleStepSize(tickData);

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
	            var over = tLen > stepSize;

	            if (over && isLimit) {
	                var available = Math.floor(stepSize / tLen * text.length);
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

	/**
	 * Moves ticks from categories middle to categories top.
	 */
	var d3_decorator_prettify_categorical_axis_ticks = function d3_decorator_prettify_categorical_axis_ticks(nodeAxis, logicalScale, isHorizontal, animationSpeed) {

	    nodeAxis.selectAll('.tick').each(function (tickData) {
	        // NOTE: Skip ticks removed by D3 axis call during transition.
	        if (logicalScale(tickData)) {

	            var tickNode = _d2.default.select(this);

	            var setAttr = function setAttr(selection) {
	                var _selection$select$att;

	                var tickCoord = logicalScale(tickData);
	                var tx = isHorizontal ? tickCoord : 0;
	                var ty = isHorizontal ? 0 : tickCoord;
	                selection.attr('transform', 'translate(' + tx + ',' + ty + ')');

	                var offset = logicalScale.stepSize(tickData) * 0.5;
	                var key = isHorizontal ? 'x' : 'y';
	                var val = isHorizontal ? offset : -offset;
	                selection.select('line').attr((_selection$select$att = {}, _defineProperty(_selection$select$att, key + '1', val), _defineProperty(_selection$select$att, key + '2', val), _selection$select$att));
	            };

	            if (!tickNode.classed('tau-enter')) {
	                tickNode.call(setAttr);
	                tickNode.classed('tau-enter', true);
	            }

	            d3_transition(tickNode, animationSpeed).call(setAttr);
	        }
	    });
	};

	var d3_decorator_fixHorizontalAxisTicksOverflow = function d3_decorator_fixHorizontalAxisTicksOverflow(axisNode, activeTicks) {

	    var isDate = activeTicks.length && activeTicks[0] instanceof Date;
	    if (isDate) {
	        activeTicks = activeTicks.map(function (d) {
	            return Number(d);
	        });
	    }

	    var timeTicks = axisNode.selectAll('.tick').filter(function (d) {
	        return activeTicks.indexOf(isDate ? Number(d) : d) >= 0;
	    })[0];
	    if (timeTicks.length < 2) {
	        return;
	    }

	    var tick0 = parseFloat(timeTicks[0].attributes.transform.value.replace('translate(', ''));
	    var tick1 = parseFloat(timeTicks[1].attributes.transform.value.replace('translate(', ''));

	    var tickStep = tick1 - tick0;

	    var maxTextLn = 0;
	    var iMaxTexts = -1;
	    var timeTexts = axisNode.selectAll('.tick text').filter(function (d) {
	        return activeTicks.indexOf(isDate ? Number(d) : d) >= 0;
	    })[0];
	    timeTexts.forEach(function (textNode, i) {
	        var innerHTML = textNode.textContent || '';
	        var textLength = innerHTML.length;
	        if (textLength > maxTextLn) {
	            maxTextLn = textLength;
	            iMaxTexts = i;
	        }
	    });

	    var hasOverflow = false;
	    if (iMaxTexts >= 0) {
	        var rect = timeTexts[iMaxTexts].getBoundingClientRect();
	        hasOverflow = tickStep - rect.width < 8; // 2px from each side
	    }
	    axisNode.classed({ 'graphical-report__d3-time-overflown': hasOverflow });
	};

	var d3_decorator_fixEdgeAxisTicksOverflow = function d3_decorator_fixEdgeAxisTicksOverflow(axisNode, activeTicks) {

	    activeTicks = activeTicks.map(function (d) {
	        return Number(d);
	    });
	    var texts = axisNode.selectAll('.tick text').filter(function (d) {
	        return activeTicks.indexOf(Number(d)) >= 0;
	    })[0];
	    if (texts.length === 0) {
	        return;
	    }

	    var svg = axisNode.node();
	    while (svg.tagName !== 'svg') {
	        svg = svg.parentNode;
	    }
	    var svgRect = svg.getBoundingClientRect();

	    texts.forEach(function (n) {
	        var t = _d2.default.select(n);
	        t.attr('dx', 0);
	    });

	    var fixText = function fixText(node, dir) {
	        var d3Node = _d2.default.select(node);
	        var rect = node.getBoundingClientRect();
	        var side = dir > 0 ? 'right' : 'left';
	        var diff = dir * (rect[side] - svgRect[side]);
	        d3Node.attr('dx', diff > 0 ? -dir * diff : 0);
	    };
	    fixText(texts[0], -1);
	    fixText(texts[texts.length - 1], 1);
	};

	/**
	 * Adds extra tick to axis container.
	 */
	var d3_decorator_fix_axis_start_line = function d3_decorator_fix_axis_start_line(axisNode, isHorizontal, width, height, animationSpeed) {

	    var setTransform = function setTransform(selection) {
	        selection.attr('transform', _utilsDraw.utilsDraw.translate(0, isHorizontal ? height : 0));
	        return selection;
	    };

	    var setLineSize = function setLineSize(selection) {
	        if (isHorizontal) {
	            selection.attr('x2', width);
	        } else {
	            selection.attr('y2', height);
	        }
	        return selection;
	    };

	    var tickClass = 'tau-extra' + (isHorizontal ? 'Y' : 'X') + 'Tick';
	    var extraTick = _utilsDom.utilsDom.selectOrAppend(axisNode, 'g.' + tickClass);
	    var extraLine = _utilsDom.utilsDom.selectOrAppend(extraTick, 'line');
	    if (!extraTick.node().hasAttribute('opacity')) {
	        extraTick.attr('opacity', 1e-6);
	    }
	    d3_transition(extraTick, animationSpeed).call(setTransform);
	    d3_transition(extraLine, animationSpeed).call(setLineSize);
	};

	var d3_decorator_prettify_axis_label = function d3_decorator_prettify_axis_label(axisNode, guide, isHorizontal, size, animationSpeed) {

	    var koeff = isHorizontal ? 1 : -1;
	    var labelTextNode = _utilsDom.utilsDom.selectOrAppend(axisNode, 'text.label').attr('class', _utilsDom.utilsDom.classes('label', guide.cssClass)).attr('transform', _utilsDraw.utilsDraw.rotate(guide.rotate));

	    var labelTextTrans = d3_transition(labelTextNode, animationSpeed).attr('x', koeff * guide.size * 0.5).attr('y', koeff * guide.padding).style('text-anchor', guide.textAnchor);

	    var delimiter = ' \u2192 ';
	    var texts = function (parts) {
	        var result = [];
	        for (var i = 0; i < parts.length - 1; i++) {
	            result.push(parts[i], delimiter);
	        }
	        result.push(parts[i]);
	        return result;
	    }(guide.text.split(delimiter));

	    var tspans = labelTextNode.selectAll('tspan').data(texts);
	    tspans.enter().append('tspan').attr('class', function (d, i) {
	        return i % 2 ? 'label-token-delimiter label-token-delimiter-' + i : 'label-token label-token-' + i;
	    }).text(function (d) {
	        return d;
	    });
	    tspans.exit().remove();

	    if (['left', 'right'].indexOf(guide.dock) >= 0) {
	        var labelX = {
	            left: [-size, 0],
	            right: [0, size]
	        };
	        labelTextTrans.attr('x', labelX[guide.dock][Number(isHorizontal)]);
	    }
	};

	var d3_decorator_wrap_tick_label = function d3_decorator_wrap_tick_label(nodeScale, animationSpeed, guide, isHorizontal, logicalScale) {

	    var angle = _utils.utils.normalizeAngle(guide.rotate);

	    var tick = nodeScale.selectAll('.tick text').attr('transform', _utilsDraw.utilsDraw.rotate(angle)).style('text-anchor', guide.textAnchor);

	    // TODO: Improve indent calculation for ratated text.
	    var segment = Math.abs(angle / 90);
	    if (segment % 2 > 0) {
	        var kRot = angle < 180 ? 1 : -1;
	        var k = isHorizontal ? 0.5 : -2;
	        var sign = guide.scaleOrient === 'top' || guide.scaleOrient === 'left' ? -1 : 1;
	        var dy = k * (guide.scaleOrient === 'bottom' || guide.scaleOrient === 'top' ? sign < 0 ? 0 : 0.71 : 0.32);

	        var texts = nodeScale.selectAll('.tick text');
	        var attrs = {
	            x: 9 * kRot,
	            y: 0,
	            dx: isHorizontal ? null : dy + 'em',
	            dy: dy + 'em'
	        };

	        // NOTE: Override d3 axis transition.
	        texts.transition();
	        texts.attr(attrs);
	        d3_transition(texts, animationSpeed, 'axisTransition').attr(attrs);
	    }

	    var limitFunc = function limitFunc(d) {
	        return Math.max(logicalScale.stepSize(d), guide.tickFormatWordWrapLimit);
	    };

	    if (guide.tickFormatWordWrap) {
	        tick.call(wrapText, limitFunc, guide.tickFormatWordWrapLines, guide.tickFontHeight, !isHorizontal);
	    } else {
	        tick.call(cutText, limitFunc, d3getComputedTextLength());
	    }
	};

	var d3_decorator_avoidLabelsCollisions = function d3_decorator_avoidLabelsCollisions(nodeScale, isHorizontal, activeTicks) {
	    var isDate = activeTicks.length && activeTicks[0] instanceof Date;
	    if (isDate) {
	        activeTicks = activeTicks.map(function (d) {
	            return Number(d);
	        });
	    }
	    var textOffsetStep = 11;
	    var refOffsetStart = isHorizontal ? -10 : 20;
	    var translateParam = isHorizontal ? 0 : 1;
	    var directionKoeff = isHorizontal ? 1 : -1;
	    var layoutModel = [];
	    nodeScale.selectAll('.tick').filter(function (d) {
	        return activeTicks.indexOf(isDate ? Number(d) : d) >= 0;
	    }).each(function () {
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

	            var dy = curr.l * textOffsetStep; // -1 | 0 | +1
	            var newY = parseFloat(curr.textRef.attr('y')) + dy;
	            var tx = isHorizontal ? 0 : dy;
	            var ty = isHorizontal ? dy : 0;
	            var tr = function (transform) {
	                var rotate = 0;
	                if (!transform) {
	                    return rotate;
	                }
	                var rs = transform.indexOf('rotate(');
	                if (rs >= 0) {
	                    var re = transform.indexOf(')', rs + 7);
	                    var rotateStr = transform.substring(rs + 7, re);
	                    rotate = parseFloat(rotateStr.trim());
	                }
	                return rotate;
	            }(curr.textRef.attr('transform'));

	            curr.textRef.text(function (d, i) {
	                return i === 0 ? text : '';
	            }).attr('transform', 'translate(' + tx + ',' + ty + ') rotate(' + tr + ')');

	            var attrs = {
	                x1: 0,
	                x2: 0,
	                y1: newY + (isHorizontal ? -1 : 5),
	                y2: refOffsetStart
	            };

	            if (!isHorizontal) {
	                attrs.transform = 'rotate(-90)';
	            }

	            _utilsDom.utilsDom.selectOrAppend(curr.tickRef, 'line.label-ref').attr(attrs);
	        } else {
	            curr.tickRef.selectAll('line.label-ref').remove();
	        }

	        return curr;
	    });
	};

	var d3_decorator_highlightZeroTick = function d3_decorator_highlightZeroTick(axisNode, scale) {
	    var ticks = scale.ticks();
	    var domain = scale.domain();
	    var last = ticks.length - 1;
	    var shouldHighlightZero = ticks.length > 1 && domain[0] * domain[1] < 0 && -domain[0] > (ticks[1] - ticks[0]) / 2 && domain[1] > (ticks[last] - ticks[last - 1]) / 2;
	    axisNode.selectAll('.tick').classed('zero-tick', function (d) {
	        return d === 0 && shouldHighlightZero;
	    });
	};

	var d3_transition = function d3_transition(selection, animationSpeed, nameSpace) {
	    if (animationSpeed > 0) {
	        selection = selection.transition(nameSpace).duration(animationSpeed);
	        selection.attr = d3_transition_attr;
	    }
	    selection.onTransitionEnd = function (callback) {
	        d3_add_transition_end_listener(this, callback);
	        return this;
	    };
	    return selection;
	};

	// TODO: Getting attribute value may be possible in D3 v4:
	// http://stackoverflow.com/a/39024812/4137472
	// so it will be possible to get future attribute value.
	var d3_transition_attr = function d3_transition_attr(keyOrMap, value) {
	    var d3AttrResult = _d2.default.transition.prototype.attr.apply(this, arguments);

	    if (arguments.length === 0) {
	        throw new Error('Unexpected `transition().attr()` arguments.');
	    }
	    var attrs;
	    if (arguments.length === 1) {
	        attrs = keyOrMap;
	    } else if (arguments.length > 1) {
	        attrs = _defineProperty({}, keyOrMap, value);
	    }

	    // Store transitioned attributes values
	    // until transition ends.
	    var store = '__transitionAttrs__';
	    var idStore = '__lastTransitions__';
	    var id = getTransitionAttrId();
	    this.each(function () {
	        var _this = this;

	        var newAttrs = {};
	        for (var key in attrs) {
	            if (typeof attrs[key] === 'function') {
	                newAttrs[key] = attrs[key].apply(this, arguments);
	            } else {
	                newAttrs[key] = attrs[key];
	            }
	        }
	        this[store] = Object.assign(this[store] || {}, newAttrs);

	        // NOTE: As far as d3 `interrupt` event is called asynchronously,
	        // we have to store ID to prevent removing attribute value from store,
	        // when new transition is applied for the same attribute.
	        if (!this[store][idStore]) {
	            Object.defineProperty(this[store], idStore, { value: {} });
	        }
	        Object.keys(newAttrs).forEach(function (key) {
	            return _this[store][idStore][key] = id;
	        });
	    });
	    var onTransitionEnd = function onTransitionEnd() {
	        var _this2 = this;

	        if (this[store]) {
	            Object.keys(attrs).filter(function (k) {
	                return _this2[store][idStore][k] === id;
	            }).forEach(function (k) {
	                return delete _this2[store][k];
	            });
	            if (Object.keys(this[store]).length === 0) {
	                delete this[store];
	            }
	        }
	    };
	    this.each('interrupt.' + id, onTransitionEnd);
	    this.each('end.' + id, onTransitionEnd);

	    return d3AttrResult;
	};
	var transitionsCounter = 0;
	var getTransitionAttrId = function getTransitionAttrId() {
	    return ++transitionsCounter;
	};

	var d3_add_transition_end_listener = function d3_add_transition_end_listener(selection, callback) {
	    if (!_d2.default.transition.prototype.isPrototypeOf(selection) || selection.empty()) {
	        // If selection is not transition or empty,
	        // execute callback immediately.
	        callback.call(null, selection);
	        return;
	    }
	    var t = selection.size();
	    var onTransitionEnd = function onTransitionEnd() {
	        t--;
	        if (t === 0) {
	            callback.call(null, selection);
	        }
	    };
	    selection.each('interrupt.d3_on_transition_end', onTransitionEnd);
	    selection.each('end.d3_on_transition_end', onTransitionEnd);
	    return selection;
	};

	var d3_animationInterceptor = function d3_animationInterceptor(speed, initAttrs, doneAttrs, afterUpdate) {

	    var xAfterUpdate = afterUpdate || function (x) {
	        return x;
	    };
	    var afterUpdateIterator = function afterUpdateIterator() {
	        xAfterUpdate(this);
	    };

	    return function () {

	        var flow = this;

	        if (initAttrs) {
	            flow = flow.attr(_utils.utils.defaults(initAttrs, doneAttrs));
	        }

	        flow = d3_transition(flow, speed);

	        flow = flow.attr(doneAttrs);

	        if (speed > 0) {
	            flow.each('end.d3_animationInterceptor', afterUpdateIterator);
	        } else {
	            flow.each(afterUpdateIterator);
	        }

	        return flow;
	    };
	};

	var d3_selectAllImmediate = function d3_selectAllImmediate(container, selector) {
	    var node = container.node();
	    return container.selectAll(selector).filter(function () {
	        return this.parentNode === node;
	    });
	};

	var d3_createPathTween = function d3_createPathTween(attr, pathStringBuilder, pointConvertors, idGetter) {
	    var interpolationType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'linear';

	    var pointStore = '__pathPoints__';

	    return function (data) {
	        var _this3 = this;

	        if (!this[pointStore]) {
	            this[pointStore] = pointConvertors.map(function () {
	                return [];
	            });
	        }

	        var frames = pointConvertors.map(function (convertor, i) {
	            var points = _utils.utils.unique(data, idGetter).map(convertor);
	            var interpolateLine = (0, _interpolatorsRegistry.getLineInterpolator)(interpolationType) || (0, _interpolatorsRegistry.getLineInterpolator)('linear');
	            var pointsTo = interpolateLine(points);
	            var pointsFrom = _this3[pointStore][i];

	            var interpolate = (0, _pathPoints2.default)(pointsFrom, pointsTo, (0, _interpolatorsRegistry.getInterpolatorSplineType)(interpolationType));

	            return {
	                pointsFrom: pointsFrom,
	                pointsTo: pointsTo,
	                interpolate: interpolate
	            };
	        });

	        return function (t) {
	            if (t === 0) {
	                var pointsFrom = frames.map(function (f) {
	                    return f.pointsFrom;
	                });
	                return pathStringBuilder.apply(undefined, _toConsumableArray(pointsFrom));
	            }
	            if (t === 1) {
	                var pointsTo = frames.map(function (f) {
	                    return f.pointsTo;
	                });
	                _this3[pointStore] = pointsTo;
	                return pathStringBuilder.apply(undefined, _toConsumableArray(pointsTo));
	            }

	            var intermediate = frames.map(function (f) {
	                return f.interpolate(t);
	            });

	            // Save intermediate points to be able
	            // to continue transition after interrupt
	            _this3[pointStore] = intermediate;

	            return pathStringBuilder.apply(undefined, _toConsumableArray(intermediate));
	        };
	    };
	};

	exports.d3_animationInterceptor = d3_animationInterceptor;
	exports.d3_createPathTween = d3_createPathTween;
	exports.d3_decorator_wrap_tick_label = d3_decorator_wrap_tick_label;
	exports.d3_decorator_prettify_axis_label = d3_decorator_prettify_axis_label;
	exports.d3_decorator_fix_axis_start_line = d3_decorator_fix_axis_start_line;
	exports.d3_decorator_fixHorizontalAxisTicksOverflow = d3_decorator_fixHorizontalAxisTicksOverflow;
	exports.d3_decorator_fixEdgeAxisTicksOverflow = d3_decorator_fixEdgeAxisTicksOverflow;
	exports.d3_decorator_highlightZeroTick = d3_decorator_highlightZeroTick;
	exports.d3_decorator_prettify_categorical_axis_ticks = d3_decorator_prettify_categorical_axis_ticks;
	exports.d3_decorator_avoidLabelsCollisions = d3_decorator_avoidLabelsCollisions;
	exports.d3_transition = d3_transition;
	exports.d3_selectAllImmediate = d3_selectAllImmediate;
	exports.wrapText = wrapText;
	exports.cutText = cutText;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.utilsDraw = undefined;

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	    },
	    getDeepTransformTranslate: function getDeepTransformTranslate(node) {
	        var parseTransformTranslate = function parseTransformTranslate(transform) {
	            var result = { x: 0, y: 0 };
	            var ts = transform.indexOf('translate(');
	            if (ts >= 0) {
	                var te = transform.indexOf(')', ts + 10);
	                var translateStr = transform.substring(ts + 10, te);
	                var translateParts = translateStr.trim().replace(',', ' ').replace(/\s+/, ' ').split(' ');
	                result.x = parseFloat(translateParts[0]);
	                if (translateParts.length > 1) {
	                    result.y = parseFloat(translateParts[1]);
	                }
	            }
	            return result;
	        };
	        var translate = { x: 0, y: 0 };
	        var parent = node;
	        var tr, attr;
	        while (parent.nodeName.toUpperCase() !== 'SVG') {
	            attr = parent.getAttribute('transform');
	            if (attr) {
	                tr = parseTransformTranslate(attr);
	                translate.x += tr.x;
	                translate.y += tr.y;
	            }
	            parent = parent.parentNode;
	        }
	        return translate;
	    },
	    raiseElements: function raiseElements(container, selector, filter) {
	        var highlighted = container.selectAll(selector).filter(filter);
	        if (highlighted.empty()) {
	            return;
	        }
	        var untargeted = _d2.default.select(highlighted.node().parentNode).selectAll(selector).filter(function (d) {
	            return !filter(d);
	        })[0];
	        var lastUntargeted = untargeted[untargeted.length - 1];
	        if (lastUntargeted) {
	            var untargetedIndex = Array.prototype.indexOf.call(lastUntargeted.parentNode.childNodes, lastUntargeted);
	            var nextSibling = lastUntargeted.nextSibling;
	            highlighted.each(function () {
	                var index = Array.prototype.indexOf.call(this.parentNode.childNodes, this);
	                if (index > untargetedIndex) {
	                    return;
	                }
	                this.parentNode.insertBefore(this, nextSibling);
	            });
	        }
	    }
	};

	exports.utilsDraw = utilsDraw;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.default = interpolatePathPoints;

	var _utils = __webpack_require__(3);

	var _bezier = __webpack_require__(12);

	/**
	 * Returns intermediate line or curve between two sources.
	 */
	function interpolatePathPoints(pointsFrom, pointsTo) {
	    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'polyline';


	    var interpolate;

	    return function (t) {
	        if (t === 0) {
	            return pointsFrom;
	        }
	        if (t === 1) {
	            return pointsTo;
	        }

	        if (!interpolate) {
	            interpolate = (type === 'cubic' ? getCubicInterpolator : getLinearInterpolator)(pointsFrom, pointsTo);
	        }

	        return interpolate(t);
	    };
	}

	/**
	 * Creates intermediate points array, so that the number of points
	 * remains the same and added or excluded points are situated between
	 * existing points.
	 */
	function getLinearInterpolator(pointsFrom, pointsTo) {

	    // TODO: Continue unfinished transition of ending points.
	    pointsFrom = pointsFrom.filter(function (d) {
	        return !d.isInterpolated;
	    });

	    // NOTE: Suppose data is already sorted by X.
	    var idsFrom = pointsFrom.map(function (d) {
	        return d.id;
	    });
	    var idsTo = pointsTo.map(function (d) {
	        return d.id;
	    });
	    var remainingIds = idsFrom.filter(function (id) {
	        return idsTo.indexOf(id) >= 0;
	    });

	    //
	    // Determine start and end scales difference to apply
	    // to initial target position of newly added points
	    // (or end position of deleted points)

	    var stableFrom = pointsFrom.filter(function (d) {
	        return !d.positionIsBeingChanged;
	    });
	    var stableTo = pointsTo.filter(function (d) {
	        return !d.positionIsBeingChanged;
	    });
	    var toEndScale = getScaleDiffFn(stableFrom, stableTo);
	    var toStartScale = getScaleDiffFn(stableTo, stableFrom);

	    var interpolators = [];
	    remainingIds.forEach(function (id, i) {

	        var indexFrom = idsFrom.indexOf(id);
	        var indexTo = idsTo.indexOf(id);

	        if (i === 0 && (indexFrom > 0 || indexTo > 0)) {
	            interpolators.push(getEndingInterpolator({
	                polylineFrom: pointsFrom.slice(0, indexFrom + 1),
	                polylineTo: pointsTo.slice(0, indexTo + 1),
	                toOppositeScale: indexTo === 0 ? toEndScale : toStartScale
	            }));
	        }

	        if (i > 0) {
	            var prevIndexFrom = idsFrom.indexOf(remainingIds[i - 1]);
	            var prevIndexTo = idsTo.indexOf(remainingIds[i - 1]);
	            if (indexFrom - prevIndexFrom > 1 || indexTo - prevIndexTo > 1) {
	                interpolators.push(getInnerInterpolator({
	                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
	                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1)
	                }));
	            }
	        }

	        interpolators.push(getRemainingPointInterpolator({
	            pointFrom: pointsFrom[indexFrom],
	            pointTo: pointsTo[indexTo]
	        }));

	        if (i === remainingIds.length - 1 && (pointsFrom.length - indexFrom - 1 > 0 || pointsTo.length - indexTo - 1 > 0)) {
	            interpolators.push(getEndingInterpolator({
	                polylineFrom: pointsFrom.slice(indexFrom),
	                polylineTo: pointsTo.slice(indexTo),
	                toOppositeScale: pointsTo.length - indexTo === 1 ? toEndScale : toStartScale
	            }));
	        }
	    });

	    if (interpolators.length === 0 && (pointsTo.length > 0 && remainingIds.length === 0 || pointsFrom.length > 0 && remainingIds.length === 0)) {
	        interpolators.push(getNonRemainingPathInterpolator({
	            polylineFrom: pointsFrom.slice(0),
	            polylineTo: pointsTo.slice(0)
	        }));
	    }

	    return function (t) {
	        var intermediate = [];
	        interpolators.forEach(function (interpolator) {
	            var points = interpolator(t);
	            push(intermediate, points);
	        });
	        return intermediate;
	    };
	}

	/**
	 * Creates intermediate cubic points array, so that the number of points
	 * remains the same and added or excluded points are situated between
	 * existing points.
	 */
	function getCubicInterpolator(pointsFrom, pointsTo) {

	    for (var i = 2; i < pointsFrom.length - 1; i += 3) {
	        pointsFrom[i - 1].isCubicControl = true;
	        pointsFrom[i].isCubicControl = true;
	    }
	    for (i = 2; i < pointsTo.length - 1; i += 3) {
	        pointsTo[i - 1].isCubicControl = true;
	        pointsTo[i].isCubicControl = true;
	    }

	    // Replace interpolated points sequence with straight segment
	    // TODO: Continue unfinished transition of ending points.
	    pointsFrom = pointsFrom.filter(function (d) {
	        return !d.isInterpolated;
	    });
	    var d, p;
	    for (i = pointsFrom.length - 2; i >= 0; i--) {
	        p = pointsFrom[i + 1];
	        d = pointsFrom[i];
	        if (!d.isCubicControl && !p.isCubicControl) {
	            pointsFrom.splice(i + 1, 0, (0, _bezier.getBezierPoint)(1 / 3, p, d), (0, _bezier.getBezierPoint)(2 / 3, p, d));
	            pointsFrom[i + 1].isCubicControl = true;
	            pointsFrom[i + 2].isCubicControl = true;
	        }
	    }

	    // NOTE: Suppose data is already sorted by X.
	    // var anchorsFrom = pointsFrom.filter(d => !d.isCubicControl);
	    // var anchorsTo = pointsTo.filter(d => !d.isCubicControl);
	    var anchorsFrom = pointsFrom.filter(function (d, i) {
	        return i % 3 === 0;
	    });
	    var anchorsTo = pointsTo.filter(function (d, i) {
	        return i % 3 === 0;
	    });
	    var idsFrom = anchorsFrom.map(function (d) {
	        return d.id;
	    });
	    var idsTo = anchorsTo.map(function (d) {
	        return d.id;
	    });
	    var indicesFrom = idsFrom.reduce(function (memo, id) {
	        return memo[id] = pointsFrom.findIndex(function (d) {
	            return d.id === id;
	        }), memo;
	    }, {});
	    var indicesTo = idsTo.reduce(function (memo, id) {
	        return memo[id] = pointsTo.findIndex(function (d) {
	            return d.id === id;
	        }), memo;
	    }, {});
	    var remainingIds = idsFrom.filter(function (id) {
	        return idsTo.indexOf(id) >= 0;
	    });

	    //
	    // Determine start and end scales difference to apply
	    // to initial target position of newly added points
	    // (or end position of deleted points)

	    var stableFrom = anchorsFrom.filter(function (d) {
	        return !d.positionIsBeingChanged;
	    });
	    var stableTo = anchorsTo.filter(function (d) {
	        return !d.positionIsBeingChanged;
	    });
	    var toEndScale = getScaleDiffFn(stableFrom, stableTo);
	    var toStartScale = getScaleDiffFn(stableTo, stableFrom);

	    var interpolators = [];
	    remainingIds.forEach(function (id, i) {

	        var indexFrom = indicesFrom[id];
	        var indexTo = indicesTo[id];

	        if (i === 0 && (indexFrom > 0 || indexTo > 0)) {
	            interpolators.push(getEndingInterpolator({
	                polylineFrom: pointsFrom.slice(0, indexFrom + 1),
	                polylineTo: pointsTo.slice(0, indexTo + 1),
	                toOppositeScale: indexTo === 0 ? toEndScale : toStartScale,
	                isCubic: true
	            }));
	        }

	        if (i > 0) {
	            var prevIndexFrom = indicesFrom[remainingIds[i - 1]];
	            var prevIndexTo = indicesTo[remainingIds[i - 1]];
	            if (indexFrom - prevIndexFrom > 3 || indexTo - prevIndexTo > 3) {
	                interpolators.push(getInnerInterpolator({
	                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
	                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1),
	                    isCubic: true
	                }));
	            } else {
	                interpolators.push(getControlsBetweenRemainingInterpolator({
	                    polylineFrom: pointsFrom.slice(prevIndexFrom, indexFrom + 1),
	                    polylineTo: pointsTo.slice(prevIndexTo, indexTo + 1)
	                }));
	            }
	        }

	        interpolators.push(getRemainingPointInterpolator({
	            pointFrom: pointsFrom[indexFrom],
	            pointTo: pointsTo[indexTo]
	        }));

	        if (i === remainingIds.length - 1 && (pointsFrom.length - indexFrom - 1 > 0 || pointsTo.length - indexTo - 1 > 0)) {
	            interpolators.push(getEndingInterpolator({
	                polylineFrom: pointsFrom.slice(indexFrom),
	                polylineTo: pointsTo.slice(indexTo),
	                toOppositeScale: pointsTo.length - indexTo === 1 ? toEndScale : toStartScale,
	                isCubic: true
	            }));
	        }
	    });

	    if (interpolators.length === 0 && (pointsTo.length > 0 && remainingIds.length === 0 || pointsFrom.length > 0 && remainingIds.length === 0)) {
	        interpolators.push(getNonRemainingPathInterpolator({
	            polylineFrom: pointsFrom.slice(0),
	            polylineTo: pointsTo.slice(0),
	            isCubic: true
	        }));
	    }

	    return function (t) {
	        var intermediate = [];
	        interpolators.forEach(function (ipl) {
	            var points = ipl(t);
	            push(intermediate, points);
	        });
	        return intermediate;
	    };
	}

	function getEndingInterpolator(_ref) {
	    var polylineFrom = _ref.polylineFrom,
	        polylineTo = _ref.polylineTo,
	        isCubic = _ref.isCubic,
	        toOppositeScale = _ref.toOppositeScale;


	    var polyline = polylineFrom.length > polylineTo.length ? polylineFrom : polylineTo;
	    var decreasing = polylineTo.length === 1;
	    var isLeftEnding = polylineFrom[0].id !== polylineTo[0].id;
	    var rightToLeft = Boolean(isLeftEnding ^ decreasing);

	    return function (t) {
	        var interpolated = (isCubic ? interpolateCubicEnding : interpolateEnding)({
	            t: t, polyline: polyline,
	            decreasing: decreasing,
	            rightToLeft: rightToLeft
	        });
	        if (decreasing === rightToLeft) {
	            interpolated.shift();
	        } else {
	            interpolated.pop();
	        }
	        var diffed = interpolated.map(toOppositeScale);
	        var points = interpolatePoints(diffed, interpolated, decreasing ? 1 - t : t);
	        points.forEach(function (d) {
	            return d.positionIsBeingChanged = true;
	        });
	        return points;
	    };
	}

	function getInnerInterpolator(_ref2) {
	    var polylineFrom = _ref2.polylineFrom,
	        polylineTo = _ref2.polylineTo,
	        isCubic = _ref2.isCubic;


	    var oldCount = polylineFrom.length;
	    var newCount = polylineTo.length;

	    if (newCount !== oldCount) {
	        var decreasing = newCount < oldCount;
	        var smallerPolyline = decreasing ? polylineTo : polylineFrom;
	        var biggerPolyline = decreasing ? polylineFrom : polylineTo;
	        var filledPolyline = (isCubic ? fillSmallerCubicLine : fillSmallerPolyline)({
	            smallerPolyline: smallerPolyline,
	            biggerPolyline: biggerPolyline,
	            decreasing: decreasing
	        });
	        var biggerInnerPoints = biggerPolyline.slice(1, biggerPolyline.length - 1);
	        var filledInnerPoints = filledPolyline.slice(1, filledPolyline.length - 1);
	        return function (t) {
	            var points = interpolatePoints(filledInnerPoints, biggerInnerPoints, decreasing ? 1 - t : t);
	            points.forEach(function (d) {
	                return d.positionIsBeingChanged = true;
	            });
	            return points;
	        };
	    } else {
	        var innerPointsFrom = polylineFrom.slice(1, polylineFrom.length - 1);
	        var innerPointsTo = polylineTo.slice(1, polylineTo.length - 1);
	        return function (t) {
	            var points = interpolatePoints(innerPointsFrom, innerPointsTo, t);
	            points.forEach(function (d) {
	                return d.positionIsBeingChanged = true;
	            });
	            return points;
	        };
	    }
	}

	function getRemainingPointInterpolator(_ref3) {
	    var pointFrom = _ref3.pointFrom,
	        pointTo = _ref3.pointTo;

	    return function (t) {
	        return [interpolatePoint(pointFrom, pointTo, t)];
	    };
	}

	function getControlsBetweenRemainingInterpolator(_ref4) {
	    var polylineFrom = _ref4.polylineFrom,
	        polylineTo = _ref4.polylineTo;

	    return function (t) {
	        return interpolatePoints(polylineFrom.slice(1, 3), polylineTo.slice(1, 3), t);
	    };
	}

	function getNonRemainingPathInterpolator(_ref5) {
	    var polylineFrom = _ref5.polylineFrom,
	        polylineTo = _ref5.polylineTo,
	        isCubic = _ref5.isCubic;


	    var decreasing = polylineTo.length === 0;
	    var rightToLeft = decreasing;

	    var polyline = decreasing ? polylineFrom : polylineTo;
	    return function (t) {
	        var points = (isCubic ? interpolateCubicEnding : interpolateEnding)({
	            t: t,
	            polyline: polyline,
	            decreasing: decreasing,
	            rightToLeft: rightToLeft
	        });
	        points.forEach(function (d, i) {
	            if (i > 0) {
	                d.positionIsBeingChanged = true;
	            }
	        });
	        return points;
	    };
	}

	function push(target, items) {
	    return Array.prototype.push.apply(target, items);
	}

	function interpolateValue(a, b, t) {
	    if (b === undefined) {
	        return a;
	    }
	    if (typeof b === 'number') {
	        return a + t * (b - a);
	    }
	    return b;
	}

	function interpolatePoint(a, b, t) {
	    if (a === b) {
	        return b;
	    }
	    var c = {};
	    var props = Object.keys(a);
	    props.forEach(function (k) {
	        return c[k] = interpolateValue(a[k], b[k], t);
	    });
	    if (b.id !== undefined) {
	        c.id = b.id;
	    }
	    return c;
	}

	function interpolatePoints(pointsFrom, pointsTo, t) {
	    var result = pointsFrom.map(function (a, i) {
	        return interpolatePoint(a, pointsTo[i], t);
	    });
	    return result;
	}

	/**
	 * Returns a polyline with points that move along line
	 * from start point to full line (or vice versa).
	 */
	function interpolateEnding(_ref6) {
	    var t = _ref6.t,
	        polyline = _ref6.polyline,
	        decreasing = _ref6.decreasing,
	        rightToLeft = _ref6.rightToLeft;


	    var reverse = Boolean(decreasing) !== Boolean(rightToLeft);

	    var result = function getLinePiece(t, line) {
	        var q = 0;
	        if (t > 0) {
	            var distance = [0];
	            var totalDistance = 0;
	            for (var i = 1, x, y, x0, y0, d; i < line.length; i++) {
	                x0 = line[i - 1].x;
	                y0 = line[i - 1].y;
	                x = line[i].x;
	                y = line[i].y;
	                d = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
	                totalDistance += d;
	                distance.push(totalDistance);
	            }
	            var passedDistance = t * totalDistance;
	            for (i = 1; i < distance.length; i++) {
	                if (passedDistance <= distance[i]) {
	                    q = Math.min(1, (i - 1 + (passedDistance - distance[i - 1]) / (distance[i] - distance[i - 1])) / (line.length - 1));
	                    break;
	                }
	            }
	        }

	        var existingCount = Math.floor((line.length - 1) * q) + 1;
	        var tempCount = line.length - existingCount;
	        var tempStartIdIndex = existingCount;
	        var result = line.slice(0, existingCount);
	        if (q < 1) {
	            var qi = q * (line.length - 1) % 1;
	            var midPt = interpolatePoint(line[existingCount - 1], line[existingCount], qi);
	            push(result, _utils.utils.range(tempCount).map(function (i) {
	                return Object.assign({}, midPt, {
	                    id: line[tempStartIdIndex + i].id,
	                    isInterpolated: true
	                });
	            }));
	        }
	        return result;
	    }(decreasing ? 1 - t : t, reverse ? polyline.slice(0).reverse() : polyline);
	    if (reverse) {
	        result.reverse();
	    }

	    return result;
	}

	/**
	 * Returns a cubic line with points that move along line
	 * from start point to full line (or vice versa).
	 */
	function interpolateCubicEnding(_ref7) {
	    var t = _ref7.t,
	        polyline = _ref7.polyline,
	        decreasing = _ref7.decreasing,
	        rightToLeft = _ref7.rightToLeft;


	    var reverse = Boolean(decreasing) !== Boolean(rightToLeft);

	    var result = function getLinePiece(t, line) {
	        var pointsCount = (line.length - 1) / 3 + 1;
	        var q = 0;
	        if (t > 0) {
	            var distance = [0];
	            var totalDistance = 0;
	            for (var i = 1, x1, y1, x0, y0, cx0, cy0, cx1, cy1, d; i < pointsCount; i++) {
	                x0 = line[i * 3 - 3].x;
	                y0 = line[i * 3 - 3].y;
	                cx0 = line[i * 3 - 2].x;
	                cy0 = line[i * 3 - 2].y;
	                cx1 = line[i * 3 - 1].x;
	                cy1 = line[i * 3 - 1].y;
	                x1 = line[i * 3].x;
	                y1 = line[i * 3].y;
	                d = (getDistance(x0, y0, cx0, cy0) + getDistance(cx0, cy0, cx1, cy1) + getDistance(cx1, cy1, x1, y1) + getDistance(x1, y1, x0, y0)) / 2;
	                totalDistance += d;
	                distance.push(totalDistance);
	            }
	            var passedDistance = t * totalDistance;
	            for (i = 1; i < distance.length; i++) {
	                if (passedDistance <= distance[i]) {
	                    q = Math.min(1, (i - 1 + (passedDistance - distance[i - 1]) / (distance[i] - distance[i - 1])) / (pointsCount - 1));
	                    break;
	                }
	            }
	        }

	        var existingCount = Math.floor((pointsCount - 1) * q) + 1;
	        var tempCount = pointsCount - existingCount;
	        var tempStartIdIndex = existingCount * 3;
	        var result = line.slice(0, (existingCount - 1) * 3 + 1);
	        if (q < 1) {
	            var qi = q * (pointsCount - 1) % 1;
	            var spl = splitCubicSegment(qi, line.slice((existingCount - 1) * 3, existingCount * 3 + 1));
	            var newPiece = spl.slice(1, 4);
	            newPiece.forEach(function (p) {
	                return p.isInterpolated = true;
	            });
	            newPiece[2].id = line[tempStartIdIndex].id;
	            push(result, newPiece);
	            _utils.utils.range(1, tempCount).forEach(function (i) {
	                push(result, [{ x: newPiece[2].x, y: newPiece[2].y, isCubicControl: true, isInterpolated: true }, { x: newPiece[2].x, y: newPiece[2].y, isCubicControl: true, isInterpolated: true }, Object.assign({}, newPiece[2], {
	                    id: line[tempStartIdIndex + i * 3].id,
	                    isInterpolated: true
	                })]);
	            });
	        }
	        return result;
	    }(decreasing ? 1 - t : t, reverse ? polyline.slice(0).reverse() : polyline);
	    if (reverse) {
	        result.reverse();
	    }

	    return result;
	}

	/**
	 * Returns a polyline filled with points, so that number of points
	 * becomes the same on both start and end polylines.
	 */
	function fillSmallerPolyline(_ref8) {
	    var smallerPolyline = _ref8.smallerPolyline,
	        biggerPolyline = _ref8.biggerPolyline,
	        decreasing = _ref8.decreasing;


	    var smallerSegCount = smallerPolyline.length - 1;
	    var biggerSegCount = biggerPolyline.length - 1;
	    var minSegmentPointsCount = Math.floor(biggerSegCount / smallerSegCount) + 1;
	    var restPointsCount = biggerSegCount % smallerSegCount;
	    var segmentsPointsCount = _utils.utils.range(smallerSegCount).map(function (i) {
	        return minSegmentPointsCount + Number(i < restPointsCount);
	    });

	    var result = [smallerPolyline[0]];
	    var smallPtIndex = 1;
	    segmentsPointsCount.forEach(function (segPtCount) {
	        _utils.utils.range(1, segPtCount).forEach(function (i) {
	            var newPt;
	            if (i === segPtCount - 1) {
	                newPt = Object.assign({}, smallerPolyline[smallPtIndex]);
	                if (!decreasing) {
	                    newPt.id = biggerPolyline[result.length].id;
	                }
	            } else {
	                newPt = interpolatePoint(smallerPolyline[smallPtIndex - 1], smallerPolyline[smallPtIndex], i / (segPtCount - 1));
	                newPt.id = biggerPolyline[result.length].id;
	                if (decreasing) {
	                    newPt.isInterpolated = true;
	                }
	            }
	            result.push(newPt);
	        });
	        smallPtIndex++;
	    });

	    return result;
	}

	/**
	 * Returns a cubic line filled with points, so that number of points
	 * becomes the same on both start and end cubic lines.
	 */
	function fillSmallerCubicLine(_ref9) {
	    var smallerPolyline = _ref9.smallerPolyline,
	        biggerPolyline = _ref9.biggerPolyline,
	        decreasing = _ref9.decreasing;


	    var smallerSegCount = (smallerPolyline.length - 1) / 3;
	    var biggerSegCount = (biggerPolyline.length - 1) / 3;
	    var minSegmentPointsCount = Math.floor(biggerSegCount / smallerSegCount) + 1;
	    var restPointsCount = biggerSegCount % smallerSegCount;
	    var segmentsPointsCount = _utils.utils.range(smallerSegCount).map(function (i) {
	        return minSegmentPointsCount + Number(i < restPointsCount);
	    });

	    var result = [smallerPolyline[0]];
	    var smallPtIndex = 3;
	    segmentsPointsCount.forEach(function (segPtCount) {
	        if (segPtCount > 2) {
	            var spl = multipleSplitCubicSegment(_utils.utils.range(1, segPtCount - 1).map(function (i) {
	                return i / (segPtCount - 1);
	            }), smallerPolyline.slice(smallPtIndex - 3, smallPtIndex + 1));
	            _utils.utils.range(segPtCount - 2).forEach(function (i) {
	                return spl[(i + 1) * 3].id = biggerPolyline[result.length - 1 + i * 3].id;
	            });
	            if (decreasing) {
	                spl.forEach(function (p, i) {
	                    if (i > 0 && i < spl.length - 1) {
	                        p.isInterpolated = true;
	                    }
	                });
	            }
	            push(result, spl.slice(1));
	        } else {
	            var newC0 = Object.assign({}, smallerPolyline[smallPtIndex - 2]);
	            var newC1 = Object.assign({}, smallerPolyline[smallPtIndex - 1]);
	            var newPt = Object.assign({}, smallerPolyline[smallPtIndex]);
	            if (!decreasing) {
	                newPt.id = biggerPolyline[result.length + 2].id;
	            }
	            result.push(newC0, newC1, newPt);
	        }
	        smallPtIndex += 3;
	    });

	    return result;
	}

	/**
	 * Returns a function which moves a point from it's scale
	 * to opposite scale (e.g. from start scale to end scale).
	 */
	function getScaleDiffFn(points1, points2) {

	    // Find remaining points with predictable position
	    var src = [];
	    var dst = [];
	    var i,
	        j,
	        a,
	        b,
	        matchJ = 0;
	    var len1 = points1.length;
	    var len2 = points2.length;
	    for (i = 0; i < len1; i++) {
	        a = points1[i];
	        for (j = matchJ; j < len2; j++) {
	            b = points2[j];
	            if (a.id === b.id) {
	                matchJ = j + 1;
	                src.push(a);
	                dst.push(b);
	                break;
	            }
	        }
	    }

	    if (src.length < 1 || dst.length < 1) {
	        // Applying scale difference will not be possible
	        return function (d) {
	            return d;
	        };
	    }

	    var numProps = Object.keys(src[0]).filter(function (prop) {
	        return typeof src[0][prop] === 'number';
	    }).filter(function (prop) {
	        return prop !== 'id';
	    });

	    var propDiffs = {};
	    var createPropDiffFn = function createPropDiffFn(a0, b0, a, b) {
	        return function (c0) {
	            return b + (c0 - b0) * (b - a) / (b0 - a0);
	        };
	    };
	    var createSimpleDiffFn = function createSimpleDiffFn(a0, a) {
	        return function (c0) {
	            return c0 - a0 + a;
	        };
	    };
	    numProps.forEach(function (prop) {
	        var a0 = src[0][prop];
	        var a = dst[0][prop];
	        for (var i = src.length - 1, b0, b; i > 0; i--) {
	            b0 = src[i][prop];
	            if (b0 !== a0) {
	                b = dst[i][prop];
	                propDiffs[prop] = createPropDiffFn(a0, b0, a, b);
	                return;
	            }
	        }
	        propDiffs[prop] = createSimpleDiffFn(a0, a);
	    });

	    return function (c0) {
	        var c = Object.assign({}, c0);
	        numProps.forEach(function (p) {
	            c[p] = propDiffs[p](c0[p]);
	        });
	        return c;
	    };
	}

	function getDistance(x0, y0, x, y) {
	    return Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
	}

	function splitCubicSegment(t, _ref10) {
	    var _ref11 = _slicedToArray(_ref10, 4),
	        p0 = _ref11[0],
	        c0 = _ref11[1],
	        c1 = _ref11[2],
	        p1 = _ref11[3];

	    var seg = (0, _bezier.splitCubicSegment)(t, p0, c0, c1, p1);
	    [seg[1], seg[2], seg[4], seg[5]].forEach(function (c) {
	        return c.isCubicControl = true;
	    });
	    Object.keys(p1).forEach(function (k) {
	        if (k !== 'x' && k !== 'y' && k !== 'id') {
	            seg[3][k] = interpolateValue(p0[k], p1[k], t);
	        }
	    });

	    return seg;
	}

	function multipleSplitCubicSegment(ts, seg) {
	    var result = [seg[0]];
	    for (var i = 0, t, spl; i < ts.length; i++) {
	        t = i === 0 ? ts[0] : ts[i] / (1 - ts[i - 1]);
	        spl = splitCubicSegment(t, seg);
	        push(result, spl.slice(1, 4));
	        seg = spl.slice(3);
	    }
	    push(result, seg.slice(1));

	    return result;
	}

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.bezier = bezier;
	exports.getBezierPoint = getBezierPoint;
	exports.splitCubicSegment = splitCubicSegment;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function bezier(t) {
	    if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 2) {
	        return (arguments.length <= 1 ? undefined : arguments[1]) * (1 - t) + (arguments.length <= 2 ? undefined : arguments[2]) * t;
	    }
	    if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 3) {
	        return (arguments.length <= 1 ? undefined : arguments[1]) * (1 - t) * (1 - t) + 2 * (arguments.length <= 2 ? undefined : arguments[2]) * (1 - t) * t + (arguments.length <= 3 ? undefined : arguments[3]) * t * t;
	    }
	    return (arguments.length <= 1 ? undefined : arguments[1]) * (1 - t) * (1 - t) * (1 - t) + 3 * (arguments.length <= 2 ? undefined : arguments[2]) * (1 - t) * (1 - t) * t + 3 * (arguments.length <= 3 ? undefined : arguments[3]) * (1 - t) * t * t + (arguments.length <= 4 ? undefined : arguments[4]) * t * t * t;
	}

	function getBezierPoint(t) {
	    for (var _len = arguments.length, p = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        p[_key - 1] = arguments[_key];
	    }

	    var x = p.map(function (p) {
	        return p.x;
	    });
	    var y = p.map(function (p) {
	        return p.y;
	    });
	    x.unshift(t);
	    y.unshift(t);
	    return {
	        x: bezier.apply(undefined, _toConsumableArray(x)),
	        y: bezier.apply(undefined, _toConsumableArray(y))
	    };
	}

	function splitCubicSegment(t, p0, c0, c1, p1) {
	    var c2 = getBezierPoint(t, p0, c0);
	    var c3 = getBezierPoint(t, p0, c0, c1);
	    var c4 = getBezierPoint(t, c0, c1, p1);
	    var c5 = getBezierPoint(t, c1, p1);
	    var m = getBezierPoint(t, c3, c4);
	    return [p0, c2, c3, m, c4, c5, p1];
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getLineInterpolator = getLineInterpolator;
	exports.getInterpolatorSplineType = getInterpolatorSplineType;

	var _smooth = __webpack_require__(14);

	var _step = __webpack_require__(15);

	var polylineInterpolators = {
	    linear: function linear(d) {
	        return d;
	    },
	    step: _step.getStepLine,
	    'step-before': _step.getStepBeforeLine,
	    'step-after': _step.getStepAfterLine
	};
	var curveInterpolators = {
	    smooth: _smooth.getCurve,
	    'smooth-keep-extremum': _smooth.getCurveKeepingExtremums
	};

	function getLineInterpolator(type) {
	    return polylineInterpolators[type] || curveInterpolators[type];
	}

	function getInterpolatorSplineType(type) {
	    if (curveInterpolators[type] !== undefined) {
	        return 'cubic';
	    }
	    return 'polyline';
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getCurve = getCurve;
	exports.getCurveKeepingExtremums = getCurveKeepingExtremums;

	var _bezier = __webpack_require__(12);

	/**
	 * Returns smooth cubic spline.
	 * Applicable to math functions.
	 */
	function getCurve(points) {
	    return getCubicSpline(points, false);
	}

	/**
	 * Returns cubic spline that never exceeds extremums.
	 * Applicable to business data.
	 */
	function getCurveKeepingExtremums(points) {
	    return getCubicSpline(points, true);
	}

	// TODO: Smooth sengments junctions.
	function getCubicSpline(points, limited) {
	    if (points.length < 2) {
	        return points.slice(0);
	    }
	    if (points.length === 2) {
	        return [points[0], {
	            x: interpolate(points[0].x, points[1].x, 1 / 3),
	            y: interpolate(points[0].y, points[1].y, 1 / 3)
	        }, {
	            x: interpolate(points[0].x, points[1].x, 2 / 3),
	            y: interpolate(points[0].y, points[1].y, 2 / 3)
	        }, points[1]];
	    }

	    var curve = new Array((points.length - 1) * 3 + 1);
	    var c0, p1, c3, c1x, c1y, c2x, c2y, qx, qy, qt, tan, dx1, dx2, kl;
	    for (var i = 0; i < points.length; i++) {
	        curve[i * 3] = points[i];
	        if (i > 0) {
	            curve[i * 3 - 2] = (0, _bezier.getBezierPoint)(1 / 3, points[i - 1], points[i]);
	            curve[i * 3 - 1] = (0, _bezier.getBezierPoint)(2 / 3, points[i - 1], points[i]);
	        }
	    }
	    var result = curve.slice(0);
	    for (var j = 0, last; j < 3; j++) {
	        for (i = 6; i < result.length; i += 3) {
	            c0 = result[i - 5];
	            p1 = result[i - 3];
	            c3 = result[i - 1];
	            if ((p1.x - c0.x) * (c3.x - p1.x) * 1e12 < 1) {
	                c1x = interpolate(c0.x, p1.x, 0.5);
	                c2x = interpolate(p1.x, c3.x, 0.5);
	                c1y = interpolate(c0.y, p1.y, 0.5);
	                c2y = interpolate(p1.y, c3.y, 0.5);
	            } else {
	                qt = (p1.x - c0.x) / (c3.x - c0.x);
	                qx = (p1.x - c0.x * (1 - qt) * (1 - qt) - c3.x * qt * qt) / (2 * (1 - qt) * qt);
	                qy = (p1.y - c0.y * (1 - qt) * (1 - qt) - c3.y * qt * qt) / (2 * (1 - qt) * qt);
	                c1x = interpolate(c0.x, qx, qt);
	                c2x = interpolate(qx, c3.x, qt);
	                c1y = interpolate(c0.y, qy, qt);
	                c2y = interpolate(qy, c3.y, qt);

	                if (limited) {
	                    dx1 = p1.x - c1x;
	                    dx2 = c2x - p1.x;
	                    tan = (c2y - p1.y) / dx2;
	                    if ((p1.y - c0.y) * (c3.y - p1.y) <= 0) {
	                        tan = 0;
	                    } else {
	                        if (p1.y > c0.y === c2y > c3.y) {
	                            kl = (c3.y - p1.y) / (c2y - p1.y);
	                            dx2 = interpolate(dx2 * kl, dx2, 1 / (1 + Math.abs(kl)));
	                            tan = (c3.y - p1.y) / dx2;
	                        }
	                        if (p1.y > c0.y === c1y < c0.y) {
	                            kl = (p1.y - c0.y) / (p1.y - c1y);
	                            dx1 = interpolate(dx1 * kl, dx1, 1 / (1 + Math.abs(kl)));
	                            tan = (p1.y - c0.y) / dx1;
	                        }
	                    }
	                    c1x = p1.x - dx1;
	                    c2x = p1.x + dx2;
	                    c1y = p1.y - tan * dx1;
	                    c2y = p1.y + tan * dx2;
	                }
	            }
	            curve[i - 4] = { x: c1x, y: c1y };
	            curve[i - 2] = { x: c2x, y: c2y };
	        }
	        curve[1] = {
	            x: interpolate(curve[0].x, curve[3].x, 1 / 3),
	            y: interpolate(curve[0].y, interpolate(curve[3].y, curve[2].y, 3 / 2), 2 / 3)
	        };
	        last = curve.length - 1;
	        curve[last - 1] = {
	            x: interpolate(curve[last].x, curve[last - 3].x, 1 / 3),
	            y: interpolate(curve[last].y, interpolate(curve[last - 3].y, curve[last - 2].y, 3 / 2), 2 / 3)
	        };
	        result = curve.slice(0);
	    }

	    return result;
	}

	function interpolate(a, b, t) {
	    return a + t * (b - a);
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getStepLine = getStepLine;
	exports.getStepBeforeLine = getStepBeforeLine;
	exports.getStepAfterLine = getStepAfterLine;
	function getStepLine(points) {
	    var result = [];
	    var hasId = points[0].id !== undefined;
	    var hasSize = points[0].size !== undefined;
	    for (var i = 1, p0, p1, m0, m1; i < points.length; i++) {
	        p0 = points[i - 1];
	        p1 = points[i];
	        m0 = {
	            x: (p0.x + p1.x) / 2,
	            y: p0.y
	        };
	        m1 = {
	            x: (p0.x + p1.x) / 2,
	            y: p1.y
	        };
	        if (hasId) {
	            m0.id = p0.id + "-" + p1.id + "-1";
	            m1.id = p0.id + "-" + p1.id + "-2";
	        }
	        if (hasSize) {
	            m0.size = p0.size;
	            m1.size = p1.size;
	        }
	        if (i === 1) {
	            result.push(p0);
	        }
	        result.push(m0, m1, p1);
	    }
	    return result;
	}

	function getStepBeforeLine(points) {
	    var result = [];
	    var hasId = points[0].id !== undefined;
	    var hasSize = points[0].size !== undefined;
	    for (var i = 1, p0, p1, m; i < points.length; i++) {
	        p0 = points[i - 1];
	        p1 = points[i];
	        m = {
	            x: p0.x,
	            y: p1.y
	        };
	        if (hasId) {
	            m.id = p0.id + "-" + p1.id;
	        }
	        if (hasSize) {
	            m.size = p1.size;
	        }
	        if (i === 1) {
	            result.push(p0);
	        }
	        result.push(m, p1);
	    }
	    return result;
	}

	function getStepAfterLine(points) {
	    var result = [];
	    var hasId = points[0].id !== undefined;
	    var hasSize = points[0].size !== undefined;
	    for (var i = 1, p0, p1, m; i < points.length; i++) {
	        p0 = points[i - 1];
	        p1 = points[i];
	        m = {
	            x: p1.x,
	            y: p0.y
	        };
	        if (hasId) {
	            m.id = p0.id + "-" + p1.id;
	        }
	        if (hasSize) {
	            m.size = p0.size;
	        }
	        if (i === 1) {
	            result.push(p0);
	        }
	        result.push(m, p1);
	    }
	    return result;
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GPL = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _event = __webpack_require__(6);

	var _utils = __webpack_require__(3);

	var _algebra = __webpack_require__(17);

	var _dataFrame = __webpack_require__(19);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var cast = function cast(v) {
	    return _utils.utils.isDate(v) ? v.getTime() : v;
	};

	var MixinModel = function MixinModel(prev) {
	    var _this = this;

	    Object.keys(prev).forEach(function (k) {
	        return _this[k] = prev[k];
	    });
	};

	var compose = function compose(prev) {
	    var updates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    return Object.assign(new MixinModel(prev), updates);
	};

	var evalGrammarRules = function evalGrammarRules(grammarRules, initialGrammarModel, grammarRegistry) {
	    return grammarRules.map(function (rule) {
	        return typeof rule === 'string' ? grammarRegistry.get(rule) : rule;
	    }).filter(function (x) {
	        return x;
	    }).reduce(function (prevModel, rule) {
	        return compose(prevModel, rule(prevModel, {}));
	    }, initialGrammarModel);
	};

	var GPL = exports.GPL = function (_Emitter) {
	    _inherits(GPL, _Emitter);

	    function GPL(config, scalesRegistryInstance, unitsRegistry, grammarRules) {
	        _classCallCheck(this, GPL);

	        // jscs:disable
	        var _this2 = _possibleConstructorReturn(this, (GPL.__proto__ || Object.getPrototypeOf(GPL)).call(this));

	        _utils.utils.defaults(config.scales, {
	            'size_null': { type: 'size', source: '?' },
	            'split_null': { type: 'value', source: '?' },
	            'label_null': { type: 'value', source: '?' },
	            'color_null': { type: 'color', source: '?' },
	            'identity_null': { type: 'identity', source: '?' },
	            'size:default': { type: 'size', source: '?' },
	            'color:default': { type: 'color', source: '?' },
	            'split:default': { type: 'value', source: '?' },
	            'label:default': { type: 'value', source: '?' },
	            'identity:default': { type: 'identity', source: '?' }
	        });
	        // jscs:enable

	        config.settings = config.settings || {};

	        _this2.config = config;
	        _this2.sources = config.sources;
	        _this2.scales = config.scales;
	        _this2.unitSet = unitsRegistry;
	        _this2.grammarRules = grammarRules;
	        _this2.scalesHub = scalesRegistryInstance;

	        _this2.transformations = Object.assign(config.transformations || {}, {
	            where: function where(data, tuple) {
	                var predicates = Object.keys(tuple || {}).map(function (k) {
	                    return function (row) {
	                        return cast(row[k]) === tuple[k];
	                    };
	                });
	                return data.filter(function (row) {
	                    return predicates.every(function (p) {
	                        return p(row);
	                    });
	                });
	            }
	        });
	        return _this2;
	    }

	    _createClass(GPL, [{
	        key: 'unfoldStructure',
	        value: function unfoldStructure() {
	            this.root = this._expandUnitsStructure(this.config.unit);
	            return this.config;
	        }
	    }, {
	        key: 'getDrawScenarioQueue',
	        value: function getDrawScenarioQueue(root) {
	            var _this3 = this;

	            var grammarRules = this.grammarRules;
	            var scaleInfoQueue = this._flattenDrawScenario(root, function (parentInstance, unit, rootFrame) {
	                // Rule to cancel parent frame inheritance
	                var frame = unit.expression.inherit === false ? null : rootFrame;
	                var scalesFactoryMethod = _this3._createFrameScalesFactoryMethod(frame);
	                var instance = _this3.unitSet.create(unit.type, Object.assign({}, unit, { options: parentInstance.allocateRect(rootFrame.key) }));

	                var initialModel = new MixinModel(instance.defineGrammarModel(scalesFactoryMethod));
	                var grammarModel = evalGrammarRules(instance.getGrammarRules(), initialModel, grammarRules);
	                evalGrammarRules(instance.getAdjustScalesRules(), grammarModel, grammarRules);
	                instance.node().screenModel = instance.createScreenModel(grammarModel);

	                return instance;
	            });

	            var createScales = function createScales() {
	                Object.keys(_this3.scales).forEach(function (k) {
	                    return _this3.scalesHub.createScaleInfo(_this3.scales[k]).commit();
	                });
	            };

	            var updateScalesQueue = this._flattenDrawScenario(root, function (parentInstance, unit, rootFrame) {
	                var frame = unit.expression.inherit === false ? null : rootFrame;
	                var scalesFactoryMethod = _this3._createFrameScalesFactoryMethod(frame);
	                var instance = _this3.unitSet.create(unit.type, Object.assign({}, unit, { options: parentInstance.allocateRect(rootFrame.key) }));

	                var initialModel = new MixinModel(instance.defineGrammarModel(scalesFactoryMethod));
	                var grammarModel = evalGrammarRules(instance.getGrammarRules(), initialModel, grammarRules);
	                instance.node().screenModel = instance.createScreenModel(grammarModel);
	                instance.parentUnit = parentInstance;
	                instance.addInteraction();

	                return instance;
	            });

	            return scaleInfoQueue.concat(createScales).concat(updateScalesQueue);
	        }
	    }, {
	        key: '_flattenDrawScenario',
	        value: function _flattenDrawScenario(root, iterator) {

	            var uids = {};
	            var scenario = [];

	            var stack = [root];

	            var put = function put(x) {
	                return stack.unshift(x);
	            };
	            var pop = function pop() {
	                return stack.shift();
	            };
	            var top = function top() {
	                return stack[0];
	            };

	            var queue = GPL.traverseSpec({ unit: this.root },
	            // enter
	            function (unit, parentUnit, currFrame) {

	                unit.uid = function () {
	                    var uid = _utils.utils.generateHash((parentUnit ? parentUnit.uid + '/' : '') + JSON.stringify(Object.keys(unit).filter(function (key) {
	                        return typeof unit[key] === 'string';
	                    }).reduce(function (memo, key) {
	                        return memo[key] = unit[key], memo;
	                    }, {})) + ('-' + JSON.stringify(currFrame.pipe)));
	                    if (uid in uids) {
	                        uid += '-' + ++uids[uid];
	                    } else {
	                        uids[uid] = 0;
	                    }
	                    return uid;
	                }();
	                unit.guide = _utils.utils.clone(unit.guide);

	                var instance = iterator(top(), unit, currFrame);

	                scenario.push(instance);

	                if (unit.type.indexOf('COORDS.') === 0) {
	                    put(instance);
	                }
	            },
	            // exit
	            function (unit) {
	                if (unit.type.indexOf('COORDS.') === 0) {
	                    pop();
	                }
	            }, null, this._datify({
	                source: this.root.expression.source,
	                pipe: []
	            }));

	            queue.push(function () {
	                return scenario;
	            });

	            return queue;
	        }
	    }, {
	        key: '_expandUnitsStructure',
	        value: function _expandUnitsStructure(root) {
	            var _this4 = this;

	            var parentPipe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


	            var self = this;

	            if (root.expression.operator === false) {

	                root.frames = root.frames.map(function (f) {
	                    return self._datify(f);
	                });
	            } else {

	                var expr = this._parseExpression(root.expression, parentPipe, root.guide);

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
	                    return _this4._expandUnitsStructure(unit, f.pipe);
	                });
	            });

	            return root;
	        }
	    }, {
	        key: '_createFrameScalesFactoryMethod',
	        value: function _createFrameScalesFactoryMethod(passFrame) {
	            var self = this;
	            return function (type, alias, dynamicProps) {
	                var key = alias || type + ':default';
	                return self.scalesHub.createScaleInfo(self.scales[key], passFrame).create(dynamicProps);
	            };
	        }
	    }, {
	        key: '_datify',
	        value: function _datify(frame) {
	            return new _dataFrame.DataFrame(frame, this.sources[frame.source].data, this.transformations);
	        }
	    }, {
	        key: '_parseExpression',
	        value: function _parseExpression(expr, parentPipe, guide) {
	            var _this5 = this;

	            var funcName = expr.operator || 'none';
	            var srcAlias = expr.source;
	            var bInherit = expr.inherit !== false; // true by default
	            var funcArgs = expr.params;

	            var frameConfig = {
	                source: srcAlias,
	                pipe: bInherit ? parentPipe : []
	            };

	            var dataFn = function dataFn() {
	                return _this5._datify(frameConfig).part();
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
	                    return func.apply(undefined, [dataFn].concat(_toConsumableArray(funcArgs || []), [guide]));
	                }
	            };
	        }
	    }], [{
	        key: 'traverseSpec',
	        value: function traverseSpec(spec, enter, exit) {
	            var rootNode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	            var rootFrame = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;


	            var queue = [];

	            var traverse = function traverse(node, enter, exit, parentNode, currFrame) {

	                queue.push(function () {
	                    enter(node, parentNode, currFrame);
	                });

	                if (node.frames) {
	                    node.frames.forEach(function (frame) {
	                        (frame.units || []).map(function (subNode) {
	                            return traverse(subNode, enter, exit, node, frame);
	                        });
	                    });
	                }

	                queue.push(function () {
	                    return exit(node, parentNode, currFrame);
	                });
	            };

	            traverse(spec.unit, enter, exit, rootNode, rootFrame);

	            return queue;
	        }
	    }]);

	    return GPL;
	}(_event.Emitter);

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.FramesAlgebra = undefined;

	var _utils = __webpack_require__(3);

	var _unitDomainPeriodGenerator = __webpack_require__(18);

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var unify = function unify(v) {
	    return _utils.utils.isDate(v) ? v.getTime() : v;
	};

	var FramesAlgebra = {
	    cross: function cross(dataFn, dimX, dimY) {

	        var data = dataFn();

	        var domainX = _utils.utils.unique(data.map(function (x) {
	            return x[dimX];
	        }), unify);
	        var domainY = _utils.utils.unique(data.map(function (x) {
	            return x[dimY];
	        }), unify);

	        var domX = domainX.length === 0 ? [null] : domainX;
	        var domY = domainY.length === 0 ? [null] : domainY;

	        return domY.reduce(function (memo, rowVal) {

	            return memo.concat(domX.map(function (colVal) {

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
	    cross_period: function cross_period(dataFn, dimX, dimY, xPeriod, yPeriod, guide) {
	        var data = dataFn();
	        var utc = guide ? guide.utcTime : false;

	        var domainX = _utils.utils.unique(data.map(function (x) {
	            return x[dimX];
	        }), unify);
	        var domainY = _utils.utils.unique(data.map(function (x) {
	            return x[dimY];
	        }), unify);

	        var domX = domainX.length === 0 ? [null] : domainX;
	        var domY = domainY.length === 0 ? [null] : domainY;

	        if (xPeriod) {
	            domX = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(Math.min.apply(Math, _toConsumableArray(domainX)), Math.max.apply(Math, _toConsumableArray(domainX)), xPeriod, { utc: utc });
	        }

	        if (yPeriod) {
	            domY = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(Math.min.apply(Math, _toConsumableArray(domainY)), Math.max.apply(Math, _toConsumableArray(domainY)), yPeriod, { utc: utc });
	        }

	        return domY.reduce(function (memo, rowVal) {

	            return memo.concat(domX.map(function (colVal) {

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
	        var domainX = _utils.utils.unique(data.map(function (x) {
	            return x[dim];
	        }), unify);
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
/* 18 */
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

	var PERIODS_MAP_UTC = {

	    day: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            return new Date(date.setUTCHours(0, 0, 0, 0));
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setUTCDate(prev.getUTCDate() + 1));
	            return this.cast(next);
	        }
	    },

	    week: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setUTCHours(0, 0, 0, 0));
	            return new Date(date.setUTCDate(date.getUTCDate() - date.getUTCDay()));
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setUTCDate(prev.getUTCDate() + 7));
	            return this.cast(next);
	        }
	    },

	    month: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setUTCHours(0, 0, 0, 0));
	            date = new Date(date.setUTCDate(1));
	            return date;
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setUTCMonth(prev.getUTCMonth() + 1));
	            return this.cast(next);
	        }
	    },

	    quarter: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setUTCHours(0, 0, 0, 0));
	            date = new Date(date.setUTCDate(1));
	            var currentMonth = date.getUTCMonth();
	            var firstQuarterMonth = currentMonth - currentMonth % 3;
	            return new Date(date.setUTCMonth(firstQuarterMonth));
	        },
	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setUTCMonth(prev.getUTCMonth() + 3));
	            return this.cast(next);
	        }
	    },

	    year: {
	        cast: function cast(d) {
	            var date = new Date(d);
	            date = new Date(date.setUTCHours(0, 0, 0, 0));
	            date = new Date(date.setUTCDate(1));
	            date = new Date(date.setUTCMonth(0));
	            return date;
	        },

	        next: function next(d) {
	            var prev = new Date(d);
	            var next = new Date(prev.setUTCFullYear(prev.getUTCFullYear() + 1));
	            return this.cast(next);
	        }
	    }
	};

	var UnitDomainPeriodGenerator = {

	    add: function add(periodAlias, obj) {
	        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { utc: false },
	            utc = _ref.utc;

	        (utc ? PERIODS_MAP_UTC : PERIODS_MAP)[periodAlias.toLowerCase()] = obj;
	        return this;
	    },

	    get: function get(periodAlias) {
	        var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { utc: false },
	            utc = _ref2.utc;

	        var alias = periodAlias || '';
	        return (utc ? PERIODS_MAP_UTC : PERIODS_MAP)[alias.toLowerCase()] || null;
	    },

	    generate: function generate(lTick, rTick, periodAlias) {
	        var _ref3 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { utc: false },
	            utc = _ref3.utc;

	        var r = [];
	        var period = UnitDomainPeriodGenerator.get(periodAlias, { utc: utc });
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.DataFrame = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DataFrame = exports.DataFrame = function () {
	    function DataFrame(_ref, dataSource) {
	        var key = _ref.key,
	            pipe = _ref.pipe,
	            source = _ref.source,
	            units = _ref.units;
	        var transformations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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
	            var pipeMapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (x) {
	                return x;
	            };

	            return this._frame.pipe.map(pipeMapper).reduce(this._pipeReducer, this._data);
	        }
	    }]);

	    return DataFrame;
	}();

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Plot = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _balloon = __webpack_require__(21);

	var _event = __webpack_require__(6);

	var _plugins = __webpack_require__(24);

	var _utils = __webpack_require__(3);

	var _utilsDom = __webpack_require__(1);

	var _d3Decorators = __webpack_require__(9);

	var _grammarRegistry = __webpack_require__(7);

	var _unitsRegistry = __webpack_require__(25);

	var _scalesRegistry = __webpack_require__(26);

	var _scalesFactory = __webpack_require__(27);

	var _dataProcessor = __webpack_require__(28);

	var _layuotTemplate = __webpack_require__(29);

	var _specConverter = __webpack_require__(30);

	var _specTransformAutoLayout = __webpack_require__(31);

	var _specTransformCalcSize = __webpack_require__(33);

	var _specTransformApplyRatio = __webpack_require__(35);

	var _specTransformExtractAxes = __webpack_require__(36);

	var _const = __webpack_require__(22);

	var _tau = __webpack_require__(16);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _taskRunner = __webpack_require__(37);

	var _taskRunner2 = _interopRequireDefault(_taskRunner);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var selectOrAppend = _utilsDom.utilsDom.selectOrAppend;
	var selectImmediate = _utilsDom.utilsDom.selectImmediate;

	var Plot = exports.Plot = function (_Emitter) {
	    _inherits(Plot, _Emitter);

	    function Plot(config) {
	        _classCallCheck(this, Plot);

	        var _this = _possibleConstructorReturn(this, (Plot.__proto__ || Object.getPrototypeOf(Plot)).call(this));

	        _this._nodes = [];
	        _this._svg = null;
	        _this._filtersStore = {
	            filters: {},
	            tick: 0
	        };
	        _this._layout = (0, _layuotTemplate.getLayout)();

	        var iref = 0;
	        config.settings = Plot.setupSettings(_utils.utils.defaults(config.settings || {}, {
	            references: new WeakMap(),
	            refCounter: function refCounter() {
	                return ++iref;
	            }
	        }));

	        if (['sources', 'scales'].filter(function (p) {
	            return config.hasOwnProperty(p);
	        }).length === 2) {
	            _this.configGPL = config;
	        } else {
	            _this.configGPL = new _specConverter.SpecConverter(_this.setupConfig(config)).convert();
	        }

	        _this.configGPL = Plot.setupPeriodData(_this.configGPL);

	        var plugins = config.plugins || [];

	        _this.transformers = [_specTransformApplyRatio.SpecTransformApplyRatio, _specTransformAutoLayout.SpecTransformAutoLayout];

	        _this.onUnitsStructureExpandedTransformers = [_specTransformExtractAxes.SpecTransformExtractAxes, _specTransformCalcSize.SpecTransformCalcSize];

	        _this._originData = Object.assign({}, _this.configGPL.sources);
	        _this._chartDataModel = function (src) {
	            return src;
	        };
	        _this._liveSpec = _this.configGPL;
	        _this._plugins = new _plugins.Plugins(plugins, _this);

	        _this._reportProgress = null;
	        _this._taskRunner = null;
	        _this._renderingPhase = null;
	        return _this;
	    }

	    _createClass(Plot, [{
	        key: 'destroy',
	        value: function destroy() {
	            this.destroyNodes();
	            _d2.default.select(this._svg).remove();
	            _d2.default.select(this._layout.layout).remove();
	            this._cancelRendering();
	            _get(Plot.prototype.__proto__ || Object.getPrototypeOf(Plot.prototype), 'destroy', this).call(this);
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

	            var resConfig = _utils.utils.defaults(config, {
	                spec: {},
	                data: [],
	                plugins: [],
	                settings: {}
	            });

	            this._emptyContainer = config.emptyContainer || '';

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
	        key: 'destroyNodes',
	        value: function destroyNodes() {
	            this._nodes.forEach(function (node) {
	                return node.destroy();
	            });
	            this._nodes = [];
	            this._renderedItems = [];
	        }
	    }, {
	        key: 'onUnitDraw',
	        value: function onUnitDraw(unitNode) {
	            var _this2 = this;

	            this._nodes.push(unitNode);
	            this.fire('unitdraw', unitNode);
	            ['click', 'mouseover', 'mouseout'].forEach(function (eventName) {
	                return unitNode.on(eventName, function (sender, e) {
	                    _this2.fire('element' + eventName, {
	                        element: sender,
	                        data: e.data,
	                        event: e.event
	                    });
	                });
	            });
	        }
	    }, {
	        key: 'onUnitsStructureExpanded',
	        value: function onUnitsStructureExpanded(specRef) {
	            var _this3 = this;

	            this.onUnitsStructureExpandedTransformers.forEach(function (TClass) {
	                return new TClass(specRef).transform(_this3);
	            });
	            this.fire(['units', 'structure', 'expanded'].join(''), specRef);
	        }
	    }, {
	        key: '_getClosestElementPerUnit',
	        value: function _getClosestElementPerUnit(x0, y0) {
	            return this._renderedItems.filter(function (d) {
	                return d.getClosestElement;
	            }).map(function (item) {
	                var closest = item.getClosestElement(x0, y0);
	                var unit = item.node();
	                return { unit: unit, closest: closest };
	            });
	        }
	    }, {
	        key: 'disablePointerEvents',
	        value: function disablePointerEvents() {
	            this._layout.layout.style.pointerEvents = 'none';
	        }
	    }, {
	        key: 'enablePointerEvents',
	        value: function enablePointerEvents() {
	            this._layout.layout.style.pointerEvents = '';
	        }
	    }, {
	        key: '_handlePointerEvent',
	        value: function _handlePointerEvent(event) {
	            // TODO: Highlight API seems not consistent.
	            // Just predicate is not enough, also
	            // need coordinates or event object.
	            var svgRect = this._svg.getBoundingClientRect();
	            var x = event.clientX - svgRect.left;
	            var y = event.clientY - svgRect.top;
	            var eventType = event.type;
	            var isClick = eventType === 'click';
	            var dataEvent = isClick ? 'data-click' : 'data-hover';
	            var data = null;
	            var node = null;
	            var items = this._getClosestElementPerUnit(x, y);
	            var nonEmpty = items.filter(function (d) {
	                return d.closest;
	            }).sort(function (a, b) {
	                return a.closest.distance === b.closest.distance ? a.closest.secondaryDistance - b.closest.secondaryDistance : a.closest.distance - b.closest.distance;
	            });
	            if (nonEmpty.length > 0) {
	                var largerDistIndex = nonEmpty.findIndex(function (d) {
	                    return d.closest.distance !== nonEmpty[0].closest.distance || d.closest.secondaryDistance !== nonEmpty[0].closest.secondaryDistance;
	                });
	                var sameDistItems = largerDistIndex < 0 ? nonEmpty : nonEmpty.slice(0, largerDistIndex);
	                if (sameDistItems.length === 1) {
	                    data = sameDistItems[0].closest.data;
	                    node = sameDistItems[0].closest.node;
	                } else {
	                    var mx = sameDistItems.reduce(function (sum, item) {
	                        return sum + item.closest.x;
	                    }, 0) / sameDistItems.length;
	                    var my = sameDistItems.reduce(function (sum, item) {
	                        return sum + item.closest.y;
	                    }, 0) / sameDistItems.length;
	                    var angle = Math.atan2(my - y, mx - x) + Math.PI;
	                    var closest = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)].closest;

	                    data = closest.data;
	                    node = closest.node;
	                }
	            }

	            items.forEach(function (item) {
	                return item.unit.fire(dataEvent, { event: event, data: data, node: node });
	            });
	        }
	    }, {
	        key: '_initPointerEvents',
	        value: function _initPointerEvents() {
	            var _this4 = this;

	            if (!this._liveSpec.settings.syncPointerEvents) {
	                this._pointerAnimationFrameId = null;
	            }
	            var svg = _d2.default.select(this._svg);
	            var wrapEventHandler = this._liveSpec.settings.syncPointerEvents ? function (handler) {
	                return function () {
	                    return handler(_d2.default.event);
	                };
	            } : function (handler) {
	                return function () {
	                    var e = _d2.default.event;
	                    if (_this4._pointerAnimationFrameId && e.type !== 'mousemove') {
	                        _this4._cancelPointerAnimationFrame();
	                    }
	                    if (!_this4._pointerAnimationFrameId) {
	                        _this4._pointerAnimationFrameId = requestAnimationFrame(function () {
	                            _this4._pointerAnimationFrameId = null;
	                            handler(e);
	                        });
	                    }
	                };
	            };
	            var handler = function handler(e) {
	                return _this4._handlePointerEvent(e);
	            };
	            svg.on('mousemove', wrapEventHandler(handler));
	            svg.on('click', wrapEventHandler(handler));
	            svg.on('mouseleave', wrapEventHandler(function (event) {
	                if (window.getComputedStyle(_this4._svg).pointerEvents !== 'none') {
	                    _this4.select(function () {
	                        return true;
	                    }).forEach(function (unit) {
	                        return unit.fire('data-hover', { event: event, data: null, node: null });
	                    });
	                }
	            }));
	        }
	    }, {
	        key: '_cancelPointerAnimationFrame',
	        value: function _cancelPointerAnimationFrame() {
	            cancelAnimationFrame(this._pointerAnimationFrameId);
	            this._pointerAnimationFrameId = null;
	        }
	    }, {
	        key: '_setupTaskRunner',
	        value: function _setupTaskRunner(liveSpec) {
	            var _this5 = this;

	            this._resetTaskRunner();
	            this._taskRunner = new _taskRunner2.default({
	                timeout: liveSpec.settings.renderingTimeout || Number.MAX_SAFE_INTEGER,
	                syncInterval: liveSpec.settings.asyncRendering ? liveSpec.settings.syncRenderingInterval : Number.MAX_SAFE_INTEGER,
	                callbacks: {
	                    done: function done() {
	                        _this5._completeRendering();
	                        _this5._renderingPhase = null;
	                    },
	                    timeout: function timeout(_timeout, taskRunner) {
	                        _this5._displayTimeoutWarning({
	                            timeout: _timeout,
	                            proceed: function proceed() {
	                                _this5.disablePointerEvents();
	                                taskRunner.setTimeout(Number.MAX_SAFE_INTEGER);
	                                taskRunner.run();
	                            },
	                            cancel: function cancel() {
	                                _this5._cancelRendering();
	                            }
	                        });
	                        _this5.enablePointerEvents();
	                        _this5.fire('renderingtimeout');
	                    },
	                    progress: function progress(_progress) {
	                        var phases = {
	                            spec: 0,
	                            draw: 1
	                        };
	                        var p = phases[_this5._renderingPhase] / 2 + _progress / 2;
	                        _this5._reportProgress(p);
	                    },
	                    error: liveSpec.settings.handleRenderingErrors ? function (err) {
	                        _this5._cancelRendering();
	                        _this5._displayRenderingError(err);
	                        _this5.fire('renderingerror', err);
	                        liveSpec.settings.log(['An error occured during chart rendering.', 'Set "handleRenderingErrors: false" in chart settings to debug.', 'Error message: ' + err.message].join(' '), 'ERROR');
	                    } : null
	                }
	            });
	            return this._taskRunner;
	        }
	    }, {
	        key: '_resetTaskRunner',
	        value: function _resetTaskRunner() {
	            if (this._taskRunner && this._taskRunner.isRunning()) {
	                this._taskRunner.stop();
	                this._taskRunner = null;
	            }
	        }
	    }, {
	        key: 'renderTo',
	        value: function renderTo(target, xSize) {

	            this._resetProgressLayout();

	            var liveSpec = this._createLiveSpec(target, xSize);
	            if (!liveSpec) {
	                this._svg = null;
	                this._layout.content.innerHTML = this._emptyContainer;
	                this.enablePointerEvents();
	                return;
	            }

	            var gpl = this._createGPL(liveSpec);

	            var taskRunner = this._setupTaskRunner(liveSpec);
	            this._scheduleDrawScenario(taskRunner, gpl);
	            this._scheduleDrawing(taskRunner, gpl);
	            taskRunner.run();
	        }
	    }, {
	        key: '_createLiveSpec',
	        value: function _createLiveSpec(target, xSize) {
	            var _this6 = this;

	            this.disablePointerEvents();
	            this._target = target;
	            this._defaultSize = Object.assign({}, xSize);

	            var targetNode = _d2.default.select(target).node();
	            if (targetNode === null) {
	                throw new Error('Target element not found');
	            }

	            if (this._layout.layout.parentNode !== targetNode) {
	                targetNode.appendChild(this._layout.layout);
	            }

	            var content = this._layout.content;

	            // Set padding to fit scrollbar size
	            var s = _utilsDom.utilsDom.getScrollbarSize(this._layout.contentContainer);
	            this._layout.contentContainer.style.padding = '0 ' + s.width + 'px ' + s.height + 'px 0';
	            _utilsDom.utilsDom.setScrollPadding(this._layout.rightSidebarContainer, 'vertical');

	            var size = Object.assign({}, xSize) || {};
	            if (!size.width || !size.height) {
	                var _content$parentElemen = content.parentElement,
	                    scrollLeft = _content$parentElemen.scrollLeft,
	                    scrollTop = _content$parentElemen.scrollTop;

	                content.style.display = 'none';
	                size = _utils.utils.defaults(size, _utilsDom.utilsDom.getContainerSize(content.parentNode));
	                content.style.display = '';
	                content.parentElement.scrollLeft = scrollLeft;
	                content.parentElement.scrollTop = scrollTop;
	                // TODO: fix this issue
	                if (!size.height) {
	                    size.height = _utilsDom.utilsDom.getContainerSize(this._layout.layout).height;
	                }
	            }

	            this.configGPL.settings.size = size;

	            this._liveSpec = _utils.utils.clone(_utils.utils.omit(this.configGPL, 'plugins'));
	            this._liveSpec.sources = this.getDataSources();
	            this._liveSpec.settings = this.configGPL.settings;

	            this._experimentalSetupAnimationSpeed(this._liveSpec);

	            if (this.isEmptySources(this._liveSpec.sources)) {
	                return null;
	            }

	            this._liveSpec = this.transformers.reduce(function (memo, TransformClass) {
	                return new TransformClass(memo).transform(_this6);
	            }, this._liveSpec);

	            this.destroyNodes();

	            this.fire('specready', this._liveSpec);

	            return this._liveSpec;
	        }
	    }, {
	        key: '_experimentalSetupAnimationSpeed',
	        value: function _experimentalSetupAnimationSpeed(spec) {
	            // Determine if it's better to draw chart without animation
	            spec.settings.initialAnimationSpeed = spec.settings.initialAnimationSpeed || spec.settings.animationSpeed;
	            var animationSpeed = spec.settings.experimentalShouldAnimate(spec) ? spec.settings.initialAnimationSpeed : 0;
	            spec.settings.animationSpeed = animationSpeed;
	            var setUnitAnimation = function setUnitAnimation(u) {
	                u.guide = u.guide || {};
	                u.guide.animationSpeed = animationSpeed;
	                if (u.units) {
	                    u.units.forEach(setUnitAnimation);
	                }
	            };
	            setUnitAnimation(spec.unit);
	        }
	    }, {
	        key: '_createGPL',
	        value: function _createGPL(liveSpec) {
	            var gpl = new _tau.GPL(liveSpec, this.getScaleFactory(), _unitsRegistry.unitsRegistry, _grammarRegistry.GrammarRegistry);
	            var structure = gpl.unfoldStructure();
	            this.onUnitsStructureExpanded(structure);

	            return gpl;
	        }
	    }, {
	        key: '_scheduleDrawScenario',
	        value: function _scheduleDrawScenario(taskRunner, gpl) {
	            var _this7 = this;

	            var d3Target = _d2.default.select(this._layout.content);
	            var newSize = gpl.config.settings.size;
	            taskRunner.addTask(function () {
	                return _this7._renderingPhase = 'spec';
	            });
	            gpl.getDrawScenarioQueue({
	                allocateRect: function allocateRect() {
	                    return {
	                        slot: function slot(uid) {
	                            return d3Target.selectAll('.uid_' + uid);
	                        },
	                        frameId: 'root',
	                        left: 0,
	                        top: 0,
	                        width: newSize.width,
	                        containerWidth: newSize.width,
	                        height: newSize.height,
	                        containerHeight: newSize.height
	                    };
	                }
	            }).forEach(function (task) {
	                return taskRunner.addTask(task);
	            });
	        }
	    }, {
	        key: '_scheduleDrawing',
	        value: function _scheduleDrawing(taskRunner, gpl) {
	            var _this8 = this;

	            var newSize = gpl.config.settings.size;
	            taskRunner.addTask(function (scenario) {
	                _this8._renderingPhase = 'draw';
	                _this8._renderRoot({ scenario: scenario, newSize: newSize });
	                _this8._cancelPointerAnimationFrame();
	                _this8._scheduleRenderScenario(scenario);
	            });
	        }
	    }, {
	        key: '_resetProgressLayout',
	        value: function _resetProgressLayout() {
	            this._createProgressBar();
	            this._clearRenderingError();
	            this._clearTimeoutWarning();
	        }
	    }, {
	        key: '_renderRoot',
	        value: function _renderRoot(_ref) {
	            var _this9 = this;

	            var scenario = _ref.scenario,
	                newSize = _ref.newSize;

	            var d3Target = _d2.default.select(this._layout.content);
	            var frameRootId = scenario[0].config.uid;
	            var svg = selectOrAppend(d3Target, 'svg').attr({
	                width: Math.floor(newSize.width),
	                height: Math.floor(newSize.height)
	            });
	            if (!svg.attr('class')) {
	                svg.attr('class', _const.CSS_PREFIX + 'svg');
	            }
	            this._svg = svg.node();
	            this._initPointerEvents();
	            this.fire('beforerender', this._svg);
	            var roots = svg.selectAll('g.frame-root').data([frameRootId], function (x) {
	                return x;
	            });

	            // NOTE: Fade out removed root, fade-in if removing interrupted.
	            roots.enter().append('g').classed(_const.CSS_PREFIX + 'cell cell frame-root uid_' + frameRootId, true);
	            roots.call(function (selection) {
	                selection.classed('tau-active', true);
	                (0, _d3Decorators.d3_transition)(selection, _this9.configGPL.settings.animationSpeed, 'frameRootToggle').attr('opacity', 1);
	            });
	            roots.exit().call(function (selection) {
	                selection.classed('tau-active', false);
	                (0, _d3Decorators.d3_transition)(selection, _this9.configGPL.settings.animationSpeed, 'frameRootToggle').attr('opacity', 1e-6).remove();
	            });
	        }
	    }, {
	        key: '_scheduleRenderScenario',
	        value: function _scheduleRenderScenario(scenario) {
	            var _this10 = this;

	            scenario.forEach(function (item) {
	                _this10._taskRunner.addTask(function () {
	                    item.draw();
	                    _this10.onUnitDraw(item.node());
	                    _this10._renderedItems.push(item);
	                });
	            });
	        }
	    }, {
	        key: '_completeRendering',
	        value: function _completeRendering() {
	            // TODO: Render panels before chart, to
	            // prevent chart size shrink. Use some other event.
	            _utilsDom.utilsDom.setScrollPadding(this._layout.contentContainer);
	            this._layout.rightSidebar.style.maxHeight = this._liveSpec.settings.size.height + 'px';
	            this.enablePointerEvents();
	            if (this._svg) {
	                this.fire('render', this._svg);
	            }

	            // NOTE: After plugins have rendered, the panel scrollbar may appear, so need to handle it again.
	            _utilsDom.utilsDom.setScrollPadding(this._layout.rightSidebarContainer, 'vertical');
	        }
	    }, {
	        key: '_cancelRendering',
	        value: function _cancelRendering() {
	            this.enablePointerEvents();
	            this._resetTaskRunner();
	            this._cancelPointerAnimationFrame();
	        }
	    }, {
	        key: '_createProgressBar',
	        value: function _createProgressBar() {
	            var header = _d2.default.select(this._layout.header);
	            var progressBar = selectOrAppend(header, 'div.' + _const.CSS_PREFIX + 'progress');
	            progressBar.select('div.' + _const.CSS_PREFIX + 'progress__value').remove();
	            var progressValue = progressBar.append('div').classed(_const.CSS_PREFIX + 'progress__value', true).style('width', 0);
	            this._reportProgress = function (value) {
	                requestAnimationFrame(function () {
	                    progressBar.classed(_const.CSS_PREFIX + 'progress_active', value < 1);
	                    progressValue.style('width', value * 100 + '%');
	                });
	            };
	        }
	    }, {
	        key: '_displayRenderingError',
	        value: function _displayRenderingError() {
	            this._layout.layout.classList.add(_const.CSS_PREFIX + 'layout_rendering-error');
	        }
	    }, {
	        key: '_clearRenderingError',
	        value: function _clearRenderingError() {
	            this._layout.layout.classList.remove(_const.CSS_PREFIX + 'layout_rendering-error');
	        }
	    }, {
	        key: 'getScaleFactory',
	        value: function getScaleFactory() {
	            var dataSources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	            return new _scalesFactory.ScalesFactory(_scalesRegistry.scalesRegistry.instance(this._liveSpec.settings), dataSources || this._liveSpec.sources, this._liveSpec.scales);
	        }
	    }, {
	        key: 'getScaleInfo',
	        value: function getScaleInfo(name) {
	            var dataFrame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	            return this.getScaleFactory().createScaleInfoByName(name, dataFrame);
	        }
	    }, {
	        key: 'getSourceFiltersIterator',
	        value: function getSourceFiltersIterator(rejectFiltersPredicate) {
	            var _this11 = this;

	            var filters = _utils.utils.flatten(Object.keys(this._filtersStore.filters).map(function (key) {
	                return _this11._filtersStore.filters[key];
	            })).filter(function (f) {
	                return !rejectFiltersPredicate(f);
	            }).map(function (x) {
	                return x.predicate;
	            });

	            return function (row) {
	                return filters.reduce(function (prev, f) {
	                    return prev && f(row);
	                }, true);
	            };
	        }
	    }, {
	        key: 'getDataSources',
	        value: function getDataSources() {
	            var _this12 = this;

	            var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	            var excludeFiltersByTagAndSource = function excludeFiltersByTagAndSource(k) {
	                return function (f) {
	                    return param.excludeFilter && param.excludeFilter.indexOf(f.tag) !== -1 || f.src !== k;
	                };
	            };

	            var chartDataModel = this._chartDataModel(this._originData);

	            return Object.keys(chartDataModel).filter(function (k) {
	                return k !== '?';
	            }).reduce(function (memo, k) {
	                var item = chartDataModel[k];
	                var filterIterator = _this12.getSourceFiltersIterator(excludeFiltersByTagAndSource(k));
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
	            var param = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	            var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';

	            var sources = this.getDataSources(param);
	            return sources[src].data;
	        }
	    }, {
	        key: 'getDataDims',
	        value: function getDataDims() {
	            var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

	            return this._originData[src].dims;
	        }
	    }, {
	        key: 'getData',
	        value: function getData() {
	            var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';

	            return this._originData[src].data;
	        }
	    }, {
	        key: 'setData',
	        value: function setData(data) {
	            var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';

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
	            var _this13 = this;

	            Object.keys(this._filtersStore.filters).map(function (key) {
	                _this13._filtersStore.filters[key] = _this13._filtersStore.filters[key].filter(function (item) {
	                    return item.id !== id;
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
	            var sizes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
	    }, {
	        key: '_displayTimeoutWarning',
	        value: function _displayTimeoutWarning(_ref2) {
	            var _this14 = this;

	            var proceed = _ref2.proceed,
	                cancel = _ref2.cancel,
	                timeout = _ref2.timeout;

	            var width = 200;
	            var height = 100;
	            var linesCount = 3;
	            var lineSpacing = 1.5;
	            var midX = width / 2;
	            var fontSize = Math.round(height / linesCount / lineSpacing);
	            var getY = function getY(line) {
	                return Math.round(height / linesCount / lineSpacing * line);
	            };
	            this._layout.content.style.height = '100%';
	            this._layout.content.insertAdjacentHTML('beforeend', '\n            <div class="' + _const.CSS_PREFIX + 'rendering-timeout-warning">\n            <svg\n                viewBox="0 0 ' + width + ' ' + height + '">\n                <text\n                    text-anchor="middle"\n                    font-size="' + fontSize + '">\n                    <tspan x="' + midX + '" y="' + getY(1) + '">Rendering took more than ' + Math.round(timeout) / 1000 + 's</tspan>\n                    <tspan x="' + midX + '" y="' + getY(2) + '">Would you like to continue?</tspan>\n                </text>\n                <text\n                    class="' + _const.CSS_PREFIX + 'rendering-timeout-continue-btn"\n                    text-anchor="end"\n                    font-size="' + fontSize + '"\n                    cursor="pointer"\n                    text-decoration="underline"\n                    x="' + (midX - fontSize / 3) + '"\n                    y="' + getY(3) + '">\n                    Continue\n                </text>\n                <text\n                    class="' + _const.CSS_PREFIX + 'rendering-timeout-cancel-btn"\n                    text-anchor="start"\n                    font-size="' + fontSize + '"\n                    cursor="pointer"\n                    text-decoration="underline"\n                    x="' + (midX + fontSize / 3) + '"\n                    y="' + getY(3) + '">\n                    Cancel\n                </text>\n            </svg>\n            </div>\n        ');
	            this._layout.content.querySelector('.' + _const.CSS_PREFIX + 'rendering-timeout-continue-btn').addEventListener('click', function () {
	                _this14._clearTimeoutWarning();
	                proceed.call(_this14);
	            });
	            this._layout.content.querySelector('.' + _const.CSS_PREFIX + 'rendering-timeout-cancel-btn').addEventListener('click', function () {
	                _this14._clearTimeoutWarning();
	                cancel.call(_this14);
	            });
	        }
	    }, {
	        key: '_clearTimeoutWarning',
	        value: function _clearTimeoutWarning() {
	            var warning = selectImmediate(this._layout.content, '.' + _const.CSS_PREFIX + 'rendering-timeout-warning');
	            if (warning) {
	                this._layout.content.removeChild(warning);
	                this._layout.content.style.height = '';
	            }
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
	                var periodCaster = tickPeriod.get(scaleRef.period, { utc: spec.settings.utcTime });
	                if (periodCaster) {
	                    memo.push({ source: scaleRef.source, dim: scaleRef.dim, period: periodCaster });
	                } else {
	                    log(['Unknown period "' + scaleRef.period + '".', 'Docs: http://api.taucharts.com/plugins/customticks.html#how-to-add-custom-tick-period'], 'WARN');
	                    scaleRef.period = null;
	                }

	                return memo;
	            }, []);

	            var isNullOrUndefined = function isNullOrUndefined(x) {
	                return x === null || x === undefined;
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
	            var localSettings = Object.keys(globalSettings).reduce(function (memo, k) {
	                memo[k] = typeof globalSettings[k] === 'function' ? globalSettings[k] : _utils.utils.clone(globalSettings[k]);
	                return memo;
	            }, {});

	            var r = _utils.utils.defaults(configSettings || {}, localSettings);

	            if (!Array.isArray(r.specEngine)) {
	                r.specEngine = [{ width: Number.MAX_VALUE, name: r.specEngine }];
	            }

	            return r;
	        }
	    }]);

	    return Plot;
	}(_event.Emitter);

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Tooltip = undefined;

	var _const = __webpack_require__(22);

	var _tauTooltip = __webpack_require__(23);

	_tauTooltip.Tooltip.defaults.baseClass = _const.CSS_PREFIX + 'tooltip';
	exports.Tooltip = _tauTooltip.Tooltip;

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var CSS_PREFIX = exports.CSS_PREFIX = 'graphical-report__';

/***/ },
/* 23 */
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
/* 24 */
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
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.unitsRegistry = undefined;

	var _error = __webpack_require__(8);

	var UnitsMap = {};
	var SeedsMap = {};

	var unitsRegistry = {
	    reg: function reg(unitType, xUnit, xSeed) {

	        if (xSeed) {
	            SeedsMap[unitType] = xSeed;
	            UnitsMap[unitType] = function (config, Base) {
	                this.___tauchartsseed___ = new Base(this.init(config));
	            };
	            UnitsMap[unitType].prototype = Object.assign({
	                init: function init(config) {
	                    return config;
	                },
	                defineGrammarModel: function defineGrammarModel(params) {
	                    return this.node().defineGrammarModel(params);
	                },
	                getGrammarRules: function getGrammarRules(grammarModel) {
	                    return this.node().getGrammarRules(grammarModel);
	                },
	                getAdjustScalesRules: function getAdjustScalesRules(grammarModel) {
	                    return this.node().getAdjustScalesRules(grammarModel);
	                },
	                createScreenModel: function createScreenModel(grammarModel) {
	                    return this.node().createScreenModel(grammarModel);
	                },
	                addInteraction: function addInteraction() {
	                    this.node().addInteraction();
	                },
	                node: function node() {
	                    return this.___tauchartsseed___;
	                },
	                draw: function draw() {
	                    this.node().draw();
	                }
	            }, xUnit);
	        } else {
	            UnitsMap[unitType] = xUnit;
	        }
	        return this;
	    },
	    get: function get(unitType) {

	        if (!UnitsMap.hasOwnProperty(unitType)) {
	            throw new _error.TauChartError('Unknown unit type: ' + unitType, _error.errorCodes.UNKNOWN_UNIT_TYPE);
	        }

	        return UnitsMap[unitType];
	    },
	    create: function create(unitType, unitConfig) {
	        var Unit = this.get(unitType);
	        var node;
	        if (SeedsMap[unitType]) {
	            var Base = this.get(SeedsMap[unitType]);
	            node = new Unit(unitConfig, Base);
	        } else {
	            node = new Unit(unitConfig);
	        }

	        return node;
	    }
	};

	exports.unitsRegistry = unitsRegistry;

/***/ },
/* 26 */
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
	            var configInterceptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x) {
	                return x;
	            };

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
	            var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ScalesFactory = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dataFrame = __webpack_require__(19);

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
	            var dataFrame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


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
	            var dataFrame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	            return this.createScaleInfo(this.scales[name], dataFrame);
	        }
	    }]);

	    return ScalesFactory;
	}();

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.DataProcessor = undefined;

	var _utils = __webpack_require__(3);

	var DataProcessor = {

	    isYFunctionOfX: function isYFunctionOfX(data, xFields, yFields) {
	        var isRelationAFunction = true;
	        var error = null;
	        // domain should has only 1 value from range
	        try {
	            data.reduce(function (memo, item) {

	                var fnVar = function fnVar(hash, f) {
	                    var propValue = item[f];
	                    var hashValue = _utils.utils.isObject(propValue) ? JSON.stringify(propValue) : propValue;
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
	            r[k] = Object.assign({}, item, {
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

	            if (_utils.utils.isDate(propertyValue)) {
	                pair.type = 'measure';
	                pair.scale = 'time';
	            } else if (_utils.utils.isObject(propertyValue)) {
	                pair.type = 'order';
	                pair.scale = 'ordinal';
	            } else if (Number.isFinite(propertyValue)) {
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

	        return data.reduce(reducer, {});
	    },

	    sortByDim: function sortByDim(data, dimName, dimInfo) {
	        var rows = data;

	        var interceptor = ['period', 'time'].indexOf(dimInfo.scale) >= 0 ? function (x) {
	            return new Date(x);
	        } : function (x) {
	            return x;
	        };

	        if (dimInfo.type === 'measure' || dimInfo.scale === 'period') {
	            rows = data.map(function (r) {
	                return r;
	            }).sort(function (a, b) {
	                return interceptor(a[dimName]) - interceptor(b[dimName]);
	            });
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getLayout = undefined;

	var _const = __webpack_require__(22);

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
	        contentContainer: contentContainer,
	        leftSidebar: leftSidebar,
	        rightSidebar: rightSidebar,
	        rightSidebarContainer: rightSidebarContainer,
	        footer: footer
	    };
	    /* jshint ignore:end */
	};

	exports.getLayout = getLayout;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecConverter = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

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
	                'color_null': { type: 'color', source: '?' },
	                'split_null': { type: 'value', source: '?' },

	                'pos:default': { type: 'ordinal', source: '?' },
	                'size:default': { type: 'size', source: '?' },
	                'label:default': { type: 'value', source: '?' },
	                'color:default': { type: 'color', source: '?' },
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

	            var settings = spec.settings || {};

	            var traverse = function traverse(node, iterator, parentNode) {
	                iterator(node, parentNode);
	                (node.units || []).map(function (x) {
	                    return traverse(x, iterator, node);
	                });
	            };

	            var iterator = function iterator(childUnit, root) {

	                childUnit.namespace = 'chart';
	                childUnit.guide = _utils.utils.defaults(childUnit.guide || {}, {
	                    animationSpeed: settings.animationSpeed || 0,
	                    utcTime: settings.utcTime || false
	                });

	                // leaf elements should inherit coordinates properties
	                if (root && !childUnit.hasOwnProperty('units')) {
	                    childUnit = _utils.utils.defaults(childUnit, { x: root.x, y: root.y });

	                    var parentGuide = _utils.utils.clone(root.guide) || {};
	                    childUnit.guide.x = _utils.utils.defaults(childUnit.guide.x || {}, parentGuide.x);
	                    childUnit.guide.y = _utils.utils.defaults(childUnit.guide.y || {}, parentGuide.y);

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
	                var rowKey = row[key];
	                if (_utils.utils.isObject(rowKey) && !_utils.utils.isDate(rowKey)) {
	                    Object.keys(rowKey).forEach(function (k) {
	                        return row[key + '.' + k] = rowKey[k];
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
	                var gplRoot = _utils.utils.clone(_utils.utils.omit(srcUnit, 'unit'));
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
	            ['identity', 'color', 'size', 'label', 'x', 'y', 'split'].forEach(function (p) {
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

	            if (scaleType === 'identity' && dimName !== null) {
	                item = {
	                    type: 'identity',
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

	            return Object.assign({ inherit: true, source: '/' }, expr);
	        }
	    }]);

	    return SpecConverter;
	}();

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformAutoLayout = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

	var _formatterRegistry = __webpack_require__(32);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

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
	    properties.forEach(function (prop) {
	        Object.assign(targetUnit.guide[dimension][prop], guide_dim[prop]);
	    });
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

	    Object.keys(config).forEach(function (name) {
	        var properties = config[name];
	        extendGuide(guide, targetUnit, name, properties);
	    });
	    Object.assign(targetUnit.guide, Object.keys(guide).reduce(function (obj, k) {
	        if (!config.hasOwnProperty(k)) {
	            obj[k] = guide[k];
	        }
	        return obj;
	    }, {}));

	    return targetUnit;
	};

	var extendLabel = function extendLabel(guide, dimension, extend) {
	    guide[dimension] = _utils.utils.defaults(guide[dimension] || {}, {
	        label: ''
	    });
	    guide[dimension].label = _utils.utils.isObject(guide[dimension].label) ? guide[dimension].label : { text: guide[dimension].label };
	    guide[dimension].label = _utils.utils.defaults(guide[dimension].label, extend || {}, {
	        padding: 32,
	        rotate: 0,
	        textAnchor: 'middle',
	        cssClass: 'label',
	        dock: null
	    });

	    return guide[dimension];
	};
	var extendAxis = function extendAxis(guide, dimension, extend) {
	    guide[dimension] = _utils.utils.defaults(guide[dimension], extend || {}, {
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
	    node.guide.padding = _utils.utils.defaults(node.guide.padding || {}, { l: 0, b: 0, r: 0, t: 0 });

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
	        childUnit = _utils.utils.defaults(childUnit, root);
	        childUnit.guide = _utils.utils.defaults(childUnit.guide, _utils.utils.clone(root.guide));
	        childUnit.guide.x = _utils.utils.defaults(childUnit.guide.x, _utils.utils.clone(root.guide.x));
	        childUnit.guide.y = _utils.utils.defaults(childUnit.guide.y, _utils.utils.clone(root.guide.y));
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

	    if (domainValues.every(function (d) {
	        return typeof d === 'number';
	    })) {
	        domainValues = _d2.default.scale.linear().domain(domainValues).ticks();
	    }

	    var maxXTickText = domainValues.reduce(function (prev, value) {
	        var computed = formatter(value).toString().length;

	        if (!prev.computed || computed > prev.computed) {
	            return {
	                value: value,
	                computed: computed
	            };
	        }
	        return prev;
	    }, {}).value;

	    return fnCalcTickLabelSize(formatter(maxXTickText));
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

	var shortFormat = function shortFormat(format, utc) {
	    var timeFormats = ['day', 'week', 'month'];
	    if (timeFormats.indexOf(format) >= 0) {
	        format += '-short' + (utc ? '-utc' : '');
	    }

	    return format;
	};

	var rotateBox = function rotateBox(_ref, angle) {
	    var width = _ref.width,
	        height = _ref.height;

	    var rad = Math.abs(_utils.utils.toRadian(angle));
	    return {
	        width: Math.max(Math.cos(rad) * width, height),
	        height: Math.max(Math.sin(rad) * width, height)
	    };
	};

	var getTextAnchorByAngle = function getTextAnchorByAngle(xAngle) {
	    var xOrY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';


	    var angle = _utils.utils.normalizeAngle(xAngle);

	    var xRules = xOrY === 'x' ? [[0, 45, 'middle'], [45, 135, 'start'], [135, 225, 'middle'], [225, 315, 'end'], [315, 360, 'middle']] : [[0, 90, 'end'], [90, 135, 'middle'], [135, 225, 'start'], [225, 315, 'middle'], [315, 360, 'end']];

	    var i = xRules.findIndex(function (r) {
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
	    var xIsEmptyAxis = xMeta.isEmpty || guide.x.hideTicks;
	    var yIsEmptyAxis = yMeta.isEmpty || guide.y.hideTicks;

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
	        xLabel.paddingNoTicks = xLabel.padding;
	        yLabel.padding = (-settings.yAxisPadding - settings.yFontLabelHeight) / 2;
	        yLabel.paddingNoTicks = yLabel.padding;

	        kxLabelW = 0;
	        kyLabelW = 0;
	    } else {

	        xLabel.padding = sum([kxAxisW * (settings.xTickWidth + rotXBox.height), kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight)]);
	        xLabel.paddingNoTicks = kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight);

	        yLabel.padding = sum([kyAxisW * (settings.yTickWidth + rotYBox.width), kyLabelW * settings.distToYAxisLabel]);
	        yLabel.paddingNoTicks = kyLabelW * settings.distToYAxisLabel;
	    }

	    var bottomBorder = settings.xFontLabelDescenderLineHeight; // for font descender line
	    guide.padding = Object.assign(guide.padding, {
	        b: guide.x.hide ? 0 : sum([guide.x.padding, kxAxisW * (settings.xTickWidth + rotXBox.height), kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight + bottomBorder)]),
	        l: guide.y.hide ? 0 : sum([guide.y.padding, kyAxisW * (settings.yTickWidth + rotYBox.width), kyLabelW * (settings.distToYAxisLabel + settings.yFontLabelHeight)])
	    });
	    guide.paddingNoTicks = Object.assign({}, guide.paddingNoTicks, {
	        b: guide.x.hide ? 0 : sum([guide.x.padding, kxLabelW * (settings.distToXAxisLabel + settings.xFontLabelHeight + bottomBorder)]),
	        l: guide.y.hide ? 0 : sum([guide.y.padding, kyLabelW * (settings.distToYAxisLabel + settings.yFontLabelHeight)])
	    });

	    guide.x = Object.assign(guide.x, {
	        density: rotXBox.width + getSettings(settings, 'xDensityPadding', xMeta.dimType) * 2,
	        tickFontHeight: maxXTickBox.height,
	        $minimalDomain: xValues.length,
	        $maxTickTextW: multiLinesXBox.width,
	        $maxTickTextH: multiLinesXBox.height,
	        tickFormatWordWrapLimit: settings.xAxisTickLabelLimit
	    });

	    guide.y = Object.assign(guide.y, {
	        density: rotYBox.height + getSettings(settings, 'yDensityPadding', yMeta.dimType) * 2,
	        tickFontHeight: maxYTickBox.height,
	        $minimalDomain: yValues.length,
	        $maxTickTextW: multiLinesYBox.width,
	        $maxTickTextH: multiLinesYBox.height,
	        tickFormatWordWrapLimit: settings.yAxisTickLabelLimit
	    });

	    return guide;
	};

	var calcUnitGuide = function calcUnitGuide(_ref2) {
	    var unit = _ref2.unit,
	        meta = _ref2.meta,
	        settings = _ref2.settings,
	        allowXVertical = _ref2.allowXVertical,
	        allowYVertical = _ref2.allowYVertical,
	        inlineLabels = _ref2.inlineLabels;


	    var dimX = meta.dimension(unit.x);
	    var dimY = meta.dimension(unit.y);

	    var xMeta = meta.scaleMeta(unit.x, unit.guide.x);
	    var yMeta = meta.scaleMeta(unit.y, unit.guide.y);
	    var xIsEmptyAxis = xMeta.isEmpty;
	    var yIsEmptyAxis = yMeta.isEmpty;

	    unit.guide.x.tickFormat = shortFormat(unit.guide.x.tickFormat || getTickFormat(dimX, settings.defaultFormats), settings.utcTime);
	    unit.guide.y.tickFormat = shortFormat(unit.guide.y.tickFormat || getTickFormat(dimY, settings.defaultFormats), settings.utcTime);

	    var isXVertical = allowXVertical ? !(dimX.dimType === 'measure') : false;
	    var isYVertical = allowYVertical ? !(dimY.dimType === 'measure') : false;

	    unit.guide.x.padding = xIsEmptyAxis ? 0 : settings.xAxisPadding;
	    unit.guide.x.paddingNoTicks = unit.guide.x.padding;
	    unit.guide.y.padding = yIsEmptyAxis ? 0 : settings.yAxisPadding;
	    unit.guide.y.paddingNoTicks = unit.guide.y.padding;

	    unit.guide.x.rotate = isXVertical ? -90 : 0;
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

	            unit.guide.x.label = _utils.utils.isObject(unit.guide.x.label) ? unit.guide.x.label : { text: unit.guide.x.label };
	            unit.guide.y.label = _utils.utils.isObject(unit.guide.y.label) ? unit.guide.y.label : { text: unit.guide.y.label };

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

	        var rightArrow = ' \u2192 ';

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

	            unit.guide.x.rotate = isXVertical ? -90 : 0;
	            unit.guide.x.textAnchor = getTextAnchorByAngle(unit.guide.x.rotate);

	            unit.guide.x.tickFormat = unit.guide.x.tickFormat || getTickFormat(xMeta, settings.defaultFormats);
	            unit.guide.y.tickFormat = unit.guide.y.tickFormat || getTickFormat(yMeta, settings.defaultFormats);

	            unit.guide.x.padding = isFacetUnit ? 0 : settings.xAxisPadding;
	            unit.guide.x.paddingNoTicks = unit.guide.x.padding;
	            unit.guide.y.padding = isFacetUnit ? 0 : settings.yAxisPadding;
	            unit.guide.y.paddingNoTicks = unit.guide.y.padding;

	            unit.guide = calcXYGuide(unit.guide, _utils.utils.defaults({
	                distToXAxisLabel: xMeta.isEmpty ? settings.xTickWidth : settings.distToXAxisLabel,
	                distToYAxisLabel: yMeta.isEmpty ? settings.yTickWidth : settings.distToYAxisLabel
	            }, settings), xMeta, yMeta);

	            unit.guide.x = Object.assign(unit.guide.x, {
	                cssClass: isFacetUnit ? unit.guide.x.cssClass + ' facet-axis' : unit.guide.x.cssClass,
	                avoidCollisions: isFacetUnit ? true : unit.guide.x.avoidCollisions
	            });

	            unit.guide.y = Object.assign(unit.guide.y, {
	                cssClass: isFacetUnit ? unit.guide.y.cssClass + ' facet-axis' : unit.guide.y.cssClass,
	                avoidCollisions: isFacetUnit ? false : unit.guide.y.avoidCollisions
	            });

	            unit.guide = Object.assign(unit.guide, {
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

	                return calcUnitGuide({
	                    unit: unit,
	                    meta: meta,
	                    settings: _utils.utils.defaults({
	                        xTickWordWrapLinesLimit: 1,
	                        yTickWordWrapLinesLimit: 1
	                    }, settings),
	                    allowXVertical: true,
	                    allowYVertical: false,
	                    inlineLabels: true
	                });
	            }

	            // facet level
	            unit.guide.x.cssClass += ' facet-axis compact';
	            unit.guide.x.avoidCollisions = true;
	            unit.guide.y.cssClass += ' facet-axis compact';
	            unit.guide.y.avoidCollisions = true;

	            return calcUnitGuide({
	                unit: unit,
	                meta: meta,
	                settings: _utils.utils.defaults({
	                    xAxisPadding: 0,
	                    yAxisPadding: 0,
	                    distToXAxisLabel: 0,
	                    distToYAxisLabel: 0,
	                    xTickWordWrapLinesLimit: 1,
	                    yTickWordWrapLinesLimit: 1
	                }, settings),
	                allowXVertical: false,
	                allowYVertical: true,
	                inlineLabels: false
	            });
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
	    var prop = _utils.utils.omit(xRef, 'units');
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
	                    isEmpty: dim.type == null
	                    // isEmpty: (source == '?')
	                    // isEmpty: ((values.filter((x) => !(x === undefined)).length) === 0)
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

	            var rule = spec.settings.specEngine.find(function (rule) {
	                return size.width <= rule.width || size.height <= rule.height;
	            });

	            return SpecEngineFactory.get(rule.name, spec.settings, spec, function (type, alias) {
	                return chart.getScaleInfo(alias || type + ':default');
	            });
	        }
	    }]);

	    return SpecTransformAutoLayout;
	}();

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.FormatterRegistry = undefined;

	var _utils = __webpack_require__(3);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var d3Fromat4S = _d2.default.format('.4s');
	var d3Fromat2R = _d2.default.format('.2r');
	var d3Fromat1E = _d2.default.format('.1e');
	var removeRedundantZeros = function () {
	    var zerosAfterDot = /\.0+([^\d].*)?$/;
	    var zerosAfterNotZero = /(\.\d+?)0+([^\d].*)?$/;
	    return function (str) {
	        return str.replace(zerosAfterDot, '$1').replace(zerosAfterNotZero, '$1$2');
	    };
	}();

	var FORMATS_MAP = {

	    'x-num-auto': function xNumAuto(x) {
	        var abs = Math.abs(x);
	        var result = removeRedundantZeros(abs < 1 ? abs === 0 ? '0' : abs < 1e-6 ? d3Fromat1E(x) : d3Fromat2R(x) : d3Fromat4S(x));
	        return result;
	    },

	    percent: function percent(x) {
	        var v = parseFloat((x * 100).toFixed(2));
	        return v.toString() + '%';
	    },

	    day: _d2.default.time.format('%d-%b-%Y'),
	    'day-utc': _d2.default.time.format.utc('%d-%b-%Y'),

	    'day-short': _d2.default.time.format('%d-%b'),
	    'day-short-utc': _d2.default.time.format.utc('%d-%b'),

	    week: _d2.default.time.format('%d-%b-%Y'),
	    'week-utc': _d2.default.time.format.utc('%d-%b-%Y'),

	    'week-short': _d2.default.time.format('%d-%b'),
	    'week-short-utc': _d2.default.time.format.utc('%d-%b'),

	    month: function month(x) {
	        var d = new Date(x);
	        var m = d.getMonth();
	        var formatSpec = m === 0 ? '%B, %Y' : '%B';
	        return _d2.default.time.format(formatSpec)(x);
	    },
	    'month-utc': function monthUtc(x) {
	        var d = new Date(x);
	        var m = d.getUTCMonth();
	        var formatSpec = m === 0 ? '%B, %Y' : '%B';
	        return _d2.default.time.format.utc(formatSpec)(x);
	    },

	    'month-short': function monthShort(x) {
	        var d = new Date(x);
	        var m = d.getMonth();
	        var formatSpec = m === 0 ? '%b \'%y' : '%b';
	        return _d2.default.time.format(formatSpec)(x);
	    },
	    'month-short-utc': function monthShortUtc(x) {
	        var d = new Date(x);
	        var m = d.getUTCMonth();
	        var formatSpec = m === 0 ? '%b \'%y' : '%b';
	        return _d2.default.time.format.utc(formatSpec)(x);
	    },

	    'month-year': _d2.default.time.format('%B, %Y'),
	    'month-year-utc': _d2.default.time.format.utc('%B, %Y'),

	    quarter: function quarter(x) {
	        var d = new Date(x);
	        var m = d.getMonth();
	        var q = (m - m % 3) / 3;
	        return 'Q' + (q + 1) + ' ' + d.getFullYear();
	    },
	    'quarter-utc': function quarterUtc(x) {
	        var d = new Date(x);
	        var m = d.getUTCMonth();
	        var q = (m - m % 3) / 3;
	        return 'Q' + (q + 1) + ' ' + d.getUTCFullYear();
	    },

	    year: _d2.default.time.format('%Y'),
	    'year-utc': _d2.default.time.format.utc('%Y'),

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
	                var f = _utils.utils.isDate(v) ? _d2.default.time.format(formatAlias) : _d2.default.format(formatAlias);
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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformCalcSize = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

	var _specTransformOptimize = __webpack_require__(34);

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
	var getFacetCount = function getFacetCount(specRef) {
	    var xFacetKeys = [];
	    var yFacetKeys = [];
	    var getFacetKeys = function getFacetKeys(root) {
	        // TODO: Maybe there is an API to
	        // determine X and Y facet keys.
	        if (root.type === 'COORDS.RECT' && root.units && root.units[0] && root.units[0].type === 'COORDS.RECT') {
	            var x = root.x.replace(/^x_/, '');
	            var y = root.y.replace(/^y_/, '');
	            if (x !== 'null') {
	                xFacetKeys.push(x);
	            }
	            if (y !== 'null') {
	                yFacetKeys.push(y);
	            }
	            root.units.forEach(getFacetKeys);
	        }
	    };
	    getFacetKeys(specRef.unit);

	    var xFacetGroups = {};
	    var yFacetGroups = {};
	    var getFacetGroups = function getFacetGroups(root) {
	        if (root.type === 'COORDS.RECT') {
	            root.frames.forEach(function (f) {
	                if (f.key) {
	                    var keys = Object.keys(f.key);
	                    keys.forEach(function (key) {
	                        if (xFacetKeys.indexOf(key) >= 0) {
	                            if (!(key in xFacetGroups)) {
	                                xFacetGroups[key] = [];
	                            }
	                            if (xFacetGroups[key].indexOf(f.key[key]) < 0) {
	                                xFacetGroups[key].push(f.key[key]);
	                            }
	                        }
	                        if (yFacetKeys.indexOf(key) >= 0) {
	                            if (!(key in yFacetGroups)) {
	                                yFacetGroups[key] = [];
	                            }
	                            if (yFacetGroups[key].indexOf(f.key[key]) < 0) {
	                                yFacetGroups[key].push(f.key[key]);
	                            }
	                        }
	                    });
	                    if (f.units) {
	                        f.units.forEach(getFacetGroups);
	                    }
	                }
	            });
	        }
	    };
	    getFacetGroups(specRef.unit);

	    return {
	        xFacetCount: Object.keys(xFacetGroups).reduce(function (sum, key) {
	            return sum * xFacetGroups[key].length;
	        }, 1),
	        yFacetCount: Object.keys(yFacetGroups).reduce(function (sum, key) {
	            return sum * yFacetGroups[key].length;
	        }, 1)
	    };
	};

	var fitModelStrategies = {
	    'entire-view': function entireView(srcSize, calcSize, specRef, tryOptimizeSpec) {

	        var g = specRef.unit.guide;

	        var _getFacetCount = getFacetCount(specRef),
	            xFacetCount = _getFacetCount.xFacetCount,
	            yFacetCount = _getFacetCount.yFacetCount;

	        var ticksLPad = g.paddingNoTicks ? g.padding.l - g.paddingNoTicks.l : 0;
	        var ticksBPad = g.paddingNoTicks ? g.padding.b - g.paddingNoTicks.b : 0;
	        var shouldHideXAxis = g.paddingNoTicks && srcSize.height - ticksBPad < specRef.settings.minChartHeight || yFacetCount * specRef.settings.minFacetHeight + ticksBPad > srcSize.height || xFacetCount * specRef.settings.minFacetWidth + ticksLPad > srcSize.width;
	        var shouldHideYAxis = g.paddingNoTicks && srcSize.width - ticksLPad < specRef.settings.minChartWidth || yFacetCount * specRef.settings.minFacetHeight + ticksBPad > srcSize.height || xFacetCount * specRef.settings.minFacetWidth + ticksLPad > srcSize.width;
	        if (shouldHideXAxis) {
	            _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
	        }
	        if (shouldHideYAxis) {
	            _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
	        }

	        var normalW = srcSize.width;
	        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
	        if (widthByMaxText <= srcSize.width) {
	            tryOptimizeSpec(specRef.unit, specRef.settings);
	        } else {
	            var pessimisticWidthByMaxText = calcSize('x', specRef.unit, byPessimisticMaxText);
	            if (pessimisticWidthByMaxText > srcSize.width) {
	                var widthByDensity = Math.max(srcSize.width, calcSize('x', specRef.unit, byDensity));
	                normalW = Math.min(pessimisticWidthByMaxText, widthByDensity);
	            }
	        }
	        var normalH = Math.max(srcSize.height, calcSize('y', specRef.unit, byDensity));

	        if (!shouldHideXAxis && normalW > srcSize.width) {
	            _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
	        }

	        if (!shouldHideYAxis && normalH > srcSize.height) {
	            _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
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

	        var g = specRef.unit.guide;
	        if (g.paddingNoTicks) {
	            if (srcSize.width - g.padding.l + g.paddingNoTicks.l < specRef.settings.minChartWidth) {
	                _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
	            }
	            if (srcSize.height - g.padding.b + g.paddingNoTicks.b < specRef.settings.minChartHeight) {
	                _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
	            }
	        }

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

	        var g = specRef.unit.guide;
	        var ticksLPad = g.paddingNoTicks ? g.padding.l - g.paddingNoTicks.l : 0;
	        if (g.paddingNoTicks && srcSize.width - ticksLPad < specRef.settings.minChartWidth || getFacetCount(specRef).xFacetCount * specRef.settings.minFacetWidth + ticksLPad > srcSize.width) {
	            _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'y');
	        }
	        var widthByMaxText = calcSize('x', specRef.unit, byOptimisticMaxText);
	        if (widthByMaxText <= srcSize.width) {
	            tryOptimizeSpec(specRef.unit, specRef.settings);
	        }

	        var newW = srcSize.width;
	        var newH = calcSize('y', specRef.unit, byDensity);
	        return { newW: newW, newH: newH };
	    },
	    'fit-height': function fitHeight(srcSize, calcSize, specRef) {

	        var g = specRef.unit.guide;
	        var ticksBPad = g.paddingNoTicks ? g.padding.b - g.paddingNoTicks.b : 0;
	        if (g.paddingNoTicks && srcSize.height - ticksBPad < specRef.settings.minChartHeight || getFacetCount(specRef).yFacetCount * specRef.settings.minFacetHeight + ticksBPad > srcSize.height) {
	            _specTransformOptimize.SpecTransformOptimize.hideAxisTicks(specRef.unit, specRef.settings, 'x');
	        }
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
	                var frame = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;


	                var xCfg = prop === 'x' ? root.x : root.y;
	                var yCfg = prop === 'x' ? root.y : root.x;
	                var guide = root.guide;
	                var xSize = prop === 'x' ? takeStepSizeStrategy(guide.x) : takeStepSizeStrategy(guide.y);

	                var resScaleSize = prop === 'x' ? guide.padding.l + guide.padding.r : guide.padding.b + guide.padding.t;

	                if (root.units[0].type === 'ELEMENT.INTERVAL' && prop === 'y' === Boolean(root.units[0].flip) && root.units[0].label && !chart.getScaleInfo(root.units[0].label, frame).isEmpty()) {

	                    var labelFontSize = guide.label && guide.label.fontSize ? guide.label.fontSize : 10;
	                    var rowsTotal = root.frames.reduce(function (sum, f) {
	                        return f.full().length * labelFontSize;
	                    }, 0);
	                    var scaleSize = calcScaleSize(chart.getScaleInfo(xCfg, frame), xSize);
	                    return resScaleSize + Math.max(rowsTotal, scaleSize);
	                } else if (root.units[0].type !== 'COORDS.RECT') {

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
	                var newSize = strategy(srcSize, calcSizeRecursively, specRef, _specTransformOptimize.SpecTransformOptimize.optimizeXAxisLabel);
	                newW = newSize.newW;
	                newH = newSize.newH;
	            }

	            var prettifySize = function prettifySize(srcSize, newSize, rScroll) {

	                var scrollSize = specRef.settings.getScrollbarSize(chart.getLayout().contentContainer);

	                var recommendedWidth = newSize.width > srcSize.width && newSize.width <= srcSize.width * rScroll ? srcSize.width : newSize.width;
	                var recommendedHeight = newSize.height > srcSize.height && newSize.height <= srcSize.height * rScroll ? srcSize.height : newSize.height;

	                var deltaW = srcSize.width - recommendedWidth;
	                var deltaH = srcSize.height - recommendedHeight;

	                var scrollW = deltaH >= 0 ? 0 : scrollSize.width;
	                var scrollH = deltaW >= 0 ? 0 : scrollSize.height;

	                return {
	                    height: recommendedHeight - scrollH,
	                    width: recommendedWidth - scrollW
	                };
	            };

	            specRef.settings.size = prettifySize(srcSize, { width: newW, height: newH }, specRef.settings.avoidScrollAtRatio);

	            return specRef;
	        }
	    }]);

	    return SpecTransformCalcSize;
	}();

/***/ },
/* 34 */
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
	        key: 'optimizeXAxisLabel',
	        value: function optimizeXAxisLabel(root, settings) {
	            var xAxisTickLabelLimit = settings.xAxisTickLabelLimit;


	            var enterSpec = function enterSpec(rootUnit) {

	                if (!rootUnit.guide.x.hide && !rootUnit.guide.x.hideTicks && rootUnit.guide.x.rotate !== 0) {
	                    rootUnit.guide.x.rotate = 0;
	                    rootUnit.guide.x.textAnchor = 'middle';

	                    var tickTextWidth = Math.min(xAxisTickLabelLimit, rootUnit.guide.x.$maxTickTextW);
	                    var tickTextDelta = 0 - tickTextWidth + rootUnit.guide.x.$maxTickTextH;

	                    improvePadding(rootUnit, tickTextDelta);
	                }

	                (rootUnit.units || []).filter(function (u) {
	                    return u.type === 'COORDS.RECT';
	                }).forEach(function (u) {
	                    return enterSpec(u);
	                });
	            };

	            var improvePadding = function improvePadding(unit, tickTextDelta) {
	                if (root !== unit && unit.guide.autoLayout === 'extract-axes') {
	                    root.guide.x.padding += tickTextDelta;
	                    root.guide.padding.b += tickTextDelta;
	                } else {
	                    unit.guide.x.label.padding += unit.guide.x.label.padding > 0 ? tickTextDelta : 0;
	                    unit.guide.padding.b += unit.guide.padding.b > 0 ? tickTextDelta : 0;
	                }
	            };

	            enterSpec(root);
	        }
	    }, {
	        key: 'hideAxisTicks',
	        value: function hideAxisTicks(root, settings, axis) {
	            var enterSpec = function enterSpec(rootUnit) {
	                var pad = axis === 'x' ? 'b' : 'l';
	                var g = rootUnit.guide;

	                if (!g[axis].hide && !g[axis].hideTicks) {
	                    g[axis].hideTicks = true;
	                    var hasLabel = g[axis].label.text && !g[axis].label.hide;
	                    g.padding[pad] = g.paddingNoTicks ? g.paddingNoTicks[pad] : 0;
	                    g[axis].padding = g[axis].paddingNoTicks || 0;
	                    g[axis].label.padding = hasLabel ? g[axis].label.paddingNoTicks : 0;
	                }

	                (rootUnit.units || []).filter(function (u) {
	                    return u.type === 'COORDS.RECT';
	                }).forEach(function (u) {
	                    return enterSpec(u);
	                });
	            };

	            enterSpec(root);
	        }
	    }]);

	    return SpecTransformOptimize;
	}();

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformApplyRatio = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

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
	                var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;


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
	            }
	        }
	    }]);

	    return SpecTransformApplyRatio;
	}();

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SpecTransformExtractAxes = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

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
	            var ttlNoTicks = { l: 0, b: 0 };
	            var seq = [];
	            var seqNoTicks = [];

	            var enterIterator = function enterIterator(unitRef, level) {

	                if (level > 1 || !isCoordsRect(unitRef)) {
	                    throw new Error('Not applicable');
	                }

	                unitRef.guide = unitRef.guide || {};
	                var guide = unitRef.guide;

	                var p = guide.padding || { l: 0, r: 0, t: 0, b: 0 };
	                var pNoTicks = guide.paddingNoTicks || { l: 0, b: 0 };

	                ttl.l += p.l;
	                ttl.r += p.r;
	                ttl.t += p.t;
	                ttl.b += p.b;
	                ttlNoTicks.l += pNoTicks.l;
	                ttlNoTicks.b += pNoTicks.b;

	                seq.push(Object.assign({}, ttl));
	                seqNoTicks.push(Object.assign({}, ttlNoTicks));

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
	                var lvlNoTicks = seqNoTicks.pop();

	                var guide = unitRef.guide || {};
	                guide.x = guide.x || {};
	                guide.x.padding = guide.x.padding || 0;
	                guide.x.paddingNoTicks = guide.x.paddingNoTicks || 0;
	                guide.y = guide.y || {};
	                guide.y.padding = guide.y.padding || 0;
	                guide.y.paddingNoTicks = guide.y.paddingNoTicks || 0;

	                guide.padding = {
	                    l: pad(unitRef.y),
	                    r: pad(1),
	                    t: pad(1),
	                    b: pad(unitRef.x)
	                };
	                guide.paddingNoTicks = {
	                    l: 0,
	                    b: 0
	                };

	                guide.autoLayout = 'extract-axes';

	                guide.x.padding += ttl.b - lvl.b;
	                guide.y.padding += ttl.l - lvl.l;
	                guide.x.paddingNoTicks += ttlNoTicks.b - lvlNoTicks.b;
	                guide.y.paddingNoTicks += ttlNoTicks.l - lvlNoTicks.l;
	            };

	            _utils.utils.traverseSpec(spec.unit, enterIterator, exitIterator);

	            spec.unit.guide.padding = ttl;
	            spec.unit.guide.paddingNoTicks = ttlNoTicks;
	        }
	    }]);

	    return SpecTransformExtractAxes;
	}();

/***/ },
/* 37 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TaskRunner = function () {
	    function TaskRunner() {
	        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	            _ref$src = _ref.src,
	            src = _ref$src === undefined ? null : _ref$src,
	            _ref$timeout = _ref.timeout,
	            timeout = _ref$timeout === undefined ? Number.MAX_SAFE_INTEGER : _ref$timeout,
	            _ref$syncInterval = _ref.syncInterval,
	            syncInterval = _ref$syncInterval === undefined ? Number.MAX_SAFE_INTEGER : _ref$syncInterval,
	            _ref$callbacks = _ref.callbacks,
	            callbacks = _ref$callbacks === undefined ? {} : _ref$callbacks;

	        _classCallCheck(this, TaskRunner);

	        this.setTimeout(timeout);
	        this.setSyncInterval(syncInterval);
	        this.setCallbacks(callbacks);

	        this._running = false;
	        this._queue = [];
	        this._result = src;
	        this._syncDuration = 0;
	        this._asyncDuration = 0;
	        this._lastCall = null;
	        this._requestedFrameId = null;

	        this._tasksCount = 0;
	        this._finishedTasksCount = 0;
	    }

	    _createClass(TaskRunner, [{
	        key: 'setTimeout',
	        value: function setTimeout(timeout) {
	            TaskRunner.checkType(timeout, 'number', 'timeout');
	            this._timeout = timeout;
	        }
	    }, {
	        key: 'setSyncInterval',
	        value: function setSyncInterval(syncInterval) {
	            TaskRunner.checkType(syncInterval, 'number', 'syncInterval');
	            this._syncInterval = syncInterval;
	        }
	    }, {
	        key: 'setCallbacks',
	        value: function setCallbacks(callbacks) {
	            TaskRunner.checkType(callbacks, 'object', 'callbacks');
	            this._callbacks = Object.assign(this._callbacks || {}, callbacks);
	        }
	    }, {
	        key: 'addTask',
	        value: function addTask(fn) {
	            this._queue.push(fn);
	            this._tasksCount++;
	            return this;
	        }
	    }, {
	        key: 'run',
	        value: function run() {
	            if (this._running) {
	                throw new Error('Task Runner is already running');
	            }
	            this._running = true;
	            TaskRunner.runnersInProgress++;
	            this._loopTasks();
	        }
	    }, {
	        key: 'isRunning',
	        value: function isRunning() {
	            return this._running;
	        }
	    }, {
	        key: '_loopTasks',
	        value: function _loopTasks() {

	            var task;
	            var duration;
	            var frameDuration = 0;
	            var isTimeoutReached;
	            var isFrameTimeoutReached;
	            var syncInterval = this._syncInterval / TaskRunner.runnersInProgress;
	            while (this._running && !(isTimeoutReached = this._asyncDuration > this._timeout) && !(isFrameTimeoutReached = frameDuration > syncInterval) && (task = this._queue.shift())) {
	                duration = this._runTask(task);
	                if (duration === null) {
	                    return;
	                }
	                this._syncDuration += duration;
	                this._asyncDuration += duration;
	                frameDuration += duration;
	            }

	            if (isTimeoutReached && this._queue.length > 0) {
	                this.stop();
	                if (this._callbacks.timeout) {
	                    this._callbacks.timeout.call(null, this._asyncDuration, this);
	                }
	            }

	            if (!isTimeoutReached && isFrameTimeoutReached && this._queue.length > 0) {
	                this._requestFrame();
	            }

	            if (this._queue.length === 0) {
	                this.stop();
	                if (this._callbacks.done) {
	                    this._callbacks.done.call(null, this._result, this);
	                }
	            }
	        }
	    }, {
	        key: '_runTask',
	        value: function _runTask(task) {
	            var start = performance.now();
	            if (this._callbacks.error) {
	                try {
	                    this._result = task.call(null, this._result, this);
	                } catch (err) {
	                    this.stop();
	                    this._callbacks.error.call(null, err, this);
	                    return null;
	                }
	            } else {
	                this._result = task.call(null, this._result, this);
	            }
	            var end = performance.now();
	            var duration = end - start;
	            this._finishedTasksCount++;
	            if (this._callbacks.progress) {
	                this._callbacks.progress.call(null, this._finishedTasksCount / this._tasksCount, this);
	            }
	            return duration;
	        }
	    }, {
	        key: '_requestFrame',
	        value: function _requestFrame() {
	            var _this = this;

	            var start = performance.now();
	            this._requestedFrameId = requestAnimationFrame(function () {
	                _this._requestedFrameId = null;
	                var end = performance.now();
	                _this._asyncDuration += end - start;
	                _this._loopTasks();
	            });
	        }
	    }, {
	        key: 'stop',
	        value: function stop() {
	            if (!this._running) {
	                throw new Error('Task Runner is already stopped');
	            }
	            this._running = false;
	            TaskRunner.runnersInProgress--;
	            if (this._requestedFrameId) {
	                cancelAnimationFrame(this._requestedFrameId);
	                this._requestedFrameId = null;
	            }
	        }
	    }], [{
	        key: 'checkType',
	        value: function checkType(x, t, name) {
	            if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== t) {
	                throw new Error('Task Runner "' + name + '" property is not "' + t + '"');
	            }
	        }
	    }]);

	    return TaskRunner;
	}();

	exports.default = TaskRunner;


	TaskRunner.runnersInProgress = 0;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Chart = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _tau = __webpack_require__(20);

	var _utils = __webpack_require__(3);

	var _chartAliasRegistry = __webpack_require__(39);

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

	        config = _utils.utils.defaults(config, { autoResize: true });
	        config.settings = _tau.Plot.setupSettings(config.settings);
	        config.dimensions = _tau.Plot.setupMetaInfo(config.dimensions, config.data);

	        var _this = _possibleConstructorReturn(this, (Chart.__proto__ || Object.getPrototypeOf(Chart)).call(this, chartFactory(config)));

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
	            _get(Chart.prototype.__proto__ || Object.getPrototypeOf(Chart.prototype), 'destroy', this).call(this);
	        }
	    }]);

	    return Chart;
	}(_tau.Plot);

	Chart.winAware = [];

	Chart.resizeOnWindowEvent = function () {
	    var rIndex = void 0;

	    function requestReposition() {
	        if (rIndex || !Chart.winAware.length) {
	            return;
	        }
	        rIndex = window.requestAnimationFrame(resize);
	    }

	    function resize() {
	        rIndex = 0;
	        for (var i = 0, l = Chart.winAware.length; i < l; i++) {
	            Chart.winAware[i].resize();
	        }
	    }

	    return requestReposition;
	}();
	window.addEventListener('resize', Chart.resizeOnWindowEvent);

	exports.Chart = Chart;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.chartTypesRegistry = undefined;

	var _error = __webpack_require__(8);

	var chartTypes = {};
	var chartRules = {};

	var throwNotSupported = function throwNotSupported(alias) {
	    var msg = 'Chart type ' + alias + ' is not supported.';
	    console.log(msg); // eslint-disable-line
	    console.log('Use one of ' + Object.keys(chartTypes).join(', ') + '.'); // eslint-disable-line
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

	        if (typeof chartFactory !== 'function') {
	            throwNotSupported(alias);
	        }

	        return chartFactory;
	    },
	    add: function add(alias, converter) {
	        var rules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

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
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Cartesian = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _element = __webpack_require__(5);

	var _utilsDom = __webpack_require__(1);

	var _utilsDraw = __webpack_require__(10);

	var _utils = __webpack_require__(3);

	var _const = __webpack_require__(22);

	var _formatterRegistry = __webpack_require__(32);

	var _d3Decorators = __webpack_require__(9);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var selectOrAppend = _utilsDom.utilsDom.selectOrAppend;

	var calcTicks = function calcTicks(distributionKoeff) {
	    var limit = 20;
	    var factor = distributionKoeff <= limit ? 1 : 0.75;
	    return Math.max(2, Math.round(distributionKoeff * factor));
	};

	var Cartesian = exports.Cartesian = function (_Element) {
	    _inherits(Cartesian, _Element);

	    function Cartesian(config) {
	        _classCallCheck(this, Cartesian);

	        var _this = _possibleConstructorReturn(this, (Cartesian.__proto__ || Object.getPrototypeOf(Cartesian)).call(this, config));

	        _this.config = config;

	        _this.config.guide = _utils.utils.defaults(_this.config.guide || {}, {
	            showGridLines: 'xy',
	            padding: { l: 50, r: 0, t: 0, b: 50 }
	        });

	        _this.config.guide.x = _this.config.guide.x || {};
	        _this.config.guide.x = _utils.utils.defaults(_this.config.guide.x, {
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

	        if (typeof _this.config.guide.x.label === 'string') {
	            _this.config.guide.x.label = {
	                text: _this.config.guide.x.label
	            };
	        }

	        _this.config.guide.x.label = _utils.utils.defaults(_this.config.guide.x.label, {
	            text: 'X',
	            rotate: 0,
	            padding: 40,
	            textAnchor: 'middle'
	        });

	        _this.config.guide.y = _this.config.guide.y || {};
	        _this.config.guide.y = _utils.utils.defaults(_this.config.guide.y, {
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

	        if (typeof _this.config.guide.y.label === 'string') {
	            _this.config.guide.y.label = {
	                text: _this.config.guide.y.label
	            };
	        }

	        _this.config.guide.y.label = _utils.utils.defaults(_this.config.guide.y.label, {
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

	        var options = _this.config.options;
	        var padding = _this.config.guide.padding;

	        _this.L = options.left + padding.l;
	        _this.T = options.top + padding.t;
	        _this.W = options.width - (padding.l + padding.r);
	        _this.H = options.height - (padding.t + padding.b);
	        return _this;
	    }

	    _createClass(Cartesian, [{
	        key: 'defineGrammarModel',
	        value: function defineGrammarModel(fnCreateScale) {
	            var w = this.W;
	            var h = this.H;
	            this.xScale = fnCreateScale('pos', this.config.x, [0, w]);
	            this.yScale = fnCreateScale('pos', this.config.y, [h, 0]);
	            this.regScale('x', this.xScale).regScale('y', this.yScale);
	            return {
	                scaleX: this.xScale,
	                scaleY: this.yScale,
	                xi: function xi() {
	                    return w / 2;
	                },
	                yi: function yi() {
	                    return h / 2;
	                },
	                sizeX: function sizeX() {
	                    return w;
	                },
	                sizeY: function sizeY() {
	                    return h;
	                }
	            };
	        }
	    }, {
	        key: 'getGrammarRules',
	        value: function getGrammarRules() {
	            return [function (prevModel) {
	                var sx = prevModel.scaleX;
	                var sy = prevModel.scaleY;
	                return {
	                    xi: function xi(d) {
	                        return !d ? prevModel.xi(d) : sx(d[sx.dim]);
	                    },
	                    yi: function yi(d) {
	                        return !d ? prevModel.yi(d) : sy(d[sy.dim]);
	                    },
	                    sizeX: function sizeX(d) {
	                        return !d ? prevModel.sizeX(d) : sx.stepSize(d[sx.dim]);
	                    },
	                    sizeY: function sizeY(d) {
	                        return !d ? prevModel.sizeY(d) : sy.stepSize(d[sy.dim]);
	                    }
	                };
	            }];
	        }
	    }, {
	        key: 'createScreenModel',
	        value: function createScreenModel(grammarModel) {
	            return grammarModel;
	        }
	    }, {
	        key: 'allocateRect',
	        value: function allocateRect(k) {
	            var _this2 = this;

	            var model = this.screenModel;
	            return {
	                slot: function slot(uid) {
	                    return _this2.config.options.container.selectAll('.uid_' + uid);
	                },
	                left: model.xi(k) - model.sizeX(k) / 2,
	                top: model.yi(k) - model.sizeY(k) / 2,
	                width: model.sizeX(k),
	                height: model.sizeY(k),
	                // TODO: Fix autoLayout.. redundant properties
	                containerWidth: this.W,
	                containerHeight: this.H
	            };
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames(frames) {

	            var node = Object.assign({}, this.config);

	            var options = node.options;

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

	            // TODO: Should we modify transform of a container here or create own container?
	            (options.container.attr('transform') ? (0, _d3Decorators.d3_transition)(options.container, this.config.guide.animationSpeed, 'cartesianContainerTransform') : options.container).attr('transform', _utilsDraw.utilsDraw.translate(this.L, this.T));

	            if (!node.x.guide.hide) {
	                var orientX = node.x.guide.scaleOrient;
	                var positionX = orientX === 'top' ? [0, 0 - node.guide.x.padding] : [0, innerHeight + node.guide.x.padding];

	                this._drawDimAxis(options.container, node.x, positionX, innerWidth);
	            } else {
	                this._removeDimAxis(options.container, node.x);
	            }

	            if (!node.y.guide.hide) {
	                var orientY = node.y.guide.scaleOrient;
	                var positionY = orientY === 'right' ? [innerWidth + node.guide.y.padding, 0] : [0 - node.guide.y.padding, 0];

	                this._drawDimAxis(options.container, node.y, positionY, innerHeight);
	            } else {
	                this._removeDimAxis(options.container, node.y);
	            }

	            var xdata = frames.reduce(function (memo, f) {
	                return memo.concat((f.units || []).map(function (unit) {
	                    return unit.uid;
	                }));
	            }, []);

	            var grid = this._drawGrid(options.container, node, innerWidth, innerHeight, options);
	            var xcells = (0, _d3Decorators.d3_selectAllImmediate)(grid, '.cell').data(xdata, function (x) {
	                return x;
	            });
	            xcells.enter().append('g').attr('class', function (d) {
	                return _const.CSS_PREFIX + 'cell cell uid_' + d;
	            });
	            (0, _d3Decorators.d3_transition)(xcells.classed('tau-active', true), this.config.guide.animationSpeed).attr('opacity', 1);
	            (0, _d3Decorators.d3_transition)(xcells.exit().classed('tau-active', false), this.config.guide.animationSpeed).attr('opacity', 1e-6).remove();
	        }
	    }, {
	        key: '_drawDimAxis',
	        value: function _drawDimAxis(container, scale, position, size) {
	            var _this3 = this;

	            var axisScale = _d2.default.svg.axis().scale(scale.scaleObj).orient(scale.guide.scaleOrient);

	            var formatter = _formatterRegistry.FormatterRegistry.get(scale.guide.tickFormat, scale.guide.tickFormatNullAlias);
	            if (formatter !== null) {
	                axisScale.ticks(calcTicks(size / scale.guide.density));
	                axisScale.tickFormat(formatter);
	            }

	            var animationSpeed = this.config.guide.animationSpeed;

	            selectOrAppend(container, this._getAxisSelector(scale)).classed('tau-active', true).classed(scale.guide.cssClass, true).call(function (axis) {

	                var transAxis = (0, _d3Decorators.d3_transition)(axis, animationSpeed, 'axisTransition');
	                var prevAxisTranslate = axis.attr('transform');
	                var nextAxisTranslate = _utilsDraw.utilsDraw.translate.apply(_utilsDraw.utilsDraw, _toConsumableArray(position));
	                if (nextAxisTranslate !== prevAxisTranslate) {
	                    (prevAxisTranslate ? transAxis : axis).attr('transform', _utilsDraw.utilsDraw.translate.apply(_utilsDraw.utilsDraw, _toConsumableArray(position)));
	                }
	                transAxis.call(axisScale);
	                transAxis.attr('opacity', 1);

	                var isHorizontal = _utilsDraw.utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h';
	                var prettifyTick = scale.scaleType === 'ordinal' || scale.scaleType === 'period';
	                if (prettifyTick && !scale.guide.hideTicks) {
	                    (0, _d3Decorators.d3_decorator_prettify_categorical_axis_ticks)(transAxis, scale, isHorizontal, animationSpeed);
	                }

	                if (scale.scaleType === 'linear') {
	                    (0, _d3Decorators.d3_decorator_highlightZeroTick)(axis, scale.scaleObj);
	                }

	                (0, _d3Decorators.d3_decorator_wrap_tick_label)(axis, animationSpeed, scale.guide, isHorizontal, scale);

	                if (!scale.guide.label.hide) {
	                    (0, _d3Decorators.d3_decorator_prettify_axis_label)(axis, scale.guide.label, isHorizontal, size, animationSpeed);
	                }

	                if (scale.guide.hideTicks) {
	                    axis.selectAll('.tick').remove();
	                    axis.selectAll('.domain').remove();
	                    return;
	                }

	                var activeTicks = scale.scaleObj.ticks ? scale.scaleObj.ticks() : scale.scaleObj.domain();
	                var fixAxesCollision = function fixAxesCollision() {
	                    if (prettifyTick && scale.guide.avoidCollisions) {
	                        (0, _d3Decorators.d3_decorator_avoidLabelsCollisions)(axis, isHorizontal, activeTicks);
	                    }

	                    if (isHorizontal && scale.scaleType === 'time') {
	                        (0, _d3Decorators.d3_decorator_fixHorizontalAxisTicksOverflow)(axis, activeTicks);
	                    }
	                };
	                var fixTickTextOverflow = function fixTickTextOverflow() {
	                    if (isHorizontal && (scale.scaleType === 'time' || scale.scaleType === 'linear')) {
	                        (0, _d3Decorators.d3_decorator_fixEdgeAxisTicksOverflow)(axis, activeTicks);
	                    }
	                };
	                var fixAxesTicks = function fixAxesTicks() {
	                    fixAxesCollision();
	                    fixTickTextOverflow();
	                };
	                fixAxesCollision();
	                // NOTE: As far as floating axes transition overrides current,
	                // transition `end` event cannot be used. So using `setTimeout`.
	                // transAxis.onTransitionEnd(fixAxesCollision);
	                var timeoutField = '_transitionEndTimeout_' + (isHorizontal ? 'h' : 'v');
	                clearTimeout(_this3[timeoutField]);
	                if (animationSpeed > 0) {
	                    _this3[timeoutField] = setTimeout(fixAxesTicks, animationSpeed * 1.5);
	                } else {
	                    fixTickTextOverflow();
	                }
	            });
	        }
	    }, {
	        key: '_removeDimAxis',
	        value: function _removeDimAxis(container, scale) {
	            var axis = (0, _d3Decorators.d3_selectAllImmediate)(container, this._getAxisSelector(scale)).classed('tau-active', false);
	            (0, _d3Decorators.d3_transition)(axis, this.config.guide.animationSpeed, 'axisTransition').attr('opacity', 1e-6).remove();
	        }
	    }, {
	        key: '_getAxisSelector',
	        value: function _getAxisSelector(scale) {
	            var isHorizontal = _utilsDraw.utilsDraw.getOrientation(scale.guide.scaleOrient) === 'h';
	            return 'g.' + (isHorizontal ? 'x' : 'y') + '.axis';
	        }
	    }, {
	        key: '_drawGrid',
	        value: function _drawGrid(container, node, width, height) {
	            var _this4 = this;

	            var grid = selectOrAppend(container, 'g.grid').attr('transform', _utilsDraw.utilsDraw.translate(0, 0)).call(function (selection) {

	                var grid = selection;

	                var animationSpeed = _this4.config.guide.animationSpeed;

	                var linesOptions = (node.guide.showGridLines || '').toLowerCase();
	                if (linesOptions.length > 0) {

	                    var gridLines = selectOrAppend(grid, 'g.grid-lines');

	                    if (linesOptions.indexOf('x') > -1) {
	                        var xScale = node.x;
	                        var xOrientKoeff = xScale.guide.scaleOrient === 'top' ? -1 : 1;
	                        var xGridAxis = _d2.default.svg.axis().scale(xScale.scaleObj).orient(xScale.guide.scaleOrient).tickSize(xOrientKoeff * height);

	                        var formatter = _formatterRegistry.FormatterRegistry.get(xScale.guide.tickFormat);
	                        if (formatter !== null) {
	                            xGridAxis.ticks(calcTicks(width / xScale.guide.density));
	                            xGridAxis.tickFormat(formatter);
	                        }

	                        var xGridLines = selectOrAppend(gridLines, 'g.grid-lines-x');
	                        var xGridLinesTrans = (0, _d3Decorators.d3_transition)(xGridLines, animationSpeed).call(xGridAxis);

	                        var isHorizontal = _utilsDraw.utilsDraw.getOrientation(xScale.guide.scaleOrient) === 'h';
	                        var prettifyTick = xScale.scaleType === 'ordinal' || xScale.scaleType === 'period';
	                        if (prettifyTick) {
	                            (0, _d3Decorators.d3_decorator_prettify_categorical_axis_ticks)(xGridLinesTrans, xScale, isHorizontal, animationSpeed);
	                        }

	                        if (xScale.scaleType === 'linear' && !xScale.guide.hideTicks) {
	                            (0, _d3Decorators.d3_decorator_highlightZeroTick)(xGridLines, xScale.scaleObj);
	                        }

	                        var extraGridLines = selectOrAppend(gridLines, 'g.tau-extraGridLines');
	                        (0, _d3Decorators.d3_decorator_fix_axis_start_line)(extraGridLines, isHorizontal, width, height, animationSpeed);

	                        if (xScale.guide.hideTicks) {
	                            xGridLines.selectAll('.tick').filter(function (d) {
	                                return d != 0;
	                            }).remove();
	                        }
	                    }

	                    if (linesOptions.indexOf('y') > -1) {
	                        var yScale = node.y;
	                        var yOrientKoeff = yScale.guide.scaleOrient === 'right' ? 1 : -1;
	                        var yGridAxis = _d2.default.svg.axis().scale(yScale.scaleObj).orient(yScale.guide.scaleOrient).tickSize(yOrientKoeff * width);

	                        var _formatter = _formatterRegistry.FormatterRegistry.get(yScale.guide.tickFormat);
	                        if (_formatter !== null) {
	                            yGridAxis.ticks(calcTicks(height / yScale.guide.density));
	                            yGridAxis.tickFormat(_formatter);
	                        }

	                        var yGridLines = selectOrAppend(gridLines, 'g.grid-lines-y');
	                        var yGridLinesTrans = (0, _d3Decorators.d3_transition)(yGridLines, animationSpeed).call(yGridAxis);

	                        var _isHorizontal = _utilsDraw.utilsDraw.getOrientation(yScale.guide.scaleOrient) === 'h';
	                        var _prettifyTick = yScale.scaleType === 'ordinal' || yScale.scaleType === 'period';
	                        if (_prettifyTick) {
	                            (0, _d3Decorators.d3_decorator_prettify_categorical_axis_ticks)(yGridLinesTrans, yScale, _isHorizontal, animationSpeed);
	                        }

	                        if (yScale.scaleType === 'linear' && !yScale.guide.hideTicks) {
	                            (0, _d3Decorators.d3_decorator_highlightZeroTick)(yGridLines, yScale.scaleObj);
	                        }

	                        var fixLineScales = ['time', 'ordinal', 'period'];
	                        var fixBottomLine = fixLineScales.indexOf(yScale.scaleType) !== -1;
	                        if (fixBottomLine) {
	                            var _extraGridLines = selectOrAppend(gridLines, 'g.tau-extraGridLines');
	                            (0, _d3Decorators.d3_decorator_fix_axis_start_line)(_extraGridLines, _isHorizontal, width, height, animationSpeed);
	                        }

	                        if (yScale.guide.hideTicks) {
	                            yGridLines.selectAll('.tick').filter(function (d) {
	                                return d != 0;
	                            }).remove();
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
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Parallel = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _element = __webpack_require__(5);

	var _utilsDraw = __webpack_require__(10);

	var _utils = __webpack_require__(3);

	var _const = __webpack_require__(22);

	var _formatterRegistry = __webpack_require__(32);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Parallel = exports.Parallel = function (_Element) {
	    _inherits(Parallel, _Element);

	    function Parallel(config) {
	        _classCallCheck(this, Parallel);

	        var _this = _possibleConstructorReturn(this, (Parallel.__proto__ || Object.getPrototypeOf(Parallel)).call(this, config));

	        _this.config = config;

	        _this.config.guide = _utils.utils.defaults(_this.config.guide || {}, {
	            padding: { l: 50, r: 50, t: 50, b: 50 },
	            enableBrushing: false
	        });

	        _this.columnsBrushes = {};

	        _this.on('force-brush', function (sender, e) {
	            return _this._forceBrushing(e);
	        });

	        var options = _this.config.options;
	        var padding = _this.config.guide.padding;
	        _this.L = options.left + padding.l;
	        _this.T = options.top + padding.t;
	        _this.W = options.width - (padding.l + padding.r);
	        _this.H = options.height - (padding.t + padding.b);
	        return _this;
	    }

	    _createClass(Parallel, [{
	        key: 'defineGrammarModel',
	        value: function defineGrammarModel(fnCreateScale) {

	            var cfg = this.config;

	            var innerWidth = this.W;
	            var innerHeight = this.H;

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

	            this.regScale('columns', this.columnsScalesMap);
	            return {};
	        }
	    }, {
	        key: 'allocateRect',
	        value: function allocateRect() {
	            var _this2 = this;

	            return {
	                slot: function slot(uid) {
	                    return _this2.config.options.container.selectAll('.uid_' + uid);
	                },
	                left: 0,
	                top: 0,
	                width: this.W,
	                height: this.H,
	                // TODO: Fix autoLayout.. redundant properties
	                containerWidth: this.W,
	                containerHeight: this.H
	            };
	        }
	    }, {
	        key: 'drawFrames',
	        value: function drawFrames(frames) {
	            var _this3 = this;

	            var cfg = Object.assign({}, this.config);
	            var options = cfg.options;

	            var updateCellLayers = function updateCellLayers(cellId, cell, frame) {

	                var layers = cell.selectAll('.layer_' + cellId).data(frame.units, function (unit) {
	                    return unit.uid;
	                });
	                layers.exit().remove();
	                layers.enter().append('g').attr('class', function (unit) {
	                    return 'layer_' + cellId + ' uid_' + unit.uid;
	                });
	            };

	            var cellFrameIterator = function cellFrameIterator(cellFrame) {
	                updateCellLayers(options.frameId, _d2.default.select(this), cellFrame);
	            };

	            var grid = this._fnDrawGrid(options.container, cfg, options.frameId, Object.keys(this.columnsScalesMap).reduce(function (memo, k) {
	                return memo.concat([_this3.columnsScalesMap[k].getHash()]);
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

	            var grid = container.selectAll('.grid_' + frameId).data([uniqueHash], function (x) {
	                return x;
	            });
	            grid.exit().remove();
	            grid.enter().append('g').attr('class', 'grid grid_' + frameId).attr('transform', _utilsDraw.utilsDraw.translate(this.L, this.T));

	            return grid;
	        }
	    }, {
	        key: '_fnDrawColumns',
	        value: function _fnDrawColumns(grid, config) {
	            var colsGuide = config.guide.columns || {};
	            var xBase = this.xBase;
	            var columnsScalesMap = this.columnsScalesMap;
	            var d3Axis = _d2.default.svg.axis().orient('left');

	            var cols = grid.selectAll('.column').data(config.columns, function (x) {
	                return x;
	            });
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
	            var _this4 = this;

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

	                _this4.fire('brush', eventBrush);
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
	            var colsBrushSettings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


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
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.GeoMap = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _utils = __webpack_require__(3);

	var _topojson = __webpack_require__(43);

	var _topojson2 = _interopRequireDefault(_topojson);

	var _d3Labeler = __webpack_require__(44);

	var _element = __webpack_require__(5);

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

	        var _this = _possibleConstructorReturn(this, (GeoMap.__proto__ || Object.getPrototypeOf(GeoMap)).call(this, config));

	        _this.config = config;
	        _this.config.guide = _utils.utils.defaults(_this.config.guide || {}, {
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
	        key: 'defineGrammarModel',
	        value: function defineGrammarModel(fnCreateScale) {

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

	            this.regScale('latitude', this.latScale).regScale('longitude', this.lonScale).regScale('size', this.sizeScale).regScale('color', this.colorScale).regScale('code', this.codeScale).regScale('fill', this.fillScale);

	            return {};
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
	                    return !Number.isNaN(d.x) && !Number.isNaN(d.y);
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

	            var xmap = node.selectAll('.map-container').data(['' + innerW + innerH + center + contours.join('-')], function (x) {
	                return x;
	            });
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
	                    return 'frame frame-' + f.hash;
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

	            var frameGroups = xmap.selectAll('.frame').data(frames.map(mapper), function (f) {
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
/* 43 */
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
/* 44 */
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
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Point = undefined;

	var _const = __webpack_require__(22);

	var _grammarRegistry = __webpack_require__(7);

	var _layerLabels = __webpack_require__(46);

	var _d3Decorators = __webpack_require__(9);

	var _utils = __webpack_require__(3);

	var _utilsDom = __webpack_require__(1);

	var _utilsDraw = __webpack_require__(10);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var Point = {
	    init: function init(xConfig) {

	        var config = Object.assign({}, xConfig);

	        config.guide = _utils.utils.defaults(config.guide || {}, {
	            animationSpeed: 0,
	            avoidScalesOverflow: true,
	            enableColorToBarPosition: false,
	            maxHighlightDistance: 32
	        });

	        config.guide.size = config.guide.size || {};

	        config.guide.label = _utils.utils.defaults(config.guide.label || {}, {
	            position: ['auto:avoid-label-label-overlap', 'auto:avoid-label-anchor-overlap', 'auto:adjust-on-label-overflow', 'auto:hide-on-label-label-overlap', 'auto:hide-on-label-anchor-overlap']
	        });

	        var avoidScalesOverflow = config.guide.avoidScalesOverflow;
	        var enableColorPositioning = config.guide.enableColorToBarPosition;

	        config.transformRules = [function (prevModel) {
	            var bestBaseScale = [prevModel.scaleX, prevModel.scaleY].sort(function (a, b) {
	                var discreteA = a.discrete ? 1 : 0;
	                var discreteB = b.discrete ? 1 : 0;
	                return discreteB * b.domain().length - discreteA * a.domain().length;
	            })[0];
	            var isHorizontal = prevModel.scaleY === bestBaseScale;
	            return isHorizontal ? _grammarRegistry.GrammarRegistry.get('flip')(prevModel) : _grammarRegistry.GrammarRegistry.get('identity')(prevModel);
	        }, config.stack && _grammarRegistry.GrammarRegistry.get('stack'), enableColorPositioning && _grammarRegistry.GrammarRegistry.get('positioningByColor')].filter(function (x) {
	            return x;
	        }).concat(config.transformModel || []);

	        config.adjustRules = [config.stack && _grammarRegistry.GrammarRegistry.get('adjustYScale'), function (prevModel, args) {
	            var isEmptySize = prevModel.scaleSize.isEmptyScale();
	            var sizeCfg = _utils.utils.defaults(config.guide.size, {
	                defMinSize: 10,
	                defMaxSize: isEmptySize ? 10 : 40,
	                enableDistributeEvenly: !isEmptySize
	            });
	            var params = Object.assign({}, args, {
	                defMin: sizeCfg.defMinSize,
	                defMax: sizeCfg.defMaxSize,
	                minLimit: sizeCfg.minSize,
	                maxLimit: sizeCfg.maxSize
	            });

	            var method = sizeCfg.enableDistributeEvenly ? _grammarRegistry.GrammarRegistry.get('adjustSigmaSizeScale') : _grammarRegistry.GrammarRegistry.get('adjustStaticSizeScale');

	            return method(prevModel, params);
	        }, avoidScalesOverflow && function (prevModel, args) {
	            var params = Object.assign({}, args, {
	                sizeDirection: 'xy'
	            });
	            return _grammarRegistry.GrammarRegistry.get('avoidScalesOverflow')(prevModel, params);
	        }].filter(function (x) {
	            return x;
	        });

	        return config;
	    },
	    addInteraction: function addInteraction() {
	        var _this = this;

	        var node = this.node();
	        var createFilter = function createFilter(data, falsy) {
	            return function (row) {
	                return row === data ? true : falsy;
	            };
	        };
	        node.on('highlight', function (sender, filter) {
	            return _this.highlight(filter);
	        });
	        node.on('data-hover', function (sender, e) {
	            return _this.highlight(createFilter(e.data, null));
	        });
	    },
	    draw: function draw() {

	        var node = this.node();
	        var config = node.config;
	        var options = config.options;
	        // TODO: hide it somewhere
	        options.container = options.slot(config.uid);

	        var transition = function transition(sel) {
	            return (0, _d3Decorators.d3_transition)(sel, config.guide.animationSpeed);
	        };

	        var prefix = _const.CSS_PREFIX + 'dot dot i-role-element i-role-datum';
	        var screenModel = node.screenModel;
	        var kRound = 10000;

	        var circleAttrs = {
	            fill: function fill(d) {
	                return screenModel.color(d);
	            },
	            class: function _class(d) {
	                return prefix + ' ' + screenModel.class(d);
	            }
	        };

	        var circleTransAttrs = {
	            r: function r(d) {
	                return Math.round(kRound * screenModel.size(d) / 2) / kRound;
	            },
	            cx: function cx(d) {
	                return screenModel.x(d);
	            },
	            cy: function cy(d) {
	                return screenModel.y(d);
	            }
	        };

	        var updateGroups = function updateGroups() {

	            this.attr('class', 'frame').call(function () {
	                var dots = this.selectAll('circle').data(function (fiber) {
	                    return fiber;
	                }, screenModel.id);

	                transition(dots.enter().append('circle').attr(circleAttrs)).attr(circleTransAttrs);

	                transition(dots.attr(circleAttrs)).attr(circleTransAttrs);

	                transition(dots.exit()).attr({ r: 0 }).remove();

	                node.subscribe(dots);
	            });

	            transition(this).attr('opacity', 1);
	        };

	        var fibers = screenModel.toFibers();
	        this._getGroupOrder = function () {
	            var map = fibers.reduce(function (map, f, i) {
	                map.set(f, i);
	                return map;
	            }, new Map());
	            return function (g) {
	                return map.get(g);
	            };
	        }();

	        var frameGroups = options.container.selectAll('.frame').data(fibers, function (f) {
	            return screenModel.group(f[0]);
	        });

	        frameGroups.enter().append('g').attr('opacity', 0).call(updateGroups);

	        frameGroups.call(updateGroups);

	        // TODO: Render bars into single container, exclude removed elements from calculation.
	        this._boundsInfo = this._getBoundsInfo(frameGroups.selectAll('.dot').reduce(function (m, g) {
	            return m.concat(g);
	        }, []));

	        transition(frameGroups.exit()).attr('opacity', 0).remove().selectAll('circle').attr('r', 0);

	        node.subscribe(new _layerLabels.LayerLabels(screenModel.model, screenModel.flip, config.guide.label, options).draw(fibers));
	    },
	    _getBoundsInfo: function _getBoundsInfo(dots) {
	        if (dots.length === 0) {
	            return null;
	        }

	        var screenModel = this.node().screenModel;

	        var items = dots.map(function (node) {
	            var data = _d2.default.select(node).data()[0];
	            var x = screenModel.x(data);
	            var y = screenModel.y(data);
	            var r = screenModel.size(data) / 2;

	            return { node: node, data: data, x: x, y: y, r: r };
	        })
	        // TODO: Removed elements should not be passed to this function.
	        .filter(function (item) {
	            return !isNaN(item.x) && !isNaN(item.y);
	        });

	        var bounds = items.reduce(function (bounds, _ref) {
	            var x = _ref.x,
	                y = _ref.y;

	            bounds.left = Math.min(x, bounds.left);
	            bounds.right = Math.max(x, bounds.right);
	            bounds.top = Math.min(y, bounds.top);
	            bounds.bottom = Math.max(y, bounds.bottom);
	            return bounds;
	        }, {
	            left: Number.MAX_VALUE,
	            right: Number.MIN_VALUE,
	            top: Number.MAX_VALUE,
	            bottom: Number.MIN_VALUE
	        });

	        // NOTE: There can be multiple items at the same point, but
	        // D3 quad tree seems to ignore them.
	        var coordinates = items.reduce(function (coordinates, item) {
	            var c = item.x + ',' + item.y;
	            if (!coordinates[c]) {
	                coordinates[c] = [];
	            }
	            coordinates[c].push(item);
	            return coordinates;
	        }, {});

	        var tree = _d2.default.geom.quadtree().x(function (d) {
	            return d[0].x;
	        }).y(function (d) {
	            return d[0].y;
	        })(Object.keys(coordinates).map(function (c) {
	            return coordinates[c];
	        }));

	        return { bounds: bounds, tree: tree };
	    },
	    getClosestElement: function getClosestElement(_cursorX, _cursorY) {
	        if (!this._boundsInfo) {
	            return null;
	        }
	        var _boundsInfo = this._boundsInfo,
	            bounds = _boundsInfo.bounds,
	            tree = _boundsInfo.tree;

	        var container = this.node().config.options.container;
	        var translate = _utilsDraw.utilsDraw.getDeepTransformTranslate(container.node());
	        var cursorX = _cursorX - translate.x;
	        var cursorY = _cursorY - translate.y;
	        var maxHighlightDistance = this.node().config.guide.maxHighlightDistance;

	        if (cursorX < bounds.left - maxHighlightDistance || cursorX > bounds.right + maxHighlightDistance || cursorY < bounds.top - maxHighlightDistance || cursorY > bounds.bottom + maxHighlightDistance) {
	            return null;
	        }

	        var items = (tree.find([cursorX, cursorY]) || []).map(function (item) {
	            var distance = Math.sqrt(Math.pow(cursorX - item.x, 2) + Math.pow(cursorY - item.y, 2));
	            if (distance > maxHighlightDistance) {
	                return null;
	            }
	            var secondaryDistance = distance < item.r ? item.r - distance : distance;
	            return {
	                node: item.node,
	                data: item.data,
	                x: item.x,
	                y: item.y,
	                distance: distance,
	                secondaryDistance: secondaryDistance
	            };
	        }).filter(function (d) {
	            return d;
	        }).sort(function (a, b) {
	            return a.secondaryDistance - b.secondaryDistance;
	        });

	        var largerDistIndex = items.findIndex(function (d) {
	            return d.distance !== items[0].distance || d.secondaryDistance !== items[0].secondaryDistance;
	        });
	        var sameDistItems = largerDistIndex < 0 ? items : items.slice(0, largerDistIndex);
	        if (sameDistItems.length === 1) {
	            return sameDistItems[0];
	        }
	        var mx = sameDistItems.reduce(function (sum, item) {
	            return sum + item.x;
	        }, 0) / sameDistItems.length;
	        var my = sameDistItems.reduce(function (sum, item) {
	            return sum + item.y;
	        }, 0) / sameDistItems.length;
	        var angle = Math.atan2(my - cursorY, mx - cursorX) + Math.PI;
	        var closest = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)];
	        return closest;
	    },
	    highlight: function highlight(filter) {
	        var _classed;

	        var x = 'graphical-report__highlighted';
	        var _ = 'graphical-report__dimmed';

	        var container = this.node().config.options.container;
	        var classed = (_classed = {}, _defineProperty(_classed, x, function (d) {
	            return filter(d) === true;
	        }), _defineProperty(_classed, _, function (d) {
	            return filter(d) === false;
	        }), _classed);

	        container.selectAll('.dot').classed(classed);

	        container.selectAll('.i-role-label').classed(classed);

	        this._sortElements(filter);
	    },
	    _sortElements: function _sortElements(filter) {
	        var _this2 = this;

	        var container = this.node().config.options.container;

	        // Sort frames
	        var filters = new Map();
	        var groups = new Map();
	        container.selectAll('.frame').each(function (d) {
	            filters.set(this, d.some(filter));
	            groups.set(this, d);
	        });
	        var compareFilterThenGroupId = _utils.utils.createMultiSorter(function (a, b) {
	            return filters.get(a) - filters.get(b);
	        }, function (a, b) {
	            return _this2._getGroupOrder(groups.get(a)) - _this2._getGroupOrder(groups.get(b));
	        });
	        _utilsDom.utilsDom.sortChildren(container.node(), function (a, b) {
	            if (a.tagName === 'g' && b.tagName === 'g') {
	                return compareFilterThenGroupId(a, b);
	            }
	            return a.tagName.localeCompare(b.tagName); // Note: raise <text> over <g>.
	        });

	        // Raise filtered dots over others
	        _utilsDraw.utilsDraw.raiseElements(container, '.dot', filter);
	    }
	};

	exports.Point = Point;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LayerLabels = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utilsDraw = __webpack_require__(10);

	var _utilsDom = __webpack_require__(1);

	var _utils = __webpack_require__(3);

	var _layerLabelsModel = __webpack_require__(47);

	var _layerLabelsRules = __webpack_require__(48);

	var _layerLabelsAnnealingSimulator = __webpack_require__(49);

	var _layerLabelsPenalties = __webpack_require__(50);

	var _formatterRegistry = __webpack_require__(32);

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var intersect = function intersect(x1, x2, x3, x4, y1, y2, y3, y4) {
	    return _utilsDraw.utilsDraw.isIntersect(x1, y1, x2, y2, x3, y3, x4, y4);
	};

	var LayerLabels = exports.LayerLabels = function () {
	    function LayerLabels(model, isHorizontal, labelGuide, _ref) {
	        var width = _ref.width,
	            height = _ref.height,
	            container = _ref.container;

	        _classCallCheck(this, LayerLabels);

	        this.container = container;
	        this.model = model;
	        this.flip = isHorizontal;
	        this.w = width;
	        this.h = height;
	        this.guide = _utils.utils.defaults(labelGuide || {}, {
	            fontFamily: 'Helvetica Neue, Segoe UI, Open Sans, Ubuntu, sans-serif',
	            fontWeight: 'normal',
	            fontSize: 10,
	            fontColor: '#000',
	            hideEqualLabels: false,
	            position: [],
	            tickFormat: null,
	            tickFormatNullAlias: ''
	        });
	    }

	    _createClass(LayerLabels, [{
	        key: 'draw',
	        value: function draw(fibers) {

	            var self = this;

	            var model = this.model;
	            var guide = this.guide;

	            var seed = _layerLabelsModel.LayerLabelsModel.seed(model, {
	                fontSize: guide.fontSize,
	                fontColor: guide.fontColor,
	                flip: self.flip,
	                formatter: _formatterRegistry.FormatterRegistry.get(guide.tickFormat, guide.tickFormatNullAlias),
	                labelRectSize: function labelRectSize(str) {
	                    return _utilsDom.utilsDom.getLabelSize(str, guide);
	                }
	            });

	            var args = { maxWidth: self.w, maxHeight: self.h, data: fibers.reduce(function (memo, f) {
	                    return memo.concat(f);
	                }, []) };

	            var fixedPosition = guide.position.filter(function (token) {
	                return token.indexOf('auto:') === -1;
	            });

	            var m = fixedPosition.map(_layerLabelsRules.LayerLabelsRules.getRule).reduce(function (prev, rule) {
	                return _layerLabelsModel.LayerLabelsModel.compose(prev, rule(prev, args));
	            }, seed);

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
	                        x: m.x(row) + m.dx(row),
	                        y: m.y(row) + m.dy(row),
	                        w: m.w(row),
	                        h: m.h(row, args),
	                        hide: m.hide(row),
	                        extr: null,
	                        size: m.model.size(row),
	                        angle: m.angle(row),
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
	                return Object.assign(r, { i: i });
	            });

	            var tokens = this.guide.position.filter(function (token) {
	                return token.indexOf('auto:avoid') === 0;
	            });
	            parallel = parallel.text.length > 0 && tokens.length > 0 ? this.autoPosition(parallel, tokens) : parallel;

	            var flags = this.guide.position.reduce(function (memo, token) {
	                return Object.assign(memo, _defineProperty({}, token, true));
	            }, {});

	            parallel.text = parallel.text = flags['auto:adjust-on-label-overflow'] ? this.adjustOnOverflow(parallel.text, args) : parallel.text;

	            parallel.text = flags['auto:hide-on-label-edges-overlap'] ? this.hideOnLabelEdgesOverlap(parallel.text, parallel.edges) : parallel.text;

	            parallel.text = flags['auto:hide-on-label-label-overlap'] ? this.hideOnLabelLabelOverlap(parallel.text) : parallel.text;

	            parallel.text = flags['auto:hide-on-label-anchor-overlap'] ? this.hideOnLabelAnchorOverlap(parallel.text) : parallel.text;

	            var labels = parallel.text;

	            var get = function get(prop) {
	                return function (__, i) {
	                    return labels[i][prop];
	                };
	            };

	            var xi = get('x');
	            var yi = get('y');
	            var angle = get('angle');
	            var color = get('color');
	            var label = get('label');
	            var update = function update() {
	                this.style('fill', color).style('font-size', self.guide.fontSize + 'px').style('display', function (__, i) {
	                    return labels[i].hide ? 'none' : null;
	                }).attr('class', 'i-role-label').attr('text-anchor', 'middle').attr('transform', function (d, i) {
	                    return 'translate(' + xi(d, i) + ',' + yi(d, i) + ') rotate(' + angle(d, i) + ')';
	                }).text(label);
	            };

	            if (guide.hideEqualLabels) {
	                labels.filter(function (d) {
	                    return !d.hide;
	                }).filter(function (d, i, visibleLabels) {
	                    return i < visibleLabels.length - 1 && d.label === visibleLabels[i + 1].label;
	                }).forEach(function (d) {
	                    return d.hide = true;
	                });
	            }

	            var text = this.container.selectAll('.i-role-label').data(labels.map(function (r) {
	                return r.data;
	            }));
	            text.exit().remove();
	            text.call(update);
	            text.enter().append('text').call(update);

	            return text;
	        }
	    }, {
	        key: 'autoPosition',
	        value: function autoPosition(parallel, tokens) {

	            var calcEllipticXY = function calcEllipticXY(r, angle) {
	                var xReserve = 4;
	                var yReserve = 2;
	                var a = xReserve + (r.size + r.w) / 2;
	                var b = yReserve + (r.size + r.h) / 2;
	                return {
	                    x: a * Math.cos(angle),
	                    y: b * Math.sin(angle)
	                };
	            };

	            var edges = parallel.edges;
	            var labels = parallel.text.map(function (r) {
	                var maxAngles = {
	                    max: -Math.PI / 2,
	                    min: Math.PI / 2,
	                    norm: Math.random() * Math.PI * 2
	                };
	                var xy = calcEllipticXY(r, maxAngles[r.extr]);
	                return {
	                    i: r.i,
	                    x0: r.x,
	                    y0: r.y,
	                    x: r.x + xy.x,
	                    y: r.y + xy.y,
	                    w: r.w,
	                    h: r.h,
	                    size: r.size,
	                    hide: r.hide,
	                    extr: r.extr
	                };
	            }).filter(function (r) {
	                return !r.hide;
	            });

	            var sim = new _layerLabelsAnnealingSimulator.AnnealingSimulator({
	                items: labels,
	                transactor: function transactor(row) {
	                    var prevX = row.x;
	                    var prevY = row.y;
	                    return {
	                        modify: function modify() {
	                            var maxAngles = {
	                                max: -Math.PI,
	                                min: Math.PI,
	                                norm: Math.PI * 2
	                            };
	                            var segm = 4;
	                            var maxAngle = maxAngles[row.extr];
	                            var angle = maxAngle / segm + Math.random() * (maxAngle * (segm - 2)) / segm;
	                            var xy = calcEllipticXY(row, angle);

	                            row.x = row.x0 + xy.x;
	                            row.y = row.y0 + xy.y;

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
	                    return _layerLabelsPenalties.LayerLabelsPenalties.get(token);
	                }).filter(function (x) {
	                    return x;
	                }).map(function (penalty) {
	                    return penalty(labels, edges);
	                })
	            });

	            var bestRevision = sim.start(5);

	            parallel.text = bestRevision.reduce(function (memo, l) {
	                var r = memo[l.i];
	                r.x = l.x;
	                r.y = l.y;
	                return memo;
	            }, parallel.text);

	            return parallel;
	        }
	    }, {
	        key: 'hideOnLabelEdgesOverlap',
	        value: function hideOnLabelEdgesOverlap(data, edges) {
	            var _this = this;

	            var penaltyLabelEdgesOverlap = function penaltyLabelEdgesOverlap(label, edges) {
	                var rect = _this.getLabelRect(label);
	                return edges.reduce(function (sum, edge) {
	                    var overlapTop = intersect(rect.x0, rect.x1, edge.x0, edge.x1, rect.y0, rect.y1, edge.y0, edge.y1);
	                    var overlapBtm = intersect(rect.x0, rect.x1, edge.x0, edge.x1, rect.y1, rect.y0, edge.y0, edge.y1);
	                    return sum + (overlapTop + overlapBtm) * 2;
	                }, 0);
	            };

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
	            var _this2 = this;

	            var extremumOrder = { min: 0, max: 1, norm: 2 };
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
	                var ra = _this2.getLabelRect(a);
	                var rb = _this2.getLabelRect(b);
	                var k = !a.hide && !b.hide;

	                var x_overlap = k * Math.max(0, Math.min(rb.x1, ra.x1) - Math.max(ra.x0, rb.x0));
	                var y_overlap = k * Math.max(0, Math.min(rb.y1, ra.y1) - Math.max(ra.y0, rb.y0));

	                if (x_overlap * y_overlap > 0) {
	                    var p = [a, b];
	                    p.sort(function (p0, p1) {
	                        return extremumOrder[p0.extr] - extremumOrder[p1.extr];
	                    });
	                    var r = collisionSolveStrategies[p[0].extr + '/' + p[1].extr](p[0], p[1]) < 0 ? p[0] : p[1];
	                    r.hide = true;
	                }
	            };

	            data.filter(function (r) {
	                return !r.hide;
	            }).sort(function (p0, p1) {
	                return extremumOrder[p0.extr] - extremumOrder[p1.extr];
	            }).forEach(function (a) {
	                data.forEach(function (b) {
	                    if (a.i !== b.i) {
	                        cross(a, b);
	                    }
	                });
	            });

	            return data;
	        }
	    }, {
	        key: 'getLabelRect',
	        value: function getLabelRect(a) {
	            var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            return {
	                x0: a.x - a.w / 2 - border,
	                x1: a.x + a.w / 2 + border,
	                y0: a.y - a.h / 2 - border,
	                y1: a.y + a.h / 2 + border
	            };
	        }
	    }, {
	        key: 'getPointRect',
	        value: function getPointRect(a) {
	            var border = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            return {
	                x0: a.x - a.size / 2 - border,
	                x1: a.x + a.size / 2 + border,
	                y0: a.y - a.size / 2 - border,
	                y1: a.y + a.size / 2 + border
	            };
	        }
	    }, {
	        key: 'hideOnLabelAnchorOverlap',
	        value: function hideOnLabelAnchorOverlap(data) {
	            var _this3 = this;

	            var isIntersects = function isIntersects(label, point) {
	                var labelRect = _this3.getLabelRect(label, 2);
	                var pointRect = _this3.getPointRect(point, 2);

	                var x_overlap = Math.max(0, Math.min(pointRect.x1, labelRect.x1) - Math.max(pointRect.x0, labelRect.x0));

	                var y_overlap = Math.max(0, Math.min(pointRect.y1, labelRect.y1) - Math.max(pointRect.y0, labelRect.y0));

	                return x_overlap * y_overlap > 0.001;
	            };

	            data.filter(function (row) {
	                return !row.hide;
	            }).forEach(function (label) {
	                var dataLength = data.length;
	                for (var i = 0; i < dataLength; i++) {
	                    var point = data[i];
	                    if (label.i !== point.i && isIntersects(label, point)) {
	                        label.hide = true;
	                        break;
	                    }
	                }
	            });

	            return data;
	        }
	    }, {
	        key: 'adjustOnOverflow',
	        value: function adjustOnOverflow(data, _ref2) {
	            var maxWidth = _ref2.maxWidth,
	                maxHeight = _ref2.maxHeight;

	            return data.map(function (row) {
	                if (!row.hide) {
	                    row.x = Math.min(Math.max(row.x, row.w / 2), maxWidth - row.w / 2);
	                    row.y = Math.max(Math.min(row.y, maxHeight - row.h / 2), row.h / 2);
	                }
	                return row;
	            });
	        }
	    }]);

	    return LayerLabels;
	}();

/***/ },
/* 47 */
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
	        this.dx = prev.dx || createFunc(0);
	        this.dy = prev.dy || createFunc(0);
	        this.w = prev.w || createFunc(0);
	        this.h = prev.h || createFunc(0);
	        this.hide = prev.hide || createFunc(false);
	        this.label = prev.label || createFunc('');
	        this.color = prev.color || createFunc('');
	        this.angle = prev.angle || createFunc(0);
	    }

	    _createClass(LayerLabelsModel, null, [{
	        key: 'seed',
	        value: function seed(model, _ref) {
	            var fontColor = _ref.fontColor,
	                flip = _ref.flip,
	                formatter = _ref.formatter,
	                labelRectSize = _ref.labelRectSize,
	                _ref$paddingKoeff = _ref.paddingKoeff,
	                paddingKoeff = _ref$paddingKoeff === undefined ? 0.5 : _ref$paddingKoeff;


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
	                    return _y(row);
	                },
	                dy: function dy(row) {
	                    return labelRectSize(label(row)).height * paddingKoeff;
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
	                },
	                angle: function angle() {
	                    return 0;
	                }
	            });
	        }
	    }, {
	        key: 'compose',
	        value: function compose(prev) {
	            var updates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	            return Object.keys(updates).reduce(function (memo, propName) {
	                memo[propName] = updates[propName];
	                return memo;
	            }, new LayerLabelsModel(prev));
	        }
	    }]);

	    return LayerLabelsModel;
	}();

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LayerLabelsRules = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _layerLabelsModel = __webpack_require__(47);

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

	var findCutIndex = function findCutIndex(text, labelWidth, availableSpace) {
	    return availableSpace < labelWidth ? Math.max(1, Math.floor(availableSpace * text.length / labelWidth)) - 1 : text.length;
	};

	var cutString = function cutString(str, index) {
	    return index === 0 ? '' : str.slice(0, index).replace(/\.+$/g, '') + '\u2026';
	};

	var isPositive = function isPositive(scale, row) {
	    return scale.discrete || !scale.discrete && row[scale.dim] >= 0;
	};
	var isNegative = function isNegative(scale, row) {
	    return !scale.discrete && row[scale.dim] < 0;
	};
	var alignByX = function alignByX(exp) {
	    return function (prev) {
	        return {
	            dx: function dx(row) {

	                var ordinateScale = prev.model.scaleY;

	                if (exp[2] === '+' && !isPositive(ordinateScale, row)) {
	                    return prev.dx(row);
	                }

	                if (exp[2] === '-' && !isNegative(ordinateScale, row)) {
	                    return prev.dx(row);
	                }

	                var k = exp[1];
	                var u = exp[0] === exp[0].toUpperCase() ? 1 : 0;

	                return prev.dx(row) + k * (prev.w(row) / 2) + k * u * prev.model.size(row) / 2 + k * 2;
	            }
	        };
	    };
	};

	var alignByY = function alignByY(exp) {
	    return function (prev) {
	        return {
	            dy: function dy(row) {

	                var ordinateScale = prev.model.scaleY;

	                if (exp[2] === '+' && !isPositive(ordinateScale, row)) {
	                    return prev.dy(row);
	                }

	                if (exp[2] === '-' && !isNegative(ordinateScale, row)) {
	                    return prev.dy(row);
	                }

	                var k = exp[1];
	                var u = exp[0] === exp[0].toUpperCase() ? 1 : 0;

	                return prev.dy(row) + k * (prev.h(row) / 2) + k * u * prev.model.size(row) / 2 + k * 2;
	            }
	        };
	    };
	};

	LayerLabelsRules.regRule('l', alignByX(['l', -1, null])).regRule('L', alignByX(['L', -1, null])).regRule('l+', alignByX(['l', -1, '+'])).regRule('l-', alignByX(['l', -1, '-'])).regRule('L+', alignByX(['L', -1, '+'])).regRule('L-', alignByX(['L', -1, '-'])).regRule('r', alignByX(['r', 1, null])).regRule('R', alignByX(['R', 1, null])).regRule('r+', alignByX(['r', 1, '+'])).regRule('r-', alignByX(['r', 1, '-'])).regRule('R+', alignByX(['R', 1, '+'])).regRule('R-', alignByX(['R', 1, '-'])).regRule('t', alignByY(['t', -1, null])).regRule('T', alignByY(['T', -1, null])).regRule('t+', alignByY(['t', -1, '+'])).regRule('t-', alignByY(['t', -1, '-'])).regRule('T+', alignByY(['T', -1, '+'])).regRule('T-', alignByY(['T', -1, '-'])).regRule('b', alignByY(['b', 1, null])).regRule('B', alignByY(['B', 1, null])).regRule('b+', alignByY(['b', 1, '+'])).regRule('b-', alignByY(['b', 1, '-'])).regRule('B+', alignByY(['B', 1, '+'])).regRule('B-', alignByY(['B', 1, '-'])).regRule('rotate-on-size-overflow', function (prev, _ref) {
	    var data = _ref.data;


	    var out = function out(row) {
	        return prev.model.size(row) < prev.w(row);
	    };
	    var overflowCount = data.reduce(function (memo, row) {
	        return memo + (out(row) ? 1 : 0);
	    }, 0);

	    var isRot = overflowCount / data.length > 0.5;

	    var changes = {};
	    if (isRot) {
	        var padKoeff = 0.5;
	        changes = {
	            angle: function angle() {
	                return -90;
	            },
	            w: function w(row) {
	                return prev.h(row);
	            },
	            h: function h(row) {
	                return prev.w(row);
	            },
	            dx: function dx(row) {
	                return prev.h(row) * padKoeff - 2;
	            },
	            dy: function dy() {
	                return 0;
	            }
	        };
	    }

	    return changes;
	}).regRule('hide-by-label-height-vertical', function (prev) {

	    return {

	        hide: function hide(row) {

	            var availableSpace = void 0;
	            var requiredSpace = void 0;
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
	}).regRule('cut-label-vertical', function (prev) {

	    return {

	        h: function h(row) {
	            var reserved = prev.h(row);
	            if (Math.abs(prev.angle(row)) > 0) {
	                var text = prev.label(row);
	                var available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	                var index = findCutIndex(text, reserved, available);
	                return index < text.length ? available : reserved;
	            }

	            return reserved;
	        },

	        w: function w(row) {
	            var reserved = prev.w(row);
	            if (prev.angle(row) === 0) {
	                var text = prev.label(row);
	                var available = prev.model.size(row);
	                var index = findCutIndex(text, reserved, available);
	                return index < text.length ? available : reserved;
	            }

	            return reserved;
	        },

	        label: function label(row) {
	            var reserved = void 0;
	            var available = void 0;
	            if (prev.angle(row) === 0) {
	                reserved = prev.w(row);
	                available = prev.model.size(row);
	            } else {
	                reserved = prev.h(row);
	                available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	            }

	            var text = prev.label(row);
	            var index = findCutIndex(text, reserved, available);

	            return index < text.length ? cutString(text, index) : text;
	        },

	        dy: function dy(row) {
	            var prevDy = prev.dy(row);

	            if (prev.angle(row) !== 0) {
	                var reserved = prev.h(row);
	                var available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	                var text = prev.label(row);
	                var index = findCutIndex(text, reserved, available);

	                return index < text.length ? available * prevDy / reserved : prevDy;
	            }

	            return prevDy;
	        }
	    };
	}).regRule('cut-outer-label-vertical', function (prev) {

	    return {

	        h: function h(row, args) {
	            var reserved = prev.h(row);
	            if (Math.abs(prev.angle(row)) > 0) {
	                var text = prev.label(row);
	                var available = prev.model.y0(row) < prev.model.yi(row) ? args.maxHeight - prev.model.yi(row) : prev.model.yi(row);
	                var index = findCutIndex(text, reserved, available);
	                return index < text.length ? available : reserved;
	            }

	            return reserved;
	        },

	        w: function w(row) {
	            var reserved = prev.w(row);
	            if (prev.angle(row) === 0) {
	                var text = prev.label(row);
	                var available = prev.model.size(row);
	                var index = findCutIndex(text, reserved, available);
	                return index < text.length ? available : reserved;
	            }

	            return reserved;
	        },

	        label: function label(row, args) {
	            var reserved = void 0;
	            var available = void 0;
	            if (prev.angle(row) === 0) {
	                reserved = prev.w(row);
	                available = prev.model.size(row);
	            } else {
	                reserved = prev.h(row);
	                available = prev.model.y0(row) < prev.model.yi(row) ? args.maxHeight - prev.model.yi(row) : prev.model.yi(row);
	            }

	            var text = prev.label(row);
	            var index = findCutIndex(text, reserved, available);

	            return index < text.length ? cutString(text, index) : text;
	        },

	        dy: function dy(row, args) {
	            var prevDy = prev.dy(row);

	            if (prev.angle(row) !== 0) {
	                var reserved = prev.h(row);
	                var available = prev.model.y0(row) < prev.model.yi(row) ? args.maxHeight - prev.model.yi(row) : prev.model.yi(row);
	                var text = prev.label(row);
	                var index = findCutIndex(text, reserved, available);

	                return index < text.length ? available * prevDy / reserved : prevDy;
	            }

	            return prevDy;
	        }
	    };
	}).regRule('outside-then-inside-horizontal', function (prev, args) {

	    var outer = ['r+', 'l-', 'cut-outer-label-horizontal'].map(LayerLabelsRules.getRule).reduce(function (p, r) {
	        return _layerLabelsModel.LayerLabelsModel.compose(p, r(p, args));
	    }, prev);

	    var inner = ['r-', 'l+', 'hide-by-label-height-horizontal', 'cut-label-horizontal'].map(LayerLabelsRules.getRule).reduce(function (p, r) {
	        return _layerLabelsModel.LayerLabelsModel.compose(p, r(p, args));
	    }, prev);

	    var betterInside = function betterInside(row) {
	        return inner.label(row).length > outer.label(row).length;
	    };

	    return Object.assign({}, outer, ['x', 'dx', 'hide', 'label'].reduce(function (obj, prop) {
	        obj[prop] = function (row) {
	            return (betterInside(row) ? inner : outer)[prop](row);
	        };
	        return obj;
	    }, {}));
	}).regRule('outside-then-inside-vertical', function (prev, args) {

	    var outer = ['t+', 'b-', 'cut-outer-label-vertical'].map(LayerLabelsRules.getRule).reduce(function (p, r) {
	        return _layerLabelsModel.LayerLabelsModel.compose(p, r(p, args));
	    }, prev);

	    var inner = ['t-', 'b+', 'hide-by-label-height-vertical', 'cut-label-vertical'].map(LayerLabelsRules.getRule).reduce(function (p, r) {
	        return _layerLabelsModel.LayerLabelsModel.compose(p, r(p, args));
	    }, prev);

	    var betterInside = function betterInside(row) {
	        return inner.label(row, args).length > outer.label(row, args).length;
	    };

	    return Object.assign({}, outer, ['y', 'dy', 'hide', 'label'].reduce(function (obj, prop) {
	        obj[prop] = function (row) {
	            return (betterInside(row) ? inner : outer)[prop](row, args);
	        };
	        return obj;
	    }, {}));
	}).regRule('hide-by-label-height-horizontal', function (prev) {

	    return {

	        hide: function hide(row) {

	            if (prev.model.size(row) < prev.h(row)) {
	                return true;
	            }

	            return prev.hide(row);
	        }
	    };
	}).regRule('cut-label-horizontal', function (prev) {

	    return {

	        dx: function dx(row) {
	            var text = prev.label(row);
	            var required = prev.w(row);
	            var available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	            var index = findCutIndex(text, required, available);
	            var prevDx = prev.dx(row);
	            return index < text.length ? available * prevDx / required : prevDx;
	        },

	        w: function w(row) {
	            var text = prev.label(row);
	            var required = prev.w(row);
	            var available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	            var index = findCutIndex(text, required, available);
	            return index < text.length ? available : required;
	        },

	        label: function label(row) {
	            var text = prev.label(row);
	            var required = prev.w(row);
	            var available = Math.abs(prev.model.y0(row) - prev.model.yi(row));
	            var index = findCutIndex(text, required, available);
	            return index < text.length ? cutString(text, index) : text;
	        }
	    };
	}).regRule('cut-outer-label-horizontal', function (prev, args) {

	    return {

	        dx: function dx(row) {
	            var text = prev.label(row);
	            var required = prev.w(row);
	            var available = prev.model.y0(row) < prev.model.yi(row) ? args.maxWidth - prev.model.yi(row) : prev.model.yi(row);
	            var index = findCutIndex(text, required, available);
	            var prevDx = prev.dx(row);
	            return index < text.length ? available * prevDx / required : prevDx;
	        },

	        w: function w(row) {
	            var text = prev.label(row);
	            var required = prev.w(row);
	            var available = prev.model.y0(row) < prev.model.yi(row) ? args.maxWidth - prev.model.yi(row) : prev.model.yi(row);
	            var index = findCutIndex(text, required, available);
	            return index < text.length ? available : required;
	        },

	        label: function label(row) {
	            var text = prev.label(row);
	            var required = prev.w(row);
	            var available = prev.model.y0(row) < prev.model.yi(row) ? args.maxWidth - prev.model.yi(row) : prev.model.yi(row);
	            var index = findCutIndex(text, required, available);
	            return index < text.length ? cutString(text, index) : text;
	        }
	    };
	}).regRule('keep-within-diameter-or-top', function (prev) {
	    return {
	        dy: function dy(row) {

	            if (prev.model.size(row) / prev.w(row) < 1) {
	                return prev.dy(row) - prev.h(row) / 2 - prev.model.size(row) / 2;
	            }

	            return prev.dy(row);
	        }
	    };
	}).regRule('keep-in-box', function (prev, _ref2) {
	    var maxWidth = _ref2.maxWidth,
	        maxHeight = _ref2.maxHeight;

	    return {
	        dx: function dx(row) {
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
	        dy: function dy(row) {
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
	});

/***/ },
/* 49 */
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

	        this.minError = Number.MAX_VALUE;
	        this.items = config.items;
	        this.revision = this.items.map(function (row) {
	            return { i: row.i, x: row.x, y: row.y };
	        });
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

	            var de = nextEnergy - prevEnergy;
	            var acceptanceProbability = de < 0 ? 1 : Math.exp(-de / temperature);

	            if (Math.random() >= acceptanceProbability) {
	                this.items[i] = trans.revert();
	            } else if (nextEnergy < this.minError) {
	                this.minError = nextEnergy;
	                this.revision = this.items.map(function (row) {
	                    return { i: row.i, x: row.x, y: row.y };
	                });
	            }
	        }
	    }, {
	        key: "start",
	        value: function start(nIterations) {
	            // main simulated annealing function
	            var ti = 1.0;
	            var t0 = 1.0;
	            var itemsLength = this.items.length;
	            mining: {
	                for (var i = 0; i < nIterations; i++) {
	                    for (var m = 0; m < itemsLength; m++) {
	                        this.move(ti);
	                        if (this.minError <= 10) {
	                            break mining;
	                        }
	                    }
	                    ti = this.cooling_schedule(ti, t0, nIterations);
	                }
	            }

	            return this.revision;
	        }
	    }]);

	    return AnnealingSimulator;
	}();

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LayerLabelsPenalties = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utilsDraw = __webpack_require__(10);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var intersect = function intersect(x1, x2, x3, x4, y1, y2, y3, y4) {
	    return _utilsDraw.utilsDraw.isIntersect(x1, y1, x2, y2, x3, y3, x4, y4);
	};

	var _penalties = {};

	var LayerLabelsPenalties = exports.LayerLabelsPenalties = function () {
	    function LayerLabelsPenalties() {
	        _classCallCheck(this, LayerLabelsPenalties);
	    }

	    _createClass(LayerLabelsPenalties, null, [{
	        key: 'reg',
	        value: function reg(alias, funcPenalty) {
	            _penalties[alias] = funcPenalty;
	            return this;
	        }
	    }, {
	        key: 'get',
	        value: function get(alias) {
	            return _penalties[alias];
	        }
	    }]);

	    return LayerLabelsPenalties;
	}();

	LayerLabelsPenalties.reg('auto:avoid-label-label-overlap', function (labels, edges) {
	    var penaltyRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.0;

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
	}).reg('auto:avoid-label-anchor-overlap', function (labels, edges) {
	    var penaltyRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.0;

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
	}).reg('auto:avoid-label-edges-overlap', function (labels, edges) {
	    var penaltyRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.0;

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
	});

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Area = undefined;

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _const = __webpack_require__(22);

	var _utils = __webpack_require__(3);

	var _elementPath = __webpack_require__(52);

	var _cssClassMap = __webpack_require__(53);

	var _grammarRegistry = __webpack_require__(7);

	var _d3Decorators = __webpack_require__(9);

	var _interpolatorsRegistry = __webpack_require__(13);

	var _areaPath = __webpack_require__(54);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Area = {

	    draw: _elementPath.BasePath.draw,
	    getClosestElement: _elementPath.BasePath.getClosestElement,
	    highlight: _elementPath.BasePath.highlight,
	    highlightDataPoints: _elementPath.BasePath.highlightDataPoints,
	    addInteraction: _elementPath.BasePath.addInteraction,
	    _getBoundsInfo: _elementPath.BasePath._getBoundsInfo,
	    _sortElements: _elementPath.BasePath._sortElements,

	    init: function init(xConfig) {

	        var config = _elementPath.BasePath.init(xConfig);
	        var enableStack = config.stack;

	        config.transformRules = [config.flip && _grammarRegistry.GrammarRegistry.get('flip'), !enableStack && _grammarRegistry.GrammarRegistry.get('groupOrderByAvg'), enableStack && _elementPath.BasePath.grammarRuleFillGaps, enableStack && _grammarRegistry.GrammarRegistry.get('stack')].concat(config.transformModel || []);

	        config.adjustRules = [function (prevModel, args) {
	            var isEmptySize = prevModel.scaleSize.isEmptyScale();
	            var sizeCfg = _utils.utils.defaults(config.guide.size || {}, {
	                defMinSize: 2,
	                defMaxSize: isEmptySize ? 6 : 40
	            });
	            var params = Object.assign({}, args, {
	                defMin: sizeCfg.defMinSize,
	                defMax: sizeCfg.defMaxSize,
	                minLimit: sizeCfg.minSize,
	                maxLimit: sizeCfg.maxSize
	            });

	            return _grammarRegistry.GrammarRegistry.get('adjustStaticSizeScale')(prevModel, params);
	        }];

	        return config;
	    },
	    buildModel: function buildModel(screenModel) {

	        var baseModel = _elementPath.BasePath.baseModel(screenModel);

	        var guide = this.node().config.guide;
	        var countCss = (0, _cssClassMap.getLineClassesByCount)(screenModel.model.scaleColor.domain().length);
	        var groupPref = _const.CSS_PREFIX + 'area area i-role-path ' + countCss + ' ' + guide.cssClass + ' ';

	        baseModel.groupAttributes = {
	            class: function _class(fiber) {
	                return groupPref + ' ' + baseModel.class(fiber[0]) + ' frame';
	            }
	        };

	        var toDirPoint = function toDirPoint(d) {
	            return {
	                id: screenModel.id(d),
	                x: baseModel.x(d),
	                y: baseModel.y(d)
	            };
	        };

	        var toRevPoint = function toRevPoint(d) {
	            return {
	                id: screenModel.id(d),
	                x: baseModel.x0(d),
	                y: baseModel.y0(d)
	            };
	        };

	        var pathAttributes = {
	            fill: function fill(fiber) {
	                return baseModel.color(fiber[0]);
	            },
	            stroke: function stroke(fiber) {
	                var colorStr = baseModel.color(fiber[0]);
	                if (colorStr.length > 0) {
	                    colorStr = _d2.default.rgb(colorStr).darker(1);
	                }
	                return colorStr;
	            }
	        };

	        baseModel.pathAttributesEnterInit = pathAttributes;
	        baseModel.pathAttributesUpdateDone = pathAttributes;

	        var isPolygon = (0, _interpolatorsRegistry.getInterpolatorSplineType)(guide.interpolate) === 'polyline';
	        baseModel.pathElement = isPolygon ? 'polygon' : 'path';

	        baseModel.pathTween = {
	            attr: isPolygon ? 'points' : 'd',
	            fn: (0, _d3Decorators.d3_createPathTween)(isPolygon ? 'points' : 'd', isPolygon ? _areaPath.getAreaPolygon : _areaPath.getSmoothAreaPath, [toDirPoint, toRevPoint], screenModel.id, guide.interpolate)
	        };

	        return baseModel;
	    }
	};

	exports.Area = Area;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BasePath = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _layerLabels = __webpack_require__(46);

	var _const = __webpack_require__(22);

	var _d3Decorators = __webpack_require__(9);

	var _utils = __webpack_require__(3);

	var _utilsDom = __webpack_require__(1);

	var _utilsDraw = __webpack_require__(10);

	var _d2 = __webpack_require__(2);

	var _d3 = _interopRequireDefault(_d2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var synthetic = 'taucharts_synthetic_record';
	var isNonSyntheticRecord = function isNonSyntheticRecord(row) {
	    return row[synthetic] !== true;
	};

	var BasePath = {

	    grammarRuleFillGaps: function grammarRuleFillGaps(model) {
	        var data = model.data();
	        var groups = _utils.utils.groupBy(data, model.group);
	        var fibers = Object.keys(groups).sort(function (a, b) {
	            return model.order(a) - model.order(b);
	        }).reduce(function (memo, k) {
	            return memo.concat([groups[k]]);
	        }, []);

	        var dx = model.scaleX.dim;
	        var dy = model.scaleY.dim;
	        var dc = model.scaleColor.dim;
	        var ds = model.scaleSplit.dim;
	        var calcSign = function calcSign(row) {
	            return row[dy] >= 0 ? 1 : -1;
	        };

	        var gen = function gen(x, sampleRow, sign) {
	            var _ref;

	            var genId = [x, model.id(sampleRow), sign].join(' ');
	            return _ref = {}, _defineProperty(_ref, dx, x), _defineProperty(_ref, dy, sign * 1e-10), _defineProperty(_ref, ds, sampleRow[ds]), _defineProperty(_ref, dc, sampleRow[dc]), _defineProperty(_ref, synthetic, true), _defineProperty(_ref, synthetic + 'id', genId), _ref;
	        };

	        var merge = function merge(templateSorted, fiberSorted, sign) {
	            var groups = _utils.utils.groupBy(fiberSorted, function (row) {
	                return row[dx];
	            });
	            var sample = fiberSorted[0];
	            return templateSorted.reduce(function (memo, k) {
	                return memo.concat(groups[k] || gen(k, sample, sign));
	            }, []);
	        };

	        var asc = function asc(a, b) {
	            return a - b;
	        };
	        var xs = _utils.utils.unique(fibers.reduce(function (memo, fib) {
	            return memo.concat(fib.map(function (row) {
	                return row[dx];
	            }));
	        }, [])).sort(asc);

	        var nextData = fibers.map(function (fib) {
	            return fib.sort(function (a, b) {
	                return model.xi(a) - model.xi(b);
	            });
	        }).reduce(function (memo, fib) {
	            var bySign = _utils.utils.groupBy(fib, calcSign);
	            return Object.keys(bySign).reduce(function (memo, s) {
	                return memo.concat(merge(xs, bySign[s], s));
	            }, memo);
	        }, []);

	        return {
	            data: function data() {
	                return nextData;
	            },
	            id: function id(row) {
	                return row[synthetic] ? row[synthetic + 'id'] : model.id(row);
	            }
	        };
	    },

	    init: function init(xConfig) {

	        var config = xConfig;

	        config.guide = _utils.utils.defaults(config.guide || {}, {
	            animationSpeed: 0,
	            cssClass: '',
	            maxHighlightDistance: 32,
	            widthCssClass: '',
	            color: {},
	            label: {}
	        });

	        config.guide.label = _utils.utils.defaults(config.guide.label, {
	            fontSize: 11,
	            hideEqualLabels: true,
	            position: ['auto:avoid-label-label-overlap', 'auto:avoid-label-anchor-overlap', 'auto:avoid-label-edges-overlap', 'auto:adjust-on-label-overflow', 'auto:hide-on-label-label-overlap', 'auto:hide-on-label-edges-overlap']
	        });

	        config.guide.color = _utils.utils.defaults(config.guide.color || {}, { fill: null });

	        if (['never', 'hover', 'always'].indexOf(config.guide.showAnchors) < 0) {
	            config.guide.showAnchors = 'hover';
	        }

	        config.transformRules = [];
	        config.adjustRules = [];

	        return config;
	    },
	    baseModel: function baseModel(screenModel) {

	        var datumClass = 'i-role-datum';
	        var pointPref = _const.CSS_PREFIX + 'dot-line dot-line i-role-dot ' + datumClass + ' ' + _const.CSS_PREFIX + 'dot ';
	        var kRound = 10000;
	        var baseModel = {
	            gog: screenModel.model,
	            x: screenModel.x,
	            y: screenModel.y,
	            x0: screenModel.x0,
	            y0: screenModel.y0,
	            size: screenModel.size,
	            group: screenModel.group,
	            order: screenModel.order,
	            color: screenModel.color,
	            class: screenModel.class,
	            groupAttributes: {},
	            pathAttributesUpdateInit: {},
	            pathAttributesUpdateDone: {},
	            pathAttributesEnterInit: {},
	            pathAttributesEnterDone: {},
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
	            },
	            dotAttributesDefault: {
	                r: 0,
	                cy: function cy(d) {
	                    return baseModel.y0(d);
	                }
	            }
	        };

	        return baseModel;
	    },
	    addInteraction: function addInteraction() {
	        var _this = this;

	        var node = this.node();
	        var config = this.node().config;
	        var createFilter = function createFilter(data, falsy) {
	            return function (row) {
	                return row === data ? true : falsy;
	            };
	        };
	        node.on('highlight', function (sender, filter) {
	            return _this.highlight(filter);
	        });
	        node.on('highlight-data-points', function (sender, filter) {
	            return _this.highlightDataPoints(filter);
	        });
	        if (config.guide.showAnchors !== 'never') {
	            node.on('data-hover', function (sender, e) {
	                return _this.highlightDataPoints(createFilter(e.data, null));
	            });
	        }
	    },
	    draw: function draw() {
	        var node = this.node();
	        var config = node.config;
	        var guide = config.guide;
	        var options = config.options;
	        options.container = options.slot(config.uid);

	        var screenModel = node.screenModel;
	        var model = this.buildModel(screenModel);

	        var createUpdateFunc = _d3Decorators.d3_animationInterceptor;

	        var updateGroupContainer = function updateGroupContainer() {

	            this.attr(model.groupAttributes);

	            var points = this.selectAll('circle').data(function (fiber) {
	                return fiber.length <= 1 ? fiber : [];
	            }, screenModel.id);
	            points.exit().call(createUpdateFunc(guide.animationSpeed, null, { r: 0 }, function (node) {
	                return _d3.default.select(node).remove();
	            }));
	            points.call(createUpdateFunc(guide.animationSpeed, null, model.dotAttributes));
	            points.enter().append('circle').call(createUpdateFunc(guide.animationSpeed, model.dotAttributesDefault, model.dotAttributes));

	            node.subscribe(points);

	            var updatePath = function updatePath(selection) {
	                if (config.guide.animationSpeed > 0) {
	                    // HACK: This call fixes stacked area tween (some paths are intersected on
	                    // synthetic points). Maybe caused by async call of `toPoint`.
	                    selection.attr(model.pathTween.attr, function (d) {
	                        return model.pathTween.fn.call(this, d)(0);
	                    });

	                    (0, _d3Decorators.d3_transition)(selection, config.guide.animationSpeed, 'pathTransition').attrTween(model.pathTween.attr, model.pathTween.fn);
	                } else {
	                    selection.attr(model.pathTween.attr, function (d) {
	                        return model.pathTween.fn.call(this, d)(1);
	                    });
	                }
	            };

	            var series = this.selectAll(model.pathElement).data(function (fiber) {
	                return fiber.length > 1 ? [fiber] : [];
	            }, getDataSetId);
	            series.exit().remove();
	            series.call(createUpdateFunc(guide.animationSpeed, model.pathAttributesUpdateInit, model.pathAttributesUpdateDone, model.afterPathUpdate)).call(updatePath);
	            series.enter().append(model.pathElement).call(createUpdateFunc(guide.animationSpeed, model.pathAttributesEnterInit, model.pathAttributesEnterDone, model.afterPathUpdate)).call(updatePath);

	            node.subscribe(series);

	            if (guide.showAnchors !== 'never') {
	                var anchorClass = 'i-data-anchor';
	                var attr = {
	                    r: guide.showAnchors === 'hover' ? 0 : function (d) {
	                        return screenModel.size(d) / 2;
	                    },
	                    cx: function cx(d) {
	                        return model.x(d);
	                    },
	                    cy: function cy(d) {
	                        return model.y(d);
	                    },
	                    opacity: guide.showAnchors === 'hover' ? 0 : 1,
	                    fill: function fill(d) {
	                        return screenModel.color(d);
	                    },
	                    class: anchorClass
	                };

	                var dots = this.selectAll('.' + anchorClass).data(function (fiber) {
	                    return fiber.filter(isNonSyntheticRecord);
	                }, screenModel.id);
	                dots.exit().remove();
	                dots.call(createUpdateFunc(guide.animationSpeed, null, attr));
	                dots.enter().append('circle').call(createUpdateFunc(guide.animationSpeed, { r: 0 }, attr));

	                node.subscribe(dots);
	            }
	        };

	        var fullFibers = screenModel.toFibers();
	        var pureFibers = fullFibers.map(function (arr) {
	            return arr.filter(isNonSyntheticRecord);
	        });

	        var frameSelection = options.container.selectAll('.frame');

	        // NOTE: If any point from new dataset is equal to a point from old dataset,
	        // we assume that path remains the same.
	        // TODO: Id of data array should remain the same (then use `fib => self.screenModel.id(fib)`).
	        var getDataSetId = function () {
	            var current = frameSelection.empty() ? [] : frameSelection.data();
	            var currentIds = new Map();
	            frameSelection.each(function (d) {
	                currentIds.set(d, Number(this.getAttribute('data-id')));
	            });
	            var currentInnerIds = current.reduce(function (map, ds) {
	                map.set(ds, ds.map(screenModel.id));
	                return map;
	            }, new Map());
	            var newIds = new Map();
	            var notFoundCounter = Math.max.apply(Math, [0].concat(_toConsumableArray(Array.from(currentIds.values()))));
	            return function (fib) {
	                if (newIds.has(fib)) {
	                    return newIds.get(fib);
	                }
	                var fibIds = fib.map(function (f) {
	                    return screenModel.id(f);
	                });
	                var matching = (Array.from(currentInnerIds.entries()).find(function (_ref2) {
	                    var _ref3 = _slicedToArray(_ref2, 2),
	                        currIds = _ref3[1];

	                    return fibIds.some(function (newId) {
	                        return currIds.some(function (id) {
	                            return id === newId;
	                        });
	                    });
	                }) || [null])[0];
	                var result;
	                if (matching) {
	                    result = currentIds.get(matching);
	                } else {
	                    ++notFoundCounter;
	                    result = notFoundCounter;
	                }
	                newIds.set(fib, result);
	                return result;
	            };
	        }();
	        this._getDataSetId = getDataSetId;

	        var frameBinding = frameSelection.data(fullFibers, getDataSetId);
	        frameBinding.exit().remove();
	        frameBinding.call(updateGroupContainer);
	        frameBinding.enter().append('g').attr('data-id', getDataSetId).call(updateGroupContainer);

	        frameBinding.order();

	        // TODO: Exclude removed elements from calculation.
	        this._boundsInfo = this._getBoundsInfo(options.container.selectAll('.i-data-anchor')[0]);

	        node.subscribe(new _layerLabels.LayerLabels(screenModel.model, config.flip, config.guide.label, options).draw(pureFibers));
	    },
	    _getBoundsInfo: function _getBoundsInfo(dots) {
	        if (dots.length === 0) {
	            return null;
	        }

	        var screenModel = this.node().screenModel;
	        var flip = this.node().config.flip;


	        var items = dots.map(function (node) {
	            var data = _d3.default.select(node).data()[0];
	            var x = screenModel.x(data);
	            var y = screenModel.y(data);

	            return { node: node, data: data, x: x, y: y };
	        })
	        // TODO: Removed elements should not be passed to this function.
	        .filter(function (item) {
	            return !isNaN(item.x) && !isNaN(item.y);
	        });

	        var bounds = items.reduce(function (bounds, _ref4) {
	            var x = _ref4.x,
	                y = _ref4.y;

	            bounds.left = Math.min(x, bounds.left);
	            bounds.right = Math.max(x, bounds.right);
	            bounds.top = Math.min(y, bounds.top);
	            bounds.bottom = Math.max(y, bounds.bottom);
	            return bounds;
	        }, {
	            left: Number.MAX_VALUE,
	            right: Number.MIN_VALUE,
	            top: Number.MAX_VALUE,
	            bottom: Number.MIN_VALUE
	        });

	        var ticks = _utils.utils.unique(items.map(flip ? function (item) {
	            return item.y;
	        } : function (item) {
	            return item.x;
	        })).sort(function (a, b) {
	            return a - b;
	        });
	        var groups = ticks.reduce(function (obj, value) {
	            return obj[value] = [], obj;
	        }, {});
	        items.forEach(function (item) {
	            var tick = ticks.find(flip ? function (value) {
	                return item.y === value;
	            } : function (value) {
	                return item.x === value;
	            });
	            groups[tick].push(item);
	        });
	        var split = function split(values) {
	            if (values.length === 1) {
	                return groups[values];
	            }
	            var midIndex = Math.ceil(values.length / 2);
	            var middle = (values[midIndex - 1] + values[midIndex]) / 2;
	            return {
	                middle: middle,
	                lower: split(values.slice(0, midIndex)),
	                greater: split(values.slice(midIndex))
	            };
	        };
	        var tree = split(ticks);

	        return { bounds: bounds, tree: tree };
	    },
	    getClosestElement: function getClosestElement(cursorX, cursorY) {
	        if (!this._boundsInfo) {
	            return null;
	        }
	        var _boundsInfo = this._boundsInfo,
	            bounds = _boundsInfo.bounds,
	            tree = _boundsInfo.tree;

	        var container = this.node().config.options.container;
	        var flip = this.node().config.flip;

	        var translate = _utilsDraw.utilsDraw.getDeepTransformTranslate(container.node());
	        var maxHighlightDistance = this.node().config.guide.maxHighlightDistance;

	        if (cursorX < bounds.left + translate.x - maxHighlightDistance || cursorX > bounds.right + translate.x + maxHighlightDistance || cursorY < bounds.top + translate.y - maxHighlightDistance || cursorY > bounds.bottom + translate.y + maxHighlightDistance) {
	            return null;
	        }

	        var cursor = flip ? cursorY - translate.y : cursorX - translate.x;
	        var items = function getClosestElements(el) {
	            if (Array.isArray(el)) {
	                return el;
	            }
	            return getClosestElements(cursor > el.middle ? el.greater : el.lower);
	        }(tree).map(function (el) {
	            var x = el.x + translate.x;
	            var y = el.y + translate.y;
	            var distance = Math.abs(flip ? cursorY - y : cursorX - x);
	            var secondaryDistance = Math.abs(flip ? cursorX - x : cursorY - y);
	            return { node: el.node, data: el.data, distance: distance, secondaryDistance: secondaryDistance, x: x, y: y };
	        }).sort(function (a, b) {
	            return a.distance === b.distance ? a.secondaryDistance - b.secondaryDistance : a.distance - b.distance;
	        });

	        var largerDistIndex = items.findIndex(function (d) {
	            return d.distance !== items[0].distance || d.secondaryDistance !== items[0].secondaryDistance;
	        });
	        var sameDistItems = largerDistIndex < 0 ? items : items.slice(0, largerDistIndex);
	        if (sameDistItems.length === 1) {
	            return sameDistItems[0];
	        }
	        var mx = sameDistItems.reduce(function (sum, item) {
	            return sum + item.x;
	        }, 0) / sameDistItems.length;
	        var my = sameDistItems.reduce(function (sum, item) {
	            return sum + item.y;
	        }, 0) / sameDistItems.length;
	        var angle = Math.atan2(my - cursorY, mx - cursorX) + Math.PI;
	        var closest = sameDistItems[Math.round((sameDistItems.length - 1) * angle / 2 / Math.PI)];
	        return closest;
	    },
	    highlight: function highlight(filter) {
	        var _paths$classed, _classed;

	        var container = this.node().config.options.container;

	        var x = 'graphical-report__highlighted';
	        var _ = 'graphical-report__dimmed';

	        var paths = container.selectAll('.i-role-path');
	        var targetFibers = paths.data().filter(function (fiber) {
	            return fiber.filter(isNonSyntheticRecord).some(filter);
	        });
	        var hasTarget = targetFibers.length > 0;

	        paths.classed((_paths$classed = {}, _defineProperty(_paths$classed, x, function (fiber) {
	            return hasTarget && targetFibers.indexOf(fiber) >= 0;
	        }), _defineProperty(_paths$classed, _, function (fiber) {
	            return hasTarget && targetFibers.indexOf(fiber) < 0;
	        }), _paths$classed));

	        var classed = (_classed = {}, _defineProperty(_classed, x, function (d) {
	            return filter(d) === true;
	        }), _defineProperty(_classed, _, function (d) {
	            return filter(d) === false;
	        }), _classed);

	        container.selectAll('.i-role-dot').classed(classed);

	        container.selectAll('.i-role-label').classed(classed);

	        this._sortElements(filter);
	    },
	    highlightDataPoints: function highlightDataPoints(filter) {
	        var cssClass = 'i-data-anchor';
	        var screenModel = this.node().screenModel;
	        var showOnHover = this.node().config.guide.showAnchors === 'hover';
	        var rmin = 4; // Min highlight radius
	        var rx = 1.25; // Highlight multiplier
	        var unit = this.node();
	        var container = unit.config.options.container;
	        var dots = container.selectAll('.' + cssClass).attr({
	            r: showOnHover ? function (d) {
	                return filter(d) ? Math.max(rmin, screenModel.size(d) / 2) : 0;
	            } : function (d) {
	                // NOTE: Highlight point with larger radius.
	                var r = screenModel.size(d) / 2;
	                if (filter(d)) {
	                    r = Math.max(rmin, Math.ceil(r * rx));
	                }
	                return r;
	            },
	            opacity: showOnHover ? function (d) {
	                return filter(d) ? 1 : 0;
	            } : 1,
	            fill: function fill(d) {
	                return screenModel.color(d);
	            },
	            class: function _class(d) {
	                return _utilsDom.utilsDom.classes(cssClass, screenModel.class(d));
	            }
	        }).classed(_const.CSS_PREFIX + 'highlighted', filter);

	        // Display cursor line
	        var flip = unit.config.flip;
	        var highlighted = dots.filter(filter);
	        var cursorLine = container.select('.cursor-line');
	        if (highlighted.empty()) {
	            cursorLine.remove();
	        } else {
	            if (cursorLine.empty()) {
	                cursorLine = container.append('line');
	            }
	            var model = unit.screenModel.model;
	            var x1 = model.xi(highlighted.data()[0]);
	            var x2 = model.xi(highlighted.data()[0]);
	            var domain = model.scaleY.domain();
	            var y1 = model.scaleY(domain[0]);
	            var y2 = model.scaleY(domain[1]);
	            cursorLine.attr('class', 'cursor-line').attr('x1', flip ? y1 : x1).attr('y1', flip ? x1 : y1).attr('x2', flip ? y2 : x2).attr('y2', flip ? x2 : y2);
	        }

	        this._sortElements(filter);
	    },
	    _sortElements: function _sortElements(filter) {

	        var container = this.node().config.options.container;

	        var pathId = new Map();
	        var pathFilter = new Map();
	        var getDataSetId = this._getDataSetId;
	        container.selectAll('.i-role-path').each(function (d) {
	            pathId.set(this, getDataSetId(d));
	            pathFilter.set(this, d.filter(isNonSyntheticRecord).some(filter));
	        });

	        var compareFilterThenGroupId = _utils.utils.createMultiSorter(function (a, b) {
	            return pathFilter.get(a) - pathFilter.get(b);
	        }, function (a, b) {
	            return pathId.get(a) - pathId.get(b);
	        });
	        var elementsOrder = {
	            line: 0,
	            g: 1,
	            text: 2
	        };
	        _utilsDom.utilsDom.sortChildren(container.node(), function (a, b) {
	            if (a.tagName === 'g' && b.tagName === 'g') {
	                return compareFilterThenGroupId(a, b);
	            }
	            return elementsOrder[a.tagName] - elementsOrder[b.tagName];
	        });
	    }
	};

	exports.BasePath = BasePath;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getLineClassesByCount = exports.getLineClassesByWidth = undefined;

	var _const = __webpack_require__(22);

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
/* 54 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getAreaPolygon = getAreaPolygon;
	exports.getSmoothAreaPath = getSmoothAreaPath;
	function getAreaPolygon(dirPoints, revPoints) {

	    if (dirPoints.length < 2) {
	        return '';
	    }

	    var path = String.prototype.concat.apply('', dirPoints.concat(revPoints.slice().reverse()).map(function (d, i) {
	        return '' + (i === 0 ? '' : ' ') + d.x + ',' + d.y;
	    }));

	    return path;
	}

	function getSmoothAreaPath(dirPoints, revPoints) {

	    if (dirPoints.length < 2) {
	        return '';
	    }

	    var getPath = function getPath(points) {
	        var items = points.map(function (d, i) {
	            var command = (i - 1) % 3 === 0 ? 'C' : '';
	            return '' + command + d.x + ',' + d.y + ' ';
	        });
	        return String.prototype.concat.apply('', items);
	    };

	    var dirPath = getPath(dirPoints);
	    var revPath = getPath(revPoints.slice().reverse());
	    var path = 'M' + dirPath + 'L' + revPath + 'Z';

	    return path;
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Path = undefined;

	var _const = __webpack_require__(22);

	var _grammarRegistry = __webpack_require__(7);

	var _elementPath = __webpack_require__(52);

	var _utils = __webpack_require__(3);

	var _cssClassMap = __webpack_require__(53);

	var _d3Decorators = __webpack_require__(9);

	var Path = {

	    draw: _elementPath.BasePath.draw,
	    getClosestElement: _elementPath.BasePath.getClosestElement,
	    highlight: _elementPath.BasePath.highlight,
	    highlightDataPoints: _elementPath.BasePath.highlightDataPoints,
	    addInteraction: _elementPath.BasePath.addInteraction,
	    _getBoundsInfo: _elementPath.BasePath._getBoundsInfo,
	    _sortElements: _elementPath.BasePath._sortElements,

	    init: function init(xConfig) {

	        var config = _elementPath.BasePath.init(xConfig);

	        config.transformRules = [config.flip && _grammarRegistry.GrammarRegistry.get('flip')].concat(config.transformModel || []);

	        config.adjustRules = [function (prevModel, args) {
	            var isEmptySize = prevModel.scaleSize.isEmptyScale();
	            var sizeCfg = _utils.utils.defaults(config.guide.size || {}, {
	                defMinSize: 2,
	                defMaxSize: isEmptySize ? 6 : 40
	            });
	            var params = Object.assign({}, args, {
	                defMin: sizeCfg.defMinSize,
	                defMax: sizeCfg.defMaxSize,
	                minLimit: sizeCfg.minSize,
	                maxLimit: sizeCfg.maxSize
	            });

	            return _grammarRegistry.GrammarRegistry.get('adjustStaticSizeScale')(prevModel, params);
	        }];

	        return config;
	    },
	    buildModel: function buildModel(screenModel) {

	        var baseModel = _elementPath.BasePath.baseModel(screenModel);
	        var guide = this.node().config.guide;
	        var countCss = (0, _cssClassMap.getLineClassesByCount)(screenModel.model.scaleColor.domain().length);
	        var groupPref = _const.CSS_PREFIX + 'area area i-role-path ' + countCss + ' ' + guide.cssClass + ' ';

	        baseModel.groupAttributes = {
	            class: function _class(fiber) {
	                return groupPref + ' ' + baseModel.class(fiber[0]) + ' frame';
	            }
	        };

	        var toPoint = function toPoint(d) {
	            return {
	                id: screenModel.id(d),
	                x: baseModel.x(d),
	                y: baseModel.y(d)
	            };
	        };

	        var pathPoints = function pathPoints(x, y) {
	            return function (fiber) {
	                return fiber.map(function (d) {
	                    return [x(d), y(d)].join(',');
	                }).join(' ');
	            };
	        };

	        var pathAttributes = {
	            fill: function fill(fiber) {
	                return baseModel.color(fiber[0]);
	            },
	            stroke: function stroke(fiber) {
	                return baseModel.color(fiber[0]);
	            }
	        };

	        baseModel.pathAttributesEnterInit = pathAttributes;
	        baseModel.pathAttributesUpdateDone = pathAttributes;

	        baseModel.pathElement = 'polygon';

	        baseModel.pathTween = {
	            attr: 'points',
	            fn: (0, _d3Decorators.d3_createPathTween)('points', pathPoints(function (d) {
	                return d.x;
	            }, function (d) {
	                return d.y;
	            }), [toPoint], screenModel.id)
	        };

	        return baseModel;
	    }
	};

	exports.Path = Path;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Line = undefined;

	var _const = __webpack_require__(22);

	var _elementPath = __webpack_require__(52);

	var _grammarRegistry = __webpack_require__(7);

	var _cssClassMap = __webpack_require__(53);

	var _utils = __webpack_require__(3);

	var _d3Decorators = __webpack_require__(9);

	var _interpolatorsRegistry = __webpack_require__(13);

	var _brushLine = __webpack_require__(57);

	var _line = __webpack_require__(58);

	var Line = {

	    draw: _elementPath.BasePath.draw,
	    getClosestElement: _elementPath.BasePath.getClosestElement,
	    highlight: _elementPath.BasePath.highlight,
	    highlightDataPoints: _elementPath.BasePath.highlightDataPoints,
	    addInteraction: _elementPath.BasePath.addInteraction,
	    _getBoundsInfo: _elementPath.BasePath._getBoundsInfo,
	    _sortElements: _elementPath.BasePath._sortElements,

	    init: function init(xConfig) {

	        var config = _elementPath.BasePath.init(xConfig);
	        var enableStack = config.stack;

	        config.guide = _utils.utils.defaults(config.guide || {}, {
	            avoidScalesOverflow: true,
	            interpolate: 'linear'
	        });

	        config.transformRules = [config.flip && _grammarRegistry.GrammarRegistry.get('flip'), !enableStack && _grammarRegistry.GrammarRegistry.get('groupOrderByAvg'), enableStack && _elementPath.BasePath.grammarRuleFillGaps, enableStack && _grammarRegistry.GrammarRegistry.get('stack')].concat(config.transformModel || []);

	        var avoidScalesOverflow = config.guide.avoidScalesOverflow;
	        var isEmptySize = function isEmptySize(model) {
	            return model.scaleSize.isEmptyScale();
	        };

	        config.adjustRules = [function (prevModel, args) {
	            var sizeCfg = _utils.utils.defaults(config.guide.size || {}, {
	                defMinSize: 2,
	                defMaxSize: isEmptySize(prevModel) ? 6 : 40
	            });
	            var params = Object.assign({}, args, {
	                defMin: sizeCfg.defMinSize,
	                defMax: sizeCfg.defMaxSize,
	                minLimit: sizeCfg.minSize,
	                maxLimit: sizeCfg.maxSize
	            });

	            return _grammarRegistry.GrammarRegistry.get('adjustStaticSizeScale')(prevModel, params);
	        }, avoidScalesOverflow && function (prevModel, args) {
	            if (isEmptySize(prevModel)) {
	                return function () {
	                    return {};
	                };
	            }
	            var params = Object.assign({}, args, {
	                sizeDirection: 'xy'
	            });
	            return _grammarRegistry.GrammarRegistry.get('avoidScalesOverflow')(prevModel, params);
	        }].filter(function (x) {
	            return x;
	        });
	        return config;
	    },
	    buildModel: function buildModel(screenModel) {

	        var config = this.node().config;
	        var guide = config.guide;
	        var options = config.options;
	        var isEmptySize = !screenModel.model.scaleSize.dim; // TODO: empty method for size scale???;
	        var widthCss = isEmptySize ? guide.widthCssClass || (0, _cssClassMap.getLineClassesByWidth)(options.width) : '';
	        var countCss = (0, _cssClassMap.getLineClassesByCount)(screenModel.model.scaleColor.domain().length);
	        var tag = isEmptySize ? 'line' : 'area';
	        var groupPref = '' + _const.CSS_PREFIX + tag + ' ' + tag + ' i-role-path ' + widthCss + ' ' + countCss + ' ' + guide.cssClass + ' ';

	        var pathAttributes = isEmptySize ? {
	            stroke: function stroke(fiber) {
	                return baseModel.color(fiber[0]);
	            },
	            class: 'i-role-datum'
	        } : {
	            fill: function fill(fiber) {
	                return baseModel.color(fiber[0]);
	            }
	        };

	        var d3LineBuilder = (0, _interpolatorsRegistry.getInterpolatorSplineType)(guide.interpolate) === 'cubic' ? isEmptySize ? _line.getCurve : _brushLine.getBrushCurve : isEmptySize ? _line.getPolyline : _brushLine.getBrushLine;

	        var baseModel = _elementPath.BasePath.baseModel(screenModel);

	        var toPoint = isEmptySize ? function (d) {
	            return {
	                id: screenModel.id(d),
	                x: baseModel.x(d),
	                y: baseModel.y(d)
	            };
	        } : function (d) {
	            return {
	                id: screenModel.id(d),
	                x: baseModel.x(d),
	                y: baseModel.y(d),
	                size: baseModel.size(d)
	            };
	        };

	        baseModel.groupAttributes = {
	            class: function _class(fiber) {
	                return groupPref + ' ' + baseModel.class(fiber[0]) + ' frame';
	            }
	        };

	        baseModel.pathElement = 'path';
	        baseModel.pathAttributesEnterInit = pathAttributes;
	        baseModel.pathAttributesUpdateDone = pathAttributes;
	        baseModel.pathTween = {
	            attr: 'd',
	            fn: (0, _d3Decorators.d3_createPathTween)('d', d3LineBuilder, [toPoint], screenModel.id, guide.interpolate)
	        };

	        return baseModel;
	    }
	};

	exports.Line = Line;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getBrushLine = getBrushLine;
	exports.getBrushCurve = getBrushCurve;

	var _bezier = __webpack_require__(12);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	 * Returns line with variable width.
	 * @param points Linear points.
	 */
	function getBrushLine(points) {
	    if (points.length === 0) {
	        return '';
	    }
	    if (points.length === 1) {
	        return getCirclePath(points[0]);
	    }
	    var segments = [];
	    for (var i = 1; i < points.length; i++) {
	        segments.push(getStraightSegmentPath(points[i - 1], points[i]));
	    }
	    return segments.join(' ');
	}

	/**
	 * Returns curve with variable width.
	 * @param points Cubic spline points.
	 */
	function getBrushCurve(points) {
	    if (points.length === 0) {
	        return '';
	    }
	    if (points.length === 1) {
	        return getCirclePath(points[0]);
	    }
	    var segments = [];
	    for (var i = 3; i < points.length; i += 3) {
	        segments.push(getCurveSegmentPath(points[i - 3], points[i - 2], points[i - 1], points[i]));
	    }
	    return segments.join(' ');
	}

	function getCirclePath(pt) {
	    var r = pt.size / 2;
	    return ['M' + pt.x + ',' + (pt.y - r), 'A' + r + ',' + r + ' 0 0 1', pt.x + ',' + (pt.y + r), 'A' + r + ',' + r + ' 0 0 1', pt.x + ',' + (pt.y - r), 'Z'].join(' ');
	}

	function getStraightSegmentPath(a, b) {
	    var tan = getCirclesTangents(a, b);
	    if (!tan) {
	        return getCirclePath(a.size > b.size ? a : b);
	    }
	    return ['M' + tan.left[0].x + ',' + tan.left[0].y, 'L' + tan.left[1].x + ',' + tan.left[1].y, 'A' + b.size / 2 + ',' + b.size / 2 + ' 0 ' + Number(a.size < b.size) + ' 1', tan.right[1].x + ',' + tan.right[1].y, 'L' + tan.right[0].x + ',' + tan.right[0].y, 'A' + a.size / 2 + ',' + a.size / 2 + ' 0 ' + Number(a.size > b.size) + ' 1', tan.left[0].x + ',' + tan.left[0].y, 'Z'].join(' ');
	}

	function getCurveSegmentPath(a, ca, cb, b) {
	    var ctan = getCirclesCurveTangents(a, ca, cb, b);
	    if (!ctan) {
	        return getStraightSegmentPath(a, b);
	    }
	    var qa = rotation(angle(a, ctan.right[0]), angle(a, ctan.left[0]));
	    var qb = rotation(angle(b, ctan.right[1]), angle(b, ctan.left[1]));
	    return ['M' + ctan.left[0].x + ',' + ctan.left[0].y, 'C' + ctan.left[1].x + ',' + ctan.left[1].y, ctan.left[2].x + ',' + ctan.left[2].y, ctan.left[3].x + ',' + ctan.left[3].y, 'A' + b.size / 2 + ',' + b.size / 2 + ' 0 ' + Number(qa > Math.PI) + ' 1', ctan.right[3].x + ',' + ctan.right[3].y, 'C' + ctan.right[2].x + ',' + ctan.right[2].y, ctan.right[1].x + ',' + ctan.right[1].y, ctan.right[0].x + ',' + ctan.right[0].y, 'A' + a.size / 2 + ',' + a.size / 2 + ' 0 ' + Number(qb > Math.PI) + ' 1', ctan.left[0].x + ',' + ctan.left[0].y, 'Z'].join(' ');
	}

	function angle(a, b) {
	    return Math.atan2(b.y - a.y, b.x - a.x);
	}

	function rotation(a, b) {
	    if (b < a) {
	        b += 2 * Math.PI;
	    }
	    return b - a;
	}

	function dist() {
	    var total = 0;

	    for (var _len = arguments.length, p = Array(_len), _key = 0; _key < _len; _key++) {
	        p[_key] = arguments[_key];
	    }

	    for (var i = 1; i < p.length; i++) {
	        total += Math.sqrt((p[i].x - p[i - 1].x) * (p[i].x - p[i - 1].x) + (p[i].y - p[i - 1].y) * (p[i].y - p[i - 1].y));
	    }
	    return total;
	}

	function polar(start, d, a) {
	    return {
	        x: start.x + d * Math.cos(a),
	        y: start.y + d * Math.sin(a)
	    };
	}

	function splitCurveSegment(t, p0, c0, c1, p1) {
	    var seg = (0, _bezier.splitCubicSegment)(t, p0, c0, c1, p1);
	    var tl = 1 / (1 + dist(seg[3], seg[4], seg[5], seg[6], seg[3]) / dist(seg[0], seg[1], seg[2], seg[3], seg[0]));
	    seg[3].size = p0.size * (1 - tl) + p1.size * tl;

	    return seg;
	}

	function approximateQuadCurve(p0, p1, p2) {
	    var m = (0, _bezier.getBezierPoint)(dist(p0, p1) / dist(p0, p1, p2), p0, p2);
	    var c = (0, _bezier.getBezierPoint)(2, m, p1);
	    return [p0, c, p2];
	}

	function getCirclesTangents(a, b) {
	    var d = dist(a, b);
	    if (d === 0 || d + a.size / 2 <= b.size / 2 || d + b.size / 2 <= a.size / 2) {
	        return null;
	    }

	    var ma = angle(a, b);
	    var ta = Math.asin((a.size - b.size) / d / 2);
	    var aleft = ma - Math.PI / 2 + ta;
	    var aright = ma + Math.PI / 2 - ta;

	    return {
	        left: [polar(a, a.size / 2, aleft), polar(b, b.size / 2, aleft)],
	        right: [polar(a, a.size / 2, aright), polar(b, b.size / 2, aright)]
	    };
	}

	function getCirclesCurveTangents(a, ca, cb, b) {
	    var d = dist(a, b);
	    if (d === 0 || d + a.size / 2 <= b.size / 2 || d + b.size / 2 <= a.size / 2) {
	        return null;
	    }

	    // Get approximate endings tangents
	    // TODO: Use formulas instead of approximate equations.
	    var kt = 1 / 12;
	    var getTangentsVectors = function getTangentsVectors(isEnd) {
	        var curve = isEnd ? [b, cb, ca, a] : [a, ca, cb, b];
	        var seg1 = splitCurveSegment.apply(undefined, [2 * kt].concat(curve));
	        var seg2 = splitCurveSegment.apply(undefined, [0.5].concat(_toConsumableArray(seg1.slice(0, 4))));

	        var m = seg2[3];
	        var n = seg2[6];
	        var mtan = getCirclesTangents(curve[0], m);
	        var ntan = getCirclesTangents(m, n);

	        var lpoints = [mtan.left[0], (0, _bezier.getBezierPoint)(0.5, mtan.left[1], ntan.left[0]), ntan.left[1]];
	        var rpoints = [mtan.right[0], (0, _bezier.getBezierPoint)(0.5, mtan.right[1], ntan.right[0]), ntan.right[1]];

	        var lq = approximateQuadCurve.apply(undefined, lpoints)[1];
	        var rq = approximateQuadCurve.apply(undefined, rpoints)[1];
	        var lc = (0, _bezier.getBezierPoint)(1 / 3 / kt, mtan.left[0], lq);
	        var rc = (0, _bezier.getBezierPoint)(1 / 3 / kt, mtan.right[0], rq);

	        return {
	            left: isEnd ? [rc, rpoints[0]] : [lpoints[0], lc],
	            right: isEnd ? [lc, lpoints[0]] : [rpoints[0], rc]
	        };
	    };

	    var tstart = getTangentsVectors(false);
	    var tend = getTangentsVectors(true);

	    return {
	        left: [].concat(_toConsumableArray(tstart.left), _toConsumableArray(tend.left)),
	        right: [].concat(_toConsumableArray(tstart.right), _toConsumableArray(tend.right))
	    };
	}

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getPolyline = getPolyline;
	exports.getCurve = getCurve;
	function getPolyline(p) {
	    if (p.length < 2) {
	        return '';
	    }
	    var result = '';
	    for (var i = 0; i < p.length; i++) {
	        result += '' + (i === 0 ? 'M' : ' L') + p[i].x + ',' + p[i].y;
	    }
	    return result;
	}

	function getCurve(p) {
	    if (p.length < 4) {
	        return '';
	    }
	    var result = 'M' + p[0].x + ',' + p[0].y;
	    for (var i = 3; i < p.length; i += 3) {
	        result += ' C' + p[i - 2].x + ',' + p[i - 2].y + ' ' + p[i - 1].x + ',' + p[i - 1].y + ' ' + p[i].x + ',' + p[i].y;
	    }
	    return result;
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Interval = undefined;

	var _const = __webpack_require__(22);

	var _grammarRegistry = __webpack_require__(7);

	var _layerLabels = __webpack_require__(46);

	var _d3Decorators = __webpack_require__(9);

	var _utils = __webpack_require__(3);

	var _utilsDom = __webpack_require__(1);

	var _utilsDraw = __webpack_require__(10);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var d3Data = function d3Data(node) {
	    return _d2.default.select(node).data()[0];
	};

	var Interval = {
	    init: function init(xConfig) {

	        var config = Object.assign({}, xConfig);

	        config.guide = config.guide || {};
	        config.guide = _utils.utils.defaults(config.guide, {
	            animationSpeed: 0,
	            avoidScalesOverflow: true,
	            maxHighlightDistance: 32,
	            prettify: true,
	            sortByBarHeight: true,
	            enableColorToBarPosition: !config.stack
	        });

	        config.guide.size = _utils.utils.defaults(config.guide.size || {}, {
	            enableDistributeEvenly: true
	        });

	        config.guide.label = _utils.utils.defaults(config.guide.label || {}, {
	            position: config.flip ? config.stack ? ['r-', 'l+', 'hide-by-label-height-horizontal', 'cut-label-horizontal'] : ['outside-then-inside-horizontal', 'auto:hide-on-label-label-overlap'] : config.stack ? ['rotate-on-size-overflow', 't-', 'b+', 'hide-by-label-height-vertical', 'cut-label-vertical', 'auto:hide-on-label-label-overlap'] : ['rotate-on-size-overflow', 'outside-then-inside-vertical', 'auto:hide-on-label-label-overlap']
	        });

	        var avoidScalesOverflow = config.guide.avoidScalesOverflow;
	        var enableColorPositioning = config.guide.enableColorToBarPosition;
	        var enableDistributeEvenly = config.guide.size.enableDistributeEvenly;

	        config.transformRules = [config.flip && _grammarRegistry.GrammarRegistry.get('flip'), config.stack && _grammarRegistry.GrammarRegistry.get('stack'), enableColorPositioning && _grammarRegistry.GrammarRegistry.get('positioningByColor')].filter(function (x) {
	            return x;
	        }).concat(config.transformModel || []);

	        config.adjustRules = [enableDistributeEvenly && function (prevModel, args) {
	            var sizeCfg = _utils.utils.defaults(config.guide.size || {}, {
	                defMinSize: config.guide.prettify ? 3 : 0,
	                defMaxSize: config.guide.prettify ? 40 : Number.MAX_VALUE
	            });
	            var params = Object.assign({}, args, {
	                defMin: sizeCfg.defMinSize,
	                defMax: sizeCfg.defMaxSize,
	                minLimit: sizeCfg.minSize,
	                maxLimit: sizeCfg.maxSize
	            });

	            return _grammarRegistry.GrammarRegistry.get('size_distribute_evenly')(prevModel, params);
	        }, avoidScalesOverflow && enableDistributeEvenly && function (prevModel, args) {
	            var params = Object.assign({}, args, {
	                sizeDirection: 'x'
	            });
	            return _grammarRegistry.GrammarRegistry.get('avoidScalesOverflow')(prevModel, params);
	        }, config.stack && _grammarRegistry.GrammarRegistry.get('adjustYScale')].filter(function (x) {
	            return x;
	        });

	        return config;
	    },
	    addInteraction: function addInteraction() {
	        var _this = this;

	        var node = this.node();
	        var createFilter = function createFilter(data, falsy) {
	            return function (row) {
	                return row === data ? true : falsy;
	            };
	        };
	        node.on('highlight', function (sender, filter) {
	            return _this.highlight(filter);
	        });
	        node.on('data-hover', function (sender, e) {
	            return _this.highlight(createFilter(e.data, null));
	        });
	    },
	    draw: function draw() {
	        var _createUpdateFunc, _createUpdateFunc2;

	        var node = this.node();
	        var config = node.config;
	        var options = config.options;
	        // TODO: hide it somewhere
	        options.container = options.slot(config.uid);

	        var prettify = config.guide.prettify;
	        var baseCssClass = 'i-role-element i-role-datum bar ' + _const.CSS_PREFIX + 'bar';
	        var screenModel = node.screenModel;
	        var d3Attrs = this.buildModel(screenModel, { prettify: prettify, minBarH: 1, minBarW: 1, baseCssClass: baseCssClass });
	        var createUpdateFunc = _d3Decorators.d3_animationInterceptor;

	        var barX = config.flip ? 'y' : 'x';
	        var barY = config.flip ? 'x' : 'y';
	        var barH = config.flip ? 'width' : 'height';
	        var barW = config.flip ? 'height' : 'width';

	        var fibers = screenModel.toFibers();
	        var data = fibers.reduce(function (arr, f) {
	            return arr.concat(f);
	        }, []);

	        var barClass = d3Attrs.class;
	        var updateAttrs = _utils.utils.omit(d3Attrs, 'class');
	        var bars = options.container.selectAll('.bar').data(data, screenModel.id);
	        bars.exit().classed('tau-removing', true).call(createUpdateFunc(config.guide.animationSpeed, null, (_createUpdateFunc = {}, _defineProperty(_createUpdateFunc, barX, function () {
	            var d3This = _d2.default.select(this);
	            var x = d3This.attr(barX) - 0;
	            var w = d3This.attr(barW) - 0;
	            return x + w / 2;
	        }), _defineProperty(_createUpdateFunc, barY, function () {
	            return this.getAttribute('data-zero');
	        }), _defineProperty(_createUpdateFunc, barW, 0), _defineProperty(_createUpdateFunc, barH, 0), _createUpdateFunc),
	        // ((node) => d3.select(node).remove())
	        function (node) {
	            // NOTE: Sometimes nodes are removed after
	            // they re-appear by filter.
	            var el = _d2.default.select(node);
	            if (el.classed('tau-removing')) {
	                el.remove();
	            }
	        }));
	        bars.call(createUpdateFunc(config.guide.animationSpeed, null, updateAttrs)).attr('class', barClass).attr('data-zero', screenModel[barY + '0']);
	        bars.enter().append('rect').call(createUpdateFunc(config.guide.animationSpeed, (_createUpdateFunc2 = {}, _defineProperty(_createUpdateFunc2, barY, screenModel[barY + '0']), _defineProperty(_createUpdateFunc2, barH, 0), _createUpdateFunc2), updateAttrs)).attr('class', barClass).attr('data-zero', screenModel[barY + '0']);

	        node.subscribe(new _layerLabels.LayerLabels(screenModel.model, screenModel.model.flip, config.guide.label, options).draw(fibers));

	        var sortByWidthThenY = function sortByWidthThenY(a, b) {
	            var dataA = d3Data(a);
	            var dataB = d3Data(b);
	            var widthA = d3Attrs.width(dataA);
	            var widthB = d3Attrs.width(dataB);
	            if (widthA === widthB) {
	                var yA = d3Attrs.y(dataA);
	                var yB = d3Attrs.y(dataB);
	                if (yA === yB) {
	                    return sortByOrder(a, b);
	                }
	                return yA - yB;
	            }
	            return widthB - widthA;
	        };
	        var sortByHeightThenX = function sortByHeightThenX(a, b) {
	            var dataA = d3Data(a);
	            var dataB = d3Data(b);
	            var heightA = d3Attrs.height(dataA);
	            var heightB = d3Attrs.height(dataB);
	            if (heightA === heightB) {
	                var xA = d3Attrs.x(dataA);
	                var xB = d3Attrs.x(dataB);
	                if (xA === xB) {
	                    return sortByOrder(a, b);
	                }
	                return xA - xB;
	            }
	            return heightB - heightA;
	        };
	        var sortByOrder = function () {
	            var order = data.reduce(function (map, d, i) {
	                map.set(d, i + 1);
	                return map;
	            }, new Map());
	            return function (a, b) {
	                var orderA = order.get(d3Data(a)) || -1;
	                var orderB = order.get(d3Data(b)) || -1;
	                return orderA - orderB;
	            };
	        }();

	        this._barsSorter = config.guide.sortByBarHeight ? config.flip ? sortByWidthThenY : sortByHeightThenX : sortByOrder;

	        var elementsOrder = {
	            rect: 0,
	            text: 1
	        };
	        this._typeSorter = function (a, b) {
	            return elementsOrder[a.tagName] - elementsOrder[b.tagName];
	        };

	        this._sortElements(this._typeSorter, this._barsSorter);

	        node.subscribe(bars);

	        this._boundsInfo = this._getBoundsInfo(bars[0]);
	    },
	    buildModel: function buildModel(screenModel, _ref) {
	        var prettify = _ref.prettify,
	            minBarH = _ref.minBarH,
	            minBarW = _ref.minBarW,
	            baseCssClass = _ref.baseCssClass;


	        var barSize = function barSize(d) {
	            var w = screenModel.size(d);
	            if (prettify) {
	                w = Math.max(minBarW, w);
	            }
	            return w;
	        };

	        var model;
	        var value = function value(d) {
	            return d[screenModel.model.scaleY.dim];
	        };
	        if (screenModel.flip) {
	            var barHeight = function barHeight(d) {
	                return Math.abs(screenModel.x(d) - screenModel.x0(d));
	            };
	            model = {
	                y: function y(d) {
	                    return screenModel.y(d) - barSize(d) * 0.5;
	                },
	                x: function x(d) {
	                    var x = Math.min(screenModel.x0(d), screenModel.x(d));
	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        var h = barHeight(d);
	                        var dx = value(d);
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
	                    return barSize(d);
	                },
	                width: function width(d) {
	                    var h = barHeight(d);
	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        return value(d) === 0 ? h : Math.max(minBarH, h);
	                    }
	                    return h;
	                }
	            };
	        } else {
	            var _barHeight = function _barHeight(d) {
	                return Math.abs(screenModel.y(d) - screenModel.y0(d));
	            };
	            model = {
	                x: function x(d) {
	                    return screenModel.x(d) - barSize(d) * 0.5;
	                },
	                y: function y(d) {
	                    var y = Math.min(screenModel.y0(d), screenModel.y(d));
	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        var h = _barHeight(d);
	                        var isTooSmall = h < minBarH;
	                        y = isTooSmall && value(d) > 0 ? y - minBarH : y;
	                    }
	                    return y;
	                },
	                width: function width(d) {
	                    return barSize(d);
	                },
	                height: function height(d) {
	                    var h = _barHeight(d);
	                    if (prettify) {
	                        // decorate for better visual look & feel
	                        h = value(d) === 0 ? h : Math.max(minBarH, h);
	                    }
	                    return h;
	                }
	            };
	        }
	        return Object.assign(model, {
	            class: function _class(d) {
	                return baseCssClass + ' ' + screenModel.class(d);
	            },
	            fill: function fill(d) {
	                return screenModel.color(d);
	            }
	        });
	    },
	    _sortElements: function _sortElements() {
	        var container = this.node().config.options.container.node();
	        _utilsDom.utilsDom.sortChildren(container, _utils.utils.createMultiSorter.apply(_utils.utils, arguments));
	    },
	    _getBoundsInfo: function _getBoundsInfo(bars) {
	        if (bars.length === 0) {
	            return null;
	        }

	        var screenModel = this.node().screenModel;
	        var flip = this.node().config.flip;


	        var items = bars.map(function (node) {
	            var data = _d2.default.select(node).data()[0];
	            var x = screenModel.x(data);
	            var x0 = screenModel.x0(data);
	            var y = screenModel.y(data);
	            var y0 = screenModel.y0(data);
	            var w = Math.abs(x - x0);
	            var h = Math.abs(y - y0);
	            var cx = (x + x0) / 2;
	            var cy = (y + y0) / 2;
	            var invert = y > y0;

	            var box = {
	                top: cy - h / 2,
	                right: cx + w / 2,
	                bottom: cy + h / 2,
	                left: cx - w / 2
	            };

	            return { node: node, data: data, cx: cx, cy: cy, box: box, invert: invert };
	        });

	        var bounds = items.reduce(function (bounds, _ref2) {
	            var box = _ref2.box;

	            bounds.left = Math.min(box.left, bounds.left);
	            bounds.right = Math.max(box.right, bounds.right);
	            bounds.top = Math.min(box.top, bounds.top);
	            bounds.bottom = Math.max(box.bottom, bounds.bottom);
	            return bounds;
	        }, {
	            left: Number.MAX_VALUE,
	            right: Number.MIN_VALUE,
	            top: Number.MAX_VALUE,
	            bottom: Number.MIN_VALUE
	        });

	        var ticks = _utils.utils.unique(items.map(flip ? function (item) {
	            return item.cy;
	        } : function (item) {
	            return item.cx;
	        })).sort(function (a, b) {
	            return a - b;
	        });
	        var groups = ticks.reduce(function (obj, value) {
	            return obj[value] = [], obj;
	        }, {});
	        items.forEach(function (item) {
	            var tick = ticks.find(flip ? function (value) {
	                return item.cy === value;
	            } : function (value) {
	                return item.cx === value;
	            });
	            groups[tick].push(item);
	        });
	        var split = function split(values) {
	            if (values.length === 1) {
	                return groups[values];
	            }
	            var midIndex = Math.ceil(values.length / 2);
	            var middle = (values[midIndex - 1] + values[midIndex]) / 2;
	            return {
	                middle: middle,
	                lower: split(values.slice(0, midIndex)),
	                greater: split(values.slice(midIndex))
	            };
	        };
	        var tree = split(ticks);

	        return { bounds: bounds, tree: tree };
	    },
	    getClosestElement: function getClosestElement(_cursorX, _cursorY) {
	        if (!this._boundsInfo) {
	            return null;
	        }
	        var _boundsInfo = this._boundsInfo,
	            bounds = _boundsInfo.bounds,
	            tree = _boundsInfo.tree;

	        var container = this.node().config.options.container;
	        var flip = this.node().config.flip;

	        var translate = _utilsDraw.utilsDraw.getDeepTransformTranslate(container.node());
	        var cursorX = _cursorX - translate.x;
	        var cursorY = _cursorY - translate.y;
	        var maxHighlightDistance = this.node().config.guide.maxHighlightDistance;

	        if (cursorX < bounds.left - maxHighlightDistance || cursorX > bounds.right + maxHighlightDistance || cursorY < bounds.top - maxHighlightDistance || cursorY > bounds.bottom + maxHighlightDistance) {
	            return null;
	        }

	        var measureCursor = flip ? cursorY : cursorX;
	        var valueCursor = flip ? cursorX : cursorY;
	        var isBetween = function isBetween(value, start, end) {
	            return value >= start && value <= end;
	        };
	        var closestElements = function getClosestElements(el) {
	            if (Array.isArray(el)) {
	                return el;
	            }
	            return getClosestElements(measureCursor > el.middle ? el.greater : el.lower);
	        }(tree).map(function (el) {
	            var elStart = flip ? el.box.left : el.box.top;
	            var elEnd = flip ? el.box.right : el.box.bottom;
	            var cursorInside = isBetween(valueCursor, elStart, elEnd);
	            if (!cursorInside && Math.abs(valueCursor - elStart) > maxHighlightDistance && Math.abs(valueCursor - elEnd) > maxHighlightDistance) {
	                return null;
	            }
	            var distToValue = Math.abs(valueCursor - (el.invert !== flip ? elEnd : elStart));
	            return Object.assign(el, { distToValue: distToValue, cursorInside: cursorInside });
	        }).filter(function (el) {
	            return el;
	        }).sort(function (a, b) {
	            if (a.cursorInside !== b.cursorInside) {
	                return b.cursorInside - a.cursorInside;
	            }
	            return Math.abs(a.distToValue) - Math.abs(b.distToValue);
	        }).map(function (el) {
	            var x = el.cx;
	            var y = el.cy;
	            var distance = Math.abs(flip ? cursorY - y : cursorX - x);
	            var secondaryDistance = Math.abs(flip ? cursorX - x : cursorY - y);
	            return { node: el.node, data: el.data, distance: distance, secondaryDistance: secondaryDistance, x: x, y: y };
	        });

	        return closestElements[0] || null;
	    },
	    highlight: function highlight(filter) {
	        var _classed;

	        var x = 'graphical-report__highlighted';
	        var _ = 'graphical-report__dimmed';

	        var container = this.node().config.options.container;
	        var classed = (_classed = {}, _defineProperty(_classed, x, function (d) {
	            return filter(d) === true;
	        }), _defineProperty(_classed, _, function (d) {
	            return filter(d) === false;
	        }), _classed);

	        container.selectAll('.bar').classed(classed);

	        container.selectAll('.i-role-label').classed(classed);

	        this._sortElements(function (a, b) {
	            return filter(d3Data(a)) - filter(d3Data(b));
	        }, this._typeSorter, this._barsSorter);
	    }
	};

	exports.Interval = Interval;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ParallelLine = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _const = __webpack_require__(22);

	var _element = __webpack_require__(5);

	var _utils = __webpack_require__(3);

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

	        var _this = _possibleConstructorReturn(this, (ParallelLine.__proto__ || Object.getPrototypeOf(ParallelLine)).call(this, config));

	        _this.config = config;
	        _this.config.guide = _utils.utils.defaults(_this.config.guide || {}, {
	            // params here
	        });

	        _this.on('highlight', function (sender, e) {
	            return _this.highlight(e);
	        });
	        return _this;
	    }

	    _createClass(ParallelLine, [{
	        key: 'defineGrammarModel',
	        value: function defineGrammarModel(fnCreateScale) {

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

	            this.regScale('columns', this.scalesMap).regScale('color', this.color);

	            return {};
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
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.IdentityScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var IdentityScale = exports.IdentityScale = function (_BaseScale) {
	    _inherits(IdentityScale, _BaseScale);

	    function IdentityScale(xSource, scaleConfig) {
	        _classCallCheck(this, IdentityScale);

	        var _this = _possibleConstructorReturn(this, (IdentityScale.__proto__ || Object.getPrototypeOf(IdentityScale)).call(this, xSource, scaleConfig));

	        _this._references = scaleConfig.references;
	        _this._refCounter = scaleConfig.refCounter;
	        _this.addField('scaleType', 'identity');
	        return _this;
	    }

	    _createClass(IdentityScale, [{
	        key: 'create',
	        value: function create() {
	            var refs = this._references;
	            var next = this._refCounter;
	            return this.toBaseScale(function (x, row) {
	                if (x == null) {
	                    var i = refs.get(row);
	                    if (i == null) {
	                        i = next();
	                        refs.set(row, i);
	                    }
	                } else {
	                    i = x;
	                }
	                return i;
	            });
	        }
	    }]);

	    return IdentityScale;
	}(_base.BaseScale);

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.BaseScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
	        if (Array.isArray(scaleConfig.fitToFrameByDims) && scaleConfig.fitToFrameByDims.length) {

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
	            vars = _utils.utils.union(_utils.utils.intersection(scaleConfig.order, vars), vars);
	        }

	        this.vars = vars;
	        var originalSeries = vars.map(function (row) {
	            return row;
	        });
	        this.scaleConfig = scaleConfig;

	        // keep for backward compatibility with "autoScale"
	        this.scaleConfig.nice = this.scaleConfig.hasOwnProperty('nice') ? this.scaleConfig.nice : this.scaleConfig.autoScale;

	        this.addField('dim', this.scaleConfig.dim).addField('scaleDim', this.scaleConfig.dim).addField('scaleType', this.scaleConfig.type).addField('source', this.scaleConfig.source).addField('domain', function () {
	            return _this.vars;
	        }).addField('isInteger', originalSeries.every(Number.isInteger)).addField('originalSeries', function () {
	            return originalSeries;
	        }).addField('isContains', function (x) {
	            return _this.isInDomain(x);
	        }).addField('isEmptyScale', function (x) {
	            return _this.isEmpty(x);
	        }).addField('fixup', function (fn) {
	            var cfg = _this.scaleConfig;
	            cfg.__fixup__ = cfg.__fixup__ || {};
	            cfg.__fixup__ = Object.assign(cfg.__fixup__, fn(Object.assign({}, cfg, cfg.__fixup__)));
	        }).addField('commit', function () {
	            _this.scaleConfig = Object.assign(_this.scaleConfig, _this.scaleConfig.__fixup__);
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
	        key: 'isEmpty',
	        value: function isEmpty() {
	            return !Boolean(this._fields.dim);
	        }
	    }, {
	        key: 'toBaseScale',
	        value: function toBaseScale(func) {
	            var _this2 = this;

	            var dynamicProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


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

	            var series = scale.hasOwnProperty('series') ? scale.series : arr.map(function (row) {
	                return row[scale.dim];
	            });

	            return _utils.utils.unique(series, map_value(scale.dimType));
	        }
	    }]);

	    return BaseScale;
	}();

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ColorScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _utils = __webpack_require__(3);

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

	        var _this = _possibleConstructorReturn(this, (ColorScale.__proto__ || Object.getPrototypeOf(ColorScale)).call(this, xSource, scaleConfig));

	        var discrete = scaleConfig.dimType !== 'measure';

	        var scaleBrewer = _this.scaleConfig.brewer || (discrete ? _utils.utils.range(20).map(function (i) {
	            return 'color20-' + (1 + i);
	        }) : ['#eee', '#000']);

	        var props = _this.scaleConfig;

	        if (!discrete) {
	            var vars = _d2.default.extent(_this.vars);

	            var isNum = function isNum(num) {
	                return Number.isFinite(num) || _utils.utils.isDate(num);
	            };
	            var min = isNum(props.min) ? props.min : vars[0];
	            var max = isNum(props.max) ? props.max : vars[1];

	            var mins = [min, vars[0]].filter(isNum);
	            var maxs = [max, vars[1]].filter(isNum);
	            vars = [mins.sort(function (a, b) {
	                return a - b;
	            })[0], maxs.sort(function (a, b) {
	                return b - a;
	            })[0]];

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

	            var defaultColorClass = function defaultColorClass() {
	                return 'color-default';
	            };

	            var buildArrayGetClass = function buildArrayGetClass(domain, brewer) {
	                var fullDomain = domain.map(function (x) {
	                    return String(x).toString();
	                });
	                return _d2.default.scale.ordinal().range(brewer).domain(fullDomain);
	            };

	            var buildObjectGetClass = function buildObjectGetClass(brewer, defaultGetClass) {
	                var domain = Object.keys(brewer);
	                var range = domain.map(function (x) {
	                    return brewer[x];
	                });
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

	            if (Array.isArray(brewer)) {

	                func = wrapString(buildArrayGetClass(varSet, brewer));
	            } else if (typeof brewer === 'function') {

	                func = function func(d) {
	                    return brewer(d, wrapString(buildArrayGetClass(varSet, _utils.utils.range(20).map(function (i) {
	                        return 'color20-' + (1 + i);
	                    }))));
	                };
	            } else if (_utils.utils.isObject(brewer)) {

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

	            if (Array.isArray(brewer)) {

	                func = _d2.default.scale.linear().domain(_utils.utils.splitEvenly(varSet.map(function (x) {
	                    return x - 0;
	                }), brewer.length)).range(brewer);
	            } else {

	                throw new Error('This brewer is not supported');
	            }

	            return func;
	        }
	    }]);

	    return ColorScale;
	}(_base.BaseScale);

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SizeScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _utils = __webpack_require__(3);

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

	        var _this = _possibleConstructorReturn(this, (SizeScale.__proto__ || Object.getPrototypeOf(SizeScale)).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _d2.default.extent(_this.vars);

	        var min = Number.isFinite(props.min) ? props.min : vars[0];
	        var max = Number.isFinite(props.max) ? props.max : vars[1];

	        _this.vars = [Math.min.apply(Math, _toConsumableArray([min, vars[0]].filter(Number.isFinite))), Math.max.apply(Math, _toConsumableArray([max, vars[1]].filter(Number.isFinite)))];

	        _this.addField('scaleType', 'size');
	        _this.addField('funcType', scaleConfig.func || 'sqrt');
	        return _this;
	    }

	    _createClass(SizeScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(x) {
	            var domain = this.domain().sort();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !Number.isNaN(min) && !Number.isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create() {

	            var props = this.scaleConfig;
	            var varSet = this.vars;

	            var p = _utils.utils.defaults({}, props, { func: 'sqrt', minSize: 0, maxSize: 1 });

	            var funType = p.func;
	            var minSize = p.minSize;
	            var maxSize = p.maxSize;

	            var f = funcTypes[funType];

	            var values = varSet.filter(function (x) {
	                return Number.isFinite(Number(x));
	            });

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

	                    if (!Number.isFinite(numX)) {
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
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.OrdinalScale = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

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

	        var _this = _possibleConstructorReturn(this, (OrdinalScale.__proto__ || Object.getPrototypeOf(OrdinalScale)).call(this, xSource, scaleConfig));

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
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.PeriodScale = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _unitDomainPeriodGenerator = __webpack_require__(18);

	var _utils = __webpack_require__(3);

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

	        var _this = _possibleConstructorReturn(this, (PeriodScale.__proto__ || Object.getPrototypeOf(PeriodScale)).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _this.vars;

	        var domain = _d2.default.extent(vars);
	        var min = props.min === null || props.min === undefined ? domain[0] : new Date(props.min).getTime();
	        var max = props.max === null || props.max === undefined ? domain[1] : new Date(props.max).getTime();

	        var range = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

	        var periodGenerator = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.get(props.period, { utc: props.utcTime });
	        if (props.fitToFrameByDims || periodGenerator === null) {
	            _this.vars = _utils.utils.unique(vars.map(function (x) {
	                return new Date(x);
	            }), function (x) {
	                return x.getTime();
	            }).sort(function (date1, date2) {
	                return date2 - date1;
	            });
	        } else {
	            _this.vars = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.generate(range[0], range[1], props.period, { utc: props.utcTime });
	        }

	        _this.addField('scaleType', 'period').addField('period', _this.scaleConfig.period).addField('discrete', true);
	        return _this;
	    }

	    _createClass(PeriodScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(aTime) {
	            var gen = _unitDomainPeriodGenerator.UnitDomainPeriodGenerator.get(this.scaleConfig.period, { utc: this.scaleConfig.utcTime });
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
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.TimeScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _utils = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TimeScale = exports.TimeScale = function (_BaseScale) {
	    _inherits(TimeScale, _BaseScale);

	    function TimeScale(xSource, scaleConfig) {
	        _classCallCheck(this, TimeScale);

	        var _this = _possibleConstructorReturn(this, (TimeScale.__proto__ || Object.getPrototypeOf(TimeScale)).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _this.vars;

	        var domain = _d2.default.extent(vars).map(function (v) {
	            return new Date(v);
	        });

	        var min = props.min === null || props.min === undefined ? domain[0] : new Date(props.min).getTime();
	        var max = props.max === null || props.max === undefined ? domain[1] : new Date(props.max).getTime();

	        vars = [new Date(Math.min(min, domain[0])), new Date(Math.max(max, domain[1]))];

	        _this.niceIntervalFn = null;
	        if (props.nice) {
	            var niceInterval = props.niceInterval;
	            var d3TimeInterval = niceInterval && _d2.default.time[niceInterval] ? props.utcTime ? _d2.default.time[niceInterval].utc : _d2.default.time[niceInterval] : null;
	            if (d3TimeInterval) {
	                _this.niceIntervalFn = d3TimeInterval;
	            } else {
	                // TODO: show warning?
	                _this.niceIntervalFn = null;
	            }

	            _this.vars = _utils.utils.niceTimeDomain(vars, _this.niceIntervalFn, { utc: props.utcTime });
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
	            return !Number.isNaN(min) && !Number.isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create(interval) {

	            var varSet = this.vars;
	            var utcTime = this.scaleConfig.utcTime;

	            var d3TimeScale = utcTime ? _d2.default.time.scale.utc : _d2.default.time.scale;
	            var d3Domain = d3TimeScale().domain(this.scaleConfig.nice ? _utils.utils.niceTimeDomain(varSet, this.niceIntervalFn, { utc: utcTime }) : varSet);

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
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LinearScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _utils = __webpack_require__(3);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LinearScale = exports.LinearScale = function (_BaseScale) {
	    _inherits(LinearScale, _BaseScale);

	    function LinearScale(xSource, scaleConfig) {
	        _classCallCheck(this, LinearScale);

	        var _this = _possibleConstructorReturn(this, (LinearScale.__proto__ || Object.getPrototypeOf(LinearScale)).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _d2.default.extent(_this.vars);

	        var min = Number.isFinite(props.min) ? props.min : vars[0];
	        var max = Number.isFinite(props.max) ? props.max : vars[1];

	        vars = [Math.min.apply(Math, _toConsumableArray([min, vars[0]].filter(Number.isFinite))), Math.max.apply(Math, _toConsumableArray([max, vars[1]].filter(Number.isFinite)))];

	        _this.vars = props.nice ? _utils.utils.niceZeroBased(vars) : _d2.default.extent(vars);
	        if (_this.vars[0] === _this.vars[1]) {
	            var e = Math.pow(10, Math.floor(Math.log(_this.vars[0]) / Math.LN10));
	            _this.vars[0] -= e;
	            _this.vars[1] += e || 10;
	        }

	        _this.addField('scaleType', 'linear').addField('discrete', false);
	        return _this;
	    }

	    _createClass(LinearScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(x) {
	            var domain = this.domain();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !Number.isNaN(min) && !Number.isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create(interval) {

	            var domain = this.vars;

	            var scale = this.extendScale(_d2.default.scale.linear());
	            scale.domain(domain).range(interval).clamp(true);

	            return this.toBaseScale(scale, interval);
	        }
	    }, {
	        key: 'extendScale',
	        value: function extendScale(scale) {
	            var _this2 = this;

	            // have to copy properties since d3 produce Function with methods
	            var d3ScaleCopy = scale.copy;
	            var d3ScaleTicks = scale.ticks;
	            Object.assign(scale, {

	                stepSize: function stepSize() {
	                    return 0;
	                },

	                copy: function copy() {
	                    return _this2.extendScale(d3ScaleCopy.call(scale));
	                },

	                ticks: this.getField('isInteger') ? function (n) {
	                    return d3ScaleTicks.call(scale, n).filter(Number.isInteger);
	                } : scale.ticks
	            });

	            return scale;
	        }
	    }]);

	    return LinearScale;
	}(_base.BaseScale);

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.LogarithmicScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _error = __webpack_require__(8);

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LogarithmicScale = exports.LogarithmicScale = function (_BaseScale) {
	    _inherits(LogarithmicScale, _BaseScale);

	    function LogarithmicScale(xSource, scaleConfig) {
	        _classCallCheck(this, LogarithmicScale);

	        var _this = _possibleConstructorReturn(this, (LogarithmicScale.__proto__ || Object.getPrototypeOf(LogarithmicScale)).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var domain = _d2.default.extent(_this.vars);

	        var min = Number.isFinite(props.min) ? props.min : domain[0];
	        var max = Number.isFinite(props.max) ? props.max : domain[1];

	        domain = [Math.min.apply(Math, _toConsumableArray([min, domain[0]].filter(Number.isFinite))), Math.max.apply(Math, _toConsumableArray([max, domain[1]].filter(Number.isFinite)))];
	        throwIfCrossesZero(domain);

	        if (props.nice) {
	            domain = niceLog10(domain);
	        }

	        _this.vars = domain;

	        _this.addField('scaleType', 'logarithmic').addField('discrete', false);
	        return _this;
	    }

	    _createClass(LogarithmicScale, [{
	        key: 'isInDomain',
	        value: function isInDomain(x) {
	            var domain = this.domain();
	            var min = domain[0];
	            var max = domain[domain.length - 1];
	            return !Number.isNaN(min) && !Number.isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create(interval) {

	            var domain = this.vars;
	            throwIfCrossesZero(domain);

	            var d3Scale = extendLogScale(_d2.default.scale.log()).domain(domain).range(interval);
	            d3Scale.stepSize = function () {
	                return 0;
	            };

	            return this.toBaseScale(d3Scale, interval);
	        }
	    }]);

	    return LogarithmicScale;
	}(_base.BaseScale);

	function log10(x) {
	    return Math.log(x) / Math.LN10;
	}

	function throwIfCrossesZero(domain) {
	    if (domain[0] * domain[1] <= 0) {
	        throw new _error.TauChartError('Logarithmic scale domain cannot cross zero.', _error.errorCodes.INVALID_LOG_DOMAIN);
	    }
	}

	function extendLogScale(scale) {
	    var d3ScaleCopy = scale.copy;

	    // NOTE: D3 log scale ticks count is not configurable
	    // and returns 10 ticks per each exponent.
	    // So here we make it return 10 ticks per each
	    // step of 1, 2 or more exponents, according to
	    // necessary ticks count.
	    scale.ticks = function (n) {

	        var ticksPerExp = 10;
	        var ticks = [];
	        var extent = _d2.default.extent(scale.domain());
	        var lowExp = Math.floor(log10(extent[0]));
	        var topExp = Math.ceil(log10(extent[1]));

	        var step = Math.ceil((topExp - lowExp) * ticksPerExp / (Math.ceil(n / ticksPerExp) * ticksPerExp));

	        for (var e = lowExp; e <= topExp; e += step) {
	            for (var t = 1; t <= ticksPerExp; t++) {
	                var tick = Math.pow(t, step) * Math.pow(10, e);
	                tick = parseFloat(tick.toExponential(0));
	                if (tick >= extent[0] && tick <= extent[1]) {
	                    ticks.push(tick);
	                }
	            }
	        }

	        return ticks;
	    };
	    scale.copy = function () {
	        var copy = d3ScaleCopy.call(scale);
	        extendLogScale(copy);
	        return copy;
	    };

	    return scale;
	}

	function niceLog10(domain) {

	    var isPositive = domain[0] > 0;
	    var absDomain = domain.map(function (d) {
	        return Math.abs(d);
	    });
	    var top = Math.max.apply(Math, _toConsumableArray(absDomain));
	    var low = Math.min.apply(Math, _toConsumableArray(absDomain));

	    var lowExp = low.toExponential().split('e');
	    var topExp = top.toExponential().split('e');
	    var niceLow = parseFloat(Math.floor(lowExp[0]) + 'e' + lowExp[1]);
	    var niceTop = parseFloat(Math.ceil(topExp[0]) + 'e' + topExp[1]);

	    return isPositive ? [niceLow, niceTop] : [-niceTop, -niceLow];
	}

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ValueScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ValueScale = exports.ValueScale = function (_BaseScale) {
	    _inherits(ValueScale, _BaseScale);

	    function ValueScale(xSource, scaleConfig) {
	        _classCallCheck(this, ValueScale);

	        var _this = _possibleConstructorReturn(this, (ValueScale.__proto__ || Object.getPrototypeOf(ValueScale)).call(this, xSource, scaleConfig));

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
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.FillScale = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(62);

	var _utils = __webpack_require__(3);

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

	        var _this = _possibleConstructorReturn(this, (FillScale.__proto__ || Object.getPrototypeOf(FillScale)).call(this, xSource, scaleConfig));

	        var props = _this.scaleConfig;
	        var vars = _d2.default.extent(_this.vars);

	        var min = Number.isFinite(props.min) ? props.min : vars[0];
	        var max = Number.isFinite(props.max) ? props.max : vars[1];

	        vars = [Math.min(min, vars[0]), Math.max(max, vars[1])];

	        _this.vars = props.nice ? _utils.utils.niceZeroBased(vars) : _d2.default.extent(vars);

	        var opacityStep = (1 - 0.2) / 9;
	        var defBrewer = _utils.utils.range(10).map(function (i) {
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
	            return !Number.isNaN(min) && !Number.isNaN(max) && x <= max && x >= min;
	        }
	    }, {
	        key: 'create',
	        value: function create() {

	            var varSet = this.vars;

	            var brewer = this.getField('brewer');

	            if (!Array.isArray(brewer)) {
	                throw new Error('This brewer is not supported');
	            }

	            var size = brewer.length;
	            var step = (varSet[1] - varSet[0]) / size;
	            var domain = _utils.utils.range(size - 1).map(function (i) {
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
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartMap = undefined;

	var _utils = __webpack_require__(3);

	var ChartMap = function ChartMap(config) {
	    var guide = Object.assign({ sourcemap: config.settings.defaultSourceMap }, config.guide || {});

	    guide.size = _utils.utils.defaults(guide.size || {}, { min: 1, max: 10 });
	    guide.code = _utils.utils.defaults(guide.code || {}, { georole: 'countries' });

	    var scales = {};

	    var scalesPool = function scalesPool(type, prop) {
	        var guide = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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
	            scales[key] = Object.assign({ type: type, source: src, dim: dim }, guide);
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
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartInterval = undefined;

	var _converterHelpers = __webpack_require__(74);

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
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.transformConfig = exports.normalizeConfig = undefined;

	var _strategyNormalizeAxi;

	var _utils = __webpack_require__(3);

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var convertAxis = function convertAxis(data) {
	    return !data ? null : data;
	};

	var normalizeSettings = function normalizeSettings(axis) {
	    var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	    return !Array.isArray(axis) ? [axis] : axis.length === 0 ? [defaultValue] : axis;
	};

	var createElement = function createElement(type, config) {
	    return {
	        type: type,
	        x: config.x,
	        y: config.y,
	        identity: config.identity,
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
	    var newAxis = axis.filter(function (x) {
	        return x !== measure;
	    });
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
	    var gapsSize = maxDeep - guide.length;

	    // feel the gaps if needed
	    for (var i = 0; i < gapsSize; i++) {
	        guide.push({});
	    }

	    // cut items
	    guide = guide.slice(0, maxDeep);

	    var validatedX = validateAxis(config.dimensions, x, 'x');
	    var validatedY = validateAxis(config.dimensions, y, 'y');
	    x = strategyNormalizeAxis[validatedX.status](x, validatedX, guide);
	    y = strategyNormalizeAxis[validatedY.status](y, validatedY, guide);

	    return Object.assign({}, config, {
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
	                identity: config.identity,
	                split: config.split,
	                color: config.color,
	                label: config.label,
	                size: config.size,
	                flip: config.flip,
	                stack: config.stack,
	                colorGuide: currentGuide.color,
	                sizeGuide: currentGuide.size
	            }));
	            spec.guide = _utils.utils.defaults(currentGuide, {
	                x: { label: currentX },
	                y: { label: currentY }
	            });
	        } else {
	            spec = {
	                type: 'COORDS.RECT',
	                x: convertAxis(currentX),
	                y: convertAxis(currentY),
	                unit: [spec],
	                guide: _utils.utils.defaults(currentGuide, {
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
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartScatterplot = undefined;

	var _converterHelpers = __webpack_require__(74);

	var ChartScatterplot = function ChartScatterplot(rawConfig) {
	    var config = (0, _converterHelpers.normalizeConfig)(rawConfig);
	    return (0, _converterHelpers.transformConfig)('ELEMENT.POINT', config);
	};

	exports.ChartScatterplot = ChartScatterplot;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartLine = undefined;

	var _dataProcessor = __webpack_require__(28);

	var _converterHelpers = __webpack_require__(74);

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
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ChartArea = undefined;

	var _dataProcessor = __webpack_require__(28);

	var _converterHelpers = __webpack_require__(74);

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
/* 78 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var ChartParallel = function ChartParallel(config) {

	    var guide = Object.assign({ columns: {} }, config.guide || {});

	    var scales = {};

	    var scalesPool = function scalesPool(type, prop) {
	        var guide = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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
	            scales[key] = Object.assign({ type: type, source: src, dim: dim }, guide);
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
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.PluginsSDK = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _formatterRegistry = __webpack_require__(32);

	var _unit = __webpack_require__(80);

	var _spec = __webpack_require__(81);

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
	                memoRef[scale.dim].label.push(typeof label === 'string' ? label : guideLabel._original_text || guideLabel.text);

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

	                if (config.hasOwnProperty('label') && !isEmptyScale(config.label)) {
	                    fillSlot(memo, config, 'label');
	                }

	                return memo;
	            }, {});

	            var choiceRule = function choiceRule(arr, defaultValue) {
	                return arr.filter(function (x) {
	                    return x;
	                })[0] || defaultValue;
	            };

	            return Object.keys(summary).reduce(function (memo, k) {
	                memo[k].label = choiceRule(memo[k].label, k);
	                memo[k].format = choiceRule(memo[k].format, null);
	                memo[k].nullAlias = choiceRule(memo[k].nullAlias, 'No ' + memo[k].label);
	                memo[k].tickLabel = choiceRule(memo[k].tickLabel, null);

	                // very special case for dates
	                var format = memo[k].format === 'x-time-auto' ? spec.settings.utcTime ? 'day-utc' : 'day' : memo[k].format;
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
	    }, {
	        key: 'getParentUnit',
	        value: function getParentUnit(spec, unit) {

	            var parent = null;

	            var traverse = function traverse(node, parentNode) {

	                if (node.uid === unit.uid) {
	                    parent = parentNode;
	                    return true;
	                }

	                if (node.frames) {
	                    node.frames.some(function (frame) {
	                        return (frame.units || []).some(function (x) {
	                            return traverse(x, node);
	                        });
	                    });
	                } else {
	                    (node.units || []).some(function (x) {
	                        return traverse(x, node);
	                    });
	                }

	                return false;
	            };

	            traverse(spec.unit, null);

	            return parent;
	        }
	    }]);

	    return PluginsSDK;
	}();

	exports.PluginsSDK = PluginsSDK;

/***/ },
/* 80 */
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
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Spec = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _unit = __webpack_require__(80);

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

/***/ },
/* 82 */
/***/ function(module, exports) {

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
	        value: function value(_value) {
	            return typeof _value === 'number' && isFinite(_value);
	        },
	        configurable: true,
	        enumerable: false,
	        writable: true
	    });
	}

	if (!Number.isNaN) {
	    Object.defineProperty(Number, 'isNaN', {
	        value: function value(_value2) {
	            return typeof _value2 === 'number' && isNaN(_value2);
	        },
	        configurable: true,
	        enumerable: false,
	        writable: true
	    });
	}

	if (!Number.isInteger) {
	    Object.defineProperty(Number, 'isInteger', {
	        value: function value(_value3) {
	            return typeof _value3 === 'number' && isFinite(_value3) && Math.floor(_value3) === _value3;
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
	        value: function value(predicate) {
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
	        value: function value(predicate) {
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
	        value: function () {
	            var toStr = Object.prototype.toString;
	            var isCallable = function isCallable(fn) {
	                return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
	            };
	            var toInteger = function toInteger(value) {
	                var number = Number(value);
	                if (isNaN(number)) {
	                    return 0;
	                }
	                if (number === 0 || !isFinite(number)) {
	                    return number;
	                }
	                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
	            };
	            var maxSafeInteger = Math.pow(2, 53) - 1;
	            var toLength = function toLength(value) {
	                var len = toInteger(value);
	                return Math.min(Math.max(len, 0), maxSafeInteger);
	            };

	            return function from(arrayLike /*, mapFn, thisArg */) {
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
	        }(),
	        configurable: true,
	        enumerable: false,
	        writable: true
	    });

	    // Assume `Array.from` is only missing in IE11, same for Map methods.
	    var ieMapSet = Map.prototype.set;
	    Object.defineProperty(Map.prototype, 'set', {
	        value: function value() {
	            ieMapSet.apply(this, arguments);
	            return this;
	        },
	        configurable: true,
	        enumerable: false,
	        writable: true
	    });
	    Object.defineProperty(Map.prototype, 'values', {
	        value: function value() {
	            var obj = {};
	            var i = 0;
	            this.forEach(function (v) {
	                return obj[String(i++)] = v;
	            });
	            obj.length = i;
	            return obj;
	        },
	        configurable: true,
	        enumerable: false,
	        writable: true
	    });
	    Object.defineProperty(Map.prototype, 'entries', {
	        value: function value() {
	            var obj = {};
	            var i = 0;
	            this.forEach(function (v, k) {
	                return obj[String(i++)] = [k, v];
	            });
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
	        value: function value(target) {
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

/***/ }
/******/ ])
});
;