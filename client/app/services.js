angular.module('codeColab.services', [])


.factory('Share', function ($http) {

var getRepos = function ($scope) {
  console.log('getRepos')
  // var q =   $http({
  //     method: 'GET',
  //     url: '/api/repos',
  //   }).success(
  //   function(repos) {
  //     console.log('test')
  //     return repos
  //   });

  // console.log('q is ',q)


  return $http({
      method: 'GET',
      url: '/api/repos',
    })
    .then(function (repos) {
      console.log('promise fired')
      // console.log('userid', userID)
      $scope.repos = repos;
      loadShare($scope)
      console.log('repos: ',$scope.repos)
      // return userID
    })
    // .then (function (userID) {
    //   return $http({
    //     method: 'GET',
    //     url: 'https://api.github.com/users/'+userID+'/repos'
    //   })
    //   .then (function(repos) {
    //     console.log('repos: ',repos)
    //     return {userID:userID,repos:repos}
    //   })
    // })
  }


var loadShare = function ($scope) {
    var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'', //this contains the original code
      'value':'',      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true
    })

    var socket = new BCSocket(null, {reconnect: true});
    var sjs = new sharejs.Connection(socket);
    console.log('shareid', $scope.githubId);
    var doc = sjs.get('documents','test')
    doc.subscribe();
    doc.whenReady(function() {
      // if doc doesn't exist, create it as text
      if (!doc.type) doc.create('text')
      // this check is probably not necessary
      if (doc.type && doc.type.name === 'text')
      // this updates the CodeMirror editor window
      doc.attachCodeMirror(codeEditor.editor())
    })

    //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

    // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
    // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
    // console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
    // codeEditor.editor().setValue('this is a test')
    return codeEditor
  }



  return {
    getRepos : getRepos,
    loadShare: loadShare,
  }
})
.factory('FileStruct', function(){

  var fileStruct = function ($scope){

  };
  return {
    fileStruct: fileStruct
  }
})



