angular.module('clarin-el').factory("User", function ($http, $q, $timeout, $location, $sanitize, CSRF_TOKEN) {

  var sanitizeObj = function(inputObj) {
    _.each(inputObj, function(val, key) {
      inputObj[key] = $sanitize(val);
    });
    return inputObj;
  }; /* sanitizeObj */

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
  }; /* register */

  /*
   * Helper functions for JWT handling
   */
  var decode = function(payload) {
    var base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return jsonPayload;
  }; /* decode */

  var getPayload = function(accessToken) {
    if (accessToken === null) {
      return {exp:0}
    }
    var payload  = accessToken.split('.')[1]
    var _payload = JSON.parse(decode(payload));
    return _payload;
  }; /* getPayload */

  var exp = function(payload) {
    if (payload !== undefined) {
      if(payload.exp !== undefined) {
        return payload.exp * 1000;
      }
    }
    return 0;
  }; /* exp */
 
  var refreshTime = function(exp) {
    var now = new Date().getTime();
    var interval = exp - now;
    if (interval > 60000) {
      interval -= 60000;
    } else {
      interval -= 10000;
    }
    return interval;
  }; /* refreshTime */

  var refreshToken = function() {
    var deferred = $q.defer();
    var refreshtoken = sessionStorage.getItem("Django-TOKEN-REFRESH");
    $http.post('./api/user/refresh-token', {"refresh": refreshtoken})
      .success(function (response) {
        sessionStorage.setItem("Django-TOKEN-ACCESS",  response['access']);
        sessionStorage.setItem("Django-TOKEN-REFRESH", response['refresh']);
        deferred.resolve(response);
      }).error(function (response) {
        deferred.reject(response);
      });
    return deferred.promise;
  }; /* refreshToken */

  var refreshIntervalID;
  var refreshStart = function(jwtToken) {
    var access_token;
    var refresh_token;
    // 1) Take access token
    if (typeof jwtToken === 'string' || jwtToken instanceof String) {
      // Just an access JWT token...
      access_token  = jwtToken;
      refresh_token = "";
    } else {
      access_token  = jwtToken['access'];
      refresh_token = jwtToken['refresh'];
      var payload = getPayload(access_token);
      // 2) Get exp()
      var exptime = exp(payload);
      // 3) refresh interval exp() -60 * 1000 (1 min)
      var refresh_interval = refreshTime(exptime);
      // console.error("Refresh Interval:", refresh_interval);
      // 4) Call refreshtoken every refresh_interval milliseconds
      refreshIntervalID = setInterval(refreshToken, refresh_interval);
    }
    sessionStorage.setItem("Django-TOKEN-ACCESS",  access_token);
    sessionStorage.setItem("Django-TOKEN-REFRESH", refresh_token);
  }; /* refreshStart */

  var refreshStop = function() {
    clearInterval(refreshIntervalID);
    sessionStorage.removeItem("Django-TOKEN-ACCESS");
    sessionStorage.removeItem("Django-TOKEN-REFRESH");
  }; /* refreshStop */

  var login = function(credentials) {
    var deferred = $q.defer();
    var sanCredentials = sanitizeObj(credentials);
    sanCredentials.csrf_token = CSRF_TOKEN;

    $http.post('./auth/login', sanCredentials)
      .success(function (response) {
        if (response.success && !angular.isUndefined(response.data.email)) {
          refreshStart(response['data']['jwtToken']);
          deferred.resolve(response);
        } else {
          deferred.reject(response);
        }
      }).error(function (response) {
        deferred.reject(response);
      });

    return deferred.promise;
  };

  var logout = function() {
    var deferred = $q.defer();
    $http.get('./api/user/logout')
      .success(function (response) {
        refreshStop();
        deferred.resolve(response);
      }).error(function (response) {
        deferred.reject(response);
      });
    return deferred.promise;
  }; /* logout */

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
