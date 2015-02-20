'use strict';

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the module
    var props = {
        src: 'src',
        dist: 'dist'
    };

    // Project propsuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        props: props,
        meta: {
            banner: [
                '/**',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - <%= grunt.template.today() %>',
                ' * @link <%= pkg.homepage %>',
                ' * @authors <%= pkg.authors.join(", ") %>',
                ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                ' */',
                ''
            ].join('\n')
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= props.dist %>'
                    ]
                }]
            },
            server: '.tmp'
        },
        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= props.src %>/**/*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/**/*.js', 'test/mock/**/*.js']
            },
            example: {
                src: ['example/**/*.js']
            }
        },
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['newer:jshint:all', 'newer:jshint:test', 'karma']
            },
            js: {
                files: ['<%= props.src %>/**/*.js'],
                tasks: ['newer:jshint:all', 'karma'],
            },
            jsTest: {
                files: ['test/karma.conf.js', 'test/spec/**/*.js', 'test/mock/**/*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['newer:jshint:all', 'newer:jshint:test', 'karma']
            },
            jsExample: {
                files: ['example/{,*/}*.js'],
                tasks: ['newer:jshint:example'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'example/{,*/}*.html',
                    'example/views/{,*/}*.html',
                    'example/styles/{,*/}*.css'
                ]
            }
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>\n',
                stripBanners: true,
                separator: '\n\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.js': [
                        '.tmp/ngaa.js',
                        '.tmp/constants/**/*.js',
                        '.tmp/providers/**/*.js',
                        '.tmp/services/**/*.js',
                        '.tmp/directives/**/*.js',
                        '.tmp/controllers/**/*.js',
                        'bower_components/base64/base64.js'
                    ]
                }
            }
        },
        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                options: {
                    singleQuotes: true,
                },
                files: [{
                    expand: true,
                    cwd: '<%= props.src %>',
                    src: ['**/*.js'],
                    dest: '.tmp'
                }]
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static('example'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect().use(
                                '/dist',
                                connect.static('./dist')
                            )
                        ];
                    }
                }
            }
        }
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function() {
        grunt.task.run([
            'clean:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'karma',
        'ngAnnotate',
        'concat'
    ]);

    grunt.registerTask('test', [
        'karma'
    ]);

};