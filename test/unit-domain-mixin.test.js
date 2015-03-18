define(function (require) {

    // ignore for a while
    return;

    var expect = require('chai').expect;
    var assert = require('chai').assert;
    var UnitDomainMixin = require('src/unit-domain-mixin').UnitDomainMixin;
    describe("Unit domain decorator", function () {

        var decorator;
        var offsetHrs = new Date().getTimezoneOffset() / 60;
        var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
        var iso = function (str) {
            return (str + '+' + offsetISO);
        };

        var data = [
            {
                "date": new Date(iso("2014-11-01T00:00:00")),
                "time": new Date(iso("2014-11-01T17:25:01")),
                "effort": 1.0000,
                "name": "Report",
                "team": "Exploited",
                "project": "TP3",
                "priority": {id: 1, name: 'low'},
                "business value": {value: 3, title: 'Must Have'},
                role: 'Feature Owner'
            },
            {
                "date": +new Date(iso("2014-10-28T00:00:00")),
                "time": +new Date(iso("2014-10-28T14:12:22")),
                "effort": 0.0000,
                "name": "Follow",
                "team": "Alaska",
                "project": "TP2",
                "priority": null,
                "business value": {value: 1, title: 'Nice to have'},
                role: 'Some Unknown role'
            },
            {
                "date": iso("2014-10-30T00:00:00"),
                "time": iso("2014-10-30T22:01:17"),
                "effort": 2.0000,
                "name": "Errors",
                "team": "Exploited",
                "project": "TP2",
                "priority": {id: 3, name: 'high'},
                "business value": {value: 1, title: 'Nice to have'},
                role: 'QA'
            }
        ];


        beforeEach(function () {


            decorator = new UnitDomainMixin(
                {
                    date: {type: 'order', scale: 'period'},
                    time: {type: 'measure', scale: 'time'},
                    name: {type: 'category', scale: 'ordinal'},
                    project: {type: 'category', scale: 'ordinal'},
                    team: {type: 'category', scale: 'ordinal'},
                    effort: {type: 'measure', scale: 'linear'},
                    priority: {
                        type: 'order',
                        scale: 'ordinal',
                        value: 'id'
                    },
                    'business value': {
                        type: 'category',
                        scale: 'ordinal',
                        value: 'value'
                    },
                    role: {
                        type: 'order',
                        scale: 'ordinal',
                        order: ['Product Owner', 'Feature Owner', 'QA', 'Developer']
                    }
                },
                data);
        });

        it("should decorate with [source] method", function () {
            var unit = decorator.mix({});
            expect(unit.source().length).to.equal(3);
            expect(unit.source({project: 'TP2'}).length).to.equal(2);
            expect(unit.source({priority: 1}).length).to.equal(1);
            expect(unit.source({'business value': 1}).length).to.equal(2);
        });

        it("should decorate with [domain] method", function () {
            var unit = decorator.mix({});
            expect(unit.domain('project')).to.deep.equal(['TP3', 'TP2']);
            expect(unit.domain('team')).to.deep.equal(['Exploited', 'Alaska']);
            expect(unit.domain('name')).to.deep.equal(['Report', 'Follow', 'Errors']);

            expect(unit.domain('effort')).to.deep.equal([0, 1, 2]);

            expect(unit.domain('priority')).to.deep.equal([null, 1, 3]);

            expect(unit.domain('business value')).to.deep.equal([3, 1]);

            expect(unit.domain('role'))
                .to
                .deep
                .equal(['Product Owner', 'Feature Owner', 'QA', 'Developer', 'Some Unknown role']);

            expect(unit.domain('date')).to.deep.equal(
                [
                    new Date(data[1].date).getTime(),
                    new Date(data[2].date).getTime(),
                    new Date(data[0].date).getTime()
                ]);

            expect(unit.domain('time')).to.deep.equal(
                [
                    new Date(data[1].time).getTime(),
                    new Date(data[2].time).getTime(),
                    new Date(data[0].time).getTime()
                ]);

            expect(unit.domain('non-existent-dim')).to.deep.equal([]);
        });

        it("should decorate with [scaleTo] method", function () {
            var unit = decorator.mix({});

            var dateScale = unit.scaleTo('date', [0, 10], {period: 'day'});
            expect(dateScale(data[1].date)).to.equal(1);
            expect(dateScale(+new Date(iso("2014-10-29T14:12:22")))).to.equal(3);
            expect(dateScale(data[2].date)).to.equal(5);
            expect(dateScale(+new Date(iso("2014-10-31T14:12:22")))).to.equal(7);
            expect(dateScale(data[0].date)).to.equal(9);

            var monthScale = unit.scaleTo('date', [0, 10], {period: 'month'});
            expect(monthScale(data[1].date)).to.equal(2.5);
            expect(monthScale(+new Date(iso("2014-10-29T14:12:22")))).to.equal(2.5);
            expect(monthScale(data[2].date)).to.equal(2.5);
            expect(monthScale(+new Date(iso("2014-10-31T14:12:22")))).to.equal(2.5);
            expect(monthScale(data[0].date)).to.equal(7.5);

            var dateMinMaxScale = unit.scaleTo(
                'date',
                [0, 10],
                {
                    period: 'month',
                    min: iso('2014-09-01T00:00:00'),
                    max: iso('2015-01-01T00:00:00')
                });
            expect(dateMinMaxScale(iso('2014-09-01T00:00:00'))).to.equal(1);
            expect(dateMinMaxScale(iso('2014-10-01T00:00:00'))).to.equal(3);
            expect(dateMinMaxScale(iso('2014-10-31T23:59:59'))).to.equal(3);
            expect(dateMinMaxScale(iso('2014-11-01T00:00:00'))).to.equal(5);
            expect(dateMinMaxScale(iso('2014-12-01T00:00:00'))).to.equal(7);
            expect(dateMinMaxScale(iso('2015-01-01T00:00:00'))).to.equal(9);

            expect(dateMinMaxScale(data[2].date)).to.equal(3);
            expect(dateMinMaxScale(data[0].date)).to.equal(5);



            var timeScale = unit.scaleTo('time', [0, 10], {});
            expect(timeScale(data[1].time)).to.equal(0);
            expect(timeScale(data[2].time)).to.equal(5.625925708157991);
            expect(timeScale(data[0].time)).to.equal(10);



            var timeMinMaxScale = unit.scaleTo(
                'time',
                [0, 10],
                {
                    min: iso('2014-09-01T00:00:00'),
                    max: iso('2015-01-01T00:00:00')
                });
            expect(timeMinMaxScale(iso('2014-09-01T00:00:00'))).to.equal(0);
            // 2014-11-01T00:00:00
            expect(timeMinMaxScale(data[0].date)).to.equal(5);
            // 2014-11-01T17:25:01
            expect(timeMinMaxScale(data[0].time)).to.equal(5.059484099878567);
            expect(timeMinMaxScale(iso('2015-01-01T00:00:00'))).to.equal(10);



            var scaleProject = unit.scaleTo('project', [0, 10]);
            expect(scaleProject('TP2')).to.equal(7.5);
            expect(scaleProject('TP3')).to.equal(2.5);

            var scaleEffort = unit.scaleTo('effort', [0, 10]);
            expect(scaleEffort(0)).to.equal(0);
            expect(scaleEffort(1)).to.equal(5);
            expect(scaleEffort(2)).to.equal(10);


            var scaleEffortMinMax = unit.scaleTo('effort', [0, 10], { min: 0, max: 100 });
            expect(scaleEffortMinMax(0)).to.equal(0);
            expect(scaleEffortMinMax(50)).to.equal(5);
            expect(scaleEffortMinMax(100)).to.equal(10);


            var scalePriority = unit.scaleTo('priority', [0, 90], {map: 'name'});
            expect(scalePriority(data[1].priority)).to.equal(15); // null
            expect(scalePriority(data[0].priority)).to.equal(45); // 1
            expect(scalePriority(data[2].priority)).to.equal(75); // 3
            assert.equal(scalePriority.hasOwnProperty('rangeRoundBands'), true, 'should support d3 scale interface');

            var propName = 'business value';
            var scaleBV = unit.scaleTo(propName, [0, 100], {map: 'title'});
            expect(scaleBV(data[0][propName])).to.equal(25);
            expect(scaleBV(data[1][propName])).to.equal(75);
            assert.equal(scaleBV.hasOwnProperty('rangeRoundBands'), true, 'should support d3 scale interface');

            var scaleRole = unit.scaleTo('role', [0, 100]);

            expect(scaleRole('Product Owner')).to.equal(10);
            expect(scaleRole('Feature Owner')).to.equal(30);
            expect(scaleRole('QA')).to.equal(50);
            expect(scaleRole('Developer')).to.equal(70);
            expect(scaleRole('Some Unknown role')).to.equal(90);

            assert.equal(scaleRole.hasOwnProperty('rangeRoundBands'), true, 'should support d3 scale interface');
        });

        it("should decorate with [scaleSize] method", function () {
            var unit0 = decorator.mix({});
            expect(unit0.hasOwnProperty('scaleSize')).to.be.ok;
        });

        it("should decorate with [scaleColor] method", function () {
            var unit0 = decorator.mix({});
            expect(unit0.hasOwnProperty('scaleColor')).to.be.ok;
        });

        it("should decorate with [partition] method", function () {

            var unit0 = decorator.mix({
                $where: {}
            });
            expect(unit0.partition()).to.deep.equal(data);

            var unit1 = decorator.mix({
                $where: {
                    project: 'TP2',
                    team: 'Alaska'
                }
            });
            expect(unit1.partition()).to.deep.equal([data[1]]);

            var unit2 = decorator.mix({
                $where: {
                    project: 'Non-Existent-Project',
                    team: 'Alaska'
                }
            });
            expect(unit2.partition()).to.deep.equal([]);

            var unit3 = decorator.mix({
                $where: {
                    priority: 1,
                    'business value': 3
                }
            });
            expect(unit3.partition()).to.deep.equal([data[0]]);

            var unit4 = decorator.mix({
                $where: {
                    role: 'QA'
                }
            });
            expect(unit4.partition()).to.deep.equal([data[2]]);

            var unit5 = decorator.mix({
                $where: {
                    role: 'Some Unknown role'
                }
            });
            expect(unit5.partition()).to.deep.equal([data[1]]);
        });

        it("should decorate with [groupBy] method", function () {
            var unit = decorator.mix({});

            var by = function(key) {
                var k = JSON.stringify(key);
                return function(item) {
                    return JSON.stringify(item.key) === k;
                };
            };

            var groupByProjects = unit.groupBy(unit.source(), 'project');
            expect(groupByProjects.length).to.equal(2);

            var g1 = groupByProjects.filter(by('TP3'))[0];
            expect(g1.key).to.equal('TP3');
            expect(g1.values.length).to.equal(1);

            var g2 = groupByProjects.filter(by('TP2'))[0];
            expect(g2.key).to.equal('TP2');
            expect(g2.values.length).to.equal(2);

            var groupByPriority = unit.groupBy(unit.source(), 'priority');
            expect(groupByPriority.length).to.equal(3);

            var o1 = groupByPriority.filter(by({ id: 1, name: 'low' }))[0];
            expect(o1.key).to.deep.equal({ id: 1, name: 'low' });
            expect(o1.values.length).to.equal(1);

            var o2 = groupByPriority.filter(by({ id: 3, name: 'high' }))[0];
            expect(o2.key).to.deep.equal({ id: 3, name: 'high' });
            expect(o2.values.length).to.equal(1);

            var o3 = groupByPriority.filter(by(null))[0];
            expect(o3.key).to.deep.equal(null);
            expect(o3.values.length).to.equal(1);
        });
    });
});
