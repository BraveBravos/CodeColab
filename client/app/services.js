angular.module('codeColab.services', [])


.factory('Share', function ($http) {

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

  var commit = function(message){
    var message=message;
    var parents;
    var tree;

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


var loadShare = function ($scope) {
    var repo = $scope.selected;
    console.log('repp', repo)

    var socket = new BCSocket(null, {reconnect: true});
    console.log('socket',socket)
    var sjs = new sharejs.Connection(socket);
    var doc = sjs.get('documents', repo);
    // var doc = sjs.get('documents',undefined,repo,function(error,doc){
    //   console.log('opened',doc)
    //   doc.subscribe()
    //   doc.attachCodeMirror(codeEditor.editor())
    //   codeEditor.editor().setValue(doc.snapshot || 'test')
    // })
    console.log('doc',doc)
    doc.subscribe()
    // var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
    //   'origRight':'', //this contains the original code
    //   'value':'',      //this will be the updated value with the users' changes
    //   'theme':'erlang-dark',
    //   lineNumbers: true
    // })
    doc.whenReady(function() {
      if (!doc.type) {console.log('created');doc.create('text')}

      var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'', //this contains the original code
      'value':doc.getSnapshot(),      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true
      })
      console.log(codeEditor)


      // else {console.log('found',doc.snapshot)}
      // this check is probably not necessary
      // if (doc.type && doc.type.name === 'text')
      // this updates the CodeMirror editor window
      console.log('ready')
      doc.subscribe(function(err) {
        console.log('subscribed',doc.getSnapshot())
        codeEditor.editor().setValue(doc.getSnapshot() || 'test')
        // codeEditor.editor().save()
        doc.attachCodeMirror(codeEditor.editor())
        console.log('after subscribed',doc.getSnapshot(),codeEditor.editor().getValue())
        
      });
    });
    //   doc.fetch(function(err) {
    //     console.log('fetched')
    //   })
    // })
    // codeEditor.editor().setValue(doc.snapshot)

      // doc.fetch(function(err) {
      //   console.log('fetched')
      //   doc.subscribe(function(err) {
      //   doc.attachCodeMirror(codeEditor.editor())
      //   codeEditor.editor().setValue(doc.snapshot || 'test')
      //   })
      // })
    //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

    // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
    // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
    // console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
    // codeEditor.editor().setValue('this is a test')
    return {doc:doc,socket:socket}
    // return codeEditor
  }

  return {
    getRepos : getRepos,
    loadShare: loadShare,
    commit: commit
  }
})

.factory('FileStruct', function(){

  var fileStruct = function ($scope){
  
  };

  return {
    fileStruct: fileStruct
  }
})









