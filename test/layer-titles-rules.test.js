define(function (require) {
    var expect = require('chai').expect;
    var LayerLabelsModel = require('src/elements/decorators/layer-labels-model').LayerLabelsModel;
    var LayerLabelsRules = require('src/elements/decorators/layer-labels-rules').LayerLabelsRules;

    describe('LayerLabelsRules', function () {

        var fontSize = 10;
        var borderPad = 2;
        var seedModel;
        var createModel = (rules, seed, args = {}) => {
            return rules
                .map(LayerLabelsRules.getRule)
                .reduce((prev, rule) => LayerLabelsModel.compose(prev, rule(prev, args)), seed);
        };

        beforeEach(function () {

            var gogModel = {
                xi: (row) => 100,
                yi: (row) => 100,
                y0: (row) => 105,
                size: (row) => 10,
                label: (row) => row.text,
                scaleY: {
                    discrete: false,
                    dim: 'y'
                }
            };

            seedModel = LayerLabelsModel.seed(
                gogModel,
                {
                    fontColor: '#000',
                    flip: false,
                    formatter: ((str) => String(str)),
                    labelRectSize: ((str) => {
                        return {width: str.length * 2, height: fontSize};
                    })
                });
        });

        it('should be centered by default', function () {
            var r = {text: 'text'};
            var m = createModel([], seedModel);
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.dx(r)).to.equal(0, 'dx');
            expect(m.y(r)).to.equal(100, 'y');
            expect(m.dy(r)).to.equal(fontSize / 2, 'dy');
        });

        it('should support [t] as top', function () {
            var r = {text: 'text'};
            var m = createModel(['t'], seedModel);
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.y(r)).to.equal(100, 'y');
            expect(m.dy(r)).to.equal(0, 'dy');
        });

        it('should support [t+] as top for positive ordinate value', function () {
            var m = createModel(['t+'], seedModel);
            var pos = {y:10};
            expect(m.y(pos)).to.equal(100, 'pos y');
            expect(m.dy(pos)).to.equal(0, 'pos dy');

            var zero = {y: 0};
            expect(m.y(zero)).to.equal(100, 'zero y');
            expect(m.dy(zero)).to.equal(0, 'zero dy');

            var neg = {y:-1};
            expect(m.y(neg)).to.equal(100, 'neg y');
            expect(m.dy(neg)).to.equal(5, 'neg dy');
        });

        it('should support [t-] as top for negative ordinate value', function () {
            var m = createModel(['t-'], seedModel);
            var pos = {y:10};
            expect(m.y(pos)).to.equal(100, 'pos x');
            expect(m.dy(pos)).to.equal(5, 'pos dx');

            var zero = {y: 0};
            expect(m.y(zero)).to.equal(100, 'zero y');
            expect(m.dy(zero)).to.equal(5, 'zero dy');

            var neg = {y:-1};
            expect(m.y(neg)).to.equal(100, 'neg y');
            expect(m.dy(neg)).to.equal(0, 'neg dy');
        });

        it('should support [T] as top with radius', function () {
            var r = {text: 'text'};
            var m = createModel(['T'], seedModel);
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.dx(r)).to.equal(0, 'dx');
            expect(m.y(r)).to.equal(100, 'y');
            expect(m.dy(r)).to.equal(-5, 'dy');
        });

        it('should support [b] as bottom', function () {
            var r = {text: 'text'};
            var m = createModel(['b'], seedModel);
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.dx(r)).to.equal(0, 'dx');
            expect(m.y(r)).to.equal(100, 'y');
            expect(m.dy(r)).to.equal(fontSize, 'dy'); // no border padding for vertical alignment
        });

        it('should support [l] as left', function () {
            var m = createModel(['l'], seedModel);
            var r = {text:'ABCDE'};
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.dx(r)).to.equal(-5 - borderPad, 'dx');
            expect(m.y(r)).to.equal(100);
            expect(m.dy(r)).to.equal(fontSize / 2);
        });

        it('should support [l+] as left for positive ordinate value', function () {
            var m = createModel(['l+'], seedModel);
            var s = 'ABCDE';
            var pos = {text: s, y: 1};
            expect(m.x(pos)).to.equal(100, 'pos x');
            expect(m.dx(pos)).to.equal(-5 - borderPad, 'pos dx');

            var zero = {text: s, y: 0};
            expect(m.x(zero)).to.equal(100, 'zero x');
            expect(m.dx(zero)).to.equal(-5 - borderPad, 'zero dx');

            var neg = {text: s, y:-1};
            expect(m.x(neg)).to.equal(100, 'neg x');
            expect(m.dx(neg)).to.equal(0, 'neg dx');
        });

        it('should support [l-] as left for negative ordinate value', function () {
            var m = createModel(['l-'], seedModel);
            var s = 'ABCDE';

            var pos = {text: s, y: 1};
            expect(m.x(pos)).to.equal(100, 'pos x');
            expect(m.dx(pos)).to.equal(0, 'pos dx');

            var zero = {text: s, y: 0};
            expect(m.x(zero)).to.equal(100, 'zero x');
            expect(m.dx(zero)).to.equal(0, 'zero dx');

            var neg = {text: s, y:-1};
            expect(m.x(neg)).to.equal(100, 'neg x');
            expect(m.dx(neg)).to.equal(-5 - borderPad, 'neg dx');
        });

        it('should support [L] as left with radius', function () {
            var m = createModel(['L'], seedModel);
            var r = {text:'ABCDE'};
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.dx(r)).to.equal(-2 * 5 - borderPad, 'dx');
            expect(m.y(r)).to.equal(100, 'y');
            expect(m.dy(r)).to.equal(fontSize / 2, 'dy');
        });

        it('should support [L+] as left with radius for positive value', function () {
            var m = createModel(['L+'], seedModel);
            var posRow = {text:'ABCDE', x: 1, y: 1};
            expect(m.x(posRow)).to.equal(100, 'x+');
            expect(m.dx(posRow)).to.equal(-2 * 5 - borderPad, 'dx+');
            expect(m.y(posRow)).to.equal(100, 'y+');
            expect(m.dy(posRow)).to.equal(fontSize / 2, 'dy+');

            var negRow = {text:'ABCDE', x: -1, y: -1};
            expect(m.x(negRow)).to.equal(100, 'x-');
            expect(m.dx(negRow)).to.equal(0, 'dx-');
            expect(m.y(negRow)).to.equal(100, 'y-');
            expect(m.dy(negRow)).to.equal(fontSize / 2, 'dy-');
        });

        it('should support [r] as right', function () {
            var m = createModel(['r'], seedModel);
            var r = {text:'ABCDE'};
            expect(m.x(r)).to.equal(100, 'x');
            expect(m.dx(r)).to.equal(5 + borderPad, 'dx');
            expect(m.y(r)).to.equal(100, 'y');
            expect(m.dy(r)).to.equal(fontSize / 2, 'dy');
        });

        it('should support [keep-within-diameter-or-top] rule', function () {
            var m = createModel(['keep-within-diameter-or-top'], seedModel);
            var s = 'ABCDEFGH';
            var long = {text: s};
            expect(m.x(long)).to.equal(100, 'x');
            expect(m.y(long)).to.equal(100, 'should be on top / y');
            expect(m.dy(long)).to.equal(- fontSize / 2, 'should be on top / dy');

            var short = {text: 'A'};
            expect(m.x(short)).to.equal(100, 'x');
            expect(m.y(short)).to.equal(100, 'should be centered / y');
            expect(m.dy(short)).to.equal(fontSize / 2, 'should be centered / dy');
        });

        it('should support [keep-in-box] rule', function () {
            var m = createModel(['keep-in-box'], seedModel, {maxWidth: 100, maxHeight: 90});
            var s = 'ABCDE';
            var row = {text: s};
            expect(m.x(row)).to.equal(100, 'should move left to fit box / x');
            expect(m.dx(row)).to.equal(-5, 'should move left to fit box / dx');
            expect(m.y(row)).to.equal(100, 'should move top to fit box / y');
            expect(m.dy(row)).to.equal(90 - 100 - fontSize / 2, 'should move top to fit box / dy');
        });

        it('should support [keep-inside-or-hide-vertical] rule (by width)', function () {

            var gogModel = {
                xi: (row) => 100,
                yi: (row) => 100,
                y0: (row) => 125,
                size: (row) => 10,
                label: (row) => row.text,
                scaleY: {
                    discrete: false,
                    dim: 'y'
                }
            };

            seedModel = LayerLabelsModel.seed(
                gogModel,
                {
                    fontColor: '#000',
                    flip: false,
                    formatter: ((str) => String(str)),
                    labelRectSize: ((str) => {
                        return {width: str.length * 2, height: fontSize};
                    })
                });

            var m = createModel(['keep-inside-or-hide-vertical'], seedModel);
            var row4 = {text: 'ABCD'};
            expect(m.w(row4)).to.equal(8, 'text width');
            expect(m.model.size(row4)).to.equal(10, 'element width');
            expect(m.hide(row4)).to.equal(false, 'show');

            var row10 = {text: 'ABCDEFGHJK'};
            expect(m.w(row10)).to.equal(20, 'text width');
            expect(m.model.size(row10)).to.equal(10, 'element width');
            expect(m.hide(row10)).to.equal(true, 'hide');
        });

        it('should support [keep-inside-or-hide-vertical] rule (by height)', function () {

            var gogModel = {
                xi: (row) => 100,
                yi: (row) => 100,
                y0: (row) => 105,
                size: (row) => 10,
                label: (row) => row.text,
                scaleY: {
                    discrete: false,
                    dim: 'y'
                }
            };

            seedModel = LayerLabelsModel.seed(
                gogModel,
                {
                    fontColor: '#000',
                    flip: false,
                    formatter: ((str) => String(str)),
                    labelRectSize: ((str) => {
                        return {width: str.length * 2, height: fontSize};
                    })
                });

            var m = createModel(['keep-inside-or-hide-vertical'], seedModel);
            var row4 = {text: 'A'};
            expect(m.w(row4)).to.equal(2, 'text width');
            expect(m.model.size(row4)).to.equal(10, 'element width');
            expect(m.hide(row4)).to.equal(true, 'hide since not fit an element height');
        });

        it('should support [keep-inside-or-hide-horizontal] rule (by height)', function () {

            var gogModel = {
                xi: (row) => 100,
                yi: (row) => 100,
                y0: (row) => 125,
                size: (row) => 4,
                label: (row) => row.text,
                scaleY: {
                    discrete: false,
                    dim: 'y'
                }
            };

            seedModel = LayerLabelsModel.seed(
                gogModel,
                {
                    fontColor: '#000',
                    flip: true,
                    formatter: ((str) => String(str)),
                    labelRectSize: ((str) => {
                        return {width: str.length * 2, height: fontSize};
                    })
                });

            var m = createModel(['keep-inside-or-hide-horizontal'], seedModel);
            var row4 = {text: 'A'};
            expect(m.h(row4)).to.equal(fontSize, 'text width');
            expect(m.model.size(row4)).to.equal(4, 'element width');
            expect(m.hide(row4)).to.equal(true, 'hide since not fit an element height');
        });

        it('should support [keep-inside-or-hide-horizontal] rule (by width)', function () {

            var gogModel = {
                xi: (row) => 100,
                yi: (row) => 100,
                y0: (row) => 105,
                size: (row) => 10,
                label: (row) => row.text,
                scaleY: {
                    discrete: false,
                    dim: 'y'
                }
            };

            seedModel = LayerLabelsModel.seed(
                gogModel,
                {
                    fontColor: '#000',
                    flip: true,
                    formatter: ((str) => String(str)),
                    labelRectSize: ((str) => {
                        return {width: str.length * 2, height: fontSize};
                    })
                });

            var m = createModel(['keep-inside-or-hide-horizontal'], seedModel);
            var row1 = {text: 'A'};
            expect(m.h(row1)).to.equal(fontSize, 'text width');
            expect(m.model.size(row1)).to.equal(10, 'element width');
            expect(m.hide(row1)).to.equal(false, 'hide since not fit an element height');

            var row10 = {text: 'ABCDEFGHJK'};
            expect(m.w(row10)).to.equal(20, 'text width');
            expect(m.hide(row10)).to.equal(true, 'hide');
        });
    });
});