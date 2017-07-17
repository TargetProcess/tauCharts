import {expect} from 'chai';
import schemes from './utils/schemes';
import tauChart from '../src/tau.charts';
import testUtils from './utils/utils';
import * as d3 from 'd3-selection';

    var round = testUtils.roundNumbersInString;

    describe('Area plot chart', function () {

        var element;

        beforeEach(function () {
            element = document.createElement('div');
            document.body.appendChild(element);
        });

        afterEach(function () {
            element.parentNode.removeChild(element);
            testUtils.destroyCharts();
        });

        it('should sort data by X if there is a func relation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                color: 'color',
                data: [
                    {x: 2, y: 2, color: 'A', i:0},
                    {x: 1, y: 3, color: 'A', i:1},
                    {x: 0, y: 2, color: 'A', i:2},

                    {x: 2, y: 2, color: 'B', i:0},
                    {x: 0, y: 2, color: 'B', i:1},
                    {x: 1, y: 3, color: 'B', i:2}
                ]
            });

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A2', 'B1', 'A1', 'B2', 'A0', 'B0']);
            expect(spec.unit.units[0].type).to.equal('ELEMENT.AREA');
            expect(spec.unit.units[0].flip).to.equal(false);
        });

        it('should sort data by Y if there is a func relation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                color: 'color',
                data: [
                    {y: 2, x: 2, color: 'A', i:0},
                    {y: 1, x: 3, color: 'A', i:1},
                    {y: 0, x: 2, color: 'A', i:2},

                    {y: 2, x: 2, color: 'B', i:0},
                    {y: 0, x: 2, color: 'B', i:1},
                    {y: 1, x: 3, color: 'B', i:2}
                ]
            });

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A2', 'B1', 'A1', 'B2', 'A0', 'B0']);
            expect(spec.unit.units[0].type).to.equal('ELEMENT.AREA');
            expect(spec.unit.units[0].flip).to.equal(true);
        });

        it('should sort data by X if [flip = false]', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                color: 'color',
                flip: false,
                data: [
                    {y: 2, x: 2, color: 'A', i:0},
                    {y: 1, x: 3, color: 'A', i:1},
                    {y: 0, x: 2, color: 'A', i:2},

                    {y: 2, x: 2, color: 'B', i:0},
                    {y: 0, x: 2, color: 'B', i:1},
                    {y: 1, x: 3, color: 'B', i:2}
                ]
            });

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A2', 'B0', 'B1', 'A1', 'B2']);
            expect(spec.unit.units[0].type).to.equal('ELEMENT.AREA');
            expect(spec.unit.units[0].flip).to.equal(false);
        });

        it('should sort data by Y if [flip = true]', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                color: 'color',
                flip: true,
                data: [
                    {x: 2, y: 2, color: 'A', i:0},
                    {x: 1, y: 3, color: 'A', i:1},
                    {x: 0, y: 2, color: 'A', i:2},

                    {x: 2, y: 2, color: 'B', i:0},
                    {x: 0, y: 2, color: 'B', i:1},
                    {x: 1, y: 3, color: 'B', i:2}
                ]
            });

            var spec = area.getSpec();
            expect(spec.sources['/'].data.map((r) => `${r.color}${r.i}`))
                .to
                .deep
                .equal(['A0', 'A2', 'B0', 'B1', 'A1', 'B2']);
        });

        it('should support [stack] transformation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'x',
                y: 'y',
                stack: true,
                color: 'color',
                guide: {
                    x: {nice: false},
                    y: {nice: false},
                    color: {
                        brewer: {
                            A: 'A',
                            B: 'B'
                        }
                    }
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'none'
                },
                data: [
                    {x: 0, y: 0, color: 'A'},
                    {x: 1, y: 1, color: 'A'},
                    {x: 2, y: 2, color: 'A'},

                    {x: 0, y: 2, color: 'B'},
                    {x: 1, y: 2, color: 'B'},
                    {x: 0, y: -2, color: 'B'},
                    {x: 1, y: -2, color: 'B'}
                ]
            });

            area.renderTo(element, {width: 1000, height: 1000});

            var svgPolygons = d3.selectAll('polygon').nodes();

            expect(svgPolygons.length).to.equal(3);

            expect(testUtils.hasClass(svgPolygons[0].parentNode, 'A')).to.equal(true);
            expect(round(d3.select(svgPolygons[0]).attr('points')))
                .to
                .equal('0,600 500,400 1000,200 1000,600 500,600 0,600', 'A');

            expect(testUtils.hasClass(svgPolygons[1].parentNode, 'B')).to.equal(true);
            expect(round(d3.select(svgPolygons[1]).attr('points')))
                .to
                .equal('0,200 500,0 1000,200 1000,200 500,400 0,600', 'B positive');

            expect(testUtils.hasClass(svgPolygons[2].parentNode, 'B')).to.equal(true);
            expect(round(d3.select(svgPolygons[2]).attr('points')))
                .to
                .equal('0,1000 500,1000 1000,600 1000,600 500,600 0,600', 'B negative');

            var points = d3.selectAll('.i-data-anchor').nodes().map((node) => {
                var p = d3.select(node);
                return p.attr('d');
            });

            expect(round(points.join('\n')))
                .to
                .equal([
                    'M0,600 A0,0 0 0 1 0,600 A0,0 0 0 1 0,600 Z',
                    'M500,400 L500,600 A0,0 0 0 1 500,600 L500,400 A0,0 0 0 1 500,400 Z',
                    'M1000,200 L1000,600 A0,0 0 0 1 1000,600 L1000,200 A0,0 0 0 1 1000,200 Z',
                    'M0,200 L0,600 A0,0 0 0 1 0,600 L0,200 A0,0 0 0 1 0,200 Z',
                    'M500,0 L500,400 A0,0 0 0 1 500,400 L500,0 A0,0 0 0 1 500,0 Z',
                    'M0,1000 L0,600 A0,0 0 0 1 0,600 L0,1000 A0,0 0 0 1 0,1000 Z',
                    'M500,1000 L500,600 A0,0 0 0 1 500,600 L500,1000 A0,0 0 0 1 500,1000 Z'
                ].join('\n'));
        });

        it('should support [flip+stack] transformation', function () {
            var area = new tauChart.Chart({
                type: 'area',
                x: 'y',
                y: 'x',
                stack: true,
                flip: true,
                color: 'color',
                guide: {
                    x: {nice: false},
                    y: {nice: false},
                    color: {
                        brewer: {
                            A: 'A',
                            B: 'B'
                        }
                    }
                },
                settings: {
                    specEngine: 'none',
                    layoutEngine: 'none'
                },
                data: [
                    {x: 0, y: 0, color: 'A'},
                    {x: 1, y: 1, color: 'A'},
                    {x: 2, y: 2, color: 'A'},

                    {x: 0, y: 2, color: 'B'},
                    {x: 1, y: 2, color: 'B'},
                    {x: 0, y: -2, color: 'B'},
                    {x: 1, y: -2, color: 'B'}
                ]
            });

            area.renderTo(element, {width: 1000, height: 1000});

            var svgPolygons = d3.selectAll('polygon').nodes();

            expect(svgPolygons.length).to.equal(3);

            expect(testUtils.hasClass(svgPolygons[0].parentNode, 'A')).to.equal(true, 'A');
            expect(round(d3.select(svgPolygons[0]).attr('points')))
                .to
                .equal('400,1000 600,500 800,0 400,0 400,500 400,1000', 'A');

            expect(testUtils.hasClass(svgPolygons[1].parentNode, 'B')).to.equal(true, 'B negative');
            expect(round(d3.select(svgPolygons[1]).attr('points')))
                .to
                .equal('800,1000 1000,500 800,0 800,0 600,500 400,1000', 'B negative');

            expect(testUtils.hasClass(svgPolygons[2].parentNode, 'B')).to.equal(true, 'B pos');
            expect(round(d3.select(svgPolygons[2]).attr('points')))
                .to
                .equal('0,1000 0,500 400,0 400,0 400,500 400,1000', 'B positive');

            var points = d3.selectAll('.i-data-anchor').nodes().map((node) => {
                var p = d3.select(node);
                return p.attr('d');
            });

            expect(points.join('\n'))
                .to
                .equal([
                    'M400,1000 A0,0 0 0 1 400,1000 A0,0 0 0 1 400,1000 Z',
                    'M600,500 L400,500 A0,0 0 0 1 400,500 L600,500 A0,0 0 0 1 600,500 Z',
                    'M800,0 L400,0 A0,0 0 0 1 400,0 L800,0 A0,0 0 0 1 800,0 Z',
                    'M800,1000 L400,1000 A0,0 0 0 1 400,1000 L800,1000 A0,0 0 0 1 800,1000 Z',
                    'M1000,500 L600,500 A0,0 0 0 1 600,500 L1000,500 A0,0 0 0 1 1000,500 Z',
                    'M0,1000 L400,1000 A0,0 0 0 1 400,1000 L0,1000 A0,0 0 0 1 0,1000 Z',
                    'M0,500 L400,500 A0,0 0 0 1 400,500 L0,500 A0,0 0 0 1 0,500 Z'
                ].join('\n'));
        });
    });
