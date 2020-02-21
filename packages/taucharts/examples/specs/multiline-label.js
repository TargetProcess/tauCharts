(function () {
    const data = [
        {name: 'Alex', age: 20, parents: 'Mother: Ann\nFather: Alex'},
        {name: 'Andrew', age: 19, parents: 'Mother: Liza\nFather: Eugene'},
        {name: 'Steve', age: 34, parents: 'Mother: Adele\nFather: Nick'},
        {name: 'Bob', age: 15, parents: 'Mother: Ann\nFather: Andrew'}
    ];

    dev.spec((function () {
        return {
            type: 'scatterplot',
            x: 'name',
            y: 'age',
            label: 'parents',
            guide: [{
                label: {
                    fontSize: 10,
                    lineBreak: true,
                    lineBreakSeparator: '\n'
                }
            }],
            data: data
        };
    })());
})();
