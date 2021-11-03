angular.module('clarin-el').controller("WelcomeCtrl", ['$scope', '$state', 'User', 'Flash', function ($scope, $state, User, Flash) {
  $scope.mode = "default";
  $scope.regInfo = {};
  $scope.loginInfo = {};
  $scope.resetInfo = {};

  var initializeUserInfo = function () {
    $scope.resetInfo = {
      email: ""
    };

    $scope.loginInfo = {
      email: "",
      password: ""
    };

    $scope.regInfo = {
      name: "",
      first_name: "",
      last_name: "",
      email: "",
      password: ""
    };
  };


  $scope.formContentChanged = function () {
    Flash.clear();
  };


  $scope.selectMode = function (value) {
    $scope.formContentChanged();
    $scope.mode = value;
  };

  $scope.register = function (regForm) {
    if (!regForm.$valid) {
      if (regForm.regName.$invalid || regForm.regEmail.$invalid) {
        Flash.show("Please provide all the required information.");
        return false;
      }

      if (regForm.regPassword.$viewValue.length < 6) {
        Flash.show("Your password must contain at least 6 characters.");
        return false;
      }
    }

    User.register($scope.regInfo)
      .then(function (response) {
        initializeUserInfo();
        Flash.show(response.message);
      }, function (error) {
        Flash.show(error.message);
      });
  };

  $scope.login = function (loginForm) {
    if (!loginForm.$valid) {
      Flash.show("Please provide all the required information.");
      return false;
    }

    User.login($scope.loginInfo)
      .then(function (response) {
        if (response.success) {
          sessionStorage.authenticated = true;
          Flash.clear();
          initializeUserInfo();
          $state.go('profile');
        } else {
          delete sessionStorage.authenticated;
          Flash.show(response.message);
          $state.go('welcome');
        }
      }, function (error) {
        Flash.show(error.message);
        $state.go('welcome');
      });
  };


  $scope.reset = function (resetForm) {
    if (!resetForm.$valid) {
      Flash.show("Please provide all the required information.");
      return false;
    }

    User.resetPassword({ email: $scope.resetInfo.email })
      .then(function (response) {
        Flash.show(response.message);
      }, function (error) {
        Flash.show(error.message);
      });
  };
}]);
