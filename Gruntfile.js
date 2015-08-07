module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                "laxcomma": true,
                evil: true,
                expr: true,
                loopfunc: true,
               // unused:true,
                eqnull:true
            },
            tvui: ['src/**/*.js']

        },
        uglify: {

            tvui: {
                options: {
                    banner: '/*! TVUI version : 1.2.0  <%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %> */\n',
                    mangle: {
                        except: ['jQuery', 'Backbone', 'require', 'exports', 'module', 'Zepto']
                    }
                },
                files: {
                    'build/tvui.min.js': ['build/tvui.js']
                }
            }

        },
        concat: {
            tvui: {
                options: {
                    include: 'all',
                    noncmd: true,
                    separator: ';\n'
                },
                files: {
                    'build/tvui.js': ['src/tvui.js',
                        'src/json.js',
                        'src/zepto.js',
                        'src/ajax.js',
                        'src/mustache.js',
                        'src/util.js',
                        'src/key.js',
                        'src/lang.js',
                        'src/event.js',
                        'src/class.js',
                        'src/base.js',
                        'src/api.js',
                        'src/page.js',
                        'src/panel.js',
                        'src/pager.js',
                        'src/scrollbar.js',
                        'src/dialog.js',
                        'src/player.js',
                        'src/lazyload.js',
                        'src/log.js']
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('tvui', ['jshint:tvui', 'concat:tvui', 'uglify:tvui']);



};