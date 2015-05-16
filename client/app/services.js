angular.module('codeColab.services', [])


.factory('Share', function ($http, $window, $location, $q) {
  var path;
  var ce;
  var fileSha;
  var fileUrl,fileId,filePath;
  var globalUrl;
  var globalId;
  var globalPath;

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
            $scope.reposLoaded = true;
          })
        })
      })
    })
  }

  var createBranch = function(repo){
    var deferred = $q.defer();
      deferred.resolve( $http({
          method: 'GET',
          url: '/api/branch/' + repo
      })
      .then (function(exists){
        if (exists.data === false) {
          return $http({
            method: 'POST',
            url: '/api/branch',
            data: {
              repo: repo
            }
          })
          .then(function(branchInfo){
            return(true)  //return ref and sha
          })
        } else {
          return(false);
        }
      }))
      return deferred.promise;
  }

  var commit = function(message, repo, $scope){
    var message = message,
        content = ce.editor().getValue(),
        path = this.path,
        repo = repo,
        sha = this.fileSha;
        // console.log('commit',path,sha)
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
        path:path,
        repo:repo
      }
    })
    .then(function(response){
      if (response.status === 200) {
        bootbox.alert("Commit Successful")
        $scope.commitMade = true;
      }
    })
  }

  var loadCM = function($scope) {
    var target = document.getElementById('area')

    $scope.CM = CodeMirror.MergeView(target, {
      'origRight':'This side is the original version of your file.',
      'value':'Select a repository and a file to start editing.  This side is your working document, where you will make your changes.',
      'theme':'erlang-dark',
      lineNumbers:true,
      'readOnly':true
    })
  }

  var resetRightOrig = function($scope, id, data) {
    // console.log('right: ',id)
    if($scope.right) {
      $scope.right.rDoc.unsubscribe()
      $scope.right.rSjs.disconnect()
      $scope.CM.rightOriginal().detachShareJsDoc()
    }

    var rSocket = new BCSocket(null, {reconnect: true});
    var rSjs = new sharejs.Connection(rSocket);
    var rDoc = rSjs.get('origDocuments', id);
    $scope.right = {rDoc: rDoc, rSjs: rSjs}

    rDoc.subscribe()

    rDoc.whenReady(function() {
      // console.log('rDoc ready')
      if (!rDoc.type) {
        rDoc.create('text')
        // console.log('created')
      }

      rDoc.subscribe(function(err) {
        // console.log('rDoc subscribed: ',rDoc)

        //if doc is new, set value based on GH master so we can update origDocuments collection

        // var newRight = rDoc.getSnapshot()==='' ? CodeMirror.Doc('testing some stuff','javascript') : CodeMirror.Doc('testing some stuff','javascript')
        // console.log('newRight value: ',newRight.getValue())

        // $scope.CM.rightOriginal().swapDoc(newRight)
        // console.log('rightOriginal value: ',$scope.CM.rightOriginal().getValue())

        rDoc.attachCodeMirror($scope.CM.rightOriginal())
        // console.log('rDoc attached: ',rDoc)

        if(rDoc.getSnapshot()==='') {
          //should we run updaterightOrigValue here?
          $scope.CM.rightOriginal().setValue(data)
          // console.log('should be rDoc value: ',$scope.CM.rightOriginal().getValue())
        }

      })
      //so that this only runs after the comp value is retrieved
      loadShare($scope,id,data)
    })

  }

  var updateRightOrigValue = function($scope) {

    if($scope.right) {
      $scope.right.rDoc.unsubscribe()
      $scope.right.rSjs.disconnect()
      $scope.CM.rightOriginal().detachShareJsDoc()
    }

    //just set value of rightOrig
    return $http ({
      method:'POST',
      url: '/api/getUpdatedFile',
      data: {
        filePath: globalPath,
        ownerAndRepo: $scope.selected
      }
    })
    .then (function (data) {
      console.log(data)
      var newRight = CodeMirror.Doc(data.data.file,'javascript')
      // $scope.CM.rightOriginal().setValue(data.data.file)
      $scope.CM.rightOriginal().swapDoc(newRight)
    });
  }

  var resetCM = function($scope) {
    // console.log('reset entered')
    if($scope.share) {
      $scope.share.doc.unsubscribe()
      $scope.share.sjs.disconnect()
      $scope.right.rDoc.unsubscribe()
      $scope.right.rSjs.disconnect()
      $scope.CM.editor().detachShareJsDoc()
      $scope.CM.rightOriginal().detachShareJsDoc()
    }

    // $scope.CM.rightOriginal().setValue('')

    var placeholderDoc = CodeMirror.Doc('Select a file to start editing.  You will make your changes in this editor.','javascript')
    $scope.CM.editor().swapDoc(placeholderDoc)
    $scope.CM.editor().setOption('readOnly', true)

    var placeholderRight = CodeMirror.Doc('This will display the original text.', 'javascript')
    $scope.CM.rightOriginal().swapDoc(placeholderRight)

  }

  var loadShare = function ($scope, id, data) {
    // this fires if we already have an existing doc and connection
    if($scope.share){
      $scope.share.doc.unsubscribe()
      $scope.share.sjs.disconnect()
      $scope.CM.editor().detachShareJsDoc()
      //add stuff for other connection and rightOriginal() here
    }

    var socket = new BCSocket(null, {reconnect: true});
    var sjs = new sharejs.Connection(socket);
    var doc = sjs.get('documents', id);

    doc.subscribe()

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

        // $scope.CM.editor().setValue(newEditor.getValue())
        $scope.CM.editor().swapDoc(newEditor)

        // $scope.CM.rightOriginal().setValue(data);
        doc.attachCodeMirror($scope.CM.editor())

        // probably some more efficient way to do this, but it works for now - if doc exists in
        // origDocs database but not in regular Docs database, this will copy the string into the editor immediately after
        // the subscription takes hold, which also copies it into the Docs database.
        if(doc.getSnapshot()==='') {
          $scope.CM.editor().setValue($scope.CM.rightOriginal().getValue())
        }

        $scope.CM.editor().setOption('readOnly',false)
        // console.log('after subscribed',doc.getSnapshot(),codeEditor.editor().getValue())
        ce = $scope.CM

        //below is for the text editor spinner
        $scope.$parent.$apply(function () {
          $scope.$parent.editorHasLoaded()
        })
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

    $scope.share = {sjs:sjs,doc:doc}
  }

  var loadFile = function ($scope, url, id, path) {
    this.fileUrl = url;
    this.fileId = id;
    this.filePath = path;
    this.path = path
    globalUrl = url
    globalId = id
    globalPath = path
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
      $scope.$parent.fileLoaded = true;
      that.fileSha = data.data.fileSha;
      resetRightOrig($scope, id, data.data.file)
      // loadShare($scope, id, data.data.file)
    });
  }

  var deployApp = function($scope, name){
    var repo = localStorage.repo;
    return $http({
      method: 'POST',
      url: '/api/deploy',
      data: {
        repo: repo,
        name: name
      }
    })
    .then (function(response){
      var name = response.data.name;
      if (name === 'taken') {
        bootbox.alert("That name is already taken.", function () {
          $scope.first = true;
          $scope.deployApp()
        })
      }
      var appURL ='https://'+name+'.herokuapp.com';
      if (name!== 'taken') {
        return $http({
          method: "GET",
          url: 'api/deploy/'+ name
        })
        .then (function (response){
          var re = /\n/g;
          var log = response.data.replace(re, '<br>')
          bootbox.alert("Heroku Build Log<br>"+ log, function () {
            return;
          });
        })
        // $location.path('/');
        // $window.open(appURL)
      }
    })
  }

  var rebuild = function(repo) {
    return $http({
      method: 'POST',
      url: '/api/builds',
      data: {

      }
    })

  }

  var mergeBranch = function(repo, title, comments, $scope) {
    var that = this;
    return $http({
      method: 'POST',
      url: '/api/merge',
      data: {
        repo: repo,
        title: title,
        comments: comments
      }
    })
    .then (function(response) {
      if (response.status === 200) {
        if (response.data === "No commits between master and CODECOLAB") {
          bootbox.alert("You have not committed anything to this branch.");
        } else if (response.data === "A pull request already exists for BraveBravos:CODECOLAB.") {
          bootbox.alert("You have an outstanding pull request on this branch. Please resolve on GitHub.")
        }else {
          bootbox.alert("Merge Successful")
          // $scope.saveRepo({name: $scope.selected})
          // that.loadFile($scope, this.fileUrl, this.fileId , this.filePath)
          updateRightOrigValue($scope, globalUrl, globalId)
        }
      }
    })
  }

  var checkName = function (name) {
    var re = /^[a-z](?:[a-z]|\d|-)*/;
    return re.test(name);
  }


  return {
    getRepos : getRepos,
    loadShare: loadShare,
    commit: commit,
    createBranch: createBranch,
    loadCM: loadCM,
    resetCM: resetCM,
    loadFile: loadFile,
    deployApp: deployApp,
    rebuild: rebuild,
    checkName: checkName,
    mergeBranch: mergeBranch,
    resetRightOrig: resetRightOrig,
    updateRightOrigValue: updateRightOrigValue
  }
})




