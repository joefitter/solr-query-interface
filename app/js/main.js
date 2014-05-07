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
    select: '../vendor/backbone-select/src/backbone-select.amd',
    scrollTo: '../vendor/jquery.scrollTo/jquery.scrollTo'
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
  'config/fields'
], function(
  $,
  BaseView,
  App,
  fields
){
  'use strict';

  $(function(){

    var app = new App($('#main-region'));
    
    app.start(BaseView, {
      fields: fields,
    });

    app.Events.on('search', function(search){
      console.log(search);
    });
  });
});