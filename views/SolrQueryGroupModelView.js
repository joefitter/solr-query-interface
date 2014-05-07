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
      this.model = this.options.model;
      this.model.set('collection', new SolrQueryLineCollection());
      this.listenTo(this.model.get('collection'), 'add', this.addItem);
    },
    render: function(){
      this.$el.html(solrQueryGroupTemplate(this.model));
      this.model.get('collection').add(new SolrQueryLineModel({
        first: true,
        only: this.model.collection.length === 1
      }));
      return this;
    },
    addItem: function(item){
      var self = this;
      var modelView = new SolrQueryLineModelView({
        columns: this.options.columns,
        model: item
      });
      this.listenTo(modelView, 'orClicked', function(){
        self.model.get('collection').add(new SolrQueryLineModel());
      });
      this.listenTo(modelView, 'andClicked', function(){
        self.trigger('andClicked');
      });
      this.listenTo(modelView, 'delete', function(model){
        self.model.get('collection').remove(model);
        if(self.model.get('collection').length <= 0){
          self.trigger('delete', self.model);
          self.destroy();
        }
      });
      $('.search-group', this.el).append(modelView.render().el);
    },
    destroy: function(){
      this.unbind();
      this.remove();
    }
  });
});