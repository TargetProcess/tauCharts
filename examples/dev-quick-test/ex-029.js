(function (samples) {

    var createSampleGuide = function (xName, yName) {
        return {
            autoLayout: "",
            x: {
                nice: true,
                cssClass: "x axis",
                hide: false,
                label: {
                    cssClass: "label inline",
                    padding: -2,
                    rotate: 0,
                    text: xName,
                    textAnchor: "end",
                    dock: 'right'
                },
                padding: 20,
                rotate: 90,
                scaleOrient: "bottom",
                textAnchor: "start"
            },
            y: {
                nice: true,
                cssClass: "y axis",
                hide: false,
                label: {
                    cssClass: "label inline",
                    padding: -10,
                    rotate: -90,
                    text: yName,
                    textAnchor: "end",
                    dock: 'right'
                },
                padding: 15,
                rotate: 0,
                scaleOrient: "left",
                textAnchor: "end"
            },
            padding: {
                b: 55,
                l: 55,
                r: 10,
                t: 10
            },
            showGridLines: "xy"
        };
    };

    samples.push({

        settings: {
            fitModel: 'none'
        },

        sources: {
            '?': {
                dims: {},
                data: []
            },

            '$': {
                dims: {
                    x: {type: 'category'},
                    y: {type: 'category'}
                },
                data: [
                    {x: 1, y: 1},
                    {x: 2, y: 1},
                    {x: 3, y: 1}
                ]
            },

            '/': {
                dims: {
                    product_name: {type: 'category'},
                    param1: {type: 'measure'},
                    param2: {type: 'measure'}
                },
                data: [
                    {product_name: "A", param1: 197, param2: 306},
                    {product_name: "B", param1: 246, param2: 507},
                    {product_name: "C", param1: 238, param2: 238},
                    {product_name: "D", param1: 96, param2: 99},
                    {product_name: "E", param1: 203, param2: 95},
                    {product_name: "F", param1: 155, param2: 120},
                    {product_name: "J", param1: 135, param2: 150},
                    {product_name: "K", param1: 186, param2: 150},
                    {product_name: "L", param1: 233, param2: 188}
                ]
            },

            'STACKED': {
                dims: {
                    product_name: {type: 'category'},
                    m1: {type: 'measure'},
                    c1: {type: 'category'}
                },
                data: [
                    {product_name: "A", m1: 0.9, c1: 'type1'},
                    {product_name: "A", m1: 0.1, c1: 'type2'},

                    {product_name: "B", m1: 0.8, c1: 'type1'},
                    {product_name: "B", m1: 0.2, c1: 'type2'},

                    {product_name: "C", m1: 0.7, c1: 'type1'},
                    {product_name: "C", m1: 0.3, c1: 'type2'},

                    {product_name: "D", m1: 0.6, c1: 'type1'},
                    {product_name: "D", m1: 0.4, c1: 'type2'},

                    {product_name: "E", m1: 0.5, c1: 'type1'},
                    {product_name: "E", m1: 0.5, c1: 'type2'},

                    {product_name: "F", m1: 0.4, c1: 'type1'},
                    {product_name: "F", m1: 0.6, c1: 'type2'},

                    {product_name: "J", m1: 0.3, c1: 'type1'},
                    {product_name: "J", m1: 0.7, c1: 'type2'},

                    {product_name: "K", m1: 0.2, c1: 'type1'},
                    {product_name: "K", m1: 0.8, c1: 'type2'},

                    {product_name: "L", m1: 0.1, c1: 'type1'},
                    {product_name: "L", m1: 0.9, c1: 'type2'}
                ]
            }
        },

        scales: {

            'xScale': {type: 'ordinal', source: '$', dim: 'x'},
            'yScale': {type: 'ordinal', source: '$', dim: 'y'},

            "x_product_name": {
                "type": "ordinal",
                "source": "/",
                "dim": "product_name",
                "nice": true,
                "dimType": "category"
            },
            "y_param1": {"type": "linear", "source": "/", "dim": "param1", "nice": true, "dimType": "measure"},
            "y_param2": {"type": "linear", "source": "/", "dim": "param2", "nice": true, "dimType": "measure"},

            "color_undefined": {"type": "color", "source": "/"},
            "size_undefined": {"type": "size", "source": "/", "minSize": 0, "maxSize": 1},

            "stacked_m1": {
                "type": "linear",
                "source": "STACKED",
                "dim": "m1",
                "nice": false,
                "dimType": "measure"
            },
            "stacked_c1": {"type": "color", "source": "STACKED", "dim": "c1"}
        },

        unit: {
            type: "COORDS.RECT",
            x: 'xScale',
            y: 'yScale',
            expression: {
                source: '$',
                inherit: false,
                operator: false
            },
            guide: {
                showGridLines: ""
            },
            frames: [
                {
                    key: {x: 1, y: 1, i: 0},
                    source: '$',
                    pipe: [],
                    units: [
                        {
                            y: "x_product_name",
                            x: "y_param1",
                            type: "COORDS.RECT",
                            expression: {
                                inherit: false,
                                operator: "none",
                                params: [],
                                source: "/"
                            },
                            guide: createSampleGuide('Param 1', 'Product name'),
                            units: [
                                {
                                    size: "size_undefined",
                                    type: "ELEMENT.INTERVAL",
                                    y: "x_product_name",
                                    x: "y_param1",
                                    color: "color_undefined",
                                    flip: true,
                                    expression: {
                                        inherit: false,
                                        operator: "none",
                                        params: [],
                                        source: "/"
                                    },
                                    guide: {
                                        anchors: false,
                                        cssClass: "i-role-datum",
                                        showGridLines: "xy",
                                        widthCssClass: ""
                                    }
                                }
                            ]
                        }
                    ]
                }
                ,
                {
                    key: {x: 2, y: 1, i: 1},
                    source: '$',
                    pipe: [],
                    units: [
                        {
                            y: "x_product_name",
                            x: "y_param2",
                            type: "COORDS.RECT",
                            expression: {
                                inherit: false,
                                operator: "none",
                                params: [],
                                source: "/"
                            },
                            guide: createSampleGuide('Param 2', 'Product name'),
                            units: [
                                {
                                    size: "size_undefined",
                                    type: "ELEMENT.INTERVAL",
                                    y: "x_product_name",
                                    x: "y_param2",
                                    flip: true,
                                    color: "color_undefined",
                                    expression: {
                                        inherit: false,
                                        operator: "none",
                                        params: [],
                                        source: "/"
                                    },
                                    guide: {
                                        anchors: false,
                                        cssClass: "i-role-datum",
                                        showGridLines: "xy",
                                        widthCssClass: ""
                                    }
                                }
                            ]
                        }
                    ]
                }
                ,
                {
                    key: {x: 3, y: 1, i: 2},
                    source: '$',
                    pipe: [],
                    units: [
                        {
                            y: "x_product_name",
                            x: "stacked_m1",
                            type: "COORDS.RECT",
                            expression: {
                                inherit: false,
                                operator: "none",
                                params: [],
                                source: "STACKED"
                            },
                            guide: createSampleGuide('C1', 'Product name'),
                            units: [
                                {
                                    type: "ELEMENT.INTERVAL",
                                    stack: true,
                                    flip: true,
                                    y: "x_product_name",
                                    x: "stacked_m1",
                                    size: "size_undefined",
                                    color: "stacked_c1",
                                    expression: {
                                        inherit: false,
                                        operator: "none",
                                        params: [],
                                        source: "STACKED"
                                    },
                                    guide: {
                                        anchors: false,
                                        cssClass: "i-role-datum",
                                        showGridLines: "xy",
                                        widthCssClass: "",
                                        x: {tickFontHeight: 10},
                                        y: {tickFontHeight: 10}
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    });
})(window.samples);