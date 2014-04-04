/*global module, test, ok, deepEqual, expect */

(function () {
    test('environment check', function () {
        var f = function () {
        };
        ok(f.bind, 'Function.prototype.bind defined');
    });

    test('tau.data.identity', function () {
        equal(1, tau.data.identity(1));
    });

    module('tau.data.Array', {});

    test('should support filtering', function () {
        var dataSource = tau.data.Array([1, 2]);
        dataSource.filter(function (d) {
            return d == 1;
        });
        dataSource.get(function (data) {
            deepEqual(data, [1]);
        });
    });

    test('should notify about updates', function () {
        expect(2);

        var dataSource = tau.data.Array([1, 2]);

        dataSource.update(function (data) {
            ok(true, 'should notify about update');
        });
        
        dataSource.update(function (data) {
            deepEqual(data, [1]);
        });

        dataSource.filter(function (d) {
            return d == 1;
        });
    });

    module('tau.data.MapperBuilder: scatterPlot', {
        mapper: function (config) {
            var meta = {
                x: {type: tau.data.types.quantitative},
                y: {type: tau.data.types.quantitative},
                color: {type: tau.data.types.categorical, default: 0},
                size: {type: tau.data.types.quantitative, default: 10}
            };

            return new tau.data.MapperBuilder().config(config).build(meta);
        }
    });

    test('should support string mapping using default scales', function () {
        var mapper = this.mapper({
            x: 'p_x',
            y: 'p_y',
            color: 'p_color',
            size: 'p_size'
        });

        var data = {
            p_x: 1,
            p_y: 2,
            p_color: 0,
            p_size: 5
        };

        equal(mapper.map('x')(data), 1);
        equal(mapper.map('y')(data), 2);
        equal(mapper.map('color')(data), 'color10-1');
        equal(mapper.map('size')(data), 5);
    });

    test('should support auto mapping', function () {
        var mapper = this.mapper({});

        var data = {
            x: 1,
            y: 2,
            color: 0,
            size: 5
        };

        equal(mapper.map('x')(data), 1);
        equal(mapper.map('y')(data), 2);
        equal(mapper.map('color')(data), 'color10-1');
        equal(mapper.map('size')(data), 5);
    });

    test('should support optional properties', function () {
        var mapper = this.mapper({});

        var data = {
            x: 1,
            y: 2
        };

        equal(mapper.map('color')(data), 'color10-1');
        equal(mapper.map('size')(data), 10);
    });

    test('should support advanced mapping', function () {
        var mapper = this.mapper({
            x: tau.data.map('p_x').linear().range([10, 0]),
            y: tau.data.map('p_y').linear().range([10, 0])
        });

        var data = {
            p_x: 0.5,
            p_y: 0.6
        };

        equal(mapper.map('x')(data), 5, 'should use custom scale');
        equal(mapper.raw('x')(data), 0.5, 'should give access to raw data');
        equal(mapper.map('x: %x%, y: %y%')(data), 'x: 5, y: 4', 'should support formatting (map)');
        equal(mapper.raw('x: %x%, y: %y%')(data), 'x: 0.5, y: 0.6', 'should support formatting (raw)');
    });

    test('should support aliases', function () {
        var mapper = this.mapper({
            x: tau.data.map('p_x').linear().range([0, 10]),
            y: tau.data.map('p_y').linear().range([0, 10])
        });

        var data = {
            alias: 0
        };

        mapper.alias('x', 'alias');

        equal(mapper.map('x')(data), 0);
        equal(mapper.raw('x')(data), 0);
    });
})();
