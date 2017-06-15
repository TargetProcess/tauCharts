import {assert} from 'chai';
import tauCharts from '../src/tau.charts';
import BarAsSpanPlugin from '../plugins/bar-as-span';

import testUtils from './utils/utils';
const {noScrollStyle} = testUtils;

    describe('Bar as Span plugin', function () {

        var container;
        beforeEach(function () {
            noScrollStyle.create();
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            container.setAttribute('data-chart-id', 'Bar as Span plugin');
            document.body.appendChild(container);
        });
        afterEach(function () {
            document.body.removeChild(container);
            noScrollStyle.remove();
        });

        it('should place spans correct', function () {

            var chart = new tauCharts.Chart({
                type: 'horizontal-bar',
                x: 'end',
                y: ['team', 'type'],
                color: 'type',
                label: 'name',
                plugins: [
                    BarAsSpanPlugin({
                        x0: 'start'
                    })
                ],
                dimensions: {
                    'start': {
                        type: 'measure',
                        scale: 'time'
                    },
                    'end': {
                        type: 'measure',
                        scale: 'time'
                    },
                    'type': {
                        type: 'category',
                        scale: 'ordinal'
                    },
                    'team': {
                        type: 'category',
                        scale: 'ordinal'
                    }
                },
                data: [
                    {start: '2015-05-01', end: '2015-06-01', type: 'Bug', name: 'Broken tabs layout', team: 'Developers'},
                    {start: '2015-05-10', end: '2015-06-20', type: 'Feature', name: 'Payment form', team: 'Developers'},
                    {start: '2015-05-20', end: '2015-05-30', type: 'Feature', name: 'Scroll bar', team: 'Developers'},
                    {start: '2015-06-10', end: '2015-06-15', type: 'Bug', name: 'Modal dialog collapsed', team: 'Developers'},
                    {start: '2015-05-20', end: '2015-05-25', type: 'Sale', name: 'Tractors', team: 'Sales'},
                    {start: '2015-05-25', end: '2015-05-30', type: 'Sale', name: 'Nails', team: 'Sales'},
                    {start: '2015-05-26', end: '2015-06-01', type: 'Sale', name: 'Oil', team: 'Sales'}
                ].map(function (d) {
                    d.start = new Date(d.start);
                    d.end = new Date(d.end)
                    return d;
                })
            });

            chart.renderTo(container);
            var svg = chart.getSVG();

            // Note: Approximately check layout.

            var spans = Array.from(svg.querySelectorAll('.bar'));
            var labels = Array.from(svg.querySelectorAll('.i-role-label'));

            var facets = [
                [
                    ['Broken tabs layout', 'Modal dialog collapsed'],
                    ['Payment form'],
                    ['Scroll bar']
                ],
                [
                    ['Tractors', 'Nails'],
                    ['Oil']
                ]
            ];

            var spanMap = spans.reduce((map, node) => {
                var s = d3.select(node);
                var name = s.data()[0].name;
                map[name] = {
                    x: parseFloat(s.attr('x')),
                    y: parseFloat(s.attr('y')),
                };
                return map;
            }, {});

            var parseTranslate = (t) => t.split(/\(|\,|\)/g).slice(1, 3).map(parseFloat);
            var labelMap = labels.reduce((map, node) => {
                var s = d3.select(node);
                var name = s.data()[0].name;
                var t = parseTranslate(s.attr('transform'));
                map[name] = {
                    x: t[0],
                    y: t[1],
                };
                return map;
            }, {});

            facets.forEach(function (grid) {
                grid.forEach(function (row, i) {
                    var firstCell = row[0];
                    assert.equal(row.every((cell) => spanMap[cell].y === spanMap[firstCell].y), true, 'all spans at row have equal Y');
                    assert.equal(row.every((cell) => labelMap[cell].y === labelMap[firstCell].y), true, 'all labels at row have equal Y');
                    assert.equal(row.slice(1).every((cell, i) => {
                        return (spanMap[cell].x > spanMap[firstCell].x);
                    }), true, 'next span at row has larger X');
                    assert.equal(row.slice(1).every((cell, i) => {
                        return (labelMap[cell].x > labelMap[firstCell].x);
                    }), true, 'next label at row has larger X');
                    if (i > 0) {
                        var prevRowCell = grid[i - 1][0];
                        assert.equal(spanMap[firstCell].y > spanMap[prevRowCell].y, true, 'next row span Y is greater than prev row Y');
                        assert.equal(labelMap[firstCell].y > labelMap[prevRowCell].y, true, 'next row label Y is greater than prev row Y');
                    }
                });
            });

        });

        it('should place spans correct (vertical)', function () {

            // Todo: Horizontall timeline is useless, write normal test when Waterfall chart will be finished.
            var chart = new tauCharts.Chart({
                type: 'bar',
                y: 'end',
                x: ['team', 'type'],
                color: 'type',
                label: 'name',
                plugins: [
                    BarAsSpanPlugin({
                        y0: 'start'
                    })
                ],
                dimensions: {
                    'start': {
                        type: 'measure',
                        scale: 'time'
                    },
                    'end': {
                        type: 'measure',
                        scale: 'time'
                    },
                    'type': {
                        type: 'category',
                        scale: 'ordinal'
                    },
                    'team': {
                        type: 'category',
                        scale: 'ordinal'
                    }
                },
                data: [
                    {start: '2015-05-01', end: '2015-06-01', type: 'Bug', name: 'Broken tabs layout', team: 'Developers'},
                    {start: '2015-05-10', end: '2015-06-20', type: 'Feature', name: 'Payment form', team: 'Developers'},
                    {start: '2015-05-20', end: '2015-05-30', type: 'Feature', name: 'Scroll bar', team: 'Developers'},
                    {start: '2015-06-10', end: '2015-06-15', type: 'Bug', name: 'Modal dialog collapsed', team: 'Developers'},
                    {start: '2015-05-20', end: '2015-05-25', type: 'Sale', name: 'Tractors', team: 'Sales'},
                    {start: '2015-05-25', end: '2015-05-30', type: 'Sale', name: 'Nails', team: 'Sales'},
                    {start: '2015-05-26', end: '2015-06-01', type: 'Sale', name: 'Oil', team: 'Sales'}
                ].map(function (d) {
                    d.start = new Date(d.start);
                    d.end = new Date(d.end)
                    return d;
                    })
            });

            chart.renderTo(container);
            var svg = chart.getSVG();

            // Note: Approximately check layout.

            var spans = Array.from(svg.querySelectorAll('.bar'));

            spans.slice(1).forEach((node, i) => {
                var s = d3.select(node);
                var p = d3.select(spans[i]);
                assert.equal(
                    Math.sign(s.data()[0].start - p.data()[0].start),
                    -Math.sign(s.node().getBoundingClientRect().bottom - p.node().getBoundingClientRect().bottom),
                    'span screen start correspods to data start'
                );
            })

        });

        it('should place spans correct (no collapse)', function () {

            var chart = new tauCharts.Chart({
                type: 'horizontal-bar',
                x: 'end',
                y: ['team', 'type'],
                color: 'type',
                label: 'name',
                plugins: [
                    BarAsSpanPlugin({
                        x0: 'start',
                        collapse: false
                    })
                ],
                dimensions: {
                    'start': {
                        type: 'measure',
                        scale: 'time'
                    },
                    'end': {
                        type: 'measure',
                        scale: 'time'
                    },
                    'type': {
                        type: 'category',
                        scale: 'ordinal'
                    },
                    'team': {
                        type: 'category',
                        scale: 'ordinal'
                    }
                },
                data: [
                    {start: '2015-05-01', end: '2015-06-01', type: 'Bug', name: 'Broken tabs layout', team: 'Developers'},
                    {start: '2015-05-10', end: '2015-06-20', type: 'Feature', name: 'Payment form', team: 'Developers'},
                    {start: '2015-05-20', end: '2015-05-30', type: 'Feature', name: 'Scroll bar', team: 'Developers'},
                    {start: '2015-06-10', end: '2015-06-15', type: 'Bug', name: 'Modal dialog collapsed', team: 'Developers'},
                    {start: '2015-05-20', end: '2015-05-25', type: 'Sale', name: 'Tractors', team: 'Sales'},
                    {start: '2015-05-25', end: '2015-05-30', type: 'Sale', name: 'Nails', team: 'Sales'},
                    {start: '2015-05-26', end: '2015-06-01', type: 'Sale', name: 'Oil', team: 'Sales'}
                ].map(function (d) {
                    d.start = new Date(d.start);
                    d.end = new Date(d.end)
                    return d;
                })
            });

            chart.renderTo(container);
            var svg = chart.getSVG();

            // Note: Approximately check layout.

            var spans = Array.from(svg.querySelectorAll('.bar'));

            var groups = spans.reduce((map, node) => {
                var s = d3.select(node);
                var name = s.data()[0].name;
                map[name] = (map[name] || []);
                map[name].push(s);
                return map;
            }, {});

            Object.keys(groups).forEach((key) => {
                var group = groups[key];
                group.sort((a, b) => a.data()[0].start - b.data()[0].start);
                assert.equal(group.slice(1).every((node, i) => {
                    var s = d3.select(node);
                    var p = d3.select(group[i]);
                    return (
                        Number(s.attr('x')) > Number(p.attr('x')) &&
                        Number(s.attr('y')) > Number(p.attr('y'))
                    );
                }), true, 'every next date is aligned bottom-right from previous');
            });

        });
    });
