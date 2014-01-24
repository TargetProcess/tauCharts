/*global module, test */

(function () {
    module('tau.svg.Layout', {

    });

    test('should place elements width transform attribute', function () {
        var svg = document.createElement('svg');
        var layout = new tau.svg.Layout(d3.select(svg), 100, 100);
        layout.row(20);
        layout.row();
        layout.col(40);
        layout.col();

        equal(svg.innerHTML, '<g transform="translate(0,20)"></g><g transform="translate(40,20)"></g>')
    });

    test('should take negative values as relative', function () {
        var svg = document.createElement('svg');
        var layout = new tau.svg.Layout(d3.select(svg), 100, 100);
        layout.row(-20);
        layout.row();
        var b1 = layout.col(-40);
        var b2 = layout.col();

        equal(svg.innerHTML, '<g transform="translate(0,80)"></g><g transform="translate(60,80)"></g>');
    });

    test('should extend d3_selection with layout properties accessor', function () {
        var svg = document.createElement('svg');
        var layout = new tau.svg.Layout(d3.select(svg), 100, 100);
        layout.row(20);
        var box = layout.col(40);

        equal(box.layout('width'), 40);
        equal(box.layout('height'), 20);
    });

    test('should return non-zero width and height for stretched elements', function () {
        var svg = document.createElement('svg');
        var layout = new tau.svg.Layout(d3.select(svg), 100, 100);
        layout.row(20);
        layout.row();
        layout.col(40);
        var box = layout.col();

        equal(box.layout('width'), 60);
        equal(box.layout('height'), 80);
    });

    test('should guess dimensions when create layout inside layout', function () {
        var svg = document.createElement('svg');
        var layout1 = new tau.svg.Layout(d3.select(svg), 100, 100);
        layout1.row();
        layout1.col();

        var layout2 = new tau.svg.Layout(layout1.col());
        layout2.row();
        var box = layout2.col();

        equal(box.layout('width'), 100);
        equal(box.layout('height'), 100);
    });

    module('tau.svg.bringOnTop', {

    });

    test('should re-insert element to bring it on top', function () {
        var svgNode = document.createElement('svg');

        var svg = d3.select(svgNode);
        svg.append('g').attr('id', 'g1');
        svg.append('g').attr('id', 'g2');

        tau.svg.bringOnTop(svg.select('#g1'));

        equal(svgNode.innerHTML, '<g id="g2"></g><g id="g1"></g>');
    })
})();
