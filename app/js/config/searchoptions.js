define(function(){
  'use strict';

  return {
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
  };
});