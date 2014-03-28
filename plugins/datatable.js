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
            var container = tools.html.right
                .append('div')
                .attr('class', 'datatable');

            container
                .append('a')
                .attr('href', '#')
                .html("Show data table")
                .on('click', function (d) {
                    drawTableFn();
                    toggleTable(container);
                    d3.event.preventDefault();
                });

            var tableContainer = container.append('div');

            var drawTableFn = function () {

                var table = tableContainer.append('table'),
                    thead = table.append('thead'),
                    tbody = table.append('tbody');

                // TODO: fix when metadata and data types introduced
                var columns = Object.keys(context.data._data[0]);

                table
                    .attr('class', function(){return 'col-' + columns.length});

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

                drawTableFn = function () {};  // We invoke this function only once.
            };

            var toggleTable = function (el) {
                (el.attr('class') == 'datatable') ? el.attr('class', 'datatable show') : el.attr('class', 'datatable');
            };
        }
    };

    tau.plugins.add('datatable', DataTable);
})();