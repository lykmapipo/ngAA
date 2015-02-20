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
            }
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
        }
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