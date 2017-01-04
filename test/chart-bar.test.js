define(function(require){
    var assert = require('chai').assert;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');
    var noScrollStyle = require('test/utils/utils').noScrollStyle;

    var createTestDiv = function () {
        noScrollStyle.create();
        var testDiv = document.createElement('div');
        testDiv.style.width = '800px';
        testDiv.style.height = '600px';
        document.body.appendChild(testDiv);
        removeTestDiv = function () {
            document.body.removeChild(testDiv);
            noScrollStyle.remove();
        };
        return testDiv;
    };
    var removeTestDiv;

    describe('Bar chart', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];

        it('should convert to common config', function () {
            var bar = new tauChart.Chart({
                type:'bar',
                data:testData,
                x:'x',
                y:'y',
                color:'color',
                size:'size'
            });
            assert.equal(schemes.barGPL.errors(bar.getSpec()), false, 'spec right');
            assert.equal(bar.getSpec().unit.units[0].flip, false, 'spec right');
            bar.destroy();
        });

        it('should draw labels after bars', function () {
            var testDiv = createTestDiv();
            var data1 = [
                {x: 10, y: 10, t: 'a'},
                {x: 10, y: 20, t: 'b'},
                {x: 20, y: 15, t: 'c'}
            ];
            var data2 = [
                {x: 10, y: 20, t: 'b'},
                {x: 20, y: 15, t: 'c'}
            ];
            var bar = new tauChart.Chart({
                type: 'horizontal-bar',
                data: data1,
                x: 'x',
                y: 'y',
                color: 't',
                label: 'y'
            });
            bar.renderTo(testDiv);
            bar.setData(data2);
            bar.setData(data1);
            var svg = bar.getSVG();
            var container = svg.querySelector('.i-role-bar-group').parentNode;
            var children = Array.prototype.slice.call(container.childNodes);
            var lastBarIndex = (children.length - 1 - children.slice(0).reverse()
                .findIndex(function (b) {
                    return b.matches('.i-role-bar-group');
                }));
            var firstLabelIndex = children
                .findIndex(function (b) {
                    return b.matches('.i-role-label');
                });
            assert.equal(lastBarIndex + 1, firstLabelIndex, 'last bar and first label indices');
            bar.destroy();
            removeTestDiv();
        });

        it('should put labels inside and outside of horizontal bars', function () {
            var toArray = (obj) => Array.prototype.slice.call(obj, 0);
            var testDiv = createTestDiv();
            var data = [
                {x: 10, y: 10, l: 'Anger & swearing - Difficult workaround'},
                {x: 20, y: 20, l: 'Confused'},
                {x: -20, y: 30, l: 'Much anger & crying - No workaround'},
                {x: -10, y: 40, l: 'Laugh if notice'}
            ];
            var bar = new tauChart.Chart({
                type: 'horizontal-bar',
                data: data,
                x: 'x',
                y: 'y',
                label: 'l'
            });
            bar.renderTo(testDiv);
            var svg = bar.getSVG();
            var grid = svg.querySelector('.grid').getBoundingClientRect();
            var bars = toArray(svg.querySelectorAll('.i-role-bar-group rect'))
                .map(el => el.getBoundingClientRect());
            var labels = toArray(svg.querySelectorAll('.i-role-label'))
                .map(el => el.getBoundingClientRect());

            assert.equal(bars.length, data.length);
            assert.equal(labels.length, data.length);

            assert.equal(labels.every(l => (
                (l.left >= grid.left) &&
                (l.right <= grid.right)
            )), true, 'labels do not exceed grid');

            assert.equal(labels.every(l => {
                // Find a bar on the same level as label
                var b = bars.filter(b => l.top > b.top && l.bottom < b.bottom)[0];
                return !(
                    (l.left < b.left && l.right > b.left) ||
                    (l.left < b.right && l.right > b.right)
                );
            }), true, 'labels do not intersect bars');

            bar.destroy();
            removeTestDiv();
        });

        it('should put labels inside and outside of vertical bars', function () {
            var toArray = (obj) => Array.prototype.slice.call(obj, 0);
            var testDiv = createTestDiv();
            var data = [
                {x: 10, y: 10, l: 'Anger & swearing - Difficult workaround'},
                {x: 20, y: 20, l: 'Confused'},
                {x: -20, y: 30, l: 'Much anger & crying - No workaround'},
                {x: -10, y: 40, l: 'Laugh if notice'}
            ];
            var bar = new tauChart.Chart({
                type: 'bar',
                data: data,
                x: 'y',
                y: 'x',
                label: 'l'
            });
            bar.renderTo(testDiv);
            var svg = bar.getSVG();
            var grid = svg.querySelector('.grid').getBoundingClientRect();
            var bars = toArray(svg.querySelectorAll('.i-role-bar-group rect'))
                .map(el => el.getBoundingClientRect());
            var labels = toArray(svg.querySelectorAll('.i-role-label'))
                .map(el => el.getBoundingClientRect());

            assert.equal(bars.length, data.length);
            assert.equal(labels.length, data.length);

            assert.equal(labels.every(l => (
                (l.top >= grid.top) &&
                (l.bottom <= grid.bottom)
            )), true, 'labels do not exceed grid');

            assert.equal(labels.every(l => {
                // Find a bar on the same level as label
                var b = bars.filter(b => l.left > b.left && l.right < b.right)[0];
                return !(
                    (l.top < b.top && l.bottom > b.top) ||
                    (l.top < b.bottom && l.bottom > b.bottom)
                );
            }), true, 'labels do not intersect bars');

            bar.destroy();
            removeTestDiv();
        });
    });

    describe('Bar chart size', function () {
        var testData = tauChart.api.utils.range(100).map(function (i) {
            return {
                x: 20,
                y: i
            };
        });

        it('should not reserve space when no bar label', function () {
            var testDiv = createTestDiv();
            var bar = new tauChart.Chart({
                type: 'horizontal-bar',
                data: testData,
                x: 'x',
                y: 'y'
            });
            bar.renderTo(testDiv);
            assert.equal(Number(bar.getSVG().getAttribute('width')), 800, 'chart width');
            assert.equal(Number(bar.getSVG().getAttribute('height')), 600, 'chart height');
            bar.destroy();
            removeTestDiv();
        });

        it('should reserve space when bar label is set', function () {
            var testDiv = createTestDiv();
            var bar = new tauChart.Chart({
                type: 'horizontal-bar',
                data: testData,
                x: 'x',
                y: 'y',
                label: 'y'
            });
            bar.renderTo(testDiv);
            assert.equal(Number(bar.getSVG().getAttribute('width')), 800, 'chart width');
            assert.equal(Number(bar.getSVG().getAttribute('height')), 1075, 'chart height');
            bar.destroy();
            removeTestDiv();
        });
    });

});
