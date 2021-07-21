angular.module('clarin-el').factory("User", function ($http, $q, $timeout, $location, $sanitize, CSRF_TOKEN) {

  var sanitizeObj = function (inputObj) {
    _.each(inputObj, function (val, key) {
      inputObj[key] = $sanitize(val);
    });

    return inputObj;
  };

  var register = function (user) {
    var deferred = $q.defer();
    var sanCredentials = sanitizeObj(user);

    $http.post('./auth/register', sanCredentials)
      .success(function (response) {
        deferred.resolve(response);
      }).error(function (response) {
        deferred.reject(response);
      });

    return deferred.promise;
  };


  var login = function (credentials) {
    var deferred = $q.defer();
    var sanCredentials = sanitizeObj(credentials);
    sanCredentials.csrf_token = CSRF_TOKEN;

    $http.post('./auth/login', sanCredentials)
      .success(function (response) {
        if (response.success && !angular.isUndefined(response.data.email)) {
          deferred.resolve(response);
        } else {
          deferred.reject(response);
        }
      }).error(function (response) {
        deferred.reject(response);
      });

    return deferred.promise;
  };

  var logout = function () {
    var deferred = $q.defer();

    $http.get('./auth/logout')            // Make an AJAX call to check if the user is logged in
      .success(function (response) {
        deferred.resolve(response);
      }).error(function (response) {
        deferred.reject(response);
      });

    return deferred.promise;
  };

  var resetPassword = function (credentials) {
    var deferred = $q.defer();

    $http.post('./auth/reset', credentials)
      .success(function (response) {
        deferred.resolve(response);
      }).error(function (response) {
        deferred.reject(response);
      });

    return deferred.promise;
  };


  var updatePassword = function (credentials) {
    var deferred = $q.defer();
    var sanCredentials = sanitizeObj(credentials);

    $http.post('./api/user/update', sanCredentials)
      .success(function (data) {
        deferred.resolve(data);
      }).error(function (data) {
        deferred.reject(data);
      });

    return deferred.promise;
  };

  var getStats = function () {
    var deferred = $q.defer();

    $http.get('./api/user')
      .success(function (response) {
        deferred.resolve(response);
      }).error(function (response) {
        deferred.reject(response);
      });

    return deferred.promise;
  };

  return {
    register: register,
    login: login,
    logout: logout,
    resetPassword: resetPassword,
    updatePassword: updatePassword,
    getStats: getStats
  }
});