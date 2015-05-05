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
  }


  $scope.hideModal = function() {
    Share.loadShare($scope);
    $scope.modalShown = false;
  }

  $scope.init();
})


.directive('repoModal', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
})

// .controller('fileStructCtrl', function($scope, FileStruct){
//       $scope.delete = function(data) {
//           data.nodes = [];
//       };
//       $scope.add = function(data) {
//           var post = data.nodes.length + 1;
//           var newName = data.name + '-' + post;
//           data.nodes.push({name: newName,nodes: []});
//       };
//       $scope.fileStruct = [{name: "Node", nodes: []}];
//   });









