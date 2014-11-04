define(function (require) {
    var tauChart = require('tau_modules/tau.newCharts').tauChart,
        d3 = require('d3');

    function getDots() {
        return d3.selectAll('.dot')[0];
    }

    function getLine() {
        return d3.selectAll('.line')[0];
    }

    function getGroupBar() {
        return d3.selectAll('.i-role-bar-group')[0];
    }

    function attrib(el, prop) {
        return el.getAttribute(prop)
    }

    var hasClass = function (element, value) {
        return attrib(element, 'class').indexOf(value) !== -1;
    };

    function position(el) {
        return {x: attrib(el, 'cx'), y: attrib(el, 'cy')}
    }

    function describePlot(name, spec, data, fn) {
        describe(name, function () {
            var context = {
                element: null,
                chart: null
            };

            beforeEach(function () {
                context.element = document.createElement('div');
                document.body.appendChild(context.element);
                context.chart = new tauChart.Plot({
                    spec: spec,
                    data: data
                });
                context.chart.renderTo(context.element, {width: 800, height: 800});
            });

            fn(context);

            afterEach(function () {
                context.element.parentNode.removeChild(context.element);
            });
        });
    }


    return {
        describePlot: describePlot,
        getDots: getDots,
        getLine: getLine,
        attrib: attrib,
        hasClass: hasClass,
        position: position,
        getGroupBar: getGroupBar
    }
});
