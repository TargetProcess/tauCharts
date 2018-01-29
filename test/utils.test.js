import {assert, expect} from 'chai';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';
import * as d3Selection from 'd3-selection';
const d3 = {
    ...d3Axis,
    ...d3Scale,
    ...d3Selection,
};
import * as utils from '../src/utils/utils';
import * as drawUtils from '../src/utils/utils-draw';
import * as domUtils from '../src/utils/utils-dom';
import * as d3 from 'd3-selection';
import {avoidTickTextCollision} from '../src/utils/d3-decorators';

    var check = function (samples) {
        samples.forEach(function (s) {
            expect(utils.niceZeroBased(s[0])).to.deep.equal(s[1]);
        });
    };

    var checkTime = function (samples) {
        var dateString = ((date) => {
            var y = date.getFullYear();
            var m = (date.getMonth() + 1);
            if (m < 10) {
                m = ('0' + m);
            }
            var d = date.getDate();
            if (d < 10) {
                d = ('0' + d);
            }
            return `${y}-${m}-${d}`;
        });
        samples.forEach(function (s) {
            var domain = s[0].map(d => new Date(d));
            var nice = utils.niceTimeDomain(domain).map(dateString);
            var expected = s[1].map(d => new Date(d)).map(dateString);
            expect(nice).to.deep.equal(expected);
        });
    };

    describe('utils helper', function () {

        it('should expand domain up', function () {
            var samples = [
                [[0, 0.096], [0, 0.1]],
                [[0, 99]   , [0, 100]],
                [[0, 9]    , [0, 9]],
                [[0, 5e-324], [0, 0.1]]
            ];

            check(samples);
        });

        it('should expand domain down', function () {
            var samples = [
                [[-0.099, 0.092], [-0.1, 0.1]],
                [[-16, 99]      , [-20, 100]],
                [[-1, 9]        , [-1, 9]]
            ];

            check(samples);
        });

        it('should add 0 by default for positive numbers', function () {
            var samples = [
                [[0.01, 0.096], [0, 0.1]],
                [[10, 99]     , [0, 100]],
                [[2, 9]       , [0, 9]]
            ];

            check(samples);
        });

        it('should add 0 by default for negative numbers', function () {
            var samples = [
                [[-0.01, -0.096], [-0.1, 0]],
                [[-10, -99]     , [-100, 0]],
                [[-2, -9]       , [-9, 0]]
            ];

            check(samples);
        });

        it('should nice domain', function () {
            var samples = [
                [[1, 2, 20, 40   ], [0, 40]],
                [[20, 23, 45, 155], [0, 160]],
                [[3], [0, 3.5]],
                [[0], [0, 0.1]],
                [[-3], [-3, 0]],
                [[-39, -10], [-40, 0]]
            ];

            check(samples);
        });

        it('should nice time domain', function () {
            var samples = [
                [['2000-01-01', '2012-01-01'], ['2000-01-01', '2012-01-01']],
                [['2004-09-03', '2012-03-01'], ['2004-09-03', '2012-03-01']],
                [['2004-03-01', '2012-09-01'], ['2004-01-01', '2013-01-01']],
                [['2012-09-03', '2012-09-03'], ['2012-09-02', '2012-09-04']]
            ];
            checkTime(samples);
        });

        var createLiveSpec = function (padding) {
            return {
                getSpec: function () {
                    return {
                        sources: {
                            '/': {
                                data: [
                                    {x1: 'a1', 'x2': 'b1'},
                                    {x1: 'a1', 'x2': 'b2'},
                                    {x1: 'a1', 'x2': 'b3'},
                                    {x1: 'a1', 'x2': 'b4'},

                                    {x1: 'a2', 'x2': 'b1'}
                                ]
                            }
                        },
                        unit: {
                            units: [
                                {
                                    guide: {padding: padding}
                                }
                            ]
                        }
                    };
                }
            };
        };

        it('should allow to create ratio function for level 2 facet (no inner padding)', function () {
            var fx = utils.generateRatioFunction(
                'x',
                ['x1', 'x2'],
                createLiveSpec());

            expect(fx('a1', 100, ['a1', 'a2'])).to.equal(0.8);
            expect(fx('a2', 100, ['a1', 'a2'])).to.equal(0.2);

            var fy = utils.generateRatioFunction(
                'y',
                ['x1', 'x2'],
                createLiveSpec({l: 0, r: 0, t: 0, b: 0}));

            expect(fy('a1', 100, ['a1', 'a2'])).to.equal(0.8);
            expect(fy('a2', 100, ['a1', 'a2'])).to.equal(0.2);
        });

        it('should allow to create ratio function for level 2 facet (inner padding)', function () {
            var fx = utils.generateRatioFunction(
                'x',
                ['x1', 'x2'],
                createLiveSpec({l: 10, r: 10, t: 0, b: 0}));

            expect(fx('a1', 100, ['a1', 'a2'])).to.equal(0.68);
            expect(fx('a2', 100, ['a1', 'a2'])).to.equal(0.32);

            var fy = utils.generateRatioFunction(
                'y',
                ['x1', 'x2'],
                createLiveSpec({l: 0, r: 0, t: 10, b: 10}));

            expect(fy('a1', 100, ['a1', 'a2'])).to.equal(0.68);
            expect(fy('a2', 100, ['a1', 'a2'])).to.equal(0.32);
        });
    });

    describe('utils-draw', function() {
        it('should support isIntersect method', function() {
            var x0 = drawUtils.isIntersect(
                0, 0, 1, 1,
                1, 0, 2, 1
            );

            expect(x0).to.equal(false);

            var x1 = drawUtils.isIntersect(
                0, 0, 1, 1,
                1, 0, 0, 1
            );

            expect(x1).to.equal(true);
        });
    });

    describe('utils.splitEvenly()', function() {

        it('should split source domain to chunks', function() {
            var x0 = utils.splitEvenly([0, 100], 5);
            expect(x0).to.deep.equal([0, 25, 50, 75, 100]);

            var x1 = utils.splitEvenly([0, 100], 3);
            expect(x1).to.deep.equal([0, 50, 100]);

            var x2 = utils.splitEvenly([-100, 100], 3);
            expect(x2).to.deep.equal([-100, 0, 100]);

            var x3 = utils.splitEvenly([-100, 100], 5);
            expect(x3).to.deep.equal([-100, -50, 0, 50, 100]);

            var x4 = utils.splitEvenly([-100, 100], 0);
            expect(x4).to.deep.equal([-100, 100]);
        });
    });

    describe('utils.extRGBColor()', function() {

        it('should extract color if value starts from # or "rgb(" or "rgba("', function() {
            expect(utils.extRGBColor('')).to.equal('');
            expect(utils.extRGBColor('#000000')).to.equal('#000000');
            expect(utils.extRGBColor('rgb(0,0,0)')).to.equal('rgb(0,0,0)');
            expect(utils.extRGBColor('rgba(0,0,0,1)')).to.equal('rgba(0,0,0,1)');
            expect(utils.extRGBColor('rgbaL(0,0,0,1)')).to.equal('');
        });
    });

    describe('utils.extCSSClass()', function() {

        it('should extract color if value starts from # or "rgb(" or "rgba("', function() {
            expect(utils.extCSSClass('')).to.equal('');
            expect(utils.extCSSClass('#000000')).to.equal('');
            expect(utils.extCSSClass('rgb(0,0,0)')).to.equal('');
            expect(utils.extCSSClass('rgba(0,0,0,1)')).to.equal('');

            expect(utils.extCSSClass('rgbaL(0,0,0,1)')).to.equal('rgbaL(0,0,0,1)', 'returns any invalid stuff');
            expect(utils.extCSSClass('zzz')).to.equal('zzz');
        });
    });

    describe('d3 decorators', function() {

        var svgNode;
        var div;

        beforeEach(function () {

            div = document.createElement('div');
            document.body.appendChild(div);

            svgNode = d3
                .select(div)
                .append('svg')
                .attr('width', 100)
                .attr('height', 100);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('should support `avoidTickTextCollision` method', function() {

            var domain = [
                'Too long name for the ordinal axis 0',
                'Too long name for the ordinal axis 1',
                'Too long name for the ordinal axis 3',
                'Too long name for the ordinal axis 4'
            ];

            var scale = d3.scalePoint().domain(domain).range([0, 100]).padding(0.5);

            var axis = d3.axisBottom()
                .scale(scale);

            var d3Axis = svgNode.append('g').call(axis);

            var ticks = d3Axis.selectAll('.tick');
            d3Axis.select('.tick text').attr('transform', 'rotate(270)');
            var actBefore = [];
            ticks.each(function () {
                var d3Tick = d3.select(this);
                actBefore.push(d3Tick.selectAll('text').attr('y'));
            });
            expect(ticks.size()).to.equal(domain.length, 'Ticks created');
            expect(actBefore).to.deep.equal(['9', '9', '9', '9'], 'text y before decorator');

            avoidTickTextCollision(ticks, true);

            var actAfter = [];
            var lineAfter = [];
            ticks.each(function () {
                var d3Tick = d3.select(this);
                actAfter.push(d3Tick.selectAll('text').attr('transform'));
                var lineRef = d3Tick.selectAll('.label-ref');
                lineAfter.push([
                    lineRef.attr('y1'),
                    lineRef.attr('y2')
                ]);
            });
            expect(ticks.size()).to.equal(domain.length, 'Ticks created');
            expect(actAfter).to.deep.equal([
                'translate(0,-11) rotate(270)',
                'translate(0,0) rotate(0)',
                'translate(0,11) rotate(0)',
                'translate(0,-11) rotate(0)'
            ], 'text transform after decorator');
            expect(lineAfter).to.deep.equal([
                ['-3', '-10'],
                ['8', '-10'],
                ['19', '-10'],
                ['-3', '-10']
            ], 'text y after decorator');
        });
    });

    describe('utils-dom', function () {
        var node = document.createElement('div');
        node.innerHTML = [
            '<span class="x" id="x">',
            '  <a class="y" id="y"></a>',
            '  <a class="z"></a>',
            '</span>',
            '<a class="z" id="z1"></a>',
            '<a class="z" id="z2"></a>'
        ].join('\n');

        it('should select immediate child or create new', function () {
            var n0 = node.querySelector('#x');
            var n1 = domUtils.selectOrAppend(node, 'span#x.x');
            expect(n1).to.equal(n0);
            n1 = domUtils.selectOrAppend(d3.select(node), 'span#x.x').node();
            expect(n1).to.equal(n0);

            var n2 = domUtils.selectOrAppend(d3.select(node), 'a.y').node();
            expect(n2.id).to.equal('');
            expect(n2.getAttribute('class')).to.equal('y');
            expect(n2.tagName).to.equal('A');

            var n3 = domUtils.selectOrAppend(n2, 'p#p1.p2');
            expect(n3.id).to.equal('p1');
            expect(n3.getAttribute('class')).to.equal('p2');
            expect(n3.tagName).to.equal('P');

            var n4 = domUtils.selectAllImmediate(node, '.z');
            expect(n4.length).to.equal(2);
            expect(n4[0].id).to.equal('z1');
            expect(n4[1].id).to.equal('z2');

            var n5 = domUtils.selectImmediate(node, '.z');
            expect(n5.id).to.equal('z1');

            expect(function () {
                domUtils.selectOrAppend(d3.select(node), '.x');
            }).to.throw(/Selector must have tag at the beginning/);

            expect(function () {
                domUtils.selectOrAppend(d3.select(node), '.x .y');
            }).to.throw(/Selector should not contain whitespaces/);
        });

        it('should create class name', function () {
            var classes = domUtils.classes('x', null, {y: true, z: false}, 'a  b ');
            expect(classes).to.equal('x y a b');
        });
    });
