/*global module:false*/
module.exports = function(grunt) {

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
                src: ['build/tauCharts.js'],
                dest: 'build/tauCharts.js'
            }
        },
        compile: {
            build: {
                cwd: "src/",
                src: src,
                dest: "build/tauCharts.js"
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
                preprocessors: {"tau_modules/**/*.js": "coverage","plugins/*.js": "coverage"}
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
                src: '<%= concat.dist.dest %>',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            plugins: {
                files: [
                    {
                        src:  'src/addons/color-brewer.js',
                        dest: 'build/<%= pkg.name %>.color-brewer.min.js'
                    },
                    {
                        src:  'plugins/tooltip.js',
                        dest: 'build/plugins/<%= pkg.name %>.tooltip.min.js'
                    },
                    {
                        src:  'plugins/legend.js',
                        dest: 'build/plugins/<%= pkg.name %>.legend.min.js'
                    },
                    {
                        src:  'plugins/trendline.js',
                        dest: 'build/plugins/<%= pkg.name %>.trendline.min.js'
                    }
                ]

            }
        },
        cssmin: {
            build: {
                files: [
                    {
                        src: 'css/graphic-elements.css',
                        dest: 'build/css/<%= pkg.name %>.graphic-elements.min.css'
                    },
                    {
                        src: 'css/colorbrewer.css',
                        dest: 'build/css/<%= pkg.name %>.colorbrewer.min.css'
                    },
                    {
                        src: 'css/forms.css',
                        dest: 'build/plugins/<%= pkg.name %>.forms.min.css'
                    },
                    {
                        src: 'css/tooltip.css',
                        dest: 'build/plugins/<%= pkg.name %>.tooltip.min.css'
                    },
                    {
                        src: 'css/legend.css',
                        dest: 'build/plugins/<%= pkg.name %>.legend.min.css'
                    },
                    {
                        src: 'css/trendline.css',
                        dest: 'build/plugins/<%= pkg.name %>.trendline.min.css'
                    }
                ]
            }
        },
        copy: {
            build: {
                files: [
                    {
                        src: 'css/graphic-elements.css',
                        dest: 'build/css/<%= pkg.name %>.graphic-elements.css'
                    },
                    {
                        src: 'css/colorbrewer.css',
                        dest: 'build/css/<%= pkg.name %>.colorbrewer.css'
                    },
                    {
                        src: 'css/forms.css',
                        dest: 'build/css/<%= pkg.name %>.forms.css'
                    },
                    {
                        src: 'src/addons/color-brewer.js',
                        dest: 'build/<%= pkg.name %>.color-brewer.js'
                    },
                    {
                        src: 'plugins/tooltip.js',
                        dest: 'build/plugins/<%= pkg.name %>.tooltip.js'
                    },
                    {
                        src: 'plugins/legend.js',
                        dest: 'build/plugins/<%= pkg.name %>.legend.js'
                    },
                    {
                        src: 'plugins/trendline.js',
                        dest: 'build/plugins/<%= pkg.name %>.trendline.js'
                    },
                    {
                        src: 'css/tooltip.css',
                        dest: 'build/plugins/<%= pkg.name %>.tooltip.css'
                    },
                    {
                        src: 'css/legend.css',
                        dest: 'build/plugins/<%= pkg.name %>.legend.css'
                    },
                    {
                        src: 'css/trendline.css',
                        dest: 'build/plugins/<%= pkg.name %>.trendline.css'
                    }
                ]
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
            js:{
                files: ['<%= jshint.all.src %>'],
                tasks: ['jshint', 'compile:dev','less']
            },
            less:{
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

    // Default task.
    //grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
    grunt.registerTask('default', ['bowercopy', 'less', 'compile:dev', 'jshint', 'watch:js']);
    grunt.registerTask('build', ['bowercopy', 'less', 'copy', 'cssmin', 'compile:build', 'concat', 'uglify', 'shell:gitadd']);
    grunt.registerTask('travis', ['bowercopy', 'jshint', 'compile:build', 'karma:travis']);
    grunt.registerTask('watching', ['default']);
};
