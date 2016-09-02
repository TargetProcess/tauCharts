dev.drop({
    "title": "DO NOT DELETE",
    "thumbnails": {
        "small": "/api/v1/drops/5720b5db2c29c614006a800c/thumbnail?drop=50b73d58dc4a4623444572022e2a11070dbf3abb&source=1461759829849&config=small",
        "medium": "/api/v1/drops/5720b5db2c29c614006a800c/thumbnail?drop=50b73d58dc4a4623444572022e2a11070dbf3abb&source=1461759829849&config=medium",
        "large": "/api/v1/drops/5720b5db2c29c614006a800c/thumbnail?drop=50b73d58dc4a4623444572022e2a11070dbf3abb&source=1461759829849&config=large",
        "opengraph": "/api/v1/drops/5720b5db2c29c614006a800c/thumbnail?drop=50b73d58dc4a4623444572022e2a11070dbf3abb&source=1461759829849&config=opengraph",
        "twitter_card_summary_large_image": "/api/v1/drops/5720b5db2c29c614006a800c/thumbnail?drop=50b73d58dc4a4623444572022e2a11070dbf3abb&source=1461759829849&config=twitter_card_summary_large_image"
    },
    "source": {
        "_id": "5720af552c29c614006a7f9f",
        "original": {
            "type": "text/csv",
            "encoding": "7bit",
            "name": "performance_metrics_-_311_call_center_chicago kwehjf w erhkwehr kwkejrh kwerjh kwejrh kwerhkwer end.csv"
        },
        "date": "2016-04-27T12:23:49.849Z",
        "buildInFiltersAllowed": true,
        "singleDropPerSource": false,
        "rawDataAllowed": true,
        "suggestionsAllowed": true,
        "remoteDataProcessing": false,
        "formulasAllowed": false,
        "isAppDynamicSchemaSource": false,
        "queryAllowed": false,
        "dataProcessingMode": "local",
        "version": "1461759829849",
        "id": "5720af552c29c614006a7f9f"
    },
    "spec": {
        "type": "line",
        "trendline": null,
        "dimensions": {
            "average_number_of_operators_sat_sun_7_00am_3_00pm__2_26": {
                "type": "measure",
                "scale": "linear"
            },
            "row_number_3_15": {"type": "measure", "scale": "linear"},
            "average_wait_time_seconds_11_00pm_7_00am_2_94": {"type": "measure", "scale": "linear"}
        },
        "guide": [{
            "x": {"label": "Average Number of Operators, Sat-Sun, (7:00AM-3:00PM) "},
            "y": {"label": "Count of records"},
            "size": {"label": "34�"}
        }],
        "tooltip": {
            "fields": ["average_wait_time_seconds_11_00pm_7_00am_2_94", "row_number_3_15", "average_number_of_operators_sat_sun_7_00am_3_00pm__2_26"],
            "formatters": {}
        },
        "x": ["average_number_of_operators_sat_sun_7_00am_3_00pm__2_26"],
        "y": ["row_number_3_15"],
        "size": "average_wait_time_seconds_11_00pm_7_00am_2_94",
        "annotations": []
    },
    "data": [[15, 1, null], [15, 1, 2], [11, 1, 2], [12, 2, 3], [15, 7, 3], [13, 3, 3], [14, 1, 3], [17, 2, 3], [11, 1, 4], [13, 3, 4], [16, 2, 4], [14, 5, 4], [17, 3, 4], [15, 3, 4], [12, 2, 4], [15, 4, 5], [18, 1, 5], [12, 2, 5], [14, 2, 5], [13, 3, 5], [11, 3, 5], [16, 3, 5], [15, 2, 6], [16, 2, 6], [14, 5, 6], [12, 3, 6], [13, 3, 6], [17, 2, 6], [13, 4, 7], [14, 7, 7], [17, 1, 7], [15, 6, 7], [12, 2, 7], [34, 1, 7], [16, 3, 7], [11, 1, 8], [14, 4, 8], [12, 2, 8], [13, 5, 8], [17, 1, 8], [15, 3, 8], [16, 1, 8], [14, 2, 9], [16, 1, 9], [12, 6, 9], [15, 2, 9], [13, 1, 9], [11, 1, 9], [13, 2, 10], [14, 6, 10], [17, 1, 10], [14, 3, 11], [17, 1, 11], [16, 1, 11], [15, 2, 11], [12, 1, 11], [13, 2, 11], [13, 1, 12], [14, 1, 12], [15, 2, 12], [11, 2, 14], [13, 2, 14], [14, 2, 15], [16, 1, 15], [15, 1, 17], [14, 1, 17], [15, 2, 19], [13, 1, 19], [16, 1, 19], [12, 1, 20], [13, 1, 21], [14, 1, 22], [16, 1, 24], [14, 2, 25], [12, 1, 25], [13, 1, 28], [14, 1, 29], [14, 1, 30], [15, 1, 30], [21, 1, 32], [16, 1, 33], [14, 1, 34], [15, 1, 36], [15, 1, 39], [14, 1, 41], [2, 2, 51], [16, 1, 54], [2, 1, 67], [2, 1, 69], [1, 1, 72], [1, 1, 74], [2, 1, 78], [12, 1, 101], [13, 1, 120], [15, 1, 149], [16, 1, 166], [15, 1, 168], [13, 1, 169]],
    "header": ["average_number_of_operators_sat_sun_7_00am_3_00pm__2_26", "row_number_3_15", "average_wait_time_seconds_11_00pm_7_00am_2_94"],
    "format": "x-array"
});