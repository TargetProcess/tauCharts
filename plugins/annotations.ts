import Taucharts from 'taucharts';
import * as d3 from 'd3-color';
import {Plot, GPLSpec, Unit, GrammarModel, DataSources} from '../src/definitions';

interface Annotation {
    dim: any;
    val: any;
    text?: string;
    color?: string;
    position?: 'front' | 'back';
    colorScaleName?: string;
}

interface AxisAnnotation extends Annotation {
    dim: string;
    val: any;
    text?: string;
    color?: string;
    position?: 'front' | 'back';
}

interface AreaAnnotation extends Annotation {
    dim: string;
    val: any[];
    text?: string;
    color?: string;
    position?: 'front' | 'back';
}

interface LineAnnotation extends Annotation {
    dim: string[];
    val: any[][];
    text?: string;
    color?: string;
    position?: 'front' | 'back';
}

interface PointAnnotation extends Annotation {
    dim: string[];
    val: any[];
    text?: string;
    color?: string;
    position?: 'front' | 'back';
}

type SomeAnnotation = (AxisAnnotation | AreaAnnotation | LineAnnotation | PointAnnotation);

interface AnnotationSettings {
    items: SomeAnnotation[];
}

interface Bound {
    text?: string;
    [prop: string]: any;
}

interface MetaInfo {
    from: any;
    to: any;
    primaryScale: string;
    secondaryScale: string;
    axis: 'x' | 'y';
    text: string;
}

interface LineMetaInfo {
    xScale: string;
    yScale: string;
    points: any[][];
    text: string;
}

    var utils = Taucharts.api.utils;
    var pluginsSDK = Taucharts.api.pluginsSDK;

    var addToUnits = function (units: Unit[], newUnit: Unit, position: 'front' | 'back') {
        if (position === 'front') {
            units.push(newUnit);
        } else {
            // behind by default
            units.unshift(newUnit);
        }
    };

    var stretchByOrdinalAxis = function (noteItem: AreaAnnotation | AxisAnnotation) {
        return function (model: GrammarModel) {

            interface StretchModel {
                xi?: (row) => number;
                yi?: (row) => number;
            }

            var res: StretchModel = {};
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
                    method: null,
                    k: null
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
            var method = seed.method as ('xi' | 'yi');
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
                    const k = ((scale(max) - scale(min)) / ((max as any) - (min as any)));
                    switch (row[marker]) {
                        case 'l': {
                            const overflow = Math.min(0, domain[0] - (min as any));
                            return (scale(min) + k * overflow);
                        }
                        case 'r': {
                            const overflow = Math.max(0, domain[1] - (max as any));
                            return (scale(max) + k * overflow);
                        }
                    }
                }
                return model[method](row);
            });
            return res;
        };
    };

    function annotations(xSettings: AnnotationSettings) {

        const settings = utils.defaults(xSettings || {}, {
            items: [] as SomeAnnotation[],
        });
        var textScaleName = 'annotation_text';

        return {

            init(chart: Plot) {
                this._chart = chart;

                var specRef = chart.getSpec();
                specRef.scales[textScaleName] = {type: 'value', dim: 'text', source: '?'};
                specRef.transformations = specRef.transformations || {};
                const log = (msg) => specRef.settings.log(msg, 'LOG');

                // NOTE: We need to save rows references to let
                // annotations properly animate during filtering.
                this._dataRefs = {};

                specRef.transformations.dataRange = (data, metaInfo: MetaInfo) => {

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
                        log('Annotation is out of domain');
                        return [];
                    }

                    var secondaryScaleInfo = chart.getScaleInfo(metaInfo.secondaryScale);
                    var secDomain = secondaryScaleInfo.domain();
                    var boundaries = [secDomain[0], secDomain[secDomain.length - 1]];

                    var a = primaryScaleInfo.dim;
                    var b = secondaryScaleInfo.dim;
                    var z = '__pos__';

                    var leftBtm: Bound = {};
                    var leftTop: Bound = {};
                    var rghtTop: Bound = {};
                    var rghtBtm: Bound = {};

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

                    return this._useSavedDataRefs([leftBtm, leftTop, rghtTop, rghtBtm], String([a, from, to]));
                };

                specRef.transformations.dataLimit = (data, metaInfo: MetaInfo) => {

                    var primary = metaInfo.primaryScale;
                    var secondary = metaInfo.secondaryScale;

                    var primaryScaleInfo = chart.getScaleInfo(primary);
                    var from = ((primaryScaleInfo.period) ?
                        Taucharts.api.tickPeriod.get(primaryScaleInfo.period, {utc: specRef.settings.utcTime})
                            .cast(new Date(metaInfo.from)) :
                        metaInfo.from);
                    var isOutOfDomain = (!primaryScaleInfo.isInDomain(from));

                    if (isOutOfDomain) {
                        log('Annotation is out of domain');
                        return [];
                    }

                    var secondaryScaleInfo = chart.getScaleInfo(secondary);
                    var secDomain = secondaryScaleInfo.domain();
                    var boundaries = [secDomain[0], secDomain[secDomain.length - 1]];

                    var src: Bound = {};
                    var dst: Bound = {};

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

                    return this._useSavedDataRefs([src, dst], String(from));
                };

                specRef.transformations.lineNoteData = (data, metaInfo: LineMetaInfo) => {

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
                        log('Annotation is out of domain');
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

                    return this._useSavedDataRefs(linePoints, JSON.stringify([xDim, yDim, metaInfo.points]));
                };
            },

            addAreaNote: function (specRef: GPLSpec, coordsUnit: Unit, noteItem: AreaAnnotation) {

                const log = (msg) => specRef.settings.log(msg, 'LOG');

                var xScale = specRef.scales[coordsUnit.x];
                var yScale = specRef.scales[coordsUnit.y];

                var axes = ((noteItem.dim === xScale.dim) ?
                    ['x', 'y'] :
                    ((noteItem.dim === yScale.dim) ?
                        ['y', 'x'] :
                        (null)));

                if (axes === null) {
                    log('Annotation doesn\'t match any data field');
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
                        animationSpeed: coordsUnit.guide.animationSpeed,
                        showAnchors: 'never',
                        cssClass: 'tau-chart__annotation-area',
                        label: {
                            fontColor: noteItem.color,
                            position: ['r', 'b', 'keep-in-box']
                        }
                    }
                } as Unit;

                addToUnits(coordsUnit.units, annotatedArea, noteItem.position);
            },

            addLineNote: function (specRef: GPLSpec, coordsUnit: Unit, noteItem: AxisAnnotation | LineAnnotation) {

                const log = (msg) => specRef.settings.log(msg, 'LOG');

                var xScale = specRef.scales[coordsUnit.x];
                var yScale = specRef.scales[coordsUnit.y];

                let axes: ('x' | 'y')[] = null;
                let isAxisNote = true;
                let dims: string[];

                if (Array.isArray(noteItem.dim)) {
                    isAxisNote = false;
                    dims = noteItem.dim;
                    if (
                        (dims[0] === xScale.dim && dims[1] === yScale.dim) ||
                        (dims[0] === yScale.dim && dims[1] === xScale.dim)
                    ) {
                        axes = ['x', 'y'];
                    }
                } else {
                    if (noteItem.dim === xScale.dim) {
                        axes = ['x', 'y'];
                    } else if (noteItem.dim === yScale.dim) {
                        axes = ['y', 'x'];
                    }
                }

                if (axes === null) {
                    log('Annotation doesn\'t match any field');
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
                        animationSpeed: coordsUnit.guide.animationSpeed,
                        showAnchors: 'never' as 'never',
                        widthCssClass: 'tau-chart__line-width-2',
                        cssClass: 'tau-chart__annotation-line',
                        label: {
                            fontColor: noteItem.color,
                            position: (isAxisNote ?
                                ['r', 'b', 'keep-in-box'] :
                                [
                                    'auto:avoid-label-edges-overlap',
                                    'auto:adjust-on-label-overflow',
                                    'keep-in-box'
                                ]
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
                        transformModel: [stretchByOrdinalAxis(noteItem as AxisAnnotation)],
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

            onUnitsStructureExpanded() {
                const chart: Plot = this._chart;

                const specRef = chart.getSpec();
                const data = chart.getDataSources()['/'].data;
                const annotatedValues = this._getAnnotatedDimValues(settings.items);
                const annotatedDims = Object.keys(annotatedValues);
                annotatedDims.forEach((dim) => {
                    const xScaleId = `x_${dim}`;
                    const yScaleId = `y_${dim}`;
                    [xScaleId, yScaleId].forEach((scaleId) => {
                        if (scaleId in specRef.scales) {
                            const config = specRef.scales[scaleId];
                            const originalValues = data.map((row) => row[dim]);
                            config.series = utils.unique(originalValues.concat(annotatedValues[dim]));
                        }
                    });
                });

                this._startWatchingDataRefs();
            },

            onRender() {
                this._clearUnusedDataRefs();
            },

            onSpecReady: function (chart: Plot, specRef: GPLSpec) {

                var self = this;
                var units: Unit[] = [];
                chart.traverseSpec(specRef, function (unit) {
                    if (unit && (unit.type === 'COORDS.RECT') && (unit.units)) {
                        units.push(unit);
                    }
                });

                const log = (msg) => specRef.settings.log(msg, 'LOG');
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
                                    log('Point annotation is not implemented yet');
                                }
                            } else if (Array.isArray(item.val)) {
                                self.addAreaNote(specRef, coordsUnit, item);
                            } else {
                                self.addLineNote(specRef, coordsUnit, item);
                            }
                        });
                });
            },

            _useSavedDataRefs(rows: any[], key: string) {
                const refs = this._dataRefs;
                const usedKeys = this._usedDataRefsKeys;

                usedKeys.add(key);

                if (key in refs) {
                    refs[key].forEach((ref, i) => Object.assign(ref, rows[i]));
                    return refs[key];
                }

                refs[key] = rows;
                return rows;
            },

            _startWatchingDataRefs() {
                const refs = this._dataRefs;
                this._initialDataRefsKeys = new Set(Object.keys(refs));
                this._usedDataRefsKeys = new Set();
            },

            _clearUnusedDataRefs() {
                const refs = this._dataRefs;
                const initialKeys: Set<string> = this._initialDataRefsKeys;
                const usedKeys: Set<string> = this._usedDataRefsKeys;
                Array.from(initialKeys)
                    .filter((key) => !usedKeys.has(key))
                    .forEach((key) => delete refs[key]);
                this._initialDataRefsKeys = null;
                this._usedDataRefsKeys = null;
            },

            _getDataRowsFromItems(items: SomeAnnotation[]) {
                const createRow = (dims: string[], vals: any[]) => {
                    return dims.reduce((row, dim, i) => {
                        row[dim] = vals[i];
                        return row;
                    }, {});
                };
                return items.reduce((rows, item) => {
                    if (Array.isArray(item.dim)) {
                        if (Array.isArray(item.val) && item.val.every(Array.isArray)) {
                            item.val.forEach((v) => {
                                rows.push(createRow(item.dim as string[], v));
                            });
                        } else {
                            // Todo: point annotation.
                        }
                    } else if (Array.isArray(item.val)) {
                        item.val.forEach((v) => {
                            rows.push(createRow([item.dim as string], [v]));
                        });
                    } else {
                        rows.push(createRow([item.dim as string], [item.val]));
                    }
                    return rows;
                }, []);
            },

            _getAnnotatedDimValues(items: SomeAnnotation[]) {
                const rows = this._getDataRowsFromItems(items);
                const values: {[dim: string]: any[]} = {};
                rows.forEach((row) => {
                    Object.keys(row).forEach((dim) => {
                        values[dim] = values[dim] || [];
                        values[dim].push(row[dim]);
                    });
                });
                return values;
            },
        };
    }

Taucharts.api.plugins.add('annotations', annotations);

export default annotations;
