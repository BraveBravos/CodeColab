angular.module('codeColab.services', [])


.factory('Share', function ($http, $window, $location, $q, $timeout) {
  var path;
  var ce;

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

  var commit = function(message, repo, file, $scope){
    var content = ce.editor().getValue(),
        path = file.fullPath,
        sha = file.sha;
    return $http({
      method: 'POST',
      url: '/api/repos',
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
        $scope.currentFile.sha = response.data;
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

  var loadRepoShare = function($scope) {
    if($scope.repoShare) {
      $scope.repoShare.rDoc.unsubscribe()
      $scope.repoShare.rSjs.disconnect()

      //probably should move these context destroy operations into a separate function.
      $scope.repoShare.editingCxt.destroy()
      $scope.origTextTrigger.destroy()
      $scope.treeStructure.destroy()
      $scope.commitAndMergeIndicators.destroy()
      // $scope.CM.rightOriginal().detachShareJsDoc()
    }

    var rSocket = new BCSocket(null, {reconnect: true});
    var rSjs = new sharejs.Connection(rSocket);

    //need to hash this in the server in some way, for unique encrypted storage
    //need to switch this to origDocs eventually
    var rDoc = rSjs.get('adamShareTest', $scope.selected);
    
    $scope.repoShare = {rDoc: rDoc, rSjs: rSjs}

    rDoc.subscribe()

    rDoc.whenReady(function() {

      if (!rDoc.type) {
        //create json instead of text
        rDoc.create('json0')

        //need to do a submit op to 'seed' the json structure - this line will be changed if we want to add more stuff
        rDoc.submitOp([{p:[],od:null,oi:{origTextTrigger:[0],treeStructure:[0],commitAndMergeIndicators:{'commit':false,'merge':false}}}]) // might use set here instead
        
      }

      rDoc.subscribe(function(err) {

        //create new context for editor, tree, commit, and merge (maybe cursors and user list later on) to listen to
        //we could probably create indicators to display which files have been changed/not committed, or are being worked in
        $scope.repoShare.editingCxt = rDoc.createContext()
        $scope.origTextTrigger = $scope.repoShare.editingCxt.createContextAt('origTextTrigger')
        $scope.treeStructure = $scope.repoShare.editingCxt.createContextAt('treeStructure')
        $scope.commitAndMergeIndicators = $scope.repoShare.editingCxt.createContextAt('commitAndMergeIndicators')

        //set variables that we will eventually watch for displaying commit/merge buttons
        $scope.commitInd = $scope.commitAndMergeIndicators.get().commit
        $scope.mergeInd = $scope.commitAndMergeIndicators.get().merge

        addRepoEventListeners($scope)

      })

    })

  }

  var updateRightOrigValue = function($scope, branch) {

    // if($scope.right) {
    //   $scope.right.rDoc.unsubscribe()
    //   $scope.right.rSjs.disconnect()
      // $scope.CM.rightOriginal().detachShareJsDoc()
    // }

    //just set value of rightOrig
    return $http ({
      method:'POST',
      url: '/api/getUpdatedFile',
      data: {
        filePath: $scope.currentFile.fullPath,
        ownerAndRepo: $scope.selected,
        branch: branch
      }
    })
    .then (function (data) {
      // var newRight = CodeMirror.Doc(data.data.file,'javascript')
      // $scope.CM.rightOriginal().swapDoc(newRight)
      $scope.CM.rightOriginal().setValue(data.data.file)
    });
  }

  var resetCM = function($scope) {
    if($scope.share) {
      $scope.share.doc.unsubscribe()
      $scope.share.sjs.disconnect()
      $scope.CM.editor().detachShareJsDoc()
      // $scope.repoShare.rDoc.unsubscribe()
      // $scope.repoShare.rSjs.disconnect()
      // $scope.CM.rightOriginal().detachShareJsDoc()
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
    }

    var socket = new BCSocket(null, {reconnect: true});
    var sjs = new sharejs.Connection(socket);
    var doc = sjs.get('documents', id);

    doc.subscribe()

    doc.whenReady(function() {
      if (!doc.type) {
        doc.create('text');
      }

      doc.subscribe(function(err) {

        //this is the new doc - we need to use a doc for a swap
        var newEditor = doc.getSnapshot()==='' ? CodeMirror.Doc(data,'javascript') : CodeMirror.Doc(doc.getSnapshot(),'javascript')

        // $scope.CM.editor().setValue(newEditor.getValue())
        $scope.CM.editor().swapDoc(newEditor)

        // $scope.CM.rightOriginal().setValue(data);
        doc.attachCodeMirror($scope.CM.editor())

        // probably some more efficient way to do this, but it works for now - if doc exists in
        // origDocs database but not in regular Docs database, this will copy the string into the editor immediately after
        // the subscription takes hold, which also copies it into the Docs database.
        // need to verify that this part still works
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

  var addRepoEventListeners = function($scope) {
    //create event listeners for each of the variables/contexts set upon repo selection/change
    $scope.treeStructure.on('replace', function() { 
      //had to use timeout so that angular knows to render the scope change next chance it gets
      $timeout(function() {
        $scope.$parent.tree = JSON.parse($scope.treeStructure.get()[0])
        // $scope.$apply() - not needed for now
      })
    })

    //more work needed here
    $scope.commitAndMergeIndicators.on('replace', function() {
      // console.log('c/m replaced')
      $timeout(function() {
        $scope.commitInd = $scope.commitAndMergeIndicators.get().commit
        $scope.mergeInd = $scope.commitAndMergeIndicators.get().merge
      })
    })

    $scope.origTextTrigger.on('replace', function() {
      //$scope.currentFile is only set when a file is picked - if a repo is chosen but no file is entered, this was causing errors before
      if(!!$scope.currentFile) {
        updateRightOrigValue($scope,'master')
      }
    })

  }

  var loadFile = function ($scope, file) {
    $scope.$parent.currentFile = file;

    return $http ({
      method:'POST',
      url: '/api/files',
      data: {
        url: file.url,
        fileId: file.id
      }
    })
    .then (function (data) {
      $scope.$parent.fileLoaded = true;
      $scope.$parent.currentFile.sha = data.data.fileSha;
      // console.log('fileSha: ',data.data.fileSha)
      loadShare($scope, file.id, data.data.file)
      updateRightOrigValue($scope,'master')
    });
  }

  var checkForApp = function($scope, repo) {
    var that = this;
    return $http({
      method : 'GET',
      url: '/api/apps/'+repo
    })
      .then (function(response){
        if (response.data === false) {
          if($scope.deployApp) {
            $scope.deployApp();
          }
        } else {
          $scope.deploying=true;
         that.rebuild($scope, repo)
        }
      })
  }

  var showLog = function (name, repo, buildId) {
    var appURL ='https://'+name+'.herokuapp.com';
    var buildId = buildId? '/'+buildId : '';
    return $http({
      method: "GET",
      url: 'api/deploy/'+ repo + buildId
    })
    .then (function (response){
      $location.path('/');
      var re = /\n/g;
      var log = response.data.replace(re, '<br>')
      bootbox.alert("Heroku Build Log<br>"+ log, function () {
        return;
      });
      $window.open(appURL)
    })
  }

  var deployApp = function($scope, name){
    var repo = localStorage.repo,
        that = this;
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
      } else if (name === 'creditLimit') {
        bootbox.alert("Heroku will not let you create any more apps without a credit card number. Please resolve with Heroku and try again.", function() {
          $scope.first = true;
          $location.path('/');
        })
      } else {
        that.showLog(name, repo);
      }
    })
  }


  var rebuild = function($scope, repo) {
    var that = this;
    return $http({
      method: 'POST',
      url: '/api/builds',
      data: {
        repo: repo
      }
    })
    .then (function (response) {
      if ($location.path() === '/deploy') {
        $scope.deploy = "building!";
        var name = response.data.name;
        var buildId = response.data.buildId;
        that.showLog(name, repo, buildId);
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
          that.checkForApp($scope, repo)
          updateRightOrigValue($scope,'master')
          $scope.triggerRightShareUpdate()
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
    checkForApp: checkForApp,
    deployApp: deployApp,
    rebuild: rebuild,
    showLog: showLog,
    checkName: checkName,
    mergeBranch: mergeBranch,
    loadRepoShare: loadRepoShare,
    updateRightOrigValue: updateRightOrigValue,
    addRepoEventListeners: addRepoEventListeners
  }
})




