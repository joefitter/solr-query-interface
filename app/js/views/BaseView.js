/*global $,_*/

define([
  'backbone',
  'stache!solrQueryInterface',
  '../collections/SolrQueryGroupCollection',
  '../models/SolrQueryGroupModel',
  './SolrQueryGroupModelView',
  'tooltip'
], function(
  Backbone,
  solrQueryInterfaceTemplate,
  SolrQueryGroupCollection,
  SolrQueryGroupModel,
  SolrQueryGroupModelView,
  Tooltip
){
  'use strict';

  return Backbone.View.extend({
    className: 'query-interface-outer',
    initialize: function(options){
      this.options = options || {};
      // collection of 'AND' groups
      this.collection = new SolrQueryGroupCollection();
      this.collection.on('add', this.addItem, this);
    },
    events: {
      'click button.js-go': 'validateAndDoSearch',
      'click a.js-refine': 'refine'
    },
    render: function(){
      this.$el.html(solrQueryInterfaceTemplate(this.collection));
      // add an empty 'AND' model
      this.collection.add(new SolrQueryGroupModel({
        first: true
      }));
      return this;
    },

    addItem: function(model){
      var solrQueryGroupModelView = new SolrQueryGroupModelView({
        // pass fields to modelView
        fields: this.options.fields,
        model: model
      }),
        self = this;

      // 'AND' button clicked - add new 'and' group
      solrQueryGroupModelView.on('andClicked', function(){
        self.collection.add(new SolrQueryGroupModel());
      });

      // Remove and group
      solrQueryGroupModelView.on('delete', function(model){
        self.collection.remove(model);
      });

      // Append to DOM
      $('.advanced-search-query', this.el).append(solrQueryGroupModelView.render().el);
    },
    validateAndDoSearch: function(){
      var valid = true,
        self = this;
      // loop through 'AND' groups
      this.collection.each(function(model){
        // loop through 'OR' groups
        model.get('collection').each(function(item){
          if(item.get('value') === '' || item.get('field') === ''){
            // check fields have been completed, error if not
            valid = false;
            self.errorTooltip('Please complete all fields');
            return;
          } else {
            var type = item.get('type');
            if(type === 'equals' || type === 'is greater than' || type === 'is less than'){
              // if search type is numerical, value must pass integer regex.
              var isInteger = /^\d+$/g.test(item.get('value'));
              if(!isInteger){
                valid = false;
                self.errorTooltip('Sorry, only whole integers can be used to search a number field');
                return;
              }
            }
            if(type === 'contains' || type === 'doesn\'t contain'){
              // contains and doens't contain cannot include spaces
              if(item.get('value').indexOf(' ') > -1){
                valid = false;
                self.errorTooltip('Sorry, "contains" can only include one term. Please use "Matches Phrase" if your search value contains spaces.');
                return;
              }
            }
          }
        });
      });
      if(valid){
        this.doSearch();
      }
    },
    doSearch: function(){
      // holds 'AND' groups
      var search = [];
      this.collection.each(function(item){
        // holds 'OR' groups
        var group = [];
        item.get('collection').each(function(thing){
          // search term
          var line = {};
          line.field = thing.get('field');
          line.type = thing.get('type');
          line.value = thing.get('value');
          line.count = thing.get('count');
          line.characterCount = thing.get('characterCount');
          group.push(line);
        });
        search.push(group);
      });
      this.search = search;
      // show summary
      this.summaryView();
      // bubble up search JSON to application
      this.app.Events.trigger('search', this.search);
    },
    errorTooltip: function(message){
      new Tooltip({
        $el: $('.js-go'),
        text: message,
        context: 'danger',
        prefix: 'Error',
        align: 'left',
        timeout: 3000
      });
    },

    /*
     * This method turns the search query into a 
     * human-readable sentence.
     */
    summaryView: function(){
      var self = this;
      var summary = 'Showing all pages where ';
      // loop through 'AND' groups
      _.each(this.search, function(item, i){
        // prepend with 'and' if not first iteration
        if(i > 0){
          summary += ' and ';
        }
        // loop through 'OR' groups
        _.each(item, function(thing, j){
          // prepend with 'or' if not first iteration
          if(j > 0){
            summary += ' or ';
          }
          // get field title from search field value
          var field = _.find(self.options.fields, function(x){
            return x.value === thing.field;
          }).title;
          if(thing.count){
            summary += 'number of ';
          }
          // highlight field name
          summary += '<span class="blue">';
          summary += field;
          if(thing.count){
            // check if last letter of field is 's'
            if(field.charAt(field.length-1) !== 's'){
              // if not, add 's' to pluralise
              summary += 's';
            }
          }
          summary += '</span>';
          if(thing.characterCount){
            summary += 'character count';
          }
          summary += ' ' + thing.type + ' <span class="blue">' + thing.value + '</span>';
        });
      });
      summary += '.';
      // add summary to dom
      $('.summary', this.el).html('<h3>' + summary + '</h3>');
      /*
       * Query interface hidden not destroyed so
       * search can be refined if needed.
       */
      $('.query-interface', this.el).hide();
      // show summary view
      $('.summary-wrapper', this.el).show();
    },
    refine: function(){
      // hide summary and show query interface
      $('.query-interface', this.el).show();
      $('.summary-wrapper', this.el).hide();
    },
    destroy: function(){
      this.unbind();
      this.remove();
    }
  });
});