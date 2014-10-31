var requirejs = require('requirejs');
var to5 = require('6to5');
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
        this.filesSrc.forEach(function (filename) {

            var res = to5.transformFileSync(this.data.cwd + filename, {sourceMap: true, modules: "amd"});

            grunt.file.write(tmpDir + '/' + filename, res.code);

            if (res.map) {
                grunt.file.write(tmpDir + '/' + filename + '.map', JSON.stringify(res.map));
            }

        }, this);
        // The following catches errors in the user-defined `done` function and outputs them.
        var tryCatch = function (fn, done, output) {
            try {
                fn(done, output);
            } catch (e) {
                grunt.fail.warn('There was an error while processing your done function: "' + e + '"');
            }
        };

        var config = {
            include: ['../node_modules/almond/almond'],
            baseUrl: tmpDir + '/',
            name: 'tau.newCharts',
            exclude:['d3','underscore'],
            paths:{
                'underscore':'../libs/underscore',
                'd3':'../libs/d3'
            },
            optimize: 'none',
            done: function (done, response) {
                done();
            },

            out: 'build/tauCharts.js',
            wrap: {
                startFile: 'tasks/start.frag',
                endFile: 'tasks/end.frag'
            }
        };
        try {
            requirejs.optimize(config, tryCatch.bind(null, config.done, done));
        } catch (e) {
            grunt.fail.fatal(e)
        }


        // grunt.file.delete(tmpDir);
    });
};
