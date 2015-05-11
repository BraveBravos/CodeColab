angular.module('codeColab.fileStruct', [])

.factory ('FileStructDo', function ($http){

  var getTree = function ($scope, repoName) {

    var repo = repoName.name.split('/')
    return $http({
      method: 'POST',
      url: '/api/fileStruct/tree',
      data: {repo: repo}
    })
    .then(function (data) {
    // console.log("BIG TREE BODY FROM SERVER ", data.data)
    var bigTree = data.data;
    var tree = {};

    // operate on each of the objects in the data.data array
    bigTree.forEach(function(item) {

      if (item.type === 'tree' || item.path.lastIndexOf('/')===-1) {
        tree[item.path] = {top:true, fullPath: item.path, label:item.path, id:item.sha, url:item.url, collapsed:true, children:[]}
      }

      var divider = item.path.lastIndexOf('/');

      if(divider<0){return}

      var path = item.path.slice(0,divider)

      if (item.type === 'tree') {
        tree[path].children.push(tree[item.path])
        tree[item.path].top=false
      } else {

        var fullPath = item.path
        item.path=item.path.slice(divider+1)
        tree[path].children.push({label:item.path, fullPath: fullPath, url:item.url, id:item.sha, children:[]})
      }
    })

  var results = []

  // parses tree.path into a node label when node is not a "top"
  for (var q in tree) {
    if (!tree[q].top) {
      tree[q].label = tree[q].label.slice(tree[q].label.lastIndexOf('/')+1)
    }
  }

  // indicate node is either folder or file for sorting in the template
  // what if the folder is empty?  -AG
  for (var q in tree){
    if (tree[q].children.length === 0){
      tree[q].type = 'file'
    } else {
      tree[q].type = 'folder'
    }
  }

  // push node to results
  for (var q in tree) {
    if (tree[q].top) {
      results.push(tree[q])
    }
  }

  // console.log('final tree',results)
  $scope.tree = results;
  // return results;

  }) // end of .then(function(bigTree))

}  // end of getTree function


  return { getTree : getTree}

})  // end of FileStructDo factory

.controller('fileStructCtrl', function ($http, $scope, Share){

  $scope.loadFile = function(file){
    Share.loadFile($scope.$parent,file.url, file.id, file.fullPath);
  }
})
