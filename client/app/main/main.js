// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])

.controller('codeCtrl', function ($scope, $location, Share, FileStructDo, $q) {
  $scope.fileStruct = {url: "app/main/fileStruct.html"};
  $scope.videochat = {url : "app/videochat/videochat.html"};
  $scope.modalShown = false;
  $scope.repos = [{name:'Select a Repository'}];
  $scope.selectRepo = "";
  $scope.spinner = false;
  $scope.textSpinner = false;
  $scope.commitMade = false;
  $scope.fileLoaded = false;

  //shows spinner for text editor when file loading
  $scope.editorWillLoad = function () {
    $scope.textSpinner = true
  }

  //hides spinner for text editor when file loading
  $scope.editorHasLoaded = function () {
    $scope.textSpinner = false
  }

  $scope.init = function () {
    Share.getRepos($scope);
    Share.loadCM($scope);
  }

  $scope.saveRepo = function(repo) {
    $scope.fileLoaded = false;
    Share.resetCM($scope)
    $scope.selected = repo.name;
    localStorage.repo = repo.name;
    var promise = Share.createBranch($scope.selected);
    promise.then(function(result) {
      FileStructDo.getTree($scope, repo, 'CODECOLAB')
    });
  }

  $scope.mergeModal = function(){
    bootbox.form({
      title: "Please enter your pull request info",
      fields: {
        pullTitle: {
          label: 'Title:',
          value: '',
          type: 'text'
        },
        comments: {
          label: 'Comments:',
          value: '',
          type: 'textarea'
        }
      },
      callback: function(values) {
        if (values === null) {
          return;
        }
        bootbox.confirm("Are you sure you want to merge your changes into your master branch?", function (result) {
          if (result) {
            Share.mergeBranch($scope.selected, values.pullTitle, values.comments, $scope)
          }
        })
      }
    });
  }

  //modal for committing changes to GitHub
  $scope.commitModal = function() {
    bootbox.prompt("Please enter your commit message:", function (result) {
      Share.commit(result, $scope.selected, $scope);
    })
  }

  $scope.init();
})












