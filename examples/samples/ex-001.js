window.samples.push({

    name: 'Scatterplot of period / mass correlation',
    desc: 'There are no data on exoplanets similar to Earth by mass',
    spec: {

        type: 'scatterplot',
        x: ['mass'],
        y: ['period'],
        color: 'name',
        size: 'eccentricity',

        plugins: [
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('tooltip')()
        ],

        data: exoplanets.filter(function (row) {
            return row['jupiter mass'] <= 1;
        })
    }
});