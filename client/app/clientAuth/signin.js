angular.module('codeColab.signin', [])

.controller('SignInCtrl', function ($scope, Auth) {

  $scope.signin = function () {
    Auth.signin($scope);
  }()

})