import {assert} from 'chai';
import schemes from './utils/schemes';
import tauChart from '../src/tau.charts';

    describe('Horizontal bar chart', function () {
        var testData = [
            {x: 1, y: 1, color: 'red', size: 6},
            {x: 0.5, y: 0.5, color: 'green', size: 6},
            {x: 2, y: 2, color: 'green', size: 8}
        ];
        it('should convert to common config', function () {
            var bar = new tauChart.Chart({
                type: 'horizontalBar',
                data: testData,
                x: 'x',
                y: 'y',
                color: 'color',
                size: 'size'
            });
            assert.equal(schemes.barGPL.errors(bar.getSpec()), false, 'spec right');
            assert.equal(bar.getSpec().unit.units[0].flip, true, 'spec right');
            bar.destroy();
        })
    });
