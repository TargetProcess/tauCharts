dev.spec({

    title: 'Scatterplot of period / mass correlation',
    description: 'There are no data on exoplanets similar to Earth by mass',

    type: 'scatterplot',
    x: ['mass'],
    y: ['period'],
    color: 'name',
    size: 'eccentricity',

    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')()
    ],

    data: dev.dataset('exoplanets', function (data) {
        return data.filter(function (row) {
            return row['jupiter mass'] <= 1;
        });
    })
});
