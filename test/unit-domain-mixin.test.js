describe("Unit domain decorator", function () {

    var data = [
        {"date": +new Date("2014-11-01T17:25:01+03:00"), "effort": 1.0000, "name": "Report", "team": "Exploited", "project": "TP3", "priority": {id:1, name:'low'}   , "business value": {value:3, title:'Must Have'}   , role:'Feature Owner'},
        {"date": +new Date("2014-10-28T14:12:22+03:00"), "effort": 0.0000, "name": "Follow", "team": "Alaska"   , "project": "TP2", "priority": {id:2, name:'medium'}, "business value": {value:1, title:'Nice to have'}, role:'Some Unknown role'},
        {"date": +new Date("2014-10-30T22:01:17+03:00"), "effort": 2.0000, "name": "Errors", "team": "Exploited", "project": "TP2", "priority": {id:3, name:'high'}  , "business value": {value:1, title:'Nice to have'}, role:'QA'}
    ];

    var decorator;
    var PeriodGenerator;
    beforeEach(function () {

        PeriodGenerator = tauChart.__api__.UnitDomainPeriodGenerator;

        decorator = new tauChart.__api__.UnitDomainMixin(
            {
                date    : {type: 'order', scale: 'period'},
                name    : {type: 'category', scale: 'ordinal'},
                project : {type: 'category', scale: 'ordinal'},
                team    : {type: 'category', scale: 'ordinal'},
                effort  : {type: 'measure', scale: 'linear'},
                priority: {
                    type    : 'order',
                    scale   : 'ordinal',
                    value   : 'id'
                },
                'business value': {
                    type    : 'category',
                    scale   : 'ordinal',
                    value   : 'value'
                },
                role: {
                    type    : 'order',
                    scale   : 'ordinal',
                    order   : ['Product Owner', 'Feature Owner', 'QA', 'Developer']
                }
            },
            data);
    });

    it("should decorate with [source] method", function () {
        var unit = decorator.mix({});
        expect(unit.source().length).to.equal(3);
        expect(unit.source({ project: 'TP2' }).length).to.equal(2);
        expect(unit.source({ priority: 1 }).length).to.equal(1);
        expect(unit.source({ 'business value': 1 }).length).to.equal(2);
    });

    it("should decorate with [domain] method", function () {
        var unit = decorator.mix({});
        expect(unit.domain('project')).to.deep.equal(['TP3', 'TP2']);
        expect(unit.domain('team')).to.deep.equal(['Exploited', 'Alaska']);
        expect(unit.domain('name')).to.deep.equal(['Report', 'Follow', 'Errors']);

        expect(unit.domain('effort')).to.deep.equal([0, 1, 2]);

        expect(unit.domain('priority')).to.deep.equal([1, 2, 3]);

        expect(unit.domain('business value')).to.deep.equal([3, 1]);

        expect(unit.domain('role'))
            .to
            .deep
            .equal(['Product Owner', 'Feature Owner', 'QA', 'Developer', 'Some Unknown role']);

        expect(unit.domain('date')).to.deep.equal(
            [
                data[1].date,
                data[2].date,
                data[0].date
            ]);
    });

    it("should decorate with [scaleTo] method", function () {
        var unit = decorator.mix({});

        var dateScale = unit.scaleTo(
            'date',
            [0, 10],
            {
                period: 'day',
                val: PeriodGenerator.get('day')
            });

        expect(dateScale(data[1].date)).to.equal(1);
        expect(dateScale(+new Date("2014-10-29T14:12:22+03:00"))).to.equal(3);
        expect(dateScale(data[2].date)).to.equal(5);
        expect(dateScale(+new Date("2014-10-31T14:12:22+03:00"))).to.equal(7);
        expect(dateScale(data[0].date)).to.equal(9);


        var scaleProject = unit.scaleTo('project', [0, 10]);
        expect(scaleProject('TP2')).to.equal(7.5);
        expect(scaleProject('TP3')).to.equal(2.5);

        var scaleEffort = unit.scaleTo('effort', [0, 10]);
        expect(scaleEffort(0)).to.equal(0);
        expect(scaleEffort(1)).to.equal(5);
        expect(scaleEffort(2)).to.equal(10);

        var scalePriority = unit.scaleTo('priority', [0, 90], {map:'name'});
        expect(scalePriority(data[0].priority)).to.equal(15);
        expect(scalePriority(data[1].priority)).to.equal(45);
        expect(scalePriority(data[2].priority)).to.equal(75);
        assert.equal(scalePriority.hasOwnProperty('rangeRoundBands'), true, 'should support d3 scale interface');

        var propName = 'business value';
        var scaleBV = unit.scaleTo(propName, [0, 100], {map:'title'});
        expect(scaleBV(data[0][propName])).to.equal(25);
        expect(scaleBV(data[1][propName])).to.equal(75);
        assert.equal(scaleBV.hasOwnProperty('rangeRoundBands'), true, 'should support d3 scale interface');

        var scaleRole = unit.scaleTo('role', [0, 100]);

        expect(scaleRole('Feature Owner')).to.equal(10);
        expect(scaleRole('Some Unknown role')).to.equal(30);
        expect(scaleRole('QA')).to.equal(50);

        expect(scaleRole('Product Owner')).to.equal(70);
        expect(scaleRole('Developer')).to.equal(90);

        assert.equal(scaleRole.hasOwnProperty('rangeRoundBands'), true, 'should support d3 scale interface');
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
});