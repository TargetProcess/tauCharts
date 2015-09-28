var generateThemes = function () {
    var themes = ['default', 'dark'];
    var plugins = ['tooltip', 'export', 'legend', 'trendline'];

    var generateCompatibleSuffixes = function (key) {
        return {
            key: (key || 'default'),
            src: (key ? ('.' + key) : ('.default')),
            dst: (key ? ('.' + key) : (''))
        };
    };

    return {

        less: themes.reduce(function (memo, key) {
            var suffix = generateCompatibleSuffixes(key);
            var files = plugins.reduce(function (files, plugin) {
                var t = 'css/' + plugin + suffix.src + '.css';
                files[t] = 'less/plugins/' + plugin + '.less';
                return files;
            }, {});
            var tauCss = 'css/tauCharts' + suffix.src + '.css';
            files[tauCss] = 'less/tauCharts.less';
            files['css/base.css'] = 'less/base.less';
            files['css/layout.css'] = 'less/layout.less';
            files['css/colorbrewer.css'] = 'less/colorbrewer.less';
            memo[key] = {
                options: {
                    paths: ['less'],
                    modifyVars: {
                        theme: suffix.key
                    }
                },
                files: files
            };
            return memo;
        }, {}),

        css: [null].concat(themes).map(function (key) {
            var suffix = generateCompatibleSuffixes(key);
            return [
                {
                    src: 'css/tauCharts' + suffix.src + '.css',
                    dest: 'build/development/css/tauCharts' + suffix.dst + '.css'
                },
                {
                    src: 'css/colorbrewer.css',
                    dest: 'build/development/css/tauCharts.colorbrewer' + suffix.dst + '.css'
                }
            ].concat(plugins.map(function (pluginName) {
                    return {
                        src: 'css/' + pluginName + suffix.src + '.css',
                        dest: 'build/development/plugins/tauCharts.' + pluginName + suffix.dst + '.css'
                    };
                }));
        }),

        prodCss: [null].concat(themes).reduce(
            function (memo, key) {
                var suffix = generateCompatibleSuffixes(key);
                memo['build/production/tauCharts' + suffix.dst + '.min.css'] = ['build/development/**/*' + suffix.src + '.css'];
                return memo;
            },
            {}),

        cssMin: [null].concat(themes).reduce(
            function (memo, key) {
                var suffix = generateCompatibleSuffixes(key);
                memo.push({
                    src: 'build/production/tauCharts' + suffix.dst + '.min.css',
                    dest: 'build/production/tauCharts' + suffix.dst + '.min.css'
                });
                return memo;
            },
            [
                {
                    src: 'css/base.css',
                    dest: 'build/production/tauCharts.normalize.min.css'
                }
            ])
    };
};
module.exports = generateThemes();