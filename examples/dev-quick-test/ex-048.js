var now = new Date();

dev.sample({

    "type": "stacked-bar",
    "color": "color",
    "size": "size",
    "x": [
        "x1"
    ],
    "y": [
        "y1"
    ],
    "guide": [
        {
            "x": {
                "label": "End Date By Month",
                "tickPeriod": "month"
            },
            "y": {
                "label": "Effort"
            },
            "color": {
                "label": "Entity Type",
                "tickLabel": "name"
            },
            "size": {
                "label": "(EndDate-StartDate).Days"
            }
        }
    ],
    "dimensions": {
        "x1": {
            "type": "order",
            "scale": "period"
            //"type": "category",
            //"scale": "ordinal"
        },
        "y1": {
            "type": "measure",
            "scale": "linear"
        },
        "size": {
            "type": "measure",
            "scale": "linear"
        },
        "color": {
            "type": "category",
            "scale": "ordinal",
            "value": "id"
        }
    },

    plugins: [
        tauCharts.api.plugins.get('legend')(),
        tauCharts.api.plugins.get('tooltip')({
            aggregationGroupFields: ['x1', 'y1', 'size']
        }),
        tauCharts.api.plugins.get('trendline')({showPanel: false}),
        tauCharts.api.plugins.get('exportTo')({

            cssPaths: [
                '../build/development/css/tauCharts.default.css',
                '../build/development/plugins/tauCharts.trendline.css'
            ],

            appendFields: [
                {
                    field: 'name',
                    title: 'name',
                    value: function (row) {
                        return row.dataItem.data.name;
                    }
                }
            ]
        }),
        tauCharts.api.plugins.get('annotations')({
            items: [
                {
                    dim: 'y1',
                    val: 225,
                    text: '100 points',
                    position: 'front',
                    color: '#FFAB00'
                }
                ,
                {
                    dim: 'y1',
                    val: [-50, 55],
                    text: '100 points',
                    position: 'front',
                    color: '#FFAB00'
                }
                ,
                {
                    dim: 'x1',
                    val: "\/Date(1420092000000-0600)\/",
                    text: 'Build 33',
                    position: 'front',
                    color: 'green'
                }
                ,
                {
                    dim: 'x1',
                    val: tauCharts.api.tickPeriod.get('month').cast(1420092000000),
                    text: 'Build 33',
                    position: 'front',
                    color: 'green'
                }
                ,
                {
                    dim: 'x1',
                    //val: (new Date('2015-03-01')),
                    //val: '1425189600000',
                    //val: ["\/Date(1430456400000-0500)\/", "\/Date(1433134800000-0500)\/"],
                    val: [
                        tauCharts.api.tickPeriod.get('month').cast(new Date('2016-05-01')),
                        tauCharts.api.tickPeriod.get('month').cast(new Date('2016-07-01'))
                    ],
                    text: 'Build 33',
                    position: 'front',
                    color: 'green'
                }
                ,
                {
                    dim: 'x1',
                    val: ["\/Date(1430456400000-0500)\/", "\/Date(1433134800000-0500)\/"],
                    //val: [
                    //    tauCharts.api.tickPeriod.get('month').cast(new Date('2016-05-01')),
                    //    tauCharts.api.tickPeriod.get('month').cast(new Date('2016-07-01'))
                    //],
                    text: 'Build 55',
                    position: 'front',
                    color: 'green'
                }
            ]
        })
    ],

    "data": [
        {
            "x1": "\/Date(1492139600000-0500)\/",
            "y1": 39.0000,
            "size": 42,
            "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
            "dataItem": {
                "id": "54087",
                "type": "Feature",
                "orderingValue": null,
                "data": {"id": 54087, "name": "Follow", "type": "Feature"},
                "coords": {
                    "x1": "\/Date(1412139600000-0500)\/",
                    "y1": 39.0000,
                    "size": 42,
                    "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
                }
            }
        }
        ,
        {
        "x1": "\/Date(1412139600000-0500)\/",
        "y1": 59.0000,
        "size": 28,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "86615",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 86615, "name": "Epics MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1412139600000-0500)\/",
                "y1": 59.0000,
                "size": 28,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    },
        {
        "x1": "\/Date(1412139600000-0500)\/",
        "y1": 30.0000,
        "size": 44,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "84637",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 84637, "name": "Cross-project Releases MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1412139600000-0500)\/",
                "y1": 30.0000,
                "size": 44,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1414818000000-0500)\/",
        "y1": 40.0000,
        "size": 67,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "54570",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 54570, "name": "Easy States setup MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1414818000000-0500)\/",
                "y1": 40.0000,
                "size": 67,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1420092000000-0600)\/",
        "y1": 126.0000,
        "size": 121,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "49126",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 49126, "name": "Dashboards MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1420092000000-0600)\/",
                "y1": 126.0000,
                "size": 121,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1420092000000-0600)\/",
        "y1": 40.6000,
        "size": 119,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "68223",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 68223, "name": "Team Workflow MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1420092000000-0600)\/",
                "y1": 40.6000,
                "size": 119,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1420092000000-0600)\/",
        "y1": 21.0000,
        "size": 46,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "93630",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 93630, "name": "Cross-project Releases MVF Public", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1420092000000-0600)\/",
                "y1": 21.0000,
                "size": 46,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1420092000000-0600)\/",
        "y1": 19.0000,
        "size": 61,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "62724",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 62724, "name": "Custom Rules MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1420092000000-0600)\/",
                "y1": 19.0000,
                "size": 61,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1420092000000-0600)\/",
        "y1": 5.0000,
        "size": 5,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "83685",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 83685, "name": "Web Hooks", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1420092000000-0600)\/",
                "y1": 5.0000,
                "size": 5,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1422770400000-0600)\/",
        "y1": 117.0000,
        "size": 133,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "49128",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 49128, "name": "Custom Graphic Reports MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1422770400000-0600)\/",
                "y1": 117.0000,
                "size": 133,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1422770400000-0600)\/",
        "y1": 63.0000,
        "size": 124,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "89367",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 89367, "name": "Charting Engine (taucharts) MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1422770400000-0600)\/",
                "y1": 63.0000,
                "size": 124,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    },
        {
        "x1": "\/Date(1425189600000-0600)\/",
        "y1": 21.0000,
        "size": 63,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "95356",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 95356, "name": "SAML SSO support MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1425189600000-0600)\/",
                "y1": 21.0000,
                "size": 63,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    },
        {
        "x1": "\/Date(1425189600000-0600)\/",
        "y1": 18.0000,
        "size": 40,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "97540",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 97540, "name": "Views Menu Improvements #1", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1425189600000-0600)\/",
                "y1": 18.0000,
                "size": 40,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1425189600000-0600)\/",
        "y1": 17.0000,
        "size": 26,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "99073",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 99073, "name": "Saved Filters", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1425189600000-0600)\/",
                "y1": 17.0000,
                "size": 26,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1425189600000-0600)\/",
        "y1": 12.0000,
        "size": 29,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "97324",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 97324, "name": "Visual Encoding MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1425189600000-0600)\/",
                "y1": 12.0000,
                "size": 29,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1427864400000-0500)\/",
        "y1": 27.0000,
        "size": 46,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "97787",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 97787, "name": "Calculated Custom Fields MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1427864400000-0500)\/",
                "y1": 27.0000,
                "size": 46,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1427864400000-0500)\/",
        "y1": 26.0000,
        "size": 68,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "97791",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 97791, "name": "Milestones MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1427864400000-0500)\/",
                "y1": 26.0000,
                "size": 68,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1427864400000-0500)\/",
        "y1": 6.0000,
        "size": 0,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "79206",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 79206, "name": "Feature/Bug Relation Improvements", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1427864400000-0500)\/",
                "y1": 6.0000,
                "size": 0,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1430456400000-0500)\/",
        "y1": 56.0000,
        "size": 34,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "51536",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 51536, "name": "GUI Filters preview", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1430456400000-0500)\/",
                "y1": 56.0000,
                "size": 34,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1430456400000-0500)\/",
        "y1": 32.5000,
        "size": 134,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "49127",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 49127, "name": "Help Desk - Split. Part 1", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1430456400000-0500)\/",
                "y1": 32.5000,
                "size": 134,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1430456400000-0500)\/",
        "y1": 30.0000,
        "size": 114,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "96538",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 96538, "name": "Major Lists Improvements", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1430456400000-0500)\/",
                "y1": 30.0000,
                "size": 114,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1430456400000-0500)\/",
        "y1": 12.0000,
        "size": 42,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "100044",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 100044, "name": "Markdown MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1430456400000-0500)\/",
                "y1": 12.0000,
                "size": 42,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1433134800000-0500)\/",
        "y1": 37.0000,
        "size": 76,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "99471",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 99471, "name": "PPM MVF", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1433134800000-0500)\/",
                "y1": 37.0000,
                "size": 76,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1433134800000-0500)\/",
        "y1": 17.0000,
        "size": 15,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "89477",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 89477, "name": "Epics Improvements #1", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1433134800000-0500)\/",
                "y1": 17.0000,
                "size": 15,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1433134800000-0500)\/",
        "y1": 13.0000,
        "size": 33,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "102231",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 102231, "name": "Private Projects", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1433134800000-0500)\/",
                "y1": 13.0000,
                "size": 33,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1433134800000-0500)\/",
        "y1": 0.0000,
        "size": 28,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "107413",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 107413, "name": "Create Push Notification service plugin", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1433134800000-0500)\/",
                "y1": 0.0000,
                "size": 28,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }, {
        "x1": "\/Date(1438405200000-0500)\/",
        "y1": 16.0000,
        "size": 71,
        "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        "dataItem": {
            "id": "104813",
            "type": "Feature",
            "orderingValue": null,
            "data": {"id": 104813, "name": "Custom Graphic Report Increment#1", "type": "Feature"},
            "coords": {
                "x1": "\/Date(1438405200000-0500)\/",
                "y1": 16.0000,
                "size": 71,
                "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
            }
        }
    }
        ,
        {
            "x1": "\/Date(1441083600000-0500)\/",
            "y1": 0.0000,
            "size": 70,
            "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
            "dataItem": {
                "id": "106974",
                "type": "Feature",
                "orderingValue": null,
                "data": {"id": 106974, "name": "New Audit History research", "type": "Feature"},
                "coords": {
                    "x1": "\/Date(1441083600000-0500)\/",
                    "y1": 0.0000,
                    "size": 70,
                    "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
                }
            }
        }
        //,
        //{
        //    "x1": "B",
        //    "y1": 0.0000,
        //    "size": 70,
        //    "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        //    "dataItem": {
        //        "id": "106974",
        //        "type": "Feature",
        //        "orderingValue": null,
        //        "data": {"id": 106974, "name": "New Audit History research", "type": "Feature"},
        //        "coords": {
        //            "x1": "\/Date(1441083600000-0500)\/",
        //            "y1": 0.0000,
        //            "size": 70,
        //            "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
        //        }
        //    }
        //}
        //,
        //{
        //    "x1": "A",
        //    "y1": 0.0000,
        //    "size": 70,
        //    "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"},
        //    "dataItem": {
        //        "id": "106974",
        //        "type": "Feature",
        //        "orderingValue": null,
        //        "data": {"id": 106974, "name": "New Audit History research", "type": "Feature"},
        //        "coords": {
        //            "x1": "\/Date(1441083600000-0500)\/",
        //            "y1": 0.0000,
        //            "size": 70,
        //            "color": {"resourceType": "EntityType", "id": 9, "name": "Feature"}
        //        }
        //    }
        //}
    ].map(function (row) {
            row.x1 = parseInt(row.x1.substr(6, 13));
            return row;
        })
});