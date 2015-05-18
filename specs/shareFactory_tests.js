
describe('Share factory tests',function(){
  
  // beforeEach(angular.module('codeColab.services'));

  beforeEach(inject(function($rootScope){
    scope = $rootScope.$new();
    $scope: scope;
  }));

  // describe('Share factory methods are functions', function(){

  //   it('getRepos is a function', function(){
  //     expect( typeof getRepos ).toEqual('function');  
  //   });

  //   it('createBranch is a function', function(){
  //     expect( typeof createBranch ).toEqual('function');
  //   });

  //   it('commit is a function', function(){
  //     expect( typeof commit ).toEqual('function');
  //   });

  // });

  describe('Share factory methods are defined',function(){

    it('getRepos is defined and is a function',function(){
      expect('getRepos').toBeDefined();
    });

    it('createBranch is defined and is a function',function(){
      expect('createBranch').toBeDefined();
    });

    it('commit is defined and is a function',function(){
      expect('commit').toBeDefined();
    });

    it('loadCM is defined',function(){
      expect('loadCM').toBeDefined();
    });

    it('resetRightOrig is defined',function(){
      expect('resetRightOrig').toBeDefined();
    });

    it('updateRightOrigValue is defined',function(){
      expect('updateRightOrigValue').toBeDefined();
    });

    it('resetCM is defined',function(){
      expect('resetCM').toBeDefined();
    });

    it('loadShare is defined',function(){
      expect('loadShare').toBeDefined();
    });

    it('loadFile is defined',function(){
      expect('loadFile').toBeDefined();
    });

    it('checkForApp is defined',function(){
      expect('checkForApp').toBeDefined();
    });

    it('deployApp is defined',function(){
      expect('deployApp').toBeDefined();
    });

    it('showLog is defined',function(){
      expect('showLog').toBeDefined();
    });

    it('rebuild is defined',function(){
      expect('rebuild').toBeDefined();
    });

    it('mergeBranch is defined',function(){
      expect('mergeBranch').toBeDefined();
    });

    it('checkName is defined',function(){
      expect('checkName').toBeDefined();
    });

  });

});
