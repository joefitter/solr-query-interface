/*global _*/

define(['backbone'], function(Backbone){
  'use strict';

  function App($el){
    this.$el = $el;
  }

  App.prototype.start = function(BaseView, options){
    this.baseView = new BaseView(options);
    this.$el.html(this.baseView.render().el);
  };

  App.prototype.Events = _.clone(Backbone.Events);

  return App;
});