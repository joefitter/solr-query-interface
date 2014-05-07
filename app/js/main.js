require.config({
  baseUrl: 'js/',
  paths: {
    jquery: '../vendor/jquery/dist/jquery',
    underscore: '../vendor/underscore/underscore',
    backbone: '../vendor/backbone/backbone', 
    text: '../vendor/requirejs-text/text',
    mustache: '../vendor/mustache/mustache',
    stache: '../vendor/requirejs-mustache/stache',
    tooltip: '../vendor/backbone-tooltip/src/backbone-tooltip.amd',
    select: '../vendor/backbone-select/src/backbone-select.amd'
  },
  stache: {
    extension: '.template',
    path: '/partials/'
  }
});

require([
  'jquery',
  'views/BaseView',
  'controllers/App',
  'config/columns'
], function(
  $,
  BaseView,
  App,
  columns
){
  'use strict';

  $(function(){
    var app = new App($('#main-region'));

    app.start(BaseView, {
      columns: columns,
    });
  });
});