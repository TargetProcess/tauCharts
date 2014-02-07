(function () {


    /** @class DataTable
     * @extends Plugin */
    var DataTable = {

        init: function(){
            this._container = d3.select('body').append('div').classed('datatable', true);
        },
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */
        render: function (context, tools) {

            var tableLink = this._container.append('a').attr('href', '#').html("data table");
            var tableContainer = this._container.append('div').classed('datatableContent', true);;

            //TODO: this is quite dangerous, may broke
            var shift = tools.d3.node().getBoundingClientRect();

            this._container.style('top', '2px').style('left', shift.right - 60 + 'px');

            var drawTableFn = function() {

                var table = tableContainer.append('table');

                    thead = table.append('thead'),
                    tbody = table.append('tbody');

                    var columns = Object.keys(context.data._data[0]); //TODO: dirty hack...
                    // create the table header
                    thead.selectAll('th')
                        .data(columns)
                        .enter()
                        .append('th')
                        .text(function(d) {return d});

                    var tr = tbody.selectAll('tr')
                        .data(context.data._data)
                        .enter()
                        .append('tr');

                    tr.selectAll('td')
                      .data(function(d) {return d3.values(d)})
                      .enter()
                      .append('td')
                      .text(function(d) {return d});

                drawTableFn = function() {};  // We invoke this function only once.
            };

            var toggleTable = function(el) {
                (el.style('display') == 'none') ? el.style('display', 'block') : el.style('display', 'none');
            };

            tableLink.on('click', function(d) {
                drawTableFn();
                toggleTable(tableContainer);
            });
        }
    };

    tau.plugins.add('datatable', DataTable);
})();