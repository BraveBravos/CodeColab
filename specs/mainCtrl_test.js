describe('codeCtrl', function(){
	var $scope, $location, Share, createController, FileStructDo;

	// using angular mocks, we can inject the injector
	// to retrieve our dependencies
	beforeEach(module('codeColab'));

	beforeEach(inject(function ($injector){
		$scope = $injector.get('$scope');
		  // mock out our dependenciesd
		  // $rootScope = $injector.get('$rootScope');
		  $location = $injector.get('$location');
		  // $window = $injector.get('$window');
		  // $httpBackend = $injector.get('$httpBackend');
		  $scope = $rootScope.$new();

		  // var $controller = $injector.get('$controller');

		  // used to create our AuthController for testing
		  createController = function () {
		    return $controller('codeCtrl', {
		      $scope: $scope,
		      // $window: $window,
		      $location: $location,
		      FileStructDo: FileStructDo
		    });
		  };

	  createController();
	}));

	it('should have a init method', function() {
	  expect($scope.init).to.be.a('function');
	});

	it('should have a createBranch method', function() {
	  expect($scope.createBranch).to.be.a('function');
	});

	it('should have a saveRepo method', function() {
	  expect($scope.saveRepo).to.be.a('function');
	});

	it('should have a commitModal method', function() {
	  expect($scope.commitModal).to.be.a('function');
	});

	it('should have a deployApp method', function() {
	  expect($scope.deployApp).to.be.a('function');
	});

});


// angular.module('codeColab.main', [])

// .controller('codeCtrl', function ($scope, $location, Share, FileStructDo) {
//   $scope.fileStruct = {url: "app/main/fileStruct.html"};
//   $scope.videochat = {url : "app/videochat/videochat.html"};
//   $scope.modalShown = false;
//   $scope.repos = [{name:'Select a Repository'}];
//   $scope.selectRepo = "";

//   $scope.init = function () {
//     Share.getRepos($scope);
//     Share.loadCM($scope);
//   }

//   $scope.createBranch = function(){
//     //save ref and sha to use in commit
//     Share.createBranch($scope.selected).then(function(branch) {
//       // console.log("Got branch info:", branch)
//       $scope.ref = branch.ref;
//       $scope.sha = branch.sha;
//     })
//   }

//   $scope.saveRepo = function(repo) {
//     $scope.selected = repo.name;
//     Share.resetCM($scope)
//     // FileStructDo.getTree(repo)
//     if (!$scope.ref) {
//       var branch = 'master'
//     } else {
//       var branch = 'CODECOLAB'
//     }
//     FileStructDo.getTree($scope, repo, branch)

//     if(!$scope.ref) {
//       $scope.createBranch()
//     }
//   }

//   $scope.check = function(){
//     return !!($scope.selected)
//   }

//   $scope.mergeModal = function(){
//     bootbox.form({
//       title: "Please enter your pull request info",
//       fields: {
//         pullTitle: {
//           label: 'Title:',
//           value: '',
//           type: 'text'
//         },
//         comments: {
//           label: 'Comments:',
//           value: '',
//           type: 'textarea'
//         }
//       },
//       callback: function(values) {
//         Share.mergeBranch($scope.selected, values.pullTitle, values.comments, $scope)
//       }
//     });
//   }

//   $scope.commitModal = function() {
//     bootbox.prompt("Please enter your commit message:", function (result) {
//       Share.commit(result, $scope.selected, $scope);
//     })
//   }

//   $scope.deployApp = function(){
//     var validName = false;
//     var first = true;
//     while (!validName) {
//       if (first) {
//         var name = prompt("What would you like to name your app?")
//         first = false;
//       } else {
//         var name = prompt("Valid Heroku app names must start with a letter and can only contain lowercase letters, numbers,\
//          and dashes. Please enter a valid name.")
//       }
//       validName = Share.checkName(name);
//     }
//       Share.deployApp($scope, $scope.selected, name);
//   }


//   $scope.init();
// })
