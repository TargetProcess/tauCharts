define(function (require) {
    var Emitter = require('src/event').Emitter;
    var assert = require('chai').assert;
    describe('event emitter', function () {
        var emitter = new Emitter();
        beforeEach(function () {

        });
        it("should work", function (done) {
            var dataEvent = 'dataEvent';
            var context = {};
            var countEvent = 0;
            var countEvent1 = 0;
            var countAll = 0;
            var myEventHandler = {
                'myEvent':function(){
                    countEvent++;
                }
            };
            emitter.addHandler(myEventHandler);
            emitter.on('myEvent', function (evt, data) {
                assert.equal(dataEvent, data);
                countEvent++;
            });
            emitter.on('myEvent', function () {
                countEvent++;
            });
            emitter.on('*', function () {
                countAll++;
            });
            emitter.on('myEven1', function () {
                countEvent1++;
            });
            var callback = function () {
                countEvent1++;
            };
            var subscription = emitter.on('myEven1', callback, context);

            emitter.fire('myEvent', dataEvent);
            emitter.fire('myEven1');
            emitter.removeHandler(subscription, context);
            emitter.removeHandler(myEventHandler);
            emitter.fire('myEvent', dataEvent);
            emitter.fire('myEven1');
            assert.equal(countEvent, 5);
            assert.equal(countEvent1, 3);
            assert.equal(countAll, 4);
            emitter.destroy();
            assert.ok(true, 'should unsubscribe');
            emitter.fire('myEvent', dataEvent);
            emitter.fire('myEven1');
            assert.equal(countEvent, 5,'myEvent');
            assert.equal(countEvent1, 3);
            assert.equal(countAll, 5, 'all events');
            done();

        });
    });
});