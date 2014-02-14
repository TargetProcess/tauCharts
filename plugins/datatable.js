(function () {
    /** @class DataTable
     * @extends Plugin */
    var DataTable = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {
            // TODO: think about css for plugins
            var container = tools.html.above
                .append('div')
                .attr('class', 'datatable')
                .style('position', 'absolute')
                .style('right', '1px')
                .style('text-align', 'right');

            container
                .append('a')
                .attr('href', '#')
                .html("data table")
                .on('click', function (d) {
                    drawTableFn();
                    toggleTable(tableContainer);
                });

            var tableContainer = container
                .append('div')
                .classed('datatableContent', true)
                .style('display', 'none');

            var drawTableFn = function () {

                var table = tableContainer.append('table'),
                    thead = table.append('thead'),
                    tbody = table.append('tbody');

                // TODO: fix when metadata and data types introduced
                var columns = Object.keys(context.data._data[0]);

                // create the table header
                thead.selectAll('th')
                    .data(columns)
                    .enter()
                    .append('th')
                    .text(tau.data.identity);

                var tr = tbody.selectAll('tr')
                    .data(context.data._data)
                    .enter()
                    .append('tr');

                tr.selectAll('td')
                    .data(function (d) {
                        return d3.values(d)
                    })
                    .enter()
                    .append('td')
                    .text(function (d) {
                        return d
                    });

                drawTableFn = function () {
                };  // We invoke this function only once.
            };

            var toggleTable = function (el) {
                (el.style('display') == 'none') ? el.style('display', 'block') : el.style('display', 'none');
            };
        }
    };

    tau.plugins.add('datatable', DataTable);
})();