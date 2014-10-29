/*! tauCharts - v0.1.0 - 2014-10-29
* https://github.com/TargetProcess/tauCharts
* Copyright (c) 2014 Taucraft Limited; Licensed Creative Commons */
(function(definition) {
    if (typeof define === "function" && define.amd) {
        define(definition);
    } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
    } else {
        this.tauChart = definition();
    }
})(function() {
    var const$$CSS_PREFIX = 'graphical-report__';var utils$utils$$class2type = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"].reduce(function (class2type, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
        return class2type;
    }, {});
    var utils$utils$$toString = {}.toString;

    var utils$utils$$utils = {
        clone: function(obj)  {return JSON.parse(JSON.stringify(obj))},
        type: function(obj)  {
            /* jshint eqnull:true*/
            if (obj == null) {
                return obj + "";
            }
            return typeof obj === "object" || typeof obj === "function" ?
            utils$utils$$class2type[utils$utils$$toString.call(obj)] || "object" :
                typeof obj;
        },
        isArray: function(obj){return Array.isArray(obj)}
    };

    var matrix$$TMatrix = (function () {

        var Matrix = function (r, c) {

            var args = _.toArray(arguments);
            var cube;

            if (_.isArray(args[0])) {
                cube = args[0];
            }
            else {
                cube = _.times(r, function () {
                    return _.times(c, function () {
                        return null;
                    });
                });
            }

            this.cube = cube;
        };

        Matrix.prototype = {

            iterate: function (iterator) {
                var cube = this.cube;
                _.each(cube, function (row, ir) {
                    _.each(row, function (colValue, ic) {
                        iterator(ir, ic, colValue);
                    });
                });
                return this;
            },

            getRC: function (r, c) {
                return this.cube[r][c];
            },

            setRC: function (r, c, val) {
                this.cube[r][c] = val;
                return this;
            },

            sizeR: function () {
                return this.cube.length;
            },

            sizeC: function () {
                var row = this.cube[0] || [];
                return row.length;
            }
        };

        return Matrix;

    })();

    var unit$visitor$factory$$TUnitVisitorFactory = (function () {

        var FacetAlgebra = {

            'CROSS': function (root, dimX, dimY) {

                var domainX = root.domain(dimX);
                var domainY = root.domain(dimY).reverse();

                return _(domainY).map(function(rowVal)  {
                    return _(domainX).map(function(colVal)  {

                        var r = {};

                        if (dimX) {
                            r[dimX] = colVal;
                        }

                        if (dimY) {
                            r[dimY] = rowVal;
                        }

                        return r;
                    });
                });
            }
        };

        var TFuncMap = function(opName)  {return FacetAlgebra[opName] || (function()  {return [[{}]]})};

        var inheritRootProps = function(unit, root, props)  {
            var r = _.defaults(utils$utils$$utils.clone(unit), _.pick.apply(_, [root].concat(props)));
            r.guide = _.extend(utils$utils$$utils.clone(root.guide || {}), (r.guide || {}));
            return r;
        };

        var TUnitMap = {

            'COORDS.RECT': function (unit, continueTraverse) {

                var root = _.defaults(unit, {$where: {}});

                var isFacet = _.any(root.unit, function(n)  {return n.type.indexOf('COORDS.') === 0} );
                var unitFunc = TFuncMap(isFacet ? 'CROSS' : '');

                var matrixOfPrFilters = new matrix$$TMatrix(unitFunc(root, root.x, root.y));
                var matrixOfUnitNodes = new matrix$$TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());

                matrixOfPrFilters.iterate(function(row, col, $whereRC)  {
                    var cellWhere = _.extend({}, root.$where, $whereRC);
                    var cellNodes = _(root.unit).map(function(sUnit)  {
                        return _.extend(inheritRootProps(sUnit, root, ['x', 'y']), {$where: cellWhere});
                    });
                    matrixOfUnitNodes.setRC(row, col, cellNodes);
                });

                root.$matrix = matrixOfUnitNodes;

                matrixOfUnitNodes.iterate(function(r, c, cellNodes)  {
                    _.each(cellNodes, function(refSubNode)  {return continueTraverse(refSubNode)});
                });

                return root;
            },

            'COORDS.PARALLEL': function (unit, continueTraverse) {

                var root = _.defaults(unit, {$where: {}});

                var matrixOfPrFilters = new matrix$$TMatrix(1, 1);
                var matrixOfUnitNodes = new matrix$$TMatrix(1, 1);

                matrixOfPrFilters.iterate(function(row, col)  {
                    var cellWhere = _.extend({}, root.$where);
                    var cellNodes = _(root.unit).map(function(sUnit)  {
                        return _.extend(inheritRootProps(sUnit, root, ['x']), {$where: cellWhere});
                    });
                    matrixOfUnitNodes.setRC(row, col, cellNodes);
                });

                root.$matrix = matrixOfUnitNodes;

                matrixOfUnitNodes.iterate(function(r, c, cellNodes)  {
                    _.each(cellNodes, function(refSubNode)  {return continueTraverse(refSubNode)});
                });

                return root;
            }
        };

        return function (unitType) {
            return TUnitMap[unitType] || (function(unit)  {return unit});
        };

    })();

    var utils$utils$draw$$translate = function(left, top)  {return 'translate(' + left + ',' + top + ')'};
    var utils$utils$draw$$rotate = function(angle)  {return 'rotate(' + angle + ')'};
    var utils$utils$draw$$getOrientation = function(scaleOrient)  {return _.contains(['bottom', 'top'], scaleOrient.toLowerCase()) ? 'h' : 'v'};

    var utils$utils$draw$$fnDrawDimAxis = function (x, AXIS_POSITION, sectorSize, size) {
        var container = this;
        if (x.scaleDim) {

            var axisScale = d3.svg.axis().scale(x.scaleObj).orient(x.guide.scaleOrient);

            axisScale.ticks(_.max([Math.round(size / x.guide.density), 4]));

            var nodeScale = container
                .append('g')
                .attr('class', x.guide.cssClass)
                .attr('transform', utils$utils$draw$$translate.apply(null, AXIS_POSITION))
                .call(axisScale);

            nodeScale
                .selectAll('.tick text')
                .attr('transform', utils$utils$draw$$rotate(x.guide.rotate))
                .style('text-anchor', x.guide.textAnchor);

            if ('h' === utils$utils$draw$$getOrientation(x.guide.scaleOrient)) {

                if (x.scaleType === 'ordinal') {
                    nodeScale
                        .selectAll('.tick line')
                        .attr('x1', sectorSize / 2)
                        .attr('x2', sectorSize / 2);
                }

                nodeScale
                    .append('text')
                    .attr('transform', utils$utils$draw$$rotate(x.guide.label.rotate))
                    .attr('class', 'label')
                    .attr('x', x.guide.size * 0.5)
                    .attr('y', x.guide.label.padding)
                    .style('text-anchor', x.guide.label.textAnchor)
                    .text(x.guide.label.text);
            }
            else {

                if (x.scaleType === 'ordinal') {
                    nodeScale
                        .selectAll('.tick line')
                        .attr('y1', -sectorSize / 2)
                        .attr('y2', -sectorSize / 2);
                }

                nodeScale
                    .append('text')
                    .attr('transform', utils$utils$draw$$rotate(x.guide.label.rotate))
                    .attr('class', 'label')
                    .attr('x', -x.guide.size * 0.5)
                    .attr('y', -x.guide.label.padding)
                    .style('text-anchor', x.guide.label.textAnchor)
                    .text(x.guide.label.text);
            }
        }
    };

    var utils$utils$draw$$fnDrawGrid = function (node, H, W) {

        var container = this;

        var grid = container
            .append('g')
            .attr('class', 'grid')
            .attr('transform', utils$utils$draw$$translate(0, 0));

        var linesOptions = (node.guide.showGridLines || '').toLowerCase();
        if (linesOptions.length > 0) {

            var gridLines = grid.append('g').attr('class', 'grid-lines');

            if ((linesOptions.indexOf('x') > -1) && node.x.scaleDim) {
                var x = node.x;
                var xGridAxis = d3.svg.axis().scale(x.scaleObj).orient(x.guide.scaleOrient).tickSize(H);

                xGridAxis.ticks(_.max([Math.round(W / x.guide.density), 4]));

                var xGridLines = gridLines.append('g').attr('class', 'grid-lines-x');
                xGridLines.call(xGridAxis);

                if (x.scaleType === 'ordinal') {
                    var sectorSize = W / node.domain(x.scaleDim).length;
                    gridLines
                        .selectAll('.tick line')
                        .attr('x1', sectorSize / 2)
                        .attr('x2', sectorSize / 2);
                }
            }

            if ((linesOptions.indexOf('y') > -1) && node.y.scaleDim) {
                var y = node.y;
                var yGridAxis = d3.svg.axis().scale(y.scaleObj).orient(y.guide.scaleOrient).tickSize(-W);

                yGridAxis.ticks(_.max([Math.round(H / y.guide.density), 4]));

                var yGridLines = gridLines.append('g').attr('class', 'grid-lines-y');
                yGridLines.call(yGridAxis);
                if (y.scaleType === 'ordinal') {
                    var sectorSize$0 = H / node.domain(y.scaleDim).length;
                    yGridLines
                        .selectAll('.tick line')
                        .attr('y1', -sectorSize$0 / 2)
                        .attr('y2', -sectorSize$0 / 2);
                }
            }

            // TODO: make own axes and grid instead of using d3's in such tricky way
            gridLines.selectAll('text').remove();
        }

        return grid;
    };

    var utils$utils$draw$$generateColor = function (node) {
        var defaultRange = _.times(10, function(i)  {return 'color10-' + (1 + i)});
        var range, domain;
        var colorGuide = (node.guide || {}).color || {};
        var colorParam = node.color;

        var colorDim = colorParam.scaleDim;
        var brewer = colorGuide.brewer || defaultRange;

        if (utils$utils$$utils.isArray(brewer)) {
            domain = node.domain(colorDim);
            range = brewer;
        }
        else {
            domain = Object.keys(brewer);
            range = domain.map(function(key)  {return brewer[key]});
        }

        return {
            get: function(d)  {return d3.scale.ordinal().range(range).domain(domain)(d)},
            dimension:colorDim
        };
    };
    /* jshint ignore:start */
    var utils$utils$draw$$utilsDraw = {
        translate: utils$utils$draw$$translate,
        rotate: utils$utils$draw$$rotate,
        getOrientation: utils$utils$draw$$getOrientation,
        fnDrawDimAxis: utils$utils$draw$$fnDrawDimAxis,
        fnDrawGrid: utils$utils$draw$$fnDrawGrid,
        generateColor: utils$utils$draw$$generateColor
    };
    var elements$coords$$coords = function (node, continueTraverse) {

        var options = node.options;
        var padding = node.guide.padding;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        var L = options.left + padding.l;
        var T = options.top + padding.t;

        var W = options.width - (padding.l + padding.r);
        var H = options.height - (padding.t + padding.b);

        var tickX = {
            map: node.x.guide.tickLabel,
            min: node.x.guide.tickMin,
            max: node.x.guide.tickMax
        };
        node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

        var tickY = {
            map: node.y.guide.tickLabel,
            min: node.y.guide.tickMin,
            max: node.y.guide.tickMax
        };
        node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

        node.x.guide.size = W;
        node.y.guide.size = H;

        var X_AXIS_POS = [0, H + node.guide.x.padding];
        var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

        var container = options
            .container
            .append('g')
            .attr('class', const$$CSS_PREFIX + 'cell ' + 'cell')
            .attr('transform', utils$utils$draw$$utilsDraw.translate(L, T));

        if (!node.x.guide.hide) {
            var domainXLength = node.domain(node.x.scaleDim).length;
            utils$utils$draw$$utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W / domainXLength, W);
        }

        if (!node.y.guide.hide) {
            var domainYLength = node.domain(node.y.scaleDim).length;
            utils$utils$draw$$utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H / domainYLength, H);
        }

        var grid = utils$utils$draw$$utilsDraw.fnDrawGrid.call(container, node, H, W);

        node.$matrix.iterate(function(iRow, iCol, subNodes)  {
            subNodes.forEach(function(node)  {
                node.options = _.extend({container: grid}, node.options);
                continueTraverse(node);
            });
        });
    };
    var elements$line$$line = function (node) {

        var options = node.options;

        var xScale = options.xScale;
        var yScale = options.yScale;

        var color = utils$utils$draw$$utilsDraw.generateColor(node);

        var categories = d3
            .nest()
            .key(function(d)  {return d[color.dimension]})
            .entries(node.partition());

        var updateLines = function () {
            this.attr('class', function(d)  {
                return const$$CSS_PREFIX + 'line' + ' line ' + color.get(d.key);
            });
            var paths = this.selectAll('path').data(function(d)  {return [d.values]});
            paths.call(updatePaths);
            paths.enter().append('path').call(updatePaths);
            paths.exit().remove();
        };

        var line = d3
            .svg
            .line()
            .x(function(d)  {return xScale(d[node.x.scaleDim])})
            .y(function(d)  {return yScale(d[node.y.scaleDim])});

        var updatePaths = function () {
            this.attr('d', line);
        };

        var lines = options.container.selectAll('.line').data(categories);
        lines.call(updateLines);
        lines.enter().append('g').call(updateLines);
        lines.exit().remove();
    };
    var elements$point$$point = function (node) {

        var options = node.options;

        var xScale = options.xScale;
        var yScale = options.yScale;

        var color = utils$utils$draw$$utilsDraw.generateColor(node);
        var maxAxis = _.max([options.width, options.height]);
        var sizeValues = node.domain(node.size.scaleDim);

        var size = d3
            .scale
            .linear()
            .range([maxAxis / 200, maxAxis / 100])
            .domain([
                Math.min.apply(null, sizeValues),
                Math.max.apply(null, sizeValues)
            ]);

        var update = function () {
            return this
                .attr('r', function(d)  {
                    var s = size(d[node.size.scaleDim]);
                    return (!_.isFinite(s)) ? maxAxis / 100 : s;
                })
                .attr('class', function(d)  {
                    return const$$CSS_PREFIX + 'dot' + ' dot i-role-datum ' + color.get(d[color.dimension]);
                })
                .attr('cx', function(d)  {return xScale(d[node.x.scaleDim])})
                .attr('cy', function(d)  {return yScale(d[node.y.scaleDim])});
        };

        var elements = options.container.selectAll('.dot').data(node.partition());
        elements.call(update);
        elements.exit().remove();
        elements.enter().append('circle').call(update);
    };

    var elements$interval$$BAR_GROUP = 'i-role-bar-group';
    var elements$interval$$interval = function (node) {

        var options = node.options;

        var color = utils$utils$draw$$utilsDraw.generateColor(node);

        var partition = node.partition();
        var categories = d3
            .nest()
            .key(function(d)  {return d[color.dimension]})
            .entries(partition);

        var xScale,
            yScale,
            tickWidth,
            intervalWidth,
            offsetCategory,

            calculateX,
            calculateY,
            calculateWidth,
            calculateHeight,
            calculateTranslate;
        if (node.flip) {
            xScale = options.yScale;
            yScale = options.xScale;
            tickWidth = options.height / (node.domain(node.y.scaleDim).length);
            intervalWidth = tickWidth / (categories.length + 1);
            offsetCategory = intervalWidth;

            calculateX = function(d)  {return 0};
            calculateY = function(d)   {return xScale(d[node.y.scaleDim]) - (tickWidth / 2)};
            calculateWidth = function(d)  {return yScale(d[node.x.scaleDim])};
            calculateHeight = function(d){return intervalWidth};
            calculateTranslate = function(d, index)  {return utils$utils$draw$$utilsDraw.translate(0, index * offsetCategory + offsetCategory / 2)};

        } else {
            xScale = options.xScale;
            yScale = options.yScale;
            tickWidth = options.width / (node.domain(node.x.scaleDim).length);
            intervalWidth = tickWidth / (categories.length + 1);
            offsetCategory = intervalWidth;

            calculateX = function(d)   {return xScale(d[node.x.scaleDim]) - (tickWidth / 2)};
            calculateY = function(d)  {return yScale(d[node.y.scaleDim])};
            calculateWidth = function(d){return intervalWidth};
            calculateHeight = function(d)  {return options.height - yScale(d[node.y.scaleDim])};
            calculateTranslate = function(d, index)  {return utils$utils$draw$$utilsDraw.translate(index * offsetCategory + offsetCategory / 2, 0)};
        }

        var updateBar = function () {
            return this
                .attr('class', function(d) {
                    return 'i-role-datum bar ' + const$$CSS_PREFIX + 'bar ' + color.get(d[color.dimension]);
                })
                .attr('x', calculateX)
                .attr('y', calculateY)
                .attr('width', calculateWidth)
                .attr('height', calculateHeight);
        };
        var updateBarContainer = function () {

            this
                .attr('class', elements$interval$$BAR_GROUP)
                .attr('transform', calculateTranslate);
            var bars = this.selectAll('bar').data(function(d)  {return d.values});
            bars.call(updateBar);
            bars.enter().append('rect').call(updateBar);
            bars.exit().remove();
        };

        var elements = options.container.selectAll('.' + elements$interval$$BAR_GROUP).data(categories);
        elements.call(updateBarContainer);
        elements.enter().append('g').call(updateBarContainer);
        elements.exit().remove();
    };

    var node$map$$setupElementNode = function(node, dimensions)  {

        dimensions.forEach(function(dimName)  {
            node[dimName] = node.dimension(node[dimName], node);
        });

        var options = node.options;

        var W = options.width;
        var H = options.height;

        node.x.guide = node.guide.x;
        node.y.guide = node.guide.y;

        var tickX = {
            map: node.x.guide.tickLabel,
            min: node.x.guide.tickMin,
            max: node.x.guide.tickMax
        };
        node.options.xScale = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

        var tickY = {
            map: node.y.guide.tickLabel,
            min: node.y.guide.tickMin,
            max: node.y.guide.tickMax
        };
        node.options.yScale = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

        return node;
    };

    var node$map$$nodeMap = {

        'COORDS.RECT': function(node, continueTraverse)  {
            node.x = node.dimension(node.x, node);
            node.y = node.dimension(node.y, node);
            elements$coords$$coords(node, continueTraverse);
        },

        'ELEMENT.POINT': function(node)  {
            elements$point$$point(node$map$$setupElementNode(node, ['x', 'y', 'color', 'size']));
        },

        'ELEMENT.LINE': function(node)  {
            elements$line$$line(node$map$$setupElementNode(node, ['x', 'y', 'color']));
        },

        'ELEMENT.INTERVAL': function (node) {
            elements$interval$$interval(node$map$$setupElementNode(node, ['x', 'y', 'color']));
        },

        'WRAP.AXIS': function (node, continueTraverse) {

            node.x = node.dimension(node.x, node);
            node.y = node.dimension(node.y, node);

            var options = node.options;
            var padding = node.guide.padding;

            node.x.guide = node.guide.x;
            node.y.guide = node.guide.y;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var W = options.width - (padding.l + padding.r);
            var H = options.height - (padding.t + padding.b);

            node.x.guide.size = W;
            node.y.guide.size = H;

            var tickX = {
                map: node.x.guide.tickLabel,
                min: node.x.guide.tickMin,
                max: node.x.guide.tickMax
            };
            node.x.scaleObj = node.x.scaleDim && node.scaleTo(node.x.scaleDim, [0, W], tickX);

            var tickY = {
                map: node.y.guide.tickLabel,
                min: node.y.guide.tickMin,
                max: node.y.guide.tickMax
            };
            node.y.scaleObj = node.y.scaleDim && node.scaleTo(node.y.scaleDim, [H, 0], tickY);

            var X_AXIS_POS = [0, H + node.guide.x.padding];
            var Y_AXIS_POS = [0 - node.guide.y.padding, 0];

            var container = options
                .container
                .append('g')
                .attr('class', 'axis-container')
                .attr('transform', utils$utils$draw$$utilsDraw.translate(L, T));

            if (options.showX && !node.x.guide.hide) {
                var domainXLength = node.domain(node.x.scaleDim).length;
                utils$utils$draw$$utilsDraw.fnDrawDimAxis.call(container, node.x, X_AXIS_POS, W / domainXLength, W);
            }

            if (options.showY && !node.y.guide.hide) {
                var domainYLength = node.domain(node.y.scaleDim).length;
                utils$utils$draw$$utilsDraw.fnDrawDimAxis.call(container, node.y, Y_AXIS_POS, H / domainYLength, H);
            }

            var grid = container
                .append('g')
                .attr('class', 'sub-axis-container')
                .attr('transform', utils$utils$draw$$utilsDraw.translate(0, 0));

            var nRows = node.$axes.sizeR();
            var nCols = node.$axes.sizeC();

            node.$axes.iterate(function(iRow, iCol, subNodes)  {
                if (iCol === 0 || (iRow === (nRows - 1))) {
                    subNodes.forEach(function(node)  {
                        node.options = _.extend(
                            {
                                container: grid
                            },
                            node.options || {});

                        if (node.$axes) {
                            continueTraverse(node);
                        }
                    });
                }
            });
        },

        'WRAP.MULTI_AXES': function (node, continueTraverse) {
            var options = node.options;
            var padding = node.guide.padding;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var W = options.width - (padding.l + padding.r);
            var H = options.height - (padding.t + padding.b);

            var container = options
                .container
                .append('g')
                .attr('class', 'cell-wrapper')
                .attr('transform', utils$utils$draw$$utilsDraw.translate(L, T));

            node.$axes.iterate(function(r, c, subAxesNodes)  {
                subAxesNodes.forEach(function(node)  {
                    node.options = _.extend({container: container}, node.options);
                    continueTraverse(node);
                });
            });

            node.$matrix.iterate(function(r, c, subNodes)  {
                subNodes.forEach(function(node)  {
                    node.options = _.extend({container: container}, node.options);
                    continueTraverse(node);
                });
            });
        },

        'WRAP.MULTI_GRID': function (node, continueTraverse) {
            var options = node.options;
            var padding = node.guide.padding;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var grid = options
                .container
                .append('g')
                .attr('class', 'grid-wrapper')
                .attr('transform', utils$utils$draw$$utilsDraw.translate(L, T));

            node.$matrix.iterate(function(r, c, subNodes)  {
                subNodes.forEach(function(node)  {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        },

        'COORDS.PARALLEL': function(node, continueTraverse) {

            var options = node.options;
            var padding = node.guide.padding;

            var L = options.left + padding.l;
            var T = options.top + padding.t;

            var W = options.width - (padding.l + padding.r);
            var H = options.height - (padding.t + padding.b);

            var scaleObjArr = node.x.map(function(xN)  {return node.scaleTo(xN, [H, 0], {})});

            var container = options
                .container
                .append('g')
                .attr('class', 'graphical-report__' + 'cell ' + 'cell')
                .attr('transform', utils$utils$draw$$utilsDraw.translate(L, T));


            var translate = function(left, top)  {return 'translate(' + left + ',' + top + ')'};
            var rotate = function(angle)  {return 'rotate(' + angle + ')'};


            var fnDrawDimAxis = function (xScaleObj, AXIS_POSITION) {
                var container = this;

                var axisScale = d3.svg.axis().scale(xScaleObj).orient('left');

                var nodeScale = container
                    .append('g')
                    .attr('class', 'y axis')
                    .attr('transform', translate.apply(null, AXIS_POSITION))
                    .call(axisScale);

                nodeScale
                    .selectAll('.tick text')
                    .attr('transform', rotate(0))
                    .style('text-anchor', 'end');
            };

            var offset = W / (node.x.length - 1);
            scaleObjArr.forEach(function(scale, i)  {
                fnDrawDimAxis.call(container, scale, [i * offset, 0]);
            });

            var grid = container
                .append('g')
                .attr('class', 'grid')
                .attr('transform', translate(0, 0));

            node.$matrix.iterate(function(iRow, iCol, subNodes)  {
                subNodes.forEach(function(node)  {
                    node.options = _.extend({container: grid}, node.options);
                    continueTraverse(node);
                });
            });
        },

        'PARALLEL/ELEMENT.LINE': function(node) {

            node.color = node.dimension(node.color, node);

            var options = node.options;

            var scalesMap = node.x.reduce(
                function(memo, xN)  {
                    memo[xN] = node.scaleTo(xN, [options.height, 0], {});
                    return memo;
                },
                {});

            var color = utils$utils$draw$$utilsDraw.generateColor(node);

            var categories = d3
                .nest()
                .key(function(d)  {return d[color.dimension]})
                .entries(node.partition())
                .map(function(src)  {
                    var row = src.values[0];
                    var memo = [];
                    node.x.forEach(function(propName)  {
                        memo.push({key: propName, val: row[propName]});
                    });
                    return memo;
                });

            var updateLines = function () {
                this.attr('class', function(d)  {return 'graphical-report__' + 'line' + ' line ' + 'color10-9'});
                var paths = this.selectAll('path').data(function(d)  {return [d]});
                paths.call(updatePaths);
                paths.enter().append('path').call(updatePaths);
                paths.exit().remove();
            };

            var segment = options.width / (node.x.length - 1);
            var segmentMap = {};
            node.x.forEach(function(propName, i)  {
                segmentMap[propName] = (i * segment);
            });

            var fnLine = d3.svg.line()
                .x(function(d)  {return segmentMap[d.key]})
                .y(function(d)  {return scalesMap[d.key](d.val)});

            var updatePaths = function () {
                this.attr('d', fnLine);
            };

            var lines = options.container.selectAll('.line').data(categories);
            lines.call(updateLines);
            lines.enter().append('g').call(updateLines);
            lines.exit().remove();
        }
    };

    var node$visitor$factory$$TNodeVisitorFactory = (function () {
        return function (unitType) {

            if (!node$map$$nodeMap.hasOwnProperty(unitType)) {
                throw new Error('Unknown unit type: ' + unitType);
            }

            return node$map$$nodeMap[unitType];
        };

    })();

    var unit$domain$mixin$$rangeMethods = {

        'ordinal': function(inputValues, interval, props)  {
            return d3.scale.ordinal().domain(inputValues).rangePoints(interval, 1);
        },

        'linear': function(inputValues, interval, props)  {
            var domainParam = d3.extent(inputValues);
            var min = _.isNumber(props.min) ? props.min : domainParam[0];
            var max = _.isNumber(props.max) ? props.max : domainParam[1];
            var range = [
                Math.min(min, domainParam[0]),
                Math.max(max, domainParam[1])
            ];
            return d3.scale.linear().domain(range).nice().rangeRound(interval, 1);
        }
    };

    var unit$domain$mixin$$UnitDomainMixin = (function(){"use strict";var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var proto$0={};

        function UnitDomainMixin(meta, data) {

            var getPropMapper = function(prop)  {return function(propObj)  {return propObj[prop]}} ;

            var getValueMapper = function(dim)  {
                var d = meta[dim] || {};
                return d.value ? getPropMapper(d.value) : (function(x)  {return x});
            };

            var getOrder = function(dim)  {
                var d = meta[dim] || {};
                return d.order || null;
            };

            var getDomainSortStrategy = function(type)  {

                var map = {

                    category: function(dim, fnMapperId, domain)  {
                        return domain;
                    },

                    order: function(dim, fnMapperId, domain)  {
                        var metaOrder = getOrder(dim);
                        return (metaOrder) ?
                            _.union(metaOrder, domain) : // arguments order is important
                            _.sortBy(domain, fnMapperId);
                    },

                    measure: function(dim, fnMapperId, domain)  {
                        return _.sortBy(domain, fnMapperId);
                    },

                    'as-is': (function(dim, fnMapperId, domain)  {return domain})
                };

                return map[type] || map['as-is'];
            };

            var getScaleSortStrategy = function(type)  {

                var map = {

                    category: getDomainSortStrategy('category'),

                    order: function(dim, fnMapperId, domain)  {
                        var metaOrder = getOrder(dim);
                        return (metaOrder) ?
                            _.union(domain, metaOrder) : // arguments order is important
                            domain;
                    },

                    measure: getDomainSortStrategy('measure'),

                    'as-is': getDomainSortStrategy('as-is')
                };

                return map[type] || map['as-is'];
            };

            this.fnDimension = function(dimensionName, subUnit)  {
                var unit = (subUnit || {}).dimensions || {};
                var xRoot = meta[dimensionName] || {};
                var xNode = unit[dimensionName] || {};
                return {
                    scaleDim: dimensionName,
                    scaleType: xNode.scale || xRoot.scale
                };
            };

            this.fnSource = function(whereFilter)  {
                var predicates = _.map(whereFilter, function(v, k)  {return function(row)  {return getValueMapper(k)(row[k]) === v}});
                return _(data).filter(function(row)  {return _.every(predicates, (function(p)  {return p(row)}))});
            };

            var _domain = function(dim, fnSort)  {

                if (!meta[dim]) {
                    return [null];
                }

                var fnMapperId = getValueMapper(dim);
                var uniqValues = _(data).chain().pluck(dim).uniq(fnMapperId).value();

                return fnSort(dim, fnMapperId, uniqValues);
            };

            this.fnDomain = function(dim)  {
                var fnMapperId = getValueMapper(dim);
                var type = (meta[dim] || {}).type;
                var domainSortedAsc = _domain(dim, getDomainSortStrategy(type));
                return domainSortedAsc.map(fnMapperId);
            };

            this.fnScaleTo = function(scaleDim, interval, props)  {
                var propertyObj = props || {};
                var dimx = _.defaults({}, meta[scaleDim]);
                var fMap = propertyObj.map ? getPropMapper(propertyObj.map) : getValueMapper(scaleDim);

                var type = (meta[scaleDim] || {}).type;
                var vals = _domain(scaleDim, getScaleSortStrategy(type)).map(fMap);

                var func = unit$domain$mixin$$rangeMethods[dimx.scale](vals, interval, propertyObj);

                var wrap = function(domainPropObject)  {return func(fMap(domainPropObject))};
                // have to copy properties since d3 produce Function with methods
                for (var p in func) {
                    if (func.hasOwnProperty(p)) {
                        wrap[p] = func[p];
                    }
                }
                return wrap;
            };
        }DP$0(UnitDomainMixin,"prototype",{"configurable":false,"enumerable":false,"writable":false});

        proto$0.mix = function(unit) {
            unit.dimension = this.fnDimension;
            unit.source = this.fnSource;
            unit.domain = this.fnDomain;
            unit.scaleTo = this.fnScaleTo;
            unit.partition = (function()  {return unit.source(unit.$where)});

            return unit;
        };
    MIXIN$0(UnitDomainMixin.prototype,proto$0);proto$0=void 0;return UnitDomainMixin;})();var dsl$reader$$DSLReader = (function(){"use strict";var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var proto$0={};

        function DSLReader (spec, data) {
            this.spec = utils$utils$$utils.clone(spec);
            this.domain = new unit$domain$mixin$$UnitDomainMixin(this.spec.dimensions, data);
        }DP$0(DSLReader,"prototype",{"configurable":false,"enumerable":false,"writable":false});

        proto$0.buildGraph = function() {var this$0 = this;
            var buildRecursively = function(unit)  {return unit$visitor$factory$$TUnitVisitorFactory(unit.type)(this$0.domain.mix(unit), buildRecursively)};
            return buildRecursively(this.spec.unit);
        };

        proto$0.calcLayout = function(graph, layoutEngine, size) {

            graph.options = {
                top: 0,
                left: 0,
                width: size.width,
                height: size.height
            };

            return layoutEngine(graph, this.domain);
        };

        proto$0.renderGraph = function(styledGraph, target) {var this$0 = this;

            styledGraph.options.container = target;

            var renderRecursively = function(unit)  {return node$visitor$factory$$TNodeVisitorFactory(unit.type)(this$0.domain.mix(unit), renderRecursively)};

            renderRecursively(styledGraph);
            return styledGraph.options.container;
        };
    MIXIN$0(DSLReader.prototype,proto$0);proto$0=void 0;return DSLReader;})();
    var layout$engine$factory$$this$0 = this;

    var layout$engine$factory$$applyNodeDefaults = function(node)  {
        node.options = node.options || {};
        node.guide = node.guide || {};
        node.guide.padding = _.defaults(node.guide.padding || {}, {l: 0, b: 0, r: 0, t: 0});

        node.guide.x = _.defaults(node.guide.x || {}, {
            label: '',
            padding: 0,
            density: 30,
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
            density: 30,
            cssClass: 'y axis',
            scaleOrient: 'left',
            rotate: 0,
            textAnchor: 'end'
        });
        node.guide.y.label = _.isObject(node.guide.y.label) ? node.guide.y.label : {text: node.guide.y.label};
        node.guide.y.label = _.defaults(node.guide.y.label, {padding: 32, rotate: -90, textAnchor: 'middle'});

        return node;
    };

    var layout$engine$factory$$fnDefaultLayoutEngine = function(rootNode, domainMixin)  {

        var fnTraverseLayout = function(rawNode)  {

            var node = layout$engine$factory$$applyNodeDefaults(rawNode);

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
                    calcHeight: (function(cellHeight, rowIndex, elIndex, lenIndex)  {return cellHeight / lenIndex}),
                    calcTop: (function(cellHeight, rowIndex, elIndex, lenIndex)  {return (rowIndex + 1) * (cellHeight / lenIndex) * elIndex})
                };
            }
            else {
                calcLayoutStrategy = {
                    calcHeight: (function(cellHeight, rowIndex, elIndex, lenIndex)  {return cellHeight}),
                    calcTop: (function(cellHeight, rowIndex, elIndex, lenIndex)  {return rowIndex * cellH})
                };
            }

            node.$matrix.iterate(function(iRow, iCol, subNodes)  {

                var len = subNodes.length;

                _.each(
                    subNodes,
                    function(node, i)  {
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

    var layout$engine$factory$$LayoutEngineTypeMap = {

        'DEFAULT': layout$engine$factory$$fnDefaultLayoutEngine,

        'EXTRACT-AXES': function(rootNode, domainMixin)  {

            var fnExtractAxesTransformation = (function(root)  {

                var traverse = (function(rootNode, wrapperNode)  {

                    var node = layout$engine$factory$$applyNodeDefaults(rootNode);

                    _.each([node.guide.x || {}, node.guide.y || {}], function(a)  {return a.hide = true});

                    var nRows = node.$matrix.sizeR();
                    var nCols = node.$matrix.sizeC();

                    wrapperNode.$axes = new matrix$$TMatrix(nRows, nCols);

                    node.$matrix.iterate(function(r, c, subNodes)  {

                        var axesMap = [];
                        wrapperNode.$axes.setRC(r, c, axesMap);

                        var isHeadCol = (c === 0);
                        var isTailRow = (r === (nRows - 1));

                        subNodes.forEach(function(subNode)  {
                            var node = layout$engine$factory$$applyNodeDefaults(subNode);
                            if (node.$matrix) {
                                var axis = _.extend(utils$utils$$utils.clone(_.omit(node, '$matrix')), { type: 'WRAP.AXIS' });
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

                var wrapperNode = layout$engine$factory$$applyNodeDefaults({
                    type: 'WRAP.MULTI_AXES',
                    options: utils$utils$$utils.clone(root.options),
                    x: {},
                    y: {},
                    $matrix: new matrix$$TMatrix([[[root]]])
                });

                traverse(domainMixin.mix(wrapperNode), wrapperNode);

                wrapperNode.$matrix = new matrix$$TMatrix([
                    [
                        [
                            layout$engine$factory$$applyNodeDefaults({
                                type: 'WRAP.MULTI_GRID',
                                x: {},
                                y: {},
                                $matrix: new matrix$$TMatrix([[[root]]])
                            })
                        ]
                    ]
                ]);

                return wrapperNode;
            });

            var fnTraverseExtAxesLayout = function(wrapperNode)  {

                var multiAxisDecorator = function(node)  {

                    var options = node.options;
                    var padding = node.guide.padding;

                    var innerW = options.width - (padding.l + padding.r);
                    var innerH = options.height - (padding.t + padding.b);

                    var nR = node.$axes.sizeR();
                    var nC = node.$axes.sizeC();

                    var leftBottomItem = layout$engine$factory$$applyNodeDefaults(node.$axes.getRC(nR - 1, 0)[0] || {});
                    var lPadding = leftBottomItem.guide.padding.l;
                    var bPadding = leftBottomItem.guide.padding.b;

                    var sharedWidth = (innerW - lPadding);
                    var sharedHeight = (innerH - bPadding);

                    var cellW = sharedWidth / nC;
                    var cellH = sharedHeight / nR;

                    node.$axes.iterate(function(iRow, iCol, subNodes)  {

                        var isHeadCol = (iCol === 0);
                        var isTailRow = (iRow === (nR - 1));

                        if (isHeadCol || isTailRow) {

                            subNodes.forEach(function(node)  {
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
                var axisOffsetTraverser = function(node)  {
                    var padding = node.guide.padding;
                    var nR = node.$axes.sizeR();
                    node.$axes.iterate(function(iRow, iCol, subNodes)  {
                        if (iCol === 0 && (iRow === (nR - 1))) {
                            gridL += padding.l;
                            gridB += padding.b;
                            subNodes.forEach(function(node)  {return axisOffsetTraverser(node)});
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

                layout$engine$factory$$fnDefaultLayoutEngine(refRoot, domainMixin);

                return wrapperNode;
            };

            return (fnTraverseExtAxesLayout(fnExtractAxesTransformation(rootNode)));
        }
    };

    var layout$engine$factory$$LayoutEngineFactory = {

        get: function(typeName)  {
            return (layout$engine$factory$$LayoutEngineTypeMap[typeName] || layout$engine$factory$$LayoutEngineTypeMap.DEFAULT).bind(layout$engine$factory$$this$0);
        }

    };

    var plugins$$PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var plugins$$DP$0 = Object.defineProperty;var plugins$$GOPD$0 = Object.getOwnPropertyDescriptor;//plugins
    var plugins$$MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){plugins$$DP$0(t,p,plugins$$GOPD$0(s,p));}}return t};
    /** @class
     * @extends Plugin */
    var plugins$$Plugins = (function(){"use strict";var proto$0={};
        /** @constructs */
        function Plugins(plugins) {
            this._plugins = plugins;
        }plugins$$DP$0(Plugins,"prototype",{"configurable":false,"enumerable":false,"writable":false});

        proto$0._call = function(name, args) {
            for (var i = 0; i < this._plugins.length; i++) {
                if (typeof(this._plugins[i][name]) == 'function') {
                    this._plugins[i][name].apply(this._plugins[i], args);
                }
            }
        };

        proto$0.render = function(context, tools) {
            this._call('render', arguments);
        };

        proto$0.click = function(context, tools) {
            this._call('click', arguments);
        };

        proto$0.mouseover = function(context, tools) {
            this._call('mouseover', arguments);
        };

        proto$0.mouseout = function(context, tools) {
            this._call('mouseout', arguments);
        };

        proto$0.mousemove = function(context, tools) {
            this._call('mousemove', arguments);
        };
    plugins$$MIXIN$0(Plugins.prototype,proto$0);proto$0=void 0;return Plugins;})();


    var plugins$$propagateDatumEvents = function (plugins) {
        return function () {
            this
                .on('click', function (d) {
                    plugins.click(new plugins$$ElementContext(d), new plugins$$ChartElementTools(d3.select(this)));
                })
                .on('mouseover', function (d) {
                    plugins.mouseover(new plugins$$ElementContext(d), new plugins$$ChartElementTools(d3.select(this)));
                })
                .on('mouseout', function (d) {
                    plugins.mouseout(new plugins$$ElementContext(d), new plugins$$ChartElementTools(d3.select(this)));
                })
                .on('mousemove', function (d) {
                    plugins.mousemove(new plugins$$ElementContext(d), new plugins$$ChartElementTools(d3.select(this)));
                });
        };
    };

    /** @class ChartElementTools*/
    var plugins$$ChartElementTools = (function(){"use strict";
        /** @constructs */
            function ChartElementTools(element) {
            this.element = element;
        }plugins$$DP$0(ChartElementTools,"prototype",{"configurable":false,"enumerable":false,"writable":false});
    ;return ChartElementTools;})();

    /** @class RenderContext*/
    var plugins$$RenderContext = (function(){"use strict";
        /** @constructs */
        function RenderContext(dataSource) {
            this.data = dataSource;
        }plugins$$DP$0(RenderContext,"prototype",{"configurable":false,"enumerable":false,"writable":false});
    ;return RenderContext;})();

    /** @class ElementContext */
    var plugins$$ElementContext = (function(){"use strict";
        /**
         * @constructs
         * @param datum
         *
         * */
         function ElementContext(datum) {
            this.datum = datum;
        }plugins$$DP$0(ElementContext,"prototype",{"configurable":false,"enumerable":false,"writable":false});
    ;return ElementContext;})();

    /** @class ChartTools */
    var plugins$$ChartTools = (function(){"use strict";var proto$0={};
        /**
         * @constructs
         * @param {ChartLayout} layout
         * @param {Mapper} mapper
         **/
         function ChartTools(layout, mapper) {
            this.svg = layout.svg;
            this.html = layout.html;
            this.mapper = mapper;
        }plugins$$DP$0(ChartTools,"prototype",{"configurable":false,"enumerable":false,"writable":false});

        proto$0.elements = function() {
            return this.svg.selectAll('.i-role-datum');
        };
    plugins$$MIXIN$0(ChartTools.prototype,proto$0);proto$0=void 0;return ChartTools;})();

    var utils$utils$dom$$utilsDom =  {
        getStyle: function (el, prop) {
            return window.getComputedStyle(el, undefined).getPropertyValue(prop);
        },
        getContainerSize : function(el) {
            var padding = 2 * parseInt(this.getStyle(el, 'padding') || 0, 10);
            var rect = el.getBoundingClientRect();
            return {
                width: rect.width - padding,
                height: rect.height - padding
            };
        }
    };
    var charts$tau$plot$$Plot = (function(){"use strict";var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var proto$0={};
        function Plot(config) {

            var chartConfig = this.convertConfig(config);

            this.config = _.defaults(chartConfig, {
                spec: null,
                data: [],
                plugins: []
            });

            chartConfig.spec.dimensions = this._normalizeDimensions(chartConfig.spec.dimensions, chartConfig.data);

            this.plugins = this.config.plugins;
            this.spec = this.config.spec;
            this.data = this.config.data;

            //plugins
            this._plugins = new plugins$$Plugins(this.config.plugins);
        }DP$0(Plot,"prototype",{"configurable":false,"enumerable":false,"writable":false});

        proto$0.renderTo = function(target, xSize) {

            var container = d3.select(target);
            var containerNode = container[0][0];

            if (containerNode === null) {
                throw new Error('Target element not found');
            }

            //todo don't compute width if width or height were passed
            var size = _.defaults(xSize || {}, utils$utils$dom$$utilsDom.getContainerSize(containerNode));

            if (this.data.length === 0) {
                // empty data source
                return;
            }

            containerNode.innerHTML = '';

            var svgContainer = container
                .append("svg")
                .attr("class", "tau-chart " + const$$CSS_PREFIX + 'svg')
                .attr("width", size.width)
                .attr("height", size.height);

            var reader = new dsl$reader$$DSLReader(this.spec, this.data);
            var xGraph = reader.buildGraph();
            var engine = layout$engine$factory$$LayoutEngineFactory.get(this.config.layoutEngine || 'EXTRACT-AXES');
            var layout = reader.calcLayout(xGraph, engine, size);
            var canvas = reader.renderGraph(layout, svgContainer);

            //plugins
            canvas.selectAll('.i-role-datum').call(plugins$$propagateDatumEvents(this._plugins));
            this._plugins.render(canvas);
        };

        proto$0._autoDetectDimensions = function(data) {

            var detectType = function(propertyValue)  {
                var type;
                if (_.isObject(propertyValue)) {
                    type = 'order';
                }
                else if (_.isNumber(propertyValue)) {
                    type = 'measure';
                }
                else {
                    type = 'category';
                }

                return type;
            };

            return _.reduce(
                data,
                function(dimMemo, rowItem)  {

                    _.each(rowItem, function(val, key)  {
                        var assumedType = detectType(val);
                        dimMemo[key] = dimMemo[key] || {type: assumedType};
                        dimMemo[key].type = (dimMemo[key].type === assumedType) ? assumedType : 'category';
                    });

                    return dimMemo;
                },
                {});
        };

        proto$0._autoAssignScales = function(dimensions) {

            var scaleMap = {
                category: 'ordinal',
                order: 'ordinal',
                measure:'linear'
            };

            _.each(dimensions, function(val, key)  {
                var t = val.type.toLowerCase();
                val.scale = val.scale || scaleMap[t];
            });

            return dimensions;
        };

        proto$0._normalizeDimensions = function(dimensions, data) {
            var dims = (dimensions) ? dimensions : this._autoDetectDimensions(data);
            return this._autoAssignScales(dims);
        };

        proto$0.convertConfig = function(config) {
            return config;
        };
    MIXIN$0(Plot.prototype,proto$0);proto$0=void 0;return Plot;})();

    function charts$tau$chart$$convertAxis(data) {
        if (!data) {
            return null;
        }

        return data;
    }

    function charts$tau$chart$$generateSimpleConfig(type, config) {
        var chartConfig = _.omit(config, 'spec');
        var colorGuide = config.guide && config.guide.color || {};
        var element = {
            type: type,
            x: config.x,
            y: config.y,
            color: config.color,
            guide: {
                color: colorGuide
            }
        };
        if (config.size) {
            element.size = config.size;
        }
        if (config.flip) {
            element.flip = config.flip;
        }
        chartConfig.spec = {
            dimensions: config.dimensions,
            unit: {
                type: 'COORDS.RECT',
                x: charts$tau$chart$$convertAxis(config.x),
                y: charts$tau$chart$$convertAxis(config.y),
                guide: config.guide || {
                    padding: {l: 54, b: 24, r: 24, t: 24},
                    showGridLines: 'xy',
                    x: {label: config.x},
                    y: {label: config.y}
                },
                unit: [element]
            }

        };
        return chartConfig;
    }
    var charts$tau$chart$$typesChart = {
        'scatterplot': function(config) {
            return charts$tau$chart$$generateSimpleConfig('ELEMENT.POINT', config);
        },
        'line': function(config)  {
            return charts$tau$chart$$generateSimpleConfig('ELEMENT.LINE', config);
        },
        'bar': function(config)  {
            return charts$tau$chart$$generateSimpleConfig('ELEMENT.INTERVAL', config);
        }
    };

    var charts$tau$chart$$Chart = (function(super$0){"use strict";var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;function Chart() {super$0.apply(this, arguments)}if(!PRS$0)MIXIN$0(Chart, super$0);if(super$0!==null)SP$0(Chart,super$0);Chart.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Chart,"configurable":true,"writable":true}});DP$0(Chart,"prototype",{"configurable":false,"enumerable":false,"writable":false});var proto$0={};
        proto$0.convertConfig = function(config) {
            return charts$tau$chart$$typesChart[config.type](config);
        };
    MIXIN$0(Chart.prototype,proto$0);proto$0=void 0;return Chart;})(charts$tau$plot$$Plot);


    var tau$newCharts$$tauChart = {
        Plot: charts$tau$plot$$Plot,
        Chart: charts$tau$chart$$Chart,
        __api__: {
            UnitDomainMixin: unit$domain$mixin$$UnitDomainMixin,
            DSLReader: dsl$reader$$DSLReader,
            LayoutEngineFactory: layout$engine$factory$$LayoutEngineFactory
        }
    };

    "use strict";
    return tau$newCharts$$tauChart;
});