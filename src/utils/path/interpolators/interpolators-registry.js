import {getCurve, getCurveKeepingExtremums} from './smooth';
import {getStepLine, getStepBeforeLine, getStepAfterLine} from './step';

var polylineInterpolators = {
    linear: d => d,
    step: getStepLine,
    'step-before': getStepBeforeLine,
    'step-after': getStepAfterLine
};
var curveInterpolators = {
    smooth: getCurve,
    'smooth-keep-extremum': getCurveKeepingExtremums
};

export function getLineInterpolator(type) {
    return (polylineInterpolators[type] || curveInterpolators[type]);
}

export function getInterpolatorSplineType(type) {
    if (curveInterpolators[type] !== undefined) {
        return 'cubic';
    }
    return 'polyline';
}