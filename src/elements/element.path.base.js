import {Element} from './element';
import {CartesianGrammar} from '../models/cartesian-grammar';
import {LayerLabels} from './decorators/layer-labels';
import {CSS_PREFIX} from '../const';
import {d3_animationInterceptor, d3_transition as transition} from '../utils/d3-decorators';
import {utils} from '../utils/utils';
import {default as d3} from 'd3';

export class BasePath extends Element {

    constructor(config) {

        super(config);

        this.config = config;

        this.config.guide = utils.defaults(
            (this.config.guide || {}),
            {
                animationSpeed: 0,
                cssClass: '',
                widthCssClass: '',
                showAnchors: true,
                anchorSize: 0.1,
                color: {},
                label: {}
            }
        );

        this.config.guide.label = utils.defaults(
            this.config.guide.label,
            {
                fontSize: 11,
                position: [
                    'auto:avoid-label-label-overlap',
                    'auto:avoid-label-anchor-overlap',
                    'auto:avoid-label-edges-overlap',
                    'auto:hide-on-label-label-overlap',
                    'auto:hide-on-label-edges-overlap',
                    'keep-in-box'
                ]
            });

        this.config.guide.color = utils.defaults(this.config.guide.color || {}, {fill: null});

        this.config.guide.size = utils.defaults(
            (this.config.guide.size || {}),
            {
                defMinSize: 2,
                defMaxSize: (this.isEmptySize ? 6 : 40)
            });

        this.decorators = [];

        this.on('highlight', (sender, e) => this.highlight(e));
        this.on('highlight-data-points', (sender, e) => this.highlightDataPoints(e));

        if (this.config.guide.showAnchors) {
            var activate = ((sender, e) => sender.fire('highlight-data-points', (row) => (row === e.data)));
            var deactivate = ((sender) => sender.fire('highlight-data-points', () => (false)));
            this.on('mouseover', activate);
            this.on('mousemove', activate);
            this.on('mouseout', deactivate);
        }
    }

    createScales(fnCreateScale) {

        var config = this.config;

        this.xScale = fnCreateScale('pos', config.x, [0, config.options.width]);
        this.yScale = fnCreateScale('pos', config.y, [config.options.height, 0]);
        this.size = fnCreateScale('size', config.size, {});
        this.color = fnCreateScale('color', config.color, {});
        this.label = fnCreateScale('label', config.label, {});
        this.split = fnCreateScale('split', config.split, {});
        this.identity = fnCreateScale('identity', config.identity, {});

        return this
            .regScale('x', this.xScale)
            .regScale('y', this.yScale)
            .regScale('size', this.size)
            .regScale('color', this.color)
            .regScale('split', this.split)
            .regScale('label', this.label);
    }

    buildModel(screenModel) {

        const datumClass = `i-role-datum`;
        const pointPref = `${CSS_PREFIX}dot-line dot-line i-role-dot ${datumClass} ${CSS_PREFIX}dot `;
        var kRound = 10000;
        var baseModel = {
            gog: screenModel.model,
            x: screenModel.x,
            y: screenModel.y,
            x0: screenModel.x0,
            y0: screenModel.y0,
            size: screenModel.size,
            group: screenModel.group,
            order: screenModel.order,
            color: screenModel.color,
            class: screenModel.class,
            matchRowInCoordinates() {
                throw 'Not implemented';
            },
            groupAttributes: {},
            pathAttributesUpdateInit: {},
            pathAttributesUpdateDone: {},
            pathAttributesEnterInit: {},
            pathAttributesEnterDone: {},
            pathElement: null,
            dotAttributes: {
                r: ((d) => (Math.round(kRound * baseModel.size(d) / 2) / kRound)),
                cx: (d) => baseModel.x(d),
                cy: (d) => baseModel.y(d),
                fill: (d) => baseModel.color(d),
                class: (d) => (`${pointPref} ${baseModel.class(d)}`)
            },
            dotAttributesDefault: {
                r: 0,
                cy: (d) => baseModel.y0(d)
            }
        };

        return baseModel;
    }

    getDistance(mx, my, rx, ry) {
        return Math.sqrt(Math.pow((mx - rx), 2) + Math.pow((my - ry), 2));
    }

    walkFrames(frames) {

        var args = {
            isHorizontal: this.config.flip,
            defMin: this.config.guide.size.defMinSize,
            defMax: this.config.guide.size.defMaxSize,
            minLimit: this.config.guide.size.minSize,
            maxLimit: this.config.guide.size.maxSize,
            dataSource: frames.reduce(((memo, f) => memo.concat(f.part())), [])
        };

        return this
            .decorators
            .filter(x => x)
            .reduce((model, transform) => CartesianGrammar.compose(model, transform(model, args)),
            (new CartesianGrammar({
                scaleX: this.xScale,
                scaleY: this.yScale,
                scaleSize: this.size,
                scaleLabel: this.label,
                scaleColor: this.color,
                scaleSplit: this.split,
                scaleIdentity: this.identity
            })));
    }

    drawFrames(frames) {

        var self = this;

        var guide = this.config.guide;
        var options = this.config.options;

        var fullData = frames.reduce(((memo, f) => memo.concat(f.part())), []);
        var pathModel = this.walkFrames(frames);
        this.screenModel = pathModel.toScreenModel();
        var model = this.buildModel(this.screenModel);

        var createUpdateFunc = d3_animationInterceptor;

        var updateGroupContainer = function () {

            this.attr(model.groupAttributes);

            var points = this
                .selectAll('circle')
                .data((fiber) => (fiber.length <= 1) ? fiber : [], self.screenModel.id);
            points
                .exit()
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    null,
                    {r: 0},
                    (node) => d3.select(node).remove()));
            points
                .call(createUpdateFunc(guide.animationSpeed, null, model.dotAttributes));
            points
                .enter()
                .append('circle')
                .call(createUpdateFunc(guide.animationSpeed, model.dotAttributesDefault, model.dotAttributes));

            self.subscribe(points, (d) => d);

            var updatePath = (selection) => {
                if (self.config.guide.animationSpeed > 0) {
                    transition(selection, self.config.guide.animationSpeed, 'pathTransition')
                        .attrTween(model.pathTween.attr, model.pathTween.fn);
                } else {
                    selection.attr(model.pathTween.attr, (d) => model.pathTween.fn(d)(1));
                }
            };

            var series = this
                .selectAll(model.pathElement)
                .data((fiber) => (fiber.length > 1) ? [fiber] : [], getDataSetId);
            series
                .exit()
                .remove();
            series
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesUpdateInit,
                    model.pathAttributesUpdateDone,
                    model.afterPathUpdate
                ))
                .call(updatePath);
            series
                .enter()
                .append(model.pathElement)
                .call(createUpdateFunc(
                    guide.animationSpeed,
                    model.pathAttributesEnterInit,
                    model.pathAttributesEnterDone,
                    model.afterPathUpdate
                ))
                .call(updatePath);

            self.subscribe(series, function (rows) {
                var m = d3.mouse(this);
                return model.matchRowInCoordinates(
                    rows.filter(CartesianGrammar.isNonSyntheticRecord),
                    {x: m[0], y: m[1]});
            });

            if (guide.showAnchors) {

                let attr = {
                    r: () => guide.anchorSize,
                    cx: (d) => model.x(d),
                    cy: (d) => model.y(d),
                    opacity: 0,
                    class: 'i-data-anchor'
                };

                let dots = this
                    .selectAll('.i-data-anchor')
                    .data((fiber) => fiber.filter(CartesianGrammar.isNonSyntheticRecord));
                dots.exit()
                    .remove();
                dots.call(createUpdateFunc(guide.animationSpeed, null, attr));
                dots.enter()
                    .append('circle')
                    .call(createUpdateFunc(guide.animationSpeed, {r: 0}, attr));

                self.subscribe(dots);
            }
        };

        var fibers = this.config.stack ?
            CartesianGrammar.toStackedFibers(fullData, pathModel) :
            CartesianGrammar.toFibers(fullData, pathModel);

        // NOTE: If any point from new dataset is equal to a point from old dataset,
        // we assume that path remains the same.
        // TODO: Id of data array should remain the same (then use `fib => self.screenModel.id(fib)`).
        var currentDataSets = (function () {
            var selection = options.container.selectAll('.frame');
            return selection.empty() ? [] : selection.data();
        })();
        var currentIds = currentDataSets.map(ds => ds.map(self.screenModel.id));
        var notFoundDatasets = 0;
        var getDataSetId = fib => {
            var fibIds = fib.map(f => self.screenModel.id(f));
            var currentIndex = currentIds.findIndex(
                ds => fibIds.some(
                    f => f >= ds[0] && f <= ds[ds.length - 1] && ds.some(
                        d => d === f)));
            if (currentIndex < 0) {
                ++notFoundDatasets;
                return -notFoundDatasets;
            }
            return currentIndex;
        };

        var frameGroups = options
            .container
            .selectAll('.frame')
            .data(fibers, getDataSetId);
        frameGroups
            .exit()
            .remove();
        frameGroups
            .call(updateGroupContainer);
        frameGroups
            .enter()
            .append('g')
            .call(updateGroupContainer);

        frameGroups.order();

        var dataFibers = CartesianGrammar.toFibers(fullData, pathModel);
        self.subscribe(new LayerLabels(pathModel, this.config.flip, this.config.guide.label, options).draw(dataFibers));
    }

    highlight(filter) {

        var container = this.config.options.container;

        const x = 'graphical-report__highlighted';
        const _ = 'graphical-report__dimmed';

        container
            .selectAll('.i-role-path')
            .classed({
                [x]: ((fiber) => filter(fiber.filter(CartesianGrammar.isNonSyntheticRecord)[0]) === true),
                [_]: ((fiber) => filter(fiber.filter(CartesianGrammar.isNonSyntheticRecord)[0]) === false)
            });

        container
            .selectAll('.i-role-dot')
            .classed({
                [x]: ((d) => filter(d) === true),
                [_]: ((d) => filter(d) === false)
            });

        container
            .selectAll('.i-role-label')
            .classed({
                [x]: ((d) => filter(d) === true),
                [_]: ((d) => filter(d) === false)
            });
    }

    highlightDataPoints(filter) {
        const cssClass = 'i-data-anchor';
        this.config
            .options
            .container
            .selectAll(`.${cssClass}`)
            .attr({
                r: (d) => (filter(d) ? (this.screenModel.size(d) / 2) : this.config.guide.anchorSize),
                opacity: (d) => (filter(d) ? 1 : 0),
                fill: (d) => this.screenModel.color(d),
                class: (d) => (`${cssClass} ${this.screenModel.class(d)}`)
            });
    }

    createPathTween(attr, pathStringBuilder, model) {
        const tweenStore = '__pathTween__';
        const self = this;

        return function (data) {
            if (!this[tweenStore]) {
                this[tweenStore] = {
                    builder: pathStringBuilder,
                    points: []
                };
            }

            var pointsTo = utils.unique(data, self.screenModel.id)
                .map(model.toPoint);

            var pointsFrom = this[tweenStore].points
                .filter(pt => !pt.isInterpolatedEndingPoint);

            var interpolate = self.createPointsInterpolator(pointsFrom, pointsTo);

            return function (t) {
                if (t === 0) {
                    return this[tweenStore].builder(pointsFrom);
                }
                if (t === 1) {
                    this[tweenStore].points = pointsTo;
                    this[tweenStore].builder = pathStringBuilder;
                    return pathStringBuilder(pointsTo);
                }

                var intermediate = interpolate(t);

                // Save intermediate data to be able
                // to continue transition after interrupt
                this[tweenStore].points = intermediate;

                if (intermediate.length === 0) {
                    return '';
                }

                // TODO: Domain and range of a Scale should change dynamically during transition.
                var attrValue = d3.interpolate(
                    this[tweenStore].builder(intermediate),
                    pathStringBuilder(intermediate)
                )(t);
                return attrValue;

            }.bind(this);
        };
    }

    createPointsInterpolator(pointsFrom, pointsTo) {

        function push(target, items) {
            return Array.prototype.push.apply(target, items);
        }

        /**
         * Returns a polyline with points that move along line
         * from start point to full line (or vice versa).
         */
        function interpolateEnding({t, polyline, decreasing, rightToLeft}) {

            var getLinePiece = (q, line) => {
                var existingCount = Math.floor((line.length - 1) * q) + 1;
                var tempCount = line.length - existingCount;
                var tempStartIdIndex = existingCount;
                var qi = (q * (line.length - 1)) % 1;
                var midPt = interpolatePoint(
                    line[existingCount - 1],
                    line[existingCount],
                    qi
                );
                var result = line.slice(0, existingCount);
                push(result, utils.range(tempCount).map((i) => Object.assign(
                    {}, midPt,
                    {
                        id: line[tempStartIdIndex + i].id,
                        positionIsBeingChanged: true,
                        isInterpolatedEndingPoint: true
                    }
                )));
                return result.slice(1);
            };

            var reverse = Boolean(decreasing) !== Boolean(rightToLeft);
            var result = getLinePiece(
                (decreasing ? (1 - t) : t),
                (reverse ? polyline.slice(0).reverse() : polyline)
            );
            if (reverse) {
                result.reverse();
            }

            return result;
        }

        /**
         * Returns a polyline, filled with points, so that number of points
         * becomes the same on both start and end polylines.
         */
        function fillSmallerPolyline({smallPolyline, bigPolyline}) {

            var segmentsCount = {
                small: smallPolyline.length - 1,
                big: bigPolyline.length - 1
            };
            var minSegmentPointsCount = Math.floor(segmentsCount.big / segmentsCount.small) + 1;
            var restPointsCount = segmentsCount.big % segmentsCount.small;
            var segmentsPointsCount = utils.range(segmentsCount.small)
                .map(i => (minSegmentPointsCount + (i < restPointsCount ? 1 : 0)));

            var result = [smallPolyline[0]];
            var smallPtIndex = 1;
            segmentsPointsCount.forEach((segPtCount) => {
                utils.range(1, segPtCount).forEach(i => {
                    if (i === segPtCount - 1) {
                        result.push(smallPolyline[smallPtIndex]);
                    } else {
                        var newPt = interpolatePoint(
                            smallPolyline[smallPtIndex - 1],
                            smallPolyline[smallPtIndex],
                            (i / (segPtCount - 1))
                        );
                        newPt.positionIsBeingChanged = true;
                        newPt.id = bigPolyline[result.length].id;
                        result.push(newPt);
                    }
                });
                smallPtIndex++;
            });

            return result;
        }

        function interpolateValue(a, b, t) {
            if (typeof b === 'string') {
                return (t === 0 ? a : b);
            }
            if (b instanceof Date) {
                return new Date(Number(a) + t * (b - a));
            }
            if (typeof b === 'boolean') {
                return (t === 0 ? a : b);
            }
            return (a + t * (b - a));
        }

        function interpolatePoint(a, b, t) {
            if (a === b) {
                return b;
            }
            var c = {};
            Object.keys(b).forEach((k) => c[k] = interpolateValue(a[k], b[k], t));
            c.id = a.id;
            return c;
        }

        function interpolatePoints(pointsFrom, pointsTo, t) {
            var result = pointsFrom.map((a, i) => interpolatePoint(a, pointsTo[i], t));
            return result;
        }

        /**
         * Returns a function which moves a point from it's scale
         * to opposite scale (e.g. from start scale to end scale).
         */
        function getScaleDiffFn(points1, points2) {

            // Find remaining points with predictable position
            var src = [];
            var dst = [];
            var i, j, a, b, matchJ = 0;
            var len1 = points1.length;
            var len2 = points2.length;
            for (i = 0; i < len1; i++) {
                a = points1[i];
                for (j = matchJ; j < len2; j++) {
                    b = points2[j];
                    if (a.id === b.id) {
                        if (
                            !a.positionIsBeingChanged &&
                            !b.positionIsBeingChanged
                        ) {
                            matchJ = j + 1;
                            src.push(a);
                            dst.push(b);
                        }
                        break;
                    }
                }
            }

            if (src.length < 1 || dst.length < 1) {
                // Applying scale difference will not be possible
                return (d => d);
            }

            var numProps = Object.keys(src[0])
                .filter(prop => typeof src[0][prop] === 'number')
                .filter(prop => prop !== 'id');

            var propDiffs = {};
            var createPropDiffFn = (a, b, A, B) => (c) => (
                B +
                (c - b) *
                (B - A) /
                (b - a)
            );
            var createSimpleDiffFn = (a, A) => (c) => (c - a + A);
            numProps.forEach(prop => {
                var a = src[0][prop];
                var A = dst[0][prop];
                for (var i = src.length - 1, b, B; i > 0; i--) {
                    b = src[i][prop];
                    if (b !== a) {
                        B = dst[i][prop];
                        propDiffs[prop] = createPropDiffFn(a, b, A, B);
                        return;
                    }
                }
                propDiffs[prop] = createSimpleDiffFn(a, A);
            });

            return function (c) {
                var C = Object.assign({}, c);
                numProps.forEach(p => {
                    C[p] = propDiffs[p](c[p]);
                });
                return C;
            };
        }

        var intermediate;
        var remainingPoints = [];
        var changingPoints = [];

        /**
         * Creates intermediate points array, so that the number of points
         * remains the same and added or excluded points are situated between
         * existing points.
         */
        var createIntermediatePoints = function () {
            intermediate = [];

            // NOTE: Suppose data is already sorted by X.
            var idsFrom = pointsFrom.map(d => d.id);
            var idsTo = pointsTo.map(d => d.id);
            var remainingIds = idsFrom
                .filter(id => idsTo.indexOf(id) >= 0);

            //
            // Determine start and end scales difference to apply
            // to initial target position of newly added points
            // (or end position of deleted points)

            var toEndScale = getScaleDiffFn(pointsFrom, pointsTo);
            var toStartScale = getScaleDiffFn(pointsTo, pointsFrom);

            //
            // Determine, how to interpolate changes between remaining points

            remainingIds.forEach((id, i) => {

                var indexFrom = idsFrom.indexOf(id);
                var indexTo = idsTo.indexOf(id);

                if (i === 0 && (indexFrom > 0 || indexTo > 0)) {

                    //
                    // Left side changes

                    let oldCount = indexFrom;
                    let newCount = indexTo;

                    if (newCount > 0 || oldCount > 0) {
                        let decreasing = newCount === 0;
                        let targetEnding = (decreasing ?
                            pointsFrom.slice(0, indexFrom + 1) :
                            pointsTo.slice(0, indexTo + 1)
                        );
                        let toOppositeScale = (decreasing ?
                            toEndScale :
                            toStartScale
                        );

                        changingPoints.push({
                            startIndex: 0,
                            getPoints: (
                                decreasing ?
                                    function (t) {
                                        var polyline = targetEnding.slice(0);
                                        var interpolated = interpolateEnding({
                                            t, polyline,
                                            decreasing,
                                            rightToLeft: !decreasing
                                        });
                                        var diffed = interpolated.map(toOppositeScale);
                                        return interpolatePoints(interpolated, diffed, t);
                                    } :
                                    function (t) {
                                        var polyline = targetEnding.slice(0);
                                        var interpolated = interpolateEnding({
                                            t, polyline,
                                            decreasing,
                                            rightToLeft: !decreasing
                                        });
                                        var diffed = interpolated.map(toOppositeScale);
                                        return interpolatePoints(diffed, interpolated, t);
                                    }
                            )
                        });
                        push(intermediate, utils.range(targetEnding.length - 1).map(() => null));
                    }
                }

                if (i > 0) {

                    //
                    // Inner changes

                    let oldCount = indexFrom - idsFrom.indexOf(remainingIds[i - 1]) - 1;
                    let newCount = indexTo - idsTo.indexOf(remainingIds[i - 1]) - 1;

                    let putChangingPoints = function (
                        smallPolyline,
                        bigPolyline,
                        reverse
                    ) {
                        var filledPoly = fillSmallerPolyline({
                            smallPolyline,
                            bigPolyline
                        });
                        var biggerPoints = bigPolyline.slice(1, bigPolyline.length - 1);
                        var smallerPoints = filledPoly.slice(1, filledPoly.length - 1);
                        changingPoints.push({
                            startIndex: intermediate.length,
                            getPoints: function (t) {
                                return interpolatePoints(
                                    smallerPoints,
                                    biggerPoints,
                                    (reverse ? 1 - t : t)
                                );
                            }
                        });
                    };

                    let polyFrom = pointsFrom.slice(indexFrom - oldCount - 1, indexFrom + 1);
                    let polyTo = pointsTo.slice(indexTo - newCount - 1, indexTo + 1);
                    if (newCount > oldCount) {
                        putChangingPoints(polyFrom, polyTo, false);
                    } else if (oldCount > newCount) {
                        putChangingPoints(polyTo, polyFrom, true);
                    } else if (oldCount > 0) {
                        changingPoints.push({
                            startIndex: intermediate.length,
                            getPoints: function (t) {
                                return interpolatePoints(
                                    pointsFrom.slice(
                                        indexFrom - oldCount,
                                        indexFrom
                                    ),
                                    pointsTo.slice(
                                        indexTo - newCount,
                                        indexTo
                                    ),
                                    t
                                );
                            }
                        });
                    }
                    push(intermediate, utils.range(Math.max(newCount, oldCount)).map(() => null));
                }

                remainingPoints.push({
                    index: intermediate.length,
                    getPoint: function (t) {
                        return interpolatePoint(pointsFrom[indexFrom], pointsTo[indexTo], t);
                    }
                });
                intermediate.push(null);

                if (i === remainingIds.length - 1) {

                    //
                    // Right side changes

                    let oldCount = pointsFrom.length - indexFrom - 1;
                    let newCount = pointsTo.length - indexTo - 1;

                    if (newCount > 0 || oldCount > 0) {
                        let decreasing = newCount === 0;
                        let targetEnding = (decreasing ?
                            pointsFrom.slice(indexFrom) :
                            pointsTo.slice(indexTo)
                        );
                        let toOppositeScale = (decreasing ?
                            toEndScale :
                            toStartScale
                        );

                        changingPoints.push({
                            startIndex: intermediate.length,
                            getPoints: (
                                decreasing ?
                                    function (t) {
                                        var polyline = targetEnding.slice(0);
                                        var interpolated = interpolateEnding({
                                            t, polyline,
                                            decreasing,
                                            rightToLeft: decreasing
                                        });
                                        var diffed = interpolated.map(toOppositeScale);
                                        return interpolatePoints(interpolated, diffed, t);
                                    } :
                                    function (t) {
                                        var polyline = targetEnding.slice(0);
                                        var interpolated = interpolateEnding({
                                            t, polyline,
                                            decreasing,
                                            rightToLeft: decreasing
                                        });
                                        var diffed = interpolated.map(toOppositeScale);
                                        return interpolatePoints(diffed, interpolated, t);
                                    }
                            )
                        });
                        push(intermediate, utils.range(targetEnding.length - 1).map(() => null));
                    }
                }
            });

            if (changingPoints.length === 0) {

                if (pointsTo.length > 0 && remainingIds.length === 0) {

                    //
                    // Path is created from zero

                    intermediate.push(pointsTo[0]);
                    push(intermediate, utils.range(pointsTo.length - 1).map(() => null));
                    let polyline = pointsTo.slice(0);
                    changingPoints.push({
                        startIndex: 1,
                        getPoints: function (t) {
                            return interpolateEnding({t, polyline, decreasing: false});
                        }
                    });

                } else if (pointsFrom.length > 0 && remainingIds.length === 0) {

                    //
                    // Path is removed

                    intermediate.push(pointsFrom[0]);
                    push(intermediate, utils.range(pointsFrom.length - 1).map(() => null));
                    let polyline = pointsFrom.slice(0);
                    changingPoints.push({
                        startIndex: 1,
                        getPoints: function (t) {
                            return interpolateEnding({t, polyline, decreasing: true});
                        }
                    });

                }
            }
        };

        var updateIntermediatePoints = function (t) {
            remainingPoints.forEach((d) => {
                var pt = d.getPoint(t);
                intermediate[d.index] = pt;
            });
            changingPoints.forEach((d) => {
                var points = d.getPoints(t);
                points.forEach((pt, i) => intermediate[d.startIndex + i] = pt);
            });
        };

        return function (t) {
            if (t === 0) {
                return pointsFrom;
            }
            if (t === 1) {
                return pointsTo;
            }

            if (!intermediate) {
                createIntermediatePoints();
            }

            updateIntermediatePoints(t);

            return intermediate;

        };
    }
}