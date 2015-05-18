// Karma configuration
// Generated on Fri May 15 2015 22:04:30 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'mocha', 'sinon'],


    // list of files / patterns to load in the browser
    files: [

      // dependencies
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-route/angular-route.js',
      'client/bower_components/bootstrap/dist/js/bootstrap.js',
      'client/bootbox/bootbox.js',
      'client/codemirror/codemirror.js',
      'client/codemirror/merge.js',
      'client/codemirror/sublimekeymap.js',
      'client/codemirror/javascript.js',
      // 'node_modules/RTCMultiConnection-v2.2.2.js',
      'node_modules/sinon/lib/sinon.js',
      'node_modules/bardjs/dist/bard.js',
      'client/app/bcsocket.js',

      // our app files
      'client/app/app.js',
      'client/app/services.js',
      'client/app/main/main.js',
      'client/app/deploy/deploy.js',
      'client/app/main/fileStruct.js',
      'client/app/main/angular.treeview.js',
      'client/app/videochat/videochat.js',


      // karma test files
      'specs/*.js'
    ],
    
    /*
    <script src = "share.uncompressed.js"></script>
    <script src = "share-codemirror.js"></script>
    */

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
    // 'mocha'
    'unicorn', 
    'nyan' 
    ],
    nyanReporter: { suppressErrorReport: false }, 

    plugins: [
      // 'requirejs',
      // 'karma-requirejs',
      'karma-mocha',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-nyan-reporter',
      'karma-unicorn-reporter',
      'karma-mocha-reporter',
      // 'should'
      'mocha-report',
      'karma-sinon'
      ],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

  
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['PhantomJS'],
    browsers : ['Chrome', 'PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
// favorite song: Happy Up Here
