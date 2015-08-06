window.samples.push({

    name: 'Scatterplot of exoplanets period / eccentricity correlation',
    desc: 'There are some exoplanets similar to Earth by eccentricity and period',
    spec: {

        type: 'scatterplot',
        x: ['eccentricity'],
        y: ['period'],
        color: 'name',
        size: 'mass',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')()
        ],

        data: exoplanets

    }
});