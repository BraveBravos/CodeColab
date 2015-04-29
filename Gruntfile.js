module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }    
  });

  grunt.loadNpmTasks('grunt-karma');

  // Default task(s).
  grunt.registerTask('default', ['karma']);

};