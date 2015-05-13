module.exports = function(config){
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath : './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // angular source
      'client/bower_components/angular/angular.min.js',
      'client/bower_components/angular-route/angular-route.min.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/jquery/dist/jquery.min.js',

      // our app files
      'client/app/app.js',
      'client/app/services.js',
      'client/app/main/*.js',

      // spec files
      'specs/*.js'
    ],

    // list of files to exclude
    exclude: [
        'karma.conf.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

    },

    // reporters: ['progress'],

    reporters: ['progress', 'nyan', 'unicorn'],
    nyanReporter: { suppressErrorReport: false }, 

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch : false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers : ['Chrome'],
    // browsers : ['PhantomJS'],

    singleRun : true

    // junitReporter : {
    //   outputFile: 'test_out/unit.xml',
    //   suite: 'unit'
    // }

    // plugins : [
    //         'karma-chrome-launcher',
    //         'karma-firefox-launcher',
    //         'karma-jasmine',
    //         'karma-junit-reporter',
    //         'karma-phantomjs-launcher'
    //         ],
            
  });
};
