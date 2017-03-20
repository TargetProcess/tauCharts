define(function (require) {
    var expect = require('chai').expect;
    var TaskRunner = require('src/charts/task-runner').default;

    describe('Task Runner', function () {

        it('should run sync tasks', function () {

            var taskRunner = new TaskRunner({
                src: {
                    a: 5
                },
                callbacks: {
                    done: (result) => {
                        expect(result.e).to.equal(9);
                    }
                }
            });

            taskRunner
                .addTask((x) => {
                    return {
                        b: ++x.a
                    };
                })
                .addTask((x, t) => {
                    t.addTask((x) => {
                        return {
                            e: ++x.d
                        };
                    });
                    return {
                        c: ++x.b
                    };
                })
                .addTask((x) => {
                    return {
                        d: ++x.c
                    };
                })
                .run();
        });

        it('should run async tasks', function (done) {

            this.timeout(4000);

            var taskRunner = new TaskRunner({
                src: {
                    a: 5
                },
                timeout: 0,
                syncInterval: 0,
                callbacks: {
                    timeout: (duration, t) => {
                        expect(duration).to.be.above(0);
                        t.setTimeout(Number.MAX_SAFE_INTEGER);
                        t.run();
                    },
                    done: (result) => {
                        expect(result.e).to.equal(9);
                        done();
                    }
                }
            });

            taskRunner
                .addTask((x) => {
                    return {
                        b: ++x.a
                    };
                })
                .addTask((x, t) => {
                    t.stop();
                    setTimeout(() => t.run(), 0);
                    t.addTask((x) => {
                        return {
                            e: ++x.d
                        };
                    });
                    return {
                        c: ++x.b
                    };
                })
                .addTask((x) => {
                    return {
                        d: ++x.c
                    };
                })
                .run();
        });

        it('should handle tasks errors', function () {

            var wasErrorHandled = false;

            var taskRunner = new TaskRunner({
                callbacks: {
                    error: (err) => {
                        wasErrorHandled = true;
                        expect(err.message).to.equal('Task Error');
                    }
                }
            });

            taskRunner
                .addTask(() => {
                    throw new Error('Task Error');
                })
                .run();

            expect(wasErrorHandled).to.be.true;
        });

        it('should throw on unhandled error', function () {

            var taskRunner = new TaskRunner();
            expect(() => {
                taskRunner
                    .addTask(() => {
                        throw new Error('Task Error');
                    })
                    .run();
            }).to.throw('Task Error');
        });

        it('should throw on wrong operations', function () {

            expect(() => {
                var taskRunner = new TaskRunner({
                    timeout: function () { }
                });
            }).to.throw('Task Runner "timeout" property is not "number"');

            expect(() => {
                var taskRunner = new TaskRunner({
                    timeout: Number.MAX_SAFE_INTEGER,
                    syncInterval: Number.MAX_SAFE_INTEGER
                })
                taskRunner
                    .addTask((_, t) => t.run())
                    .run();
            }).to.throw('Task Runner is already running');

            expect(() => {
                var taskRunner = new TaskRunner({
                    timeout: Number.MAX_SAFE_INTEGER,
                    syncInterval: Number.MAX_SAFE_INTEGER
                })
                taskRunner.stop();
            }).to.throw('Task Runner is already stopped');

            expect(() => {
                var taskRunner = new TaskRunner({
                    timeout: 0,
                    syncInterval: 0
                })
                taskRunner.stop();
            }).to.throw('Task Runner is already stopped');
        });
    });
});
