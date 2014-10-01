var TMatrix = (function () {

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

export {TMatrix}