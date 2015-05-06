// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, $location, Share) {
  $scope.fileStruct = {url: "app/main/fileStruct.html"}
  $scope.videochat = {url : "app/videochat/videochat.html"};
  $scope.modalShown = false;
  $scope.repos = [];
  $scope.selectRepo = "";

  $scope.init = function () {
    Share.getRepos($scope);
  }

  $scope.saveRepo = function(repo) {
    $scope.selected = repo.name;
    Share.loadShare($scope);
  }

  $scope.check = function(){
    return !!($scope.selected)
  }

  $scope.init();
})
