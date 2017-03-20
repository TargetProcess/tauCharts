dev.spec({

    _name: 'Scatterplot of exoplanets period / eccentricity correlation',
    _desc: 'There are some exoplanets similar to Earth by eccentricity and period',

    type: 'scatterplot',
    x: ['eccentricity'],
    y: ['period'],
    color: 'name',
    size: 'mass',

    plugins: [
        tauCharts.api.plugins.get('legend')({
            position: 'bottom'
        }),
        tauCharts.api.plugins.get('tooltip')()
    ],

    data: dev.dataset('exoplanets')

});
