import {coords} from './elements/coords';
import {line} from './elements/line';
import {point} from './elements/point';
import {interval} from './elements/interval';
import {utilsDraw} from './utils/utils-draw';
import {CoordsParallel} from './elements/coords-parallel';
import {CoordsParallelLine} from './elements/coords-parallel-line';
import {sizeScale} from './elements/size';

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

    var guideColor = node.guide.color || {};
    node.options.color = node.scaleColor(node.color.scaleDim, guideColor.brewer, guideColor);

    if (node.size) {
        var minFontSize = _.min([node.guide.x.tickFontHeight, node.guide.y.tickFontHeight].filter((x) => x !== 0)) * 0.5;
        var minTickStep = _.min([node.guide.x.density, node.guide.y.density].filter((x) => x !== 0)) * 0.5;
        node.options.sizeScale = sizeScale(node.domain(node.size.scaleDim), 2, minTickStep, minFontSize);
    }

    return node;
};

var nodeMap = {

    'COORDS.RECT': {
        walk: coords.walk,
        draw: (node, continueTraverse) => {
            node.x = node.dimension(node.x, node);
            node.y = node.dimension(node.y, node);
            return coords.draw(node, continueTraverse);
        }
    },

    'ELEMENT.POINT': (node) => {
        return point(setupElementNode(node, ['x', 'y', 'color', 'size']));
    },

    'ELEMENT.LINE': (node) => {
        return line(setupElementNode(node, ['x', 'y', 'color']));
    },

    'ELEMENT.INTERVAL': function (node) {
        return interval(setupElementNode(node, ['x', 'y', 'color']));
    },

    'COORDS.PARALLEL': CoordsParallel,
    'PARALLEL/ELEMENT.LINE': CoordsParallelLine
};

export {nodeMap};
