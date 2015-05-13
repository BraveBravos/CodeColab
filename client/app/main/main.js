// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])

.controller('codeCtrl', function ($scope, $location, Share, FileStructDo) {
  $scope.fileStruct = {url: "app/main/fileStruct.html"};
  $scope.videochat = {url : "app/videochat/videochat.html"};
  $scope.modalShown = false;
  $scope.repos = [{name:'Select a Repository'}];
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
    // setTimeout(function() {
    //   console.log('tree: ',$scope.tree)
    //   },1500)
    if(!$scope.ref) {
      $scope.createBranch()
    }
  }

  $scope.check = function(){
    return !!($scope.selected)
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
        Share.mergeBranch($scope.selected, values.pullTitle, values.comments)
      }
    });
  }

  $scope.commitModal = function() {
    bootbox.prompt("Please enter your commit message:", function (result) {
      Share.commit(result, $scope.selected, $scope);
    })
  }

  $scope.deployApp = function(){
    var validName = false;
    var first = true;
    while (!validName) {
      if (first) {
        var name = prompt("What would you like to name your app?")
        first = false;
      } else {
        var name = prompt("Valid Heroku app names must start with a letter and can only contain lowercase letters, numbers,\
         and dashes. Please enter a valid name.")
      }
      validName = Share.checkName(name);
    }
      Share.deployApp($scope, $scope.selected, name);
  }


  $scope.init();
})





