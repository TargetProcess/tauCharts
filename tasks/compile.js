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

        var container = new Container({
            resolvers: [new FileResolver([this.data.cwd || "./"])],
            formatter: new BundleFormatter()
        });

        this.filesSrc.forEach(function (filename) {
            container.getModule(filename);
        });

        var ast = container.convert();
        var code = recast.print(ast[0]).code;

        if (options.jsdocs === false) {
            // remove jsdoc comments from the output
            code = code.replace(/\/\*\*([\s\S]*?)\*\/\s+/gm, "");
        }

        if (options.banner) {
            code = options.banner + "\n" + code;
        }

        code = grunt.template.process(code);
        // fix for browserify
       // code = code.replace("}).call(this)", "})()");

        grunt.file.mkdir(path.dirname(outputFile));

        var result = es6tr.run({
            src: code,
            globals: {define: true, module: true, d3: true, _: true, Class: true, tau: true},
            outputFilename: outputFile,
            environments: ["browser"]
        });

        if (result.errors.length > 0) {
            grunt.fail.fatal("\n" + result.errors.join("\n"));

            grunt.file.write(outputFile, code);
        }
    });
};
