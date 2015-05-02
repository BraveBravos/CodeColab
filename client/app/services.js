angular.module('codeColab.services', [])


.factory('Share', function ($http) {

var loadShare = function ($scope) {

    var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'', //this contains the original code
      'value':'',      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true
    })

    var ws = new WebSocket('wss://' + window.location.host)

    var sjs = new window.sharejs.Connection(ws)

    // not sure how this should work with mongo
    var doc = sjs.get('users','test')

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

  var sendFile = function ($scope, doc) {
    return $http ({
      method: 'POST',
      url: '/api/documents',
      data: {doc: doc}
    });
  }

  var loadFile = function($scope) {
    return $http ({
      method: 'GET',
      url: '/api/documents',
    })
    .then (function (doc) {
      console.log('left',doc.data.left)
      console.log('right',doc.data.right)
      $scope.doc = doc.data;
      $scope.cm.editor().setValue($scope.doc.left);
      $scope.cm.rightOriginal().setValue($scope.doc.right);

    });
  }

  var logout = function () {
    return $http({
      method: 'GET',
      url: '/logout'
    })
  }

  return {
    loadShare: loadShare,
    sendFile: sendFile,
    loadFile: loadFile,
    logout:logout
  }
})
.factory('FileStruct', function(){

  var fileStruct = function ($scope){

  };
  return {
    fileStruct: fileStruct
  }
})



