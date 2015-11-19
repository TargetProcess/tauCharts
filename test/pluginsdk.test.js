define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('src/tau.charts');

    describe('Plugins SDK', function () {

        var sdk;
        beforeEach(function () {
            sdk = tauChart.api.pluginsSDK;
        });

        it('should support [spec.value] method', function () {
            var specRef = {a: 1};
            expect(sdk.spec(specRef).value()).to.equal(specRef);
        });

        it('should support [spec.unit] method', function () {
            var specRef = {
                a: 1,
                unit: {
                    type: 'COORDS.RECT',
                    units: [
                        {type: 'ELEMENT.LINE'}
                    ]
                }
            };
            expect(sdk.spec(specRef).unit().value()).to.equal(specRef.unit);

            var prevUnit = sdk.spec(specRef).unit();
            var newUnit = {
                type: 'COORDS.RECT',
                units: [
                    {type: 'ELEMENT.POINT'}
                ]
            };
            expect(sdk.spec(specRef).unit(newUnit).value()).to.equal(newUnit);
            expect(sdk.spec(specRef).unit().value()).to.equal(newUnit);
            expect(sdk.spec(specRef).unit().value()).to.not.equal(prevUnit.value());
        });

        it('should support [spec.addTransformation] method', function () {
            var specRef = {};
            sdk.spec(specRef).addTransformation('test', ((data) => (data)));

            expect(specRef.hasOwnProperty('transformations')).to.equal(true);
            expect(specRef.transformations.hasOwnProperty('test')).to.equal(true);
            expect(specRef.transformations.test(1)).to.equal(1);
        });

        it('should support [spec.getSettings] method', function () {
            var specRef = {
                settings: {
                    testSettings: 'blabla'
                }
            };
            expect(sdk.spec(specRef).getSettings('testSettings')).to.equal('blabla');
            expect(sdk.spec(specRef).getSettings('test2')).to.equal(undefined);
        });

        it('should support [spec.setSettings] method', function () {
            var specRef = {
                settings: {
                    testSettings: 'blabla'
                }
            };
            sdk.spec(specRef)
                .setSettings('testSettings', 'silent')
                .setSettings('test2', 'test-value');

            expect(specRef.settings.testSettings).to.equal('silent');
            expect(specRef.settings.test2).to.equal('test-value');
        });

        it('should support [spec.getScale] method', function () {
            var specRef = {
                scales: {
                    'a': {dim:'a', source:'/'}
                }
            };

            expect(sdk.spec(specRef).getScale('a')).to.equal(specRef.scales.a);
        });

        it('should support [spec.addScale] method', function () {
            var specRef = {
                scales: {
                    'a': {dim:'a', source:'/'}
                }
            };

            var spec = sdk.spec(specRef);
            spec.addScale('b', {dim:'b', source:'/'});
            expect(spec.getScale('b')).to.equal(specRef.scales.b);
        });

        it('should support [spec.regSource] method', function () {
            var specRef = {
                sources: {
                    'test': {
                        dims: {a: {type:'measure'}},
                        data: [
                            {a:1}
                        ]
                    }
                }
            };

            var sourceToRegister = {
                dims: {
                    x: {type: 'category'},
                    y: {type: 'category'}
                },
                data: [{x: 1, y: 1}]
            };

            var spec = sdk.spec(specRef);
            spec.regSource('src', sourceToRegister);

            expect(spec.getSourceData('src')).to.equal(specRef.sources.src.data);
            expect(spec.getSourceDim('src', 'x')).to.equal(specRef.sources.src.dims.x);
            expect(spec.getSourceDim('src', 'y')).to.equal(specRef.sources.src.dims.y);
        });

        it('should support [spec.getSourceData] method', function () {
            var specRef = {
                sources: {
                    'test': {
                        dims: {a: {type:'measure'}},
                        data: [
                            {a:1}
                        ]
                    }
                }
            };

            expect(sdk.spec(specRef).getSourceData('test'))
                .to
                .equal(specRef.sources.test.data);

            expect(sdk.spec(specRef).getSourceData('unknown'))
                .to
                .deep
                .equal([]);
        });

        it('should support [spec.getSourceDim] method', function () {
            var specRef = {
                sources: {
                    'test': {
                        dims: {a: {type:'measure'}},
                        data: [
                            {a:1}
                        ]
                    }
                }
            };

            expect(sdk.spec(specRef).getSourceDim('test', 'a'))
                .to
                .equal(specRef.sources.test.dims.a);

            expect(sdk.spec(specRef).getSourceDim('test', 'b'))
                .to
                .deep
                .equal({});

            expect(sdk.spec(specRef).getSourceDim('unknown', 'a'))
                .to
                .deep
                .equal({});
        });

        it('should support [unit.addTransformation] method', function () {
            var unitRef1 = {
                type: 'COORDS.RECT'
            };

            sdk.unit(unitRef1).addTransformation('test', 'a');

            expect(unitRef1.transformation.length).to.equal(1);
            expect(unitRef1.transformation[0]).to.deep.equal({
                type: 'test',
                args: 'a'
            });

            var unitRef2 = {
                type: 'COORDS.RECT',
                transformation: [
                    {type: 'noop', args: null}
                ]
            };

            sdk.unit(unitRef2).addTransformation('test', 'a');

            expect(unitRef2.transformation.length).to.equal(2);
            expect(unitRef2.transformation[0]).to.deep.equal({
                type: 'noop',
                args: null
            });
            expect(unitRef2.transformation[1]).to.deep.equal({
                type: 'test',
                args: 'a'
            });
        });

        it('should support [unit.value] method', function () {
            var unitRef = {type: 'COORDS.RECT'};
            var u = sdk.unit(unitRef);
            unitRef.test = 2;
            expect(u.value()).to.equal(unitRef);
        });

        it('should support [unit.clone] method', function () {
            var unitRef = {type: 'COORDS.RECT'};
            var unit = sdk.unit(unitRef);
            expect(unit.clone()).to.deep.equal(unitRef);
            expect(unit.clone()).to.not.equal(unitRef);
            expect(unit.clone()).to.not.equal(unit.clone());
        });

        it('should support [unit.isCoord] method', function () {
            expect(sdk.unit({type: 'COORDS.PARALLEL'}).isCoordinates()).to.equal(true);
            expect(sdk.unit({type: 'COORDS.RECT'}).isCoordinates()).to.equal(true);
            expect(sdk.unit({type: 'COORDS.RECT'}).isElementOf('RECT')).to.equal(false);

            expect(sdk.unit({type: 'ELEMENT.LINE'}).isCoordinates()).to.equal(false);
            expect(sdk.unit({type: 'ELEMENT.LINE'}).isElementOf('RECT')).to.equal(true);

            expect(sdk.unit({type: 'PARALLEL/ELEMENT.LINE'}).isElementOf('RECT')).to.equal(false);
            expect(sdk.unit({type: 'PARALLEL/ELEMENT.LINE'}).isElementOf('parallel')).to.equal(true);
        });

        it('should support [unit.traverse] method', function () {
            var specRef = {
                unit: {
                    type: 'A',
                    units: [
                        {
                            type: 'A0'
                        }
                        ,
                        {
                            type: 'A1',
                            units: [
                                {
                                    type: 'A11'
                                }
                            ]
                        }
                    ]
                }
            };
            var r = [];
            sdk
                .spec(specRef)
                .unit()
                .traverse(function (unit, parent) {
                    var p = parent || {type: 'nil'};
                    r.push('(' + p.type + '>' + unit.type + ')');
                });
            expect(r.join('-')).to.equal('(nil>A)-(A>A0)-(A>A1)-(A1>A11)');
        });

        it('should support [unit.reduce] method', function () {
            var specRef = {
                unit: {
                    type: 'A',
                    units: [
                        {
                            type: 'A0'
                        }
                        ,
                        {
                            type: 'A1',
                            units: [
                                {
                                    type: 'A11'
                                }
                            ]
                        }
                    ]
                }
            };

            var k = sdk.spec(specRef).unit().reduce(function (memo, unit, parent) {
                memo += 1;
                return memo;
            }, 0);
            expect(k).to.equal(4);

            var m = sdk.spec(specRef).unit().reduce(function (memo, unit, parent) {
                var p = parent || {type:'nil'};
                var token = ('(' + p.type + '>' + unit.type + ')');
                return memo.concat([token]);
            }, []);
            expect(m.join('-')).to.equal('(nil>A)-(A>A0)-(A>A1)-(A1>A11)');
        });

        it('should support [unit.addFrame] method', function () {
            var unitRef = {
                type: 'COORDS.RECT',
                expression: {
                    source: '$',
                    inherit: false,
                    operator: false
                }
            };
            var unit = sdk.unit(unitRef);
            unit.addFrame({key: {x:1, y: 1}});
            expect(unit.value().frames.length).to.equal(1);
            expect(unit.value().frames[0].source).to.equal('$');
            expect(unit.value().frames[0].pipe).to.deep.equal([]);

            unit.addFrame({key: {x:1, y: 1}});
            var frames = unit.value().frames;
            expect(frames.length).to.equal(2);
            expect(frames[0].key.hasOwnProperty('__layerid__')).to.equal(true);
            expect(frames[1].key.hasOwnProperty('__layerid__')).to.equal(true);
            expect(frames[0].key.__layerid__).to.not.equal(frames[1].key.__layerid__);
        });
    });
});