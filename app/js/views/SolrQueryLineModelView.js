/*global _,$*/

define([
  'backbone',
  'stache!solrQueryLine',
  'select',
  'config/searchoptions'
], function(
  Backbone,
  solrQueryLineTemplate,
  CustomSelect,
  searchOptions
){
  'use strict';

  return Backbone.View.extend({
    initialize: function(options){
      this.options = options || {};
      this.model = this.options.model;
    },
    events: {
      'click button.js-and': 'andClicked',
      'click button.js-or': 'orClicked',
      'click button.js-delete': 'deleteClicked',
      'change input.js-value': 'valueChanged'
    },
    valueChanged: function(){
      var value = $('input.js-value', this.el).val();
      this.model.set('value', value);
    },
    render: function(){
      this.$el.append(solrQueryLineTemplate(this.model));
      this.drawFieldSelect();
      this.drawTypeSelect();
      return this;
    },
    drawFieldSelect: function(){
      var self = this;
      this.fieldSelect = new CustomSelect({
        el: $('.search-field', this.el),
        collection: this.options.fields,
        placeholder: 'Select field...',
        value: undefined
      });
      this.listenTo(this.fieldSelect, 'changed', function(item){
        var col = _.find(self.options.fields, function(thing){
          return thing.value === item;
        }),
          isNumber = col.isNumber === true,
          isSortable = col.sortable === true,
          sameType = self.isNumber === isNumber && self.isSortable === isSortable;
        self.isNumber = isNumber;
        self.isSortable = isSortable;
        self.model.set('field', item);
        if(!sameType){
          self.searchTypeSelect.empty();
          self.drawTypeSelect();
          self.model.set('type', self.isNumber ? 'equals' : 'matches phrase');
          if(self.extraTypeSelect){
            self.extraTypeSelect.empty();
            self.model.set('characterCount', false);
            self.model.set('count', false);
          }
        }
      });
    },
    drawTypeSelect: function(){
      var self = this,
        options = this.isNumber ? _.clone(searchOptions.number) : _.clone(searchOptions.string);
      var field = _.find(this.options.fields, function(item){
        return item.value === self.model.get('field');
      });
      if(field){
        if(!field.sortable){
          options.push('count');
        }
      }
      this.searchTypeSelect = new CustomSelect({
        el: $('.search-type', this.el),
        collection: options,
        value: options[0]
      });
      this.listenTo(this.searchTypeSelect, 'changed', function(item){
        if(item === 'character count'){
          self.model.set('characterCount', true);
          self.model.set('count', false);
          self.model.set('type', searchOptions.number[0]);
          self.drawExtraTypeSelect();
        } else if(item === 'count') {
          self.model.set('characterCount', false);
          self.model.set('count', true);
          self.model.set('type', searchOptions.number[0]);
          self.drawExtraTypeSelect();
        } else {
          if(self.extraTypeSelect){
            self.extraTypeSelect.empty();
          }
          self.model.set('count', false);
          self.model.set('characterCount', false);
          self.model.set('type', item);
        }
      });
    },
    drawExtraTypeSelect: function(){
      var self = this;
      this.extraTypeSelect = new CustomSelect({
        el: $('.second-search-type', this.el),
        collection: searchOptions.number,
        value: searchOptions.number[0]
      });
      this.listenTo(this.extraTypeSelect, 'changed', function(item){
        self.model.set('type', item);
      });
    },
    andClicked: function(){
      this.trigger('andClicked');
    },
    orClicked: function(){
      this.trigger('orClicked');
    },
    deleteClicked: function(){
      this.trigger('delete', this.model);
      this.unbind();
      this.remove();
    }
  });
});