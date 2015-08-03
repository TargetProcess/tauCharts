window.samples.push({

    data: [
        {"x1": {"id": 13, "name": "Tau Product Web Site - Scrum #1"}, "y1": 4},
        {"x1": {"id": 2, "name": "Tau Product Web Site - Kanban"}, "y1": 2},
        {"x1": {"id": 13, "name": "Tau Product Web Site - Scrum #1"}, "y1": 1},
        {"x1": null, "y1": 1}
    ],

    "type": "scatterplot",
    "color": "x1",
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
                "label": "Count"
            },
            "color": {
                label: 'Project',
                "tickLabel": "name"
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
        }
    },

    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('legend')()
    ]
});