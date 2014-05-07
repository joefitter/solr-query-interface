/*global _*/

define(['backbone'], function(Backbone){
  'use strict';

  function App($el){
    this.$el = $el;
    // use Backbone Events
    this.Events = _.clone(Backbone.Events);
  }

  App.prototype.start = function(BaseView, options){
    this.baseView = new BaseView(options);
    // pass app reference to view
    this.baseView.app = this;
    this.$el.html(this.baseView.render().el);
  };

  App.Events = _.clone(Backbone.Events);

  return App;
});