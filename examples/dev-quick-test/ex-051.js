window.samples.push({

    sel: 1111,

    xsize: {
        width: 800,
        height: 380
    },

    data: [
        [24.0, 55.0,   4000, 'P', '0', 'Kowno'],
        [25.3, 54.7,   4000, 'P', '0', 'Wilna'],
        [26.4, 54.4,   4000, 'P', '0', 'Smorgon'],
        [26.8, 54.3,   4000, 'P', '0', 'Molodechno'],
        [27.7, 55.2,   4000, 'P', '0', 'Gloubokoe'],
        [27.6, 53.9,   4000, 'P', '0', 'Minsk'],
        [28.5, 54.3,   4000, 'P', '0', 'Studienska'],
        [28.7, 55.5,   4000, 'P', '0', 'Polotzk'],
        [29.2, 54.4,   4000, 'P', '0', 'Bobr'],
        [30.2, 55.3,   4000, 'P', '0', 'Vitebsk'],
        [30.4, 54.4,   4000, 'P', '0', 'Orscha'],
        [30.4, 53.9,   4000, 'P', '0', 'Mohilow'],
        [32.0, 54.8,   4000, 'P', '0', 'Smolensk'],
        [34.3, 55.2,   4000, 'P', '0', 'Wixma'],
        [34.4, 55.5,   4000, 'P', '0', 'Chjat'],
        [36.0, 55.5,   4000, 'P', '0', 'Mojaisk'],
        [37.6, 55.8,   4000, 'P', '0', 'Moscow'],
        [36.6, 55.3,   4000, 'P', '0', 'Tarantino'],
        [36.5, 55.0,   4000, 'P', '0', 'Malo-jarosewli'],

        [24.0, 54.9, 340000, 'A', '1'],
        [24.5, 55.0, 340000, 'A', '1'],
        [25.5, 54.5, 340000, 'A', '1'],
        [26.0, 54.7, 320000, 'A', '1'],
        [27.0, 54.8, 300000, 'A', '1'],
        [28.0, 54.9, 280000, 'A', '1'],
        [28.5, 55.0, 240000, 'A', '1'],
        [29.0, 55.1, 210000, 'A', '1'],
        [30.0, 55.2, 180000, 'A', '1'],
        [30.3, 55.3, 175000, 'A', '1'],
        [32.0, 54.8, 145000, 'A', '1'],
        [33.2, 54.9, 140000, 'A', '1'],
        [34.4, 55.5, 127100, 'A', '1'],
        [35.5, 55.4, 100000, 'A', '1'],
        [36.0, 55.5, 100000, 'A', '1'],
        [37.6, 55.8, 100000, 'A', '1'],
        [37.7, 55.7, 100000, 'R', '1'],
        [37.5, 55.7,  98000, 'R', '1'],
        [37.0, 55.0,  97000, 'R', '1'],
        [36.6, 55.0,  96000, 'R', '1'],
        [36.8, 55.0,  96000, 'R', '1'],
        [35.4, 55.3,  87000, 'R', '1'],
        [34.3, 55.2,  55000, 'R', '1'],
        [33.3, 54.8,  37000, 'R', '1'],
        [32.0, 54.6,  24000, 'R', '1'],
        [30.4, 54.4,  20000, 'R', '1'],
        [29.2, 54.3,  20000, 'R', '1'],
        [28.5, 54.2,  20000, 'R', '1'],
        [28.3, 54.3,  20000, 'R', '1'],
        [27.5, 54.5,  20000, 'R', '1'],
        [26.8, 54.3,  12000, 'R', '1'],
        [26.4, 54.4,  14000, 'R', '1'],
        [25.0, 54.4,   8000, 'R', '1'],
        [24.4, 54.4,   4000, 'R', '1'],
        [24.2, 54.4,   4000, 'R', '1'],
        [24.1, 54.4,   4000, 'R', '1'],
        [24.0, 55.1,  60000, 'A', '2'],
        [24.5, 55.2,  60000, 'A', '2'],
        [25.5, 54.7,  60000, 'A', '2'],
        [26.6, 55.7,  40000, 'A', '2'],
        [27.4, 55.6,  33000, 'A', '2'],
        [28.7, 55.5,  33000, 'A', '2'],
        [28.7, 55.5,  33000, 'R', '2'],
        [28.5, 54.15, 30000, 'R', '2'],
        [28.3, 54.25, 28000, 'R', '2'],
        [24.0, 55.2,  22000, 'A', '3'],
        [24.5, 55.3,  22000, 'A', '3'],
        [24.6, 55.8,   6000, 'A', '3'],
        [24.6, 55.8,   6000, 'R', '3'],
        [24.2, 54.4,   6000, 'R', '3'],
        [24.1, 54.4,   6000, 'R', '3']
    ].map(function (row) {
            var ar = {
                P: 'Place',
                A: 'Advance',
                R: 'Retreat'
            };
            return {
                lon: row[0],
                lat: row[1],
                survivors: row[2],
                direction: ar[row[3]],
                group: row[4],
                place: row[5]
            };
        }),

    type: 'line',
    x: 'lon',
    y: 'lat',
    text: 'place',
    size: 'survivors',
    split: 'group',
    color: 'direction',
    guide: {
        showGridLines: 'x',
        padding: {l: 45, r: 10, t: 10, b: 10},
        x: {
            nice: false,
            min: 24,
            max: 38,
            hide: true
        },
        y: {
            nice: false,
            min: 53.5,
            max: 56,
            hide: false,
            padding: 20,
            rotate: 270,
            textAnchor: 'middle',
            label: {
                text: 'Latitude',
                cssClass: 'label inline',
                dock: 'right',
                textAnchor: 'end',
                padding: -14
            }
        },
        size: {
            func: 'linear',
            min: 2,
            max: 25
        },
        color: {
            brewer: {
                'Place': 'rgba(0,0,0,0)',
                'Advance': '#FF0000',
                'Retreat': '#000000'
            }
        }
    },
    settings: {
        specEngine: 'NONE',
        layoutEngine: 'NONE'
    },
    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ]
});

window.samples.push({

    sel: 1111,

    xsize: {
        width: 800,
        height: 180
    },

    data: [

        [37.6, 0, 'Oct 18', 6],
        [36.0, 0, 'Oct 24', 14],
        [33.2, -9, 'Nov 9', 5],
        [32.0, -21, 'Nov 14', 7],
        [29.2, -11, 'Nov 21', 7],
        [28.5, -20, 'Nov 28', 4],
        [27.2, -24, 'Dec 1', 5],
        [26.7, -30, 'Dec 6', 1],
        [25.3, -26, 'Dec 7', 0]
    ]
        .reduce(function (memo, x, i, list) {
            var curr = x;
            var next = (list.length - i > 1) ? list[i + 1] : curr;
            next = JSON.parse(JSON.stringify(next)); // clone
            curr.push(i);
            next.push(i);
            next[3] = curr[3];
            return memo.concat([curr, next]);
        }, [])
        .map(function (row) {

            return {
                lon: row[0],
                temperature: row[1],
                date: row[2],
                days: row[3],
                way: row[4]
            };
        }),

    test: [

        [37.6,   0, 'Oct 18',  6, 'Moscow-Mojaisk'],
        [36.0,   0, 'Oct 24',  6, 'Moscow-Mojaisk'],

        [36.0,   0, 'Oct 24', 14, 'Mojaisk-Wixma'],
        [33.2,  -9, 'Nov 9',  14, 'Mojaisk-Wixma'],

        [33.2,  -9, 'Nov 9',   5, 'Wixma-Smolensk'],
        [32.0, -21, 'Nov 14',  5, 'Wixma-Smolensk'],

        [32.0, -21, 'Nov 14',  7, 'Smolensk-Bobr'],
        [29.2, -11, 'Nov 21',  7, 'Smolensk-Bobr'],

        [29.2, -11, 'Nov 21',  7, 'Bobr-Studienska'],
        [28.5, -20, 'Nov 28',  7, 'Bobr-Studienska'],

        [28.5, -20, 'Nov 28', 4, 'Studienska-Molodechno'],
        [27.2, -24, 'Dec 1',  4, 'Studienska-Molodechno'],

        [27.2, -24, 'Dec 1',  5, 'Molodechno-Smorgon'],
        [26.7, -30, 'Dec 6',  5, 'Molodechno-Smorgon'],

        [26.7, -30, 'Dec 6',  1, 'Smorgon-Wilna'],
        [25.3, -26, 'Dec 7',  1, 'Smorgon-Wilna']

    ],

    type: 'line',
    x: 'lon',
    y: 'temperature',
    split: 'way',
    color: 'days',
    text: 'date',
    guide: {
        showGridLines: 'xy',
        padding: {l: 45, b: 50, t: 10, r: 10},
        x: {
            nice: false,
            min: 24,
            max: 38,
            hide: false,
            padding: 20,
            label: {
                text: 'Longitude',
                cssClass: 'label inline',
                dock: 'right',
                textAnchor: 'end',
                padding: -2
            }
        },
        y: {
            nice: false,
            min: -33,
            max: 2,
            hide: false,
            padding: 20,
            label: {
                text: 'Temperature',
                cssClass: 'label inline',
                dock: 'right',
                textAnchor: 'end',
                padding: -14
            }
        },
        color: {
            brewer: ['#eee', '#000']
        }
    },
    settings: {
        specEngine: 'NONE',
        layoutEngine: 'NONE'
    },
    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')()
    ]
});