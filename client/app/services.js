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


var loadShare = function ($scope) {
  var repo = $scope.selected;
  // console.log('repp', repo)

  var socket = new BCSocket(null, {reconnect: true});
  // console.log('socket',socket)
  var sjs = new sharejs.Connection(socket);
  var doc = sjs.get('documents', repo);

  // console.log('doc',doc)
  doc.subscribe()

  //this is the element we have selected to "turn" into a CodeMirror
  var target = document.getElementById('area') 
  
  //when we change an element to a CodeMirror, we don't really change it - we actually append
  //the CodeMirror.  This code deletes any children that already exist.
  var children = target.getElementsByClassName('CodeMirror-merge')
  if(!!children.length) {
    // target.removeChild(children[0]) //there should only ever be one of these
    var cache = $scope.editor
    // console.log('swap?',cache)
    doc.whenReady(function() {
      var t = CodeMirror.Doc(doc.getSnapshot(),'javascript')
      // console.log('t',t)
      cache.editor().swapDoc(t)
      console.log('editor',cache.editor().getValue())
      // return cache
      
    })
    return cache
  }

  var codeEditor = CodeMirror.MergeView(target, {
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

    // var codeEditor = CodeMirror.MergeView(target, {
    //   'origRight':'', //this will eventually contain the original code
    //   'value':doc.getSnapshot(),      //this is the updated value with the users' changes
    //   'theme':'erlang-dark',
    //   lineNumbers: true
    // })
    
    console.log('ready')
    doc.subscribe(function(err) {
      // console.log('subscribed',doc.getSnapshot())

      // instead of deleting and re-adding editors, it might be possible
      // to do a swapDoc from CodeMirror.
      doc.attachCodeMirror(codeEditor.editor())
      // console.log('after subscribed',doc.getSnapshot(),codeEditor.editor().getValue())
      
    });
      
    // codeEditor.editor().on('change', function(change) {
    //   console.log('changed',change)
    // })
    // codeEditor.editor().on('update', function() {
    //   console.log('updated')
  })

  //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

  // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
  // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
  // console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
  // codeEditor.editor().setValue('this is a test')
  // console.log('returned',codeEditor)
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



