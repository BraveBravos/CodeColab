'use strict';

//require('../client/app/videochat/videochat.js');

describe('videochat tests',function(){

  describe('connection methods are defined',function(){
    
    it('connection.onstream is defined',function(){
      expect('connection.onstream').toBeDefined();
    });

    it('connection.openSignalingChannel is defined',function(){
      expect('connection.openSignalingChannel').toBeDefined();
    });

    it('connection.onspeaking is defined',function(){
      expect('connection.onspeaking').toBeDefined();
    });

  });

});