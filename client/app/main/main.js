// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])

.controller('codeCtrl', function ($scope, $location, Share, FileStructDo) {
  $scope.fileStruct = {url: "app/main/fileStruct.html"};
  $scope.videochat = {url : "app/videochat/videochat.html"};
  $scope.modalShown = false;
  $scope.repos = [];
  $scope.selectRepo = "";

  $scope.init = function () {
    Share.getRepos($scope);
    Share.loadCM($scope);
  }

  $scope.createBranch = function(){
    //save ref and sha to use in commit
    Share.createBranch($scope.selected).then(function(branch) {
      // console.log("Got branch info:", branch)
      $scope.ref = branch.ref;
      $scope.sha = branch.sha;
    })
  }

  $scope.saveRepo = function(repo) {
    $scope.selected = repo.name;
    Share.resetCM($scope)

    // FileStructDo.getTree(repo)
    FileStructDo.getTree($scope, repo)
    
    if(!$scope.ref) {
      $scope.createBranch()
    }
  }

  $scope.check = function(){
    return !!($scope.selected)
  }

  $scope.commit = function(message){
    Share.commit(message)
    var input = document.getElementById('commitMessage');
    input.value = ''
  }

  $scope.init();
})





