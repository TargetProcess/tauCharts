define(function(require) {
    var assert = require('chai').assert;
    var expect = require('chai').expect;
    var testUtils = require('testUtils');
    var Balloon = require('tau_modules/api/balloon').Tooltip;
    var $ = require('jquery');
    describe('balloon api', function() {
        var classTooltip = 'tooltip';
        var selector = '.' + classTooltip;
        var balloon;
        beforeEach(function() {
            balloon = new Balloon('hello world!!!', {effectClass: 'fade', spacing: 3});
            //  testUtils.loadCss('base/css/tooltip.css').done(done);
        });
        afterEach(function() {
            balloon.destroy();
        });
        it('show', function() {
            balloon.show();
            expect($(selector).hasClass('in')).to.be.true;
        });
        it('hide', function() {
            balloon.hide();
            expect($(selector).hasClass('in')).to.be.false;
        });
        it('getElement', function() {
            balloon.show();
            expect($(selector).get(0)).to.be.equal(balloon.getElement());
        });

        it('toggle', function(done) {
            balloon.show();
            balloon.toggle();
            expect($(selector).hasClass('in')).to.be.false;
            setTimeout(function() {
                balloon.toggle();
                expect($(selector).hasClass('in')).to.be.true;
                done();
            }, 20);
        });
        it('baseClass and type', function() {
            var balloon = new Balloon('hello world!!!', {baseClass: 'myClass', typeClass: 'typeClass'});
            expect($(balloon.getElement()).hasClass('myClass')).to.be.true;
            expect($(balloon.getElement()).hasClass('typeClass')).to.be.true;
            balloon.type('newType');
            balloon.effect('effect');
            expect($(balloon.getElement()).hasClass('typeClass')).to.be.false;
            expect($(balloon.getElement()).hasClass('effect')).to.be.true;
            expect($(balloon.getElement()).hasClass('newType')).to.be.true;
            balloon.effect('');
            expect($(balloon.getElement()).hasClass('effect')).to.be.false;

        });
        it('position', function() {
            balloon.position(63, 63);
            assert.ok(true, 'should position');
        });
        it('content', function() {
            balloon.show();
            balloon.content('<div class="myClass">test content</div>');
            assert.equal($(selector).find('.myClass').text(), 'test content', 'content string');
            var div = $('<div class="myClass1">test content</div>')[0];
            balloon.content(div);
            assert.equal($(selector).find('.myClass1').text(), 'test content', 'content dom element');
        });
        it('reposition and attach and destroy and detach', function(done) {
            Balloon.reposition();
            assert.ok(true, 'should reposition');
            var $div = $('<div style="height: 100px;width: 100px"/>').appendTo('body');
            var awareBalloon = new Balloon('hello world!!!', {auto: true});
            awareBalloon.attach($div[0]).show();
            Balloon.reposition();

            assert.ok(true, 'should reposition');
            setTimeout(function() {
                awareBalloon.detach();
                awareBalloon.destroy();
                assert.equal(awareBalloon.element, null, 'should destroy');
                $div.remove();
                done();
            }, 20);
        });
        it('place', function() {
            balloon.show(10, 10);
            var places = ['bottom', 'top', 'left', 'right', 'right-top', 'right-left', 'right-bottom', 'top-left', 'top-right', 'bottom-right', 'bottom-left', 'left-top', 'left-bottom'];
            places.forEach(function(place) {
                balloon.place(place);
                assert.ok(true);
            });

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
    describe('balloon without new operator', function() {
        var balloon;
        beforeEach(function() {
            balloon = Balloon('hello world!', {spacing: 3, auto: true});
        });
        afterEach(function() {
            balloon.destroy();
        });
        it('balloon', function() {
            expect(balloon).to.be.instanceof(Balloon);
        });
        it('auto position top', function(done) {
            var $div = $('<div  style="position:absolute;height: 100px;width: 100px"/>').appendTo('body');
            balloon.show().attach($div[0]);
            expect(balloon.element.classList.contains('bottom')).to.be.true;
         //   Balloon.reposition();
            $div.css({top:'200px',left:'200px'});
            balloon.detach();
            balloon.show().attach($div[0]);
            setTimeout(function(){
                expect(balloon.element.classList.contains('top')).to.be.true;
                done();
            },40);

        });
        it('auto position left', function(done) {
            var $div = $('<div  style="position:absolute;height: 100px;width: 100px"/>').appendTo('body');
            balloon.place('left');
            balloon.show().attach($div[0]);
            expect(balloon.element.classList.contains('right')).to.be.true;
            $div.css({top:'200px',left:'200px'});
            balloon.detach();
            balloon.show().attach($div[0]);
            setTimeout(function(){
                expect(balloon.element.classList.contains('left')).to.be.true;
                done();
            },20);

        });
        it('auto position top-left', function(done) {
            var $div = $('<div  style="position:absolute;height: 100px;width: 100px"/>').appendTo('body');
            balloon.place('top-left');
            balloon.show().attach($div[0]);
            expect(balloon.element.classList.contains('bottom-left')).to.be.true;
            $div.css({top:'200px',left:'200px'});
            balloon.detach();
            balloon.show().attach($div[0]);
            setTimeout(function(){
                expect(balloon.element.classList.contains('top-left')).to.be.true;
                done();
            },20);

        });
        it('auto position top-right', function(done) {
            var $div = $('<div  style="position:absolute;height: 100px;width: 100px"/>').appendTo('body');
            balloon.place('top-right');
            balloon.show().attach($div[0]);
            expect(balloon.element.classList.contains('bottom-right')).to.be.true;
            $div.css({top:'200px',left:'200px'});
            balloon.detach();
            balloon.show().attach($div[0]);
            setTimeout(function(){
                expect(balloon.element.classList.contains('top-right')).to.be.true;
                done();
            },20);

        });

    });
});