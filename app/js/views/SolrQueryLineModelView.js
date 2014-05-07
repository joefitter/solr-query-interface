/*global _*/

define([
  'backbone',
  'stache!solrQueryLine',
  'select'
], function(
  Backbone,
  solrQueryLineTemplate,
  CustomSelect
){
  'use strict';

  return Backbone.View.extend({
    initialize: function(options){
      this.options = options || {};
      this.model = this.options.model;
    },
    events: {
      'click button.and': 'andClicked',
      'click button.or': 'orClicked',
      'click button.delete': 'deleteClicked',
      'keyup input.value': 'valueChanged',
      'change input.value': 'valueChanged',
      'paste input.value': 'valueChanged'
    },
    searchType: {
      string: [
        'matches phrase','doesn\'t match phrase',
        'contains',
        'doesn\'t contain',
        'matches regex',
        'doesn\'t match regex',
        'character count'
      ],
      number: [
        'equals',
        'is greater than',
        'is less than'
      ],
    },
    valueChanged: function(){
      var value = $('input.value', this.el).val();
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
        collection: this.options.columns,
        placeholder: 'Select field...',
        value: undefined
      });
      this.listenTo(this.fieldSelect, 'changed', function(item){
        var isNumber = _.find(self.options.columns, function(thing){
          return thing.id === item;
        }).isNumber === true,
          isSortable = _.find(self.options.columns, function(thing){
            return thing.id === item;
          }).sortable === true;
        var sameType = self.isNumber === isNumber && self.isSortable === isSortable;
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
        options = this.isNumber ? _.clone(this.searchType.number) : _.clone(this.searchType.string);
      var column = _.find(this.options.columns, function(item){
        return item.id === self.model.get('field');
      });
      if(column){
        if(!column.sortable){
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
          self.model.set('type', self.searchType.number[0]);
          self.drawExtraTypeSelect();
        } else if(item === 'count') {
          self.model.set('characterCount', false);
          self.model.set('count', true);
          self.model.set('type', self.searchType.number[0]);
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
        collection: this.searchType.number,
        value: this.searchType.number[0]
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
      this.undelegateEvents();
      this.$el.removeData().unbind();
      this.remove();
    }
  });
});