// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, $location, Share) {
  $scope.fileStruct = {url: "app/main/fileStruct.html"};
  $scope.videochat = {url : "app/videochat/videochat.html"};
  $scope.modalShown = false;
  $scope.repos = [];
  $scope.selectRepo = "";
  $scope.editor;

  $scope.init = function () {
    Share.getRepos($scope);
  }

  $scope.saveRepo = function(repo) {
    $scope.selected = repo.name;
    if($scope.editor) {
      $scope.editor.socket.close();
      console.log('unsubscribe');
      $scope.editor.doc.unsubscribe()
      // $scope.editor.codeEditor.editor().setValue('')
    };
    $scope.editor = Share.loadShare($scope);
    $scope.editor.codeEditor.editor().setValue($scope.editor.doc.snapshot || 'Start editing.')
    $scope.editor.doc.subscribe()
  }

  $scope.check = function(){
    return !!($scope.selected)
  }

  $scope.commit = function(message){
    Share.commit(message) 
  }

  $scope.init();
})
