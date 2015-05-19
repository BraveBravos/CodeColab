angular.module('codeColab.deploy', [])

.controller('deployCtrl', function ($scope, $location, Share, $q) {


  $scope.deploy = 'deploying';
  $scope.first = true;
  $scope.deploying = false;

  $scope.checkForApp = function() {
    Share.checkForApp($scope, localStorage.repo)
  }


  $scope.deployApp = function(){
    var modalDismissed = false;
    var validName = false;
    var name;
      if ($scope.first) {
        bootbox.prompt("What would you like to name your app?", function (enterName) {
          if (enterName === null) {
            modalDismissed = true;
            return;
          } else {
            name = enterName
            $scope.first = false;
            validName = Share.checkName(name)
            if (validName) {
              $scope.deploying = true;
              Share.deployApp($scope, name);
            } else {
              $scope.deployApp();
            }
          }
       })
      } else {
        bootbox.prompt("Valid Heroku app names must start with a letter and can only contain lowercase letters, numbers,\
         and dashes. Please enter a valid name.", function (enterName) {
          if (enterName === null) {
            $location.path('/');
          } else {
            name = enterName;
            validName = Share.checkName(name)
            if (validName) {
              $scope.deploying=true;
              Share.deployApp($scope, name);
            } else {
              $scope.deployApp();
            }
          }
        })
      }
    }


  $scope.checkForApp();
})
