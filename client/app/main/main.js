// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, $location, Share) {
  $scope.videochat = {url : "app/videochat/videochat.html"};

  $scope.init = function () {
    Share.getID($scope);
  }

  $scope.logout = function() {
    Share.logout()
    .success(function(data) {
      $location.path('/signin');
    })
  }

  // $scope.clone = function(){

  // }

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









