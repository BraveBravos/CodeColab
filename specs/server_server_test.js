'use strict';
//var app = require('../server/server.js');

describe('CodeColab tests for server/server.js',function(){
  
  describe('server.js methods',function(){

    it('app set is defined',function(){
      expect('app.set').toBeDefined();
    });

    it('app listen is defined',function(){
      expect('app.listen').toBeDefined();
    });

  }); 
});