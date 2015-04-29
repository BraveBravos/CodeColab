module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'specs/*.js',
    ],

    autoWatch : true,

    singleRun : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-phantomjs-launcher'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};