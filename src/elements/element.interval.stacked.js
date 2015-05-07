import {CSS_PREFIX} from '../const';
import {flipHub, drawInterval} from './element.interval.fn';

// Possibly it is better to assign static transformation
// during element registration process
// e.g. some kind of decorators

export class StackedInterval {

    static embedUnitFrameToSpec(cfg, spec) {
        var scale = spec.scales[cfg.y];
        var dimY = scale.dim;

        var sums = cfg.frames.map((f) => f.take().reduce(((s, d) => (s += d[dimY])), 0));
        var maxSum = Math.max(...sums);

        if (!scale.hasOwnProperty('max') || scale.max < maxSum) {
            scale.max = maxSum;
            scale.autoScale = false;
        }
    }

    constructor(config) {
        this.config = config;
    }

    drawLayout(fnCreateScale) {

        var config = this.config;
        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.color = fnCreateScale('color', config.color, {});
        this.size = fnCreateScale('size', config.size, {});

        return this;
    }

    drawFrames(frames) {
        var canvas = this.config.options.container;
        var config = this.config;
        var xScale = this.xScale;
        var yScale = this.yScale;
        var colorScale = this.color;
        var node = {
            options: {
                container: canvas,
                xScale,
                yScale,
                color: colorScale,
                width: config.options.width,
                height: config.options.height
            },
            x: xScale,
            y: yScale,
            color: colorScale
        };

        var memo = {};
        var data = frames[0].take();
        var xxxx = data.map((d) => {
            var x = d[xScale.dim];
            var y = d[yScale.dim];
            var s = memo[x] = ((memo[x] || 0) + y);
            return {
                x: x,
                y: s,
                h: y
            };
        });

        let minimalHeight = 1;

        var updateBar = function () {
            return this
                .attr('x', (d) => xScale(d[xScale.dim]))
                .attr('y', (d, i) => yScale(xxxx[i].y))
                .attr('height', (d, i) => {
                    var t = yScale(xxxx[i].y);
                    var b = yScale(xxxx[i].y - xxxx[i].h);
                    var h = Math.abs(t - b);
                    return Math.max(minimalHeight, h);
                })
                .attr('width', 10)
                .attr('class', (d, i) => `i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d[colorScale.dim])}`)
                .style('stroke-width', 1)
                .style('stroke', 'rgba(255, 255, 255, 0.5)');
        };

        var elem = canvas
            .selectAll('.bar')
            .data(data);
        elem.exit()
            .remove();
        elem.call(updateBar);
        elem.enter()
            .append('rect')
            .call(updateBar);

        return [];

        var colorIndexScale = (d) => {
            var expectedValue = (d.key || {})[colorScale.scaleDim];
            var findIndex = _.findIndex(domain, (value) => (value === expectedValue));
            return findIndex === -1 ? 0 : findIndex;
        };

        var domain = colorScale.domain();
        colorIndexScale.count = () => domain.length || 1;

        var params = this._buildMethod({
            node,
            xScale,
            yScale,
            colorScale,
            colorIndexScale,
            width: config.options.width,
            height: config.options.height,
            defaultSizeParams: {
                tickWidth: 5,
                intervalWidth: 5,
                offsetCategory: 0
            }
        });

        this._drawElements(params, canvas, frames.map((fr)=>({key: fr.key, values: fr.data, uid: this.config.options.uid})));
    }

    _buildMethod({colorScale, node, xScale, yScale, colorIndexScale, width, height, defaultSizeParams}) {

        const BAR_GAP = 1;

        var getSizesParams = (params) => {
            var countDomainValue = params.domain().length;
            var countCategory = params.categoryLength;
            var tickWidth = params.size / countDomainValue;
            var intervalWidth = tickWidth / (countCategory + 1);
            return {
                tickWidth,
                intervalWidth,
                offsetCategory: intervalWidth
            };
        };

        var isMeasure = (dim) => (dim.scaleType === 'linear' || dim.scaleType === 'time');

        let minimalHeight = 1;
        let yMin = Math.min(...yScale.domain());
        let isYNumber = !isNaN(yMin);
        let startValue = (!isYNumber || (yMin <= 0)) ? 0 : yMin;
        let isXNumber = isMeasure(node.x);

        let {tickWidth, intervalWidth, offsetCategory} = isXNumber ?
            defaultSizeParams :
            getSizesParams({
                domain: xScale.domain,
                categoryLength: colorIndexScale.count(),
                size: width
            });

        let gapSize = (intervalWidth > (2 * BAR_GAP)) ? BAR_GAP : 0;

        let calculateX = ({data:d}) => xScale(d[node.x.scaleDim]) - (tickWidth / 2) + gapSize;
        let calculateY = isYNumber ?
            (({data:d}) => {
                var valY = d[node.y.scaleDim];
                var dotY = yScale(Math.max(startValue, valY));
                var h = Math.abs(yScale(valY) - yScale(startValue));
                var isTooSmall = (h < minimalHeight);
                return (isTooSmall && (valY > 0)) ? (dotY - minimalHeight) : dotY;
            }) :
            (({data:d}) => yScale(d[node.y.scaleDim]));

        let calculateWidth = ({data:d}) => (intervalWidth - 2 * gapSize);
        let calculateHeight = isYNumber ?
            (({data:d}) => {
                var valY = d[node.y.scaleDim];
                var h = Math.abs(yScale(valY) - yScale(startValue));
                return (valY === 0) ? h : Math.max(minimalHeight, h);
            }) :
            (({data:d}) => (height - yScale(d[node.y.scaleDim])));

        let calculateTranslate = ({key:d}) =>
            utilsDraw.translate(colorIndexScale({key:d}) * offsetCategory + offsetCategory / 2, 0);

        return {colorScale, calculateX, calculateY, calculateWidth, calculateHeight, calculateTranslate};
    }

    _drawElements({
        calculateX,
        calculateY,
        colorScale,
        calculateWidth,
        calculateHeight,
        calculateTranslate
        },
        container,
        data) {

        const BAR_GROUP = 'i-role-bar-group';

        var updateBar = function () {
            return this
                .attr('x', calculateX)
                .attr('y', calculateY)
                .attr('height', calculateHeight)
                .attr('width', calculateWidth)
                .attr('class', ({data:d}) => {
                    return `i-role-element i-role-datum bar ${CSS_PREFIX}bar ${colorScale(d[colorScale.scaleDim])}`;
                });
        };

        var updateBarContainer = function () {
            this.attr('class', BAR_GROUP)
                .attr('transform', calculateTranslate);
            var bars = this.selectAll('.bar').data((d) => {
                return d.values.map(item => ({
                    data: item,
                    uid: d.uid
                }));
            });
            bars.call(updateBar);
            bars.enter().append('rect').call(updateBar);
            bars.exit().remove();
        };
        var elements = container.selectAll(`.${BAR_GROUP}`).data(data);
        elements.call(updateBarContainer);
        elements.enter().append('g').call(updateBarContainer);
        elements.exit().remove();
    }
}