angular.module('codeColab.services', [])


.factory('Share', function ($http) {

var loadShare = function ($scope) {

    var codeEditor = CodeMirror.MergeView(document.getElementById('area'), {
      'origRight':'testing\n\nmore stuff', //this contains the original code
      'value':'other',      //this will be the updated value with the users' changes
      'theme':'erlang-dark',
      lineNumbers: true,
      // readOnly: 'nocursor',
      // showCursorWhenSelecting: false
    })

    //need to finish importing all of the sublime shortcuts and whatnot: http://codemirror.net/doc/manual.html#addons

    // this is the syntax needed for .getValue and .setValue.  rightOriginal, leftOriginal, and editor are all
    // of the possible CodeMirror instances; we only use editor and rightOriginal in our version right now.
    console.log('editor: ',codeEditor.editor().getValue(),"\n",'original: ',codeEditor.rightOriginal().getValue())
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
  return {
    loadShare: loadShare,
    sendFile: sendFile
  }
})


.factory('Auth', function(){
  var signin = function (user) {
    // return $http({
    //   method: 'POST',
    //   url: '/api/users/signin',
    //   data: user
    // })
    // .then(function (resp) {
    //   return resp.data.token;
    // });
  console.log('signin!')
  };

  return {
    signin: signin
  }

})









