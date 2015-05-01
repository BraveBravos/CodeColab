// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, Share) {
$scope.doc = {};

  $scope.loadShare = function () {
    $scope.cm = Share.loadShare($scope);
  };

  $scope.loadFile = function() {
    Share.loadFile($scope)
  };

  $scope.saveFile = function() {
    var doc = {
      left:$scope.cm.editor().getValue(),
      right: $scope.cm.rightOriginal().getValue()
    }
    console.log('angular', doc)
    Share.sendFile($scope, doc);
  }

  $scope.init = function () {
    $scope.loadShare();
    $scope.loadFile();
    setInterval($scope.saveFile, 15000);
  }

  $scope.init();
})