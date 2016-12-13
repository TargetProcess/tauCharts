dev.spec((function () {
    function rand(n) {
        if (arguments.length === 1 && typeof n === 'number') {
            return Math.round(Math.random() * n);
        }
        return arguments[Math.round(Math.random() * (arguments.length - 1))];
    }
    return {
        type: 'horizontal-bar',
        x: 'hours',
        y: ['team', 'type'],
        color: 'status',
        label: 'hours',
        data: utils.flatten(utils.range(3).map(function (i) {
            var team = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'][i];
            return utils.range(5).map(function (i) {
                var status = ['No Epic', 'Ideation', 'Planning', 'Development', 'Sourcing'][i];
                return utils.range(2).map(function (i) {
                    var type = ['Plan', 'Actual'][i];
                    return {
                        team: team,
                        hours: rand(50),
                        status: status,
                        type: type
                    };
                });
            });
        }))
    };
})());