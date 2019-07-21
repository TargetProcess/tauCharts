import {expect} from 'chai';
import schemes from './utils/schemes';
import tauChart from '../src/tau.charts';

    describe("Formatter registry", function () {

        var iso = function (str) {
            var offsetHrs = new Date(str).getTimezoneOffset() / 60;
            var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
            return (str + '+' + offsetISO);
        };
        var utc = function (str) {
            return (str + 'Z');
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
            var jan01 = new Date('2013-01-01T00:00:00');
            var oct30 = new Date('2014-10-30T23:59:59');
            var nov02 = new Date('2014-11-02T23:59:59');
            var jan01utc = new Date('2013-01-01T00:00:00Z');
            var oct30utc = new Date('2014-10-30T23:59:59Z');
            var nov02utc = new Date('2014-11-02T23:59:59Z');

            expect(registry.get('day')(oct30)).to.equal('30-Oct-2014');
            expect(registry.get('week')(nov02)).to.equal('02-Nov-2014');
            expect(registry.get('day-utc')(oct30utc)).to.equal('30-Oct-2014');
            expect(registry.get('week-utc')(nov02utc)).to.equal('02-Nov-2014');

            expect(registry.get('month')(jan01)).to.equal('January, 2013');
            expect(registry.get('month')(oct30)).to.equal('October');
            expect(registry.get('month-utc')(jan01utc)).to.equal('January, 2013');
            expect(registry.get('month-utc')(oct30utc)).to.equal('October');

            expect(registry.get('month-year')(oct30)).to.equal('October, 2014');
            expect(registry.get('year')(oct30)).to.equal('2014');
            expect(registry.get('quarter')(oct30)).to.equal('Q4 2014');
            expect(registry.get('month-year-utc')(oct30utc)).to.equal('October, 2014');
            expect(registry.get('year-utc')(oct30utc)).to.equal('2014');
            expect(registry.get('quarter-utc')(oct30utc)).to.equal('Q4 2014');

            expect(registry.get('day-short')(oct30)).to.equal('30-Oct');
            expect(registry.get('week-short')(nov02)).to.equal('02-Nov');
            expect(registry.get('month-short')(jan01)).to.equal('Jan \'13');
            expect(registry.get('month-short')(oct30)).to.equal('Oct');
            expect(registry.get('day-short-utc')(oct30utc)).to.equal('30-Oct');
            expect(registry.get('week-short-utc')(nov02utc)).to.equal('02-Nov');
            expect(registry.get('month-short-utc')(jan01utc)).to.equal('Jan \'13');
            expect(registry.get('month-short-utc')(oct30utc)).to.equal('Oct');

            expect(registry.get('x-num-auto')(2000)).to.equal('2k');
            expect(registry.get('x-num-auto')(22000.22)).to.equal('22k');
            expect(registry.get('x-num-auto')(22000000)).to.equal('22M');
            expect(registry.get('x-num-auto')(22200002)).to.equal('22.2M');
            expect(registry.get('x-num-auto')(0.10234)).to.equal('0.1');
            expect(registry.get('x-num-auto')(25.10234)).to.equal('25.1');
            expect(registry.get('x-num-auto')(0.1234)).to.equal('0.12');
            expect(registry.get('x-num-auto')(0.0123)).to.equal('0.012');
            expect(registry.get('x-num-auto')(0.00222)).to.equal('0.0022');
            expect(registry.get('x-num-auto')(0.0000000000222)).to.equal('2.2e-11');
            expect(registry.get('x-num-auto')(0.0000000000202)).to.equal('2e-11');
            expect(registry.get('x-num-auto')(0)).to.equal('0');

            expect(registry.get('x-num-auto')(-27.10234)).to.equal('-27.1');
            expect(registry.get('x-num-auto')(-0.10234)).to.equal('-0.1');
            expect(registry.get('x-num-auto')(-0.1234)).to.equal('-0.12');
            expect(registry.get('x-num-auto')(-0.0123)).to.equal('-0.012');
            expect(registry.get('x-num-auto')(-0.00223)).to.equal('-0.0022');
            expect(registry.get('x-num-auto')(-0)).to.equal('0');

            expect(registry.get('percent')(-0.1234)).to.equal('-12.34%');
            expect(registry.get('percent')(-0.102034)).to.equal('-10.2%');
            expect(registry.get('percent')(-0.0123)).to.equal('-1.23%');
            expect(registry.get('percent')(-0.0022)).to.equal('-0.22%');
            expect(registry.get('percent')(2)).to.equal('200%');
        });

        it("should support d3 formats", function () {
            expect(registry.get('.2s')(22000)).to.equal('22k');
            expect(registry.get('.2s')(22000000)).to.equal('22M');
            expect(registry.get('.0s')(0.02)).to.equal('20m');
            expect(registry.get('.0s')(0.0002)).to.equal('200µ');
        });

        it("should allow to add custom formats", function () {
            registry.add('custom', function (x) {
                return x.toString() + '?!'
            });

            expect(registry.get('custom')(42)).to.equal('42?!');
        });
    });
