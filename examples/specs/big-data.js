(function () {

    // Create categories
    var X_VALUES = [];
    var Y_VALUES = ['effort'];
    var COLOR_CATEGORIES = ['country'];
    var X_CATEGORIES = ['city', 'lawyer'];
    var Y_CATEGORIES = ['family'];
    var valueFields = X_VALUES.concat(Y_VALUES);
    var categoryFields = X_CATEGORIES.concat(Y_CATEGORIES).concat(COLOR_CATEGORIES);
    var ITEMS_PER_CATEGORY = 16;
    var MIN_CATEGORY_LENGTH = 4;
    var MAX_CATEGORY_LENGTH = 8;
    var randomCategories = function (count, minLabel, maxLabel) {
        return utils.range(count).map(function () {
            var length = dev.random(utils.range(minLabel, maxLabel));
            var word = dev.randomWord(length);
            return word;
        });
    };
    var categories = categoryFields
        .reduce(function (obj, field) {
            obj[field] = randomCategories(ITEMS_PER_CATEGORY, MIN_CATEGORY_LENGTH, MAX_CATEGORY_LENGTH);
            return obj;
        }, {});

    // Create data
    var DATA_COUNT = 2048;
    var MIN_VALUE = 0;
    var MAX_VALUE = 100;
    var data = utils.unique(utils.range(DATA_COUNT).map(function () {
        var obj = {};
        categoryFields.forEach(function (field) {
            obj[field] = dev.random(categories[field]);
        });
        valueFields.forEach(function (field) {
            obj[field] = MIN_VALUE + dev.random(MAX_VALUE - MIN_VALUE);
        });
        return obj;
    }), function (d) {
        return categoryFields.reduce(function (values, field) {
            values.push(d[field]);
            return values;
        }, []).join(', ');
    }).sort(utils.createMultiSorter.apply(null, categoryFields.map(function (field) {
        return function (a, b) {
            return a[field].localeCompare(b[field]);
        };
    })));

    // Create chart spec
    dev.spec((function () {
        return {
            type: 'stacked-bar',
            x: X_CATEGORIES.concat(X_VALUES),
            y: Y_CATEGORIES.concat(Y_VALUES),
            color: COLOR_CATEGORIES,
            settings: {
                fitModel: 'entire-view'
            },
            data: data
        };
    })());
})();