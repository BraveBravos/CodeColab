angular.module('codeColab.services', [])


.factory('Share', function ($http) {

  var getRepos = function ($scope) {
    return $http({

      method: 'GET',
      url: '/api/repos',
    })
    .then(function (repos) {
      // console.log("raw repos ", repos)
      $scope.repos = $scope.repos.concat(repos.data);
      return $http({
        method: 'GET',
        url: '/api/orgs'
      })
      .then(function (orgs) {
        orgs.data.forEach(function (org) {
          return $http({
            method: 'POST',
            url: '/api/orgs/repos',
            data: {org: org}
          })
          .then(function (orgRepos){
            orgRepos.data.forEach(function (orgRepo) {
              $scope.repos.push(orgRepo);

            })
          })
        })
      })
    })
  }

  var createBranch = function(repo){
    // console.log('REPO',repo);
    return $http({
      method: 'POST',
      url: '/branch',
      data: {
        repo: repo
      }
    })
    .then(function(branchInfo){
      console.log('New branch created!')
      return branchInfo  //return ref and sha
    })
  }

  var commit = function(message, ref, sha){
    var message = message;
    var parents; //whut
    var tree = sha

    console.log('inside share.commit()')
    console.log("message", message)
    return $http({
      method: 'POST',
      url: '/api/repos/commit',
      params: {message: message, parents: parents, tree: tree}
    })
    .then(function(response){
      console.log('commiting!')
    })
  }


var loadShare = function ($scope, id, data) {

  var repo = $scope.selected;
  // console.log('repp', repo)


  // this fires if we already have an existing doc and connection
  if($scope.share){
    console.log('disconnecting')
    $scope.share.doc.unsubscribe()
    $scope.share.sjs.disconnect()
  }


  var socket = new BCSocket(null, {reconnect: true});
  // console.log('socket',socket)
  var sjs = new sharejs.Connection(socket);
  var doc = sjs.get('documents', id);

  // console.log('doc',doc)
  doc.subscribe()

  //this is the element we have selected to "turn" into a CodeMirror
  var target = document.getElementById('area')

  // //when we change an element to a CodeMirror, we don't really change it - we actually append
  // //the CodeMirror.  This code deletes any children that already exist.
  // var children = target.getElementsByClassName('CodeMirror-merge')

  var codeEditor = !!$scope.share ? $scope.share.codeEditor : CodeMirror.MergeView(target, {
      'origRight':'', //this will eventually contain the original code
      'value':'',      //this is the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true
    })

  doc.whenReady(function() {
    if (!doc.type) {
      console.log('created');
      doc.create('text');
    }

    //this is the new doc - we need to use a doc for a swap
    var newEditor = CodeMirror.Doc(doc.getSnapshot(),'javascript')
    // $scope.share.codeEditor.editor().swapDoc(newEditor)
    if($scope.share) {
      $scope.share.codeEditor.editor().swapDoc(newEditor)
    } else {
     codeEditor.editor().swapDoc(newEditor)
    }

    console.log('ready')
    doc.subscribe(function(err) {
      // console.log('subscribed',doc.getSnapshot())

        codeEditor.rightOriginal().setValue(data);
          doc.attachCodeMirror(codeEditor.editor())
          codeEditor.editor().setValue(codeEditor.rightOriginal().getValue())
      // console.log('after subscribed',doc.getSnapshot(),codeEditor.editor().getValue())

    });

    // codeEditor.editor().on('change', function(change) {
    //   console.log('changed',change)
    // })
    // codeEditor.editor().on('update', function() {
    //   console.log('updated')
    // })


  });

  //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

  // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
  // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
  // console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
  // codeEditor.editor().setValue('this is a test')

  // return connection and doc, so that we can disconnect from them later if needed
  // otherwise, the connection or doc subscription or both build up and make us unable to fetch other documents
  if($scope.share) {
    return {sjs:sjs,doc:doc,codeEditor:$scope.share.codeEditor}
  }

  return {sjs:sjs,doc:doc,codeEditor:codeEditor}
}
    var loadFile = function ($scope, url, id) {
    return $http ({
      method:'POST',
      url: '/api/files',
      data: {
        url: url,
        fileId: id
      }
    })
    .then (function (data) {
      $scope.share = loadShare($scope, id, data.data.file)
    });


}


  return {
    getRepos : getRepos,
    loadShare: loadShare,
    commit: commit,
    createBranch: createBranch,
    loadFile: loadFile
  }
})




