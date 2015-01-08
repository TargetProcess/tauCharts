/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    var src = [
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
    ];
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
                src: ['build/development/tauCharts.js'],
                dest: 'build/development/tauCharts.js'
            },
            prodJS: {
                src: ['build/development/tauCharts.js', 'build/development/plugins/*.js'],
                dest: 'build/production/tauCharts.min.js'
            },
            prodCSS: {
                src: ['build/development/**/*.css'],
                dest: 'build/production/tauCharts.min.css'
            }
        },
        'gh-pages': {
            options: {
                base: 'build',
                branch: 'release'
            },
            src: ['**/*']
        },
        compile: {
            build: {
                cwd: "src/",
                src: src,
                dest: "build/development/tauCharts.js"
            },
            dev: {
                cwd: "src/",
                src: src
            }
        },
        karma: {
            options: {
                configFile: 'config/karma.conf.js'
            },
            dev: {
                reporters: ["dots"],
                browsers: ["Chrome"],
                singleRun: false
            },
            unit: {
                reporters: ["dots", "coverage"],
                preprocessors: {"tau_modules/**/*.js": "coverage", "plugins/*.js": "coverage"}
            },
            travis: {
                preprocessors: {"tau_modules/**/*.js": "coverage"},
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
                src: '<%= concat.prodJS.dest %>',
                dest: 'build/production/tauCharts.min.js'
            }
        },
        cssmin: {
            build: {
                files: [
                    {
                        src: 'build/production/tauCharts.min.css',
                        dest: 'build/production/tauCharts.min.css'
                    }
                ]
            }
        },
        copy: {
            copybuild: {
              files:[
                  {
                      src: 'build/production/**',
                      expand:true,
                      dest: 'build/'
                  },
                  {
                      src: 'build/development/**',
                      expand:true,
                      dest: 'build/'
                  }
              ]
            },
            build: {
                files: [
                    {
                        src: 'bower.json',
                        dest: 'build/bower.json'
                    },
                    {
                        src: 'package.json',
                        dest: 'build/package.json'
                    },
                    {
                        src: 'component.json',
                        dest: 'build/component.json'
                    },
                    {
                        src: 'license.md',
                        dest: 'build/license.md'
                    },
                    {
                        src: 'README.md',
                        dest: 'build/README.md'
                    },
                    {
                        src: 'css/graphic-elements.css',
                        dest: 'build/development/css/tauCharts.graphic-elements.css'
                    },
                    {
                        src: 'css/colorbrewer.css',
                        dest: 'build/development/css/tauCharts.colorbrewer.css'
                    },
                    {
                        src: 'css/forms.css',
                        dest: 'build/development/css/tauCharts.forms.css'
                    },
                    {
                        src: 'src/addons/color-brewer.js',
                        dest: 'build/development/tauCharts.color-brewer.js'
                    },
                    {
                        src: 'plugins/tooltip.js',
                        dest: 'build/development/plugins/tauCharts.tooltip.js'
                    },
                    {
                        src: 'plugins/legend.js',
                        dest: 'build/development/plugins/tauCharts.legend.js'
                    },
                    {
                        src: 'plugins/trendline.js',
                        dest: 'build/development/plugins/tauCharts.trendline.js'
                    },
                    {
                        src: 'css/tooltip.css',
                        dest: 'build/development/plugins/tauCharts.tooltip.css'
                    },
                    {
                        src: 'css/legend.css',
                        dest: 'build/development/plugins/tauCharts.legend.css'
                    },
                    {
                        src: 'css/trendline.css',
                        dest: 'build/development/plugins/tauCharts.trendline.css'
                    }
                ]
            }
        },
        shell: {
            gitadd: {
                command: [
                    'git add build/tauCharts.js',
                    'git add build/tauCharts.min.js'
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
        less: {
            development: {
                options: {
                    paths: ["less"]
                },
                files: {
                    "css/tooltip.css": "less/tooltip.less",
                    "css/base.css": "less/base.less",
                    "css/graphic-elements.css": "less/graphic-elements.less",
                    "css/layout.css": "less/layout.less",
                    "css/legend.css": "less/legend.less",
                    "css/forms.css": "less/forms.less",
                    "css/trendline.css": "less/trendline.less"
                }
            }
        },
        clean: ['build/production/', 'build/development/'],
        bowercopy: {
            options: {
                // clean: true
            },
            libs: {
                options: {
                    destPrefix: "libs"
                },
                files: {
                    "d3.js": "d3/d3.js",
                    "underscore.js": "underscore/underscore.js",
                    "jquery.js": "jquery/dist/jquery.js",
                    "modernizer.js": "modernizer/modernizr.js",
                    "js-schema.js": "js-schema/js-schema.debug.js",
                    "es5-shim.js": "es5-shim/es5-shim.js"
                }
            }
        },
        watch: {
            js: {
                files: ['<%= jshint.all.src %>'],
                tasks: ['jshint', 'compile:dev', 'less']
            },
            less: {
                files: ['less/*.less'],
                tasks: ['less']
            }
        }
    });
    // load local tasks
    grunt.loadTasks("tasks");

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Default task.
    //grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
    grunt.registerTask('default', ['bowercopy', 'less', 'compile:dev', 'jshint', 'watch:js']);
    grunt.registerTask('build', ['bowercopy', 'less', 'copy:build', 'compile:build', 'concat:dist', 'concat:prodJS', 'concat:prodCSS', 'uglify', 'cssmin','copy:copybuild', 'clean', 'gh-pages']);
    grunt.registerTask('travis', ['bowercopy', 'jshint', 'compile:build', 'karma:travis']);
    grunt.registerTask('watching', ['default']);
};
