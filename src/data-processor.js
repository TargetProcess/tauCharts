import {utils} from './utils/utils';

var DataProcessor = {

    isYFunctionOfX: (data, xFields, yFields) => {
        var isRelationAFunction = true;
        var error = null;
        // domain should has only 1 value from range
        try {
            data.reduce(
                (memo, item) => {

                    var fnVar = (hash, f) => {
                        var propValue = item[f];
                        var hashValue = utils.isObject(propValue) ? JSON.stringify(propValue) : propValue;
                        hash.push(hashValue);
                        return hash;
                    };

                    var key = xFields.reduce(fnVar, []).join('/');
                    var val = yFields.reduce(fnVar, []).join('/');

                    if (!memo.hasOwnProperty(key)) {
                        memo[key] = val;
                    } else {
                        var prevVal = memo[key];
                        if (prevVal !== val) {
                            error = {
                                type: 'RelationIsNotAFunction',
                                keyX: xFields.join('/'),
                                keyY: yFields.join('/'),
                                valX: key,
                                errY: [prevVal, val]
                            };

                            throw new Error('RelationIsNotAFunction');
                        }
                    }
                    return memo;
                },
                {});
        } catch (ex) {

            if (ex.message !== 'RelationIsNotAFunction') {
                throw ex;
            }

            isRelationAFunction = false;
        }

        return {
            result: isRelationAFunction,
            error: error
        };
    },

    excludeNullValues: (dimensions, onExclude) => {
        var fields = Object.keys(dimensions).reduce((fields, k) => {
            var d = dimensions[k];
            if ((!d.hasOwnProperty('hasNull') || d.hasNull) && ((d.type === 'measure') || (d.scale === 'period'))) {
                // rule: exclude null values of "measure" type or "period" scale
                fields.push(k);
            }
            return fields;
        }, []);
        return (row) => {
            var result = !fields.some((f) => (!(f in row) || (row[f] === null)));
            if (!result) {
                onExclude(row);
            }
            return result;
        };
    },

    autoAssignScales: function (dimensions) {

        var defaultType = 'category';
        var scaleMap = {
            category: 'ordinal',
            order: 'ordinal',
            measure: 'linear'
        };

        var r = {};
        Object.keys(dimensions).forEach((k) => {
            var item = dimensions[k];
            var type = (item.type || defaultType).toLowerCase();
            r[k] = Object.assign(
                {},
                item,
                {
                    type: type,
                    scale: item.scale || scaleMap[type],
                    value: item.value
                });
        });

        return r;
    },

    autoDetectDimTypes: function (data) {

        var defaultDetect = {
            type: 'category',
            scale: 'ordinal'
        };

        var detectType = (propertyValue, defaultDetect) => {

            var pair = defaultDetect;

            if (utils.isDate(propertyValue)) {
                pair.type = 'measure';
                pair.scale = 'time';
            } else if (utils.isObject(propertyValue)) {
                pair.type = 'order';
                pair.scale = 'ordinal';
            } else if (Number.isFinite(propertyValue)) {
                pair.type = 'measure';
                pair.scale = 'linear';
            }

            return pair;
        };

        var reducer = (memo, rowItem) => {

            Object.keys(rowItem).forEach((key) => {

                var val = rowItem.hasOwnProperty(key) ? rowItem[key] : null;

                memo[key] = memo[key] || {
                    type: null,
                    hasNull: false
                };

                if (val === null) {
                    memo[key].hasNull = true;
                } else {
                    var typeScalePair = detectType(val, utils.clone(defaultDetect));
                    var detectedType = typeScalePair.type;
                    var detectedScale = typeScalePair.scale;

                    var isInContraToPrev = (memo[key].type !== null && memo[key].type !== detectedType);
                    memo[key].type = isInContraToPrev ? defaultDetect.type : detectedType;
                    memo[key].scale = isInContraToPrev ? defaultDetect.scale : detectedScale;
                }
            });

            return memo;
        };

        return data.reduce(reducer, {});
    },

    sortByDim: function (data, dimName, dimInfo) {
        var rows = data;

        var interceptor = (['period', 'time'].indexOf(dimInfo.scale) >= 0) ?
            (x => new Date(x)) :
            (x => x);

        if ((dimInfo.type === 'measure') || (dimInfo.scale === 'period')) {
            rows = data.map(r => r).sort((a, b) => {
                return interceptor(a[dimName]) - interceptor(b[dimName]);
            });
        } else if (dimInfo.order) {
            var hashOrder = dimInfo.order.reduce(
                (memo, x, i) => {
                    memo[x] = i;
                    return memo;
                },
                {});
            var defaultN = dimInfo.order.length;
            var k = `(___${dimName}___)`;
            rows = data
                .map((row) => {
                    var orderN = hashOrder[row[dimName]];
                    orderN = (orderN >= 0) ? orderN : defaultN;
                    row[k] = orderN;
                    return row;
                })
                .sort((a, b) => (a[k] - b[k]))
                .map((row) => {
                    delete row[k];
                    return row;
                });
        }
        return rows;
    }
};

export {DataProcessor};