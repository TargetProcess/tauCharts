/*global module, test, ok, deepEqual, expect */

(function () {
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
})();
