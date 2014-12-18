import {coords} from './elements/coords';
import {line} from './elements/line';
import {point} from './elements/point';
import {interval} from './elements/interval';
import {utilsDraw} from './utils/utils-draw';
import {CoordsParallel} from './elements/coords-parallel';
import {CoordsParallelLine} from './elements/coords-parallel-line';

var setupElementNode = (node, dimensions) => {

    dimensions.forEach((dimName) => {
        node[dimName] = node.dimension(node[dimName], node);
    });

    var options = node.options;

    var W = options.width;
    var H = options.height;

    node.x.guide = node.guide.x;
    node.y.guide = node.guide.y;

    node.options.xScale = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], node.x.guide);
    node.options.yScale = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], node.y.guide);

    node.options.color = utilsDraw.generateColor(node);

    return node;
};

var nodeMap = {

    'COORDS.RECT': {
        walk: coords.walk,
        draw: (node, continueTraverse) => {
            node.x = node.dimension(node.x, node);
            node.y = node.dimension(node.y, node);
            coords.draw(node, continueTraverse);
        }
    },

    'ELEMENT.POINT': (node) => {
        point(setupElementNode(node, ['x', 'y', 'color', 'size']));
    },

    'ELEMENT.LINE': (node) => {
        line(setupElementNode(node, ['x', 'y', 'color']));
    },

    'ELEMENT.INTERVAL': function (node) {
        interval(setupElementNode(node, ['x', 'y', 'color']));
    },

    'COORDS.PARALLEL': CoordsParallel,
    'PARALLEL/ELEMENT.LINE': CoordsParallelLine
};

export {nodeMap};
