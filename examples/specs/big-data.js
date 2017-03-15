(function () {

    /**
     * Returns random number or one of arguments.
     * @param n Max number or list of arguments.
     */
    function random(n) {
        if (arguments.length === 1 && typeof n === 'number') {
            return Math.min(
                Math.floor(Math.random() * n),
                n - 1
            );
        }
        var items = (arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);
        var index = Math.min(
            Math.floor(Math.random() * items.length),
            items.length - 1
        );
        return items[index];
    }

    /**
     * Returns random word.
     * @param n Word length.
     */
    var randomWord = (function () {

        var sample = [
            'TauCharts is a javascript graph library.',
            'It is based on D3 framework.',
            'So, why do you need it?',
            'There are number of similar libraries, but TauCharts has some unique features.',
            'Many charting libraries look really ugly.',
            'They were created by programmers, and not all programmers have deep knowledge of design and information visualization.',
            'TauCharts is designed with passion by professional designers and information visualization experts.',
            'We put significant effort into the design of our charts and think a lot about clarity, ink-to-data ratio, integrity, and usability.',
            'TauCharts has a nice framework and great extensibility options.',
            'Its plugins infrastructure is flexible and allows you to easily write your own plugins.',
            'Most charting libraries only provide a set of charts you can create.',
            'That is okay, but in many cases you need more sophisticated visualizations.',
            'TauCharts is based on Grammar of Graphics and can draw some really complex and interactive visualizations.'
        ].join(' ');

        var lettersUsage = {};
        var beginnings = [];
        for (var i = 0, c, s; i < sample.length; i++) {
            if (!sample.charAt(i).match(/[a-z]/i)) {
                continue;
            }

            c = sample.charAt(i).toLowerCase();
            if ((i === 0) || (!sample.charAt(i - 1).match(/[a-z]/i) && beginnings.indexOf(c) < 0)) {
                beginnings.push(c);
            }

            if ((i === sample.length - 2) || !sample.substr(i + 1, 2).match(/[a-z]{2}/i)) {
                continue;
            }
            lettersUsage[c] = lettersUsage[c] || [];
            s = sample.substr(i + 1, 2).toLowerCase();
            if (lettersUsage[c].indexOf(s) < 0) {
                lettersUsage[c].push(s);
            }

            if ((i === sample.length - 3) || !sample.substr(i + 1, 3).match(/[a-z]{3}/i)) {
                continue;
            }
            lettersUsage[c] = lettersUsage[c] || [];
            s = sample.substr(i + 1, 3).toLowerCase();
            if (lettersUsage[c].indexOf(s) < 0) {
                lettersUsage[c].push(s);
            }
        }

        return function randomWord(n) {

            if (n === 0) {
                return '';
            }

            var word = random(beginnings).toUpperCase();
            for (var j = 1, s, c = word.charAt(0).toLowerCase(), next; j < n; j += s.length) {
                next = lettersUsage[c];
                s = random(next);
                if (!s) {
                    break;
                }
                word += s;
                c = s.charAt(s.length - 1);
            }

            return word.substring(0, n);
        };
    })();

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
            var length = random(utils.range(minLabel, maxLabel));
            var word = randomWord(length);
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
            obj[field] = random(categories[field]);
        });
        valueFields.forEach(function (field) {
            obj[field] = MIN_VALUE + random(MAX_VALUE - MIN_VALUE);
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