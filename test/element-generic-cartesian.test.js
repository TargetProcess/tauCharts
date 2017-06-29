// jscs:disable disallowQuotedKeysInObjects
// jscs:disable validateQuoteMarks
import {expect} from 'chai';
import schemes from './utils/schemes';
import Taucharts from '../src/tau.charts';
import * as utils from '../src/utils/utils';
import testUtils from './utils/utils';

    var convertSpec = function (spec, data) {
        var unit = spec.unit;
        return {
            sources: {
                '?': {
                    dims: {},
                    data: []
                },
                '/': {
                    dims: {
                        x: {type: 'category'},
                        y: {type: 'measure'},
                        createDate: {type: 'date'},
                        time: {type: 'measure'},
                        color: {type: 'category'},
                        count: {type: 'measure'}
                    },
                    data: data.map(function (item) {
                        /*if (item.createDate) {
                         item.createDate = item.createDate.getTime()
                         }*/
                        return item;

                    })
                }
            },
            unitsRegistry: unitsRegistry,
            transformations: {
                where: function (data, tuple) {
                    var predicates = tuple.map(function (v, k) {
                        return function (row) {
                            return (row[k] === v);
                        };
                    });
                    return data.filter(function (row) {
                        return predicates.every(function (p) {
                            return p(row);
                        });
                    });
                }
            },
            scales: utils.defaults(spec.scales || {}, {
                'x': {type: 'ordinal', source: '/', dim: 'x'},
                'y': {type: 'linear', source: '/', dim: 'y'},
                'date': {type: 'period', period: 'day', source: '/', dim: 'createDate'},
                'count': {type: 'linear', source: '/', dim: 'count'},
                'time': {type: 'time', source: '/', dim: 'time'},
                'catY': {type: 'ordinal', source: '/', dim: 'color'},
                'size:default': {type: 'size', source: '?', minSize: 0, maxSize: 1},
                'color': {type: 'color', dim: 'color', source: '/'},
                'color:default': {type: 'color', source: '?', brewer: null}
            }),
            unit: {
                type: 'COORDS.RECT',
                expression: {
                    inherit: false,
                    source: '/',
                    operator: 'none'
                },
                x: unit.x,
                y: unit.y,
                guide: unit.guide || {},
                units: [utils.defaults(unit.units[0], {
                    type: 'ELEMENT.INTERVAL',
                    x: unit.x || 'x',
                    y: unit.y || 'y',
                    expression: {
                        inherit: true,
                        source: '/',
                        operator: 'groupBy',
                        params: ['color']
                    }
                })]
            }
        }
    };

    describe('ELEMENT.GENERIC.CARTESIAN', function () {

        var div;
        var size = {width: 1000, height: 1000};

        beforeEach(function () {
            div = document.createElement('div');
            document.body.appendChild(div);
        });

        afterEach(function () {
            div.parentNode.removeChild(div);
        });

        it('should draw', function () {

            var plot = new Taucharts.Plot({
                sources: {
                    '?': {
                        dims: {},
                        data: []
                    },
                    '/': {
                        dims: {
                            x: {type: 'measure'},
                            y: {type: 'measure'}
                        },
                        data: [
                            {x: 0, y: 100},
                            {x: 100, y: 0}
                        ]
                    }
                },
                transformations: {
                    where: function (data, tuple) {
                        var predicates = tuple.map(function (v, k) {
                            return function (row) {
                                return (row[k] === v);
                            };
                        });
                        return data.filter(function (row) {
                            return predicates.every(function (p) {
                                return p(row);
                            });
                        });
                    }
                },
                scales: {
                    'x': {type: 'linear', source: '/', dim: 'x', nice: false},
                    'y': {type: 'linear', source: '/', dim: 'y', nice: false}
                },
                unit: {
                    type: 'COORDS.RECT',
                    expression: {
                        inherit: false,
                        source: '/',
                        operator: 'none'
                    },
                    x: 'x',
                    y: 'y',
                    guide: {
                        x: {hide: true},
                        y: {hide: true}
                    },
                    units: [
                        {
                            type: 'ELEMENT.GENERIC.CARTESIAN',
                            x: 'x',
                            y: 'y',
                            expression: {
                                inherit: true,
                                source: '/',
                                operator: 'none'
                            }
                        }
                    ]
                },
                settings: {
                    layoutEngine: 'NONE'
                }
            });

            expect(function() {
                plot.renderTo(div,
                    {
                        width: 1000,
                        height: 1000
                    });
            }).not.throw();

            var elements = plot.select((node) => node.config.type === 'ELEMENT.GENERIC.CARTESIAN');

            expect(elements.length).to.equal(1);

            expect(elements[0].screenModel.x({x: 0, y: 0})).to.equal(0);
            expect(elements[0].screenModel.y({x: 0, y: 0})).to.equal(1000);

            expect(elements[0].screenModel.x({x: 50, y: 50})).to.equal(500);
            expect(elements[0].screenModel.y({x: 50, y: 50})).to.equal(500);

            expect(elements[0].screenModel.x({x: 100, y: 100})).to.equal(1000);
            expect(elements[0].screenModel.y({x: 100, y: 100})).to.equal(0);
        });
    });
