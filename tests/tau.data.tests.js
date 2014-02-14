/*global module, test, ok, deepEqual, expect */

(function () {
    test('environment check', function () {
        var f = function () {
        };
        ok(f.bind, 'Function.prototype.bind defined');
    });

    test('tau.data.identity', function(){
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

    test('should support formatting', function () {
        var mapper = tau.data.Mapper({
            t1: tau.data.map('f1').linear().range([0, 10]),
            t2: tau.data.map('f2').linear().range([10, 0])
        });

        var data = {
            f1: 0,
            f2: 0
        };

        equal(mapper.map("t1: %t1%, t2: %t2%")(data), "t1: 0, t2: 10");
        equal(mapper.raw("t1: %t1%, t2: %t2%")(data), "t1: 0, t2: 0");
    });
})();
