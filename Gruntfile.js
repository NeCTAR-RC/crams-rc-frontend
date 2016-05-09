'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                wrap: '"use strict";\n\n {%= __ngModule %}',
                name: 'cramsConfig'
            },
            // Environment Targets For CRAMS api endpoint
            development: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'development',
                        apiEndpoint: 'http://localhost:8080/api/v1/'
                    }
                }
            },
            staging: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'staging',
                        apiEndpoint: 'http://crams-staging.erc.monash.edu.au/api/v1/'
                    }
                }
            },
            product: {
                options: {
                    dest: 'app/js/crams.config.js'
                },
                constants: {
                    ENV: {
                        name: 'production',
                        apiEndpoint: 'http://cramsapi.rc.nectar.org.au/api/v1/'
                    }
                }
            }
        },
        // run the http server
        'http-server': {
            'dev': {
                // the server root directory
                root: 'app',

                // the server port
                // can also be written as a function, e.g.
                // port: function() { return 8282; }
                port: 8000,

                // the host ip address
                // If specified to, for example, "127.0.0.1" the server will
                // only be available on that ip.
                // Specify "0.0.0.0" to be available everywhere
                host: "0.0.0.0",
                showDir: true,
                autoIndex: true,

                // server default file extension
                ext: "html",

                // Tell grunt task to open the browser
                openBrowser: true,

                // customize url to serve specific pages
                customPages: {
                    "/readme": "README.md",
                    "/readme.html": "README.html"
                }
            }
        },

        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            unit: {
                singleRun: true
            },
            continuous: {
                singleRun: false,
                autoWatch: true
            }
        }
    });


    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ng-constant');

    grunt.registerTask('utest', ['karma:unit']);

    // grunt run dev version
    grunt.registerTask('default', ['ngconstant:development', 'http-server:dev']);

    //grunt run staging version
    grunt.registerTask('runstaging', ['ngconstant:staging', 'http-server:dev']);

    //grunt run production version
    grunt.registerTask('runprod', ['ngconstant:product', 'http-server:dev']);

    grunt.registerTask('dev', 'ngconstant:development');
    grunt.registerTask('staging', 'ngconstant:staging');
    grunt.registerTask('prod', 'ngconstant:product');
};