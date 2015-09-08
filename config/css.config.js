var generateThemes = function () {
    var themes = ['default', 'dark'];
    var generatePath = function (key) {
        return (key === 'default') ? '' : ('.' + key);
    };
    var minCss = [
        {
            src: 'css/base.css',
            dest: 'build/production/tauCharts.normalize.min.css'
        }
    ];

    return {
        less: themes.reduce(function (memo, key) {
            var plugins = ['tooltip', 'export', 'legend', 'trendline'];
            var prefix = generatePath(key);
            var files = plugins.reduce(function (files, plugin) {
                var t = 'css/' + plugin + prefix + '.css';
                files[t] = 'less/plugins/' + plugin + '.less';
                return files;
            }, {});
            var tauCss = 'css/tauCharts' + prefix + '.css';
            files[tauCss] = 'less/tauCharts.less';
            files['css/base.css'] = 'less/base.less';
            files['css/layout.css'] = 'less/layout.less';
            files['css/colorbrewer.css'] = 'less/colorbrewer.less';
            memo[key] = {
                options: {
                    paths: ['less'],
                    modifyVars: {
                        theme: key
                    }
                },
                files: files
            };
            return memo;
        }, {}),
        css: themes.map(function (key) {
            var prefix = generatePath(key);
            return [
                {
                    src: 'css/tauCharts' + prefix + '.css',
                    dest: 'build/development/css/tauCharts' + prefix + '.css'
                },
                {
                    src: 'css/colorbrewer.css',
                    dest: 'build/development/css/tauCharts.colorbrewer' + prefix + '.css'
                },
                {
                    src: 'css/tooltip' + prefix + '.css',
                    dest: 'build/development/plugins/tauCharts.tooltip' + prefix + '.css'
                },
                {
                    src: 'css/legend.css',
                    dest: 'build/development/plugins/tauCharts.legend' + prefix + '.css'
                },
                {
                    src: 'css/trendline.css',
                    dest: 'build/development/plugins/tauCharts.trendline' + prefix + '.css'
                },
                {
                    src: 'css/export.css',
                    dest: 'build/development/plugins/tauCharts.export' + prefix + '.css'
                }];
        }),
        prodCss: themes.reduce(function (memo, key) {
            var prefix = generatePath(key);
            memo['build/production/tauCharts' + prefix + '.min.css'] = ['build/development/**/*' + prefix + '.css'];
            return memo;
        }, {}),
        cssMin: themes.reduce(function (memo, key) {
            var prefix = generatePath(key);
            memo.push({
                src: 'build/production/tauCharts' + prefix + '.min.css',
                dest: 'build/production/tauCharts' + prefix + '.min.css'
            });
            return memo;
        }, minCss)
    };
};
module.exports = generateThemes();