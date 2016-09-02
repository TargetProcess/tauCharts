dev.spec({
    sel: 99,
    data: [
        {y: 'A', x: -25, color: 'up'},
        {y: 'B', x: -5, color: 'up'},
        {y: 'C', x: 25, color: 'up'},
        //
        //{y: 'C', x: 10, color: 'down'},

        {y: 'A', x: 100, color: 'up'},
        {y: 'A', x: 31, color: 'down'},

        {y: 'B', x: 10, color: 'up'},
        {y: 'B', x: 80, color: 'down'},

        // {y: 'C', x: 100, color: 'up'},
        // {y: 'D', x: 40, color: 'up'},
        //{y: 'E', x: 22, color: 'down'}
    ].map(function (row) {

            if (row.color === 'up') {
                row.x = row.x * (-1);
            }

            // row.color += (row.x >= 0) ? 'pos': 'neg';
            // row.sign = (row.x >= 0) ? 'pos': 'neg';

            return row;
        }),

    type: 'bar',
    flip: true,
    stack: true,
    y: 'y',
    x: 'x',
    color: 'color',
    lineOrientation: 'none',
    guide: {
        x: {nice: false}
    }
});