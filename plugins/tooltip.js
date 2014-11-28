(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauPlugins'], function(tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauPlugins');
        module.exports = factory();
    } else {
        factory(this.tauPlugins);
    }
})(function(tauPlugins) {
    /** @class Tooltip
     * @extends Plugin */
    /* Usage
     .plugins(tau.plugins.tooltip('effort', 'priority'))
     accepts a list of data fields names as properties
     */
    function tooltip(fields) {
        return {
            template: [
                '<div class="i-role-content tooltip__content"></div>',
                '<div class="i-role-exclude tooltip__exclude"><span class="tau-icon-close-gray"></span>Exclude</div>',
            ]
                .join(''),
            templateItem: [
                '<div class="tooltip__list__item">',
                '<div class="tooltip__list__elem"><%=label%></div>',
                '<div class="tooltip__list__elem"><%=value%></div>',
                '</div>'
            ].join(''),
            init: function(chart) {
                this._chart = chart;
                this._dataFields = fields;
                this._interval = null;
                this._templateItem = _.template(this.templateItem);
                this._tooltip = chart.addBalloon({spacing: 5, auto: true});
                this._elementTooltip = this._tooltip.getElement();
                var elementTooltip = this._elementTooltip;
                elementTooltip.addEventListener('mouseover', function() {
                    clearTimeout(this._interval);
                }.bind(this), false);
                elementTooltip.addEventListener('mouseleave', function() {
                    this._hide();
                }.bind(this), false);
                elementTooltip.addEventListener('click', function(e) {
                    var target = e.target;
                    if (target.classList.contains('i-role-exclude')) {
                        this._exclude();
                        this._hide();
                    }
                }.bind(this), false);
                elementTooltip.insertAdjacentHTML('afterbegin', this.template);
            },
            onUnitReady: function(chart, unitMeta) {
                if (unitMeta.type && unitMeta.type.indexOf('ELEMENT') === 0) {
                    this._unitMeta = unitMeta;
                    //debugger
                    /*this._unitMeta = unitMeta;
                     var values = this._unitMeta.partition();
                     this._dataWithCoords = values.map(function(item) {
                     return {
                     x: unitMeta.options.xScale(item[unitMeta.x.scaleDim]),
                     y: unitMeta.options.yScale(item[unitMeta.y.scaleDim]),
                     item: item
                     }
                     }, this)*/

                }
            },
            onRender: function() {
                var values = this._unitMeta.partition();
                this._dataWithCoords = values.map(function(item) {
                    return {
                        x: this._unitMeta.options.xScale(item[this._unitMeta.x.scaleDim]),
                        y: this._unitMeta.options.yScale(item[this._unitMeta.y.scaleDim]),
                        item: item
                    };
                }, this);
            },
            render: function(data) {
                return this._dataFields.map(function(field) {
                    return this._templateItem({label: field, value: data[field]});
                }, this).join('');
            },
            _exclude: function() {
                var dataChart = this._chart.getData();
                this._chart.setData(_.without(dataChart, this._currentElement));
            },
            calculateLength: function(x1, y1, x2, y2) {
                return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            },
            onElementMouseOver: function(chart, data) {
                clearInterval(this._interval);
                var coord = d3.mouse(data.element);
                var item = _.min(this._dataWithCoords, function(a) {
                    return this.calculateLength(a.x,a.y,coord[0],coord[1]);
                }, this).item;
                if (this._currentElement === item) {
                    return;
                }
                this._elementTooltip.querySelectorAll('.i-role-content')[0].innerHTML = this.render(item);
                this._show();
                this._currentElement = item;
            },
            onElementMouseOut: function() {
                this._hide();
            },
            _show: function() {
                this._tooltip.show();
                var el = d3.mouse(this._elementTooltip.parentNode);
                this._tooltip.position(el[0], el[1]).updateSize();
            },
            _hide: function() {
                this._interval = setTimeout(function() {
                    this._currentElement = null;
                    this._tooltip.hide();
                }.bind(this), 300);
            },
            destroy: function() {
                this._tooltip.destroy();
            }
        };

    }

    tauPlugins.add('tooltip', tooltip);
});