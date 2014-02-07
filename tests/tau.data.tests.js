/*global module, test, ok, deepEqual, expect */

(function () {
    test('environment check', function () {
        var f = function () {
        };
        ok(f.bind, 'Function.prototype.bind defined');
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

    module('tau.data.Mapper', {});

    test('should map data', function () {
        var mapper = tau.data.Mapper({
            to: tau.data.map('from')
        });

        var data = {
            from: 1
        };

        equal(mapper.map("to")(data), 1);
    });

    test('should give access to raw data', function () {
        var mapper = tau.data.Mapper({
            to: tau.data.map('from').linear().range([10, 0])
        });

        var data = {
            from: 2
        };

        equal(mapper.raw("to")(data), 2);
    });

    test('should provide an option to set aliases', function () {
        var mapper = tau.data.Mapper({
            to: tau.data.map('from').linear().range([0, 10])
        });

        var data = {
            alias: 0
        };

        mapper.alias("to", "alias");

        equal(mapper.map("to")(data), 0);
    });
})();
