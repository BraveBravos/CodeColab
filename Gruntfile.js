module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    run: {
      server: {
        args: [
          'server/server.js',
          '-3000'
        ]
      }
    },
    open: {
      dev : {
        path: 'http://localhost:3000',
        app: 'Google Chrome'
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-open');

  // Default task(s).
  grunt.registerTask('default', ['karma']);
  grunt.registerTask('localhost',['open:dev','run:server']);

};