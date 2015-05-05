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
      $scope.tree = tree;
      console.log("this is the tree ", tree)

    /*      
      {top level folder, 
        [children folders],
        other top level folder, 
          [children folders
            [children of first child folder], 
            [second child of children folders]
          ]
      }
    */
    var bigTree = [];
    var recurse = function(){
    for (var i = 0; i < tree.length; i++){

      var file = {
        "fileName":'',
        "ghID": '',
        "url": ''
        }

      var folder = {
        "folderName": '',
        "ghID": '',
        "url": '',
        "chilren": []
      }
      
      var tmp = tree[i].path;
      var tmp2 = tmp.split('/');
      var tmp3 = tmp2.length-1;

      if (tree[i].type === 'tree'){
        folder.folderName = tmp2[tmp3];
        folder.ghID = tree[i].sha;
        folder.url = tree[i].url;
        bigTree.push(folder);
      }

      if (tree[i].type === 'blob'){
        file.fileName = tmp2[tmp3];
        file.ghID = tree[i].sha;
        file.url = tree[i].url;
        bigTree.push(file)
      }

      console.log("bigTree is ", bigTree)
    }
  }  /*<--- ends func(recurse)*/







      // for (var j = 0; j < tree.length; j++){
      //   console.log("tree[j]", tree[j])
      //   var obj = {one: {two: ''}};
      //   var str = tree[j].path;
      //   console.log("tree", tree)
      //   console.log("str", str)

      //   if(tree[j].type === 'tree'){

      //   var arr = str.split('/') //['one','two','three']
      //   console.log("arr is ", arr)
      //   var objPath = 'obj'
        
      //   for (var i = 0; i < arr.length-1; i++) {
      //      objPath+='["'+arr[i]+'"]'
      //     //objPath = 'obj["one"]["two"]'
      //     console.log("objPath = ", objPath)
      //   }

      //   objPath+='="'+arr[arr.length-1]+'"'
      //   //objPath = 'obj["one"]["two"]=three'

      //   eval(objPath) //sets obj.one.two to "three"
      //   console.log('objPath', objPath)
      // }
      // }
    })
    .error(function(err) {
      // console.log("2nd attempt at url concat ", base + tmp)
			console.log("error in fileStructCtrl is ", err)
    });

 

});

