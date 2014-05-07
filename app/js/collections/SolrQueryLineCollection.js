define([
  'backbone',
  '../models/SolrQueryLineModel'
], function(
  Backbone,
  SolrQueryLineModel
){
  'use strict';

  return Backbone.Collection.extend({
    model: SolrQueryLineModel
  });
});