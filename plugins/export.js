(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts', 'canvg', 'FileSaver', 'promise', 'text!./print.style.css', 'fetch'], function (tauPlugins, canvg, saveAs, Promise, printCss) {
            window.Promise = window.Promise || Promise.Promise;
            return factory(tauPlugins, canvg, saveAs, window.Promise, printCss);
        });
    } else {
        factory(this.tauCharts, this.canvg, this.saveAs);
    }
})(function (tauCharts, canvg, saveAs, Promise, printCss) {
    var d3 = tauCharts.api.d3;
    var _ = tauCharts.api._;
    var dfs = function (node) {
        if (node.color) {
            return node;
        }
        var i, children = node.unit || [], child, found;
        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            found = dfs(child);
            if (found) {
                return found;
            }
        }
    };
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
    var imagePlaceHolder = document.createElement('img');
    imagePlaceHolder.classList.add('graphical-report__print-block');
    var removePrintStyles = function () {
        if (printStyles.parentNode) {
            printStyles.parentNode.removeChild(printStyles);
        }
        if (imagePlaceHolder.parentNode) {
            imagePlaceHolder.parentNode.removeChild(imagePlaceHolder);
        }
    };
    if ('onafterprint' in window) {
        window.addEventListener('afterprint', removePrintStyles);
    } else {
        window.matchMedia('screen').addListener(removePrintStyles);
    }
    var focusinDetected;
    var isSupportFocusin = function () {
        if (focusinDetected) {
            return focusinDetected;
        }
        var hasIt = false;

        function swap() {
            hasIt = true; // when fired, set hasIt to true
        }

        var a = document.createElement('a'); // create test element
        a.href = "#"; // to make it focusable
        a.addEventListener('focusin', swap, false); // bind focusin

        document.body.appendChild(a); // append
        a.focus(); // focus
        document.body.removeChild(a); // remove again
        isSupportFocusin = hasIt;
        return hasIt; // should be true if focusin is fired
    };

    function exportTo(settings) {
        return {
            _loadSvgWithCss: function (chart) {
                var cssPromises = this.cssPaths.map(function (css) {
                    return fetch(css).then(function (r) {
                        return r.text();
                    });
                });
                return Promise
                    .all(cssPromises)
                    .then(function (res) {
                        return res.join(' ');
                    }).then(function (res) {
                        var style = createStyleElement(res);
                        var div = document.createElement('div');
                        var svg = chart.getSVG().cloneNode(true);
                        div.appendChild(svg);
                        d3.select(svg).attr("version", 1.1)
                            .attr("xmlns", "http://www.w3.org/2000/svg");
                       // svg.insertBefore(style, svg.firstChild);
                        var defs = document.createElement('defs');
                        var randText = document.createElement('text');
                        randText.textContent = +new Date();
                        defs.appendChild(randText);
                        defs.appendChild(style);
                        svg.insertBefore(defs, svg.firstChild);
                        this._renderAdditionalInfo(svg, chart);
                        return svg;
                    }.bind(this));
            },
            _toPng: function (chart) {
                this._loadSvgWithCss(chart)
                    .then(function (svg) {
                        var canvas = document.createElement('canvas');
                        canvas.height = svg.getAttribute('height');
                        canvas.width = svg.getAttribute('width');
                        canvg(canvas, svg.parentNode.innerHTML);
                        var dataURL = canvas.toDataURL("image/png");
                        var data = atob(dataURL.substring("data:image/png;base64,".length)),
                            asArray = new Uint8Array(data.length);

                        for (var i = 0, len = data.length; i < len; ++i) {
                            asArray[i] = data.charCodeAt(i);
                        }

                        var blob = new Blob([asArray.buffer], {type: "image/png"});
                        saveAs(blob);
                    });
            },
            _toPrint: function (chart) {
                this._loadSvgWithCss(chart)
                    .then(function (svg) {
                        var html = svg.parentNode.innerHTML;
                        var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
                        var img = imagePlaceHolder;
                        document.body.appendChild(img);
                        img.src = imgsrc;
                        document.head.appendChild(printStyles);
                        img.onload = function () {
                            window.print();
                        };
                    });
            },
            _renderAdditionalInfo: function (svg, chart) {
                var conf = chart.getConfig();
                var configUnit = dfs(conf.spec.unit);
                if(!configUnit) {
                    return;
                }
                configUnit.guide = configUnit.guide || {};
                configUnit.guide.color = this._unit.guide.color;
                var colorScaleName = configUnit.guide.color.label.text || this._unit.options.color.dimension;
                svg = d3.select(svg);
                var width = parseInt(svg.attr('width'), 10);
                var height = svg.attr('height');
                svg.attr('width', width + 140);
                var data = this._getColorMap(chart);
                var draw = function () {
                    this.attr('transform', function (d, index) {
                        return 'translate(0,' + 20 * (index + 1) + ')';
                    });
                    this.append('circle')
                        .attr('r', 6)
                        .attr('class', function (d) {
                            return d.color;
                        });
                    this.append('text').attr('x', 12).attr('y', 5)
                        .text(function (d) {
                            return d.label;
                        }).style({
                            'font-size': '13px'
                        });
                };
                var container = svg.append('g')
                    .attr('class', 'legend')
                    .attr('transform', 'translate(' + (width + 10) + ',20)');
                container.append('text').text(colorScaleName.toUpperCase()).style({
                    'text-transform': 'uppercase',
                    'font-weight': '600',
                    'font-size': '13px'
                });
                container.selectAll('g')
                    .data(data).enter().append('g').call(draw);
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
                this.cssPaths = settings.cssPaths;
                if (!this.cssPaths) {
                    this.cssPaths = [];
                    tauCharts.api.globalSettings.log('You should specified cssPath for correct work export plugin', 'warn');
                }
                this._container = chart.insertToHeader('<a class="graphical-report__export">Export</a>>');
                var popup = chart.addBalloon({
                    place: 'bottom-left'
                });
                popup.content([
                    '<ul class="graphical-report__export__list">',
                    '<li class="graphical-report__export__item"><a href="#" data-value="print" tabindex="1">print</a></li>',
                    '<li class="graphical-report__export__item"><a href="#" data-value="png" tabindex="2">export to png</a></li>',
                    '</ul>'
                ].join(''));
                popup.attach(this._container);
                var popupElement = popup.getElement();
                popupElement.setAttribute('tabindex', '-1');
                this._handleMenu(popupElement, chart, popup);
            }
        };
    }

    tauCharts.api.plugins.add('exportTo', exportTo);

    return exportTo;
})
;
