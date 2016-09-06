dev.spec({

    "type": "stacked-bar",
    "color": "color",
    "size": null,
    "x": ["x1"],
    "y": ["y1"],
    "guide": [
        {
            "x": {
                "label": "Project",
                "tickLabel": "name"
            },
            "y": {
                "label": "Average Cycle Time"
            },
            "color": {
                "label": "Entity Type Id",
                brewer: ['#eee', '#ff0000', 'green', 'blue']
            }
        }
    ],
    "dimensions": {
        "x1": {
            "type": "category",
            "scale": "ordinal",
            "value": "id"
        },
        "y1": {
            "type": "measure",
            "scale": "linear"
        },
        "color": {
            "type": "measure",
            "scale": "linear"
        }
    },

    data: [
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 49.798101851851854, color: 4},
        {x1: {id: 13, name: "Tau Product Web Site - Scrum #1"}, y1: 28.225185185185186, color: 9},
        {x1: {id: 13, name: "Tau Product Web Site - Scrum #1"}, y1: 25.218024691358025, color: 8},
        {x1: {id: 13, name: "Tau Product Web Site - Scrum #1"}, y1: 44.834795875420872, color: 4},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 10, color: 8},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 20, color: 9},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 30, color: 7},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 40, color: 6},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 50, color: 5},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 60, color: 3},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 70, color: 2},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 80, color: 1},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 90, color: 0},
        {x1: {id: 2, name: "Tau Product - Kanban #1"}, y1: 100, color: 10}
    ].concat(_.times(10, function (x) {
            return x;
        }).map(function (i) {
            return {
                x1: {id: 2, name: "Tau Product - Kanban #1"},
                y1: 100 + i * 3,
                color: 11 + i
            };
        }))

});