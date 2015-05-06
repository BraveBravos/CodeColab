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
  var last = '?recursive=1&access_token=9893007403fdea813ce0479274aed5a892dccdf5' //<<< HEY HEY REMOVE MY KEY LATER - TODO
  var concat = base + owner + repo + more + sha + last
  var tree = {};

  $http.get(concat)
  // $http.get('/api/fileStruct')  <-- this should be the better way to do it but doesn't work this way on localhost
    .success(function(data) {

      bigTree = data.tree;
      console.log("the bigTree is ", bigTree)

            var tree = {};

            bigTree.forEach(function(item) {

               if (item.type === 'tree' || item.path.lastIndexOf('/')===-1) {
                tree[item.path] = {top:true, name:item.path, ID:item.sha, url:item.url, collapsed:true, children:[]}
               }
               var divider = item.path.lastIndexOf('/');
               // var divider = item.path.lastIndexOf('/')
              //  if(divider>0) {
              //   var tmp = item.path.substring(item.path.lastIndexOf('/'));
              //   tree.push({top:false, name:tmp, ID:item.sha, url:item.url, children:[]});
              // }
              if(divider<0){return}
               var path = item.path.slice(0,divider)
               var fileName = item.path.slice(divider+1)
               if (item.type === 'tree') {
                   tree[path].children.push(tree[item.path])
                   tree[item.path].top=false
               } else {
                  // console.log("path", path, "item.path", item.path)
                 //  if (typeof(tree[path]) === 'undefined'){
                 //    tree.push(item.path)
                 // } else {
                    item.path=item.path.slice(divider+1)
                    tree[path].children.push(item.path)
                 // }
               }
            })
            var results = []
            for (var q in tree) {
               if (!tree[q].top) {
                   tree[q].name = tree[q].name.slice(tree[q].name.lastIndexOf('/')+1)
               }
            }
            for (var q in tree) {
               if (tree[q].top) {
                   results.push(tree[q])
               }
            }

            console.log('final tree',results)
            
            $scope.tree = results;


      // bigTree = data.tree;
      // console.log("the bigTree is ", bigTree)
      
      // var tree = {};

      // bigTree.forEach(function(item) {

      //    if (item.type === 'tree' || item.name.lastIndexOf('/')===-1) {
      //     tree[item.path] = {top:true, name:item.path, ID:item.sha, url:item.url, children:[]}
      //    }
      //    var divider = item.path.lastIndexOf('/');
      //    // var divider = item.path.lastIndexOf('/')
      //   //  if(divider>0) {
      //   //   var tmp = item.path.substring(item.path.lastIndexOf('/'));
      //   //   tree.push({top:false, name:tmp, ID:item.sha, url:item.url, children:[]});
      //   // }
      //   if(divider<0){return}
      //    var path = item.path.slice(0,divider)
      //    var fileName = item.path.slice(divider+1)
      //    if (item.type === 'tree') {
      //        tree[path].children.push(tree[item.path])
      //        tree[item.path].top=false
      //    } else {
      //       // console.log("path", path, "item.path", item.path)
      //      //  if (typeof(tree[path]) === 'undefined'){
      //      //    tree.push(item.path)
      //      // } else {
      //         tree[path].children.push(item.path)
      //      // }
      //    }
      // })
      // var results = []
      // for (var q in tree) {
      //    if (tree[q].top) {
      //        results.push(tree[q])
      //    }
      // }

      // console.log('final tree',results)
      
      // $scope.tree = results;










      // bigTree = data.tree;
      // console.log("the bigTree is ", bigTree)
      
      // var tree = {};

      // bigTree.forEach(function(item) {

      //    if (item.type === 'tree' || item.path.indexOf('/') === -1) {
      //     tree[item.path] = {top:true, name:item.path, ID:item.sha, url:item.url, children:[]}
      //    }
      //    var divider = item.type === 'blob' ? item.path.length : item.path.lastIndexOf('/');
      //    // var divider = item.path.lastIndexOf('/')
      //    if(divider<0) {
      //     var tmp = item.path.substring(item.path.lastIndexOf('/'));
      //     tree.push({top:false, name:tmp, ID:item.sha, url:item.url, children:[]});
      //   }
      //    var path = item.path.slice(0,divider)
      //    // var fileName = item.path.slice(divider+1)
      //    if (item.type === 'tree') {
      //        tree[path].children.push(tree[item.path])
      //        tree[item.path].top=false
      //    } else {
      //       console.log("path", path, "item.path", item.path)
      //       if (typeof(tree[path]) === 'undefined'){
      //         tree.push(item.path)
      //      } else {
      //         tree[path].children.push(item.path)
      //      }
      //    }
      // })

      // for (var q in tree) {
      //   //have an else, push to some array(tree)
      //    if (!tree[q].top) {
      //        delete tree[q]
      //    }
      // }

      // console.log('final tree',tree)
      
      // $scope.tree = tree;

/*      
      $scope.roleList1 = [
          { "roleName" : "User", "roleId" : "role1", "children" : [
            { "roleName" : "subUser1", "roleId" : "role11", "children" : [] },
            { "roleName" : "subUser2", "roleId" : "role12", "children" : [
              { "roleName" : "subUser2-1", "roleId" : "role121", "children" : [
                { "roleName" : "subUser2-1-1", "roleId" : "role1211", "children" : [] },
                { "roleName" : "subUser2-1-2", "roleId" : "role1212", "children" : [] }
              ]}
            ]}
          ]},

          { "roleName" : "Admin", "roleId" : "role2", "children" : [] },

          { "roleName" : "Guest", "roleId" : "role3", "children" : [] }
        ];
*/

    // var bigTree = [];

    // for (var i = 0; i < tree.length; i++){

    //   var file = {
    //     "fileName":'',
    //     "ghID": '',
    //     "url": ''
    //     }

    //   var folder = {
    //     "folderName": '',
    //     "ghID": '',
    //     "url": '',
    //     "chilren": []
    //   }
      
    //   var tmp = tree[i].path;
    //   var tmp2 = tmp.split('/');
    //   var tmp3 = tmp2.length-1;

    //   if (tree[i].type === 'tree'){
    //     folder.folderName = tmp2[tmp3];
    //     folder.ghID = tree[i].sha;
    //     folder.url = tree[i].url;
    //     bigTree.push(folder);
    //   }

    //   if (tree[i].type === 'blob'){
    //     file.fileName = tmp2[tmp3];
    //     file.ghID = tree[i].sha;
    //     file.url = tree[i].url;
    //     bigTree.push(file)
    //   }

    //   console.log("bigTree is ", bigTree)
    // }



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

