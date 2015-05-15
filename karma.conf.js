module.exports = function(config){
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath : './',

    // list of files / patterns to load in the browser
    files: [
      // angular source
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-route/angular-route.js',
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/bootstrap/dist/js/bootstrap.js',
      'client/bootbox/bootbox.js',
      'client/codemirror/codemirror.js',

      // our app files
      'client/app/app.js',
      'client/app/bcsocket.js',
      'client/app/services.js',
      'client/app/deploy/deploy.js',
      'client/app/main/fileStruct.js',
      'client/app/main/main.js',
      'client/app/main/*.js',
      'client/app/main/angular.treeview.js',
      'client/app/videochat/*.js',

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

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers : ['Chrome'],
    browsers : ['PhantomJS'],

    singleRun : true,

    plugins : [
            'karma-phantomjs-launcher',
            // 'karma-chrome-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-nyan-reporter',
            'karma-unicorn-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }
            
  });
};
