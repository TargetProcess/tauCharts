window.samples.push({

    "type": "horizontalBar",
    "color": null,
    "size": null,
    "x": ["x1"],
    "y": ["y1", "y2"],
    "guide": [
        {
            "y": {
                "label": "Create Date By Day",
                // "tickPeriod": "day",
                "tickFormat": "day"
            }
        },
        {
            "x": {
                "label": "Count"
            },
            "y": {
                "label": "User Story"
            }
        }
    ],

    data: [
        {"x1": 6, "y1": 1415048400000, "y2": null},
        {"x1": 1, "y1": 1416430800000, "y2": null},
        {"x1": 1, "y1": 1416517200000, "y2": null},
        {"x1": 1, "y1": 1418590800000, "y2": "About Us page"},
        {"x1": 2, "y1": 1415566800000, "y2": "Advanced REST API"},
        {"x1": 2, "y1": 1418590800000, "y2": "Contacts page"},
        {"x1": 1, "y1": 1415653200000, "y2": "Delete User"},
        {"x1": 2, "y1": 1418590800000, "y2": "Home page"},
        {"x1": 2, "y1": 1419368400000, "y2": "Integrate Twitter feed"},
        {"x1": 2, "y1": 1419368400000, "y2": "Put RSS Feeds on Home page"},
        {"x1": 2, "y1": 1418590800000, "y2": "Support page"}
    ],

    "dimensions": {
        "x1": {
            "type": "measure",
            "scale": "linear"
        },
        "y1": {
            "type": "order",
            "scale": "period"
        },
        "y2": {
            "type": "category",
            "scale": "ordinal"
        }
    }

});