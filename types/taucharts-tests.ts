import tauCharts from 'taucharts';

// Create simple chart
{
    let chart = new tauCharts.Chart({

        type: 'bar',

        x: 'team',
        y: 'effort',
        color: 'team',

        data: [
            { team: 'Alaska', effort: 100 },
            { team: 'Buntai', effort: 120 }
        ]
    });

    chart.renderTo('#container');
}

// Create chart with facets, plugins, custom colors and custom settings
{
    let chart = new tauCharts.Chart({

        type: 'bar',

        x: ['year', 'team'],
        y: 'effort',
        color: 'type',
        label: 'effort',

        data: [
            { year: '2015', team: 'Alaska', type: 'Bug', effort: 100 },
            { year: '2015', team: 'Buntai', type: 'Bug', effort: 120 },
            { year: '2015', team: 'Alaska', type: 'Feature', effort: 20 },
            { year: '2015', team: 'Buntai', type: 'Feature', effort: 80 },
            { year: '2017', team: 'Alaska', type: 'Bug', effort: 80 },
            { year: '2017', team: 'Buntai', type: 'Bug', effort: 120 },
            { year: '2017', team: 'Buntai', type: 'Feature', effort: 140 }
        ],

        guide: [
            {},
            {
                color: {
                    brewer: {
                        'Bug': '#DD4422',
                        'Feature': '#22AA88'
                    }
                }
            }
        ],

        plugins: [
            tauCharts.api.plugins.get('tooltip')(),
            tauCharts.api.plugins.get('legend')(),
            tauCharts.api.plugins.get('quick-filter')(),
            tauCharts.api.plugins.get('annotations')({
                items: [
                    {
                        dim: 'effort',
                        val: 90,
                        text: 'Limit',
                        color: '#212325'
                    }
                ]
            })
        ],

        settings: {
            asyncRendering: true
        }
    });

    chart.renderTo('#container');
}

// Setup custom period and format
{
    tauCharts.api.tickPeriod.add('half-year', {
        cast(d) {
            var date = new Date(d);
            date.setUTCHours(0, 0, 0, 0);
            date.setUTCDate(1);
            var currentMonth = date.getUTCMonth();
            var firstHalfMonth = currentMonth - (currentMonth % 6);
            return new Date(date.setUTCMonth(firstHalfMonth));
        },
        next(d) {
            var prev = new Date(d);
            var next = new Date(prev.setUTCMonth(prev.getUTCMonth() + 6));
            return this.cast(next);
        }
    }, { utc: true });

    tauCharts.api.tickFormat.add('half-year-utc', (x) => {
        var date = new Date(x);
        var m = date.getUTCMonth();
        var h = (m - (m % 6)) / 6 + 1;
        var ending: { [n: number]: string } = { 1: 'st', 2: 'nd' };
        return h + ending[h] + ' half of ' + date.getUTCFullYear();
    });

    let periodChart = new tauCharts.Chart({

        type: 'stacked-bar',
        x: 'date',
        y: 'effort',
        color: 'type',

        data: [
            { date: new Date('2015-02-07'), type: 'Bug', effort: 50 },
            { date: new Date('2015-02-08'), type: 'Bug', effort: 20 },
            { date: new Date('2015-05-03'), type: 'Feature', effort: 30 },
            { date: new Date('2015-05-07'), type: 'Bug', effort: 20 },
            { date: new Date('2015-07-03'), type: 'Feature', effort: 60 },
            { date: new Date('2015-08-07'), type: 'Bug', effort: 30 }
        ],

        dimensions: {
            'effort': {
                type: 'measure',
                scale: 'linear'
            },
            'date': {
                type: 'category',
                scale: 'period'
            }
        },

        settings: {
            utcTime: true
        },

        guide: {
            x: {
                tickFormat: 'half-year-utc',
                tickPeriod: 'half-year'
            }
        }
    });

    periodChart.renderTo('#container');
}
