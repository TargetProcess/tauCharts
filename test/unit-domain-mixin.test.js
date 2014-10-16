describe("Unit domain decorator", function () {

    var data = [
        {"effort": 1.0000, "name": "Report", "team": "Exploited", "project": "TP3", "priority": {id:1, name:'low'}   , "business value": {value:3, title:'Must Have'}   , role:'Feature Owner'},
        {"effort": 0.0000, "name": "Follow", "team": "Alaska"   , "project": "TP2", "priority": {id:2, name:'medium'}, "business value": {value:1, title:'Nice to have'}, role:'Some Unknown role'},
        {"effort": 2.0000, "name": "Errors", "team": "Exploited", "project": "TP2", "priority": {id:3, name:'high'}  , "business value": {value:1, title:'Nice to have'}, role:'QA'}
    ];

    var decorator;
    beforeEach(function () {
        decorator = new tauChart.__api__.UnitDomainMixin(
            {
                project: {scaleType: 'ordinal'},
                team: {scaleType: 'ordinal'},
                effort: {scaleType: 'linear'},
                priority: {
                    scaleType: 'ordinal',
                    id: function(x) { return x.id },
                    name: function(x) { return x.name },
                    sort: -1
                },
                'business value': {
                    scaleType: 'ordinal',
                    id: function(x) { return x.value },
                    name: function(x) { return x.title },
                    sort: 1
                },
                role: {
                    scaleType: 'ordinal',
                    index: ['Product Owner', 'Feature Owner', 'QA', 'Developer'],
                    sort: -1
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
        expect(unit.domain('project').sort()).to.deep.equal(['TP2', 'TP3']);
        expect(unit.domain('team').sort()).to.deep.equal(['Alaska', 'Exploited']);
        expect(unit.domain('name').sort()).to.deep.equal(['Errors', 'Follow', 'Report']);
        expect(unit.domain('effort').sort()).to.deep.equal([0, 1, 2]);

        expect(unit.domain('priority')).to.deep.equal([3, 2, 1]);
        expect(unit.domain('priority', function(x) { return x.name })).to.deep.equal(['high', 'medium', 'low']);

        expect(unit.domain('business value')).to.deep.equal([1, 3]);
        expect(unit.domain('business value', function(x) { return x.title })).to.deep.equal(['Nice to have', 'Must Have']);

        expect(unit.domain('role')).to.deep.equal(['Some Unknown role', 'Developer', 'QA', 'Feature Owner', 'Product Owner']);
    });

    it("should decorate with [scaleTo] method", function () {
        var unit = decorator.mix({});
        var scaleProject = unit.scaleTo('project', [0, 10]);
        expect(scaleProject('TP2')).to.equal(7.5);
        expect(scaleProject('TP3')).to.equal(2.5);

        var scaleEffort = unit.scaleTo('effort', [0, 10]);
        expect(scaleEffort(0)).to.equal(0);
        expect(scaleEffort(1)).to.equal(5);
        expect(scaleEffort(2)).to.equal(10);
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