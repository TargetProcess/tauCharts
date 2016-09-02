(function () {

    'use strict';

    //------------------------------------------------
    // NOTE: Place paths to samples and datasets here.
    //
    var PATHS = {
        'samples/': [
            getFileNames('ex-', [0, 1, 2, 3]),
            'whiskers'
        ],
        'dev-quick-test/': getFileNames(
            'ex-',
            _.times(56, _.identity).filter(function (n) {
                return n < 32 || n > 39;
            })
        ),
        'datasets/': [
            'cars',
            'countries',
            'exoplanets',
            'data',
            'olympics',
            'tpStories'
        ]
    };

    //---------------------------
    // NOTE: Filter samples here.
    //
    function filterSamples(allSamples) {
        return allSamples;
    };

    //----------------------------------
    // NOTE: Modify chart settings here.
    //
    function modifySample(sample) {
        return sample;
    }

    var TYPES = [
        'area',
        'bar',
        'horizontal-bar',
        'horizontal-stacked-bar',
        'line',
        'map',
        'parallel',
        'scatterplot',
        'stacked-area',
        'stacked-bar'
    ].sort();

    var PLUGINS = [
        'annotations',
        'box-whiskers',
        'exportTo',
        'floating-axes',
        'layers',
        'legend',
        'quick-filter',
        'settings',
        'tooltip',
        'trendline'
    ];

    var LAZY_RENDERING = true;


    function DevApp(paths) {
        this._samples = [];
        this._datasets = {};
        this._charts = [];
        this._notRenderedSamples = [];
        this._settings = this._loadSettings();
        this._initUI();
        if (paths) {
            this.load(paths);
        }
    }

    /**
     * Registers chart sample (spec).
     */
    DevApp.prototype.sample = function (sample) {
        var l = window.location;
        Object.defineProperty(sample, 'filePath', {
            value: document.currentScript.src
                .replace(l.protocol + '//' + l.host + '/', '')
        });
        this._samples.push(sample);
    };

    /**
     * Registers sample in drop format.
     */
    DevApp.prototype.drop = function (dropCfg) {
        var spec = dropCfg.spec;
        spec.data = dropCfg.data.map(function (row) {
            return dropCfg.header.reduce(function (memo, h, i) {
                memo[h] = row[i];
                return memo;
            }, {});
        });

        this.sample(spec);
    };

    /**
     * If second argument is an object, registers a dataset.
     * Otherwise sets up a dataset loader, which will retrieve
     * dataset when chart will be loaded.
     */
    DevApp.prototype.dataset = function (name, dataOrFilter) {
        if (typeof dataOrFilter === 'object') {
            this._datasets[name] = dataOrFilter;
        } else {
            return new DatasetLoader(name, dataOrFilter);
        }
    };

    /**
     * Starts scripts loading.
     */
    DevApp.prototype.load = function (paths) {
        var pathsToLoad = getJSPaths(paths);
        var loaded = 0;
        for (var i = 0; i < pathsToLoad.length; i++) {
            var s = document.createElement('script');
            s.defer = true;
            s.onload = s.onerror = function () {
                loaded++;
                if (loaded === pathsToLoad.length) {
                    this._renderCharts();
                }
            }.bind(this);
            document.head.appendChild(s);
            s.src = pathsToLoad[i];
        }

    };

    DevApp.prototype._renderCharts = function () {

        //
        // Destroy previous charts

        this._charts.forEach((c) => {
            c.destroy();
        });
        this._notRenderedSamples.splice(0);
        var container = document.getElementById('samplesContainer');
        container.innerHTML = '';

        //
        // Filter samples

        var settings = this._settings;
        var samples = filterSamples(this._samples.slice(0));
        if (settings.types.length) {
            samples = samples.filter(function (s) {
                var type = s._oldFormat ? s.spec.type : s.type;
                return settings.types.indexOf(type) >= 0;
            });
        }
        if (settings.path) {
            var regex = new RegExp(settings.path.replace('\\', '\\\\'), 'i');
            samples = samples.filter(function (s) {
                return s.filePath.match(regex);
            });
        }

        //
        // Handle specs

        samples.forEach(function (s, i) {

            // Create DOM element
            var block = createElement([
                '<div class="sample">',
                '  <h2 class="sample__name">{{name}}</h2>',
                '  <h4 class="sample__desc">{{description}}</h4>',
                '  <div class="sample__chart"></div>',
                '</div>'
            ], {
                    name: s.name || s.filePath || i,
                    description: s.desc || ('type: ' + (s._oldFormat ? s.spec.type : s.type))
                });
            container.appendChild(block);
            var target = block.querySelector('.sample__chart');

            // Modify chart settings
            if (s._oldFormat) {
                s = s.spec;
            }
            if (s.data instanceof DatasetLoader) {
                var loader = s.data;
                if (!(loader.name in this._datasets)) {
                    throw new Error('Dataset "' + loader.name + '" not found.');
                }
                var data = cloneObject(this._datasets[loader.name]);
                s.data = loader.filter(data);
            }
            s = cloneObject(s);
            s = modifySample(s);
            if (settings.plugins.length > 0) {
                s.plugins = s.plugins || [];
                s.plugins.splice(0);
                settings.plugins.forEach(function (p) {
                    s.plugins.push(tauCharts.api.plugins.get(p)());
                });
            }

            this._notRenderedSamples.push({
                sample: s,
                target: target
            });
        }, this);

        //
        // Render charts

        if (LAZY_RENDERING) {
            this._renderVisibleCharts();
        } else {
            var s, chart;
            while (this._notRenderedSamples.length) {
                s = this._notRenderedSamples.shift();
                chart = (s.sample.type ?
                    new tauCharts.Chart(s.sample) :
                    new tauCharts.Plot(s.sample));
                chart.renderTo(s.target);
                this._charts.push(chart);
            }
        };
    };

    DevApp.prototype._renderVisibleCharts = function () {
        var s, chart, rect;
        var top = document.documentElement.clientTop;
        var bottom = top + document.documentElement.clientHeight;
        for (var i = 0; i < this._notRenderedSamples.length; i++) {
            s = this._notRenderedSamples[i];
            rect = s.target.getBoundingClientRect();
            if (
                (rect.bottom > top && rect.bottom < bottom) ||
                (rect.top > top && rect.top < bottom) ||
                (rect.top <= top && rect.bottom >= bottom)
            ) {
                chart = (s.sample.type ?
                    new tauCharts.Chart(s.sample) :
                    new tauCharts.Plot(s.sample));
                chart.renderTo(s.target);
                this._charts.push(chart);
                this._notRenderedSamples.splice(i, 1);
                i--;
            }
        }
    };

    DevApp.prototype._initUI = function () {
        var settings = this._settings;

        //
        // Init file path input

        var pathInput = document.getElementById('inputPath');
        pathInput.value = settings.path;
        pathInput.focus();

        //
        // Init checkboxes

        var createCheckbox = function (name) {
            var node = createElement(
                '<label><input type="checkbox" value="{{name}}"/>{{name}}</label>',
                { name: name }
            );
            return {
                node: node,
                input: node.querySelector('input')
            };
        };

        var createCheckGroup = function (container, items, checkedItems) {
            var all = createCheckbox('all');
            if (items.every(function (t) {
                return checkedItems.indexOf(t) >= 0;
            })) {
                all.input.checked = true;
            }
            container.appendChild(all.node);
            var checkboxes = items.map(function (t) {
                var c = createCheckbox(t);
                if (checkedItems.indexOf(t) >= 0) {
                    c.input.checked = true;
                }
                container.appendChild(c.node);
                return c;
            });
            container.addEventListener('change', function (e) {
                if (e.target === all.input) {
                    // Check/uncheck all checkboxes
                    checkboxes.forEach(function (c) {
                        c.input.checked = all.input.checked;
                    });
                } else {
                    // Check/uncheck "all" checkbox
                    all.input.checked = checkboxes.every(function (c) {
                        return c.input.checked;
                    });
                }
            });
        };

        var typesContainer = document.getElementById('typesContainer');
        createCheckGroup(typesContainer, TYPES, settings.types);

        var pluginsContainer = document.getElementById('pluginsContainer');
        createCheckGroup(pluginsContainer, PLUGINS, settings.plugins);

        //
        // Handle input changes

        var onValueChanged = function (e) {
            var getValues = function (container) {
                return select(container, 'input').filter(function (el) {
                    return (el.value !== 'all' &&
                        el.checked === true);
                }).map(function (el) {
                    return el.value;
                });
            };
            var settings = {
                path: pathInput.value.trim(),
                types: getValues(typesContainer),
                plugins: getValues(pluginsContainer)
            };
            this._settings = settings;
            this._saveSettings(settings);
            this._renderCharts();
        }.bind(this);

        pathInput.onchange = onValueChanged;
        pathInput.onkeydown = function (e) {
            if (e.keyCode === 13) {
                onValueChanged(e);
            }
        };
        typesContainer.addEventListener('change', onValueChanged);
        pluginsContainer.addEventListener('change', onValueChanged);

        //
        // Init scroll

        if (LAZY_RENDERING) {
            window.addEventListener('resize', this._renderVisibleCharts.bind(this));
            document.getElementById('samplesContainer')
                .addEventListener('scroll', this._renderVisibleCharts.bind(this));
        }
    };

    DevApp.prototype._loadSettings = function () {
        var json = localStorage.getItem('devSettings');
        var settings;
        try {
            settings = JSON.parse(json);
        } catch (err) {
            settings = {};
        }
        if (!(settings instanceof Object)) {
            settings = {};
        }
        settings = _.defaults(settings, {
            path: '',
            types: [],
            plugins: []
        });
        settings.path = settings.path.trim();
        settings.types = filterEmptyValues(settings.types);
        settings.plugins = filterEmptyValues(settings.plugins);
        return settings;
    };

    DevApp.prototype._saveSettings = function (settings) {
        settings.path = settings.path.trim();
        settings.types = filterEmptyValues(settings.types);
        settings.plugins = filterEmptyValues(settings.plugins);
        var json = JSON.stringify(settings);
        localStorage.setItem('devSettings', json);
    };


    function DatasetLoader(name, filter) {
        this.name = name;
        this._filter = filter;
    };
    DatasetLoader.prototype.filter = function (data) {
        if (this._filter) {
            return this._filter.call(null, data);
        }
        return data;
    };


    /**
     * Start app.
     */
    window.addEventListener('load', function () {
        window.dev = new DevApp(PATHS);
    });


    //------------------------------------------
    //              HELPERS
    //------------------------------------------

    function createElement(templateString, props) {
        if (Array.isArray(templateString)) {
            templateString = templateString.join('\n');
        }
        var htmlString;
        if (props) {
            htmlString = templateString.replace(/\{\{(.+?)\}\}/g, function (m0, m1) {
                return String(props[m1]);
            });
        } else {
            htmlString = templateString;
        }
        var div = document.createElement('div');
        div.innerHTML = htmlString;
        return div.firstElementChild;
    }

    function getJSPaths(path, left, accumulator) {
        accumulator = accumulator || [];
        left = left || '';
        if (typeof path === 'string') {
            var p = left + path;
            if (!p.endsWith('.js')) {
                p += '.js';
            }
            accumulator.push(p);
        } else if (Array.isArray(path)) {
            path.forEach(function (p) {
                getJSPaths(p, left, accumulator);
            });
        } else {
            for (var p in path) {
                getJSPaths(path[p], left + p, accumulator);
            }
        }
        return accumulator;
    }

    function filterEmptyValues(arr) {
        return arr.map(function (d) {
            return d.trim();
        }).filter(function (d) {
            return Boolean(d);
        });
    };

    function getFileNames(prefix, numbers) {
        return numbers.map(function (num) {
            num = '00' + String(num);
            num = num.substring(num.length - 3);
            return prefix + num;
        });
    }

    function select(container, selector) {
        return Array.prototype.slice.call(
            container.querySelectorAll(selector), 0
        );
    }

    var WeakMap = window.WeakMap || (function () {
        var counter = 0;
        function WeakMap() {
            this.id = 'WeakMap' + counter++;
        }
        WeakMap.prototype.has = function (key) {
            return this.id in key;
        };
        WeakMap.prototype.get = function (key) {
            return key[this.id];
        };
        WeakMap.prototype.set = function (key, value) {
            Object.defineProperty(key, this.id, {
                configurable: true, value: value
            });
        };
        WeakMap.prototype.delete = function (key) {
            delete key[this.id];
        };
        return WeakMap;
    })();

    function cloneObject(src, refs) {
        if (typeof src !== 'object' || src === null) {
            return src;
        }
        refs = refs || new WeakMap();
        if (refs.has(src)) {
            return refs.get(src);
        }
        var result;
        if (Array.isArray(src)) {
            result = [];
            refs.set(src, result);
            src.forEach(function (d) {
                result.push(cloneObject(d, refs));
            });
        } else if (src instanceof Date) {
            result = new Date(src.getTime());
            refs.set(src, result);
        } else if (src instanceof Node) {
            result = src.cloneNode(true);
            refs.set(src, result);
        } else if (src instanceof String || src instanceof Boolean || src instanceof Number) {
            var Ctor = Object.getPrototypeOf(src).constructor;
            result = new Ctor(src);
            refs.set(src, result);
        } else {
            var Ctor = Object.getPrototypeOf(src).constructor;
            result = new Ctor();
            refs.set(src, result);
            Object.keys(src).reduce(function (memo, key) {
                memo[key] = cloneObject(src[key], refs);
                return memo;
            }, result);
        }
        return result;
    }

})();