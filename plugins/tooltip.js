(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['tauPlugins'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === "object" && module.exports) {
        var tauPlugins = require('tauPlugins');
        module.exports = factory();
    } else {
        factory(this.tauPlugins);
    }
})(function (tauPlugins) {
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
            init: function (chart) {
                this._chart = chart;
                this._dataFields = fields;
                this._interval = null;
                this._templateItem = _.template(this.templateItem);
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
            render: function (data) {
                return this._dataFields.map(function (field) {
                    return this._templateItem({label: field, value: data[field]});
                }, this).join('');
            },
            _exclude: function () {
                var dataChart = this._chart.getData();
                this._chart.setData(_.without(dataChart, this._currentElement));
            },
            onElementMouseOver: function (chart, data) {
                clearInterval(this._interval);
                if (data.element === this._boundElement) {
                    return;
                }
                this._boundElement = data.element;
                this._elementTooltip.querySelectorAll('.i-role-content')[0].innerHTML = this.render(data.elementData);
                this._show();
                this._currentElement = data.elementData;
            },
            onElementMouseOut: function () {
                this._hide();
            },
            _show:function() {
                this._tooltip.show();
                var el = d3.mouse(this._elementTooltip.parentNode);
                this._tooltip.position(el[0], el[1]).updateSize();
            },
            _hide: function () {
                this._interval = setTimeout(function () {
                    this._boundElement = null;
                    this._tooltip.hide();
                }.bind(this), 300);
            },
            destroy: function () {
                this._tooltip.destroy();
            }
        };

    }

    tauPlugins.add('tooltip', tooltip);
});