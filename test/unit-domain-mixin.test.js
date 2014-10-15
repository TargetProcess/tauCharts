describe("Unit domain decorator", function () {

    var data = [
        {"effort": 1.0000, "name": "Report", "team": "Exploited", "project": "TP3", "priority": { id: 1, name: 'low'}},
        {"effort": 0.0000, "name": "Follow", "team": "Alaska", "project": "TP2", "priority": { id: 2, name: 'medium'}},
        {"effort": 2.0000, "name": "Errors", "team": "Exploited", "project": "TP2", "priority": { id: 3, name: 'high'}}
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
                    name: function(x) { return x.name }
                }
            },
            data);
    });

    it("should decorate with [source] method", function () {
        var unit = decorator.mix({});
        expect(unit.source().length).to.equal(3);
        expect(unit.source({ project: 'TP2' }).length).to.equal(2);
        expect(unit.source({ priority: 1 }).length).to.equal(1);
    });

    it("should decorate with [domain] method", function () {
        var unit = decorator.mix({});
        expect(unit.domain('project').sort()).to.deep.equal(['TP2', 'TP3']);
        expect(unit.domain('team').sort()).to.deep.equal(['Alaska', 'Exploited']);
        expect(unit.domain('name').sort()).to.deep.equal(['Errors', 'Follow', 'Report']);
        expect(unit.domain('effort').sort()).to.deep.equal([0, 1, 2]);

        expect(unit.domain('priority')).to.deep.equal([1, 2, 3]);
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
        var part0 = unit0.partition();
        expect(part0).to.deep.equal(data);

        var unit1 = decorator.mix({
            $where: {
                project: 'TP2',
                team: 'Alaska'
            }
        });
        var part1 = unit1.partition();
        expect(part1).to.deep.equal([data[1]]);

        var unit2 = decorator.mix({
            $where: {
                project: 'Non-Existent-Project',
                team: 'Alaska'
            }
        });
        var part2 = unit2.partition();
        expect(part2).to.deep.equal([]);
    });
});