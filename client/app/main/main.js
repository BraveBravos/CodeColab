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
    // FileStructDo.getTree(repo)
    FileStructDo.getTree($scope, repo)
    
    // if editor exists, get rid of it
    document.getElementsByClassName('CodeMirror-merge')[0] && document.getElementById('area').removeChild(document.getElementsByClassName('CodeMirror-merge')[0])
    // $scope.share && delete $scope.share && console.log('destroyed',$scope.share===undefined)
    
    if(!$scope.ref) {
      $scope.createBranch()
    }

  }

  $scope.check = function(){
    return !!($scope.selected)
  }

  $scope.commit = function(message){
    Share.commit(message, $scope.ref, $scope.sha)
  }

  $scope.init();
})
