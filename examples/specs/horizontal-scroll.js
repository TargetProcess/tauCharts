dev.spec({
    type: 'stacked-bar',
    trendline: null,
    dimensions: {
        'sports': {
            type: 'category',
            scale: 'ordinal'
        },
        'count': {
            type: 'measure',
            scale: 'linear'
        },
        'country': {
            type: 'category',
            scale: 'ordinal'
        }
    },
    guide: [
        {
            x: {
                label: 'Sport'
            }
        },
        {
            x: {
                label: 'Country'
            },
            y: {
                label: 'SUM(Total Medals)'
            },
            color: {
                label: 'Country'
            }
        }
    ],
    tooltip: {
        fields: [
            'country',
            'count',
            'sports',
            'country'
        ],
        formatters: {
            'country': {
                label: 'Country'
            },
            'count': {
                label: 'SUM(Total Medals)'
            },
            'sports': {
                label: 'Sport'
            }
        }
    },
    x: [
        'sports',
        'country'
    ],
    y: [
        'count'
    ],
    color: 'country',

    data: dev.dataset('medals'),

    plugins: [
        Taucharts.api.plugins.get('legend')(),
        Taucharts.api.plugins.get('tooltip')()
    ]
});
