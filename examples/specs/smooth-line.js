dev.spec({
    type: 'line',
    x: '0',
    y: '1',
    size: '2',
    label: '2',
    color: '3',
    guide: {
        interpolate: 'smooth-keep-extremum'
    },
    data: [
        [1, 20, 40, 'A'],
        [2, 40, 10, 'A'],
        [3, 40, 20, 'A'],
        [4, 10, 0, 'A'],
        [5, 70, 0, 'A'],
        [6, 0, 20, 'A'],
        [8, 0, 40, 'A'],
        [9, 40, 82, 'A'],
        [10, 20, 40, 'A'],
        [20, 40, 10, 'A'],
        [30, 40, 20, 'A'],
        [40, 10, 0, 'A'],
        [50, 70, 0, 'A'],
        [60, 0, 20, 'A'],
        [80, 0, 40, 'A'],
        [90, 40, 80, 'A'],
        [100, 0, 0, 'A'],
        [10, 70, 20, 'B'],
        [30, 20, 20, 'B'],
        [50, 50, 0, 'B'],
        [70, 10, 0, 'B'],
        [90, 70, 80, 'B']
    ],
    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('quick-filter')(),
        tauCharts.api.plugins.get('tooltip')()
    ]
});