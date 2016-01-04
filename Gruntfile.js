/*global module:false*/
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var webpackConfig = require('./config/webpack.config');
var cssConfig = require('./config/css.config');

module.exports = function (grunt) {
    // Project configuration.
    var src = [
        '*.js',
        '**/*.js',
        '!addons/*.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: [
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ',
            '<%= grunt.template.today("yyyy-mm-dd") %>\n',
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>',
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;',
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
        ].join(''),
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
                src: [
                    'build/development/tauCharts.js',
                    'build/development/tauCharts.color-brewer.js',
                    'build/development/plugins/*.js'
                ],
                dest: 'build/production/tauCharts.min.js'
            },
            prodCSS: {
                files: cssConfig.prodCss
            }
        },
        'gh-pages': {
            options: {
                base: 'build',
                branch: 'release'
            },
            src: ['**/*']
        },
        karma: {
            options: {configFile: 'config/karma.conf.js'},
            dev: {
                reporters: ['spec'],
                browsers: ['Chrome'],
                singleRun: false,
                webpack: webpackConfig.testWithoutCoverage
            },
            unit: {
                webpack: webpackConfig.testWithCoverage,
                reporters: [
                    'coverage',
                    'spec'
                ],
                coverageReporter: {
                    type: 'html',
                    dir: 'coverage/'
                }
            }
        },
        uglify: {
            options: {banner: '<%= banner %>'},
            dist: {
                src: '<%= concat.prodJS.dest %>',
                dest: 'build/production/tauCharts.min.js'
            }
        },
        cssmin: {
            build: {
                files: cssConfig.cssMin
            }
        },
        postcss: {
            options: {processors: [autoprefixer({browsers: ['last 2 version']})]},
            dist: {src: 'css/*.css'}
        },
        copy: {
            copybuild: {
                files: [
                    {
                        src: 'build/production/**',
                        expand: true,
                        dest: 'build/'
                    },
                    {
                        src: 'examples/**',
                        expand: true,
                        dest: 'build/'
                    },
                    {
                        src: 'build/development/**',
                        expand: true,
                        dest: 'build/'
                    },
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
                    }
                ]
            },
            build: {
                files: [
                    {
                        src: 'license.md',
                        dest: 'build/license.md'
                    },
                    {
                        src: 'License.txt',
                        dest: 'build/license.txt'
                    },
                    {
                        src: 'README.md',
                        dest: 'build/README.md'
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
                        src: 'plugins/annotations.js',
                        dest: 'build/development/plugins/tauCharts.annotations.js'
                    },
                    {
                        src: 'plugins/layers.js',
                        dest: 'build/development/plugins/tauCharts.layers.js'
                    },
                    {
                        src: 'plugins/quick-filter.js',
                        dest: 'build/development/plugins/tauCharts.quick-filter.js'
                    }
                ].concat(cssConfig.css)
            }
        },
        shell: {
            gitadd: {
                command: [
                    'git add build/tauCharts.js',
                    'git add build/tauCharts.min.js'
                ].join('&&'),
                options: {stdout: true}
            }
        },
        less: cssConfig.less,
        clean: {
            build: {
                src: [
                    'build/production/',
                    'build/development/'
                ]
            },
            npmpublish: {
                src: [
                    'build/'
                ]
            }
        },
        watch: {
            less: {
                files: ['less/*.less', 'less/**/*.less'],
                tasks: ['less']
            }
        },
        webpack: {
            build: webpackConfig.chartBuild,
            buildExportTo: webpackConfig.exportBuild
        },
        'webpack-dev-server': {
            options: {
                webpack: webpackConfig.chartBuild,
                publicPath: '/'
            },
            start: {
                port: 9000,
                keepAlive: true,
                webpack: {
                    devtool: 'eval',
                    debug: true
                },
                stats: {
                    timings: true
                }
            }
        },
        jscs: {
            src: [
                'plugins/*.js',
                'src/**'
            ],
            options: {
                esnext: true,
                config: '.jscsrc',
                excludeFiles: ['src/addons/*.*']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-jscs');

    grunt.registerTask('default', [
        'less',
        'webpack:build',
        'webpack:buildExportTo'
    ]);
    var buildWithoutPublish = [
        'less',
        'postcss',
        'copy:build',
        'webpack:build',
        'webpack:buildExportTo',
        'concat:dist',
        'concat:prodJS',
        'concat:prodCSS',
        'uglify',
        'cssmin'
    ];
    grunt.registerTask('build', buildWithoutPublish);
    grunt.registerTask('publish', buildWithoutPublish.concat([
        'copy:copybuild',
        'clean:build'
    ]));
    grunt.registerTask('travis', [
        'jscs',
        'build'
    ]);
    grunt.registerTask('watching', ['default']);
};