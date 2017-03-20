dev.spec({

    "type": "horizontalBar",
    "color": null,
    "size": null,
    "y": [
        "x1",
        "x2"
    ],
    "x": [
        "y1"
    ],
    "guide": [
        {
            "x": {
                "label": "Project"
            }
        },
        {
            "x": {
                "label": "User Story"
            },
            "y": {
                "label": "Count"
            }
        }
    ],
    "dimensions": {
        "x1": {
            "type": "category",
            "scale": "ordinal"
        },
        "x2": {
            "type": "category",
            "scale": "ordinal"
        },
        "y1": {
            "type": "measure",
            "scale": "linear"
        }
    },
    data: [
        {"x1": "TP2", "x2": "A0", "y1": 4987},

        {"x1": "TP3", "x2": "B0", "y1": 2231},
        {"x1": "TP3", "x2": "B1", "y1": 3231},

        {"x1": "VDR", "x2": "C0", "y1": 720},
        {"x1": "VDR", "x2": "C1", "y1": 1720},
        {"x1": "VDR", "x2": "C2", "y1": 2720}
    ]

});