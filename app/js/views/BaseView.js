/*global $,_*/

define([
  'backbone',
  'stache!solrQueryInterface',
  'stache!solrQuerySummary',
  '../collections/SolrQueryGroupCollection',
  '../models/SolrQueryGroupModel',
  './SolrQueryGroupModelView',
  'tooltip'
], function(
  Backbone,
  solrQueryInterfaceTemplate,
  solrQuerySummary,
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
      // add summary to dom
      $('.summary', this.el).html(solrQuerySummary(this.search));
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
      this.app.Events.trigger('hide');
    },
    destroy: function(){
      this.unbind();
      this.remove();
    }
  });
});