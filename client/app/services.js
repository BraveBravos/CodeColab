angular.module('codeColab.services', [])


.factory('Share', function ($http) {
  var path;
  var ce;
  var fileSha;

  var getRepos = function ($scope) {
    return $http({
      method: 'GET',
      url: '/api/repos',
    })
    .then(function (repos) {
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
      // console.log('New branch created!')
      return branchInfo  //return ref and sha
    })
  }

  var commit = function(message){
    var message = message,
        content = ce.editor().getValue(),
        path = this.path,
        sha = this.fileSha;

    // function utf8_to_b64(str) {
    //   return window.btoa(unescape(encodeURIComponent(str)));
    // }

    return $http({
      method: 'POST',
      url: '/api/repos/commit',
      data: {
        message: message,
        content: content,
        sha:sha,
        path:path
      }
    })
    .then(function(response){
      console.log('commiting successsss!')
      alert('succesful commit!')
    })
  }



  var loadShare = function ($scope, id, data) {

    //this variable just tracks whether a repo file is currently loaded or not.
    var newRepo = !document.getElementById('area').getElementsByClassName('CodeMirror-merge').length
    if(newRepo) {
      delete $scope.share
    }

    // this fires if we already have an existing doc and connection
    if($scope.share){
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

    var codeEditor = !newRepo ? $scope.share.codeEditor : CodeMirror.MergeView(target, {
        'origRight':'', //this will eventually contain the original code
        'value':'',      //this is the updated value with the users' changes
        'theme':'erlang-dark',
        lineNumbers: true
      })

    doc.whenReady(function() {
      if (!doc.type) {
        // console.log('created');
        doc.create('text');
      }

      // console.log('ready')
      doc.subscribe(function(err) {
        // console.log('subscribed')

        //this is the new doc - we need to use a doc for a swap
        var newEditor = doc.getSnapshot()==='' ? CodeMirror.Doc(data,'javascript') : CodeMirror.Doc(doc.getSnapshot(),'javascript')

        if(!!$scope.share) {
          $scope.share.codeEditor.editor().setValue(newEditor.getValue())
          $scope.share.codeEditor.editor().swapDoc(newEditor)
        } else {
          codeEditor.editor().setValue(newEditor.getValue())
          codeEditor.editor().swapDoc(newEditor)
        }

        codeEditor.rightOriginal().setValue(data);
        doc.attachCodeMirror(codeEditor.editor())

        // probably some more efficient way to do this, but it works for now - if doc exists in
        // origDocs database but not in regular Docs database, this will copy the string into the editor immediately after
        // the subscription takes hold, which also copies it into the Docs database.
        if(doc.getSnapshot()==='') {
          codeEditor.editor().setValue(codeEditor.rightOriginal().getValue())
        }
        // console.log('after subscribed',doc.getSnapshot(),codeEditor.editor().getValue())
        ce = codeEditor
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
      $scope.share = {sjs:sjs,doc:doc,codeEditor:$scope.share.codeEditor}
    }

    $scope.share = {sjs:sjs,doc:doc,codeEditor:codeEditor}
  }


    var loadFile = function ($scope, url, id, path) {
    this.path = path
    var that = this;

    return $http ({
      method:'POST',
      url: '/api/files',
      data: {
        url: url,
        fileId: id
      }
    })
    .then (function (data) {
      that.fileSha = data.data.fileSha;
      loadShare($scope, id, data.data.file)
    });
  }
  var deployApp = function(repo){
    console.log('deploying')
    return $http({
      method: 'GET',
      url: '/auth/heroku'
    })
    .then (function(data){
      console.log('Deployed!')
    })
  }

  return {
    getRepos : getRepos,
    loadShare: loadShare,
    commit: commit,
    createBranch: createBranch,
    loadFile: loadFile,
    deployApp: deployApp
  }
})




