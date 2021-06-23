var app = angular.module("clarin-el", ['ngAnimate', 'ngSanitize', 'oc.lazyLoad', 'ui.router', 'ui.bootstrap', 
  'treeControl', 'flow', 'ui.layout', 'smart-table']);

//app.run(function($http,CSRF_TOKEN){ $http.defaults.headers.common['csrf_token'] = CSRF_TOKEN; });

// Defining global variables for the Clarin-EL app
app.constant("CLARIN_CONSTANTS", {
  "BASE_URL": "//" + window.location.hostname,
  "ELLOGON_SERVICES": "//" + window.location.hostname + '/clarin-ellogon-services'
  /*"ELLOGON_SERVICES": "http://localhost:9292/192.168.56.101"*/
});

app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
  $stateProvider.state('welcome', {
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'WelcomeCtrl',
    resolve: {
      load: ['$ocLazyLoad', function($ocLazyLoad) {
        return $ocLazyLoad.load('js/controllers/welcomeCtrl.js');
      }]
    }
  })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/user-profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        load: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load([
            'js/controllers/profileCtrl.js'
          ]);
        }]
      }
    })
    .state('collections', {
      url: '/collections',
      template: "<div ui-view></div>",
      abstract: true
    })
    .state('collections.add', {
      url: '/add',
      templateUrl: 'templates/collection-add.html',
      controller: 'AddCollectionCtrl',
      resolve: {
        load: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load([
            'js/controllers/addCollectionCtrl.js',
            'js/directives/uploader-directive.js'
          ]);
        }]
      }
    })
    .state('button.add', {
      url: '/button_add',
      template: "<div></div>",
      controller: 'OpenCreateButtonModalCtrl',
      resolve: {
        load: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load('js/controllers/modals/OpenCreateButtonModalCtrl.js');
        }]
      }
    }).state('collections.manage', {
      url: '/manage',
      templateUrl: 'templates/collection-manage.html',
      controller: 'ManageCollectionsCtrl',
      resolve: {
        load: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load('js/controllers/manageCollectionsCtrl.js');
        }]
      }
    })
    
    .state('annotation', {
      url: '/annotation', 
      templateUrl: 'templates/annotation.html',
      controller: 'AnnotationCtrl',
      resolve: {
        load: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load('annotationServices');
        }]
      }
    });


  $urlRouterProvider.otherwise('/welcome');
  $locationProvider.html5Mode(true);
});


app.run(function ($rootScope, $location, $timeout) {
  'use strict';
  var validRoutes = ['/collections/add', '/collections/manage', '/annotation', '/profile'];

  $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
    if (!sessionStorage.authenticated && !angular.equals(to.url, "/welcome")/*&& _.indexOf(validRoutes, to.url)*/){

      ev.preventDefault();
      $timeout(function() {
        $location.path('/welcome');
      }, 0);
    }
  });
});


app.config(function($httpProvider) {
  var logsOutUserOn401 = function($location, $q, $timeout, Flash) {

    var success = function(response) {
      console.log("success" + response)
      Flash.clear();
      return response;
    };

    var error = function(response) {
      console.log("error" + response)
      if(response.status == 401) {
        delete sessionStorage.authenticated;
        if (!angular.isUndefined(response.message))
          Flash.show(response.message)

        $timeout(function() { $location.path('/welcome'); }, 0);
      }
      return $q.reject(response);
    };

    return function(promise) {
      return promise.then(success, error);
    };
  };

  $httpProvider.interceptors.push(logsOutUserOn401);
});
