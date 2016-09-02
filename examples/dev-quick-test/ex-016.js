dev.sample({

    z: 33,
    "type": "horizontal-bar",
    stack: true,
    "color": null,
    // "size": 'y1',
    "label": 'y1',
    "y": ["x1", "x2"],
    "x": ["y1"],
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
    data: [

        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B0", "y1": -2231},
        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B0", "y1": -3231},

        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B1", "y1": 3231},
        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B2", "y1": 3231},
        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B3", "y1": 3231},
        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B4", "y1": 3231},
        {"p":"A", "x1": "TP3 Project Highlight", "x2": "B5", "y1": 3231},

        {"p":"B", "x1": "VDR Project Highlight", "x2": "C1", "y1": 720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C2", "y1": 1720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C3", "y1": 2720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C4", "y1": 1720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C5", "y1": 3720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C6", "y1": 5720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C7", "y1": 5720},
        {"p":"B", "x1": "VDR Project Highlight", "x2": "C8", "y1": 5720},

        {"p":"A", "x1": "TP1 Project Highlight", "x2": "C9", "y1": 4987},

        {"p":"A", "x1": "TP2 Project Highlight", "x2": "C10", "y1": 4987},

        {"p":"A", "x1": "TP4 Project Highlight", "x2": "C10", "y1": 4987}
    ],

    plugins: [
        tauCharts.api.plugins.get('tooltip')(),
        tauCharts.api.plugins.get('settings')()
    ]

});