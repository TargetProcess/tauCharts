define(function (require) {
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var Balloon = require('tau_modules/api/balloon').Tooltip;
    var $ = require('jquery');
    describe('balloon api', function () {
        var classTooltip = 'tooltip';
        var selector = '.' + classTooltip;
        var balloon = new Balloon('hello world!!!');
        it('show and hide', function () {
            balloon.show();
            expect($(selector).hasClass('in')).to.be.true;
        });
        it('hide', function () {
            balloon.hide();
            expect($(selector).hasClass('in')).to.be.false;
        });
        balloon.show()
        it('position', function () {
            var $div = $('<div/>').appendTo('body');

            $div.position({left:10,top:10});
            balloon.position(10,10);
        });
        /* balloon.type();
         balloon.effect();
         balloon.content();
         balloon.place();
         balloon.updateSize();
         balloon.attach();
         balloon.detach();
         balloon.position();
         balloon.getElement();
         balloon.show();
         balloon.hide();
         balloon.destroy();*/
    });
    describe('balloon without new operator', function () {
        var balloon = Balloon('');
        it('ballon', function () {
            expect(balloon).to.be.instanceof(Balloon);
        });
    });
});