angular.module('codeColab', [
	'codeColab.main',
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
