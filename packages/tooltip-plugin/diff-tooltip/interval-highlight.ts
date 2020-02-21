import Taucharts from 'taucharts';
import * as d3Selection from 'd3-selection';
import {
    d3Selection as Selection,
    GrammarElement,
} from '../../src/definitions';

const utils = Taucharts.api.utils;
export const ELEMENT_HIGHLIGHT = 'ELEMENT.INTERVAL_HIGHLIGHT';

interface HighlightElement extends GrammarElement {
    addInteraction(this: HighlightElement);
    draw(this: HighlightElement);
    _drawRange(this: HighlightElement, range: number[]);
    _container?: d3.Selection<Element, any, Element, any>;
}

const IntervalHighlight = <HighlightElement>{

    draw() {
        const node = this.node();
        const config = node.config;
        this._container = config.options.slot(config.uid);
    },

    addInteraction() {
        const node = this.node();

        node.on('interval-highlight', (sender, range) => {
            this._drawRange(range);
        });
    },

    _drawRange(range: number[]) {
        const node = this.node();
        const config = node.config;
        const flip = node.screenModel.flip;
        // Todo: Fix undefined container
        // const container = config.options.container; // undefined
        const container = this._container;

        const ROOT_CLS = 'interval-highlight';
        const GRADIENT_ID = `${ROOT_CLS}__gradient`;

        const start = (range ? range[0] : null);
        const end = (range ? range[1] : null);
        const size = (flip ? config.options.width : config.options.height);

        function defineGradient() {

            const DEFS_CLS = `${ROOT_CLS}__defs`;
            const START_CLS = `${ROOT_CLS}__gradient-start`;
            const END_CLS = `${ROOT_CLS}__gradient-end`;

            var svg = container.node();
            while ((svg = svg.parentNode as Element).tagName !== 'svg');

            const id = `${DEFS_CLS}__${config.uid}`;

            const defs = d3Selection.select(svg)
                .selectAll(`#${id}`)
                .data(range ? [1] : []);

            defs.exit().remove();

            const defsEnter = defs.enter()
                .append('defs')
                .attr('class', DEFS_CLS)
                .attr('id', id)
                .append('linearGradient')
                .attr('id', GRADIENT_ID)
                .attr('x1', '0%')
                .attr('y1', flip ? '100%' : '0%')
                .attr('x2', flip ? '0%' : '100%')
                .attr('y2', '0%');

            defsEnter
                .append('stop')
                .attr('class', START_CLS)
                .attr('offset', '0%');

            defsEnter
                .append('stop')
                .attr('class', END_CLS)
                .attr('offset', '100%');
        }

        interface HighlightDataBinding {
            g: Selection;
            gEnter: Selection;
        }

        function drawGroups(): HighlightDataBinding {

            const g = container
                .selectAll(`.${ROOT_CLS}`)
                .data(range ? [1] : []) as Selection;

            g.exit().remove();

            const gEnter = g
                .enter()
                .append('g')
                .attr('class', ROOT_CLS)
                .attr('pointer-events', 'none') as Selection;

            return {g, gEnter};
        }

        function drawRange({g, gEnter}: HighlightDataBinding) {

            const RANGE_CLS = `${ROOT_CLS}__range`;

            const rect = g.select(`.${RANGE_CLS}`);
            const rectEnter = gEnter
                .append('rect')
                .attr('class', RANGE_CLS)
                .attr('fill', `url(#${GRADIENT_ID})`);

            const {x, y, width, height} = (flip ?
                {
                    x: 0,
                    y: end,
                    width: size,
                    height: (start - end)
                } : {
                    x: start,
                    y: 0,
                    width: (end - start),
                    height: size
                });

            rectEnter.merge(rect)
                .attr('x', x)
                .attr('y', y)
                .attr('width', Math.abs(width))
                .attr('height', Math.abs(height));
        }

        function drawStart({g, gEnter}: HighlightDataBinding) {

            const START_CLS = `${ROOT_CLS}__range-start`;

            const line = g.select(`.${START_CLS}`);
            const lineEnter = gEnter
                .append('line')
                .attr('class', START_CLS);

            const {x1, y1, x2, y2} = (flip ?
                {
                    x1: 0,
                    y1: start,
                    x2: size,
                    y2: start
                } : {
                    x1: start,
                    y1: 0,
                    x2: start,
                    y2: size
                });

            lineEnter.merge(line)
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
        }

        function drawEnd({g, gEnter}: HighlightDataBinding) {

            const END_CLS = `${ROOT_CLS}__range-end`;

            const line = g.select(`.${END_CLS}`);
            const lineEnter = gEnter
                .append('line')
                .attr('class', END_CLS);

            const {x1, y1, x2, y2} = (flip ?
                {
                    x1: 0,
                    y1: end,
                    x2: size,
                    y2: end
                } : {
                    x1: end,
                    y1: 0,
                    x2: end,
                    y2: size
                });

            lineEnter.merge(line)
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
        }

        utils.take(drawGroups())
            .then((binding) => {
                defineGradient();
                drawRange(binding);
                drawStart(binding);
                drawEnd(binding);
            });
    }
};

export default IntervalHighlight;
