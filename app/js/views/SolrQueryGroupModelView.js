/*global $*/

define([
  'backbone',
  'stache!solrQueryGroup',
  '../collections/SolrQueryLineCollection',
  '../models/SolrQueryLineModel',
  './SolrQueryLineModelView'
], function(
  Backbone,
  solrQueryGroupTemplate,
  SolrQueryLineCollection,
  SolrQueryLineModel,
  SolrQueryLineModelView
){
  'use strict';

  return Backbone.View.extend({
    initialize: function(options){
      this.options = options || {};
      // model passed from parent view.
      this.model = this.options.model;
      // set empty collection to hold 'OR' querys
      this.model.set('collection', new SolrQueryLineCollection());
      this.listenTo(this.model.get('collection'), 'add', this.addItem);
    },
    render: function(){
      // add to dom
      this.$el.html(solrQueryGroupTemplate(this.model));
      // add a blank search line model to start
      this.model.get('collection').add(new SolrQueryLineModel({
        first: true,
        only: this.model.collection.length === 1
      }));
      return this;
    },
    addItem: function(model){
      var self = this;
      // create new seach line model
      var modelView = new SolrQueryLineModelView({
        fields: this.options.fields,
        model: model
      });
      // listen for 'or' button click - add to OR group if so
      this.listenTo(modelView, 'orClicked', function(){
        self.model.get('collection').add(new SolrQueryLineModel());
      });
      // bubble up AND click to parent view
      this.listenTo(modelView, 'andClicked', function(){
        self.trigger('andClicked');
      });
      this.listenTo(modelView, 'delete', function(model){
        // remove model from collection
        self.model.get('collection').remove(model);
        if(self.model.get('collection').length <= 0){
          // if there are no models in the collection, remove this view
          self.trigger('delete', self.model);
          self.destroy();
        }
      });
      // append to DOM
      $('.search-group', this.el).append(modelView.render().el);
    },
    destroy: function(){
      this.unbind();
      this.remove();
    }
  });
});