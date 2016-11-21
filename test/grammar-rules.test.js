define(function (require) {

    var expect = require('chai').expect;
    var GrammarRegistry = require('src/grammar-registry').GrammarRegistry;
    var SizeScale = require('src/scales/size').SizeScale;
    var LinearScale = require('src/scales/linear').LinearScale;
    var OrdinalScale = require('src/scales/ordinal').OrdinalScale;

    describe('Grammar', function () {

        var data = [
            {x: 0.0, y: 0, s: 1, x_ordinal: 'A'},
            {x: 0.5, y: 50, s: 0, x_ordinal: 'B'},
            {x: 1.0, y: 100, s: 1, x_ordinal: 'C'}
        ];

        var xSrc = {
            part: function () {
                return data;
            },
            full: function () {
                return data;
            }
        };

        it('should support avoidBaseScaleOverflow rule (continues scale)', function () {
            var xConfig = {dim: 'x'};
            var sConfig = {dim: 's', minSize: 1, maxSize: 40};
            var model = {
                scaleX: new LinearScale(xSrc, xConfig).create([0, 100]),
                scaleSize: new SizeScale(xSrc, sConfig).create(),
                xi: (row) => model.scaleX.value(row[model.scaleX.dim]),
                data: (() => data)
            };

            GrammarRegistry.get('avoidBaseScaleOverflow')(model);

            model.scaleX.commit();
            model.scaleSize.commit();

            expect(xConfig.min).to.equal(-0.2);
            expect(xConfig.max).to.equal(1.2);
            expect(sConfig.minSize).to.equal(1);
            expect(sConfig.maxSize).to.equal(23);
        });

        it('should ignore avoidBaseScaleOverflow rule for ordinal scale', function () {
            var xConfig = {dim: 'x_ordinal'};
            var xConfigOriginal = JSON.stringify(xConfig);
            var sConfig = {dim: 's', minSize: 1, maxSize: 40};
            var sConfigOriginal = JSON.stringify(sConfig);
            var model = {
                scaleX: new OrdinalScale(xSrc, xConfig).create([0, 100]),
                scaleSize: new SizeScale(xSrc, sConfig).create(),
                xi: (row) => model.scaleX.value(row[model.scaleX.dim]),
                data: (() => data)
            };

            GrammarRegistry.get('avoidBaseScaleOverflow')(model);

            model.scaleX.commit();
            model.scaleSize.commit();

            expect(JSON.stringify(xConfig)).to.equal(xConfigOriginal);
            expect(JSON.stringify(sConfig)).to.equal(sConfigOriginal);
        });

        it('should ignore avoidBaseScaleOverflow rule when max size is less than 10', function () {
            var xConfig = {dim: 'x'};
            var xConfigOriginal = JSON.stringify(xConfig);
            var sConfig = {dim: 's', minSize: 1, maxSize: 10};
            var sConfigOriginal = JSON.stringify(sConfig);
            var model = {
                scaleX: new LinearScale(xSrc, xConfig).create([0, 100]),
                scaleSize: new SizeScale(xSrc, sConfig).create(),
                xi: (row) => model.scaleX.value(row[model.scaleX.dim]),
                data: (() => data)
            };

            GrammarRegistry.get('avoidBaseScaleOverflow')(model);

            model.scaleX.commit();
            model.scaleSize.commit();

            expect(JSON.stringify(xConfig)).to.equal(xConfigOriginal);
            expect(JSON.stringify(sConfig)).to.equal(sConfigOriginal);
        });
    });
});