// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, Share) {
  $scope.loadShare = function () {
    Share.loadShare($scope);
  }()
})