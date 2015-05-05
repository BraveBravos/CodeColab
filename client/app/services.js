angular.module('codeColab.services', [])


.factory('Share', function ($http) {

var getRepos = function ($scope) {
  return $http({
    method: 'GET',
    url: '/api/user'
  })
  .then (function (user) {
    localStorage.id = user.data.id;
    localStorage.token = user.data.token;
    localStorage.username = user.data.username;
    return $http({
      method: 'GET',
      url: 'https://api.github.com/users/'+ localStorage.username+ '/repos',
      headers: {'User-Agent': localStorage.username}
    })
    .then (function (repos) {
      repos.data.forEach(function (repo) {
        $scope.repos.push({name:repo.full_name, id: repo.id})
      })
    })
      .then (function() {
        return $http({
          method: 'GET',
          url: 'https://api.github.com/user/orgs?access_token='+ localStorage.token+ '&type=all'
          // headers: {'User-Agent': localStorage.username}
        })
        .then (function (orgs) {
          var orgList = orgs.data.map(function (org) {
            return org.login;
            console.log('orglist', orgList)
          })
          for (var orgName in orgList) {
            return $http({
              method: 'GET',
              url: 'https://api.github.com/orgs/'+ orgName+ '/repos'
              // headers: {'User-Agent': localStorage.username}
            })
            .then (function (orgRepos) {
              console.log('orgrepos', orgRepos.data)
            })
          }
        })
      })
  })


  // return $http({
  //     method: 'GET',
  //     url: '/api/repos',
  //   })
  //   .then(function (repos) {
  //     $scope.repos = repos.data;
  //     return $http({
  //       method: 'GET',
  //       url: '/api/orgs'
  //     })
  //     .then(function (orgs) {
  //       orgs.forEach(function (org) {
  //         return $http({
  //           method: 'POST',

  //         })
  //       })
  //     })
  //     loadShare($scope)
  //     console.log('repos: ',$scope.repos)
  //   })
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



