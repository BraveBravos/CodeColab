// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, Share) {
  $scope.loadShare = function () {
    $scope.cm = Share.loadShare($scope);
  }()


  console.log(CodeMirror);
})