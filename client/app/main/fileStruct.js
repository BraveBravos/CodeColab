angular.module('codeColab.fileStruct', [])

.factory ('FileStructDo', function ($http){

  //toggles the spinner while repo files are loading
  var toggleSpinner = function(spinner){
    if (spinner === false) spinner = true
    else { spinner = false };
    return spinner;
  }

  //gets file/folder names from GitHub for the selected repository
  var getTree = function ($scope, repoName, branch) {
    $scope.spinner = this.toggleSpinner($scope.spinner)

    var that = this,
        repo = repoName.name.split('/');

    return $http({
      method: 'POST',
      url: '/api/fileStruct/tree',
      data: {
        repo: repo,
        branch: branch
      }
    })
    .then(function (data) {

      // console.log("BIG TREE BODY FROM SERVER ", data.data)
      var bigTree = data.data,
          tree = {};

      // operate on each of the objects in the data.data array
      bigTree.forEach(function(item) {

      if (item.type === 'tree' || item.path.lastIndexOf('/')===-1) {
        tree[item.path] = {top:true, fullPath: item.path, sha: item.sha, label:item.path, id:item.id, url:item.url, collapsed:true, children:[]}
      }

      var divider = item.path.lastIndexOf('/');

      if(divider<0){return}

      var path = item.path.slice(0,divider)

      if (item.type === 'tree') {
        tree[path].children.push(tree[item.path])
        tree[item.path].top=false
        tree[item.path].parentLabel=tree[path].label
      } else {
        var fullPath = item.path
        item.path=item.path.slice(divider+1)
        tree[path].children.push({label:item.path, sha: item.sha, fullPath: fullPath, url:item.url, id:item.id, children:[], parentLabel:tree[path].label})
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

  $scope.spinner = that.toggleSpinner($scope.spinner)

  // console.log('final tree',results)
  $scope.tree = results;

  }) // end of .then(function(bigTree))
}  // end of getTree function

  return { getTree : getTree,
            toggleSpinner: toggleSpinner
          }

})  // end of FileStructDo factory


.controller('fileStructCtrl', function ($http, $scope, Share){
  //load file to editor
  $scope.loadFile = function(file){
    $scope.$parent.editorWillLoad()
    Share.loadFile($scope.$parent,file);
  }

  $scope.triggerShareTreeChange = function() {
    $scope.$parent.repoShare.rDoc.submitOp([
      {p:['treeStructure',0],ld:$scope.$parent.repoShare.rDoc.snapshot.treeStructure[0],li:JSON.stringify($scope.tree)}
    ])
  }

  $scope.addFile = function(file,arr){
    return $http({
      method: 'POST',
      url: '/api/files/newFile',
      data: {
        ownerAndRepo: $scope.selected,
        fullPath : file.fullPath
      }
    })
    .then(function(data) {
      //set file.id and file.url here
      //might need to get sha from server
      file.id = data.data.fileId
      file.url = data.data.fileUrl
      arr.push(file)
      // console.log('new file: ',file)

      $scope.triggerShareTreeChange()
    })
  }

  $scope.deleteFile = function(file) {
    //need to make sure sha is supplied when deleting newly-created files
    return $http({
      method: 'POST',
      url: '/api/files/deleteFile',
      data: {
        ownerAndRepo: $scope.selected,
        fullPath: file.fullPath,
        message: 'Deleted '+file.label + '.',
        sha: file.sha
      }
    })
    .then (function() {
      $scope.triggerShareTreeChange()
    })
  }

})









