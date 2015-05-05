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
  //https://api.github.com/repos/BraveBravos/CodeColab/git/trees/0c7c0ec2bba26acc8e8b69a1ca242931610abf79?recursive=1
  var base = 'https://api.github.com/repos'
  var owner = '/BraveBravos'
  var repo = '/CodeColab'
  var more = '/git/trees/'
  var sha = '0c7c0ec2bba26acc8e8b69a1ca242931610abf79'
  var last = '?recursive=1'
  var concat = base + owner + repo + more + sha + last
  var tree = [];
  // console.log("concat url ", concat) 

  $http.get(concat)
  // $http.get('/api/fileStruct')  <-- this should be the better way to do it but doesn't work this way on localhost
    .success(function(data) {
      tree = data.tree;
      // console.log("this is the tree ", tree)
    })
    .error(function(err) {
      console.log("2nd attempt at url concat ", base + tmp)
			console.log("error in fileStructCtrl is ", err)
    });

  $scope.tree = tree;
 

});

