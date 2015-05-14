angular.module('codeColab.deploy', [])

.controller('deployCtrl', function ($scope, Share) {


  $scope.deploy = "DEPLOYED!"
  $scope.first = true;

  $scope.deployApp = function(){
    var validName = false;
    var name;
      if ($scope.first) {
        bootbox.prompt("What would you like to name your app?", function (enterName) {
          name = enterName
          $scope.first = false;
          validName = Share.checkName(name)
          if (validName) {
            Share.deployApp($scope, $scope.selected, name);
          } else {
            $scope.deployApp();
          }
       })
      } else {
        bootbox.prompt("Valid Heroku app names must start with a letter and can only contain lowercase letters, numbers,\
         and dashes. Please enter a valid name.", function (enterName) {
          name = enterName;
          validName = Share.checkName(name)
          if (validName) {
            Share.deployApp($scope, $scope.selected, name);
          } else {
            $scope.deployApp();
          }
        })
      }
    }


  $scope.deployApp();
})