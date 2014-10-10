import {TMatrix} from './matrix';

var cloneNodeSettings = (node) => {
    var obj = _.omit(node, '$matrix');
    return JSON.parse(JSON.stringify(obj));
};

var applyNodeDefaults = (node) => {
    node.options = node.options || {};
    node.guide = node.guide || {};
    node.guide.padding = _.defaults(node.guide.padding || {}, {L: 0, B: 0, R: 0, T: 0});
    node.guide.x = _.defaults(node.guide.x || {}, {label: '', padding: 0, cssClass: ''});
    node.guide.y = _.defaults(node.guide.y || {}, {label: '', padding: 0, cssClass: ''});

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

        var innerW = options.width - (padding.L + padding.R);
        var innerH = options.height - (padding.T + padding.B);

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

                _.each([node.x || {}, node.y || {}], (a) => a.hide = true);

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
                            var axis = _.extend(cloneNodeSettings(node), { type: 'WRAP.AXIS' });
                            axesMap.push(axis);

                            node.guide.padding.L = 0;
                            node.guide.padding.B = 0;

                            axis.guide.padding.L = (isHeadCol ? axis.guide.padding.L : 0);
                            axis.guide.padding.B = (isTailRow ? axis.guide.padding.B : 0);

                            traverse(node, axis);
                        }
                    });
                });

                return node;
            });

            var wrapperNode = applyNodeDefaults({
                type: 'WRAP.MULTI_AXES',
                options: cloneNodeSettings(root.options),
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

                var innerW = options.width - (padding.L + padding.R);
                var innerH = options.height - (padding.T + padding.B);

                var nR = node.$axes.sizeR();
                var nC = node.$axes.sizeC();

                var leftBottomItem = applyNodeDefaults(node.$axes.getRC(nR - 1, 0)[0] || {});
                var lPadding = leftBottomItem.guide.padding.L;
                var bPadding = leftBottomItem.guide.padding.B;

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
                        gridL += padding.L;
                        gridB += padding.B;
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