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

    var _ = tauCharts.api._;
    var d3 = tauCharts.api.d3;

    function annotations(xSettings) {

        var settings = _.defaults(xSettings || {}, {});
        var textScaleName = 'annotation_text';

        return {

            init: function (chart) {
                this._chart = chart;
            },

            addAreaNote: function (specRef, coordsUnit, noteItem) {

                var xScale = specRef.scales[coordsUnit.x];
                var yScale = specRef.scales[coordsUnit.y];

                var axis = ((noteItem.dim === xScale.dim) ?
                    ('x') :
                    ((noteItem.dim === yScale.dim) ?
                        ('y') :
                        (null)));

                if (axis === null) {
                    console.log('Annotation doesn\'t match any data field');
                    return;
                }

                var from = noteItem.val[0];
                var to = noteItem.val[1];
                var scaleInfo = this._chart.getScaleInfo(coordsUnit[axis]);
                var domain = scaleInfo.domain();
                var min = domain[0];
                var max = domain[1];
                if ((from >= max) || (to <= min)) {
                    console.log('Annotation is out of domain');
                    return;
                }

                var annotatedArea = {
                    type: 'ELEMENT.PATH',
                    namespace: 'annotations',
                    x: coordsUnit.x,
                    y: coordsUnit.y,
                    color: 'color:default',
                    text: textScaleName,
                    expression: {
                        inherit: false,
                        operator: 'none',
                        params: [],
                        source: '/'
                    },
                    transformation: [
                        {
                            type: 'dataRange',
                            args: {
                                axis: axis,
                                text: noteItem.text,
                                from: from,
                                to: to,
                                x: xScale.dim,
                                y: yScale.dim
                            }
                        }
                    ],
                    guide: {
                        showAnchors: false,
                        cssClass: 'graphical-report__annotation-area',
                        color: {
                            fill: noteItem.color
                        },
                        text: {
                            fontColor: noteItem.color,
                            paddingX: ((axis === 'x') ? 5 : -5),
                            paddingY: ((axis === 'x') ? 5 : 15)
                        }
                    }
                };

                coordsUnit.units.unshift(annotatedArea);
            },

            addLineNote: function (specRef, coordsUnit, noteItem) {

                var xScale = specRef.scales[coordsUnit.x];
                var yScale = specRef.scales[coordsUnit.y];

                var axis = ((noteItem.dim === xScale.dim) ?
                    ('x') :
                    ((noteItem.dim === yScale.dim) ?
                        ('y') :
                        (null)));

                if (axis === null) {
                    console.log('Annotation doesn\'t match any field');
                    return;
                }

                var text = noteItem.text;
                var from = noteItem.val;
                var scaleInfo = this._chart.getScaleInfo(coordsUnit[axis]);
                var domain = scaleInfo.domain();
                var min = domain[0];
                var max = domain[1];
                if ((from >= max) || (from <= min)) {
                    console.log('Annotation is out of domain');
                    return;
                }

                var annotatedLine = {
                    type: 'ELEMENT.LINE',
                    namespace: 'annotations',
                    x: coordsUnit.x,
                    y: coordsUnit.y,
                    text: textScaleName,
                    color: 'color:default',
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
                                axis: axis,
                                from: from,
                                text: text,
                                x: xScale.dim,
                                y: yScale.dim
                            }
                        }
                    ],
                    guide: {
                        showAnchors: false,
                        widthCssClass: 'graphical-report__line-width-2',
                        cssClass: 'graphical-report__annotation-line',
                        color: {
                            fill: noteItem.color
                        },
                        text: {
                            fontColor: noteItem.color,
                            paddingX: ((axis === 'x') ? 5 : -5),
                            paddingY: ((axis === 'x') ? 5 : -5)
                        }
                    }
                };

                coordsUnit.units.unshift(annotatedLine);
            },

            onSpecReady: function (chart, specRef) {

                var self = this;
                specRef.scales[textScaleName] = {type: 'value', dim: 'text', source: '?'};
                specRef.transformations = specRef.transformations || {};

                specRef.transformations.dataRange = function (data, metaInfo) {
                    var a = ((metaInfo.axis === 'x') ? metaInfo.x : metaInfo.y);
                    var b = ((metaInfo.axis === 'x') ? metaInfo.y : metaInfo.x);

                    var leftBtm = {};
                    var leftTop = {};
                    var rghtTop = {};
                    var rghtBtm = {};

                    leftBtm[a] = metaInfo.from;
                    leftBtm[b] = (-Infinity);

                    leftTop[a] = metaInfo.from;
                    leftTop[b] = (Infinity);

                    rghtTop[a] = metaInfo.to;
                    rghtTop[b] = (Infinity);

                    rghtBtm[a] = metaInfo.to;
                    rghtBtm[b] = (-Infinity);

                    if (metaInfo.axis === 'x') {
                        leftTop.text = metaInfo.text;
                    } else {
                        rghtTop.text = metaInfo.text;
                    }

                    return [leftBtm, leftTop, rghtTop, rghtBtm];
                };

                specRef.transformations.dataLimit = function (data, metaInfo) {
                    var a = ((metaInfo.axis === 'x') ? metaInfo.x : metaInfo.y);
                    var b = ((metaInfo.axis === 'x') ? metaInfo.y : metaInfo.x);

                    var src = {};
                    var dst = {};

                    src[a] = metaInfo.from;
                    src[b] = (-Infinity);

                    dst[a] = metaInfo.from;
                    dst[b] = (Infinity);
                    dst.text = metaInfo.text;

                    return [src, dst];
                };

                var units = [];
                chart.traverseSpec(specRef, function (unit) {
                    if (unit && (unit.type === 'COORDS.RECT')) {
                        units.push(unit);
                    }
                });

                units.forEach(function (coordsUnit) {
                    settings.items.forEach(function (item) {

                        item.color = item.color || '#BD10E0'; // #4300FF / #FFAB00

                        if (_.isArray(item.val)) {
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