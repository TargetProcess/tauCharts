import {getCurve, getCurveKeepingExtremums} from './smooth';
import {getStepLine, getStepBeforeLine, getStepAfterLine} from './step';
import {Point} from '../point';

type InterpolatorsMap = {[name: string]: ((p: Point[]) => Point[])};

var polylineInterpolators: InterpolatorsMap = {
    linear: d => d,
    step: getStepLine,
    'step-before': getStepBeforeLine,
    'step-after': getStepAfterLine
};
var curveInterpolators: InterpolatorsMap = {
    smooth: getCurve,
    'smooth-keep-extremum': getCurveKeepingExtremums
};

export function getLineInterpolator(type: string) {
    return (polylineInterpolators[type] || curveInterpolators[type]);
}

export function getInterpolatorSplineType(type: string) {
    if (curveInterpolators[type] !== undefined) {
        return 'cubic';
    }
    return 'polyline';
}
