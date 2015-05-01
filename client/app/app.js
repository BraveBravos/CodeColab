angular.module('codeColab', [
	'codeColab.main',
	'codeColab.services',
	'codeColab.videochat',
	'ngRoute'
	])

.config(function ($routeProvider) {
	$routeProvider
		.when ('/main', {
			templateUrl : '/app/main/main.html',
			controller: 'codeCtrl'
		})
		.when('/signin', {
      templateUrl: '/app/clientAuth/signin.html'
    })
		.otherwise({
			redirectTo: '/signin'
		})
})
