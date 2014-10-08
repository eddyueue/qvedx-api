module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsdoc : {
        dist : {
            src: ['*/*.js', 'lib/*.js'], 
            options: {
                destination: 'doc'
            }
        }
    }    
  });

  // Load the plugin that provides the "jsdoc" task.
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['jsdoc']);

};