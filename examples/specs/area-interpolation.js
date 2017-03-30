dev.spec({
    type: 'stacked-area',
    x: 'date',
    y: 'effort',
    color: 'team',
    guide: {
        interpolate: 'smooth'
    },
    data: [
        {team: 'Alpha', date: '2015-07-15', effort: 400},
        {team: 'Alpha', date: '2015-07-16', effort: 200},
        {team: 'Alpha', date: '2015-07-17', effort: 300},
        {team: 'Alpha', date: '2015-07-18', effort: 500},
        {team: 'Beta', date: '2015-07-15', effort: 100},
        {team: 'Beta', date: '2015-07-16', effort: 200},
        {team: 'Beta', date: '2015-07-17', effort: 300},
        {team: 'Beta', date: '2015-07-18', effort: 100},
        {team: 'Gamma', date: '2015-07-15', effort: 300},
        {team: 'Gamma', date: '2015-07-16', effort: 100},
        {team: 'Gamma', date: '2015-07-17', effort: 100},
        {team: 'Gamma', date: '2015-07-18', effort: 200}
    ]
});