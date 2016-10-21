(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['tauCharts'], function (tauPlugins) {
            return factory(tauPlugins);
        });
    } else if (typeof module === 'object' && module.exports) {
        var tauPlugins = require('tauCharts');
        module.exports = factory(tauPlugins);
    } else {
        factory(this.tauCharts);
    }
})(function (tauCharts) {

    var utils = tauCharts.api.utils;
    var d3 = tauCharts.api.d3;
    var pluginsSDK = tauCharts.api.pluginsSDK;

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
                return (scale.discrete ?
                    (model[method](row) + scale.stepSize(row[scale.dim]) * k) :
                    (model[method](row)));
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

                    if ((primaryScaleInfo.scaleType === 'period')) {
                        var periodCaster = tauCharts.api.tickPeriod.get(primaryScaleInfo.period);
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
                    var from = ((primaryScaleInfo.scaleType === 'period') ?
                        tauCharts.api.tickPeriod.get(primaryScaleInfo.period).cast(new Date(metaInfo.from)) :
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
                        showAnchors: false,
                        cssClass: 'graphical-report__annotation-area',
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

                var axes = ((noteItem.dim === xScale.dim) ?
                    ['x', 'y'] :
                    ((noteItem.dim === yScale.dim) ?
                        ['y', 'x'] :
                        (null)));

                if (axes === null) {
                    console.log('Annotation doesn\'t match any field');
                    return;
                }

                var text = noteItem.text;
                var from = noteItem.val;

                var annotatedLine = {
                    type: 'ELEMENT.LINE',
                    namespace: 'annotations',
                    x: coordsUnit.x,
                    y: coordsUnit.y,
                    label: textScaleName,
                    color: noteItem.colorScaleName,
                    transformModel: [stretchByOrdinalAxis(noteItem)],
                    expression: {
                        inherit: false,
                        operator: 'none',
                        params: [],
                        source: '/'
                    },
                    transformation: [
                        {
                            type: 'dataLimit',
                            args: {
                                from: from,
                                text: text,
                                primaryScale: coordsUnit[axes[0]],
                                secondaryScale: coordsUnit[axes[1]]
                            }
                        }
                    ],
                    guide: {
                        showAnchors: false,
                        widthCssClass: 'graphical-report__line-width-2',
                        cssClass: 'graphical-report__annotation-line',
                        label: {
                            fontColor: noteItem.color,
                            position: ['r', 'b', 'keep-in-box']
                        }
                    }
                };

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
                            var rgbCode = d3.rgb(color).toString().toUpperCase();
                            if ((color !== 'black') && (rgbCode === '#000000')) {
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
                            if (Array.isArray(item.val)) {
                                self.addAreaNote(specRef, coordsUnit, item);
                            } else {
                                self.addLineNote(specRef, coordsUnit, item);
                            }
                        });
                });
            }
        };
    }

    tauCharts.api.plugins.add('annotations', annotations);

    return annotations;
});