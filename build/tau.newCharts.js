(function(definition) {
    if (typeof define === "function" && define.amd) {
        define(definition);
    } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
    } else {
        this.tauChart = definition();
    }
})(function() {
    var $$matrix$$TMatrix = (function () {
    
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

    var $$unit$visitor$factory$$TUnitVisitorFactory = (function () {
    
        var createEqualPredicate = function (propName, shouldEqualTo) {
            return function (row) {
                return row[propName] === shouldEqualTo;
            };
        };
    
        var TFuncMap = {
            'CROSS': function (root, dimX, dimY) {
    
                var domainX = root.domain(dimX);
                var domainY = root.domain(dimY).reverse();
    
                return _(domainY).map(function(RV) 
                {
                    return _(domainX).map(function(RC) 
                    {
                        return [
                            createEqualPredicate(dimX, RC),
                            createEqualPredicate(dimY, RV)
                        ];
                    });
                });
            }
        };
    
        var EMPTY_CELL_FILTER = [];
    
        var TUnitMap = {
    
            'COORDS/RECT': function (unit, continueTraverse) {
    
                var root = _.defaults(
                    unit,
                    {
                        $filter: EMPTY_CELL_FILTER
                    });
    
                var x = _.defaults(root.axes[0] || {}, {});
                var y = _.defaults(root.axes[1] || {}, {});
    
                var unitFunc = TFuncMap[root.func] || (function()  {return [[EMPTY_CELL_FILTER]]});
    
                var matrixOfPrFilters = new $$matrix$$TMatrix(unitFunc(root, x.scaleDim, y.scaleDim));
                var matrixOfUnitNodes = new $$matrix$$TMatrix(matrixOfPrFilters.sizeR(), matrixOfPrFilters.sizeC());
    
                matrixOfPrFilters.iterate(function(row, col, $filterRC) 
                {
                    var cellFilter = root.$filter.concat($filterRC);
                    var cellNodes = _(root.unit).map(function(sUnit) 
                    {
                        // keep arguments order. cloned objects are created
                        return _.extend({}, sUnit, { $filter: cellFilter });
                    });
                    matrixOfUnitNodes.setRC(row, col, cellNodes);
                });
    
                root.$matrix = matrixOfUnitNodes;
    
                matrixOfUnitNodes.iterate(function(r, c, cellNodes) 
                {
                    _.each(cellNodes, function(refSubNode)  {return continueTraverse(refSubNode)});
                });
    
                return root;
            }
        };
    
        TUnitMap['COORDS.RECT'] = TUnitMap['COORDS/RECT'];
    
        return function (unitType) {
            return TUnitMap[unitType] || _.identity;
        };
    
    })();

    var $$node$visitor$factory$$TNodeVisitorFactory = (function () {
    
        var translate = function(left, top)  {
            return 'translate(' + left + ',' + top + ')';
        };
    
        var getRangeMethod = function (scaleType) {
            return ((scaleType === 'ordinal') ? 'rangeRoundBands' : 'rangeRound');
        };
    
        var fnDrawDimAxis = function(x, AXIS_POSITION, CSS_CLASS) {
            var container = this;
            if (x.scaleDim) {
                container
                    .append('g')
                    .attr('class', CSS_CLASS)
                    .attr('transform', translate.apply(null, AXIS_POSITION))
                    .call(d3.svg.axis().scale(x.scale).orient(x.scaleOrient));
            }
        };
    
        var fnDrawGrid = function(node, H, W) {
    
            var container = this;
    
            var grid = container
                .append('g')
                .attr('class', 'grid')
                .attr('transform', translate(0, 0));
    
            var linesOptions = (node.showGridLines || '').toLowerCase();
            if (linesOptions.length > 0) {
    
                var gridLines = grid.append('g').attr('class', 'grid-lines');
    
                if ((linesOptions.indexOf('x') > -1) && node.axes[0]) {
                    var x = node.axes[0];
                    var xGridAxis = d3
                        .svg
                        .axis()
                        .scale(x.scale)
                        .orient(x.scaleOrient)
                        .tickSize(H);
    
                    gridLines.append('g').call(xGridAxis);
                }
    
                if ((linesOptions.indexOf('y') > -1) && node.axes[1]) {
                    var y = node.axes[1];
                    var yGridAxis = d3
                        .svg
                        .axis()
                        .scale(y.scale)
                        .orient(y.scaleOrient)
                        .tickSize(-W);
    
                    gridLines.append('g').call(yGridAxis);
                }
    
                // TODO: make own axes and grid instead of using d3's in such tricky way
                gridLines.selectAll('text').remove();
            }
    
            return grid;
        };
    
        var getBubbleAxis = function (node) {
            var cube = node.$matrix.cube[0];
            if (cube && cube[0] && cube[0][0].axes && cube[0][0].axes[0] && cube[0][0].axes[0].bubble) {
                return {
                    $scales: cube[0][0].$scales,
                    axes: cube[0][0].axes
                };
            } else {
                return {axes: []};
            }
        };
    
        var drawNestedAxes = function (nestedAxesConfig, container, srcData, dimensions, sizes) {
            container.append('g').attr("class", "axes nest");
            var nestedAxes = nestedAxesConfig;
            var groupX = _.chain(srcData).map(function (item) {
                return item[dimensions.x];
            }).unique().value();
    
            var groupY = _.chain(srcData).map(function (item) {
                return item[dimensions.y];
            }).unique().value();
    
    
            var xs = nestedAxes.axes[0];
            var xScales = nestedAxes.$scales[xs.scaleDim][getRangeMethod(xs.scaleType)]([0, sizes.width - sizes.paddingX*2], 0.1);
            // xScales.
            container.selectAll(".x.axis.nest")
                .data(groupX)
                .enter().append("g")
                .attr("class", "x axis nest")
                .attr("transform", function (d, ind) {
                    return "translate(" + ((ind) * sizes.width + sizes.paddingY) + "," + sizes.containerHeight + ")";
                })
                .each(function (d) {
                    d3.select(this).call(d3.svg.axis().scale(xScales).orient('bottom'));
                }
            );
            var ys = nestedAxes.axes[1];
            var yScales = nestedAxes.$scales[ys.scaleDim][getRangeMethod(ys.scaleType)]([sizes.height - sizes.paddingY*2, 0], 0.1);
            container.selectAll(".y.axis.nest")
                .data(groupY)
                .enter().append("g")
                .attr("class", "y axis nest")
                .attr("transform", function (d, ind) {
                    return "translate(" + 0 + "," + (ind * sizes.height + sizes.paddingY/2) + ")";
                })
                .each(function (d) {
                    d3.select(this).call(d3.svg.axis().scale(yScales).orient('left'));
                }
            );
        };
    
        var TNodeMap = {
    
            'COORDS/RECT': function (node, continueTraverse) {
    
                var options = node.options || {};
                var axes = node.axes;
                var x = _.defaults(axes[0] || {}, {scaleOrient: 'bottom'});
                var y = _.defaults(axes[1] || {}, {scaleOrient: 'left'});
                var PX = 36;
                var PY = 18;
                var paddingForNestedX = 5;
                var paddingForNestedY = 5;
                var bubbleAxes = getBubbleAxis(node);
                var existBubbleAxes = bubbleAxes.axes.length;
                if (x.bubble === true && y.bubble === true) {
                    PX = paddingForNestedX;
                    PY = paddingForNestedY;
                } else {
                    if (existBubbleAxes) {
                        PX = 56;
                        PY = 30;
                    }
                }
                var W = options.width - 2 * PX;
                var H = options.height - 2 * PY;
    
    
                var container = options
                    .container
                    .append('g')
                    .attr('class', 'cell')
                    .attr('transform', translate(options.left + PX, options.top + PY / 2));
    
    
                var xScale;
                if (x.scaleDim) {
                    xScale = node.$scales[x.scaleDim][getRangeMethod(x.scaleType)]([0, W], 0.1);
                    if (x.bubble !== true) {
                        var xAxis = d3.svg.axis().scale(xScale).orient(x.scaleOrient);
                        container
                            .append('g')
                            .attr('class', 'x axis nest')
                            .attr('transform', translate(0, H + 25))
                            .call(xAxis);
                    }
                }
    
                var yScale;
                if (y.scaleDim) {
                    yScale = node.$scales[y.scaleDim][getRangeMethod(y.scaleType)]([H, 0], 0.1);
                    if (y.bubble !== true) {
                        var yAxis = d3.svg.axis().scale(yScale).orient(y.scaleOrient);
                        container
                            .append('g')
                            .attr('class', 'y axis')
                            .attr('transform', translate(-25, 0))
                            .call(yAxis);
                    }
                }
    
                if (node.showGrid) {
    
                    var grids = container.insert('g', ':first-child').attr('class', 'grids');
    
                    if (xScale) {
                        var xGridAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient(x.scaleOrient)
                            .tickSize(H);
    
                        grids.append('g').call(xGridAxis);
                    }
    
                    if (yScale) {
                        var yGridAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient(y.scaleOrient)
                            .tickSize(-W);
    
                        grids.append('g').call(yGridAxis);
                    }
    
                    // TODO: make own axes and grid instead of using d3's in such tricky way
                    grids.selectAll('text').remove();
                }
    
                var grid = container
                    .append('g')
                    .attr('class', 'grid')
                    .attr('transform', translate(0, 0));
    
                var nR = node.$matrix.sizeR();
                var nC = node.$matrix.sizeC();
    
                var cellW = W / nC;
                var cellH = H / nR;
                if(existBubbleAxes) {
                    drawNestedAxes(
                        bubbleAxes,
                        container,
                        node.partition(),
                        {
                            x: x.scaleDim,
                            y: y.scaleDim
                        },
                        {
                            width: cellW,
                            height: cellH,
                            containerHeight: H,
                            paddingX:paddingForNestedX,
                            paddingY:paddingForNestedY
                        }
                    );
                }
    
    
                node.$matrix.iterate(function (iRow, iCol, subNodes) {
                    subNodes.forEach(function (node) {
    
                        node.options = {
                            container: grid,
                            width: cellW,
                            height: cellH,
                            top: iRow * cellH,
                            left: iCol * cellW,
                            xScale: xScale,
                            yScale: yScale
                        };
    
                        continueTraverse(node);
                    });
                });
            },
    
            'COORDS.RECT': function (node, continueTraverse) {
    
                var options = node.options || {};
                var axes = _(node.axes).map(function(axis, i) {
                    var a = _.isArray(axis) ? axis : [axis];
                    a[0] = _.defaults(
                        a[0] || {},
                        {
                            scaleOrient: (i === 0 ? 'bottom' : 'left'),
                            lwidth: 0,
                            rwidth: 0,
                            padding: 0
                        });
                    return a;
                });
    
                var x = axes[0][0];
                var y = axes[1][0];
    
                var padding = _.defaults(
                    node.padding || {},
                    { L:0, B:0, R:0, T:0 });
    
                var L = options.left + padding.L;
                var T = options.top  + padding.T;
    
                var W = options.width  - (padding.L + padding.R);
                var H = options.height - (padding.T + padding.B);
    
                var xScale = x.scaleDim && node.scale(x.scaleDim, x.scaleType)[getRangeMethod(x.scaleType)]([0, W], 0.1);
                var yScale = y.scaleDim && node.scale(y.scaleDim, y.scaleType)[getRangeMethod(y.scaleType)]([H, 0], 0.1);
    
                axes[0][0].scale = xScale;
                axes[1][0].scale = yScale;
    
                var X_AXIS_POS = [0, H + x.padding];
                var Y_AXIS_POS = [0 - y.padding, 0];
    
                var container = options
                    .container
                    .append('g')
                    .attr('class', 'cell')
                    .attr('transform', translate(L, T));
    
                !x.hide && fnDrawDimAxis.call(container, x, X_AXIS_POS, 'x axis');
                !y.hide && fnDrawDimAxis.call(container, y, Y_AXIS_POS, 'y axis');
    
                var grid = fnDrawGrid.call(container, node, H, W);
    
                var nR = node.$matrix.sizeR();
                var nC = node.$matrix.sizeC();
    
                var cellW = W / nC;
                var cellH = H / nR;
    
                node.$matrix.iterate(function (iRow, iCol, subNodes) {
                    subNodes.forEach(function (node) {
    
                        node.options = {
                            container: grid,
                            width: cellW,
                            height: cellH,
                            top: iRow * cellH,
                            left: iCol * cellW,
                            xScale: xScale,
                            yScale: yScale
                        };
    
                        continueTraverse(node);
                    });
                });
            },
    
            'ELEMENT/POINT': function (node) {
    
                var filteredData = node.partition();
                var srcData = node.source();
    
                var options = node.options || {};
    
                var color = tau
                    .data
                    .scale
                    .color10()
                    .domain(_(srcData).chain().pluck(node.color).uniq().value());
    
                var size = d3
                    .scale
                    .linear()
                    .range([0, options.width / 100])
                    .domain([
                        0,
                        _(srcData).chain().pluck(node.size).max().value()
                    ]);
    
                var update = function () {
                    return this
                        .attr('r', function (d) {
                            var s = size(d[node.size]);
                            if (_.isNaN(s)) {
                                s = options.width / 100;
                            }
                            return s;
                        })
                        .attr('class', function (d) {
                            return 'dot i-role-datum ' + color(d[node.color]);
                        })
                        .attr('cx', function (d) {
                            return options.xScale(d[node.x]);
                        })
                        .attr('cy', function (d) {
                            return options.yScale(d[node.y]);
                        });
                };
    
                var elements = options.container.selectAll('.dot').data(filteredData);
                elements.call(update);
                elements.exit().remove();
                elements.enter().append('circle').call(update);
            },
    
            'ELEMENT/INTERVAL': function (node) {
    
                var options = node.options || {};
    
                var update = function () {
                    return this
                        .attr('class', 'i-role-datum  bar')
                        .attr('x', function (d) {
                            return options.xScale(d[node.x]);
                        })
                        .attr('width', options.xScale.rangeBand())
                        .attr('y', function (d) {
                            return options.yScale(d[node.y]);
                        })
                        .attr('height', function (d) {
                            return options.height - options.yScale(d[node.y]);
                        });
                };
    
    
                var elements = options.container.selectAll(".bar").data(node.partition());
                elements.call(update);
                elements.enter().append('rect').call(update);
                elements.exit().remove();
            },
    
            'ELEMENT/LINE': function (node) {
    
                var options = node.options || {};
    
                var updatePaths = function () {
                    this.attr('d', line);
                };
    
                var updateLines = function () {
    
                    var paths = this.selectAll('path').data(function (d) {
                        return [d.values];
                    });
    
                    paths.call(updatePaths);
                    paths.enter().append('path').call(updatePaths);
                    paths.exit().remove();
                };
    
                var line = d3
                    .svg
                    .line()
                    .x(function (d) {
                        return options.xScale(d[node.x]);
                    })
                    .y(function (d) {
                        return options.yScale(d[node.y]);
                    });
    
                var lines = options.container
                    .append('g')
                    .attr("class", "line")
                    .attr('stroke', '#4daf4a')
                    .append("path")
                    .datum(node.partition())
                    .attr("d", line);
    
                /*.selectAll('.line').data(data);
                 lines.call(updateLines);
                 lines.enter().append('g').call(updateLines);
                 lines.exit().remove();*/
            }
        };
    
        TNodeMap['COORDS/RECT'] = TNodeMap['COORDS.RECT'];
    
        return function (unitType) {
    
            if (!TNodeMap.hasOwnProperty(unitType)) {
                throw new Error('Unknown unit type: ' + unitType);
            }
    
            return TNodeMap[unitType];
        };
    
    })();

    var $$dsl$reader$$SCALE_STRATEGIES = {
    
        'ordinal': function(domain)  {return domain},
    
        'linear': function(domain)  {return d3.extent(domain)}
    };

    var $$dsl$reader$$metaFilter = function(filterPredicates, row)  {return _.every(filterPredicates, function(fnPredicate)  {return fnPredicate(row)})};

    var $$dsl$reader$$DSLReader = function (ast) {
        this.ast = ast;
    };

    $$dsl$reader$$DSLReader.prototype = {
        traverse: function (rawData) {
            var unit = this.ast.unit;
    
            var decorateUnit = function(unit) {
    
                unit.source = function(filter)  {return _(rawData).filter(filter || (function()  {return true}))};
    
                unit.partition = function()  {return unit.source(unit.$filter)};
    
                // TODO: memoize
                unit.domain = function(dim)  {return _(rawData).chain().pluck(dim).uniq().value()};
    
                // TODO: memoize
                unit.scale = function(scaleDim, scaleType)  {return d3.scale[scaleType]().domain($$dsl$reader$$SCALE_STRATEGIES[scaleType](unit.domain(scaleDim)))};
    
                return unit;
            };
    
            var buildLogicalGraphRecursively = function (unitRef) {
                return $$unit$visitor$factory$$TUnitVisitorFactory(unitRef.type)(decorateUnit(unitRef), buildLogicalGraphRecursively);
            };
            return buildLogicalGraphRecursively(unit);
        },
        traverseToNode: function (refUnit, rawData, c) {
            this.container =  d3
                .select(this.ast.container)
                .append("svg")
                .style("border", 'solid 1px')
                .attr("width", this.ast.W)
                .attr("height", this.ast.H);
    
            refUnit.options = {
                container: this.container,
                width: this.ast.W,
                height: this.ast.H,
                top: 0,
                left: 0
            };
    
            var decorateUnit = function(unit) {
    
                unit.source = function(filter)  {return _(rawData).filter(filter || (function()  {return true}))};
    
                unit.partition = function()  {return unit.source($$dsl$reader$$metaFilter.bind(null, unit.$filter))};
    
                // TODO: memoize
                unit.domain = function(dim)  {return _(rawData).chain().pluck(dim).uniq().value()};
    
                // TODO: memoize
                unit.scale = function(scaleDim, scaleType)  {return d3.scale[scaleType]().domain($$dsl$reader$$SCALE_STRATEGIES[scaleType](unit.domain(scaleDim)))};
    
                return unit;
            };
    
            var renderLogicalGraphRecursively = function (unitRef) {
                return $$node$visitor$factory$$TNodeVisitorFactory(unitRef.type)(decorateUnit(unitRef), renderLogicalGraphRecursively);
            };
    
            renderLogicalGraphRecursively(refUnit);
    
            return refUnit.options.container;
        }
    };

    function tau$newCharts$$Chart(config) {
        this.config = _.defaults(config, {
            spec: null,
            data: [],
            plugins: []
        });
        this.plugins = this.config.plugins;
        this.spec = this.config.spec;
        this.data = this.config.data;
        this.reader = new $$dsl$reader$$DSLReader(this.spec);
        var render = this._render(this.reader.traverse(this.data));
        this._chart = render.node();
    
        //plugins
        this._plugins = new tau$newCharts$$Plugins(this.config.plugins);
        render.selectAll('.i-role-datum').call(tau$newCharts$$propagateDatumEvents(this._plugins));
    }

    tau$newCharts$$Chart.prototype = {
        _render: function (graph) {
            return this.reader.traverseToNode(graph, this.data);
        },
        getSvg: function () {
            return this._chart;
        }/*,
        appendTo: function (el) {
            return d3.select(el).node().appendChild(this._chart);
        }*/
    };

    //plugins
    /** @class
     * @extends Plugin */
    var tau$newCharts$$Plugins = Class.extend({
        /** @constructs */
        init: function (plugins) {
            this._plugins = plugins;
        },
    
        _call: function (name, args) {
            for (var i = 0; i < this._plugins.length; i++) {
                if (typeof(this._plugins[i][name]) == 'function') {
                    this._plugins[i][name].apply(this._plugins[i], args);
                }
            }
        },
    
        render: function (context, tools) {
            this._call('render', arguments);
        },
    
        click: function (context, tools) {
            this._call('click', arguments);
        },
    
        mouseover: function (context, tools) {
            this._call('mouseover', arguments);
        },
    
        mouseout: function (context, tools) {
            this._call('mouseout', arguments);
        },
    
        mousemove: function (context, tools) {
            this._call('mousemove', arguments);
        }
    });

    var tau$newCharts$$propagateDatumEvents = function (plugins) {
        return function () {
            this
                .on('click', function (d) {
                    plugins.click(new tau$newCharts$$ElementContext(d), new tau$newCharts$$ChartElementTools(d3.select(this)));
                })
                .on('mouseover', function (d) {
                    plugins.mouseover(new tau$newCharts$$ElementContext(d), new tau$newCharts$$ChartElementTools(d3.select(this)));
                })
                .on('mouseout', function (d) {
                    plugins.mouseout(new tau$newCharts$$ElementContext(d), new tau$newCharts$$ChartElementTools(d3.select(this)));
                })
                .on('mousemove', function (d) {
                    plugins.mousemove(new tau$newCharts$$ElementContext(d), new tau$newCharts$$ChartElementTools(d3.select(this)));
                });
        };
    };

    /** @class ChartElementTools*/
    var tau$newCharts$$ChartElementTools = Class.extend({
        /** @constructs */
        init: function (element) {
            this.element = element;
        }
    });

    /** @class RenderContext*/
    var tau$newCharts$$RenderContext = Class.extend({
        /** @constructs */
        init: function (dataSource) {
            this.data = dataSource;
        }
    });

    /** @class ElementContext */
    var tau$newCharts$$ElementContext = Class.extend({
        /**
         * @constructs
         * @param datum
         */
        init: function (datum) {
            this.datum = datum;
        }
    });

    /** @class ChartTools */
    var tau$newCharts$$ChartTools = Class.extend({
        /**
         * @constructs
         * @param {ChartLayout} layout
         * @param {Mapper} mapper
         */
        init: function (layout, mapper) {
            this.svg = layout.svg;
            this.html = layout.html;
            this.mapper = mapper;
        },
    
        elements: function(){
            return this.svg.selectAll('.i-role-datum');
        }
    });
    "use strict";
    return tau$newCharts$$Chart;
});