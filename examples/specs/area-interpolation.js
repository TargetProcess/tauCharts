dev.spec({
    type: 'stacked-area',
    x: 'date',
    y: 'effort',
    color: 'team',
    guide: {
        interpolate: 'smooth'
    },
    data: [
        {team: 'Alpha', date: '2015-07-15', effort: 400, phase: 'dev'},
        {team: 'Alpha', date: '2015-07-16', effort: 200, phase: 'dev'},
        {team: 'Alpha', date: '2015-07-17', effort: 300, phase: 'release'},
        {team: 'Alpha', date: '2015-07-18', effort: 500, phase: 'release'},
        {team: 'Beta',  date: '2015-07-15', effort: 100, phase: 'dev'},
        {team: 'Beta',  date: '2015-07-16', effort: 200, phase: 'dev'},
        {team: 'Beta',  date: '2015-07-17', effort: 300, phase: 'release'},
        {team: 'Beta',  date: '2015-07-18', effort: 100, phase: 'release'},
        {team: 'Gamma', date: '2015-07-15', effort: 300, phase: 'dev'},
        {team: 'Gamma', date: '2015-07-16', effort: 100, phase: 'dev'},
        {team: 'Gamma', date: '2015-07-17', effort: 100, phase: 'release'},
        {team: 'Gamma', date: '2015-07-18', effort: 200, phase: 'release'}
    ]
});