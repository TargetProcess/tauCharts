(function () {

    function rand(n) {
        if (arguments.length === 1 && typeof n === 'number') {
            return Math.round(Math.random() * n);
        }
        return arguments[Math.round(Math.random() * (arguments.length - 1))];
    }

    var barData = utils.flatten(utils.range(3).map(function (i) {
        var team = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'][i];
        return utils.range(5).map(function (i) {
            var status = ['No Epic', 'Ideation', 'Planning', 'Development', 'Sourcing'][i];
            return utils.range(2).map(function (i) {
                var type = ['Plan', 'Actual'][i];
                return {
                    team: team,
                    hours: rand(50),
                    status: status,
                    type: type
                };
            });
        });
    }));

    dev.spec((function () {
        return {
            type: 'bar',
            y: 'hours',
            x: ['team', 'type'],
            color: 'status',
            label: 'hours',
            data: barData
        };
    })());

    (function () {

        var counter = 0;
        var getId = function () {
            return ++counter;
        };

        var storeProp = '__transitionAttrs__';

        function selectAll(node, selector) {
            return Array.prototype.slice.call(node.querySelectorAll(selector), 0);
        }

        function diff() {
            return {
                init: function (chart) {
                    this.instanceId = getId();
                    this.chart = chart;
                },

                onRender: function () {
                    var id = this.instanceId;
                    var chart = this.chart;
                    var svg = chart.getSVG()
                    var defs = svg.querySelector('.diff__defs');
                    if (!defs) {
                        defs = d3.select(svg).append('defs')
                            .attr('class', 'diff__defs');
                    }
                    var labels = selectAll(svg, '.i-role-label');
                    var barGroups = selectAll(svg, '.i-role-bar-group');
                    barGroups.forEach(function (group, gi) {
                        var bars = selectAll(group, '.bar');
                        utils.range(bars.length / 2).forEach(function (i) {
                            var bar0 = bars[i * 2];
                            var bar1 = bars[i * 2 + 1];

                            var attr0 = bar0[storeProp];
                            var attr1 = bar1[storeProp];

                            var fill = window.getComputedStyle(bar0).fill;

                            var decreasing = (Number(attr0.height) > Number(attr1.height));

                            var patternId = ('diff__pattern-' + id + '-' + gi + '-' + i);
                            var pattern = defs.append('pattern')
                                .attr('id', patternId)
                                .attr('patternUnits', 'userSpaceOnUse')
                                .attr('x', 0)
                                .attr('y', 0)
                                .attr('width', 16)
                                .attr('height', 16);
                            // .attr('width', 2)
                            // .attr('height', 2);

                            if (decreasing) {
                                bar0.setAttribute('x', attr0.x);
                                bar0.setAttribute('y', attr0.y);
                                bar0.setAttribute('width', attr0.width);
                                bar0.setAttribute('height', String(attr0.height - attr1.height));
                                bar1.setAttribute('x', attr1.x);
                                bar1.setAttribute('y', attr1.y);
                                bar1.setAttribute('width', attr1.width);
                                bar1.setAttribute('height', attr1.height);

                                pattern.append('path')
                                    .attr('d', 'M0,1 v14 l1,1 h14 Z M16,15 v-14 l-1,-1 h-14 Z')
                                    .attr('opacity', 0.125)
                                    .attr('fill', d3.interpolate(fill, 'red')(0.5));
                                // pattern.append('path')
                                //     .attr('d', 'M0,1 v-1 h1 l15,15 v1 h-1 Z M15,0 h1 v1 Z M1,16 v-1 h-1 Z')
                                //     .attr('fill', fill);
                                // pattern.append('path')
                                //     .attr('d', 'M0,1 v-1 h1 l15,15 v1 h-1 Z M15,0 h1 v1 Z M1,16 v-1 h-1 Z')
                                // //     .attr('fill', '#d75');
                                // pattern.append('circle')
                                //     .attr('cx', 1)
                                //     .attr('cy', 1)
                                //     .attr('r', 1)
                                //     .attr('fill', fill);
                                // pattern.append('circle')
                                //     .attr('cx', 9)
                                //     .attr('cy', 9)
                                //     .attr('r', 1)
                                //     .attr('fill', fill);
                                // pattern.append('circle')
                                //     .attr('cx', 24)
                                //     .attr('cy', 8)
                                //     .attr('r', 2)
                                //     .attr('fill', '#d75');
                                // pattern.append('circle')
                                //     .attr('cx', 0)
                                //     .attr('cy', 24)
                                //     .attr('r', 2)
                                //     .attr('fill', '#d75');
                                // pattern.append('circle')
                                //     .attr('cx', 16)
                                //     .attr('cy', 24)
                                //     .attr('r', 2)
                                //     .attr('fill', '#d75');
                                // pattern.append('circle')
                                //     .attr('cx', 32)
                                //     .attr('cy', 24)
                                //     .attr('r', 2)
                                //     .attr('fill', '#d75');
                                d3.select(bar0).style('fill', 'url(#' + patternId + ')');
                            } else {
                                bar0.setAttribute('x', attr0.x);
                                bar0.setAttribute('y', attr0.y);
                                bar0.setAttribute('width', attr0.width);
                                bar0.setAttribute('height', attr0.height);
                                bar1.setAttribute('x', attr1.x);
                                bar1.setAttribute('y', attr1.y);
                                bar1.setAttribute('width', attr1.width);
                                bar1.setAttribute('height', String(attr1.height - attr0.height));

                                pattern.append('path')
                                    .attr('d', 'M0,15 v-14 l1,-1 h14 Z M16,1 v14 l-1,1 h-14 Z')
                                    // .attr('opacity', 0.875)
                                    .attr('fill', fill);
                                // pattern.append('rect')
                                //     .attr('x', 0)
                                //     .attr('y', 0)
                                //     .attr('width', 16)
                                //     .attr('height', 16)
                                //     .attr('fill', fill);
                                // pattern.append('path')
                                //     .attr('d', 'M1,16 h-1 v-1 l15,-15 h1 v1 Z M0,1 v-1 h1 Z M16,15 v1 h-1 Z')
                                //     .attr('fill', '#5ec');

                                // pattern.append('circle')
                                //     .attr('cx', 8)
                                //     .attr('cy', 8)
                                //     .attr('r', 8)
                                //     .attr('fill', fill);
                                // pattern.append('circle')
                                //     .attr('cx', 24)
                                //     .attr('cy', 8)
                                //     .attr('r', 8)
                                //     .attr('fill', fill);
                                // pattern.append('circle')
                                //     .attr('cx', 0)
                                //     .attr('cy', 24)
                                //     .attr('r', 8)
                                //     .attr('fill', fill);
                                // pattern.append('circle')
                                //     .attr('cx', 16)
                                //     .attr('cy', 24)
                                //     .attr('r', 8)
                                //     .attr('fill', fill);
                                // pattern.append('circle')
                                //     .attr('cx', 32)
                                //     .attr('cy', 24)
                                //     .attr('r', 8)
                                //     .attr('fill', fill);
                                d3.select(bar1).style('fill', 'url(#' + patternId + ')');
                            }

                            d3.select(bar0).transition();
                            d3.select(bar1).transition();

                            var label0 = labels.filter(function (l) {
                                return l.__data__ === bar0.__data__;
                            })[0];
                            var label1 = labels.filter(function (l) {
                                return l.__data__ === bar1.__data__;
                            })[0];

                            if (label0 && label1) {

                                var labelToHide = label0;
                                var labelToShow = label1;

                                labelToShow.textContent = (
                                    // label1.textContent +
                                    // '(' +
                                    (decreasing ? '▼' : '▲') +
                                    // Math.abs(label1.textContent - label0.textContent)// +
                                    Math.round(Math.abs(label1.textContent - label0.textContent) / Math.max(label1.textContent, label0.textContent) * 100) + '%'// +
                                    // ')'
                                );

                                labelToHide.parentNode.removeChild(labelToHide);
                                // d3.select(labelToShow).style('fill', decreasing ? 'rgb(195, 47, 24)' : 'rgb(49, 167, 80)');

                            } else {
                                label0 && label0.parentNode.removeChild(label0);
                                label1 && label1.parentNode.removeChild(label1);
                            }
                        });
                    });
                    // debugger;
                },

                destroy: function () {

                }
            };
        }

        tauCharts.api.plugins.add('diff', diff);

    })();

    dev.spec((function () {
        function rand(n) {
            if (arguments.length === 1 && typeof n === 'number') {
                return Math.round(Math.random() * n);
            }
            return arguments[Math.round(Math.random() * (arguments.length - 1))];
        }
        return {
            type: 'bar',
            y: 'hours',
            x: ['team'/*, 'type'*/],
            color: 'status',
            label: 'hours',
            data: barData,
            plugins: [
                tauCharts.api.plugins.get('diff')()
            ]
        };
    })());

})();