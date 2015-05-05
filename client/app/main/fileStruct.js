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
//https://api.github.com/repos/SFoskitt/VivaciousViscachas
//https://api.github.com/repos/SFoskitt/Glamorous-Gerbils
//https://api.github.com/repos/BraveBravos/CodeColab
  var tmp = 'BraveBravos/CodeColab';
  var base = 'https://api.github.com/repos/';
  var branches = '/branches'
  var contents = '/contents'
  console.log("concat url ", base + tmp + branches) 
  $http.get(base + tmp + contents)
  // $http.get('/api/fileStruct')
    .success(function(data) {
			console.log("data in fileStructCtrl is", data)
    })
    .error(function(err) {
      console.log("2nd attempt at url concat ", base + tmp)
			console.log("error in fileStructCtrl is ", err)
    });

});

