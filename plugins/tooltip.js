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
                '<div>',
                '<div class="i-role-content tooltip__content"></div>',
                '<div class="i-role-exclude tooltip__exclude"><span class="tau-icon-close-gray"></span>Exclude</div>',
                '</div>']
                .join(''),
            init: function (chart) {
                this._chart = chart;
                this._dataFields = fields;
                this._interval = null;
                this._tooltip = chart.addBallon({spacing: 10});
                var dom = this._tooltip.getDom();
                dom.addEventListener('mouseover', function () {
                    this.needHide = false;
                    clearTimeout(this.interval);
                }.bind(this), false);
                dom.addEventListener('mouseleave', function () {
                    this.needHide = true;
                    this._tooltip.hide();
                }.bind(this), false);
                dom.insertAdjacentHTML('afterbegin', this.template);
                dom.addEventListener('click', function (e) {
                    var target = e.target;
                    if(target.classList.contains('i-role-exclude')) {
                        this._exclude();
                    }
                }.bind(this), false);
                this.needHide = true;
            },
            render:function(data) {

            },
            _exclude:function() {
                var dataChart = this._chart.getData();
                this._chart.setData(_.without(dataChart, this._currentElement));
            },
            onElementMouseOver: function (chart, data) {
                //TODO: this tooltip jumps a bit, need to be fixed
                var text = '';
                for (var i = this._dataFields.length - 1; i >= 0; i--) {
                    var field = this._dataFields[i];
                    text += '<p class="tooltip-' + field + '"><em>' + field + ':</em> ' + data.elementData[field];
                }
                text += '</p>';
                this._tooltip.getDom().querySelectorAll('.i-role-content')[0].innerHTML = text;
                this._tooltip.show(data.element).updateSize();
                clearInterval(this._interval);
                this._currentElement = data.elementData;
            },
            onElementMouseOut: function () {
                this._interval = setTimeout(function () {
                    if (this.needHide) {
                        this._tooltip.hide();
                    }
                }.bind(this), 300);
            }
        };

    }

    tauPlugins.add('tooltip', tooltip);
});