'use strict';

angular.module('codeColab', [
	'codeColab.main',
	'codeColab.services',
  'codeColab.fileStruct',
	'ngRoute',
  'angularTreeview'
	])

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
      templateUrl: '/app/clientAuth/signin.html',
      authenticate: false
    })
    .when ('/main', {
      templateUrl : '/app/main/main.html',
      controller: 'codeCtrl',
      authenticate: true
    })  
    .when ('/about', {
      templateUrl : '/app/about/about.html',
      authenticate: false
    })
		.otherwise({
			redirectTo: '/'
		})
}])
.run(function($rootScope, $location, globalAuth){
  $rootScope.$on('$routeChangeStart', function(event, next){
    $rootScope.path = $location.path();
    globalAuth.checkAuth().then(function(loggedIn){
      if(!loggedIn && next.$$route.authenticate){
        //not logged in and requires auth, redirect to homepage
        $location.path('/');
      } else if(loggedIn && $location.path() === '/'){
        //if loggedin
        $location.path('main');
      }
    });
  });
})


.factory('globalAuth', function($http){
  var checkAuth = function(){
    return $http({
      method: 'GET',
      url: '/api/auth'
    }).then(function(res){
      return JSON.parse(res.data);
    });
  };

  return {checkAuth: checkAuth};
})