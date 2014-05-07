/*jshint node: true */

'use strict';

module.exports = function(grunt){
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    express: {
      app: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
          bases: ['app'],
          livereload: true
        }
      }
    },
    open: {
      def: {
        path: 'http://localhost:<%= express.app.options.port %>'
      }
    }
  });

  grunt.registerTask('default', ['express:app', 'open', 'watch']);
};