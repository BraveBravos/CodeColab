angular.module('codeColab', [
	'nomNow.main'
	])

.config(function ($routeProvider) {
	$routeProvider
		.when ('/main', {
			templateURL : 'app/main/main.html',
			controller:'mainCtrl'
		})

		.otherwise({
			redirectTo: '/main'
		})
})