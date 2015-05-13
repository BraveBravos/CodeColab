describe('Routing', function () {
  var $route;
  beforeEach(module('codeColab'));

  beforeEach(inject(function($injector){
    $route = $injector.get('$route');
  }));

//   it('Should have / route and template', function () {
//     expect($route.routes['/']).to.be.ok();
//     expect($route.routes['/'].templateUrl).to.be('/app/clientAuth/signin.html');
//   });

//   it('Should have /main route, template, and controller', function () {
//     expect($route.routes['/main']).to.be.ok();
//     expect($route.routes['/main'].controller).to.be('codeCtrl');
//     expect($route.routes['/main'].templateUrl).to.be('/app/main/main.html');
//   });

//   it('Should have /about route, template, and controller', function () {
//     expect($route.routes['/about']).to.be.ok();
//     expect($route.routes['/about'].templateUrl).to.be('/app/about/about.html');
//   });

//   it('Should have /logout route, template, and controller', function () {
//     expect($route.routes['/logout']).to.be.ok();
//     expect($route.routes['/logout'].templateUrl).to.be('/app/about/signin.html');
//     expect($route.routes['/logout'].redirectTo).toEqual('/')
//   });

//   it('Should redirect to / (main) for everything else', function(){
//     expect($route.routes[null].redirectTo).toEqual('/')
//   }
});
