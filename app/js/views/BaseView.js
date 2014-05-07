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
      this.collection = new SolrQueryGroupCollection();
      this.collection.on('add', this.addItem, this);
    },
    events: {
      'click button.js-go': 'validate',
      'click a.js-refine': 'refine'
    },
    render: function(){
      this.$el.html(solrQueryInterfaceTemplate(this.collection));
      this.collection.add(new SolrQueryGroupModel({
        first: true
      }));
      return this;
    },
    addItem: function(item){
      var solrQueryGroupModelView = new SolrQueryGroupModelView({
        columns: this.options.columns,
        model: item
      }),
        self = this;
      solrQueryGroupModelView.on('andClicked', function(){
        self.collection.add(new SolrQueryGroupModel());
      });
      solrQueryGroupModelView.on('delete', function(model){
        self.collection.remove(model);
      });
      $('.advanced-search-query', this.el).append(solrQueryGroupModelView.render().el);
    },
    validate: function(){
      var valid = true,
        self = this;
      this.collection.each(function(item){
        item.get('collection').each(function(thing){
          if(thing.get('value') === '' || thing.get('field') === ''){
            valid = false;
            self.errorTooltip('Please complete all fields');
            return;
          } else {
            var type = thing.get('type');
            if(type === 'equals' || type === 'is greater than' || type === 'is less than'){
              var isInteger = /^\d+$/g.test(thing.get('value'));
              if(!isInteger){
                valid = false;
                self.errorTooltip('Sorry, only whole integers can be used to search a number field');
                return;
              }
            }
            if(type === 'contains' || type === 'doesn\'t contain'){
              if(thing.get('value').indexOf(' ') > -1){
                valid = false;
                self.errorTooltip('Sorry, "contains" can only include one term. Please use "Matches Phrase" if your search value contains spaces.');
                return;
              }
            }
            if(thing.get('field') === 'url'){
              if(thing.get('value').length > 25 || thing.get('value').length < 3){
                valid = false;
                self.errorTooltip('Sorry, URL queries can only be between 3 and 25 characters');
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
      var search = [];
      this.collection.each(function(item){
        var group = [];
        item.get('collection').each(function(thing){
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
      this.summaryView();
      this.trigger('search', this.search);
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
    summaryView: function(){
      var self = this;
      var summary = 'Showing all pages where ';
      _.each(this.search, function(item, i){
        if(i > 0){
          summary += ' and ';
        }
        _.each(item, function(thing, j){
          if(j > 0){
            summary += ' or ';
          }
          var field = _.find(self.options.columns, function(x){return x.modelRef === thing.field;}).name;
          summary += (thing.count ? 'number of ' : '');
          summary += '<span class="blue">';
          summary += field;
          summary += (thing.count ? (field.charAt(field.length-1) === 's' ? '' : 's') : '');
          summary += '</span>';
          summary += ' ' + (thing.characterCount ? 'character count ' : '');
          summary += thing.type + ' <span class="blue">' + thing.value + '</span>';
        });
      });
      summary += '.';
      $('.summary', this.el).html('<h3>' + summary + '</h3>');
      $('.query-interface', this.el).hide();
      $('.summary-wrapper', this.el).show();
    },
    refine: function(){
      $('.query-interface', this.el).show();
      $('.summary-wrapper', this.el).hide();
    },
    destroy: function(){
      this.unbind();
      this.remove();
    }
  });
});