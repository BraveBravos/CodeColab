// var codeColab = angular.module('codeColab.main', [])
angular.module('codeColab.main', [])


.controller('codeCtrl', function ($scope, $location, Share) {
  $scope.doc = {};
  $scope.videochat = {url : "app/videochat/videochat.html"};

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

  $scope.logout = function() {
    $http.get('/logout')
    .success(function(data) {
      $location.path('/signin');
    })
  }

  $scope.init = function () {
    $scope.loadShare();
    $scope.loadFile();
    setInterval($scope.saveFile, 15000);
  }

  $scope.init();
})


