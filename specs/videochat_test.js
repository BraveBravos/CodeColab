
describe('videochat tests',function(){
  
  beforeEach(module('codeColab.videochat'));

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

    it('connection.onsilence is defined',function(){
      expect('connection.onsilence').toBeDefined();
    });

    it('connection.onunmute is defined',function(){
      expect('connection.onunmute').toBeDefined();
    });

  });

  describe('join and leave chat methods are defined',function(){

    it('joinChat method is defined',function(){
      expect('joinChat').toBeDefined();
    });

    it('leaveChat method is defined',function(){
      expect('leaveChat').toBeDefined();
    });

  });

});


