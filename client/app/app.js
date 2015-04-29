angular.module('codeColab', [
	'codeColab.main',
	'codeColab.services',
	'ngRoute'
	])

.config(function ($routeProvider) {
	$routeProvider
		.when ('/main', {
			templateUrl : '/app/main/main.html',
			controller: 'codeCtrl'
		})

		.otherwise({
			redirectTo: '/main'
		})
})
