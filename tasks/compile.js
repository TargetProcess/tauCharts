var requirejs = require('requirejs');
var to5 = require("babel-core");
var LOG_LEVEL_TRACE = 0, LOG_LEVEL_WARN = 2;
requirejs.define('node/print', [], function () {
    return function print(msg) {
        if (msg.substring(0, 5) === 'Error') {
            grunt.log.errorlns(msg);
            grunt.fail.warn('RequireJS failed.');
        } else {
            grunt.log.oklns(msg);
        }
    };
});
module.exports = function (grunt) {
    grunt.task.registerMultiTask("compile", function () {
        var done = this.async();
        var options = this.options();
        var outputFile = this.data.dest;
        var tmpDir = 'tau_modules';
        grunt.file.mkdir(tmpDir);
        grunt.file.mkdir(tmpDir + '/' + 'charts');
        grunt.file.mkdir(tmpDir + '/' + 'utils');
        grunt.file.mkdir(tmpDir + '/' + 'elements');
        var opts = {modules: "amd"};
        if (!outputFile) {
            opts.sourceMap = "inline";
        }
        this.filesSrc.forEach(function (filename) {

            var res = to5.transformFileSync(this.data.cwd + filename, opts);

            grunt.file.write(tmpDir + '/' + filename, res.code);

            if (res.map) {
                grunt.file.write(tmpDir + '/' + filename + '.map', JSON.stringify(res.map));
            }

        }, this);
        if (outputFile) {
            // The following catches errors in the user-defined `done` function and outputs them.
            var tryCatch = function (fn, done, output) {
                try {
                    fn(done, output);
                } catch (e) {
                    grunt.fail.warn('There was an error while processing your done function: "' + e + '"');
                }
            };

            var configExport = {
                include: ['../node_modules/almond/almond'],
                baseUrl: 'plugins' + '/',
                name: 'export',
                exclude: ['tauCharts', 'd3', 'underscore'],
                paths: {
                    topojson: '../node_modules/topojson/topojson',
                    underscore: '../node_modules/underscore/underscore',
                    d3: '../node_modules/d3/d3',
                    'canvgModule': '../bower_components/canvg/canvg',
                    'tau-tooltip': '../node_modules/tau-tooltip/tooltip'
                },
                map: {
                    '*': {
                        'tauCharts': '../tau_modules/tau.charts',
                        'canvg': '../bower_components/canvg/canvg',
                        'FileSaver': '../bower_components/FileSaver.js/FileSaver',
                        'rgbcolor': '../bower_components/canvg/rgbcolor',
                        'stackblur': '../bower_components/canvg/StackBlur',
                        'fetch': '../bower_components/fetch/fetch',
                        'promise': '../bower_components/es6-promise/promise',
                        'print.style.css': '../node_modules/requirejs-text/text!print.style.css'
                    }
                },
                optimize: 'none',
                done: function (done, response) {
                    var bowerConfig = grunt.file.readJSON('bower.json');
                    var componentConfig = grunt.file.readJSON('component.json');
                    var currentVersion = grunt.config.get('pkg').version;
                    bowerConfig.version = currentVersion;
                    componentConfig.version = currentVersion;
                    grunt.file.write('bower.json', JSON.stringify(bowerConfig, null, 2));
                    grunt.file.write('component.json', JSON.stringify(componentConfig, null, 2));
                    done();
                },

                out: 'build/development/plugins/tauCharts.export.js',
                wrap: {
                    startFile: 'tasks/exportstart.frag',
                    endFile: 'tasks/exportend.frag'
                }
            };
            try {
                //requirejs.optimize(config, tryCatch.bind(null, config.done, done));
                requirejs.optimize(configExport, tryCatch.bind(null, configExport.done, done));
            } catch (e) {
                grunt.fail.fatal(e);
            }
        } else {
            done();
        }

    });
};
