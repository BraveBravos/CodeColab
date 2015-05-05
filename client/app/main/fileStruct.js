angular.module('codeColab.fileStruct', [])

.controller('fileStructCtrl', function($scope, $http){

      
  $scope.delete = function(data) {
      data.nodes = [];
  };

  $scope.add = function(data) {
      var post = data.nodes.length + 1;
      var newName = data.name + '-' + post;
      data.nodes.push({name: newName,nodes: []});
  };

//Stephanie, this is from https://docs.angularjs.org/api/ng/service/$http
  var tmp = 'SFoskitt/MKS14-toy-problems';
  var base = 'https://api.github.com/repos/';
  console.log("concat url ", base + tmp) 
  $http.get(base + tmp)
  // $http.get('/api/fileStruct')
    .success(function(data) {
			console.log("data in fileStructCtrl is", data)
    })
    .error(function(err) {
      console.log("2nd attempt at url concat ", base + tmp)
			console.log("error in fileStructCtrl is ", err)
    });

});

