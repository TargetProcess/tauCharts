(function () {

    'use strict';

    //------------------------------------------------
    // NOTE: Place paths to samples and datasets here.
    //
    var PATHS = [
        {
            'samples/': getFileNames(
                'ex-',
                [0, 1, 2, 3]
            )
        },
        [
            'data',
            'data-cars',
            'data-exoplanets',
            'data-olympics'
        ]
    ];

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
        'export',
        'floating-axes',
        'layers',
        'legend',
        'quick-filter',
        'settings',
        'tooltip',
        'trendline'
    ];


    function DevApp(paths) {
        this._samples = [];
        this._datasets = {};
        this._charts = [];
        this._settings = this._loadSettings();
        this._initUI();
        if (paths) {
            this.load(paths);
        }
    }

    DevApp.prototype.sample = function (sample) {
        this._samples.push(sample);
    };

    DevApp.prototype.dataset = function (name, dataOrFilter) {
        if (typeof dataOrFilter === 'object') {
            this._datasets[name] = dataOrFilter;
        } else {
            return new DatasetLoader(name, dataOrFilter);
        }
    };

    DevApp.prototype.renderCharts = function () {
        // Clear resources
        this._charts.forEach((c) => {
            c.destroy();
        });
        var container = document.getElementById('samplesContainer');
        container.innerHTML = '';

        // Filter samples
        var settings = this._settings;
        var samples = filterSamples(this._samples.slice(0));
        if (settings.types.length) {
            samples = samples.filter(function (s) {
                var type = s.spec ? s.spec.type : s.type;
                return settings.types.indexOf(type) >= 0;
            });
        }
        if (settings.name) {
            var lowName = settings.name.toLowerCase();
            samples = samples.filter(function (s) {
                return s.name.toLowerCase().indexOf(lowName) >= 0;
            });
        }

        samples.forEach(function (s, i) {
            // Create DOM element
            var block = createElement([
                '<div class="sample">',
                '  <h2 class="sample__name">{{name}}</h2>',
                '  <h4 class="sample__desc">{{description}}</h4>',
                '  <div class="sample__chart"></div>',
                '</div>'
            ], {
                    name: s.name || i,
                    description: s.desc || ''
                });
            container.appendChild(block);
            var target = block.querySelector('.sample__chart');

            // Modify chart settings
            if (s.spec) {
                s = s.spec;
            }
            s = modifySample(s);
            if (s.data instanceof DatasetLoader) {
                var loader = s.data;
                s.data = loader.filter(this._datasets[loader.name]);
            }
            if (settings.plugins.length > 0) {
                s.plugins.splice(0);
                settings.plugins.forEach(function (p) {
                    s.plugins.push(tauCharts.api.plugins.get(p)());
                });
            }

            // Render chart
            var chart = (s.type ?
                new tauCharts.Chart(s) :
                new tauCharts.Plot(s));
            chart.renderTo(target);
            this._charts.push(chart);
        }, this);
    };

    DevApp.prototype.load = function (paths) {
        var pathsToLoad = getJSPaths(paths);
        var loaded = 0;
        for (var i = 0; i < pathsToLoad.length; i++) {
            var s = document.createElement('script');
            s.src = pathsToLoad[i];
            s.onload = s.onerror = function () {
                loaded++;
                if (loaded === pathsToLoad.length) {
                    this.renderCharts();
                }
            }.bind(this);
            document.head.appendChild(s);
        }

    };

    DevApp.prototype._initUI = function () {
        var settings = this._settings;

        var nameInput = document.getElementById('inputName');
        nameInput.value = settings.name;
        nameInput.focus();

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
                name: nameInput.value.trim(),
                types: getValues(typesContainer),
                plugins: getValues(pluginsContainer)
            };
            this._settings = settings;
            this._saveSettings(settings);
            this.renderCharts();
        }.bind(this);

        nameInput.onchange = onValueChanged;
        nameInput.onkeydown = function (e) {
            if (e.keyCode === 13) {
                onValueChanged(e);
            }
        };
        typesContainer.addEventListener('change', onValueChanged);
        pluginsContainer.addEventListener('change', onValueChanged);
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
            name: '',
            types: [],
            plugins: []
        });
        settings.name = settings.name.trim();
        settings.types = filterEmptyValues(settings.types);
        settings.plugins = filterEmptyValues(settings.plugins);
        return settings;
    };

    DevApp.prototype._saveSettings = function (settings) {
        settings.name = settings.name.trim();
        settings.types = filterEmptyValues(settings.types);
        settings.plugins = filterEmptyValues(settings.plugins);
        var json = JSON.stringify(settings);
        localStorage.setItem('devSettings', json);
    };


    function DatasetLoader(name, filter) {
        this.name = name;
        this._filter = filter;
    };
    DatasetLoader.prototype = {
        filter: function (data) {
            if (this._filter) {
                return this._filter.call(null, data);
            }
            return data;
        }
    };


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

})();