// describe('videochatCtrl', function() {

//   beforeEach(angular.mock.module('codeColab.videochat'));

//   var videochatCtrl, scope, $controller;

//   beforeEach(inject(function($rootScope, $controller){

//     scope = $rootScope.$new();
//     videochatCtrl = $controller('videochatCtrl', { $scope: scope });

//   }));
  
//   describe('video chat methods should be functions', function(){

//     it('connection.onstream is a function', function(){
//       expect(typeof connection.onstream).toEqual('function');
//     });

//     it('connection.openSignalingChannel is a function', function(){
//       expect(typeof connection.openSignalingChannel).toEqual('function');
//     });

//     it('connection.onspeaking is a function', function(){
//       expect(typeof connection.onspeaking).toEqual('function');
//     });
    
//   });


//   it('afterEach is defined',function(){
//     expect('afterEach').toBeDefined();
//   });

//   it('connection.openSignalingChannel is a function',function(){
//     console.log('TYPEOF CONNECTION.openSignalingChannel', typeof connection.openSignalingChannel);
//     expect( typeof connection.openSignalingChannel ).toEqual('function');
//   });


//     it('should have a afterEach method', function() {
//       expect(afterEach).to.be.a('function');
//     });

//   describe('$scope.createBranch', function() {
//   var $scope = {};
//   var controller = $controller('codeCtrl', { $scope: $scope });
//    it('should have a createBranch method', function() {
//      expect($scope.createBranch).to.be.a('function');
//    });
//   });

//   describe('$scope.commitModal', function() {
//   var $scope = {};
//   var controller = $controller('codeCtrl', { $scope: $scope });
//    it('should have a commitModal method', function() {
//      expect($scope.commitModal).to.be.a('function');
//    });
//   });

//   describe('$scope.deployApp', function() {
//   var $scope = {};
//   var controller = $controller('codeCtrl', { $scope: $scope });
//    it('should have a deployApp method', function() {
//      expect($scope.deployApp).to.be.a('function');
//    });
//   });

// });