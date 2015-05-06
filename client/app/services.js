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
    var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'', //this contains the original code
      'value':'',      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true
    })

    var socket = new BCSocket(null, {reconnect: true});
    console.log('socket',socket)
    var sjs = new sharejs.Connection(socket);
    var doc = sjs.get('documents', repo);
    console.log('doc',doc)
    doc.whenReady(function() {
      // codeEditor.editor().setValue('')
      // if doc doesn't exist, create it as text
      if (!doc.type) {console.log('created');doc.create('text')}
      // else {console.log('found',doc.snapshot)}
      // this check is probably not necessary
      // if (doc.type && doc.type.name === 'text')
      // this updates the CodeMirror editor window
      doc.attachCodeMirror(codeEditor.editor())
      codeEditor.editor().setValue(doc.snapshot || 'test')
      doc.subscribe();
    })
    // codeEditor.editor().setValue(doc.snapshot)

    //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

    // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
    // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
    // console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
    // codeEditor.editor().setValue('this is a test')
    return {doc:doc,codeEditor:codeEditor,socket:socket}
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









