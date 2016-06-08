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
            expect(m.y(r)).to.equal(100 + fontSize / 2, 'y');
        });

        it('should support [t] as top', function () {
            var r = {text: 'text'};
            var m = createModel(['t'], seedModel);
            expect(m.x(r)).to.equal(100);
            expect(m.y(r)).to.equal(100 - borderPad);
        });

        it('should support [t+] as top for positive ordinate value', function () {
            var m = createModel(['t+'], seedModel);
            expect(m.y({y:10})).to.equal(100 - borderPad, 'pos');
            expect(m.y({y: 0})).to.equal(100 - borderPad, 'zero');
            expect(m.y({y:-1})).to.equal(105, 'neg');
        });

        it('should support [t-] as top for negative ordinate value', function () {
            var m = createModel(['t-'], seedModel);
            expect(m.y({y:10})).to.equal(105, 'pos');
            expect(m.y({y: 0})).to.equal(105, 'zero');
            expect(m.y({y:-1})).to.equal(100 - borderPad, 'neg');
        });

        it('should support [T] as top with radius', function () {
            var r = {text: 'text'};
            var m = createModel(['T'], seedModel);
            expect(m.x(r)).to.equal(100);
            expect(m.y(r)).to.equal(95 - borderPad);
        });

        it('should support [b] as bottom', function () {
            var r = {text: 'text'};
            var m = createModel(['b'], seedModel);
            expect(m.x(r)).to.equal(100);
            expect(m.y(r)).to.equal(100 + fontSize + borderPad);
        });

        it('should support [l] as left', function () {
            var m = createModel(['l'], seedModel);
            var r = {text:'ABCDE'};
            expect(m.x(r)).to.equal(95 - borderPad);
            expect(m.y(r)).to.equal(100 + fontSize / 2);
        });

        it('should support [l+] as left for positive ordinate value', function () {
            var m = createModel(['l+'], seedModel);
            var s = 'ABCDE';
            expect(m.x({text: s, y: 1})).to.equal(95 - borderPad, 'pos');
            expect(m.x({text: s, y: 0})).to.equal(95 - borderPad, 'zero');
            expect(m.x({text: s, y:-1})).to.equal(100, 'neg');
        });

        it('should support [l-] as left for negative ordinate value', function () {
            var m = createModel(['l-'], seedModel);
            var s = 'ABCDE';
            expect(m.x({text: s, y: 1})).to.equal(100, 'pos');
            expect(m.x({text: s, y: 0})).to.equal(100, 'zero');
            expect(m.x({text: s, y:-1})).to.equal(95 - borderPad, 'neg');
        });

        it('should support [L] as left with radius', function () {
            var m = createModel(['L'], seedModel);
            var r = {text:'ABCDE'};
            expect(m.x(r)).to.equal(90 - borderPad);
            expect(m.y(r)).to.equal(100 + fontSize / 2);
        });

        it('should support [L+] as left with radius for positive value', function () {
            var m = createModel(['L+'], seedModel);
            expect(m.x({text:'ABCDE', x: 1, y: 1})).to.equal(90 - borderPad);
            expect(m.y({text:'ABCDE', x: 1, y: 1})).to.equal(100 + fontSize / 2);

            expect(m.x({text:'ABCDE', x: -1, y: -1})).to.equal(100);
            expect(m.y({text:'ABCDE', x: -1, y: -1})).to.equal(100 + fontSize / 2);
        });

        it('should support [r] as right', function () {
            var m = createModel(['r'], seedModel);
            var r = {text:'ABCDE'};
            expect(m.x(r)).to.equal(105 + borderPad);
            expect(m.y(r)).to.equal(100 + fontSize / 2);
        });

        it('should support [keep-within-diameter-or-top] rule', function () {
            var m = createModel(['keep-within-diameter-or-top'], seedModel);
            var s = 'ABCDEFGH';
            var long = {text: s};
            expect(m.x(long)).to.equal(100);
            expect(m.y(long)).to.equal(100 - fontSize / 2, 'should be on top');

            var short = {text: 'A'};
            expect(m.x(short)).to.equal(100);
            expect(m.y(short)).to.equal(100 + fontSize / 2, 'should be centered');
        });

        it('should support [keep-in-box] rule', function () {
            var m = createModel(['keep-in-box'], seedModel, {maxWidth: 100, maxHeight: 90});
            var s = 'ABCDE';
            var row = {text: s};
            expect(m.x(row)).to.equal(95, 'should move left to fit box');
            expect(m.y(row)).to.equal(90 - fontSize / 2, 'should move top to fit box');
        });
    });
});