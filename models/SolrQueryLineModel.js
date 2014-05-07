define([
  'backbone'
], function(
  Backbone
){
  'use strict';

  return Backbone.Model.extend({
    defaults: {
      field: '',
      type: 'matches phrase',
      value: '',
      characterCount: false,
      count: false
    }
  });
});