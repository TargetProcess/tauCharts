import tauCharts from 'taucharts';

{

    var utils = tauCharts.api.utils;
    var REFRESH_DELAY = 0;

    function QuickFilter(xSettings) {

        var log10 = function (x) {
            return Math.log(x) / Math.LN10;
        };

        var createIsRowMatchInterceptor = function (dim, valMin, valMax) {
            return function (row) {
                var d = row[dim];
                return (d < valMin || d > valMax);
            };
        };

        return {

            init: function (chart) {

                this._chart = chart;
                this._currentFilters = {};
                this._data = {};
                this._bounds = {};
                this._filter = {};
                this._container = {};
                this._layout = this._chart.getLayout().layout;

                var self = this;
                var spec = this._chart.getSpec();
                var sources = spec.sources['/'];

                var fields = (xSettings && xSettings.fields || xSettings);

                this._fields = ((Array.isArray(fields) && fields.length > 0) ?
                    (fields) :
                    (Object.keys(sources.dims)));

                this._applyImmediately = Boolean(xSettings && xSettings.applyImmediately);

                var chartData = self._chart.getChartModelData();

                this._filtersContainer = self._chart.insertToRightSidebar(self._filtersContainer);
                this._filtersContainer.style.maxHeight = '0px';

                self._fields
                    .filter(function (dim) {
                        var isMeasure = (sources.dims[dim].type === 'measure');
                        if (!isMeasure) {
                            spec.settings.log('The [' + dim + '] isn\'t measure so Quick Filter plugin skipped it');
                        }

                        return isMeasure;
                    })
                    .forEach(function (dim) {
                        self._data[dim] = chartData.map(function (x) {
                            return x[dim];
                        });
                        self._bounds[dim] = d3.extent(self._data[dim]);
                        self._filter[dim] = self._bounds[dim];

                        self._filtersContainer.insertAdjacentHTML('beforeend', self._filterWrapper({name: dim}));
                        self._container[dim] = self._filtersContainer.lastChild;

                        self._drawFilter(dim);
                    });
            },

            onRender: function () {
                this._filtersContainer.style.maxHeight = 'none';
            },

            _filtersContainer: '<div class="graphical-report__filter"></div>',
            _filterWrapper: utils.template(
                '<div class="graphical-report__filter__wrap">' +
                    '<div class="graphical-report__legend__title"><%=name%></div>' +
                '</div>'
            ),

            _drawFilter: function (dim) {

                var data = this._data[dim];
                var bounds = this._bounds[dim];

                var filter = this._filter[dim];
                var isDate = (utils.isDate(bounds[0]) || utils.isDate(bounds[1]));

                var self = this;

                var margin = {top: 0, right: 24, bottom: 21, left: 12};
                var padding = 4;
                var width = 180 - margin.left - margin.right;
                var height = 41 - margin.top - margin.bottom - 2 * padding;

                var x = d3.scaleLinear()
                    .domain(bounds)
                    .range([0, width]);

                var brush = d3.svg.brush()
                    .x(x)
                    .extent(filter)
                    .on('brushstart', function () {
                        self._layout.style['overflow-y'] = 'hidden';
                    })
                    .on('brush', (this._applyImmediately ? applyBrush : updateBrush))
                    .on('brushend', function () {
                        self._layout.style['overflow-y'] = '';
                        applyBrush();
                    });

                var svg = d3.select(this._container[dim]).append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom + 4)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                var rect = svg.append('g').selectAll('rect')
                    .data(data)
                    .enter().append('rect')
                    .attr('transform', function (d) {return 'translate(' + x(d) + ',' + (margin.top + padding) + ')'; })
                    .attr('height', height)
                    .attr('width', 1);

                var brushg = svg.append('g')
                    .attr('class', 'brush')
                    .call(brush);

                brushg.selectAll('.resize').append('line')
                    .attr('transform', 'translate(0, 0)')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', 0)
                    .attr('y2', height + 2 * padding);

                brushg.selectAll('.resize').append('text')
                    .attr('x', 0)
                    .attr('y', 2 * (height + padding));

                brushg.selectAll('rect')
                    .attr('height', height + 2 * padding);

                var dateText = svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', 2 * (height + padding))
                    .attr('class', 'date-label');

                var count = log10(self._filter[dim][1] - self._filter[dim][0]);
                var xF = Math.round(3 - count);
                var base = Math.pow(10, xF);

                function getFormatters(formatters) {

                    var index = formatters
                        .findIndex(function (token) {
                            var f = d3.time.format(token);
                            return (f(new Date(bounds[0])) !== f(new Date(bounds[1])));
                        });

                    index = ((index < 0) ? (formatters.length) : (index));

                    return {
                        comm: formatters.slice(0, index),
                        diff: formatters.slice(index)
                    };
                }

                var compOrder = ['’%y', '&thinsp;%b', '%d', '%H', ':%M', ':%S'];
                if (isDate) {
                    var formatters = getFormatters(compOrder);
                    if (formatters.comm.length < 3) {
                        formatters.diff.splice(-3);
                        formatters.diff.reverse();
                        formatters.comm.reverse();
                        // Hide time at all if there're different days
                    } else {
                        if (formatters.comm.length < 5) {
                            formatters.diff.pop();
                        }
                        // Hide seconds if it's not the same minute

                        formatters.diff = formatters.comm.splice(3, formatters.comm.length - 3).concat(formatters.diff);
                        formatters.comm.reverse();
                        // Move time to diff part if it's the same day
                    }
                }

                applyBrush();

                function updateBrush() {
                    var filter = self._filter[dim] = brush.extent();
                    var filterMin = isDate ? (new Date(filter[0])).getTime() : filter[0];
                    var filterMax = isDate ? (new Date(filter[1])).getTime() : filter[1];

                    var s = (Math.round(parseFloat(filterMin) * base) / base);
                    var e = (Math.round(parseFloat(filterMax) * base) / base);

                    var sTxt = brushg.selectAll('.w text');
                    var eTxt = brushg.selectAll('.e text');

                    if (isDate) {
                        var comm = d3.time.format(formatters.comm.join(''));
                        var diff = d3.time.format(formatters.diff.join(''));

                        dateText.html(diff(new Date(s)) + '&thinsp;..&thinsp;' + diff(new Date(e)) +
                            ' <tspan class="common">' + comm(new Date(e)) + '</tspan>');
                    } else {
                        sTxt.text(s);
                        eTxt.text(e);
                    }
                }

                function applyBrush() {
                    updateBrush();
                    self._applyFilter(dim);
                }
            },

            _applyFilter: function (dim) {
                var state = this._currentFilters;

                var valMin = this._filter[dim][0];
                var valMax = this._filter[dim][1];
                var isRowMatch = createIsRowMatchInterceptor(dim, valMin, valMax);

                var filterId = state[dim];
                delete state[dim];
                this._chart.removeFilter(filterId);

                state[dim] = this._chart.addFilter({
                    tag: 'quick-filter',
                    predicate: function (row) {
                        return !isRowMatch(row);
                    }
                });

                if (REFRESH_DELAY < 0) {
                    this._chart.refresh();
                } else {
                    if (this._refreshRequestId) {
                        clearTimeout(this._refreshRequestId);
                    }
                    this._refreshRequestId = setTimeout(function () {
                        this._refreshRequestId = null;
                        this._chart.refresh();
                    }.bind(this), REFRESH_DELAY);
                }
            }
        };
    }

    tauCharts.api.plugins.add('quick-filter', QuickFilter);
}
