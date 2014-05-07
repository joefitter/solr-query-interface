define([
  'backbone',
  '../models/SolrQueryGroupModel'
], function(
  Backbone,
  SolrQueryGroupModel
){
  'use strict';

  return Backbone.Collection.extend({
    model: SolrQueryGroupModel
  });
});