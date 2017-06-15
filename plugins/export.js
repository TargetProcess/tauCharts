import tauCharts from 'taucharts';
import 'canvg';
import {saveAs} from 'file-saver';
import 'fetch';
import printCss from './print.style.css';
import * as d3 from 'd3';

    var utils = tauCharts.api.utils;
    var pluginsSDK = tauCharts.api.pluginsSDK;
    var tokens = pluginsSDK.tokens();

    var trimChar = function (str, char) {
        // return str.replace(/^\s+|\s+$/g, '');
        return str.replace(new RegExp('^' + char + '+|' + char + '+$', 'g'), '');
    };

    var doEven = function (n) {
        n = Math.round(n);
        return n % 2 ? n + 1 : n;
    };

    var isEmpty = function (x) {
        return (x === null) || (x === '') || (typeof x === 'undefined');
    };

    function log10(x) {
        return Math.log(x) / Math.LN10;
    }

    var keyCode = {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
    };

    var createStyleElement = function (styles, mediaType) {
        mediaType = mediaType || 'all';
        var style = document.createElement('style');
        style.setAttribute('media', mediaType);
        style.innerHTML = styles;
        return style;
    };

    var printStyles = createStyleElement(printCss, 'print');
    var imagePlaceHolder;
    var removePrintStyles = function () {
        if (printStyles && printStyles.parentNode) {
            printStyles.parentNode.removeChild(printStyles);
        }
        if (imagePlaceHolder && imagePlaceHolder.parentNode) {
            imagePlaceHolder.parentNode.removeChild(imagePlaceHolder);
        }
    };

    var isPhantomJS = /PhantomJS/.test(navigator.userAgent);

    if (!isPhantomJS) {
        if ('onafterprint' in window) {
            window.addEventListener('afterprint', removePrintStyles);
        } else {
            window.matchMedia('screen').addListener(function (exp) {
                if (exp.matches) {
                    removePrintStyles();
                }
            });
        }
    }

    // http://jsfiddle.net/kimiliini/HM4rW/show/light/
    var downloadExportFile = function (fileName, type, strContent) {
        var utf8BOM = '%ef%bb%bf';
        var content = 'data:' + type + ';charset=UTF-8,' + utf8BOM + encodeURIComponent(strContent);

        var link = document.createElement('a');
        link.setAttribute('href', content);
        link.setAttribute('download', fileName);
        link.setAttribute('target', '_new');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link = null;
    };

    var fixSVGForCanvgCompatibility = function (svg) {
        []
            .slice
            .call(svg.querySelectorAll('text.label'))
            .forEach(function (textNode) {
                textNode.innerHTML = []
                    .slice
                    .call(textNode.querySelectorAll('tspan'))
                    .reduce(function (memo, node) {
                        var partText = (node.value || node.text || node.textContent || '');
                        partText = partText.charAt(0).toUpperCase() + partText.substr(1);
                        return (memo + partText);
                    }, '');
            });

        return svg;
    };

    var getGuideLabel = function (guide, key, defaultLabel) {

        defaultLabel = (defaultLabel == null ? '' : String(defaultLabel));
        var kGuide = ((guide || {})[key] || {});
        var kLabel = (utils.isObject(kGuide.label)) ? kGuide.label.text : kGuide.label;

        return kLabel || defaultLabel;
    };

    function exportTo(settings) {
        return {

            onRender: function () {
                this._info = pluginsSDK.extractFieldsFormatInfo(this._chart.getSpec());
            },

            _normalizeExportFields: function (fields, excludeFields) {
                var info = this._info;

                return (fields
                    .map(function (token) {

                        var r = token;
                        var fieldInfo = info[token] || {};

                        if (typeof token === 'string') {
                            r = {
                                field: token,
                                title: (fieldInfo.label || token)
                            };
                        }

                        if (typeof r.value !== 'function') {
                            r.value = function (row) {
                                var fieldValue = row[this.field];
                                return (fieldInfo.isComplexField ?
                                    ((fieldValue || {})[fieldInfo.tickLabel]) :
                                    (fieldValue));
                            };
                        }

                        return r;
                    })
                    .filter(function (item) {
                        return !excludeFields.find(function (exFieldName) {
                            return item.field === exFieldName;
                        });
                    }));
            },

            _createDataUrl: function (chart) {
                var cssPromises = this._cssPaths.map(function (css) {
                    return fetch(css).then(function (r) {
                        return r.text();
                    });
                });
                return Promise
                    .all(cssPromises)
                    .then(function (res) {
                        return res.join(' ').replace(/&/g, '');
                    })
                    .then(function (res) {
                        var style = createStyleElement(res);
                        var div = document.createElement('div');
                        chart.fire('beforeExportSVGNode');
                        var svg = chart.getSVG().cloneNode(true);
                        chart.fire('afterExportSVGNode');
                        div.appendChild(fixSVGForCanvgCompatibility(svg));
                        d3.select(svg)
                            .attr('version', 1.1)
                            .attr('xmlns', 'http://www.w3.org/2000/svg');
                        svg.insertBefore(style, svg.firstChild);
                        this._renderAdditionalInfo(svg, chart);
                        this._addBackground(svg, this._backgroundColor);
                        var canvas = document.createElement('canvas');
                        canvas.height = svg.getAttribute('height');
                        canvas.width = svg.getAttribute('width');
                        return new Promise(function(resolve) {
                            canvg(
                                canvas,
                                svg.parentNode.innerHTML,
                                {
                                    renderCallback: function (dom) {
                                        var domStr = (new XMLSerializer()).serializeToString(dom);
                                        var isError = (domStr.substring(0, 5).toLowerCase() === '<html');
                                        if (isError) {
                                            tauCharts.api.globalSettings.log('[export plugin]: canvg error', 'error');
                                            tauCharts.api.globalSettings.log(domStr, 'error');
                                        }
                                        resolve(canvas.toDataURL('image/png'));
                                    }
                                });
                        });
                    }.bind(this));
            },

            _findUnit: function (chart) {
                var conf = chart.getSpec();
                var spec = chart.getSpec();
                var checkNotEmpty = function (dimName) {
                    var sizeScaleCfg = spec.scales[dimName];
                    return (
                    sizeScaleCfg &&
                    sizeScaleCfg.dim &&
                    sizeScaleCfg.source &&
                    spec.sources[sizeScaleCfg.source].dims[sizeScaleCfg.dim]
                    );
                };
                return pluginsSDK.depthFirstSearch(conf.unit, function (node) {

                    if (checkNotEmpty(node.color)) {
                        return true;
                    }

                    if (checkNotEmpty(node.size)) {
                        var sizeScaleCfg = spec.scales[node.size];
                        return spec.sources[sizeScaleCfg.source].dims[sizeScaleCfg.dim].type === 'measure';
                    }
                });
            },

            _toPng: function (chart) {
                this._createDataUrl(chart)
                    .then(function (dataURL) {
                        var data = atob(dataURL.substring('data:image/png;base64,'.length)),
                            asArray = new Uint8Array(data.length);

                        for (var i = 0, len = data.length; i < len; ++i) {
                            asArray[i] = data.charCodeAt(i);
                        }

                        var blob = new Blob([asArray.buffer], {type: 'image/png'});
                        saveAs(blob, (this._fileName || 'export') + '.png');
                    }.bind(this));
            },

            _toPrint: function (chart) {
                this._createDataUrl(chart)
                    .then(function (dataURL) {
                        imagePlaceHolder = document.createElement('img');
                        imagePlaceHolder.classList.add('graphical-report__print-block');
                        var img = imagePlaceHolder;
                        document.body.appendChild(img);
                        img.src = dataURL;
                        document.head.appendChild(printStyles);
                        img.onload = function () {
                            window.print();
                        };
                    });
            },

            _toJson: function (chart) {
                var exportFields = this._exportFields;

                var xSourceData = chart.getData();
                var xSourceDims = chart.getDataDims();

                var srcDims = exportFields.length ? exportFields : Object.keys(xSourceDims);
                var fields = this._normalizeExportFields(srcDims.concat(this._appendFields), this._excludeFields);

                var srcData = xSourceData.map(function (row) {
                    return fields.reduce(function (memo, f) {
                        memo[f.title] = f.value(row);
                        return memo;
                    }, {});
                });

                var jsonString = JSON.stringify(srcData, null, 2);
                var fileName = (this._fileName || 'export') + '.json';
                downloadExportFile(fileName, 'application/json', jsonString);
            },

            _toCsv: function (chart) {
                var separator = this._csvSeparator;
                var exportFields = this._exportFields;

                var xSourceData = chart.getData();
                var xSourceDims = chart.getDataDims();

                var srcDims = exportFields.length ? exportFields : Object.keys(xSourceDims);
                var fields = this._normalizeExportFields(srcDims.concat(this._appendFields), this._excludeFields);

                var csv = xSourceData
                    .reduce(function (csvRows, row) {
                        return csvRows.concat(
                            fields.reduce(function (csvRow, f) {
                                    var origVal = f.value(row);
                                    var origStr = JSON.stringify(origVal);

                                    if (!utils.isDate(origVal) && utils.isObject(origVal)) {
                                        // complex objects if any
                                        origStr = ('"' + origStr.replace(/"/g, '""') + '"');
                                    } else {
                                        // everything else
                                        var trimStr = trimChar(origStr, '"').replace(/"/g, '""');
                                        var needEncoding = Boolean(['"', ',', ';', '\n', '\r']
                                            .find(function (sym) {
                                                return (trimStr.indexOf(sym) >= 0);
                                            }));
                                        origStr = (needEncoding ? ('"' + trimStr + '"') : trimStr);
                                    }

                                    return csvRow.concat(origStr);
                                },
                                [])
                                .join(separator)
                        );
                    },
                    [
                        fields.map(function (f) {
                            return f.title;
                        }).join(separator)
                    ])
                    .join('\r\n');

                var fileName = (this._fileName || 'export') + '.csv';

                downloadExportFile(fileName, 'text/csv', csv);
            },

            _renderFillLegend: function (configUnit, svg, chart, width) {

                var splitEvenly = function (domain, parts) {
                    var min = domain[0];
                    var max = domain[1];
                    var segment = ((max - min) / (parts - 1));
                    var chunks = utils.range(parts - 2).map((function (n) {
                        return (min + segment * (n + 1));
                    }));
                    return [min].concat(chunks).concat(max);
                };

                var fillScale = this._unit.getScale('color');
                var title = getGuideLabel(configUnit.guide, 'color', fillScale.dim).toUpperCase();
                var titleStyle = 'text-transform:uppercase;font-weight:600;font-size:' + settings.fontSize + 'px';

                var domain = fillScale.domain().sort(function (a, b) {
                    return a - b;
                });
                var brewerLength = fillScale.brewer.length;
                var labelsLength = 3;
                var height = 120;
                var fontHeight = settings.fontSize;
                var titlePadding = 20;

                var stops = splitEvenly(domain, brewerLength)
                    .reverse()
                    .map(function (x, i) {
                        var p = (i / (brewerLength - 1)) * 100;
                        return (
                        '<stop offset="' + p + '%"' +
                        '      style="stop-color:' + fillScale(x) + ';stop-opacity:1" />');
                    });

                var labels = splitEvenly(domain, labelsLength)
                    .reverse()
                    .map(function (x, i, list) {
                        var p = (i / (labelsLength - 1));
                        var vPad = 0.5 * ((i === 0) ?
                                fontHeight :
                                ((i === list.length - 1) ? (-fontHeight) : 0));
                        var y = ((height - titlePadding) * p) + vPad + fontHeight / 2;
                        return '<text x="25" y="' + y + '">' + x + '</text>';
                    });

                var gradient = [
                    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" height="' + height + '" width="100%">',
                    '   <defs>',
                    '       <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">',
                    stops.join(''),
                    '       </linearGradient>',
                    '   </defs>',
                    '   <text x="0" y="10" style="' + titleStyle + '">' + title + '</text>',
                    '   <g transform="translate(0,20)">',
                    '       <rect x="0" y="0" height="' + (height - titlePadding) + '" width="20" fill="url(#grad1)">',
                    '       </rect>',
                    labels.join(''),
                    '   </g>',
                    '   Sorry, your browser does not support inline SVG.',
                    '</svg>'
                ].join('');

                // insert to live document before attaching to export SVG (IE9 issue)
                var doc = (new DOMParser().parseFromString(gradient, 'application/xml')).documentElement;
                document.body.appendChild(doc);

                svg
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', 'translate(' + (width + 10) + ',' + settings.paddingTop + ')')
                    .node()
                    .appendChild(doc);

                return {h: height, w: 0};
            },

            _renderColorLegend: function (configUnit, svg, chart, width) {

                var colorScale = this._unit.getScale('color');
                var colorScaleName = getGuideLabel(configUnit.guide, 'color', colorScale.dim).toUpperCase();

                var data = this
                    ._getColorMap(chart.getChartModelData({excludeFilter: ['legend']}), colorScale, colorScale.dim)
                    .values;

                var draw = function (self) {

                    self.attr('transform', function (d, index) {
                        return 'translate(5,' + 20 * (index + 1) + ')';
                    });

                    self.append('circle')
                        .attr('r', 6)
                        .attr('fill', function (d) {
                            return colorScale.toColor(d.color);
                        })
                        .attr('class', function (d) {
                            return colorScale.toClass(d.color);
                        });

                    self.append('text')
                        .attr('x', 12)
                        .attr('y', 5)
                        .text(function (d) {
                            return utils.escape(isEmpty(d.label) ? ('No ' + colorScaleName) : d.label);
                        })
                        .style({'font-size': settings.fontSize + 'px'});
                };

                var container = svg
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', 'translate(' + (width + 10) + ',' + settings.paddingTop + ')');

                container
                    .append('text')
                    .text(colorScaleName.toUpperCase())
                    .style({
                        'text-transform': 'uppercase',
                        'font-weight': '600',
                        'font-size': settings.fontSize + 'px'
                    });

                container
                    .selectAll('g')
                    .data(data)
                    .enter()
                    .append('g')
                    .call(draw);

                return {h: (data.length * 20), w: 0};
            },

            _renderSizeLegend: function (configUnit, svg, chart, width, offset) {

                var sizeScale = this._unit.getScale('size');
                var sizeScaleName = getGuideLabel(configUnit.guide, 'size', sizeScale.dim).toUpperCase();

                var chartData = chart.getChartModelData().sort(function (x1, x2) {
                    return sizeScale(x1[sizeScale.dim]) - sizeScale(x2[sizeScale.dim]);
                });

                var chartDataLength = chartData.length;
                var first = chartData[0][sizeScale.dim];
                var last = chartData[chartDataLength - 1][sizeScale.dim];
                var values;
                if ((last - first)) {
                    var count = log10(last - first);
                    var xF = (4 - count) < 0 ? 0 : Math.round((4 - count));
                    var base = Math.pow(10, xF);
                    var step = (last - first) / 5;
                    values = utils.unique([first, first + step, first + step * 2, first + step * 3, last]
                        .map(function (x) {
                            return (x === last || x === first) ? x : Math.round(x * base) / base;
                        }));
                } else {
                    values = [first];
                }

                var data = values
                    .map(function (value) {
                        var diameter = sizeScale(value);
                        var radius = diameter / 2;
                        return {
                            diameter: doEven(diameter + 2),
                            radius: radius,
                            value: value,
                            className: configUnit.color ? 'color-definite' : ''
                        };
                    }.bind(this))
                    .reverse();

                var maxDiameter = Math.max.apply(null, data.map(function (x) {
                    return x.diameter;
                }));
                var fontSize = settings.fontSize;

                var offsetInner = 0;
                var draw = function (self) {

                    self.attr('transform', function () {
                        offsetInner += maxDiameter;
                        var transform = 'translate(5,' + (offsetInner) + ')';
                        offsetInner += 10;
                        return transform;
                    });

                    self.append('circle')
                        .attr('r', function (d) {
                            return d.radius;
                        })
                        .attr('class', function (d) {
                            return d.className;
                        })
                        .style({opacity: 0.4});

                    self.append('g')
                        .attr('transform', function () {
                            return 'translate(' + maxDiameter + ',' + (fontSize / 2) + ')';
                        })
                        .append('text')
                        .attr('x', 0).attr('y', 0)
                        .text(function (d) {
                            return d.value;
                        })
                        .style({'font-size': fontSize + 'px'});
                };

                var container = svg
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', 'translate(' + (width + 10) + ',' + (settings.paddingTop + offset.h + 20) + ')');

                container
                    .append('text')
                    .text(sizeScaleName.toUpperCase())
                    .style({
                        'text-transform': 'uppercase',
                        'font-weight': '600',
                        'font-size': fontSize + 'px'
                    });

                container
                    .selectAll('g')
                    .data(data)
                    .enter()
                    .append('g')
                    .call(draw);
            },

            _renderAdditionalInfo: function (svg, chart) {
                var configUnit = this._findUnit(chart);
                if (!configUnit) {
                    return;
                }

                var offset = {h: 0, w: 0};
                svg = d3.select(svg);
                var width = parseInt(svg.attr('width'), 10);
                var height = svg.attr('height');
                svg.attr('width', width + 160);

                var colorScale = chart.getScaleInfo(configUnit.color);
                if (colorScale.dim && !colorScale.discrete) {
                    // draw gradient
                    var offsetFillLegend = this._renderFillLegend(configUnit, svg, chart, width);
                    offset.h = offsetFillLegend.h + 20;
                    offset.w = offsetFillLegend.w;
                }

                if (colorScale.dim && colorScale.discrete) {
                    var offsetColorLegend = this._renderColorLegend(configUnit, svg, chart, width);
                    offset.h = offsetColorLegend.h + 20;
                    offset.w = offsetColorLegend.w;
                }

                var sizeScale = chart.getScaleInfo(configUnit.size);
                if (sizeScale.dim && !sizeScale.discrete) {
                    this._renderSizeLegend(configUnit, svg, chart, width, offset);
                }
            },

            _addBackground: function (svg, color) {
                if (!color || color === 'transparent') {
                    return;
                }
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('fill', color);
                rect.setAttribute('x', 0);
                rect.setAttribute('y', 0);
                rect.setAttribute('width', svg.getAttribute('width'));
                rect.setAttribute('height', svg.getAttribute('height'));
                svg.insertBefore(rect, svg.firstChild);
            },

            onUnitDraw: function (chart, unit) {
                if (tauCharts.api.isChartElement(unit) && unit.config.namespace === 'chart') {
                    this._unit = unit;
                }
            },

            _getColorMap: function (data, colorScale, colorDimension) {

                return utils.unique(data
                    .map(function (item) {
                        var value = item[colorDimension];
                        return {color: colorScale(value), value: value, label: value};
                    }), function (legendItem) {
                        return legendItem.value;
                    })
                    .reduce(function (memo, item) {
                        memo.brewer[item.value] = item.color;
                        memo.values.push(item);
                        return memo;
                    },
                    {brewer: {}, values: []});
            },

            _select: function (value, chart) {
                value = value || '';
                var method = this['_to' + value.charAt(0).toUpperCase() + value.slice(1)];
                if (method) {
                    method.call(this, chart);
                }
            },

            _handleMenu: function (popupElement, chart, popup) {
                popupElement.addEventListener('click', function (e) {
                    if (e.target.tagName.toLowerCase() === 'a') {
                        var value = e.target.getAttribute('data-value');
                        this._select(value, chart);
                        popup.hide();
                    }
                }.bind(this));
                popupElement.addEventListener('mouseover', function (e) {
                    if (e.target.tagName.toLowerCase() === 'a') {
                        e.target.focus();
                    }
                }.bind(this));

                popupElement.addEventListener('keydown', function (e) {
                    if (e.keyCode === keyCode.ESCAPE) {
                        popup.hide();
                    }
                    if (e.keyCode === keyCode.DOWN) {
                        if (e.target.parentNode.nextSibling) {
                            e.target.parentNode.nextSibling.childNodes[0].focus();
                        } else {
                            e.target.parentNode.parentNode.firstChild.childNodes[0].focus();
                        }
                    }
                    if (e.keyCode === keyCode.UP) {
                        if (e.target.parentNode.previousSibling) {
                            e.target.parentNode.previousSibling.childNodes[0].focus();
                        } else {
                            e.target.parentNode.parentNode.lastChild.childNodes[0].focus();
                        }
                    }
                    if (e.keyCode === keyCode.ENTER) {
                        var value = e.target.getAttribute('data-value');
                        this._select(value, chart);
                    }
                    e.preventDefault();
                }.bind(this));
                var timeoutID = null;

                var onBlur = function () {
                    timeoutID = setTimeout(function () {
                        popup.hide();
                    }, 100);
                };
                var onFocus = function () {
                    clearTimeout(timeoutID);
                };
                var onClick = function () {
                    popup.toggle();
                    if (!popup.hidden) {
                        popupElement.querySelectorAll('a')[0].focus();
                    }
                };
                popupElement.addEventListener('blur', onBlur, true);
                popupElement.addEventListener('focus', onFocus, true);
                this._container.addEventListener('click', onClick);
                this._onDestroy(function () {
                    popupElement.removeEventListener('blur', onBlur, true);
                    popupElement.removeEventListener('focus', onFocus, true);
                    this._container.removeEventListener('click', onClick);
                    clearTimeout(timeoutID);
                });
            },

            init: function (chart) {
                settings = settings || {};
                settings = utils.defaults(settings, {
                    backgroundColor: 'white',
                    visible: true,
                    fontSize: 13,
                    paddingTop: 30
                });

                this._chart = chart;
                this._info = {};
                this._cssPaths = settings.cssPaths;
                this._fileName = settings.fileName;
                this._backgroundColor = settings.backgroundColor || 'white';
                this._destroyListeners = [];

                this._csvSeparator = settings.csvSeparator || ',';
                this._exportFields = settings.exportFields || [];
                this._appendFields = settings.appendFields || [];
                this._excludeFields = settings.excludeFields || [];

                if (!this._cssPaths) {
                    this._cssPaths = [];
                    tauCharts.api.globalSettings.log(
                        '[export plugin]: the "cssPath" parameter should be specified for correct operation',
                        'warn'
                    );
                }

                var menuStyle = settings.visible ? '' : 'display:none';
                this._container = chart
                    .insertToHeader('<a class="graphical-report__export" style="' + menuStyle + '">Export</a>');
                var popup = chart.addBalloon({
                    place: 'bottom-left'
                });
                // jscs:disable maximumLineLength
                popup.content([
                    '<ul class="graphical-report__export__list">',
                    '<li class="graphical-report__export__item">',
                    '   <a data-value="print" tabindex="1">' + tokens.get('Print') + '</a>',
                    '</li>',
                    '<li class="graphical-report__export__item">',
                    '   <a data-value="png" tabindex="2">' + tokens.get('Export to png') + '</a>',
                    '</li>',
                    '<li class="graphical-report__export__item">',
                    '   <a data-value="csv" tabindex="3">' + tokens.get('Export to CSV') + '</a>',
                    '</li>',
                    '<li class="graphical-report__export__item">',
                    '   <a data-value="json" tabindex="4">' + tokens.get('Export to JSON') + '</a>',
                    '</li>',
                    '</ul>'
                ].join(''));
                // jscs:enable maximumLineLength
                popup.attach(this._container);
                var popupElement = popup.getElement();
                popupElement.setAttribute('tabindex', '-1');
                this._handleMenu(popupElement, chart, popup);
                chart.on('exportTo', function (chart, type) {
                    this._select(type, chart);
                }.bind(this));
                this._onDestroy(function () {
                    popup.destroy();
                });
            },

            _onDestroy: function (listener) {
                this._destroyListeners.push(listener);
            },

            destroy: function () {
                this._destroyListeners.forEach(function (listener) {
                    listener.call(this);
                }, this);
            }
        };
    }

    tauCharts.api.plugins.add('exportTo', exportTo);

export default exportTo;
