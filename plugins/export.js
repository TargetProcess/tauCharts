(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts', 'canvg', 'FileSaver', 'fetch', 'promise'], function (tauPlugins, canvg, saveAs) {
            return factory(tauPlugins, canvg, saveAs);
        });
    } else {
        factory(this.tauCharts, this.canvg, this.saveAs);
    }
})(function (tauCharts, canvg, saveAs) {
    var _ = tauCharts.api.d3;
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

    var isSupportFocusin = (function () {
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

        return hasIt; // should be true if focusin is fired
    })();

    function exportTo() {
        return {
            _loadCss: function (css) {
                var cssPromises = css.map(function (css) {
                    return fetch(css).then(function (r) {
                        return r.text();
                    });
                });
                return Promise
                    .all(cssPromises)
                    .then(function (res) {
                        return res.join(' ');
                    });
            },
            _toPng: function (chart) {
                this._loadCss(['http://localhost:63342/tauCharts/css/tauCharts.css'])
                    .then(function (res) {
                        var style = document.createElement('style');
                        style.innerHTML = /*'@font-face { font-family: "OpenSans"; src: url(http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,400,600&subset=latin,cyrillic-ext); } '+ */res;
                        var svg = chart.getSVG();
                        var refChild = svg.firstChild;
                        svg.insertBefore(style, refChild);

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

                var focusin = isSupportFocusin ? 'focusin' : 'focus';
                var focusout = isSupportFocusin ? 'focusout' : 'blur';
                popupElement.addEventListener(focusout, function () {
                    timeoutID = setTimeout(function () {
                        popup.hide();
                    }, 100);

                }, !isSupportFocusin);
                popupElement.addEventListener(focusin, function () {
                    clearTimeout(timeoutID);
                }, !isSupportFocusin);
                this._container.addEventListener('click', function () {
                    popup.toggle();
                    if (!popup.hidden) {
                        popupElement.querySelectorAll('a')[0].focus();
                    }
                });
            },
            init: function (chart) {
                this._container = chart.insertToHeader('<a class="graphical-report__export">Export</a>>');
                var popup = chart.addBalloon({
                    place: 'bottom-left'
                });
                popup.content([
                    '<ul class="graphical-report__export__list">',
                    '<li class="graphical-report__export__item"><a href="#" tabindex="1">print</a></li>',
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
});
