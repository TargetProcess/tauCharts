window.samples.push({

    "type": "scatterplot",
    "x": "entityType",
    "y": "userStory",
    "color": "effort",
    "dimensions": {
        "entityType": {"type": "category"},
        "userStory": {"type": "category", "value": "id"},
        "effort": {"type": "measure"}
    },
    plugins: [
        tauCharts.api.plugins.get('trendline')(),
        tauCharts.api.plugins.get('tooltip')({fields: ['team', 'count', 'month']})
    ],
    data: [
        {
            "entityType": "Bug",
            "userStory": {
                "id": 2,
                "name": "ww"
            },
            "effort": 0.0000
        },
        {
            "entityType": "Bug",
            "userStory": null,
            "effort": 0.0000
        },
        {
            "entityType": "Bug",
            "userStory": null,
            "effort": 0.0000
        },
        {
            "entityType": "Bug",
            "userStory": {
                "id": 11,
                "name": "NoCustom"
            },
            "effort": 0.0000
        }
    ]
});