angular.module('codeColab', [
	'codeColab.main',
	'codeColab.services',
	'ngRoute'
	])

.config(function ($routeProvider) {
	$routeProvider
		.when ('/main', {
			templateUrl : '/app/main/main.html',
			controller: 'codeCtrl',
			authenticate: true
		})
		.when('/signin', {
      templateUrl: '/app/clientAuth/signin.html',
      authenticate: false
    })
		.otherwise({
			redirectTo: '/signin'
		})
})
.run(function($rootScope, $location, globalAuth){
  $rootScope.$on('$routeChangeStart', function(event, next){
    $rootScope.path = $location.path();
    globalAuth.checkAuth().then(function(loggedIn){
      if(!loggedIn && next.$$route.authenticate){
        //not logged in and requires auth, redirect to homepage
        $location.path('/');
      } else if(loggedIn && $location.path() === '/'){
        //if loggedin
        $location.path('events');
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