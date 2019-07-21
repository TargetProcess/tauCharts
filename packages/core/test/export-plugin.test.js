import {expect} from 'chai';
import testUtils from './utils/utils';
const stubTimeout = testUtils.stubTimeout;
import legend from '../plugins/legend';
import trendline from '../plugins/trendline';
import mock from './utils/mock.window';
import {saveAs} from './utils/saveAs';
import exportTo from '../plugins/export-to';
import $ from 'jquery';
const describeChart = testUtils.describeChart;

    describeChart(
        'export plugin should work',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
            plugins: [exportTo()]
        },
        [
            {x: 2, y: 2, color: undefined, size: 10},
            {x: 4, y: 5, color: 'color', size: 123}
        ],
        function (context) {
            it('print', function (done) {
                var header = context.chart._layout.header;
                testUtils.simulateEvent('click', header.querySelector('.tau-chart__export'));
                mock.printCallbacks.push(function () {
                    expect(true).to.be.ok;
                    $('.tau-chart__print-block').remove();
                    testUtils.simulateEvent('click', document.body);
                     done();
                });
                setTimeout(function () {
                    testUtils.simulateEvent('click', document.querySelector('[data-value="print"]'));
                }, 0);
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'export plugin should work png',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
            plugins: [exportTo()]
        },
        [
            {x: 2, y: 2, color: undefined, size: 10},
            {x: 4, y: 5, color: 'color', size: 123}
        ],
        function (context) {
            it('export to png', function (done) {
                var header = context.chart._layout.header;
                var exportMenu = header.querySelector('.tau-chart__export');
                expect(exportMenu.style.display).to.be.equal('');
                testUtils.simulateEvent('click', exportMenu);
                saveAs.callbacks.items.push(function () {
                    expect(true).to.be.ok;
                    testUtils.simulateEvent('click', document.body);
                    done();
                });
                expect($('[data-value="png"]').length).to.be.ok;
                context.chart.fire('export-to', {type: 'png', fileName: 'Document 1'});
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'export plugin',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
            plugins: [exportTo({visible: false})]
        },
        [
            {x: 2, y: 2, color: undefined, size: 10},
            {x: 4, y: 5, color: 'color', size: 123}
        ],
        function (context) {
            it('should allow to hide menu', function (done) {
                var header = context.chart._layout.header;
                var exportMenu = header.querySelector('.tau-chart__export');
                expect(exportMenu.style.display).to.be.equal('none');
                done();
            });
        },
        {
            autoWidth: false
        }
    );

    describeChart(
        'export plugin on config update',
        {
            type: 'scatterplot',
            x: 'x',
            y: 'y',
            color: 'color',
            size: 'size',
        },
        [
            {x: 2, y: 2, color: undefined, size: 10},
            {x: 4, y: 5, color: 'color', size: 123}
        ],
        function (context) {
            it('should not add Export plug-in', function (done) {
                const header = context.chart.getLayout().header;
                const exportMenu = header.querySelector('.tau-chart__export');
                expect(exportMenu).to.be.null;
                done();
            });
            it('should add Export plug-in', function (done) {
                context.chart.updateConfig({
                    type: 'scatterplot',
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    size: 'size',
                    plugins: [exportTo()],
                    data: [
                        {x: 2, y: 2, color: undefined, size: 10},
                        {x: 4, y: 5, color: 'color', size: 123}
                    ]
                });
                const header = context.chart.getLayout().header;
                const exportMenu = header.querySelector('.tau-chart__export');
                expect(exportMenu).to.be.ok;
                expect(exportMenu.style.display).to.not.equal('none');
                done();
            });
            it('should update Export plug-in config', function (done) {
                context.chart.updateConfig({
                    type: 'scatterplot',
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    size: 'size',
                    plugins: [exportTo({visible: false})],
                    data: [
                        {x: 2, y: 2, color: undefined, size: 10},
                        {x: 4, y: 5, color: 'color', size: 123}
                    ]
                });
                const header = context.chart.getLayout().header;
                const exportMenu = header.querySelector('.tau-chart__export');
                expect(exportMenu).to.be.ok;
                expect(exportMenu.style.display).to.equal('none');
                done();
            });
            it('should remove Export plug-in', function (done) {
                context.chart.updateConfig({
                    type: 'scatterplot',
                    x: 'x',
                    y: 'y',
                    color: 'color',
                    size: 'size',
                    data: [
                        {x: 2, y: 2, color: undefined, size: 10},
                        {x: 4, y: 5, color: 'color', size: 123}
                    ]
                });
                const header = context.chart.getLayout().header;
                const exportMenu = header.querySelector('.tau-chart__export');
                expect(exportMenu).to.be.null;
                done();
            });
        },
        {
            autoWidth: false
        }
    );
