/*global module:false*/
var autoprefixer = require('autoprefixer-core');
var webpack = require('webpack');
var webpackConfig = require('./config/webpack.test.config');
var cssConfig = require('./config/css.config');
var path = require('path');
var cachePath = path.join(require('os').tmpdir(), './webpackCache');

var ensureDir = function (absolutePath) {
    var fs = require('fs-extra');
    fs.mkdirsSync(absolutePath);
    return absolutePath;
};
module.exports = function (grunt) {
    // Project configuration.
    var src = [
        '*.js',
        '**/*.js',
        '!addons/*.js'
    ];
    var webpackExportConf = {
        entry: './plugins/export.js',
        output: {
            library: 'exportTo',
            libraryTarget: 'umd',
            path: 'build/development/plugins/',
            filename: 'tauCharts.js'
        },
        externals: {
            tauChart: 'tauChart'
        },
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
                }
            }]
        },
        stats: {
            timings: true
        }
    };
    var webpackConf = {
        entry: './src/tau.charts.js',
        output: {
            library: 'tauCharts',
            libraryTarget: 'umd',
            path: 'build/development',
            filename: 'tauCharts.js'
        },
        externals: {
            d3: 'd3',
            underscore: 'underscore'
        },
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: ensureDir(path.join(cachePath, './babelJS'))
                }
            }]
        },
        stats: {
            timings: true
        }
    };
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
        compile: {
            build: {
                cwd: 'src/',
                src: src,
                dest: 'build/development/tauCharts.js'
            },
            dev: {
                cwd: 'src/',
                src: src
            }
        },
        karma: {
            options: {configFile: 'config/karma.conf.js'},
            dev: {
                reporters: ['dots'],
                browsers: ['Chrome'],
                singleRun: false,
                webpack: webpackConfig.default
            },
            unit: {
                webpack: webpackConfig.coverage,
                reporters: [
                    'coverage',
                    'dots'
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
        jshint: {
            all: {
                src: [
                    'src/**/*.js',
                    'Gruntfile.js'
                ],
                options: {
                    jshintrc: true
                }
            }
        },
        less: cssConfig.less,
        clean: [
            'build/production/',
            'build/development/'
        ],
        watch: {
            js: {
                files: ['<%= jshint.all.src %>'],
                tasks: [
                    'jshint',
                    'compile:dev',
                    'less'
                ]
            },
            less: {
                files: ['less/*.less', 'less/**/*.less'],
                tasks: ['less']
            }
        },
        webpack: {
            build: webpackConf,
            buildExportTo: webpackExportConf
        },
        'webpack-dev-server': {
            options: {
                webpack: webpackConf,
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
                config: '.jscsrc',
                excludeFiles: ['src/addons/*.*']
            }
        }
    });
    // load local tasks
    grunt.loadTasks('tasks');
    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
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
    // Default task.
    // grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
    grunt.registerTask('default', [
        'less',
        'compile:dev',
        'jshint',
        'watch:js'
    ]);
    var buildWithoutPublish = [
        'less',
        'postcss',
        'copy:build',
        'compile:build',
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
        'clean'
    ]));
    grunt.registerTask('travis', [
        'jshint',
        'jscs',
        'build'
    ]);
    grunt.registerTask('watching', ['default']);
};