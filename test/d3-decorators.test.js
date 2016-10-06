var expect = require('chai').expect;
var schemes = require('schemes');
var modernizer = require('bower_components/modernizer/modernizr');
var d3Decorator = require('src/utils/d3-decorators');

describe('d3-decorators', function () {
    var div;
    var textLenMeasurer = function (d3Text) {
        return d3Text.text().length * 8;
    };
    beforeEach(()=> {
        div = document.createElement('div');
        div.innerHTML = [
            '<div id="test-div" style="width: 800px; height: 600px">',
            '<svg>',
            '<text class="long" x="0" y="0" dy="10">0123456789ABCDEFGH</text>',
            '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
            '<text class="wrap" x="0" y="0" dy="10">Lorem ipsum dolor sit amet, consectetur adipisicing elit</text>',
            '<text class="longwrap" x="0" y="0" dy="10">0123456789ABCDEFGH 0123456789ABCDEFGH</text>',
            '</svg>',
            '</div>'
        ].join('');
        document.body.appendChild(div);
    });

    afterEach(function () {
        div.parentNode.removeChild(div);
    });

    it('should cut continuous text', function () {
        var d3Text = d3.select(div).selectAll('text.long');
        d3Decorator.cutText(d3Text, () => 100, textLenMeasurer);
        expect(d3Text.text()).to.equal('01234567...');
    });

    it('should cut intermittent text', function () {
        var d3Text = d3.select(div).selectAll('text.word');
        d3Decorator.cutText(d3Text, () => 100, textLenMeasurer);
        expect(d3Text.text()).to.equal('012345 6...');
    });

    it('should wrap text', function () {
        var d3Text = d3.select(div).selectAll('text.wrap');
        d3Decorator.wrapText(d3Text, () => 100, 3, 10, true, textLenMeasurer);
        expect(div.innerHTML).to.equal([
            '<div id="test-div" style="width: 800px; height: 600px">',
            '<svg>',
            '<text class="long" x="0" y="0" dy="10">0123456789ABCDEFGH</text>',
            '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
            '<text class="wrap" x="0" y="0" dy="10">',
            '<tspan x="0" y="-10" dy="10em">Lorem ipsum</tspan>',
            '<tspan x="0" y="-10" dy="11.1em">dolor sit</tspan>',
            '<tspan x="0" y="-10" dy="12.2em">amet, co...</tspan>',
            '</text>',
            '<text class="longwrap" x="0" y="0" dy="10">0123456789ABCDEFGH 0123456789ABCDEFGH</text>',
            '</svg>',
            '</div>'
        ].join(''));
    });

    it('should wrap continuous text', function () {
        var d3Text = d3.select(div).selectAll('text.long');
        d3Decorator.wrapText(d3Text, () => 100, 3, 10, true, textLenMeasurer);
        expect(div.innerHTML).to.equal([
            '<div id="test-div" style="width: 800px; height: 600px">',
            '<svg>',
            '<text class="long" x="0" y="0" dy="10">',
            '<tspan x="0" y="0" dy="10em">01234567...</tspan>',
            '</text>',
            '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
            '<text class="wrap" x="0" y="0" dy="10">Lorem ipsum dolor sit amet, consectetur adipisicing elit</text>',
            '<text class="longwrap" x="0" y="0" dy="10">0123456789ABCDEFGH 0123456789ABCDEFGH</text>',
            '</svg>',
            '</div>'
        ].join(''));
    });

    it('should wrap several continuous text tokens', function () {
        var d3Text = d3.select(div).selectAll('text.longwrap');
        d3Decorator.wrapText(d3Text, () => 100, 3, 10, true, textLenMeasurer);
        expect(div.innerHTML).to.equal([
            '<div id="test-div" style="width: 800px; height: 600px">',
            '<svg>',
            '<text class="long" x="0" y="0" dy="10">0123456789ABCDEFGH</text>',
            '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
            '<text class="wrap" x="0" y="0" dy="10">Lorem ipsum dolor sit amet, consectetur adipisicing elit</text>',
            '<text class="longwrap" x="0" y="0" dy="10">',
            '<tspan x="0" y="0" dy="10em">01234567...</tspan>',
            '</text>',
            '</svg>',
            '</div>'
        ].join(''));
    });

    it('should extend D3 transition attr and store future values', function (done) {
        var node = div.querySelector('text');
        var transition = d3Decorator.d3_transition;

        var check = function (fn, final) {
            return function () {
                var err;
                try {
                    fn();
                    if (final) {
                        expect(transitionInterrupted).to.equal(true);
                        done();
                    }
                } catch (e) {
                    err = e;
                }
                if (err) {
                    done(err);
                } else if (final) {
                    done();
                }
            };
        };
        var final = function (fn) {
            return check(fn, true);
        };

        var transitionInterrupted = false;

        check(function () {
            // Start transition "dy"
            var texts = transition(
                d3.select(div).selectAll('text').data([{n: 4}, {n: 3}, {n: 2}, {n: 1}]),
                200)
                .attr('dy', 0)
                .onTransitionEnd(check(function () {
                    transitionInterrupted = true;
                    expect(node.__transitionAttrs__.dy).to.equal(0);
                    expect(node.__transitionAttrs__.x).to.equal(4);
                }));
            expect(node.__transitionAttrs__.dy).to.equal(0);
            expect(+node.getAttribute('dy')).to.equal(10);
            expect(function () {
                texts.attr();
            }).to.throw(/Unexpected.*arguments/);

            // Start transition "x" and "dy" with delay
            setTimeout(check(function () {
                expect(+node.getAttribute('dy')).to.be.above(0);
                expect(+node.getAttribute('dy')).to.be.below(10);
                transition(d3.select(div).selectAll('text'), 200)
                    .attr({
                        'x': function (d) { return d.n; },
                        'dy': 0
                    })
                    .onTransitionEnd(final(function () {
                        expect(+node.getAttribute('dy')).to.equal(0);
                        expect(+node.getAttribute('x')).to.equal(4);
                        expect(node.__transitionAttrs__).to.be.undefined;
                    }));
            }), 100);
        })();
    });

    it('should not create D3 transition when zero animation duration', function () {
        var texts = d3Decorator.d3_transition(d3.select(div).selectAll('text'), 0).attr('dy', 0);
        expect(+div.querySelector('text').getAttribute('dy')).to.equal(0);
    });
});
