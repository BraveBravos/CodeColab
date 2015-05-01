// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, Share) {
  $scope.loadShare = function () {
    $scope.cm = Share.loadShare($scope);
  }();

  $scope.saveFile = function() {
    var doc = {
      left:$scope.cm.editor().getValue(),
      right: $scope.cm.rightOriginal().getValue()
    }
    console.log('angular', doc)
    Share.sendFile($scope, doc);
  }

  setInterval($scope.saveFile, 15000);

  console.log('doc',$scope.cm);
})