angular.module('SignIn', [])

.controller('SignInCtrl', function ($scope, Auth) {

  $scope.signin = function () {
    Auth.signin($scope);
  }()

})