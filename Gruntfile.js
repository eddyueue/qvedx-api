module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      doc: {
        src: [ 'doc/' ]
      },
    },
    jsdox: {
      generate: {
        options: {
          contentsTitle: 'QVEDX-API Documentation',
        },

        src: ['*/*.js', 'lib/*.js'], 
        dest: 'doc/markdown'
      }
    },
    jsdoc : {
        dist : {
            src: ['*/*.js', 'lib/*.js'], 
            options: {
                destination: 'doc'
            }
        }
    }    
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-jsdox');

  // Default task(s).
  grunt.registerTask('default', ['jsdoc']);
  grunt.registerTask('generate-docs', ['clean:doc', 'jsdoc:dist']); //, 'jsdox:generate'

};