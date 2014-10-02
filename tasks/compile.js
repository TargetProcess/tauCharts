var path = require("path");
var es6tr = require("es6-transpiler");

var es6modules = require("es6-module-transpiler");
var recast = require("es6-module-transpiler/node_modules/recast");
var Container = es6modules.Container;
var FileResolver = es6modules.FileResolver;
var BundleFormatter = require('./formatter');


module.exports = function (grunt) {
    grunt.task.registerMultiTask("compile", function () {
        var options = this.options();
        var outputFile = this.data.dest;
        var tmpDir = 'tmp_dir';
        grunt.file.mkdir(tmpDir);
        this.filesSrc.forEach(function (filename) {
            var result = es6tr.run({
                filename: this.data.cwd + filename,
                outputFilename: tmpDir + '/' + filename,
                globals: {d3: true, _: true}
            });
            if (result.errors.length > 0) {
                grunt.fail.fatal(this.data.cwd + filename + "\n" + result.errors.join("\n"));
            }
        }, this);
        var container = new Container({
            resolvers: [new FileResolver([tmpDir + '/' || "./"])],
            formatter: new BundleFormatter()
        });

        this.filesSrc.forEach(function (filename) {
            container.getModule(filename);
        });


        var ast = container.convert();
        grunt.file.mkdir(path.dirname(outputFile));
        grunt.file.write(outputFile, recast.print(ast[0]).code);
        grunt.file.delete(tmpDir);
    });
};
