(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts', 'canvg', 'FileSaver', 'promise', 'print.style.css', 'fetch'], function (tauPlugins, canvg, saveAs, Promise, printCss) {
            window.Promise = window.Promise || Promise.Promise;
            return factory(tauPlugins, canvg, saveAs, window.Promise, printCss);
        });
    } else {
        factory(this.tauCharts, this.canvg, this.saveAs);
    }
})(function (tauCharts, canvg, saveAs, Promise, printCss) {
    var d3 = tauCharts.api.d3;
    var _ = tauCharts.api._;
    var dfs = function (node, predicate) {
        if (predicate(node)) {
            return node;
        }
        var i, children = node.unit || [], child, found;
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            found = dfs(child, predicate);
            if (found) {
                return found;
            }
        }
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
        "BACKSPACE": 8,
        "COMMA": 188,
        "DELETE": 46,
        "DOWN": 40,
        "END": 35,
        "ENTER": 13,
        "ESCAPE": 27,
        "HOME": 36,
        "LEFT": 37,
        "PAGE_DOWN": 34,
        "PAGE_UP": 33,
        "PERIOD": 190,
        "RIGHT": 39,
        "SPACE": 32,
        "TAB": 9,
        "UP": 38
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
        }
        else {
            window.matchMedia('screen').addListener(function (exp) {
                if (exp.matches) {
                    removePrintStyles();
                }
            });
        }
    }

    var focusinDetected;
    var isSupportFocusin = function isSupportFocusin() {
        if (focusinDetected) {
            return focusinDetected;
        }
        var hasIt = false;

        function swap() {
            hasIt = true;
        }

        var a = document.createElement('a');
        a.href = "#";
        a.addEventListener('focusin', swap, false);

        document.body.appendChild(a);
        a.focus();
        document.body.removeChild(a);
        focusinDetected = hasIt;
        return hasIt;
    };

    function exportTo(settings) {
        return {
            _createDataUrl: function (chart) {
                var cssPromises = this._cssPaths.map(function (css) {
                    return fetch(css).then(function (r) {
                        return r.text();
                    });
                });
                return Promise
                    .all(cssPromises)
                    .then(function (res) {
                        return res.join(' ');
                    })
                    .then(function (res) {
                        var style = createStyleElement(res);
                        var div = document.createElement('div');
                        var svg = chart.getSVG().cloneNode(true);
                        div.appendChild(svg);
                        d3.select(svg).attr("version", 1.1)
                            .attr("xmlns", "http://www.w3.org/2000/svg");
                        svg.insertBefore(style, svg.firstChild);
                        this._renderAdditionalInfo(svg, chart);
                        var canvas = document.createElement('canvas');
                        canvas.height = svg.getAttribute('height');
                        canvas.width = svg.getAttribute('width');
                        canvg(canvas, svg.parentNode.innerHTML);
                        return canvas.toDataURL("image/png");
                    }.bind(this));
            },
            _findUnit: function (chart) {
                var conf = chart.getConfig();
                return dfs(conf.spec.unit, function (node) {
                    return node.color || node.size && conf.dimensions[node.size].type === 'measure';
                });
            },
            _toPng: function (chart) {
                this._createDataUrl(chart)
                    .then(function (dataURL) {
                        var data = atob(dataURL.substring("data:image/png;base64,".length)),
                            asArray = new Uint8Array(data.length);

                        for (var i = 0, len = data.length; i < len; ++i) {
                            asArray[i] = data.charCodeAt(i);
                        }

                        var blob = new Blob([asArray.buffer], {type: "image/png"});
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
            _renderColorLegend: function (configUnit, svg, chart, width) {
                configUnit.guide = configUnit.guide || {};
                configUnit.guide.color = this._unit.guide.color;
                var colorScaleName = configUnit.guide.color.label.text || this._unit.options.color.dimension;
                var data = this._getColorMap(chart);
                var draw = function () {
                    this.attr('transform', function (d, index) {
                        return 'translate(5,' + 20 * (index + 1) + ')';
                    });
                    this.append('circle')
                        .attr('r', 6)
                        .attr('class', function (d) {
                            return d.color;
                        });
                    this.append('text')
                        .attr('x', 12)
                        .attr('y', 5)
                        .text(function (d) {
                            return d.value;
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

                return {h: (data.length * 20 + 20), w: 0};
            },
            //'<svg class="graphical-report__legend__guide-size  <%=className%>" style="width: <%=diameter%>px;height: <%=diameter%>px;"><circle cx="<%=radius%>" cy="<%=radius%>" class="graphical-report__dot" r="<%=radius%>"></circle><text style="stroke:none;opacity:1;fill:#000000;font-weight: 400;" x="<%=radius+20%>" y="<%=radius+5%>"><%=value%><text></svg>',
            _renderSizeLegend: function (configUnit, svg, chart, width, offset) {
                var sizeScale = this._unit.options.sizeScale;
                var sizeDimension = this._unit.size.scaleDim;
                configUnit.guide = configUnit.guide || {};
                configUnit.guide.size = this._unit.guide.size;
                var sizeScaleName = configUnit.guide.size.label.text || sizeDimension;
                var chartData = _.sortBy(chart.getData(), function (el) {
                    return sizeScale(el[sizeDimension]);
                });
                var chartDataLength = chartData.length;
                var first = chartData[0][sizeDimension];
                var last = chartData[chartDataLength - 1][sizeDimension];
                var values;
                if ((last - first)) {
                    var count = log10(last - first);
                    var xF = (4 - count) < 0 ? 0 : Math.round((4 - count));
                    var base = Math.pow(10, xF);
                    var step = (last - first) / 5;
                    values = _([first, first + step, first + step * 2, first + step * 3, last])
                        .chain()
                        .map(function (x) {
                            return (x === last || x === first) ? x : Math.round(x * base) / base;
                        })
                        .unique()
                        .value();
                } else {
                    values = [first];
                }

                var data = values
                    .map(function (value) {
                        var radius = sizeScale(value);
                        return {
                            diameter: doEven(radius * 2 + 2),
                            radius: radius,
                            value: value,
                            className: configUnit.color ? 'color-definite' : ''
                        };
                    }.bind(this))
                    .reverse();

                var maxDiameter = Math.max.apply(null, _.pluck(data, 'diameter'));
                var fontSize = settings.fontSize;

                var offsetInner = 0;
                var draw = function () {

                    this.attr('transform', function (d) {
                        offsetInner += maxDiameter;
                        var transform = 'translate(5,' + (offsetInner)+ ')';
                        offsetInner += 10;
                        return transform;
                    });

                    this.append('circle')
                        .attr('r', function (d) {
                            return d.radius;
                        })
                        .attr('class', function (d) {
                            return d.className;
                        })
                        .style({'opacity': 0.4});

                    this.append('g')
                        .attr('transform', function(d) {
                            return 'translate(' + maxDiameter + ',' + (fontSize / 2) + ')';
                        })
                        .append('text')
                        .attr('x', function(d) {
                            return 0;// d.diameter;
                        })
                        .attr('y', function(d) {
                            return 0;// d.radius-6.5;
                        })
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
                if (configUnit.color) {
                    var offsetColorLegend = this._renderColorLegend(configUnit, svg, chart, width);
                    offset.h = offsetColorLegend.h;
                    offset.w = offsetColorLegend.w;
                }
                if (configUnit.size && chart.getConfig().spec.dimensions[configUnit.size].type === 'measure') {
                    this._renderSizeLegend(configUnit, svg, chart, width, offset);
                }
                // document.body.appendChild(svg.node());
            },
            onUnitReady: function (chart, unit) {
                if (unit.type.indexOf('ELEMENT') !== -1) {
                    this._unit = unit;
                }
            },
            _getColorMap: function (chart) {
                var colorScale = this._unit.options.color;
                var colorDimension = this._unit.color.scaleDim;
                var data = chart.getData();
                return _(data)
                    .chain()
                    .map(function (item) {
                        return colorScale.legend(item[colorDimension]);
                    })
                    .uniq(function (legendItem) {
                        return legendItem.value;
                    })
                    .value()
                    .reduce(function (memo, item) {
                        memo.push(item);
                        return memo;
                    },
                    []);
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
                var iSF = isSupportFocusin();
                var focusin = iSF ? 'focusin' : 'focus';
                var focusout = iSF ? 'focusout' : 'blur';
                popupElement.addEventListener(focusout, function () {
                    timeoutID = setTimeout(function () {
                        popup.hide();
                    }, 100);

                }, !iSF);
                popupElement.addEventListener(focusin, function () {
                    clearTimeout(timeoutID);
                }, !iSF);
                this._container.addEventListener('click', function () {
                    popup.toggle();
                    if (!popup.hidden) {
                        popupElement.querySelectorAll('a')[0].focus();
                    }
                });
            },
            init: function (chart) {
                settings = settings || {};
                this._cssPaths = settings.cssPaths;
                this._fileName = settings.fileName;
                if (!this._cssPaths) {
                    this._cssPaths = [];
                    tauCharts.api.globalSettings.log('You should specified cssPath for correct work export plugin', 'warn');
                }

                settings = _.defaults(settings, {
                    fontSize: 13,
                    paddingTop: 30
                });

                this._container = chart.insertToHeader('<a class="graphical-report__export">Export</a>>');
                var popup = chart.addBalloon({
                    place: 'bottom-left'
                });
                this._popup = popup;
                popup.content([
                    '<ul class="graphical-report__export__list">',
                    '<li class="graphical-report__export__item"><a href="#" data-value="print" tabindex="1">Print</a></li>',
                    '<li class="graphical-report__export__item"><a href="#" data-value="png" tabindex="2">Export to png</a></li>',
                    '</ul>'
                ].join(''));
                popup.attach(this._container);
                var popupElement = popup.getElement();
                popupElement.setAttribute('tabindex', '-1');
                this._handleMenu(popupElement, chart, popup);
                chart.on('exportTo', function (chart, type) {
                    this._select(type, chart);
                }.bind(this));
            },
            destroy: function () {
                if(this._popup) {
                    this._popup.destroy();
                }
            }
        };
    }

    tauCharts.api.plugins.add('exportTo', exportTo);

    return exportTo;
});
