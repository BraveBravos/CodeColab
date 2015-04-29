// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope) {
  $scope.loadShare = function () {
    Share.loadShare($scope);
  }
})