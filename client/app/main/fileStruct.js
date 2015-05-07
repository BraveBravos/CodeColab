angular.module('fileStruct', [])

.controller('fileStructCtrl', function($scope, $http){

  var base = 'https://api.github.com/repos'
  var owner = '/BraveBravos'
  var repo = '/CodeColab'
  var more = '/git/trees/'
  var sha = '0c7c0ec2bba26acc8e8b69a1ca242931610abf79'
  var last = '?recursive=1&access_token=9893007403fdea813ce0479274aed5a892dccdf5' //<<< HEY HEY REMOVE MY KEY LATER - TODO
  var concat = base + owner + repo + more + sha + last
  var tree = {};

  $http.get(concat)
  // $http.get('/api/fileStruct')  <-- this *IS* the better way to do it but doesn't work this way on localhost
    .success(function(data) {

      bigTree = data.tree;
      // console.log("the bigTree is ", bigTree)

      var tree = {};

      bigTree.forEach(function(item) {

        if (item.type === 'tree' || item.path.lastIndexOf('/')===-1) {
          tree[item.path] = {top:true, label:item.path, id:item.sha, url:item.url, collapsed:true, children:[]}
        }

        var divider = item.path.lastIndexOf('/');

        if(divider<0){return}
        var path = item.path.slice(0,divider)
        if (item.type === 'tree') {
          // console.log('tree[item.path]', tree[item.path])
          tree[path].children.push(tree[item.path])
          tree[item.path].top=false
        } else {
          item.path=item.path.slice(divider+1)
          tree[path].children.push({label:item.path, url: item.url, id: item.sha, children: []})
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

    console.log('final tree',results)
    console.log('filescope', $scope)

    $scope.tree = results;
  })
  .error(function(err) {
		console.log("error in fileStructCtrl is ", err)
  })

  $scope.loadFile = function(file){
    Share.loadFile($scope.$parent,file.url, file.id);
  }
});
.factory ('FileStructGets', function ($http){
  
  var getSHA = function (repoName){
    var repo = repoName.name.split('/')
    console.log("repo in filestruct client is", repo)  
    return $http({
      method: 'POST',
      url: '/api/fileStruct',
      data: {repo: repo}
    })
    .then(/* parse data for repo sha
      and setup variable for next request*/ 
      function(gitHubRefs){
        console.log("refs back from server is ", gitHubRefs)
    })
  // .then(/* setup get request for tree info */)
  // .then(/* send tree info to controller */)



  return {
  getSHA:getSHA,
  getTree:getTree
  }
}
})





