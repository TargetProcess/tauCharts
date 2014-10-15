/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['build/tauCharts.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        compile: {
            build: {
                cwd: "src/",

                src: [
                    "*.js",
                    "**/*.js",
                    "!charts/bar.js",
                    '!tau.plugins.js',
                    '!tau.svg.js',
                    '!charts/line.js',
                    '!charts/scatterplot.js',
                    '!addons/*.js',
                    '!tau.charts.js',
                    '!class.js',
                    '!tau.data.js',
                    '!tau.data.types.js'
                ],
                dest: "build/<%= pkg.name %>.js"
            }
        },
        karma: {
            options:{
                configFile: 'config/karma.conf.js'
            },
            dev: {
                reporters: ["progress"],
                browsers:["Chrome"],
                singleRun: false
            },
            unit: {
                reporters: ["dots", "coverage"],
                preprocessors: { "build/tauCharts.js": "coverage" }
            },
            travis: {
                preprocessors: { "build/tauCharts.js": "coverage" },
                reporters: ["coverage", "dots", "coveralls"],
                coverageReporter: {
                    type: "lcovonly",
                    dir: "coverage/"
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        shell: {
            gitadd: {
                command: [
                    'git add build/<%= pkg.name %>.js',
                    'git add build/<%= pkg.name %>.min.js'
                ].join('&&'),
                options: {
                    stdout: true
                }
            }
        },
        jshint: {
            all: {
                src: [
                    "src/**/*.js", "Gruntfile.js"
                ],
                options: {
                    "loopfunc": true,
                    "esnext": true
                }
            }
        },
        bowercopy: {
            options: {
                clean: true
            },
            libs: {
                options: {
                    destPrefix: "libs"
                },
                files: {
                    "d3.js": "d3/d3.js",
                    "underscore.js": "underscore/underscore.js",
                    "jquery.js":"jquery/dist/jquery.js",
                    "traceur.js":"traceur/traceur.js",
                    "es6-module-loader.js":"es6-module-loader/dist/es6-module-loader.src.js",
                    "js-schema.js":"js-schema/js-schema.debug.js",
                    "es5-shim.js":"es5-shim/es5-shim.js"
                }
            }
        },
        watch: {
            files: '<%= jshint.all.src %>',
            tasks: ['jshint','compile']
        }
    });
    // load local tasks
    grunt.loadTasks("tasks");

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-shell');

    // Default task.
    //grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
    grunt.registerTask('default', ['bowercopy', 'jshint','compile', 'concat', 'uglify']);
    grunt.registerTask('build', ['compile','concat','uglify', 'shell:gitadd']);
    grunt.registerTask('travis', ['bowercopy', 'jshint','compile', 'concat', 'uglify','karma:travis']);
    grunt.registerTask('watching', ['bowercopy','compile','concat','jshint','watch']);
};
