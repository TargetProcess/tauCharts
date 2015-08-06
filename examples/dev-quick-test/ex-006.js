window.samples.push({

    type: 'scatterplot',
    x: ['euroEco', 'co2'],
    y: ['power', 'hp'],
    dimensions: {
        car: {type: 'category'},
        euroEco: {
            type: 'category',
            order: ['eco', 'non-eco']
        },
        power: {
            type: 'order',
            order: ['low', 'normal', 'high']
        },
        co2: {type: 'measure'},
        hp: {type: 'measure'}
    },
    guide: [
        {
            split: false,
            padding: {l: 42, b: 24, r: 8, t: 8},
            x: {label: 'euroEco'},
            y: {label: 'power'}
        },
        {
            showGridLines: 'xy',
            padding: {l: 52, b: 42, r: 8, t: 8},
            x: {label: 'CO2 emission, g/km'},
            y: {label: 'Horse power'}
        }
    ],
    data: [
        {car: "Bentley Continental", co2: 246, hp: 507},
        {car: "Toyota Prius+", co2: 96, hp: 99},
        {car: "Volvo S60", co2: 135, hp: 150},
        {car: "BMV X5", co2: 197, hp: 306},
        {car: "Infinity FX", co2: 238, hp: 238},
        {car: "Mercedes Vito", co2: 203, hp: 95},
        {car: "Peugeot 3008", co2: 155, hp: 120},
        {car: "Subaru Forester", co2: 186, hp: 150},
        {car: "Lexus RX", co2: 233, hp: 188}
    ].map(function (x) {

            x.euroEco = (x.co2 < 140) ? 'eco' : 'non-eco';
            x.power = (x.hp < 150) ? 'low' : ((x.hp < 200) ? 'normal' : 'high');
            return x;

        })
});