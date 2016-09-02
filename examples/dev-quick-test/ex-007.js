var offsetHrs = new Date().getTimezoneOffset() / 60;
var offsetISO = '0' + Math.abs(offsetHrs) + ':00';
var iso = function (str) {
    return (str + '+' + offsetISO);
};

dev.sample({

    data: [
        {
            "complex": {
                "id": 1,
                "name": "TP3"
            },
            "date": new Date(iso("2015-01-08T00:00:00")),
            "simple": 0.1,
            "colorValue": "UserStory",
            "sizeValue": 10
        },
        {
            "complex": {
                "id": 1,
                "name": "TP3"
            },
            "date": new Date(iso("2015-01-08T00:00:00")),
            "simple": 0.2,
            "colorValue": "UserStory",
            "sizeValue": 10
        },
        {
            "complex": null,
            "date": new Date(iso("2015-01-09T00:00:00")),
            "simple": 0.9,
            "colorValue": "Bug",
            "sizeValue": 20
        },
        {
            "complex": null,
            "date": new Date(iso("2015-01-09T00:00:00")),
            "simple": 0.5,
            "colorValue": "Bug",
            "sizeValue": 20
        }
    ],

    "type": "scatterplot",
    "color": "colorValue",
    "size": "sizeValue",
    "x": [
        "complex"
    ],
    "y": [
        "date",
        "simple"
    ],
    "guide": [
        {
            "y": {
                "label": "Create Date By Day",
                "tickPeriod": "day"
            }
        },
        {
            "x": {
                "label": "Project",
                "tickLabel": "name"
            },
            "y": {
                "label": "Progress",
                "tickFormat":"percent"
            },
            "color": {
                "label": "Entity Type"
            },
            "size": {
                "label": "Effort"
            }
        }
    ],
    "dimensions": {
        "complex": {
            "type": "category",
            "scale": "ordinal",
            "value": "id"
        },
        "date": {
            "type": "order",
            "scale": "period"
        },
        "simple": {
            "type": "measure",
            "scale": "linear"
        },
        "colorValue": {
            "type": "category",
            "scale": "ordinal"
        },
        "sizeValue": {
            "type": "measure",
            "scale": "linear"
        }
    },
    plugins: [
        tauCharts.api.plugins.get('tooltip')({fields:['complex','date','simple','colorValue','sizeValue']}),
        tauCharts.api.plugins.get('legend')()
    ]

});