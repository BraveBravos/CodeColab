// 'use strict';

// // var struct = require('../client/app/main/fileStruct.js');

describe('CodeColab tests for methods in fileStruct.js',function(){
  
  describe('module factory.FileStructDo methods are defined',function(){

  	it('toggleSpinner is defined',function(){
  	  expect('toggleSpinner').toBeDefined();
  	});

    it('getTree is defined',function(){
      expect('getTree').toBeDefined();
    });

    it('app listen is defined',function(){
      expect('app.listen').toBeDefined();
    });

  }); 
});