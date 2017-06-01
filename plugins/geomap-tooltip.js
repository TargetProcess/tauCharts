import tauCharts from 'taucharts';

    var utils = tauCharts.api.utils;

    function ChartGeoMapTooltip(xSettings) {

        var settings = utils.defaults(
            xSettings || {},
            {
                // add default settings here
            });

        var falsyFilter = function () {
            return false;
        };

        var equalFilter = function (data) {
            var str = JSON.stringify(data);
            return function (row) {
                return JSON.stringify(row) === str;
            };
        };

        var plugin = {

            init: function (chart) {

                this._currNode = null;
                this._currData = null;
                this._chart = chart;
                this._tooltip = chart.addBalloon(
                    {
                        spacing: 3,
                        auto: true,
                        effectClass: 'fade'
                    });

                this._tooltip
                    .content(this.template);

                this._tooltip
                    .getElement()
                    .addEventListener('click', function (e) {

                        var target = e.target;

                        while (target !== e.currentTarget && target !== null) {
                            if (target.classList.contains('i-role-exclude')) {
                                self._exclude();
                                self._tooltip.hide();
                                self._blurSelection();
                            }
                            target = target.parentNode;
                        }
                    }, false);

                var self = this;
                var timeoutHide;
                this._showTooltip = function (e) {

                    clearTimeout(timeoutHide);

                    self._currData = e.data;

                    var message = 'No data';
                    if (e.data !== null) {
                        message = Object
                            .keys(e.data)
                            .map(function (k) {
                                return self.itemTemplate({label: k, value: e.data[k]});
                            })
                            .join('');
                    }
                    var content = self._tooltip.getElement().querySelectorAll('.i-role-content');
                    if (content[0]) {
                        content[0].innerHTML = message;
                    }

                    var exclude = self._tooltip.getElement().querySelectorAll('.i-role-exclude');
                    if (exclude[0]) {
                        var allowExclude = e.data && (self._chart.getChartModelData().length > 1);
                        exclude[0].style.visibility = allowExclude ? 'visible' : 'hidden';
                    }

                    self._tooltip
                        .show(e.event.pageX, e.event.pageY)
                        .updateSize();
                };

                this._hideTooltip = function (immediately) {
                    timeoutHide = setTimeout(
                        function () {
                            self._tooltip.hide();
                        },
                        immediately ? 0 : 1000);
                };

                this._tooltip
                    .getElement()
                    .addEventListener('mouseover', function (e) {
                        clearTimeout(timeoutHide);
                    }, false);

                this._tooltip
                    .getElement()
                    .addEventListener('mouseleave', function (e) {
                        self._hideTooltip(true);
                        self._blurSelection();
                    }, false);
            },

            onRender: function () {

                var self = this;

                this._chart
                    .select(function (node) {
                        return node.config.type === 'COORDS.MAP';
                    })
                    .forEach(function (node) {
                        self._subscribeToPoints(node);
                        self._subscribeToArea(node);
                    });
            },

            template: [
                '<div class="i-role-content graphical-report__tooltip__content"></div>',
                '<div class="i-role-exclude graphical-report__tooltip__exclude">',
                '<div class="graphical-report__tooltip__exclude__wrap">',
                '<span class="tau-icon-close-gray"></span>',
                'Exclude',
                '</div>',
                '</div>'
            ].join(''),

            itemTemplate: utils.template([
                '<div class="graphical-report__tooltip__list__item">',
                '<div class="graphical-report__tooltip__list__elem"><%=label%></div>',
                '<div class="graphical-report__tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join('')),

            _exclude: function () {
                this._chart
                    .addFilter({
                        tag: 'exclude',
                        predicate: (function (element) {
                            return function (row) {
                                return JSON.stringify(row) !== JSON.stringify(element);
                            };
                        }(this._currData))
                    });
                this._chart.refresh();
            },

            _blurSelection: function () {
                this._chart
                    .select(function (node) {
                        return node.config.type === 'COORDS.MAP';
                    })
                    .forEach(function (node) {
                        node.fire('highlight-area', falsyFilter);
                    });

                this._currNode = null;
                this._currData = null;
            },

            _subscribeToPoints: function (node) {

                var self = this;

                node.on('point-mouseover', function (sender, e) {
                    self._showTooltip(e);
                });

                node.on('point-mouseout', function (sender, e) {
                    self._hideTooltip();
                });
            },

            _subscribeToArea: function (node) {

                var self = this;

                var isCodeEmpty = !node.getScale('code').dim;
                if (isCodeEmpty) {
                    return;
                }

                node.on('area-click', function (sender, e) {

                    self._currNode = sender;

                    if (!e.data) {
                        self._showTooltip(e);
                        self._hideTooltip(false);
                        self._blurSelection();
                    } else if (self._currData === e.data) {
                        self._hideTooltip(true);
                        self._blurSelection();
                    } else {
                        node.fire('highlight-area', equalFilter(e.data));
                        self._showTooltip(e);
                    }
                });
            }
        };

        return plugin;
    }

    tauCharts.api.plugins.add('geomap-tooltip', ChartGeoMapTooltip);
