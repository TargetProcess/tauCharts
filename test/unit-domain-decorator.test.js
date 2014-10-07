describe("Unit visitor factory", function () {

    var data = [
        {"effort": 1.0000, "name": "Report", "team": "Exploited", "project": "TP3"},
        {"effort": 0.0000, "name": "Follow", "team": "Alaska", "project": "TP2"},
        {"effort": 2.0000, "name": "Errors", "team": "Exploited", "project": "TP2"}
    ];

    var decorator;
    beforeEach(function () {
        decorator = new tauChart.__api__.UnitDomainDecorator(
            {
                project     : { scaleType: 'ordinal' },
                team        : { scaleType: 'ordinal' },
                cycleTime   : { scaleType: 'linear' },
                effort      : { scaleType: 'linear' }
            },
            data);
    });

    it("should have [source] method", function () {

        var unit = decorator.decorate({});

        expect(unit.source().length).to.equal(3);
        // expect(position(dots[1])).to.deep.equal({x: '0', y: '800'});
    });
});