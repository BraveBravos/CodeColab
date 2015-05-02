// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, $location, Share) {
  $scope.doc = {};
  $scope.videochat = {url : "app/videochat/videochat.html"};

  $scope.loadShare = function () {
    $scope.cm = Share.loadShare($scope);
  };

  $scope.loadFile = function() {
    Share.loadFile($scope)
  };

  $scope.saveFile = function() {
    var doc = {
      left:$scope.cm.editor().getValue(),
      right: $scope.cm.rightOriginal().getValue()
    }
    console.log('angular', doc)
    Share.sendFile($scope, doc);
  }

  $scope.logout = function() {
    Share.logout()
    .success(function(data) {
      $location.path('/signin');
    })
  }

  // $scope.clone = function(){

  // }

  $scope.init = function () {
    $scope.loadShare();
    $scope.loadFile();
    setInterval($scope.saveFile, 15000);
  }

  $scope.init();
})
.controller('fileStructCtrl', function($scope, FileStruct){
      $scope.delete = function(data) {
          data.nodes = [];
      };
      $scope.add = function(data) {
          var post = data.nodes.length + 1;
          var newName = data.name + '-' + post;
          data.nodes.push({name: newName,nodes: []});
      };
      $scope.fileStruct = [{name: "Node", nodes: []}];
  });









