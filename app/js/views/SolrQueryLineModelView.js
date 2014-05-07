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
      // model passed from parent view
      this.model = this.options.model;
    },
    events: {
      'click button.js-and': 'andClicked',
      'click button.js-or': 'orClicked',
      'click button.js-delete': 'deleteClicked',
      'change input.js-value': 'valueChanged'
    },
    valueChanged: function(){
      // set value attribute on field change
      var value = $('input.js-value', this.el).val();
      this.model.set('value', value);
    },
    render: function(){
      this.$el.append(solrQueryLineTemplate(this.model));
      // add custom selects
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
        // when select changed, lookup which field was selected
        var field = _.find(self.options.fields, function(thing){
          return thing.value === item;
        }),
          // check field for options
          isNumber = field.isNumber === true,
          isSortable = field.sortable === true,
          /*
           * check if previous field had similar attributes,
           * no need to redraw type select if so.
           */
          sameType = self.isNumber === isNumber && self.isSortable === isSortable;
        // save references for next time select changed.
        self.isNumber = isNumber;
        self.isSortable = isSortable;
        // set selected field to model
        self.model.set('field', item);
        if(!sameType){
          //removes element but leaves root $el attached to DOM.
          self.searchTypeSelect.empty();
          self.drawTypeSelect();
          // if number, auto select the first number option, if string select first string option
          self.model.set('type', self.isNumber ? searchOptions.number[0] : searchOptions.string[0]);
          if(self.extraTypeSelect){
            // if extra select, remove for now and remove irrelevant model attrs
            self.extraTypeSelect.empty();
            self.model.set('characterCount', false);
            self.model.set('count', false);
          }
        }
      });
    },
    drawTypeSelect: function(){
      var self = this,
        // set options to string or number options, depending on field type
        options = this.isNumber ? _.clone(searchOptions.number) : _.clone(searchOptions.string);
      // get field object
      var field = _.find(this.options.fields, function(item){
        return item.value === self.model.get('field');
      });

      // not when first loaded.
      if(field){
        // if sortable then cant be multiple
        if(!field.sortable){
          // add additional option for multiple results
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
          // set to model
          self.model.set('characterCount', true);
          // cant be char count and count.
          self.model.set('count', false);
          // count and char count both numerical search options
          self.model.set('type', searchOptions.number[0]);
          // draw extra select for type
          self.drawExtraTypeSelect();
        } else if(item === 'count') {
          self.model.set('characterCount', false);
          self.model.set('count', true);
          self.model.set('type', searchOptions.number[0]);
          self.drawExtraTypeSelect();
        } else {
          if(self.extraTypeSelect){
            // remove if no longer needed
            self.extraTypeSelect.empty();
          }
          // remove count and char count from model
          self.model.set('count', false);
          self.model.set('characterCount', false);
          self.model.set('type', item);
        }
      });
    },

    /*
     * this method creates another 'Type' dropdown
     * when 'count' or 'character count' are selected
     */
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
    // bubbles up to parent view
    andClicked: function(){
      this.trigger('andClicked');
    },
    //bubbles up to parent view
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