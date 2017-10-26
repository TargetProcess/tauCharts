import Taucharts from 'taucharts';
import * as d3 from 'd3-color';

    var utils = Taucharts.api.utils;
    var pluginsSDK = Taucharts.api.pluginsSDK;

    var addToUnits = function (units, newUnit, position) {
        if (position === 'front') {
            units.push(newUnit);
        } else {
            // behind by default
            units.unshift(newUnit);
        }
    };

    var stretchByOrdinalAxis = function (noteItem) {
        return function (model) {
            var res = {};
            var seed = [
                {
                    dim: model.scaleX.dim,
                    scale: model.scaleY,
                    method: 'yi',
                    k: -1
                },
                {
                    dim: model.scaleY.dim,
                    scale: model.scaleX,
                    method: 'xi',
                    k: 1
                },
                {
                    dim: null,
                    scale: null,
                    method: null
                }
            ].find(function (a) {
                if (Array.isArray(noteItem.dim)) {
                    return noteItem.dim.indexOf(a.dim) >= 0;
                }
                return a.dim === noteItem.dim;
            });

            if (seed.method === null) {
                return res;
            }

            var marker = '__pos__';
            var kAxis = seed.k;
            var koeff = {l: -0.5, r: 0.5};
            var method = seed.method;
            var scale = seed.scale;
            res[method] = (function (row) {
                var k = (koeff[row[marker]] || 0) * kAxis;
                if (scale.discrete) {
                    return (model[method](row) + scale.stepSize(row[scale.dim]) * k);
                }
                if (scale.period) {
                    const gen = Taucharts.api.tickPeriod.get(scale.period, {utc: scale.utcTime});
                    const domain = scale.domain();
                    let min = gen.cast(domain[0]);
                    while (min < domain[0]) {
                        min = gen.next(min);
                    }
                    const max = gen.cast(domain[1]);
                    const k = ((scale(max) - scale(min)) / (max - min));
                    switch (row[marker]) {
                        case 'l': {
                            const overflow = Math.min(0, domain[0] - min);
                            return (scale(min) + k * overflow);
                        }
                        case 'r': {
                            const overflow = Math.max(0, domain[1] - max);
                            return (scale(max) + k * overflow);
                        }
                    }
                }
                return model[method](row);
            });
            return res;
        };
    };

    function annotations(xSettings) {

        var settings = utils.defaults(xSettings || {}, {items: []});
        var textScaleName = 'annotation_text';

        return {

            init: function (chart) {
                this._chart = chart;

                var specRef = chart.getSpec();
                specRef.scales[textScaleName] = {type: 'value', dim: 'text', source: '?'};
                specRef.transformations = specRef.transformations || {};

                specRef.transformations.dataRange = function (data, metaInfo) {

                    var from = metaInfo.from;
                    var to = metaInfo.to;

                    var primaryScaleInfo = chart.getScaleInfo(metaInfo.primaryScale);

                    if ((primaryScaleInfo.period)) {
                        var periodCaster = Taucharts.api.tickPeriod.get(primaryScaleInfo.period,
                            {utc: specRef.settings.utcTime});
                        from = periodCaster.cast(new Date(metaInfo.from));
                        to = periodCaster.cast(new Date(metaInfo.to));
                    }

                    var isX0OutOfDomain = !primaryScaleInfo.isInDomain(from);
                    var isX1OutOfDomain = !primaryScaleInfo.isInDomain(to);

                    var isOutOfDomain = (primaryScaleInfo.discrete ?
                        (isX0OutOfDomain || isX1OutOfDomain) :
                        (isX0OutOfDomain && isX1OutOfDomain)
                    );

                    if (isOutOfDomain) {
                        console.log('Annotation is out of domain');
                        return [];
                    }

                    var secondaryScaleInfo = chart.getScaleInfo(metaInfo.secondaryScale);
                    var secDomain = secondaryScaleInfo.domain();
                    var boundaries = [secDomain[0], secDomain[secDomain.length - 1]];

                    var a = primaryScaleInfo.dim;
                    var b = secondaryScaleInfo.dim;
                    var z = '__pos__';

                    var leftBtm = {};
                    var leftTop = {};
                    var rghtTop = {};
                    var rghtBtm = {};

                    leftBtm[z] = 'l';
                    leftBtm[a] = from;
                    leftBtm[b] = boundaries[0];

                    leftTop[z] = 'l';
                    leftTop[a] = to;
                    leftTop[b] = boundaries[0];

                    rghtTop[z] = 'r';
                    rghtTop[a] = to;
                    rghtTop[b] = boundaries[1];

                    rghtBtm[z] = 'r';
                    rghtBtm[a] = from;
                    rghtBtm[b] = boundaries[1];

                    ((metaInfo.axis === 'y') ? rghtTop : rghtBtm).text = metaInfo.text;

                    return [leftBtm, leftTop, rghtTop, rghtBtm];
                };

                specRef.transformations.dataLimit = function (data, metaInfo) {

                    var primary = metaInfo.primaryScale;
                    var secondary = metaInfo.secondaryScale;

                    var primaryScaleInfo = chart.getScaleInfo(primary);
                    var from = ((primaryScaleInfo.period) ?
                        Taucharts.api.tickPeriod.get(primaryScaleInfo.period, {utc: specRef.settings.utcTime})
                            .cast(new Date(metaInfo.from)) :
                        metaInfo.from);
                    var isOutOfDomain = (!primaryScaleInfo.isInDomain(from));

                    if (isOutOfDomain) {
                        console.log('Annotation is out of domain');
                        return [];
                    }

                    var secondaryScaleInfo = chart.getScaleInfo(secondary);
                    var secDomain = secondaryScaleInfo.domain();
                    var boundaries = [secDomain[0], secDomain[secDomain.length - 1]];

                    var src = {};
                    var dst = {};

                    var a = primaryScaleInfo.dim;
                    var b = secondaryScaleInfo.dim;
                    var z = '__pos__';

                    src[a] = from;
                    src[b] = boundaries[0];
                    src[z] = 'l';

                    dst[a] = from;
                    dst[b] = boundaries[1];
                    dst[z] = 'r';

                    dst.text = metaInfo.text;

                    return [src, dst];
                };

                specRef.transformations.lineNoteData = function (data, metaInfo) {

                    const xScaleId = metaInfo.xScale;
                    const yScaleId = metaInfo.yScale;

                    const xScale = chart.getScaleInfo(xScaleId);
                    const yScale = chart.getScaleInfo(yScaleId);

                    const xPeriod = (xScale.period ?
                        Taucharts.api.tickPeriod.get(xScale.period, {utc: xScale.utcTime}) :
                        null);
                    const yPeriod = (yScale.period ?
                        Taucharts.api.tickPeriod.get(yScale.period, {utc: yScale.utcTime}) :
                        null);

                    const points = metaInfo.points.map((d) => {
                        return [
                            xPeriod ? xPeriod.cast(d[0]) : d[0],
                            yPeriod ? yPeriod.cast(d[1]) : d[1]
                        ];
                    });

                    if (points.some((d) => !xScale.isInDomain(d[0]) || !yScale.isInDomain(d[1]))) {
                        console.log('Annotation is out of domain');
                        return [];
                    }

                    const xDim = xScale.dim;
                    const yDim = yScale.dim;

                    const linePoints = points.map((d) => {
                        return {
                            [xDim]: d[0],
                            [yDim]: d[1],
                            text: metaInfo.text
                        };
                    });

                    return linePoints;
                };
            },

            addAreaNote: function (specRef, coordsUnit, noteItem) {

                var xScale = specRef.scales[coordsUnit.x];
                var yScale = specRef.scales[coordsUnit.y];

                var axes = ((noteItem.dim === xScale.dim) ?
                    ['x', 'y'] :
                    ((noteItem.dim === yScale.dim) ?
                        ['y', 'x'] :
                        (null)));

                if (axes === null) {
                    console.log('Annotation doesn\'t match any data field');
                    return;
                }

                var from = noteItem.val[0];
                var to = noteItem.val[1];

                var annotatedArea = {
                    type: 'ELEMENT.PATH',
                    namespace: 'annotations',
                    x: coordsUnit.x,
                    y: coordsUnit.y,
                    color: noteItem.colorScaleName,
                    label: textScaleName,
                    expression: {
                        inherit: false,
                        operator: 'none',
                        params: [],
                        source: '/'
                    },
                    transformModel: [stretchByOrdinalAxis(noteItem)],
                    transformation: [
                        {
                            type: 'dataRange',
                            args: {
                                axis: axes[0],
                                text: noteItem.text,
                                from: from,
                                to: to,
                                primaryScale: coordsUnit[axes[0]],
                                secondaryScale: coordsUnit[axes[1]]
                            }
                        }
                    ],
                    guide: {
                        showAnchors: 'never',
                        cssClass: 'tau-chart__annotation-area',
                        label: {
                            fontColor: noteItem.color,
                            position: ['r', 'b', 'keep-in-box']
                        }
                    }
                };

                addToUnits(coordsUnit.units, annotatedArea, noteItem.position);
            },

            addLineNote: function (specRef, coordsUnit, noteItem) {

                var xScale = specRef.scales[coordsUnit.x];
                var yScale = specRef.scales[coordsUnit.y];

                let axes = null;
                let isAxisNote = true;

                if (Array.isArray(noteItem.dim)) {
                    isAxisNote = false;
                    const dims = noteItem.dim;
                    if (
                        (dims[0] === xScale.dim && dims[1] === yScale.dim) ||
                        (dims[0] === yScale.dim && dims[1] === xScale.dim)
                    ) {
                        axes = ['x', 'y']
                    }
                } else {
                    if (noteItem.dim === xScale.dim) {
                        axes = ['x', 'y'];
                    } else if (noteItem.dim === yScale.dim) {
                        axes = ['y', 'x'];
                    }
                }

                if (axes === null) {
                    console.log('Annotation doesn\'t match any field');
                    return;
                }

                var text = noteItem.text;

                var annotatedLine = {
                    type: 'ELEMENT.LINE',
                    namespace: 'annotations',
                    x: coordsUnit.x,
                    y: coordsUnit.y,
                    label: textScaleName,
                    color: noteItem.colorScaleName,
                    expression: {
                        inherit: false,
                        operator: 'none',
                        params: [],
                        source: '/'
                    },
                    guide: {
                        showAnchors: 'never',
                        widthCssClass: 'tau-chart__line-width-2',
                        cssClass: 'tau-chart__annotation-line',
                        label: {
                            fontColor: noteItem.color,
                            position: (isAxisNote ?
                                ['r', 'b', 'keep-in-box'] :
                                ['auto:avoid-label-edges-overlap', 'auto:adjust-on-label-overflow', 'auto:hide-on-label-edges-overlap']
                            )
                        },
                        x: {
                            fillGaps: false
                        },
                        y: {
                            fillGaps: false
                        }
                    }
                };

                let extension = (isAxisNote ?
                    {
                        transformModel: [stretchByOrdinalAxis(noteItem)],
                        transformation: [
                            {
                                type: 'dataLimit',
                                args: {
                                    from: noteItem.val,
                                    text,
                                    primaryScale: coordsUnit[axes[0]],
                                    secondaryScale: coordsUnit[axes[1]]
                                }
                            }
                        ],
                    } :
                    (() => {
                        const points = (dims[0] === xScale.dim ?
                            noteItem.val :
                            noteItem.val.map((d) => d.slice().reverse()));
                        return {
                            transformation: [
                                {
                                    type: 'lineNoteData',
                                    args: {
                                        points,
                                        text,
                                        xScale: coordsUnit.x,
                                        yScale: coordsUnit.y
                                    }
                                }
                            ]
                        };
                    })()
                );

                Object.assign(annotatedLine, extension);

                addToUnits(coordsUnit.units, annotatedLine, noteItem.position);
            },

            onSpecReady: function (chart, specRef) {

                var self = this;
                var units = [];
                chart.traverseSpec(specRef, function (unit) {
                    if (unit && (unit.type === 'COORDS.RECT') && (unit.units)) {
                        units.push(unit);
                    }
                });

                var specApi = pluginsSDK.spec(specRef);

                units.forEach(function (coordsUnit) {

                    settings.items
                        .map(function (item, i) {

                            var color = (item.color || '#BD10E0').toLowerCase();
                            var rgbCode = d3.rgb(color).toString();
                            if ((color !== 'black') && (rgbCode === 'rgb(0, 0, 0)')) {
                                rgbCode = null;
                            }
                            var colorStr = rgbCode || color;

                            var colorScaleName = 'annotation_color_' + i;
                            specApi.addScale(
                                colorScaleName,
                                {
                                    type: 'color',
                                    source: '?',
                                    brewer: [colorStr]
                                });

                            return {
                                dim: item.dim,
                                val: item.val,
                                text: item.text,
                                color: colorStr,
                                position: item.position,
                                colorScaleName: colorScaleName
                            };
                        })
                        .forEach(function (item) {
                            if (Array.isArray(item.dim)) {
                                if (Array.isArray(item.val) && item.val.every(Array.isArray)) {
                                    self.addLineNote(specRef, coordsUnit, item);
                                } else {
                                    // Todo: point annotation.
                                    // self.addPointNote(specRef, coordsUnit, item);
                                    console.log('Point annotation is not impleented yet');
                                }
                            } else if (Array.isArray(item.val)) {
                                self.addAreaNote(specRef, coordsUnit, item);
                            } else {
                                self.addLineNote(specRef, coordsUnit, item);
                            }
                        });
                });
            }
        };
    }

    Taucharts.api.plugins.add('annotations', annotations);

export default annotations;
