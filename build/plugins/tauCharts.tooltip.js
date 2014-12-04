(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory();
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {
    /** @class Tooltip
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.tooltip('effort', 'priority'))
     accepts a list of data fields names as properties
     */
    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;

    function tooltip(settings) {
        settings = settings || {};
        return {
            template: [
                '<div class="i-role-content graphical-report__tooltip__content"></div>',
                '<div class="i-role-exclude graphical-report__tooltip__exclude"><span class="tau-icon-close-gray"></span>Exclude</div>',
            ]
                .join(''),
            itemTemplate: [
                '<div class="graphical-report__tooltip__list__item">',
                '<div class="graphical-report__tooltip__list__elem"><%=label%></div>',
                '<div class="graphical-report__tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join(''),
            onExcludeData: function () {

            },
            _drawPoint: function (container, x, y, color) {
                if (this.circle) {
                    this.circle.remove();
                }
                this.circle = container.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr('class', color)
                    .attr("r", 4);
                this.circle.node().addEventListener('mouseover', function () {
                    clearTimeout(this._interval);
                }.bind(this), false);
                this.circle.node().addEventListener('mouseleave', function () {
                    this._hide();
                }.bind(this), false);
            },
            init: function (chart) {
                this._chart = chart;
                this._dataFields = settings.fields;
                _.extend(this, _.omit(settings, 'fields'));
                this._interval = null;
                this._dataWithCoords = {};
                this._unitMeta = {};
                this._templateItem = _.template(this.itemTemplate);
                this._tooltip = chart.addBalloon({spacing: 5, auto: true});
                this._elementTooltip = this._tooltip.getElement();
                var elementTooltip = this._elementTooltip;
                elementTooltip.addEventListener('mouseover', function () {
                    clearTimeout(this._interval);
                }.bind(this), false);
                elementTooltip.addEventListener('mouseleave', function () {
                    this._hide();
                }.bind(this), false);
                elementTooltip.addEventListener('click', function (e) {
                    var target = e.target;
                    if (target.classList.contains('i-role-exclude')) {
                        this._exclude();
                        this._hide();
                    }
                }.bind(this), false);
                elementTooltip.insertAdjacentHTML('afterbegin', this.template);
            },
            onUnitReady: function (chart, unitMeta) {
                if (unitMeta.type && unitMeta.type.indexOf('ELEMENT') === 0) {
                    var key = this._generateKey(unitMeta.$where);
                    this._unitMeta[key] = unitMeta;
                    var values = unitMeta.partition();
                    this._dataWithCoords[key] = values.map(function (item) {
                        return {
                            x: unitMeta.options.xScale(item[unitMeta.x.scaleDim]),
                            y: unitMeta.options.yScale(item[unitMeta.y.scaleDim]),
                            item: item
                        };
                    }, this);

                }
            },
            render: function (data, fields) {
                return fields.map(function (field) {
                    return this._templateItem({label: field, value: data[field]});
                }, this).join('');
            },
            _exclude: function () {
                var dataChart = this._chart.getData();
                this._chart.setData(_.without(dataChart, this._currentElement));
                this.onExcludeData(this._currentElement);
            },
            _calculateLength: function (x1, y1, x2, y2) {
                return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            },
            _generateKey: function (data) {
                return JSON.stringify(data);
            },
            _getFields: function (unit) {
                if (this._dataFields) {
                    return this._dataFields;
                }
                var fields = [unit.size.scaleDim, unit.color.scaleDim];
                var x = [];
                var y = [];
                while (unit = unit.parentUnit) {
                    x.push(unit.x.scaleDim);
                    y.push(unit.y.scaleDim);
                }

                return _.compact(fields.concat(y, x).reverse());

            },
            onElementMouseOver: function (chart, data) {
                clearInterval(this._interval);
                var coord = d3.mouse(data.element);
                var key = this._generateKey(data.cellData.$where);
                var item = _.min(this._dataWithCoords[key], function (a) {
                    return this._calculateLength(a.x, a.y, coord[0], coord[1]);
                }, this);
                if (this._currentElement === item) {
                    return;
                }
                if (data.elementData.key && Array.isArray(data.elementData.values)) {
                    this._drawPoint(d3.select(data.element.parentNode), item.x, item.y, this._unitMeta[key].options.color.get(data.elementData.key));
                }
                var content = this._elementTooltip.querySelectorAll('.i-role-content');
                if (content[0]) {
                    var fields = this._getFields(this._unitMeta[key]);
                    content[0].innerHTML = this.render(item.item, fields);
                } else {
                    console.log('template should contain i-role-content class');
                }

                this._show();
                this._currentElement = item.item;
            },
            onElementMouseOut: function () {
                this._hide();
            },
            _show: function () {
                this._tooltip.show();
                var el = d3.mouse(this._elementTooltip.parentNode);
                this._tooltip.position(el[0], el[1]).updateSize();
            },
            _hide: function () {
                this._interval = setTimeout(function () {
                    this._currentElement = null;
                    this._tooltip.hide();
                    if (this.circle) {
                        this.circle.remove();
                    }
                }.bind(this), 300);
            },
            _destroyTooltip: function () {
                if (this.circle) {
                    this.circle.remove();
                }
                this._tooltip.destroy();
            },
            destroy: function () {
                this._destroyTooltip();
            }
        };

    }

    tauCharts.api.plugins.add('tooltip', tooltip);
});