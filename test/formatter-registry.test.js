describe("Formatter registry", function () {

    var offsetHrs = new Date().getTimezoneOffset() / 60;
    var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
    var iso = function(str) {
        return (str + '+' + offsetISO);
    };

    var registry;
    beforeEach(function () {
        registry = tauChart.api.tickFormat;
    });

    it("should support default formats", function () {
        var jan01 = new Date(iso('2013-01-01T00:00:00'));
        var oct30 = new Date(iso('2014-10-30T23:59:59'));
        var nov02 = new Date(iso('2014-11-02T23:59:59'));

        expect(registry.get('day')(oct30)).to.equal('30-Oct-2014');
        expect(registry.get('week')(nov02)).to.equal('02-Nov-2014');
        expect(registry.get('week-range')(nov02)).to.equal('02-Nov-2014 - 09-Nov-2014');

        expect(registry.get('month')(jan01)).to.equal('January, 2013');
        expect(registry.get('month')(oct30)).to.equal('October');

        expect(registry.get('month-year')(oct30)).to.equal('October, 2014');
        expect(registry.get('year')(oct30)).to.equal('2014');
        expect(registry.get('quarter')(oct30)).to.equal('Q4 2014');

        expect(registry.get('s')(22000)).to.equal('22k');
        expect(registry.get('s')(22000000)).to.equal('22M');
    });

    it("should support d3 formats", function () {
        expect(registry.get('s')(22000)).to.equal('22k');
        expect(registry.get('s')(22000000)).to.equal('22M');
    });

    it("should allow to add custom formats", function () {
        registry.add('custom', function(x) {
            return x.toString() + '?!'
        });

        expect(registry.get('custom')(42)).to.equal('42?!');
    });
});