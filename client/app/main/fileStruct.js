angular.module('codeColab.fileStruct', [])

.factory ('FileStructDo', function ($http){

  var toggleSpinner = function(spinner){
    if (spinner === false) spinner = true
    else { spinner = false };
    return spinner;
  }

  var getTree = function ($scope, repoName, branch) {
    $scope.spinner = this.toggleSpinner($scope.spinner)
    var that = this;
    var repo = repoName.name.split('/')
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
  for (var q in tree){
    //what if it's an empty folder?
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
  // return results;

  }) // end of .then(function(bigTree))

}  // end of getTree function

  return { getTree : getTree,
            toggleSpinner: toggleSpinner
          }

})  // end of FileStructDo factory


.controller('fileStructCtrl', function ($http, $scope, Share){

  var fileSignal = new Firebase('https://glaring-fire-1858.firebaseio.com/filesignal');

  $scope.loadFile = function(file){
    console.log('loadFile: ',file)
    $scope.$parent.editorWillLoad()
    Share.loadFile($scope.$parent,file.url, file.id, file.fullPath);
  }

  $scope.addFile = function(file,arr){
    // console.log('addFile tree: ',$scope.tree)
    // console.log('selected repo: ',$scope.selected, $scope.selected.slice($scope.selected.lastIndexOf('/')+1), $scope.selected.slice(0,$scope.selected.lastIndexOf('/')))
    return $http({
      method: 'POST',
      url: '/api/files/newFile',
      data: {
        repo: $scope.selected.slice($scope.selected.lastIndexOf('/')+1),
        owner: $scope.selected.slice(0,$scope.selected.lastIndexOf('/')),
        fullPath : file.fullPath
      }
    })
    .then(function(data) {
      console.log(data)
      //set file.id and file.url here - data.data.whatever
      file.id = data.data.content.sha
      file.url = data.data.content.git_url
      arr.push(file)
      //console.log('$scope.addFile sanitizeArrayObjects',sanitizeArrayObjects(arr))
      console.log('$scope.addFile sanitizeArrayObjects($scope.$parent.tree)',sanitizeArrayObjects($scope.$parent.tree))
      //fileSignal.set(sanitizeArrayObjects($scope.$parent.tree));
    })
  }

  $scope.addFolder = function(file,arr){
    // file.testing=5
    // console.log('addFile tree: ',$scope.tree)
    // console.log('selected repo: ',$scope.selected, $scope.selected.slice($scope.selected.lastIndexOf('/')+1), $scope.selected.slice(0,$scope.selected.lastIndexOf('/')))
    return $http({
      method: 'POST',
      url: '/api/files/newFile',
      data: {
        repo: $scope.selected.slice($scope.selected.lastIndexOf('/')+1),
        owner: $scope.selected.slice(0,$scope.selected.lastIndexOf('/')),
        fullPath : file.fullPath
      }
    })
    .then(function(data) {
      console.log(data)
      //set file.id and file.url here - data.data.whatever
      file.id=5555555
      file.url='test.com'
      arr.push(file)
      console.log(file)
    })
  }

  var sanitizeArrayObjects = function(arrayObjs){
    var res = []
    for(var i = 0;i < arrayObjs.length;i++){
      res.push(transformObj(arrayObjs[i]));
    }  
    return res;
  }

  var transformObj = function(obj){
      var temp = {};
      var keys = Object.keys(obj);
      for(var n = 0;n < keys.length;n++){
        var keyName = keys[n].replace('$$','');
        if(keyName === 'children'){
          console.log('transformObj keyName',keyName)
          temp[keyName] = sanitizeArrayObjects(obj[keys[n]]);
        }
        if(typeof obj[keys[n]] === 'undefined'){
          temp[keyName] = 'undefined';
        }else{
          temp[keyName] = obj[keys[n]];  
        }
      }
      return temp;
  }

})
