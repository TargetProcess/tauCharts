import {Utils} from './utils';
import {TMatrix} from './matrix';

var applyNodeDefaults = (node) => {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = _.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

    node.guide.x = _.defaults(node.guide.x || {}, {
        label: '',
        padding: 0,
        cssClass: 'x axis',
        scaleOrient: 'bottom',
        rotate: 0,
        textAnchor: 'middle'
    });
    node.guide.x.label = _.isObject(node.guide.x.label) ? node.guide.x.label : {text: node.guide.x.label};
    node.guide.x.label = _.defaults(node.guide.x.label, {padding: 32, rotate: 0, textAnchor: 'middle'});

    node.guide.y = _.defaults(node.guide.y || {}, {
        label: '',
        padding: 0,
        cssClass: 'y axis',
        scaleOrient: 'left',
        rotate: 0,
        textAnchor: 'middle'
    });
    node.guide.y.label = _.isObject(node.guide.y.label) ? node.guide.y.label : {text: node.guide.y.label};
    node.guide.y.label = _.defaults(node.guide.y.label, {padding: 32, rotate: -90, textAnchor: 'middle'});

    return node;
};

var fnDefaultLayoutEngine = (rootNode, domainMixin) => {

    var fnTraverseLayout = (rawNode) => {

        var node = applyNodeDefaults(rawNode);

        if (!node.$matrix) {
            return node;
        }

        var options = node.options;
        var padding = node.guide.padding;

        var innerW = options.width - (padding.l + padding.r);
        var innerH = options.height - (padding.t + padding.b);

        var nRows = node.$matrix.sizeR();
        var nCols = node.$matrix.sizeC();

        var cellW = innerW / nCols;
        var cellH = innerH / nRows;

        var calcLayoutStrategy;
        if (node.guide.split) {
            calcLayoutStrategy = {
                calcHeight: ((cellHeight, rowIndex, elIndex, lenIndex) => cellHeight / lenIndex),
                calcTop: ((cellHeight, rowIndex, elIndex, lenIndex) => (rowIndex + 1) * (cellHeight / lenIndex) * elIndex)
            };
        }
        else {
            calcLayoutStrategy = {
                calcHeight: ((cellHeight, rowIndex, elIndex, lenIndex) => cellHeight),
                calcTop: ((cellHeight, rowIndex, elIndex, lenIndex) => rowIndex * cellH)
            };
        }

        node.$matrix.iterate((iRow, iCol, subNodes) => {

            var len = subNodes.length;

            _.each(
                subNodes,
                (node, i) => {
                    node.options = {
                        width: cellW,
                        left: iCol * cellW,
                        height: calcLayoutStrategy.calcHeight(cellH, iRow, i, len),
                        top: calcLayoutStrategy.calcTop(cellH, iRow, i, len)
                    };
                    fnTraverseLayout(node);
                });
        });

        return node;
    };

    return fnTraverseLayout(rootNode);
};

var LayoutEngineTypeMap = {

    'DEFAULT': fnDefaultLayoutEngine,

    'EXTRACT-AXES': (rootNode, domainMixin) => {

        var fnExtractAxesTransformation = ((root) => {

            var traverse = ((rootNode, wrapperNode) => {

                var node = applyNodeDefaults(rootNode);

                _.each([node.guide.x || {}, node.guide.y || {}], (a) => a.hide = true);

                var nRows = node.$matrix.sizeR();
                var nCols = node.$matrix.sizeC();

                wrapperNode.$axes = new TMatrix(nRows, nCols);

                node.$matrix.iterate((r, c, subNodes) => {

                    var axesMap = [];
                    wrapperNode.$axes.setRC(r, c, axesMap);

                    var isHeadCol = (c === 0);
                    var isTailRow = (r === (nRows - 1));

                    subNodes.forEach((subNode) => {
                        var node = applyNodeDefaults(subNode);
                        if (node.$matrix) {
                            var axis = _.extend(Utils.clone(_.omit(node, '$matrix')), { type: 'WRAP.AXIS' });
                            axesMap.push(axis);

                            node.guide.padding.l = 0;
                            node.guide.padding.b = 0;

                            axis.guide.padding.l = (isHeadCol ? axis.guide.padding.l : 0);
                            axis.guide.padding.b = (isTailRow ? axis.guide.padding.b : 0);

                            traverse(node, axis);
                        }
                    });
                });

                return node;
            });

            var wrapperNode = applyNodeDefaults({
                type: 'WRAP.MULTI_AXES',
                options: Utils.clone(root.options),
                x: {},
                y: {},
                $matrix: new TMatrix([[[root]]])
            });

            traverse(domainMixin.mix(wrapperNode), wrapperNode);

            wrapperNode.$matrix = new TMatrix([
                [
                    [
                        applyNodeDefaults({
                            type: 'WRAP.MULTI_GRID',
                            x: {},
                            y: {},
                            $matrix: new TMatrix([[[root]]])
                        })
                    ]
                ]
            ]);

            return wrapperNode;
        });

        var fnTraverseExtAxesLayout = (wrapperNode) => {

            var multiAxisDecorator = (node) => {

                var options = node.options;
                var padding = node.guide.padding;

                var innerW = options.width - (padding.l + padding.r);
                var innerH = options.height - (padding.t + padding.b);

                var nR = node.$axes.sizeR();
                var nC = node.$axes.sizeC();

                var leftBottomItem = applyNodeDefaults(node.$axes.getRC(nR - 1, 0)[0] || {});
                var lPadding = leftBottomItem.guide.padding.l;
                var bPadding = leftBottomItem.guide.padding.b;

                var sharedWidth = (innerW - lPadding);
                var sharedHeight = (innerH - bPadding);

                var cellW = sharedWidth / nC;
                var cellH = sharedHeight / nR;

                node.$axes.iterate((iRow, iCol, subNodes) => {

                    var isHeadCol = (iCol === 0);
                    var isTailRow = (iRow === (nR - 1));

                    if (isHeadCol || isTailRow) {

                        subNodes.forEach((node) => {
                            node.options = {
                                showX: isTailRow,
                                showY: isHeadCol,

                                width : cellW + (isHeadCol ? lPadding: 0),
                                height: cellH + (isTailRow ? bPadding: 0),

                                top : iRow * cellH,
                                left: iCol * cellW + (isHeadCol ? 0 : lPadding)
                            };

                            if (node.$axes) {
                                multiAxisDecorator(node);
                            }
                        });
                    }
                });

                return node;
            };

            multiAxisDecorator(wrapperNode);

            var gridL = 0;
            var gridB = 0;
            var axisOffsetTraverser = (node) => {
                var padding = node.guide.padding;
                var nR = node.$axes.sizeR();
                node.$axes.iterate((iRow, iCol, subNodes) => {
                    if (iCol === 0 && (iRow === (nR - 1))) {
                        gridL += padding.l;
                        gridB += padding.b;
                        subNodes.forEach((node) => axisOffsetTraverser(node));
                    }
                });

                return node;
            };

            axisOffsetTraverser(wrapperNode);

            var gridW = wrapperNode.options.width - gridL;
            var gridH = wrapperNode.options.height - gridB;

            var refRoot = wrapperNode.$matrix.getRC(0, 0)[0];
            refRoot.options = {
                top: 0,
                left: gridL,
                width: gridW,
                height: gridH
            };

            fnDefaultLayoutEngine(refRoot, domainMixin);

            return wrapperNode;
        };

        return (fnTraverseExtAxesLayout(fnExtractAxesTransformation(rootNode)));
    }
};

var LayoutEngineFactory = {

    get: (typeName) => {
        return (LayoutEngineTypeMap[typeName] || LayoutEngineTypeMap.DEFAULT).bind(this);
    }

};

export {LayoutEngineFactory};