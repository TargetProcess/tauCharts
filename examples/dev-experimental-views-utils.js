function onBrushHandler (filters, activeChart) {

        var handlers = {
                inset: function (dim, args) {
                        return dim + ' IN ("' + args.join('","') + '")';
                }
                ,
                between: function (dim, args) {
                        return (dim + ' >= ' + args[0] + ' AND ' + dim + ' <= ' + args[1]);
                }
        };

        var jsonWhere = filters
            .reduce(function (memo, item) {
                    var p = item.dim;
                    var f = item.func;
                    var a = item.args;

                    var fnMatch = function () {
                            return true;
                    };

                    if (f === 'between') {
                            fnMatch = function (row) {
                                    return (row[p] >= a[0]) && (a[1] >= row[p]);
                            };
                    }

                    if (f === 'inset') {
                            fnMatch = function (row) {
                                    return a.indexOf(row[p]) >= 0;
                            };
                    }

                    return memo.concat(fnMatch);

            }, [_.identity.bind(null, true)]);

        var sqlWhere = filters
            .map(function (f) {
                    return handlers[f.func](f.dim, f.args);
            })
            .join(' AND ');

        $('#gfilter').val(sqlWhere);
        drawTable(sqlWhere);
        redraw(jsonWhere, activeChart);
}

function clearFilter() {
        $('#gfilter').val('');
        redraw([_.identity.bind(null, true)], null);
        drawTable();
}

var drawTable = function (currWhere) {

        var cols = [
                'Title',
                'Country',
                'Genre',
                'Language',
                'oscarWins',
                'gotAnOscar',
                'gotBestPictureOscar',
                'Decade',
                'Year',
                "imdbRating",
                "tomatoRating",
                'imdbVotes',
                'Director'
        ].join(',');

        var records = xsql('SELECT ' + cols + ' FROM ? WHERE ' + (currWhere || '1')).map(function (x) {
                var len = 25;
                x.Title = x.Title.substring(0, len) + ((x.Title.length > len) ? '...' : '');
                return x;
        });

        new Handsontable($('#T0').empty()[0],
            {
                    data: records,
                    colHeaders: Object.keys(records[0] || {}),
                    minSpareCols: 1,
                    minSpareRows: 1,
                    rowHeaders: true,
                    contextMenu: false,
                    width: 1200
            });
};

var showData = function (groups, _0_, activeChart) {

        var jsonWhere = Object
            .keys(groups)
            .reduce(function (memo, k) {
                    var v = groups[k];
                    return memo.concat(function (row) {
                            return row[k] == v;
                    });
            }, []);

        var where = Object
            .keys(groups)
            .reduce(function (memo, k) {
                    var v = groups[k];
                    var str = _.isString(v) ? (k + ' IN ("' + v + '")') : (k + ' = ' + v);
                    return memo.concat(str);
            }, [])
            .join(' AND ');

        $('#gfilter').val(where);

        drawTable(where);
        redraw(jsonWhere, activeChart);
};

function parseGroupBy(query) {
        var gi = query.indexOf('GROUP BY');
        if (gi < 0) return [];

        var gArgs = query.substr(query.indexOf('GROUP BY') + ('GROUP BY').length);
        var oi = gArgs.indexOf('ORDER BY');
        var eol = ((oi < 0) ? gArgs.length : oi);
        var tokens = (gArgs
            .substring(0, eol)
            .split(',')
            .map(function (x) {
                    return x.trim();
            }));

        return tokens;
}

var data = datasets.OscarNominees;
var xsql = function (query, isGlobal) {
        var globFilter = $('#gfilter').val() || '1';
        return (alasql(query,
                isGlobal ? [data] : [alasql('SELECT * FROM ? WHERE ' + globFilter, [data])])
        );
};