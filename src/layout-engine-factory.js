import {TMatrix} from './matrix';

var cloneNodeSettings = (node) => {
    var obj = _.omit(node, '$matrix');
    return JSON.parse(JSON.stringify(obj));
};

var applyNodeDefaults = (node) => {
    node.options = node.options || {};
    node.padding = _.defaults(node.padding || {}, {L: 0, B: 0, R: 0, T: 0});

    return node;
};

var fnDefaultLayoutEngine = (rootNode, domainDecorator) => {

    var fnTraverseLayout = (rawNode) => {

        var node = applyNodeDefaults(rawNode);

        if (!node.$matrix) {
            return node;
        }

        var options = node.options;
        var padding = node.padding;

        var innerW = options.width - (padding.L + padding.R);
        var innerH = options.height - (padding.T + padding.B);

        var nRows = node.$matrix.sizeR();
        var nCols = node.$matrix.sizeC();

        var cellW = innerW / nCols;
        var cellH = innerH / nRows;

        node.$matrix.iterate((iRow, iCol, subNodes) => {
            _.each(
                subNodes,
                (node) => {
                    node.options = {
                        width: cellW,
                        height: cellH,
                        top: iRow * cellH,
                        left: iCol * cellW
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

    'EXTRACT-AXES': (rootNode, domainDecorator) => {

        var fnExtractAxesTransformation = ((root) => {

            var traverse = ((rootNode, wrapperNode) => {

                var node = applyNodeDefaults(rootNode);

                if (!node.$matrix) {
                    return node;
                }

                _.each(node.axes, (a, i) => a.hide = true);

                var nRows = node.$matrix.sizeR();
                var nCols = node.$matrix.sizeC();

                wrapperNode.$axes = new TMatrix(nRows, nCols);

                node.$matrix.iterate((r, c, subNodes) => {

                    var axesMap = [];
                    wrapperNode.$axes.setRC(r, c, axesMap);

                    var isHeadCol = (c === 0);
                    var isTailRow = (r === (nRows - 1));

                    subNodes.forEach((node) => {
                        if (node.$matrix) {
                            var axis = _.extend(cloneNodeSettings(node), { type: 'WRAP.AXIS' });
                            axesMap.push(axis);

                            node.padding.L = 0;
                            node.padding.B = 0;

                            axis.padding.L = (isHeadCol ? axis.padding.L : 0);
                            axis.padding.B = (isTailRow ? axis.padding.B : 0);

                            traverse(node, axis);
                        }
                    });
                });

                return node;
            });

            var wrapperNode = applyNodeDefaults({
                type: 'WRAP.MULTI_AXES',
                options: cloneNodeSettings(root.options),
                $matrix: new TMatrix([[[root]]])
            });

            traverse(domainDecorator.decorate(wrapperNode), wrapperNode);

            wrapperNode.$matrix = new TMatrix([
                [
                    [
                        applyNodeDefaults({
                            type: 'WRAP.MULTI_GRID',
                            $matrix: new TMatrix([[[root]]])
                        })
                    ]
                ]
            ]);

            return wrapperNode;
        });

        var fnTraverseExtAxesLayout = (wrapperNode) => {

            var multiAxisDecorator = (node) => {

                if (!node.$axes) {
                    return node;
                }

                var options = node.options;
                var padding = node.padding;

                var innerW = options.width - (padding.L + padding.R);
                var innerH = options.height - (padding.T + padding.B);

                var nR = node.$axes.sizeR();
                var nC = node.$axes.sizeC();

                var leftBottomItem = (node.$axes.getRC(nR - 1, 0)[0] || { padding: { L:0, T:0, R:0, B:0 } });
                var lPadding = leftBottomItem.padding.L;
                var bPadding = leftBottomItem.padding.B;

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

                if (!node.$axes) {
                    return node;
                }

                var padding = node.padding;
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

            fnDefaultLayoutEngine(refRoot, domainDecorator);

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