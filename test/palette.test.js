import {expect} from 'chai';
import testUtils from './utils/utils';
import Taucharts from '../src/tau.charts';

const testData = [
    {x: 1.0, y: 1.0, color: 'First'},
    {x: 0.5, y: 0.5, color: 'Second'},
    {x: 2.0, y: 2.0, color: null}
];

testUtils.describePlot(
    'Chart with custom palette',
    {
        unit: {
            guide: {
                avoidScalesOverflow: false,
                x: {nice: false},
                y: {nice: false}
            },
            type: 'COORDS.RECT',
            x: 'x',
            y: 'y',
            unit: [
                {
                    type: 'ELEMENT.POINT',
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    guide: {
                        color: {
                            brewer: {
                                'First': '#FF0000',
                                'Second': '#00FF00',
                                'null': '#0000FF',
                            }
                        }
                    }
                }
            ]
        }
    },
    testData,
    function (context) {
        it('should render points with right colors', function () {
            const dots = testUtils.getDots();
            expect(dots.length).to.equal(3);
            expect(dots[0].getAttribute('fill')).to.equal('#FF0000');
            expect(dots[1].getAttribute('fill')).to.equal('#00FF00');
            expect(dots[2].getAttribute('fill')).to.equal('#0000FF');
        });
    });
