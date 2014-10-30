var requirejs = require('requirejs');
var to5 = require('6to5');


module.exports = function (grunt) {
    grunt.task.registerMultiTask("compile", function () {
        var options = this.options();
        var outputFile = this.data.dest;
        var tmpDir = 'tmp_dir';
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


        var config = {
            include:['../node_modules/almond/almond'],
            baseUrl: 'tmp_dir/',
            name: 'tau.newCharts',
            optimize: false,
            out: 'build/tauCharts.js',
            wrap: {
                startFile: 'tasks/start.frag',
                endFile: 'tasks/end.frag'
            }
        };

        requirejs.optimize(config, function (buildResponse) {

        }, function(err) {
            grunt.fail.fatal(err)
            //optimization err callback
        });

       // grunt.file.delete(tmpDir);
    });
};
