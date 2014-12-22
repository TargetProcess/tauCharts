define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var modernizer = require('modernizer');
    var utilsDraw = require('tau_modules/utils/utils-draw').utilsDraw;

    describe("utils-draw", function () {
        var div;
        var textLenMeasurer = function(d3Text) {
            return d3Text.text().length * 8;
        };
        beforeEach(function () {
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

        it("should cut continuous text", function () {
            var d3Text = d3.select(div).selectAll('text.long');
            utilsDraw.cutText(d3Text, 100, textLenMeasurer);
            expect(d3Text.text()).to.equal('0123456789AB...');
        });

        it("should cut intermittent text", function () {
            var d3Text = d3.select(div).selectAll('text.word');
            utilsDraw.cutText(d3Text, 100, textLenMeasurer);
            expect(d3Text.text()).to.equal('012345 6789A...');
        });

        it("should wrap text", function () {
            var d3Text = d3.select(div).selectAll('text.wrap');
            utilsDraw.wrapText(d3Text, 100, 3, 10, true, textLenMeasurer);
            expect(div.innerHTML).to.equal([
                '<div id="test-div" style="width: 800px; height: 600px">',
                '<svg>',
                '<text class="long" x="0" y="0" dy="10">0123456789ABCDEFGH</text>',
                '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
                '<text class="wrap" x="0" y="0" dy="10">',
                '<tspan x="0" y="-10" dy="10em">Lorem ipsum</tspan>',
                '<tspan x="0" y="-10" dy="11.1em">dolor sit</tspan>',
                '<tspan x="0" y="-10" dy="12.2em">amet, consec...</tspan>',
                '</text>',
                '<text class="longwrap" x="0" y="0" dy="10">0123456789ABCDEFGH 0123456789ABCDEFGH</text>',
                '</svg>',
                '</div>'
            ].join(''));
        });

        it("should wrap continuous text", function () {
            var d3Text = d3.select(div).selectAll('text.long');
            utilsDraw.wrapText(d3Text, 100, 3, 10, true, textLenMeasurer);
            expect(div.innerHTML).to.equal([
                '<div id="test-div" style="width: 800px; height: 600px">',
                '<svg>',
                '<text class="long" x="0" y="0" dy="10">',
                '<tspan x="0" y="0" dy="10em">0123456789AB...</tspan>',
                '</text>',
                '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
                '<text class="wrap" x="0" y="0" dy="10">Lorem ipsum dolor sit amet, consectetur adipisicing elit</text>',
                '<text class="longwrap" x="0" y="0" dy="10">0123456789ABCDEFGH 0123456789ABCDEFGH</text>',
                '</svg>',
                '</div>'
            ].join(''));
        });

        it("should wrap several continuous text tokens", function () {
            var d3Text = d3.select(div).selectAll('text.longwrap');
            utilsDraw.wrapText(d3Text, 100, 3, 10, true, textLenMeasurer);
            expect(div.innerHTML).to.equal([
                '<div id="test-div" style="width: 800px; height: 600px">',
                '<svg>',
                '<text class="long" x="0" y="0" dy="10">0123456789ABCDEFGH</text>',
                '<text class="word" x="0" y="0" dy="10">012345 6789A BCDEFGH</text>',
                '<text class="wrap" x="0" y="0" dy="10">Lorem ipsum dolor sit amet, consectetur adipisicing elit</text>',
                '<text class="longwrap" x="0" y="0" dy="10">',
                '<tspan x="0" y="0" dy="10em">0123456789AB...</tspan>',
                '</text>',
                '</svg>',
                '</div>'
            ].join(''));
        });
    });
});