dev.sample({

    "type": "horizontalBar",
    "color": "color",
    "size": null,
    "x": ["x1"],
    "y": ["y1", "y2"],
    "guide": [
        {
            "y": {"label": "Feature", "tickLabel": "name"}
        },
        {
            "x": {"label": "Effort"},
            "y": {"label": "Average Cycletime"},
            "color": {
                "label": "Entity Type",
                "tickLabel": "name"
            }
        }
    ],
    "dimensions": {
        "x1": {"type": "measure", "scale": "linear"},
        "y1": {"type": "category", "scale": "ordinal", "value": "id"},
        "y2": {"type": "measure", "scale": "linear"},
        "color": {"type": "category", "scale": "ordinal", "value": "id"}
    },
    data: [
        {
            "x1": 1,
            "y1": {"id": 54581, "name": "Advanced DSL Filters"},
            "y2": 794.56,
            "color": {"id": 4, "name": "User Story"},
            "dataItem": null
        }
    ]

});