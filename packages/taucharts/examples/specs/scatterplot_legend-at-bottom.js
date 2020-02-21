dev.spec({

    description: 'Scatterplot of exoplanets period / eccentricity correlation (There are some exoplanets similar to Earth by eccentricity and period)',

    type: 'scatterplot',
    x: ['eccentricity'],
    y: ['period'],
    color: 'name',
    size: 'mass',

    plugins: [
        Taucharts.api.plugins.get('legend')({
            position: 'bottom'
        }),
        Taucharts.api.plugins.get('tooltip')()
    ],

    data: dev.dataset('exoplanets')

});
