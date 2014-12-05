define(function (require) {
    var expect = require('chai').expect;
    var schemes = require('schemes');
    var tauChart = require('tau_modules/tau.newCharts');
    describe("Formatter registry", function () {

        var offsetHrs = new Date().getTimezoneOffset() / 60;
        var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
        var iso = function (str) {
            return (str + '+' + offsetISO);
        };

        var registry;
        beforeEach(function () {
            registry = tauChart.api.tickFormat;
        });

        it("should use *.toString() by default", function () {
            var defaultFormatter = registry.get(null);

            expect(defaultFormatter(undefined)).to.equal('');
            expect(defaultFormatter(null)).to.equal('');
            expect(defaultFormatter(0)).to.equal('0');
            expect(defaultFormatter('')).to.equal('');

            expect(defaultFormatter(false)).to.equal('false');
            expect(defaultFormatter(true)).to.equal('true');

            expect(defaultFormatter('str')).to.equal('str');
            expect(defaultFormatter(-42)).to.equal('-42');
        });

        it("should allow alias for null or undefined value", function () {
            var alias = '<NIL>';
            var defaultFormatter = registry.get(null, alias);

            expect(defaultFormatter(undefined)).to.equal(alias);
            expect(defaultFormatter(null)).to.equal(alias);

            expect(defaultFormatter(0)).to.equal('0');
            expect(defaultFormatter('')).to.equal('');

            expect(defaultFormatter(false)).to.equal('false');
            expect(defaultFormatter(true)).to.equal('true');

            expect(defaultFormatter('str')).to.equal('str');
            expect(defaultFormatter(-42)).to.equal('-42');
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

            expect(registry.get('x-num-auto')(22000)).to.equal('22k');
            expect(registry.get('x-num-auto')(22000000)).to.equal('22M');
            expect(registry.get('x-num-auto')(0.10234)).to.equal('0.1');
            expect(registry.get('x-num-auto')(25.10234)).to.equal('25.1');
            expect(registry.get('x-num-auto')(0.1234)).to.equal('0.12');
            expect(registry.get('x-num-auto')(0.0123)).to.equal('0.01');
            expect(registry.get('x-num-auto')(0.0022)).to.equal('0');

            expect(registry.get('x-num-auto')(-27.10234)).to.equal('-27.1');
            expect(registry.get('x-num-auto')(-0.10234)).to.equal('-0.1');
            expect(registry.get('x-num-auto')(-0.1234)).to.equal('-0.12');
            expect(registry.get('x-num-auto')(-0.0123)).to.equal('-0.01');
            expect(registry.get('x-num-auto')(-0.0022)).to.equal('0');

            expect(registry.get('percent')(-0.1234)).to.equal('-12.34%');
            expect(registry.get('percent')(-0.102034)).to.equal('-10.2%');
            expect(registry.get('percent')(-0.0123)).to.equal('-1.23%');
            expect(registry.get('percent')(-0.0022)).to.equal('-0.22%');
            expect(registry.get('percent')(2)).to.equal('200%');
        });

        it("should support d3 formats", function () {
            expect(registry.get('s')(22000)).to.equal('22k');
            expect(registry.get('s')(22000000)).to.equal('22M');
            expect(registry.get('s')(0.02)).to.equal('20m');
            expect(registry.get('s')(0.0002)).to.equal('200µ');
        });

        it("should allow to add custom formats", function () {
            registry.add('custom', function (x) {
                return x.toString() + '?!'
            });

            expect(registry.get('custom')(42)).to.equal('42?!');
        });
    });
});